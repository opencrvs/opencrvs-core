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

import {
  declarationsStartedHandler,
  declarationStartedMetricsByPractitionersHandler
} from '@metrics/features/declarationsStarted/handler'
import {
  exportHandler,
  monthlyExportHandler
} from '@metrics/features/export/handler'
import { getEventDurationHandler } from '@metrics/features/getEventDuration/handler'
import { getTimeLoggedHandler } from '@metrics/features/getTimeLogged/handler'
import { locationWiseEventEstimationsHandler } from '@metrics/features/locationWiseEventEstimations/handler'
import {
  metricsDeleteMeasurementHandler,
  deletePerformanceHandler,
  metricsHandler
} from '@metrics/features/metrics/handler'
import { monthWiseEventEstimationsHandler } from '@metrics/features/monthWiseEventEstimations/handler'

import {
  inProgressHandler,
  markCertifiedHandler,
  markRejectedHandler,
  markValidatedHandler,
  newDeclarationHandler,
  registrarRegistrationWaitingExternalValidationHandler,
  requestForRegistrarValidationHandler,
  declarationAssignedHandler,
  declarationUnassignedHandler,
  waitingExternalValidationHandler,
  declarationViewedHandler,
  declarationDownloadedHandler,
  declarationArchivedHandler,
  declarationReinstatedHandler,
  declarationUpdatedHandler,
  markEventRegisteredHandler,
  newEventRegistrationHandler,
  markIssuedHandler,
  markedAsDuplicate,
  markedAsNotDuplicate,
  correctionEventHandler
} from '@metrics/features/registration/handler'
import {
  getAdvancedSearchByClient,
  postAdvancedSearchByClient,
  responseSchema
} from '@metrics/features/searchMetrics/handler'
import {
  totalMetricsByLocation,
  totalMetricsByRegistrar,
  totalMetricsByTime,
  totalMetricsHandler
} from '@metrics/features/totalMetrics/handler'
import { totalPaymentsHandler } from '@metrics/features/payments/handler'
import { totalCorrectionsHandler } from '@metrics/features/corrections/handler'
import { locationStatisticsHandler } from '@metrics/features/locationStatistics/handler'
import { totalCertificationsHandler } from '@metrics/features/certifications/handler'
import {
  getUserAuditsHandler,
  newAuditHandler
} from '@metrics/features/audit/handler'
import * as Joi from 'joi'
import {
  getAllVSExport,
  vsExportHandler
} from '@metrics/features/vsExport/handler'
import {
  performanceDataRefreshHandler,
  refresh
} from '@metrics/features/performance/viewRefresher'
import { PRODUCTION, QA_ENV } from '@metrics/constants'

const enum RouteScope {
  NATLSYSADMIN = 'natlsysadmin'
}
export enum EventType {
  BIRTH = 'birth',
  DEATH = 'death',
  MARRIAGE = 'marriage'
}

/*
 * This route wrapper triggers a view update for materialised views
 * we read data to Metabase from. If you are not seeing your data updated
 * after a user action, you most likely need to add this wrapper to some
 * new endpoint handler here.
 */
function analyticsDataRefreshingRoute<T extends Array<any>, U>(
  handler: (...args: T) => U
) {
  // Do not use await for the refresh operation. This operation can take minutes or more.
  // Consider triggering this a task that will be left to be run in the background.
  return (...params: T) => {
    if (!PRODUCTION || QA_ENV) {
      refresh()
    }
    return handler(...params)
  }
}

