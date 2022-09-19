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

import React, { useCallback, useState } from 'react'
import { Header } from '@client/components/Header/Header'
import { messages as userFormMessages } from '@client/i18n/messages/views/userForm'
import { userMessages as messages } from '@client/i18n/messages'
import { Navigation } from '@client/components/interface/Navigation'
import { Frame } from '@opencrvs/components/lib/Frame'
import { useIntl } from 'react-intl'
import { Query } from '@client/components/Query'
import { useParams } from 'react-router'
import { GET_USER } from '@client/user/queries'
import { GQLUser, GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { createNamesMap } from '@client/utils/data-formatting'
import { AvatarSmall } from '@client/components/Avatar'
import styled from 'styled-components'
import { ToggleMenu } from '@opencrvs/components/lib/ToggleMenu'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { getUserRole, getUserType } from '@client/views/SysAdmin//Team/utils'
import { EMPTY_STRING, LANG_EN } from '@client/utils/constants'
import { Loader } from '@opencrvs/components/lib/Loader'
import { getJurisdictionLocationIdFromUserDetails } from '@client/views/SysAdmin/Performance/utils'
import { IUserDetails } from '@client/utils/userUtils'
import { messages as userSetupMessages } from '@client/i18n/messages/views/userSetup'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { useDispatch, useSelector } from 'react-redux'
import { goToReviewUserDetails, goToTeamUserList } from '@client/navigation'
import { Status } from '@client/views/SysAdmin/Team/user/UserList'
import { VerticalThreeDots } from '@client/../../components/lib/icons'
import { IStoreState } from '@client/store'
import { getScope } from '@client/profile/profileSelectors'
import { messages as sysMessages } from '@client/i18n/messages/views/sysAdmin'
import { userMutations } from '@client/user/mutations'
import { UserAuditActionModal } from '@client/views/SysAdmin/Team/user/UserAuditActionModal'
import {
  Toast,
  NOTIFICATION_TYPE as FLOATING_NOTIFICATION_TYPE
} from '@opencrvs/components/lib/Toast'
import { UserAuditList } from '@client/views/SysAdmin/Team/user/userProfilie/UserAuditList'

const ContentWrapper = styled.div`
  margin: 40px auto 0;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 0px auto 0;
  }
  color: ${({ theme }) => theme.colors.copy};
`

const UserAvatar = styled(AvatarSmall)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const InformationHolder = styled.div`
  display: flex;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column;
  }
  margin-bottom: 14px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-bottom: 16px;
  }
`

export const InformationTitle = styled.div`
  ${({ theme }) => theme.fonts.bold16};
  width: 320px;
`
const InformationValue = styled.div`
  ${({ theme }) => theme.fonts.reg16};
`

const LinkButtonWithoutSpacing = styled(LinkButton)`
  height: auto !important;
`
interface IRouteProps {
  userId: string
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
  const toggleUserActivationModal = () => {
    setModalVisible(!modalVisible)
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

  const getMenuItems = (userId: string, status: string) => {
    const menuItems: { label: string; handler: () => void }[] = [
      {
        label: intl.formatMessage(sysMessages.editUserDetailsTitle),
        handler: () => dispatch(goToReviewUserDetails(userId))
      }
    ]

    if (status !== 'deactivated' && status !== 'disabled') {
      menuItems.push({
        label: intl.formatMessage(sysMessages.resendSMS),
        handler: () => {
          resendSMS(userId)
        }
      })
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
    return menuItems
  }

  const transformUserQueryResult = (userData?: GQLUser) => {
    if (!userData) {
      return {}
    }

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
      name: createNamesMap(userData.name as GQLHumanName[])[locale],
      role: userData.role,
      type: userData.type,
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
        getJurisdictionLocationIdFromUserDetails(userData as IUserDetails) ||
        '0',
      avatar: userData.avatar,
      device: userData.device
    }
  }

  return (
    <Frame
      header={<Header title={intl.formatMessage(messages.profileTitle)} />}
      navigation={<Navigation />}
    >
      <Query
        query={GET_USER}
        variables={{
          userId: userId
        }}
        fetchPolicy={'cache-and-network'}
      >
        {({ data, loading, error }) => {
          if (loading) {
            return <Loader id="user_loader" marginPercent={35} />
          } else {
            const user = transformUserQueryResult(data && data.getUser)
            const userRole = getUserRole(user, intl)
            const userType = getUserType(user, intl)
            return (
              <Content
                title={user.name}
                showTitleOnMobile={true}
                icon={() => (
                  <UserAvatar name={user.name} avatar={user.avatar} />
                )}
                topActionButtons={[
                  <Status status={user.status || 'pending'} />,

                  <ToggleMenu
                    id={`sub-page-header-munu-button`}
                    toggleButton={<VerticalThreeDots />}
                    menuItems={getMenuItems(
                      user.id as string,
                      user.status as string
                    )}
                    hide={(scope && !scope.includes('sysadmin')) || false}
                  />
                ]}
                size={ContentSize.LARGE}
              >
                <ContentWrapper>
                  <InformationHolder>
                    <InformationTitle>
                      {intl.formatMessage(userSetupMessages.assignedOffice)}
                    </InformationTitle>
                    <InformationValue>
                      <LinkButtonWithoutSpacing
                        id="office-link"
                        onClick={() =>
                          dispatch(goToTeamUserList(user.primaryOffice!.id))
                        }
                      >
                        {user.primaryOffice && user.primaryOffice.displayLabel}
                      </LinkButtonWithoutSpacing>
                    </InformationValue>
                  </InformationHolder>
                  <InformationHolder>
                    <InformationTitle>
                      {(userType &&
                        intl.formatMessage(userSetupMessages.roleType)) ||
                        intl.formatMessage(userFormMessages.labelRole)}
                    </InformationTitle>
                    <InformationValue>
                      {(userType && `${userRole} / ${userType}`) || userRole}
                    </InformationValue>
                  </InformationHolder>
                  <InformationHolder>
                    <InformationTitle>
                      {intl.formatMessage(userSetupMessages.phoneNumber)}
                    </InformationTitle>
                    <InformationValue>{user.number}</InformationValue>
                  </InformationHolder>
                  <InformationHolder>
                    <InformationTitle>
                      {intl.formatMessage(userSetupMessages.nid)}
                    </InformationTitle>
                    <InformationValue>{user.nid}</InformationValue>
                  </InformationHolder>
                  <InformationHolder>
                    <InformationTitle>
                      {intl.formatMessage(userSetupMessages.userName)}
                    </InformationTitle>
                    <InformationValue>{user.username}</InformationValue>
                  </InformationHolder>
                  <InformationHolder>
                    <InformationTitle>
                      {intl.formatMessage(userFormMessages.userDevice)}
                    </InformationTitle>
                    <InformationValue>{user.device}</InformationValue>
                  </InformationHolder>

                  <UserAuditActionModal
                    show={modalVisible}
                    user={data && data.getUser}
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
                  {showResendSMSSuccess && (
                    <Toast
                      id="resend_invite_success"
                      type={FLOATING_NOTIFICATION_TYPE.SUCCESS}
                      show={showResendSMSSuccess}
                      callback={() => setShowResendSMSSuccess(false)}
                    >
                      {intl.formatMessage(sysMessages.resendSMSSuccess)}
                    </Toast>
                  )}
                  {showResendSMSError && (
                    <Toast
                      id="resend_invite_error"
                      type={FLOATING_NOTIFICATION_TYPE.ERROR}
                      show={showResendSMSError}
                      callback={() => setShowResendSMSError(false)}
                    >
                      {intl.formatMessage(sysMessages.resendSMSError)}
                    </Toast>
                  )}
                  <UserAuditList user={user} />
                </ContentWrapper>
              </Content>
            )
          }
        }}
      </Query>
    </Frame>
  )
}
