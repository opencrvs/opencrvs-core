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
import { Divider, Table } from '@client/../../components/lib'
import { Text } from '@client/../../components/lib'
import { getRangeDescription } from '../../ExportReportModal'
import { IntlShape } from 'react-intl'
import { messages as performanceMessages } from '@client/i18n/messages/views/performance'
import { IExportReportButtonProps } from '../../ExportReportButton'
import formatDate from '@client/utils/date-formatting'

interface IHeaderSectionProps {
  intl: IntlShape
  filters: IExportReportButtonProps
}

export const HeaderSection = ({ filters, intl }: IHeaderSectionProps) => {
  return (
    <>
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
    </>
  )
}
