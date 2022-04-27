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

import { Query } from '@client/components/Query'
import {
  constantsMessages,
  dynamicConstantsMessages,
  errorMessages
} from '@client/i18n/messages'
import { goToDeclarationRecordAudit } from '@client/navigation'
import { SEARCH_DECLARATIONS_USER_WISE } from '@client/search/queries'
import styled, { ITheme, withTheme } from '@client/styledComponents'
import { EMPTY_STRING, LANG_EN } from '@client/utils/constants'
import { createNamesMap } from '@client/utils/data-formatting'
import { formattedDuration } from '@client/utils/date-formatting'
import {
  LoadingIndicator,
  IOnlineStatusProps,
  withOnlineStatus
} from '@client/views/OfficeHome/LoadingIndicator'
import { EVENT_STATUS, ErrorText } from '@client/views/OfficeHome/OfficeHome'
import {
  GridTable,
  Loader,
  COLUMNS,
  SORT_ORDER,
  ColumnContentAlignment
} from '@opencrvs/components/lib/interface'
import {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLEventSearchSet,
  GQLHumanName,
  GQLQuery
} from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import {
  injectIntl,
  WrappedComponentProps as IntlShapeProps,
  IntlShape
} from 'react-intl'
import { connect } from 'react-redux'
import { IUserDetails, getUserLocation } from '@client/utils/userUtils'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import {
  changeSortedColumn,
  getSortedItems
} from '@client/views/OfficeHome/tabs/utils'
import {
  IconWithName,
  IconWithNameEvent
} from '@client/views/OfficeHome/tabs/components'
import { WQContentWrapper } from '@client/views/OfficeHome/tabs/WQContentWrapper'
import { SUBMISSION_STATUS } from '@client/declarations'
interface IProps {
  userDetails: IUserDetails | null
  pageSize: number
  paginationId: number
  theme: ITheme
  onPageChange: (newPageNumber: number) => void
}

interface IDispatchProps {
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
}

type IFullProps = IProps & IDispatchProps & IntlShapeProps & IOnlineStatusProps

