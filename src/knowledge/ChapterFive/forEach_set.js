function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === "size") {
        // 如果读取的是 size 属性
        // 通过指定第三个参数 receiver 为原始对象 target 从而修复问题
        track(target, ITERATE_KEY);
        return Reflect.get(target, key, target);
      }

      // 读取其他属性的默认行
      return mutableInstrumentations[key];
    },
  });
}

const reactiveMap = new Map();
function reactive(obj) {
  const existionProxy = reactiveMap.get(obj);
  if (existionProxy) return existionProxy;
  const proxy = createReactive(obj);
  reactiveMap.set(obj, proxy);

  return proxy;
}

const mutableInstrumentations = {
  get(key) {
    // 获取原始对象
    const target = this.raw;
    // 判断读取的 key 是否存在
    const had = target.has(key);
    // 追踪依赖，建立响应联系
    track(target, key);
    // 如果存在，则返回结果。这里要注意的是，如果得到的结果 res 仍然是可代理的数据
    // 则要返回使用 reactive 包装后的响应式数据
    if (had) {
      const res = target.get(key);
      return typeof res === "object" ? reactive(res) : res;
    }
  },
  set(key, value) {
    const target = this.raw;
    const had = target.has(key);
    // 获取旧值
    const oldValue = target.get(key);
    // 获取原始数据，由于 value 本身可能已经是原始数据，所以此时 value.raw 不存在，则直接使用 value
    const rawValue = value.raw || value;
    // 设置新值
    target.set(key, value);
    // 如果不存在，则说明是 ADD 类型的操作，意味着新增
    if (!had) {
      trigger(target, key, "ADD");
    } else if (
      oldValue !== value ||
      (oldValue === oldValue && value === value)
    ) {
      // 如果不存在，并且值变了，则是 SET 类型的操作，意味着修改
      trigger(target, key, "SET");
    }
  },
  add(key) {
    // this 仍然指向的是代理对象，通过 raw 属性获取原始数据对象
    const target = this.raw;
    // 先判断值是否已经存在
    const hadKey = target.has(key);
    // 通过原始数据对象执行 add 方法添加具体的值
    // 注意，这里不在需要 .bind 了，因为是直接通过 target 调用并执行的
    const res = target.add(key);
    // 调用 trigger 函数触发响应，并指定操作类型为 ADD
    if (!hadKey) trigger(target, key, "ADD");
    // 返回操作结果
    return res;
  },
  delete(key) {
    const target = this.raw;
    const hadKey = target.has(key);
    const res = target.delete(key);
    // 当要删除的元素确实存在时，才触发响应
    if (hadKey) {
      trigger(target, key, "DELETE");
    }
    return res;
  },
  forEach(callback) {
    // 取得原始数据对象
    const target = this.raw;
    // 与 ITERATE_KEY 建立响应联系
    track(target,ITERATE_KEY)
    // 通过原始数据对象调用 forEach 方法，并把 callback 传递过去
    target.forEach(callback)
  },
};

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

const p = reactive(new Map([[{ key: 1 }, { value: 1 }]]));
effect(() => {
  p.forEach(function (value, key) {
    console.log(value); // {value:1}
    console.log(key); // {key:1}
  });
});

// 能够触发响应
p.set({ key: 2 }, { value: 2 });
