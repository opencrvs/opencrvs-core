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
import { Query } from '@client/components/Query'
import {
  buttonMessages,
  constantsMessages,
  errorMessages,
  userMessages
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/sysAdmin'
import { messages as headerMessages } from '@client/i18n/messages/views/header'
import {
  goToCreateNewUser,
  goToCreateNewUserWithLocationId,
  goToReviewUserDetails,
  goToTeamSearch,
  goToTeamUserList,
  goToUserProfile
} from '@client/navigation'
import { ILocation, IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { withTheme } from '@client/styledComponents'
import { SEARCH_USERS } from '@client/user/queries'
import {
  LANG_EN,
  NATL_ADMIN_ROLES,
  SYS_ADMIN_ROLES
} from '@client/utils/constants'
import { createNamesMap } from '@client/utils/data-formatting'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import {
  getUserRoleIntlKey,
  UserStatus
} from '@client/views/SysAdmin/Team/utils'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { Button } from '@opencrvs/components/lib/Button'
import { getUserDetails } from '@client/profile/profileSelectors'
import {
  AddUser,
  VerticalThreeDots,
  SearchRed,
  NoWifi
} from '@opencrvs/components/lib/icons'
import { AvatarSmall } from '@client/components/Avatar'
import { ToggleMenu } from '@opencrvs/components/lib/ToggleMenu'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Toast } from '@opencrvs/components/lib/Toast'
import {
  BodyContent,
  Content,
  ContentSize
} from '@opencrvs/components/lib/Content'
import { ITheme } from '@opencrvs/components/lib/theme'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { parse } from 'query-string'
import * as React from 'react'
import {
  injectIntl,
  useIntl,
  WrappedComponentProps as IntlShapeProps
} from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import styled from 'styled-components'
import { UserAuditActionModal } from '@client/views/SysAdmin/Team/user/UserAuditActionModal'
import { userMutations } from '@client/user/mutations'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { useCallback } from 'react'
import {
  withOnlineStatus,
  LoadingIndicator
} from '@client/views/OfficeHome/LoadingIndicator'
import { LocationPicker } from '@client/components/LocationPicker'
import { Query as QueryType, User } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'
import { Link } from '@opencrvs/components'

const DEFAULT_FIELD_AGENT_LIST_SIZE = 10
const { useState } = React

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

const StatusBox = styled.div`
  padding: 4px 8px;
  ${({ theme }) => theme.fonts.bold12};
  border-radius: 100px;
  height: 30px;
  text-align: center;
  margin-left: 4px;
`
const ActiveStatusBox = styled(StatusBox)`
  background: rgba(73, 183, 141, 0.3);
`
const DeactivatedStatusBox = styled(StatusBox)`
  background: rgba(245, 209, 209, 1);
`
const PendingStatusBox = styled(StatusBox)`
  background: rgba(252, 236, 217, 1);
`
const DisabledStatusBox = styled(StatusBox)`
  background: rgba(206, 206, 206, 0.3);
`

const AddUserIcon = styled(AddUser)`
  cursor: pointer;
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

const StatusMenuContainer = styled.div`
  display: flex;
  align-items: center;
`

const Value = styled.span`
  color: ${({ theme }) => theme.colors.grey500};
  ${({ theme }) => theme.fonts.reg16}
`

const Name = styled.span`
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

interface ISearchParams {
  locationId: string
}

type IOnlineStatusProps = {
  isOnline: boolean
}

type BaseProps = {
  theme: ITheme
  offlineOffices: ILocation[]
  userDetails: UserDetails | null
  offlineCountryConfig: IOfflineData
  goToCreateNewUser: typeof goToCreateNewUser
  goToCreateNewUserWithLocationId: typeof goToCreateNewUserWithLocationId
  goToReviewUserDetails: typeof goToReviewUserDetails
  goToTeamSearch: typeof goToTeamSearch
  goToTeamUserList: typeof goToTeamUserList
  goToUserProfile: typeof goToUserProfile
}

type IProps = BaseProps &
  IntlShapeProps &
  RouteComponentProps &
  IOnlineStatusProps

interface IStatusProps {
  status: string
}

interface ToggleModal {
  modalVisible: boolean
  selectedUser: User | null
}

export const Status = (statusProps: IStatusProps) => {
  const status = statusProps.status
  const intl = useIntl()
  switch (status) {
    case UserStatus[UserStatus.ACTIVE].toLowerCase():
      return (
        <ActiveStatusBox>{intl.formatMessage(messages.active)}</ActiveStatusBox>
      )
    case UserStatus[UserStatus.DEACTIVATED].toLowerCase():
      return (
        <DeactivatedStatusBox>
          {intl.formatMessage(messages.deactivated)}
        </DeactivatedStatusBox>
      )
    case UserStatus[UserStatus.DISABLED].toLowerCase():
      return (
        <DisabledStatusBox>
          {intl.formatMessage(messages.disabled)}
        </DisabledStatusBox>
      )
    case UserStatus[UserStatus.PENDING].toLowerCase():
    default:
      return (
        <PendingStatusBox>
          {intl.formatMessage(messages.pending)}
        </PendingStatusBox>
      )
  }
}

function UserListComponent(props: IProps) {
  const [showResendSMSSuccess, setShowResendSMSSuccess] = useState(false)
  const [showUsernameSMSReminderSuccess, setShowUsernameSMSReminderSuccess] =
    useState(false)
  const [showResendSMSError, setShowResendSMSError] = useState(false)
  const [showUsernameSMSReminderError, setShowUsernameSMSReminderError] =
    useState(false)
  const [showResetPasswordSMSSuccess, setShowResetPasswordSMSSuccess] =
    useState(false)
  const [showResetPasswordSMSError, setResetPasswordSMSError] = useState(false)
  const {
    intl,
    userDetails,
    goToReviewUserDetails,
    goToCreateNewUser,
    goToCreateNewUserWithLocationId,
    goToTeamSearch,
    goToUserProfile,
    offlineOffices,
    isOnline,
    offlineCountryConfig,
    location: { search }
  } = props
  const isNatlSysAdmin = userDetails?.systemRole
    ? NATL_ADMIN_ROLES.includes(userDetails.systemRole)
      ? true
      : false
    : false

  const { locationId } = parse(search) as unknown as ISearchParams
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

  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1)
  const recordCount = DEFAULT_FIELD_AGENT_LIST_SIZE * currentPageNumber
  const searchedLocation: ILocation | undefined = offlineOffices.find(
    ({ id }) => locationId === id
  )

  const getAddressName = ({ name, partOf }: ILocation): string => {
    const parentLocationId = partOf.split('/')[1]
    if (parentLocationId === '0') return name
    const parentLocation = offlineCountryConfig.locations[parentLocationId]
    return `${name}, ${getAddressName(parentLocation)}`
  }

  const getParentLocation = ({ partOf }: ILocation) => {
    const parentLocationId = partOf.split('/')[1]
    return offlineCountryConfig.locations[parentLocationId]
  }

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

  const resendSMS = useCallback(
    async function resendSMS(userId: string) {
      try {
        const res = await userMutations.resendSMSInvite(userId, [
          {
            query: SEARCH_USERS,
            variables: { primaryOfficeId: locationId, count: recordCount }
          }
        ])
        if (res && res.data && res.data.resendSMSInvite) {
          setShowResendSMSSuccess(true)
        }
      } catch (err) {
        setShowResendSMSError(true)
      }
    },
    [locationId, recordCount]
  )

  const usernameSMSReminder = useCallback(
    async function usernameSMSReminder(userId: string) {
      try {
        const res = await userMutations.usernameSMSReminderSend(userId, [
          {
            query: SEARCH_USERS,
            variables: { primaryOfficeId: locationId, count: recordCount }
          }
        ])
        if (res && res.data && res.data.usernameSMSReminder) {
          setShowUsernameSMSReminderSuccess(true)
        }
      } catch (err) {
        setShowUsernameSMSReminderError(true)
      }
    },
    [locationId, recordCount]
  )

  const resetPassword = useCallback(
    async function resetPassword(userId: string) {
      try {
        const res = await userMutations.sendResetPasswordSMS(
          userId,
          offlineCountryConfig.config.APPLICATION_NAME,
          [
            {
              query: SEARCH_USERS,
              variables: { primaryOfficeId: locationId, count: recordCount }
            }
          ]
        )
        if (res && res.data && res.data.resetPasswordSMS) {
          setShowResetPasswordSMSSuccess(true)
        }
      } catch (err) {
        setResetPasswordSMSError(true)
      }
    },
    [recordCount, locationId, offlineCountryConfig.config.APPLICATION_NAME]
  )

  const getMenuItems = useCallback(
    function getMenuItems(user: User) {
      const menuItems = [
        {
          label: intl.formatMessage(messages.editUserDetailsTitle),
          handler: () => {
            goToReviewUserDetails(user.id as string)
          }
        }
      ]

      if (user.status === 'pending' || user.status === 'active') {
        menuItems.push(
          {
            label: intl.formatMessage(messages.sendUsernameReminderSMS),
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
          label: intl.formatMessage(messages.resendSMS),
          handler: () => {
            resendSMS(user.id as string)
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
      goToReviewUserDetails,
      intl,
      resendSMS,
      toggleUserActivationModal,
      toggleUsernameReminderModal,
      toggleUserResetPasswordModal
    ]
  )

  function getViewOnly(
    locationId: string,
    userDetails: UserDetails | null,
    onlyNational: boolean
  ) {
    if (
      userDetails &&
      userDetails.systemRole &&
      userDetails.primaryOffice &&
      SYS_ADMIN_ROLES.includes(userDetails.systemRole) &&
      locationId === userDetails.primaryOffice.id &&
      !onlyNational
    ) {
      return false
    } else if (
      userDetails &&
      userDetails.systemRole &&
      NATL_ADMIN_ROLES.includes(userDetails.systemRole)
    ) {
      return false
    } else {
      return true
    }
  }

  const getUserName = (user: User) => {
    const userName =
      (user &&
        user.name &&
        ((createNamesMap(user.name as GQLHumanName[])[intl.locale] as string) ||
          (createNamesMap(user.name as GQLHumanName[])[LANG_EN] as string))) ||
      ''
    return userName
  }

  const StatusMenu = useCallback(
    function StatusMenu({
      userDetails,
      locationId,
      user,
      index,
      status,
      underInvestigation
    }: {
      userDetails: UserDetails | null
      locationId: string
      user: User
      index: number
      status?: string
      underInvestigation?: boolean
    }) {
      const canEditUserDetails =
        userDetails?.systemRole === 'NATIONAL_SYSTEM_ADMIN' ||
        (userDetails?.systemRole === 'LOCAL_SYSTEM_ADMIN' &&
          userDetails?.primaryOffice?.id === locationId)
          ? true
          : false
      return (
        // TODO use Pill Component from #2780
        <StatusMenuContainer>
          {underInvestigation && <SearchRed />}
          <Status status={status || 'pending'} />
          {canEditUserDetails && (
            <ToggleMenu
              id={`user-item-${index}-menu`}
              toggleButton={<VerticalThreeDots />}
              menuItems={getMenuItems(user)}
            />
          )}
        </StatusMenuContainer>
      )
    },
    [getMenuItems]
  )

  const generateUserContents = useCallback(
    function generateUserContents(
      data: QueryType,
      locationId: string,
      userDetails: UserDetails | null
    ) {
      if (!data || !data.searchUsers || !data.searchUsers.results) {
        return []
      }

      return data.searchUsers.results.map(
        (user: User | null, index: number) => {
          if (user !== null) {
            const name =
              (user &&
                user.name &&
                ((createNamesMap(user.name as GQLHumanName[])[
                  intl.locale
                ] as string) ||
                  (createNamesMap(user.name as GQLHumanName[])[
                    LANG_EN
                  ] as string))) ||
              ''
            const role = intl.formatMessage({
              id: getUserRoleIntlKey(user.role._id)
            })
            const avatar = user.avatar

            return {
              image: <AvatarSmall name={name} avatar={avatar || undefined} />,
              label: (
                <Link
                  id="profile-link"
                  onClick={() => goToUserProfile(String(user.id))}
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
                  underInvestigation={user.underInvestigation || false}
                />
              )
            }
          }
          return {
            label: '',
            value: <></>
          }
        }
      )
    },
    [StatusMenu, intl, goToUserProfile]
  )

  const onClickAddUser = useCallback(
    function onClickAddUser() {
      ;(searchedLocation &&
        goToCreateNewUserWithLocationId(searchedLocation.id)) ||
        goToCreateNewUser()
    },
    [goToCreateNewUser, goToCreateNewUserWithLocationId, searchedLocation]
  )

  function onChangeLocation() {
    goToTeamSearch(
      searchedLocation && {
        selectedLocation: {
          id: searchedLocation.id,
          searchableText: searchedLocation.name,
          displayLabel: searchedLocation.name
        }
      }
    )
  }

  const LocationButton = (
    locationId: string,
    userDetails: UserDetails | null,
    onlyNational: boolean
  ) => {
    const buttons: React.ReactElement[] = []
    if (!getViewOnly(locationId, userDetails, onlyNational)) {
      buttons.push(
        <LocationPicker
          selectedLocationId={locationId}
          onChangeLocation={(locationId) => {
            props.goToTeamUserList(locationId)
          }}
          requiredLocationTypes={'CRVS_OFFICE'}
        />
      )
      buttons.push(<AddUserIcon id="add-user" onClick={onClickAddUser} />)
    }
    return buttons
  }

  const RenderUserList = useCallback(
    function RenderUserList({
      data,
      locationId,
      userDetails
    }: {
      data: any
      locationId: string
      userDetails: UserDetails | null
    }) {
      const totalData =
        (data && data.searchUsers && data.searchUsers.totalItems) || 0
      const userContent = generateUserContents(data, locationId, userDetails)

      return (
        <>
          <UserTable id="user_list">
            <ListViewSimplified>
              {userContent.length <= 0 ? (
                <NoRecord id="no-record">
                  {intl.formatMessage(constantsMessages.noResults)}
                </NoRecord>
              ) : (
                userContent.map((content, index) => {
                  return (
                    <ListViewItemSimplified
                      key={index}
                      image={content.image}
                      label={content.label}
                      value={content.value}
                      actions={content.actions}
                    />
                  )
                })
              )}
            </ListViewSimplified>
            {totalData > DEFAULT_FIELD_AGENT_LIST_SIZE && (
              <Pagination
                currentPage={currentPageNumber}
                totalPages={Math.ceil(
                  totalData / DEFAULT_FIELD_AGENT_LIST_SIZE
                )}
                onPageChange={(currentPage: number) =>
                  setCurrentPageNumber(currentPage)
                }
              />
            )}
            <UserAuditActionModal
              show={toggleActivation.modalVisible}
              user={toggleActivation.selectedUser}
              onClose={() => toggleUserActivationModal()}
              onConfirmRefetchQueries={[
                {
                  query: SEARCH_USERS,
                  variables: {
                    primaryOfficeId: locationId,
                    count: recordCount
                  }
                }
              ]}
            />

            <ResponsiveModal
              id="username-reminder-modal"
              show={toggleUsernameReminder.modalVisible}
              handleClose={() => toggleUsernameReminderModal()}
              title={intl.formatMessage(
                messages.sendUsernameReminderSMSModalTitle
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
                      usernameSMSReminder(
                        toggleUsernameReminder.selectedUser.id
                      )
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
                messages.sendUsernameReminderSMSModalMessage,
                { phoneNumber: toggleUsernameReminder.selectedUser?.mobile }
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
                phoneNumber: toggleResetPassword.selectedUser?.mobile ?? ''
              })}
            </ResponsiveModal>
          </UserTable>
        </>
      )
    },
    [
      currentPageNumber,
      generateUserContents,
      intl,
      recordCount,
      toggleActivation.modalVisible,
      toggleActivation.selectedUser,
      toggleUserActivationModal,
      toggleUsernameReminder.modalVisible,
      toggleUsernameReminder.selectedUser,
      toggleUsernameReminderModal,
      usernameSMSReminder,
      resetPassword,
      toggleResetPassword.modalVisible,
      toggleResetPassword.selectedUser,
      toggleUserResetPasswordModal
    ]
  )

  return (
    <SysAdminContentWrapper
      changeTeamLocation={
        (!getViewOnly(locationId, userDetails, true) && onChangeLocation) ||
        undefined
      }
      isCertificatesConfigPage={true}
      hideBackground={true}
    >
      {isOnline ? (
        <Query
          query={SEARCH_USERS}
          variables={{
            primaryOfficeId: locationId,
            count: DEFAULT_FIELD_AGENT_LIST_SIZE,
            skip: (currentPageNumber - 1) * DEFAULT_FIELD_AGENT_LIST_SIZE
          }}
          fetchPolicy={'cache-and-network'}
        >
          {({ data, loading, error }) => {
            return (
              <Content
                title={
                  !loading && !error
                    ? searchedLocation?.name || ''
                    : intl.formatMessage(headerMessages.teamTitle)
                }
                size={ContentSize.LARGE}
                topActionButtons={LocationButton(
                  locationId,
                  userDetails,
                  isNatlSysAdmin
                )}
              >
                {error ? (
                  <ErrorText id="user_loading_error">
                    <>{intl.formatMessage(errorMessages.userQueryError)}</>
                    <LinkButtonModified
                      onClick={() => window.location.reload()}
                    >
                      {intl.formatMessage(constantsMessages.refresh)}
                    </LinkButtonModified>
                  </ErrorText>
                ) : loading ? (
                  <Loading>
                    <LoadingIndicator loading={true} />
                  </Loading>
                ) : (
                  <>
                    <Header id="header">
                      {(searchedLocation && searchedLocation.name) || ''}
                    </Header>
                    <LocationInfo>
                      {searchedLocation && (
                        <LocationInfoValue>
                          {getAddressName(getParentLocation(searchedLocation))}
                        </LocationInfoValue>
                      )}
                    </LocationInfo>
                    <RenderUserList
                      data={data}
                      locationId={locationId}
                      userDetails={userDetails}
                    />
                  </>
                )}
              </Content>
            )
          }}
        </Query>
      ) : (
        <Content
          title={intl.formatMessage(headerMessages.teamTitle)}
          size={ContentSize.LARGE}
        >
          <ConnectivityContainer>
            <NoConnectivity />
            <Text id="no-connection-text">
              {intl.formatMessage(constantsMessages.noConnection)}
            </Text>
          </ConnectivityContainer>
        </Content>
      )}

      {showResendSMSSuccess && (
        <Toast
          id="resend_invite_success"
          type="success"
          onClose={() => setShowResendSMSSuccess(false)}
        >
          {intl.formatMessage(messages.resendSMSSuccess)}
        </Toast>
      )}
      {showResendSMSError && (
        <Toast
          id="resend_invite_error"
          type="warning"
          onClose={() => setShowResendSMSError(false)}
        >
          {intl.formatMessage(messages.resendSMSError)}
        </Toast>
      )}

      {showUsernameSMSReminderSuccess && (
        <Toast
          id="username_reminder_success"
          type="success"
          onClose={() => setShowUsernameSMSReminderSuccess(false)}
        >
          {intl.formatMessage(messages.sendUsernameReminderSMSSuccess, {
            name: getUserName(toggleUsernameReminder.selectedUser as User)
          })}
        </Toast>
      )}
      {showUsernameSMSReminderError && (
        <Toast
          id="username_reminder_error"
          type="warning"
          onClose={() => setShowUsernameSMSReminderError(false)}
        >
          {intl.formatMessage(messages.sendUsernameReminderSMSError)}
        </Toast>
      )}

      {showResetPasswordSMSSuccess && (
        <Toast
          id="reset_password_success"
          type="success"
          onClose={() => {
            setShowResetPasswordSMSSuccess(false)
            setToggleResetPassword({
              ...toggleResetPassword,
              selectedUser: null
            })
          }}
        >
          {intl.formatMessage(messages.resetPasswordSMSSuccess, {
            username: getUserName(toggleResetPassword.selectedUser as User)
          })}
        </Toast>
      )}
      {showResetPasswordSMSError && (
        <Toast
          id="reset_password_error"
          type="warning"
          onClose={() => setResetPasswordSMSError(false)}
        >
          {intl.formatMessage(messages.resetPasswordSMSError)}
        </Toast>
      )}
    </SysAdminContentWrapper>
  )
}

export const UserList = connect(
  (state: IStoreState) => ({
    offlineOffices: Object.values(getOfflineData(state).offices),
    userDetails: getUserDetails(state),
    offlineCountryConfig: getOfflineData(state)
  }),
  {
    goToCreateNewUser,
    goToCreateNewUserWithLocationId,
    goToReviewUserDetails,
    goToTeamSearch,
    goToUserProfile,
    goToTeamUserList
  }
)(withTheme(injectIntl(withOnlineStatus(UserListComponent))))
