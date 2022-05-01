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
import { constantsMessages } from '@client/i18n/messages'
import { messages as performanceMessages } from '@client/i18n/messages/views/performance'

import {
  Description,
  SubHeader,
  getJurisdictionLocationIdFromUserDetails,
  getPrimaryLocationIdOfOffice,
  isUnderJurisdictionOfUser
} from '@opencrvs/client/src/views/SysAdmin/Performance/utils'
import { ProgressBar } from '@opencrvs/components/lib/forms'
import { GQLRegistrationCountResult } from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import {
  injectIntl,
  MessageDescriptor,
  WrappedComponentProps
} from 'react-intl'
import styled from 'styled-components'
import { getOfflineData } from '@client/offline/selectors'
import { connect } from 'react-redux'
import { IStoreState } from '@client/store'
import { getJurisidictionType } from '@client/utils/locationUtils'
import { getUserDetails } from '@client/profile/profileSelectors'
import { SYS_ADMIN_ROLES } from '@client/utils/constants'
import { checkExternalValidationStatus } from '@client/views/SysAdmin/Team/utils'
import { Event } from '@client/forms'

type Props = WrappedComponentProps & IStateProps & BaseProps

export interface IStatusMapping {
  [status: string]: { labelDescriptor: MessageDescriptor; color: string }
}

interface BaseProps {
  data?: GQLRegistrationCountResult
  statusMapping?: IStatusMapping
  onClickStatusDetails: (status?: keyof IStatusMapping) => void
  locationId: string
  selectedEvent: Event
}

interface IStateProps {
  disableDeclarationLink: boolean
}

const ContentHolder = styled.div``

const StatusProgressBarWrapper = styled.div`
  margin-top: 20px;
`

class StatusWiseDeclarationCountViewComponent extends React.Component<
  Props,
  {}
> {
  getStatusCountView(data: GQLRegistrationCountResult) {
    const { intl, statusMapping, disableDeclarationLink, selectedEvent } =
      this.props
    const { results, total } = data
    return (
      <ContentHolder>
        <SubHeader>
          {intl.formatMessage(performanceMessages.registrationByStatus)}
        </SubHeader>
        <Description>
          {intl.formatMessage(
            performanceMessages.declarationCountByStatusDescription,
            {
              event: selectedEvent.toUpperCase()
            }
          )}
        </Description>
        {results
          .filter((item) => item && checkExternalValidationStatus(item.status))
          .map((statusCount, index) => {
            return (
              statusCount && (
                <StatusProgressBarWrapper key={index}>
                  <ProgressBar
                    id={`${statusCount.status.toLowerCase()}-${index}`}
                    title={intl.formatMessage(
                      statusMapping![statusCount.status].labelDescriptor
                    )}
                    color={statusMapping![statusCount.status].color}
                    totalPoints={total}
                    disabled={disableDeclarationLink || false}
                    onClick={() =>
                      this.props.onClickStatusDetails(statusCount.status)
                    }
                    currentPoints={statusCount.count}
                  />
                </StatusProgressBarWrapper>
              )
            )
          })}
      </ContentHolder>
    )
  }

  render() {
    const { data } = this.props
    return <>{data && this.getStatusCountView(data)}</>
  }
}

export const StatusWiseDeclarationCountView = connect<
  IStateProps,
  {},
  BaseProps,
  IStoreState
>((state: IStoreState, ownProps: BaseProps) => {
  if (!ownProps.locationId) {
    return { disableDeclarationLink: true }
  }
  const offlineLocations = getOfflineData(state).locations
  const offlineOffices = getOfflineData(state).offices

  const isOfficeSelected = !!offlineOffices[ownProps.locationId]

  let disableDeclarationLink = !(
    isOfficeSelected ||
    window.config.DECLARATION_AUDIT_LOCATIONS.includes(
      getJurisidictionType(offlineLocations, ownProps.locationId) as string
    )
  )
  const userDetails = getUserDetails(state)
  if (
    userDetails &&
    userDetails.role &&
    !SYS_ADMIN_ROLES.includes(userDetails.role)
  ) {
    const jurisdictionLocation =
      getJurisdictionLocationIdFromUserDetails(userDetails)
    disableDeclarationLink = !isUnderJurisdictionOfUser(
      offlineLocations,
      isOfficeSelected
        ? getPrimaryLocationIdOfOffice(
            offlineLocations,
            offlineOffices[ownProps.locationId]
          )
        : ownProps.locationId,
      jurisdictionLocation
    )
  }
  return {
    disableDeclarationLink
  }
})(injectIntl(StatusWiseDeclarationCountViewComponent))
