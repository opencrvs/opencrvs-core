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
import {
  ListViewSimplified,
  ListViewItemSimplified,
  Spinner
} from '@opencrvs/components/lib/interface'
import React from 'react'
import {
  calculateTotal,
  PerformanceTitle,
  PerformanceValue,
  PerformanceListHeader
} from '@client/views/SysAdmin/Performance/utils'
import { GQLCorrectionMetric } from '@opencrvs/gateway/src/graphql/schema'
import { messages } from '@client/i18n/messages/views/performance'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'
import { CorrectionReason } from '@client/forms/correction/reason'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { Query } from '@client/components/Query'
import gql from 'graphql-tag'
import { ApolloError } from 'apollo-client'

import {
  NOTIFICATION_TYPE,
  ToastNotification
} from '@client/components/interface/ToastNotification'

interface CorrectionsReportProps {
  selectedEvent: 'BIRTH' | 'DEATH'
  timeStart: Date
  timeEnd: Date
  locationId?: string
}

const Container = styled(ListViewSimplified)`
  grid-template-columns: auto 1fr minmax(5em, auto);
`

export const CORRECTION_TOTALS = gql`
  query data(
    $event: String!
    $timeStart: String!
    $timeEnd: String!
    $locationId: String!
  ) {
    getTotalCorrections(
      timeStart: $timeStart
      timeEnd: $timeEnd
      locationId: $locationId
      event: $event
    ) {
      total
      reason
    }
  }
`
interface ICorrectionsQueryResult {
  getTotalCorrections: Array<GQLCorrectionMetric>
}

export function CorrectionsReport({
  selectedEvent,
  timeStart,
  timeEnd,
  locationId
}: CorrectionsReportProps) {
  const intl = useIntl()
  return (
    <Query
      query={CORRECTION_TOTALS}
      variables={{
        timeStart: timeStart.toISOString(),
        timeEnd: timeEnd.toISOString(),
        locationId,
        event: selectedEvent
      }}
      fetchPolicy="no-cache"
    >
      {({
        loading,
        error,
        data
      }: {
        loading: boolean
        error?: ApolloError
        data?: ICorrectionsQueryResult
      }) => {
        if (error) {
          return (
            <>
              <ToastNotification type={NOTIFICATION_TYPE.ERROR} />
            </>
          )
        }

        if (loading) {
          return <Spinner id="performance-home-loading" />
        }

        return (
          <Container>
            <ListViewItemSimplified
              label={
                <div>
                  <PerformanceListHeader>Corrections</PerformanceListHeader>
                </div>
              }
            />
            <ListViewItemSimplified
              label={
                <PerformanceTitle>
                  {intl.formatMessage(messages.performanceTotalLabel)}
                </PerformanceTitle>
              }
              value={
                <div>
                  <PerformanceValue>
                    {calculateTotal(data!.getTotalCorrections)}
                  </PerformanceValue>
                </div>
              }
            />
            <ListViewItemSimplified
              label={
                <PerformanceTitle>
                  {intl.formatMessage(correctionMessages.clericalError)}
                </PerformanceTitle>
              }
              value={
                <PerformanceValue>
                  {calculateTotal(
                    data!.getTotalCorrections.filter(
                      ({ reason }) => reason === CorrectionReason.CLERICAL_ERROR
                    )
                  )}
                </PerformanceValue>
              }
            />
            <ListViewItemSimplified
              label={
                <PerformanceTitle>
                  {intl.formatMessage(correctionMessages.materialError)}
                </PerformanceTitle>
              }
              value={
                <PerformanceValue>
                  {calculateTotal(
                    data!.getTotalCorrections.filter(
                      ({ reason }) => reason === CorrectionReason.MATERIAL_ERROR
                    )
                  )}
                </PerformanceValue>
              }
            />
            <ListViewItemSimplified
              label={
                <PerformanceTitle>
                  {intl.formatMessage(correctionMessages.materialOmission)}
                </PerformanceTitle>
              }
              value={
                <PerformanceValue>
                  {calculateTotal(
                    data!.getTotalCorrections.filter(
                      ({ reason }) =>
                        reason === CorrectionReason.MATERIAL_OMISSION
                    )
                  )}
                </PerformanceValue>
              }
            />
            <ListViewItemSimplified
              label={
                <PerformanceTitle>
                  {intl.formatMessage(correctionMessages.judicialOrder)}
                </PerformanceTitle>
              }
              value={
                <PerformanceValue>
                  {calculateTotal(
                    data!.getTotalCorrections.filter(
                      ({ reason }) => reason === CorrectionReason.JUDICIAL_ORDER
                    )
                  )}
                </PerformanceValue>
              }
            />
            <ListViewItemSimplified
              label={
                <PerformanceTitle>
                  {intl.formatMessage(messages.otherCorrectionReason)}
                </PerformanceTitle>
              }
              value={
                <PerformanceValue>
                  {calculateTotal(
                    data!.getTotalCorrections.filter(
                      ({ reason }) => reason === CorrectionReason.OTHER
                    )
                  )}
                </PerformanceValue>
              }
            />
          </Container>
        )
      }}
    </Query>
  )
}
