import * as React from 'react'

import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { RouteComponentProps } from 'react-router'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import { getLanguage } from '@opencrvs/register/src/i18n/selectors'
import { IStoreState } from '@opencrvs/register/src/store'
import {
  Notification,
  NOTIFICATION_TYPE
} from '@opencrvs/components/lib/interface'
import {
  hideNewContentAvailableNotification,
  hideBackgroundSyncedNotification,
  hideConfigurationErrorNotification
} from 'src/notification/actions'

type NotificationProps = {
  language?: string
  newContentAvailable: boolean
  configurationErrorVisible: boolean
  backgroundSyncMessageVisible: boolean
  syncCount: number
  waitingSW: ServiceWorker | null
}

type DispatchProps = {
  hideNewContentAvailableNotification: typeof hideNewContentAvailableNotification
  hideBackgroundSyncedNotification: typeof hideBackgroundSyncedNotification
  hideConfigurationErrorNotification: typeof hideConfigurationErrorNotification
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
    if (this.props.waitingSW) {
      this.props.waitingSW.postMessage('skipWaiting')
    }
    this.props.hideNewContentAvailableNotification()
    location.reload()
  }

  hideBackgroundSyncedNotification = () => {
    this.props.hideBackgroundSyncedNotification()
  }

  hideConfigurationErrorNotification = () => {
    this.props.hideConfigurationErrorNotification()
  }

  render() {
    const {
      children,
      newContentAvailable,
      backgroundSyncMessageVisible,
      configurationErrorVisible,
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
        {configurationErrorVisible && (
          <Notification
            type={NOTIFICATION_TYPE.ERROR}
            id="configErrorShowNotification"
            show={configurationErrorVisible}
            callback={this.hideConfigurationErrorNotification}
          >
            OpenCRVS has been only partially configured - Awaiting facilities
            and locations
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
    configurationErrorVisible: store.notification.configurationErrorVisible,
    syncCount: store.notification.syncCount,
    waitingSW: store.notification.waitingSW
  }
}

export const NotificationComponent = withRouter(
  connect<NotificationProps, DispatchProps>(
    mapStateToProps,
    {
      hideNewContentAvailableNotification,
      hideBackgroundSyncedNotification,
      hideConfigurationErrorNotification
    }
  )(injectIntl(Component))
)
