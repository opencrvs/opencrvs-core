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
import { RouteComponentProps } from 'react-router'

import { PerformanceContentWrapper } from '@client/views/Performance/PerformanceContentWrapper'
import {
  TertiaryButton,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import { WrappedComponentProps, injectIntl } from 'react-intl'
import { buttonMessages } from '@client/i18n/messages'
import { ArrowBack } from '@opencrvs/components/lib/icons'
import styled from '@client/styledComponents'
import { Query } from '@client/components/Query'
import {
  HAS_CHILD_LOCATION,
  FETCH_MONTH_WISE_EVENT_ESTIMATIONS,
  FETCH_LOCATION_WISE_EVENT_ESTIMATIONS
} from './queries'
import { messages } from '@client/i18n/messages/views/performance'
import {
  PerformanceSelect,
  IPerformanceSelectOption
} from './PerformanceSelect'
import { connect } from 'react-redux'
import {
  getJurisidictionType,
  Header,
  ActionContainer
} from '@client/views/Performance/utils'
import { goToOperationalReport } from '@client/navigation'
import { Within45DaysTable } from './reports/registrationRates/Within45DaysTable'
import { Event } from '@client/forms'
import { OPERATIONAL_REPORT_SECTION } from '@client/views/Performance/OperationalReport'

const { useState } = React
const NavigationActionContainer = styled.div`
  margin-top: 24px;
`

export enum REG_RATE_BASE {
  TIME = 'TIME',
  LOCATION = 'LOCATION'
}

interface IDispatchProps {
  goToOperationalReport: typeof goToOperationalReport
}
type IRegistrationRateProps = RouteComponentProps<{ eventType: string }> &
  WrappedComponentProps &
  IDispatchProps

export interface IEstimationBase {
  baseType: REG_RATE_BASE
  locationJurisdictionType?: string
}

function RegistrationRatesComponent(props: IRegistrationRateProps) {
  const [base, setBase] = useState<IEstimationBase>({
    baseType: REG_RATE_BASE.TIME
  })

  const {
    intl,
    history: {
      location: { state }
    },
    match: {
      params: { eventType }
    },
    goToOperationalReport
  } = props
  const { title, selectedLocation, timeStart, timeEnd } = state

  return (
    <PerformanceContentWrapper hideTopBar>
      <NavigationActionContainer>
        <TertiaryButton
          id="reg-rates-action-back"
          icon={() => <ArrowBack />}
          align={ICON_ALIGNMENT.LEFT}
          onClick={() =>
            goToOperationalReport(
              selectedLocation,
              OPERATIONAL_REPORT_SECTION.OPERATIONAL
            )
          }
        >
          {intl.formatMessage(buttonMessages.back)}
        </TertiaryButton>
      </NavigationActionContainer>
      <Header id="reg-rates-header">{title}</Header>

      <Query
        query={HAS_CHILD_LOCATION}
        variables={{ parentId: selectedLocation.id }}
      >
        {({ data, loading, error }) => {
          let options: IPerformanceSelectOption[] = [
            {
              label: intl.formatMessage(messages.overTime),
              value: REG_RATE_BASE.TIME
            }
          ]
          if (
            data.hasChildLocation &&
            data.hasChildLocation.type === 'ADMIN_STRUCTURE'
          ) {
            const jurisdictionType = getJurisidictionType(data.hasChildLocation)

            options.push({
              label: intl.formatMessage(messages.byLocation, {
                jurisdictionType
              }),
              value: REG_RATE_BASE.LOCATION,
              type: jurisdictionType || ''
            })
          }

          return (
            <ActionContainer>
              <PerformanceSelect
                id="base-select"
                value={base.baseType}
                options={options}
                onChange={option =>
                  setBase({
                    baseType: option.value as REG_RATE_BASE,
                    locationJurisdictionType: option.type
                  })
                }
              />
            </ActionContainer>
          )
        }}
      </Query>
      <Query
        query={
          base.baseType === REG_RATE_BASE.TIME
            ? FETCH_MONTH_WISE_EVENT_ESTIMATIONS
            : FETCH_LOCATION_WISE_EVENT_ESTIMATIONS
        }
        variables={{
          event: eventType.toUpperCase(),
          timeStart: timeStart.toISOString(),
          timeEnd: timeEnd.toISOString(),
          locationId: selectedLocation.id
        }}
      >
        {({ data, loading, error }) => {
          if (error) {
            // TODO: need error view here
            return <></>
          } else {
            return (
              <Within45DaysTable
                loading={loading}
                base={base}
                data={
                  data &&
                  (data.fetchMonthWiseEventMetrics ||
                    data.fetchLocationWiseEventMetrics)
                }
                eventType={eventType as Event}
              />
            )
          }
        }}
      </Query>
    </PerformanceContentWrapper>
  )
}

export const RegistrationRates = connect(
  null,
  { goToOperationalReport }
)(injectIntl(RegistrationRatesComponent))
