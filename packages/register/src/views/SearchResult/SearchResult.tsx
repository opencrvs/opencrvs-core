import {
  PrimaryButton,
  SecondaryButton
} from '@opencrvs/components/lib/buttons'
import {
  Duplicate,
  Edit,
  StatusCertified,
  StatusGray,
  StatusGreen,
  StatusOrange,
  StatusRejected
} from '@opencrvs/components/lib/icons'
import {
  ActionPage,
  ISearchInputProps,
  ISelectGroupValue,
  ListItem,
  ListItemExpansion,
  SearchInput,
  SelectFieldType,
  Spinner
} from '@opencrvs/components/lib/interface'
import { DataTable } from '@opencrvs/components/lib/interface/DataTable'
import { HeaderContent } from '@opencrvs/components/lib/layout'
import { ITheme } from '@opencrvs/components/lib/theme'
import {
  GQLComment,
  GQLDeathRegistration,
  GQLHumanName,
  GQLQuery
} from '@opencrvs/gateway/src/graphql/schema.d'
import * as Sentry from '@sentry/browser'
import * as moment from 'moment'
import * as React from 'react'
import { Query } from 'react-apollo'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { IViewHeadingProps } from 'src/components/ViewHeading'
import {
  goToEvents as goToEventsAction,
  goToPrintCertificate as goToPrintCertificateAction,
  goToReviewDuplicate as goToReviewDuplicateAction,
  goToSearchResult
} from 'src/navigation'
import { REVIEW_EVENT_PARENT_FORM_TAB } from 'src/navigation/routes'
import { getScope, getUserDetails } from 'src/profile/profileSelectors'
import { messages as rejectionMessages } from 'src/review/reject-registration'
import { SEARCH_EVENTS } from 'src/search/queries'
import { transformData } from 'src/search/transformer'
import { IStoreState } from 'src/store'
import { Scope } from 'src/utils/authUtils'
import {
  CERTIFICATE_DATE_FORMAT,
  DECLARED,
  LANG_EN,
  LOCAL_DATE_FORMAT,
  REJECTED,
  REJECT_REASON
} from 'src/utils/constants'
import {
  createNamesMap,
  extractCommentFragmentValue
} from 'src/utils/data-formatting'
import { formatLongDate } from 'src/utils/date-formatting'
import { IGQLLocation, IIdentifier, IUserDetails } from 'src/utils/userUtils'
import styled, { withTheme } from 'styled-components'
import { goToTab as goToTabAction } from '../../navigation'
import { FETCH_REGISTRATION_BY_COMPOSITION } from './queries'