export const getRoutes = () => {
  const routes = [
    // In progress declaration
    {
      method: 'POST',
      path: '/events/{event}/in-progress-declaration',
      handler: analyticsDataRefreshingRoute(inProgressHandler),
      config: {
        tags: ['api'],
        validate: {
          params: Joi.object({
            event: Joi.string().valid(...Object.values(EventType))
          })
        }
      }
    },

    // New declaration
    {
      method: 'POST',
      path: '/events/{event}/new-declaration',
      handler: analyticsDataRefreshingRoute(newDeclarationHandler),
      config: {
        tags: ['api'],
        validate: {
          params: Joi.object({
            event: Joi.string().valid(...Object.values(EventType))
          })
        }
      }
    },

    // Request for registrar validation
    {
      method: 'POST',
      path: '/events/{event}/request-for-registrar-validation',
      handler: analyticsDataRefreshingRoute(
        requestForRegistrarValidationHandler
      ),
      config: {
        tags: ['api'],
        validate: {
          params: Joi.object({
            event: Joi.string().valid(...Object.values(EventType))
          })
        }
      }
    },
    {
      method: 'POST',
      path: '/events/marked-as-duplicate',
      handler: markedAsDuplicate,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/not-duplicate',
      handler: markedAsNotDuplicate,
      config: {
        tags: ['api']
      }
    },

    // Waiting external resource validation
    {
      method: 'POST',
      path: '/events/{event}/waiting-external-resource-validation',
      handler: waitingExternalValidationHandler,
      config: {
        tags: ['api'],
        validate: {
          params: Joi.object({
            event: Joi.string().valid(...Object.values(EventType))
          })
        }
      }
    },
    {
      method: 'POST',
      path: '/events/{event}/registrar-registration-waiting-external-resource-validation',
      handler: registrarRegistrationWaitingExternalValidationHandler,
      config: {
        tags: ['api'],
        validate: {
          params: Joi.object({
            event: Joi.string().valid(...Object.values(EventType))
          })
        }
      }
    },

    {
      method: 'POST',
      path: '/events/{event}/new-registration',
      handler: analyticsDataRefreshingRoute(newEventRegistrationHandler),
      config: {
        tags: ['api'],
        validate: {
          params: Joi.object({
            event: Joi.string().valid(...Object.values(EventType))
          })
        }
      }
    },

    // Mark validated
    {
      method: 'POST',
      path: '/events/{event}/mark-validated',
      handler: analyticsDataRefreshingRoute(markValidatedHandler),
      config: {
        tags: ['api'],
        validate: {
          params: Joi.object({
            event: Joi.string().valid(...Object.values(EventType))
          })
        }
      }
    },

    // Mark registered
    {
      method: 'POST',
      path: '/events/{event}/mark-registered',
      handler: analyticsDataRefreshingRoute(markEventRegisteredHandler),
      config: {
        tags: ['api'],
        validate: {
          params: Joi.object({
            event: Joi.string().valid(...Object.values(EventType))
          })
        }
      }
    },
    // Mark certified
    {
      method: 'POST',
      path: '/events/{event}/mark-certified',
      handler: analyticsDataRefreshingRoute(markCertifiedHandler),
      config: {
        tags: ['api'],
        validate: {
          params: Joi.object({
            event: Joi.string().valid(...Object.values(EventType))
          })
        }
      }
    },

    // Mark issued
    {
      method: 'POST',
      path: '/events/{event}/mark-issued',
      handler: analyticsDataRefreshingRoute(markIssuedHandler),
      config: {
        tags: ['api'],
        validate: {
          params: Joi.object({
            event: Joi.string().valid(...Object.values(EventType))
          })
        }
      }
    },

    // Mark rejected
    {
      method: 'POST',
      path: '/events/{event}/mark-voided',
      handler: analyticsDataRefreshingRoute(markRejectedHandler),
      config: {
        tags: ['api'],
        validate: {
          params: Joi.object({
            event: Joi.string().valid(...Object.values(EventType))
          })
        }
      }
    },

    // Advanced Search quota
    {
      method: 'GET',
      path: '/advancedSearch',
      handler: getAdvancedSearchByClient,
      config: {
        tags: ['api'],
        response: {
          schema: responseSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/advancedSearch',
      handler: postAdvancedSearchByClient,
      config: {
        tags: ['api']
      }
    },

    // Request correction
    {
      method: 'POST',
      path: '/events/{event}/make-correction',
      handler: analyticsDataRefreshingRoute(correctionEventHandler),
      config: {
        tags: ['api'],
        validate: {
          params: Joi.object({
            event: Joi.string().valid(...Object.values(EventType))
          })
        }
      }
    },
    {
      method: 'POST',
      path: '/events/{event}/request-correction',
      handler: analyticsDataRefreshingRoute(correctionEventHandler),
      config: {
        tags: ['api'],
        validate: {
          params: Joi.object({
            event: Joi.string().valid(...Object.values(EventType))
          })
        }
      }
    },

    // Event assigned / unassigned
    {
      method: 'POST',
      path: '/events/assigned',
      handler: declarationAssignedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/downloaded',
      handler: declarationDownloadedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/viewed',
      handler: declarationViewedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/{event}/mark-archived',
      handler: analyticsDataRefreshingRoute(declarationArchivedHandler),
      config: {
        tags: ['api'],
        validate: {
          params: Joi.object({
            event: Joi.string().valid(...Object.values(EventType))
          })
        }
      }
    },
    {
      method: 'POST',
      path: '/events/{event}/mark-reinstated',
      handler: analyticsDataRefreshingRoute(declarationReinstatedHandler),
      config: {
        tags: ['api'],
        validate: {
          params: Joi.object({
            event: Joi.string().valid(...Object.values(EventType))
          })
        }
      }
    },
    {
      method: 'POST',
      path: '/events/unassigned',
      handler: declarationUnassignedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/declaration-updated',
      handler: declarationUpdatedHandler,
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
      path: '/totalMetricsByRegistrar',
      handler: totalMetricsByRegistrar,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string(),
            event: Joi.string().required(),
            skip: Joi.number().required(),
            size: Joi.number().required()
          })
        },
        tags: ['api']
      }
    },

    {
      method: 'GET',
      path: '/totalMetricsByLocation',
      handler: totalMetricsByLocation,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            event: Joi.string().required(),
            locationId: Joi.string(),
            skip: Joi.number().required(),
            size: Joi.number().required()
          })
        },
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/totalMetricsByTime',
      handler: totalMetricsByTime,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            event: Joi.string().required(),
            locationId: Joi.string(),
            skip: Joi.number().required(),
            size: Joi.number().required()
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
      path: '/totalCertifications',
      handler: totalCertificationsHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string()
          })
        },
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/totalCorrections',
      handler: totalCorrectionsHandler,
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
      path: '/locationStatistics',
      handler: locationStatisticsHandler,
      config: {
        validate: {
          query: Joi.object({
            locationId: Joi.string(),
            populationYear: Joi.string()
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
            locationId: Joi.string(),
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
            locationId: Joi.string(),
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
    {
      method: 'GET',
      path: '/vsExport',
      handler: vsExportHandler,
      config: {
        tags: ['api'],
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/refreshPerformanceData',
      handler: performanceDataRefreshHandler,
      config: {
        tags: ['api'],
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/fetchVSExport',
      handler: getAllVSExport,
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
    },
    // delete all measurements ocrvs database from influx
    {
      method: 'DELETE',
      path: '/influxMeasurement',
      handler: metricsDeleteMeasurementHandler,
      config: {
        auth: {
          scope: [RouteScope.NATLSYSADMIN]
        },
        tags: ['api']
      }
    },
    //delete performance
    {
      method: 'DELETE',
      path: '/performance',
      handler: deletePerformanceHandler,
      config: {
        auth: {
          scope: [RouteScope.NATLSYSADMIN]
        },
        tags: ['api']
      }
    },
    // new Audit handler
    {
      method: 'POST',
      path: '/audit/events',
      handler: newAuditHandler,
      config: {
        tags: ['api'],
        auth: false
      }
    },
    // GET user audit events
    {
      method: 'GET',
      path: '/audit/events',
      handler: getUserAuditsHandler,
      config: {
        validate: {
          query: Joi.object({
            practitionerId: Joi.string().required(),
            skip: Joi.number(),
            count: Joi.number(),
            timeStart: Joi.string(),
            timeEnd: Joi.string()
          })
        },
        tags: ['api']
      }
    }
  ]
  return routes
}
