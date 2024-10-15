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
import { badRequest, internal } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import {
  generateBirthRegPoint,
  generateCertificationPoint,
  generateCorrectionReasonPoint,
  generateDeathRegPoint,
  generateDeclarationStartedPoint,
  generateEventDurationPoint,
  generateInCompleteFieldPoints,
  generateMarriageRegPoint,
  generatePaymentPoint,
  generateRejectedPoints,
  generateTimeLoggedPoint
} from '@metrics/features/registration/pointGenerator'
import { writePoints } from '@metrics/influxdb/client'

import { fetchTaskHistory } from '@metrics/api'
import { createUserAuditPointFromFHIR } from '@metrics/features/audit/service'
import { Events } from '@metrics/features/metrics/constants'
import { IPoints } from '@metrics/features/registration'
import {
  findExtension,
  getActionFromTask,
  getPaymentReconciliation,
  getTask,
  MAKE_CORRECTION_EXTENSION_URL
} from '@metrics/features/registration/fhirUtils'
import { getScopes, Scope } from '@opencrvs/commons/authentication'
import {
  getEventLabelFromBundle,
  RejectedRecord,
  SavedBundle,
  SavedBundleEntry,
  ValidRecord
} from '@opencrvs/commons/types'

export async function waitingExternalValidation(
  bundle: SavedBundle,
  transactionId: string
) {
  const points = []
  points.push(await generateTimeLoggedPoint(bundle))
  points.push(
    await generateEventDurationPoint(bundle, [
      'IN_PROGRESS',
      'DECLARED',
      'VALIDATED'
    ])
  )

  return writePoints(points, transactionId)
}
export async function waitingExternalValidationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { record, transactionId } = request.payload as {
    record: ValidRecord
    transactionId: string
  }
  await waitingExternalValidation(record, transactionId)

  return h.response().code(200)
}

export async function markedAsDuplicate(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('MARKED_AS_DUPLICATE', {
    headers: request.headers,
    record: request.payload as ValidRecord
  })
  return h.response().code(200)
}

export async function markedAsNotDuplicate(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('MARKED_AS_NOT_DUPLICATE', {
    headers: request.headers,
    record: request.payload as ValidRecord
  })
  return h.response().code(200)
}

export async function sentForApproval(
  bundle: SavedBundle,
  transactionId: string
) {
  const points = await Promise.all([
    generateEventDurationPoint(bundle, ['IN_PROGRESS', 'DECLARED']),
    generateTimeLoggedPoint(bundle)
  ])

  return writePoints(points, transactionId)
}

export async function sentForApprovalHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { record, transactionId } = request.payload as {
    record: ValidRecord
    transactionId: string
  }

  await sentForApproval(record, transactionId)

  return h.response().code(200)
}

export async function sentNotificationForReview(
  bundle: SavedBundle,
  transactionId: string,
  userScopes: Scope[]
) {
  const points = []

  const startState = userScopes.includes('validate')
    ? Events.VALIDATED
    : userScopes.includes('register')
    ? Events.WAITING_EXTERNAL_VALIDATION
    : Events.READY_FOR_REVIEW

  points.push(await generateTimeLoggedPoint(bundle))
  points.push(await generateDeclarationStartedPoint(bundle, startState))

  return writePoints(points, transactionId)
}

export async function sentNotificationForReviewHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { record, transactionId } = request.payload as {
    record: ValidRecord
    transactionId: string
  }

  await sentNotificationForReview(
    record,
    transactionId,
    getScopes(request.headers.authorization)
  )

  return h.response().code(200)
}

export async function sentNotification(
  bundle: SavedBundle,
  transactionId: string
) {
  const points = await generateInCompleteFieldPoints(bundle)
  points.push(await generateTimeLoggedPoint(bundle))
  points.push(await generateDeclarationStartedPoint(bundle, Events.INCOMPLETE))
  return writePoints(points, transactionId)
}

export async function sentNotificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { record, transactionId } = request.payload as {
    record: ValidRecord
    transactionId: string
  }

  await sentNotification(record, transactionId)

  return h.response().code(200)
}

export async function sentForUpdates(record: RejectedRecord) {
  const points: IPoints[] = []
  points.push(await generateRejectedPoints(record))
  points.push(await generateTimeLoggedPoint(record, true))
  points.push(
    await generateEventDurationPoint(
      record,
      ['IN_PROGRESS', 'DECLARED', 'VALIDATED', 'WAITING_VALIDATION'],
      true
    )
  )
  await writePoints(points)
}

