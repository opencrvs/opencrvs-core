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
  sentNotificationHandler,
  markCertifiedHandler,
  sentForUpdatesHandler,
  sentNotificationForReviewHandler,
  sentForApprovalHandler,
  declarationAssignedHandler,
  declarationUnassignedHandler,
  waitingExternalValidationHandler,
  declarationViewedHandler,
  declarationDownloadedHandler,
  declarationArchivedHandler,
  declarationReinstatedHandler,
  declarationUpdatedHandler,
  markEventRegisteredHandler,
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
import * as Hapi from '@hapi/hapi'

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
function analyticsDataRefreshingRoute<
  Request extends Hapi.Request<Hapi.ReqRefDefaults>,
  Response extends Hapi.ResponseToolkit,
  U
>(handler: (request: Request, response: Response) => U) {
  // Do not use await for the refresh operation. This operation can take minutes or more.
  // Consider triggering this a task that will be left to be run in the background.
  return (request: Request, response: Response) => {
    if (!PRODUCTION || QA_ENV) {
      refresh(request.headers.authorization)
    }
    return handler(request, response)
  }
}

export const getRoutes = () => {
  const routes: Hapi.ServerRoute[] = [
    // In progress declaration
    {
      method: 'POST',
      path: '/events/{event}/sent-notification',
      handler: analyticsDataRefreshingRoute(sentNotificationHandler),
      options: {
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
      path: '/events/{event}/sent-notification-for-review',
      handler: analyticsDataRefreshingRoute(sentNotificationForReviewHandler),
      options: {
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
      path: '/events/{event}/sent-for-approval',
      handler: analyticsDataRefreshingRoute(sentForApprovalHandler),
      options: {
        tags: ['api'],
        validate: {
          params: Joi.object({
            event: Joi.string().valid(...Object.values(EventType))
          })
        }
      }
    },
    // Waiting external resource validation
    {
      method: 'POST',
      path: '/events/{event}/waiting-external-validation',
      handler: waitingExternalValidationHandler,
      options: {
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
      path: '/events/{event}/marked-as-duplicate',
      handler: markedAsDuplicate,
      options: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/{event}/not-duplicate',
      handler: markedAsNotDuplicate,
      options: {
        tags: ['api']
      }
    },

    // Mark registered
    {
      method: 'POST',
      path: '/events/{event}/registered',
      handler: analyticsDataRefreshingRoute(markEventRegisteredHandler),
      options: {
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
      path: '/events/{event}/certified',
      handler: analyticsDataRefreshingRoute(markCertifiedHandler),
      options: {
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
      path: '/events/{event}/issued',
      handler: analyticsDataRefreshingRoute(markIssuedHandler),
      options: {
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
      path: '/events/{event}/sent-for-updates',
      handler: analyticsDataRefreshingRoute(sentForUpdatesHandler),
      options: {
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
      options: {
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
      options: {
        tags: ['api']
      }
    },

    // Request correction
    {
      method: 'POST',
      path: '/events/{event}/make-correction',
      handler: analyticsDataRefreshingRoute(correctionEventHandler),
      options: {
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
      options: {
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
      options: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/downloaded',
      handler: declarationDownloadedHandler,
      options: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/{event}/viewed',
      handler: declarationViewedHandler,
      options: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/{event}/archived',
      handler: analyticsDataRefreshingRoute(declarationArchivedHandler),
      options: {
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
      path: '/events/{event}/reinstated',
      handler: analyticsDataRefreshingRoute(declarationReinstatedHandler),
      options: {
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
      options: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/updated',
      handler: declarationUpdatedHandler,
      options: {
        tags: ['api']
      }
    },

    // Metrics query API
    {
      method: 'GET',
      path: '/metrics',
      handler: metricsHandler,
      options: {
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
      options: {
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
      options: {
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
      options: {
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
      options: {
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
      options: {
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
      options: {
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
      options: {
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
      options: {
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
      options: {
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
      options: {
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
      options: {
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
      options: {
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
      options: {
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
      options: {
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
      options: {
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
      options: {
        tags: ['api']
      }
    },
    // Export all data from InfluxDB to CSV
    {
      method: 'GET',
      path: '/monthlyExport',
      handler: monthlyExportHandler,
      options: {
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
      options: {
        tags: ['api'],
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/refreshPerformanceData',
      handler: performanceDataRefreshHandler,
      options: {
        tags: ['api'],
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/fetchVSExport',
      handler: getAllVSExport,
      options: {
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
      options: {
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
      options: {
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
      options: {
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
      options: {
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
      options: {
        tags: ['api'],
        auth: false
      }
    },
    // GET user audit events
    {
      method: 'GET',
      path: '/audit/events',
      handler: getUserAuditsHandler,
      options: {
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
