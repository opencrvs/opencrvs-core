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
  InputContainer,
  Label,
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
  getCurrency,
  getFormattedFee
} from '@client/views/SysAdmin/Config/Application/utils'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { isString } from 'lodash'
import { FormattedNumberCurrency } from '@opencrvs/components/lib/symbol'

export function BirthDelayedFee() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const [isValueUpdating, setIsValueUpdating] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const toggleModal = () => setShowModal((prev) => !prev)
  const [notificationStatus, setNotificationStatus] = React.useState<
    'idle' | 'success' | 'error'
  >('idle')
  const [birthDelayedFee, setBirthDelayedFee] = React.useState(
    offlineCountryConfiguration.config.BIRTH.FEE.DELAYED.toLocaleString()
  )

  const handleBirthDelayedFee = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = String(event.target.value)
    setBirthDelayedFee(getFormattedFee(value))
  }

  async function birthDelayedFeeMutationHandler() {
    try {
      await callApplicationConfigMutation(
        BirthActionId.BIRTH_LATE_FEE,
        {
          ...offlineCountryConfiguration.config,
          BIRTH: {
            REGISTRATION_TARGET:
              offlineCountryConfiguration.config.BIRTH.REGISTRATION_TARGET,
            LATE_REGISTRATION_TARGET:
              offlineCountryConfiguration.config.BIRTH.LATE_REGISTRATION_TARGET,
            FEE: {
              ON_TIME: offlineCountryConfiguration.config.BIRTH.FEE.LATE,
              LATE: offlineCountryConfiguration.config.BIRTH.FEE.LATE,
              DELAYED: parseFloat(birthDelayedFee.replace(/,/g, ''))
            }
          }
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
  const item = {
    label: intl.formatMessage(messages.delayedRegistrationLabel),
    value: (
      <FormattedNumberCurrency
        value={offlineCountryConfiguration.config.BIRTH.FEE.DELAYED}
        currency={offlineCountryConfiguration.config.CURRENCY.isoCode}
        languagesAndCountry={
          offlineCountryConfiguration.config.CURRENCY.languagesAndCountry[0]
        }
      />
    ),
    action: {
      id: BirthActionId.BIRTH_DELAYED_FEE,
      label: intl.formatMessage(buttonMessages.change)
    }
  }
  const id = BirthActionId.BIRTH_DELAYED_FEE

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
        title={intl.formatMessage(messages.delayedFeeDialogTitle)}
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
            disabled={!Boolean(birthDelayedFee)}
            onClick={() => {
              birthDelayedFeeMutationHandler()
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
              id="applicationBirthDelayedFee"
              touched={true}
              required={false}
            >
              <InputContainer>
                <span>{getCurrency(offlineCountryConfiguration)}</span>
                <HalfWidthInput
                  id="applicationBirthDelayedFee"
                  type="text"
                  error={false}
                  value={birthDelayedFee}
                  onChange={handleBirthDelayedFee}
                />
              </InputContainer>
            </InputField>
          </Field>
        </Content>
      </ResponsiveModal>

      <FloatingNotification
        id={`${id}_notification`}
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
          ? intl.formatMessage(
              messages.applicationBirthDelayedFeeChangeNotification
            )
          : intl.formatMessage(messages.applicationConfigChangeError)}
      </FloatingNotification>
    </>
  )
}
