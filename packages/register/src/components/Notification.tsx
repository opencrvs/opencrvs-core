import * as React from 'react'

import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { RouteComponentProps } from 'react-router'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import { getLanguage } from '@opencrvs/register/src/i18n/selectors'
import { IStoreState } from '@opencrvs/register/src/store'
import { Notification } from '@opencrvs/components/lib/interface'
import {
  hideNewContentAvailableNotification,
  hideBackgroundSyncedNotification
} from 'src/notification/actions'

type NotificationProps = {
  language?: string
  newContentAvailable: boolean
  backgroundSyncMessageVisible: boolean
  syncCount: number
}

type DispatchProps = {
  hideNewContentAvailableNotification: typeof hideNewContentAvailableNotification
  hideBackgroundSyncedNotification: typeof hideBackgroundSyncedNotification
}

export const messages = defineMessages({
  newContentAvailable: {
    id: 'register.notification.newContentAvailable',
    defaultMessage: "We've made some updates, click here to refresh.",
    description:
      'The message that appears in notification when new content available.'
  },
  declarationsSynced: {
    id: 'register.notification.declarationsSynced',
    defaultMessage:
      'As you have connectivity, we have synced {syncCount} new birth declarations.',
    description:
      'The message that appears in notification when background sync takes place'
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

  hideBackgroundSyncedNotification = () => {
    this.props.hideBackgroundSyncedNotification()
  }

  render() {
    const {
      children,
      newContentAvailable,
      backgroundSyncMessageVisible,
      syncCount,
      intl
    } = this.props

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
        {backgroundSyncMessageVisible && (
          <Notification
            id="backgroundSyncShowNotification"
            show={backgroundSyncMessageVisible}
            callback={this.hideBackgroundSyncedNotification}
          >
            {intl.formatMessage(messages.declarationsSynced, {
              syncCount
            })}
          </Notification>
        )}
        {/* More notification types can be added here */}
      </div>
    )
  }
}

const mapStateToProps = (store: IStoreState) => {
  return {
    language: getLanguage(store),
    newContentAvailable: store.notification.newContentAvailable,
    backgroundSyncMessageVisible:
      store.notification.backgroundSyncMessageVisible,
    syncCount: store.notification.syncCount
  }
}

export const NotificationComponent = withRouter(
  connect<NotificationProps, DispatchProps>(mapStateToProps, {
    hideNewContentAvailableNotification,
    hideBackgroundSyncedNotification
  })(injectIntl(Component))
)
