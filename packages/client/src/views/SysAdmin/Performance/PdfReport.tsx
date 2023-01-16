import { RegRatesLineChart } from '@client/components/charts/RegRatesLineChart'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { Query } from '@client/components/Query'

import * as React from 'react'
import { FETCH_LOCATION_WISE_EVENT_ESTIMATIONS } from './queries'
import { CompletenessDataTable } from './reports/completenessRates/CompletenessDataTable'
import { Box } from '@opencrvs/components/lib/Box'
import { IntlShape } from 'react-intl'
import { IExportReportButtonProps } from './ExportReportButton'
import { COMPLETENESS_RATE_REPORT_BASE } from './CompletenessRates'
import { CompletenessRateTime } from './utils'
import { messages as performanceMessages } from '@client/i18n/messages/views/performance'
import { Divider, Table } from '@client/../../components/lib'
import { Text } from '@client/../../components/lib'
import formatDate from '@client/utils/date-formatting'
import { getRangeDescription } from './ExportReportModal'
interface IPdfReportProps extends React.HTMLAttributes<HTMLDivElement> {
  intl: IntlShape
  filters: IExportReportButtonProps
}

export const PdfReport = ({ intl, filters }: IPdfReportProps) => {
  return (
    <Box>
      <Text element="h1" variant="h1">
        {filters.selectedLocation.displayLabel
          .concat(' ')
          .concat(intl.formatMessage(performanceMessages.reportCrvTitle))}
      </Text>
      <Divider />
      <Table
        hideTableHeader
        columns={[
          { label: '', width: 50, key: 'label' },
          { label: '', width: 250, key: 'value' }
        ]}
        content={[
          {
            label: intl.formatMessage(performanceMessages.reportLocationLabel),
            value: filters.selectedLocation.displayLabel
          },
          {
            label: intl.formatMessage(performanceMessages.reportEventLabel),
            value: filters.event
          },
          {
            label: intl.formatMessage(
              performanceMessages.reportTimePeriodLabel
            ),
            value: getRangeDescription(filters.timeStart, filters.timeEnd)
          },
          {
            label: intl.formatMessage(performanceMessages.reportCreatedOnLabel),
            value: formatDate(new Date(), 'yyyy-MM-dd')
          },
          {
            label: intl.formatMessage(
              performanceMessages.reportExportedByLabel
            ),
            value: "TODO: Get current user's name"
          }
        ]}
      />
      <Text element="h2" variant="h2">
        {intl.formatMessage(
          performanceMessages.performanceCompletenessRatesHeader
        )}
      </Text>
      <Text element="p" variant="reg12">
        {intl.formatMessage(
          performanceMessages.performanceCompletenessRatesSubHeader,
          {
            event: filters.event
          }
        )}
      </Text>
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
    </Box>
  )
}
