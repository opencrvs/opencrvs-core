import {
  Button,
  IButtonProps,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import {
  StatusOrange,
  StatusProgress,
  StatusGreen,
  StatusRejected
} from '@opencrvs/components/lib/icons'
import {
  ISearchInputProps,
  Spinner,
  TopBar
} from '@opencrvs/components/lib/interface'
import {
  ColumnContentAlignment,
  GridTable
} from '@opencrvs/components/lib/interface/GridTable'
import { IAction } from '@opencrvs/components/lib/interface/ListItem'
import { BodyContent } from '@opencrvs/components/lib/layout'
import styled, { ITheme, withTheme } from '@register/styledComponents'
import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema.d'
import moment from 'moment'
import * as React from 'react'
import * as Sentry from '@sentry/browser'
import { Query } from 'react-apollo'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { Header } from '@register/components/interface/Header/Header'
import { IViewHeadingProps } from '@register/components/ViewHeading'
import { IApplication } from '@register/applications'
import {
  goToPrintCertificate as goToPrintCertificateAction,
  goToReviewDuplicate as goToReviewDuplicateAction,
  goToPage as goToPageAction,
  goToRegistrarHomeTab as goToRegistrarHomeTabAction
} from '@register/navigation'
import {
  DRAFT_BIRTH_PARENT_FORM,
  DRAFT_DEATH_FORM,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@register/navigation/routes'
import { getScope, getUserDetails } from '@register/profile/profileSelectors'
import { IStoreState } from '@register/store'
import { Scope } from '@register/utils/authUtils'
import { sentenceCase } from '@register/utils/data-formatting'
import { getUserLocation, IUserDetails } from '@register/utils/userUtils'
import {
  COUNT_REGISTRATION_QUERY,
  SEARCH_EVENTS
} from '@register/views/RegistrarHome/queries'
import NotificationToast from '@register/views/RegistrarHome/NotificatoinToast'
import { transformData } from '@register/search/transformer'
import { RowHistoryView } from '@register/views/RegistrarHome/RowHistoryView'

export interface IProps extends IButtonProps {
  active?: boolean
  disabled?: boolean
  id: string
}

export const IconTab = styled(Button).attrs<IProps>({})`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.subtitleStyle};
  padding-left: 0;
  padding-right: 0;
  border-radius: 0;
  flex-shrink: 0;
  outline: none;
  ${({ active }) => (active ? 'border-bottom: 3px solid #5E93ED' : '')};
  & > div {
    padding: 0 16px;
  }
  :first-child > div {
    position: relative;
    padding-left: 0;
  }
  & div > div {
    margin-right: 8px;
  }
  &:focus {
    outline: 0;
  }
`

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  hello: {
    id: 'register.registrarHome.header.Hello',
    defaultMessage: 'Hello {fullName}',
    description: 'Title for the user'
  },
  searchInputPlaceholder: {
    id: 'register.registrarHome.searchInput.placeholder',
    defaultMessage: 'Look for a record',
    description: 'The placeholder of search input'
  },
  searchInputButtonTitle: {
    id: 'register.registrarHome.searchButton',
    defaultMessage: 'Search',
    description: 'The title of search input submit button'
  },
  queryError: {
    id: 'register.registrarHome.queryError',
    defaultMessage: 'An error occurred while searching',
    description: 'The error message shown when a search query fails'
  },
  dataTableResults: {
    id: 'register.registrarHome.results',
    defaultMessage: 'Results',
    description: 'Results label at the top of the data table component'
  },
  dataTableNoResults: {
    id: 'register.registrarHome.noResults',
    defaultMessage: 'No result to display',
    description:
      'Text to display if the search return no results for the current filters'
  },
  headerTitle: {
    id: 'register.registrarHome.title',
    defaultMessage: 'Hello Registrar',
    description: 'The displayed title in the Work Queue header'
  },
  headerDescription: {
    id: 'register.registrarHome.description',
    defaultMessage: 'Review | Registration | Certification',
    description: 'The displayed description in the Work Queue header'
  },
  inProgress: {
    id: 'register.registrarHome.inProgress',
    defaultMessage: 'In progress',
    description: 'The title of In progress'
  },
  readyForReview: {
    id: 'register.registrarHome.readyForReview',
    defaultMessage: 'Ready for review',
    description: 'The title of ready for review'
  },
  sentForUpdates: {
    id: 'register.registrarHome.sentForUpdates',
    defaultMessage: 'Sent for updates',
    description: 'The title of sent for updates tab'
  },
  listItemType: {
    id: 'register.registrarHome.resultsType',
    defaultMessage: 'Type',
    description: 'Label for type of event in work queue list item'
  },
  listItemTrackingNumber: {
    id: 'register.registrarHome.results.trackingId',
    defaultMessage: 'Tracking ID',
    description: 'Label for tracking ID in work queue list item'
  },
  listItemApplicantNumber: {
    id: 'register.registrarHome.results.applicantNumber',
    defaultMessage: 'Applicant No.',
    description: 'Label for applicant number in work queue list item'
  },
  listItemApplicationDate: {
    id: 'register.registrarHome.results.applicationDate',
    defaultMessage: 'Application sent',
    description: 'Label for application date in work queue list item'
  },
  listItemUpdateDate: {
    id: 'register.registrarHome.results.updateDate',
    defaultMessage: 'Sent on',
    description: 'Label for rejection date in work queue list item'
  },
  listItemModificationDate: {
    id: 'register.registrarHome.results.modificationDate',
    defaultMessage: 'Last edited',
    description: 'Label for rejection date in work queue list item'
  },
  listItemEventDate: {
    id: 'register.registrarHome.results.eventDate',
    defaultMessage: 'Date of event',
    description: 'Label for event date in work queue list item'
  },
  reviewDuplicates: {
    id: 'register.registrarHome.results.reviewDuplicates',
    defaultMessage: 'Review Duplicates',
    description:
      'The title of review duplicates button in expanded area of list item'
  },
  review: {
    id: 'register.registrarHome.reviewButton',
    defaultMessage: 'Review',
    description: 'The title of review button in list item actions'
  },
  update: {
    id: 'register.registrarHome.updateButton',
    defaultMessage: 'Update',
    description: 'The title of update button in list item actions'
  },
  listItemName: {
    id: 'register.registrarHome.listItemName',
    defaultMessage: 'Name',
    description: 'Label for name in work queue list item'
  },
  listItemAction: {
    id: 'register.registrarHome.action',
    defaultMessage: 'Action',
    description: 'Label for action in work queue list item'
  },
  readyToPrint: {
    id: 'register.registrarHome.readyToPrint',
    defaultMessage: 'Ready to print',
    description: 'The title of ready to print tab'
  },
  registrationNumber: {
    id: 'register.registrarHome.registrationNumber',
    defaultMessage: 'Registration no.',
    description: 'The heading of registration no. column'
  },
  listItemRegisteredDate: {
    id: 'register.registrarHome.results.registeredDate',
    defaultMessage: 'Application registered',
    description: 'Label for date of registration in work queue list item'
  },
  print: {
    id: 'register.registrarHome.printButton',
    defaultMessage: 'Print',
    description: 'The title of print button in list item actions'
  }
})

