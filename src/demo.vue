<template>
    <div id="test"></div>
</template>

<script  setup>
import { computed, ref, watch, onMounted, reactive, createRenderer, h } from 'vue';





const oldVNode = {
    type: { render: () => 'div' },
    children: [
        { type: "p", children: "1", key: 1 },
        { type: "p", children: "2", key: 2 },
        { type: "p", children: "hello", key: 3 },
    ],
};

const newVNode = {
    type: "div",
    children: [
        { type: "p", children: "world", key: 3 },
        { type: "p", children: "1", key: 1 },
        { type: "p", children: "2", key: 2 },
    ],
};


onMounted(() => {
    // 初始渲染
    const oldRoot = createDOM(oldVNode);
    document.body.appendChild(oldRoot);

    // 更新渲染
    patch(oldRoot, oldVNode, newVNode);

    // setTimeout(() => {
    //     h(`<h1>哈哈哈</h1>`, document.querySelector('#test'))
    //     console.log(333);
    // }, 2000)
})

</script>

<style scoped>
#test {
    width: 100px;
    height: 100px;
    border: 1px solid forestgreen;
    box-sizing: border-box;
}
</style>