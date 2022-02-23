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
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { Content } from '@opencrvs/components/lib/interface/Content'
import { FormTabs } from '@opencrvs/components/lib/forms/FormTabs'
import { messages } from '@client/i18n/messages/views/config'

type Props = WrappedComponentProps &
  Pick<RouteComponentProps, 'history'> & {
    userDetails: IUserDetails | null
    offlineResources: IOfflineData
    offlineCountryConfiguration: IOfflineData
  }

interface State {
  activeTabId: string
}

class ApplicationConfigComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      activeTabId: 'birthTab'
    }
  }

  changeTab(id: string) {
    this.setState({ activeTabId: id })
  }

  render() {
    const { intl } = this.props
    return (
      <SysAdminContentWrapper isCertificatesConfigPage={true}>
        <Content
          title={intl.formatMessage(messages.applicationTitle)}
          titleColor={'copy'}
        >
          <FormTabs
            sections={[
              {
                id: 'generalTab',
                title: 'General'
              },
              {
                id: 'birthTab',
                title: 'Birth'
              },
              { id: 'deathTab', title: 'Death' }
            ]}
            activeTabId={this.state.activeTabId}
            onTabClick={(id: any) => this.changeTab(id)}
          ></FormTabs>
        </Content>
      </SysAdminContentWrapper>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    offlineResources: getOfflineData(state),
    userDetails: getUserDetails(state),
    offlineCountryConfiguration: getOfflineData(state)
  }
}

export const ApplicationConfig = connect(mapStateToProps)(
  injectIntl(ApplicationConfigComponent)
)
