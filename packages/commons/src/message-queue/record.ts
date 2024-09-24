/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { Job, Processor, Queue, Worker } from 'bullmq'
import { PlainToken } from '../http'
import { logger } from '../logger'
import {
  BirthRegistration,
  DeathRegistration,
  EVENT_TYPE,
  MarriageRegistration,
  SupportedPatientIdentifierCode,
  WaitingForValidationRecord
} from '../types'

type ExternalValidationPayload = {
  record: WaitingForValidationRecord
  token: PlainToken
}
export type RecordValidatedPayload = {
  token: PlainToken
  trackingId: string
  registrationNumber: string
  recordId: string
  identifiers: {
    type: SupportedPatientIdentifierCode
    value: string
  }[]
}

type Payload =
  | {
      event: EVENT_TYPE.BIRTH
      payload: BirthRegistration
      token: PlainToken
    }
  | {
      event: EVENT_TYPE.DEATH
      payload: DeathRegistration
      token: PlainToken
    }
  | {
      event: EVENT_TYPE.MARRIAGE
      payload: MarriageRegistration
      token: PlainToken
    }

export function useExternalValidationQueue(redisHost: string) {
  const queue = new Queue<ExternalValidationPayload | RecordValidatedPayload>(
    'external-validations',
    {
      connection: { host: redisHost, port: 6379 }
    }
  )

  async function sendForExternalValidation(payload: ExternalValidationPayload) {
    await queue.waitUntilReady()

    await queue.add('send-to-external-validation', payload, {
      attempts: Number.MAX_SAFE_INTEGER,
      backoff: {
        type: 'fixed',
        delay: 5000
      }
    })
  }
  async function recordValidated(payload: RecordValidatedPayload) {
    await queue.waitUntilReady()

    await queue.add('record-validated-externally', payload, {
      attempts: Number.MAX_SAFE_INTEGER,
      backoff: {
        type: 'fixed',
        delay: 5000
      }
    })
  }

  return {
    recordValidated,
    sendForExternalValidation
  }
}
export function useRecordQueue(redisHost: string) {
  const queue = new Queue<Payload>('records', {
    connection: { host: redisHost, port: 6379 }
  })

  async function createDeclaration(payload: Payload) {
    await queue.waitUntilReady()

    await queue.add('create-declaration', payload, {
      attempts: Number.MAX_SAFE_INTEGER,
      backoff: {
        type: 'fixed',
        delay: 5000
      }
    })
  }

  async function createRegistration(payload: Payload) {
    await queue.waitUntilReady()

    await queue.add('create-registration', payload, {
      attempts: Number.MAX_SAFE_INTEGER,
      backoff: {
        type: 'fixed',
        delay: 5000
      }
    })
  }

  async function createValidatedDeclaration(payload: Payload) {
    await queue.waitUntilReady()

    await queue.add('create-validated-declaration', payload, {
      attempts: Number.MAX_SAFE_INTEGER,
      backoff: {
        type: 'fixed',
        delay: 5000
      }
    })
  }

  return {
    createDeclaration,
    createRegistration,
    createValidatedDeclaration
  }
}

export async function registerRecordWorker(
  redisHost: string,
  processJob: Processor<Payload>
) {
  const worker = new Worker<Payload>(
    'records',
    async (job) => {
      return processJob(job)
    },
    {
      connection: { host: redisHost, port: 6379 }
    }
  )

  worker.on('failed', (job, err) => {
    logger.error(`Record worker error handling job ${job?.id}: ${err}`)
  })
  worker.on('error', (err) => {
    logger.error(`Record worker error: ${err}`)
  })
  await worker.waitUntilReady()

  return worker
}

export async function registerExternalValidationsWorker(
  redisHost: string,
  processJob: (
    job:
      | Job<ExternalValidationPayload, any, 'send-to-external-validation'>
      | Job<RecordValidatedPayload, any, 'record-validated-externally'>
  ) => Promise<any>
) {
  const worker = new Worker<ExternalValidationPayload | RecordValidatedPayload>(
    'external-validations',
    async (
      job:
        | Job<ExternalValidationPayload, any, 'send-to-external-validation'>
        | Job<RecordValidatedPayload, any, 'record-validated-externally'>
    ) => {
      return processJob(job)
    },
    {
      connection: { host: redisHost, port: 6379 }
    }
  )

  worker.on('failed', (job, err) => {
    logger.error(
      `External validation worker error handling job ${job?.id}: ${err}`
    )
  })
  worker.on('error', (err) => {
    logger.error(`External validation worker error: ${err}`)
  })
  await worker.waitUntilReady()

  return worker
}
