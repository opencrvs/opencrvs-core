import {
  AddUser,
  AvatarSmall,
  VerticalThreeDots
} from '@opencrvs/components/lib/icons'
import { ListTable } from '@opencrvs/components/lib/interface'
import { BodyContent } from '@opencrvs/components/lib/layout'
import {
  GQLHumanName,
  GQLQuery,
  GQLUser
} from '@opencrvs/gateway/src/graphql/schema'
import * as Sentry from '@sentry/browser'
import * as React from 'react'
import { Query } from 'react-apollo'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { SEARCH_USERS } from '@register/sysadmin/user/queries'
import { LANG_EN } from '@register/utils/constants'
import { createNamesMap } from '@register/utils/data-formatting'
import { messages, UserRole, UserStatus } from './utils'
import styled from 'styled-components'
import { IDynamicValues } from '@opencrvs/components/lib/interface/GridTable/types'
import { roleMessages, typeMessages } from '@register/utils/roleTypeMessages'

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
  padding: 4px;
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

interface IState {
  usersPageNo: number
}

class UserTabComponent extends React.Component<InjectedIntlProps, IState> {
  pageSize: number

  constructor(props: InjectedIntlProps) {
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
          role: user.role && intl.formatMessage(roleMessages[user.role]),
          type: user.type && intl.formatMessage(typeMessages[user.type]),
          status: <Status status={status} />,
          menu: <VerticalThreeDots />
        }
      }
    })
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
        label: 'Name',
        width: 35,
        key: 'name'
      },
      {
        label: 'Role',
        width: 23,
        key: 'role'
      },
      {
        label: 'Type',
        width: 20,
        key: 'type'
      },
      {
        label: 'Status',
        width: 10,
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
            Sentry.captureException(error)
            return (
              <ErrorText id="user_loading_error">
                {intl.formatMessage(messages.queryError)}
              </ErrorText>
            )
          }
          return (
            <UserTable>
              <BodyContent id="user_list">
                <TableHeader>
                  Users (
                  {(data && data.searchUsers && data.searchUsers.totalItems) ||
                    0}
                  )
                  <AddUser />
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
              </BodyContent>
            </UserTable>
          )
        }}
      </Query>
    )
  }
}

export const UserTab = injectIntl(UserTabComponent)
