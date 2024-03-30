function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === "size") {
        // 如果读取的是 size 属性
        // 通过指定第三个参数 receiver 为原始对象 target 从而修复问题
        return Reflect.get(target.key, target);
      }

      // 读取其他属性的默认行
      return target[key].bind(target);
    },

    // 拦截设置操作
    set(target, key, newVal, receiver) {
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`);
        return true;
      }
      const oldVal = target[key];
      // 如果属性不存在，则说明是在添加新的属性，否则是设置已有属性
      // 如果代理对象是数组，则需要检测设置的索引值是否小于数组长度
      // 如果是，则视为 SET 操作，否则是 ADD 操作
      const type = Array.isArray(target)
        ? Number(key) < target.length
          ? "SET"
          : "ADD"
        : Object.prototype.hasOwnProperty.call(target, key)
        ? "SET"
        : "ADD";

      const res = Reflect.set(target, key, newVal, receiver);
      if (target === receiver.raw) {
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          // 增加第四个参数，即触发响应的新值
          trigger(target, key, type, newVal);
        }
      }
      return res;
    },
  });
}

// trigger 函数
// 为 trigger 函数增加第四个参数，newVal，即新值
function trigger(target, key, type, newVal) {
  // 根据 target 从桶中取 depsMap，它是 key --> effects
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  // 根据 key 取得所有副作用函数 effects
  const effects = depsMap.get(key);

  const effectsToRun = new Set();
  // 执行副作用函数
  effects &&
    effects.forEach((effectFn) => {
      // 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不执行
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn);
      }
    });

  // 只有当操作类型为 'ADD' 时，才触发与 ITERATE_KEY 相关联的副作用函数重新执行
  if (type === "ADD" || type === "DELETE") {
    // 取得 ITERATE_KEY 相关联的副作用函数
    const iterateEffects = depsMap.get(key); // ITERATE_KEY
    // 将与 ITERATE_KEY 相关联的副作用函数也添加到 effectsToRun
    iterateEffects &&
      iterateEffects.forEach((effectFn) => {
        if (effectFn !== activeEffect) {
          effectsToRun.add(effectFn);
        }
      });
  }
  // 当操作类型为 ADD 并且目标对象是数组时，应该取出并执行那些与 length 属性相关联的副作用函数
  if (type === "ADD" && Array.isArray(target)) {
    // 取出与 length 相关联的副作用函数
    const lengthEffects = depsMap.get("length");
    // 将这些副作用函数添加到 effectsToRun 中，待执行
    lengthEffects &&
      lengthEffects.forEach((effectFn) => {
        if (effectFn !== activeEffect) {
          effectsToRun.add(effectFn);
        }
      });
  }
  // 如果操作目标是数组，并且修改了数组的 length 属性
  if (Array.isArray(target && key === "length")) {
    // 对于索引大于或等于新的 length 值的元素
    // 需要把所有相关联的副作用函数取出并添加到 effectsToRun 中待执行
    depsMap.forEach((effects, key) => {
      if (key >= newVal) {
        effects.forEach((effectFn) => {
          if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn);
          }
        });
      }
    });
  }

  effectsToRun.forEach((effectFn) => {
    // 如果一个副作用函数存在调度器，则调用该调度器，并将副作用函数作为参数传递
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      // 否则直接执行副作用函数
      effectFn();
    }
  });
}
