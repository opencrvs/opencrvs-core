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

export function covertBundleToBDRISFormat(bundle: fhir.Bundle) {
  // TODO implement this when we know the JSON format - OCRVS-2331
  return bundle
}

export async function addToQueue(payload: Object, token: string) {
  const queueItem = new QueueItem({
    created: new Date(),
    payload: JSON.stringify(payload),
    status: 'WAITING_FOR_VALIDATION',
    token
  } as IQueueItemModel)

  await queueItem.save()
}

async function pickNextItem() {
  return QueueItem.findOneAndUpdate(
    { status: 'WAITING_FOR_VALIDATION' },
    { $set: { status: 'PROCESSING' } }
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
    await fetch(CONFIRM_REGISTRATION_URL, {
      method: 'POST',
      body: JSON.stringify({ error: err.message }),
      headers: { Authorization: item.token }
    })

    item.set('status', 'ERROR')
    item.set('error', `Failed to validate with BDRIS: ${err.message}`)
    return item.save()
  }

  try {
    const webHookResponse = await createWebHookResponseFromBundle(bundle)

    // call workflow webhook
    await fetch(CONFIRM_REGISTRATION_URL, {
      method: 'POST',
      body: JSON.stringify(webHookResponse),
      headers: { Authorization: item.token }
    })
  } catch (err) {
    item.set('status', 'ERROR')
    item.set('error', `Failed to send confirmation: ${err.message}`)
    return item.save()
  }

  item.set('status', 'VALID')
  return item.save()
}

export async function triggerValidation() {
  let item = await pickNextItem()
  while (item) {
    await validateWithBDRIS(item)
    item = await pickNextItem()
  }
}