const messages = defineMessages({
  hello: {
    id: 'register.home.header.hello',
    defaultMessage: 'Hello {fullName}',
    description: 'Title for the user'
  },
  searchInputPlaceholder: {
    id: 'register.workQueue.searchInput.placeholder',
    defaultMessage: 'Look for a record',
    description: 'The placeholder of search input'
  },
  searchInputButtonTitle: {
    id: 'register.workQueue.buttons.search',
    defaultMessage: 'Search',
    description: 'The title of search input submit button'
  },
  bannerTitle: {
    id: 'register.workQueue.applications.banner',
    defaultMessage: 'Applications to register in your area',
    description: 'The title of the banner'
  },
  queryError: {
    id: 'register.workQueue.queryError',
    defaultMessage: 'An error occurred while searching',
    description: 'The error message shown when a search query fails'
  },
  dataTableResults: {
    id: 'register.workQueue.dataTable.results',
    defaultMessage: 'Results',
    description: 'Results label at the top of the data table component'
  },
  dataTableNoResults: {
    id: 'register.workQueue.dataTable.noResults',
    defaultMessage: 'No result to display',
    description:
      'Text to display if the search return no results for the current filters'
  },
  headerTitle: {
    id: 'register.workQueue.header.title',
    defaultMessage: 'Hello Registrar',
    description: 'The displayed title in the Work Queue header'
  },
  headerDescription: {
    id: 'register.workQueue.header.description',
    defaultMessage: 'Review | Registration | Certification',
    description: 'The displayed description in the Work Queue header'
  },
  filtersSortBy: {
    id: 'register.workQueue.labels.selects.sort',
    defaultMessage: 'Sort By',
    description: 'Label for the sort by section of the filters'
  },
  filtersOldestToNewest: {
    id: 'register.workQueue.selects.sort.item0',
    defaultMessage: 'Oldest to newest',
    description: 'Label for the sort by oldest to newest option'
  },
  filtersNewestToOldest: {
    id: 'register.workQueue.selects.sort.item1',
    defaultMessage: 'Newest to oldest',
    description: 'Label for the sort by newest to oldest option'
  },
  filtersFilterBy: {
    id: 'register.workQueue.labels.selects.filter',
    defaultMessage: 'Sort By',
    description: 'Label for the sort by section of the filters'
  },
  filtersAllEvents: {
    id: 'register.workQueue.labels.events.all',
    defaultMessage: 'All life events',
    description: 'Label for the filter by all events option'
  },
  filtersBirth: {
    id: 'register.workQueue.labels.events.birth',
    defaultMessage: 'Birth',
    description: 'Label for the filter by birth option'
  },
  filtersDeath: {
    id: 'register.workQueue.labels.events.death',
    defaultMessage: 'Death',
    description: 'Label for the filter by death option'
  },
  filtersMarriage: {
    id: 'register.workQueue.labels.events.marriage',
    defaultMessage: 'Marriage',
    description: 'Label for the filter by marriage option'
  },
  filtersAllStatuses: {
    id: 'register.workQueue.labels.statuses.all',
    defaultMessage: 'All statues',
    description: 'Label for the filter by all statuses option'
  },
  filtersApplication: {
    id: 'register.workQueue.labels.statuses.application',
    defaultMessage: 'Application',
    description: 'Label for the filter by application option'
  },
  filtersRegistered: {
    id: 'register.workQueue.labels.statuses.registered',
    defaultMessage: 'Registered',
    description: 'Label for the filter by registered option'
  },
  filtersCollected: {
    id: 'register.workQueue.labels.statuses.collected',
    defaultMessage: 'Collected',
    description: 'Label for the filter by collected option'
  },
  filtersRejected: {
    id: 'register.workQueue.labels.statuses.rejected',
    defaultMessage: 'Rejected',
    description: 'Label for the filter by rejected option'
  },
  filtersAllLocations: {
    id: 'register.workQueue.labels.locations.all',
    defaultMessage: 'All locations',
    description: 'Label for filtering by all locations'
  },
  listItemName: {
    id: 'register.workQueue.labels.results.name',
    defaultMessage: 'Name',
    description: 'Label for name in work queue list item'
  },
  listItemDob: {
    id: 'register.workQueue.labels.results.dob',
    defaultMessage: 'D.o.B',
    description: 'Label for DoB in work queue list item'
  },
  listItemDod: {
    id: 'register.workQueue.labels.results.dod',
    defaultMessage: 'D.o.D',
    description: 'Label for DoD in work queue list item'
  },
  listItemDateOfApplication: {
    id: 'register.workQueue.labels.results.dateOfApplication',
    defaultMessage: 'Date of application',
    description: 'Label for date of application in work queue list item'
  },
  listItemTrackingNumber: {
    id: 'register.workQueue.labels.results.trackingID',
    defaultMessage: 'Tracking ID',
    description: 'Label for tracking ID in work queue list item'
  },
  listItemBirthRegistrationNumber: {
    id: 'register.workQueue.labels.results.birthRegistrationNumber',
    defaultMessage: 'BRN',
    description: 'Label for BRN in work queue list item'
  },
  listItemDeathRegistrationNumber: {
    id: 'register.workQueue.labels.results.deathRegistrationNumber',
    defaultMessage: 'DRN',
    description: 'Label for DRN in work queue list item'
  },
  listItemEventRegistrationNumber: {
    id: 'register.workQueue.labels.results.eventRegistrationNumber',
    defaultMessage:
      '{event, select, birth {B} death {D} marriage {M} divorce {Divorce } adoption {A}}RN',
    description: 'Label for event registration number in work queue list item'
  },
  listItemDuplicateLabel: {
    id: 'register.workQueue.labels.results.duplicate',
    defaultMessage: 'Possible duplicate found',
    description: 'Label for duplicate indication in work queue'
  },
  listItemRejectionReasonLabel: {
    id: 'register.workQueue.labels.results.rejectionReason',
    defaultMessage: 'Reason',
    description: 'Label for rejection reason'
  },
  listItemCommentLabel: {
    id: 'register.workQueue.labels.results.rejectionComment',
    defaultMessage: 'Comment',
    description: 'Label for rejection comment'
  },
  newRegistration: {
    id: 'register.workQueue.buttons.newRegistration',
    defaultMessage: 'New registration',
    description: 'The title of new registration button'
  },
  newApplication: {
    id: 'register.workQueue.buttons.newApplication',
    defaultMessage: 'New Application',
    description: 'The title of new application button'
  },
  reviewAndRegister: {
    id: 'register.workQueue.buttons.reviewAndRegister',
    defaultMessage: 'Review and Register',
    description:
      'The title of review and register button in expanded area of list item'
  },
  reviewDuplicates: {
    id: 'register.workQueue.buttons.reviewDuplicates',
    defaultMessage: 'Review Duplicates',
    description:
      'The title of review duplicates button in expanded area of list item'
  },
  review: {
    id: 'register.workQueue.list.buttons.review',
    defaultMessage: 'Review',
    description: 'The title of review button in list item actions'
  },
  print: {
    id: 'register.workQueue.list.buttons.print',
    defaultMessage: 'Print',
    description: 'The title of print button in list item actions'
  },
  printCertificate: {
    id: 'register.workQueue.list.buttons.printCertificate',
    defaultMessage: 'Print certificate',
    description:
      'The title of print certificate button in list expansion actions'
  },
  workflowStatusDateApplication: {
    id: 'register.workQueue.listItem.status.dateLabel.application',
    defaultMessage: 'Application submitted on',
    description:
      'Label for the workflow timestamp when the status is application'
  },
  workflowStatusDateRegistered: {
    id: 'register.workQueue.listItem.status.dateLabel.registered',
    defaultMessage: 'Registrated on',
    description:
      'Label for the workflow timestamp when the status is registered'
  },
  workflowStatusDateRejected: {
    id: 'register.workQueue.listItem.status.dateLabel.rejected',
    defaultMessage: 'Application rejected on',
    description: 'Label for the workflow timestamp when the status is rejected'
  },
  workflowStatusDateCollected: {
    id: 'register.workQueue.listItem.status.dateLabel.collected',
    defaultMessage: 'Certificate collected on',
    description: 'Label for the workflow timestamp when the status is collected'
  },
  workflowPractitionerLabel: {
    id: 'register.workQueue.listItem.status.label.byPractitioner',
    defaultMessage: 'By',
    description: 'Label for the practitioner name in workflow'
  },
  EditBtnText: {
    id: 'review.edit.modal.editButton',
    defaultMessage: 'Edit',
    description: 'Edit button text'
  },
  printCertificateBtnText: {
    id: 'register.workQueue.buttons.printCertificate',
    defaultMessage: 'Print Certificate',
    description: 'Print Certificate Button text'
  },
  FIELD_AGENT: {
    id: 'register.home.header.FIELD_AGENT',
    defaultMessage: 'Field Agent',
    description: 'The description for FIELD_AGENT role'
  },
  REGISTRATION_CLERK: {
    id: 'register.home.header.REGISTRATION_CLERK',
    defaultMessage: 'Registration Clerk',
    description: 'The description for REGISTRATION_CLERK role'
  },
  LOCAL_REGISTRAR: {
    id: 'register.home.header.LOCAL_REGISTRAR',
    defaultMessage: 'Registrar',
    description: 'The description for LOCAL_REGISTRAR role'
  },
  DISTRICT_REGISTRAR: {
    id: 'register.home.header.DISTRICT_REGISTRAR',
    defaultMessage: 'District Registrar',
    description: 'The description for DISTRICT_REGISTRAR role'
  },
  STATE_REGISTRAR: {
    id: 'register.home.header.STATE_REGISTRAR',
    defaultMessage: 'State Registrar',
    description: 'The description for STATE_REGISTRAR role'
  },
  NATIONAL_REGISTRAR: {
    id: 'register.home.header.NATIONAL_REGISTRAR',
    defaultMessage: 'National Registrar',
    description: 'The description for NATIONAL_REGISTRAR role'
  },
  application: {
    id: 'register.workQueue.statusLabel.application',
    defaultMessage: 'application',
    description: 'The status label for application'
  },
  registered: {
    id: 'register.workQueue.statusLabel.registered',
    defaultMessage: 'registered',
    description: 'The status label for registered'
  },
  rejected: {
    id: 'register.workQueue.statusLabel.rejected',
    defaultMessage: 'rejected',
    description: 'The status label for rejected'
  },
  collected: {
    id: 'register.workQueue.statusLabel.collected',
    defaultMessage: 'collected',
    description: 'The status label for collected'
  },
  title: {
    id: 'register.SearchResult.title',
    defaultMessage: 'Search',
    description: 'The title of the page'
  },
  collectedBy: {
    id: 'register.SearchResult.collectedBy',
    defaultMessage: 'Collected by',
    description: 'The collected by sec text'
  },
  issuedBy: {
    id: 'register.SearchResult.issuedBy',
    defaultMessage: 'Issued by',
    description: 'The issued by sec text'
  },
  rejectReason: {
    id: 'register.SearchResult.rejectReason',
    defaultMessage: 'Reason',
    description: 'The rejected reason'
  },
  informantContact: {
    id: 'register.SearchResult.informantContact',
    defaultMessage: 'Informant contact number',
    description: 'The rejected reason'
  }
})

