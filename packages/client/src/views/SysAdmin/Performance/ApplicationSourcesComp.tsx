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
import { ListViewItemSimplified } from '@opencrvs/components/lib/interface'
import React from 'react'
import {
  PerformanceTitle,
  PerformanceValue,
  PerformanceListHeader,
  ListContainer,
  calculateTotal,
  ReportContainer,
  TotalDisplayWithPercentage
} from '@client/views/SysAdmin/Performance/utils'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/performance'
import { GQLTotalMetricsResult } from '@opencrvs/gateway/src/graphql/schema'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { goToFieldAgentList } from '@client/navigation'
import { connect } from 'react-redux'

interface ApplicationSourcesProps {
  data: GQLTotalMetricsResult
  locationId?: string
  timeStart: string
  timeEnd: string
}
interface IDispatchProps {
  goToFieldAgentList: typeof goToFieldAgentList
}

export function ApplicationSourcesComp(
  props: ApplicationSourcesProps & IDispatchProps
) {
  const { data } = props
  const intl = useIntl()
  return (
    <ListContainer>
      <ReportContainer>
        <ListViewItemSimplified
          label={
            <PerformanceListHeader>
              {intl.formatMessage(messages.performanceApplicationSourcesHeader)}
            </PerformanceListHeader>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(messages.performanceTotalLabel)}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>{calculateTotal(data.results)}</PerformanceValue>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(
                messages.performanceFieldAgentsApplicationsLabel
              )}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              <TotalDisplayWithPercentage
                total={calculateTotal(
                  data.results.filter(
                    (item) => item.practitionerRole === 'FIELD_AGENT'
                  )
                )}
                ofNumber={calculateTotal(data.results)}
              ></TotalDisplayWithPercentage>
            </PerformanceValue>
          }
          actions={
            <LinkButton
              id="field-agent-list-view"
              onClick={() =>
                props.goToFieldAgentList(
                  props.timeStart,
                  props.timeEnd,
                  props.locationId
                )
              }
            >
              {intl.formatMessage(buttonMessages.view)}
            </LinkButton>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {' '}
              {intl.formatMessage(
                messages.performanceHospitalApplicationsLabel
              )}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              <TotalDisplayWithPercentage
                total={calculateTotal(
                  data.results.filter(
                    (item) => item.practitionerRole === 'HOSPITAL_NOTIFICATION'
                  )
                )}
                ofNumber={calculateTotal(data.results)}
              ></TotalDisplayWithPercentage>
            </PerformanceValue>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {' '}
              {intl.formatMessage(
                messages.performanceRegistrationAgentsApplicationsLabel
              )}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              <TotalDisplayWithPercentage
                total={calculateTotal(
                  data.results.filter(
                    (item) => item.practitionerRole === 'REGISTRATION_AGENT'
                  )
                )}
                ofNumber={calculateTotal(data.results)}
              ></TotalDisplayWithPercentage>
            </PerformanceValue>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {' '}
              {intl.formatMessage(
                messages.performanceRegistrarsApplicationsLabel
              )}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              <TotalDisplayWithPercentage
                total={calculateTotal(
                  data.results.filter((item) =>
                    [
                      'LOCAL_REGISTRAR',
                      'DISTRICT_REGISTRAR',
                      'STATE_REGISTRAR',
                      'NATIONAL_REGISTRAR'
                    ].includes(item.practitionerRole)
                  )
                )}
                ofNumber={calculateTotal(data.results)}
              ></TotalDisplayWithPercentage>
            </PerformanceValue>
          }
        />
      </ReportContainer>
    </ListContainer>
  )
}
export const AppSources = connect<ApplicationSourcesProps, IDispatchProps>(
  undefined,
  {
    goToFieldAgentList
  }
)(ApplicationSourcesComp)
