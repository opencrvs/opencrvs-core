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
              `Executing before hooks for [${interaction}] on resource ${resourceType}`
            )
            const searchCtx = {
              resourceType,
              query: {
                identifier: resource.identifier.value
              }
            }
            fhirCore.search(searchCtx, resourceType, (err, result) => {
              if (err) {
                return logger.debug(`search Task error: ${err}`)
              }
              if (result) {
                callback(null, {
                  httpStatus: 409,
                  resource: {
                    resourceType: 'Task',
                    issue: {
                      severity: 'error',
                      code: 'duplicate',
                      details: {
                        text: `Duplicate Task found for identifier: ${
                          resource.identifier.value
                        }`
                      }
                    }
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
