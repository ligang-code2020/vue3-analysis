function mountElement(vnode, container) {
    const el = createElement(vnode.type)
    if (typeof vnode.children === 'string') {
        setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
        // 如果 children 是数组，则遍历每一个子节点，并调用 patch 函数挂载它
        vnode.children.forEach(child => {
            patch(null, child, el)
        })
    }
    insert(el, container)
}