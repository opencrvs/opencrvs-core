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
import React, { useState } from 'react'
import { Header } from '@client/components/Header/Header'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import {
  Navigation,
  WORKQUEUE_TABS
} from '@client/components/interface/Navigation'
import styled, { ITheme, withTheme } from '@client/styledComponents'
import { DeclarationIcon, Duplicate } from '@opencrvs/components/lib/icons'
import { connect } from 'react-redux'
import {
  goToCertificateCorrection,
  goToHomeTab,
  goToPage,
  goToPrintCertificate,
  goToTeamUserList,
  goToUserProfile
} from '@client/navigation'
import {
  injectIntl,
  IntlShape,
  WrappedComponentProps as IntlShapeProps
} from 'react-intl'
import {
  archiveDeclaration,
  clearCorrectionAndPrintChanges,
  getProcessingDeclarationIds,
  SUBMISSION_STATUS
} from '@client/declarations'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { getScope } from '@client/profile/profileSelectors'
import { Scope } from '@client/utils/authUtils'
import {
  CircleButton,
  DangerButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { ARCHIVED } from '@client/utils/constants'
import { IQueryData } from '@client/workqueue'
import { recordAuditMessages } from '@client/i18n/messages/views/recordAudit'
import {
  buttonMessages,
  constantsMessages,
  errorMessages
} from '@client/i18n/messages'
import { getLanguage } from '@client/i18n/selectors'
import { IUserDetails } from '@client/utils/userUtils'
import { goBack } from 'connected-react-router'

import { DuplicateWarning } from '@client/views/Duplicates/DuplicateWarning'
import { Frame } from '@opencrvs/components/lib/Frame'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import {
  LoadingIndicator,
  useOnlineStatus
} from '@client/views/OfficeHome/LoadingIndicator'
import { RouteProps } from 'react-router'
import { ErrorText, Link, Pill, Workqueue } from '@client/../../components/lib'
import { Query } from '@apollo/client/react/components'
import { WQContentWrapper } from '../OfficeHome/WQContentWrapper'
import { messages } from '@client/i18n/messages/views/notifications'
import { error } from 'logrocket'
import ReactTooltip from 'react-tooltip'
import {
  ColumnContentAlignment,
  Workqueue,
  IAction,
  COLUMNS
} from '@opencrvs/components/lib/Workqueue'
import { transformData } from '@client/search/transformer'
import { SearchEventsQuery } from '@client/utils/gateway'

const SearchParamPillsContainer = styled.div`
  margin: 16px 0px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  color: #2b4573;
`
const BookMarkIconBody = styled.div`
  position: absolute;
  top: -20px;
  right: 10px;
`

interface IStateProps {
  userDetails: IUserDetails | null
  language: string
  resources: IOfflineData
  scope: Scope | null
  offlineData: Partial<IOfflineData>
}

type QueryData = SearchEventsQuery['searchEvents']

interface IDispatchProps {
  archiveDeclaration: typeof archiveDeclaration
  clearCorrectionAndPrintChanges: typeof clearCorrectionAndPrintChanges
  goToCertificateCorrection: typeof goToCertificateCorrection
  goToPage: typeof goToPage
  goToPrintCertificate: typeof goToPrintCertificate
  goToHomeTab: typeof goToHomeTab
  goToUserProfile: typeof goToUserProfile
  goToTeamUserList: typeof goToTeamUserList
  goBack: typeof goBack
}

export type IRecordAuditTabs = keyof IQueryData | 'search'

type IFullProps = IDispatchProps &
  IStateProps &
  IntlShapeProps &
  RouteProps &
  ITheme

const searchParams = {
  event: 'Birth',
  location: 'districtY',
  status: 'readyToPrint',
  event1: 'Birth',
  location1: 'districtY',
  status1: 'readyToPrint',
  event2: 'Birth',
  location2: 'districtY',
  status2: 'readyToPrint'
} as Record<string, string>

const RecordAuditComp = (props: IFullProps) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const { intl } = props
  const total = 0
  const loading = true
  const error = false
  const data = {}
  const pageSize = 10

  const getColumns = () => {
    if (windowWidth > props.theme.grid.breakpoints.lg) {
      return [
        {
          width: 35,
          label: props.intl.formatMessage(constantsMessages.name),
          key: COLUMNS.ICON_WITH_NAME
        },
        {
          label: props.intl.formatMessage(constantsMessages.event),
          width: 20,
          key: COLUMNS.EVENT
        },
        {
          label: props.intl.formatMessage(constantsMessages.eventDate),
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
          label: props.intl.formatMessage(constantsMessages.name),
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

  const transformAdvancedSearchContent = (data: QueryData) => {
    if (!data || !data.results) {
      return []
    }

    const transformedData = transformData(data, props.intl)

    return transformedData.map((reg, index) => {
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
      const { intl, match, userDetails } = props
      const { searchText, searchType } = match.params
      if (windowWidth > props.theme.grid.breakpoints.lg) {
        if (
          (declarationIsRegistered || declarationIsCertified) &&
          userHasCertifyScope()
        ) {
          actions.push({
            label: props.intl.formatMessage(buttonMessages.print),
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
                ? props.intl.formatMessage(constantsMessages.update)
                : props.intl.formatMessage(constantsMessages.review),
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
                    locationIds: userHasRegisterScope()
                      ? null
                      : userDetails
                      ? [getUserLocation(userDetails).id]
                      : [],
                    sort: SEARCH_RESULT_SORT,
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
                    name: searchType === NAME_TEXT ? searchText : ''
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
  const SearchModifierComponent = () => {
    return (
      <>
        <BookMarkIconBody>BookMark Icon</BookMarkIconBody>
        <SearchParamPillsContainer>
          {Object.keys(searchParams).map((e, i) => {
            return (
              <Pill
                label={`${e} : ${searchParams[e]}`}
                type="default"
                size="medium"
              ></Pill>
            )
          })}
          <Link>Edit</Link>
        </SearchParamPillsContainer>
      </>
    )
  }

  return (
    <Frame
      header={
        <Header
          searchText={''}
          selectedSearchType={''}
          mobileSearchBar={true}
          enableMenuSelection={false}
        />
      }
      navigation={<Navigation />}
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      return (
      <WQContentWrapper
        title={'Search Result'}
        isMobileSize={windowWidth < props.theme.grid.breakpoints.lg}
        noResultText={'No Results'}
        noContent={total < 1 && !loading}
        tabBarContent={<SearchModifierComponent />}
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
          total > 0 && (
            <>
              <Workqueue
                content={transformSearchContent(data)}
                columns={getColumns()}
                noResultText={intl.formatMessage(constantsMessages.noResults)}
                hideLastBorder={true}
              />
            </>
          )
        )}
      </WQContentWrapper>
      )
    </Frame>
  )
}

function mapStateToProps(state: IStoreState, props: RouteProps): IStateProps {
  return {
    language: getLanguage(state),
    resources: getOfflineData(state),
    scope: getScope(state),
    userDetails: state.profile.userDetails,
    offlineData: state.offline.offlineData
  }
}

export const AdvancedSearchResult = connect<
  IStateProps,
  IDispatchProps,
  RouteProps,
  IStoreState
>(mapStateToProps, {
  archiveDeclaration,
  clearCorrectionAndPrintChanges,
  goToCertificateCorrection,
  goToPage,
  goToPrintCertificate,
  goToHomeTab,
  goToUserProfile,
  goToTeamUserList,
  goBack
})(injectIntl(RecordAuditComp))
