import * as React from 'react'
import { Route, RouteProps } from 'react-router'
import { store } from '../App'
import { getAuthenticated } from '../profile/profileSelectors'
import { LoginRedirect } from './LoginRedirect'

export class ProtectedRoute extends Route<RouteProps> {
  public render() {
    const isAuthenticated = getAuthenticated(store.getState())
    if (!isAuthenticated) {
      const renderComponent = () => <LoginRedirect />
      return (
        <Route {...this.props} component={renderComponent} render={undefined} />
      )
    } else {
      return <Route {...this.props} />
    }
  }
}
