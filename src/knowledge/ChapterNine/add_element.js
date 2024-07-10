/**
 * 对于新增节点，在更新时我们应该正确地将它挂载，这主要分为两步：
 * 1.想办法找到新增节点
 * 2.将新增节点挂载到正确位置。
 */

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
      // 在第一层循环中定义变量 find，代表是否在旧的一组子节点找到可复用的节点
      // 初始值为 false，代表没找到
      let find = false;
      for (j; j < oldChildren.length; j++) {
        const oldVNode = oldChildren[j];
        if (newVNode.key === oldVNode.key) {
          // 一旦找到可复用的节点，则将变量 find 的值设为 true
          find = true;
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
      // 如果代码运行到这里，find 仍然为 false
      // 则说明当前 newVNode 没有在旧的一组子节点中找到可复用的节点
      // 也就是说，当前 newVNode 是新增节点，需要挂载
      if (!find) {
        // 为了将节点挂载到正确位置，我们需要先获取锚点元素
        // 首先获取当前 newVNode 的前一个 vnode 节点
        const preVNode = newChildren[i - 1];
        let anchor = null;
        if (preVNode) {
          // 如果有前一个 vnode 节点，则使用它的下一个兄弟节点作为锚点元素
          anchor = preVNode.el.nextSibling;
        } else {
          // 如果没有前一个 vnode 节点，说明即将挂载的新节点是第一个子节点
          // 这时我们使用容器元素的 firstChild 作为锚点
          anchor = container.firstChild;
        }
        // 挂载 newVNode
        patch(null, newVNode, container, anchor);
      }
    }
  } else {
    // 省略部分代码
  }
}

// patch 函数需要接收第四个参数，即锚点元素
function patch(n1, n2, container, anchor) {
  // 省略部分代码
  if (typeof type === "string") {
    if (!n1) {
      // 挂载时将锚点元素作为第三个参数传递给 mountElement 函数
      mountElement(n2, container, anchor);
    } else {
      patchElement(n1, n2);
    }
  } else if (type === Text) {
    //...
  } else if (type === Fragment) {
    //...
  }
}

// mountElement 函数需要增加第三个参数，即锚点元素
function mountElement(vnode, container, anchor) {
  // 在插入节点时，将锚点元素透传给 insert 函数
  insert(el, container, anchor);
}
