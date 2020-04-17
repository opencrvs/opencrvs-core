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
import { GET_CHILD_LOCATIONS_BY_PARENT_ID } from './queries'
import { messages } from '@client/i18n/messages/views/performance'
import { PerformanceSelect } from './PerformanceSelect'
import { connect } from 'react-redux'
import { transformChildLocations } from '@client/views/Performance/utils'
import { goToOperationalReport } from '@client/navigation'

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
        query={GET_CHILD_LOCATIONS_BY_PARENT_ID}
        variables={{ parentId: selectedLocation.id }}
      >
        {({ data, loading, error }) => {
          let options = [
            {
              label: intl.formatMessage(messages.overTime),
              value: REG_RATE_BASE.TIME
            }
          ]
          if (data) {
            const {
              childLocations,
              jurisdictionType
            } = transformChildLocations(data.locationsByParent)

            if (childLocations.length > 0) {
              options.push({
                label: intl.formatMessage(messages.byLocation, {
                  jurisdictionType
                }),
                value: REG_RATE_BASE.LOCATION
              })
            }
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
    </PerformanceContentWrapper>
  )
}

export const RegistrationRates = connect(
  null,
  { goToOperationalReport }
)(injectIntl(RegistrationRatesComponent))
