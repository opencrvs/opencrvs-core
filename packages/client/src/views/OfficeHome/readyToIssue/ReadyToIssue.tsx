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
  goToDeclarationRecordAudit,
  goToIssueCertificate
} from '@client/navigation'
import { transformData } from '@client/search/transformer'
import { ITheme } from '@client/styledComponents'
import {
  ColumnContentAlignment,
  Workqueue,
  SORT_ORDER,
  COLUMNS,
  IAction
} from '@opencrvs/components/lib/Workqueue'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import {
  injectIntl,
  useIntl,
  WrappedComponentProps as IntlShapeProps
} from 'react-intl'
import { connect, useDispatch, useSelector } from 'react-redux'
import {
  buttonMessages,
  constantsMessages,
  wqMessages
} from '@client/i18n/messages'
import { IStoreState } from '@client/store'
import {
  IDeclaration,
  DOWNLOAD_STATUS,
  clearCorrectionAndPrintChanges
} from '@client/declarations'
import { DownloadAction } from '@client/forms'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { formattedDuration } from '@client/utils/date-formatting'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import {
  changeSortedColumn,
  getSortedItems
} from '@client/views/OfficeHome/utils'
import {
  IconWithName,
  NoNameContainer,
  NameContainer
} from '@client/views/OfficeHome/components'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { RegStatus } from '@client/utils/gateway'
import { useEffect, useState } from 'react'
import { useTheme } from '@client/styledComponents'
import { selectDeclaration } from '@client/declarations/selectors'

interface IBasePrintTabProps {
  queryData: {
    data: GQLEventSearchResultSet
  }
  paginationId: number
  onPageChange: (newPageNumber: number) => void
  loading?: boolean
  error?: boolean
  pageSize: number
}

// class ReadyToIssueComponent extends React.Component<
//   IPrintTabProps,
//   IPrintTabState
// > {
//   constructor(props: IPrintTabProps) {
//     super(props)
//     this.state = {
//       width: window.innerWidth,
//       sortedCol: COLUMNS.REGISTERED,
//       sortOrder: SORT_ORDER.DESCENDING
//     }
//   }

//   componentDidMount() {
//     window.addEventListener('resize', this.recordWindowWidth)
//   }

//   componentWillUnmount() {
//     window.removeEventListener('resize', this.recordWindowWidth)
//   }

//   recordWindowWidth = () => {
//     this.setState({ width: window.innerWidth })
//   }

//   getExpandable = () => {
//     return this.state.width > this.props.theme.grid.breakpoints.lg
//       ? true
//       : false
//   }

//   onColumnClick = (columnName: string) => {
//     const { newSortedCol, newSortOrder } = changeSortedColumn(
//       columnName,
//       this.state.sortedCol,
//       this.state.sortOrder
//     )
//     this.setState({
//       sortOrder: newSortOrder,
//       sortedCol: newSortedCol
//     })
//   }

//   getColumns = () => {
//     if (this.state.width > this.props.theme.grid.breakpoints.lg) {
//       return [
//         {
//           width: 30,
//           label: this.props.intl.formatMessage(constantsMessages.record),
//           key: COLUMNS.ICON_WITH_NAME,
//           isSorted: this.state.sortedCol === COLUMNS.NAME,
//           sortFunction: this.onColumnClick
//         },
//         {
//           label: this.props.intl.formatMessage(constantsMessages.eventDate),
//           width: 18,
//           key: COLUMNS.DATE_OF_EVENT,
//           isSorted: this.state.sortedCol === COLUMNS.DATE_OF_EVENT,
//           sortFunction: this.onColumnClick
//         },
//         {
//           label: this.props.intl.formatMessage(constantsMessages.trackingId),
//           width: 18,
//           key: COLUMNS.TRACKING_ID,
//           isSorted: this.state.sortedCol === COLUMNS.TRACKING_ID,
//           sortFunction: this.onColumnClick
//         },
//         {
//           label: this.props.intl.formatMessage(constantsMessages.regNumber),
//           width: 18,
//           key: COLUMNS.REGISTRATION_NO,
//           isSorted: this.state.sortedCol === COLUMNS.REGISTRATION_NO,
//           sortFunction: this.onColumnClick
//         },
//         {
//           width: 18,
//           alignment: ColumnContentAlignment.RIGHT,
//           key: COLUMNS.ACTIONS,
//           isActionColumn: true
//         }
//       ]
//     } else {
//       return [
//         {
//           label: this.props.intl.formatMessage(constantsMessages.name),
//           width: 70,
//           key: COLUMNS.ICON_WITH_NAME_EVENT
//         },
//         {
//           width: 30,
//           alignment: ColumnContentAlignment.RIGHT,
//           key: COLUMNS.ACTIONS,
//           isActionColumn: true
//         }
//       ]
//     }
//   }

