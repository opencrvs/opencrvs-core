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
  GQLFormDraftInput,
  GQLFormDraftStatusModify,
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
      const formDraftPayload: IFormDraftPayload =
        createOrUpdateFormDraftPayload(formDraft)
      const res = await fetch(`${APPLICATION_CONFIG_URL}draftQuestions`, {
        method: 'PUT',
        body: JSON.stringify(formDraftPayload),
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
    },

    async modifyDraftStatus(_, { formDraft }, authHeader) {
      // Only natlsysadmin should be able to create or update a question
      if (!hasScope(authHeader, 'natlsysadmin')) {
        return await Promise.reject(
          new Error('Update form draft status is only allowed for natlsysadmin')
        )
      }

      const formDraftStatusPayload: IModifyDraftStatusPayload =
        modifyFormDraftStatusPayload(formDraft)
      const res = await fetch(`${APPLICATION_CONFIG_URL}formDraftStatus`, {
        method: 'PUT',
        body: JSON.stringify(formDraftStatusPayload),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 201) {
        return await Promise.reject(
          new Error(
            `Something went wrong on config service. Couldn't update form draft status`
          )
        )
      }
      return await res.json()
    },

    async deleteFormDraft(_, { formDraft }, authHeader) {
      // Only natlsysadmin should be able to create or update a question
      if (!hasScope(authHeader, 'natlsysadmin')) {
        return await Promise.reject(
          new Error('Delete form draft is only allowed for natlsysadmin')
        )
      }

      const formDraftStatusPayload: IModifyDraftStatusPayload =
        modifyFormDraftStatusPayload(formDraft)
      const res = await fetch(`${APPLICATION_CONFIG_URL}draftQuestions`, {
        method: 'DELETE',
        body: JSON.stringify(formDraftStatusPayload),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 201) {
        return await Promise.reject(
          new Error(
            `Something went wrong on config service. Couldn't delete form draft`
          )
        )
      }
      return await res.json()
    }
  }
}

function createOrUpdateFormDraftPayload(
  formDraft: GQLFormDraftInput
): IFormDraftPayload {
  const formDraftPayload: IFormDraftPayload = {
    questions: formDraft.questions as GQLQuestionInput[],
    event: formDraft.event as Event,
    status: formDraft.status as DraftStatus,
    comment: formDraft.comment as string
  }

  return formDraftPayload
}

function modifyFormDraftStatusPayload(
  formDraft: GQLFormDraftStatusModify
): IModifyDraftStatusPayload {
  const formDraftStatusPayload: IModifyDraftStatusPayload = {
    event: formDraft.event as Event,
    status: formDraft.status as DraftStatus
  }

  return formDraftStatusPayload
}
enum Event {
  BIRTH = 'birth',
  DEATH = 'death'
}

enum DraftStatus {
  DRAFT = 'DRAFT',
  IN_PREVIEW = 'IN_PREVIEW',
  PUBLISHED = 'PUBLISHED',
  DELETED = 'DELETED'
}

interface IFormDraftPayload {
  questions: GQLQuestionInput[] | []
  event: Event
  status: DraftStatus
  comment?: string
}

interface IModifyDraftStatusPayload {
  event: Event
  status: DraftStatus
}
