import { createApp } from 'vue'
import './style.css'
import App from './App.vue'


const app = createApp(App)

// app.config.errorHandler = (err: Error, vm, info: string) => {
//     // console.log("error",err);
// }

app.mount('#app')

// createApp(App).mount('#app')
