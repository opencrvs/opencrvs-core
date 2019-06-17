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
import { SEARCH_USERS } from 'src/sysadmin/user/queries'
import styled from 'src/styled-components'
import { LANG_EN } from 'src/utils/constants'
import { createNamesMap } from 'src/utils/data-formatting'
import { messages, UserRole, UserStatus } from './utils'

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

interface IStatusProps {
  status: string
}

const Status = (statusProps: IStatusProps) => {
  switch (statusProps.status.toLowerCase()) {
    case UserStatus[UserStatus.ACTIVE].toLowerCase():
    default:
      return <ActiveStatusBox>{statusProps.status}</ActiveStatusBox>
    case UserStatus[UserStatus.PENDING].toLowerCase():
      return <PendingStatusBox>{statusProps.status}</PendingStatusBox>
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
    if (!data || !data.searchUsers || !data.searchUsers.results) {
      return []
    }

    return data.searchUsers.results.map((user: GQLUser) => {
      const name =
        (createNamesMap(user && (user.name as GQLHumanName[]))[
          this.props.intl.locale
        ] as string) ||
        (createNamesMap(user && (user.name as GQLHumanName[]))[
          LANG_EN
        ] as string)
      const status = user.active ? 'Active' : 'Pending'

      return {
        photo: <AvatarSmall />,
        name,
        role: UserRole[user.role as string] || 'Unknown',
        type: user.type || 'Unknown',
        status: <Status status={status} />,
        menu: <VerticalThreeDots />
      }
    })
  }

  onPageChange = (newPageNumber: number) => {
    console.log(newPageNumber)
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
        {({ error, data }) => {
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
                  content={this.generateUserContents(data)}
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
