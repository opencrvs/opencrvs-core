import { GraphQLError } from 'graphql'

export class UnassignError extends GraphQLError {
  constructor(message = 'You have been unassigned from this event') {
    super(message, {
      extensions: {
        code: 'UNASSIGNED'
      }
    })
  }
}
export class UserInputError extends GraphQLError {
  constructor(message = 'Invalid user input', invalidArgs = {}) {
    super(message, {
      extensions: {
        code: 'BAD_USER_INPUT',
        invalidArgs
      }
    })
  }
}

export class AuthenticationError extends GraphQLError {
  constructor(message = 'Unauthorized') {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED'
      }
    })
  }
}
