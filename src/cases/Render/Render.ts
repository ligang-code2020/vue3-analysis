/**
 * 假设我们设计了一个框架，它提供一个Render函数，
 * 用户可以为该函数提供一个树型结构的数据对象，
 * 然后Render函数会根据该对象递归地将数据渲染成 DOM 元素
 */

const obj = {
    tag: 'div',
    children: [
        {
            tag: 'span',
            children: 'Hello World!'
        }
    ]
}


export function Render(obj: { tag: any; children: string | any[] }, root: { appendChild: (arg0: any) => void }) {
    const el = document.createElement(obj.tag)
    if (typeof obj.children === 'string') {
        const text = document.createTextNode(obj.children)
        el.appendChild(text)
    } else if (obj.children) {
        // 数组，递归调用 Render，使用 el 作为 root 参数
        obj.children.forEach((child) => {
            Render(child, el)
        })
    }

    // 将元素添加到 root
    root.appendChild(el)
}




/**
 * 编写一个渲染器，把上面这段虚拟 DOM 渲染为真实 DOM
 * tag用来描述标签名称，所以tag: 'div'描述的就是一个<div>标签。
 * props是一个对象，用来描述<div>标签的属性、事件等内容。可以看到，我们希望给div绑定一个点击事件。
 * children用来描述标签的子节点。在上面的代码中，children是一个字符串值，意思是div标签有一个文本子节点：<div>click me</div>
 */

const vnode = {
    tag: 'div',
    props: {
        onclick: () => alert('hello')
    },
    children: 'click me'
}

export function renderer(vnode, container) {
    // 使用 vnode.tag 作为标签名称创建 DOM 元素
    const el = document.createElement(vnode.tag)

    // 遍历 vnode.props，将属性和事件添加到 DOM 元素中
    for (const key in vnode.props) {
        // 如果 key 以 on 开头，说明它是事件
        el.addEventListener(
            key.substring(2).toLowerCase(), // 将 onclick 翻译成 click
            vnode.props[key] // 事件处理函数
        )
    }

    // 处理 children
    if (typeof vnode.children === 'string') {
        // 如果是 sting 类型，说明它元素的文本子节点
        el.appendChild(document.createTextNode(vnode.children))
    } else if (Array.isArray(vnode.children)) {
        // 递归调用 renderer 函数渲染子节点，使用当前元素 el 作为挂载节点
        vnode.children.forEach(child => renderer(child, el))
    }

    // 将元素添加到挂载节点
    container.appendChild(el)

}