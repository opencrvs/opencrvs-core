import * as React from 'react'
import { connect } from 'react-redux'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import styled from '@register/styledComponents'
import { Modal } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { IStoreState } from '@register/store'
import { redirectToAuthentication } from '@register/profile/profileActions'

const StyledModal = styled(Modal)`
  z-index: 4;
`
export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  loginButton: {
    id: 'login.stepOneTitle',
    defaultMessage: 'Login',
    description: 'Login button on session expire modal'
  },
  sessionExpireTxt: {
    id: 'session.expire.text',
    defaultMessage: 'Your session has expired. Please login again.',
    description: 'SessionExpire modal confirmation text'
  }
})
type SessionExpireProps = {
  sessionExpired: boolean
}
interface IProps {
  redirectToAuthentication: typeof redirectToAuthentication
}

class SessionExpireComponent extends React.Component<
  SessionExpireProps & IProps & InjectedIntlProps
> {
  handleLogin = () => {
    console.log('login')
  }
  render() {
    const { intl, sessionExpired } = this.props
    return (
      <>
        {sessionExpired && (
          <StyledModal
            title={intl.formatMessage(messages.sessionExpireTxt)}
            actions={[
              <PrimaryButton
                key="login"
                id="login"
                onClick={this.props.redirectToAuthentication}
              >
                {intl.formatMessage(messages.loginButton)}
              </PrimaryButton>
            ]}
            show={true}
          />
        )}
      </>
    )
  }
}

const mapStateToProps = (store: IStoreState) => {
  return {
    sessionExpired: store.notification.sessionExpired
  }
}

export const SessionExpireConfirmation = connect<
  SessionExpireProps,
  IProps,
  SessionExpireProps & IProps,
  IStoreState
>(
  mapStateToProps,
  {
    redirectToAuthentication
  }
)(injectIntl(SessionExpireComponent)) as any
