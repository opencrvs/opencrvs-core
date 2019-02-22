import gql from 'graphql-tag'
import { IForm, Action } from 'src/forms'
import { IDraft } from 'src/drafts'
import { draftToGqlTransformer } from 'src/transformer'

const SUBMIT_DEATH_APPLICATION = gql`
  mutation submitMutation($details: DeathRegistrationInput!) {
    createDeathRegistration(details: $details)
  }
`
const REGISTER_DEATH_APPLICATION = gql`
  mutation submitMutation($id: ID!, $details: DeathRegistrationInput) {
    markDeathAsRegistered(id: $id, details: $details)
  }
`
const REJECT_DEATH_APPLICATION = gql`
  mutation submitMutation($id: String!, $reason: String!, $comment: String!) {
    markEventAsVoided(id: $id, reason: $reason, comment: $comment)
  }
`

export function getDeathMutationMappings(
  action: Action,
  payload?: any,
  form?: IForm,
  draft?: IDraft
) {
  switch (action) {
    case Action.SUBMIT_FOR_REVIEW:
      return {
        mutation: SUBMIT_DEATH_APPLICATION,
        variables:
          form && draft
            ? {
                details: draftToGqlTransformer(form, draft.data)
              }
            : {},
        dataKey: 'createDeathRegistration'
      }
    case Action.REGISTER_APPLICATION:
      return {
        mutation: REGISTER_DEATH_APPLICATION,
        variables:
          form && draft
            ? {
                id: draft.id,
                details: draftToGqlTransformer(form, draft.data)
              }
            : {},
        dataKey: 'markDeathAsRegistered'
      }
    case Action.REJECT_APPLICATION:
      return {
        mutation: REJECT_DEATH_APPLICATION,
        variables: {
          ...payload
        },
        dataKey: 'markEventAsVoided'
      }
    default:
      return null
  }
}
