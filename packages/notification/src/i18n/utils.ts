export function getAvailableLanguages() {
  const LANGUAGES = (process.env.LANGUAGES && process.env.LANGUAGES) || 'bn,en'
  return LANGUAGES.split(',')
}

export function getDefaultLanguage() {
  return getAvailableLanguages()[0]
}
