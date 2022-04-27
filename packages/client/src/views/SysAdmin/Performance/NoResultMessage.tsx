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
import { messages } from '@client/i18n/messages/views/performance'
import styled from '@client/styledComponents'
import { goToPerformanceHome } from '@client/navigation'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { generatePilotLocations } from '@client/utils/locationUtils'
import { LinkButton } from '@opencrvs/components/lib/buttons'

const MessageContainer = styled.div`
  margin: 0;
`
const StyledHeader = styled.h3`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.h3};
  margin: 16px 0;
`
interface NoResultMessageProps {
  id?: string
  searchedLocation: string
}

interface DispatchProps {
  goToPerformanceHome: typeof goToPerformanceHome
}

const MessageRow = styled.div`
  margin-bottom: 10px;
`

type Props = NoResultMessageProps &
  WrappedComponentProps &
  DispatchProps & {
    offlineCountryConfiguration: IOfflineData
  }

class NoResultMessageComponent extends React.Component<Props> {
  render() {
    const { id, intl, searchedLocation, offlineCountryConfiguration } =
      this.props
    return (
      (offlineCountryConfiguration.pilotLocations &&
        Object.keys(offlineCountryConfiguration.pilotLocations).length > 0 && (
          <MessageContainer>
            <StyledHeader id={`noResults-${id}`}>
              {intl.formatMessage(messages.noResultForLocation, {
                searchedLocation
              })}
            </StyledHeader>
            {generatePilotLocations(
              offlineCountryConfiguration.pilotLocations,
              offlineCountryConfiguration.locations,
              intl
            ).map((pilotLocation, index) => (
              <MessageRow key={index}>
                <LinkButton
                  id={`pilot-location-link-${index}`}
                  key={index}
                  onClick={() =>
                    this.props.goToPerformanceHome(
                      undefined,
                      undefined,
                      pilotLocation.id
                    )
                  }
                >
                  {pilotLocation.displayLabel}
                </LinkButton>
              </MessageRow>
            ))}
          </MessageContainer>
        )) || (
        <MessageContainer>
          <StyledHeader id={`noResults-${id}`}>
            {intl.formatMessage(messages.noResultForLocationWithoutPilotAreas, {
              searchedLocation
            })}
          </StyledHeader>
        </MessageContainer>
      )
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    offlineCountryConfiguration: getOfflineData(state)
  }
}

export const NoResultMessage = connect(mapStateToProps, {
  goToPerformanceHome
})(injectIntl(NoResultMessageComponent))
