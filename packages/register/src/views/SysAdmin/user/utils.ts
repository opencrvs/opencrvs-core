import { defineMessages } from 'react-intl'

export enum UserStatus {
  ACTIVE,
  PENDING,
  DISABLED
}

export const messages = defineMessages({
  name: {
    id: 'table.column.header.name',
    defaultMessage: 'Name',
    description: 'Title for column'
  },
  role: {
    id: 'table.column.header.role',
    defaultMessage: 'Role',
    description: 'Title for column'
  },
  type: {
    id: 'table.column.header.type',
    defaultMessage: 'Type',
    description: 'Title for column'
  },
  status: {
    id: 'table.column.header.status',
    defaultMessage: 'Status',
    description: 'Title for column'
  },
  queryError: {
    id: 'system.user.queryError',
    defaultMessage: 'An error occured while loading system users',
    description: 'The text when error ocurred loading system users'
  }
})
