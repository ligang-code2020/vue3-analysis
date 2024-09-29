import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { tokenize } from './knowledge/ChapterFifteen/parser';

const app = createApp(App);
// tokenize()

// app.config.errorHandler = (err: Error, vm, info: string) => {
//     // console.log("error",err);
// }

app.mount('#app');

// createApp(App).mount('#app')
