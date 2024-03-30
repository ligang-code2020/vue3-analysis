/**
 * 在 JavaScript 的世界里，万物皆对象。例如一个函数也是一个对象，所以调用函数也是对一个对象的基本操作
 */
const fn = (name) => {
  console.log("我是：", name);
};

// 调用函数是对对象的基本操作
fn("帅哥");

// 对函数调用进行拦截操作
const p2 = new Proxy(fn, {
  // 使用 apply 拦截函数调用
  apply(target, thisArg, argArray) {
    console.log("target", target);
    console.log("thisArg", thisArg, argArray);
    target.call(thisArg, ...argArray);
  },
});
p2("美女");

const p = new Proxy(obj, {
  // 拦截读取操作，接受第三个参数 receiver
  get(target, key, receiver) {
    track(target, key);
    // 使用 Reflect.get 返回读取到的属性值
    return Reflect.get(target, key, receiver);
  },
});
