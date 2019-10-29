import gql from 'graphql-tag'
import { IForm, Action } from '@register/forms'
import { IApplication } from '@register/applications'
import {
  draftToGqlTransformer,
  appendGqlMetadataFromDraft
} from '@register/transformer'

const SUBMIT_BIRTH_APPLICATION = gql`
  mutation submitMutation($details: BirthRegistrationInput!) {
    createBirthRegistration(details: $details) {
      trackingId
      compositionId
    }
  }
`
const APPROVE_BIRTH_APPLICATION = gql`
  mutation submitMutation($id: ID!, $details: BirthRegistrationInput) {
    markBirthAsValidated(id: $id, details: $details)
  }
`
const REGISTER_BIRTH_APPLICATION = gql`
  mutation submitMutation($id: ID!, $details: BirthRegistrationInput) {
    markBirthAsRegistered(id: $id, details: $details)
  }
`
const REJECT_BIRTH_APPLICATION = gql`
  mutation submitMutation($id: String!, $reason: String!, $comment: String!) {
    markEventAsVoided(id: $id, reason: $reason, comment: $comment)
  }
`
const COLLECT_BIRTH_CERTIFICATE = gql`
  mutation submitMutation($id: ID!, $details: BirthRegistrationInput!) {
    markBirthAsCertified(id: $id, details: $details)
  }
`

export function getBirthMutationMappings(
  action: Action,
  payload?: any,
  form?: IForm,
  draft?: IApplication
) {
  let gqlDetails = {}
  if (form && draft) {
    gqlDetails = draftToGqlTransformer(form, draft.data)
    appendGqlMetadataFromDraft(draft, gqlDetails)
  }

  switch (action) {
    case Action.SUBMIT_FOR_REVIEW:
      return {
        mutation: SUBMIT_BIRTH_APPLICATION,
        variables: { details: gqlDetails },
        dataKey: 'createBirthRegistration'
      }
    case Action.APPROVE_APPLICATION:
      return {
        mutation: APPROVE_BIRTH_APPLICATION,
        variables: {
          id: draft && draft.id,
          details: gqlDetails
        },
        dataKey: 'markBirthAsValidated'
      }
    case Action.REGISTER_APPLICATION:
      return {
        mutation: REGISTER_BIRTH_APPLICATION,
        variables: {
          id: draft && draft.id,
          details: gqlDetails
        },
        dataKey: 'markBirthAsRegistered'
      }
    case Action.REJECT_APPLICATION:
      return {
        mutation: REJECT_BIRTH_APPLICATION,
        variables: {
          ...payload
        },
        dataKey: 'markEventAsVoided'
      }
    case Action.COLLECT_CERTIFICATE:
      return {
        mutation: COLLECT_BIRTH_CERTIFICATE,
        variables: {
          id: draft && draft.id,
          details: gqlDetails
        },
        dataKey: 'markBirthAsCertified'
      }
    default:
      return null
  }
}
