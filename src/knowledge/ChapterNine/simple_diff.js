// 简单 Diff 算法
const oldVNode = {
  type: "div",
  children: [
    { type: "p", children: "1" },
    { type: "p", children: "2" },
    { type: "p", children: "3" },
  ],
};

const newVNode = {
  type: "div",
  children: [
    { type: "p", children: "4" },
    { type: "p", children: "5" },
    { type: "p", children: "6" },
  ],
};

function patchChildren(n1, n2, container) {
  if (typeof n2.children === "string") {
    // 省略部分代码
  } else if (Array.isArray(n2.children)) {
    // 重新实现两组子节点的更新方式
    // 新旧 children
    const oldChildren = n1.children;
    const newChildren = n2.children;
    // 旧的一组子节点的长度
    const oldLen = oldChildren.length;
    // 新的一组子节点的长度
    const newLen = newChildren.length;
    // 两组子节点的公共长度，即两者中较短的那一组子节点的长度
    const commonLength = Math.min(oldLen, newLen);
    // 遍历 commonLength 次
    for (let i = 0; i < commonLength; i++) {
      patch(oldChildren[i], newChildren[i], container);
    }
    // 如果 newLen > oldLen，说明有新子节点需要挂载
    if (newLen > oldLen) {
      for (let i = commonLength; i < newLen; i++) {
        patch(null, newChildren[i], container);
      }
    } else if (oldLen > newLen) {
      // 如果 oldLen > newLen，说明有旧子节点需要卸载
      for (let i = commonLength; i < oldLen; i++) {
        unmount(oldChildren[i]);
      }
    }
    // 遍历旧的 children
    for (let i = 0; i <= oldChildren.length; i++) {
      // 调用 patch 函数逐个更新子节点
      patch(oldChildren[i], newChildren[i]);
    }
  } else {
  }
}