//   transformCertifiedContent = (data: GQLEventSearchResultSet) => {
//     const { intl } = this.props
//     if (!data || !data.results) {
//       return []
//     }

//     const transformedData = transformData(data, this.props.intl)
//     const items = transformedData.map((reg, index) => {
//       const foundDeclaration = this.props.outboxDeclarations.find(
//         (declaration) => declaration.id === reg.id
//       )
//       const actions: IAction[] = []
//       const downloadStatus = foundDeclaration?.downloadStatus

//       if (this.state.width > this.props.theme.grid.breakpoints.lg) {
//         actions.push({
//           label: this.props.intl.formatMessage(buttonMessages.issue),
//           disabled: downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED,
//           handler: (
//             e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
//           ) => {
//             e && e.stopPropagation()
//             if (downloadStatus === DOWNLOAD_STATUS.DOWNLOADED) {
//               this.props.goToIssueCertificate(reg.id)
//             }
//           }
//         })
//       }
//       actions.push({
//         actionComponent: (
//           <DownloadButton
//             downloadConfigs={{
//               event: reg.event,
//               compositionId: reg.id,
//               action: DownloadAction.LOAD_REVIEW_DECLARATION,
//               assignment: reg.assignment
//             }}
//             key={`DownloadButton-${index}`}
//             status={downloadStatus}
//           />
//         )
//       })

//       const dateOfEvent =
//         reg.dateOfEvent &&
//         reg.dateOfEvent.length > 0 &&
//         new Date(reg.dateOfEvent)

//       const NameComponent = reg.name ? (
//         <NameContainer
//           id={`name_${index}`}
//           onClick={() =>
//             this.props.goToDeclarationRecordAudit('issueTab', reg.id)
//           }
//         >
//           {reg.name}
//         </NameContainer>
//       ) : (
//         <NoNameContainer
//           id={`name_${index}`}
//           onClick={() =>
//             this.props.goToDeclarationRecordAudit('issueTab', reg.id)
//           }
//         >
//           {intl.formatMessage(constantsMessages.noNameProvided)}
//         </NoNameContainer>
//       )

//       return {
//         ...reg,
//         name: reg.name && reg.name.toLowerCase(),
//         iconWithName: (
//           <IconWithName status={reg.declarationStatus} name={NameComponent} />
//         ),
//         dateOfEvent,
//         trackingId: reg.trackingId,
//         registrationNumber: reg.registrationNumber,
//         actions
//       }
//     })

//     const sortedItems = getSortedItems(
//       items,
//       this.state.sortedCol,
//       this.state.sortOrder
//     )

//     const finalContent = sortedItems.map((item) => {
//       return {
//         ...item,
//         dateOfEvent:
//           item.dateOfEvent && formattedDuration(item.dateOfEvent as Date)
//       }
//     })

//     return finalContent
//   }

