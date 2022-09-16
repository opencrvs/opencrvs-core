import React from 'react'
import { Header } from '@client/components/Header/Header'
import { messages as userFormMessages } from '@client/i18n/messages/views/userForm'
import { ListViewSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import { userMessages as messages } from '@client/i18n/messages'
import { Navigation } from '@client/components/interface/Navigation'
import { Content } from '@opencrvs/components/lib/Content'
import { Frame } from '@opencrvs/components/lib/Frame'
import { useIntl } from 'react-intl'
import { UserList } from '../SysAdmin/Team/user/UserList'
import { Query } from '@client/components/Query'
import { RouteComponentProps, useParams } from 'react-router'
import { GET_USER } from '@client/user/queries'
import {
  SysAdminContentWrapper,
  SysAdminPageVariant
} from '@client/views/SysAdmin/SysAdminContentWrapper'
import { GQLUser, GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { createNamesMap } from '@client/utils/data-formatting'
import { SearchRed, VerticalThreeDots } from '@opencrvs/components/lib/icons'
import { Avatar } from '@client/components/Avatar'
import styled from 'styled-components'
import { LoadingGrey } from '@client/../../components/lib'
import { LinkButton } from '@client/../../components/lib/buttons'
import { getUserRole, getUserType } from '@client/views/SysAdmin//Team/utils'
import { IUserData } from '../SysAdmin/Team/user/userProfilie/UserProfile'
import { LANG_EN } from '@client/utils/constants'
import { getJurisdictionLocationIdFromUserDetails } from '../SysAdmin/Performance/utils'
import { IUserDetails } from '@client/utils/userUtils'
import format from '@client/utils/date-formatting'

const ContentWrapper = styled.div`
  margin: 40px auto 0;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 0px auto 0;
  }
  color: ${({ theme }) => theme.colors.copy};
`

const UserAvatar = styled(Avatar)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const NameHolder = styled.div`
  ${({ theme }) => theme.fonts.h1};
  margin: 20px auto 30px;
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
const LinkButtonWithoutSpacing = styled(LinkButton)`
  & > * {
    padding: 0;
  }
  height: auto !important;
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
      <Content
        title={intl.formatMessage(messages.settingsTitle)}
        showTitleOnMobile={true}
      >
        <Query
          query={GET_USER}
          variables={{
            userId: userId
          }}
          // fetchPolicy={'cache-and-network'}
        >
          {({ data, loading, error }) => {
            console.log(data)
            console.log(error)
            if (data) {
              const user = transformUserQueryResult(data && data.getUser)
              console.log(user, 'USER')
              const userRole = getUserRole(user, intl)
              const userType = getUserType(user, intl)

              return (
                <ContentWrapper>
                  <UserAvatar name={user.name} avatar={user.avatar} />
                  <NameHolder>{user.name}</NameHolder>
                  {/* <InformationHolder>
                        <InformationTitle>
                          {intl.formatMessage(messages.assignedOffice)}
                        </InformationTitle>
                        <InformationValue>
                          <LinkButtonWithoutSpacing
                            id="office-link"
                            onClick={() =>
                              this.props.goToTeamUserList(user.primaryOffice!.id)
                            }
                          >
                            {user.primaryOffice &&
                              user.primaryOffice.displayLabel}
                          </LinkButtonWithoutSpacing>
                        </InformationValue>
                      </InformationHolder> */}
                  <InformationHolder>
                    <InformationTitle>
                      {(userType && intl.formatMessage(messages.roleType)) ||
                        intl.formatMessage(userFormMessages.type)}
                    </InformationTitle>
                    <InformationValue>
                      {(userType && `${userRole} / ${userType}`) || userRole}
                    </InformationValue>
                  </InformationHolder>
                  <InformationHolder>
                    <InformationTitle>
                      {intl.formatMessage(messages.phoneNumber)}
                    </InformationTitle>
                    <InformationValue>{user.number}</InformationValue>
                  </InformationHolder>
                  <InformationHolder>
                    <InformationTitle>
                      {intl.formatMessage(messages.userName)}
                    </InformationTitle>
                    <InformationValue>{user.username}</InformationValue>
                  </InformationHolder>
                  <InformationHolder>
                    <InformationTitle>
                      {intl.formatMessage(messages.startDate)}
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
              )
            }
          }}
        </Query>
      </Content>
    </Frame>
  )
  // }
}