const StyledSpinner = styled(Spinner)`
  margin: 20% auto;
`
const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
`
interface IBaseRegistrarHomeProps {
  theme: ITheme
  language: string
  scope: Scope | null
  userDetails: IUserDetails | null
  goToPage: typeof goToPageAction
  goToRegistrarHomeTab: typeof goToRegistrarHomeTabAction
  goToReviewDuplicate: typeof goToReviewDuplicateAction
  goToPrintCertificate: typeof goToPrintCertificateAction
  tabId: string
  drafts: IApplication[]
}

interface IRegistrarHomeState {
  progressCurrentPage: number
  reviewCurrentPage: number
  updatesCurrentPage: number
  printCurrentPage: number
}

type IRegistrarHomeProps = InjectedIntlProps &
  IViewHeadingProps &
  ISearchInputProps &
  IBaseRegistrarHomeProps

const TAB_ID = {
  inProgress: 'progress',
  readyForReview: 'review',
  sentForUpdates: 'updates',
  readyToPrint: 'print'
}

export const EVENT_STATUS = {
  DECLARED: 'DECLARED',
  REJECTED: 'REJECTED',
  REGISTERED: 'REGISTERED'
}
export class RegistrarHomeView extends React.Component<
  IRegistrarHomeProps,
  IRegistrarHomeState
  > {
  pageSize = 10
  constructor(props: IRegistrarHomeProps) {
    super(props)
    this.state = {
      progressCurrentPage: 1,
      reviewCurrentPage: 1,
      updatesCurrentPage: 1,
      printCurrentPage: 1
    }
  }
  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  transformDeclaredContent = (data: GQLQuery) => {
    if (!data.searchEvents || !data.searchEvents.results) {
      return []
    }
    const transformedData = transformData(data, this.props.intl)

    return transformedData.map(reg => {
      const actions = [] as IAction[]
      if (this.userHasRegisterScope()) {
        if (reg.duplicates && reg.duplicates.length > 0) {
          actions.push({
            label: this.props.intl.formatMessage(messages.reviewDuplicates),
            handler: () => this.props.goToReviewDuplicate(reg.id)
          })
        } else {
          actions.push({
            label: this.props.intl.formatMessage(messages.review),
            handler: () =>
              this.props.goToPage(
                REVIEW_EVENT_PARENT_FORM_PAGE,
                reg.id,
                'review',
                reg.event ? reg.event.toLowerCase() : ''
              )
          })
        }
      }

      return {
        ...reg,
        eventTimeElapsed:
          (reg.dateOfEvent &&
            moment(reg.dateOfEvent.toString(), 'YYYY-MM-DD').fromNow()) ||
          '',
        applicationTimeElapsed:
          (reg.createdAt &&
            moment(
              moment(reg.createdAt, 'x').format('YYYY-MM-DD HH:mm:ss'),
              'YYYY-MM-DD HH:mm:ss'
            ).fromNow()) ||
          '',
        actions
      }
    })
  }

  transformRejectedContent = (data: GQLQuery) => {
    if (!data.searchEvents || !data.searchEvents.results) {
      return []
    }
    const transformedData = transformData(data, this.props.intl)
    return transformedData.map(reg => {
      const actions = [] as IAction[]
      if (this.userHasRegisterScope()) {
        if (reg.duplicates && reg.duplicates.length > 0) {
          actions.push({
            label: this.props.intl.formatMessage(messages.reviewDuplicates),
            handler: () => this.props.goToReviewDuplicate(reg.id)
          })
        } else {
          actions.push({
            label: this.props.intl.formatMessage(messages.update),
            handler: () =>
              this.props.goToPage(
                REVIEW_EVENT_PARENT_FORM_PAGE,
                reg.id,
                'review',
                reg.event ? reg.event.toLowerCase() : ''
              )
          })
        }
      }
      return {
        ...reg,
        dateOfRejection:
          (reg.modifiedAt &&
            moment(
              moment(reg.modifiedAt, 'x').format('YYYY-MM-DD HH:mm:ss'),
              'YYYY-MM-DD HH:mm:ss'
            ).fromNow()) ||
          '',
        actions
      }
    })
  }

  transformDraftContent = () => {
    if (!this.props.drafts || this.props.drafts.length <= 0) {
      return []
    }
    return this.props.drafts.map((draft: IApplication) => {
      let name
      let pageRoute: string
      if (draft.event && draft.event.toString() === 'birth') {
        name =
          (draft.data &&
            draft.data.child &&
            draft.data.child.familyNameEng &&
            (!draft.data.child.firstNamesEng
              ? ''
              : draft.data.child.firstNamesEng + ' ') +
            draft.data.child.familyNameEng) ||
          (draft.data &&
            draft.data.child &&
            draft.data.child.familyName &&
            (!draft.data.child.firstNames
              ? ''
              : draft.data.child.firstNames + ' ') +
            draft.data.child.familyName) ||
          ''
        pageRoute = DRAFT_BIRTH_PARENT_FORM
      } else if (draft.event && draft.event.toString() === 'death') {
        name =
          (draft.data &&
            draft.data.deceased &&
            draft.data.deceased.familyNameEng &&
            (!draft.data.deceased.firstNamesEng
              ? ''
              : draft.data.deceased.firstNamesEng + ' ') +
            draft.data.deceased.familyNameEng) ||
          (draft.data &&
            draft.data.deceased &&
            draft.data.deceased.familyName &&
            (!draft.data.deceased.firstNames
              ? ''
              : draft.data.deceased.firstNames + ' ') +
            draft.data.deceased.familyName) ||
          ''
        pageRoute = DRAFT_DEATH_FORM
      }
      const lastModificationDate = draft.modifiedOn || draft.savedOn
      const actions = [
        {
          label: this.props.intl.formatMessage(messages.update),
          handler: () =>
            this.props.goToPage(
              pageRoute,
              draft.id,
              '',
              (draft.event && draft.event.toString()) || ''
            )
        }
      ]
      return {
        id: draft.id,
        event: (draft.event && sentenceCase(draft.event)) || '',
        name: name || '',
        dateOfModification:
          (lastModificationDate && moment(lastModificationDate).fromNow()) ||
          '',
        actions
      }
    })
  }

  transformPrintContent = (data: GQLQuery) => {
    const { locale } = this.props.intl
    if (!data.listEventRegistrations || !data.listEventRegistrations.results) {
      return []
    }

    return data.listEventRegistrations.results.map(
      (reg: GQLEventRegistration) => {
        let names
        let contactPhoneNumber
        if (reg.registration && reg.registration.type === 'BIRTH') {
          const birthReg = reg as GQLBirthRegistration
          names =
            (birthReg &&
              birthReg.child &&
              (birthReg.child.name as GQLHumanName[])) ||
            []
          contactPhoneNumber =
            (birthReg.registration &&
              birthReg.registration.contactPhoneNumber) ||
            ''
        } else if (reg.registration && reg.registration.type === 'DEATH') {
          const deathReg = reg as GQLDeathRegistration
          names =
            (deathReg &&
              deathReg.deceased &&
              (deathReg.deceased.name as GQLHumanName[])) ||
            []
          const phoneEntry =
            (deathReg.informant &&
              deathReg.informant.individual &&
              deathReg.informant.individual.telecom &&
              deathReg.informant.individual.telecom.find(
                contactPoint =>
                  (contactPoint && contactPoint.system === 'phone') || false
              )) ||
            null
          contactPhoneNumber = (phoneEntry && phoneEntry.value) || ''
        }
        const actions = [] as IAction[]
        actions.push({
          label: this.props.intl.formatMessage(messages.print),
          handler: () =>
            this.props.goToPrintCertificate(
              reg.id,
              (reg.registration && reg.registration.type) || 'BIRTH'
            )
        })
        const lang = 'en'
        return {
          id: reg.id,
          name:
            (names && (createNamesMap(names)[lang] as string)) ||
            /* tslint:disable:no-string-literal */
            (names && (createNamesMap(names)['bn'] as string)) ||
            '',
          date_of_registration:
            reg.registration &&
            reg.registration.status &&
            reg.registration.status[0] &&
            // @ts-ignore
            reg.registration.status[0].timestamp &&
            moment(
              // @ts-ignore
              reg.registration.status[0].timestamp.toString(),
              'YYYY-MM-DD'
            ).fromNow(),
          registrationNumber:
            (reg.registration && reg.registration.registrationNumber) ||
            'BRN/DRN',
          contact_number: contactPhoneNumber || '',
          event:
            (reg.registration &&
              reg.registration.type &&
              reg.registration.type.toString() &&
              sentenceCase(reg.registration.type)) ||
            '',
          duplicates: (reg.registration && reg.registration.duplicates) || [],
          actions,
          status:
            (reg.registration &&
              reg.registration.status &&
              reg.registration.status
                .map(status => {
                  return {
                    type: (status && status.type) || null,
                    practitionerName:
                      (status &&
                        status.user &&
                        (createNamesMap(status.user.name as GQLHumanName[])[
                          this.props.language
                        ] as string)) ||
                      (status &&
                        status.user &&
                        (createNamesMap(status.user.name as GQLHumanName[])[
                          'default'
                        ] as string)) ||
                      /* tslint:enable:no-string-literal */
                      '',
                    timestamp:
                      (status && formatLongDate(status.timestamp, locale)) ||
                      null,
                    practitionerRole:
                      status && status.user && status.user.role
                        ? this.props.intl.formatMessage(
                          messages[status.user.role as string]
                        )
                        : '',
                    officeName:
                      locale === 'en'
                        ? (status && status.office && status.office.name) || ''
                        : (status && status.office && status.office.alias) || ''
                  }
                })
                .reverse()) ||
            null
        }
      }
    )
  }

  onPageChange = (newPageNumber: number) => {
    if (this.props.tabId === TAB_ID.inProgress) {
      this.setState({ progressCurrentPage: newPageNumber })
    }
    if (this.props.tabId === TAB_ID.readyForReview) {
      this.setState({ reviewCurrentPage: newPageNumber })
    }
    if (this.props.tabId === TAB_ID.sentForUpdates) {
      this.setState({ updatesCurrentPage: newPageNumber })
    }
    if (this.props.tabId === TAB_ID.readyToPrint) {
      this.setState({ printCurrentPage: newPageNumber })
    }
  }

  renderExpandedComponent = (itemId: string) => {
    return <RowHistoryView eventId={itemId} />
  }

  render() {
    const { theme, intl, userDetails, tabId, drafts } = this.props
    const registrarUnion = userDetails && getUserLocation(userDetails, 'UNION')
    let parentQueryLoading = false

    return (
      <>
        <Header />
        <Query
          query={COUNT_REGISTRATION_QUERY}
          variables={{
            locationIds: [registrarUnion]
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
            if (loading) {
              parentQueryLoading = true
              return (
                <StyledSpinner
                  id="search-result-spinner"
                  baseColor={theme.colors.background}
                />
              )
            }
            parentQueryLoading = false
            if (error) {
              Sentry.captureException(error)
              return (
                <ErrorText id="search-result-error-text-count">
                  {intl.formatMessage(messages.queryError)}
                </ErrorText>
              )
            }

            console.log('DATA', data)

            return (
              <>
                <TopBar>
                  <IconTab
                    id={`tab_${TAB_ID.inProgress}`}
                    key={TAB_ID.inProgress}
                    active={tabId === TAB_ID.inProgress}
                    align={ICON_ALIGNMENT.LEFT}
                    icon={() => <StatusProgress />}
                    onClick={() =>
                      this.props.goToRegistrarHomeTab(TAB_ID.inProgress)
                    }
                  >
                    {intl.formatMessage(messages.inProgress)} (
                    {(drafts && drafts.length) || 0})
                  </IconTab>
                  <IconTab
                    id={`tab_${TAB_ID.readyForReview}`}
                    key={TAB_ID.readyForReview}
                    active={tabId === TAB_ID.readyForReview}
                    align={ICON_ALIGNMENT.LEFT}
                    icon={() => <StatusOrange />}
                    onClick={() =>
                      this.props.goToRegistrarHomeTab(TAB_ID.readyForReview)
                    }
                  >
                    {intl.formatMessage(messages.readyForReview)} (
                    {data.countEventRegistrations.declared})
                  </IconTab>
                  <IconTab
                    id={`tab_${TAB_ID.sentForUpdates}`}
                    key={TAB_ID.sentForUpdates}
                    active={tabId === TAB_ID.sentForUpdates}
                    align={ICON_ALIGNMENT.LEFT}
                    icon={() => <StatusRejected />}
                    onClick={() =>
                      this.props.goToRegistrarHomeTab(TAB_ID.sentForUpdates)
                    }
                  >
                    {intl.formatMessage(messages.sentForUpdates)} (
                    {data.countEventRegistrations.rejected})
                  </IconTab>
                  <IconTab
                    id={`tab_${TAB_ID.readyToPrint}`}
                    key={TAB_ID.readyToPrint}
                    active={tabId === TAB_ID.readyToPrint}
                    align={ICON_ALIGNMENT.LEFT}
                    icon={() => <StatusGreen />}
                    onClick={() =>
                      this.props.goToRegistrarHomeTab(TAB_ID.readyToPrint)
                    }
                  >
                    {intl.formatMessage(messages.readyToPrint)} (
                    {data.countEventRegistrations.registered})
                  </IconTab>
                </TopBar>
              </>
            )
          }}
        </Query>
        {tabId === TAB_ID.inProgress && (
          <BodyContent>
            <GridTable
              content={this.transformDraftContent()}
              columns={[
                {
                  label: this.props.intl.formatMessage(messages.listItemType),
                  width: 15,
                  key: 'event'
                },
                {
                  label: this.props.intl.formatMessage(messages.listItemName),
                  width: 35,
                  key: 'name'
                },
                {
                  label: this.props.intl.formatMessage(
                    messages.listItemModificationDate
                  ),
                  width: 35,
                  key: 'dateOfModification'
                },
                {
                  label: this.props.intl.formatMessage(messages.listItemAction),
                  width: 15,
                  key: 'actions',
                  isActionColumn: true,
                  alignment: ColumnContentAlignment.CENTER
                }
              ]}
              noResultText={intl.formatMessage(messages.dataTableNoResults)}
              onPageChange={(currentPage: number) => {
                this.onPageChange(currentPage)
              }}
              pageSize={this.pageSize}
              totalItems={drafts && drafts.length}
              currentPage={this.state.progressCurrentPage}
            />
          </BodyContent>
        )}
        {tabId === TAB_ID.readyForReview && (
          <Query
            query={SEARCH_EVENTS}
            variables={{
              status: EVENT_STATUS.DECLARED,
              locationIds: [registrarUnion],
              count: this.pageSize,
              skip: (this.state.reviewCurrentPage - 1) * this.pageSize
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
              if (loading) {
                return (
                  (!parentQueryLoading && (
                    <StyledSpinner
                      id="search-result-spinner"
                      baseColor={theme.colors.background}
                    />
                  )) ||
                  null
                )
              }
              if (error) {
                Sentry.captureException(error)
                return (
                  <ErrorText id="search-result-error-text-review">
                    {intl.formatMessage(messages.queryError)}
                  </ErrorText>
                )
              }
              return (
                <BodyContent>
                  <GridTable
                    content={this.transformDeclaredContent(data)}
                    columns={[
                      {
                        label: this.props.intl.formatMessage(
                          messages.listItemType
                        ),
                        width: 14,
                        key: 'event'
                      },
                      {
                        label: this.props.intl.formatMessage(
                          messages.listItemTrackingNumber
                        ),
                        width: 20,
                        key: 'trackingId'
                      },
                      {
                        label: this.props.intl.formatMessage(
                          messages.listItemApplicationDate
                        ),
                        width: 23,
                        key: 'applicationTimeElapsed'
                      },
                      {
                        label: this.props.intl.formatMessage(
                          messages.listItemEventDate
                        ),
                        width: 23,
                        key: 'eventTimeElapsed'
                      },
                      {
                        label: this.props.intl.formatMessage(
                          messages.listItemAction
                        ),
                        width: 20,
                        key: 'actions',
                        isActionColumn: true,
                        alignment: ColumnContentAlignment.CENTER
                      }
                    ]}
                    renderExpandedComponent={this.renderExpandedComponent}
                    noResultText={intl.formatMessage(
                      messages.dataTableNoResults
                    )}
                    onPageChange={(currentPage: number) => {
                      this.onPageChange(currentPage)
                    }}
                    pageSize={this.pageSize}
                    totalItems={
                      data.searchEvents && data.searchEvents.totalItems
                    }
                    currentPage={this.state.reviewCurrentPage}
                    expandable={true}
                  />
                </BodyContent>
              )
            }}
          </Query>
        )}
        {tabId === TAB_ID.sentForUpdates && (
          <Query
            query={SEARCH_EVENTS}
            variables={{
              status: EVENT_STATUS.REJECTED,
              locationIds: [registrarUnion],
              count: this.pageSize,
              skip: (this.state.updatesCurrentPage - 1) * this.pageSize
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
              if (loading) {
                return (
                  (!parentQueryLoading && (
                    <StyledSpinner
                      id="search-result-spinner"
                      baseColor={theme.colors.background}
                    />
                  )) ||
                  null
                )
              }
              if (error) {
                Sentry.captureException(error)
                return (
                  <ErrorText id="search-result-error-text-reject">
                    {intl.formatMessage(messages.queryError)}
                  </ErrorText>
                )
              }
              return (
                <BodyContent>
                  <GridTable
                    content={this.transformRejectedContent(data)}
                    columns={[
                      {
                        label: this.props.intl.formatMessage(
                          messages.listItemType
                        ),
                        width: 14,
                        key: 'event'
                      },
                      {
                        label: this.props.intl.formatMessage(
                          messages.listItemName
                        ),
                        width: 23,
                        key: 'name'
                      },
                      {
                        label: this.props.intl.formatMessage(
                          messages.listItemApplicantNumber
                        ),
                        width: 21,
                        key: 'contactNumber'
                      },
                      {
                        label: this.props.intl.formatMessage(
                          messages.listItemUpdateDate
                        ),
                        width: 22,
                        key: 'dateOfRejection'
                      },
                      {
                        label: this.props.intl.formatMessage(
                          messages.listItemAction
                        ),
                        width: 20,
                        key: 'actions',
                        isActionColumn: true,
                        alignment: ColumnContentAlignment.CENTER
                      }
                    ]}
                    renderExpandedComponent={this.renderExpandedComponent}
                    noResultText={intl.formatMessage(
                      messages.dataTableNoResults
                    )}
                    onPageChange={(currentPage: number) => {
                      this.onPageChange(currentPage)
                    }}
                    pageSize={this.pageSize}
                    totalItems={
                      data.searchEvents && data.searchEvents.totalItems
                    }
                    currentPage={this.state.updatesCurrentPage}
                    expandable={true}
                  />
                </BodyContent>
              )
            }}
          </Query>
        )}
        {tabId === TAB_ID.readyToPrint && (
          <Query
            query={SEARCH_EVENTS}
            variables={{
              status: EVENT_STATUS.REGISTERED,
              locationIds: [registrarUnion],
              count: this.pageSize,
              skip: (this.state.printCurrentPage - 1) * this.pageSize
            }}
          >
            {({ loading, error, data }) => {
              if (loading) {
                return (
                  (!parentQueryLoading && (
                    <StyledSpinner
                      id="search-result-spinner"
                      baseColor={theme.colors.background}
                    />
                  )) ||
                  null
                )
              }
              if (error) {
                Sentry.captureException(error)
                return (
                  <ErrorText id="search-result-error-text-print">
                    {intl.formatMessage(messages.queryError)}
                  </ErrorText>
                )
              }

              return (
                <BodyContent>
                  <GridTable
                    content={this.transformPrintContent(data)}
                    columns={[
                      {
                        label: this.props.intl.formatMessage(
                          messages.listItemType
                        ),
                        width: 14,
                        key: 'event'
                      },
                      {
                        label: this.props.intl.formatMessage(
                          messages.listItemName
                        ),
                        width: 23,
                        key: 'name'
                      },
                      {
                        label: this.props.intl.formatMessage(
                          messages.listItemRegisteredDate
                        ),
                        width: 22,
                        key: 'date_of_registration'
                      },
                      {
                        label: this.props.intl.formatMessage(
                          messages.registrationNumber
                        ),
                        width: 21,
                        key: 'registrationNumber'
                      },
                      {
                        label: this.props.intl.formatMessage(
                          messages.listItemAction
                        ),
                        width: 20,
                        key: 'actions',
                        isActionColumn: true,
                        alignment: ColumnContentAlignment.CENTER
                      }
                    ]}
                    noResultText={intl.formatMessage(
                      messages.dataTableNoResults
                    )}
                    onPageChange={(currentPage: number) => {
                      this.onPageChange(currentPage)
                    }}
                    pageSize={this.pageSize}
                    totalItems={
                      data.listEventRegistrations &&
                      data.listEventRegistrations.totalItems
                    }
                    currentPage={this.state.printCurrentPage}
                    expandable={true}
                    arrowExpansionButtons={true}
                  />
                </BodyContent>
              )
            }}
          </Query>
        )}
        <NotificationToast />
      </>
    )
  }
}

function mapStateToProps(
  state: IStoreState,
  props: RouteComponentProps<{ tabId: string }>
) {
  const { match } = props
  return {
    language: state.i18n.language,
    scope: getScope(state),
    userDetails: getUserDetails(state),
    tabId: (match && match.params && match.params.tabId) || 'review',
    drafts: state.applicationsState.applications
  }
}

export const RegistrarHome = connect(
  mapStateToProps,
  {
    goToPage: goToPageAction,
    goToRegistrarHomeTab: goToRegistrarHomeTabAction,
    goToReviewDuplicate: goToReviewDuplicateAction,
    goToPrintCertificate: goToPrintCertificateAction
  }
)(injectIntl(withTheme(RegistrarHomeView)))
