import * as React from 'react'
import { Redirect, Route, RouteProps } from 'react-router'
import { store } from '../App'
import { getAuthenticated } from '../profile/profileSelectors'
import { config } from '../config'

export class ProtectedRoute extends Route<RouteProps> {
  public render() {
    let redirectPath: string = ''
    const isAuthenticated = getAuthenticated(store.getState())
    if (!isAuthenticated) {
      redirectPath = config.LOGIN_URL
    }

    if (redirectPath) {
      const renderComponent = () => <Redirect to={{ pathname: redirectPath }} />
      return (
        <Route {...this.props} component={renderComponent} render={undefined} />
      )
    } else {
      return <Route {...this.props} />
    }
  }
}
