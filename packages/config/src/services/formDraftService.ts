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
import Question from '@config/models/question'
import { logger } from '@config/config/logger'
import fetch from 'node-fetch'
import {
  METRICS_URL,
  OPENCRVS_SPECIFICATION_URL,
  SEARCH_URL
} from '@config/config/constants'
import { IModifyDraftStatus } from '@config/handlers/formDraft/updateFormDraft/handler'
import { fetchFHIR, deleteFHIR } from '@config/service/fhirService'
import { every } from 'lodash'

export enum HearthCollectionsName {
  Composition = 'Composition',
  DocumentReference = 'DocumentReference',
  Encounter = 'Encounter',
  Observation = 'Observation',
  Patient = 'Patient',
  PaymentReconciliation = 'PaymentReconciliation',
  RelatedPerson = 'RelatedPerson',
  Task = 'Task'
}

export async function clearHearthElasticInfluxData(request: Hapi.Request) {
  const token = request.headers.authorization.replace('Bearer ', '')
  const formDraft = request.payload as IModifyDraftStatus
  const taskBundle = await fetchFHIR(`/${HearthCollectionsName.Task}`, {
    Authorization: `Bearer ${token}`
  })
  const taskEntries = taskBundle.entry
  const hearthCollectionList = Object.keys(HearthCollectionsName)

  //check if all the available tasks have configuration exrension
  const hasTestExtensionOnAllTasks = every(taskEntries, {
    resource: {
      extension: [
        { url: `${OPENCRVS_SPECIFICATION_URL}extension/configuration` }
      ]
    }
  })
  if (!hasTestExtensionOnAllTasks) {
    throw Error(
      `Could not delete draft for ${formDraft.event} event. Other task found without configuration extension`
    )
  }
  //deleting all elastic and influx data
  try {
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

  try {
    Promise.all(
      hearthCollectionList.map(async (collection) => {
        const data = await fetchFHIR(`/${collection}`, {
          Authorization: `Bearer ${token}`
        })
        data.entry.map(async (entry: fhir.BundleEntry) => {
          await deleteFHIR(`/${collection}/${entry.resource?.id}`, {
            Authorization: `Bearer ${token}`
          })
          logger.info(
            `Deleting '${collection}' collection's resource id: ${entry.resource?.id}`
          )
        })
      })
    )
  } catch (err) {
    throw Error(`Failed to delete hearth data. ${err}`)
  }
}

export async function clearQuestionConfigs(event: string) {
  try {
    const eventRegex = new RegExp(`^(${event}\.)`)
    await Question.deleteMany({ fieldId: eventRegex })
  } catch (err) {
    throw Error(`Failed to delete questions. ${err}`)
  }
}
