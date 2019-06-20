import { defineMessages } from 'react-intl'

export enum UserStatus {
  ACTIVE,
  PENDING,
  DISABLED
}

export const messages = defineMessages({
  queryError: {
    id: 'system.user.queryError',
    defaultMessage: 'An error occured while loading system users',
    description: 'The text when error ocurred loading system users'
  }
})
