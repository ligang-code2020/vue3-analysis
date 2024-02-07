/**
 * vnode：虚拟 DOM 对象。
 * container：一个真实 DOM 元素，作为挂载点，渲染器会把虚拟 DOM 渲染到该挂载点下。
 */

function mountElement(vnode, container) {
  // 使用 vnode.tag 作为标签名称创建 DOM 元素
  const el = document.createElement(vnode.tag);

  // 遍历 vnode.props，将属性、事件添加到 DOM 元素中
  for (const key in vnode.props) {
    if (/^on/.test(key)) {
      // 如果 key 是以 on 开头说明他是事件
      el.addEventListener(
        key.substr(2).toLowerCase(), // 事件名称 onClick --->click
        vnode.props[key] // 事件处理函数
      );
    }
  }

  // 处理 children
  if (typeof vnode.children === "string") {
    // 如果 children 是字符串，说明它是元素的文本子节点
    el.appendChild(document.createTextNode(vnode.children));
  } else if (Array.isArray(vnode.children)) {
    // 递归地调用 renderer 函数渲染子节点，使用当前元素 el 作为挂载点
    vnode.children.forEach((child) => mountElement(child, el));
  }

  // 将元素添加到挂载点下
  container.appendChild(el);
}

function renderer(vnode, container) {
  if (typeof vnode.tag === "string") {
    mountElement(vnode, container);
  } else if (typeof vnode.tag === "object") {
    // 如果 vnode.tag 是对象，说明描述是组件
    mountComponent(vnode, container);
  }
}

function mountComponent(vnode, container) {
  const subtree = vnode.tag.render();

  // 递归地调用 renderer 渲染 subtree
  renderer(subtree, container);
}

function mountComponent(vnode, container) {
  // 调用组件函数，获取组件要渲染的内容（虚拟 DOM）
  const subtree = vnode.tag();
  // 递归地调用 renderer 渲染 subtree
  renderer(subtree, container);
}
