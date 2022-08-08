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
  InputContainer,
  Label,
  SmallWidthInput,
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
import { BirthActionId } from '@client/views/SysAdmin/Config/Application'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/config'
import { buttonMessages } from '@client/i18n/messages'
import { getOfflineData } from '@client/offline/selectors'
import {
  callApplicationConfigMutation,
  NOTIFICATION_STATUS
} from '@client/views/SysAdmin/Config/Application/utils'
import { LinkButton } from '@opencrvs/components/lib/buttons'

export function BirthRegistrationTarget() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const birthLateRegistrationTarget =
    offlineCountryConfiguration.config.BIRTH.LATE_REGISTRATION_TARGET
  const [birthRegistrationTarget, setBirthRegistrationTarget] = React.useState(
    String(offlineCountryConfiguration.config.BIRTH.REGISTRATION_TARGET)
  )
  const [showModal, setShowModal] = React.useState(false)
  const toggleModal = () => {
    setShowModal((prev) => !prev)
    setBirthRegistrationTarget(
      String(offlineCountryConfiguration.config.BIRTH.REGISTRATION_TARGET)
    )
  }
  const [notificationStatus, setNotificationStatus] =
    React.useState<NOTIFICATION_STATUS>(NOTIFICATION_STATUS.IDLE)

  const handleBirthRegistrationTarget = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = String(event.target.value)
    if ((!value.includes('.') && /^\d+$/.test(value)) || !value) {
      setBirthRegistrationTarget(value)
    }
  }

  async function birthRegTargetMutationHandler() {
    toggleModal()
    try {
      await callApplicationConfigMutation(
        BirthActionId.BIRTH_REGISTRATION_TARGET,
        {
          ...offlineCountryConfiguration.config,
          BIRTH: {
            REGISTRATION_TARGET: parseInt(birthRegistrationTarget),
            LATE_REGISTRATION_TARGET:
              Number(birthRegistrationTarget) > birthLateRegistrationTarget
                ? Number(birthRegistrationTarget) + 2
                : birthLateRegistrationTarget,
            FEE: {
              ON_TIME: offlineCountryConfiguration.config.BIRTH.FEE.ON_TIME,
              LATE: offlineCountryConfiguration.config.BIRTH.FEE.LATE,
              DELAYED: offlineCountryConfiguration.config.BIRTH.FEE.DELAYED
            }
          }
        },
        dispatch,
        setNotificationStatus
      )
    } catch {
      setNotificationStatus(NOTIFICATION_STATUS.ERROR)
    }
  }
  const item = {
    label: intl.formatMessage(messages.legallySpecifiedLabel),
    value: intl.formatMessage(messages.legallySpecifiedValue, {
      onTime: offlineCountryConfiguration.config.BIRTH.REGISTRATION_TARGET
    }),
    action: {
      id: BirthActionId.BIRTH_REGISTRATION_TARGET,
      label: intl.formatMessage(buttonMessages.change),
      disabled: false
    }
  }
  const id = BirthActionId.BIRTH_REGISTRATION_TARGET

  return (
    <>
      <ListViewItemSimplified
        label={<Label id={`${id}_label`}>{item.label}</Label>}
        value={<Value id={`${id}_value`}>{item.value}</Value>}
        actions={
          <LinkButton
            id={item.action.id}
            disabled={item.action.disabled}
            onClick={toggleModal}
          >
            {item.action?.label}
          </LinkButton>
        }
      />

      <ResponsiveModal
        id={`${id}Modal`}
        title={intl.formatMessage(messages.birthLegallySpecifiedDialogTitle)}
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
            disabled={
              !Boolean(birthRegistrationTarget) ||
              notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
            }
            onClick={() => {
              birthRegTargetMutationHandler()
            }}
          >
            {intl.formatMessage(buttonMessages.apply)}
          </ApplyButton>
        ]}
        handleClose={toggleModal}
      >
        <Content>
          <Field>
            <InputField
              id="applicationBirthRegTarget"
              touched={true}
              required={false}
            >
              <InputContainer>
                <SmallWidthInput
                  id="applicationBirthRegTarget"
                  type="text"
                  error={false}
                  value={birthRegistrationTarget}
                  onChange={handleBirthRegistrationTarget}
                />
                <span>
                  {intl.formatMessage(messages.eventTargetInputLabel)}
                </span>
              </InputContainer>
            </InputField>
          </Field>
        </Content>
      </ResponsiveModal>

      <FloatingNotification
        id="birthRegTargetnotification"
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
          ? intl.formatMessage(
              messages.applicationBirthRegTargetChangeNotification
            )
          : intl.formatMessage(messages.applicationConfigChangeError)}
      </FloatingNotification>
    </>
  )
}