export async function sentForUpdatesHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('REJECTED', {
    headers: request.headers,
    record: request.payload as ValidRecord
  })

  await sentForUpdates(request.payload as RejectedRecord)

  return h.response().code(200)
}

export async function markEventRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { record, transactionId } = request.payload as {
    record: ValidRecord
    transactionId: string
  }

  const event = getEventLabelFromBundle(record)

  if (event === 'BirthRegistration') {
    return markBirthRegisteredHandler(request, h, transactionId)
  } else if (event === 'DeathRegistration') {
    return markDeathRegisteredHandler(request, h, transactionId)
  } else if (event === 'MarriageRegistration') {
    return markMarriageRegisteredHandler(request, h, transactionId)
  }
  return h.response().code(200)
}

async function markBirthRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  transactionId: string
) {
  const { record } = request.payload as {
    record: ValidRecord
    transactionId: string
  }

  const points = await Promise.all([
    generateEventDurationPoint(record, [
      'IN_PROGRESS',
      'DECLARED',
      'VALIDATED',
      'WAITING_VALIDATION'
    ]),
    generateBirthRegPoint(record, 'mark-existing-declaration-registered', {
      Authorization: request.headers.authorization,
      'x-correlation-id': request.headers['x-correlation-id']
    }),
    generateTimeLoggedPoint(record)
  ])

  await writePoints(points, transactionId)

  return h.response().code(200)
}

export async function markDeathRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  transactionId: string
) {
  const { record } = request.payload as {
    record: ValidRecord
    transactionId: string
  }
  const points = await Promise.all([
    generateEventDurationPoint(record, [
      'IN_PROGRESS',
      'DECLARED',
      'VALIDATED',
      'WAITING_VALIDATION'
    ]),
    generateDeathRegPoint(record, 'mark-existing-declaration-registered', {
      Authorization: request.headers.authorization,
      'x-correlation-id': request.headers['x-correlation-id']
    }),
    generateTimeLoggedPoint(record)
  ])

  await writePoints(points, transactionId)

  return h.response().code(200)
}

export async function markCertifiedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('CERTIFIED', {
    headers: request.headers,
    record: request.payload as ValidRecord
  })
  try {
    const points = await generateEventDurationPoint(
      request.payload as ValidRecord,
      ['REGISTERED', 'ISSUED']
    )

    await writePoints([points])
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function markIssuedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('ISSUED', {
    headers: request.headers,
    record: request.payload as ValidRecord
  })
  try {
    const points = await Promise.all([
      generatePaymentPoint(
        request.payload as ValidRecord,
        {
          Authorization: request.headers.authorization,
          'x-correlation-id': request.headers['x-correlation-id']
        },
        'certification'
      ),
      generateCertificationPoint(request.payload as ValidRecord, {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      }),
      generateEventDurationPoint(request.payload as ValidRecord, ['CERTIFIED'])
    ])
    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

type TaskBundleEntry = Omit<SavedBundleEntry, 'resource'> & {
  resource: fhir.Task
}

export async function correctionEventHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const task = getTask(request.payload as ValidRecord)

  if (!task) {
    return badRequest('No task found in received bundle')
  }

  const history = await fetchTaskHistory(task.id!)

  const latestCorrectionTask: TaskBundleEntry | undefined = history.entry?.find(
    (entry: TaskBundleEntry): entry is TaskBundleEntry =>
      entry.resource.businessStatus?.coding?.[0].code ===
        'CORRECTION_REQUESTED' ||
      Boolean(
        findExtension(MAKE_CORRECTION_EXTENSION_URL, entry.resource.extension!)
      )
  )

  if (!latestCorrectionTask) {
    return badRequest('No correction task found in received bundle')
  }

  if (latestCorrectionTask.resource.status === 'ready') {
    return correctionHandler(request, h)
  }
  if (latestCorrectionTask.resource.status === 'accepted') {
    return approveCorrectionHandler(request, h)
  }
  if (latestCorrectionTask.resource.status === 'rejected') {
    return rejectCorrectionHandler(request, h)
  }

  if (latestCorrectionTask.resource.status === 'requested') {
    return requestCorrectionHandler(request, h)
  }

  return badRequest('Task is in an unknown state')
}

async function correctionHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('CORRECTED', {
    headers: request.headers,
    record: request.payload as ValidRecord
  })
  const payload = request.payload as ValidRecord
  const payment = getPaymentReconciliation(payload)
  try {
    const points = await Promise.all([
      ...(payment
        ? [
            generatePaymentPoint(
              payload,
              {
                Authorization: request.headers.authorization
              },
              'correction'
            )
          ]
        : []),
      generateCorrectionReasonPoint(payload, {
        Authorization: request.headers.authorization
      }),
      generateEventDurationPoint(payload, ['REGISTERED', 'CERTIFIED']),
      generateTimeLoggedPoint(payload)
    ])

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }
  return h.response().code(200)
}

