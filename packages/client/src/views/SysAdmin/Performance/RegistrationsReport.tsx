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
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { useDispatch, useSelector } from 'react-redux'
import { goToRegistrations, useQuery } from '@client/navigation'
import { getOfflineData } from '@client/offline/selectors'

interface RegistrationsReportProps {
  data: GQLTotalMetricsResult
  selectedLocationId?: string
  selectedEvent: 'BIRTH' | 'DEATH'
}

export function RegistrationsReport({
  data,
  selectedEvent,
  selectedLocationId
}: RegistrationsReportProps) {
  const intl = useIntl()
  const dispatch = useDispatch()
  const query = useQuery()
  const { locations } = useSelector(getOfflineData)
  const shouldShowViewLink =
    selectedLocationId &&
    locations[selectedLocationId]?.jurisdictionType === 'DISTRICT'
  const timeStartFromQuery = query.get('timeStart')
  const timeEndFromQuery = query.get('timeEnd')
  const timeStart =
    typeof timeStartFromQuery === 'string'
      ? new Date(timeStartFromQuery)
      : undefined
  const timeEnd =
    typeof timeEndFromQuery === 'string'
      ? new Date(timeEndFromQuery)
      : undefined

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
          shouldShowViewLink && (
            <LinkButton
              id="registration-report-view"
              onClick={() =>
                dispatch(
                  goToRegistrations(
                    selectedEvent,
                    selectedLocationId!,
                    timeStart,
                    timeEnd
                  )
                )
              }
            >
              {intl.formatMessage(buttonMessages.view)}
            </LinkButton>
          )
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
                    data.results.filter(
                      (x) =>
                        !['DECEASED_USUAL_RESIDENCE', 'PRIVATE_HOME'].includes(
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
    </ReportContainer>
  )
}
