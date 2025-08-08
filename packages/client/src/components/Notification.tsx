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
import { messages } from '@client/i18n/messages/views/notifications'
import { userMessages } from '@client/i18n/messages/user'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { getLanguage } from '@client/i18n/selectors'
import { IStoreState } from '@client/store'
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
  hideDuplicateRecordsToast,
  hideUnassignedDeclarationsToast,
  toggleEmailAllUsersFeedbackToast
} from '@client/notification/actions'
import { TOAST_MESSAGES } from '@client/user/userReducer'
import * as routes from '@client/navigation/routes'
import { withOnlineStatus } from '@client/views/OfficeHome/LoadingIndicator'
import { RouteComponentProps, withRouter } from './WithRouterProps'
import { formatUrl } from '@client/navigation'

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
  hideUnassignedDeclarationsToast: typeof hideUnassignedDeclarationsToast
  hideUserReconnectedToast: typeof hideUserReconnectedToast
  toggleEmailAllUsersFeedbackToast: typeof toggleEmailAllUsersFeedbackToast
}

type Props = NotificationProps &
  DispatchProps &
  IntlShapeProps &
  RouteComponentProps & { isOnline: boolean }

const Component = ({
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
  hideUnassignedDeclarationsToast,
  hideUserReconnectedToast,
  toggleEmailAllUsersFeedbackToast,
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
  isOnline,
  unassignedDeclarations,
  emailAllUsers,
  router
}: Props) => {
  const hideEmailAllUsersFeedbackToast = () => {
    toggleEmailAllUsersFeedbackToast({ visible: false })
  }

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
          onClose={hideUserReconnectedToast}
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
          onClose={hideConfigurationErrorNotification}
        >
          OpenCRVS has been only partially configured - Awaiting facilities and
          locations
        </Toast>
      )}
      {saveDraftClicked && (
        <Toast
          type="success"
          id="draftsSavedNotification"
          onClose={toggleDraftSavedNotification}
        >
          {intl.formatMessage(messages.draftsSaved)}
        </Toast>
      )}

      {submitFormSuccessToast && (
        <Toast
          id="submissionSuccessToast"
          type="success"
          onClose={hideSubmitFormSuccessToast}
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
          onClose={hideSubmitFormErrorToast}
        >
          {userFormSubmitErrorMessage}
        </Toast>
      )}
      {userAuditSuccessToast.visible && (
        <Toast
          id="userAuditSuccessToast"
          type="success"
          onClose={hideUserAuditSuccessToast}
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
          onClose={hidePINUpdateSuccessToast}
        >
          {intl.formatMessage(messages.updatePINSuccess)}
        </Toast>
      )}
      {showDuplicateRecordsToast && duplicateCompositionId && (
        <Toast
          id="duplicateRecordsToast"
          type="error"
          onClose={hideDuplicateRecordsToast}
        >
          {intl.formatMessage(messages.duplicateRecord, {
            trackingId: (
              <Link
                underline
                color="white"
                element="button"
                onClick={() => {
                  hideDuplicateRecordsToast()

                  router.navigate(
                    formatUrl(routes.DECLARATION_RECORD_AUDIT, {
                      tab: 'reviewTab',
                      declarationId: duplicateCompositionId
                    })
                  )
                }}
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
          onClose={hideDownloadDeclarationFailedToast}
        >
          {intl.formatMessage(messages.downloadDeclarationFailed)}
        </Toast>
      )}
      {unassignedModal !== null && (
        <Toast
          id="unassignedModal"
          type="warning"
          onClose={hideUnassignedModal}
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
          onClose={hideCreateUserErrorToast}
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
          onClose={hideCreateUserFormDuplicateEmailErrorToast}
        >
          {intl.formatMessage(userMessages.duplicateUserEmailErrorMessege, {
            email: userCreateDuplicateEmailFailedToast.email
          })}
        </Toast>
      )}
      {unassignedDeclarations.length > 0 && (
        <Toast
          id="unassignedDeclarationsToast"
          type="info"
          onClose={hideUnassignedDeclarationsToast}
        >
          {intl.formatMessage(messages.unassigned, {
            trackingId:
              unassignedDeclarations.length > 3
                ? `${unassignedDeclarations.slice(0, 3).join(', ')}...`
                : unassignedDeclarations.join(', ')
          })}
        </Toast>
      )}
      {emailAllUsers.visible && (
        <Toast
          id="emailAllUsersFeedback"
          type={emailAllUsers.type}
          onClose={hideEmailAllUsersFeedbackToast}
        >
          {emailAllUsers.type === 'success'
            ? intl.formatMessage(messages.emailAllUsersSuccess)
            : intl.formatMessage(messages.emailAllUsersError)}
        </Toast>
      )}
      {/* More notification types can be added here */}
    </div>
  )
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
    unassignedDeclarations: store.notification.unassignedDeclarations,
    userCreateDuplicateMobileFailedToast:
      store.notification.userCreateDuplicateMobileFailedToast,
    userCreateDuplicateEmailFailedToast:
      store.notification.userCreateDuplicateEmailFailedToast,
    userReconnectedToast: store.notification.userReconnectedToast,
    emailAllUsers: store.notification.emailAllUsers
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
    hideUnassignedDeclarationsToast,
    toggleEmailAllUsersFeedbackToast
  })(injectIntl(withOnlineStatus(Component)))
)
