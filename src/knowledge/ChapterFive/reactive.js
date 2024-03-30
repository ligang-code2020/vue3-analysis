/**
 * 深响应
 */
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      // 代理对象可以通过 raw 属性访问原始数据
      if (key === "raw") {
        return target;
      }

      track(target, key);
      //   return Reflect.get(target, key, receiver);

      // 得到原始值的结果
      const res = Reflect.get(target, key, receiver);
      if (typeof res === "object" && res !== null) {
        // 递归调用 reactive 将结果包装成响应式数据并返回
        return reactive(res);
      }
      // 最终返回res
      return res;
    },
    set(target, key, newVal, receiver) {
      // 先获取旧值
      const oldVal = target[key];

      const type = Object.prototype.hasOwnProperty.call(target, key)
        ? "SET"
        : "ADD";
      const res = Reflect.set(target, key, newVal, receiver);
      // target === receiver.raw 说明 receiver 就是 target 的代理对象
      if (target === receiver.raw) {
        // 比较新值和旧值，只要当不全等的时候才触发响应
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          trigger(target, key, type);
        }
      }

      return res;
    },
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
    ownKeys(target) {
      // 将副作用函数与 ITERATE_KEY 关联
      // track(target, ITERATE_KEY);
      track(target);
      return Reflect.ownKeys(target);
    },
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
  });
}

// trigger 函数
function trigger(target, key, type) {
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

// 用一个全局变量来存储被注册的副作用函数
let activeEffect;

// effect 栈
const effectStack = [];

const bucket = new WeakMap();

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

// 封装 ref 函数
function ref(val) {
  // 在 ref 函数内部创建包裹对象
  const wrapper = {
    value: val,
  };
  // 将包裹对象变成响应式数据
  return reactive(wrapper);
}

function toRef(obj, key) {
  const wrapper = {
    get value() {
      return obj[key];
    },
  };

  return wrapper;
}

function toRefs(obj) {
  const ret = {};
  // 使用 for...in 循环遍历对象
  for (const key in obj) {
    // 逐个调用 toRef 完成转换
    ret[key] = toRef(obj, key);
  }
  return ret;
}

function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      // 自动脱 ref 实现：如果读取的值是 ref，则返回它的 value 属性值
      return value.__v_isRef ? value.value : value;
    },
    set(target, key, newValue, receiver) {
      // 通过 target 读取真实值
      const value = target[key];
      // 如果值是 Ref，则设置其对应的 value 属性值
      if (value.__v_isRef) {
        value.value = newValue;
        return true;
      }
      return Reflect.set(target, key, newValue, receiver);
    },
  });
}

const obj = ref({ foo: 1, bar: 2 });

const newObj = proxyRefs({ ...toRefs(obj) });

effect(() => {
  console.log(newObj.foo);
});

obj.foo = 100;
