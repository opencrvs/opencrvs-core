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
import {
  AddUser,
  AvatarSmall,
  VerticalThreeDots
} from '@opencrvs/components/lib/icons'
import { ListTable } from '@opencrvs/components/lib/interface'
import { IDynamicValues } from '@opencrvs/components/lib/interface/GridTable/types'
import { BodyContent } from '@opencrvs/components/lib/layout'
import {
  GQLHumanName,
  GQLQuery,
  GQLUser
} from '@opencrvs/gateway/src/graphql/schema'
import { SEARCH_USERS } from '@client/sysadmin/user/queries'
import { LANG_EN } from '@client/utils/constants'
import { createNamesMap } from '@client/utils/data-formatting'
import * as React from 'react'
import { Query } from '@client/components/Query'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import styled from 'styled-components'
import { goToCreateNewUser } from '@client/navigation'
import { connect } from 'react-redux'
import {
  userMessages,
  constantsMessages,
  errorMessages
} from '@client/i18n/messages'
import { UserStatus } from '@client/views/SysAdmin/utils'

const UserTabBodyContent = styled(BodyContent)`
  max-width: 1050px;
`

const UserTable = styled.div`
  margin-top: 30px;
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

interface IProps extends IntlShapeProps {
  goToCreateNewUser: typeof goToCreateNewUser
}

interface IState {
  usersPageNo: number
}

class UserTabComponent extends React.Component<IProps, IState> {
  pageSize: number

  constructor(props: IProps) {
    super(props)

    this.pageSize = 10
    this.state = { usersPageNo: 1 }
  }

  generateUserContents = (data: GQLQuery) => {
    const { intl } = this.props

    if (!data || !data.searchUsers || !data.searchUsers.results) {
      return []
    }

    return data.searchUsers.results.map((user: GQLUser | null) => {
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
          menu: <VerticalThreeDots />
        }
      }
      return {}
    })
  }

  onClickAddUser = () => {
    this.props.goToCreateNewUser()
  }

  onPageChange = (newPageNumber: number) => {
    this.setState({ usersPageNo: newPageNumber })
  }

  render() {
    const { intl } = this.props
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
        key: 'menu'
      }
    ]
    return (
      <Query
        query={SEARCH_USERS}
        variables={{
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
            <UserTable>
              <UserTabBodyContent id="user_list">
                <TableHeader>
                  Users (
                  {(data && data.searchUsers && data.searchUsers.totalItems) ||
                    0}
                  )
                  <AddUserContainer
                    id="add-user"
                    onClick={this.onClickAddUser}
                  />
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
              </UserTabBodyContent>
            </UserTable>
          )
        }}
      </Query>
    )
  }
}

export const UserTab = connect(
  null,
  { goToCreateNewUser }
)(injectIntl(UserTabComponent))
