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
import React from 'react'
import { Button, ButtonProps, Icon } from '@opencrvs/components/lib'
import {
  Ii18nButtonFormField,
  IFormField,
  IFormFieldValue,
  IFormSectionData,
  IFormData,
  IHttpFormField
} from '@client/forms'
import { useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'
import { getUserDetails } from '@client/profile/profileSelectors'
import { useHttp } from './http'
import { handleUnsupportedIcon, isFieldButton } from '@client/forms/utils'

interface ButtonFieldProps extends Omit<ButtonProps, 'type'> {
  fieldDefinition: Ii18nButtonFormField
  fields: IFormField[]
  values: IFormSectionData
  draftData: IFormData
  setFieldValue: (name: string, value: IFormFieldValue) => void
  setFieldTouched: (name: string, isTouched?: boolean) => void
  onWaitingRequiredStateChanged?: (shouldWaitTriggeredEventCompletion: boolean) => void
}

export function ButtonField(props: ButtonFieldProps) {
  const {
    fieldDefinition,
    fields,
    setFieldValue,
    setFieldTouched,
    values,
    draftData,
    onWaitingRequiredStateChanged,
    ...buttonProps
  } = props
  const { icon, loadingLabel, buttonLabel } = fieldDefinition
  const offlineCountryConfig = useSelector(getOfflineData)
  const userDetails = useSelector(getUserDetails)
  // safe to assume that the trigger is always there because of the form validation in config
  const trigger = fields.find(
    (f) => f.name === fieldDefinition.options.trigger
  )!
  const onChange: Parameters<typeof useHttp>[1] = ({
    data,
    error,
    loading,
    isCompleted
  }) => {    
    if (isCompleted) {
      onWaitingRequiredStateChanged?.(false)
      /**
       * Form can have buttons having the same triggers. For example, if a button works as an id
       * generator and is required, then it prevents the user in review page to submit the declaration
       * without clicking it, which is fine. But if a problem occurs in the id generating server, then
       * the user can never submit the form and the flow is blocked forever. To avoid this scenario and
       * to keep the user experience smooth, a conditional button with the exact same trigger and with identical
       * appearance of the generator button is shown with the error message that trigger gets after the request.
       * This button is not required.
       * The UX is shown in the screen capture: https://github.com/opencrvs/opencrvs-core/pull/7822#issue-2608396705
       */
      const fieldsHavingSameTrigger = fields.filter(
        (f) => isFieldButton(f) && f.options.trigger === trigger.name
      )

      fieldsHavingSameTrigger.forEach((f) => setFieldTouched(f.name))
    }
    setFieldValue(trigger.name, { loading, data, error } as IFormFieldValue)
  }
  const { call, loading } = useHttp<string>(
    trigger as IHttpFormField,
    onChange,
    values,
    offlineCountryConfig,
    draftData,
    userDetails
  )

  const supportedIcon = handleUnsupportedIcon(icon)
  const isLoading = fieldDefinition.options.shouldHandleLoadingState && loading
  const label =
    fieldDefinition.options.shouldHandleLoadingState && loading
      ? loadingLabel
      : buttonLabel
  const onClick = () => {
    fieldDefinition.options.shouldWaitTriggeredEventCompletion && onWaitingRequiredStateChanged?.(true)
    call()
  }
  return (
    <Button
      {...buttonProps}
      type="secondary"
      onClick={onClick}
      loading={isLoading}
    >
      {supportedIcon && !isLoading && (
        <Icon color="currentColor" name={supportedIcon} size="large" />
      )}
      {label}
    </Button>
  )
}
