/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as React from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { messages } from '@client/i18n/messages/views/notifications'
import { userMessages } from '@client/i18n/messages/user'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { getLanguage } from '@opencrvs/client/src/i18n/selectors'
import { IStoreState } from '@opencrvs/client/src/store'
import { Toast } from '@opencrvs/components/lib/Toast'
import { Link } from '@opencrvs/components/lib/Link'
import {
  hideConfigurationErrorNotification,
  toggleDraftSavedNotification,
  hideSubmitFormSuccessToast,
  hideSubmitFormErrorToast,
  hideUserAuditSuccessToast,
  hidePINUpdateSuccessToast,
  hideDownloadDeclarationFailedToast,
  hideUnassignedModal,
  hideCreateUserErrorToast,
  hideCreateUserFormDuplicateEmailErrorToast,
  hideUserReconnectedToast,
  hideDuplicateRecordsToast
} from '@client/notification/actions'
import { TOAST_MESSAGES } from '@client/user/userReducer'
import { goToDeclarationRecordAudit } from '@client/navigation'
import { withOnlineStatus } from '@client/views/OfficeHome/LoadingIndicator'

type NotificationProps = ReturnType<typeof mapStateToProps> & {
  children?: React.ReactNode
}

type DispatchProps = {
  hideConfigurationErrorNotification: typeof hideConfigurationErrorNotification
  hideSubmitFormSuccessToast: typeof hideSubmitFormSuccessToast
  hideSubmitFormErrorToast: typeof hideSubmitFormErrorToast
  toggleDraftSavedNotification: typeof toggleDraftSavedNotification
  hideUserAuditSuccessToast: typeof hideUserAuditSuccessToast
  hidePINUpdateSuccessToast: typeof hidePINUpdateSuccessToast
  hideDuplicateRecordsToast: typeof hideDuplicateRecordsToast
  hideDownloadDeclarationFailedToast: typeof hideDownloadDeclarationFailedToast
  hideUnassignedModal: typeof hideUnassignedModal
  hideCreateUserErrorToast: typeof hideCreateUserErrorToast
  hideCreateUserFormDuplicateEmailErrorToast: typeof hideCreateUserFormDuplicateEmailErrorToast
  hideUserReconnectedToast: typeof hideUserReconnectedToast
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
}

class Component extends React.Component<
  NotificationProps &
    DispatchProps &
    IntlShapeProps &
    RouteComponentProps<{}> & { isOnline: boolean }
