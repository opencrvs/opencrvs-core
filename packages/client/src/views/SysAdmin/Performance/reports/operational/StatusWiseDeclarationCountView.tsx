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
import { messages as performanceMessages } from '@client/i18n/messages/views/performance'

import {
  Description,
  SubHeader
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
import { checkExternalValidationStatus } from '@client/views/SysAdmin/Team/utils'
import { Event } from '@client/utils/gateway'

type Props = WrappedComponentProps & BaseProps

export interface IStatusMapping {
  [status: string]: { labelDescriptor: MessageDescriptor; color: string }
}

interface BaseProps {
  data?: GQLRegistrationCountResult
  statusMapping?: IStatusMapping
  onClickStatusDetails: (status?: keyof IStatusMapping) => void
  isAccessibleOffice: boolean
  selectedEvent: Event
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
    const { intl, statusMapping, selectedEvent, isAccessibleOffice } =
      this.props
    const { results, total } = data
    return (
      <ContentHolder id="declaration-statuses">
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
                    disabled={!isAccessibleOffice}
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

export const StatusWiseDeclarationCountView = injectIntl(
  StatusWiseDeclarationCountViewComponent
)
