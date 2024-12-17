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
import { Summary } from '@opencrvs/components/lib/Summary'
import { SummaryConfig } from '@opencrvs/commons/events'
import { EventIndex } from '@opencrvs/commons/client'

/**
 * Based on packages/client/src/views/RecordAudit/DeclarationInfo.tsx
 */

export function EventSummary({
  event,
  summary
}: {
  event: EventIndex
  summary: SummaryConfig
}) {
  return (
    <>
      <Summary id="summary">
        {summary.fields.map((field) => {
          const message = 'message'

          return (
            <Summary.Row
              key={field.id}
              data-testid={field.id}
              label={field.label?.defaultMessage ?? ''}
              placeholder={message}
              // @ts-ignore
              value={event.data[field.id] ?? '-'}
            />
          )
        })}
      </Summary>
    </>
  )
}
