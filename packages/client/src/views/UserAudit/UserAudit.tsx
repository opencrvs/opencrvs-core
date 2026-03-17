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

import { AvatarSmall } from '@client/components/Avatar'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { HistoryNavigator } from '@client/components/Header/HistoryNavigator'
import { Navigation } from '@client/components/interface/Navigation'
import { ProfileMenu } from '@client/components/ProfileMenu'
import { UserSection } from '@client/forms'
import { usePermissions } from '@client/hooks/useAuthorization'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { messages as sysMessages } from '@client/i18n/messages/views/sysAdmin'
import { messages as userFormMessages } from '@client/i18n/messages/views/userForm'
import { messages as userSetupMessages } from '@client/i18n/messages/views/userSetup'
import { formatUrl } from '@client/navigation'
import * as routes from '@client/navigation/routes'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { userMutations } from '@client/user/mutations'
import { formatUserRole } from '@client/v2-events/hooks/useRoles'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { getUsersFullName } from '@client/v2-events/utils'
import { Status } from '@client/views/SysAdmin/Team/user/UserList'
import { RawScopes, User } from '@opencrvs/commons/client'
import { AppBar, Link } from '@opencrvs/components/lib'
import { Button } from '@opencrvs/components/lib/Button'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Loader } from '@opencrvs/components/lib/Loader'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Summary } from '@opencrvs/components/lib/Summary'
import { Toast } from '@opencrvs/components/lib/Toast'
import { ToggleMenu } from '@opencrvs/components/lib/ToggleMenu'
import { stringify } from 'qs'
import React, { useState } from 'react'
import { IntlShape, useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ProfileState } from '../../profile/profileReducer'

const UserAvatar = styled(AvatarSmall)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

/**
 *
 * Wrapper component that adds Frame around the page if withFrame is true.
 * Created only for minimising impact of possible regression during v2 regression test period.
 */
function WithFrame({
  children,
  isHidden,
  userDetails,
  user,
  scope,
  getMenuItems,
  canEditUser,
  intl
}: {
  children: React.ReactNode
  isHidden: boolean
  userDetails: ProfileState['userDetails']
  user: User | undefined
  scope: RawScopes[] | null
  getMenuItems: (
    userId: string,
    status: string
  ) => {
    label: string
    handler: () => void
  }[]
  canEditUser: (user: User) => boolean
  intl: IntlShape
}) {
  if (isHidden) {
    return <>{children}</>
  }

  return (
    <Frame
      header={
        <AppBar
          mobileTitle={
            user?.name ? getUsersFullName(user.name, intl.locale) : ''
          }
          desktopLeft={<HistoryNavigator />}
          desktopRight={<ProfileMenu key="profileMenu" />}
          mobileLeft={<HistoryNavigator hideForward />}
          mobileRight={
            userDetails &&
            scope &&
            user && (
              <>
                <Status status={user.status || 'pending'} />
                <ToggleMenu
                  id={`sub-page-header-munu-button`}
                  toggleButton={
                    <Icon
                      name="DotsThreeVertical"
                      color="primary"
                      size="large"
                    />
                  }
                  menuItems={getMenuItems(
                    user.id as string,
                    user.status as string
                  )}
                  hide={!canEditUser(user)}
                />
              </>
            )
          }
        />
      }
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
      navigation={<Navigation />}
    >
      {children}
    </Frame>
  )
}

