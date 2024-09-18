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
import React, { useEffect } from 'react'
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
import { handleUnsupportedIcon } from '@client/forms/utils'

interface ButtonFieldProps extends Omit<ButtonProps, 'type'> {
  fieldDefinition: Ii18nButtonFormField
  fields: IFormField[]
  values: IFormSectionData
  draftData: IFormData
  setFieldValue: (name: string, value: IFormFieldValue) => void
}

export function ButtonField(props: ButtonFieldProps) {
  const {
    fieldDefinition,
    fields,
    setFieldValue,
    values,
    draftData,
    ...buttonProps
  } = props
  const { icon, loadingLabel, buttonLabel } = fieldDefinition
  const offlineCountryConfig = useSelector(getOfflineData)
  const userDetails = useSelector(getUserDetails)
  // safe to assume that the trigger is always there because of the form validation in config
  const trigger = fields.find(
    (f) => f.name === fieldDefinition.options.trigger
  )!
  const { call, loading, data, error } = useHttp<string>(
    trigger as IHttpFormField,
    values,
    offlineCountryConfig,
    draftData,
    userDetails
  )
  useEffect(() => {
    setFieldValue(trigger.name, { loading, data, error })
  }, [loading, data, error, setFieldValue, trigger.name])
  const supportedIcon = handleUnsupportedIcon(icon)
  const isLoading = fieldDefinition.options.shouldHandleLoadingState && loading
  const label =
    fieldDefinition.options.shouldHandleLoadingState && loading
      ? loadingLabel
      : buttonLabel
  const onClick = () => {
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
