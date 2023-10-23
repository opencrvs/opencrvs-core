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
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import {
  IInputFieldProps,
  InputField as InputFieldComponent
} from '@opencrvs/components/lib/InputField'
import { formMessages } from '@client/i18n/messages'

export const InputField = injectIntl(function FormInputField(
  props: Omit<IInputFieldProps, 'optionalLabel'> & IntlShapeProps
) {
  return (
    <InputFieldComponent
      {...props}
      optionalLabel={props.intl.formatMessage(formMessages.optionalLabel)}
    />
  )
})
