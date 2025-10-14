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

/**
 * Handles unavailable user actions by showing a toast and redirecting.
 * Behavior varies based on route context (declare, edit, delete, etc.)
 */
export function useToastAndRedirect() {
  const intl = useIntl()
  const navigate = useNavigate()

  function showWarningToast({
    message,
    toastType,
    toastId
  }: {
    message: TranslationConfig
    toastType: ToastType
    toastId: string
  }) {
    toast.custom(
      <Toast
        data-testid={toastId}
        duration={null}
        type={toastType}
        onClose={() => toast.remove(toastId)}
      >
        {intl.formatMessage(message)}
      </Toast>,
      { id: toastId }
    )
  }

  function redirectToEventOverviewPage({
    toastId,
    message,
    eventId
  }: {
    toastId: string
    message: TranslationConfig
    eventId: UUID
  }) {
    showWarningToast({ message, toastType: 'warning', toastId })
    return navigate(ROUTES.V2.EVENTS.OVERVIEW.buildPath({ eventId }))
  }

  return { redirectToEventOverviewPage }
}
