const MyComponent = {
  // 组件名称，可选
  name: 'MyComponent',
  // 用 data 函数来定义组件自身的状态
  data() {
    return {
      foo: 'hello world',
    };
  },
  // 组件的渲染函数，其返回值必须为虚拟 DOM
  render() {
    // 返回虚拟 DOM
    return {
      type: 'div',
      children: `我是文本内容`,
    };
  },
};

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
  } = componentOptions;

  // 1. 在这里调用 beforeCreate 钩子
  beforeCreate && beforeCreate();

  // 调用 data 函数得到原始数据，并调用 reactive 函数将其包装为响应式函数
  const state = reactive(data());

  // 定义组件实例，一个组件实例本质上就是一个对象，它包含与组件有关的状态信息
  const instance = {
    // 组件自身的状态数据，即 data
    state,
    // 一个布尔值，用来表示组件是否已经被挂载，初始值为 false
    isMounted: false,
    // 组件所渲染的内容，即子树（subTree）
    subTree: null,
  };
  // 将组件实例设置到 vnode 上，用于后续更新
  vnode.component = instance;

  // 2. 在这里调用 created 钩子
  created && created.call(state);

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
 * 为了避免响应式数据频繁改动，导致副作用函数重复执行，性能不好，需要建立缓存机制
 */

// 任务缓存队列，用一个 Set 数据结构来表示，这样就可以自动对任务进行去重
const queue = new Set();
// 一个标志，代表是否正在刷新任务队列
let isFlushing = false;
// 创建一个立即 resolve 的 Promise 实例
const p = Promise.resolve();

// 调度器的主要函数，用来将一个任务添加到缓冲队列中，并开始刷新队列
function queueJob(job) {
  // 将 job 添加到任务队列 queue 中
  queue.add(job);
  // 如果还没开始刷洗队列，则刷新
  if (!isFlushing) {
    // 将该标志设置为 true 以避免重复刷新
    isFlushing = true;
    // 在微任务中刷新缓冲队列
    p.then(() => {
      try {
        // 执行任务队列中的任务
        queue.forEach((job) => job());
      } finally {
        // 重置状态
        isFlushing = false;
        queue.clear = 0;
      }
    });
  }
}
