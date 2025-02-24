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
import { FieldValue } from '@opencrvs/commons/client'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/features/workqueues/utils'
import { RecursiveStringRecord } from '@client/v2-events/hooks/useFormDataStringifier'

/**
 * Based on packages/client/src/views/RecordAudit/DeclarationInfo.tsx
 */

export function EventSummary({
  event,
  summary
}: {
  event: Record<string, FieldValue | null | RecursiveStringRecord>
  summary: SummaryConfig
}) {
  const intl = useIntlFormatMessageWithFlattenedParams()

  return (
    <>
      <Summary id="summary">
        {summary.fields.map((field) => {
          return (
            <Summary.Row
              key={field.id}
              data-testid={field.id}
              label={intl.formatMessage(field.label)}
              placeholder={
                field.emptyValueMessage &&
                intl.formatMessage(field.emptyValueMessage)
              }
              value={intl.formatMessage(field.value, event)}
            />
          )
        })}
      </Summary>
    </>
  )
}
