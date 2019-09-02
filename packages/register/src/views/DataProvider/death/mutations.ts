import gql from 'graphql-tag'
import { IForm, Action } from '@register/forms'
import { IApplication } from '@register/applications'
import { draftToGqlTransformer } from '@register/transformer'

const SUBMIT_DEATH_APPLICATION = gql`
  mutation submitMutation($details: DeathRegistrationInput!) {
    createDeathRegistration(details: $details) {
      trackingId
      compositionId
    }
  }
`
const APPROVE_DEATH_APPLICATION = gql`
  mutation submitMutation($id: ID!, $details: DeathRegistrationInput) {
    markDeathAsValidated(id: $id, details: $details)
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

const COLLECT_DEATH_CERTIFICATE = gql`
  mutation submitMutation($id: ID!, $details: DeathRegistrationInput!) {
    markDeathAsCertified(id: $id, details: $details)
  }
`

export function getDeathMutationMappings(
  action: Action,
  payload?: any,
  form?: IForm,
  draft?: IApplication
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
    case Action.APPROVE_APPLICATION:
      return {
        mutation: APPROVE_DEATH_APPLICATION,
        variables:
          form && draft
            ? {
                id: draft.id,
                details: draftToGqlTransformer(form, draft.data)
              }
            : {},
        dataKey: 'markDeathAsValidated'
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
    case Action.COLLECT_CERTIFICATE:
      return {
        mutation: COLLECT_DEATH_CERTIFICATE,
        variables:
          form && draft
            ? {
                id: draft.id,
                details: draftToGqlTransformer(form, draft.data)
              }
            : {},
        dataKey: 'markDeathAsCertified'
      }
    default:
      return null
  }
}
