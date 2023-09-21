import './assets/main.css'
import { createApp } from 'vue'
import MasonryWall from '@yeger/vue-masonry-wall'
import App from './App.vue'

const app = createApp(App)
app.use(MasonryWall)
app.mount('#app')
