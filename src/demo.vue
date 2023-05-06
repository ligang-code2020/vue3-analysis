<template>
    <input type="text" id="my-input" value="foo"/>
</template>

<script>
import {ref, reactive, toRefs, computed, onMounted, effect} from 'vue';


export default {
    name: "demo.vue",
    setup() {
        onMounted(() => {
            const el = document.querySelector('#my-input')
            console.log(el)
        })

    }
}
</script>

<style scoped>

</style>