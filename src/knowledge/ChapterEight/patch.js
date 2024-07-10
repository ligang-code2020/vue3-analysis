function patchElement(n1, n2) {
  const el = (n2.el = n1.el);
  const oldProps = n1.props;
  const newProps = n2.props;
  // 第一步：更新 props
  for (const key in newProps) {
    if (newProps[key] !== oldProps[key]) {
      patchProps(el, key, oldProps[key], newProps[key]);
    }
  }
  for (const key in oldProps) {
    if (!(key in newProps)) {
      patchProps(el, key, oldProps[key], null);
    }
  }
  // 第二步：更新 children
  patchChildren(n1, n2, el);
}

function patchChildren(n1, n2, container) {
  // 判断新子节点的类型是否是文本节点
  if (typeof n2.children === "string") {
    // 旧子节点的类型有三种可能：没有子节点、文本子节点以及一组子节点
    // 只有当旧子节点为一组子节点时，才需要逐个卸载，其他情况下什么都不需要
    if (Array.isArray(n1.children)) {
      n1.children.forEach((c) => unmount(c));
    }
    // 最后将新的文本节点内容设置给容器元素
    setElementText(container, n2.children);
  } else if (Array.isArray(n2.children)) {
    // 说明新子节点是一组子节点
    // 判断旧子节点是否也是一组子节点
    if (Array.isArray(n1.children)) {
      // 代码运行到这里，则说明新旧子节点都是一组子节点，使用 Diff 算法
    } else {
      // 此时:
      // 旧子节点要么是文本子节点，要么不存在
      // 但无论哪种情况，我们都是只需要将容器清空，然后将新的一组子节点逐个挂载
      setElementText(container, "");
      n2.children.forEach((c) => patch(null, c, container));
    }
  }
}
