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
import {
  SECURITY_PIN_INDEX,
  SECURITY_PIN_EXPIRED_AT
} from 'src/utils/constants'
import * as moment from 'moment'

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
  padding: 20px;
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
  padding: 10px 20px;
  text-align: center;
`
interface IState {
  showLogoutModal: boolean
  pin: string
  userPin: string
  resekKey: number
}
type ErrorState = {
  attempt: number
  errorMessage: string
}
type IFullState = IState & ErrorState

type Props = {
  userDetails: IUserDetails
  redirectToAuthentication: typeof redirectToAuthentication
  onCorrectPinMatch: () => void
}
type IFullProps = Props & InjectedIntlProps

const MAX_LOCK_TIME = 1
const MAX_ALLOWED_ATTEMPT = 3

class UnlockView extends React.Component<IFullProps, IFullState> {
  constructor(props: IFullProps & IState) {
    super(props)
    this.state = {
      showLogoutModal: false,
      attempt: 0,
      errorMessage: '',
      pin: '',
      userPin: '',
      resekKey: Date.now()
    }
  }

  componentWillMount() {
    this.loadUserPin()
    this.screenLockTimer()
  }

  async loadUserPin() {
    const userPin = (await storage.getItem(SECURITY_PIN_INDEX)) || ''
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

  onPinProvided = async (pin: string) => {
    const { intl } = this.props
    const { userPin } = this.state
    const pinMatched = bcrypt.compareSync(pin, userPin)

    if (this.state.attempt > MAX_ALLOWED_ATTEMPT) {
      return
    }

    if (this.state.attempt === MAX_ALLOWED_ATTEMPT && !pinMatched) {
      await storage.setItem(SECURITY_PIN_EXPIRED_AT, moment.now().toString())
      this.setState(prevState => {
        return {
          attempt: prevState.attempt + 1
        }
      })
      this.screenLockTimer()
      return
    }

    if (this.state.attempt < MAX_ALLOWED_ATTEMPT - 1 && !pinMatched) {
      this.setState(preState => ({
        attempt: preState.attempt + 1,
        errorMessage: intl.formatMessage(messages.incorrect),
        resekKey: Date.now()
      }))
      return
    }

    if (this.state.attempt === MAX_ALLOWED_ATTEMPT - 1 && !pinMatched) {
      this.setState(preState => ({
        attempt: preState.attempt + 1,
        errorMessage: intl.formatMessage(messages.lastTry),
        resekKey: Date.now()
      }))
      return
    }

    if (pinMatched) {
      this.setState(() => ({
        errorMessage: ''
      }))
      this.props.onCorrectPinMatch()
      return
    }
  }

  screenLockTimer = async () => {
    const { intl } = this.props
    const lockedAt = await storage.getItem(SECURITY_PIN_EXPIRED_AT)

    const intervalID = setInterval(() => {
      const currentTime = moment.now()
      const timeDiff = moment(currentTime).diff(
        parseInt(lockedAt, 10),
        'minutes'
      )
      if (lockedAt && timeDiff < MAX_LOCK_TIME) {
        this.setState(prevState => ({
          attempt: MAX_ALLOWED_ATTEMPT + 1,
          errorMessage: intl.formatMessage(messages.locked)
        }))
      } else {
        clearInterval(intervalID)
        this.setState(() => ({
          attempt: 0,
          errorMessage: '',
          resekKey: Date.now()
        }))
      }
    }, 100)
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
        <PINKeypad
          onComplete={this.onPinProvided}
          pin={this.state.pin}
          key={this.state.resekKey}
        />
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
    userDetails: getUserDetails(store),
    onCorrectPinMatch: () => {
      console.log('Pin Matched')
    }
  }),
  {
    redirectToAuthentication
  }
)(injectIntl<IFullProps>(UnlockView))
