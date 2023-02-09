/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import React, { useState } from 'react'
import { messages as userFormMessages } from '@client/i18n/messages/views/userForm'
import { constantsMessages, buttonMessages } from '@client/i18n/messages'
import { messages as sysMessages } from '@client/i18n/messages/views/sysAdmin'
import { Navigation } from '@client/components/interface/Navigation'
import { Frame } from '@opencrvs/components/lib/Frame'
import { IntlShape, useIntl } from 'react-intl'
import { useParams } from 'react-router'
import { GET_USER } from '@client/user/queries'
import { createNamesMap } from '@client/utils/data-formatting'
import { AvatarSmall } from '@client/components/Avatar'
import styled from 'styled-components'
import { ToggleMenu } from '@opencrvs/components/lib/ToggleMenu'
import { Button } from '@opencrvs/components/lib/Button'
import { getUserRoleIntlKey } from '@client/views/SysAdmin//Team/utils'
import { EMPTY_STRING, LANG_EN } from '@client/utils/constants'
import { Loader } from '@opencrvs/components/lib/Loader'
import { getJurisdictionLocationIdFromUserDetails } from '@client/views/SysAdmin/Performance/utils'
import { messages as userSetupMessages } from '@client/i18n/messages/views/userSetup'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { useDispatch, useSelector } from 'react-redux'
import { goToReviewUserDetails, goToTeamUserList } from '@client/navigation'
import { Status } from '@client/views/SysAdmin/Team/user/UserList'
import { VerticalThreeDots } from '@client/../../components/lib/icons'
import { IStoreState } from '@client/store'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { userMutations } from '@client/user/mutations'
import { UserAuditHistory } from '@client/views/UserAudit/UserAuditHistory'
import { Summary } from '@opencrvs/components/lib/Summary'
import { Toast } from '@opencrvs/components/lib/Toast'
import { UserAuditActionModal } from '@client/views/SysAdmin/Team/user/UserAuditActionModal'
import {
  GetUserQuery,
  GetUserQueryVariables,
  HumanName,
  User
} from '@client/utils/gateway'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { getOfflineData } from '@client/offline/selectors'
import { useQuery } from '@apollo/client'
import { AppBar, Link } from '@opencrvs/components/lib'
import { ProfileMenu } from '@client/components/ProfileMenu'
import { HistoryNavigator } from '@client/components/Header/HistoryNavigator'
import { UserDetails } from '@client/utils/userUtils'

const UserAvatar = styled(AvatarSmall)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

export const InformationTitle = styled.div`
  ${({ theme }) => theme.fonts.bold16};
  width: 320px;
`

interface IRouteProps {
  userId: string
}

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
    name:
      createNamesMap(userData.name as HumanName[])[locale] ||
      createNamesMap(userData.name as HumanName[])[LANG_EN],
    systemRole: userData.systemRole,
    role: userData.role,
    number: userData.mobile,
    status: userData.status,
    underInvestigation: userData.underInvestigation,
    username: userData.username,
    nid:
      userData.identifier?.system === 'NATIONAL_ID'
        ? userData.identifier.value
        : EMPTY_STRING,
    practitionerId: userData.practitionerId,
    locationId:
      getJurisdictionLocationIdFromUserDetails(userData as UserDetails) || '0',
    avatar: userData.avatar || undefined,
    device: userData.device
  }
}

