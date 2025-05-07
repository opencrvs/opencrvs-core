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

import { useQuery } from '@apollo/client'
import React, { useState } from 'react'
import { messages as userFormMessages } from '@client/i18n/messages/views/userForm'
import { constantsMessages, buttonMessages } from '@client/i18n/messages'
import { messages as sysMessages } from '@client/i18n/messages/views/sysAdmin'
import { Navigation } from '@client/components/interface/Navigation'
import { Frame } from '@opencrvs/components/lib/Frame'
import { IntlShape, useIntl } from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'
import { GET_USER } from '@client/user/queries'
import { getLocalisedName } from '@client/utils/data-formatting'
import { AvatarSmall } from '@client/components/Avatar'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { HistoryNavigator } from '@client/components/Header/HistoryNavigator'
import { ProfileMenu } from '@client/components/ProfileMenu'
import { usePermissions } from '@client/hooks/useAuthorization'
import { messages as userSetupMessages } from '@client/i18n/messages/views/userSetup'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { useSelector } from 'react-redux'
import { formatUrl } from '@client/navigation'
import { Status } from '@client/views/SysAdmin/Team/user/UserList'
import { Icon } from '@opencrvs/components/lib/Icon'
import { IStoreState } from '@client/store'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { userMutations } from '@client/user/mutations'
import { EMPTY_STRING, LANG_EN } from '@client/utils/constants'
import {
  GetUserQuery,
  GetUserQueryVariables,
  HumanName
} from '@client/utils/gateway'
import { UserAuditActionModal } from '@client/views/SysAdmin/Team/user/UserAuditActionModal'
import { UserAuditHistory } from '@client/views/UserAudit/UserAuditHistory'
import { AppBar, Link } from '@opencrvs/components/lib'
import { Button } from '@opencrvs/components/lib/Button'
import { Loader } from '@opencrvs/components/lib/Loader'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Summary } from '@opencrvs/components/lib/Summary'
import { Toast } from '@opencrvs/components/lib/Toast'
import { ToggleMenu } from '@opencrvs/components/lib/ToggleMenu'
import styled from 'styled-components'
import * as routes from '@client/navigation/routes'
import { UserSection } from '@client/forms'
import { stringify } from 'query-string'

const UserAvatar = styled(AvatarSmall)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const transformUserQueryResult = (
  userData: NonNullable<GetUserQuery['getUser']>,
  intl: IntlShape
) => {
  const locale = intl.locale
  return {
    id: userData.id,
    primaryOffice: {
      id: (userData.primaryOffice && userData.primaryOffice.id) || '',
      searchableText: '',
      displayLabel:
        (userData.primaryOffice &&
          (locale === LANG_EN
            ? userData.primaryOffice.name
            : (userData.primaryOffice.alias &&
                userData.primaryOffice.alias.join(' ')) ||
              '')) ||
        ''
    },
    name: getLocalisedName(intl, userData.name[0]),
    role: userData.role,
    number: userData.mobile,
    email: userData.email,
    status: userData.status,
    underInvestigation: userData.underInvestigation,
    username: userData.username,
    nid:
      userData.identifier?.system === 'NATIONAL_ID'
        ? userData.identifier.value
        : EMPTY_STRING,
    practitionerId: userData.practitionerId,
    avatar: userData.avatar || undefined,
    device: userData.device
  }
}

export const UserAudit = () => {
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
  const { data, loading, error } = useQuery<
    GetUserQuery,
    GetUserQueryVariables
  >(GET_USER, {
    variables: { userId: userId! },
    fetchPolicy: 'cache-and-network'
  })
  const user = data?.getUser && transformUserQueryResult(data.getUser, intl)
  const userRole = user && intl.formatMessage(user.role.label)
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
      const res = await userMutations.resendInvite(userId, [
        {
          query: GET_USER,
          variables: {
            userId: userId
          }
        }
      ])
      if (res && res.data && res.data.resendInvite) {
        setShowResendInviteSuccess(true)
      }
    } catch (err) {
      setShowResendInviteError(true)
    }
  }

  const usernameReminder = async (userId: string) => {
    try {
      const res = await userMutations.usernameReminderSend(userId, [
        {
          query: GET_USER,
          variables: { userId: userId }
        }
      ])
      if (res && res.data && res.data.usernameReminder) {
        setShowUsernameReminderSuccess(true)
      }
    } catch (err) {
      setShowUsernameReminderError(true)
    }
  }

  const resetPassword = async (userId: string) => {
    try {
      const res = await userMutations.sendResetPasswordInvite(userId, [
        {
          query: GET_USER,
          variables: { userId: userId }
        }
      ])
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

  return (
    <Frame
      header={
        <AppBar
          mobileTitle={user?.name}
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
      {loading ? (
        <Loader id="user_loader" marginPercent={35} />
      ) : error || !user ? (
        <GenericErrorToast />
      ) : (
        <Content
          title={user.name}
          icon={() => <UserAvatar name={user.name} avatar={user.avatar} />}
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
                          locationId: user.primaryOffice.id
                        })
                      })
                    }
                  >
                    {user.primaryOffice && user.primaryOffice.displayLabel}
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

            {user.practitionerId && (
              <UserAuditHistory
                practitionerId={user.practitionerId}
                practitionerName={user.name}
              />
            )}
          </>
          {data.getUser?.id ? (
            <UserAuditActionModal
              show={modalVisible}
              userId={data.getUser?.id}
              onClose={() => toggleUserActivationModal()}
              onConfirmRefetchQueries={[
                {
                  query: GET_USER,
                  variables: {
                    userId: userId
                  }
                }
              ]}
            />
          ) : null}
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
                recipient: deliveryMethod === 'sms' ? user.number : user.email,
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
              recipient: deliveryMethod === 'sms' ? user.number : user.email
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
                  name: user.name
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
                username: user.name
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
          )}
        </Content>
      )}
    </Frame>
  )
}
