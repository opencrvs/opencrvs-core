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
import React, { useEffect, useState } from 'react'
import { Header } from '@client/components/Header/Header'
import { Navigation } from '@client/components/interface/Navigation'
import styled, { withTheme } from 'styled-components'
import { ITheme } from '@opencrvs/components/lib/theme'
import { connect, useDispatch, useSelector } from 'react-redux'
import {
  goToAdvancedSearch,
  goToDeclarationRecordAudit,
  goToEvents as goToEventsAction,
  goToIssueCertificate as goToIssueCertificateAction,
  goToPage as goToPageAction,
  goToPrintCertificate as goToPrintCertificateAction
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
import { Scope } from '@client/utils/authUtils'
import {
  BRN_DRN_TEXT,
  EMPTY_STRING,
  NAME_TEXT,
  NATIONAL_ID_TEXT,
  PHONE_TEXT,
  SEARCH_RESULT_SORT,
  TRACKING_ID_TEXT
} from '@client/utils/constants'
import {
  buttonMessages,
  constantsMessages,
  dynamicConstantsMessages,
  errorMessages
} from '@client/i18n/messages'
import { messages as advancedSearchResultMessages } from '@client/i18n/messages/views/advancedSearchResult'
import { getUserLocation, UserDetails } from '@client/utils/userUtils'
import { RegStatus, SearchEventsQuery } from '@client/utils/gateway'
import { Frame } from '@opencrvs/components/lib/Frame'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import { Redirect, RouteComponentProps } from 'react-router'
import { ErrorText, Link, Pill } from '@client/../../components/lib'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { HOME, REVIEW_EVENT_PARENT_FORM_PAGE } from '@client/navigation/routes'
import {
  ColumnContentAlignment,
  COLUMNS,
  IAction,
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
import { convertToMSISDN } from '@client/forms/utils'
import { DownloadAction } from '@client/forms'
import { formattedDuration } from '@client/utils/date-formatting'
import { ISearchInputProps } from '@client/views/SearchResult/SearchResult'
import { isAdvancedSearchFormValid } from '@client/views/SearchResult/AdvancedSearch'
import { getOfflineData } from '@client/offline/selectors'
import {
  advancedSearchPillKey,
  getFormattedAdvanceSearchParamPills,
  transformStoreDataToAdvancedSearchLocalState
} from '@client/search/advancedSearch/utils'
import { omitBy } from 'lodash'
import { BookmarkAdvancedSearchResult } from '@client/views/AdvancedSearch/BookmarkAdvancedSearchResult'

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
  scope: Scope | null
  goToEvents: typeof goToEventsAction
  userDetails: UserDetails | null
  outboxDeclarations: IDeclaration[]
  goToPage: typeof goToPageAction
  goToPrintCertificate: typeof goToPrintCertificateAction
  goToIssueCertificate: typeof goToIssueCertificateAction
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
}

interface IMatchParams {
  searchText: string
  searchType: string
}

type IFullProps = ISearchInputProps &
  IBaseSearchResultProps &
  RouteComponentProps<IMatchParams>

const AdvancedSearchResultComp = (props: IFullProps) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const intl = useIntl()
  const advancedSearchParamsState = useSelector(AdvancedSearchParamsState)
  const { searchId, ...advancedSearchParams } = useSelector(
    AdvancedSearchParamsState
  )
  const filteredAdvancedSearchParams = omitBy(
    advancedSearchParams,
    (properties: string | null) =>
      properties === null || properties === EMPTY_STRING
  )
  const offlineData = useSelector(getOfflineData)
  const DEFAULT_PAGE_SIZE = 10
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1)

  useEffect(() => {
    const recordWindowWidth = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', recordWindowWidth)
    return () => window.removeEventListener('resize', recordWindowWidth)
  }, [])

  const isEnoughParams = () => {
    return isAdvancedSearchFormValid(
      transformStoreDataToAdvancedSearchLocalState(
        advancedSearchParamsState,
        offlineData,
        advancedSearchParamsState.event || 'birth'
      )
    )
  }

  const getContentTableColumns = () => {
    if (windowWidth > props.theme.grid.breakpoints.lg) {
      return [
        {
          width: 35,
          label: intl.formatMessage(constantsMessages.name),
          key: COLUMNS.ICON_WITH_NAME
        },
        {
          label: intl.formatMessage(constantsMessages.event),
          width: 20,
          key: COLUMNS.EVENT
        },
        {
          label: intl.formatMessage(constantsMessages.eventDate),
          width: 20,
          key: COLUMNS.DATE_OF_EVENT
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

  const userHasRegisterScope = () => {
    return props.scope && props.scope.includes('register')
  }
  const userHasValidateScope = () => {
    return props.scope && props.scope.includes('validate')
  }
  const userHasCertifyScope = () => {
    return props.scope && props.scope.includes('certify')
  }
  const userHasValidateOrRegistrarScope = () => {
    return userHasValidateScope() || userHasRegisterScope()
  }

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

        const declarationIsArchived =
          reg.declarationStatus === RegStatus.Archived
        const declarationIsRequestedCorrection =
          reg.declarationStatus === 'REQUESTED_CORRECTION'
        const declarationIsRegistered =
          reg.declarationStatus === RegStatus.Registered
        const declarationIsCertified =
          reg.declarationStatus === RegStatus.Certified
        const declarationIsRejected =
          reg.declarationStatus === RegStatus.Rejected
        const declarationIsValidated =
          reg.declarationStatus === RegStatus.Validated
        const declarationIsInProgress =
          reg.declarationStatus === RegStatus.InProgress
        const declarationIsIssued = reg.declarationStatus === RegStatus.Issued
        const isDuplicate =
          reg.duplicates &&
          reg.duplicates.length > 0 &&
          reg.declarationStatus !== SUBMISSION_STATUS.CERTIFIED &&
          reg.declarationStatus !== SUBMISSION_STATUS.REGISTERED
        const { match, userDetails } = props
        const { searchText, searchType } = match.params
        if (windowWidth > props.theme.grid.breakpoints.lg) {
          if (
            (declarationIsRegistered || declarationIsIssued) &&
            userHasCertifyScope()
          ) {
            actions.push({
              label: intl.formatMessage(buttonMessages.print),
              handler: (
                e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
              ) => {
                e && e.stopPropagation()
                props.goToPrintCertificate(reg.id, reg.event)
              },
              disabled: downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED
            })
          } else if (declarationIsCertified && userHasCertifyScope()) {
            actions.push({
              label: intl.formatMessage(buttonMessages.issue),
              handler: (
                e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
              ) => {
                e && e.stopPropagation()
                props.goToIssueCertificate(reg.id)
              },
              disabled: downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED
            })
          } else if (
            (declarationIsValidated && userHasRegisterScope()) ||
            (!declarationIsValidated &&
              !declarationIsRegistered &&
              !declarationIsCertified &&
              !declarationIsArchived &&
              userHasValidateOrRegistrarScope())
          ) {
            actions.push({
              label:
                declarationIsRejected || declarationIsInProgress
                  ? intl.formatMessage(constantsMessages.update)
                  : intl.formatMessage(constantsMessages.review),
              handler: () =>
                props.goToPage(
                  REVIEW_EVENT_PARENT_FORM_PAGE,
                  reg.id,
                  'review',
                  reg.event.toLowerCase()
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
                assignment: reg.assignment,
                refetchQueries: [
                  {
                    query: SEARCH_EVENTS,
                    variables: {
                      advancedSearchParameters: {
                        trackingId:
                          searchType === TRACKING_ID_TEXT ? searchText : '',
                        nationalId:
                          searchType === NATIONAL_ID_TEXT ? searchText : '',
                        registrationNumber:
                          searchType === BRN_DRN_TEXT ? searchText : '',
                        contactNumber:
                          searchType === PHONE_TEXT
                            ? convertToMSISDN(searchText, window.config.COUNTRY)
                            : '',
                        name: searchType === NAME_TEXT ? searchText : '',
                        declarationLocationId: userDetails
                          ? getUserLocation(userDetails).id
                          : ''
                      },
                      sort: SEARCH_RESULT_SORT
                    }
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
            onClick={() => props.goToDeclarationRecordAudit('search', reg.id)}
          >
            {reg.name}
          </NameContainer>
        ) : (
          <NoNameContainer
            id={`name_${index}`}
            onClick={() => props.goToDeclarationRecordAudit('search', reg.id)}
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
          variables={{
            advancedSearchParameters: {
              ...filteredAdvancedSearchParams
            },
            count: DEFAULT_PAGE_SIZE,
            skip: DEFAULT_PAGE_SIZE * (currentPageNumber - 1)
          }}
          fetchPolicy="cache-and-network"
        >
          {({ loading, error, data }) => {
            const total = loading ? -1 : data?.searchEvents?.totalItems || 0
            return (
              <WQContentWrapper
                title={intl.formatMessage(
                  advancedSearchResultMessages.searchResult
                )}
                isMobileSize={false}
                noResultText={intl.formatMessage(
                  advancedSearchResultMessages.noResult
                )}
                noContent={total < 1 && !loading}
                tabBarContent={<SearchModifierComponent />}
                isShowPagination={!loading && total > DEFAULT_PAGE_SIZE}
                totalPages={Math.ceil(total / DEFAULT_PAGE_SIZE)}
                paginationId={currentPageNumber}
                onPageChange={(page: any) => setCurrentPageNumber(page)}
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
      {!isEnoughParams() && <Redirect to={HOME} />}
    </Frame>
  )
}

const SearchModifierComponent = () => {
  const dispatch = useDispatch()
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
        {Object.keys(formattedMapOfParams).map((pillKey, i) => {
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
        <Link
          font="bold14"
          onClick={() => {
            dispatch(goToAdvancedSearch())
          }}
        >
          {intl.formatMessage(buttonMessages.edit)}
        </Link>
      </SearchParamContainer>
    </>
  )
}

export const AdvancedSearchResult = connect(
  (state: IStoreState) => ({
    language: state.i18n.language,
    scope: getScope(state),
    userDetails: getUserDetails(state),
    outboxDeclarations: state.declarationsState.declarations
  }),
  {
    goToEvents: goToEventsAction,
    goToPage: goToPageAction,
    goToPrintCertificate: goToPrintCertificateAction,
    goToIssueCertificate: goToIssueCertificateAction,
    goToDeclarationRecordAudit
  }
)(withTheme(AdvancedSearchResultComp))
