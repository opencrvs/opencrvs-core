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
import { messages } from '@client/i18n/messages/views/fieldAgentHome'
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
import { GridTable, Loader } from '@opencrvs/components/lib/interface'
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
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { officeHomeMessages } from '@client/i18n/messages/views/officeHome'

interface IProps {
  userDetails: IUserDetails | null
  showPaginated: boolean
  pageSize: number
  requireUpdatesPage: number
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

const transformRejectedContent = (data: GQLQuery, props: IFullProps) => {
  if (!data.searchEvents || !data.searchEvents.results) {
    return []
  }

  return data.searchEvents.results.map((reg: GQLEventSearchSet | null) => {
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
    const daysOfRejection =
      registrationSearchSet.registration?.modifiedAt &&
      formattedDuration(
        new Date(parseInt(registrationSearchSet.registration.modifiedAt))
      )

    const event = registrationSearchSet.type as string
    return {
      id: registrationSearchSet.id,
      event:
        (event &&
          intl.formatMessage(dynamicConstantsMessages[event.toLowerCase()])) ||
        '',
      name:
        (createNamesMap(names)[props.intl.locale] as string) ||
        (createNamesMap(names)[LANG_EN] as string),
      daysOfRejection: props.intl.formatMessage(
        constantsMessages.rejectedDays,
        {
          text: daysOfRejection
        }
      ),
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
  })
}

const getRejectedColumns = (
  width: number | undefined,
  theme: ITheme,
  intl: IntlShape
) => {
  if (width && width > theme.grid.breakpoints.lg) {
    return [
      {
        label: intl.formatMessage(constantsMessages.type),
        width: 20,
        key: 'event'
      },
      {
        label: intl.formatMessage(constantsMessages.name),
        width: 40,
        key: 'name',
        color: theme.colors.supportingCopy
      },
      {
        label: intl.formatMessage(constantsMessages.sentForUpdatesOn),
        width: 40,
        key: 'daysOfRejection'
      }
    ]
  } else {
    return [
      {
        label: intl.formatMessage(constantsMessages.type),
        width: 30,
        key: 'event'
      },
      {
        label: intl.formatMessage(constantsMessages.name),
        width: 70,
        key: 'name',
        color: theme.colors.supportingCopy
      }
    ]
  }
}

const RequiresUpdateComponent = (props: IFullProps) => {
  const {
    userDetails,
    showPaginated,
    pageSize,
    requireUpdatesPage,
    onPageChange,
    intl,
    theme
  } = props
  const width = useWindowWidth()
  return (
    <Content
      size={ContentSize.LARGE}
      title={intl.formatMessage(navigationMessages.requiresUpdate)}
      hideBackground={true}
    >
      <Query
        query={SEARCH_DECLARATIONS_USER_WISE} // TODO can this be changed to use SEARCH_EVENTS
        variables={{
          userId: userDetails!.practitionerId,
          status: [EVENT_STATUS.REJECTED],
          locationIds: (userDetails && getUserLocation(userDetails).id) || '',
          count: showPaginated ? pageSize : pageSize * requireUpdatesPage,
          skip: showPaginated ? (requireUpdatesPage - 1) * pageSize : 0
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
          if (loading) {
            return (
              <Loader
                id="require_updates_loader"
                marginPercent={20}
                loadingText={intl.formatMessage(messages.requireUpdatesLoading)}
              />
            )
          }
          if (error) {
            return (
              <ErrorText id="require_updates_loading_error">
                {intl.formatMessage(errorMessages.fieldAgentQueryError)}
              </ErrorText>
            )
          }
          return (
            <>
              <GridTable
                content={transformRejectedContent(data, props)}
                columns={getRejectedColumns(width, theme, intl)}
                noResultText={intl.formatMessage(
                  officeHomeMessages.requiresUpdate
                )}
                onPageChange={(currentPage: number) => {
                  onPageChange(currentPage)
                }}
                pageSize={pageSize}
                totalItems={data.searchEvents && data.searchEvents.totalItems}
                currentPage={requireUpdatesPage}
                clickable={props.isOnline}
                showPaginated={showPaginated}
                loading={loading}
                loadMoreText={intl.formatMessage(constantsMessages.loadMore)}
              />
              <LoadingIndicator loading={loading} hasError={error} />
            </>
          )
        }}
      </Query>
    </Content>
  )
}

export const RequiresUpdate = connect(null, {
  goToDeclarationRecordAudit
})(injectIntl(withTheme(withOnlineStatus(RequiresUpdateComponent))))
