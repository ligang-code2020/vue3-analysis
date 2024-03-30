function mountElement(vnode, container) {
  const el = createElement(vnode.type);
  if (typeof vnode.children === "string") {
    setElementText(el, vnode.children);
  } else if (Array.isArray(vnode.children)) {
    // 如果 children 是数组，则遍历每一个子节点，并调用 patch 函数挂载它们
    vnode.children.forEach((child) => {
      patch(null, child, el);
    });
  }

  if (vnode.props) {
    for (const key in vnode.props) {
      patchProps(el, key, null, vnode.props[key]);
      el[key] = vnode.props[key];
    }
  }
  insert(el, container);
}

// 在创建 renderer 时传入配置项
const renderer = createRenderer({
  // 用于创建元素
  createElement(tag) {
    return document.createElement(tag);
  },
  // 用于设置元素的文本节点
  setElementText(el, text) {
    el.textContent = text;
  },
  // 用于再给定的 parent 下添加指定元素
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor);
  },
  // 将属性设置相关的操作封装到 patchProps 函数中，并且作为渲染器选项传递
  patchProps(el, key, preValue, nextValue) {
    if (shouldSetAsProps(el, key, nextValue)) {
      const type = typeof el[key];
      if (type === "boolean" && nextValue === "") {
        el[key] = true;
      } else {
        el[key] = nextValue;
      }
    } else {
      el.setAttribute(key, nextValue);
    }
  },
});

function createRenderer(options) {
  // 通过 options 得到操作 DOM 的 API
  const { createElement, insert, setElementText, patchProps } = options;

  // 在这个作用域定义的函数都可以访问那些 API
  function mountElement() {}

  function patch(n1, n2, container) {}

  function render(vnode) {}

  return {
    render,
  };
}

// 对特殊元素兜底
function shouldSetAsProps(el, key, value) {
  // 特殊处理
  if (key === "form" && el.tagName === "INPUT") return false;
  // 兜底
  return key in el;
}
