// defineAsyncComponent 函数用于定义一个异步组件，接收一个异步组件加载器作为参数
function defineAsyncComponent(options) {
  if (typeof options === 'function') {
    // 如果 options 是加载器，则将其格式化为配置项形式
    options = {
      loader: options,
    };
  }
  const { loader } = options;
  // 一个变量，用于存储异步加载的组件
  let InnerComp = null;

  // 返回一个包装组件
  return {
    name: 'AsyncComponentWrapper',
    setup() {
      // 异步组件是否加载成功
      const loaded = ref(false);
      // 定义 error，当错误发现时，用来存储对象错误
      const error = shallowRef(null);

      // 代表是否超时，默认为 false，即没有超时
      const timeout = ref(false);

      // 执行加载器函数，返回一个 Promise 实例
      // 加载成功后，将加载成功的组件赋值给 InnerComp，并将 loaded 标记为 true，代表加载成功
      loader()
        .then((c) => {
          InnerComp = c;
          loaded.value = true;
        })
        .catch((err) => (error.value = err));

      let timer = null;
      if (options.timeout) {
        // 如果指定了超时时长，则开启一个定时器计时
        timer = setTimeout(() => {
          // 超时后将 timeout 设置为 true
          // 超时后创建一个错误对象，并赋值给 error.value
          const err = new Error(
            `Async component timed out after ${options.timeout}ms.`
          );
          error.value = err;
          timeout.value = true;
        }, options[timeout]);
      }

      // 包装组件被卸载时候清楚定时器
      onUnmounted(() => {
        clearTimeout(timer);
      });

      // 占位内容
      const placeholder = { type: Text, children: '' };

      return () => {
        if (loaded.value) {
          // 如果异步组件加载成功，则渲染该组件，否则渲染一个站位内容
          return { type: InnerComp };
        } else if (error.value && options.errorComponent) {
          // 只有当错误存在且用户配置了 errorComponent 才展示 Error 组件，同时将 error 作为props 传递
          return {
            type: options.errorComponent,
            props: { error: error.value },
          };
        } else {
          return placeholder;
        }
      };
    },
  };
}
