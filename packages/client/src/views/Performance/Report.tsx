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
  ICON_ALIGNMENT,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { BackArrow } from '@opencrvs/components/lib/icons'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { goBack } from '@client/navigation'
import styled from '@client/styledComponents'
import { PERFORMANCE_REPORT_TYPE_WEEKY } from '@client/utils/constants'
import { Header } from '@client/views/Performance/utils'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { PerformanceContentWrapper } from './PerformanceContentWrapper'
import { NoResultMessage } from './NoResultMessage'
import { generateLocations } from '@client/utils/locationUtils'
import {
  LocationSearch,
  ISearchLocation
} from '@opencrvs/components/lib/interface'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { IStoreState } from '@client/store'
import { Query } from '@client/components/Query'
import { PERFORMANCE_METRICS } from '@client/views/Performance/metricsQuery'
import {
  GQLBirthRegistrationMetrics,
  GQLBirthRegistrationTimeFrameMetrics,
  GQLBirthRegistrationGenderBasisMetrics
} from '@opencrvs/gateway/src/graphql/schema'
import { ApolloError } from 'apollo-client'
import {
  TimeFrameReports,
  GenderBasisReports
} from '@client/views/Performance/reports'
import moment from 'moment'

const BackButton = styled(TertiaryButton)`
  margin-top: 24px;
`

interface ReportProps {
  timeRange: { start: Date; end: Date }
  reportType: string
  goBack: typeof goBack
  offlineResources: IOfflineData
}

interface IMetricsQueryResult {
  fetchBirthRegistrationMetrics: GQLBirthRegistrationMetrics
}

type Props = ReportProps &
  WrappedComponentProps &
  RouteComponentProps<
    {},
    {},
    { reportType: string; timeRange: { start: Date; end: Date } }
  >

function ReportComponent(props: Props) {
  const [
    selectedLocation,
    setSelectedLocation
  ] = React.useState<ISearchLocation | null>(null)
  const { reportType, timeRange, intl } = props
  const { start, end } = timeRange

  const title = `${moment(start).format('DD MMMM')}  ${props.intl.formatMessage(
    constantsMessages.to
  )} ${moment(end).format('DD MMMM YYYY')}`

  return (
    <PerformanceContentWrapper tabId={reportType}>
      <BackButton
        align={ICON_ALIGNMENT.LEFT}
        icon={() => <BackArrow />}
        onClick={props.goBack}
      >
        {intl.formatMessage(buttonMessages.back)}
      </BackButton>
      <Header>{title}</Header>
      <LocationSearch
        locationList={generateLocations(props.offlineResources.locations)}
        searchHandler={item => {
          setSelectedLocation(item)
        }}
      />
      {selectedLocation && (
        <Query
          query={PERFORMANCE_METRICS}
          variables={{
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
              (data &&
                data.fetchBirthRegistrationMetrics &&
                data.fetchBirthRegistrationMetrics.timeFrames &&
                data.fetchBirthRegistrationMetrics.timeFrames.length === 0) &&
              (data &&
                data.fetchBirthRegistrationMetrics &&
                data.fetchBirthRegistrationMetrics.genderBasisMetrics &&
                data.fetchBirthRegistrationMetrics.genderBasisMetrics.length ===
                  0) &&
              (data &&
                data.fetchBirthRegistrationMetrics &&
                data.fetchBirthRegistrationMetrics.payments &&
                data.fetchBirthRegistrationMetrics.payments.length === 0)
            )
              return (
                <NoResultMessage
                  searchedLocation={selectedLocation.displayLabel}
                />
              )
            return (
              <>
                <GenderBasisReports
                  loading={loading}
                  genderBasisMetrics={
                    (data &&
                      (data.fetchBirthRegistrationMetrics &&
                        (data.fetchBirthRegistrationMetrics
                          .genderBasisMetrics as GQLBirthRegistrationGenderBasisMetrics[]))) ||
                    []
                  }
                />
                <TimeFrameReports
                  loading={loading}
                  data={
                    (data &&
                      (data.fetchBirthRegistrationMetrics &&
                        (data.fetchBirthRegistrationMetrics
                          .timeFrames as GQLBirthRegistrationTimeFrameMetrics[]))) ||
                    []
                  }
                />
              </>
            )
          }}
        </Query>
      )}
    </PerformanceContentWrapper>
  )
}

function mapStateToProps(state: IStoreState, props: Props) {
  return {
    reportType:
      (props.location.state && props.location.state.reportType) ||
      PERFORMANCE_REPORT_TYPE_WEEKY,
    timeRange: (props.location.state && props.location.state.timeRange) || {
      start: new Date(),
      end: new Date()
    },
    offlineResources: getOfflineData(state)
  }
}

export const Report = connect(
  mapStateToProps,
  { goBack }
)(injectIntl(ReportComponent))
