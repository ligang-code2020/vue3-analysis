const arrayInstrumentations = {};

// 一个标记变量，代表是否进行追踪。默认值为 true，即允许追踪
let shouldTrack = true;
// // 重写数组的 push、pop、shift、unshift 以及 splice 方法
["push", "pop", "shift", "unshift", "splice"].forEach((method) => {
  // 获取原始 push 方法
  const originMethod = Array.prototype[method];
  // 重写
  arrayInstrumentations[method] = function (...args) {
    // 在调用原始方法之前，禁止追踪
    shouldTrack = false;dai

    // push 方法的默认行为
    let res = originMethod.apply(this, args);

    // 在调用原始方法之后，恢复原来的行为，即允许追踪
    shouldTrack = true;
    return res;
  };
});
