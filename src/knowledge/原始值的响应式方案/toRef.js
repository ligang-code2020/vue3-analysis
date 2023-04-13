function toRef(obj, key) {
    const wrapper = {
        get value() {
            return obj[key]
        },
        set value(val) {
            obj[key] = val;
        }
    }
    // 定义 __v_isRef 属性
    Object.defineProperty(wrapper, '__v_isRef', {
        value: true
    })

    return wrapper
}

/**
 * 但如果响应式数据obj的键非常多，我们还是要花费很大力气来做这一层转换。为此，我们可以封装toRefs函数
 */

function toRefs(obj) {
    const ret = {}
    // 使用 for...in 循环遍历对象
    for (const key in obj) {
        // 逐个调用 toRef 完成转换
        ret[key] = toRef(obj, key)
    }
    return ret
}