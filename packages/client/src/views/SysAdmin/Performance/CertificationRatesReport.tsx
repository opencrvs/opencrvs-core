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
import { ListViewItemSimplified } from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import * as React from 'react'
import {
  ListContainer,
  PerformanceListHeader,
  PerformanceTitle,
  PerformanceValue,
  PerformanceListSubHeader,
  ReportContainer,
  PercentageDisplay
} from '@client/views/SysAdmin/Performance/utils'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/performance'
import { Query } from '@client/components/Query'
import { GET_TOTAL_CERTIFICATIONS } from './queries'
import {
  NOTIFICATION_TYPE,
  ToastNotification
} from '@client/components/interface/ToastNotification'
import { Spinner } from '@opencrvs/components/lib/interface'
import { GQLCertificationMetric } from '@opencrvs/gateway/src/graphql/schema.d'
interface ICertificationRateData {
  label: string
  value: number
}

interface ICertificationRateProps {
  timeStart: string
  timeEnd: string
  event: string
  locationId?: string
  totalRegistrations: number
}

export function CertificationRatesReport(props: ICertificationRateProps) {
  const intl = useIntl()
  return (
    <Query
      query={GET_TOTAL_CERTIFICATIONS}
      variables={{
        timeStart: props.timeStart,
        timeEnd: props.timeEnd,
        event: props.event,
        locationId: props.locationId
      }}
    >
      {({ data, loading, error }) => {
        if (error) {
          return (
            <>
              <ToastNotification type={NOTIFICATION_TYPE.ERROR} />
            </>
          )
        }

        if (loading) {
          return <Spinner id="certification-rates-report-loading" size={24} />
        }

        const dataItem: GQLCertificationMetric =
          data.getTotalCertifications.find(
            (dataPoint: GQLCertificationMetric) =>
              dataPoint.eventType === props.event
          ) || { total: 0 }

        return (
          <ListContainer>
            <ReportContainer>
              <ListViewItemSimplified
                label={
                  <div>
                    <PerformanceListHeader>
                      {intl.formatMessage(
                        messages.performanceTotalCertificatesHeader
                      )}
                    </PerformanceListHeader>
                    <PerformanceListSubHeader>
                      {intl.formatMessage(
                        messages.performanceTotalCertificatesSubHeader
                      )}
                    </PerformanceListSubHeader>
                  </div>
                }
              />

              <ListViewItemSimplified
                label={
                  <PerformanceTitle>
                    {intl.formatMessage(messages.performanceTotalLabel)}
                  </PerformanceTitle>
                }
                value={<PerformanceValue>{dataItem.total}</PerformanceValue>}
              />

              <ListViewItemSimplified
                label={
                  <PerformanceTitle>
                    {intl.formatMessage(
                      messages.performanceCertificationRateLabel
                    )}
                  </PerformanceTitle>
                }
                value={
                  <PerformanceValue>
                    <PercentageDisplay
                      total={Math.min(dataItem.total, props.totalRegistrations)}
                      ofNumber={props.totalRegistrations}
                    />
                  </PerformanceValue>
                }
              />
            </ReportContainer>
          </ListContainer>
        )
      }}
    </Query>
  )
}
