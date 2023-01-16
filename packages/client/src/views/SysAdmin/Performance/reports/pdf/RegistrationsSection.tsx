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

interface IRegistrationsSectionProps {
  intl: IntlShape
  filters: IExportReportButtonProps
}

export const RegistrationsSection = ({
  intl,
  filters
}: IRegistrationsSectionProps) => {
  return <div>Registrations go here</div>
}
