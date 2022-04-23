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
import {
  PerformanceTitle,
  PerformanceValue,
  Breakdown,
  BreakdownRow,
  BreakdownLabel,
  BreakdownValue,
  PercentageDisplay,
  calculateTotal,
  TotalDisplayWithPercentage
} from '@client/views/SysAdmin/Performance/utils'
import { GQLTotalMetricsResult } from '@opencrvs/gateway/src/graphql/schema'
import { messages } from '@client/i18n/messages/views/performance'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
interface RegistrationsReportProps {
  data: GQLTotalMetricsResult
  selectedEvent: 'BIRTH' | 'DEATH'
}

const Container = styled(ListViewSimplified)`
  grid-template-columns: auto 1fr minmax(5em, auto);
`

export function RegistrationsReport({
  data,
  selectedEvent
}: RegistrationsReportProps) {
  const intl = useIntl()
  return (
    <Container>
      <ListViewItemSimplified
        label={
          <PerformanceTitle>
            {intl.formatMessage(messages.performanceTotalLabel)}
          </PerformanceTitle>
        }
        value={
          <div>
            <PerformanceValue>
              {data.results.reduce((m, x) => m + x.total, 0)}
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
                        data.results.filter((x) => x.gender === 'male')
                      )}
                      ofNumber={calculateTotal(data.results)}
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
                        data.results.filter((x) => x.gender === 'female')
                      )}
                      ofNumber={calculateTotal(data.results)}
                    />
                  }
                </BreakdownValue>
              </BreakdownRow>
            </Breakdown>
          </div>
        }
      />
      {selectedEvent === 'BIRTH' && (
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(messages.performanceLateRegistrationsLabel)}
            </PerformanceTitle>
          }
          value={
            <div>
              <PerformanceValue>
                {
                  <TotalDisplayWithPercentage
                    total={calculateTotal(
                      data.results.filter(
                        (x) => !['withinLate'].includes(x.timeLabel)
                      )
                    )}
                    ofNumber={calculateTotal(data.results)}
                  />
                }
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
                              !['withinLate'].includes(x.timeLabel)
                          )
                        )}
                        ofNumber={calculateTotal(
                          data.results.filter(
                            (x) => !['withinLate'].includes(x.timeLabel)
                          )
                        )}
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
                              !['withinLate', 'withinTarget'].includes(
                                x.timeLabel
                              )
                          )
                        )}
                        ofNumber={calculateTotal(
                          data.results.filter(
                            (x) =>
                              !['withinLate', 'withinTarget'].includes(
                                x.timeLabel
                              )
                          )
                        )}
                      />
                    }
                  </BreakdownValue>
                </BreakdownRow>
              </Breakdown>
            </div>
          }
        />
      )}

      <ListViewItemSimplified
        label={
          <PerformanceTitle>
            {intl.formatMessage(messages.performanceDelayedRegistrationsLabel)}
          </PerformanceTitle>
        }
        value={
          <div>
            <PerformanceValue>
              {
                <TotalDisplayWithPercentage
                  total={calculateTotal(
                    data.results.filter(
                      (x) =>
                        !['withinLate', 'withinTarget'].includes(x.timeLabel)
                    )
                  )}
                  ofNumber={calculateTotal(data.results)}
                />
              }
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
                            !['withinLate', 'withinTarget'].includes(
                              x.timeLabel
                            )
                        )
                      )}
                      ofNumber={calculateTotal(
                        data.results.filter(
                          (x) =>
                            !['withinLate', 'withinTarget'].includes(
                              x.timeLabel
                            )
                        )
                      )}
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
                            !['withinLate', 'withinTarget'].includes(
                              x.timeLabel
                            )
                        )
                      )}
                      ofNumber={calculateTotal(
                        data.results.filter(
                          (x) =>
                            !['withinLate', 'withinTarget'].includes(
                              x.timeLabel
                            )
                        )
                      )}
                    />
                  }
                </BreakdownValue>
              </BreakdownRow>
            </Breakdown>
          </div>
        }
      />
      <ListViewItemSimplified
        label={
          selectedEvent === 'BIRTH' ? (
            <PerformanceTitle>
              {intl.formatMessage(messages.performanceHomeBirth)}
            </PerformanceTitle>
          ) : (
            <PerformanceTitle>
              {intl.formatMessage(messages.performanceHomeDeath)}
            </PerformanceTitle>
          )
        }
        value={
          <div>
            <PerformanceValue>
              {
                <TotalDisplayWithPercentage
                  total={calculateTotal(
                    data.results.filter(
                      (x) => x.eventLocationType === 'PRIVATE_HOME'
                    )
                  )}
                  ofNumber={calculateTotal(data.results)}
                />
              }
            </PerformanceValue>
          </div>
        }
      />
      <ListViewItemSimplified
        label={
          selectedEvent === 'BIRTH' ? (
            <PerformanceTitle>
              {intl.formatMessage(messages.performanceHealthFacilityBirth)}
            </PerformanceTitle>
          ) : (
            <PerformanceTitle>
              {intl.formatMessage(messages.performanceHealthFacilityDeath)}
            </PerformanceTitle>
          )
        }
        value={
          <div>
            <PerformanceValue>
              {
                <TotalDisplayWithPercentage
                  total={calculateTotal(
                    data.results.filter(
                      (x) => x.eventLocationType === 'HEALTH_FACILITY'
                    )
                  )}
                  ofNumber={calculateTotal(data.results)}
                />
              }
            </PerformanceValue>
          </div>
        }
      />
    </Container>
  )
}
