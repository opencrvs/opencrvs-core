export function getAvailableLanguages() {
  const LANGUAGES = (process.env.LANGUAGES && process.env.LANGUAGES) || 'en,bn'
  return LANGUAGES.split(',')
}

export function getDefaultLanguage() {
  return getAvailableLanguages()[0]
}
