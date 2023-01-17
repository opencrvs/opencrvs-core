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
import { ListViewItemSimplified } from '@client/../../components/lib'
import { GQLEventMetrics } from '@client/../../gateway/src/graphql/schema'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { Query } from '@client/components/Query'
import { advancedSearchDeathSectionInformantDetails } from '@client/forms/advancedSearch/fieldDefinitions/Death'
import { messages as performanceMessages } from '@client/i18n/messages/views/performance'
import React from 'react'
import { IntlShape } from 'react-intl'
import { COMPLETENESS_RATE_REPORT_BASE } from '../../CompletenessRates'
import { IExportReportButtonProps } from '../../ExportReportButton'
import { FETCH_LOCATION_WISE_EVENT_ESTIMATIONS } from '../../queries'
import {
  Breakdown,
  BreakdownLabel,
  BreakdownRow,
  BreakdownValue,
  calculateTotal,
  CompletenessRateTime,
  PercentageDisplay,
  PerformanceListHeader,
  PerformanceListSubHeader,
  PerformanceTitle,
  PerformanceValue
} from '../../utils'
import { CompletenessDataTable } from '../completenessRates/CompletenessDataTable'

interface ICompletenessSectionProps {
  intl: IntlShape
  filters: IExportReportButtonProps
}

interface ICompletenessSectionForTimeframeProps
  extends ICompletenessSectionProps {
  title: string
  range: string
  time: CompletenessRateTime
  filterFunction: (p: GQLEventMetrics) => boolean
}

export const CompletenessSection = ({
  intl,
  filters
}: ICompletenessSectionProps) => {
  {
    // TODO: Is there a way to reuse these components, rather than duplicating what is in CompletenessReport and CompletenessRate components?
    return (
      <>
        <PerformanceListHeader>
          {intl.formatMessage(
            performanceMessages.performanceCompletenessRatesHeader
          )}
        </PerformanceListHeader>
        <PerformanceListSubHeader>
          {intl.formatMessage(
            performanceMessages.performanceCompletenessRatesSubHeader,
            {
              event: filters.event
            }
          )}
        </PerformanceListSubHeader>
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(
                performanceMessages.performanceWithinTargetDaysLabel,
                {
                  target:
                    window.config[
                      (filters.event.toUpperCase() as 'BIRTH') || 'DEATH'
                    ].REGISTRATION_TARGET,
                  withPrefix: false
                }
              )}
            </PerformanceTitle>
          }
          value={
            <div>
              <PerformanceValue>
                <PercentageDisplay
                  total={filters.data.results
                    .filter((p) => p.timeLabel === 'withinTarget')
                    .reduce((t, x) => t + x.total, 0)}
                  ofNumber={filters.data.estimated.totalEstimation}
                />
              </PerformanceValue>
              <Breakdown>
                <BreakdownRow>
                  <BreakdownLabel>
                    {intl.formatMessage(
                      performanceMessages.performanceMaleLabel
                    )}
                    :{' '}
                  </BreakdownLabel>
                  <BreakdownValue>
                    {
                      <PercentageDisplay
                        total={calculateTotal(
                          filters.data.results.filter(
                            (x) =>
                              x.gender === 'male' &&
                              x.timeLabel === 'withinTarget'
                          )
                        )}
                        ofNumber={calculateTotal(
                          filters.data.results.filter(
                            (x) => x.timeLabel === 'withinTarget'
                          )
                        )}
                      />
                    }
                  </BreakdownValue>
                </BreakdownRow>
                <BreakdownRow>
                  <BreakdownLabel>
                    {intl.formatMessage(
                      performanceMessages.performanceFemaleLabel
                    )}
                    :{' '}
                  </BreakdownLabel>
                  <BreakdownValue>
                    {
                      <PercentageDisplay
                        total={calculateTotal(
                          filters.data.results.filter(
                            (x) =>
                              x.gender === 'female' &&
                              x.timeLabel === 'withinTarget'
                          )
                        )}
                        ofNumber={calculateTotal(
                          filters.data.results.filter(
                            (x) => x.timeLabel === 'withinTarget'
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
        <Query
          query={FETCH_LOCATION_WISE_EVENT_ESTIMATIONS}
          variables={{
            event: filters.event,
            timeStart: filters.timeStart,
            timeEnd: filters.timeEnd
            //locationId: props.filters.selectedLocation.searchableText - EMPTY FOR COUNTRIES, SEND IT FOR DISTRICTS
          }}
        >
          {({ data, loading, error }) => {
            if (error) {
              return (
                <>
                  <CompletenessDataTable
                    loading={true}
                    base={{
                      baseType: COMPLETENESS_RATE_REPORT_BASE.LOCATION
                    }}
                    completenessRateTime={CompletenessRateTime.WithinTarget}
                  />
                  <GenericErrorToast />
                </>
              )
            } else {
              return (
                <>
                  <CompletenessDataTable
                    loading={loading}
                    base={{
                      baseType: COMPLETENESS_RATE_REPORT_BASE.LOCATION
                    }}
                    data={data && data.fetchLocationWiseEventMetrics}
                    eventType={filters.event}
                    completenessRateTime={CompletenessRateTime.WithinTarget}
                  />
                </>
              )
            }
          }}
        </Query>
      </>
    )
  }
}
