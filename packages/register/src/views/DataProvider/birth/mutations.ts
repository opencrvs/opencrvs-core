import gql from 'graphql-tag'
import { IForm, Action } from 'src/forms'
import { IDraft } from 'src/drafts'
import { draftToGqlTransformer } from 'src/transformer'

const SUBMIT_BIRTH_APPLICATION = gql`
  mutation submitMutation($details: BirthRegistrationInput!) {
    createBirthRegistration(details: $details)
  }
`
const REGISTER_BIRTH_APPLICATION = gql`
  mutation submitMutation($id: ID!, $details: BirthRegistrationInput) {
    markBirthAsRegistered(id: $id, details: $details)
  }
`
export function getBirthMutationMappings(
  action: Action,
  form: IForm,
  draft: IDraft
) {
  switch (action) {
    case Action.SUBMIT_FOR_REVIEW:
      return {
        mutation: SUBMIT_BIRTH_APPLICATION,
        variables: {
          details: draftToGqlTransformer(form, draft.data)
        },
        dataKey: 'createBirthRegistration'
      }
    case Action.REGISTER_APPLICATION:
      return {
        mutation: REGISTER_BIRTH_APPLICATION,
        variables: {
          id: draft.id,
          details: draftToGqlTransformer(form, draft.data)
        },
        dataKey: 'markBirthAsRegistered'
      }
    default:
      return null
  }
}
