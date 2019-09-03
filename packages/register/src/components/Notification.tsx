import * as React from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { messages } from '@register/i18n/messages/views/notifications'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { getLanguage } from '@opencrvs/register/src/i18n/selectors'
import { IStoreState } from '@opencrvs/register/src/store'
import {
  Notification,
  NOTIFICATION_TYPE,
  FloatingNotification
} from '@opencrvs/components/lib/interface'
import {
  hideNewContentAvailableNotification,
  hideBackgroundSyncedNotification,
  hideConfigurationErrorNotification,
  toggleDraftSavedNotification,
  hideSubmitFormSuccessToast,
  hideSubmitFormErrorToast
} from '@register/notification/actions'

type NotificationProps = {
  language?: string
  newContentAvailable: boolean
  configurationErrorVisible: boolean
  backgroundSyncMessageVisible: boolean
  syncCount: number
  waitingSW: ServiceWorker | null
  saveDraftClicked: boolean
  submitFormSuccessToast: string | null
  submitFormErrorToast: string | null
}

type DispatchProps = {
  hideNewContentAvailableNotification: typeof hideNewContentAvailableNotification
  hideBackgroundSyncedNotification: typeof hideBackgroundSyncedNotification
  hideConfigurationErrorNotification: typeof hideConfigurationErrorNotification
  hideSubmitFormSuccessToast: typeof hideSubmitFormSuccessToast
  hideSubmitFormErrorToast: typeof hideSubmitFormErrorToast
  toggleDraftSavedNotification: typeof toggleDraftSavedNotification
}

class Component extends React.Component<
  NotificationProps & DispatchProps & IntlShapeProps & RouteComponentProps<{}>
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

  hideSubmitFormSuccessToast = () => {
    this.props.hideSubmitFormSuccessToast()
  }

  hideSubmitFormErrorToast = () => {
    this.props.hideSubmitFormErrorToast()
  }

  render() {
    const {
      children,
      newContentAvailable,
      backgroundSyncMessageVisible,
      configurationErrorVisible,
      syncCount,
      intl,
      saveDraftClicked,
      submitFormSuccessToast,
      submitFormErrorToast
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

        {submitFormSuccessToast && (
          <FloatingNotification
            id="submissionSuccessToast"
            show={Boolean(submitFormSuccessToast)}
            type={NOTIFICATION_TYPE.SUCCESS}
            callback={this.hideSubmitFormSuccessToast}
          >
            {intl.formatMessage(messages.userFormSuccess)}
          </FloatingNotification>
        )}

        {submitFormErrorToast && (
          <FloatingNotification
            id="submissionErrorToast"
            show={Boolean(submitFormErrorToast)}
            type={NOTIFICATION_TYPE.ERROR}
            callback={this.hideSubmitFormErrorToast}
          >
            {intl.formatMessage(messages.userFormFail)}
          </FloatingNotification>
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
    saveDraftClicked: store.notification.saveDraftClicked,
    submitFormSuccessToast: store.notification.submitFormSuccessToast,
    submitFormErrorToast: store.notification.submitFormErrorToast
  }
}

export const NotificationComponent = withRouter(
  connect<NotificationProps, DispatchProps, NotificationProps, IStoreState>(
    mapStateToProps,
    {
      hideNewContentAvailableNotification,
      hideBackgroundSyncedNotification,
      hideConfigurationErrorNotification,
      hideSubmitFormSuccessToast,
      hideSubmitFormErrorToast,
      toggleDraftSavedNotification
    }
  )(injectIntl(Component))
) as any
