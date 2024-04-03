// vnode 与真实 DOM 元素之间建立联系
function mountElement(vnode, container) {
  // 让 vnode.el 引用真实 DOM 元素
  const el = (vnode.el = createElement(vnode.type));
  if (typeof vnode.children === "string") {
    setElementText(el, vnode.children);
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach((child) => {
      patch(null, child, el);
    });
  }

  if (vnode.props) {
    for (const key in vnode.props) {
      patchProps(el, key, null, vnode.props[key]);
    }
  }

  insert(el, container);
}

function render(vnode, container) {
  if (vnode) {
    patch(container._vnode, vnode, container);
  } else {
    if (container._vnode) {
      // 调用 unmount 函数卸载 vnode
      unmount(container._vnode);
    }
  }
  container._vnode = vnode;
}

function unmount(vnode) {
  const parent = vnode.el.parentNode;
  if (parent) {
    parent.removeChild(vnode.el);
  }
}
