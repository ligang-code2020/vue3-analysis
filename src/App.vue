<script setup lang="ts">
import { ref } from 'vue';
import { renderer } from './cases/Render/Render'



const vnode = {
  tag: 'div',
  props: {
    onclick: () => alert('hello')
  },
  children: 'click me'
}
renderer(vnode, document.body)
const count = ref<number>(0)

console.log(count);





// Render(obj, document.body)
</script>

<template>
  <div>

  </div>
</template>

<style scoped></style>
