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
import * as mongoose from 'mongoose'
import { every } from 'lodash'
import fetch from 'node-fetch'
import * as Hapi from '@hapi/hapi'
import Question from '@config/models/question'
import { logger } from '@config/config/logger'
import {
  METRICS_URL,
  OPENCRVS_SPECIFICATION_URL,
  SEARCH_URL
} from '@config/config/constants'
import { getHearthDb } from '@config/config/database'
import { IModifyDraftStatus } from '@config/handlers/formDraft/createOrupdateFormDraft/handler'

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

export async function clearHearthElasticInfluxData(request: Hapi.Request) {
  const formDraft = request.payload as IModifyDraftStatus
  let hearthDBConn: mongoose.Connection
  //get hearthDB connection
  try {
    hearthDBConn = await getHearthDb()
  } catch (err) {
    throw Error(`Could not able to get hearthDB connection. ${err}`)
  }
  const tasks = (await hearthDBConn
    .collection('Task')
    .find()
    .toArray()) as fhir.Task[]

  //check if all the available tasks have configuration exrension
  const hasTestExtensionOnAllTasks = every(tasks, {
    extension: [{ url: `${OPENCRVS_SPECIFICATION_URL}extension/configuration` }]
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
      throw Error(`Failed to delete elastic, influx data. ${err}`)
    }

    //deleting question for requested event type
    try {
      const eventRegex = new RegExp(`^(${formDraft.event}\.)`)
      await Question.deleteMany({ fieldId: eventRegex })
    } catch (err) {
      throw Error(`Failed to delete questions. ${err}`)
    }

    hearthDBConn.db.listCollections().toArray((err, collections) => {
      if (err) {
        logger.error(
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
                logger.info(`Droped hearthDB collection :: ${collection.name} `)
              } catch (err) {
                logger.error(
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
  } else {
    throw Error(
      `Could not delete draft for ${formDraft.event} event. Other task found without configuration extension`
    )
  }
}
