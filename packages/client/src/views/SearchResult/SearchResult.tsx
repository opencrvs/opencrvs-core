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
  Duplicate,
  StatusCertified,
  StatusGray,
  StatusGreen,
  StatusOrange,
  StatusRejected
} from '@opencrvs/components/lib/icons'
import {
  ISearchInputProps,
  ListItem,
  ListItemExpansion,
  Spinner,
  Loader
} from '@opencrvs/components/lib/interface'
import { DataTable } from '@opencrvs/components/lib/interface/DataTable'
import { BodyContent } from '@opencrvs/components/lib/layout'
import styled, { ITheme, withTheme } from '@client/styledComponents'
import {
  GQLComment,
  GQLDeathRegistration,
  GQLHumanName,
  GQLQuery
} from '@opencrvs/gateway/src/graphql/schema.d'
import moment from 'moment'
import * as React from 'react'
import { Query } from '@client/components/Query'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { IViewHeadingProps } from '@client/components/ViewHeading'
import {
  goToEvents as goToEventsAction,
  goToPrintCertificate as goToPrintCertificateAction,
  goToReviewDuplicate as goToReviewDuplicateAction,
  goToPage as goToPageAction
} from '@client/navigation'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@client/navigation/routes'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import {
  buttonMessages,
  constantsMessages,
  errorMessages,
  userMessages
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/search'
import { messages as rejectMessages } from '@client/i18n/messages/views/reject'
import { SEARCH_EVENTS } from '@client/search/queries'
import { transformData } from '@client/search/transformer'
import { IStoreState } from '@client/store'
import { Scope } from '@client/utils/authUtils'
import {
  DECLARED,
  LANG_EN,
  REJECTED,
  REJECT_REASON,
  REJECT_COMMENTS,
  TRACKING_ID_TEXT,
  BRN_DRN_TEXT,
  PHONE_TEXT,
  SEARCH_RESULT_SORT,
  NAME_TEXT
} from '@client/utils/constants'
import {
  createNamesMap,
  extractCommentFragmentValue
} from '@client/utils/data-formatting'
import { formatLongDate } from '@client/utils/date-formatting'
import { IUserDetails, getUserLocation } from '@client/utils/userUtils'

import { FETCH_REGISTRATION_BY_COMPOSITION } from '@client/views/SearchResult/queries'
import { Header } from '@client/components/interface/Header/Header'
import { IApplication, DOWNLOAD_STATUS } from '@client/applications'
import { Action } from '@client/forms'
import { DownloadButton } from '@client/components/interface/DownloadButton'

const ListItemExpansionSpinner = styled(Spinner)`
  width: 70px;
  height: 70px;
  top: 0px !important;
`
const ExpansionSpinnerContainer = styled.div`
  min-height: 70px;
  min-width: 70px;
  display: flex;
  justify-content: center;
`
const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
`

const Container = styled.div`
  margin: 35px 250px 0px 250px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 20px;
    margin-right: 20px;
  }
`
const StyledLabel = styled.label`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  margin-right: 3px;
`
const StyledValue = styled.span`
  ${({ theme }) => theme.fonts.bodyStyle};
  text-transform: capitalize !important;
`
const ValueContainer = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  & span:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.colors.placeholder};
    margin-right: 10px;
    padding-right: 10px;
  }
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
    left: 24px;
    margin-top: 24px;
  }
`
const TotalResultText = styled.div`
  left: 268px;
  margin-top: 6px;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.captionStyle};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    left: 24px;
  }
`
function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <StyledLabel>{label}:</StyledLabel>
      <StyledValue>{value}</StyledValue>
    </div>
  )
}

function ValuesWithSeparator(props: { strings: string[] }): JSX.Element {
  return (
    <ValueContainer>
      {props.strings.map((value, index) => (
        <span key={index}>{value}</span>
      ))}
    </ValueContainer>
  )
}

function formatRoleCode(str: string) {
  const sections = str.split('_')
  const formattedString: string[] = []
  sections.map(section => {
    return formattedString.push(
      section.charAt(0) + section.slice(1).toLowerCase()
    )
  })

  return formattedString.join(' ')
}

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

const ExpansionContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyStyle};
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
`
const ExpansionContentContainer = styled.div`
  flex: 1;
  margin-left: 10px;
`

const StatusIcon = styled.div`
  margin-top: 3px;
