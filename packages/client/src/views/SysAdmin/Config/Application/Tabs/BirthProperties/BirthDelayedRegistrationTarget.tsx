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
import { InputField } from '@opencrvs/components/lib/InputField'
import { IStoreState } from '@client/store'
import { ListViewItemSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import { Toast } from '@opencrvs/components/lib/Toast'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
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

export function BirthDelayedRegistrationTarget() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const [showModal, setShowModal] = React.useState(false)
  const toggleModal = () => {
    setShowModal((prev) => !prev)
    setBirthLateRegistrationTarget(
      String(offlineCountryConfiguration.config.BIRTH.LATE_REGISTRATION_TARGET)
    )
  }
  const [notificationStatus, setNotificationStatus] =
    React.useState<NOTIFICATION_STATUS>(NOTIFICATION_STATUS.IDLE)
  const birthRegistrationTarget =
    offlineCountryConfiguration.config.BIRTH.REGISTRATION_TARGET
  const [birthLateRegistrationTarget, setBirthLateRegistrationTarget] =
    React.useState(
      String(offlineCountryConfiguration.config.BIRTH.LATE_REGISTRATION_TARGET)
    )

  const handleBirthLateRegistrationTarget = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = String(event.target.value)
    if ((!value.includes('.') && /^\d+$/.test(value)) || !value) {
      setBirthLateRegistrationTarget(value)
    }
  }

  async function lateBirthRegTargetMutationHandler() {
    toggleModal()
    try {
      await callApplicationConfigMutation(
        BirthActionId.BIRTH_LATE_REGISTRATION_TARGET,
        {
          ...offlineCountryConfiguration.config,
          BIRTH: {
            REGISTRATION_TARGET:
              offlineCountryConfiguration.config.BIRTH.REGISTRATION_TARGET,
            LATE_REGISTRATION_TARGET: parseInt(birthLateRegistrationTarget),
            FEE: {
              ON_TIME: offlineCountryConfiguration.config.BIRTH.FEE.ON_TIME,
              LATE: offlineCountryConfiguration.config.BIRTH.FEE.LATE,
              DELAYED: offlineCountryConfiguration.config.BIRTH.FEE.DELAYED
            },
            PRINT_IN_ADVANCE:
              offlineCountryConfiguration.config.BIRTH.PRINT_IN_ADVANCE
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
    label: intl.formatMessage(messages.delayedRegistrationLabel),
    value: intl.formatMessage(messages.delayedRegistrationValue, {
      lateTime:
        offlineCountryConfiguration.config.BIRTH.LATE_REGISTRATION_TARGET
    }),
    action: {
      id: BirthActionId.BIRTH_LATE_REGISTRATION_TARGET,
      label: intl.formatMessage(buttonMessages.change)
    }
  }
  const id = BirthActionId.BIRTH_LATE_REGISTRATION_TARGET

  return (
    <>
      <ListViewItemSimplified
        label={<Label id={`${id}_label`}>{item.label}</Label>}
        value={<Value id={`${id}_value`}>{item.value}</Value>}
        actions={
          <LinkButton id={item.action.id} onClick={toggleModal}>
            {item.action?.label}
          </LinkButton>
        }
      />
      {showModal && (
        <ResponsiveModal
          id={`${id}Modal`}
          title={intl.formatMessage(messages.birthDelayedDialogTitle)}
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
                Number(birthLateRegistrationTarget) <
                  Number(birthRegistrationTarget) + 2 ||
                notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
              }
              onClick={() => {
                lateBirthRegTargetMutationHandler()
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
                id="applicationBirthLateRegTarget"
                touched={true}
                required={false}
              >
                <InputContainer>
                  <SmallWidthInput
                    id="applicationBirthLateRegTarget"
                    type="text"
                    error={false}
                    defaultValue={
                      offlineCountryConfiguration.config.BIRTH
                        .LATE_REGISTRATION_TARGET
                    }
                    onChange={handleBirthLateRegistrationTarget}
                  />
                  <span>
                    {intl.formatMessage(messages.eventTargetInputLabel)}
                  </span>
                </InputContainer>
              </InputField>
            </Field>
          </Content>
        </ResponsiveModal>
      )}

      {notificationStatus !== NOTIFICATION_STATUS.IDLE && (
        <Toast
          id={`${id}_notification`}
          type={
            notificationStatus === NOTIFICATION_STATUS.SUCCESS
              ? 'success'
              : notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
              ? 'loading'
              : 'warning'
          }
          onClose={() => {
            setNotificationStatus(NOTIFICATION_STATUS.IDLE)
          }}
        >
          {notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
            ? intl.formatMessage(messages.applicationConfigUpdatingMessage)
            : notificationStatus === NOTIFICATION_STATUS.SUCCESS
            ? intl.formatMessage(
                messages.applicationBirthLateRegTargetChangeNotification
              )
            : intl.formatMessage(messages.applicationConfigChangeError)}
        </Toast>
      )}
    </>
  )
}
