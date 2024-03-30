import { effect, ref } from "vue";

export function renderer(domString, container) {
  container.innerHTML = domString;
}
const count = ref(1);

effect(() => {
  renderer(`<h1>${count.value}</h1>`, document.getElementById("app"));
});

count.value++;
