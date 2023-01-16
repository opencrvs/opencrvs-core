import React from 'react'
import {
  CompletenessRateTime,
  PerformanceListHeader,
  PerformanceListSubHeader
} from '../../utils'
import { messages as performanceMessages } from '@client/i18n/messages/views/performance'
import { IntlShape } from 'react-intl'
import { IExportReportButtonProps } from '../../ExportReportButton'
import { Query } from '@client/components/Query'
import { FETCH_LOCATION_WISE_EVENT_ESTIMATIONS } from '../../queries'
import { COMPLETENESS_RATE_REPORT_BASE } from '../../CompletenessRates'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { CompletenessDataTable } from '../completenessRates/CompletenessDataTable'

interface ICompletenessSectionProps {
  intl: IntlShape
  filters: IExportReportButtonProps
}

export const CompletenessSection = ({
  intl,
  filters
}: ICompletenessSectionProps) => {
  return (
    <>
      <PerformanceListHeader>
        {intl.formatMessage(
          performanceMessages.performanceCompletenessRatesHeader
        )}
      </PerformanceListHeader>
      <PerformanceListSubHeader>
        {intl.formatMessage(
          performanceMessages.performanceCompletenessRatesSubHeader,
          {
            event: filters.event
          }
        )}
      </PerformanceListSubHeader>
      <Query
        query={FETCH_LOCATION_WISE_EVENT_ESTIMATIONS}
        variables={{
          event: filters.event,
          timeStart: filters.timeStart,
          timeEnd: filters.timeEnd
          //locationId: props.filters.selectedLocation.searchableText - EMPTY FOR COUNTRIES, SEND IT FOR DISTRICTS
        }}
      >
        {({ data, loading, error }) => {
          if (error) {
            return (
              <>
                <CompletenessDataTable
                  loading={true}
                  base={{
                    baseType: COMPLETENESS_RATE_REPORT_BASE.LOCATION
                  }}
                  completenessRateTime={CompletenessRateTime.WithinTarget}
                />
                <GenericErrorToast />
              </>
            )
          } else {
            return (
              <>
                <CompletenessDataTable
                  loading={loading}
                  base={{
                    baseType: COMPLETENESS_RATE_REPORT_BASE.LOCATION
                  }}
                  data={data && data.fetchLocationWiseEventMetrics}
                  eventType={filters.event}
                  completenessRateTime={CompletenessRateTime.WithinTarget}
                />
              </>
            )
          }
        }}
      </Query>
    </>
  )
}
