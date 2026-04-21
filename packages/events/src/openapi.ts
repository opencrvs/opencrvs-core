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
import { appRouter } from './router/router'

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'OpenCRVS API',
  version: '1.8.0',
  baseUrl: 'http://localhost:3000/api/events'
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
                description: 'Optional path in S3 where the file should be stored'
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
        description: 'File uploaded successfully. Requires authentication and attachment.upload scope.',
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
// eslint-disable-next-line no-console
console.log(yaml.stringify(openApiDocument))
