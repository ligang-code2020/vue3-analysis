/*
 * 完成上述两组子节点的更新，则需要 6 次 DOM 操作
 * 调用patch函数在旧子节点{ type: 'p' }与新子节点{type: 'span' }之间打补丁，由于两者是不同的标签，所以patch函数会卸载{ type: 'p' }，然后再挂载{ type:'span' }，这需要执行 2 次 DOM 操作
 * 与第 1 步类似，卸载旧子节点{ type: 'div' }，然后再挂载新子节点{ type: 'p' }，这也需要执行 2 次 DOM 操作
 * 与第 1 步类似，卸载旧子节点{ type: 'span' }，然后再挂载新子节点{ type: 'div' }，同样需要执行 2 次 DOM 操作
 */
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

    // 遍历新的 children
    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = newChildren[i];
      console.log(newVNode);
      // 遍历旧的 children
      for (let j = 0; j < oldChildren.length; j++) {
        const oldVNode = oldChildren[j];
        console.log(oldVNode);
        // 如果找到了具有相同 key 值的两个节点，说明可以复用，但仍然需要调用 patch 函数更新
        if (newVNode.key === oldVNode.key) {
          console.log(newVNode.key, newVNode.key);
          //   patch(oldVNode, newVNode, container);
          break; // 这里需要 break
        }
      }
    }
  } else {
    // 省略部分代码
  }
}

patchChildren(oldVNode, newVNode);
