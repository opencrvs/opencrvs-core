import gql from 'graphql-tag'

export const activateUserMutation = gql`
  mutation submitActivateUser(
    $userId: String!
    $password: String!
    $securityQuestionAnswers: [SecurityQuestionAnswer]!
  ) {
    activateUser(
      userId: $userId
      password: $password
      securityQNAs: $securityQuestionAnswers
    )
  }
`
