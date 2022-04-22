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
import * as Joi from 'joi'
import {
  inProgressHandler,
  markBirthRegisteredHandler,
  newBirthRegistrationHandler,
  markCertifiedHandler,
  markValidatedHandler,
  markRejectedHandler,
  waitingExternalValidationHandler,
  markDeathRegisteredHandler,
  newDeathRegistrationHandler,
  newDeclarationHandler,
  registrarRegistrationWaitingExternalValidationHandler,
  requestForRegistrarValidationHandler,
  requestCorrectionHandler
} from '@metrics/features/registration/handler'
import { metricsHandler } from '@metrics/features/metrics/handler'
import { monthWiseEventEstimationsHandler } from '@metrics/features/monthWiseEventEstimations/handler'
import { locationWiseEventEstimationsHandler } from '@metrics/features/locationWiseEventEstimations/handler'
import {
  declarationsStartedHandler,
  declarationStartedMetricsByPractitionersHandler
} from '@metrics/features/declarationsStarted/handler'
import { getTimeLoggedHandler } from '@metrics/features/getTimeLogged/handler'
import {
  exportHandler,
  monthlyExportHandler
} from '@metrics/features/export/handler'
import {
  generateLegacyMetricsHandler,
  generateLegacyEventDurationHandler
} from '@metrics/features/legacy/handler'
import { getEventDurationHandler } from '@metrics/features/getEventDuration/handler'
import { totalMetricsHandler } from '@metrics/features/totalMetrics/handler'
import { totalPaymentsHandler } from '@metrics/features/payments/handler'

export const getRoutes = () => {
  const routes = [
    // In progress declaration
    {
      method: 'POST',
      path: '/events/birth/in-progress-declaration',
      handler: inProgressHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/in-progress-declaration',
      handler: inProgressHandler,
      config: {
        tags: ['api']
      }
    },

    // New declaration
    {
      method: 'POST',
      path: '/events/birth/new-declaration',
      handler: newDeclarationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/new-declaration',
      handler: newDeclarationHandler,
      config: {
        tags: ['api']
      }
    },

    // Request for registrar validation
    {
      method: 'POST',
      path: '/events/birth/request-for-registrar-validation',
      handler: requestForRegistrarValidationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/request-for-registrar-validation',
      handler: requestForRegistrarValidationHandler,
      config: {
        tags: ['api']
      }
    },

    // Waiting external resource validation
    {
      method: 'POST',
      path: '/events/birth/waiting-external-resource-validation',
      handler: waitingExternalValidationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/waiting-external-resource-validation',
      handler: waitingExternalValidationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/birth/registrar-registration-waiting-external-resource-validation',
      handler: registrarRegistrationWaitingExternalValidationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/registrar-registration-waiting-external-resource-validation',
      handler: registrarRegistrationWaitingExternalValidationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/birth/new-registration',
      handler: newBirthRegistrationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/new-registration',
      handler: newDeathRegistrationHandler,
      config: {
        tags: ['api']
      }
    },

    // Mark validated
    {
      method: 'POST',
      path: '/events/birth/mark-validated',
      handler: markValidatedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/mark-validated',
      handler: markValidatedHandler,
      config: {
        tags: ['api']
      }
    },

    // Mark registered
    {
      method: 'POST',
      path: '/events/birth/mark-registered',
      handler: markBirthRegisteredHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/mark-registered',
      handler: markDeathRegisteredHandler,
      config: {
        tags: ['api']
      }
    },

    // Mark certified
    {
      method: 'POST',
      path: '/events/birth/mark-certified',
      handler: markCertifiedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/mark-certified',
      handler: markCertifiedHandler,
      config: {
        tags: ['api']
      }
    },

    // Mark rejected
    {
      method: 'POST',
      path: '/events/birth/mark-voided',
      handler: markRejectedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/mark-voided',
      handler: markRejectedHandler,
      config: {
        tags: ['api']
      }
    },

    // Request correction
    {
      method: 'POST',
      path: '/events/birth/request-correction',
      handler: requestCorrectionHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/request-correction',
      handler: requestCorrectionHandler,
      config: {
        tags: ['api']
      }
    },

    // Metrics query API
    {
      method: 'GET',
      path: '/metrics',
      handler: metricsHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string().required(),
            event: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },

    // Area wise declarations started query API
    {
      method: 'GET',
      path: '/declarationsStarted',
      handler: declarationsStartedHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },

    {
      method: 'GET',
      path: '/totalMetrics',
      handler: totalMetricsHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string(),
            event: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/totalPayments',
      handler: totalPaymentsHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string(),
            event: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },

    {
      method: 'GET',
      path: '/monthWiseEventEstimations',
      handler: monthWiseEventEstimationsHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string().required(),
            event: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },

    {
      method: 'GET',
      path: '/locationWiseEventEstimations',
      handler: locationWiseEventEstimationsHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string().required(),
            event: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },
    // event duration query by declaration id
    {
      method: 'GET',
      path: '/eventDuration',
      handler: getEventDurationHandler,
      config: {
        validate: {
          query: Joi.object({
            compositionId: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },
    // Time logged query by declaration status API
    {
      method: 'GET',
      path: '/timeLogged',
      handler: getTimeLoggedHandler,
      config: {
        validate: {
          query: Joi.object({
            compositionId: Joi.string().required(),
            status: Joi.string().optional()
          })
        },
        tags: ['api']
      }
    },

    // Time logged query by declaration status API
    {
      method: 'GET',
      path: '/timeLoggedMetricsByPractitioner',
      handler: getTimeLoggedHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            practitionerId: Joi.string().required(),
            locationId: Joi.string().required(),
            count: Joi.number().required()
          })
        },
        tags: ['api']
      }
    },

    {
      method: 'POST',
      path: '/declarationStartedMetricsByPractitioners',
      handler: declarationStartedMetricsByPractitionersHandler,
      config: {
        validate: {
          payload: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string().required(),
            event: Joi.string().optional(),
            practitionerIds: Joi.array().required()
          })
        },
        tags: ['api']
      }
    },

    // Export all data from InfluxDB to CSV
    {
      method: 'GET',
      path: '/export',
      handler: exportHandler,
      config: {
        tags: ['api']
      }
    },
    // Export all data from InfluxDB to CSV
    {
      method: 'GET',
      path: '/monthlyExport',
      handler: monthlyExportHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string().required(),
            event: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },

    // Generate metrics from legacy data
    {
      method: 'GET',
      path: '/generate',
      handler: generateLegacyMetricsHandler,
      config: {
        tags: ['api']
      }
    },

    // Generate metrics from legacy data
    {
      method: 'GET',
      path: '/generateEventDurationMetrics',
      handler: generateLegacyEventDurationHandler,
      config: {
        tags: ['api']
      }
    },

    // used for tests to check JWT auth
    {
      method: 'GET',
      path: '/tokenTest',
      handler: (request: any, h: any) => {
        return 'success'
      },
      config: {
        tags: ['api']
      }
    },

    // add ping route by default for health check
    {
      method: 'GET',
      path: '/ping',
      handler: (request: any, h: any) => {
        // Perform any health checks and return true or false for success prop
        return {
          success: true
        }
      },
      config: {
        auth: false,
        tags: ['api'],
        description: 'Health check endpoint'
      }
    }
  ]
  return routes
}
