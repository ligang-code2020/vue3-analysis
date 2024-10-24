

function hydrate(vnode, container) {
  // 从容器元素的第一个子节点开始
  hydrateNode(container.firstChild, vnode);
}

function hydrateNode(node, vnode) {
  const { type } = vnode;
  // 1. 让 vnode.el 引用真实 DOM
  vnode.el = node;

  // 2. 检查虚拟 DOM 的类型，如果是组件，则调用 mountComponent 函数完成激活
  if (typeof type === 'object') {
    mountComponent(vnode, container, null);
  } else if (typeof type === 'string') {
    // 3. 检查真实 DOM 的类型与虚拟 DOM 的类型是否匹配
    if (node.nodeType !== 1) {
      console.error('mismatch');
      console.error('服务端渲染的真实 DOM 节点是：', node);
      console.error('客户端渲染的虚拟 DOM 节点是：', vnode);
    } else {
      // 4. 如果是普通元素，则调用 hydrateElement 完成激活
      hydrateElement(node, vnode);
    }
  }
  // 5. 重要：hydrateNode 函数需要返回当前节点的下一个兄弟节点，以便继续进行后续的激活操作
  return node.nextSibling;
}

// 用来激活普通元素类型的节点
function hydrateElement(el, vnode) {
  // 1. 为 DOM 元素添加事件
  if (vnode.props) {
    for (const key in vnode.props) {
      // 只有事件类型的 props 需要处理
      if (/^on/.test(key)) {
        patchProps(el, key, null, vnode.props[key]);
      }
    }
  }

  // 递归地激活子节点
  if (Array.isArray(vnode.children)) {
    // 从第一个子节点开始
    let nextNode = el.firstChild;
    const len = vnode.children.length;
    for (let i = 0; i < len; i++) {
      // 激活子节点，注意，每当激活一个子节点，hydrateNode 函数都会返回当前子节点的下一个兄弟节点
      // 于是可以进行后续的激活了
      nextNode = hydrateNode(nextNode, vnode.children[i]);
    }
  }
}