export const UserAudit = ({ hideNavigation }: { hideNavigation?: boolean }) => {
  const intl = useIntl()
  const navigate = useNavigate()
  const { userId } = useParams()

  const [showResendInviteSuccess, setShowResendInviteSuccess] =
    useState<boolean>(false)
  const [showResendInviteError, setShowResendInviteError] =
    useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState(false)
  const scope = useSelector((store: IStoreState) => getScope(store))
  const userDetails = useSelector((store: IStoreState) => getUserDetails(store))
  const [showUsernameReminderSuccess, setShowUsernameReminderSuccess] =
    useState(false)
  const [showUsernameReminderError, setShowUsernameReminderError] =
    useState(false)
  const [showResetPasswordSuccess, setShowResetPasswordSuccess] =
    useState(false)
  const [showResetPasswordError, setShowResetPasswordError] = useState(false)
  const [toggleUsernameReminder, setToggleUsernameReminder] = useState(false)
  const [toggleResetPassword, setToggleResetPassword] = useState(false)
  const deliveryMethod = window.config.USER_NOTIFICATION_DELIVERY_METHOD
  const { getUser } = useUsers()
  const { isFetching: loading, error, data } = getUser.useQuery(userId!)

  const user = data as User | undefined
  const userRole = user && formatUserRole(user.role, intl)
  const { canEditUser } = usePermissions()

  const toggleUserActivationModal = () => {
    setModalVisible(!modalVisible)
  }

  const toggleUsernameReminderModal = () => {
    setToggleUsernameReminder((prevValue) => !prevValue)
  }

  const toggleUserResetPasswordModal = () => {
    setToggleResetPassword((prevValue) => !prevValue)
  }

  const resendInvite = async (userId: string) => {
    try {
      const res = await userMutations.resendInvite(userId, [])
      if (res && res.data && res.data.resendInvite) {
        setShowResendInviteSuccess(true)
      }
    } catch (err) {
      setShowResendInviteError(true)
    }
  }

  const usernameReminder = async (userId: string) => {
    try {
      const res = await userMutations.usernameReminderSend(userId, [])
      if (res && res.data && res.data.usernameReminder) {
        setShowUsernameReminderSuccess(true)
      }
    } catch (err) {
      setShowUsernameReminderError(true)
    }
  }

  const resetPassword = async (userId: string) => {
    try {
      const res = await userMutations.sendResetPasswordInvite(userId, [])
      if (res && res.data && res.data.resetPasswordInvite) {
        setShowResetPasswordSuccess(true)
      }
    } catch (err) {
      setShowResetPasswordError(true)
    }
  }

  const getMenuItems = (userId: string, status: string) => {
    const menuItems: { label: string; handler: () => void }[] = [
      {
        label: intl.formatMessage(sysMessages.editUserDetailsTitle),
        handler: () =>
          navigate(
            formatUrl(routes.REVIEW_USER_DETAILS, {
              userId,
              sectionId: UserSection.Preview
            })
          )
      }
    ]

    if (status === 'pending' || status === 'active') {
      menuItems.push(
        {
          label: intl.formatMessage(sysMessages.sendUsernameReminderInvite),
          handler: () => {
            toggleUsernameReminderModal()
          }
        },
        {
          label: intl.formatMessage(sysMessages.resetUserPasswordTitle),
          handler: () => {
            toggleUserResetPasswordModal()
          }
        }
      )
    }

    if (status === 'active') {
      menuItems.push({
        label: intl.formatMessage(sysMessages.deactivate),
        handler: () => toggleUserActivationModal()
      })
    }

    if (status === 'deactivated') {
      menuItems.push({
        label: intl.formatMessage(sysMessages.reactivate),
        handler: () => toggleUserActivationModal()
      })
    }

    if (status === 'pending') {
      menuItems.push({
        label: intl.formatMessage(sysMessages.resendInvite),
        handler: () => {
          resendInvite(userId)
        }
      })
    }
    return menuItems
  }

  const userName = user ? getUsersFullName(user.name, intl.locale) : ''

  return (
    <WithFrame
      isHidden={!!hideNavigation}
      userDetails={userDetails}
      user={user}
      scope={scope}
      getMenuItems={getMenuItems}
      canEditUser={canEditUser}
      intl={intl}
    >
      {loading ? (
        <Loader id="user_loader" marginPercent={35} />
      ) : error || !user ? (
        <GenericErrorToast />
      ) : (
        <Content
          title={userName}
          icon={() => <UserAvatar name={userName} avatar={user.avatar} />}
          topActionButtons={
            userDetails && scope
              ? [
                  <Status
                    key="top-action-status"
                    status={user.status || 'pending'}
                  />,
                  <ToggleMenu
                    id={`sub-page-header-munu-button`}
                    key="top-action-toggle-menu"
                    toggleButton={
                      <Icon
                        name="DotsThreeVertical"
                        color="primary"
                        size="large"
                      />
                    }
                    menuItems={getMenuItems(
                      user.id as string,
                      user.status as string
                    )}
                    hide={!canEditUser(user)}
                  />
                ]
              : []
          }
          size={ContentSize.LARGE}
        >
          <>
            <Summary>
              <Summary.Row
                data-testid="office-link"
                label={intl.formatMessage(userSetupMessages.assignedOffice)}
                value={
                  <Link
                    id="office-link"
                    onClick={() =>
                      navigate({
                        pathname: routes.TEAM_USER_LIST,
                        search: stringify({
                          locationId: user.primaryOfficeId
                        })
                      })
                    }
                  >
                    {user.primaryOfficeId}
                  </Link>
                }
              />
              <Summary.Row
                label={intl.formatMessage(userFormMessages.labelRole)}
                value={userRole}
              />
              <Summary.Row
                label={intl.formatMessage(userFormMessages.userDevice)}
                value={user.device === null ? 'N/A' : user.device}
              />
            </Summary>

            {/* {user.practitionerId && (
              <UserAuditHistory
                practitionerId={user.practitionerId}
                practitionerName={userName}
              />
            )} */}
          </>
          {/* {user.id ? (
            <UserAuditActionModal
              show={modalVisible}
              userId={user.id}
              onClose={() => toggleUserActivationModal()}
            />
          ) : null} */}
          <ResponsiveModal
            id="username-reminder-modal"
            show={toggleUsernameReminder}
            handleClose={() => toggleUsernameReminderModal()}
            title={intl.formatMessage(
              sysMessages.sendUsernameReminderInviteModalTitle
            )}
            actions={[
              <Button
                type="tertiary"
                id="username-reminder-cancel"
                key="username-reminusernameSMSReminder-cancel"
                onClick={() => toggleUsernameReminderModal()}
              >
                {intl.formatMessage(buttonMessages.cancel)}
              </Button>,
              <Button
                type="primary"
                id="username-reminder-send"
                key="username-reminder-send"
                onClick={() => {
                  if (toggleUsernameReminder && userId) {
                    usernameReminder(userId)
                  }
                  toggleUsernameReminderModal()
                }}
              >
                {intl.formatMessage(buttonMessages.send)}
              </Button>
            ]}
            responsive={false}
            autoHeight={true}
          >
            {intl.formatMessage(
              sysMessages.sendUsernameReminderInviteModalMessage,
              {
                recipient: deliveryMethod === 'sms' ? user.mobile : user.email,
                deliveryMethod
              }
            )}
          </ResponsiveModal>
          <ResponsiveModal
            id="user-reset-password-modal"
            show={toggleResetPassword}
            handleClose={() => toggleUserResetPasswordModal()}
            title={intl.formatMessage(sysMessages.resetUserPasswordModalTitle)}
            actions={[
              <Button
                type="tertiary"
                id="reset-password-cancel"
                key="reset-password-cancel"
                onClick={() => toggleUserResetPasswordModal()}
              >
                {intl.formatMessage(buttonMessages.cancel)}
              </Button>,
              <Button
                type="primary"
                id="reset-password-send"
                key="reset-password-send"
                onClick={() => {
                  if (toggleResetPassword && userId) {
                    resetPassword(userId)
                  }
                  toggleUserResetPasswordModal()
                }}
              >
                {intl.formatMessage(buttonMessages.send)}
              </Button>
            ]}
            responsive={false}
            autoHeight={true}
          >
            {intl.formatMessage(sysMessages.resetUserPasswordModalMessage, {
              deliveryMethod,
              recipient: deliveryMethod === 'sms' ? user.mobile : user.email
            })}
          </ResponsiveModal>
          {showResendInviteSuccess && (
            <Toast
              id="resend_invite_success"
              type="success"
              onClose={() => setShowResendInviteSuccess(false)}
            >
              {intl.formatMessage(sysMessages.resendInviteSuccess)}
            </Toast>
          )}
          {showResendInviteError && (
            <Toast
              id="resend_invite_error"
              type="error"
              onClose={() => setShowResendInviteError(false)}
            >
              {intl.formatMessage(sysMessages.resendInviteError)}
            </Toast>
          )}
          {showUsernameReminderSuccess && (
            <Toast
              id="username_reminder_success"
              type="success"
              onClose={() => setShowUsernameReminderSuccess(false)}
            >
              {intl.formatMessage(
                sysMessages.sendUsernameReminderInviteSuccess,
                {
                  name: userName
                }
              )}
            </Toast>
          )}
          {showUsernameReminderError && (
            <Toast
              id="username_reminder_error"
              type="warning"
              onClose={() => setShowUsernameReminderError(false)}
            >
              {intl.formatMessage(sysMessages.sendUsernameReminderInviteError)}
            </Toast>
          )}
          {showResetPasswordSuccess && (
            <Toast
              id="reset_password_success"
              type="success"
              onClose={() => {
                setShowResetPasswordSuccess(false)
              }}
            >
              {intl.formatMessage(sysMessages.resetPasswordSuccess, {
                username: userName
              })}
            </Toast>
          )}
          {showResetPasswordError && (
            <Toast
              id="reset_password_error"
              type="warning"
              onClose={() => setShowResetPasswordError(false)}
            >
              {intl.formatMessage(sysMessages.resetPasswordError)}
            </Toast>
          )}{' '}
        </Content>
      )}
    </WithFrame>
  )
}
