import * as React from 'react'
import {
  Route,
  RouteProps,
  RouteComponentProps,
  withRouter
} from 'react-router'
import { connect } from 'react-redux'
import { IStoreState } from '@performance/store'
import { getAuthenticated } from '@performance/profile/selectors'
import { checkAuth } from '@performance/profile/actions'
import { IURLParams } from '@performance/utils/authUtils'
import { parse } from 'querystring'

export interface IProps {
  authenticated: boolean
}
interface IDispatchProps {
  checkAuth: (urlValues: IURLParams) => void
}

type Props = RouteProps & RouteComponentProps<{}>

type FullProps = IProps & IDispatchProps & Props

class ProtectedRouteWrapper extends Route<IProps & IDispatchProps & Props> {
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
export const ProtectedRoute = withRouter<Props>(
  connect<IProps, IDispatchProps, any, IStoreState>(
    mapStateToProps,
    {
      checkAuth
    }
  )(ProtectedRouteWrapper)
) as any