//   render() {
//     const { intl, queryData, paginationId, onPageChange, pageSize } = this.props
//     const { data } = queryData
//     const totalPages = this.props.queryData.data.totalItems
//       ? Math.ceil(this.props.queryData.data.totalItems / pageSize)
//       : 0
//     const isShowPagination =
//       this.props.queryData.data.totalItems &&
//       this.props.queryData.data.totalItems > pageSize
//         ? true
//         : false

//     return (
//       <WQContentWrapper
//         title={intl.formatMessage(navigationMessages.readyToIssue)}
//         isMobileSize={this.state.width < this.props.theme.grid.breakpoints.lg}
//         isShowPagination={isShowPagination}
//         paginationId={paginationId}
//         totalPages={totalPages}
//         onPageChange={onPageChange}
//         loading={this.props.loading}
//         error={this.props.error}
//         noResultText={intl.formatMessage(wqMessages.noRecordReadyToIssue)}
//         noContent={this.transformCertifiedContent(data).length <= 0}
//       >
//         <Workqueue
//           content={this.transformCertifiedContent(data)}
//           columns={this.getColumns()}
//           loading={this.props.loading}
//           sortOrder={this.state.sortOrder}
//           hideLastBorder={!isShowPagination}
//         />
//       </WQContentWrapper>
//     )
//   }
// }

// function mapStateToProps(state: IStoreState) {
//   return {
//     outboxDeclarations: state.declarationsState.declarations
//   }
// }

// export const ReadyToIssue = connect(mapStateToProps, {
//   goToIssueCertificate,
//   goToDeclarationRecordAudit,
//   clearCorrectionAndPrintChanges
// })(injectIntl(withTheme(ReadyToIssueComponent)))

