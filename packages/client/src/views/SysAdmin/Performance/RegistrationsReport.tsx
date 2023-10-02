/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { ListViewItemSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import React from 'react'
import {
  PerformanceTitle,
  PerformanceValue,
  Breakdown,
  BreakdownRow,
  BreakdownLabel,
  BreakdownValue,
  ReportContainer,
  PercentageDisplay,
  calculateTotal,
  TotalDisplayWithPercentage,
  PerformanceListHeader
} from '@client/views/SysAdmin/Performance/utils'
import { GQLTotalMetricsResult } from '@opencrvs/gateway/src/graphql/schema'
import { messages } from '@client/i18n/messages/views/performance'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages/buttons'
import { useDispatch } from 'react-redux'
import { goToRegistrationsList } from '@client/navigation'

const ActionButton = styled(LinkButton)`
  align-self: baseline;
`
interface RegistrationsReportProps {
  data: GQLTotalMetricsResult
  selectedEvent: 'BIRTH' | 'DEATH'
  timeStart: string
  timeEnd: string
  locationId: string
}

export function RegistrationsReport({
  data,
  selectedEvent,
  timeStart,
  timeEnd,
  locationId
}: RegistrationsReportProps) {
  const dispatch = useDispatch()
  const intl = useIntl()
  return (
    <ReportContainer>
      <ListViewItemSimplified
        label={
          <div>
            <PerformanceListHeader>
              {intl.formatMessage(messages.performanceTotalRegitrationsHeader)}
            </PerformanceListHeader>
          </div>
        }
      />
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
        actions={
          <ActionButton
            onClick={() => {
              dispatch(
                goToRegistrationsList(
                  timeStart,
                  timeEnd,
                  locationId,
                  selectedEvent
                )
              )
            }}
          >
            {intl.formatMessage(buttonMessages.view)}
          </ActionButton>
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
                      data.results.filter((x) =>
                        ['withinLate'].includes(x.timeLabel)
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
                              ['withinLate'].includes(x.timeLabel)
                          )
                        )}
                        ofNumber={calculateTotal(
                          data.results.filter((x) =>
                            ['withinLate'].includes(x.timeLabel)
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
                              ['withinLate'].includes(x.timeLabel)
                          )
                        )}
                        ofNumber={calculateTotal(
                          data.results.filter((x) =>
                            ['withinLate'].includes(x.timeLabel)
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
                    data.results.filter((x) =>
                      ['DECEASED_USUAL_RESIDENCE', 'PRIVATE_HOME'].includes(
                        x.eventLocationType
                      )
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
                    data.results.filter((x) =>
                      ['HEALTH_FACILITY'].includes(x.eventLocationType)
                    )
                  )}
                  ofNumber={calculateTotal(data.results)}
                />
              }
            </PerformanceValue>
          </div>
        }
      />
    </ReportContainer>
  )
}
