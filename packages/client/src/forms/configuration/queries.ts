/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import gql from 'graphql-tag'
import { client } from '@client/utils/apolloClient'

export const GET_FORM_DRAFT = gql`
  query {
    getFormDraft {
      event
      status
      comment
      version
      createdAt
      updatedAt
      questions {
        fieldId
        label {
          id
          description
          defaultMessage
        }
        placeholder {
          id
          description
          defaultMessage
        }
        maxLength
        fieldName
        fieldType
        preceedingFieldId
        required
        enabled
        custom
        initialValue
      }
      history {
        status
        version
        comment
        lastUpdateAt
      }
    }
  }
`
async function fetchFormDraft() {
  return (
    client &&
    client.query({
      query: GET_FORM_DRAFT,
      fetchPolicy: 'no-cache'
    })
  )
}

export const formDraftQueries = {
  fetchFormDraft
}
