import * as React from 'react'

import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'

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
  hideConfigurationErrorNotification,
  toggleDraftSavedNotification
} from '@register/notification/actions'

type NotificationProps = {
  language?: string
  newContentAvailable: boolean
  configurationErrorVisible: boolean
  backgroundSyncMessageVisible: boolean
  syncCount: number
  waitingSW: ServiceWorker | null
  saveDraftClicked: boolean
}

type DispatchProps = {
  hideNewContentAvailableNotification: typeof hideNewContentAvailableNotification
  hideBackgroundSyncedNotification: typeof hideBackgroundSyncedNotification
  hideConfigurationErrorNotification: typeof hideConfigurationErrorNotification
  toggleDraftSavedNotification: typeof toggleDraftSavedNotification
}

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
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
  },
  draftsSaved: {
    id: 'register.notification.draftsSaved',
    defaultMessage: 'Your draft has been saved',
    description:
      'The message that appears in notification when save drafts button is clicked'
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
    window.location.reload()
  }

  hideBackgroundSyncedNotification = () => {
    this.props.hideBackgroundSyncedNotification()
  }

  hideConfigurationErrorNotification = () => {
    this.props.hideConfigurationErrorNotification()
  }

  hideDraftsSavedNotification = () => {
    this.props.toggleDraftSavedNotification()
  }

  render() {
    const {
      children,
      newContentAvailable,
      backgroundSyncMessageVisible,
      configurationErrorVisible,
      syncCount,
      intl,
      saveDraftClicked
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
        {saveDraftClicked && (
          <Notification
            id="draftsSavedNotification"
            show={saveDraftClicked}
            callback={this.hideDraftsSavedNotification}
          >
            {intl.formatMessage(messages.draftsSaved)}
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
    waitingSW: store.notification.waitingSW,
    saveDraftClicked: store.notification.saveDraftClicked
  }
}

export const NotificationComponent = withRouter(
  connect<NotificationProps, DispatchProps, NotificationProps, IStoreState>(
    mapStateToProps,
    {
      hideNewContentAvailableNotification,
      hideBackgroundSyncedNotification,
      hideConfigurationErrorNotification,
      toggleDraftSavedNotification
    }
  )(injectIntl(Component))
) as any