`
interface IBaseSearchResultProps {
  theme: ITheme
  language: string
  scope: Scope | null
  goToEvents: typeof goToEventsAction
  userDetails: IUserDetails | null
  outboxApplications: IApplication[]
  goToPage: typeof goToPageAction
  goToReviewDuplicate: typeof goToReviewDuplicateAction
  goToPrintCertificate: typeof goToPrintCertificateAction
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
export class SearchResultView extends React.Component<ISearchResultProps> {
  getDeclarationStatusIcon = (status: string) => {
    switch (status) {
      case 'DECLARED':
        return (
          <StatusIcon>
            <StatusOrange />
          </StatusIcon>
        )
      case 'REGISTERED':
        return (
          <StatusIcon>
            <StatusGreen />
          </StatusIcon>
        )
      case 'VALIDATED':
        return (
          <StatusIcon>
            <StatusGray />
          </StatusIcon>
        )
      case 'WAITING_VALIDATION':
        return (
          <StatusIcon>
            <StatusGray />
          </StatusIcon>
        )
      case 'REJECTED':
        return (
          <StatusIcon>
            <StatusRejected />
          </StatusIcon>
        )
      case 'CERTIFIED':
        return (
          <StatusIcon>
            <StatusCertified />
          </StatusIcon>
        )
      default:
        return (
          <StatusIcon>
            <StatusOrange />
          </StatusIcon>
        )
    }
  }

  getDeclarationStatusLabel = (status: string) => {
    switch (status) {
      case 'DECLARED':
        return this.props.intl.formatMessage(constantsMessages.application)
      case 'REGISTERED':
        return this.props.intl.formatMessage(constantsMessages.registered)
      case 'VALIDATED':
        return this.props.intl.formatMessage(constantsMessages.validated)
      case 'WAITING_VALIDATION':
        return this.props.intl.formatMessage(constantsMessages.waitingValidated)
      case 'REJECTED':
        return this.props.intl.formatMessage(constantsMessages.rejected)
      case 'CERTIFIED':
        return this.props.intl.formatMessage(constantsMessages.collected)
      default:
        return this.props.intl.formatMessage(constantsMessages.application)
    }
  }

  getWorkflowDateLabel = (status: string) => {
    switch (status) {
      case 'DECLARED':
        return constantsMessages.applicationSubmittedOn
      case 'REGISTERED':
        return constantsMessages.applicationRegisteredOn
      case 'VALIDATED':
        return constantsMessages.applicationValidatedOn
      case 'WAITING_VALIDATION':
        return constantsMessages.applicationSentForExternalValidationOn
      case 'REJECTED':
        return constantsMessages.applicationRejectedOn
      case 'CERTIFIED':
        return constantsMessages.applicationCollectedOn
      default:
        return constantsMessages.applicationSubmittedOn
    }
  }

  getEventLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'BIRTH':
        return this.props.intl.formatMessage(constantsMessages.birth)
      case 'DEATH':
        return this.props.intl.formatMessage(constantsMessages.death)
      default:
        return this.props.intl.formatMessage(constantsMessages.birth)
    }
  }

  transformDataToTaskHistory = (data: GQLQuery) => {
    const { locale } = this.props.intl
    const registration =
      data && data.fetchRegistration && data.fetchRegistration.registration
    const deathReg = data && (data.fetchRegistration as GQLDeathRegistration)
    const informant = deathReg && deathReg.informant
    const contactInfo =
      informant &&
      informant.individual &&
      informant.individual.telecom &&
      informant.individual.telecom[0]

    if (!registration || !registration.status) {
      return []
    }

    return registration.status.map((status, index) => {
      const certificate =
        registration.certificates && registration.certificates[index]
      const collector = certificate && certificate.collector

      return {
        type: status && status.type,
        practitionerName:
          (status &&
            status.user &&
            (createNamesMap(status.user.name as GQLHumanName[])[
              this.props.language
            ] as string)) ||
          (status &&
            status.user &&
            (createNamesMap(status.user.name as GQLHumanName[])[
              ''
            ] as string)) ||
          '',
        timestamp: status && formatLongDate(status.timestamp, locale),
        practitionerRole:
          status && status.user && status.user.role
            ? this.props.intl.formatMessage(
                userMessages[status.user.role as string]
              )
            : '',
        officeName:
          locale === LANG_EN
            ? status && status.office && status.office.name
            : status && status.office && status.office.alias,
        collectorName:
          (collector &&
            collector.individual &&
            (createNamesMap(collector.individual.name as GQLHumanName[])[
              this.props.language
            ] as string)) ||
          (collector &&
            collector.individual &&
            (createNamesMap(collector.individual.name as GQLHumanName[])[
              LANG_EN
            ] as string)) ||
          '',
        collectorType: collector && collector.relationship,
        rejectReasons:
          (status &&
            status.type === REJECTED &&
            extractCommentFragmentValue(
              status.comments as GQLComment[],
              REJECT_REASON
            )) ||
          '',
        comment:
          (status &&
            status.type === REJECTED &&
            extractCommentFragmentValue(
              status.comments as GQLComment[],
              REJECT_COMMENTS
            )) ||
          '',
        informantContactNumber: contactInfo && contactInfo.value
      }
    })
  }

  renderExpansionContent = (id: string): JSX.Element => {
    return (
      <>
        <Query
          query={FETCH_REGISTRATION_BY_COMPOSITION}
          variables={{
            id
          }}
        >
          {({
            loading,
            error,
            data
          }: {
            loading: any
            error?: any
            data: any
          }) => {
            const { intl, language } = this.props
            moment.locale(language)
            if (loading) {
              return (
                <ExpansionSpinnerContainer>
                  <ListItemExpansionSpinner
                    id="list-expansion-spinner"
                    baseColor={this.props.theme.colors.background}
                  />
                </ExpansionSpinnerContainer>
              )
            }

            const statusData = this.transformDataToTaskHistory(data)

            return statusData
              .map((status, index) => {
                const {
                  practitionerName,
                  practitionerRole,
                  collectorName,
                  collectorType,
                  rejectReasons,
                  comment,
                  informantContactNumber
                } = status
                const type = status.type as string
                const officeName = status.officeName as string
                const timestamp = status.timestamp as string
                const collectorInfo = collectorName + ' (' + collectorType + ')'

                return (
                  <ExpansionContainer key={index} id={type + '-' + index}>
                    {this.getDeclarationStatusIcon(type)}
                    <ExpansionContentContainer>
                      <LabelValue
                        label={intl.formatMessage(
                          this.getWorkflowDateLabel(type)
                        )}
                        value={timestamp}
                      />
                      {type === DECLARED && informantContactNumber && (
                        <LabelValue
                          label={intl.formatMessage(messages.informantContact)}
                          value={informantContactNumber}
                        />
                      )}
                      {collectorType && (
                        <LabelValue
                          label={intl.formatMessage(
                            constantsMessages.collectedBy
                          )}
                          value={collectorInfo}
                        />
                      )}
                      <ValueContainer>
                        <StyledLabel>
                          {this.props.intl.formatMessage(
                            collectorType
                              ? constantsMessages.issuedBy
                              : constantsMessages.by
                          )}
                          :
                        </StyledLabel>
                        <ValuesWithSeparator
                          strings={[
                            practitionerName,
                            formatRoleCode(practitionerRole),
                            officeName
                          ]}
                        />
                      </ValueContainer>
                      {rejectReasons && (
                        <>
                          <LabelValue
                            label={intl.formatMessage(constantsMessages.reason)}
                            value={rejectReasons}
                          />
                          <LabelValue
                            label={intl.formatMessage(
                              constantsMessages.comment
                            )}
                            value={comment}
                          />
                        </>
                      )}
                    </ExpansionContentContainer>
                  </ExpansionContainer>
                )
              })
              .reverse()
          }}
        </Query>
      </>
    )
  }

  renderCell = (
    item: { [key: string]: string & Array<{ [key: string]: string }> },
    key: number
  ): JSX.Element => {
    const applicationIsRegistered = item.declarationStatus === 'REGISTERED'
    const applicationIsCertified = item.declarationStatus === 'CERTIFIED'
    const applicationIsRejected = item.declarationStatus === 'REJECTED'
    const applicationIsValidated = item.declarationStatus === 'VALIDATED'
    const applicationIsInProgress = item.declarationStatus === 'IN_PROGRESS'
    const isDuplicate = item.duplicates && item.duplicates.length > 0
    const application = this.props.outboxApplications.find(
      application =>
        (application.compositionId && application.compositionId === item.id) ||
        application.id === item.id
    )
    const downloadStatus = application && application.downloadStatus
    const info = []
    const status = []
    const icons = []

    info.push({
      label: this.props.intl.formatMessage(constantsMessages.name),
      value: item.name
    })
    if (item.dob) {
      info.push({
        label: this.props.intl.formatMessage(constantsMessages.dob),
        value: item.dob
      })
    }
    if (item.dod) {
      info.push({
        label: this.props.intl.formatMessage(constantsMessages.dod),
        value: item.dod
      })
    }
    if (applicationIsRegistered || applicationIsCertified) {
      info.push({
        label: this.props.intl.formatMessage(
          messages.listItemEventRegistrationNumber,
          { event: item.event.toLowerCase() }
        ),
        value: item.registrationNumber
      })
    } else {
      info.push({
        label: this.props.intl.formatMessage(constantsMessages.trackingId),
        value: item.trackingId
      })
    }

    status.push({
      icon: <StatusGray />,
      label: this.getEventLabel(item.event)
    })
    status.push({
      icon: this.getDeclarationStatusIcon(item.declarationStatus),
      label: this.getDeclarationStatusLabel(item.declarationStatus)
    })

    if (applicationIsRejected && item.rejectionReasons) {
      const reasons = item.rejectionReasons.split(',')
      const rejectComment = item.rejectionComment

      info.push({
        label: this.props.intl.formatMessage(constantsMessages.reason),
        value:
          reasons &&
          reasons
            .reduce(
              (prev: string[], curr) => [
                ...prev,
                this.props.intl.formatMessage(
                  getRejectionReasonDisplayValue(curr)
                )
              ],
              []
            )
            .join(', ')
      })

      if (rejectComment) {
        info.push({
          label: this.props.intl.formatMessage(constantsMessages.comment),
          value: rejectComment
        })
      }
    }

    if (item.duplicates && item.duplicates.length > 0) {
      icons.push(<Duplicate />)
    }

    const listItemActions = []

    if (
      downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED &&
      ((!applicationIsValidated && this.userHasValidateOrRegistrarScope()) ||
        (applicationIsValidated && this.userHasRegisterScope()))
    ) {
      listItemActions.push({
        actionComponent: (
          <DownloadButton
            key={item.id}
            downloadConfigs={{
              event: item.event,
              compositionId: item.id,
              action:
                ((applicationIsRegistered || applicationIsCertified) &&
                  Action.LOAD_CERTIFICATE_APPLICATION) ||
                Action.LOAD_REVIEW_APPLICATION
            }}
            status={downloadStatus as DOWNLOAD_STATUS}
          />
        )
      })
    } else if (
      (applicationIsRegistered || applicationIsCertified) &&
      this.userHasCertifyScope()
    ) {
      listItemActions.push({
        label: this.props.intl.formatMessage(buttonMessages.print),
        handler: () => this.props.goToPrintCertificate(item.id, item.event)
      })
    } else if (
      (applicationIsValidated && this.userHasRegisterScope()) ||
      (!applicationIsValidated &&
        !applicationIsRegistered &&
        !applicationIsCertified &&
        this.userHasValidateOrRegistrarScope())
    ) {
      listItemActions.push({
        label:
          applicationIsRejected || applicationIsInProgress
            ? this.props.intl.formatMessage(constantsMessages.update)
            : this.props.intl.formatMessage(constantsMessages.review),
        handler: () =>
          !isDuplicate
            ? this.props.goToPage(
                REVIEW_EVENT_PARENT_FORM_PAGE,
                item.id,
                'review',
                item.event.toLowerCase()
              )
            : this.props.goToReviewDuplicate(item.id)
      })
    }

    return (
      <ListItem
        index={key}
        infoItems={info}
        statusItems={status}
        icons={icons}
        key={key}
        itemData={{}}
        actions={listItemActions}
        isBoxShadow={true}
        isItemFullHeight={false}
        expandedCellRenderer={() => (
          <ListItemExpansion>
            {this.renderExpansionContent(item.id)}
          </ListItemExpansion>
        )}
      />
    )
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
        <Container>
          <BodyContent>
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
                  contactNumber: searchType === PHONE_TEXT ? searchText : '',
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

                  const transformedData = transformData(data.searchEvents, intl)
                  const total = transformedData.length
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
                          <TotalResultText>
                            {intl.formatMessage(messages.totalResultText, {
                              total
                            })}
                          </TotalResultText>
                          <DataTable
                            data={transformedData}
                            zeroPagination={true}
                            cellRenderer={this.renderCell}
                            resultLabel={intl.formatMessage(
                              messages.dataTableResults
                            )}
                            noResultText={intl.formatMessage(
                              messages.dataTableNoResults
                            )}
                          />
                        </>
                      )}
                    </>
                  )
                }}
              </Query>
            )}
          </BodyContent>
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
    outboxApplications: state.applicationsState.applications
  }),
  {
    goToEvents: goToEventsAction,
    goToPage: goToPageAction,
    goToReviewDuplicate: goToReviewDuplicateAction,
    goToPrintCertificate: goToPrintCertificateAction
  }
)(injectIntl(withTheme(SearchResultView)))
