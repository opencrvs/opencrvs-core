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
import { Button } from '@opencrvs/components/lib'
import {
  Ii18nButtonFormField,
  IFormField,
  IFormFieldValue
} from '@client/forms'
import { isFieldHttp } from '@client/forms/utils'

interface ButtonProps {
  fieldDefinition: Ii18nButtonFormField
  children: React.ReactNode
  fields: IFormField[]
  setFieldValue: (name: string, value: IFormFieldValue) => void
}

export function ButtonField(props: ButtonProps) {
  const getOnClickHandle = () => {
    const trigger = props.fields.find(
      (f) => f.name === props.fieldDefinition.options.trigger
    )
    if (trigger && isFieldHttp(trigger)) {
      return () => {
        const {
          options: { url, ...requestOptions }
        } = trigger
        props.setFieldValue(trigger.name, { loading: true })
        fetch(url, requestOptions)
          .then((res) => res.json())
          .then((data) => {
            props.setFieldValue(trigger.name, { loading: false, data })
          })
          .catch((error) => {
            props.setFieldValue(trigger.name, { loading: false, error })
          })
      }
    }
  }
  const onClick = getOnClickHandle()
  return (
    <Button type="secondary" onClick={onClick}>
      {props.children}
    </Button>
  )
}
