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
import React from 'react'
import { FormTabs } from '@opencrvs/components/lib/FormTabs'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import {
  BodyContent,
  Content,
  ContentSize
} from '@opencrvs/components/lib/Content'
import { messages } from '@client/i18n/messages/views/config'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { Query } from '@client/components/Query'
import { GET_INFORMANT_SMS_NOTIFICATIONS } from './queries'
import {
  Label,
  Value
} from '@client/views/SysAdmin/Config/Application/Components'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import { Toggle } from '@opencrvs/components/lib/Toggle'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import {
  Event,
  GetInformantSmsNotificationsQuery,
  SmsNotification
} from '@client/utils/gateway'
import { lowerFirst } from 'lodash'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Header } from '@client/components/Header/Header'
import { Navigation } from '@client/components/interface/Navigation'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

const ToggleWrapper = styled.div`
  margin-left: 24px;
`
const Action = styled.div`
  margin-top: 32px;
`

type SmsNotificationProps = {
  items: SmsNotification[]
}

enum INotificationName {
  birthInProgressSMS = 'birthInProgressSMS',
  birthDeclarationSMS = 'birthDeclarationSMS',
  birthRegistrationSMS = 'birthRegistrationSMS',
  birthRejectionSMS = 'birthRejectionSMS',
  deathInProgressSMS = 'deathInProgressSMS',
  deathDeclarationSMS = 'deathDeclarationSMS',
  deathRegistrationSMS = 'deathRegistrationSMS',
  deathRejectionSMS = 'deathRejectionSMS'
}

const InformantNotification = () => {
  const intl = useIntl()
  const [birthInProgressSMS, setBirthInProgressSMS] = React.useState(true)
  const [birthDeclarationSMS, setBirthDeclarationSMS] = React.useState(true)
  const [birthRegistrationSMS, setBirthRegistrationSMS] = React.useState(true)
  const [birthRejectionSMS, setBirthRejectionSMS] = React.useState(true)
  const [deathInProgressSMS, setDeathInProgressSMS] = React.useState(true)
  const [deathDeclarationSMS, setDeathDeclarationSMS] = React.useState(true)
  const [deathRegistrationSMS, setDeathRegistrationSMS] = React.useState(true)
  const [deathRejectionSMS, setDeathRejectionSMS] = React.useState(true)
  const [activeTabId, setActiveTabId] = React.useState(Event.Birth)
  const tabSections = [
    {
      id: Event.Birth,
      title: intl.formatMessage(messages.birthTabTitleExport)
    },
    {
      id: Event.Death,
      title: intl.formatMessage(messages.deathTabTitleExport)
    }
  ]

  const toggleOnChange = (notificationName: string) => {
    if (notificationName === INotificationName.birthInProgressSMS) {
      setBirthInProgressSMS((prev) => !prev)
    } else if (notificationName === INotificationName.birthDeclarationSMS) {
      setBirthDeclarationSMS((prev) => !prev)
    } else if (notificationName === INotificationName.birthRegistrationSMS) {
      setBirthRegistrationSMS((prev) => !prev)
    } else if (notificationName === INotificationName.birthRejectionSMS) {
      setBirthRejectionSMS((prev) => !prev)
    } else if (notificationName === INotificationName.deathInProgressSMS) {
      setDeathInProgressSMS((prev) => !prev)
    } else if (notificationName === INotificationName.deathDeclarationSMS) {
      setDeathDeclarationSMS((prev) => !prev)
    } else if (notificationName === INotificationName.deathRegistrationSMS) {
      setDeathRegistrationSMS((prev) => !prev)
    } else if (notificationName === INotificationName.deathRejectionSMS) {
      setDeathRejectionSMS((prev) => !prev)
    }
  }

  const getDefaultValue = (notificationName: string) => {
    if (notificationName === INotificationName.birthInProgressSMS) {
      return birthInProgressSMS
    } else if (notificationName === INotificationName.birthDeclarationSMS) {
      return birthDeclarationSMS
    } else if (notificationName === INotificationName.birthRegistrationSMS) {
      return birthRegistrationSMS
    } else if (notificationName === INotificationName.birthRejectionSMS) {
      return birthRejectionSMS
    } else if (notificationName === INotificationName.deathInProgressSMS) {
      return deathInProgressSMS
    } else if (notificationName === INotificationName.deathDeclarationSMS) {
      return deathDeclarationSMS
    } else if (notificationName === INotificationName.deathRegistrationSMS) {
      return deathRegistrationSMS
    } else if (notificationName === INotificationName.deathRejectionSMS) {
      return deathRejectionSMS
    }
  }

  const TabContent = (props: SmsNotificationProps) => {
    const intl = useIntl()
    const items: SmsNotification[] = props.items
    return (
      <>
        <ListViewSimplified key={`listViewSimplified`}>
          {items.map((item: SmsNotification) => {
            return (
              <ListViewItemSimplified
                label={
                  <Label id={`${item.name}_label`}>
                    {intl.formatMessage(
                      messages[lowerFirst(item.name.slice(5))]
                    )}
                  </Label>
                }
                value={<Value id={`${item.name}_value`}>{item.message}</Value>}
                actions={
                  <ToggleWrapper>
                    <Toggle
                      id={`${item.name}`}
                      defaultChecked={getDefaultValue(item.name)}
                      onChange={() => {
                        toggleOnChange(item.name)
                      }}
                    />
                  </ToggleWrapper>
                }
              />
            )
          })}
        </ListViewSimplified>
      </>
    )
  }

  return (
    <>
      <Frame
        header={<Header mobileSearchBar={true} enableMenuSelection={false} />}
        navigation={<Navigation />}
        skipToContentText={intl.formatMessage(
          constantsMessages.skipToMainContent
        )}
      >
        <Content
          title={intl.formatMessage(messages.informantNotifications)}
          titleColor={'copy'}
          subtitle={intl.formatMessage(messages.informantNotificationSubtitle)}
          tabBarContent={
            <FormTabs
              sections={tabSections}
              activeTabId={activeTabId}
              onTabClick={(id: React.SetStateAction<Event>) =>
                setActiveTabId(id)
              }
            />
          }
        >
          <Query<GetInformantSmsNotificationsQuery>
            query={GET_INFORMANT_SMS_NOTIFICATIONS}
            fetchPolicy={'no-cache'}
          >
            {({ data, loading, error }) => {
              if (error) {
                return <GenericErrorToast />
              } else if (loading) {
                return (
                  <>
                    <LoadingIndicator loading />
                  </>
                )
              } else {
                const notificatrions = data?.informantSMSNotifications ?? []
                return (
                  <TabContent
                    items={notificatrions.filter(({ name }) =>
                      name.includes(activeTabId)
                    )}
                  />
                )
              }
            }}
          </Query>
          <Action>
            <PrimaryButton
              id="confirm_form"
              onClick={() => {
                alert('saved!')
              }}
              disabled={false}
            >
              {intl.formatMessage(buttonMessages.save)}
            </PrimaryButton>
          </Action>
        </Content>
      </Frame>
    </>
  )
}

export default InformantNotification
