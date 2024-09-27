import { gql } from '@apollo/client'
import { client } from '@client/utils/apolloClient'
import { RecordInput as GQLRecordInput } from '@client/utils/gateway'

export type RecordInput = GQLRecordInput

const SUBMIT_RECORD = gql`
  mutation createRecord($recordInput: RecordInput!) {
    createRecord(recordInput: $recordInput) {
      id
    }
  }
`

export function createRecord(recordInput: RecordInput) {
  return client.mutate({
    mutation: SUBMIT_RECORD,
    variables: { recordInput }
  })
}
