/**
 * 可调度性是响应系统非常重要的特性。首先我们需要明确什么是可调度性。
 * 所谓可调度，指的是当trigger动作触发副作用函数重新执行时，有能力决定副作用函数执行的时机、次数以及方式
 */

const data = {foo: 1}
const obj = new Proxy(data, {
    get(target, p, receiver) {
        console.log("get", target[p])
        return target[p]
    },

    set(target, p, newValue, receiver) {
        target[p] = newValue;
        return true
    }
})

// const effect = (() => {
//     console.log(obj.foo)
// })


// obj.foo++
// obj.foo++

// effect()

// 定义一个任务队列
const jobQueue = new Set();
// 使用 Promise.resolve() 创建一个 promise 实例，我们用它将一个任务添加到微任务队列
const p = Promise.resolve();

// 一个标志代表是否刷新队列
let isFlushing = false;

function flushJob() {
    // 如果队列正在刷新，则什么都不做
    if (isFlushing) return;
    // 设置为 true，代表正在刷新
    isFlushing = true;
    // 在微任务队列刷新 jobQueue 队列
    p.then(() => {
        jobQueue.forEach(job => job())
    }).finally(() => {
        // 结束后重置 isFlushing
        isFlushing = false;
    })
}

