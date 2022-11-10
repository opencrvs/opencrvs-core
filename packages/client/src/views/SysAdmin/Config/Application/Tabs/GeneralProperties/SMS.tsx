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
import { useDispatch, useSelector } from 'react-redux'
import {
  ApplyButton,
  CancelButton,
  Content,
  Field,
  Label,
  Message,
  Value
} from '@client/views/SysAdmin/Config/Application/Components'
import { InputField, Select } from '@opencrvs/components/lib/forms'
import { IStoreState } from '@client/store'
import {
  FloatingNotification,
  ListViewItemSimplified,
  NOTIFICATION_TYPE,
  ResponsiveModal
} from '@opencrvs/components/lib/interface'
import { GeneralActionId } from '@client/views/SysAdmin/Config/Application'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/config'
import { buttonMessages } from '@client/i18n/messages'
import { getOfflineData } from '@client/offline/selectors'
import {
  callApplicationConfigMutation,
  NOTIFICATION_STATUS
} from '@client/views/SysAdmin/Config/Application/utils'
import { LinkButton } from '@opencrvs/components/lib/buttons'

export function SMS() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const [settings, setSettings] = React.useState({
    SMS_USERNAME_REMINDER_ENABLED:
      offlineCountryConfiguration.config.SMS_USERNAME_REMINDER_ENABLED,
    SMS_EVENT_NOTIFICATIONS_ENABLED:
      offlineCountryConfiguration.config.SMS_EVENT_NOTIFICATIONS_ENABLED,
    SMS_USER_MANAGEMENT_NOTIFICATIONS_ENABLED:
      offlineCountryConfiguration.config
        .SMS_USER_MANAGEMENT_NOTIFICATIONS_ENABLED
  })

  React.useEffect(() => {
    setSettings({
      SMS_USERNAME_REMINDER_ENABLED:
        offlineCountryConfiguration.config.SMS_USERNAME_REMINDER_ENABLED,
      SMS_EVENT_NOTIFICATIONS_ENABLED:
        offlineCountryConfiguration.config.SMS_EVENT_NOTIFICATIONS_ENABLED,
      SMS_USER_MANAGEMENT_NOTIFICATIONS_ENABLED:
        offlineCountryConfiguration.config
          .SMS_USER_MANAGEMENT_NOTIFICATIONS_ENABLED
    })
  }, [offlineCountryConfiguration.config])

  const [showModal, setShowModal] = React.useState(false)
  const toggleModal = () => {
    setShowModal((prev) => !prev)
    setSettings({
      SMS_USERNAME_REMINDER_ENABLED:
        offlineCountryConfiguration.config.SMS_USERNAME_REMINDER_ENABLED,
      SMS_EVENT_NOTIFICATIONS_ENABLED:
        offlineCountryConfiguration.config.SMS_EVENT_NOTIFICATIONS_ENABLED,
      SMS_USER_MANAGEMENT_NOTIFICATIONS_ENABLED:
        offlineCountryConfiguration.config
          .SMS_USER_MANAGEMENT_NOTIFICATIONS_ENABLED
    })
  }
  const [notificationStatus, setNotificationStatus] =
    React.useState<NOTIFICATION_STATUS>(NOTIFICATION_STATUS.IDLE)

  async function applicationSMSMutationHandler() {
    toggleModal()
    try {
      for (const key of [
        GeneralActionId.SMS_EVENT_NOTIFICATIONS_ENABLED,
        GeneralActionId.SMS_USERNAME_REMINDER_ENABLED,
        GeneralActionId.SMS_USER_MANAGEMENT_NOTIFICATIONS_ENABLED
      ]) {
        await callApplicationConfigMutation(
          key,
          {
            ...offlineCountryConfiguration.config,
            ...settings
          },
          dispatch,
          setNotificationStatus
        )
      }
    } catch {
      setNotificationStatus(NOTIFICATION_STATUS.ERROR)
    }
  }
  const id = 'SMS_SETTINGS'

  return (
    <>
      <ListViewItemSimplified
        key={id}
        label={
          <Label id={`${id}_label`}>
            {intl.formatMessage(messages.smsLabel)}
          </Label>
        }
        value={<Value id={`${id}_value`}></Value>}
        actions={
          <LinkButton id={id} onClick={toggleModal}>
            {intl.formatMessage(buttonMessages.change)}
          </LinkButton>
        }
      />

      <ResponsiveModal
        id={`${id}Modal`}
        title={intl.formatMessage(messages.smsLabel)}
        autoHeight={true}
        titleHeightAuto={true}
        show={showModal}
        contentScrollableY
        actions={[
          <CancelButton key="cancel" id="modal_cancel" onClick={toggleModal}>
            {intl.formatMessage(buttonMessages.cancel)}
          </CancelButton>,
          <ApplyButton
            key="apply"
            id="apply_change"
            disabled={notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS}
            onClick={() => {
              applicationSMSMutationHandler()
            }}
          >
            {intl.formatMessage(buttonMessages.apply)}
          </ApplyButton>
        ]}
        handleClose={toggleModal}
      >
        <Content>
          <div>
            <Field>
              <InputField
                label="Username reminders"
                id="username_reminders"
                description={intl.formatMessage(
                  messages.smsUsernameDescription
                )}
                touched={true}
                required={false}
              >
                <Select
                  isDisabled={false}
                  onChange={(val: string) => {
                    setSettings((settings) => ({
                      ...settings,
                      SMS_USERNAME_REMINDER_ENABLED: val === 'true'
                    }))
                  }}
                  value={
                    settings.SMS_USERNAME_REMINDER_ENABLED?.toString() ||
                    'false'
                  }
                  options={[
                    {
                      label: intl.formatMessage(messages.enabledMessage),
                      value: 'true'
                    },
                    {
                      label: intl.formatMessage(messages.disabledMessage),
                      value: 'false'
                    }
                  ]}
                />
              </InputField>
            </Field>
            <Field>
              <InputField
                label="Event notifications"
                id="event_notifications"
                description={intl.formatMessage(
                  messages.smsEventNotificationsDescription
                )}
                touched={true}
                required={false}
              >
                <Select
                  isDisabled={false}
                  onChange={(val: string) => {
                    setSettings((settings) => ({
                      ...settings,
                      SMS_EVENT_NOTIFICATIONS_ENABLED: val === 'true'
                    }))
                  }}
                  value={
                    settings.SMS_EVENT_NOTIFICATIONS_ENABLED?.toString() ||
                    'false'
                  }
                  options={[
                    {
                      label: intl.formatMessage(messages.enabledMessage),
                      value: 'true'
                    },
                    {
                      label: intl.formatMessage(messages.disabledMessage),
                      value: 'false'
                    }
                  ]}
                />
              </InputField>
            </Field>
            <Field>
              <InputField
                label="User management"
                id="user_management"
                description={intl.formatMessage(
                  messages.smsUserManagementDescription
                )}
                touched={true}
                required={false}
              >
                <Select
                  isDisabled={false}
                  onChange={(val: string) => {
                    setSettings((settings) => ({
                      ...settings,
                      SMS_USER_MANAGEMENT_NOTIFICATIONS_ENABLED: val === 'true'
                    }))
                  }}
                  value={
                    settings.SMS_USER_MANAGEMENT_NOTIFICATIONS_ENABLED?.toString() ||
                    'false'
                  }
                  options={[
                    {
                      label: intl.formatMessage(messages.enabledMessage),
                      value: 'true'
                    },
                    {
                      label: intl.formatMessage(messages.disabledMessage),
                      value: 'false'
                    }
                  ]}
                />
              </InputField>
            </Field>
          </div>
        </Content>
      </ResponsiveModal>

      <FloatingNotification
        type={
          notificationStatus === NOTIFICATION_STATUS.SUCCESS
            ? NOTIFICATION_TYPE.SUCCESS
            : notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
            ? NOTIFICATION_TYPE.IN_PROGRESS
            : NOTIFICATION_TYPE.ERROR
        }
        show={notificationStatus !== NOTIFICATION_STATUS.IDLE}
        callback={() => {
          setNotificationStatus(NOTIFICATION_STATUS.IDLE)
        }}
      >
        {notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
          ? intl.formatMessage(messages.applicationConfigUpdatingMessage)
          : notificationStatus === NOTIFICATION_STATUS.SUCCESS
          ? intl.formatMessage(messages.applicationSMSChangeNotification)
          : intl.formatMessage(messages.applicationConfigChangeError)}
      </FloatingNotification>
    </>
  )
}
