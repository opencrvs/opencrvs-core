import { getLanguage } from '@opencrvs/register/src/i18n/selectors'
import { IStoreState } from '@opencrvs/register/src/store'
import * as React from 'react'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Redirect, RouteComponentProps } from 'react-router'
import {
  ISearchInputProps,
  GridTable,
  Loader,
  Spinner,
  TopBar
} from '@opencrvs/components/lib/interface'
import {
  goToEvents as goToEventsAction,
  goToFieldAgentHomeTab as goToFieldAgentHomeTabAction,
  goToApplicationDetails
} from '@register/navigation'
import { IUserDetails, getUserLocation } from '@register/utils/userUtils'
import { getUserDetails } from '@register/profile/profileSelectors'
import { Header } from '@register/components/interface/Header/Header'
import { IApplication, SUBMISSION_STATUS } from '@register/applications'
import {
  FIELD_AGENT_HOME_TAB_IN_PROGRESS,
  FIELD_AGENT_HOME_TAB_SENT_FOR_REVIEW,
  FIELD_AGENT_HOME_TAB_REQUIRE_UPDATES,
  LANG_EN,
  EMPTY_STRING,
  APPLICATION_DATE_FORMAT,
  UNION_LOCATION_CODE,
  FIELD_AGENT_ROLES,
  SYS_ADMIN_ROLES,
  REGISTRAR_ROLES
} from '@register/utils/constants'
import styled, { withTheme } from '@register/styledComponents'
import { REGISTRAR_HOME, SYS_ADMIN_HOME } from '@register/navigation/routes'
import { SentForReview } from '@register/views/FieldAgentHome/SentForReview'
import { InProgress } from '@register/views/FieldAgentHome/InProgress'
import {
  Button,
  ICON_ALIGNMENT,
  FloatingActionButton
} from '@opencrvs/components/lib/buttons'
import {
  StatusProgress,
  StatusOrange,
  StatusRejected,
  PlusTransparentWhite,
  ApplicationsOrangeAmber
} from '@opencrvs/components/lib/icons'
import { Query } from 'react-apollo'
import {
  SEARCH_APPLICATIONS_USER_WISE,
  COUNT_USER_WISE_APPLICATIONS
} from '@register/search/queries'
import { EVENT_STATUS } from '@register/views/RegistrarHome/RegistrarHome'
import * as Sentry from '@sentry/browser'
import { ITheme } from '@opencrvs/components/lib/theme'
import { BodyContent } from '@opencrvs/components/lib/layout'
import {
  GQLQuery,
  GQLEventSearchSet,
  GQLBirthEventSearchSet,
  GQLHumanName,
  GQLDeathEventSearchSet
} from '@opencrvs/gateway/src/graphql/schema'
import { createNamesMap } from '@register/utils/data-formatting'
import moment from 'moment'

const IconTab = styled(Button).attrs<{ active: boolean }>({})`
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
const FABContainer = styled.div`
  position: fixed;
  right: 40px;
  bottom: 55px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const StyledSpinner = styled(Spinner)`
  margin: 20% auto;
`
const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
`

const ZeroUpdatesContainer = styled.div`
  padding-top: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const ZeroUpdatesText = styled.span`
  padding-top: 10px;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.h4Style};
`

const AllUpdatesText = styled.span`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bigBodyStyle};
`

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  inProgress: {
    id: 'register.fieldAgentHome.inProgress',
    defaultMessage: 'In progress ({total})',
    description: 'The title of in progress tab'
  },
  sentForReview: {
    id: 'register.fieldAgentHome.sentForReview',
    defaultMessage: 'Sent for review ({total})',
    description: 'The title of sent for review tab'
  },
  requireUpdates: {
    id: 'register.fieldAgentHome.requireUpdates',
    defaultMessage: 'Require updates ({total})',
    description: 'The title of require updates tab'
  },
  rejectedDays: {
    id: 'register.fieldAgentHome.rejectedDays',
    defaultMessage: 'Rejected {text}',
    description: 'The title of rejected days of application'
  },
  listItemName: {
    id: 'register.registrarHome.listItemName',
    defaultMessage: 'Name',
    description: 'Label for name in work queue list item'
  },
  listItemType: {
    id: 'register.registrarHome.resultsType',
    defaultMessage: 'Type',
    description: 'Label for type of event in work queue list item'
  },
  listItemUpdateDate: {
    id: 'register.registrarHome.results.updateDate',
    defaultMessage: 'Sent on',
    description: 'Label for rejection date in work queue list item'
  },
  zeroUpdatesText: {
    id: 'register.fieldAgentHome.zeroUpdatesText',
    defaultMessage: 'No applications require updates',
    description: 'The text when no rejected applications'
  },
  allUpdatesText: {
    id: 'register.fieldAgentHome.allUpdatesText',
    defaultMessage: 'Great job! You have updated all applications',
    description: 'The text when all rejected applications updated'
  },
  requireUpdatesLoading: {
    id: 'register.fieldAgentHome.requireUpdatesLoading',
    defaultMessage: 'Checking your applications',
    description: 'The text when all rejected applications are loading'
  },
  queryError: {
    id: 'register.fieldAgentHome.queryError',
    defaultMessage: 'An error occured while loading applications',
    description: 'The text when error ocurred loading rejected applications'
  }
})
interface IBaseFieldAgentHomeProps {
  theme: ITheme
  language: string
  userDetails: IUserDetails | null
  tabId: string
  draftApplications: IApplication[]
  goToEvents: typeof goToEventsAction
  draftCount: string
  goToFieldAgentHomeTab: typeof goToFieldAgentHomeTabAction
  goToApplicationDetails: typeof goToApplicationDetails
  applicationsReadyToSend: IApplication[]
}

