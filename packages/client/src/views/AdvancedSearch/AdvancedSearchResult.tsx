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
import React, { useEffect, useState } from 'react'
import { Header } from '@client/components/Header/Header'
import { Navigation } from '@client/components/interface/Navigation'
import styled, { ITheme, withTheme } from '@client/styledComponents'
import { connect, useDispatch, useSelector } from 'react-redux'
import {
  goToAdvancedSearch,
  goToDeclarationRecordAudit,
  goToEvents as goToEventsAction,
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
  ADVANCED_SEARCH_TEXT,
  BRN_DRN_TEXT,
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
  errorMessages,
  formMessages
} from '@client/i18n/messages'
import { messages as advancedSearchPillMessages } from '@client/i18n/messages/views/advancedSearchResult'
import { getUserLocation, IUserDetails } from '@client/utils/userUtils'
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
import { SearchEventsQuery } from '@client/utils/gateway'
import { getPartialState as AdvancedSearchParamsState } from '@client/search/advancedSearch/advancedSearchSelectors'
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
import format, { formattedDuration } from '@client/utils/date-formatting'
import { IViewHeadingProps } from '@client/components/ViewHeading'
import { ISearchInputProps } from '@client/views/SearchResult/SearchResult'
import { IAdvancedSearchParamState } from '@client/search/advancedSearch/reducer'
import {
  isAdvancedSearchFormValid,
  transformReduxDataToLocalState
} from '@client/views//SearchResult/AdvancedSearch'
import { getOfflineData } from '@client/offline/selectors'
import { messages as headerMessages } from '@client/i18n/messages/views/header'

const SearchParamPillsContainer = styled.div`
  margin: 16px 0px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  color: ${({ theme }) => theme.colors.primaryLight};
`
const BookMarkIconBody = styled.div`
  position: absolute;
  top: -20px;
  right: 10px;
`

type QueryData = SearchEventsQuery['searchEvents']

interface IBaseSearchResultProps {
  theme: ITheme
  language: string
  scope: Scope | null
  goToEvents: typeof goToEventsAction
  userDetails: IUserDetails | null
  outboxDeclarations: IDeclaration[]
  goToPage: typeof goToPageAction
  goToPrintCertificate: typeof goToPrintCertificateAction
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
}

interface IMatchParams {
  searchText: string
  searchType: string
}

type IFullProps = IViewHeadingProps &
  ISearchInputProps &
  IBaseSearchResultProps &
  RouteComponentProps<IMatchParams>

