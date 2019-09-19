export function isMobileDevice() {
  const IS_MOBILE = true
  const IS_DESKTOP = false

  if (
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  ) {
    return IS_MOBILE
  }

  if (window.outerWidth < 1033) {
    return IS_MOBILE
  }

  return IS_DESKTOP
}

export function contains(target: string, pattern: string[]) {
  let value = 0
  pattern.forEach((word: string) => {
    value = value + Number(target.includes(word))
  })
  return value === 1
}
