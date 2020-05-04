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
import { GQLRegistrationCountResult } from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import {
  injectIntl,
  WrappedComponentProps,
  MessageDescriptor
} from 'react-intl'
import styled from 'styled-components'
import { ProgressBar } from '@opencrvs/components/lib/forms'

type Props = WrappedComponentProps & BaseProps

export interface IStatusMapping {
  [status: string]: { labelDescriptor: MessageDescriptor; color: string }
}

interface BaseProps {
  data?: GQLRegistrationCountResult
  loading?: boolean
  statusMapping: IStatusMapping
}

const StatusProgressBarWrapper = styled.div`
  margin-top: 20px;
`
const StatusListFooter = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding: 0px 10px;
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  background: ${({ theme }) => theme.colors.background};
  border-top: 1px solid ${({ theme }) => theme.colors.disabled};
  border-bottom: none;
`

class StatusWiseCountViewComponent extends React.Component<Props, {}> {
  getLoader() {
    return (
      <div id="status-wise-count-loader">
        <StatusProgressBarWrapper>
          <ProgressBar loading={true} />
        </StatusProgressBarWrapper>
        <StatusProgressBarWrapper>
          <ProgressBar loading={true} />
        </StatusProgressBarWrapper>
        <StatusProgressBarWrapper>
          <ProgressBar loading={true} />
        </StatusProgressBarWrapper>
        <StatusProgressBarWrapper>
          <ProgressBar loading={true} />
        </StatusProgressBarWrapper>
        <StatusProgressBarWrapper>
          <ProgressBar loading={true} />
        </StatusProgressBarWrapper>
        <StatusProgressBarWrapper>
          <ProgressBar loading={true} />
        </StatusProgressBarWrapper>
        <StatusListFooter>
          <p>&nbsp;</p>
        </StatusListFooter>
      </div>
    )
  }

  getStatusCountView(data: GQLRegistrationCountResult) {
    const { intl, statusMapping } = this.props
    const { results, total } = data
    return (
      <div id="status-wise-count-view">
        {results.map((statusCount, index) => {
          return (
            statusCount && (
              <StatusProgressBarWrapper key={index}>
                <ProgressBar
                  title={intl.formatMessage(
                    statusMapping[statusCount.status].labelDescriptor
                  )}
                  color={statusMapping[statusCount.status].color}
                  totalPoints={total}
                  currentPoints={statusCount.count}
                  formattedCurrentPoints={intl.formatNumber(statusCount.count)}
                />
              </StatusProgressBarWrapper>
            )
          )
        })}
        <StatusListFooter>
          <p>{intl.formatMessage(constantsMessages.total)}</p>
          <p>{intl.formatNumber(total)}</p>
        </StatusListFooter>
      </div>
    )
  }

  render() {
    const { data, loading } = this.props
    return (
      <>
        {loading && this.getLoader()}
        {data && this.getStatusCountView(data)}
      </>
    )
  }
}

export const StatusWiseCountView = injectIntl(StatusWiseCountViewComponent)