function useWindowWidth() {
  const [windowSize, setWindowSize] = React.useState<number>()

  React.useEffect(() => {
    function handleResize() {
      setWindowSize(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return windowSize
}

const transformRejectedContent = (
  data: GQLQuery,
  props: IFullProps,
  sortedCol: COLUMNS,
  sortOrder: SORT_ORDER
) => {
  if (!data.searchEvents || !data.searchEvents.results) {
    return []
  }

  const items = data.searchEvents.results.map(
    (reg: GQLEventSearchSet | null) => {
      const { intl } = props
      const registrationSearchSet = reg as GQLEventSearchSet
      let names
      if (
        registrationSearchSet.registration &&
        registrationSearchSet.type === 'Birth'
      ) {
        const birthReg = reg as GQLBirthEventSearchSet
        names = birthReg && (birthReg.childName as GQLHumanName[])
      } else {
        const deathReg = reg as GQLDeathEventSearchSet
        names = deathReg && (deathReg.deceasedName as GQLHumanName[])
      }
      window.__localeId__ = props.intl.locale
      const sentForUpdates =
        registrationSearchSet.registration?.modifiedAt &&
        parseInt(registrationSearchSet.registration.modifiedAt)

      const event = registrationSearchSet.type as string
      const dateOfEvent =
        event === 'Birth'
          ? (reg as GQLBirthEventSearchSet).dateOfBirth
          : (reg as GQLDeathEventSearchSet).dateOfDeath || ''
      const name =
        (createNamesMap(names)[props.intl.locale] as string) ||
        (createNamesMap(names)[LANG_EN] as string)
      return {
        id: registrationSearchSet.id,
        event:
          (event &&
            intl.formatMessage(
              dynamicConstantsMessages[event.toLowerCase()]
            )) ||
          '',
        name: name.toString().toLowerCase(),
        iconWithName: (
          <IconWithName status={SUBMISSION_STATUS.REJECTED} name={name} />
        ),
        dateOfEvent:
          (dateOfEvent && dateOfEvent.length > 0 && new Date(dateOfEvent)) ||
          '',
        iconWithNameEvent: (
          <IconWithNameEvent
            status={SUBMISSION_STATUS.DRAFT}
            name={name}
            event={event}
          />
        ),
        sentForUpdates: (sentForUpdates && new Date(sentForUpdates)) || '',
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () =>
              props.goToDeclarationRecordAudit(
                'rejectTab',
                registrationSearchSet.id
              )
          }
        ]
      }
    }
  )
  const sortedItems = getSortedItems(items, sortedCol, sortOrder)
  return sortedItems.map((item) => {
    return {
      ...item,
      dateOfEvent:
        item.dateOfEvent && formattedDuration(item.dateOfEvent as Date),
      sentForUpdates:
        item.sentForUpdates && formattedDuration(item.sentForUpdates as Date)
    }
  })
}

const getRejectedColumns = (
  width: number | undefined,
  theme: ITheme,
  intl: IntlShape,
  sortedCol: COLUMNS,
  onColumnClick: (columnName: string) => void
) => {
  if (width && width > theme.grid.breakpoints.lg) {
    return [
      {
        width: 30,
        label: intl.formatMessage(constantsMessages.name),
        key: COLUMNS.ICON_WITH_NAME,
        errorValue: intl.formatMessage(constantsMessages.noNameProvided),
        isSorted: sortedCol === COLUMNS.NAME,
        sortFunction: onColumnClick
      },
      {
        label: intl.formatMessage(constantsMessages.event),
        width: 16,
        key: COLUMNS.EVENT,
        isSorted: sortedCol === COLUMNS.EVENT,
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
        label: intl.formatMessage(constantsMessages.sentForUpdates),
        width: 18,
        key: COLUMNS.SENT_FOR_UPDATES,
        isSorted: sortedCol === COLUMNS.SENT_FOR_UPDATES,
        sortFunction: onColumnClick
      },
      {
        width: 18,
        alignment: ColumnContentAlignment.RIGHT,
        key: COLUMNS.ACTIONS
      }
    ]
  } else {
    return [
      {
        label: intl.formatMessage(constantsMessages.name),
        width: 90,
        key: COLUMNS.ICON_WITH_NAME_EVENT
      }
    ]
  }
}

const RequiresUpdateComponent = (props: IFullProps) => {
  const { userDetails, pageSize, onPageChange, paginationId, intl, theme } =
    props
  const width = useWindowWidth()
  const [sortedCol, setSortedCol] = React.useState(COLUMNS.NAME)
  const [sortOrder, setSortOrder] = React.useState(SORT_ORDER.ASCENDING)
  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortedCol(newSortedCol)
    setSortOrder(newSortOrder)
  }

  return (
    <Query
      query={SEARCH_DECLARATIONS_USER_WISE} // TODO can this be changed to use SEARCH_EVENTS
      variables={{
        userId: userDetails!.practitionerId,
        status: [EVENT_STATUS.REJECTED],
        locationIds: (userDetails && getUserLocation(userDetails).id) || '',
        count: pageSize,
        skip: (paginationId - 1) * pageSize
      }}
    >
      {({
        loading,
        error,
        data
      }: {
        loading: any
        data?: any
        error?: any
      }) => {
        return (
          <WQContentWrapper
            title={intl.formatMessage(navigationMessages.requiresUpdate)}
            isMobileSize={
              width && width < props.theme.grid.breakpoints.lg ? true : false
            }
            isShowPagination={
              !loading &&
              !error &&
              data?.searchEvents?.totalItems &&
              data?.searchEvents?.totalItems > pageSize
                ? true
                : false
            }
            totalPages={
              Math.ceil(
                data?.searchEvents?.totalItems &&
                  data?.searchEvents?.totalItems / pageSize
              ) || 0
            }
            paginationId={paginationId}
            onPageChange={onPageChange}
            noResultText={intl.formatMessage(constantsMessages.noRecords, {
              tab: 'requires update'
            })}
            loading={loading}
            error={error}
            noContent={
              transformRejectedContent(data, props, sortedCol, sortOrder)
                .length <= 0
            }
          >
            {!loading && !error && (
              <GridTable
                content={transformRejectedContent(
                  data,
                  props,
                  sortedCol,
                  sortOrder
                )}
                columns={getRejectedColumns(
                  width,
                  theme,
                  intl,
                  sortedCol,
                  onColumnClick
                )}
                clickable={props.isOnline}
                loading={loading}
                sortedCol={sortedCol}
                sortOrder={sortOrder}
              />
            )}
          </WQContentWrapper>
        )
      }}
    </Query>
  )
}

export const RequiresUpdate = connect(null, {
  goToDeclarationRecordAudit
})(injectIntl(withTheme(withOnlineStatus(RequiresUpdateComponent))))
