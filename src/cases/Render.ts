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