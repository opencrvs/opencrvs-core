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
  HalfWidthInput,
  InputContainer,
  Label,
  Value
} from '@client/views/SysAdmin/Config/Application/Components'
import { InputField } from '@opencrvs/components/lib/InputField'
import { IStoreState } from '@client/store'
import { ListViewItemSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import { Toast } from '@opencrvs/components/lib/Toast'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { DeathActionId } from '@client/views/SysAdmin/Config/Application'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/config'
import { buttonMessages } from '@client/i18n/messages'
import { getOfflineData } from '@client/offline/selectors'
import {
  callApplicationConfigMutation,
  getCurrencySymbol,
  getFormattedFee,
  NOTIFICATION_STATUS
} from '@client/views/SysAdmin/Config/Application/utils'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { Currency } from '@opencrvs/components/lib/Currency'

export function DeathFeeOnTime() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const [deathOnTimeFee, setDeathOnTimeFee] = React.useState(
    offlineCountryConfiguration.config.DEATH.FEE.ON_TIME.toLocaleString()
  )
  const [showModal, setShowModal] = React.useState(false)
  const toggleModal = () => {
    setShowModal((prev) => !prev)
    setDeathOnTimeFee(
      offlineCountryConfiguration.config.DEATH.FEE.ON_TIME.toLocaleString()
    )
  }
  const [notificationStatus, setNotificationStatus] =
    React.useState<NOTIFICATION_STATUS>(NOTIFICATION_STATUS.IDLE)
  const handleDeathOnTimeFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = String(event.target.value)
    setDeathOnTimeFee(getFormattedFee(value))
  }

  async function deathFeeOnTimeMutationHandler() {
    toggleModal()
    try {
      await callApplicationConfigMutation(
        DeathActionId.DEATH_ON_TIME_FEE,
        {
          ...offlineCountryConfiguration.config,
          DEATH: {
            REGISTRATION_TARGET:
              offlineCountryConfiguration.config.DEATH.REGISTRATION_TARGET,
            FEE: {
              ON_TIME: parseFloat(deathOnTimeFee.replace(/,/g, '')),
              DELAYED: offlineCountryConfiguration.config.DEATH.FEE.DELAYED
            },
            PRINT_IN_ADVANCE:
              offlineCountryConfiguration.config.DEATH.PRINT_IN_ADVANCE
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
    label: intl.formatMessage(messages.withinLegallySpecifiedTimeLabel),
    value: (
      <Currency
        value={offlineCountryConfiguration.config.DEATH.FEE.ON_TIME}
        currency={offlineCountryConfiguration.config.CURRENCY.isoCode}
        languagesAndCountry={
          offlineCountryConfiguration.config.CURRENCY.languagesAndCountry[0]
        }
      />
    ),
    action: {
      id: DeathActionId.DEATH_ON_TIME_FEE,
      label: intl.formatMessage(buttonMessages.change)
    }
  }
  const id = DeathActionId.DEATH_ON_TIME_FEE

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
        title={intl.formatMessage(messages.onTimeFeeDialogTitle)}
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
              !Boolean(deathOnTimeFee) ||
              notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
            }
            onClick={() => {
              deathFeeOnTimeMutationHandler()
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
              id="applicationDeathOnTimeFee"
              touched={true}
              required={false}
            >
              <InputContainer>
                <span>
                  {getCurrencySymbol(
                    offlineCountryConfiguration.config.CURRENCY
                  )}
                </span>
                <HalfWidthInput
                  id="applicationDeathOnTimeFee"
                  type="text"
                  error={false}
                  value={deathOnTimeFee}
                  onChange={handleDeathOnTimeFee}
                />
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
                messages.applicationDeathOnTimeFeeChangeNotification
              )
            : intl.formatMessage(messages.applicationConfigChangeError)}
        </Toast>
      )}
    </>
  )
}
