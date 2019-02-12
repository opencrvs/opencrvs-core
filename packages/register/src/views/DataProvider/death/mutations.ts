import gql from 'graphql-tag'
import { IForm, Action } from 'src/forms'
import { IDraft } from 'src/drafts'
import { draftToGqlTransformer } from 'src/transformer'

const SUBMIT_DEATH_APPLICATION = gql`
  mutation submitMutation($details: DeathRegistrationInput!) {
    createDeathRegistration(details: $details)
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
    default:
      return null
  }
}
