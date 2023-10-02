/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import React from 'react'
import { FormTabs } from '@opencrvs/components/lib/FormTabs'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { Content } from '@opencrvs/components/lib/Content'
import { messages } from '@client/i18n/messages/views/config'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { GET_INFORMANT_SMS_NOTIFICATIONS } from './queries'
import { Label } from '@client/views/SysAdmin/Config/Application/Components'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import { useOnlineStatus } from '@client/utils'
import { Toggle } from '@opencrvs/components/lib/Toggle'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import {
  Event,
  GetInformantSmsNotificationsQuery,
  SmsNotification,
  SmsNotificationInput,
  ToggleInformantSmsNotificationMutation,
  ToggleInformantSmsNotificationMutationVariables
} from '@client/utils/gateway'
import { find, lowerFirst } from 'lodash'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Navigation } from '@client/components/interface/Navigation'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { Button } from '@opencrvs/components/lib/Button'
import { useMutation, useQuery } from '@apollo/client'
import { TOGGLE_INFORMANT_SMS_NOTIFICATION_MUTATION } from './mutations'
import { NOTIFICATION_STATUS } from '@client/views/SysAdmin/Config/Application/utils'
import { Toast } from '@opencrvs/components/lib/Toast'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { HistoryNavigator } from '@client/components/Header/HistoryNavigator'
import { ProfileMenu } from '@client/components/ProfileMenu'
import { Link } from '@opencrvs/components/lib/Link'

const ToggleWrapper = styled.div`
  margin-left: 24px;
`
const Action = styled.div`
  margin-top: 32px;
`

type SmsNotificationProps = {
  items: SmsNotification[]
}

const NotificationNames = [
  'birthInProgressSMS',
  'birthDeclarationSMS',
  'birthRegistrationSMS',
  'birthRejectionSMS',
  'deathInProgressSMS',
  'deathDeclarationSMS',
  'deathRegistrationSMS',
  'deathRejectionSMS'
] as const

type INotificationName = typeof NotificationNames[number]

type IState = Record<INotificationName, boolean>