export const ReadyToIssue = ({
  queryData,
  paginationId,
  onPageChange,
  pageSize
}: IBasePrintTabProps) => {
  const [width, setWidth] = useState(window.innerWidth)
  const [sortedCol, setSortedCol] = useState(COLUMNS.REGISTERED)
  const [sortOrder, setSortOrder] = useState(SORT_ORDER.DESCENDING)
  const dispatch = useDispatch()
  const intl = useIntl()
  const data = queryData.data
  const totalPages = data.totalItems ? Math.ceil(data.totalItems / pageSize) : 0
  const isShowPagination = Boolean(
    data.totalItems && data.totalItems > pageSize
  )
  const outboxDeclarations = useSelector(
    (store: IStoreState) => store.declarationsState.declarations
  )

  useEffect(() => {
    window.addEventListener('resize', recordWindowWidth)

    return () => {
      window.removeEventListener('resize', recordWindowWidth)
    }
  }, [])

  const theme = useTheme()

  const recordWindowWidth = () => {
    setWidth(window.innerWidth)
  }

  const getExpandable = () => {
    return width > theme.grid.breakpoints.lg ? true : false
  }

  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortedCol(newSortedCol)
    setSortOrder(newSortOrder)
  }

  const getColumns = () => {
    if (width > theme.grid.breakpoints.lg) {
      return [
        {
          width: 30,
          label: intl.formatMessage(constantsMessages.record),
          key: COLUMNS.ICON_WITH_NAME,
          isSorted: sortedCol === COLUMNS.NAME,
          sortFunction: onColumnClick
        },
        {
          label: intl.formatMessage(constantsMessages.eventDate),
          width: 18,
          key: COLUMNS.DATE_OF_EVENT,
          isSorted: sortedCol === COLUMNS.DATE_OF_EVENT,
          sortFunction: onColumnClick
        },
        {
          label: intl.formatMessage(constantsMessages.trackingId),
          width: 18,
          key: COLUMNS.TRACKING_ID,
          isSorted: sortedCol === COLUMNS.TRACKING_ID,
          sortFunction: onColumnClick
        },
        {
          label: intl.formatMessage(constantsMessages.regNumber),
          width: 18,
          key: COLUMNS.REGISTRATION_NO,
          isSorted: sortedCol === COLUMNS.REGISTRATION_NO,
          sortFunction: onColumnClick
        },
        {
          width: 18,
          alignment: ColumnContentAlignment.RIGHT,
          key: COLUMNS.ACTIONS,
          isActionColumn: true
        }
      ]
    } else {
      return [
        {
          label: intl.formatMessage(constantsMessages.name),
          width: 70,
          key: COLUMNS.ICON_WITH_NAME_EVENT
        },
        {
          width: 30,
          alignment: ColumnContentAlignment.RIGHT,
          key: COLUMNS.ACTIONS,
          isActionColumn: true
        }
      ]
    }
  }

  const transformCertifiedContent = (data: GQLEventSearchResultSet) => {
    const intl = useIntl()
    if (!data || !data.results) {
      return []
    }

    const transformedData = transformData(data, intl)
    const items = transformedData.map((reg, index) => {
      const foundDeclaration = outboxDeclarations.find(
        (declaration) => declaration.id === reg.id
      )
      const actions: IAction[] = []
      const downloadStatus = foundDeclaration?.downloadStatus

      if (width > theme.grid.breakpoints.lg) {
        actions.push({
          label: intl.formatMessage(buttonMessages.issue),
          disabled: downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED,
          handler: (
            e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
          ) => {
            e && e.stopPropagation()
            if (downloadStatus === DOWNLOAD_STATUS.DOWNLOADED) {
              dispatch(goToIssueCertificate(reg.id))
            }
          }
        })
      }
      actions.push({
        actionComponent: (
          <DownloadButton
            downloadConfigs={{
              event: reg.event,
              compositionId: reg.id,
              action: DownloadAction.LOAD_REVIEW_DECLARATION,
              assignment: reg.assignment
            }}
            key={`DownloadButton-${index}`}
            status={downloadStatus}
          />
        )
      })

      const dateOfEvent =
        reg.dateOfEvent &&
        reg.dateOfEvent.length > 0 &&
        new Date(reg.dateOfEvent)

      const NameComponent = reg.name ? (
        <NameContainer
          id={`name_${index}`}
          onClick={() =>
            dispatch(goToDeclarationRecordAudit('issueTab', reg.id))
          }
        >
          {reg.name}
        </NameContainer>
      ) : (
        <NoNameContainer
          id={`name_${index}`}
          onClick={() =>
            dispatch(goToDeclarationRecordAudit('issueTab', reg.id))
          }
        >
          {intl.formatMessage(constantsMessages.noNameProvided)}
        </NoNameContainer>
      )

      return {
        ...reg,
        name: reg.name && reg.name.toLowerCase(),
        iconWithName: (
          <IconWithName status={reg.declarationStatus} name={NameComponent} />
        ),
        dateOfEvent,
        trackingId: reg.trackingId,
        registrationNumber: reg.registrationNumber,
        actions
      }
    })

    const sortedItems = getSortedItems(items, sortedCol, sortOrder)

    const finalContent = sortedItems.map((item) => {
      return {
        ...item,
        dateOfEvent:
          item.dateOfEvent && formattedDuration(item.dateOfEvent as Date)
      }
    })

    return finalContent
  }

  const handleResize = () => {
    setWidth(window.innerWidth)
  }

  React.useEffect(() => {
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <WQContentWrapper
      title={intl.formatMessage(navigationMessages.readyToIssue)}
      isMobileSize={width < theme.grid.breakpoints.lg}
      isShowPagination={isShowPagination}
      paginationId={paginationId}
      totalPages={totalPages}
      onPageChange={onPageChange}
      // loading={queryData.loading}
      // error={queryData.error}
      noResultText={intl.formatMessage(wqMessages.noRecordReadyToIssue)}
      noContent={transformCertifiedContent(data).length <= 0}
    >
      <Workqueue
        content={transformCertifiedContent(data)}
        columns={getColumns()}
        // loading={queryData.loading}
        sortOrder={sortOrder}
        hideLastBorder={!isShowPagination}
      />
    </WQContentWrapper>
  )
}
