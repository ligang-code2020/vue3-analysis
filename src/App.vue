<script setup lang="ts">
import { ref } from 'vue';
import {Render} from './cases/Render';

const obj = {
  tag: 'div',
  children: [
    {
      tag: 'span',
      children: 'Hello World!'
    }
  ]
}

const count = ref<number>(0)

console.log(count);





// Render(obj, document.body)
</script>

<template>
  <div>

  </div>

</template>

<style scoped>

</style>
