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
// @ts-check
'use strict'
const logger = require('winston')

module.exports = (mongo, fhirResources) => {
  const fhirCore = require('../fhir/core.js')(mongo, fhirResources)
  return {
    hooks: {
      before: [
        {
          resourceType: 'Task',
          interactions: ['create'],
          userType: '*',
          function: (interaction, ctx, resourceType, resource, callback) => {
            logger.debug(
              `Executing OpenCRVS trackingId duplicate check for [${interaction}] on resource ${resourceType}`
            )

            const id = resource.identifier.find(
              identifier =>
                identifier.system ===
                  'http://opencrvs.org/specs/id/birth-tracking-id' ||
                identifier.system ===
                  'http://opencrvs.org/specs/id/death-tracking-id'
            )
            if (!id) {
              return callback(null, null)
            }

            const searchCtx = {
              ...Object.assign({}, ctx),
              resourceType,
              query: {
                identifier: id.value
              }
            }
            fhirCore.search(searchCtx, resourceType, (err, result) => {
              if (err) {
                return logger.debug(`search Task error: ${err}`)
              }

              if (result && result.resource && result.resource.total !== 0) {
                logger.warn(
                  `OCRVS-plugin: Duplicate Task found for identifier: ${id.value}`
                )

                callback(null, {
                  httpStatus: 409,
                  resource: {
                    resourceType: 'Task',
                    issue: [
                      {
                        severity: 'error',
                        code: 'duplicate',
                        details: {
                          text: `Duplicate Task found for identifier: ${id.value}`
                        }
                      }
                    ]
                  }
                })
              } else {
                callback(null, null)
              }
            })
          }
        }
      ]
    }
  }
}
