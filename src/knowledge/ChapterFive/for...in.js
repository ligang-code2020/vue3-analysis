/**
 * 代理for...in，用 ownKeys 拦截函数来拦截 Reflect.ownKeys 操作
 */
const obj = { foo: 1 };
const ITERATE_KEY = Symbol();

// 设置新属性和修改已有属性需要分开
const p = new Proxy(obj, {
  set(target, key, newVal, receiver) {
    // 如果属性不存在，则说明是添加新属性，否则是设置已有属性
    const type = Object.prototype.hasOwnProperty.call(target, key)
      ? "SET"
      : "ADD";

    // 设置属性值
    const res = Reflect.set(target, key, newVal, receiver);
    trigger(target, key, type);

    return res;
  },
  ownKeys(target) {
    // 将副作用函数与 ITERATE_KEY 关联
    track(target, ITERATE_KEY);
    return Reflect.ownKeys(target);
  },
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
  if (type === "ADD") {
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
