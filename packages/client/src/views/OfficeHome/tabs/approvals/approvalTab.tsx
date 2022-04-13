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
import { IDeclaration } from '@client/declarations'
import {
  constantsMessages,
  dynamicConstantsMessages
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/registrarHome'
import { goToDeclarationRecordAudit, goToPage } from '@client/navigation'
import { getScope } from '@client/profile/profileSelectors'
import { transformData } from '@client/search/transformer'
import { IStoreState } from '@client/store'
import styled, { ITheme } from '@client/styledComponents'
import { Validate } from '@opencrvs/components/lib/icons'
import {
  ColumnContentAlignment,
  GridTable
} from '@opencrvs/components/lib/interface'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import { withTheme } from 'styled-components'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import { formattedDuration } from '@client/utils/date-formatting'
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { officeHomeMessages } from '@client/i18n/messages/views/officeHome'

const ToolTipContainer = styled.span`
  text-align: center;
`
interface IBaseApprovalTabProps {
  theme: ITheme
  goToPage: typeof goToPage
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
  outboxDeclarations: IDeclaration[]
  queryData: {
    data: GQLEventSearchResultSet
  }
  page: number
  onPageChange: (newPageNumber: number) => void
  showPaginated?: boolean
  loading?: boolean
  error?: boolean
}

interface IApprovalTabState {
  width: number
}

type IApprovalTabProps = IntlShapeProps & IBaseApprovalTabProps

class ApprovalTabComponent extends React.Component<
  IApprovalTabProps,
  IApprovalTabState
> {
  pageSize = 10
  constructor(props: IApprovalTabProps) {
    super(props)
    this.state = {
      width: window.innerWidth
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.recordWindowWidth)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recordWindowWidth)
  }

  recordWindowWidth = () => {
    this.setState({ width: window.innerWidth })
  }

  getColumns = () => {
    if (this.state.width > this.props.theme.grid.breakpoints.lg) {
      return [
        {
          label: this.props.intl.formatMessage(constantsMessages.type),
          width: 14,
          key: 'event'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.name),
          width: 26,
          key: 'name'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.eventDate),
          width: 25,
          key: 'eventTimeElapsed'
        },
        {
          label: this.props.intl.formatMessage(messages.sentForApprovals),
          width: 25,
          key: 'dateOfApproval'
        },
        {
          width: 5,
          key: 'icons',
          isIconColumn: true
        },
        {
          width: 5,
          key: 'actions',
          isActionColumn: true,
          alignment: ColumnContentAlignment.CENTER
        }
      ]
    } else {
      return [
        {
          label: this.props.intl.formatMessage(constantsMessages.type),
          width: 30,
          key: 'event'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.name),
          width: 64,
          key: 'name'
        },
        {
          width: 6,
          key: 'icons',
          isIconColumn: true
        }
      ]
    }
  }

  transformValidatedContent = (data: GQLEventSearchResultSet) => {
    const { intl } = this.props
    if (!data || !data.results) {
      return []
    }
    const transformedData = transformData(data, this.props.intl)

    return transformedData.map((reg) => {
      const icon: JSX.Element = (
        <Validate data-tip data-for="validatedTooltip" />
      )
      const event =
        (reg.event &&
          intl.formatMessage(
            dynamicConstantsMessages[reg.event.toLowerCase()]
          )) ||
        ''

      return {
        ...reg,
        event,
        eventTimeElapsed:
          (reg.dateOfEvent && formattedDuration(new Date(reg.dateOfEvent))) ||
          '',
        dateOfApproval:
          (reg.modifiedAt && Number.isNaN(Number(reg.modifiedAt))
            ? formattedDuration(new Date(reg.modifiedAt))
            : formattedDuration(new Date(Number(reg.modifiedAt)))) || '',
        icon,
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () =>
              this.props.goToDeclarationRecordAudit('approvalTab', reg.id)
          }
        ]
      }
    })
  }

  render() {
    const { intl, queryData, page, onPageChange } = this.props
    const { data } = queryData

    return (
      <Content
        size={ContentSize.LARGE}
        title={intl.formatMessage(navigationMessages.approvals)}
      >
        <ReactTooltip id="validatedTooltip">
          <ToolTipContainer>
            {this.props.intl.formatMessage(
              messages.validatedDeclarationTooltipForRegistrationAgent
            )}
          </ToolTipContainer>
        </ReactTooltip>
        <GridTable
          content={this.transformValidatedContent(data)}
          columns={this.getColumns()}
          noResultText={intl.formatMessage(officeHomeMessages.approvals)}
          onPageChange={onPageChange}
          pageSize={this.pageSize}
          totalItems={(data && data.totalItems) || 0}
          currentPage={page}
          clickable={true}
          showPaginated={this.props.showPaginated}
          loading={this.props.loading}
          loadMoreText={intl.formatMessage(constantsMessages.loadMore)}
        />
        <LoadingIndicator
          loading={this.props.loading ? true : false}
          hasError={this.props.error ? true : false}
        />
      </Content>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    scope: getScope(state),
    outboxDeclarations: state.declarationsState.declarations
  }
}

export const ApprovalTab = connect(mapStateToProps, {
  goToPage,
  goToDeclarationRecordAudit
})(injectIntl(withTheme(ApprovalTabComponent)))
