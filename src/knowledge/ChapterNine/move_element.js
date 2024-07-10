const oldVNode = {
  type: "div",
  children: [
    { type: "p", children: "1", key: 1 },
    { type: "p", children: "2", key: 2 },
    { type: "p", children: "hello", key: 3 },
  ],
};

const newVNode = {
  type: "div",
  children: [
    { type: "p", children: "world", key: 3 },
    { type: "p", children: "1", key: 1 },
    { type: "p", children: "2", key: 2 },
  ],
};

function patchChildren(n1, n2, container) {
  if (typeof n2.children === "string") {
    // 省略部分代码
  } else if (Array.isArray(n2.children)) {
    const oldChildren = n1.children;
    const newChildren = n2.children;

    // 用来存储寻找过程中遇到的最大索引值
    let lastIndex = 0;
    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = oldChildren[i];
      let j = 0;
      for (j; j < oldChildren.length; j++) {
        const oldVNode = oldChildren[j];
        if (newVNode.key === oldVNode.key) {
          patch(oldVNode, newVNode, container);
          if (j < lastIndex) {
            // 代码运行到这里，说明 newVNode 对应的真实 DOM 需要移动
            // 先获取 newVNode 的前一个 vnode，即 prevVNode
            const prevVNode = newChildren[i - 1];
            if (prevVNode) {
              // 由于我们要将 newVNode 对应的真实 DOM 移动到 preVNode 所对应的真实 DOM 后面
              // 所以我们需要获取 prevVNode 所对应真实 DOM 的下一个兄弟节点，并将其作为锚点
              const anchor = prevVNode.el.nextSibling;
              // 调用 insert 方法将 newVNode 对应的真实 DOM 插入到描点元素前面
              // 也就是 prevVNode 对应真实 DOM 的后面
              insert(newVNode.el, container, anchor);
            }
          } else {
            // 如果当前找的节点在旧的 children 中的索引不小于最大索引值
            // 则更新 lastIndex 的值
            lastIndex = j;
          }
          break;
        }
      }
    }
  } else {
    // 省略部分代码
  }
}

patchChildren(oldVNode, newVNode);
