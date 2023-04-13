/**
 * 封装一个 ref 函数
 * 1. 我们使用Object.defineProperty为包裹对象wrapper定义了一个不可枚举且不可写的属性__v_isRef，它的值为true，
 * 代表这个对象是一个ref，而非普通对象。这样我们就可以通过检查__v_isRef属性来判断一个数据是否是ref了。
 */

function ref(val) {
    // 在 ref 函数内部创建包裹对象
    const wrapper = {
        value: val
    }

    // 使用 Object.defineProperty 在 wrapper 对象上定义一个不可枚举的属性 _v_isRef，并且值为 true
    Object.defineProperty(wrapper, '_v_isRef', {
        value: true
    })

    // 将包裹对象变成响应式数据
    return reactive(wrapper)
}



