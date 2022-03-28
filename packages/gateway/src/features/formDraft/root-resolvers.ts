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
import fetch from 'node-fetch'
import { APPLICATION_CONFIG_URL } from '@gateway/constants'
import { hasScope } from '@gateway/features/user/utils'
import {
  GQLformDraftInput,
  GQLQuestionInput,
  GQLResolver
} from '@gateway/graphql/schema'

export const resolvers: GQLResolver = {
  Query: {
    async getFormDraft(_, {}, authHeader) {
      const res = await fetch(`${APPLICATION_CONFIG_URL}formDraft`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      return await res.json()
    }
  },

  Mutation: {
    async createOrUpdateFormDraft(_, { formDraft }, authHeader) {
      // Only natlsysadmin should be able to create or update a question
      if (!hasScope(authHeader, 'natlsysadmin')) {
        return await Promise.reject(
          new Error(
            'Create or update form draft is only allowed for natlsysadmin'
          )
        )
      }
      const questionPayload: IFormDraftPayload =
        createOrUpdateFormDraftPayload(formDraft)
      const res = await fetch(`${APPLICATION_CONFIG_URL}draftQuestions`, {
        method: 'PUT',
        body: JSON.stringify(questionPayload),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 201) {
        return await Promise.reject(
          new Error(
            `Something went wrong on config service. Couldn't mofify form draft`
          )
        )
      }
      return await res.json()
    }
  }
}

function createOrUpdateFormDraftPayload(
  formDraft: GQLformDraftInput
): IFormDraftPayload {
  const formDraftPayload: IFormDraftPayload = {
    questions: formDraft.questions as GQLQuestionInput[],
    deleted: formDraft.deleted as string[],
    event: formDraft.event as Event,
    status: formDraft.status as DraftStatus,
    comment: formDraft.comment as string
  }

  return formDraftPayload
}

enum Event {
  BIRTH = 'birth',
  DEATH = 'death'
}

enum DraftStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  FINALISED = 'FINALISED'
}

interface IFormDraftPayload {
  questions?: GQLQuestionInput[]
  deleted?: string[]
  event: Event
  status: DraftStatus
  comment?: string
}
