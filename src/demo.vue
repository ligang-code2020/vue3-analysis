<template>
    <h3>{{ foo }}*{{ bar }}</h3>
</template>

<script>
import {ref, reactive, toRefs, computed} from 'vue';

export default {
    name: "demo.vue",
    setup() {
        const obj = reactive({foo: 1, bar: 2})


        obj.foo = 1000

        return {

            ...toRefs(obj)
        }
    }
}
</script>

<style scoped>

</style>