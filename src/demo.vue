<template>
    <div id="test"></div>
</template>

<script  setup>
import { computed, ref, watch, onMounted, reactive } from 'vue';
// import { renderer } from "./knowledge/ChapterSeven/renderer";
import { renderer } from "./knowledge/ChapterSeven/customRender"
const vnode = {
    type: 'h1',
    children: 'hello'
}
const container = { type: 'root' }
renderer.render(vnode, container)
onMounted(() => {
    renderer.render(vnode, container)
})

</script>

<style scoped></style>