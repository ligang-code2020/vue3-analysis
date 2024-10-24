// 组件
const MyComponent = {
  setup() {
    return () => {
      // 该组件渲染一个 div 标签
      return {
        type: 'div',
        children: 'hello',
      };
    };
  },
};

// 用来描述组件的 VNode 对象
const CompVNode = {
  type: MyComponent,
};

function renderComponentVNode(vnode) {
  const isFunctional = typeof vnode.type === 'function';
  let componentOptions = vnode.type;
  if (isFunctional) {
    componentOptions = {
      render: vnode.type,
      props: vnode.type.props,
    };
  }
  let {
    render,
    data,
    setup,
    beforeCreate,
    created,
    props: propsOption,
  } = componentOptions;

  beforeCreate && beforeCreate();

  // 无须使用 reactive() 创建 data 的响应式版本
  const state = data ? data() : null;
  const [props, attrs] = resloveProps(propsOption, vnode.props);

  const slots = vnode.children || {};

  const instance = {
    state,
    props, // props 无须 shallowReactive
    isMounted: false,
    subTree: null,
    slots,
    mounted: [],
    keepAliveCtx: null,
  };

  function emit(event, ...payload) {
    const eventName = `on${event[0].toUpperCase() + event.slice(1)}`;
    const handler = instance.props[eventName];
    if (handler) {
      handler(...payload);
    } else {
      console.error('事件不存在');
    }
  }

  // setup
  let setupState = null;
  if (setup) {
    const setupContext = { attrs, emit, slots };
    const prevInstance = setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), setupContext);
    setCurrentInstance(prevInstance);
    if (typeof setupResult === 'function') {
      if (render) console.error('setup 函数返回渲染函数，render 选项将被忽略');
      render = setupResult;
    } else {
      setupState = setupContext;
    }
  }
  vnode.component = instance;

  const renderContext = new Proxy(instance, {
    get(t, k, r) {
      const { state, props, slots } = t;

      if (k === '$slots') return slots;

      if (state && k in state) {
        return state[k];
      } else if (k in props) {
        return props[k];
      } else if (setupState && k in setupState) {
        return setupState[k];
      } else {
        console.error('不存在');
      }
    },
    set(t, k, v, r) {
      const { state, props } = t;
      if (state && k in state) {
        state[k] = v;
      } else if (k in props) {
        props[k] = v;
      } else if (setupState && k in setupState) {
        setupState[k] = v;
      } else {
        console.error('不存在');
      }
    },
  });

  created && created.call(renderContext);

  const subTree = render.call(renderContext, renderContext);

  return renderVNode(subTree);
}

function renderVNode(vnode) {
  const type = typeof vnode.type;
  if (type === 'string') {
    return renderElementVNode(vnode);
  } else if (type === 'object' || type === 'function') {
    return renderComponentVNode(vnode);
  } else if (vnode.type === Text) {
    // 处理文本...
  } else if (vnode.type === Fragment) {
    // 处理片段...
  } else {
    // 其他 VNode 类型
  }
}
