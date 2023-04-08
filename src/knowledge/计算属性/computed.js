let effectStack = [];
let activeEffect;

function effect(fn, options = {}) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn;
        effectStack.push(effectFn);
        // 将 fn 的执行结果存储到 res 中
        const res = fn() // 新增
        effectStack.pop();
        activeEffect = activeEffect[effectStack.length - 1]
        // 将 res 作为 effectFn 的返回值
        return res // 新增
    }
    effectFn.options = options;
    effectFn.deps = [];
    if (!options.lazy) {
        effectFn()
    }
    return effectFn;
}

function computed(getter) {
    // 把 getter 作为副作用函数，创建一个 lazy 的 effect
    const effectFn = effect(getter, {
        lazy: true
    })

    return {
        // 当读取 value 时才执行 effectFn
        get value() {
            return effectFn()
        }
    }
}

/**
 * 就需要我们在实现computed函数时，添加对值进行缓存的功能
 */
function computed_cache(getter) {
    // value 用来缓存上一次计算的值
    let value;
    // dirty 标志，用来标识是否需要重新计算值，为 true 则意味着 "脏"，需要计算
    let dirty = true;

    const effectFn = effect(getter, {
        lazy: true
    })

    return {
        get value() {
            // 只有 "脏" 时才计算值，并将得到的值缓存到 value 中
            if (dirty) {
                value = effectFn()
                // 将 dirty 设置为 false，下一次访问直接使用缓存到 value 中的值
                dirty = false;
            }
            return value
        }

    }
}