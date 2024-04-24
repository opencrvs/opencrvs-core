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
  createCertificateHandler,
  deleteCertificateHandler,
  getActiveCertificatesHandler,
  getCertificateHandler,
  requestActiveCertificate,
  requestNewCertificate,
  updateCertificate,
  updateCertificateHandler
} from '@config/handlers/certificate/certificateHandler'
import configHandler, {
  getLoginConfigHandler,
  updateApplicationConfig,
  updateApplicationConfigHandler
} from '@config/handlers/application/applicationConfigHandler'
import createInformantSMSNotificationHandler, {
  requestSchema as createInformantSMSNotificationReqSchema
} from '@config/handlers/informantSMSNotifications/createInformantSMSNotification/handler'
import getInformantSMSNotificationsHandler from '@config/handlers/informantSMSNotifications/getInformantSMSNotification/handler'
import updateInformantSMSNotificationHandler, {
  requestSchema as updateInformantSMSNotificationReqSchema
} from '@config/handlers/informantSMSNotifications/updateInformantSMSNotification/handler'
import getSystems from '@config/handlers/system/systemHandler'
import getForms from '@config/handlers/forms/formsHandler'
import getDashboardQueries from '@config/handlers/dashboardQueries/dashboardQueries'
import { ServerRoute } from '@hapi/hapi'
import * as Joi from 'joi'
import { resolveChildren } from '@config/handlers/locations/resolveChildren'

export const enum RouteScope {
  DECLARE = 'declare',
  REGISTER = 'register',
  CERTIFY = 'certify',
  PERFORMANCE = 'performance',
  SYSADMIN = 'sysadmin',
  VALIDATE = 'validate',
  NATLSYSADMIN = 'natlsysadmin'
}

export default function getRoutes(): ServerRoute[] {
  return [
    // add ping route by default for health check
    {
      method: 'GET',
      path: '/ping',
      handler: (request, h) => {
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

    {
      method: 'GET',
      path: '/locations/{locationId}/children',
      handler: resolveChildren,
      options: {
        auth: false,
        tags: ['api'],
        description:
          'Retrieve all the children (multi-level) of a particular location',
        validate: {
          params: Joi.object({
            locationId: Joi.string().uuid()
          })
        }
      }
    },
    {
      method: 'GET',
      path: '/config',
      handler: configHandler,
      options: {
        auth: {
          scope: [
            RouteScope.NATLSYSADMIN,
            RouteScope.DECLARE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY,
            RouteScope.PERFORMANCE,
            RouteScope.SYSADMIN,
            RouteScope.VALIDATE
          ]
        },
        tags: ['api'],
        description: 'Retrieve all configuration'
      }
    },
    {
      method: 'GET',
      path: '/publicConfig',
      handler: getLoginConfigHandler,
      options: {
        auth: false,
        tags: ['api'],
        description: 'Retrieve Application configuration'
      }
    },
    {
      method: 'GET',
      path: '/integrationConfig',
      handler: getSystems,
      options: {
        tags: ['api'],
        description: 'Retrieve Application integrations'
      }
    },
    {
      method: 'GET',
      path: '/forms',
      handler: getForms,
      options: {
        tags: ['api'],
        description: 'Retrieve forms'
      }
    },
    {
      method: 'POST',
      path: '/getCertificate',
      handler: getCertificateHandler,
      options: {
        tags: ['api'],
        description: 'Retrieves certificate',
        auth: {
          scope: [
            RouteScope.NATLSYSADMIN,
            RouteScope.REGISTER,
            RouteScope.CERTIFY,
            RouteScope.VALIDATE
          ]
        },
        validate: {
          payload: requestActiveCertificate
        }
      }
    },
    {
      method: 'GET',
      path: '/getActiveCertificates',
      handler: getActiveCertificatesHandler,
      options: {
        tags: ['api'],
        description: 'Retrieves active certificates for birth and death',
        auth: {
          scope: [
            RouteScope.NATLSYSADMIN,
            RouteScope.DECLARE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY,
            RouteScope.PERFORMANCE,
            RouteScope.SYSADMIN,
            RouteScope.VALIDATE
          ]
        }
      }
    },
    {
      method: 'POST',
      path: '/createCertificate',
      handler: createCertificateHandler,
      options: {
        tags: ['api'],
        description: 'Creates a new Certificate',
        auth: {
          scope: [RouteScope.NATLSYSADMIN]
        },
        validate: {
          payload: requestNewCertificate
        }
      }
    },
    {
      method: 'POST',
      path: '/updateCertificate',
      handler: updateCertificateHandler,
      options: {
        tags: ['api'],
        description: 'Updates an existing Certificate',
        auth: {
          scope: [RouteScope.NATLSYSADMIN]
        },
        validate: {
          payload: updateCertificate
        }
      }
    },
    {
      method: 'DELETE',
      path: '/certificate/{certificateId}',
      handler: deleteCertificateHandler,
      options: {
        tags: ['api'],
        description: 'Delete certificate',
        auth: {
          scope: [RouteScope.NATLSYSADMIN]
        }
      }
    },
    {
      method: 'POST',
      path: '/updateApplicationConfig',
      handler: updateApplicationConfigHandler,
      options: {
        tags: ['api'],
        description: 'Updates an existing Config',
        auth: {
          scope: [RouteScope.NATLSYSADMIN]
        },
        validate: {
          payload: updateApplicationConfig
        }
      }
    },
    {
      method: 'POST',
      path: '/informantSMSNotification',
      handler: createInformantSMSNotificationHandler,
      options: {
        tags: ['api'],
        description: 'Creates informantSMSNotifications',
        auth: {
          scope: [RouteScope.NATLSYSADMIN]
        },
        validate: {
          payload: createInformantSMSNotificationReqSchema
        }
      }
    },
    {
      method: 'GET',
      path: '/informantSMSNotification',
      handler: getInformantSMSNotificationsHandler,
      options: {
        tags: ['api'],
        description: 'Get informantSMSNotifications',
        auth: {
          scope: [
            RouteScope.NATLSYSADMIN,
            RouteScope.DECLARE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY,
            RouteScope.VALIDATE
          ]
        }
      }
    },
    {
      method: 'PUT',
      path: '/informantSMSNotification',
      handler: updateInformantSMSNotificationHandler,
      options: {
        tags: ['api'],
        description: 'Update informantSMSNotification',
        auth: {
          scope: [RouteScope.NATLSYSADMIN]
        },
        validate: {
          payload: updateInformantSMSNotificationReqSchema
        }
      }
    },
    {
      method: 'GET',
      path: '/dashboardQueries',
      handler: getDashboardQueries,
      options: {
        tags: ['api'],
        description: 'Fetch dashboard queries from country config'
      }
    }
  ]
}