export const UserAudit = () => {
  const intl = useIntl()
  const { userId } = useParams<IRouteProps>()
  const dispatch = useDispatch()
  const [showResendSMSSuccess, setShowResendSMSSuccess] =
    useState<boolean>(false)
  const [showResendSMSError, setShowResendSMSError] = useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState(false)
  const scope = useSelector((store: IStoreState) => getScope(store))
  const userDetails = useSelector((store: IStoreState) => getUserDetails(store))
  const [showUsernameSMSReminderSuccess, setShowUsernameSMSReminderSuccess] =
    useState(false)
  const [showUsernameSMSReminderError, setShowUsernameSMSReminderError] =
    useState(false)
  const [showResetPasswordSMSSuccess, setShowResetPasswordSMSSuccess] =
    useState(false)
  const [showResetPasswordSMSError, setShowResetPasswordSMSError] =
    useState(false)
  const [toggleUsernameReminder, setToggleUsernameReminder] = useState(false)
  const [toggleResetPassword, setToggleResetPassword] = useState(false)
  const offLineData = useSelector(getOfflineData)
  const { data, loading, error } = useQuery<
    GetUserQuery,
    GetUserQueryVariables
  >(GET_USER, { variables: { userId }, fetchPolicy: 'cache-and-network' })
  const user = data?.getUser && transformUserQueryResult(data.getUser, intl)
  const userRole =
    user && intl.formatMessage({ id: getUserRoleIntlKey(user.role._id) })

  const toggleUserActivationModal = () => {
    setModalVisible(!modalVisible)
  }

  const toggleUsernameReminderModal = () => {
    setToggleUsernameReminder((prevValue) => !prevValue)
  }

  const toggleUserResetPasswordModal = () => {
    setToggleResetPassword((prevValue) => !prevValue)
  }

  const resendSMS = async (userId: string) => {
    try {
      const res = await userMutations.resendSMSInvite(userId, [
        {
          query: GET_USER,
          variables: {
            userId: userId
          }
        }
      ])
      if (res && res.data && res.data.resendSMSInvite) {
        setShowResendSMSSuccess(true)
      }
    } catch (err) {
      setShowResendSMSError(true)
    }
  }

  const usernameSMSReminder = async (userId: string) => {
    try {
      const res = await userMutations.usernameSMSReminderSend(userId, [
        {
          query: GET_USER,
          variables: { userId: userId }
        }
      ])
      if (res && res.data && res.data.usernameSMSReminder) {
        setShowUsernameSMSReminderSuccess(true)
      }
    } catch (err) {
      setShowUsernameSMSReminderError(true)
    }
  }

  const resetPassword = async (userId: string) => {
    try {
      const res = await userMutations.sendResetPasswordSMS(
        userId,
        offLineData.config.APPLICATION_NAME,
        [
          {
            query: GET_USER,
            variables: { userId: userId }
          }
        ]
      )
      if (res && res.data && res.data.resetPasswordSMS) {
        setShowResetPasswordSMSSuccess(true)
      }
    } catch (err) {
      setShowResetPasswordSMSError(true)
    }
  }

  const getMenuItems = (userId: string, status: string) => {
    const menuItems: { label: string; handler: () => void }[] = [
      {
        label: intl.formatMessage(sysMessages.editUserDetailsTitle),
        handler: () => dispatch(goToReviewUserDetails(userId))
      }
    ]

    if (status === 'pending' || status === 'active') {
      menuItems.push(
        {
          label: intl.formatMessage(sysMessages.sendUsernameReminderSMS),
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
        label: intl.formatMessage(sysMessages.resendSMS),
        handler: () => {
          resendSMS(userId)
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
            user && (
              <>
                <Status status={user.status || 'pending'} />
                <ToggleMenu
                  id={`sub-page-header-munu-button`}
                  toggleButton={<VerticalThreeDots />}
                  menuItems={getMenuItems(
                    user.id as string,
                    user.status as string
                  )}
                  hide={(scope && !scope.includes('sysadmin')) || false}
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
          topActionButtons={[
            <Status status={user.status || 'pending'} />,
            <ToggleMenu
              id={`sub-page-header-munu-button`}
              toggleButton={<VerticalThreeDots />}
              menuItems={getMenuItems(user.id as string, user.status as string)}
              hide={(scope && !scope.includes('sysadmin')) || false}
            />
          ]}
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
                      dispatch(goToTeamUserList(user.primaryOffice!.id))
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
                loggedInUserRole={userDetails!.systemRole}
              />
            )}
          </>
          <UserAuditActionModal
            show={modalVisible}
            user={data.getUser! as User}
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
          <ResponsiveModal
            id="username-reminder-modal"
            show={toggleUsernameReminder}
            handleClose={() => toggleUsernameReminderModal()}
            title={intl.formatMessage(
              sysMessages.sendUsernameReminderSMSModalTitle
            )}
            actions={[
              <Button
                type="tertiary"
                id="username-reminder-cancel"
                key="username-reminusernameSMSReminderder-cancel"
                onClick={() => toggleUsernameReminderModal()}
              >
                {intl.formatMessage(buttonMessages.cancel)}
              </Button>,
              <Button
                type="primary"
                id="username-reminder-send"
                key="username-reminder-send"
                onClick={() => {
                  if (toggleUsernameReminder) {
                    usernameSMSReminder(userId)
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
              sysMessages.sendUsernameReminderSMSModalMessage,
              { phoneNumber: user.number }
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
                  if (toggleResetPassword) {
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
              phoneNumber: user.number ?? ''
            })}
          </ResponsiveModal>
          {showResendSMSSuccess && (
            <Toast
              id="resend_invite_success"
              type="success"
              onClose={() => setShowResendSMSSuccess(false)}
            >
              {intl.formatMessage(sysMessages.resendSMSSuccess)}
            </Toast>
          )}
          {showResendSMSError && (
            <Toast
              id="resend_invite_error"
              type="error"
              onClose={() => setShowResendSMSError(false)}
            >
              {intl.formatMessage(sysMessages.resendSMSError)}
            </Toast>
          )}
          {showUsernameSMSReminderSuccess && (
            <Toast
              id="username_reminder_success"
              type="success"
              onClose={() => setShowUsernameSMSReminderSuccess(false)}
            >
              {intl.formatMessage(sysMessages.sendUsernameReminderSMSSuccess, {
                name: user.name
              })}
            </Toast>
          )}
          {showUsernameSMSReminderError && (
            <Toast
              id="username_reminder_error"
              type="warning"
              onClose={() => setShowUsernameSMSReminderError(false)}
            >
              {intl.formatMessage(sysMessages.sendUsernameReminderSMSError)}
            </Toast>
          )}

          {showResetPasswordSMSSuccess && (
            <Toast
              id="reset_password_success"
              type="success"
              onClose={() => {
                setShowResetPasswordSMSSuccess(false)
              }}
            >
              {intl.formatMessage(sysMessages.resetPasswordSMSSuccess, {
                username: user.name
              })}
            </Toast>
          )}
          {showResetPasswordSMSError && (
            <Toast
              id="reset_password_error"
              type="warning"
              onClose={() => setShowResetPasswordSMSError(false)}
            >
              {intl.formatMessage(sysMessages.resetPasswordSMSError)}
            </Toast>
          )}
        </Content>
      )}
    </Frame>
  )
}
