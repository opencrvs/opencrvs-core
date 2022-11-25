import { gql } from '@apollo/client'

export const FETCH_FORM_DATA_SET = gql`
  query getFormDataset {
    getFormDataset {
      _id
      fileName
      createdAt
      createdBy {
        id
        name {
          firstNames
          familyName
        }
      }
      options {
        value
        label {
          lang
          descriptor {
            id
            defaultMessage
          }
        }
      }
    }
  }
`
