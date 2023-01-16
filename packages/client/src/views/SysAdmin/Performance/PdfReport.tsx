import { RegRatesLineChart } from '@client/components/charts/RegRatesLineChart'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { Query } from '@client/components/Query'

import * as React from 'react'
import { FETCH_LOCATION_WISE_EVENT_ESTIMATIONS } from './queries'
import { CompletenessDataTable } from './reports/completenessRates/CompletenessDataTable'
import { Box } from '@opencrvs/components/lib/Box'
import { IntlShape } from 'react-intl'
import { IExportReportFilters } from './ExportReportButton'
import { COMPLETENESS_RATE_REPORT_BASE } from './CompletenessRates'
import { CompletenessRateTime } from './utils'

interface IPdfReportProps extends React.HTMLAttributes<HTMLDivElement> {
  intl: IntlShape
  filters: IExportReportFilters
}

export const PdfReport = (props: IPdfReportProps) => {
  return (
    <Box>
      <Query
        query={FETCH_LOCATION_WISE_EVENT_ESTIMATIONS}
        variables={{
          event: props.filters.event,
          timeStart: props.filters.timeStart,
          timeEnd: props.filters.timeEnd
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
                  eventType={props.filters.event}
                  completenessRateTime={CompletenessRateTime.WithinTarget}
                />
              </>
            )
          }
        }}
      </Query>
    </Box>
  )
}
