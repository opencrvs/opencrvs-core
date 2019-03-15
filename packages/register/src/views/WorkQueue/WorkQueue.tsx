import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import styled, { withTheme } from 'styled-components'
import { IViewHeadingProps } from 'src/components/ViewHeading'
import {
  IconAction,
  ActionTitle,
  IButtonProps,
  Button,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import {
  SearchInput,
  ISearchInputProps,
  Spinner
} from '@opencrvs/components/lib/interface'
import {
  Plus,
  StatusOrange,
  StatusRejected,
  StatusProgress
} from '@opencrvs/components/lib/icons'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema.d'
import { HomeViewHeader } from 'src/components/HomeViewHeader'
import { IStoreState } from 'src/store'
import { getScope } from 'src/profile/profileSelectors'
import { Scope } from 'src/utils/authUtils'
import { ITheme } from '@opencrvs/components/lib/theme'
import {
  goToEvents as goToEventsAction,
  goToReviewDuplicate as goToReviewDuplicateAction,
  goToPrintCertificate as goToPrintCertificateAction
} from 'src/navigation'
import { goToWorkQueueTab as goToTabAction } from '../../navigation'
import { IUserDetails, getUserLocation } from 'src/utils/userUtils'
import { getUserDetails } from 'src/profile/profileSelectors'
import { HeaderContent } from '@opencrvs/components/lib/layout'
import { RouteComponentProps } from 'react-router'
import { Query } from 'react-apollo'
import { COUNT_REGISTRATION_QUERY } from '../DataProvider/birth/queries'
import * as Sentry from '@sentry/browser'

export interface IProps extends IButtonProps {
  active?: boolean
  disabled?: boolean
  id: string
}
export const IconTabs = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  position: relative;
  white-space: nowrap;
  border-bottom: 1px solid rgb(210, 210, 210);
  margin-top: 50px;
`
export const IconTab = styled(Button).attrs<IProps>({})`
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: ${({ theme, active }) => (active ? 'bold' : theme.void)};
  padding-left: 0;
  padding-right: 0;
  border-radius: 0;
  margin-right: 50px;
  outline: none;
  font-size: 16px;
  ${({ active }) => (active ? 'border-bottom: 3px solid #5E93ED' : '')};
  & div {
    position: relative;
    margin-right: 10px;
  }
  &:focus {
    outline: 0;
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
  newRegistration: {
    id: 'register.workQueue.buttons.newRegistration',
    defaultMessage: 'New registration',
    description: 'The title of new registration button'
  },
  inProgress: {
    id: 'register.workQueue.tabs.inProgress',
    defaultMessage: 'In progress',
    description: 'The title of In progress'
  },
  readyForReview: {
    id: 'register.workQueue.tabs.readyForReview',
    defaultMessage: 'Ready for review',
    description: 'The title of ready for review'
  },
  sentForUpdates: {
    id: 'register.workQueue.tabs.sentForUpdates',
    defaultMessage: 'Sent for updates',
    description: 'The title of sent for updates tab'
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
  }
})
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
const StyledSpinner = styled(Spinner)`
  margin: 50% auto;
`
const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.fonts.lightFont};
  text-align: center;
  margin-top: 100px;
`
interface IBaseWorkQueueProps {
  theme: ITheme
  language: string
  scope: Scope
  goToEvents: typeof goToEventsAction
  userDetails: IUserDetails
  gotoTab: typeof goToTabAction
  tabId: string
  draftCount: number
}

type IWorkQueueProps = InjectedIntlProps &
  IViewHeadingProps &
  ISearchInputProps &
  IBaseWorkQueueProps

const TAB_ID = {
  inProgress: 'progress',
  readyForReview: 'review',
  sentForUpdates: 'updates'
}
export class WorkQueueView extends React.Component<IWorkQueueProps> {
  render() {
    const { theme, intl, userDetails, language, tabId, draftCount } = this.props
    const registrarUnion = userDetails && getUserLocation(userDetails, 'UNION')
    let fullName = ''
    if (userDetails && userDetails.name) {
      const nameObj = userDetails.name.find(
        (storedName: GQLHumanName) => storedName.use === language
      ) as GQLHumanName
      fullName = `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
    }

    const role =
      userDetails && userDetails.role
        ? intl.formatMessage(messages[userDetails.role])
        : ''

    return (
      <>
        <HomeViewHeader
          title={intl.formatMessage(messages.hello, {
            fullName
          })}
          description={role}
          id="home_view"
        />
        <Container>
          <HeaderContent>
            <StyledIconAction
              id="new_registration"
              icon={() => <StyledPlusIcon />}
              onClick={this.props.goToEvents}
              title={intl.formatMessage(messages.newRegistration)}
            />
            <SearchInput
              placeholder={intl.formatMessage(messages.searchInputPlaceholder)}
              buttonLabel={intl.formatMessage(messages.searchInputButtonTitle)}
              {...this.props}
            />
            <Query
              query={COUNT_REGISTRATION_QUERY}
              variables={{
                locationIds: [registrarUnion]
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
                  Sentry.captureException(error)
                  return (
                    <ErrorText id="search-result-error-text">
                      {intl.formatMessage(messages.queryError)}
                    </ErrorText>
                  )
                }

                return (
                  <>
                    <IconTabs>
                      <IconTab
                        id={`tab_${TAB_ID.inProgress}`}
                        key={TAB_ID.inProgress}
                        active={tabId === TAB_ID.inProgress}
                        align={ICON_ALIGNMENT.LEFT}
                        icon={() => <StatusProgress />}
                        onClick={() => this.props.gotoTab(TAB_ID.inProgress)}
                      >
                        {intl.formatMessage(messages.inProgress)} ({draftCount})
                      </IconTab>
                      <IconTab
                        id={`tab_${TAB_ID.readyForReview}`}
                        key={TAB_ID.readyForReview}
                        active={tabId === TAB_ID.readyForReview}
                        align={ICON_ALIGNMENT.LEFT}
                        icon={() => <StatusOrange />}
                        onClick={() =>
                          this.props.gotoTab(TAB_ID.readyForReview)
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
                          this.props.gotoTab(TAB_ID.sentForUpdates)
                        }
                      >
                        {intl.formatMessage(messages.sentForUpdates)} (
                        {data.countEventRegistrations.rejected})
                      </IconTab>
                    </IconTabs>
                  </>
                )
              }}
            </Query>

            {tabId === TAB_ID.inProgress && (
              <div>{intl.formatMessage(messages.inProgress)}</div>
            )}
            {tabId === TAB_ID.readyForReview && (
              <div>{intl.formatMessage(messages.readyForReview)}</div>
            )}
            {tabId === TAB_ID.sentForUpdates && (
              <div>{intl.formatMessage(messages.sentForUpdates)}</div>
            )}
          </HeaderContent>
        </Container>
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
    tabId: match.params.tabId,
    draftCount: state.drafts.drafts.length
  }
}

export const WorkQueue = connect(
  mapStateToProps,
  {
    goToEvents: goToEventsAction,
    gotoTab: goToTabAction,
    goToReviewDuplicate: goToReviewDuplicateAction,
    goToPrintCertificate: goToPrintCertificateAction
  }
)(injectIntl(withTheme(WorkQueueView)))
