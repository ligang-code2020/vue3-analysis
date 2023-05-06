function mountElement(vnode, container) {
    // 创建 dom 元素
    const el = document.createElement(vnode.type)
    // 处理子节点，如果子节点是字符串，代表元素具有文本节点
    if (typeof vnode.children === 'string') {
        // 因此只需要设置元素的 textContent 属性即可
        setElementText(el, vnode.children)
    }
    // 调用 insert 函数将元素插入到容器内
    insert(el, container)
}

function createRenderer(options) {
    // 通过 options 得到操作 DOM 的 API
    const {
        createElement,
        insert,
        setElementText
    } = options

    /**
     *
     */

    /**
     * 补丁函数
     */
    function patch(n1, n2, container) {
        // 如果 n1 不存在，意味着挂载，则调用 mountElement 函数完成挂载
        if (!n1) {
            mountElement(n2, container)
        } else {
            // n1 存在，意味着打补丁，暂时省略

        }
    }

    /**
     * 渲染函数
     */
    function render(vnode, container) {
        if (vnode) {
            // 新 vnode 存在，将其与旧 vnode 一起传递 patch 函数，进行打补丁
            patch(container._vnode, vnode, container)
        } else {
            if (container._vnode) {
                // 旧 vnode 存在，且新 vnode 不存在，说明是卸载(unmount) 操作
                // 只需要将 container 内的 DOM 清空即可
                container.innerHTML = ''
            }

        }
        // 把 vnode 储存到 container._vnode 下，即后续渲染中的旧 vnode
        container._vnode = vnode
    }

    return {
        render
    }
}

const renderer = createRenderer({
    createElement(tag) {
        console.log(`创建元素 ${tag}`)
    },
    setElementText(el, text) {
        console.log(`设置 ${JSON.stringify(el)} 的文本内容：${text}`)
        el.textContent = text
    },
    insert(el, parent, anchor = null) {
        console.log(`将 ${JSON.stringify(el)} 添加到 ${JSON.stringify(parent)} 下`)
        parent.children = el;
    }
})
const vnode = {
    type: 'h1',
    children: 'hello'
}
const container = {type: 'root'}
renderer.render(vnode, container)