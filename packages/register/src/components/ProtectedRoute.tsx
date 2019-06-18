import * as React from 'react'
import {
  Route,
  RouteProps,
  RouteComponentProps,
  withRouter
} from 'react-router'
import { connect } from 'react-redux'
import { IStoreState } from '@register/store'
import { getAuthenticated } from '@register/profile/profileSelectors'

export interface IProps {
  authenticated: boolean
  userDetailsFetched: boolean
}

class ProtectedRouteWrapper extends Route<
  IProps & RouteProps & RouteComponentProps<{}>
> {
  public render() {
    if (!this.props.authenticated && !this.props.userDetailsFetched) {
      return <div />
    }
    return <Route {...this.props} />
  }
}

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    authenticated: getAuthenticated(store),
    userDetailsFetched: store.profile.userDetailsFetched
  }
}
export const ProtectedRoute = withRouter(
  connect<IProps, {}, IProps, IStoreState>(mapStateToProps)(
    ProtectedRouteWrapper
  )
) as any