const StyledSpinner = styled(Spinner)`
  margin: 50% auto;
`
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
  font-family: ${({ theme }) => theme.fonts.lightFont};
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
  font-family: ${({ theme }) => theme.fonts.boldFont};
  margin-right: 3px;
`
const StyledValue = styled.span`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  text-transform: capitalize !important;
`
const ValueContainer = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  line-height: 1.3em;
  & span:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.colors.copyAlpha80};
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
    section = section.charAt(0) + section.slice(1).toLowerCase()
    formattedString.push(section)
  })

  return formattedString.join(' ')
}

export function getRejectionReasonDisplayValue(reason: string) {
  switch (reason.toLowerCase()) {
    case 'duplicate':
      return rejectionMessages.rejectionReasonDuplicate
    case 'misspelling':
      return rejectionMessages.rejectionReasonMisspelling
    case 'missing_supporting_doc':
      return rejectionMessages.rejectionReasonMissingSupportingDoc
    case 'other':
      return rejectionMessages.rejectionReasonOther
    default:
      return rejectionMessages.rejectionReasonOther
  }
}

const ExpansionContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.colors.copy};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
`
const ExpansionContentContainer = styled.div`
  flex: 1;
  margin-left: 10px;
`
const StyledPrimaryButton = styled(PrimaryButton)`
  font-family: ${({ theme }) => theme.fonts.boldFont};
`

