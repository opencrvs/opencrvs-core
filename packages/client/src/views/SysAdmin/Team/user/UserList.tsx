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
import {
  goToCreateNewUser,
  goToCreateNewUserWithLocationId,
  goToReviewUserDetails,
  goToTeamSearch
} from '@client/navigation'
import { ILocation } from '@client/offline/reducer'
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
import { UserStatus } from '@client/views/SysAdmin/Team/utils'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { IUserDetails } from '@client/utils/userUtils'
import { getUserDetails } from '@client/profile/profileSelectors'
import {
  AddUser,
  VerticalThreeDots,
  SearchRed,
  NoWifi
} from '@opencrvs/components/lib/icons'
import { AvatarSmall } from '@client/components/Avatar'
import {
  ToggleMenu,
  FloatingNotification,
  NOTIFICATION_TYPE
} from '@opencrvs/components/lib/interface'
import { BodyContent } from '@opencrvs/components/lib/layout'
import { ITheme } from '@opencrvs/components/lib/theme'
import {
  GQLHumanName,
  GQLQuery,
  GQLUser
} from '@opencrvs/gateway/src/graphql/schema'
import { parse } from 'query-string'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import styled from 'styled-components'
import { UserAuditActionModal } from '@client/views/SysAdmin/Team/user/UserAuditActionModal'
import { userMutations } from '@client/user/mutations'
import { PaginationModified } from '@opencrvs/components/lib/interface/PaginationModified'
import {
  PaginationWrapper,
  MobileWrapper,
  DesktopWrapper
} from '@opencrvs/components/lib/styleForPagination'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import { useCallback } from 'react'
import { withOnlineStatus } from '@client/views/OfficeHome/LoadingIndicator'

const DEFAULT_FIELD_AGENT_LIST_SIZE = 10
const { useState } = React

const UserTable = styled(BodyContent)`
  padding: 0px;
  margin: 32px auto 0;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0px;
  }
`

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 18px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bold16};
  border-bottom: 1px solid ${({ theme }) => theme.colors.silverSand};
`
const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors};
  ${({ theme }) => theme.fonts.reg16};
  text-align: center;
  margin-top: 100px;
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
const AddUserContainer = styled.div`
  display: flex;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const AddUserIcon = styled(AddUser)`
  padding: 4px;
`

const Header = styled.h1`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.h1};
`

const HeaderContainer = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  margin-top: -32px;

  & > :first-child {
    margin-right: 24px;
  }

  & > :nth-child(2) {
    position: relative;
    bottom: 2px;
  }
`

const LocationInfo = styled.div`
  padding: 8px 0px;
`

const LocationInfoKey = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bold16};
`

const LocationInfoValue = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.reg16};
`

const LocationInfoEmptyValue = styled.div`
  color: ${({ theme }) => theme.colors.supportingCopy};
  ${({ theme }) => theme.fonts.reg16};
`

const ChangeButton = styled(LinkButton)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
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

const ListViewContainer = styled.div`
  margin-top: 24px;
`

const NoRecord = styled.div<{ isFullPage?: boolean }>`
  ${({ theme }) => theme.fonts.h3};
  text-align: left;
  margin-left: ${({ isFullPage }) => (isFullPage ? `40px` : `10px`)};
  color: ${({ theme }) => theme.colors.copy};
  margin-top: 20px;
`

const ConnectivityContainer = styled.div`
  justify-content: center;
  gap: 8px;
  display: flex;
  margin-top: 5vh;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-top: 12px;
  }
`
const NoConnectivity = styled(NoWifi)`
  width: 24px;
`
const Text = styled.div`
  ${({ theme }) => theme.fonts.reg16};
  text-align: center;
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
  userDetails: IUserDetails | null
  goToCreateNewUser: typeof goToCreateNewUser
  goToCreateNewUserWithLocationId: typeof goToCreateNewUserWithLocationId
  goToReviewUserDetails: typeof goToReviewUserDetails
  goToTeamSearch: typeof goToTeamSearch
}

type IProps = BaseProps &
  IntlShapeProps &
  RouteComponentProps &
  IOnlineStatusProps

interface IStatusProps {
  status: string
}

interface ToggleUserActivation {
  modalVisible: boolean
  selectedUser: GQLUser | null
}

