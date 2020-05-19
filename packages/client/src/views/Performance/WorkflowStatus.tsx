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
import { ListTable } from '@opencrvs/components/lib/interface'
import { IColumn } from '@opencrvs/components/lib/interface/GridTable/types'

interface DispatchProps {
  goToOperationalReport: typeof goToOperationalReport
}

interface ISearchParams {
  locationId: string
  sectionId: OPERATIONAL_REPORT_SECTION
  timeStart: string
  timeEnd: string
}

const MOCK_CONTENT = [
  {
    compositionId: 'BKJASD',
    status: 'WAITING_VALIDATION',
    eventType: 'BIRTH',
    dateOfEvent: '2020-05-01',
    nameIntl: 'Hello',
    nameLocal: 'World',
    applicant: 'Mother 0168780980',
    applicationStartedOn: '2020-05-05',
    applicationStartedBy: 'Shakib al hasan\n(Field agent)',
    timeLoggedInProgress: '00:00:00:00',
    timeLoggedDeclared: '00:00:00:00',
    timeLoggedRejected: '00:00:00:00',
    timeLoggedValidated: '00:00:00:00',
    timeLoggedWaitingValidation: '00:00:00:00',
    timeLoggedRegistered: '00:00:00:00'
  }
]
interface WorkflowStatusProps
  extends RouteComponentProps,
    DispatchProps,
    WrappedComponentProps {}
function WorkflowStatusComponent(props: WorkflowStatusProps) {
  const { intl } = props
  const { locationId, sectionId, timeStart, timeEnd } = (querystring.parse(
    props.location.search
  ) as unknown) as ISearchParams

  function getColumns(): IColumn[] {
    return [
      {
        label: 'Applications',
        key: 'compositionId',
        width: 15
      },
      {
        label: 'Status',
        key: 'status',
        width: 15
      },
      {
        label: 'Event type',
        key: 'eventType',
        width: 10
      },
      {
        label: 'Date of event',
        key: 'dateOfEvent',
        width: 15
      },
      {
        label: 'English name',
        key: 'nameIntl',
        width: 15
      },
      {
        label: 'Bengali name',
        key: 'nameLocal',
        width: 15
      },
      {
        label: 'Applicant',
        key: 'applicant',
        width: 20
      },
      {
        label: 'Application started',
        key: 'applicationStartedOn',
        width: 20
      },
      {
        label: 'Started by',
        key: 'applicationStartedBy',
        width: 20
      },
      {
        label: 'Time in progress',
        key: 'timeLoggedInProgress',
        width: 15
      },
      {
        label: 'Time in ready for review',
        key: 'timeLoggedDeclared',
        width: 15
      },
      {
        label: 'Time in require updates',
        key: 'timeLoggedRejected',
        width: 15
      },
      {
        label: 'Time in waiting for approval',
        key: 'timeLoggedValidated',
        width: 15
      },
      {
        label: 'Time in waiting for waiting for BRIS',
        key: 'timeLoggedWaitingValidation',
        width: 15
      },
      {
        label: 'Time in ready to print',
        key: 'timeLoggedRegistered',
        width: 15
      }
    ]
  }

  function getContent() {
    return MOCK_CONTENT
  }

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
    >
      <ListTable
        content={getContent()}
        columns={getColumns()}
        noResultText={'No results'}
        hideBoxShadow
      />
    </PerformanceContentWrapper>
  )
}

export const WorkflowStatus = connect(
  null,
  { goToOperationalReport }
)(injectIntl(WorkflowStatusComponent))
