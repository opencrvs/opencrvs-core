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
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import {
  Button as ButtonComponent,
  ButtonProps,
  Icon
} from '@opencrvs/components/lib'
import * as SupportedIcons from '@opencrvs/components/lib/Icon/all-icons'
import {
  HttpField,
  HttpFieldValue,
  TranslationConfig
} from '@opencrvs/commons/client'
import { useHttpFieldRequest } from './useHttpFieldRequest'

export function handleUnsupportedIcon(iconName?: string) {
  if (iconName && iconName in SupportedIcons) {
    return iconName as keyof typeof SupportedIcons
  }
  return null
}

interface HttpButtonProps {
  /** HttpField includes the configuration for the fetch function that is being triggered from button call */
  httpConfiguration: HttpField
  /** Should the FetchButton show an spinner while loading */
  shouldHandleLoadingState?: boolean
  /** Icon for the button */
  icon?: string
  /** Label for the button */
  buttonLabel: TranslationConfig
  /** Label for the loading state on the button */
  loadingLabel?: TranslationConfig
  /** Emits when the fetch status changes */
  onChange: ({ loading, error, data }: HttpFieldValue) => void
}

export function Button({
  httpConfiguration,
  shouldHandleLoadingState,
  icon,
  onChange,
  buttonLabel,
  loadingLabel
}: HttpButtonProps) {
  const intl = useIntl()
  const { call, loading } = useHttpFieldRequest(
    httpConfiguration,
    onChange,
    {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as any,
    {},
    null
  )

  // const onChange: Parameters<typeof useHttp>[1] = ({s
  //   data,
  //   error,
  //   loading,
  //   isCompleted
  // }) => {
  //   if (isCompleted) {
  //     /**
  //      * Form can have buttons having the same triggers. For example, if a button works as an id
  //      * generator and is required, then it prevents the user in review page to submit the declaration
  //      * without clicking it, which is fine. But if a problem occurs in the id generating server, then
  //      * the user can never submit the form and the flow is blocked forever. To avoid this scenario and
  //      * to keep the user experience smooth, a conditional button with the exact same trigger and with identical
  //      * appearance of the generator button is shown with the error message that trigger gets after the request.
  //      * This button is not required.
  //      * The UX is shown in the screen capture: https://github.com/opencrvs/opencrvs-core/pull/7822#issue-2608396705
  //      */
  //     const fieldsHavingSameTrigger = fields.filter(
  //       (f) => isFieldButton(f) && f.options.trigger === trigger.name
  //     )

  //     fieldsHavingSameTrigger.forEach((f) => setFieldTouched(f.name))
  //   }
  //   setFieldValue(trigger.name, { loading, data, error } as IFormFieldValue)
  // }

  const supportedIcon = handleUnsupportedIcon(icon)
  const isLoading = shouldHandleLoadingState && loading
  const label =
    shouldHandleLoadingState && loading
      ? intl.formatMessage(loadingLabel ?? buttonLabel)
      : intl.formatMessage(buttonLabel)

  return (
    <ButtonComponent
      loading={isLoading}
      type="secondary"
      onClick={() => call()}
    >
      {supportedIcon && !isLoading && (
        <Icon color="currentColor" name={supportedIcon} size="large" />
      )}
      {label}
    </ButtonComponent>
  )
}

export const HttpButton = {
  Input: Button,
  Output: null
}
