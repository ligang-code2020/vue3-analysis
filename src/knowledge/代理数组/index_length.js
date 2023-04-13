function createReactive(obj, isShallow = false, isReadonly = false) {
    return new Proxy(obj, {
        // 拦截设置操作
        set(target, key, newVal, receiver) {
            if (isReadonly) {
                console.warn(`属性 ${key} 是只读的`)
                return true
            }
            const oldVal = target[key]
            // 如果属性不存在，则说明是在添加新的属性，否则是设置已有属性
            // 如果代理目标是数组，则检测被设置的索引值是否小于数组长度
            // 如果是，则视作 SET 操作，否则是 ADD 操作
            const type = Array.isArray(target) ? Number(key) < target.length ? 'SET' : 'ADD'
                : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'

            const res = Reflect.set(target, key, newVal, receiver)
            if (target === receiver.raw) {
                if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
                    trigger(target, key, type)
                }
            }
            return res
        }
    })
}

function trigger(target, key, type) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    // ...

    // 当操作类型为 ADD 并且目标对象数数组时，应该取出并执行那些与 length 属性相关联的副作用函数
    if (type === 'ADD' && Array.isArray(target)) {
        // 取出与 length 相关联的副作用函数
        const lengthEffects = depsMap.get('length')
        // 将这些副作用函数添加到 effectsToRun 中，待执行
        lengthEffects && lengthEffects.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })
    }
    effectsToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}