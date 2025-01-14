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
import React, { useState } from 'react'
import { Header } from '@client/components/Header/Header'
import { Navigation } from '@client/components/interface/Navigation'
import styled, { withTheme } from 'styled-components'
import { ITheme } from '@opencrvs/components/lib/theme'
import { connect, useSelector } from 'react-redux'
import {
  formatUrl,
  generateGoToPageUrl,
  generateIssueCertificateUrl,
  generatePrintCertificateUrl
} from '@client/navigation'
import { useIntl } from 'react-intl'
import {
  DOWNLOAD_STATUS,
  getProcessingDeclarationIds,
  IDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { IStoreState } from '@client/store'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'

import { EMPTY_STRING } from '@client/utils/constants'
import {
  buttonMessages,
  constantsMessages,
  dynamicConstantsMessages,
  errorMessages
} from '@client/i18n/messages'
import { messages as advancedSearchResultMessages } from '@client/i18n/messages/views/advancedSearchResult'
import { Scope, SCOPES } from '@opencrvs/commons/client'
import { SearchEventsQuery } from '@client/utils/gateway'
import { Frame } from '@opencrvs/components/lib/Frame'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import { ErrorText, Link, Pill } from '@client/../../components/lib'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import {
  HOME,
  REVIEW_CORRECTION,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@client/navigation/routes'
import {
  ColumnContentAlignment,
  COLUMNS,
  IAction,
  SORT_ORDER,
  Workqueue
} from '@opencrvs/components/lib/Workqueue'
import { transformData } from '@client/search/transformer'
import { getAdvancedSearchParamsState as AdvancedSearchParamsState } from '@client/search/advancedSearch/advancedSearchSelectors'
import { Query } from '@client/components/Query'
import { SEARCH_EVENTS } from '@client/search/queries'
import {
  IconWithName,
  IconWithNameEvent,
  NameContainer,
  NoNameContainer
} from '@client/views/OfficeHome/components'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { DownloadAction } from '@client/forms'
import { formattedDuration } from '@client/utils/date-formatting'
import { isAdvancedSearchFormValid } from '@client/views/SearchResult/AdvancedSearch'
import { getOfflineData } from '@client/offline/selectors'
import {
  advancedSearchPillKey,
  getFormattedAdvanceSearchParamPills,
  getSortColumn,
  replacePeriodWithDate,
  transformStoreDataToAdvancedSearchLocalState
} from '@client/search/advancedSearch/utils'
import { omitBy } from 'lodash'
import { BookmarkAdvancedSearchResult } from '@client/views/AdvancedSearch/BookmarkAdvancedSearchResult'
import { useWindowSize } from '@opencrvs/components/lib/hooks'
import { UserDetails } from '@client/utils/userUtils'
import { changeSortedColumn } from '@client/views/OfficeHome/utils'
import { usePermissions } from '@client/hooks/useAuthorization'
import * as routes from '@client/navigation/routes'

const SearchParamContainer = styled.div`
  margin: 16px 0px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  color: ${({ theme }) => theme.colors.primaryDark};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    max-height: 200px;
    overflow-y: scroll;
  }
`

type QueryData = SearchEventsQuery['searchEvents']

interface IBaseSearchResultProps {
  theme: ITheme
  language: string
  scope: Scope[] | null
  userDetails: UserDetails | null
  outboxDeclarations: IDeclaration[]
}

type IFullProps = IBaseSearchResultProps & RouteComponentProps

const AdvancedSearchResultComp = (props: IFullProps) => {
  const [sortedCol, setSortedCol] = useState<COLUMNS>(COLUMNS.NONE)
  const [sortOrder, setSortOrder] = useState<SORT_ORDER>(SORT_ORDER.ASCENDING)

  const { width: windowWidth } = useWindowSize()
  const intl = useIntl()
  const advancedSearchParamsState = useSelector(AdvancedSearchParamsState)
  const { searchId, bookmarkName, ...advancedSearchParams } = useSelector(
    AdvancedSearchParamsState
  )
  const filteredAdvancedSearchParams = omitBy(
    replacePeriodWithDate(advancedSearchParams),
    (properties: string | null) =>
      properties === null || properties === EMPTY_STRING
  )

  const offlineData = useSelector(getOfflineData)
  const DEFAULT_PAGE_SIZE = 10
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1)

  const searchEventsQueryVariables = {
    advancedSearchParameters: filteredAdvancedSearchParams,
    count: DEFAULT_PAGE_SIZE,
    skip: DEFAULT_PAGE_SIZE * (currentPageNumber - 1),
    sort: sortOrder,
    sortColumn: getSortColumn(
      sortedCol,
      advancedSearchParamsState.event || 'birth'
    )
  }

  const isEnoughParams = () => {
    return isAdvancedSearchFormValid(
      transformStoreDataToAdvancedSearchLocalState(
        advancedSearchParamsState,
        offlineData,
        advancedSearchParamsState.event || 'birth'
      )
    )
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

  const getContentTableColumns = () => {
    if (windowWidth > props.theme.grid.breakpoints.lg) {
      return [
        {
          width: 35,
          label: intl.formatMessage(constantsMessages.name),
          key: COLUMNS.ICON_WITH_NAME,
          isSorted: sortedCol === COLUMNS.NAME,
          sortFunction: onColumnClick
        },
        {
          label: intl.formatMessage(constantsMessages.event),
          width: 20,
          key: COLUMNS.EVENT
        },
        {
          label: intl.formatMessage(constantsMessages.eventDate),
          width: 20,
          key: COLUMNS.DATE_OF_EVENT,
          isSorted: sortedCol === COLUMNS.DATE_OF_EVENT,
          sortFunction: onColumnClick
        },
        {
          width: 25,
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

  const { hasAnyScope, hasScope, canIssueRecord, canPrintRecord } =
    usePermissions()

  const userHasRegisterScope = () => hasScope(SCOPES.RECORD_REGISTER)

  const userHasValidateScope = () =>
    hasAnyScope([
      SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
      SCOPES.RECORD_SUBMIT_FOR_UPDATES
    ])

  const transformSearchContent = (data: QueryData) => {
    if (!data || !data.results) {
      return []
    }
    const transformedData = transformData(data, intl)

    const processingDeclarationIds = getProcessingDeclarationIds(
      props.outboxDeclarations
    )

    return transformedData
      .filter(({ id }) => !processingDeclarationIds.includes(id))
      .map((reg, index) => {
        const foundDeclaration = props.outboxDeclarations.find(
          (declaration) => declaration.id === reg.id
        )
        const actions: IAction[] = []
        const downloadStatus =
          (foundDeclaration && foundDeclaration.downloadStatus) || undefined

        const declarationIsRequestedCorrection =
          reg.declarationStatus === 'REQUESTED_CORRECTION'
        const declarationIsRegistered = reg.declarationStatus === 'REGISTERED'
        const declarationIsCertified = reg.declarationStatus === 'CERTIFIED'
        const declarationIsRejected = reg.declarationStatus === 'REJECTED'
        const declarationIsValidated = reg.declarationStatus === 'VALIDATED'
        const declarationIsInProgress = reg.declarationStatus === 'IN_PROGRESS'
        const declarationIsIssued = reg.declarationStatus === 'ISSUED'
        const isDeclared = reg.declarationStatus === 'DECLARED'
        const declarationIsCorrectionRequested =
          reg.declarationStatus === 'CORRECTION_REQUESTED'
        const isDuplicate =
          reg.duplicates &&
          reg.duplicates.length > 0 &&
          reg.declarationStatus !== SUBMISSION_STATUS.CERTIFIED &&
          reg.declarationStatus !== SUBMISSION_STATUS.REGISTERED
        const isDeclarationReviewableByRegistrar =
          declarationIsRejected ||
          declarationIsValidated ||
          declarationIsCorrectionRequested ||
          isDeclared ||
          declarationIsInProgress

        const isDeclarationReviewableByRegAgent =
          isDeclared || declarationIsInProgress || declarationIsRejected

        const shouldShowReviewButton =
          (userHasRegisterScope() && isDeclarationReviewableByRegistrar) ||
          (userHasValidateScope() && isDeclarationReviewableByRegAgent)
        if (windowWidth > props.theme.grid.breakpoints.lg) {
          if (
            (declarationIsRegistered || declarationIsIssued) &&
            canPrintRecord()
          ) {
            actions.push({
              label: intl.formatMessage(buttonMessages.print),
              handler: (
                e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
              ) => {
                e && e.stopPropagation()

                props.router.navigate(
                  generatePrintCertificateUrl({
                    registrationId: reg.id,
                    event: reg.event
                  })
                )
              },
              disabled: downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED
            })
          } else if (declarationIsCertified && canIssueRecord()) {
            actions.push({
              label: intl.formatMessage(buttonMessages.issue),
              handler: (
                e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
              ) => {
                e && e.stopPropagation()

                props.router.navigate(
                  generateIssueCertificateUrl({
                    registrationId: reg.id
                  })
                )
              },
              disabled: downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED
            })
          } else if (shouldShowReviewButton) {
            actions.push({
              label:
                declarationIsRejected || declarationIsInProgress
                  ? intl.formatMessage(constantsMessages.update)
                  : intl.formatMessage(constantsMessages.review),
              handler: () =>
                props.router.navigate(
                  generateGoToPageUrl({
                    pageRoute:
                      reg.declarationStatus === 'CORRECTION_REQUESTED'
                        ? REVIEW_CORRECTION
                        : REVIEW_EVENT_PARENT_FORM_PAGE,
                    declarationId: reg.id,
                    pageId: 'review',
                    event: reg.event.toLowerCase()
                  })
                ),
              disabled: downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED
            })
          }
        }
        actions.push({
          actionComponent: (
            <DownloadButton
              key={reg.id}
              downloadConfigs={{
                event: reg.event,
                compositionId: reg.id,
                assignment: reg.assignment ?? undefined,
                refetchQueries: [
                  {
                    query: SEARCH_EVENTS,
                    variables: searchEventsQueryVariables
                  }
                ],
                action:
                  ((declarationIsRegistered || declarationIsCertified) &&
                    DownloadAction.LOAD_CERTIFICATE_DECLARATION) ||
                  (declarationIsRequestedCorrection &&
                    DownloadAction.LOAD_REQUESTED_CORRECTION_DECLARATION) ||
                  DownloadAction.LOAD_REVIEW_DECLARATION
              }}
              status={downloadStatus as DOWNLOAD_STATUS}
              declarationStatus={reg.declarationStatus as SUBMISSION_STATUS}
            />
          )
        })
        const event =
          (reg.event &&
            intl.formatMessage(
              dynamicConstantsMessages[reg.event.toLowerCase()]
            )) ||
          ''
        const dateOfEvent =
          reg.dateOfEvent && formattedDuration(new Date(reg.dateOfEvent))
        const isValidatedOnReview =
          reg.declarationStatus === SUBMISSION_STATUS.VALIDATED &&
          userHasRegisterScope()
            ? true
            : false
        const isArchived = reg.declarationStatus === SUBMISSION_STATUS.ARCHIVED
        const NameComponent = reg.name ? (
          <NameContainer
            id={`name_${index}`}
            onClick={() =>
              props.router.navigate(
                formatUrl(routes.DECLARATION_RECORD_AUDIT, {
                  tab: 'search',
                  declarationId: reg.id
                })
              )
            }
          >
            {reg.name}
          </NameContainer>
        ) : (
          <NoNameContainer
            id={`name_${index}`}
            onClick={() =>
              props.router.navigate(
                formatUrl(routes.DECLARATION_RECORD_AUDIT, {
                  tab: 'search',
                  declarationId: reg.id
                })
              )
            }
          >
            {intl.formatMessage(constantsMessages.noNameProvided)}
          </NoNameContainer>
        )
        return {
          ...reg,
          event,
          name: reg.name && reg.name.toLowerCase(),
          iconWithName: (
            <IconWithName
              status={reg.declarationStatus}
              name={NameComponent}
              isValidatedOnReview={isValidatedOnReview}
              isDuplicate={isDuplicate}
              isArchived={isArchived}
            />
          ),
          iconWithNameEvent: (
            <IconWithNameEvent
              status={reg.declarationStatus}
              name={NameComponent}
              event={event}
              isDuplicate={isDuplicate}
              isValidatedOnReview={isValidatedOnReview}
              isArchived={isArchived}
            />
          ),
          dateOfEvent,
          actions
        }
      })
  }

  return (
    <Frame
      header={<Header mobileSearchBar={true} enableMenuSelection={false} />}
      navigation={<Navigation />}
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      {isEnoughParams() && (
        <Query<SearchEventsQuery>
          query={SEARCH_EVENTS}
          variables={searchEventsQueryVariables}
          fetchPolicy="cache-and-network"
        >
          {({ loading, error, data }) => {
            const total = loading ? -1 : data?.searchEvents?.totalItems || 0
            return (
              <WQContentWrapper
                title={`${
                  bookmarkName ||
                  intl.formatMessage(advancedSearchResultMessages.searchResult)
                } ${loading ? '' : ' (' + total + ')'}`}
                isMobileSize={false}
                noResultText={intl.formatMessage(
                  advancedSearchResultMessages.noResult
                )}
                noContent={total < 1 && !loading}
                tabBarContent={<SearchModifierComponent />}
                isShowPagination={!loading && total > DEFAULT_PAGE_SIZE}
                totalPages={Math.ceil(total / DEFAULT_PAGE_SIZE)}
                paginationId={currentPageNumber}
                onPageChange={(page: number) => setCurrentPageNumber(page)}
                topActionButtons={[
                  <BookmarkAdvancedSearchResult key="bookmark-advanced-search-result" />
                ]}
                showTitleOnMobile={true}
              >
                {loading ? (
                  <div id="advanced-search_loader">
                    <LoadingIndicator loading={true} />
                  </div>
                ) : error ? (
                  <ErrorText id="advanced-search-result-error-text">
                    {intl.formatMessage(errorMessages.queryError)}
                  </ErrorText>
                ) : (
                  data?.searchEvents &&
                  total > 0 && (
                    <>
                      <Workqueue
                        content={transformSearchContent(data?.searchEvents)}
                        columns={getContentTableColumns()}
                        sortOrder={sortOrder}
                        noResultText={intl.formatMessage(
                          constantsMessages.noResults
                        )}
                        hideLastBorder={true}
                      />
                    </>
                  )
                )}
              </WQContentWrapper>
            )
          }}
        </Query>
      )}
      {!isEnoughParams() && <Navigate to={HOME} />}
    </Frame>
  )
}

const SearchModifierComponent = () => {
  const navigate = useNavigate()
  const advancedSearchParamsState = useSelector(AdvancedSearchParamsState)
  const offlineData = useSelector(getOfflineData)
  const intl = useIntl()

  const formattedMapOfParams = getFormattedAdvanceSearchParamPills(
    advancedSearchParamsState,
    intl,
    offlineData
  )

  return (
    <>
      <SearchParamContainer>
        {Object.keys(formattedMapOfParams).map((pillKey) => {
          return (
            <Pill
              key={pillKey}
              label={`${intl.formatMessage(
                advancedSearchResultMessages[pillKey as advancedSearchPillKey]
              )} : ${formattedMapOfParams[pillKey as advancedSearchPillKey]}`}
              type="default"
              size="small"
            ></Pill>
          )
        })}
        <Link font="bold14" onClick={() => navigate(routes.ADVANCED_SEARCH)}>
          {intl.formatMessage(buttonMessages.edit)}
        </Link>
      </SearchParamContainer>
    </>
  )
}

export const AdvancedSearchResult = withRouter(
  connect((state: IStoreState) => ({
    language: state.i18n.language,
    scope: getScope(state),
    userDetails: getUserDetails(state),
    outboxDeclarations: state.declarationsState.declarations
  }))(withTheme(AdvancedSearchResultComp))
)