> {
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

  hideCreateUserFormErrorToast = () => {
    this.props.hideCreateUserErrorToast()
  }

  hideCreateUserFormDuplicateEmailErrorToast = () => {
    this.props.hideCreateUserFormDuplicateEmailErrorToast()
  }

  hideUserAuditSuccessToast = () => {
    this.props.hideUserAuditSuccessToast()
  }
  hideUserReconnectedToast = () => {
    this.props.hideUserReconnectedToast()
  }

  render() {
    const {
      children,
      configurationError,
      configurationErrorVisible,
      intl,
      saveDraftClicked,
      submitFormSuccessToast,
      submitFormErrorToast,
      userAuditSuccessToast,
      showPINUpdateSuccess,
      showDuplicateRecordsToast,
      duplicateTrackingId,
      duplicateCompositionId,
      downloadDeclarationFailedToast,
      unassignedModal,
      userCreateDuplicateMobileFailedToast,
      userCreateDuplicateEmailFailedToast,
      userReconnectedToast,
      goToDeclarationRecordAudit,
      isOnline
    } = this.props

    const userFormSubmitErrorMessage = isOnline
      ? intl.formatMessage(messages.userFormFail)
      : intl.formatMessage(messages.userFormFailForOffline)

    return (
      <div>
        {children}
        {userReconnectedToast && (
          <Toast
            type="success"
            id="userOnlineReconnectedToast"
            onClose={this.hideUserReconnectedToast}
          >
            {intl.formatMessage(messages.onlineUserStatus)}
          </Toast>
        )}
        {configurationError && (
          <Toast type="warning" id="formValidationErrorNotification">
            {configurationError}
          </Toast>
        )}
        {configurationErrorVisible && (
          <Toast
            type="warning"
            id="configErrorShowNotification"
            onClose={this.hideConfigurationErrorNotification}
          >
            OpenCRVS has been only partially configured - Awaiting facilities
            and locations
          </Toast>
        )}
        {saveDraftClicked && (
          <Toast
            type="success"
            id="draftsSavedNotification"
            onClose={this.hideDraftsSavedNotification}
          >
            {intl.formatMessage(messages.draftsSaved)}
          </Toast>
        )}

        {submitFormSuccessToast && (
          <Toast
            id="submissionSuccessToast"
            type="success"
            onClose={this.hideSubmitFormSuccessToast}
          >
            {submitFormSuccessToast === TOAST_MESSAGES.UPDATE_SUCCESS
              ? intl.formatMessage(messages.userFormUpdateSuccess)
              : intl.formatMessage(messages.userFormSuccess)}
          </Toast>
        )}

        {submitFormErrorToast && (
          <Toast
            id="submissionErrorToast"
            type="warning"
            onClose={this.hideSubmitFormErrorToast}
          >
            {userFormSubmitErrorMessage}
          </Toast>
        )}
        {userAuditSuccessToast.visible && (
          <Toast
            id="userAuditSuccessToast"
            type="success"
            onClose={this.hideUserAuditSuccessToast}
          >
            {intl.formatMessage(messages.userAuditSuccess, {
              name: userAuditSuccessToast.userFullName,
              action: userAuditSuccessToast.action
            })}
          </Toast>
        )}
        {showPINUpdateSuccess && (
          <Toast
            id="PINUpdateSuccessToast"
            type="success"
            onClose={this.props.hidePINUpdateSuccessToast}
          >
            {intl.formatMessage(messages.updatePINSuccess)}
          </Toast>
        )}
        {showDuplicateRecordsToast && duplicateCompositionId && (
          <Toast
            id="duplicateRecordsToast"
            type="error"
            onClose={this.props.hideDuplicateRecordsToast}
          >
            {intl.formatMessage(messages.duplicateRecord, {
              trackingId: (
                <Link
                  underline
                  color="white"
                  element="button"
                  onClick={() =>
                    this.props.hideDuplicateRecordsToast() &&
                    goToDeclarationRecordAudit(
                      'reviewTab',
                      duplicateCompositionId
                    )
                  }
                >
                  {duplicateTrackingId}
                </Link>
              )
            })}
          </Toast>
        )}
        {downloadDeclarationFailedToast && (
          <Toast
            id="PINUpdateSuccessToast"
            type="warning"
            onClose={this.props.hideDownloadDeclarationFailedToast}
          >
            {intl.formatMessage(messages.downloadDeclarationFailed)}
          </Toast>
        )}
        {unassignedModal !== null && (
          <Toast
            id="unassignedModal"
            type="warning"
            onClose={this.props.hideUnassignedModal}
          >
            {intl.formatMessage(messages.unassigned, {
              trackingId: unassignedModal.trackingId
            })}
          </Toast>
        )}
        {userCreateDuplicateMobileFailedToast.visible && (
          <Toast
            id="createUserDuplicateMobileFailedToast"
            type="warning"
            onClose={this.hideCreateUserFormErrorToast}
          >
            {intl.formatMessage(userMessages.duplicateUserMobileErrorMessege, {
              number: userCreateDuplicateMobileFailedToast.mobile
            })}
          </Toast>
        )}
        {userCreateDuplicateEmailFailedToast.visible && (
          <Toast
            id="createUserDuplicateEmailFailedToast"
            type="warning"
            onClose={this.hideCreateUserFormDuplicateEmailErrorToast}
          >
            {intl.formatMessage(userMessages.duplicateUserEmailErrorMessege, {
              email: userCreateDuplicateEmailFailedToast.email
            })}
          </Toast>
        )}
        {/* More notification types can be added here */}
      </div>
    )
  }
}

const mapStateToProps = (store: IStoreState) => {
  return {
    language: getLanguage(store),
    backgroundSyncMessageVisible:
      store.notification.backgroundSyncMessageVisible,
    configurationError: store.notification.configurationError,
    configurationErrorVisible: store.notification.configurationErrorVisible,
    saveDraftClicked: store.notification.saveDraftClicked,
    submitFormSuccessToast: store.notification.submitFormSuccessToast,
    submitFormErrorToast: store.notification.submitFormErrorToast,
    userAuditSuccessToast: store.notification.userAuditSuccessToast,
    showPINUpdateSuccess: store.notification.showPINUpdateSuccess,
    showDuplicateRecordsToast: store.notification.showDuplicateRecordsToast,
    duplicateCompositionId: store.notification.duplicateCompositionId,
    duplicateTrackingId: store.notification.duplicateTrackingId,
    downloadDeclarationFailedToast:
      store.notification.downloadDeclarationFailedToast,
    unassignedModal: store.notification.unassignedModal,
    userCreateDuplicateMobileFailedToast:
      store.notification.userCreateDuplicateMobileFailedToast,
    userCreateDuplicateEmailFailedToast:
      store.notification.userCreateDuplicateEmailFailedToast,
    userReconnectedToast: store.notification.userReconnectedToast
  }
}

export const NotificationComponent = withRouter(
  connect(mapStateToProps, {
    hideConfigurationErrorNotification,
    hideSubmitFormSuccessToast,
    hideSubmitFormErrorToast,
    toggleDraftSavedNotification,
    hideUserAuditSuccessToast,
    hidePINUpdateSuccessToast,
    hideDuplicateRecordsToast,
    hideDownloadDeclarationFailedToast,
    hideUnassignedModal,
    hideCreateUserErrorToast,
    hideCreateUserFormDuplicateEmailErrorToast,
    hideUserReconnectedToast,
    goToDeclarationRecordAudit
  })(injectIntl(withOnlineStatus(Component)))
)
