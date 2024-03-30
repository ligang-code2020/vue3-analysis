// 用一个全局变量来存储被注册的副作用函数
let activeEffect;

// effect 栈
const effectStack = [];

// 注册副作用函数
function effect(fn, options = {}) {
  const effectFn = () => {
    // 调用 cleanup 函数清除所有依赖
    cleanup(effectFn);
    // 当 effectFn 执行时，将其设置为当前激活的副作用函数
    activeEffect = effectFn;
    // 在调用副作用函数之前将副作用函数压入栈中
    effectStack.push(effectFn);
    const res = fn();
    // fn();
    // 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并把activeEffect 还原为之前的值
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  };
  // activeEffect.deps 用来存储所有与该副作用函数关联的依赖集合
  effectFn.options = options;
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}

function cleanup(effectFn) {
  // 遍历 effectFn.deps 数组
  for (let i = 0; i < effectFn.deps.length; i++) {
    // deps 是依赖集合
    const deps = effectFn.deps[i];
    // 将 effectFn 从依赖集合中移除
    deps.delete(effectFn);
  }

  // 最后重置 effectFn.deps 数组
  effectFn.deps.length = 0;
}

const data = { foo: 1, bar: 2 };

// 改用 weakMap 来替代 Set 存储副作用函数
const bucket = new WeakMap();

const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    console.log("getter!!!");
    track(target, key);
    return target[key];
  },

  // 拦截设置操作
  set(target, key, newVal) {
    console.log("setter!!!");
    // 设置属性值
    target[key] = newVal;
    trigger(target, key);
    return true;
  },
});

// track 函数
function track(target, key) {
  // 如果没有 activeEffect,直接 return
  if (!activeEffect) return;
  // 根据 target 从桶中取一个 depsMap，它是一个 Map 类型：key --> effects
  let depsMap = bucket.get(target);
  // 如果没有depsMap，那就新建一个 Map 和 target 关联
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  // 在根据 key 从 Map 里面中取得 deps，它是一个 Set 类型，里面存储 key 关联的副作用函数 effect
  let deps = depsMap.get(key);
  // 如果没有，则新建一个 Set 与 key 关联起来
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  // 最后将副作用函数推入桶中
  deps.add(activeEffect);

  // deps 就是一个与当前副作用函数存在联系的依赖集合
  // 将其添加到 activeEffect.deps 数组中
  activeEffect.deps.push(deps);
}

function trigger(target, key) {
  // 根据 target 从桶中取 depsMap，它是 key--> effects
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  // 根据 key 取得所有副作用函数 effects
  const effects = depsMap.get(key);
  // 取得 ITERATE_KEY 相关联的副作用函数
  const iterateEffects = depsMap.get(key); // ITERATE_KEY

  const effectsToRun = new Set();
  // 执行副作用函数
  effects &&
    effects.forEach((effectFn) => {
      // 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不执行
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn);
      }
    });
  // 将与 ITERATE_KEY 相关联的副作用函数也添加到 effectsToRun
  iterateEffects &&
    iterateEffects.forEach((effectFn) => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn);
      }
    });

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


