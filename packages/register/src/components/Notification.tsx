import * as React from 'react'

import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { RouteComponentProps } from 'react-router'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import { getLanguage } from '@opencrvs/register/src/i18n/selectors'
import { IStoreState } from '@opencrvs/register/src/store'
import { Notification } from '@opencrvs/components/lib/interface'
import { hideNewContentAvailableNotification } from 'src/notification/actions'

type NotificationProps = {
  language?: string
  newContentAvailable: boolean
}

type DispatchProps = {
  hideNewContentAvailableNotification: typeof hideNewContentAvailableNotification
}

export const messages = defineMessages({
  newContentAvailable: {
    id: 'register.notification.newContentAvailable',
    defaultMessage: "We've made some updates, click here to refresh.",
    description:
      'The message that appears in notification when new content available.'
  }
})

class Component extends React.Component<
  NotificationProps &
    DispatchProps &
    InjectedIntlProps &
    RouteComponentProps<{}>
> {
  onNewContentAvailableNotificationClick = () => {
    this.props.hideNewContentAvailableNotification()
    location.reload()
  }
  render() {
    const { children, newContentAvailable, intl } = this.props
    return (
      <div>
        {children}
        {newContentAvailable && (
          <Notification
            id="newContentAvailableNotification"
            show={newContentAvailable}
            callback={this.onNewContentAvailableNotificationClick}
          >
            {intl.formatMessage(messages.newContentAvailable)}
          </Notification>
        )}
      </div>
    )
  }
}

const mapStateToProps = (store: IStoreState) => {
  return {
    language: getLanguage(store),
    newContentAvailable: store.notification.newContentAvailable
  }
}

export const NotificationComponent = withRouter(
  connect<NotificationProps, DispatchProps>(mapStateToProps, {
    hideNewContentAvailableNotification
  })(injectIntl(Component))
)
