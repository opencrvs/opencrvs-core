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
import { useIntl } from 'react-intl'
import { Alert } from '@opencrvs/components/lib/Alert'

const messages = {
  duplicateWarning: {
    defaultMessage: 'Potential duplicate of record {trackingId}',
    description:
      'The warning message shown when a declaration has potential duplicates',
    id: 'duplicates.warning'
  }
}

const WarningContainer = styled.div`
  margin: 16px auto;
  max-width: 1140px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export function DuplicateWarning({
  duplicateTrackingIds,
  className
}: {
  duplicateTrackingIds: string[]
  className?: string
}) {
  const intl = useIntl()
  return (
    <WarningContainer className={className}>
      {duplicateTrackingIds.map((trackingId, idx) => (
        <Alert key={`alert-${idx}`} type="warning">
          {intl.formatMessage(messages.duplicateWarning, {
            trackingId
          })}
        </Alert>
      ))}
    </WarningContainer>
  )
}
