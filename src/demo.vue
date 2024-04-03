<template>
    <div id="test">1</div>
</template>

<script  setup>
import { computed, ref, watch, onMounted, reactive, render, createVNode,h} from 'vue';
const bol = ref(false)
// 创建 vnode
const vnode = {
    type: 'div',
    props: bol.value ? {
        onClick: () => {
            alert('父元素 clicked')
        }
    } : {},
    children: [
        {
            type: 'p',
            props: {
                onClick: () => {
                    bol.value = true
                }
            },
            children: 'text'
        }
    ]
}



onMounted(() => {
    // 渲染 vnode
    // render(vnode, document.querySelector('#test'))
    h(vnode)
})

</script>

<style scoped></style>