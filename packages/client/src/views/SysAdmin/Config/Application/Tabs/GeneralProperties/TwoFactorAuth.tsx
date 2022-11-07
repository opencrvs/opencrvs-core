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

export function TwoFactorAuth() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const [enabled, setEnabled] = React.useState(
    offlineCountryConfiguration.config.TWO_FACTOR_AUTHENTICATION_ENABLED
  )

  React.useEffect(() => {
    setEnabled(
      offlineCountryConfiguration.config.TWO_FACTOR_AUTHENTICATION_ENABLED
    )
  }, [offlineCountryConfiguration.config.TWO_FACTOR_AUTHENTICATION_ENABLED])

  const [showModal, setShowModal] = React.useState(false)
  const toggleModal = () => {
    setShowModal((prev) => !prev)
    setEnabled(
      offlineCountryConfiguration.config.TWO_FACTOR_AUTHENTICATION_ENABLED
    )
  }
  const [notificationStatus, setNotificationStatus] =
    React.useState<NOTIFICATION_STATUS>(NOTIFICATION_STATUS.IDLE)

  async function application2FAMutationHandler() {
    toggleModal()
    try {
      await callApplicationConfigMutation(
        GeneralActionId.TWO_FACTOR_AUTHENTICATION_ENABLED,
        {
          ...offlineCountryConfiguration.config,
          TWO_FACTOR_AUTHENTICATION_ENABLED: enabled
        },
        dispatch,
        setNotificationStatus
      )
    } catch {
      setNotificationStatus(NOTIFICATION_STATUS.ERROR)
    }
  }
  const id = GeneralActionId.TWO_FACTOR_AUTHENTICATION_ENABLED

  return (
    <>
      <ListViewItemSimplified
        key={id}
        label={
          <Label id={`${id}_label`}>
            {intl.formatMessage(messages.twoFactorLabel)}
          </Label>
        }
        value={
          <Value id={`${id}_value`}>
            {enabled
              ? intl.formatMessage(messages.enabledMessage)
              : intl.formatMessage(messages.disabledMessage)}
          </Value>
        }
        actions={
          <LinkButton id={id} onClick={toggleModal}>
            {intl.formatMessage(buttonMessages.change)}
          </LinkButton>
        }
      />

      <ResponsiveModal
        id={`${id}Modal`}
        title={intl.formatMessage(messages.twoFactorLabel)}
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
              application2FAMutationHandler()
            }}
          >
            {intl.formatMessage(buttonMessages.apply)}
          </ApplyButton>
        ]}
        handleClose={toggleModal}
      >
        <Message>
          {intl.formatMessage(messages.application2FAChangeMessage)}
        </Message>
        <Content>
          <Field>
            <InputField id="application2FA" touched={true} required={false}>
              <Select
                id="select2FA"
                isDisabled={false}
                onChange={(val: string) => {
                  setEnabled(val === 'true')
                }}
                value={enabled?.toString() || 'false'}
                options={[
                  { label: 'Enabled', value: 'true' },
                  { label: 'Disabled', value: 'false' }
                ]}
              />
            </InputField>
          </Field>
        </Content>
      </ResponsiveModal>

      <FloatingNotification
        id="2FANotification"
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
          ? intl.formatMessage(messages.application2FAChangeNotification)
          : intl.formatMessage(messages.applicationConfigChangeError)}
      </FloatingNotification>
    </>
  )
}
