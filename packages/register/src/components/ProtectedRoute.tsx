import * as React from 'react'
import { Route, RouteProps } from 'react-router'
import { connect } from 'react-redux'
import { IStoreState } from '@opencrvs/register/src/store'
import { getAuthenticated } from '@opencrvs/register/src/profile/profileSelectors'
import { redirectToAuthentication } from '@opencrvs/register/src/profile/profileActions'

export interface IProps {
  isAuthenticated: boolean
}
interface IDispatchProps {
  redirectToAuthentication: () => void
}

class ProtectedRouteWrapper extends Route<
  IProps & IDispatchProps & RouteProps
> {
  public componentDidMount() {
    if (!this.props.isAuthenticated) {
      this.props.redirectToAuthentication()
    }
  }
  public componentWillReceiveProps(nextProps: IProps) {
    if (!nextProps.isAuthenticated) {
      this.props.redirectToAuthentication()
    }
  }
  public render() {
    return <Route {...this.props} />
  }
}

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    isAuthenticated: getAuthenticated(store)
  }
}
export const ProtectedRoute = connect<IProps, IDispatchProps>(mapStateToProps, {
  redirectToAuthentication
})(ProtectedRouteWrapper)
