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
import { HAS_CHILD_LOCATION } from './queries'
import { messages } from '@client/i18n/messages/views/performance'
import { PerformanceSelect } from './PerformanceSelect'
import { connect } from 'react-redux'
import { getJurisidictionType } from '@client/views/Performance/utils'
import { goToOperationalReport } from '@client/navigation'
import { Within45DaysTable } from './reports/registrationRates/Within45DaysTable'
import { Event } from '@client/forms'

const { useState } = React
const Header = styled.h1`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.h2Style};
`
const NavigationActionContainer = styled.div`
  margin-top: 24px;
`
const ActionContainer = styled.div`
  display: flex;
  & > button {
    margin-right: 8px;
  }

  & > :last-child {
    margin-right: 0;
  }
`
enum REG_RATE_BASE {
  TIME = 'TIME',
  LOCATION = 'LOCATION'
}

interface IDispatchProps {
  goToOperationalReport: typeof goToOperationalReport
}
type IRegistrationRateProps = RouteComponentProps<{ eventType: string }> &
  WrappedComponentProps &
  IDispatchProps

const mockData = [
  {
    time: new Date(2020, 3),
    total: 10000,
    regWithin45d: 5000,
    estimated: 20000,
    percentage: 23.5
  },
  {
    time: new Date(2020, 2),
    total: 8000,
    regWithin45d: 4500,
    estimated: 20000,
    percentage: 16
  },
  {
    time: new Date(2020, 1),
    total: 9000,
    regWithin45d: 4000,
    estimated: 20000,
    percentage: 14
  },
  {
    time: new Date(2020, 0),
    total: 7000,
    regWithin45d: 3500,
    estimated: 20000,
    percentage: 12.5
  },
  {
    time: new Date(2019, 11),
    total: 6000,
    regWithin45d: 3000,
    estimated: 15000,
    percentage: 12
  },
  {
    time: new Date(2019, 10),
    total: 5500,
    regWithin45d: 2500,
    estimated: 15000,
    percentage: 11
  },
  {
    time: new Date(2019, 9),
    total: 6500,
    regWithin45d: 2500,
    estimated: 15000,
    percentage: 10
  },
  {
    time: new Date(2019, 8),
    total: 4500,
    regWithin45d: 2000,
    estimated: 15000,
    percentage: 8
  },
  {
    time: new Date(2019, 7),
    total: 3500,
    regWithin45d: 1500,
    estimated: 15000,
    percentage: 7
  },
  {
    time: new Date(2019, 6),
    total: 2500,
    regWithin45d: 500,
    estimated: 15000,
    percentage: 7.5
  },
  {
    time: new Date(2019, 5),
    total: 2000,
    regWithin45d: 250,
    estimated: 15000,
    percentage: 2
  },
  {
    time: new Date(2019, 4),
    total: 1000,
    regWithin45d: 100,
    estimated: 15000,
    percentage: 1.5
  }
]

function RegistrationRatesComponent(props: IRegistrationRateProps) {
  const [base, setBase] = useState<REG_RATE_BASE>(REG_RATE_BASE.TIME)

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
  const { title, selectedLocation } = state

  return (
    <PerformanceContentWrapper hideTopBar>
      <NavigationActionContainer>
        <TertiaryButton
          id="reg-rates-action-back"
          icon={() => <ArrowBack />}
          align={ICON_ALIGNMENT.LEFT}
          onClick={() => goToOperationalReport(selectedLocation)}
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
          let options = [
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
              value: REG_RATE_BASE.LOCATION
            })
          }

          return (
            <ActionContainer>
              <PerformanceSelect
                id="base-select"
                value={base}
                options={options}
                onChange={val => setBase(val as REG_RATE_BASE)}
              />
            </ActionContainer>
          )
        }}
      </Query>
      <Within45DaysTable data={mockData} eventType={eventType as Event} />
    </PerformanceContentWrapper>
  )
}

export const RegistrationRates = connect(
  null,
  { goToOperationalReport }
)(injectIntl(RegistrationRatesComponent))
