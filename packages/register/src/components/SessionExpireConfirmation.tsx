import * as React from 'react'
import { connect } from 'react-redux'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import styled from '@register/styledComponents'
import { Modal } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { IStoreState } from '@register/store'
import { redirectToAuthentication } from '@register/profile/profileActions'
import { messages } from '@register/i18n/messages/views/session'
import { buttonMessages } from '@register/i18n/messages'

const StyledModal = styled(Modal)`
  z-index: 4;
`
type SessionExpireProps = {
  sessionExpired: boolean
}
interface IProps {
  redirectToAuthentication: typeof redirectToAuthentication
}

class SessionExpireComponent extends React.Component<
  SessionExpireProps & IProps & IntlShapeProps
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
                {intl.formatMessage(buttonMessages.login)}
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
