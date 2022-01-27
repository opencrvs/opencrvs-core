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
import {
  goToApplicationDetails,
  goToPage,
  goToReviewDuplicate
} from '@client/navigation'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@client/navigation/routes'
import { getScope } from '@client/profile/profileSelectors'
import { transformData } from '@client/search/transformer'
import { IStoreState } from '@client/store'
import styled, { ITheme } from '@client/styledComponents'
import { Scope } from '@client/utils/authUtils'
import { EVENT_STATUS } from '@client/views/OfficeHome/OfficeHome'
import { RowHistoryView } from '@client/views/OfficeHome/RowHistoryView'
import { Duplicate, Validate } from '@opencrvs/components/lib/icons'
import {
  ColumnContentAlignment,
  GridTable,
  IAction,
  IActionComponent
} from '@opencrvs/components/lib/interface'
import { HomeContent } from '@opencrvs/components/lib/layout'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import moment from 'moment'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import {
  constantsMessages,
  dynamicConstantsMessages
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/registrarHome'
import { IApplication, DOWNLOAD_STATUS } from '@client/applications'
import { Action } from '@client/forms'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { withTheme } from 'styled-components'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import { formattedDuration } from '@client/utils/date-formatting'

const ToolTipContainer = styled.span`
  text-align: center;
`
interface IBaseReviewTabProps {
  theme: ITheme
  scope: Scope | null
  goToPage: typeof goToPage
  goToReviewDuplicate: typeof goToReviewDuplicate
  registrarLocationId: string | null
  goToApplicationDetails: typeof goToApplicationDetails
  outboxApplications: IApplication[]
  queryData: {
    data: GQLEventSearchResultSet
  }
  page: number
  onPageChange: (newPageNumber: number) => void
  showPaginated?: boolean
  loading?: boolean
  error?: boolean
}

interface IReviewTabState {
  width: number
}

type IReviewTabProps = IntlShapeProps & IBaseReviewTabProps

class ReviewTabComponent extends React.Component<
  IReviewTabProps,
  IReviewTabState
> {
  pageSize = 10
  constructor(props: IReviewTabProps) {
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

  getExpandable = () => {
    return this.state.width > this.props.theme.grid.breakpoints.lg
      ? true
      : false
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  transformDeclaredContent = (data: GQLEventSearchResultSet) => {
    const { intl } = this.props
    if (!data || !data.results) {
      return []
    }
    console.log(data)
    const transformedData = transformData(data, this.props.intl)
    console.log(transformedData)
    return transformedData.map((reg, index) => {
      const actions = [] as IAction[]
      const downloadIcons = [] as IActionComponent[]
      const foundApplication = this.props.outboxApplications.find(
        (application) => application.id === reg.id
      )
      const downloadStatus =
        (foundApplication && foundApplication.downloadStatus) || undefined
      let icon: JSX.Element = <div />
      if (reg.duplicates && reg.duplicates.length > 0) {
        downloadIcons.push({
          actionComponent: (
            <DownloadButton
              downloadConfigs={{
                event: reg.event,
                compositionId: reg.id,
                action: Action.LOAD_REVIEW_APPLICATION
              }}
              key={`DownloadButton-${index}`}
              status={downloadStatus as DOWNLOAD_STATUS}
            />
          )
        })
        if (downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED) {
          actions.push({
            // actionComponent: (
            //   <DownloadButton
            //     downloadConfigs={{
            //       event: reg.event,
            //       compositionId: reg.id,
            //       action: Action.LOAD_REVIEW_APPLICATION
            //     }}
            //     key={`DownloadButton-${index}`}
            //     status={downloadStatus as DOWNLOAD_STATUS}
            //   />
            // )
            label: this.props.intl.formatMessage(constantsMessages.review),
            handler: () => this.props.goToReviewDuplicate(reg.id),
            notDownloaded: true
          })
        } else {
          actions.push({
            label: this.props.intl.formatMessage(constantsMessages.review),
            handler: () => this.props.goToReviewDuplicate(reg.id),
            notDownloaded: false
          })
        }

        icon = <Duplicate />
      } else {
        if (reg.declarationStatus === EVENT_STATUS.VALIDATED) {
          icon = <Validate data-tip data-for="validateTooltip" />
        }
        downloadIcons.push({
          actionComponent: (
            <DownloadButton
              downloadConfigs={{
                event: reg.event,
                compositionId: reg.id,
                action: Action.LOAD_REVIEW_APPLICATION
              }}
              key={`DownloadButton-${index}`}
              status={downloadStatus as DOWNLOAD_STATUS}
            />
          )
        })
        if (downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED) {
          actions.push({
            // actionComponent: (
            //   <DownloadButton
            //     downloadConfigs={{
            //       event: reg.event,
            //       compositionId: reg.id,
            //       action: Action.LOAD_REVIEW_APPLICATION
            //     }}
            //     key={`DownloadButton-${index}`}
            //     status={downloadStatus as DOWNLOAD_STATUS}
            //   />
            // )
            label: this.props.intl.formatMessage(constantsMessages.review),
            handler: () => this.props.goToReviewDuplicate(reg.id),
            notDownloaded: true
          })
        } else {
          actions.push({
            label: this.props.intl.formatMessage(constantsMessages.review),
            handler: () =>
              this.props.goToPage(
                REVIEW_EVENT_PARENT_FORM_PAGE,
                reg.id,
                'review',
                reg.event ? reg.event.toLowerCase() : ''
              ),
            notDownloaded: false
          })
        }
      }
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
          (reg.dateOfEvent &&
            formattedDuration(
              moment(reg.dateOfEvent.toString(), 'YYYY-MM-DD')
            )) ||
          '',
        applicationLastUpdated:
          (reg.modifiedAt &&
            formattedDuration(moment(new Date(Number(reg.modifiedAt))))) ||
          '',
        applicationTimeElapsed:
          (reg.createdAt && formattedDuration(moment(reg.createdAt))) || '',
        status: reg.status,
        actions,
        downloadIcons,
        icon,
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () => this.props.goToApplicationDetails(reg.id)
          }
        ]
      }
    })
  }

  getColumns = () => {
    if (this.state.width > this.props.theme.grid.breakpoints.lg) {
      return [
        {
          label: this.props.intl.formatMessage(constantsMessages.type),
          width: 10,
          key: 'event'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.name),
          width: 20,
          key: 'name'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.lastUpdated),
          width: 17,
          key: 'applicationLastUpdated'
        },
        {
          label: this.props.intl.formatMessage(
            messages.listItemApplicationDate
          ),
          width: 17,
          key: 'applicationTimeElapsed'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.status),
          width: 10,
          key: 'status'
        },
        {
          width: 6,
          key: 'icons',
          isIconColumn: true
        },
        {
          width: 16,
          key: 'actions',
          isActionColumn: true,
          alignment: ColumnContentAlignment.RIGHT
        },
        {
          width: 4,
          key: 'downloadIcons',
          isActionColumn: true,
          alignment: ColumnContentAlignment.LEFT
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
          width: 50,
          key: 'name'
        },
        {
          width: 20,
          key: 'icons',
          isIconColumn: true,
          alignment: ColumnContentAlignment.RIGHT
        }
      ]
    }
  }

  renderExpandedComponent = (itemId: string) => {
    const { results } = this.props.queryData && this.props.queryData.data
    const eventDetails =
      results && results.find((result) => result && result.id === itemId)
    return <RowHistoryView eventDetails={eventDetails} />
  }

  render() {
    const { intl, queryData, page, onPageChange } = this.props
    const { data } = queryData

    return (
      <HomeContent>
        <ReactTooltip id="validateTooltip">
          <ToolTipContainer>
            {this.props.intl.formatMessage(
              messages.validatedApplicationTooltipForRegistrar
            )}
          </ToolTipContainer>
        </ReactTooltip>
        <GridTable
          content={this.transformDeclaredContent(data)}
          columns={this.getColumns()}
          noResultText={intl.formatMessage(constantsMessages.noResults)}
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
      </HomeContent>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    scope: getScope(state),
    outboxApplications: state.applicationsState.applications
  }
}

export const ReviewTab = connect(mapStateToProps, {
  goToPage,
  goToReviewDuplicate,
  goToApplicationDetails
})(injectIntl(withTheme(ReviewTabComponent)))
