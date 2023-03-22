// 储存副作用函数的桶
const bucket = new WeakMap();

const obj = new Proxy(data, {
    // 拦截读取操作
    get(target: { text: string }, p: string | symbol, receiver: any): any {
        // 将副作用函数 activeEffect 放到桶子里面
        track(target, p)
        // 返回属性值
        return target[p]
    },
    // 拦截设置操作
    set(target: { text: string }, p: string | symbol, newValue: any, receiver: any): boolean {
        // 设置属性值
        target[p] = newValue;
        // 把副作用函数取出来，然后执行
        trigger(target, p)
        return true;
    }
})

// 在 get 拦截函数内调用 track 函数追踪变化
function track(target, key) {
    // 如果没有 activeEffect 直接return
    if (!activeEffect) {
        return target[key];
    }
    // 根据 target 从“桶”中取得 depsMap，它也是一个 Map 类型：key -->effects
    let depsMap = bucket.get(target)
    // 如果不存在 depsMap，那么新建一个 Map 并与 target 关联
    if (!depsMap) {
        depsMap.set(target, (depsMap = new Map()))
    }

}