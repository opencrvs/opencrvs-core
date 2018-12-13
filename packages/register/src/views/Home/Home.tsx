import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import { getLanguage } from '@opencrvs/register/src/i18n/selectors'
import { IStoreState } from '@opencrvs/register/src/store'
import { goToEvents as goToEventsAction } from 'src/navigation'
import { HomeViewHeader } from 'src/components/HomeViewHeader'
import {
  FooterAction,
  FooterPrimaryButton,
  ViewFooter
} from 'src/components/interface/footer'
import { ActionList, IconAction } from '@opencrvs/components/lib/buttons'
import { ActionTitle } from '@opencrvs/components/lib/buttons/IconAction'
import {
  Plus,
  DraftDocument,
  PendingDocument,
  CompleteDocument
} from '@opencrvs/components/lib/icons'
import styled from 'src/styled-components'
import { IUserDetails, USER_DETAILS } from '../../utils/userUtils'
import { storage } from '@opencrvs/register/src/storage'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'

const messages = defineMessages({
  declareNewEventActionTitle: {
    id: 'register.home.buttons.registerNewEvent',
    defaultMessage: 'Declare a new vital event',
    description: 'The title for declaring new vital event on an action'
  },
  myDraftActionTitle: {
    id: 'register.home.buttons.mydraft',
    defaultMessage: 'My draft',
    description: 'The title for my draft on an action'
  },
  pendingSubmissionsActionTitle: {
    id: 'register.home.buttons.pendingSubimissions',
    defaultMessage: 'Pending submissions',
    description: 'The title for pending submissions on an action'
  },
  completedSubmissionsActionTitle: {
    id: 'register.home.buttons.completedSumissions',
    defaultMessage: 'Completd submissions',
    description: 'The title for completed submissions on an action'
  },
  logoutActionTitle: {
    id: 'register.home.logout',
    defaultMessage: 'Log out',
    description: 'The title for log out on an action'
  },
  hello: {
    id: 'register.home.header.hello',
    defaultMessage: 'Hello {fullName}',
    description: 'Title for the user'
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
  }
})

const StyledPlusIcon = styled(Plus)`
  display: flex;
  margin-left: -23px;
`
const StyledIconAction = styled(IconAction)`
  display: flex;
  min-height: 96px;
  padding: 0 20px 0 0;
  margin-bottom: 30px;
  box-shadow: 0 0 12px 1px rgba(0, 0, 0, 0.22);

  /* stylelint-disable */
  ${ActionTitle} {
    /* stylelint-enable */
    line-height: 1.3em;
    margin: -2px 0 -2px 120px;
  }
`
interface IHomeProps {
  language: string
  goToEvents: typeof goToEventsAction
}

type FullProps = IHomeProps & InjectedIntlProps

type IHomeState = {
  userDetails: IUserDetails | null
}
class HomeView extends React.Component<FullProps, IHomeState> {
  constructor(props: FullProps) {
    super(props)
    this.state = {
      userDetails: null
    }
  }
  componentWillMount() {
    this.loadUserDetailsFromStorage()
  }
  async loadUserDetailsFromStorage() {
    const userDetailsString = await storage.getItem(USER_DETAILS)
    const userDetails = JSON.parse(userDetailsString ? userDetailsString : '[]')
    this.setState({ userDetails })
  }
  render() {
    const { intl, language } = this.props
    if (this.state.userDetails && this.state.userDetails.name) {
      const nameObj = this.state.userDetails.name.find(
        (storedName: GQLHumanName) => storedName.use === language
      ) as GQLHumanName
      const fullName = `${String(nameObj.firstNames)} ${String(
        nameObj.familyName
      )}`
      return (
        <>
          <HomeViewHeader
            title={intl.formatMessage(messages.hello, {
              fullName
            })}
            description={intl.formatMessage(
              messages[this.state.userDetails.role as string]
            )}
            id="home_view"
          />
          <ActionList id="home_action_list">
            <StyledIconAction
              id="new_event_declaration"
              icon={() => <StyledPlusIcon />}
              onClick={this.props.goToEvents}
              title={intl.formatMessage(messages.declareNewEventActionTitle)}
            />
            <IconAction
              id="draft_documents"
              icon={() => <DraftDocument />}
              title={intl.formatMessage(messages.myDraftActionTitle)}
            />
            <IconAction
              id="pending_documents"
              icon={() => <PendingDocument />}
              title={intl.formatMessage(messages.pendingSubmissionsActionTitle)}
            />
            <IconAction
              id="submitted_documents"
              icon={() => <CompleteDocument />}
              title={intl.formatMessage(
                messages.completedSubmissionsActionTitle
              )}
            />
          </ActionList>
          <ViewFooter>
            <FooterAction>
              <FooterPrimaryButton>
                {intl.formatMessage(messages.logoutActionTitle)}
              </FooterPrimaryButton>
            </FooterAction>
          </ViewFooter>
        </>
      )
    } else {
      return <></>
    }
  }
}

const mapStateToProps = (store: IStoreState) => {
  return {
    language: getLanguage(store)
  }
}
export const Home = connect(
  mapStateToProps,
  { goToEvents: goToEventsAction }
)(injectIntl(HomeView))
