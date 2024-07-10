/* 转换前 */
const vnode = {
  type: "p",
  props: {
    // 使用 normalizeClass 函数对值进行序列化
    class: normalizeClass(["foo bar", { baz: true }]),
  },
};

/* 转换后 */
const vnode_new = {
  type: "p",
  props: {
    // 序列化后的结果
    class: "foo bar baz",
  },
};

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
    // 对 class 进行特殊处理
    if (key === "class") {
      el.className = nextValue || "";
    } else if (shouldSetAsProps(el, key, nextValue)) {
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
