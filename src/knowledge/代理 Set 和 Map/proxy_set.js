const reactiveMap = new Map()

// reactive 函数与之前相比没有变化
function reactive(obj) {
    const existionProxy = reactiveMap.get(obj)
    if (existionProxy) return existionProxy
    const proxy = createReactive(obj)

    reactiveMap.set(obj, proxy)
    return proxy
}

/**
 * 在 createReactive 里封装用于代理 Set/Map 类型数据的逻辑
 */
function createReactive(obj, isShallow = false, isReadonly = false) {
    return new Proxy(obj, {
        get(target, key, receiver) {
            if (key === 'size') {
                // 调用 track 函数建立响应联系
                track(target, ITERATE_KEY)
                return Reflect.get(target, key, target)
            }
            // 返回定义在 mutableInstrumentations 对象下的方法
            return mutableInstrumentations[key]
        }
    })
}

const mutableInstrumentations = {
    add(key) {
        // this 仍然指向的是代理对象，通过 raw 属性获取原始数据对象
        const target = this.raw
        // 通过原始数据对象执行 add 方法添加具体的值
        // 注意，这里不再需要 .bind 了，因为是直接通过 target 调用并执行的
        const res = target.add(key)
        // 调用 trigger 函数触发响应，并指定操作类型为 ADD
        trigger(target, key, 'ADD')
        // 返回操作结果
        return res
    },
    delete(key) {
        const target = this.raw
        const hadKey = target.has(key)
        const res = target.delete(key)
        // 当要删除的元素确实存在时，才触发响应
        if (hadKey) {
            trigger(target, key, 'DELETE')
        }
        return res
    }
}

// 创建数据代理
const p = reactive(new Set([1, 2, 3]))
console.log(p.size)