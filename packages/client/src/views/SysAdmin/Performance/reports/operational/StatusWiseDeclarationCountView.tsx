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
import { messages as performanceMessages } from '@client/i18n/messages/views/performance'
import { RegStatus, EventType } from '@client/utils/gateway'

import {
  Description,
  SubHeader
} from '@opencrvs/client/src/views/SysAdmin/Performance/utils'
import { ProgressBar } from '@opencrvs/components/lib/ProgressBar'
import type { GQLRegistrationCountResult } from '@client/utils/gateway-deprecated-do-not-use'
import * as React from 'react'
import {
  injectIntl,
  MessageDescriptor,
  WrappedComponentProps
} from 'react-intl'
import styled from 'styled-components'
import { checkExternalValidationStatus } from '@client/views/SysAdmin/Team/utils'

type Props = WrappedComponentProps & BaseProps

export type IStatusMapping = {
  [status in Exclude<RegStatus, RegStatus.DeclarationUpdated>]: {
    labelDescriptor: MessageDescriptor
    color: string
  }
}

interface BaseProps {
  data?: GQLRegistrationCountResult
  statusMapping?: IStatusMapping
  onClickStatusDetails: (status?: keyof IStatusMapping) => void
  isAccessibleOffice: boolean
  selectedEvent: EventType
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
                      statusMapping![statusCount.status as keyof IStatusMapping]
                        .labelDescriptor
                    )}
                    color={
                      statusMapping![
                        statusCount?.status as keyof IStatusMapping
                      ].color
                    }
                    totalPoints={total}
                    disabled={!isAccessibleOffice}
                    onClick={() =>
                      this.props.onClickStatusDetails(
                        statusCount.status as keyof IStatusMapping
                      )
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
