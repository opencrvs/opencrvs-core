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
import * as React from 'react'
import { WrappedComponentProps, injectIntl } from 'react-intl'
import { RouteComponentProps } from 'react-router'
import {
  PerformanceContentWrapper,
  PerformancePageVariant
} from '@client/views/Performance/PerformanceContentWrapper'
import { messages } from '@client/i18n/messages/views/performance'
import querystring from 'query-string'
import { goToOperationalReport } from '@client/navigation'
import { connect } from 'react-redux'
import { OPERATIONAL_REPORT_SECTION } from './OperationalReport'

interface DispatchProps {
  goToOperationalReport: typeof goToOperationalReport
}

interface ISearchParams {
  locationId: string
  sectionId: OPERATIONAL_REPORT_SECTION
  timeStart: string
  timeEnd: string
}

interface WorkflowStatusProps
  extends RouteComponentProps,
    DispatchProps,
    WrappedComponentProps {}
function WorkflowStatusComponent(props: WorkflowStatusProps) {
  const { intl } = props
  const { locationId, sectionId, timeStart, timeEnd } = (querystring.parse(
    props.location.search
  ) as unknown) as ISearchParams
  return (
    <PerformanceContentWrapper
      id="workflow-status"
      type={PerformancePageVariant.SUBPAGE}
      headerTitle={intl.formatMessage(messages.workflowStatusHeader)}
      backActionHandler={() =>
        props.goToOperationalReport(
          locationId,
          sectionId,
          new Date(timeStart),
          new Date(timeEnd)
        )
      }
      hideTopBar
    />
  )
}

export const WorkflowStatus = connect(
  null,
  { goToOperationalReport }
)(injectIntl(WorkflowStatusComponent))