const StyledSecondaryButton = styled(SecondaryButton)`
  border: solid 1px ${({ theme }) => theme.colors.disabledButton};
  color: ${({ theme }) => theme.colors.primary} !important;
  font-weight: bold;
  svg {
    margin-right: 15px;
  }
  &:hover {
    background: inherit;
    border: solid 1px ${({ theme }) => theme.colors.disabledButton};
  }
  &:disabled {
    background-color: ${({ theme }) => theme.colors.inputBackground};
  }
`
const StatusIcon = styled.div`
  margin-top: 3px;
`
interface IBaseSearchResultProps {
  theme: ITheme
  language: string
  scope: Scope
  goToEvents: typeof goToEventsAction
  userDetails: IUserDetails
  gotoTab: typeof goToTabAction
  goToReviewDuplicate: typeof goToReviewDuplicateAction
  goToPrintCertificate: typeof goToPrintCertificateAction
  goToSearchResult: typeof goToSearchResult
}

interface IMatchParams {
  searchText: string
}

type ISearchResultProps = InjectedIntlProps &
  IViewHeadingProps &
  ISearchInputProps &
  IBaseSearchResultProps &
  RouteComponentProps<IMatchParams>

interface ISearchResultState {
  printCertificateModalVisible: boolean
  regId: string | null
  currentPage: number
  sortBy?: string
  eventType?: string
  status?: string
  searchContent?: string
}
export class SearchResultView extends React.Component<
  ISearchResultProps,
  ISearchResultState