interface IFieldAgentHomeState {
  requireUpdatesPage: number
}

interface IMatchParams {
  tabId: string
}

type FieldAgentHomeProps = IBaseFieldAgentHomeProps &
  InjectedIntlProps &
  ISearchInputProps &
  RouteComponentProps<IMatchParams>

interface IFieldAgentHomeState {
  requireUpdatesPage: number
}

const TAB_ID = {
  inProgress: FIELD_AGENT_HOME_TAB_IN_PROGRESS,
  sentForReview: FIELD_AGENT_HOME_TAB_SENT_FOR_REVIEW,
  requireUpdates: FIELD_AGENT_HOME_TAB_REQUIRE_UPDATES
}

class FieldAgentHomeView extends React.Component<
  FieldAgentHomeProps,
  IFieldAgentHomeState
> {
  pageSize = 10
  constructor(props: FieldAgentHomeProps) {
    super(props)
    this.state = {
      requireUpdatesPage: 1
    }
  }

  onPageChange = (newPageNumber: number) => {
    if (this.props.match.params.tabId === TAB_ID.requireUpdates) {
      this.setState({ requireUpdatesPage: newPageNumber })
    }
  }

  transformRejectedContent = (data: GQLQuery) => {
    if (!data.searchEvents || !data.searchEvents.results) {
      return []
    }

    return data.searchEvents.results.map((reg: GQLEventSearchSet | null) => {
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
      moment.locale(this.props.intl.locale)
      const daysOfRejection =
        registrationSearchSet.registration &&
        registrationSearchSet.registration.dateOfApplication &&
        registrationSearchSet.registration.dateOfApplication &&
        moment(
          registrationSearchSet.registration.dateOfApplication,
          APPLICATION_DATE_FORMAT
        ).fromNow()

      return {
        id: registrationSearchSet.id,
        event: registrationSearchSet.type as string,
        name:
          (createNamesMap(names)[this.props.intl.locale] as string) ||
          (createNamesMap(names)[LANG_EN] as string),
        daysOfRejection: this.props.intl.formatMessage(messages.rejectedDays, {
          text: daysOfRejection
        }),
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () =>
              this.props.goToApplicationDetails(registrationSearchSet.id)
          }
        ]
      }
    })
  }

  render() {
    const {
      draftApplications,
      userDetails,
      match,
      intl,
      applicationsReadyToSend,
      theme
    } = this.props
    const tabId = match.params.tabId || TAB_ID.sentForReview
    const fieldAgentLocation =
      userDetails && getUserLocation(userDetails, UNION_LOCATION_CODE)
    let parentQueryLoading = false
    const role = userDetails && userDetails.role
    return (
      <>
        {role && FIELD_AGENT_ROLES.includes(role) && (
          <>
            <Query
              query={COUNT_USER_WISE_APPLICATIONS}
              variables={{
                userId: userDetails ? userDetails.practitionerId : '',
                status: EVENT_STATUS.REJECTED,
                locationIds: [fieldAgentLocation]
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
                  parentQueryLoading = true
                  return (
                    <StyledSpinner
                      id="field-agent-home-spinner"
                      baseColor={theme.colors.background}
                    />
                  )
                }
                if (error) {
                  Sentry.captureException(error)
                  return (
                    <ErrorText id="field-agent-home_error">
                      {intl.formatMessage(messages.queryError)}
                    </ErrorText>
                  )
                }
                return (
                  <>
                    <Header />
                    <TopBar id="top-bar">
                      <IconTab
                        id={`tab_${TAB_ID.inProgress}`}
                        key={TAB_ID.inProgress}
                        active={tabId === TAB_ID.inProgress}
                        align={ICON_ALIGNMENT.LEFT}
                        icon={() => <StatusProgress />}
                        onClick={() =>
                          this.props.goToFieldAgentHomeTab(TAB_ID.inProgress)
                        }
                      >
                        {intl.formatMessage(messages.inProgress, {
                          total: draftApplications.length
                        })}
                      </IconTab>
                      <IconTab
                        id={`tab_${TAB_ID.sentForReview}`}
                        key={TAB_ID.sentForReview}
                        active={tabId === TAB_ID.sentForReview}
                        align={ICON_ALIGNMENT.LEFT}
                        icon={() => <StatusOrange />}
                        onClick={() =>
                          this.props.goToFieldAgentHomeTab(TAB_ID.sentForReview)
                        }
                      >
                        {intl.formatMessage(messages.sentForReview, {
                          total: applicationsReadyToSend.length
                        })}
                      </IconTab>
                      <IconTab
                        id={`tab_${TAB_ID.requireUpdates}`}
                        key={TAB_ID.requireUpdates}
                        active={tabId === TAB_ID.requireUpdates}
                        align={ICON_ALIGNMENT.LEFT}
                        icon={() => <StatusRejected />}
                        onClick={() =>
                          this.props.goToFieldAgentHomeTab(
                            TAB_ID.requireUpdates
                          )
                        }
                      >
                        {intl.formatMessage(messages.requireUpdates, {
                          total: data.searchEvents.totalItems
                        })}
                      </IconTab>
                    </TopBar>
                  </>
                )
              }}
            </Query>

            {tabId === TAB_ID.inProgress && (
              <InProgress draftApplications={draftApplications} />
            )}

            {tabId === TAB_ID.sentForReview && (
              <SentForReview
                applicationsReadyToSend={applicationsReadyToSend}
              />
            )}

            {tabId === TAB_ID.requireUpdates && (
              <Query
                query={SEARCH_APPLICATIONS_USER_WISE}
                variables={{
                  userId: userDetails ? userDetails.practitionerId : '',
                  status: EVENT_STATUS.REJECTED,
                  locationIds: [fieldAgentLocation],
                  count: this.pageSize,
                  skip: (this.state.requireUpdatesPage - 1) * this.pageSize
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
                      <>
                        {!parentQueryLoading && (
                          <Loader
                            id="require_updates_loader"
                            marginPercent={20}
                            spinnerDiameter={60}
                            loadingText={intl.formatMessage(
                              messages.requireUpdatesLoading
                            )}
                          />
                        )}
                      </>
                    )
                  }
                  if (error) {
                    Sentry.captureException(error)
                    return (
                      <ErrorText id="require_updates_loading_error">
                        {intl.formatMessage(messages.queryError)}
                      </ErrorText>
                    )
                  }
                  return (
                    <>
                      {data && data.searchEvents.totalItems > 0 && (
                        <BodyContent id="require_updates_list">
                          <GridTable
                            content={this.transformRejectedContent(data)}
                            columns={[
                              {
                                label: this.props.intl.formatMessage(
                                  messages.listItemType
                                ),
                                width: 30,
                                key: 'event'
                              },
                              {
                                label: this.props.intl.formatMessage(
                                  messages.listItemName
                                ),
                                width: 40,
                                key: 'name',
                                color: theme.colors.secondaryLabel
                              },
                              {
                                label: this.props.intl.formatMessage(
                                  messages.listItemUpdateDate
                                ),
                                width: 30,
                                key: 'daysOfRejection'
                              }
                            ]}
                            noResultText={EMPTY_STRING}
                            onPageChange={(currentPage: number) => {
                              this.onPageChange(currentPage)
                            }}
                            pageSize={this.pageSize}
                            totalItems={
                              data.searchEvents && data.searchEvents.totalItems
                            }
                            currentPage={this.state.requireUpdatesPage}
                            clickable={true}
                          />
                        </BodyContent>
                      )}
                      {data && data.searchEvents.totalItems === 0 && (
                        <ZeroUpdatesContainer>
                          <ApplicationsOrangeAmber />
                          <ZeroUpdatesText>
                            {intl.formatMessage(messages.zeroUpdatesText)}
                          </ZeroUpdatesText>
                          <AllUpdatesText>
                            {intl.formatMessage(messages.allUpdatesText)}
                          </AllUpdatesText>
                        </ZeroUpdatesContainer>
                      )}
                    </>
                  )
                }}
              </Query>
            )}
            <FABContainer>
              <FloatingActionButton
                id="new_event_declaration"
                onClick={this.props.goToEvents}
                icon={() => <PlusTransparentWhite />}
              />
            </FABContainer>
          </>
        )}
        {role && SYS_ADMIN_ROLES.includes(role) && (
          <Redirect to={SYS_ADMIN_HOME} />
        )}
        {role && REGISTRAR_ROLES.includes(role) && (
          <Redirect to={REGISTRAR_HOME} />
        )}
      </>
    )
  }
}

const mapStateToProps = (
  state: IStoreState,
  props: RouteComponentProps<{ tabId: string }>
) => {
  const { match } = props

  return {
    language: getLanguage(state),
    userDetails: getUserDetails(state),
    tabId: (match && match.params && match.params.tabId) || 'progress',
    draftApplications:
      (state.applicationsState.applications &&
        state.applicationsState.applications.filter(
          (application: IApplication) =>
            application.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      [],
    applicationsReadyToSend:
      (state.applicationsState.applications &&
        state.applicationsState.applications.filter(
          (application: IApplication) =>
            application.submissionStatus !==
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      []
  }
}

export const FieldAgentHome = connect(
  mapStateToProps,
  {
    goToEvents: goToEventsAction,
    goToFieldAgentHomeTab: goToFieldAgentHomeTabAction,
    goToApplicationDetails
  }
)(injectIntl(withTheme(FieldAgentHomeView)))
