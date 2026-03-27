import './bootstrap'; // Здесь обычно настроен axios
import {createApp} from 'vue';
import App from './App.vue'; // Главный компонент-оболочка
//import router from './router';

const app = createApp(App);

app.provide('config', window.AppData);

//app.use(router);
app.mount('#app');