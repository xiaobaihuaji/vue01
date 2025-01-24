import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'  // 引入 i18n 配置

createApp(App)
  .use(i18n)  // 注册 i18n
  .mount('#app')