const RecordAuditComp = (props: IFullProps) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const intl = useIntl()
  const advancedSearchParamsState = useSelector(AdvancedSearchParamsState)
  const offlineData = useSelector(getOfflineData)
  const recordWindowWidth = () => {
    setWindowWidth(window.innerWidth)
  }
  useEffect(() => {
    window.addEventListener('resize', recordWindowWidth)
  }, [])

  useEffect(() => {
    return () => {
      window.removeEventListener('resize', recordWindowWidth)
    }
  }, [])

  const isEnoughParams = () => {
    return isAdvancedSearchFormValid(
      transformReduxDataToLocalState(
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

        const declarationIsArchived = reg.declarationStatus === 'ARCHIVED'
        const declarationIsRequestedCorrection =
          reg.declarationStatus === 'REQUESTED_CORRECTION'
        const declarationIsRegistered = reg.declarationStatus === 'REGISTERED'
        const declarationIsCertified = reg.declarationStatus === 'CERTIFIED'
        const declarationIsRejected = reg.declarationStatus === 'REJECTED'
        const declarationIsValidated = reg.declarationStatus === 'VALIDATED'
        const declarationIsInProgress = reg.declarationStatus === 'IN_PROGRESS'
        const isDuplicate =
          reg.duplicates &&
          reg.duplicates.length > 0 &&
          reg.declarationStatus !== SUBMISSION_STATUS.CERTIFIED &&
          reg.declarationStatus !== SUBMISSION_STATUS.REGISTERED
        const { match, userDetails } = props
        const { searchText, searchType } = match.params
        if (windowWidth > props.theme.grid.breakpoints.lg) {
          if (
            (declarationIsRegistered || declarationIsCertified) &&
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
                            ? convertToMSISDN(searchText)
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
      header={
        <Header
          searchText={intl.formatMessage(headerMessages.advancedSearch)}
          selectedSearchType={ADVANCED_SEARCH_TEXT}
          mobileSearchBar={true}
          enableMenuSelection={false}
        />
      }
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
              ...advancedSearchParamsState
            },
            count: 10,
            skip: 0
          }}
          fetchPolicy="cache-and-network"
        >
          {({ loading, error, data }) => {
            const total = loading ? -1 : data?.searchEvents?.totalItems || 0
            return (
              <WQContentWrapper
                title={'Search Result'}
                isMobileSize={false}
                noResultText={'No Results'}
                noContent={total < 1 && !loading}
                tabBarContent={<SearchModifierComponent />}
                isShowPagination={true}
                totalPages={2}
                paginationId={1}
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
  const intl = useIntl()

  const formatDateRangeLabel = (
    rangeStart: string | undefined,
    rangeEnd: string | undefined
  ) => {
    if (!rangeStart || !rangeEnd) {
      return
    }
    const dateStartLocale =
      rangeStart && format(new Date(rangeStart), 'MMMM yyyy')
    const dateEndLocale = rangeEnd && format(new Date(rangeEnd), 'MMMM yyyy')

    return intl.formatMessage(formMessages.dateRangePickerCheckboxLabel, {
      rangeStart: dateStartLocale,
      rangeEnd: dateEndLocale
    })
  }
  const getFormattedAdvancedSerachParams = (
    advancedSearchParamsState: IAdvancedSearchParamState
  ): Record<string, string> => {
    const formattedMapOfParams: Record<string, string> = {}

    if (advancedSearchParamsState.event) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.event)
      ] =
        advancedSearchParamsState.event === 'birth'
          ? intl.formatMessage(constantsMessages.birth)
          : intl.formatMessage(constantsMessages.death)
    }

    if (
      advancedSearchParamsState.registrationStatuses &&
      advancedSearchParamsState.registrationStatuses.length > 0
    ) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.registationStatus)
      ] = advancedSearchParamsState.registrationStatuses.join(' , ')
    }
    if (advancedSearchParamsState.trackingId) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.trackingId)
      ] = advancedSearchParamsState.trackingId
    }
    if (advancedSearchParamsState.registrationNumber) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.regNumber)
      ] = advancedSearchParamsState.registrationNumber
    }
    if (advancedSearchParamsState.childFirstNames) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.childFirstName)
      ] = advancedSearchParamsState.childFirstNames
    }

    if (advancedSearchParamsState.childLastName) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.childLastName)
      ] = advancedSearchParamsState.childLastName
    }

    if (advancedSearchParamsState.motherFirstNames) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.motherFirstName)
      ] = advancedSearchParamsState.motherFirstNames
    }

    if (advancedSearchParamsState.motherFamilyName) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.motherLastName)
      ] = advancedSearchParamsState.motherFamilyName
    }

    if (advancedSearchParamsState.fatherFirstNames) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.fatherFirstName)
      ] = advancedSearchParamsState.fatherFirstNames
    }

    if (advancedSearchParamsState.fatherFamilyName) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.fatherLastName)
      ] = advancedSearchParamsState.fatherFamilyName
    }

    if (advancedSearchParamsState.informantFirstNames) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.informantFirstName)
      ] = advancedSearchParamsState.informantFirstNames
    }

    if (advancedSearchParamsState.informantFamilyName) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.informantLastName)
      ] = advancedSearchParamsState.informantFamilyName
    }

    if (advancedSearchParamsState.deceasedFirstNames) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.deceasedFirstName)
      ] = advancedSearchParamsState.deceasedFirstNames
    }

    if (advancedSearchParamsState.deceasedFamilyName) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.deceasedLastName)
      ] = advancedSearchParamsState.deceasedFamilyName
    }

    if (advancedSearchParamsState.childGender) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.gender)
      ] = advancedSearchParamsState.childGender
    }
    if (advancedSearchParamsState.deceasedGender) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.gender)
      ] = advancedSearchParamsState.deceasedGender
    }

    if (advancedSearchParamsState.declarationLocationId) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.regLocation)
      ] = advancedSearchParamsState.declarationLocationId
    }
    if (advancedSearchParamsState.declarationJurisdictionId) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.regLocation)
      ] = advancedSearchParamsState.declarationJurisdictionId
    }

    if (advancedSearchParamsState.eventCountry) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.eventlocation)
      ] = advancedSearchParamsState.eventCountry
    }
    if (advancedSearchParamsState.eventLocationId) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.eventlocation)
      ] = advancedSearchParamsState.eventLocationId
    }

    if (advancedSearchParamsState.eventLocationLevel1) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.eventlocation)
      ] = advancedSearchParamsState.eventLocationLevel1
    }
    if (advancedSearchParamsState.eventLocationLevel2) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.eventlocation)
      ] = advancedSearchParamsState.eventLocationLevel2
    }
    if (advancedSearchParamsState.eventLocationLevel3) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.eventlocation)
      ] = advancedSearchParamsState.eventLocationLevel3
    }

    //dates
    if (advancedSearchParamsState.dateOfEvent) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.eventDate)
      ] = advancedSearchParamsState.dateOfEvent
    }
    if (
      advancedSearchParamsState.dateOfEventStart ||
      advancedSearchParamsState.dateOfEventEnd
    ) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.eventDate)
      ] =
        formatDateRangeLabel(
          advancedSearchParamsState.dateOfEventStart,
          advancedSearchParamsState.dateOfEventEnd
        ) || ''
    }

    if (advancedSearchParamsState.dateOfRegistration) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.regDate)
      ] = advancedSearchParamsState.dateOfRegistration
    }

    if (
      advancedSearchParamsState.dateOfRegistrationStart ||
      advancedSearchParamsState.dateOfRegistrationEnd
    ) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.regDate)
      ] =
        formatDateRangeLabel(
          advancedSearchParamsState.dateOfRegistrationStart,
          advancedSearchParamsState.dateOfRegistrationEnd
        ) || ''
    }

    if (advancedSearchParamsState.childDoB) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.childDoB)
      ] = advancedSearchParamsState.childDoB
    }

    if (
      advancedSearchParamsState.childDoBStart ||
      advancedSearchParamsState.childDoBEnd
    ) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.childDoB)
      ] =
        formatDateRangeLabel(
          advancedSearchParamsState.childDoBStart,
          advancedSearchParamsState.childDoBEnd
        ) || ''
    }

    if (advancedSearchParamsState.motherDoB) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.motherDoB)
      ] = advancedSearchParamsState.motherDoB
    }

    if (
      advancedSearchParamsState.motherDoBStart ||
      advancedSearchParamsState.motherDoBEnd
    ) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.motherDoB)
      ] =
        formatDateRangeLabel(
          advancedSearchParamsState.motherDoBStart,
          advancedSearchParamsState.motherDoBEnd
        ) || ''
    }

    if (advancedSearchParamsState.fatherDoB) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.fatherDoB)
      ] = advancedSearchParamsState.fatherDoB
    }

    if (
      advancedSearchParamsState.fatherDoBStart ||
      advancedSearchParamsState.fatherDoBEnd
    ) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.fatherDoB)
      ] =
        formatDateRangeLabel(
          advancedSearchParamsState.fatherDoBStart,
          advancedSearchParamsState.fatherDoBEnd
        ) || ''
    }

    if (advancedSearchParamsState.deceasedDoB) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.deceasedDoB)
      ] = advancedSearchParamsState.deceasedDoB
    }

    if (
      advancedSearchParamsState.deceasedDoBStart ||
      advancedSearchParamsState.deceasedDoBEnd
    ) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.deceasedDoB)
      ] =
        formatDateRangeLabel(
          advancedSearchParamsState.deceasedDoBStart,
          advancedSearchParamsState.deceasedDoBEnd
        ) || ''
    }

    if (advancedSearchParamsState.informantDoB) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.informantDoB)
      ] = advancedSearchParamsState.informantDoB
    }

    if (
      advancedSearchParamsState.informantDoBStart ||
      advancedSearchParamsState.informantDoBEnd
    ) {
      formattedMapOfParams[
        intl.formatMessage(advancedSearchPillMessages.informantDoB)
      ] =
        formatDateRangeLabel(
          advancedSearchParamsState.informantDoBStart,
          advancedSearchParamsState.informantDoBEnd
        ) || ''
    }

    return formattedMapOfParams
  }

  const formattedMapOfParams = getFormattedAdvancedSerachParams(
    advancedSearchParamsState
  )
  return (
    <>
      <BookMarkIconBody>BookMark Icon</BookMarkIconBody>
      <SearchParamPillsContainer>
        {Object.keys(formattedMapOfParams).map((paramKey, i) => {
          return (
            <Pill
              label={`${paramKey} : ${formattedMapOfParams[paramKey]}`}
              type="default"
              size="medium"
            ></Pill>
          )
        })}
        <Link
          onClick={() => {
            dispatch(goToAdvancedSearch())
          }}
        >
          Edit
        </Link>
      </SearchParamPillsContainer>
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
    goToDeclarationRecordAudit
  }
)(withTheme(RecordAuditComp))
