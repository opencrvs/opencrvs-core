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
import { LoadingIndicator } from '@client/components/LoadingIndicator'
import { LocationPicker } from '@client/components/LocationPicker'
import { usePermissions } from '@client/hooks/useAuthorization'
import {
  buttonMessages,
  constantsMessages,
  errorMessages
} from '@client/i18n/messages'
import { messages as headerMessages } from '@client/i18n/messages/views/header'
import { messages } from '@client/i18n/messages/views/sysAdmin'
import * as routes from '@client/navigation/routes'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { UserDetails } from '@client/utils/userUtils'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { formatUserRole } from '@client/v2-events/hooks/useRoles'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { ROUTES } from '@client/v2-events/routes'
import { getUsersFullName } from '@client/v2-events/utils'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { UserAuditActionModal } from '@client/views/SysAdmin/Team/user/UserAuditActionModal'
import { getAddressNameV2, UserStatus } from '@client/views/SysAdmin/Team/utils'
import { FieldType, Location, User, UUID } from '@opencrvs/commons/client'
import { Link } from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import {
  BodyContent,
  Content,
  ContentSize
} from '@opencrvs/components/lib/Content'
import { Icon } from '@opencrvs/components/lib/Icon'
import { NoWifi } from '@opencrvs/components/lib/icons'
import { ListUser } from '@opencrvs/components/lib/ListUser'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import { Pill } from '@opencrvs/components/lib/Pill'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Stack } from '@opencrvs/components/lib/Stack'
import { ITheme } from '@opencrvs/components/lib/theme'
import { Toast } from '@opencrvs/components/lib/Toast'
import { ToggleMenu } from '@opencrvs/components/lib/ToggleMenu'
import { parse } from 'qs'
import { stringify } from 'querystring'
import React, { useCallback, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import styled, { withTheme } from 'styled-components'
import { useOnlineStatus } from '../../../../utils'
import { useAdministrativeAreas } from '../../../../v2-events/hooks/useAdministrativeAreas'

const DEFAULT_FIELD_AGENT_LIST_SIZE = 10
const DEFAULT_PAGE_NUMBER = 1

const UserTable = styled(BodyContent)`
  padding: 0px;
  margin: 8px auto 0;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0px;
  }
`

const ErrorText = styled.div`
  ${({ theme }) => theme.fonts.bold16};
  text-align: center;
  height: 328px;
  margin-top: 16px;
  display: flex;
  gap: 12px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-top: 12px;
    height: calc(100vh - 104px);
  }
`

const Loading = styled.div`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    height: calc(100vh - 104px);
  }
`

const Header = styled.h1`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.h2};
  margin: 8px 0;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const LocationInfo = styled.div`
  padding: 8px 0px;
`

const LocationInfoValue = styled.div`
  color: ${({ theme }) => theme.colors.supportingCopy};
  ${({ theme }) => theme.fonts.reg18};
`

const Value = styled.span`
  color: ${({ theme }) => theme.colors.grey500};
  ${({ theme }) => theme.fonts.reg16}
`

const NoRecord = styled.div<{ isFullPage?: boolean }>`
  ${({ theme }) => theme.fonts.h3};
  text-align: left;
  margin-left: ${({ isFullPage }) => (isFullPage ? `40px` : `10px`)};
  color: ${({ theme }) => theme.colors.copy};
  margin-top: 20px;
`

const ConnectivityContainer = styled.div`
  height: 328px;
  margin-top: 16px;
  display: flex;
  gap: 12px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-top: 12px;
    height: calc(100vh - 104px);
  }
`
const NoConnectivity = styled(NoWifi)`
  width: 24px;
`
const Text = styled.div`
  ${({ theme }) => theme.fonts.reg16};
  text-align: center;
`
const LinkButtonModified = styled(LinkButton)`
  height: 24px;