> {
  state = {
    printCertificateModalVisible: false,
    regId: null,
    currentPage: 1,
    sortBy: 'asc',
    eventType: '',
    status: '',
    searchContent: ''
  }
  pageSize = 10

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
        return this.props.intl.formatMessage(messages.application)
      case 'REGISTERED':
        return this.props.intl.formatMessage(messages.registered)
      case 'REJECTED':
        return this.props.intl.formatMessage(messages.rejected)
      case 'CERTIFIED':
        return this.props.intl.formatMessage(messages.collected)
      default:
        return this.props.intl.formatMessage(messages.application)
    }
  }

  getWorkflowDateLabel = (status: string) => {
    switch (status) {
      case 'DECLARED':
        return messages.workflowStatusDateApplication
      case 'REGISTERED':
        return messages.workflowStatusDateRegistered
      case 'REJECTED':
        return messages.workflowStatusDateRejected
      case 'CERTIFIED':
        return messages.workflowStatusDateCollected
      default:
        return messages.workflowStatusDateApplication
    }
  }

  getEventLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'BIRTH':
        return this.props.intl.formatMessage(messages.filtersBirth)
      case 'DEATH':
        return this.props.intl.formatMessage(messages.filtersDeath)
      default:
        return this.props.intl.formatMessage(messages.filtersBirth)
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
                messages[status.user.role as string]
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
          {({ loading, error, data }) => {
            const { intl, language } = this.props
            moment.locale(language)
            if (error) {
              Sentry.captureException(error)
            } else if (loading) {
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
                  informantContactNumber
                } = status
                const type = status.type as string
                const officeName = status.officeName as string
                const timestamp = moment(
                  status.timestamp as string,
                  LOCAL_DATE_FORMAT
                ).format(CERTIFICATE_DATE_FORMAT)
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
                          label={intl.formatMessage(messages.collectedBy)}
                          value={collectorInfo}
                        />
                      )}
                      <ValueContainer>
                        <StyledLabel>
                          {this.props.intl.formatMessage(
                            collectorType
                              ? messages.issuedBy
                              : messages.workflowPractitionerLabel
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
                        <LabelValue
                          label={intl.formatMessage(messages.rejectReason)}
                          value={rejectReasons}
                        />
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
    const applicationIsRegistered = item.declaration_status === 'REGISTERED'
    const applicationIsCertified = item.declaration_status === 'CERTIFIED'
    const applicationIsRejected = item.declaration_status === 'REJECTED'
    const info = []
    const status = []
    const icons = []

    info.push({
      label: this.props.intl.formatMessage(messages.listItemName),
      value: item.name
    })
    if (item.dob) {
      info.push({
        label: this.props.intl.formatMessage(messages.listItemDob),
        value: item.dob
      })
    }
    if (item.dod) {
      info.push({
        label: this.props.intl.formatMessage(messages.listItemDod),
        value: item.dod
      })
    }
    info.push({
      label: this.props.intl.formatMessage(messages.listItemDateOfApplication),
      value: item.date_of_application
    })
    if (!applicationIsRegistered || !applicationIsCertified) {
      info.push({
        label: this.props.intl.formatMessage(messages.listItemTrackingNumber),
        value: item.tracking_id
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
    }

    status.push({
      icon: <StatusGray />,
      label: this.getEventLabel(item.event)
    })
    status.push({
      icon: this.getDeclarationStatusIcon(item.declaration_status),
      label: this.getDeclarationStatusLabel(item.declaration_status)
    })

    if (applicationIsRejected && item.rejection_reasons) {
      const reasons = item.rejection_reasons.split(',')
      const rejectComment = item.rejection_comment

      info.push({
        label: this.props.intl.formatMessage(
          messages.listItemRejectionReasonLabel
        ),
        value:
          reasons &&
          reasons
            .reduce(
              (prev, curr) => [
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
          label: this.props.intl.formatMessage(messages.listItemCommentLabel),
          value: rejectComment
        })
      }
    }

    if (item.duplicates && item.duplicates.length > 0) {
      icons.push(<Duplicate />)
    }

    const listItemActions = []

    const expansionActions: JSX.Element[] = []
    if (this.userHasCertifyScope()) {
      if (applicationIsRegistered || applicationIsCertified) {
        listItemActions.push({
          label: this.props.intl.formatMessage(messages.print),
          handler: () => this.props.goToPrintCertificate(item.id, item.event)
        })

        expansionActions.push(
          <StyledPrimaryButton
            id={`printCertificate_${item.tracking_id}`}
            onClick={() => this.props.goToPrintCertificate(item.id, item.event)}
          >
            {this.props.intl.formatMessage(messages.printCertificateBtnText)}
          </StyledPrimaryButton>
        )
      }
    }

    if (this.userHasRegisterScope()) {
      if (
        !(item.duplicates && item.duplicates.length > 0) &&
        !applicationIsRegistered &&
        !applicationIsRejected &&
        !applicationIsCertified
      ) {
        listItemActions.push({
          label: this.props.intl.formatMessage(messages.review),
          handler: () =>
            this.props.gotoTab(
              REVIEW_EVENT_PARENT_FORM_TAB,
              item.id,
              'review',
              item.event.toLowerCase()
            )
        })

        expansionActions.push(
          <StyledPrimaryButton
            id={`reviewAndRegisterBtn_${item.tracking_id}`}
            onClick={() =>
              this.props.gotoTab(
                REVIEW_EVENT_PARENT_FORM_TAB,
                item.id,
                'review',
                item.event.toLowerCase()
              )
            }
          >
            {this.props.intl.formatMessage(messages.reviewAndRegister)}
          </StyledPrimaryButton>
        )
      }
    }

    if (
      item.duplicates &&
      item.duplicates.length > 0 &&
      !applicationIsRegistered &&
      !applicationIsRejected
    ) {
      listItemActions.push({
        label: this.props.intl.formatMessage(messages.reviewDuplicates),
        handler: () => this.props.goToReviewDuplicate(item.id)
      })
      expansionActions.push(
        <StyledPrimaryButton
          id={`reviewDuplicatesBtn_${item.tracking_id}`}
          onClick={() => {
            this.props.goToReviewDuplicate(item.id)
          }}
        >
          {this.props.intl.formatMessage(messages.reviewDuplicates)}
        </StyledPrimaryButton>
      )
    }
    if (applicationIsRegistered) {
      expansionActions.push(
        <StyledSecondaryButton
          id={`editBtn_${item.tracking_id}`}
          disabled={true}
        >
          <Edit />
          {this.props.intl.formatMessage(messages.EditBtnText)}
        </StyledSecondaryButton>
      )
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

  userHasCertifyScope() {
    return this.props.scope && this.props.scope.includes('certify')
  }

  getLocalLocationId() {
    const area = this.props.userDetails && this.props.userDetails.catchmentArea
    const identifier =
      area &&
      area.find((location: IGQLLocation) => {
        return (
          (location.identifier &&
            location.identifier.find((areaIdentifier: IIdentifier) => {
              return (
                areaIdentifier.system.endsWith('jurisdiction-type') &&
                areaIdentifier.value === 'UNION'
              )
            })) !== undefined
        )
      })

    return identifier && identifier.id
  }
  onPageChange = async (newPageNumber: number) => {
    this.setState({ currentPage: newPageNumber })
  }
  onSortChange = (sortBy: string) => {
    this.setState({ sortBy })
  }
  onFilterChange = (
    value: ISelectGroupValue,
    changedValue: ISelectGroupValue
  ) => {
    this.setState({
      eventType: this.state.eventType,
      status: this.state.status,
      ...changedValue
    })
  }

  render() {
    const { intl, match, theme } = this.props
    const searchParam = match.params.searchText
    const sortBy = {
      input: {
        label: intl.formatMessage(messages.filtersSortBy)
      },
      selects: {
        name: '',
        options: [
          {
            name: 'createdAt',
            options: [
              {
                value: 'asc',
                label: intl.formatMessage(messages.filtersOldestToNewest)
              },
              {
                value: 'desc',
                label: intl.formatMessage(messages.filtersNewestToOldest)
              }
            ],
            value: this.state.sortBy,
            type: SelectFieldType.Date
          }
        ]
      }
    }
    const filterBy = {
      input: {
        label: intl.formatMessage(messages.filtersFilterBy)
      },
      selects: {
        name: '',
        options: [
          {
            name: 'eventType',
            options: [
              {
                value: '',
                label: intl.formatMessage(messages.filtersAllEvents)
              },
              {
                value: 'Birth',
                label: intl.formatMessage(messages.filtersBirth)
              },
              {
                value: 'Death',
                label: intl.formatMessage(messages.filtersDeath)
              },
              {
                value: 'Marriage',
                label: intl.formatMessage(messages.filtersMarriage)
              }
            ],
            value: this.state.eventType || ''
          },
          {
            name: 'status',
            options: [
              {
                value: '',
                label: intl.formatMessage(messages.filtersAllStatuses)
              },
              {
                value: 'DECLARED',
                label: intl.formatMessage(messages.filtersApplication)
              },
              {
                value: 'REGISTERED',
                label: intl.formatMessage(messages.filtersRegistered)
              },
              {
                value: 'CERTIFIED',
                label: intl.formatMessage(messages.filtersCollected)
              },
              {
                value: 'REJECTED',
                label: intl.formatMessage(messages.filtersRejected)
              }
            ],
            value: this.state.status || ''
          }
        ]
      }
    }

    return (
      <ActionPageWrapper>
        <ActionPage
          goBack={() => {
            window.location.assign('/')
          }}
          title={intl.formatMessage(messages.title)}
        >
          <Container>
            <HeaderContent>
              <Query
                query={SEARCH_EVENTS}
                variables={{
                  locationIds: [this.getLocalLocationId()],
                  count: this.pageSize,
                  skip: (this.state.currentPage - 1) * this.pageSize,
                  sort: this.state.sortBy,
                  eventType: this.state.eventType,
                  status: this.state.status,
                  searchContent: searchParam
                }}
              >
                {({ loading, error, data }) => {
                  if (loading) {
                    return (
                      <StyledSpinner
                        id="search-result-spinner"
                        baseColor={theme.colors.background}
                      />
                    )
                  }
                  if (error) {
                    console.log(`ERROR in QUERY ${JSON.stringify(error)}`)
                    Sentry.captureException(error)

                    return (
                      <ErrorText id="search-result-error-text">
                        {intl.formatMessage(messages.queryError)}
                      </ErrorText>
                    )
                  }
                  const transformedData = transformData(data, intl)
                  return (
                    <>
                      <SearchInput
                        id="search-input-text"
                        searchValue={searchParam}
                        placeholder={intl.formatMessage(
                          messages.searchInputPlaceholder
                        )}
                        buttonLabel={intl.formatMessage(
                          messages.searchInputButtonTitle
                        )}
                        onSubmit={this.props.goToSearchResult}
                        {...this.props}
                      />
                      <DataTable
                        data={transformedData}
                        sortBy={sortBy}
                        filterBy={filterBy}
                        cellRenderer={this.renderCell}
                        resultLabel={intl.formatMessage(
                          messages.dataTableResults
                        )}
                        noResultText={intl.formatMessage(
                          messages.dataTableNoResults
                        )}
                        onPageChange={(currentPage: number) => {
                          this.onPageChange(currentPage)
                        }}
                        onSortChange={(value: ISelectGroupValue) =>
                          this.onSortChange(value.createdAt)
                        }
                        onFilterChange={(
                          value: ISelectGroupValue,
                          changedValue: ISelectGroupValue
                        ) => {
                          this.onFilterChange(value, changedValue)
                        }}
                        pageSize={this.pageSize}
                        totalPages={Math.ceil(
                          ((data.listEventRegistrations &&
                            data.listEventRegistrations.totalItems) ||
                            0) / this.pageSize
                        )}
                        initialPage={this.state.currentPage}
                      />
                    </>
                  )
                }}
              </Query>
            </HeaderContent>
          </Container>
        </ActionPage>
      </ActionPageWrapper>
    )
  }
}
export const SearchResult = connect(
  (state: IStoreState) => ({
    language: state.i18n.language,
    scope: getScope(state),
    userDetails: getUserDetails(state)
  }),
  {
    goToEvents: goToEventsAction,
    goToSearchResult,
    gotoTab: goToTabAction,
    goToReviewDuplicate: goToReviewDuplicateAction,
    goToPrintCertificate: goToPrintCertificateAction
  }
)(injectIntl(withTheme(SearchResultView)))
