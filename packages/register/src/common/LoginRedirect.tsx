import * as React from 'react'
import { config } from '../config'

export class LoginRedirect extends React.Component {
  componentDidMount() {
    window.location.href = config.LOGIN_URL
  }
  render() {
    return null
  }
}
