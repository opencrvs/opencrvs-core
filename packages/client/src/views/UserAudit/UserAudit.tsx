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

import React from 'react'
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
import format from '@client/utils/date-formatting'
import { AvatarSmall } from '@client/components/Avatar'
import styled from 'styled-components'
import { Loader, LoadingGrey } from '@client/../../components/lib'
import { getUserRole, getUserType } from '@client/views/SysAdmin//Team/utils'
import { LANG_EN } from '@client/utils/constants'
import { getJurisdictionLocationIdFromUserDetails } from '@client/views/SysAdmin/Performance/utils'
import { IUserDetails } from '@client/utils/userUtils'
import { messages as userSetupMessages } from '@client/i18n/messages/views/userSetup'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'

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

const LoadingTitle = styled.span<{ width: number; marginRight: number }>`
  background: ${({ theme }) => theme.colors.background};
  display: inline-block;
  height: 24px;
  width: ${({ width }) => `${width}px`};
  margin-right: ${({ marginRight }) => `${marginRight}px`};
`

const LoadingValue = styled(LoadingGrey)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`
const HeaderMenuHolder = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > :not(:last-child) {
    margin: auto 8px;
  }
`
interface IRouteProps {
  userId: string
}

export const UserAudit = () => {
  const intl = useIntl()
  const { userId } = useParams<IRouteProps>()

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
      practitionerId: userData.practitionerId,
      locationId:
        getJurisdictionLocationIdFromUserDetails(userData as IUserDetails) ||
        '0',
      startDate: userData.creationDate
        ? Number.isNaN(Number(userData.creationDate))
          ? format(new Date(userData.creationDate), 'MMMM dd, yyyy')
          : format(new Date(Number(userData.creationDate)), 'MMMM dd, yyyy')
        : '',
      avatar: userData.avatar
    }
  }

  return (
    <Frame
      header={<Header title={intl.formatMessage(messages.settingsTitle)} />}
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
                // titleColor={declaration.name ? 'copy' : 'grey600'}
                icon={() => (
                  <UserAvatar name={user.name} avatar={user.avatar} />
                )}
                size={ContentSize.LARGE}
              >
                <ContentWrapper>
                  <InformationHolder>
                    <InformationTitle>
                      {intl.formatMessage(userSetupMessages.assignedOffice)}
                    </InformationTitle>
                    <InformationValue>
                      {user.primaryOffice && user.primaryOffice.displayLabel}
                    </InformationValue>
                  </InformationHolder>
                  <InformationHolder>
                    <InformationTitle>
                      {(userType &&
                        intl.formatMessage(userSetupMessages.roleType)) ||
                        intl.formatMessage(userFormMessages.type)}
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
                      {intl.formatMessage(userSetupMessages.userName)}
                    </InformationTitle>
                    <InformationValue>{user.username}</InformationValue>
                  </InformationHolder>
                  <InformationHolder>
                    <InformationTitle>
                      {intl.formatMessage(userSetupMessages.startDate)}
                    </InformationTitle>
                    <InformationValue>{user.startDate}</InformationValue>
                  </InformationHolder>
                  {/* <UserAuditActionModal
                        show={this.state.modalVisible}
                        user={data && data.getUser}
                        onClose={() => this.toggleUserActivationModal()}
                        onConfirmRefetchQueries={[
                          {
                            query: GET_USER,
                            variables: {
                              userId: match.params.userId
                            }
                          }
                        ]}
                      />
                      {showResendSMSSuccess && (
                        <Toast
                          id="resend_invite_success"
                          type={FLOATING_NOTIFICATION_TYPE.SUCCESS}
                          show={showResendSMSSuccess}
                          callback={() =>
                            this.setState({ showResendSMSSuccess: false })
                          }
                        >
                          {intl.formatMessage(sysMessages.resendSMSSuccess)}
                        </Toast>
                      )}
                      {showResendSMSError && (
                        <Toast
                          id="resend_invite_error"
                          type={FLOATING_NOTIFICATION_TYPE.ERROR}
                          show={showResendSMSError}
                          callback={() =>
                            this.setState({ showResendSMSError: false })
                          }
                        >
                          {intl.formatMessage(sysMessages.resendSMSError)}
                        </Toast>
                      )}
                      <UserAuditList user={user} /> */}
                </ContentWrapper>
              </Content>
            )
          }
        }}
      </Query>
    </Frame>
  )
}
