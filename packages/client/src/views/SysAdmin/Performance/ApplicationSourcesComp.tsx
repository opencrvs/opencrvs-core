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
import { GQLTotalMetricsResult } from '@opencrvs/gateway/src/graphql/schema'

interface ApplicationSourcesProps {
  data: GQLTotalMetricsResult
}

export function ApplicationSourcesComp(props: ApplicationSourcesProps) {
  const { data } = props
  return (
    <ListContainer>
      <ReportContainer>
        <ListViewItemSimplified
          label={
            <PerformanceListHeader>
              Sources of applications
            </PerformanceListHeader>
          }
        />
        <ListViewItemSimplified
          label={<PerformanceTitle>Total</PerformanceTitle>}
          value={
            <PerformanceValue>{calculateTotal(data.results)}</PerformanceValue>
          }
        />
        <ListViewItemSimplified
          label={<PerformanceTitle>Field Agents</PerformanceTitle>}
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
        />
        <ListViewItemSimplified
          label={<PerformanceTitle>Registration Agents</PerformanceTitle>}
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
          label={<PerformanceTitle>Registrars</PerformanceTitle>}
          value={
            <PerformanceValue>
              <TotalDisplayWithPercentage
                total={calculateTotal(
                  data.results.filter(
                    (item) => item.practitionerRole === 'REGISTRAR'
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
