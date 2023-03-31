/**
 * 要将一个副作用函数从所有与之关联的依赖集合中移除，就需要明确知道哪些依赖集合中包含它，
 * 因此我们需要重新设计副作用函数，如下面的代码所示。在effect内部我们定义了新的effectFn函数，
 * 并为其添加了effectFn.deps属性，该属性是一个数组，用来存储所有包含当前副作用函数的依赖集合
 */

// 用一个全局变量存储被注册的副作用函数
let activeEffect;

function effect(fn) {
    const effectFn = () => {
        // 调用 cleanup 函数完成清除工作
        cleanup(effectFn)
        // 当 effectFn 执行时，将其设置为当前激活的副作用函数
        activeEffect = effectFn;
        fn()
    }
    // activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
    effectFn().deps = [];

    // 执行副作用函数
    effectFn();
}

/**
 * 那么effectFn.deps数组中的依赖集合是如何收集的呢？其实是在track函数中
 */
function track(target, key) {
    // 没有 activeEffect，直接 return
    if (!activeEffect) return;
    let depsMap = bucket.get(target);
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()))
    }
    let deps = depsMap.get(key);
    if (!deps) {
        depsMap.set(key, (deps = new Set()))
    }
    // 把当前激活的副作用函数添加到依赖集合 deps 中
    deps.add(activeEffect)
    // deps 就是一个与当前副作用函数存在联系的依赖集合
    // 将其添加到 activeEffect.deps 数组中
    activeEffect.deps.push(deps) // 新增
}

/**
 * 下面是cleanup函数的实现
 */

function cleanup(effectFn) {
    // 遍历 effectFn.deps 数组
    for (let i = 0; i <= effectFn.deps.length; i++) {
        // deps 是依赖集合
        const deps = effectFn.deps[i];
        // 将 effectFn 从依赖集合中移除
        deps.delete(effectFn);
    }
    // 最后需要重置 effectFn.deps 数组
    effectFn.deps.length = 0;
}