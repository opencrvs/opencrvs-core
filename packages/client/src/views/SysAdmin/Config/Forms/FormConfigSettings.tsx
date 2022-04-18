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
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import {
  ListView,
  FloatingNotification,
  NOTIFICATION_TYPE
} from '@opencrvs/components/lib/interface'
import { Content } from '@opencrvs/components/lib/interface/Content'
import { messages } from '@client/i18n/messages/views/formConfig'
import { buttonMessages } from '@client/i18n/messages'
import { EMPTY_STRING } from '@client/utils/constants'

type Props = IntlShapeProps & {
  offlineCountryConfiguration: IOfflineData
}
interface State {
  showModal: boolean
  showNotification: boolean
  notificationStatus: NOTIFICATION_TYPE
  notificationMessages: string
}

class FormConfigSettingsComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      showModal: false,
      showNotification: false,
      notificationStatus: NOTIFICATION_TYPE.IN_PROGRESS,
      notificationMessages: EMPTY_STRING
    }
  }

  changeValue = (notificationStatus: NOTIFICATION_TYPE, messages: string) => {
    if (notificationStatus !== NOTIFICATION_TYPE.ERROR) {
      this.toggleConfigModal()
      this.setState({
        showNotification: true,
        notificationStatus: notificationStatus,
        notificationMessages: messages
      })
    }
  }

  toggleConfigModal = () => {
    this.setState({ showModal: !this.state.showModal })
  }

  render() {
    const { intl, offlineCountryConfiguration } = this.props

    return (
      <SysAdminContentWrapper isCertificatesConfigPage={true}>
        <Content
          title={intl.formatMessage(messages.settingsTitle)}
          titleColor={'copy'}
        >
          <ListView
            items={[
              {
                label: intl.formatMessage(messages.introductionSettings),
                value: 'Enabled',
                action: {
                  label: intl.formatMessage(buttonMessages.change),
                  handler: () => {}
                }
              },
              {
                label: intl.formatMessage(messages.addressesSettings),
                value: '1',
                action: {
                  label: intl.formatMessage(buttonMessages.change),
                  handler: () => {}
                }
              }
            ]}
          />
        </Content>
        <FloatingNotification
          id="form-settings-notification"
          type={this.state.notificationStatus}
          show={this.state.showNotification}
          callback={() => {
            this.setState({ showNotification: false })
          }}
        >
          {this.state.notificationMessages}
        </FloatingNotification>
      </SysAdminContentWrapper>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    offlineCountryConfiguration: getOfflineData(state)
  }
}

export const FormConfigSettings = connect(mapStateToProps)(
  injectIntl(FormConfigSettingsComponent)
)
