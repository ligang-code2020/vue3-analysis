// 在创建 renderer 时传入配置项
const renderer = createRenderer({
  // 用于创建元素
  createElement(tag) {
    console.log(`创建元素 ${tag}`);
    return { tag };
    return document.createElement(tag);
  },
  // 用于设置元素的文本节点
  setElementText(el, text) {
    console.log(`设置 ${JSON.stringify(el)} 的文本内容：${text}`);
    el.textContent = text;
  },
  // 用于再给定的 parent 下添加指定元素
  insert(el, parent, anchor = null) {
    console.log(`将 ${JSON.stringify(el)} 添加到 ${JSON.stringify(parent)} 下`);
    parent.children = el;
    // parent.insertBefore(el, anchor);
  },
});

function createRenderer(options) {
  // 通过 options 得到操作 DOM 的 API
  const { createElement, insert, setElementText } = options;

  // 在这个作用域定义的函数都可以访问那些 API
  function mountElement() {}

  function patch(n1, n2, container) {}

  function render(vnode) {
  }

  return {
    render,
  };
}

function mountElement(vnode, container) {
  // 调用 createElement 函数创建元素
  const el = createElement(vnode.type);
  if (typeof vnode.children === "string") {
    // 调用 setElement 设置元素的文本节点
    setElementText(el, vnode.children);
  }
  // 调用 insert 函数将元素插入到容器内
  insert(el, container);
}


export {renderer}