/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import { RouteComponentProps, withRouter } from 'react-router'
import { connect } from 'react-redux'
import { declarationConfigLoadAction } from './login/actions'
import { IStoreState } from './store'

interface IDispatchProps {
  getDeclarationConfig: () => void
}

class Component extends React.Component<
  RouteComponentProps<{}> & IDispatchProps
> {
  componentDidMount() {
    this.props.getDeclarationConfig()
  }
  render() {
    const { children } = this.props
    return <>{children}</>
  }
}

const mapDispatchToProps = {
  getDeclarationConfig: declarationConfigLoadAction
}
export const Page = withRouter(
  connect<{}, IDispatchProps, {}, IStoreState>(
    null,
    mapDispatchToProps
  )(Component)
)
