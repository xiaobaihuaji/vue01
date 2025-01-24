import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'

const messages = {
  en: en,
  zh: zh
}

const i18n = createI18n({
  locale: 'zh', // 默认语言
  messages
})

export default i18n
