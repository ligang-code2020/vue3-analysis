function createRenderer() {
  function render(vnode, container) {
    if (vnode) {
      // 新 vnode 存在，将其与旧 vnode 一起传递给 patch 函数，进行打补丁
      patch(container._vnode, vnode, container);
    } else {
      if (container._vnode) {
        // 旧 vnode 存在，且新 vnode 不存在，说明是卸载 (unmout) 操作
        // 只需要将 container 内的 DOM 清空即可
        container.innerHTML = "";
      }
    }
    // 把 vnode 存储到 container._vnode 下，即后续渲染中的旧 vnode
    container._vnode = vnode;
  }
  return {
    render,
  };
}
