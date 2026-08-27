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

import { generateOpenApiDocument } from 'trpc-to-openapi'
import * as yaml from 'yaml'
import { WorkqueueConfig } from '@opencrvs/commons'
import { appRouter } from './router/router'

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'OpenCRVS API',
  version: '2.0.0',
  baseUrl: 'http://localhost:3000/api/events',
  description:
    'OpenCRVS Events API — for full documentation, see [https://documentation.opencrvs.org](https://documentation.opencrvs.org)',
  defs: {
    // Manually add the WorkqueueConfig schema to the OpenAPI document, since it is not otherwise included.
    WorkqueueConfig
  }
})

// Manually add the attachments endpoint
;(openApiDocument.paths || {})['/attachments'] = {
  post: {
    summary: 'Upload a file attachment',
    tags: ['Attachments'],
    security: [{ bearerAuth: ['attachment.upload'] }],
    requestBody: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description:
                  'Optional path in S3 where the file should be stored'
              },
              transactionId: {
                type: 'string',
                description: 'Transaction ID'
              },
              file: {
                type: 'string',
                format: 'binary',
                description: 'File to upload'
              }
            },
            required: ['transactionId', 'file']
          }
        }
      }
    },
    responses: {
      '200': {
        description:
          'File uploaded successfully. Requires authentication and attachment.upload scope.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                result: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        json: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
// Manually add the certificate rendering endpoint. It is served outside tRPC
// (see router/event/certificate/handler.ts) so it can return raw PDF bytes, and
// therefore is not picked up by trpc-to-openapi's generator.
;(openApiDocument.paths || {})['/events/{eventId}/certificate'] = {
  get: {
    summary: 'Render a record certificate as a PDF',
    tags: ['Events'],
    security: [{ bearerAuth: ['record.read'] }],
    parameters: [
      {
        name: 'eventId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'The event (record) id to render a certificate for'
      },
      {
        name: 'templateId',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        description:
          'Certificate template id. Defaults to the event type’s default template.'
      }
    ],
    responses: {
      '200': {
        description:
          'The rendered certificate PDF. Requires authentication and the record.read scope.',
        content: {
          'application/pdf': {
            schema: { type: 'string', format: 'binary' }
          }
        }
      }
    }
  }
}
// eslint-disable-next-line no-console
console.log(yaml.stringify(openApiDocument))
