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
import applicationConfigHandler from '@config/handlers/applicationConfigHandler'
import createQuestionHandler, {
  requestSchema as createQuestionReqSchema
} from '@config/handlers/createQuestion/handler'
import updateQuestionHandler, {
  requestSchema as updateQuestionReqSchema
} from '@config/handlers/updateQuestion/handler'

const enum RouteScope {
  DECLARE = 'declare',
  REGISTER = 'register',
  CERTIFY = 'certify',
  PERFORMANCE = 'performance',
  SYSADMIN = 'sysadmin',
  VALIDATE = 'validate',
  NATLSYSADMIN = 'natlsysadmin'
}

export default function getRoutes() {
  return [
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
    {
      method: 'GET',
      path: '/config',
      handler: applicationConfigHandler,
      config: {
        auth: false,
        tags: ['api'],
        description: 'Retrieve Application configuration'
      }
    },
    {
      method: 'POST',
      path: '/getCertificate',
      handler: getCertificateHandler,
      config: {
        tags: ['api'],
        description: 'Retrieves certificate',
        auth: {
          scope: [RouteScope.NATLSYSADMIN]
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
      config: {
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
      config: {
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
      config: {
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
      config: {
        tags: ['api'],
        description: 'Delete certificate',
        auth: {
          scope: [RouteScope.NATLSYSADMIN]
        }
      }
    },
    {
      method: 'POST',
      path: '/question',
      handler: createQuestionHandler,
      config: {
        tags: ['api'],
        description: 'Create question',
        auth: {
          scope: [RouteScope.NATLSYSADMIN]
        },
        validate: {
          /*failAction: async (request: any, h: any, err: any) => {
            console.log(`Joi error: ${err}`)
            throw err
          },*/
          payload: createQuestionReqSchema
        }
      }
    },
    {
      method: 'PUT',
      path: '/question',
      handler: updateQuestionHandler,
      config: {
        tags: ['api'],
        description: 'Update question',
        auth: {
          scope: [RouteScope.NATLSYSADMIN]
        },
        validate: {
          payload: updateQuestionReqSchema
        }
      }
    }
  ]
}
