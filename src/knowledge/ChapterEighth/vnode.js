function patch(n1, n2, container) {
  // 如果 n1 存在，则对比 n1 和 n2 的类型
  if (n1 && n1.type !== n2.type) {
    // 如果新旧 vnode 的类型不同，则直接将旧 vnode 卸载
    unmount(n1);
    n1 = null;
  }
  // 代码运行到这里，证明 n1 和 n2 所描述的内容相同
  const { type } = n2;
  // 如果 n2.type 的值是字符串类型，则它描述的是普通标签元素
  if (typeof type === "string") {
    if (!n1) {
      mountElement(n2, container);
    } else {
      patchElement(n1, n2);
    }
  } else if (typeof type === "object") {
    // 如果 n2.type 的值的类型对象，则它描述的组件
  } else if (type === "Text") {
    // 如果新 vnode 的类型是 Text，则说明该 vnode 描述的是文本节点
    // 如果没有旧节点，则进行挂载
    if (!n1) {
      // 使用 createTextNode 创建文本节点
      const el = (n2.el = document.createTextNode(n2.children));
      // 将文本节点插入到容器中
      insert(el, container);
    } else {
      // 如果旧 vnode 存在，只需要使用新文本节点的文本内容更新旧文本节点即可
      const el = (n2.el = n1.el);
      if (n2.children !== n1.children) {
        el.nodeValue = n2.children;
      }
    }
  }

  if (!n1) {
    mountElement(n2, container);
  } else {
    // 更新操作
  }
}
