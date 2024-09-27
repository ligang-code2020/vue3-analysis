const KeepAlive = {
  // KeepAlive 组件独有的属性，用作标识
  _isKeepAlive: true,
  // 定义 include 和 exclude
  props: {
    include: RegExp,
    exclude: RegExp,
  },
  setup(props, { slots }) {
    // 创建一个缓存对象
    // key: vnode.type
    // value: vnode
    const cache = new Map();
    // 当前 KeepAlive 组件的实例
    const instance = currentInstance;
    // 对于 KeepAlive 组件来说，它的实例上存在特殊的 keepAliveCtx 对象，该对象由渲染器注入
    // 该对象会暴露渲染器的一些内部方法，其中 move 函数用来将一段 DOM 移动到另外一个容器中
    const { move, createElement } = instance.keepAliveCtx;

    // 创建隐藏容器
    const storageContainer = createElement('div');

    // KeepAlive 组件的实例会被添加两个内部函数，分别是 _deActivate 和 _activate
    // 这两个函数会在渲染器中被调用
    instance._deActivate = (vnode) => {
      move(vnode, storageContainer);
    };
    instance._activate = (vnode, container, anchor) => {
      move(vnode, container, anchor);
    };

    return () => {
      // KeepAlive 的默认插槽就是要被 KeepAlive 的组件
      let rawVNode = slots.default();
      // 如果不是组件，直接渲染即可，因为非组件的虚拟节点无法被 KeepAlive
      if (typeof rawVNode.type !== 'object') {
        return rawVNode;
      }
      // 获取 "内部组件" 的name
      const name = rawVNode.type.name;
      if (
        name &&
        ((props.include && !props.include.test(name)) ||
          (props.exclude && props.exclude.test(name)))
      ) {
        // 则直接渲染 "内部组件"，不对其进行后续的缓存操作
        return rawVNode
      }
      // 在挂载时先获取缓存的组件 vnode
      const cachedVNode = cache.get(rawVNode.type);
      if (cachedVNode) {
        // 如果有缓存的内容，则说明不应该执行挂载，而应该执行激活
        // 继承组件实例
        rawVNode.component = cachedVNode.component;
        // 在 vnode 上添加 keptAlive 属性，标记为 true，避免渲染器重新挂载它
        rawVNode.keptAlive = true;
      } else {
        // 如果没有缓存，则将其中添加到缓存中，这样下次激活组件时就不会执行新的挂载动作了
        cache.set(rawVNode.type, rawVNode);
      }

      // 在组件 vnode 上添加 shouldKeepAlive 属性，并标记为 true，避免渲染器真的将组件卸载
      rawVNode.shouldKeepAlive = true;
      // 将 KeepAlive 组件的实例也添加到 vnode 上，以便在渲染器中访问
      rawVNode.keptAliveInstance = instance;

      // 渲染组件 rawVNode
      return rawVNode;
    };
  },
};

// 卸载操作
function unmount(vnode) {
  if (vnode.type === Fragment) {
    vnode.children.forEach((c) => unmount(c));
    return;
  } else if (typeof vnode.type === 'object') {
    // vnode.shouldKeepAlive 是一个布尔值，用来标识该组件是否应该被 KeepAlive
    if (vnode.shouldKeepAlive) {
      // 对于需要被 KeepAlive 的组件，我们不应该真的卸载它，而应调用该组件的父组件
      // 即 KeepAlive 组件的 _deActivate 函数使其失活
      vnode.keptAliveInstance._deActivate(vnode);
    } else {
      unmount(vnode.component.subTree);
    }
    return;
  }
  const parent = vnode.el.parentNode;
  if (parent) {
    parent.removeChild(vnode.el);
  }
}

function mountComponent(vnode, container, anchor) {
  // 省略部分代码
  const instance = {
    state,
    props: shallowReactive(props),
    isMounted: false,
    subTree: null,
    slots,
    mounted: [],
    // 只有 KeepAlive 组件的实例下会有 keepAliveCtx 属性
    keepAliveCtx: null,
  };

  // 检查当前要挂载的组件是否是 KeepAlive 组件
  const isKeepAlive = vnode.type._isKeepAlive;
  if (isKeepAlive) {
    // 在 KeepAlive 组件实例上添加 keepAliveCtx 对象
    instance.keepAliveCtx = {
      // move 函数用来移动一段 rawVNode
      move(vnode, container, anchor) {
        // 本质上是将组件渲染的内容移动到指定容器中，即隐藏容器中
        insert(vnode.component.subTree.el, container, anchor);
      },
      createElement,
    };
  }
}
