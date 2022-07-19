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

export function BirthLateFee() {
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
  const [birthLateFee, setBirthLateFee] = React.useState(
    offlineCountryConfiguration.config.BIRTH.FEE.LATE.toLocaleString()
  )
  const handleBirthLateFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = String(event.target.value)
    setBirthLateFee(getFormattedFee(value))
  }

  async function birthLateFeeMutationHandler() {
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
              ON_TIME: offlineCountryConfiguration.config.BIRTH.FEE.ON_TIME,
              LATE: parseFloat(birthLateFee.replace(/,/g, '')),
              DELAYED: offlineCountryConfiguration.config.BIRTH.FEE.DELAYED
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
    label: intl.formatMessage(messages.lateRegistrationLabel),
    value: (
      <FormattedNumberCurrency
        value={offlineCountryConfiguration.config.BIRTH.FEE.LATE}
        currency={offlineCountryConfiguration.config.CURRENCY.isoCode}
        languagesAndCountry={
          offlineCountryConfiguration.config.CURRENCY.languagesAndCountry[0]
        }
      />
    ),
    action: {
      id: BirthActionId.BIRTH_LATE_FEE,
      label: intl.formatMessage(buttonMessages.change)
    }
  }
  const id = BirthActionId.BIRTH_LATE_FEE

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
        title={intl.formatMessage(messages.lateFeeDialogTitle)}
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
            disabled={!Boolean(birthLateFee)}
            onClick={() => {
              birthLateFeeMutationHandler()
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
              id="applicationBirthLateFee"
              touched={true}
              required={false}
            >
              <InputContainer>
                <span>{getCurrency(offlineCountryConfiguration)}</span>
                <HalfWidthInput
                  id="applicationBirthLateFee"
                  type="text"
                  error={false}
                  value={birthLateFee}
                  onChange={handleBirthLateFee}
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
              messages.applicationBirthLateFeeChangeNotification
            )
          : intl.formatMessage(messages.applicationConfigChangeError)}
      </FloatingNotification>
    </>
  )
}
