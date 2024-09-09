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
import { Button, ButtonProps } from '@opencrvs/components/lib'
import {
  Ii18nButtonFormField,
  IFormField,
  IFormFieldValue,
  IFormSectionData,
  IFormData,
  Ii18nRedirectButtonFormField
} from '@client/forms'
import { isFieldHttp, transformHttpFieldIntoRequest } from '@client/forms/utils'
import { useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'
import { getUserDetails } from '@client/profile/profileSelectors'
import { useHistory } from 'react-router'

interface ButtonFieldProps extends Omit<ButtonProps, 'type'> {
  fieldDefinition: Ii18nButtonFormField | Ii18nRedirectButtonFormField
  fields: IFormField[]
  values: IFormSectionData
  draftData?: IFormData
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
  const offlineCountryConfig = useSelector(getOfflineData)
  const userDetails = useSelector(getUserDetails)
  const navigate = useHistory()
  const onClick = () => {
    // safe to assume that the trigger is always there because of the form validation in config
    const trigger = fields.find(
      (f) => f.name === fieldDefinition.options.trigger
    )!
    if (isFieldHttp(trigger)) {
      const httpRequest = transformHttpFieldIntoRequest(
        trigger,
        values,
        offlineCountryConfig,
        draftData,
        userDetails
      )
      setFieldValue(trigger.name, { loading: true })
      httpRequest
        .then((res) => res.json())
        .then((data) => {
          setFieldValue(trigger.name, { loading: false, data })
          if (fieldDefinition.type === 'REDIRECT_BUTTON') {
            navigate.push(fieldDefinition.options.url)
          }
        })
        .catch((error) => {
          setFieldValue(trigger.name, { loading: false, error: error.message })
        })
    }
  }
  return (
    <Button {...buttonProps} type="secondary" onClick={onClick}>
      {props.children}
    </Button>
  )
}
