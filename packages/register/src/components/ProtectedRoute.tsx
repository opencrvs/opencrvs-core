import * as React from 'react'
import {
  Route,
  RouteProps,
  RouteComponentProps,
  withRouter
} from 'react-router'
import { connect } from 'react-redux'
import { IStoreState } from '../store'
import { getAuthenticated } from '../profile/profileSelectors'
import { checkAuth } from '../profile/profileActions'
import { IURLParams } from '../utils/authUtils'
import { parse } from 'querystring'

export interface IProps {
  authenticated: boolean
}
interface IDispatchProps {
  checkAuth: (urlValues: IURLParams) => void
}

class ProtectedRouteWrapper extends Route<
  IProps & IDispatchProps & RouteProps & RouteComponentProps<{}>
> {
  public componentDidMount() {
    const values = parse(this.props.location.search)
    this.props.checkAuth(values)
  }
  public render() {
    if (!this.props.authenticated) {
      return <div />
    }
    return <Route {...this.props} />
  }
}

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    authenticated: getAuthenticated(store)
  }
}
export const ProtectedRoute = withRouter(
  connect<IProps, IDispatchProps>(mapStateToProps, {
    checkAuth
  })(ProtectedRouteWrapper)
)
