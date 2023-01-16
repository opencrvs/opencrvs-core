import { Box } from '@opencrvs/components/lib/Box'
import * as React from 'react'
import { IntlShape } from 'react-intl'
import { IExportReportButtonProps } from './ExportReportButton'

import { messages as performanceMessages } from '@client/i18n/messages/views/performance'
import { CompletenessSection } from './reports/pdf/CompletenessSection'
import { HeaderSection } from './reports/pdf/HeaderSection'
import { RegistrationsSection } from './reports/pdf/RegistrationsSection'

interface IPdfReportProps extends React.HTMLAttributes<HTMLDivElement> {
  intl: IntlShape
  filters: IExportReportButtonProps
  selectedSections: string[]
}

export const PdfReport = ({
  intl,
  filters,
  selectedSections
}: IPdfReportProps) => {
  console.log('filters in pdf report: ', filters)
  return (
    <Box>
      <HeaderSection filters={filters} intl={intl} />
      {selectedSections.indexOf(
        performanceMessages.performanceCompletenessRatesHeader.id
      ) > -1 && <CompletenessSection filters={filters} intl={intl} />}
      {selectedSections.indexOf(
        performanceMessages.performanceTotalRegistrationsHeader.id
      ) > -1 && <RegistrationsSection filters={filters} intl={intl} />}
    </Box>
  )
}
