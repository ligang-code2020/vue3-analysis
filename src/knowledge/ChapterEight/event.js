const vnode = {
  type: "p",
  props: {
    // 使用 onXxx 描述事件
    onclick: () => {
      alert("clicked!");
    },
  },
  children: "text",
};

const vnode1 = {
  type: "p",
  props: {
    onclick: [
      // 第一个事件处理函数
      () => {
        alert("clicked 1");
      },
      // 第二个事件处理函数
      () => {
        alert("clicked 1");
      },
    ],
  },
  children: "text",
};

/**
 * 1. 先从el._vei中读取对应的invoker，如果invoker不存在，则将伪造的invoker作为事件处理函数，并将它缓存到el._vei属性中。
 * 2. 把真正的事件处理函数赋值给invoker.value属性，然后把伪造的invoker函数作为事件处理函数绑定到元素上。
 * 可以看到，当事件触发时，实际上执行的是伪造的事件处理函数，在其内部间接执行了真正的事件处理函数invoker.value(e)
 * 3. 为了解决事件覆盖的问题，我们需要重新设计el._vei的数据结构。我们应该将el._vei设计为一个对象，它的键是事件名称，它的值则是对应的事件处理函数
 */
function patchProps(el, key, preValue, nextValue) {
  // 匹配以 on 开头的属性，视其为事件
  if (/^on/.test(key)) {
    // 根据属性名称得到对应的事件名称，例如 onClick ---> click
    // 获取为该元素伪造的事件处理函数 invoker
    // 定义 el._vei 为一个对象，存在事件名称到事件处理函数的映射
    const invokers = el._vei || (el._vei = {});
    // 根据事件名称获取 invoker
    let invoker = invokers[key];
    const name = key.slice(2).toLowerCase();
    if (nextValue) {
      if (!invoker) {
        // 如果没有 invoker，则将一个伪造的 invoker 缓存在 el._vei 中
        // vei 是 vue event invoker 的首字母缩写
        // 将事件处理函数缓存到 el._vei[key] 下，避免覆盖
        invoker = el._vei[key] = (e) => {
          // 当伪造的事件处理函数执行时，会执行真正的事件处理函数
          // 如果 invoker.value 是数组，则遍历它并逐个调用事件处理函数
          // e.timeStamp 是事件发生的时间
          // 如果事件发生的时间早于事件处理函数绑定的时间，则不执行事件处理函数
          if (e.timeStamp < invoker.attached) return;
          if (Array.isArray(invoker.value)) {
            invoker.value.forEach((fn) => {
              fn(e);
            });
          } else {
            // 否则直接作为函数调用
            invoker.value(e);
          }
        };
        // 将真正的事件处理函数赋值给 invoker.value
        invoker.value = nextValue;
        // 添加 invoker.attached 属性，存储事件处理函数被绑定的时间
        // 绑定 invoker 作为事件处理函数
        invoker.attached = performance.now();
        el.addEventListener(name, invoker);
      } else {
        // 如果 invoker 存在，意味着更新，并且只需要更新 invoker.value 的值即可
        invoker.value = nextValue;
      }
    } else if (invoker) {
      // 新的事件绑定函数不存在，且之前的绑定的 invoker 存在，则移除绑定
      el.removeEventListener(name, invoker);
    }
  } else if (key === "class") {
    // 省略部分代码
  } else if (shouldSetAsProps(el, key, nextValue)) {
    // 省略部分代码
  } else {
    // 省略部分代码
  }
}
