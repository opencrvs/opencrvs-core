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
  generateInCompleteFieldPoints,
  generateBirthRegPoint,
  generateDeathRegPoint,
  generateEventDurationPoint,
  generatePaymentPoint,
  generateDeclarationStartedPoint,
  generateTimeLoggedPoint,
  generateRejectedPoints,
  generateCorrectionReasonPoint,
  generateCertificationPoint,
  generateAuditPoint
} from '@metrics/features/registration/pointGenerator'
import { internal } from '@hapi/boom'
import { populateBundleFromPayload } from '@metrics/features/registration/utils'
import { Events } from '@metrics/features/metrics/constants'
import { IPoints } from '@metrics/features/registration'
import {
  getActionFromTask,
  getPractitionerIdFromBundle,
  getTask
} from '@metrics/features/registration/fhirUtils'

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
  const ipAddress = request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']
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
    points.push(
      await generateAuditPoint(
        getPractitionerIdFromBundle(request.payload as fhir.Bundle)!,
        getActionFromTask(
          getTask(request.payload as fhir.Bundle) as fhir.Task
        )!,
        ipAddress,
        userAgent
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
  const ipAddress = request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']
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
    points.push(
      await generateAuditPoint(
        getPractitionerIdFromBundle(request.payload as fhir.Bundle)!,
        getActionFromTask(
          getTask(request.payload as fhir.Bundle) as fhir.Task
        )!,
        ipAddress,
        userAgent
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
  const ipAddress = request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']
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
    points.push(
      await generateAuditPoint(
        getPractitionerIdFromBundle(request.payload as fhir.Bundle)!,
        getActionFromTask(
          getTask(request.payload as fhir.Bundle) as fhir.Task
        )!,
        ipAddress,
        userAgent
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
  const ipAddress = request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']
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
    points.push(
      await generateAuditPoint(
        getPractitionerIdFromBundle(request.payload as fhir.Bundle)!,
        getActionFromTask(
          getTask(request.payload as fhir.Bundle) as fhir.Task
        )!,
        ipAddress,
        userAgent
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
  const ipAddress = request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']
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
      await generateAuditPoint(
        getPractitionerIdFromBundle(request.payload as fhir.Bundle)!,
        getActionFromTask(
          getTask(request.payload as fhir.Bundle) as fhir.Task
        )!,
        ipAddress,
        userAgent
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

export async function newBirthRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const ipAddress = request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']
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
    points.push(
      await generateAuditPoint(
        getPractitionerIdFromBundle(request.payload as fhir.Bundle)!,
        getActionFromTask(
          getTask(request.payload as fhir.Bundle) as fhir.Task
        )!,
        ipAddress,
        userAgent
      )
    )
    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function markBirthRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const ipAddress = request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']
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
      }),
      generateAuditPoint(
        getPractitionerIdFromBundle(request.payload as fhir.Bundle)!,
        getActionFromTask(
          getTask(request.payload as fhir.Bundle) as fhir.Task
        )!,
        ipAddress,
        userAgent
      )
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
  const ipAddress = request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']
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
      }),
      await generateAuditPoint(
        getPractitionerIdFromBundle(request.payload as fhir.Bundle)!,
        getActionFromTask(
          getTask(request.payload as fhir.Bundle) as fhir.Task
        )!,
        ipAddress,
        userAgent
      )
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
  const ipAddress = request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']
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
      }),
      await generateAuditPoint(
        getPractitionerIdFromBundle(request.payload as fhir.Bundle)!,
        getActionFromTask(
          getTask(request.payload as fhir.Bundle) as fhir.Task
        )!,
        ipAddress,
        userAgent
      )
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
  const ipAddress = request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']
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
      }),
      await generateAuditPoint(
        getPractitionerIdFromBundle(request.payload as fhir.Bundle)!,
        getActionFromTask(
          getTask(request.payload as fhir.Bundle) as fhir.Task
        )!,
        ipAddress,
        userAgent
      )
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
  const ipAddress = request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']
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
      }),
      await generateAuditPoint(
        getPractitionerIdFromBundle(request.payload as fhir.Bundle)!,
        getActionFromTask(
          getTask(request.payload as fhir.Bundle) as fhir.Task
        )!,
        ipAddress,
        userAgent
      )
    ])

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }
  return h.response().code(200)
}
