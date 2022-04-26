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
import * as Hapi from '@hapi/hapi'
import { logger } from '@config/config/logger'
import * as Joi from 'joi'
import FormDraft, {
  IFormDraftModel,
  validEvent,
  DraftStatus
} from '@config/models/formDraft'
import Question from '@config/models/question'
import { Event } from '@config/models/certificate'
import { isValidFormDraftOperation } from '@config/handlers/formDraft/createOrupdateFormDraft/handler'
import { getHearthDb } from '@config/config/database'
import { every } from 'lodash'
import {
  OPENCRVS_SPECIFICATION_URL,
  SEARCH_URL,
  METRICS_URL
} from '@config/config/constants'
import fetch from 'node-fetch'
export interface IDeleteFormDraftPayload {
  event: Event
  status: DraftStatus
}

enum HearthCollectionsName {
  Composition = 'Composition',
  Composition_history = 'Composition_history',
  DocumentReference = 'DocumentReference',
  Encounter = 'Encounter',
  Encounter_history = 'Encounter_history',
  Observation = 'Observation',
  Observation_history = 'Observation_history',
  Patient = 'Patient',
  Patient_history = 'Patient_history',
  PaymentReconciliation = 'PaymentReconciliation',
  RelatedPerson = 'RelatedPerson',
  RelatedPerson_history = 'RelatedPerson_history',
  Task = 'Task',
  Task_history = 'Task_history'
}

export async function deleteFormDraftHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const formDraft = request.payload as IDeleteFormDraftPayload

  const draft = (await FormDraft.findOne({
    event: formDraft.event
  })) as IFormDraftModel

  //check if requested operation is valid or invalid
  if (!isValidFormDraftOperation(draft.status, formDraft.status)) {
    return h
      .response(`Invalid Operation. Can not delete ${draft.status} form draft.`)
      .code(400)
  }

  if (draft) {
    //get hearthDB connection
    const hearthDBConn = await getHearthDb()
    const tasks = (await hearthDBConn
      .collection('Task')
      .find()
      .toArray()) as fhir.Task[]

    //check if all the available tasks have configuration exrension
    const hasTestExtensionOnAllTasks = every(tasks, {
      extension: [
        { url: `${OPENCRVS_SPECIFICATION_URL}extension/configuration` }
      ]
    })
    if (hasTestExtensionOnAllTasks) {
      //deleting all elastic and influx data
      try {
        const token = request.headers.authorization.replace('Bearer ', '')
        Promise.all([
          await fetch(`${SEARCH_URL}elasticIndex`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }),
          await fetch(`${METRICS_URL}/influxMeasurement`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          })
        ])
      } catch (err) {
        return h
          .response(`Failed to delete elastic, influx data. ${err}`)
          .code(400)
      }

      //deleting question for requested event type
      try {
        const eventRegex = new RegExp(`^(${formDraft.event}\.)`)
        await Question.deleteMany({ fieldId: eventRegex })
      } catch (err) {
        return h.response(`Failed to delete questions. ${err}`).code(400)
      }

      hearthDBConn.db.listCollections().toArray((err, collections) => {
        if (err) {
          logger.info(
            `Error occured getting list of hearthDB collections: ${err}`
          )
        } else {
          Promise.all(
            collections.map(async (collection) => {
              if (
                Object.values(HearthCollectionsName).includes(collection.name)
              ) {
                try {
                  await hearthDBConn.dropCollection(collection.name)
                  logger.info(
                    `Droped hearthDB collection :: ${collection.name} `
                  )
                } catch (err) {
                  logger.info(
                    `Error occured droping collection name (${collection.name}) : ${err}`
                  )
                }
              }
            })
          ).then(() => {
            logger.info('Successfully droped all listed hearthDB collections')
          })
        }
      })

      //updating form draft status
      draft.status = DraftStatus.DELETED
      draft.updatedAt = Date.now()
      try {
        await FormDraft.updateOne({ _id: draft._id }, draft)
      } catch (err) {
        logger.error(err)
        return h
          .response(`Could not update draft for ${draft.event} event`)
          .code(400)
      }
      return h.response(draft).code(201)
    } else {
      return h
        .response(
          `Could not delete draft for ${draft.event} event. Other task found without configuration extension`
        )
        .code(400)
    }
  } else {
    return h.response(`No form draft found for ${formDraft.event}`).code(400)
  }
}

export const requestSchema = Joi.object({
  event: Joi.string()
    .valid(...validEvent)
    .required(),
  status: Joi.string().valid(DraftStatus.DELETED).required()
})
