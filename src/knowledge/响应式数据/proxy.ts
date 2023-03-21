// 储存副作用函数的桶
const bucket = new Set();

// 原始数据
const data = {text: 'hello world'}
// 对原始数据的代理
const obj = new Proxy(data, {
    // 拦截读取操作
    get(target: { text: string }, p: string | symbol, receiver: any): any {
        // 将副作用函数 effect 添加到储存在副作用函数的桶子中
        bucket.add(effect)
        // 返回属性值
        return target[p]
    },
    // 拦截设置操作
    set(target: { text: string }, p: string | symbol, newValue: any, receiver: any): boolean {
        // 设置属性值
        target[p] = newValue;
        // 把副作用函数从桶子里面拿出并且执行
        bucket.forEach(fn => fn())
        // 返回 true 代表设置操作成功
        return true;
    }
})

/**
 * 副作用函数 effect
 */
export function effect() {
    document.body.innerText = obj.text;
}


