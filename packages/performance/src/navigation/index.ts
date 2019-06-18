import { push, goBack as back } from 'react-router-redux'
import { HOME } from '@performance/navigation/routes'
import { getToken } from '@performance/utils/authUtils'

export function goBack() {
  return back()
}

export function goToHome() {
  return push(HOME)
}

export function goToRegister() {
  window.location.assign(`${window.config.REGISTER_URL}?token=${getToken()}`)
}
