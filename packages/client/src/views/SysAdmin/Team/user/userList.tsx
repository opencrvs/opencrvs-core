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
import { Header } from '@client/components/interface/Header/Header'
import { Query } from '@client/components/Query'
import {
  constantsMessages,
  errorMessages,
  userMessages
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/sysAdmin'
import { goToCreateNewUser, goToReviewUserDetails } from '@client/navigation'
import { withTheme } from '@client/styledComponents'
import { SEARCH_USERS } from '@client/user/queries'
import { LANG_EN } from '@client/utils/constants'
import { createNamesMap } from '@client/utils/data-formatting'
import { UserStatus } from '@client/views/SysAdmin/Team/utils'
import {
  AddUser,
  AvatarSmall,
  VerticalThreeDots
} from '@opencrvs/components/lib/icons'
import {
  ColumnContentAlignment,
  ListTable,
  ToggleMenu
} from '@opencrvs/components/lib/interface'
import { IDynamicValues } from '@opencrvs/components/lib/interface/GridTable/types'
import { BodyContent } from '@opencrvs/components/lib/layout'
import { ITheme } from '@opencrvs/components/lib/theme'
import {
  GQLHumanName,
  GQLQuery,
  GQLUser
} from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import styled from 'styled-components'
import querystring from 'query-string'

const UserTable = styled(BodyContent)`
  padding: 0px;
  margin: 32px auto 0;
`
const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 18px;
  background: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  box-shadow: rgba(53, 67, 93, 0.32) 0px 2px 6px;
`
const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
`
const StatusBox = styled.span`
  padding: 4px 6px;
  border-radius: 4px;
  text-align: center;
`
const ActiveStatusBox = styled(StatusBox)`
  background: rgba(73, 183, 141, 0.3);
`
const PendingStatusBox = styled(StatusBox)`
  background: rgba(255, 255, 153, 1);
`
const DisabledStatusBox = styled(StatusBox)`
  background: rgba(206, 206, 206, 0.3);
`
const AddUserContainer = styled(AddUser)`
  cursor: pointer;
`

interface ISearchParams {
  locationId: string
}

type BaseProps = {
  theme: ITheme
  goToCreateNewUser: typeof goToCreateNewUser
  goToReviewUserDetails: typeof goToReviewUserDetails
}

interface IMatchParams {
  ofcId: string
}

type IProps = BaseProps & IntlShapeProps & RouteComponentProps<IMatchParams>

interface IState {
  usersPageNo: number
}

interface IStatusProps {
  status: string
}

const Status = (statusProps: IStatusProps) => {
  const status =
    statusProps.status.charAt(0).toUpperCase() + statusProps.status.slice(1)
  switch (status.toLowerCase()) {
    case UserStatus[UserStatus.ACTIVE].toLowerCase():
      return <ActiveStatusBox>{status}</ActiveStatusBox>
    case UserStatus[UserStatus.DISABLED].toLowerCase():
      return <DisabledStatusBox>{status}</DisabledStatusBox>
    case UserStatus[UserStatus.PENDING].toLowerCase():
    default:
      return <PendingStatusBox>{status}</PendingStatusBox>
  }
}

class UserListComponent extends React.Component<IProps, IState> {
  pageSize: number

  constructor(props: IProps) {
    super(props)

    this.pageSize = 10
    this.state = { usersPageNo: 1 }
  }

  getMenuItems = (userId: string) => {
    return [
      {
        label: this.props.intl.formatMessage(messages.menuOptionEditDetails),
        handler: () => this.props.goToReviewUserDetails(userId)
      }
    ]
  }

  generateUserContents = (data: GQLQuery) => {
    const { intl } = this.props

    if (!data || !data.searchUsers || !data.searchUsers.results) {
      return []
    }

    return data.searchUsers.results.map(
      (user: GQLUser | null, index: number) => {
        if (user !== null) {
          const name =
            (createNamesMap(user && (user.name as GQLHumanName[]))[
              this.props.intl.locale
            ] as string) ||
            (createNamesMap(user && (user.name as GQLHumanName[]))[
              LANG_EN
            ] as string)
          const status = user.status || 'pending'

          return {
            photo: <AvatarSmall />,
            name,
            username: user.username,
            role: user.role && intl.formatMessage(userMessages[user.role]),
            type: user.type && intl.formatMessage(userMessages[user.type]),
            status: <Status status={status} />,
            menu: (
              <ToggleMenu
                id={`user-item-${index}-menu`}
                toggleButton={<VerticalThreeDots />}
                menuItems={this.getMenuItems(user.id as string)}
              />
            )
          }
        }
        return {}
      }
    )
  }

  onClickAddUser = () => {
    this.props.goToCreateNewUser()
  }

  onPageChange = (newPageNumber: number) => {
    this.setState({ usersPageNo: newPageNumber })
  }

  renderUserList = () => {
    const {
      intl,
      location: { search }
    } = this.props
    const { locationId } = (querystring.parse(
      search
    ) as unknown) as ISearchParams

    const columns = [
      {
        label: '',
        width: 7,
        key: 'photo'
      },
      {
        label: intl.formatMessage(constantsMessages.name),
        width: 25,
        key: 'name'
      },
      {
        label: intl.formatMessage(constantsMessages.username),
        width: 20,
        key: 'username'
      },
      {
        label: intl.formatMessage(constantsMessages.labelRole),
        width: 18,
        key: 'role'
      },
      {
        label: intl.formatMessage(constantsMessages.type),
        width: 17,
        key: 'type'
      },
      {
        label: intl.formatMessage(constantsMessages.status),
        width: 8,
        key: 'status'
      },
      {
        label: '',
        width: 5,
        alignment: ColumnContentAlignment.CENTER,
        key: 'menu'
      }
    ]
    return (
      <Query
        query={SEARCH_USERS}
        variables={{
          primaryOfficeId: locationId,
          count: this.pageSize,
          skip: (this.state.usersPageNo - 1) * this.pageSize
        }}
      >
        {({ error, data }: { error?: any; data: any }) => {
          if (error) {
            return (
              <ErrorText id="user_loading_error">
                {intl.formatMessage(errorMessages.userQueryError)}
              </ErrorText>
            )
          }
          return (
            <UserTable id="user_list">
              <TableHeader>
                Users (
                {(data && data.searchUsers && data.searchUsers.totalItems) || 0}
                )
                <AddUserContainer id="add-user" onClick={this.onClickAddUser} />
              </TableHeader>
              <ListTable
                content={this.generateUserContents(data) as IDynamicValues[]}
                columns={columns}
                noResultText="No result to display"
                onPageChange={(currentPage: number) => {
                  this.onPageChange(currentPage)
                }}
                pageSize={this.pageSize}
                totalItems={
                  data && data.searchUsers && data.searchUsers.totalItems
                }
                currentPage={this.state.usersPageNo}
              />
            </UserTable>
          )
        }}
      </Query>
    )
  }

  render() {
    const { intl } = this.props
    return (
      <>
        <Header title={intl.formatMessage(messages.systemTitle)} />

        {this.renderUserList()}
      </>
    )
  }
}

export const UserList = connect(
  null,
  {
    goToCreateNewUser,
    goToReviewUserDetails
  }
)(withTheme(injectIntl(UserListComponent)))
