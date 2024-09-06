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
  IFormFieldValue
} from '@client/forms'
import { isFieldHttp } from '@client/forms/utils'

interface ButtonFieldProps extends Omit<ButtonProps, 'type'> {
  fieldDefinition: Ii18nButtonFormField
  fields: IFormField[]
  setFieldValue: (name: string, value: IFormFieldValue) => void
}

export function ButtonField(props: ButtonFieldProps) {
  const { fieldDefinition, fields, setFieldValue, ...buttonProps } = props
  const onClick = () => {
    const trigger = fields.find(
      (f) => f.name === fieldDefinition.options.trigger
    )
    if (trigger && isFieldHttp(trigger)) {
      const {
        options: { url, ...requestOptions }
      } = trigger
      setFieldValue(trigger.name, { loading: true })
      fetch(url, requestOptions)
        .then((res) => res.json())
        .then((data) => {
          setFieldValue(trigger.name, { loading: false, data })
        })
        .catch((error) => {
          setFieldValue(trigger.name, { loading: false, error })
        })
    }
  }
  return (
    <Button {...buttonProps} type="secondary" onClick={onClick}>
      {props.children}
    </Button>
  )
}
