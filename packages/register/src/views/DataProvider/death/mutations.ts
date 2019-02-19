import gql from 'graphql-tag'
import { IForm, Action } from 'src/forms'
import { IDraft } from 'src/drafts'
import { draftToGqlTransformer } from 'src/transformer'

const SUBMIT_DEATH_APPLICATION = gql`
  mutation submitMutation($details: DeathRegistrationInput!) {
    createDeathRegistration(details: $details)
  }
`

const COLLECT_DEATH_CERTIFICATE = gql`
  mutation submitMutation($id: ID!, $details: DeathRegistrationInput!) {
    markDeathAsCertified(id: $id, details: $details)
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
    case Action.COLLECT_CERTIFICATE:
      return {
        mutation: COLLECT_DEATH_CERTIFICATE,
        variables: {
          ...payload
        },
        dataKey: 'markDeathAsCertified'
      }
    default:
      return null
  }
}
