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
import { MessageDescriptor } from 'react-intl'
import { Validation } from '@login/utils/validate'
import { Field } from 'redux-form'
import { IInputFieldProps } from '@opencrvs/components/lib/forms'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type Ii18nReduxFormFieldProps = {
  id: string
  name: string
  validate: Validation[]
  disabled: boolean
  type: string
  min?: number
  maxLength?: number
  placeholder?: string
  label?: string
  focusInput: boolean
}

export type IReduxFormFieldProps = {
  placeholder?: MessageDescriptor
  label?: MessageDescriptor
} & Omit<Ii18nReduxFormFieldProps, 'placeholder' | 'label'>

export type IFieldGroup = {
  [key: string]: IReduxFormFieldProps
}

export type IFieldRefGroup = {
  [key: string]: React.RefObject<Field<IReduxFormFieldProps & IInputFieldProps>>
}
