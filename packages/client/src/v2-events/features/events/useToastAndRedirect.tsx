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
import toast from 'react-hot-toast'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { Toast, ToastType } from '@opencrvs/components'
import { TranslationConfig, UUID } from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'

interface ToastProps {
  message: TranslationConfig
  toastType: ToastType
  toastId: string
  messageOpts?: Record<string, string>
}

function ToastWithIntl({
  message,
  toastType,
  toastId,
  messageOpts
}: ToastProps) {
  const intl = useIntl()

  return (
    <Toast
      data-testid={toastId}
      duration={null}
      type={toastType}
      onClose={() => toast.remove(toastId)}
    >
      {intl.formatMessage(message, messageOpts)}
    </Toast>
  )
}

/**
 * Displays a toast using the application's standardized toast component.
 *
 * **Important:** Always use this function to create toasts instead of calling the `toast` library directly.
 * This ensures consistent presentation and behavior for all notification toasts in the application.
 *
 * @param props - The properties for the toast, including the message, type, ID, and any interpolation options.
 */
export function showToast(props: ToastProps) {
  toast.custom(<ToastWithIntl {...props} />, { id: props.toastId })
}

/**
 * Handles unavailable user actions by showing a toast and redirecting.
 * Behavior varies based on route context (declare, edit, delete, etc.)
 */
export function useToastAndRedirect() {
  const navigate = useNavigate()

  function redirectToEventOverviewPage({
    toastId,
    message,
    eventId
  }: {
    toastId: string
    message: TranslationConfig
    eventId: UUID
  }) {
    showToast({ message, toastType: 'warning', toastId })
    return navigate(ROUTES.V2.EVENTS.EVENT.buildPath({ eventId }), {
      replace: true
    })
  }

  return { redirectToEventOverviewPage }
}
