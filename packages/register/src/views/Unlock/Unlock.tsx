import * as React from 'react'
import { PINKeypad } from '@opencrvs/components/lib/interface'
import { Logo, Logout } from '@opencrvs/components/lib/icons'
import styled from 'styled-components'
import { LogoutConfirmation } from 'src/components/LogoutConfirmation'
import { redirectToAuthentication } from 'src/profile/profileActions'
import { connect } from 'react-redux'
import { IStoreState } from 'src/store'
import { getUserDetails } from 'src/profile/profileSelectors'
import { IUserDetails } from '../../utils/userUtils'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl'
import { storage } from 'src/storage'
import * as bcrypt from 'bcryptjs'
import { SCREEN_LOCK } from 'src/components/ProtectedPage'

const messages = defineMessages({
  incorrect: {
    id: 'unlockApp.incorrectPin',
    defaultMessage: 'Incorrect pin. Please try again'
  },
  lastTry: {
    id: 'unlockApp.lastTry',
    defaultMessage: 'Last Try'
  },
  locked: {
    id: 'unlockApp.locked',
    defaultMessage: 'Locked'
  }
})

const PageWrapper = styled.div`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  background: ${({ theme }) =>
    `linear-gradient(180deg, ${theme.colors.headerGradientDark} 0%, ${
      theme.colors.headerGradientLight
    } 100%);`};
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const LogoutHeader = styled.a`
  float: right;
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  position: absolute;
  top: 30px;
  right: 30px;
  span {
    margin-right: 10px;
  }
`
const Name = styled.p`
  color: ${({ theme }) => theme.colors.white};
`
const ErrorMsg = styled.div`
  background-color: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.white};
  padding: 5px 20px;
`
interface IState {
  showLogoutModal: boolean
  pin: string
  userPin: string
}
type ErrorState = {
  attempt: number
  errorMessage: string
}
type IFullState = IState & ErrorState

type Props = {
  userDetails: IUserDetails
  redirectToAuthentication: typeof redirectToAuthentication
}
type IFullProps = Props &
  InjectedIntlProps & {
    onCorrectPinMatch: () => void
  }

const MAX_ALLOWED_ATTEMPT = 3

class UnlockView extends React.Component<IFullProps, IFullState> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      showLogoutModal: false,
      attempt: 0,
      errorMessage: '',
      pin: '',
      userPin: ''
    }
  }

  componentWillMount() {
    this.loadUserPin()
  }

  async loadUserPin() {
    const userPin = (await storage.getItem('pin')) || ''
    this.setState(() => ({
      userPin
    }))
  }

  showName() {
    const { userDetails } = this.props
    const nameObj =
      (userDetails &&
        userDetails.name &&
        (userDetails.name.find(
          (storedName: GQLHumanName) => storedName.use === 'en'
        ) as GQLHumanName)) ||
      {}
    const fullName = `${String(nameObj.firstNames)} ${String(
      nameObj.familyName
    )}`
    return <Name>{fullName}</Name>
  }

  showErrorMessage() {
    return (
      this.state.errorMessage && (
        <ErrorMsg id="errorMsg">{this.state.errorMessage}</ErrorMsg>
      )
    )
  }

  toggleLogoutModal = () => {
    this.setState(state => ({
      showLogoutModal: !state.showLogoutModal
    }))
  }

  onPinProvided = (pin: string) => {
    const { intl } = this.props
    const { userPin } = this.state
    if (this.state.attempt === MAX_ALLOWED_ATTEMPT) {
      this.setState(() => ({
        errorMessage: intl.formatMessage(messages.locked)
      }))
    }

    if (this.state.attempt < MAX_ALLOWED_ATTEMPT - 1 && pin !== userPin) {
      this.setState(preState => ({
        attempt: preState.attempt + 1,
        errorMessage: intl.formatMessage(messages.incorrect)
      }))
    }

    if (this.state.attempt === MAX_ALLOWED_ATTEMPT - 1 && pin !== userPin) {
      this.setState(preState => ({
        attempt: preState.attempt + 1,
        errorMessage: intl.formatMessage(messages.lastTry)
      }))
    }

    const didPinMatch = bcrypt.compareSync(pin, userPin)
    if (didPinMatch) {
      this.setState(() => ({
        errorMessage: ''
      }))
      this.props.onCorrectPinMatch()
    }
  }
  logout = () => {
    storage.removeItem(SCREEN_LOCK)
    this.props.redirectToAuthentication()
  }
  render() {
    return (
      <PageWrapper id="unlockPage">
        <LogoutHeader onClick={this.toggleLogoutModal} id="logout">
          <span>Logout</span>
          <Logout />
        </LogoutHeader>
        <Logo />
        {this.showName()}
        {this.showErrorMessage()}
        <PINKeypad onComplete={this.onPinProvided} pin={this.state.pin} />
        <LogoutConfirmation
          show={this.state.showLogoutModal}
          handleClose={this.toggleLogoutModal}
          handleYes={this.logout}
        />
      </PageWrapper>
    )
  }
}

export const Unlock = connect(
  (store: IStoreState) => ({
    userDetails: getUserDetails(store)
  }),
  {
    redirectToAuthentication
  }
)(injectIntl<IFullProps>(UnlockView))
