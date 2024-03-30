/**
 * 代理delete，可以使用 deleteProperty 拦截
 */
const obj = { foo: 1 };

const p = new Proxy(obj, {
  deleteProperty(target, key) {
    // 检查被操作的属性是否是对象自己的属性
    const hadKey = Object.prototype.hasOwnProperty.call(target, key);

    // 使用 Reflect.deleteProperty 完成属性的删除
    const res = Reflect.deleteProperty(target, key);

    if (res && hadKey) {
      // 只有当被删除的属性是对象自己的属性并且成功删除时，才触发更新
      trigger(target, key, "DELETE");
    }

    return res;
  },
  set(target, key, newVal, receiver) {
    // 先获取旧值
    const oldVal = target[key];

    const type = Object.prototype.hasOwnProperty.call(target, key)
      ? "SET"
      : "ADD";
    const res = Reflect.set(target, key, newVal, receiver);
    // 比较新值和旧值，只要当不全等的时候才触发响应
    if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
      trigger(target, key, type);
    }

    return res;
  }
});

function trigger(target, key) {
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
