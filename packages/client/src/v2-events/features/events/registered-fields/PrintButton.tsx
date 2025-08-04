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
import { useParams } from 'react-router-dom'
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
}

export const PrintButton = {
  Input: ({ id, template, buttonLabel, disabled }: PrintButtonProps) => {
    const intl = useIntl()
    const { eventId } = useParams()
    const { getEvent } = useEvents()

    // Only proceed if we have an eventId
    if (!eventId) {
      return (
        <Button
          disabled={true}
          id={id}
          size="small"
          style={{ cursor: 'pointer' }}
          type="secondary"
        >
          {intl.formatMessage({
            id: 'print.certificate',
            defaultMessage: 'Print Certificate'
          })}
        </Button>
      )
    }

    const event = getEvent.getFromCache(eventId)
    const { eventConfiguration } = useEventConfiguration(event.type)

    const { getUsers } = useUsers()
    const { getLocations } = useLocations()
    const { certificateTemplates, language } = useAppConfig()

    // Get users and locations for the certificate
    const actions = getAcceptedActions(event)
    const userIds = getUserIdsFromActions(actions, [SystemRole.enum.HEALTH])
    const [users] = getUsers.useSuspenseQuery(userIds)
    const [locations] = getLocations.useSuspenseQuery()

    // Find the certificate template configuration
    const certificateConfig = certificateTemplates.find(
      (cert) => cert.id === template
    )

    const { handleCertify } = usePrintableCertificate({
      event,
      config: eventConfiguration,
      locations,
      users,
      certificateConfig,
      language
    })

    const handlePrint = async () => {
      if (event && eventConfiguration && typeof handleCertify === 'function') {
        await handleCertify(event)
      }
    }

    const label = buttonLabel
      ? intl.formatMessage(buttonLabel)
      : intl.formatMessage({
          id: 'print.certificate',
          defaultMessage: 'Print Certificate'
        })

    return (
      <Button
        disabled={false}
        // disabled={disabled || !certificateConfig}
        id={id}
        size="small"
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
