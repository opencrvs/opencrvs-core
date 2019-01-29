import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import styled, { withTheme } from 'styled-components'
import * as moment from 'moment'
import { IViewHeadingProps } from 'src/components/ViewHeading'
import {
  IconAction,
  ActionTitle,
  PrimaryButton,
  SecondaryButton
} from '@opencrvs/components/lib/buttons'
import { Plus, Edit } from '@opencrvs/components/lib/icons'
import {
  Banner,
  SearchInput,
  ISearchInputProps,
  ListItem,
  Spinner,
  ListItemExpansion,
  SelectFieldType
} from '@opencrvs/components/lib/interface'
import { DataTable } from '@opencrvs/components/lib/interface/DataTable'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import {
  GQLBirthRegistration,
  GQLRegWorkflow,
  GQLLocation,
  GQLHumanName,
  GQLQuery
} from '@opencrvs/gateway/src/graphql/schema.d'
import {
  StatusGray,
  StatusOrange,
  StatusGreen,
  StatusCollected,
  StatusRejected,
  Duplicate
} from '@opencrvs/components/lib/icons'
import { HomeViewHeader } from 'src/components/HomeViewHeader'
import { IStoreState } from 'src/store'
import { getScope } from 'src/profile/profileSelectors'
import { Scope } from 'src/utils/authUtils'
import { ITheme } from '@opencrvs/components/lib/theme'
import {
  goToEvents as goToEventsAction,
  goToReviewDuplicate as goToReviewDuplicateAction
} from 'src/navigation'
import { goToTab as goToTabAction } from '../../navigation'
import { REVIEW_BIRTH_PARENT_FORM_TAB } from 'src/navigation/routes'
import { IUserDetails, IGQLLocation, IIdentifier } from 'src/utils/userUtils'
import { PrintCertificateAction } from '../PrintCertificate/PrintCertificateAction'
import { IFormSection } from 'src/forms'
import { APPLICATIONS_STATUS } from 'src/utils/constants'
import { getUserDetails } from 'src/profile/profileSelectors'
import { createNamesMap } from 'src/utils/data-formating'
import { HeaderContent } from '@opencrvs/components/lib/layout'

export const FETCH_REGISTRATION_QUERY = gql`
  query list($locationIds: [String]) {
    listBirthRegistrations(locationIds: $locationIds) {
      id
      registration {
        trackingId
        registrationNumber
        status {
          user {
            name {
              use
              firstNames
              familyName
            }
            role
          }
          location {
            name
            alias
          }
          type
          timestamp
        }
        duplicates
      }
      child {
        name {
          use
          firstNames
          familyName
        }
        birthDate
      }
      createdAt
    }
  }
`

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
  listItemDuplicateLabel: {
    id: 'register.workQueue.labels.results.duplicate',
    defaultMessage: 'Possible duplicate found',
    description: 'Label for duplicate indication in work queue'
  },
  newRegistration: {
    id: 'register.workQueue.buttons.newRegistration',
    defaultMessage: 'New birth registration',
    description: 'The title of new registration button'
  },
  newApplication: {
    id: 'register.workQueue.buttons.newApplication',
    defaultMessage: 'New Birth Application',
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
  certificateCollectionActionTitle: {
    id: 'register.workQueue.title.certificateCollection',
    defaultMessage: 'Certificate Collection',
    description: 'The title of print certificate action'
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
    defaultMessage: 'Rejected on',
    description: 'Label for the workflow timestamp when the status is rejected'
  },
  workflowStatusDateCollected: {
    id: 'register.workQueue.listItem.status.dateLabel.collected',
    defaultMessage: 'Collected on',
    description: 'Label for the workflow timestamp when the status is collected'
  },
  workflowPractitionerLabel: {
    id: 'register.workQueue.listItem.status.label.byPractitioner',
    defaultMessage: 'By',
    description: 'Label for the practitioner name in workflow'
  },
  back: {
    id: 'menu.back',
    defaultMessage: 'Back',
    description: 'Back button in the menu'
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
    id: 'register.home.hedaer.FIELD_AGENT',
    defaultMessage: 'Field Agent',
    description: 'The description for FIELD_AGENT role'
  },
  REGISTRATION_CLERK: {
    id: 'register.home.hedaer.REGISTRATION_CLERK',
    defaultMessage: 'Registration Clerk',
    description: 'The description for REGISTRATION_CLERK role'
  },
  LOCAL_REGISTRAR: {
    id: 'register.home.hedaer.LOCAL_REGISTRAR',
    defaultMessage: 'Registrar',
    description: 'The description for LOCAL_REGISTRAR role'
  },
  DISTRICT_REGISTRAR: {
    id: 'register.home.hedaer.DISTRICT_REGISTRAR',
    defaultMessage: 'District Registrar',
    description: 'The description for DISTRICT_REGISTRAR role'
  },
  STATE_REGISTRAR: {
    id: 'register.home.hedaer.STATE_REGISTRAR',
    defaultMessage: 'State Registrar',
    description: 'The description for STATE_REGISTRAR role'
  },
  NATIONAL_REGISTRAR: {
    id: 'register.home.hedaer.NATIONAL_REGISTRAR',
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
  }
})

