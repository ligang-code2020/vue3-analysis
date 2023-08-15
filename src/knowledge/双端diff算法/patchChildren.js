/**
 * 双端 diff 算法
 */

function patchChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
        // 省略部分代码
    } else if (Array.isArray(n2.children)) {
        // 封装 patchKeyedChildren 函数处理两组子节点
        patchKeyedChildren(n1, n2, container)
    } else {
        // 省略部分代码
    }
}

function patchKeyedChildren(n1, n2, container) {
    const oldChildren = n1.children;
    const newChildren = n2.children;
    // 四个索引值
    let oldStartIdx = 0;
    let oldEndIdx = oldChildren.length - 1;
    let newStartIdx = 0;
    let newEndIdx = newChildren.length - 1;
    // 四个索引指向的 vnode 节点
    let oldStartVNode = oldChildren[oldStartIdx]
    let oldEndVNode = oldChildren[oldEndIdx]
    let newStartVNode = newChildren[newStartIdx]
    let newEndVNode = newChildren[newEndIdx]

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (oldStartVNode.key === newStartVNode.key) {
            // 第一步：oldStartVNode 和 newStartVNode 比较
        } else if (oldEndVNode.key === newEndVNode.key) {
            // 第二步：oldEndVNode 和 newEndVNode 比较
            // 节点在新的顺序中仍然处于尾部，不需要移动，但需要打不动
            patch(oldEndVNode, newEndVNode, container)
            // 更新索引和头尾部节点变量
            oldEndVNode = oldChildren[--oldEndIdx]
            newEndVNode = oldChildren[--newEndIdx]
        } else if (oldStartVNode.key === newEndVNode.key) {
            // 第三步：oldStartVNode 和 newEndVNode 比较
        } else if (oldEndVNode.key === newStartVNode.key) {
            // 第四步：oldEndVNode 和 newStartVNode 比较
            // 仍然需要调用 patch 函数进行打补丁
            patch(oldEndVNode, newStartVNode, container)
            // 移动 DOM 操作
            // oldEndVNode.el 移动到 oldStartVNode.el 前面
            insert(oldEndVNode.el, container, oldStartVNode.el)

            // 移动 DOM 完成后，更新索引值，并指向下一个位置
            oldEndVNode = oldChildren[--oldEndIdx]
            newStartVNode = newChildren[++newStartIdx]
        }
    }


}