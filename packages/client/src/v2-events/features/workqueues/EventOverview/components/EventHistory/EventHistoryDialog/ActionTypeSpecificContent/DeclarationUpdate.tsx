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
import styled from 'styled-components'
import { ActionDocument, EventDocument } from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { DeclarationComparisonTable } from '@client/v2-events/features/events/actions/correct/request/Summary/DeclarationComparisonTable'

/**
 *
 * Displays diff between declaration and update of it.
 */
export function DeclarationUpdateComponent({
  action,
  fullEvent
}: {
  action: ActionDocument
  fullEvent: EventDocument
}) {
  const { eventConfiguration } = useEventConfiguration(fullEvent.type)

  return (
    <DeclarationComparisonTable
      action={action}
      eventConfig={eventConfiguration}
      fullEvent={fullEvent}
      id={'declaration-update'}
    />
  )
}

export const DeclarationUpdate = withSuspense(DeclarationUpdateComponent)
