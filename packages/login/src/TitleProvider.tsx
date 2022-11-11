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
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { selectApplicationName } from '@login/login/selectors'
import { IStoreState } from '@login/store'

interface IName {
  applicationName: string | undefined
}

type Props = WrappedComponentProps & IName

class TitleProviderComponent extends Component<Props> {
  componentDidUpdate(): void {
    const { applicationName } = this.props
    if (applicationName) document.title = applicationName
  }
  render() {
    return <>{this.props.children}</>
  }
}

const mapStateToProps = (store: IStoreState): IName => {
  return {
    applicationName: selectApplicationName(store)
  }
}

export const TitleProvider = connect(mapStateToProps)(
  injectIntl(TitleProviderComponent)
)
