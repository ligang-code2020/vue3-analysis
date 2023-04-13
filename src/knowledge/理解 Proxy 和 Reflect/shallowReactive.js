// 封装 createReactive 函数，接收一个参数 isShallow，代表是否为浅响应，默认为 false，即非浅响应
function createReactive(obj, isShallow = false, isReadonly = false) {
    return new Proxy({
        // 拦截读取操作
        get(target, key, receiver) {
            if (key === 'raw') {
                return target
            }

            const res = Reflect.get(target, key, receiver)
            // track(target,key)

            // 如果是浅响应，则直接返回原始值
            if (isShallow) {
                return res
            }
            if (typeof res === 'object' && res != null) {
                return receiver(res)
            }

            return res
        },
        // 省略其他拦截函数
    })
}

// 浅响应
function shallowReactive(obj) {
    return createReactive(obj, true)
}

// 深响应
function reactive(obj) {
    return createReactive(obj)
}