/**
 * 代理 in 操作符，因此我们可以通过has拦截函数实现对in操作符的代理。
 */
const obj = { foo: 1 };
const p = new Proxy(obj, {
  has(target, key) {
    track(target, key);
    return Reflect.has(target, key);
  },
});