`

interface SearchParams {
  locationId?: UUID
}

type UserListProps = {
  hideNavigation?: boolean
  theme: ITheme
  userDetails: UserDetails | null
}

interface ToggleModal {
  modalVisible: boolean
  selectedUser: User | null
}

export const Status = (statusProps: { status: string }) => {
  const status = statusProps.status
  const intl = useIntl()
  switch (status) {
    case UserStatus[UserStatus.ACTIVE].toLowerCase():
      return <Pill type="active" label={intl.formatMessage(messages.active)} />
    case UserStatus[UserStatus.DEACTIVATED].toLowerCase():
      return (
        <Pill
          type="inactive"
          label={intl.formatMessage(messages.deactivated)}
        />
      )
    case UserStatus[UserStatus.DISABLED].toLowerCase():
      return (
        <Pill type="default" label={intl.formatMessage(messages.disabled)} />
      )
    case UserStatus[UserStatus.PENDING].toLowerCase():
    default:
      return (
        <Pill type="pending" label={intl.formatMessage(messages.pending)} />
      )
  }
}

function UserListComponent({ userDetails, hideNavigation }: UserListProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const intl = useIntl()
  const isOnline = useOnlineStatus()

  const { getLocations } = useLocations()
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()
  const locations = getLocations.useSuspenseQuery()

  const [showResendInviteSuccess, setShowResendInviteSuccess] = useState(false)
  const [showUsernameReminderSuccess, setShowUsernameReminderSuccess] =
    useState(false)
  const [showResendInviteError, setShowResendInviteError] = useState(false)
  const [showUsernameReminderError, setShowUsernameReminderError] =
    useState(false)
  const [showResetPasswordSuccess, setShowResetPasswordSuccess] =
    useState(false)
  const [showResetPasswordError, setResetPasswordError] = useState(false)
  const { canReadUser, canEditUser, canAddOfficeUsers, canAccessOffice } =
    usePermissions()

  const { locationId } = parse(location.search, {
    ignoreQueryPrefix: true
  }) as unknown as SearchParams
  const [toggleUsernameReminder, setToggleUsernameReminder] =
    useState<ToggleModal>({
      modalVisible: false,
      selectedUser: null
    })
  const [toggleActivation, setToggleActivation] = useState<ToggleModal>({
    modalVisible: false,
    selectedUser: null
  })
  const [toggleResetPassword, setToggleResetPassword] = useState<ToggleModal>({
    modalVisible: false,
    selectedUser: null
  })

  const [currentPageNumber, setCurrentPageNumber] =
    useState<number>(DEFAULT_PAGE_NUMBER)

  const parsedId = UUID.safeParse(locationId)

  const searchedLocation: Location | undefined = parsedId.success
    ? locations.get(parsedId.data)
    : undefined

  const deliveryMethod = window.config.USER_NOTIFICATION_DELIVERY_METHOD

  const canAccessMultipleLocations = useMemo(
    () => Array.from(locations.values()).filter(canAccessOffice).length > 1,
    [locations, canAccessOffice]
  )

  const { searchUsers } = useUsers()
  const {
    data: searchResults,
    isLoading,
    error
  } = searchUsers.useQuery(
    {
      primaryOfficeId: locationId,
      count: DEFAULT_FIELD_AGENT_LIST_SIZE,
      skip: (currentPageNumber - 1) * DEFAULT_FIELD_AGENT_LIST_SIZE,
      sortOrder: 'asc'
    },
    { enabled: !!locationId }
  )

  const toggleUserActivationModal = useCallback(
    function toggleUserActivationModal(user?: User) {
      if (user !== undefined) {
        setToggleActivation({
          ...toggleActivation,
          modalVisible: true,
          selectedUser: user
        })
      } else {
        setToggleActivation({
          ...toggleActivation,
          modalVisible: false
        })
      }
    },
    [toggleActivation]
  )

  const toggleUsernameReminderModal = useCallback(
    function toggleUsernameReminderModal(user?: User) {
      if (user !== undefined) {
        setToggleUsernameReminder({
          ...toggleUsernameReminder,
          modalVisible: true,
          selectedUser: user
        })
      } else {
        setToggleUsernameReminder({
          ...toggleUsernameReminder,
          modalVisible: false
        })
      }
    },
    [toggleUsernameReminder]
  )

  const toggleUserResetPasswordModal = useCallback(
    function toggleUserResetPasswordModal(user?: User) {
      if (user !== undefined) {
        setToggleResetPassword({
          ...toggleResetPassword,
          modalVisible: true,
          selectedUser: user
        })
      } else {
        setToggleResetPassword({
          ...toggleResetPassword,
          modalVisible: false
        })
      }
    },
    [toggleResetPassword]
  )

  const resendInvite = useCallback(async function resendInvite(userId: string) {
    try {
      // const res = await userMutations.resendInvite(userId, [])
      // if (res && res.data && res.data.resendInvite) {
      //   setShowResendInviteSuccess(true)
      // }
      throw new Error('@todo Resend invite mutation is not implemented')
    } catch (err) {
      setShowResendInviteError(true)
    }
  }, [])

  const usernameReminder = useCallback(async function usernameReminder(
    userId: string
  ) {
    try {
      throw new Error('@todo Username reminder mutation is not implemented')
      // const res = await userMutations.usernameReminderSend(userId, [])
      // if (res && res.data && res.data.usernameReminder) {
      //   setShowUsernameReminderSuccess(true)
      // }
    } catch (err) {
      setShowUsernameReminderError(true)
    }
  }, [])

  const resetPassword = useCallback(async function resetPassword(
    userId: string
  ) {
    try {
      throw new Error('@todo Reset password mutation is not implemented')
      // const res = await userMutations.sendResetPasswordInvite(userId, [])
      // if (res && res.data && res.data.resetPasswordInvite) {
      //   setShowResetPasswordSuccess(true)
      // }
    } catch (err) {
      setResetPasswordError(true)
    }
  }, [])

  const getMenuItems = useCallback(
    function getMenuItems(user: User) {
      const menuItems = [
        {
          label: intl.formatMessage(messages.editUserDetailsTitle),
          handler: () => {
            navigate(
              ROUTES.V2.SETTINGS.USER.REVIEW.buildPath({
                userId: user.id
              })
            )
          }
        }
      ]

      if (user.status === 'pending' || user.status === 'active') {
        menuItems.push(
          {
            label: intl.formatMessage(messages.sendUsernameReminderInvite),
            handler: () => {
              toggleUsernameReminderModal(user)
            }
          },
          {
            label: intl.formatMessage(messages.resetUserPasswordTitle),
            handler: () => {
              toggleUserResetPasswordModal(user)
            }
          }
        )
      }

      if (user.status === 'pending') {
        menuItems.push({
          label: intl.formatMessage(messages.resendInvite),
          handler: () => {
            resendInvite(user.id as string)
          }
        })
      }

      if (user.status === 'active') {
        menuItems.push({
          label: intl.formatMessage(messages.deactivate),
          handler: () => toggleUserActivationModal(user)
        })
      }

      if (user.status === 'deactivated') {
        menuItems.push({
          label: intl.formatMessage(messages.reactivate),
          handler: () => toggleUserActivationModal(user)
        })
      }

      return menuItems
    },
    [
      intl,
      resendInvite,
      toggleUserActivationModal,
      toggleUsernameReminderModal,
      toggleUserResetPasswordModal,
      navigate
    ]
  )

  const getUserName = (user: User) => {
    return (
      getUsersFullName(user.name, intl.locale) ||
      getUsersFullName(user.name, 'en') ||
      ''
    )
  }

  const StatusMenu = useCallback(
    function StatusMenu({
      user,
      index,
      status
    }: {
      userDetails: UserDetails | null
      locationId: string
      user: User
      index: number
      status?: string
    }) {
      return (
        <Stack
          alignItems="center"
          direction="row"
          gap={8}
          justifyContent="flex-start"
        >
          <Status status={status || 'pending'} />
          {canEditUser(user) && (
            <ToggleMenu
              id={`user-item-${index}-menu`}
              toggleButton={
                <Icon name="DotsThreeVertical" color="primary" size="large" />
              }
              menuItems={getMenuItems(user)}
            />
          )}
        </Stack>
      )
    },
    [canEditUser, getMenuItems]
  )

  const generateUserContents = useCallback(
    function generateUserContents(
      users: User[],
      locationId: string,
      userDetails: UserDetails | null
    ) {
      return users.map((user, index) => {
        const name =
          getUsersFullName(user.name, intl.locale) ||
          getUsersFullName(user.name, 'en')
        const role = formatUserRole(user.role, intl)
        const avatar = user.avatar

        const userForPermissions = {
          id: user.id,
          primaryOfficeId: user.primaryOfficeId
        }

        return {
          image: (
            <Link
              onClick={() =>
                navigate(
                  ROUTES.V2.SETTINGS.USER.VIEW.buildPath({
                    userId: String(user.id)
                  })
                )
              }
              disabled={!canReadUser(userForPermissions)}
            >
              <AvatarSmall name={name} avatar={avatar || undefined} />
            </Link>
          ),
          label: (
            <Link
              id="profile-link"
              onClick={() =>
                navigate(
                  ROUTES.V2.SETTINGS.USER.VIEW.buildPath({
                    userId: String(user.id)
                  })
                )
              }
              disabled={!canReadUser(userForPermissions)}
            >
              {name}
            </Link>
          ),
          value: <Value>{role}</Value>,
          actions: (
            <StatusMenu
              userDetails={userDetails}
              locationId={locationId}
              user={user}
              index={index}
              status={user.status || undefined}
            />
          )
        }
      })
    },
    [StatusMenu, intl, navigate, canReadUser]
  )

  const onClickAddUser = useCallback(
    function onClickAddUser() {
      if (searchedLocation) {
        navigate(
          ROUTES.V2.SETTINGS.USER.CREATE.buildPath(
            {},
            {
              officeId: searchedLocation.id
            }
          )
        )
      }
    },
    [searchedLocation, navigate]
  )

  function onChangeLocation() {
    if (searchedLocation) {
      navigate(routes.TEAM_SEARCH, {
        state: {
          selectedLocation: {
            id: searchedLocation.id,
            searchableText: searchedLocation?.name,
            displayLabel: searchedLocation?.name
          }
        }
      })
    }
  }

  const LocationButton = (locationId: UUID) => {
    const buttons: React.ReactElement[] = []
    if (canAccessMultipleLocations) {
      buttons.push(
        <LocationPicker
          key={`location-picker-${locationId}`}
          selectedLocationId={locationId}
          onChangeLocation={(locationId) => {
            navigate({
              pathname: routes.TEAM_USER_LIST,
              search: stringify({
                locationId
              })
            })

            setCurrentPageNumber(DEFAULT_PAGE_NUMBER)
          }}
          locationFilter={(location) => canAccessOffice(location)}
        />
      )
    }
    if (canAddOfficeUsers({ id: locationId })) {
      buttons.push(
        <Button
          id="add-user"
          type="icon"
          size="medium"
          key={`add-user-${locationId}`}
          onClick={onClickAddUser}
        >
          <Icon name="UserPlus" />
        </Button>
      )
    }
    return buttons
  }

  const RenderUserList = useCallback(
    function RenderUserList({
      users,
      locationId,
      userDetails
    }: {
      users: User[]
      locationId: UUID
      userDetails: UserDetails | null
    }) {
      const totalData = users.length
      const userContent = generateUserContents(users, locationId, userDetails)

      return (
        <UserTable id="user_list">
          {userContent.length <= 0 ? (
            <NoRecord id="no-record">
              {intl.formatMessage(constantsMessages.noResults)}
            </NoRecord>
          ) : (
            <ListUser
              rows={userContent.map((content) => ({
                avatar: content.image,
                label: content.label,
                value: content.value,
                actions: content.actions ? [content.actions] : []
              }))}
              labelHeader={intl.formatMessage(constantsMessages.user)}
              valueHeader={intl.formatMessage(constantsMessages.labelRole)}
            />
          )}
          {totalData > DEFAULT_FIELD_AGENT_LIST_SIZE && (
            <Pagination
              currentPage={currentPageNumber}
              totalPages={Math.ceil(totalData / DEFAULT_FIELD_AGENT_LIST_SIZE)}
              onPageChange={(currentPage: number) =>
                setCurrentPageNumber(currentPage)
              }
            />
          )}
          {toggleActivation.selectedUser?.id ? (
            <UserAuditActionModal
              show={toggleActivation.modalVisible}
              userId={toggleActivation.selectedUser.id}
              onClose={() => toggleUserActivationModal()}
            />
          ) : null}

          <ResponsiveModal
            id="username-reminder-modal"
            show={toggleUsernameReminder.modalVisible}
            handleClose={() => toggleUsernameReminderModal()}
            title={intl.formatMessage(
              messages.sendUsernameReminderInviteModalTitle
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
                  if (toggleUsernameReminder.selectedUser?.id) {
                    usernameReminder(toggleUsernameReminder.selectedUser.id)
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
              messages.sendUsernameReminderInviteModalMessage,
              {
                recipient:
                  deliveryMethod === 'sms'
                    ? toggleUsernameReminder.selectedUser?.mobile
                    : toggleUsernameReminder.selectedUser?.email,
                deliveryMethod
              }
            )}
          </ResponsiveModal>
          <ResponsiveModal
            id="user-reset-password-modal"
            show={toggleResetPassword.modalVisible}
            handleClose={() => toggleUserResetPasswordModal()}
            title={intl.formatMessage(messages.resetUserPasswordModalTitle)}
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
                  if (toggleResetPassword.selectedUser?.id) {
                    resetPassword(toggleResetPassword.selectedUser.id)
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
            {intl.formatMessage(messages.resetUserPasswordModalMessage, {
              deliveryMethod,
              recipient:
                deliveryMethod === 'sms'
                  ? toggleResetPassword.selectedUser?.mobile
                  : toggleResetPassword.selectedUser?.email
            })}
          </ResponsiveModal>
        </UserTable>
      )
    },
    [
      currentPageNumber,
      generateUserContents,
      intl,
      toggleActivation.modalVisible,
      toggleActivation.selectedUser,
      toggleUserActivationModal,
      toggleUsernameReminder.modalVisible,
      toggleUsernameReminder.selectedUser,
      toggleUsernameReminderModal,
      usernameReminder,
      resetPassword,
      toggleResetPassword.modalVisible,
      toggleResetPassword.selectedUser,
      toggleUserResetPasswordModal,
      deliveryMethod
    ]
  )

  /**
   * Because the locationId is a search parameter,
   * it can happen that it gets removed as part of the login redirect mechanism causing the user to land on /team/users without a search parameter
   */
  if (!locationId) {
    return <Navigate to={routes.HOME} />
  }

  return (
    <SysAdminContentWrapper
      changeTeamLocation={
        canAccessMultipleLocations ? onChangeLocation : undefined
      }
      isCertificatesConfigPage={true}
      hideBackground={true}
      isHidden={hideNavigation}
    >
      {isOnline ? (
        <Content
          title={
            !isLoading && !error
              ? searchedLocation?.name || ''
              : intl.formatMessage(headerMessages.teamTitle)
          }
          size={ContentSize.NORMAL}
          topActionButtons={LocationButton(locationId)}
        >
          {error ? (
            <ErrorText id="user_loading_error">
              <>{intl.formatMessage(errorMessages.userQueryError)}</>
              <LinkButtonModified onClick={() => window.location.reload()}>
                {intl.formatMessage(constantsMessages.refresh)}
              </LinkButtonModified>
            </ErrorText>
          ) : isLoading ? (
            <Loading>
              <LoadingIndicator loading={true} />
            </Loading>
          ) : searchResults ? (
            <>
              <Header id="header">{searchedLocation?.name || ''}</Header>
              <LocationInfo>
                {searchedLocation && (
                  <LocationInfoValue>
                    {getAddressNameV2(
                      administrativeAreas,
                      searchedLocation.administrativeAreaId
                        ? administrativeAreas.get(
                            searchedLocation.administrativeAreaId
                          )
                        : undefined
                    )}
                  </LocationInfoValue>
                )}
              </LocationInfo>
              <RenderUserList
                users={searchResults.filter(
                  (u): u is User => u.type === 'user'
                )}
                locationId={locationId}
                userDetails={userDetails}
              />
            </>
          ) : null}
        </Content>
      ) : (
        <Content
          title={intl.formatMessage(headerMessages.teamTitle)}
          size={ContentSize.NORMAL}
        >
          <ConnectivityContainer>
            <NoConnectivity />
            <Text id="no-connection-text">
              {intl.formatMessage(constantsMessages.noConnection)}
            </Text>
          </ConnectivityContainer>
        </Content>
      )}

      {showResendInviteSuccess && (
        <Toast
          id="resend_invite_success"
          type="success"
          onClose={() => setShowResendInviteSuccess(false)}
        >
          {intl.formatMessage(messages.resendInviteSuccess)}
        </Toast>
      )}
      {showResendInviteError && (
        <Toast
          id="resend_invite_error"
          type="warning"
          onClose={() => setShowResendInviteError(false)}
        >
          {intl.formatMessage(messages.resendInviteError)}
        </Toast>
      )}

      {showUsernameReminderSuccess && (
        <Toast
          id="username_reminder_success"
          type="success"
          onClose={() => setShowUsernameReminderSuccess(false)}
        >
          {intl.formatMessage(messages.sendUsernameReminderInviteSuccess, {
            name: getUserName(toggleUsernameReminder.selectedUser as User)
          })}
        </Toast>
      )}
      {showUsernameReminderError && (
        <Toast
          id="username_reminder_error"
          type="warning"
          onClose={() => setShowUsernameReminderError(false)}
        >
          {intl.formatMessage(messages.sendUsernameReminderInviteError)}
        </Toast>
      )}

      {showResetPasswordSuccess && (
        <Toast
          id="reset_password_success"
          type="success"
          onClose={() => {
            setShowResetPasswordSuccess(false)
            setToggleResetPassword({
              ...toggleResetPassword,
              selectedUser: null
            })
          }}
        >
          {intl.formatMessage(messages.resetPasswordSuccess, {
            username: getUserName(toggleResetPassword.selectedUser as User)
          })}
        </Toast>
      )}
      {showResetPasswordError && (
        <Toast
          id="reset_password_error"
          type="warning"
          onClose={() => setResetPasswordError(false)}
        >
          {intl.formatMessage(messages.resetPasswordError)}
        </Toast>
      )}
    </SysAdminContentWrapper>
  )
}

export const UserList = connect((state: IStoreState) => ({
  userDetails: getUserDetails(state)
}))(withTheme(UserListComponent))
