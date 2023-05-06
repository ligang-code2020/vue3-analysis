// 旧 vnode
const oldVNode = {
    type: 'div',
    children: [
        {type: 'p', children: '1'},
        {type: 'p', children: '2'},
        {type: 'p', children: '3'}
    ]
}

// 新 vnode
const newVNode = {
    type: 'div',
    children: [
        {type: 'p', children: '4'},
        {type: 'p', children: '5'},
        {type: 'p', children: '6'}
    ]
}


function patchChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
        // 省略部分代码
    } else if (Array.isArray(n2.children)) {
        // 重新实现两组子节点的更新方式
        // 新旧 children
        const oldChildren = n1.children;
        const newChildren = n2.children;
        // 遍历新的 children
        let lastIndex = 0; // 用来储存寻找过程中遇到的最大索引值
        for (let i = 0; i < newChildren.length; i++) {
            const newVNode = newChildren[i]
            // 遍历旧的 children
            // 在第一层循环中定义变量 find，代表是否在旧的一组子节点中找到可复用的节点
            // 初始值为 false，代表没有找到
            let find = false;
            for (let j = 0; j < oldChildren.length; j++) {
                const oldVNode = oldChildren[j]
                // 如果找到了具有相同 key 值的两个节点，说明可以复用，但仍然需要调 patch 函数更新
                if (newVNode.key === oldVNode.key) {
                    // 一旦找到可复用的节点，则将变量 find 的值设为 false
                    find = true;
                    patch(oldVNode, newVNode, container)
                    if (j < lastIndex) {
                        // 如果当前找到的节点在旧 children 中的索引小于最大索引值 lastIndex
                        // 说明该节点对应的真实 DOM 需要移动
                        const prevVNode = newChildren[i - 1]
                        // 如果 preVNode 不存在，则说明当前 newVNode 是第一个节点，它不需要移动
                        if (prevVNode) {
                            // 由于我们要将 newVNode 对应的真实 DOM 移动到 prevVNode 所对应真实 DOM 后面
                            // 所有我们需要获取 prevVNode 所对应的真实 DOM 的下一兄弟节点，并将其作为锚点
                            const anchor = prevVNode.el.nextSibling
                            // 调用 insert 方法将 newVNode 对应的真实 DOM 插入到锚点元素前面
                            // 也就是 prevVNode 对应真实 DOM 的后面
                            insert(newVNode.el, container, anchor)
                        }
                    } else {
                        // 如果当前找到的节点在旧 children 中的索引不小于最大索引值
                        // 则更新 lastIndex 的值
                        lastIndex = j;
                    }
                    break; // 这里需要 break
                }
            }
            // 如果代码运行到这里，find 仍然为 false
            // 说明当前 newVNode 没有在旧的一组子节点中找到可复用的节点
            // 也就是说，当前 newVNode 是新增节点，需要挂载
            if (!find) {
                // 为了讲节点挂载到正确位置，我们需要先获取锚点元素
                // 首先获取当前 newVNode 的前一个 vnode 节点
                const prevVNode = newChildren[i - 1]
                let anchor = null
                if (prevVNode) {
                    // 如果没有前一个 vnode 节点，则使用它的下一个兄弟节点作为锚点元素
                    anchor = prevVNode.el.nextSibling
                } else {
                    // 如果没有前一个 vnode 节点，说明即将挂载的新节点是第一个子节点

                    // 这时我们使用容器元素的 firstChild 作为锚点
                    anchor = container.firstChild
                }
                // 挂载 newVNode
                patch(null, newVNode, container, anchor)
            }
        }

        // 旧的一组子节点的长度
        const oldLen = oldChildren.length;
        // 新的一组子节点的长度
        const newLen = newChildren.length;
        // 两组子节点的公共长度，即两者较短的那一组子节点的长度
        const commonLength = Math.min(oldLen, newLen)
        // 遍历 commonLength 次
        for (let i = 0; i < commonLength; i++) {
            patch(oldChildren[i], newChildren[i], container)
        }
        // 如果 newLen > oldLen，说明有新子节点需要挂载
        if (newLen > oldLen) {
            for (let i = commonLength; i < newLen; i++) {
                patch(null, newChildren[i], container)
            }
        } else if (oldLen > newLen) {
            // 如果 oldLen > newLen，说明有旧子节点需要卸载
            for (let i = commonLength; i < oldLen; i++) {
                unmount(oldChildren[i])
            }
        }

    } else {
        // 省略部分代码
    }
}