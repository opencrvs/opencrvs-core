import * as React from 'react'
import { Route, RouteProps } from 'react-router'
import { LoginRedirect } from './LoginRedirect'
import { connect } from 'react-redux'
import { getAuthenticated } from '../profile/profileSelectors'
import { IStoreState } from '../store'

export interface IProps {
  isAuthenticated: boolean
}

class ProtectedRouteWrapper extends Route<IProps & RouteProps> {
  public render() {
    const { isAuthenticated } = this.props
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

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    isAuthenticated: getAuthenticated(store)
  }
}
export const ProtectedRoute = connect<IProps, {}>(mapStateToProps)(
  ProtectedRouteWrapper
)
