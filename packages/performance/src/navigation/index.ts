import { push, goBack as back } from 'react-router-redux'
import { HOME } from 'src/navigation/routes'
import { getToken } from 'src/utils/authUtils'

export function goBack() {
  return back()
}

export function goToHome() {
  return push(HOME)
}

export function goToRegister() {
  // @ts-ignore
  window.location.assign(
    // @ts-ignore
    `${window.config.REGISTER_URL}?token=${getToken()}`
  )
}
