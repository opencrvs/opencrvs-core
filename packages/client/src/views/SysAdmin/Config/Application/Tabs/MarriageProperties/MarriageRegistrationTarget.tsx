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
import { MarriageActionId } from '@client/views/SysAdmin/Config/Application'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/config'
import { buttonMessages } from '@client/i18n/messages'
import { getOfflineData } from '@client/offline/selectors'
import {
  callApplicationConfigMutation,
  NOTIFICATION_STATUS
} from '@client/views/SysAdmin/Config/Application/utils'
import { LinkButton } from '@opencrvs/components/lib/buttons'

export function MarriageRegistrationTarget() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const [marriageRegistrationTarget, setMarriageRegistrationTarget] =
    React.useState(
      String(offlineCountryConfiguration.config.MARRIAGE.REGISTRATION_TARGET)
    )
  const [showModal, setShowModal] = React.useState(false)
  const toggleModal = () => {
    setShowModal((prev) => !prev)
    setMarriageRegistrationTarget(
      String(offlineCountryConfiguration.config.MARRIAGE.REGISTRATION_TARGET)
    )
  }
  const [notificationStatus, setNotificationStatus] =
    React.useState<NOTIFICATION_STATUS>(NOTIFICATION_STATUS.IDLE)

  const handleMarriageRegistrationTarget = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = String(event.target.value)
    if ((!value.includes('.') && /^\d+$/.test(value)) || !value) {
      setMarriageRegistrationTarget(value)
    }
  }

  async function marriageRegTargetMutationHandler() {
    toggleModal()
    try {
      await callApplicationConfigMutation(
        MarriageActionId.MARRIAGE_REGISTRATION_TARGET,
        {
          ...offlineCountryConfiguration.config,
          MARRIAGE: {
            REGISTRATION_TARGET: parseInt(marriageRegistrationTarget),
            FEE: {
              ON_TIME: offlineCountryConfiguration.config.MARRIAGE.FEE.ON_TIME,
              DELAYED: offlineCountryConfiguration.config.MARRIAGE.FEE.DELAYED
            },
            PRINT_IN_ADVANCE:
              offlineCountryConfiguration.config.MARRIAGE.PRINT_IN_ADVANCE
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
      onTime: offlineCountryConfiguration.config.MARRIAGE.REGISTRATION_TARGET
    }),
    action: {
      id: MarriageActionId.MARRIAGE_REGISTRATION_TARGET,
      label: intl.formatMessage(buttonMessages.change)
    }
  }

  const id = MarriageActionId.MARRIAGE_REGISTRATION_TARGET

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

      <ResponsiveModal
        id={`${id}Modal`}
        title={intl.formatMessage(messages.marriageLegallySpecifiedDialogTitle)}
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
              !Boolean(marriageRegistrationTarget) ||
              notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
            }
            onClick={() => {
              marriageRegTargetMutationHandler()
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
              id="applicationMarriageRegTarget"
              touched={true}
              required={false}
            >
              <InputContainer>
                <SmallWidthInput
                  id="applicationMarriageRegTarget"
                  type="text"
                  error={false}
                  value={marriageRegistrationTarget}
                  onChange={handleMarriageRegistrationTarget}
                />
                <span>
                  {intl.formatMessage(messages.eventTargetInputLabel)}
                </span>
              </InputContainer>
            </InputField>
          </Field>
        </Content>
      </ResponsiveModal>

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
                messages.applicationMarriageRegTargetChangeNotification
              )
            : intl.formatMessage(messages.applicationConfigChangeError)}
        </Toast>
      )}
    </>
  )
}
