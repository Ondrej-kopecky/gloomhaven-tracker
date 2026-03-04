import { createI18n } from 'vue-i18n'
import cs from './cs.json'

const i18n = createI18n({
  legacy: false,
  locale: 'cs',
  fallbackLocale: 'cs',
  messages: { cs },
})

export default i18n
