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
import { writePoints } from '@metrics/influxdb/client'
import {
  generateBirthRegPoint,
  generateCertificationPoint,
  generateCorrectionReasonPoint,
  generateDeathRegPoint,
  generateDeclarationStartedPoint,
  generateEventDurationPoint,
  generateInCompleteFieldPoints,
  generatePaymentPoint,
  generateRejectedPoints,
  generateTimeLoggedPoint
} from '@metrics/features/registration/pointGenerator'
import { internal } from '@hapi/boom'
import { populateBundleFromPayload } from '@metrics/features/registration/utils'
import { Events } from '@metrics/features/metrics/constants'
import { IPoints } from '@metrics/features/registration'
import { createUserAuditPointFromFHIR } from '@metrics/features/audit/service'
import {
  getActionFromTask,
  getTask
} from '@metrics/features/registration/fhirUtils'
import { EventType } from '@metrics/config/routes'

export async function waitingExternalValidationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const points = []
  try {
    points.push(
      await generateTimeLoggedPoint(request.payload as fhir.Bundle, {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      })
    )
    points.push(
      await generateEventDurationPoint(
        request.payload as fhir.Bundle,
        ['IN_PROGRESS', 'DECLARED', 'VALIDATED'],
        {
          Authorization: request.headers.authorization,
          'x-correlation-id': request.headers['x-correlation-id']
        }
      )
    )

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function requestForRegistrarValidationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const points = []
  await createUserAuditPointFromFHIR('SENT_FOR_APPROVAL', request)
  try {
    points.push(
      await generateTimeLoggedPoint(request.payload as fhir.Bundle, {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      })
    )
    points.push(
      await generateDeclarationStartedPoint(
        request.payload as fhir.Bundle,
        {
          Authorization: request.headers.authorization,
          'x-correlation-id': request.headers['x-correlation-id']
        },
        Events.REQUEST_FOR_REGISTRAR_VALIDATION
      )
    )

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function registrarRegistrationWaitingExternalValidationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const points = []
  try {
    points.push(
      await generateTimeLoggedPoint(request.payload as fhir.Bundle, {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      })
    )
    points.push(
      await generateDeclarationStartedPoint(
        request.payload as fhir.Bundle,
        {
          Authorization: request.headers.authorization,
          'x-correlation-id': request.headers['x-correlation-id']
        },
        Events.REGISTRAR_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION
      )
    )
    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function newDeclarationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const points = []

  await createUserAuditPointFromFHIR('DECLARED', request)

  try {
    points.push(
      await generateTimeLoggedPoint(request.payload as fhir.Bundle, {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      })
    )
    points.push(
      await generateDeclarationStartedPoint(
        request.payload as fhir.Bundle,
        {
          Authorization: request.headers.authorization,
          'x-correlation-id': request.headers['x-correlation-id']
        },
        Events.NEW_DEC
      )
    )

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function inProgressHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('IN_PROGRESS', request)
  try {
    const points = await generateInCompleteFieldPoints(
      request.payload as fhir.Bundle,
      {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      }
    )
    points.push(
      await generateTimeLoggedPoint(request.payload as fhir.Bundle, {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      })
    )
    points.push(
      await generateDeclarationStartedPoint(
        request.payload as fhir.Bundle,
        {
          Authorization: request.headers.authorization,
          'x-correlation-id': request.headers['x-correlation-id']
        },
        Events.IN_PROGRESS_DEC
      )
    )

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function markRejectedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('REJECTED', request)
  try {
    const points: IPoints[] = []
    points.push(
      await generateRejectedPoints(request.payload as fhir.Bundle, {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      })
    )
    points.push(
      await generateTimeLoggedPoint(
        request.payload as fhir.Bundle,
        {
          Authorization: request.headers.authorization,
          'x-correlation-id': request.headers['x-correlation-id']
        },
        true
      )
    )

    points.push(
      await generateEventDurationPoint(
        request.payload as fhir.Bundle,
        ['IN_PROGRESS', 'DECLARED', 'VALIDATED'],
        {
          Authorization: request.headers.authorization,
          'x-correlation-id': request.headers['x-correlation-id']
        },
        true
      )
    )
    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function newEventRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const event = request.params.event as EventType
  if (event === EventType.BIRTH) {
    return newBirthRegistrationHandler(request, h)
  } else if (event === EventType.DEATH) {
    return newDeathRegistrationHandler(request, h)
  }

  return h.response().code(200)
}

export async function newBirthRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('REGISTERED', request)
  const points = []
  try {
    points.push(
      await generateBirthRegPoint(
        request.payload as fhir.Bundle,
        'register-new-declaration',
        {
          Authorization: request.headers.authorization,
          'x-correlation-id': request.headers['x-correlation-id']
        }
      ),
      await generateTimeLoggedPoint(request.payload as fhir.Bundle, {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      })
    )

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function markEventRegistererHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const event = request.params.event as EventType
  if (event === EventType.BIRTH) {
    return markBirthRegisteredHandler(request, h)
  } else if (event === EventType.DEATH) {
    return markDeathRegisteredHandler(request, h)
  }
  return h.response().code(200)
}

export async function markBirthRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('REGISTERED', request)
  try {
    const bundle = await populateBundleFromPayload(
      request.payload as fhir.Bundle | fhir.Task,
      request.headers.authorization
    )

    const points = await Promise.all([
      generateEventDurationPoint(
        bundle,
        ['IN_PROGRESS', 'DECLARED', 'VALIDATED', 'WAITING_VALIDATION'],
        {
          Authorization: request.headers.authorization,
          'x-correlation-id': request.headers['x-correlation-id']
        }
      ),
      generateBirthRegPoint(bundle, 'mark-existing-declaration-registered', {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      }),
      generateTimeLoggedPoint(bundle, {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      })
    ])

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function newDeathRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('REGISTERED', request)

  const points = []
  try {
    points.push(
      await generateDeathRegPoint(
        request.payload as fhir.Bundle,
        'register-new-declaration',
        {
          Authorization: request.headers.authorization,
          'x-correlation-id': request.headers['x-correlation-id']
        }
      ),
      await generateTimeLoggedPoint(request.payload as fhir.Bundle, {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      })
    )
    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function markDeathRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('REGISTERED', request)

  try {
    const bundle = await populateBundleFromPayload(
      request.payload as fhir.Bundle | fhir.Task,
      request.headers.authorization
    )

    const points = await Promise.all([
      generateEventDurationPoint(
        bundle,
        ['IN_PROGRESS', 'DECLARED', 'VALIDATED', 'WAITING_VALIDATION'],
        {
          Authorization: request.headers.authorization,
          'x-correlation-id': request.headers['x-correlation-id']
        }
      ),
      generateDeathRegPoint(bundle, 'mark-existing-declaration-registered', {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      }),
      generateTimeLoggedPoint(bundle, {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      })
    ])

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function markCertifiedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('CERTIFIED', request)
  try {
    const points = await Promise.all([
      generateCertificationPoint(request.payload as fhir.Bundle, {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      }),
      generatePaymentPoint(
        request.payload as fhir.Bundle,
        {
          Authorization: request.headers.authorization,
          'x-correlation-id': request.headers['x-correlation-id']
        },
        'certification'
      ),
      generateEventDurationPoint(
        request.payload as fhir.Bundle,
        ['REGISTERED'],
        {
          Authorization: request.headers.authorization,
          'x-correlation-id': request.headers['x-correlation-id']
        }
      )
    ])

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function markValidatedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('VALIDATED', request)
  try {
    const points = await Promise.all([
      generateEventDurationPoint(
        request.payload as fhir.Bundle,
        ['IN_PROGRESS', 'DECLARED'],
        {
          Authorization: request.headers.authorization,
          'x-correlation-id': request.headers['x-correlation-id']
        }
      ),
      generateTimeLoggedPoint(request.payload as fhir.Bundle, {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      })
    ])

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function requestCorrectionHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('CORRECTED', request)
  try {
    const points = await Promise.all([
      generatePaymentPoint(
        request.payload as fhir.Bundle,
        {
          Authorization: request.headers.authorization
        },
        'correction'
      ),
      generateCorrectionReasonPoint(request.payload as fhir.Bundle, {
        Authorization: request.headers.authorization
      }),
      generateEventDurationPoint(
        request.payload as fhir.Bundle,
        ['REGISTERED', 'CERTIFIED'],
        {
          Authorization: request.headers.authorization
        }
      ),
      generateTimeLoggedPoint(request.payload as fhir.Bundle, {
        Authorization: request.headers.authorization
      })
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
  await createUserAuditPointFromFHIR('ASSIGNED', request)
  return h.response().code(200)
}

export async function declarationUnassignedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('UNASSIGNED', request)
  return h.response().code(200)
}

export async function declarationDownloadedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('RETRIEVED', request)
  return h.response().code(200)
}

export async function declarationViewedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('VIEWED', request)
  return h.response().code(200)
}

export async function birthOrDeathDeclarationArchivedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('ARCHIVED', request)
  return h.response().code(200)
}

export async function birthOrDeathDeclarationReinstatedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const bundle = request.payload as fhir.Bundle
  const task = getTask(bundle)
  const previousAction = getActionFromTask(task!)
  if (previousAction === 'IN_PROGRESS') {
    await createUserAuditPointFromFHIR('REINSTATED_IN_PROGRESS', request)
  }
  if (previousAction === 'DECLARED') {
    await createUserAuditPointFromFHIR('REINSTATED_DECLARED', request)
  }
  if (previousAction === 'REJECTED') {
    await createUserAuditPointFromFHIR('REINSTATED_REJECTED', request)
  }
  return h.response().code(200)
}

export async function declarationUpdatedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  await createUserAuditPointFromFHIR('DECLARATION_UPDATED', request)
  return h.response().code(200)
}
