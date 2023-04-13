const obj = {
    foo: 1
}

const p = new Proxy(obj, {
    get(target, key) {
        console.log('读取属性')
        return target[key]
    },
    set(target, key, newVal) {
        console.log('设置属性')
        target[key] = newVal
        return true
    }
})

console.log(p.foo)
p.foo = 1;
console.log("obj", obj.foo)