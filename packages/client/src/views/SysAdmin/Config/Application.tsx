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
import {
  injectIntl,
  IntlShape,
  WrappedComponentProps as IntlShapeProps
} from 'react-intl'
import { connect } from 'react-redux'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { DataSection } from '@opencrvs/components/lib/interface'
import { Content } from '@opencrvs/components/lib/interface/Content'
import { messages } from '@client/i18n/messages/views/config'
import moment from 'moment'

type Props = IntlShapeProps & {
  userDetails: IUserDetails | null
  offlineResources: IOfflineData
  offlineCountryConfiguration: IOfflineData
}
interface State {
  activeTabId: string
}

export enum TabName {
  GENERAL = 'generalTab',
  BIRTH = 'birthTab',
  DEATH = 'deathTab'
}

const millisecondsToMinutes = (ms: number): string => {
  const duration = moment.duration(ms, 'milliseconds')
  const minutes = Math.floor(duration.asMinutes())
  return `${minutes} minutes`
}

function PhoneNumberDetails({
  pattern,
  example
}: {
  pattern: RegExp
  example?: string
}) {
  return (
    <>
      <p>
        <span>pattern: {pattern}</span>
      </p>
      <p>
        <span>example: {example}</span>
      </p>
    </>
  )
}

function GeneralTabContent({
  offlineCountryConfiguration,
  intl
}: {
  offlineCountryConfiguration: IOfflineData
  intl?: IntlShape
}) {
  return (
    <DataSection
      title={''}
      items={[
        {
          label: 'Name of application',
          value: 'Farajaland CRVS',
          action: { label: 'Change' }
        },
        {
          label: 'Goverment logo',
          value: (
            <img
              src={offlineCountryConfiguration.assets.logo}
              width={
                offlineCountryConfiguration.config.COUNTRY_LOGO_RENDER_HEIGHT
              }
              height={
                offlineCountryConfiguration.config.COUNTRY_LOGO_RENDER_WIDTH
              }
            />
          ),
          action: { label: 'Change' }
        },
        {
          label: 'User timeout',
          value: millisecondsToMinutes(
            offlineCountryConfiguration.config.DESKTOP_TIME_OUT_MILLISECONDS
          ),
          action: { label: 'Change' }
        },
        {
          label: 'Currency',
          value: '',
          action: { label: 'Change' }
        },
        {
          label: 'Phone number',
          value: (
            <PhoneNumberDetails
              pattern={
                offlineCountryConfiguration.config.PHONE_NUMBER_PATTERN.pattern
              }
              example={
                offlineCountryConfiguration.config.PHONE_NUMBER_PATTERN.example
              }
            />
          ),
          action: { label: 'Change' }
        },
        {
          label: 'Logrocket',
          value: offlineCountryConfiguration.config.LOGROCKET,
          action: { label: 'Change' }
        },
        {
          label: 'Sentry',
          value: offlineCountryConfiguration.config.SENTRY,
          action: { label: 'Change' }
        }
      ]}
    />
  )
}

function BirthTabContent({
  offlineCountryConfiguration,
  intl
}: {
  offlineCountryConfiguration: IOfflineData
  intl?: IntlShape
}) {
  return (
    <DataSection
      title={''}
      items={[
        {
          label: 'Legally specified',
          value: 'Within 30 days',
          action: { label: 'Change' }
        },
        {
          label: 'Late registration',
          value: 'Between 30 days and 365 days',
          action: { label: 'Change' }
        },
        {
          label: 'Delayed registration',
          value: 'After 365 days',
          action: { label: 'Change' }
        },
        {
          label: 'Within legally specified time',
          value: '',
          action: { label: 'Change' }
        },
        {
          label: 'Late registration ',
          value: '',
          action: { label: 'Change' }
        },
        {
          label: 'Delayed registration',
          value: '',
          action: { label: 'Change' }
        }
      ]}
    />
  )
}

function DeathTabContent({
  offlineCountryConfiguration,
  intl
}: {
  offlineCountryConfiguration: IOfflineData
  intl?: IntlShape
}) {
  return (
    <DataSection
      title={''}
      items={[
        {
          label: 'Legally specified',
          value: 'Within 30 days',
          action: { label: 'Change' }
        },
        {
          label: 'Delayed registration',
          value: 'After 30 days',
          action: { label: 'Change' }
        },
        {
          label: 'Late registration ',
          value: '',
          action: { label: 'Change' }
        },
        {
          label: 'Delayed registration',
          value: '',
          action: { label: 'Change' }
        }
      ]}
    />
  )
}

class ApplicationConfigComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      activeTabId: TabName.GENERAL
    }
    this.changeTab = this.changeTab.bind(this)
  }

  changeTab(id: string) {
    this.setState({ activeTabId: id })
  }

  render() {
    const { intl, offlineCountryConfiguration } = this.props
    return (
      <SysAdminContentWrapper isCertificatesConfigPage={true}>
        <Content
          title={intl.formatMessage(messages.applicationTitle)}
          titleColor={'copy'}
          tabs={{
            sections: [
              {
                id: 'generalTab',
                title: TabName.GENERAL
              },
              {
                id: 'birthTab',
                title: TabName.BIRTH
              },
              { id: 'deathTab', title: TabName.DEATH }
            ],
            activeTabId: this.state.activeTabId,
            onTabClick: (id: string) => this.changeTab(id)
          }}
        >
          {this.state.activeTabId &&
            this.state.activeTabId === TabName.GENERAL && (
              <GeneralTabContent
                offlineCountryConfiguration={offlineCountryConfiguration}
                intl={intl}
              />
            )}
          {this.state.activeTabId &&
            this.state.activeTabId === TabName.BIRTH && (
              <BirthTabContent
                offlineCountryConfiguration={offlineCountryConfiguration}
                intl={intl}
              />
            )}
          {this.state.activeTabId &&
            this.state.activeTabId === TabName.DEATH && (
              <DeathTabContent
                offlineCountryConfiguration={offlineCountryConfiguration}
                intl={intl}
              />
            )}
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
