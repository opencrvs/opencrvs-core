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
import { Alert } from '@opencrvs/components/lib/Alert'
import { Query } from '@client/components/Query'
import { errorMessages } from '@client/i18n/messages/errors'
import { useIntl } from 'react-intl'
import {
  FetchDuplicateDeatilsQuery,
  createDuplicateDetailsQuery
} from './utils'

const WarningContainer = styled.div`
  margin: 16px auto;
  max-width: 1140px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export function DuplicateWarning({
  duplicateIds,
  className
}: {
  duplicateIds: string[] | undefined
  className?: string
}) {
  const intl = useIntl()
  return (
    <WarningContainer className={className}>
      {duplicateIds && (
        <Query<Record<string, FetchDuplicateDeatilsQuery>>
          query={createDuplicateDetailsQuery(duplicateIds)}
          variables={duplicateIds.reduce(
            (accum, duplicateId, idx) => ({
              ...accum,
              [`duplicate${idx}Id`]: duplicateId
            }),
            {}
          )}
        >
          {({ data }) => {
            return (
              <>
                {duplicateIds.map((_, idx) => {
                  const duplicateQuery = data?.[`duplicate${idx}`]
                  if (duplicateQuery?.registration?.trackingId) {
                    return (
                      <Alert key={`alert-${idx}`} type="warning">
                        {intl.formatMessage(errorMessages.duplicateWarning, {
                          trackingId: duplicateQuery.registration.trackingId
                        })}
                      </Alert>
                    )
                  }
                  return <></>
                })}
              </>
            )
          }}
        </Query>
      )}
    </WarningContainer>
  )
}
