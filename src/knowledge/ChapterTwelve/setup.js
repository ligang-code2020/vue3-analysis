function mountComponent(vnode, container, anchor) {
  // 通过 vnode 获取组件的选项对象，即 vnode.type
  const componentOptions = vnode.type;
  // 获取组件的渲染函数 render
  const {
    render,
    data,
    beforeCreate,
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    props: propsOption,
  } = componentOptions;

  // 1. 在这里调用 beforeCreate 钩子
  beforeCreate && beforeCreate();

  // 调用 data 函数得到原始数据，并调用 reactive 函数将其包装为响应式函数
  const state = reactive(data());
  // 调用 resolveProps 函数解析出最终的 props 数据与 attrs 数据
  const [props, attrs] = resolveProps(propsOption, vnode.props);

  // 定义组件实例，一个组件实例本质上就是一个对象，它包含与组件有关的状态信息
  const instance = {
    // 组件自身的状态数据，即 data
    state,
    // 将解析出的 props 数据包装为 shallowReactive 并定义到组件实例上
    props: shallowReactive(props),
    // 一个布尔值，用来表示组件是否已经被挂载，初始值为 false
    isMounted: false,
    // 组件所渲染的内容，即子树（subTree）
    subTree: null,
  };

  // setupContext
  const setupContext = { attrs };
  // 调用 setup 函数，将只读版本的 props 作为第一个参数传递，避免用户意外地修改 props 的值
  // 将 setupContext 作为第二个参数传递
  const setupResult = setup(shallowReadonly(instance.props), setupContext);
  // setupState 用来存储由 setup 返回的数据
  let setupState = null;
  // 如果 setup 函数的返回值是函数，则将其作为渲染函数
  if (typeof setupResult === 'function') {
    // 报告冲突
    if (render) console.error('setup 函数返回渲染函数，render 选项将被忽略');
    // 将 setupResult 作为渲染函数
    render = setupResult;
  } else {
    // 如果 setup 的返回值不是函数，则作为数据状态赋值给 setupState
    setupState = setupResult;
  }

  // 将组件实例设置到 vnode 上，用于后续更新
  vnode.component = instance;

  // 创建渲染上下文对象，本质上是组件实例的代理
  const renderContext = new Proxy(instance, {
    get(t, k, r) {
      // 取得组件自身状态与 props 数据
      const { state, props } = t;
      // 先尝试读取自身状态数据
      if (state && k in state) {
        return state[k];
      } else if (k in props) {
        // 如果组件自身没有该数据，则尝试从 props 中读取
        return props[k];
      } else if (setupState && k in setupState) {
        // 渲染上下文需要增加对 setupState 的支持
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
        console.warn(`Attempting to mutate prop "${k}". Propsare readonly.`);
      } else {
        console.error('不存在');
      }
    },
  });

  // 2. 在这里调用 created 钩子，生命周期函数调用时要绑定渲染上下文对象
  created && created.call(renderContext);

  // 将组件的 render 函数调用包装到 effect 内
  effect(
    () => {
      // 执行渲染函数，获取组件要渲染的内容，即 render 函数返回的虚拟 DOM
      const subTree = render.call(state, state);
      // 检查组件是否已经被挂载
      if (!instance.isMounted) {
        // 3. 在这里调用 beforeMount 钩子
        beforeMount && beforeMount.call(state);
        // 初次挂载，调用 patch 函数第一个参数传递 null
        patch(null, subTree, container, anchor);
        // 重点：将组件实例的 isMounted 设置为 true，这样当更新发生时就不会再次进行挂载操作，直接执行更新
        instance.isMounted = true;
        // 4. 这里调用 mounted 钩子
        mounted && mounted.call(state);
      } else {
        // 5. 在这里调用 beforeUpdate 钩子
        beforeUpdate && beforeUpdate.call(state);
        // 当 isMounted 为 true 时，说明组件已经挂载，只需要完成自更新即可
        // 所以在调用 patch 函数时，第一个参数为组件上一次渲染的子树
        // 意思是，使用新的子树与上一次渲染的子树进行打补丁操作
        patch(instance.subTree, subTree, container, anchor);
        // 6. 在里调用 updated 钩子
        updated && updated.call(state);
      }
      instance.subTree = subTree;
    },
    {
      // 指定该副作用函数的调度器为 queueJob 即可
      scheduler: queueJob,
    }
  );
}

/**
 * resolveProps 函数用于解析组件 props 和 attrs 数据
 */
function resolveProps(options, propsData) {
  const props = {};
  const attrs = {};
  // 遍历为组件传递的 props 数据
  for (const key in propsData) {
    if (key in options) {
      // 如果为组件传递的 props 数据在组件自身的 props 选项中有定义，则将其视为合法的 props
      props[key] = propsData[key];
    } else {
      // 否则将其作为 attrs
      attrs[key] = propsData[key];
    }
  }
  // 最后返回 props 与 attrs 数据
  return [props, attrs];
}

/**
 * 我们把由父组件自更新所引起的子组件更新叫作子组件的被动更新
 * 1. 检测子组件是否真的需要更新，因为子组件的props可能是不变的；
 * 2. 如果需要更新，则更新子组件的props、slots等内容
 */

function patchComponent(n1, n2, anchor) {
  // 获取组件实例，即 n1.component，同时让新的组件虚拟节点 n2.component 也指向组件实例
  const instance = (n2.component = n1.component);
  // 获取当前的 props 数据
  const { props } = instance;
  // 调用 hasPropsChanged 检测为子组件传递 props 是否发生变化，如果没有变化，则不需要更新
  if (hasPropsChanged(n1.props, n2.props)) {
    // 调用 resolveProps 函数重新获取 props 数据
    const [nextProps] = resolveProps(n2.type.props, n2.props);
    // 更新 props
    for (const k in nextProps) {
      props[k] = nextProps[k];
    }
    // 删除不存在的 props
    for (const k in props) {
      if (!(k in nextProps)) delete propsp[k];
    }
  }
}

function hasPropsChanged(prevProps, nextProps) {
  const nextKeys = Object.keys(nextProps);
  // 如果新旧 props 的数量变了，则说明有变化
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    // 有不相等的 props，这说明有变化
    if (nextProps[key] !== prevProps[key]) return true;
  }
  return false;
}
