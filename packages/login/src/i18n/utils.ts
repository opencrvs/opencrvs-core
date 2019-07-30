export function getAvailableLanguages() {
  return window.config.LANGUAGES.split(',')
}

export function getDefaultLanguage() {
  return getAvailableLanguages()[0]
}
