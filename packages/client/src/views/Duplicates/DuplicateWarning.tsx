/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import React from 'react'
import styled from 'styled-components'
import { Warning } from '@opencrvs/components/lib/interface'
import gql from 'graphql-tag'
import { Query } from '@client/components/Query'
import { FetchDuplicateTrackingIdQuery } from '@client/utils/gateway'
import { errorMessages } from '@client/i18n/messages/errors'
import { useIntl } from 'react-intl'

const WarningContainer = styled.div`
  margin: 16px auto;
  max-width: 1140px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin: 16px 24px;
  }
`

const FETCH_DUPLICATE_TRACKING_ID = gql`
  query fetchDuplicateTrackingId($id: ID!) {
    fetchRegistration(id: $id) {
      registration {
        trackingId
      }
    }
  }
`

export function DuplicateWarning({
  duplicateIds
}: {
  duplicateIds: string[] | undefined
}) {
  const intl = useIntl()
  return (
    <WarningContainer>
      {duplicateIds?.map((id) => (
        <Query<FetchDuplicateTrackingIdQuery>
          key={id}
          query={FETCH_DUPLICATE_TRACKING_ID}
          variables={{ id }}
        >
          {({ data }) => {
            if (data?.fetchRegistration?.registration?.trackingId) {
              return (
                <Warning
                  label={intl.formatMessage(errorMessages.duplicateWarning, {
                    trackingId: (
                      <u>{data.fetchRegistration.registration.trackingId}</u>
                    )
                  })}
                />
              )
            }
            return <></>
          }}
        </Query>
      ))}
    </WarningContainer>
  )
}