const StyledSpinner = styled(Spinner)`
  margin: 50% auto;
`

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.fonts.lightFont};
  text-align: center;
  margin-top: 100px;
`

const Container = styled.div`
  z-index: 1;
  position: relative;
  margin-top: -30px;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
`
const StyledPlusIcon = styled(Plus)`
  display: flex;
  margin-left: -23px;
`
const StyledIconAction = styled(IconAction)`
  display: flex;
  min-height: 96px;
  padding: 0 20px 0 0;
  box-shadow: 0 0 12px 1px rgba(0, 0, 0, 0.22);
  background-color: ${({ theme }) => theme.colors.accentLight};
  /* stylelint-disable */
  ${ActionTitle} {
    /* stylelint-enable */
    font-size: 28px;
    font-weight: 300;
    margin: -2px 0 -2px 120px;
    line-height: 1.3em;
    color: ${({ theme }) => theme.colors.white};
  }
`
const StyledLabel = styled.label`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  margin-right: 3px;
`
const StyledValue = styled.span`
  font-family: ${({ theme }) => theme.fonts.regularFont};
`
const Separator = styled.div`
  height: 1.3em;
  width: 1px;
  margin: 1px 8px;
  background: ${({ theme }) => theme.colors.copyAlpha80};
`
const ValueContainer = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  line-height: 1.3em;
`
const DuplicateIndicatorContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  & span {
    font-family: ${({ theme }) => theme.fonts.boldFont};
    margin-left: 10px;
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

function ValuesWithSeparator(props: {
  strings: string[]
  separator: React.ReactNode
}): JSX.Element {
  return (
    <ValueContainer>
      {props.strings.map((value, index) => {
        return (
          <React.Fragment key={index}>
            {value}
            {index < props.strings.length - 1 && value.length > 0
              ? props.separator
              : null}
          </React.Fragment>
        )
      })}
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

const ExpansionContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.colors.copy};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  margin-bottom: 1px;
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

interface IBaseWorkQueueProps {
  theme: ITheme
  language: string
  scope: Scope
  goToEvents: typeof goToEventsAction
  userDetails: IUserDetails
  gotoTab: typeof goToTabAction
  goToReviewDuplicate: typeof goToReviewDuplicateAction
  printForm: IFormSection
}

type IWorkQueueProps = InjectedIntlProps &
  IViewHeadingProps &
  ISearchInputProps &
  IBaseWorkQueueProps

interface IWorkQueueState {
  printCertificateModalVisible: boolean
  regId: string | null
}

interface IData {
  [key: string]: unknown
}

interface IWorkQueueListItem {
  [key: string]: IData | string | undefined
}

export class WorkQueueView extends React.Component<
  IWorkQueueProps,
  IWorkQueueState
> {
  state = { printCertificateModalVisible: false, regId: null }

  getDeclarationStatusIcon = (status: string) => {
    switch (status) {
      case 'APPLICATION':
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
      case 'COLLECTED':
        return (
          <StatusIcon>
            <StatusCollected />
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
      case 'APPLICATION':
        return this.props.intl.formatMessage(messages.application)
      case 'REGISTERED':
        return this.props.intl.formatMessage(messages.registered)
      case 'REJECTED':
        return this.props.intl.formatMessage(messages.rejected)
      case 'COLLECTED':
        return this.props.intl.formatMessage(messages.collected)
      default:
        return this.props.intl.formatMessage(messages.application)
    }
  }

  getWorkflowDateLabel = (status: string) => {
    switch (status) {
      case 'APPLICATION':
        return messages.workflowStatusDateApplication
      case 'REGISTERED':
        return messages.workflowStatusDateRegistered
      case 'REJECTED':
        return messages.workflowStatusDateRejected
      case 'COLLECTED':
        return messages.workflowStatusDateCollected
      default:
        return messages.workflowStatusDateApplication
    }
  }

  getEventLabel = (status: string) => {
    switch (status) {
      case 'birth':
        return this.props.intl.formatMessage(messages.filtersBirth)
      case 'death':
        return this.props.intl.formatMessage(messages.filtersDeath)
      case 'marriage':
        return this.props.intl.formatMessage(messages.filtersMarriage)
      default:
        return this.props.intl.formatMessage(messages.filtersBirth)
    }
  }

  togglePrintModal = (id?: string) => {
    this.setState(prevState => ({
      printCertificateModalVisible: !prevState.printCertificateModalVisible,
      regId: id ? id : ''
    }))
  }

  transformData = (data: GQLQuery) => {
    if (!data.listBirthRegistrations) {
      return []
    }

    return data.listBirthRegistrations.map((reg: GQLBirthRegistration) => {
      const childNames = (reg.child && (reg.child.name as GQLHumanName[])) || []
      const lang = 'bn'
      return {
        id: reg.id,
        name:
          (createNamesMap(childNames)[lang] as string) ||
          /* tslint:disable:no-string-literal */
          (createNamesMap(childNames)['default'] as string) ||
          /* tslint:enable:no-string-literal */
          '',
        dob: (reg.child && reg.child.birthDate) || '',
        date_of_application: moment(reg.createdAt).format('YYYY-MM-DD'),
        registrationNumber:
          (reg.registration && reg.registration.registrationNumber) || '',
        tracking_id: (reg.registration && reg.registration.trackingId) || '',
        createdAt: reg.createdAt as string,
        status:
          reg.registration &&
          reg.registration.status &&
          reg.registration.status.map(status => {
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
                  /* tslint:disable:no-string-literal */
                  (createNamesMap(status.user.name as GQLHumanName[])[
                    'default'
                  ] as string)) ||
                /* tslint:enable:no-string-literal */
                '',
              timestamp:
                status && moment(status.timestamp).format('YYYY-MM-DD'),
              practitionerRole: status && status.user && status.user.role,
              location: status && status.location && status.location.name
            }
          }),
        declaration_status:
          reg.registration &&
          reg.registration.status &&
          (reg.registration.status[0] as GQLRegWorkflow).type,
        event: 'birth',

        duplicates: reg.registration && reg.registration.duplicates,
        location:
          (reg.registration &&
            reg.registration.status &&
            (reg.registration.status[0] as GQLRegWorkflow).location &&
            ((reg.registration.status[0] as GQLRegWorkflow)
              .location as GQLLocation).name) ||
          ''
      }
    })
  }

  getApplicationData = (
    applicationData: IWorkQueueListItem[]
  ): IWorkQueueListItem[] => {
    return applicationData.filter(application => {
      if (application.status && application.status[0].type) {
        return application.status[0].type === 'DECLARED'
      } else {
        return false
      }
    })
  }

  renderExpansionContent = (
    item: {
      [key: string]: string & Array<{ [key: string]: string }>
    },
    key: number
  ): JSX.Element[] => {
    return item.status.map(status => {
      const { practitionerName, practitionerRole, location } = status
      return (
        <ExpansionContainer key={key}>
          {this.getDeclarationStatusIcon(status.type)}
          <ExpansionContentContainer>
            <LabelValue
              label={this.props.intl.formatMessage(
                this.getWorkflowDateLabel(status.type)
              )}
              value={status.timestamp}
            />
            <ValueContainer>
              <StyledLabel>
                {this.props.intl.formatMessage(
                  messages.workflowPractitionerLabel
                )}
                :
              </StyledLabel>
              <ValuesWithSeparator
                strings={[
                  practitionerName,
                  formatRoleCode(practitionerRole),
                  location
                ]}
                separator={<Separator />}
              />
            </ValueContainer>
            {item.duplicates && (
              <DuplicateIndicatorContainer>
                <Duplicate />
                <span>
                  {this.props.intl.formatMessage(
                    messages.listItemDuplicateLabel
                  )}
                </span>
              </DuplicateIndicatorContainer>
            )}
          </ExpansionContentContainer>
        </ExpansionContainer>
      )
    })
  }

  renderCell = (
    item: { [key: string]: string & Array<{ type: string }> },
    key: number
  ): JSX.Element => {
    const applicationIsRegistered = item.declaration_status === 'REGISTERED'
    const applicationIsRejected = item.declaration_status === 'REJECTED'
    const info = []
    const status = []
    const icons = []

    info.push({
      label: this.props.intl.formatMessage(messages.listItemName),
      value: item.name
    })
    info.push({
      label: this.props.intl.formatMessage(messages.listItemDob),
      value: item.dob
    })
    info.push({
      label: this.props.intl.formatMessage(messages.listItemDateOfApplication),
      value: item.date_of_application
    })
    if (!applicationIsRegistered) {
      info.push({
        label: this.props.intl.formatMessage(messages.listItemTrackingNumber),
        value: item.tracking_id
      })
    }
    if (applicationIsRegistered) {
      info.push({
        label: this.props.intl.formatMessage(
          messages.listItemBirthRegistrationNumber
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

    if (item.duplicates) {
      icons.push(<Duplicate />)
    }

    const listItemActions = []

    const expansionActions: JSX.Element[] = []
    if (this.userHasCertifyScope()) {
      if (applicationIsRegistered) {
        listItemActions.push({
          label: this.props.intl.formatMessage(messages.print),
          handler: () => this.togglePrintModal(item.id)
        })

        expansionActions.push(
          <StyledPrimaryButton
            id={`printCertificate_${item.tracking_id}`}
            onClick={() => this.togglePrintModal(item.id)}
          >
            {this.props.intl.formatMessage(messages.printCertificateBtnText)}
          </StyledPrimaryButton>
        )
      }
    }

    if (this.userHasRegisterScope()) {
      if (
        !item.duplicates &&
        !applicationIsRegistered &&
        !applicationIsRejected
      ) {
        listItemActions.push({
          label: this.props.intl.formatMessage(messages.review),
          handler: () =>
            this.props.gotoTab(REVIEW_BIRTH_PARENT_FORM_TAB, item.id, 'review')
        })

        expansionActions.push(
          <StyledPrimaryButton
            id={`reviewAndRegisterBtn_${item.tracking_id}`}
            onClick={() =>
              this.props.gotoTab(
                REVIEW_BIRTH_PARENT_FORM_TAB,
                item.id,
                'review'
              )
            }
          >
            {this.props.intl.formatMessage(messages.reviewAndRegister)}
          </StyledPrimaryButton>
        )
      }
    }

    if (item.duplicates && !applicationIsRegistered && !applicationIsRejected) {
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
          <ListItemExpansion actions={expansionActions}>
            {this.renderExpansionContent(item, key)}
          </ListItemExpansion>
        )}
      />
    )
  }
  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }
  userHasDeclareScope() {
    return this.props.scope && this.props.scope.includes('declare')
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

  getNewEventButtonText() {
    if (this.userHasRegisterScope()) {
      return messages.newRegistration
    } else if (this.userHasDeclareScope()) {
      return messages.newApplication
    } else {
      return messages.newApplication
    }
  }

  getIssuerDetails() {
    const { intl, userDetails, language } = this.props
    let fullName = ''

    if (userDetails && userDetails.name) {
      const nameObj = userDetails.name.find(
        (storedName: GQLHumanName) => storedName.use === language
      ) as GQLHumanName
      fullName = `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
    }

    return {
      name: fullName,
      role:
        userDetails && userDetails.role
          ? intl.formatMessage(messages[userDetails.role])
          : '',
      issuedAt:
        userDetails &&
        userDetails.primaryOffice &&
        userDetails.primaryOffice.name
          ? userDetails.primaryOffice.name
          : ''
    }
  }

  render() {
    const { intl, theme, printForm } = this.props
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
            value: 'desc',
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
            name: 'event',
            options: [
              {
                value: '',
                label: intl.formatMessage(messages.filtersAllEvents)
              },
              {
                value: 'birth',
                label: intl.formatMessage(messages.filtersBirth)
              },
              {
                value: 'death',
                label: intl.formatMessage(messages.filtersDeath)
              },
              {
                value: 'marriage',
                label: intl.formatMessage(messages.filtersMarriage)
              }
            ],
            value: ''
          },
          {
            name: 'declaration_status',
            options: [
              {
                value: '',
                label: intl.formatMessage(messages.filtersAllStatuses)
              },
              {
                value: 'application',
                label: intl.formatMessage(messages.filtersApplication)
              },
              {
                value: 'registered',
                label: intl.formatMessage(messages.filtersRegistered)
              },
              {
                value: 'collected',
                label: intl.formatMessage(messages.filtersCollected)
              }
            ],
            value: ''
          },
          {
            name: 'location',
            options: [
              {
                value: '',
                label: intl.formatMessage(messages.filtersAllLocations)
              },
              // TODO these need to be translated but those needs to be read from our backend when we have locations setup
              { value: 'gazipur', label: 'Gazipur Union' },
              { value: 'badda', label: 'Badda Union' },
              { value: 'dhamrai', label: 'Dhamrai Union' },
              { value: 'savar', label: 'Savar Union' },
              { value: 'dohar', label: 'Dohar Union' }
            ],
            value: ''
          }
        ]
      }
    }
    return (
      <>
        <HomeViewHeader
          title={intl.formatMessage(messages.hello, {
            fullName: this.getIssuerDetails().name
          })}
          description={this.getIssuerDetails().role}
          id="home_view"
        />
        <Container>
          <HeaderContent>
            <Query
              query={FETCH_REGISTRATION_QUERY}
              variables={{
                locationIds: [this.getLocalLocationId()]
              }}
            >
              {({ loading, error, data }) => {
                if (loading) {
                  return (
                    <StyledSpinner
                      id="work-queue-spinner"
                      baseColor={theme.colors.background}
                    />
                  )
                }
                if (error) {
                  return (
                    <ErrorText id="work-queue-error-text">
                      {intl.formatMessage(messages.queryError)}
                    </ErrorText>
                  )
                }
                const transformedData = this.transformData(data)
                const applicationData = this.getApplicationData(transformedData)
                return (
                  <>
                    <StyledIconAction
                      id="new_registration"
                      icon={() => <StyledPlusIcon />}
                      onClick={this.props.goToEvents}
                      title={intl.formatMessage(this.getNewEventButtonText())}
                    />
                    <Banner
                      text={intl.formatMessage(messages.bannerTitle)}
                      count={applicationData.length}
                      status={APPLICATIONS_STATUS}
                    />
                    <SearchInput
                      placeholder={intl.formatMessage(
                        messages.searchInputPlaceholder
                      )}
                      buttonLabel={intl.formatMessage(
                        messages.searchInputButtonTitle
                      )}
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
                    />
                  </>
                )
              }}
            </Query>
          </HeaderContent>
        </Container>
        {this.state.printCertificateModalVisible ? (
          <PrintCertificateAction
            title={this.props.intl.formatMessage(
              messages.certificateCollectionActionTitle
            )}
            backLabel={this.props.intl.formatMessage(messages.back)}
            registrationId={(this.state.regId && this.state.regId) || ''}
            togglePrintCertificateSection={this.togglePrintModal}
            printCertificateFormSection={printForm}
            IssuerDetails={this.getIssuerDetails()}
          />
        ) : null}
      </>
    )
  }
}
export const WorkQueue = connect(
  (state: IStoreState) => ({
    language: state.i18n.language,
    scope: getScope(state),
    userDetails: getUserDetails(state),
    printForm: state.printCertificateForm.collectCertificateFrom
  }),
  {
    goToEvents: goToEventsAction,
    gotoTab: goToTabAction,
    goToReviewDuplicate: goToReviewDuplicateAction
  }
)(injectIntl(withTheme(WorkQueueView)))
