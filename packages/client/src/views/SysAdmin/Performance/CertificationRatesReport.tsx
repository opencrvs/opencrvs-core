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
import { ListViewItemSimplified } from '@opencrvs/components/lib/ListViewSimplified'
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
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import type { GQLCertificationMetric } from '@client/utils/gateway-deprecated-do-not-use.d'
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
          return <GenericErrorToast />
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
