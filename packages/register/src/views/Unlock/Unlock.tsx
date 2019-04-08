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
}
type ErrorState = {
  attempt: number
  errorMessage: string
}
type IFullState = IState & ErrorState

type Props = {
  userPin: string
  userDetails: IUserDetails
  redirectToAuthentication: typeof redirectToAuthentication
  onCorrectPinMatch: () => void
}
type IFullProps = Props & InjectedIntlProps

const MAX_ALLOWED_ATTEMPT = 3

class UnlockView extends React.Component<IFullProps, IFullState> {
  constructor(props: IFullProps & IState) {
    super(props)
    this.state = {
      showLogoutModal: false,
      attempt: 0,
      errorMessage: '',
      pin: ''
    }
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
      this.state.errorMessage && <ErrorMsg>{this.state.errorMessage}</ErrorMsg>
    )
  }

  toggleLogoutModal = () => {
    this.setState(state => ({
      showLogoutModal: !state.showLogoutModal
    }))
  }

  onPinProvided = (pin: string) => {
    const { intl } = this.props
    if (this.state.attempt === MAX_ALLOWED_ATTEMPT) {
      this.setState(() => ({
        errorMessage: intl.formatMessage(messages.locked)
      }))
    }

    if (
      this.state.attempt < MAX_ALLOWED_ATTEMPT - 1 &&
      pin !== this.props.userPin
    ) {
      this.setState(preState => ({
        attempt: preState.attempt + 1,
        errorMessage: intl.formatMessage(messages.incorrect)
      }))
    }

    if (
      this.state.attempt === MAX_ALLOWED_ATTEMPT - 1 &&
      pin !== this.props.userPin
    ) {
      this.setState(preState => ({
        attempt: preState.attempt + 1,
        errorMessage: intl.formatMessage(messages.lastTry)
      }))
    }

    if (pin === this.props.userPin) {
      this.setState(() => ({
        errorMessage: ''
      }))
      this.props.onCorrectPinMatch()
    }
  }

  render() {
    return (
      <PageWrapper>
        <LogoutHeader onClick={this.toggleLogoutModal}>
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
          handleYes={this.props.redirectToAuthentication}
        />
      </PageWrapper>
    )
  }
}

export const Unlock = connect(
  (store: IStoreState) => ({
    userPin: '0000',
    userDetails: getUserDetails(store),
    onCorrectPinMatch: () => {
      console.log('Pin Matched')
    }
  }),
  {
    redirectToAuthentication
  }
)(injectIntl<IFullProps>(UnlockView))
