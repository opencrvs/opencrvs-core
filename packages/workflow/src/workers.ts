import { getAuthorizationHeaderFromToken, getUUID } from '@opencrvs/commons'
import {
  registerExternalValidationsWorker,
  registerRecordWorker
} from '@opencrvs/commons/message-queue'
import { REDIS_HOST } from './constants'
import {
  declareRecordHandler,
  registerRecordHandler,
  validateRecordHandler
} from './records/handler/create'
import { invokeRegistrationValidation } from './features/registration/fhir/fhir-bundle-modifier'
import { markEventAsRegistered } from './features/registration/handler'

export async function register() {
  await registerExternalValidationsWorker(REDIS_HOST, async (job) => {
    if (job.name === 'send-to-external-validation') {
      const { token, record } = job.data
      return invokeRegistrationValidation(
        record,
        getAuthorizationHeaderFromToken(token)
      )
    }

    if (job.name === 'record-validated') {
      return markEventAsRegistered(job.data, job.id || getUUID())
    }
  })
  await registerRecordWorker(REDIS_HOST, async (job) => {
    if (job.name === 'create-registration') {
      return registerRecordHandler(
        job.data.payload,
        job.data.event,
        job.data.token
      )
    }
    if (job.name === 'create-declaration') {
      return declareRecordHandler(
        job.data.payload,
        job.data.event,
        job.data.token
      )
    }
    if (job.name === 'create-validated-declaration') {
      return validateRecordHandler(
        job.data.payload,
        job.data.event,
        job.data.token
      )
    }
  })
}
