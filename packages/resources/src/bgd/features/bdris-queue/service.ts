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
import QueueItem, {
  IQueueItemModel
} from '@resources/bgd/features/bdris-queue/model'
import { CONFIRM_REGISTRATION_URL } from '@resources/constants'
import fetch from 'node-fetch'
import { createWebHookResponseFromBundle } from '@resources/bgd/features/validate/service'

export enum State {
  WAITING_FOR_VALIDATION = 'WAITING_FOR_VALIDATION',
  PROCESSING = 'PROCESSING',
  VALID = 'VALID',
  ERROR = 'ERROR'
}

export function covertBundleToBDRISFormat(bundle: fhir.Bundle) {
  // TODO implement this when we know the JSON format - OCRVS-2331
  // @ts-ignore
  if (bundle.throw) {
    throw new Error('test error')
  }

  return bundle
}

export async function addToQueue(payload: Object, token: string) {
  const queueItem = new QueueItem({
    created: new Date(),
    payload: JSON.stringify(payload),
    status: State.WAITING_FOR_VALIDATION,
    token
  } as IQueueItemModel)

  await queueItem.save()
}

async function pickNextItem() {
  return QueueItem.findOneAndUpdate(
    { status: State.WAITING_FOR_VALIDATION },
    { $set: { status: State.PROCESSING } }
  ).exec()
}

async function validateWithBDRIS(item: IQueueItemModel) {
  const bundle = JSON.parse(item.payload)

  try {
    // @ts-ignore
    const bdrisPayload = covertBundleToBDRISFormat(bundle)

    // TODO send to BDRIS for validation
    await new Promise(resolve => {
      // tslint:disable-next-line no-string-based-set-timeout
      setTimeout(resolve, 1000)
    })
  } catch (err) {
    // call workflow webhook with error
    const errMsg = `Failed to validate with BDRIS: ${err.message}`

    await fetch(CONFIRM_REGISTRATION_URL, {
      method: 'POST',
      body: JSON.stringify({ error: errMsg }),
      headers: { Authorization: item.token, 'Content-Type': 'application/json' }
    })

    item.set('status', State.ERROR)
    item.set('error', errMsg)
    return item.save()
  }

  try {
    const webHookResponse = await createWebHookResponseFromBundle(bundle)

    // call workflow webhook
    await fetch(CONFIRM_REGISTRATION_URL, {
      method: 'POST',
      body: JSON.stringify(webHookResponse),
      headers: { Authorization: item.token, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    item.set('status', State.ERROR)
    item.set('error', `Failed to send confirmation: ${err.message}`)
    return item.save()
  }

  item.set('status', State.VALID)
  return item.save()
}

export async function triggerValidation() {
  let item = await pickNextItem()
  while (item) {
    await validateWithBDRIS(item)
    item = await pickNextItem()
  }
}