const InformantNotification = () => {
  const intl = useIntl()
  const isOnline = useOnlineStatus()
  const { loading, error, data, refetch } =
    useQuery<GetInformantSmsNotificationsQuery>(
      GET_INFORMANT_SMS_NOTIFICATIONS,
      {
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
          if (data && data.informantSMSNotifications) {
            setInformantSMSNotificationState((state) => {
              const modifiedState: IState = { ...state }
              data.informantSMSNotifications?.forEach((notification) => {
                modifiedState[notification.name as INotificationName] =
                  notification.enabled
              })
              return {
                ...state,
                ...modifiedState
              }
            })
          }
        }
      }
    )

  const informantNotificationsData = React.useMemo(() => {
    return data?.informantSMSNotifications ?? []
  }, [data])

  const [informantSMSNotificationState, setInformantSMSNotificationState] =
    React.useState<IState>({
      birthInProgressSMS: true,
      birthDeclarationSMS: true,
      birthRegistrationSMS: true,
      birthRejectionSMS: true,
      deathInProgressSMS: true,
      deathDeclarationSMS: true,
      deathRegistrationSMS: true,
      deathRejectionSMS: true
    })

  const [activeTabId, setActiveTabId] = React.useState(Event.Birth)
  const [notificationStatus, setNotificationStatus] =
    React.useState<NOTIFICATION_STATUS>(NOTIFICATION_STATUS.IDLE)

  const notificationsState = Object.entries(informantSMSNotificationState).map(
    ([name, enabled]) => ({
      name,
      enabled
    })
  )

  const tabSections = [
    {
      id: Event.Birth,
      title: intl.formatMessage(constantsMessages.births)
    },
    {
      id: Event.Death,
      title: intl.formatMessage(constantsMessages.deaths)
    }
  ]

  const toggleOnChange = (notificationName: INotificationName) => {
    setInformantSMSNotificationState({
      ...informantSMSNotificationState,
      [notificationName]: !informantSMSNotificationState[notificationName]
    })
  }

  const isNotificationsChanges = (notificationData: SmsNotification[]) => {
    return !notificationData.every((notification) => {
      const diff = find(notificationsState, {
        name: notification.name,
        enabled: notification.enabled
      })
      return Boolean(diff)
    })
  }

  const [informantSMSNotificationsResult] = useMutation<
    ToggleInformantSmsNotificationMutation,
    ToggleInformantSmsNotificationMutationVariables
  >(TOGGLE_INFORMANT_SMS_NOTIFICATION_MUTATION, {
    onError() {
      setNotificationStatus(NOTIFICATION_STATUS.ERROR)
    },
    async onCompleted() {
      await refetch()
      setNotificationStatus(NOTIFICATION_STATUS.SUCCESS)
    }
  })

  const informantNotificationMutationHandler = async (
    notificationData: SmsNotification[]
  ) => {
    const updatedInformantNotifications = notificationData.map(
      (notification) => {
        return {
          id: notification.id,
          name: notification.name,
          enabled: notificationsState.find(
            (notifState) => notifState.name === notification.name
          )?.enabled
        }
      }
    )

    await informantSMSNotificationsResult({
      variables: {
        smsNotifications:
          updatedInformantNotifications as SmsNotificationInput[]
      }
    })
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
                key={`${item.name}_label`}
                label={
                  <Label id={`${item.name}_label`}>
                    {intl.formatMessage(
                      messages[lowerFirst(item.name.slice(5))]
                    )}
                  </Label>
                }
                actions={
                  <ToggleWrapper>
                    <Toggle
                      id={`${item.name}`}
                      defaultChecked={Boolean(
                        informantSMSNotificationState[
                          item.name as INotificationName
                        ]
                      )}
                      onChange={() => {
                        toggleOnChange(item.name as INotificationName)
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
        header={
          <AppBar
            desktopLeft={<HistoryNavigator />}
            desktopRight={<ProfileMenu key="profileMenu" />}
            mobileLeft={<HistoryNavigator hideForward />}
            mobileTitle={intl.formatMessage(messages.informantNotifications)}
          />
        }
        navigation={<Navigation />}
        skipToContentText={intl.formatMessage(
          constantsMessages.skipToMainContent
        )}
      >
        <Content
          title={intl.formatMessage(messages.informantNotifications)}
          titleColor={'copy'}
          subtitle={intl.formatMessage(messages.informantNotificationSubtitle, {
            communicationType: (
              <strong>
                {window.config.INFORMANT_NOTIFICATION_DELIVERY_METHOD === 'sms'
                  ? 'SMS'
                  : 'Emails'}
              </strong>
            )
          })}
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
          {error && <GenericErrorToast />}
          {loading && <LoadingIndicator loading />}
          {!error && !loading && (
            <>
              <TabContent
                items={informantNotificationsData.filter(({ name }) =>
                  name.includes(activeTabId)
                )}
              />
              <Action>
                <Button
                  id="save"
                  type="primary"
                  onClick={async () => {
                    setNotificationStatus(NOTIFICATION_STATUS.IN_PROGRESS)
                    await informantNotificationMutationHandler(
                      informantNotificationsData
                    )
                  }}
                  disabled={
                    !isOnline ||
                    !isNotificationsChanges(informantNotificationsData) ||
                    notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
                  }
                  loading={
                    notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
                  }
                >
                  {notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
                    ? intl.formatMessage(buttonMessages.saving)
                    : intl.formatMessage(buttonMessages.save)}
                </Button>
              </Action>
            </>
          )}

          {(notificationStatus === NOTIFICATION_STATUS.SUCCESS ||
            notificationStatus === NOTIFICATION_STATUS.ERROR) && (
            <Toast
              id={`informant_notification`}
              type={
                notificationStatus === NOTIFICATION_STATUS.SUCCESS
                  ? 'success'
                  : 'error'
              }
              onClose={() => {
                setNotificationStatus(NOTIFICATION_STATUS.IDLE)
              }}
            >
              {notificationStatus === NOTIFICATION_STATUS.ERROR
                ? intl.formatMessage(messages.applicationConfigChangeError)
                : intl.formatMessage(
                    messages.informantNotificationUpdatingMessage
                  )}
            </Toast>
          )}
        </Content>
      </Frame>
    </>
  )
}

export default InformantNotification
