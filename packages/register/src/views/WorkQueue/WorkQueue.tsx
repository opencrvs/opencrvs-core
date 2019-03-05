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
  ISearchInputProps
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
import { IUserDetails } from 'src/utils/userUtils'
import { getUserDetails } from 'src/profile/profileSelectors'
import { HeaderContent } from '@opencrvs/components/lib/layout'
import { RouteComponentProps } from 'react-router'

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
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 0;
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
interface IBaseWorkQueueProps {
  theme: ITheme
  language: string
  scope: Scope
  goToEvents: typeof goToEventsAction
  userDetails: IUserDetails
  gotoTab: typeof goToTabAction
  tabId: string
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
  tabs = [
    {
      id: TAB_ID.inProgress,
      name: messages.inProgress,
      icon: () => <StatusProgress />,
      onClick: () => this.props.gotoTab(TAB_ID.inProgress)
    },
    {
      id: TAB_ID.readyForReview,
      name: messages.readyForReview,
      icon: () => <StatusOrange />,
      onClick: () => this.props.gotoTab(TAB_ID.readyForReview)
    },
    {
      id: TAB_ID.sentForUpdates,
      name: messages.sentForUpdates,
      icon: () => <StatusRejected />,
      onClick: () => this.props.gotoTab(TAB_ID.sentForUpdates)
    }
  ]
  render() {
    const { intl, userDetails, language, tabId } = this.props

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
            <IconTabs>
              {this.tabs.map(({ id, name, onClick, icon }) => (
                <IconTab
                  id={`tab_${id}`}
                  key={id}
                  active={tabId === id}
                  align={ICON_ALIGNMENT.LEFT}
                  icon={icon}
                  onClick={onClick}
                >
                  {intl.formatMessage(name)}
                </IconTab>
              ))}
            </IconTabs>
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
    tabId: match.params.tabId
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
