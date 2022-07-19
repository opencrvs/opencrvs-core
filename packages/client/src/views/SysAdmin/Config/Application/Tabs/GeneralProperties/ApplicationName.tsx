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
  HalfWidthInput,
  Label,
  Message,
  Value
} from '@client/views/SysAdmin/Config/Application/Components'
import { InputField } from '@opencrvs/components/lib/forms'
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
import { callApplicationConfigMutation } from '@client/views/SysAdmin/Config/Application/utils'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { isString } from 'lodash'

export function ApplicationName() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const [applicationName, setApplicationName] = React.useState(
    offlineCountryConfiguration.config.APPLICATION_NAME
  )
  const [isValueUpdating, setIsValueUpdating] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const toggleModal = () => setShowModal((prev) => !prev)
  const handleApplicationName = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    setApplicationName(value)
  }
  const [notificationStatus, setNotificationStatus] = React.useState<
    'idle' | 'success' | 'error'
  >('idle')

  async function applicationNameMutationHandler() {
    try {
      await callApplicationConfigMutation(
        GeneralActionId.APPLICATION_NAME,
        {
          ...offlineCountryConfiguration.config,
          APPLICATION_NAME: applicationName
        },
        offlineCountryConfiguration,
        dispatch,
        setIsValueUpdating
      )
      setNotificationStatus('success')
    } catch {
      setNotificationStatus('error')
    } finally {
      toggleModal()
    }
  }
  const id = GeneralActionId.APPLICATION_NAME
  return (
    <>
      <ListViewItemSimplified
        key={id}
        label={
          <Label id={`${id}_label`}>
            {intl.formatMessage(messages.applicationNameLabel)}
          </Label>
        }
        value={
          <Value id={`${id}_value`}>
            {offlineCountryConfiguration.config.APPLICATION_NAME}
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
        title={intl.formatMessage(messages.applicationNameLabel)}
        autoHeight={true}
        titleHeightAuto={true}
        show={showModal}
        actions={[
          <CancelButton key="cancel" id="modal_cancel" onClick={toggleModal}>
            {intl.formatMessage(buttonMessages.cancel)}
          </CancelButton>,
          <ApplyButton
            key="apply"
            id="apply_change"
            disabled={!Boolean(applicationName)}
            onClick={() => {
              applicationNameMutationHandler()
            }}
          >
            {intl.formatMessage(buttonMessages.apply)}
          </ApplyButton>
        ]}
        handleClose={toggleModal}
      >
        <Message>
          {intl.formatMessage(messages.applicationNameChangeMessage)}
        </Message>
        <Content>
          <Field>
            <InputField id="applicationName" touched={true} required={false}>
              <HalfWidthInput
                id="applicationName"
                type="text"
                error={false}
                value={applicationName}
                onChange={handleApplicationName}
              />
            </InputField>
          </Field>
        </Content>
      </ResponsiveModal>

      <FloatingNotification
        id="appNamenotification"
        type={
          notificationStatus === 'success'
            ? NOTIFICATION_TYPE.SUCCESS
            : NOTIFICATION_TYPE.ERROR
        }
        show={notificationStatus !== 'idle'}
        callback={() => {
          setNotificationStatus('idle')
        }}
      >
        {notificationStatus === 'success'
          ? intl.formatMessage(messages.applicationNameChangeNotification)
          : intl.formatMessage(messages.applicationConfigChangeError)}
      </FloatingNotification>
    </>
  )
}
