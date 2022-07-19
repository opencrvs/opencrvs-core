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
  Message
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
  getCurrencyObject,
  getCurrencySelectOptions,
  ICurrency
} from '@client/views/SysAdmin/Config/Application/utils'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { lookup } from 'country-data'
import { isString } from 'lodash'

export function Currency() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const [currency, setCurrency] = React.useState(
    `${offlineCountryConfiguration.config.CURRENCY.languagesAndCountry[0]}-${offlineCountryConfiguration.config.CURRENCY.isoCode}`
  )
  const [isValueUpdating, setIsValueUpdating] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const toggleModal = () => setShowModal((prev) => !prev)
  const [notificationStatus, setNotificationStatus] = React.useState<
    'idle' | 'success' | 'error'
  >('idle')

  async function applicationCurrencyMutationHandler() {
    try {
      await callApplicationConfigMutation(
        GeneralActionId.CURRENCY,
        {
          ...offlineCountryConfiguration.config,
          CURRENCY: getCurrencyObject(currency) as ICurrency
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
  const id = isString(intl.formatMessage(messages.currencyLabel))
    ? intl.formatMessage(messages.applicationNameLabel).split(' ').join('-')
    : 'label-component'
  const countryCurrencyName = lookup.currencies({
    code: offlineCountryConfiguration.config.CURRENCY.isoCode
  })
  return (
    <>
      <ListViewItemSimplified
        key={id}
        label={
          <Label id={`${id}_label`}>
            {intl.formatMessage(messages.currencyLabel)}
          </Label>
        }
        value={countryCurrencyName[0].name}
        actions={
          <LinkButton id={id} onClick={toggleModal}>
            {intl.formatMessage(buttonMessages.change)}
          </LinkButton>
        }
      />

      <ResponsiveModal
        id={`${id}Modal`}
        title={intl.formatMessage(messages.currencyLabel)}
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
            disabled={!Boolean(currency)}
            onClick={() => {
              applicationCurrencyMutationHandler()
            }}
          >
            {intl.formatMessage(buttonMessages.apply)}
          </ApplyButton>
        ]}
        handleClose={toggleModal}
      >
        <Message>{intl.formatMessage(messages.govtLogoChangeMessage)}</Message>
        <Content>
          <Field>
            <InputField
              id="applicationCurrency"
              touched={true}
              required={false}
            >
              <Select
                id="selectCurrency"
                isDisabled={false}
                onChange={(val: string) => {
                  setCurrency(val)
                }}
                value={currency}
                options={getCurrencySelectOptions()}
              />
            </InputField>
          </Field>
        </Content>
      </ResponsiveModal>

      <FloatingNotification
        id="print-cert-notification"
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
          ? intl.formatMessage(messages.applicationCurrencyChangeNotification)
          : intl.formatMessage(messages.applicationConfigChangeError)}
      </FloatingNotification>
    </>
  )
}