export const Status = (statusProps: IStatusProps) => {
  const status =
    statusProps.status.charAt(0).toUpperCase() + statusProps.status.slice(1)
  switch (status.toLowerCase()) {
    case UserStatus[UserStatus.ACTIVE].toLowerCase():
      return <ActiveStatusBox>{status}</ActiveStatusBox>
    case UserStatus[UserStatus.DEACTIVATED].toLowerCase():
      return <DeactivatedStatusBox>{status}</DeactivatedStatusBox>
    case UserStatus[UserStatus.DISABLED].toLowerCase():
      return <DisabledStatusBox>{status}</DisabledStatusBox>
    case UserStatus[UserStatus.PENDING].toLowerCase():
    default:
      return <PendingStatusBox>{status}</PendingStatusBox>
  }
}

function UserListComponent(props: IProps) {
  const [showResendSMSSuccess, setShowResendSMSSuccess] =
    useState<boolean>(false)
  const [showResendSMSError, setShowResendSMSError] = useState<boolean>(false)

  const {
    intl,
    userDetails,
    goToReviewUserDetails,
    goToCreateNewUser,
    goToCreateNewUserWithLocationId,
    goToTeamSearch,
    offlineOffices,
    isOnline,
    location: { search }
  } = props

  const { locationId } = parse(search) as unknown as ISearchParams
  const [toggleActivation, setToggleActivation] =
    useState<ToggleUserActivation>({
      modalVisible: false,
      selectedUser: null
    })

  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1)
  const recordCount = DEFAULT_FIELD_AGENT_LIST_SIZE * currentPageNumber
  const searchedLocation: ILocation | undefined = offlineOffices.find(
    ({ id }) => locationId === id
  )

  const toggleUserActivationModal = useCallback(
    function toggleUserActivationModal(user?: GQLUser) {
      if (user !== undefined) {
        setToggleActivation({
          ...toggleActivation,
          modalVisible: true,
          selectedUser: user
        })
      } else {
        setToggleActivation({
          ...toggleActivation,
          modalVisible: false,
          selectedUser: null
        })
      }
    },
    [toggleActivation]
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

  const getMenuItems = useCallback(
    function getMenuItems(user: GQLUser) {
      const menuItems = [
        {
          label: intl.formatMessage(messages.editUserDetailsTitle),
          handler: () => {
            goToReviewUserDetails(user.id as string)
          }
        }
      ]

      if (user.status !== 'deactivated' && user.status !== 'disabled') {
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
    [goToReviewUserDetails, intl, resendSMS, toggleUserActivationModal]
  )

  function getViewOnly(
    locationId: string,
    userDetails: IUserDetails | null,
    onlyNational: boolean
  ) {
    if (
      userDetails &&
      userDetails.role &&
      userDetails.primaryOffice &&
      SYS_ADMIN_ROLES.includes(userDetails.role) &&
      locationId === userDetails.primaryOffice.id &&
      !onlyNational
    ) {
      return false
    } else if (
      userDetails &&
      userDetails.role &&
      NATL_ADMIN_ROLES.includes(userDetails.role)
    ) {
      return false
    } else {
      return true
    }
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
      userDetails: IUserDetails | null
      locationId: string
      user: GQLUser
      index: number
      status?: string
      underInvestigation?: boolean
    }) {
      const canEditUserDetails =
        userDetails?.role === 'NATIONAL_SYSTEM_ADMIN' ||
        (userDetails?.role === 'LOCAL_SYSTEM_ADMIN' &&
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
      data: GQLQuery,
      locationId: string,
      userDetails: IUserDetails | null
    ) {
      if (!data || !data.searchUsers || !data.searchUsers.results) {
        return []
      }

      return data.searchUsers.results.map(
        (user: GQLUser | null, index: number) => {
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
            const role =
              (user.role && intl.formatMessage(userMessages[user.role])) || '-'

            const avatar = user.avatar

            return {
              image: <AvatarSmall name={name} avatar={avatar} />,
              label: <Name>{name}</Name>,
              value: <Value>{role}</Value>,
              actions: (
                <StatusMenu
                  userDetails={userDetails}
                  locationId={locationId}
                  user={user}
                  index={index}
                  status={user.status}
                  underInvestigation={user.underInvestigation}
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
    [StatusMenu, intl]
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

  const RenderUserList = useCallback(
    function RenderUserList({
      locationId,
      userDetails
    }: {
      locationId: string
      userDetails: IUserDetails | null
    }) {
      return (
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
            if (error) {
              return (
                <ErrorText id="user_loading_error">
                  {intl.formatMessage(errorMessages.userQueryError)}
                </ErrorText>
              )
            }
            const totalData =
              (data && data.searchUsers && data.searchUsers.totalItems) || 0
            const userContent = generateUserContents(
              data,
              locationId,
              userDetails
            )
            return (
              <UserTable id="user_list">
                <TableHeader>
                  {(data && data.searchUsers && data.searchUsers.totalItems) ||
                    0}{' '}
                  users
                  {!getViewOnly(locationId, userDetails, false) && (
                    <AddUserContainer id="add-user" onClick={onClickAddUser}>
                      <AddUserIcon />
                      {' New user'}
                    </AddUserContainer>
                  )}
                </TableHeader>
                <ListViewContainer>
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
                </ListViewContainer>
                {totalData > DEFAULT_FIELD_AGENT_LIST_SIZE && (
                  <PaginationWrapper>
                    <DesktopWrapper>
                      <PaginationModified
                        size={'small'}
                        initialPage={currentPageNumber}
                        totalPages={Math.ceil(
                          totalData / DEFAULT_FIELD_AGENT_LIST_SIZE
                        )}
                        onPageChange={(currentPage: number) =>
                          setCurrentPageNumber(currentPage)
                        }
                      />
                    </DesktopWrapper>
                    <MobileWrapper>
                      <PaginationModified
                        size={'large'}
                        initialPage={currentPageNumber}
                        totalPages={Math.ceil(
                          totalData / DEFAULT_FIELD_AGENT_LIST_SIZE
                        )}
                        onPageChange={(currentPage: number) =>
                          setCurrentPageNumber(currentPage)
                        }
                      />
                    </MobileWrapper>
                  </PaginationWrapper>
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
              </UserTable>
            )
          }}
        </Query>
      )
    },
    [
      currentPageNumber,
      generateUserContents,
      intl,
      onClickAddUser,
      recordCount,
      toggleActivation.modalVisible,
      toggleActivation.selectedUser,
      toggleUserActivationModal
    ]
  )

  return (
    <SysAdminContentWrapper
      mapPinClickHandler={
        (!getViewOnly(locationId, userDetails, true) && onChangeLocation) ||
        undefined
      }
    >
      {isOnline ? (
        <>
          <HeaderContainer>
            <Header id="header">
              {(searchedLocation && searchedLocation.name) || ''}
            </Header>
            {!getViewOnly(locationId, userDetails, true) && (
              <ChangeButton id="chng-loc" onClick={onChangeLocation}>
                {intl.formatMessage(buttonMessages.change)}
              </ChangeButton>
            )}
          </HeaderContainer>
          <LocationInfo>
            <LocationInfoKey>
              {intl.formatMessage(constantsMessages.address)}
            </LocationInfoKey>
            {searchedLocation && searchedLocation.address ? (
              <LocationInfoValue>{searchedLocation.address}</LocationInfoValue>
            ) : (
              <LocationInfoEmptyValue>
                {intl.formatMessage(constantsMessages.notAvailable)}
              </LocationInfoEmptyValue>
            )}
          </LocationInfo>
          <RenderUserList locationId={locationId} userDetails={userDetails} />
        </>
      ) : (
        <ConnectivityContainer>
          <NoConnectivity />
          <Text id="no-connection-text">
            {intl.formatMessage(constantsMessages.noConnection)}
          </Text>
        </ConnectivityContainer>
      )}

      {showResendSMSSuccess && (
        <FloatingNotification
          id="resend_invite_success"
          type={NOTIFICATION_TYPE.SUCCESS}
          show={showResendSMSSuccess}
          callback={() => setShowResendSMSSuccess(false)}
        >
          {intl.formatMessage(messages.resendSMSSuccess)}
        </FloatingNotification>
      )}
      {showResendSMSError && (
        <FloatingNotification
          id="resend_invite_error"
          type={NOTIFICATION_TYPE.ERROR}
          show={showResendSMSError}
          callback={() => setShowResendSMSError(false)}
        >
          {intl.formatMessage(messages.resendSMSError)}
        </FloatingNotification>
      )}
    </SysAdminContentWrapper>
  )
}

export const UserList = connect(
  (state: IStoreState) => ({
    offlineOffices: Object.values(getOfflineData(state).offices),
    userDetails: getUserDetails(state)
  }),
  {
    goToCreateNewUser,
    goToCreateNewUserWithLocationId,
    goToReviewUserDetails,
    goToTeamSearch
  }
)(withTheme(injectIntl(withOnlineStatus(UserListComponent))))
