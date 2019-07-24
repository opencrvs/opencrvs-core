export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export function getAvailableLanguages() {
  return window.config.LANGUAGES.split(',')
}
export function getDefaultLanguage() {
  return getAvailableLanguages()[0]
}
