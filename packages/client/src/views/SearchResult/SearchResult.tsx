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
import { DOWNLOAD_STATUS, IDeclaration } from '@client/declarations'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { Header } from '@client/components/interface/Header/Header'
import { Query } from '@client/components/Query'
import { IViewHeadingProps } from '@client/components/ViewHeading'
import { Action } from '@client/forms'
import {
  buttonMessages,
  constantsMessages,
  dynamicConstantsMessages,
  errorMessages
} from '@client/i18n/messages'
import { messages as registrarHomeMessages } from '@client/i18n/messages/views/registrarHome'
import { messages as rejectMessages } from '@client/i18n/messages/views/reject'
import { recordAuditMessages } from '@client/i18n/messages/views/recordAudit'
import { messages } from '@client/i18n/messages/views/search'
import {
  goToDeclarationRecordAudit,
  goToEvents as goToEventsAction,
  goToPage as goToPageAction,
  goToPrintCertificate as goToPrintCertificateAction,
  goToReviewDuplicate as goToReviewDuplicateAction
} from '@client/navigation'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@client/navigation/routes'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { SEARCH_EVENTS } from '@client/search/queries'
import { transformData } from '@client/search/transformer'
import { IStoreState } from '@client/store'
import styled, { ITheme, withTheme } from '@client/styledComponents'
import { Scope } from '@client/utils/authUtils'
import {
  BRN_DRN_TEXT,
  NAME_TEXT,
  PHONE_TEXT,
  SEARCH_RESULT_SORT,
  TRACKING_ID_TEXT
} from '@client/utils/constants'
import { getUserLocation, IUserDetails } from '@client/utils/userUtils'
import { Duplicate, Validate } from '@opencrvs/components/lib/icons'
import {
  ColumnContentAlignment,
  GridTable,
  IAction,
  ISearchInputProps,
  Loader
} from '@opencrvs/components/lib/interface'
import { HomeContent } from '@opencrvs/components/lib/layout'
import {
  GQLEventSearchResultSet,
  GQLQuery
} from '@opencrvs/gateway/src/graphql/schema.d'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import ReactTooltip from 'react-tooltip'
import { convertToMSISDN } from '@client/forms/utils'
import { formattedDuration } from '@client/utils/date-formatting'
import { Navigation } from '@client/components/interface/Navigation'

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.negative};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
`

const Container = styled.div`
  margin: 20px 0px 0px 0px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 249px;
  }
`
const ToolTipContainer = styled.span`
  text-align: center;
`
export const ActionPageWrapper = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  z-index: 4;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
`
const SearchResultText = styled.div`
  left: 268px;
  ${({ theme }) => theme.fonts.h4Style};
  color: ${({ theme }) => theme.colors.copy};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 24px;
    margin-top: 24px;
  }
`

export function getRejectionReasonDisplayValue(reason: string) {
  switch (reason.toLowerCase()) {
    case 'duplicate':
      return rejectMessages.rejectionReasonDuplicate
    case 'misspelling':
      return rejectMessages.rejectionReasonMisspelling
    case 'missing_supporting_doc':
      return rejectMessages.rejectionReasonMissingSupportingDoc
    case 'other':
      return rejectMessages.rejectionReasonOther
    default:
      return rejectMessages.rejectionReasonOther
  }
}

interface IBaseSearchResultProps {
  theme: ITheme
  language: string
  scope: Scope | null
  goToEvents: typeof goToEventsAction
  userDetails: IUserDetails | null
  outboxDeclarations: IDeclaration[]
  goToPage: typeof goToPageAction
  goToReviewDuplicate: typeof goToReviewDuplicateAction
  goToPrintCertificate: typeof goToPrintCertificateAction
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
}

interface IMatchParams {
  searchText: string
  searchType: string
}

type ISearchResultProps = IntlShapeProps &
  IViewHeadingProps &
  ISearchInputProps &
  IBaseSearchResultProps &
  RouteComponentProps<IMatchParams>

interface ISearchResultState {
  width: number
  currentPage: number
}

export class SearchResultView extends React.Component<
  ISearchResultProps,
  ISearchResultState
