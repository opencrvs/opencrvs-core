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
import { useIntl } from 'react-intl'
import { useLocation } from 'react-router-dom'
import { Button, Icon } from '@opencrvs/components'
import { getAcceptedActions, SystemRole } from '@opencrvs/commons/client'
import { usePrintableCertificate } from '@client/v2-events/hooks/usePrintableCertificate'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { useAppConfig } from '@client/v2-events/hooks/useAppConfig'
import { getUserIdsFromActions } from '@client/v2-events/utils'

interface PrintButtonProps {
  id: string
  template: string
  buttonLabel?: { id: string; defaultMessage: string }
  disabled?: boolean
  value?: string
  /**
   * Optional callback to set a form value when the print action completes.
   * This allows satisfying a "required" constraint for this field.
   */
  onChange?: (value: string) => void
}

const addedButtonLabel = { id: 'print.certificate', defaultMessage: 'Print' }

export const AlphaPrintButton = {
  Input: ({
    id,
    template,
    buttonLabel,
    disabled,
    value,
    onChange
  }: PrintButtonProps) => {
    const intl = useIntl()
    const location = useLocation()
    const parts = location.pathname.split('/')
    const eventId = parts[4]
    const { getEvent } = useEvents()
    const { certificateTemplates, language } = useAppConfig()
    const { getUsers } = useUsers()
    const { getLocations } = useLocations()
    const event = getEvent.getFromCache(eventId)
    const actions = getAcceptedActions(event)
    const userIds = getUserIdsFromActions(actions, [SystemRole.enum.HEALTH])
    // Get users and locations for the certificate
    const [users] = getUsers.useSuspenseQuery(userIds)
    const [locations] = getLocations.useSuspenseQuery()
    const { eventConfiguration } = useEventConfiguration(event.type)

    // Find the certificate template configuration
    const certificateConfig = certificateTemplates.find(
      (cert) => cert.id === template
    )

    const { preparePdfCertificate } = usePrintableCertificate({
      event,
      config: eventConfiguration,
      locations,
      users,
      certificateConfig,
      language
    })

    const alreadyPrinted = Boolean(value)

    const handlePrint = async () => {
      if (!certificateConfig || !language || !preparePdfCertificate) {
        return
      }

      onChange?.(new Date().toISOString())

      // Follow the new print flow: prepare first, then mutate, then print in the prepared window
      const openPreparedPdf = await preparePdfCertificate(event)
      // Defer recording print action to the dedicated review flow; button just opens prepared PDF
      openPreparedPdf()
    }

    const label = buttonLabel
      ? intl.formatMessage(buttonLabel)
      : intl.formatMessage(addedButtonLabel)

    return (
      <Button
        disabled={disabled || !certificateConfig || alreadyPrinted}
        id={id}
        size="medium"
        type="secondary"
        onClick={handlePrint}
      >
        <Icon name="Printer" />
        {label}
      </Button>
    )
  },
  Output: ({ value }: { value?: string }) => <>{value?.toString() || ''}</>
}