async function approveCorrectionHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('APPROVED_CORRECTION', {
    headers: request.headers,
    record: request.payload as ValidRecord
  })
  const payload = request.payload as ValidRecord
  const payment = getPaymentReconciliation(payload)

  try {
    const points = await Promise.all([
      ...(payment
        ? [
            generatePaymentPoint(
              payload,
              {
                Authorization: request.headers.authorization
              },
              'correction'
            )
          ]
        : []),
      generateCorrectionReasonPoint(payload, {
        Authorization: request.headers.authorization
      }),
      generateEventDurationPoint(payload, ['CORRECTION_REQUESTED']),
      generateTimeLoggedPoint(payload)
    ])

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }
  return h.response().code(200)
}
async function rejectCorrectionHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('REJECTED_CORRECTION', {
    headers: request.headers,
    record: request.payload as ValidRecord
  })
  try {
    const points = await Promise.all([
      generateEventDurationPoint(request.payload as ValidRecord, [
        'REGISTERED',
        'CERTIFIED'
      ]),
      generateTimeLoggedPoint(request.payload as ValidRecord)
    ])

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }
  return h.response().code(200)
}

async function requestCorrectionHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('REQUESTED_CORRECTION', {
    headers: request.headers,
    record: request.payload as ValidRecord
  })
  try {
    const points = await Promise.all([
      generateCorrectionReasonPoint(request.payload as ValidRecord, {
        Authorization: request.headers.authorization
      }),
      generateEventDurationPoint(request.payload as ValidRecord, [
        'REGISTERED',
        'CERTIFIED'
      ]),
      generateTimeLoggedPoint(request.payload as ValidRecord)
    ])

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }
  return h.response().code(200)
}

export async function declarationAssignedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('ASSIGNED', {
    headers: request.headers,
    record: request.payload as ValidRecord
  })
  return h.response().code(200)
}

export async function declarationUnassignedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('UNASSIGNED', {
    headers: request.headers,
    record: request.payload as ValidRecord
  })
  return h.response().code(200)
}

export async function declarationDownloadedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('RETRIEVED', {
    headers: request.headers,
    record: request.payload as ValidRecord
  })
  return h.response().code(200)
}

export async function declarationViewedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('VIEWED', {
    headers: request.headers,
    record: request.payload as ValidRecord
  })
  return h.response().code(200)
}

export async function declarationArchivedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('ARCHIVED', {
    headers: request.headers,
    record: request.payload as ValidRecord
  })
  return h.response().code(200)
}

export async function declarationReinstatedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const bundle = request.payload as ValidRecord
  const task = getTask(bundle)
  const previousAction = getActionFromTask(task!)
  if (previousAction === 'IN_PROGRESS') {
    await createUserAuditPointFromFHIR('REINSTATED_IN_PROGRESS', {
      headers: request.headers,
      record: request.payload as ValidRecord
    })
  }
  if (previousAction === 'DECLARED') {
    await createUserAuditPointFromFHIR('REINSTATED_DECLARED', {
      headers: request.headers,
      record: request.payload as ValidRecord
    })
  }
  if (previousAction === 'REJECTED') {
    await createUserAuditPointFromFHIR('REINSTATED_REJECTED', {
      headers: request.headers,
      record: request.payload as ValidRecord
    })
  }
  return h.response().code(200)
}

export async function declarationUpdatedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('DECLARATION_UPDATED', {
    headers: request.headers,
    record: request.payload as ValidRecord
  })
  return h.response().code(200)
}

export async function markMarriageRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  transactionId: string
) {
  const { record } = request.payload as {
    record: ValidRecord
    transactionId: string
  }
  const points = await Promise.all([
    generateEventDurationPoint(record, [
      'IN_PROGRESS',
      'DECLARED',
      'VALIDATED',
      'WAITING_VALIDATION'
    ]),
    generateMarriageRegPoint(
      record,
      {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      },
      'mark-existing-declaration-registered'
    ),
    generateTimeLoggedPoint(record)
  ])

  await writePoints(points, transactionId)

  return h.response().code(200)
}