> {
  pageSize = 10
  showPaginated = false
  constructor(props: ISearchResultProps) {
    super(props)
    this.state = {
      currentPage: 1,
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
          width: 22,
          key: 'name'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.status),
          width: 15,
          key: 'status'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.lastUpdated),
          width: 15,
          key: 'dateOfModification'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.startedAt),
          width: 15,
          key: 'startedAt'
        },
        {
          width: 5,
          key: 'icon',
          isIconColumns: true
        },
        {
          label: this.props.intl.formatMessage(
            registrarHomeMessages.listItemAction
          ),
          width: 18,
          key: 'actions',
          isActionColumn: true,
          alignment: ColumnContentAlignment.CENTER
        }
      ]
    } else {
      return [
        {
          label: this.props.intl.formatMessage(constantsMessages.type),
          width: 15,
          key: 'event'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.name),
          width: 30,
          key: 'name'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.status),
          width: 20,
          key: 'status'
        },
        {
          width: 15,
          key: 'icon',
          isIconColumns: true
        },
        {
          width: 20,
          key: 'actions',
          isActionColumn: true,
          alignment: ColumnContentAlignment.CENTER
        }
      ]
    }
  }

  getDeclarationStatusLabel = (status: string) => {
    switch (status) {
      case 'ARCHIVED':
        return this.props.intl.formatMessage(recordAuditMessages.archived)
      case 'IN_PROGRESS':
        return this.props.intl.formatMessage(registrarHomeMessages.inProgress)
      case 'DECLARED':
        return this.props.intl.formatMessage(
          registrarHomeMessages.readyForReview
        )
      case 'REGISTERED':
        return this.props.intl.formatMessage(registrarHomeMessages.readyToPrint)
      case 'VALIDATED':
        return this.props.intl.formatMessage(
          registrarHomeMessages.sentForApprovals
        )
      case 'WAITING_VALIDATION':
        return this.props.intl.formatMessage(
          registrarHomeMessages.waitingForExternalValidation
        )
      case 'REJECTED':
        return this.props.intl.formatMessage(
          registrarHomeMessages.sentForUpdates
        )
      case 'CERTIFIED':
        return this.props.intl.formatMessage(registrarHomeMessages.certified)
      case 'REQUESTED_CORRECTION':
        return this.props.intl.formatMessage(
          registrarHomeMessages.requestedCorrection
        )
      default:
        return this.props.intl.formatMessage(
          registrarHomeMessages.readyForReview
        )
    }
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  userHasValidateScope() {
    return this.props.scope && this.props.scope.includes('validate')
  }

  userHasCertifyScope() {
    return this.props.scope && this.props.scope.includes('certify')
  }

  userHasValidateOrRegistrarScope() {
    return this.userHasValidateScope() || this.userHasRegisterScope()
  }

  transformSearchContent = (data: GQLEventSearchResultSet) => {
    const { intl } = this.props
    if (!data || !data.results) {
      return []
    }

    const transformedData = transformData(data, this.props.intl)
    return transformedData.map((reg, index) => {
      const foundDeclaration = this.props.outboxDeclarations.find(
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
      const isDuplicate = reg.duplicates && reg.duplicates.length > 0
      if (
        downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED &&
        ((!declarationIsValidated && this.userHasValidateOrRegistrarScope()) ||
          (declarationIsValidated && this.userHasRegisterScope()))
      ) {
        actions.push({
          actionComponent: (
            <DownloadButton
              key={reg.id}
              downloadConfigs={{
                event: reg.event,
                compositionId: reg.id,
                action:
                  ((declarationIsRegistered || declarationIsCertified) &&
                    Action.LOAD_CERTIFICATE_DECLARATION) ||
                  (declarationIsRequestedCorrection &&
                    Action.LOAD_REQUESTED_CORRECTION_DECLARATION) ||
                  Action.LOAD_REVIEW_DECLARATION
              }}
              status={downloadStatus as DOWNLOAD_STATUS}
            />
          )
        })
      } else if (
        (declarationIsRegistered || declarationIsCertified) &&
        this.userHasCertifyScope()
      ) {
        actions.push({
          label: this.props.intl.formatMessage(buttonMessages.print),
          handler: (
            e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
          ) => {
            e && e.stopPropagation()
            this.props.goToPrintCertificate(reg.id, reg.event)
          }
        })
      } else if (
        (declarationIsValidated && this.userHasRegisterScope()) ||
        (!declarationIsValidated &&
          !declarationIsRegistered &&
          !declarationIsCertified &&
          !declarationIsArchived &&
          this.userHasValidateOrRegistrarScope())
      ) {
        actions.push({
          label:
            declarationIsRejected || declarationIsInProgress
              ? this.props.intl.formatMessage(constantsMessages.update)
              : this.props.intl.formatMessage(constantsMessages.review),
          handler: () =>
            !isDuplicate
              ? this.props.goToPage(
                  REVIEW_EVENT_PARENT_FORM_PAGE,
                  reg.id,
                  'review',
                  reg.event.toLowerCase()
                )
              : this.props.goToReviewDuplicate(reg.id)
        })
      }

      let icon: JSX.Element = <div />
      if (isDuplicate && !declarationIsRegistered && !declarationIsCertified) {
        icon = <Duplicate />
      } else if (declarationIsValidated) {
        icon = <Validate data-tip data-for="validateTooltip" />
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
        name: reg.name,
        status: this.getDeclarationStatusLabel(reg.declarationStatus),
        dateOfModification: reg.modifiedAt
          ? Number.isNaN(Number(reg.modifiedAt))
            ? formattedDuration(new Date(reg.modifiedAt))
            : formattedDuration(new Date(Number(reg.modifiedAt)))
          : '',
        startedAt:
          (reg.createdAt &&
            formattedDuration(new Date(Number(reg.createdAt)))) ||
          '',
        icon,
        actions,
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () =>
              isDuplicate
                ? this.props.goToReviewDuplicate(reg.id)
                : this.props.goToDeclarationRecordAudit('search', reg.id)
          }
        ]
      }
    })
  }

  onPageChange = (newPageNumber: number) => {
    this.setState({ currentPage: newPageNumber })
  }

  render() {
    const { intl, match, userDetails } = this.props
    const { searchText, searchType } = match.params
    return (
      <>
        <Header
          searchText={searchText}
          selectedSearchType={searchType}
          mobileSearchBar={true}
          enableMenuSelection={false}
        />
        <Navigation />
        <Container>
          <HomeContent>
            {searchText && searchType && (
              <Query
                query={SEARCH_EVENTS}
                variables={{
                  locationIds: userDetails
                    ? [getUserLocation(userDetails).id]
                    : [],
                  sort: SEARCH_RESULT_SORT,
                  trackingId: searchType === TRACKING_ID_TEXT ? searchText : '',
                  registrationNumber:
                    searchType === BRN_DRN_TEXT ? searchText : '',
                  contactNumber:
                    searchType === PHONE_TEXT
                      ? convertToMSISDN(searchText)
                      : '',
                  name: searchType === NAME_TEXT ? searchText : ''
                }}
                fetchPolicy="no-cache"
              >
                {({
                  loading,
                  error,
                  data
                }: {
                  loading: boolean
                  error?: Error
                  data: GQLQuery
                }) => {
                  if (loading) {
                    return (
                      <Loader
                        id="search_loader"
                        marginPercent={35}
                        loadingText={intl.formatMessage(messages.searchingFor, {
                          param: searchText
                        })}
                      />
                    )
                  }

                  if (error || !data.searchEvents) {
                    return (
                      <ErrorText id="search-result-error-text">
                        {intl.formatMessage(errorMessages.queryError)}
                      </ErrorText>
                    )
                  }

                  const total =
                    (data.searchEvents &&
                      data.searchEvents.results &&
                      data.searchEvents.results.length) ||
                    0
                  return (
                    <>
                      <SearchResultText>
                        {intl.formatMessage(messages.searchResultFor, {
                          total,
                          param: searchText
                        })}
                      </SearchResultText>
                      {total > 0 && (
                        <>
                          <ReactTooltip id="validateTooltip">
                            <ToolTipContainer>
                              {this.props.intl.formatMessage(
                                registrarHomeMessages.validatedDeclarationTooltipForRegistrar
                              )}
                            </ToolTipContainer>
                          </ReactTooltip>
                          <GridTable
                            content={this.transformSearchContent(
                              data.searchEvents
                            )}
                            columns={this.getColumns()}
                            noResultText={intl.formatMessage(
                              constantsMessages.noResults
                            )}
                            onPageChange={this.onPageChange}
                            pageSize={this.pageSize}
                            totalItems={
                              (data &&
                                data.searchEvents &&
                                data.searchEvents.totalItems) ||
                              0
                            }
                            currentPage={this.state.currentPage}
                            clickable={true}
                            showPaginated={this.showPaginated}
                            loadMoreText={intl.formatMessage(
                              constantsMessages.loadMore
                            )}
                          />
                        </>
                      )}
                    </>
                  )
                }}
              </Query>
            )}
          </HomeContent>
        </Container>
      </>
    )
  }
}
export const SearchResult = connect(
  (state: IStoreState) => ({
    language: state.i18n.language,
    scope: getScope(state),
    userDetails: getUserDetails(state),
    outboxDeclarations: state.declarationsState.declarations
  }),
  {
    goToEvents: goToEventsAction,
    goToPage: goToPageAction,
    goToReviewDuplicate: goToReviewDuplicateAction,
    goToPrintCertificate: goToPrintCertificateAction,
    goToDeclarationRecordAudit
  }
)(injectIntl(withTheme(SearchResultView)))
