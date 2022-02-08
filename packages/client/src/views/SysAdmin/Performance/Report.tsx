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
import { Query } from '@client/components/Query'
import { Event } from '@client/forms'
import { goBack } from '@client/navigation'
import styled from '@client/styledComponents'
import { PERFORMANCE_METRICS } from '@client/views/SysAdmin/Performance/metricsQuery'
import {
  CertificationPaymentReports,
  EstimatedTargetDayRegistrationReports,
  GenderBasisReports,
  TimeFrameReports
} from '@client/views/SysAdmin/Performance/reports'
import {
  SysAdminContentWrapper,
  SysAdminPageVariant
} from '@client/views/SysAdmin/SysAdminContentWrapper'
import { ISearchLocation } from '@opencrvs/components/lib/interface'
import {
  GQLCertificationPaymentMetrics,
  GQLRegistrationTargetDayEstimatedMetrics,
  GQLRegistrationGenderBasisMetrics,
  GQLRegistrationMetrics,
  GQLRegistrationTimeFrameMetrics
} from '@opencrvs/gateway/src/graphql/schema'
import { ApolloError } from 'apollo-client'
import { get, isEmpty } from 'lodash'
import moment from 'moment'
import React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps, StaticContext } from 'react-router'
import { NoResultMessage } from './NoResultMessage'

const ReportWrapper = styled.div`
  margin-top: 16px;
`

interface DispatchProps {
  goBack: typeof goBack
}

interface IMetricsQueryResult {
  fetchRegistrationMetrics: GQLRegistrationMetrics
}

type RouteProps = RouteComponentProps<
  {},
  StaticContext,
  {
    eventType: Event
    timeRange: { start: Date; end: Date }
    selectedLocation: ISearchLocation
  }
>

type Props = DispatchProps & WrappedComponentProps & RouteProps

function ReportComponent(props: Props) {
  const { eventType, timeRange, selectedLocation } = props.location.state
  const { start, end } = timeRange

  const title = moment(start).format('MMMM YYYY')
  return (
    <SysAdminContentWrapper
      id="reports"
      type={SysAdminPageVariant.SUBPAGE_CENTERED}
      backActionHandler={props.goBack}
      headerTitle={title}
    >
      <Query
        query={PERFORMANCE_METRICS}
        variables={{
          event: eventType,
          timeStart: start.toISOString(),
          timeEnd: end.toISOString(),
          locationId: selectedLocation.id
        }}
      >
        {({
          loading,
          error,
          data
        }: {
          loading: boolean
          error?: ApolloError
          data?: IMetricsQueryResult
        }) => {
          if (
            !loading &&
            isEmpty(get(data, 'fetchRegistrationMetrics.timeFrames.details')) &&
            isEmpty(
              get(data, 'fetchRegistrationMetrics.genderBasisMetrics.details')
            ) &&
            isEmpty(get(data, 'fetchRegistrationMetrics.payments.details'))
          ) {
            return (
              <NoResultMessage
                id="reports"
                searchedLocation={selectedLocation.displayLabel}
              />
            )
          } else {
            return (
              <ReportWrapper>
                <GenderBasisReports
                  eventType={eventType}
                  loading={loading}
                  genderBasisMetrics={
                    (data &&
                      data.fetchRegistrationMetrics &&
                      (data.fetchRegistrationMetrics
                        .genderBasisMetrics as GQLRegistrationGenderBasisMetrics)) ||
                    {}
                  }
                />
                <TimeFrameReports
                  eventType={eventType}
                  loading={loading}
                  data={
                    (data &&
                      data.fetchRegistrationMetrics &&
                      (data.fetchRegistrationMetrics
                        .timeFrames as GQLRegistrationTimeFrameMetrics)) ||
                    {}
                  }
                />
                {eventType === Event.BIRTH && (
                  <EstimatedTargetDayRegistrationReports
                    eventType={eventType}
                    loading={loading}
                    data={
                      (data &&
                        data.fetchRegistrationMetrics &&
                        (data.fetchRegistrationMetrics
                          .estimatedTargetDayMetrics as GQLRegistrationTargetDayEstimatedMetrics)) ||
                      {}
                    }
                  />
                )}
                <CertificationPaymentReports
                  eventType={eventType}
                  loading={loading}
                  data={
                    (data &&
                      data.fetchRegistrationMetrics &&
                      (data.fetchRegistrationMetrics
                        .payments as GQLCertificationPaymentMetrics)) ||
                    {}
                  }
                />
              </ReportWrapper>
            )
          }
        }}
      </Query>
    </SysAdminContentWrapper>
  )
}

export const Report = connect(undefined, { goBack })(
  injectIntl(ReportComponent)
)
