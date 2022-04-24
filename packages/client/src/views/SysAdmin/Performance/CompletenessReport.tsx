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
  ListViewSimplified,
  ListViewItemSimplified
} from '@opencrvs/components/lib/interface'
import React from 'react'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { getPercentage } from '@client/utils/data-formatting'
import {
  PerformanceTitle,
  PerformanceValue,
  Breakdown,
  BreakdownRow,
  BreakdownLabel,
  BreakdownValue,
  PercentageDisplay,
  calculateTotal,
  PerformanceListHeader,
  PerformanceListSubHeader
} from '@client/views/SysAdmin/Performance/utils'
import { GQLTotalMetricsResult } from '@opencrvs/gateway/src/graphql/schema'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/performance'
import { buttonMessages } from '@client/i18n/messages/buttons'

interface CompletenessReportProps {
  data: GQLTotalMetricsResult
  selectedEvent: 'BIRTH' | 'DEATH'
}

const Container = styled(ListViewSimplified)`
  grid-template-columns: auto 1fr minmax(5em, auto);
`

export function CompletenessReport({
  data,
  selectedEvent
}: CompletenessReportProps) {
  const intl = useIntl()
  return (
    <Container>
      <ListViewItemSimplified
        label={
          <div>
            <PerformanceListHeader>Completeness rates</PerformanceListHeader>
            <PerformanceListSubHeader>
              The no. of registrations, expressed as a % of the total estimated
              no. of births occurring
            </PerformanceListSubHeader>
          </div>
        }
      />
      <ListViewItemSimplified
        label={
          <PerformanceTitle>
            {intl.formatMessage(messages.performanceWithinTargetDaysLabel, {
              target: window.config[selectedEvent].REGISTRATION_TARGET
            })}
          </PerformanceTitle>
        }
        value={
          <div>
            <PerformanceValue>
              {Number(
                data.results
                  .filter((p) => p.timeLabel === 'withinTarget')
                  .reduce((t, x) => t + x.total, 0) /
                  data.estimated.totalEstimation
              ).toFixed(2)}
              %
            </PerformanceValue>
            <Breakdown>
              <BreakdownRow>
                <BreakdownLabel>
                  {intl.formatMessage(messages.performanceMaleLabel)}:{' '}
                </BreakdownLabel>
                <BreakdownValue>
                  {
                    <PercentageDisplay
                      total={calculateTotal(
                        data.results.filter(
                          (x) =>
                            x.gender === 'male' &&
                            x.timeLabel === 'withinTarget'
                        )
                      )}
                      ofNumber={data.estimated.maleEstimation}
                    />
                  }
                </BreakdownValue>
              </BreakdownRow>
              <BreakdownRow>
                <BreakdownLabel>
                  {intl.formatMessage(messages.performanceFemaleLabel)}:{' '}
                </BreakdownLabel>
                <BreakdownValue>
                  {
                    <PercentageDisplay
                      total={calculateTotal(
                        data.results.filter(
                          (x) =>
                            x.gender === 'female' &&
                            x.timeLabel === 'withinTarget'
                        )
                      )}
                      ofNumber={data.estimated.femaleEstimation}
                    />
                  }
                </BreakdownValue>
              </BreakdownRow>
            </Breakdown>
          </div>
        }
        actions={
          <LinkButton>{intl.formatMessage(buttonMessages.view)}</LinkButton>
        }
      />
      <ListViewItemSimplified
        label={
          <PerformanceTitle>
            {intl.formatMessage(messages.performanceWithin1YearLabel)}
          </PerformanceTitle>
        }
        value={
          <div>
            <PerformanceValue>
              {getPercentage(
                data.estimated.totalEstimation,
                calculateTotal(
                  data.results.filter(
                    (x) =>
                      x.timeLabel === 'withinTarget' ||
                      x.timeLabel === 'withinLate' ||
                      x.timeLabel === 'within1Year'
                  )
                )
              )}
              %
            </PerformanceValue>
            <Breakdown>
              <BreakdownRow>
                <BreakdownLabel>
                  {intl.formatMessage(messages.performanceMaleLabel)}:{' '}
                </BreakdownLabel>
                <BreakdownValue>
                  {
                    <PercentageDisplay
                      total={calculateTotal(
                        data.results.filter(
                          (x) =>
                            x.gender === 'male' &&
                            (x.timeLabel === 'withinTarget' ||
                              x.timeLabel === 'withinLate' ||
                              x.timeLabel === 'within1Year')
                        )
                      )}
                      ofNumber={data.estimated.maleEstimation}
                    />
                  }
                </BreakdownValue>
              </BreakdownRow>
              <BreakdownRow>
                <BreakdownLabel>
                  {intl.formatMessage(messages.performanceFemaleLabel)}:{' '}
                </BreakdownLabel>
                <BreakdownValue>
                  {
                    <PercentageDisplay
                      total={calculateTotal(
                        data.results.filter(
                          (x) =>
                            x.gender === 'female' &&
                            (x.timeLabel === 'withinTarget' ||
                              x.timeLabel === 'withinLate' ||
                              x.timeLabel === 'within1Year')
                        )
                      )}
                      ofNumber={data.estimated.femaleEstimation}
                    />
                  }
                </BreakdownValue>
              </BreakdownRow>
            </Breakdown>
          </div>
        }
        actions={
          <LinkButton>{intl.formatMessage(buttonMessages.view)}</LinkButton>
        }
      />
      <ListViewItemSimplified
        label={
          <PerformanceTitle>
            {intl.formatMessage(messages.performanceWithin5YearsLabel)}
          </PerformanceTitle>
        }
        value={
          <div>
            <PerformanceValue>
              {getPercentage(
                data.estimated.totalEstimation,
                calculateTotal(
                  data.results.filter((x) => x.timeLabel !== 'after5Years')
                )
              )}
              %
            </PerformanceValue>
            <Breakdown>
              <BreakdownRow>
                <BreakdownLabel>
                  {intl.formatMessage(messages.performanceMaleLabel)}:{' '}
                </BreakdownLabel>
                <BreakdownValue>
                  <PercentageDisplay
                    ofNumber={data.estimated.maleEstimation}
                    total={calculateTotal(
                      data.results.filter(
                        (x) =>
                          x.gender === 'male' && x.timeLabel !== 'after5Years'
                      )
                    )}
                  />
                </BreakdownValue>
              </BreakdownRow>
              <BreakdownRow>
                <BreakdownLabel>
                  {intl.formatMessage(messages.performanceFemaleLabel)}:{' '}
                </BreakdownLabel>
                <BreakdownValue>
                  <PercentageDisplay
                    ofNumber={data.estimated.femaleEstimation}
                    total={calculateTotal(
                      data.results.filter(
                        (x) =>
                          x.gender === 'female' && x.timeLabel !== 'after5Years'
                      )
                    )}
                  />
                </BreakdownValue>
              </BreakdownRow>
            </Breakdown>
          </div>
        }
        actions={
          <LinkButton>{intl.formatMessage(buttonMessages.view)}</LinkButton>
        }
      />
    </Container>
  )
}
