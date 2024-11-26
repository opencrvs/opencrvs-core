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

export const userRoleLabels = {
  FIELD_AGENT: [
    { label: 'Field Agent', lang: 'en' },
    { label: 'Agent de terrain', lang: 'fr' }
  ],
  REGISTRATION_AGENT: [
    { label: 'Registration Agent', lang: 'en' },
    { label: "Agent d'enregistrement", lang: 'fr' }
  ],
  LOCAL_REGISTRAR: [
    { label: 'Local Registrar', lang: 'en' },
    { label: 'Registraire local', lang: 'fr' }
  ],
  LOCAL_SYSTEM_ADMIN: [
    { label: 'Local System Admin', lang: 'en' },
    { label: 'Administrateur système local', lang: 'fr' }
  ],
  NATIONAL_SYSTEM_ADMIN: [
    { label: 'National System Admin', lang: 'en' },
    { label: 'Administrateur système national', lang: 'fr' }
  ],
  PERFORMANCE_MANAGEMENT: [
    { label: 'Performance Management', lang: 'en' },
    { label: 'Gestion des performances', lang: 'fr' }
  ],
  NATIONAL_REGISTRAR: [
    { label: 'National Registrar', lang: 'en' },
    { label: 'Registraire national', lang: 'fr' }
  ]
} as const

const typeSystemUrl = 'http://opencrvs.org/specs/types'
const roleSystemUrl = 'http://opencrvs.org/specs/roles'

const userRoleSystemCodes = Object.keys(userRoleLabels)

/**
 * During the lifetime of the platform, format has changed from `ROLE_NAME` -> 'Role Name' -> { label: 'Role Name', lang: 'en' }.
 * Find the ones not matching the latest format.
 */
export const nonJSONRoleStringFilter = {
  'code.coding': {
    $elemMatch: {
      system: roleSystemUrl,
      code: {
        $in: userRoleSystemCodes
      }
    }
  },
  $or: [
    {
      'code.coding.system': {
        $ne: typeSystemUrl
      }
    },
    {
      'code.coding': {
        $elemMatch: {
          system: typeSystemUrl,
          code: {
            $not: {
              $regex: /^\[\{/
            }
          }
        }
      }
    }
  ]
}

/**
 * Update role code to JSON string format
 */
export const updatePractitionerRoleCodeAggregate = [
  {
    $addFields: {
      code: {
        $filter: {
          input: '$code',
          as: 'item',
          cond: {
            $not: {
              $in: [
                typeSystemUrl,
                {
                  $map: {
                    input: '$$item.coding',
                    as: 'coding',
                    in: '$$coding.system'
                  }
                }
              ]
            }
          }
        }
      }
    }
  },
  {
    $addFields: {
      code: {
        $concatArrays: [
          '$code',
          [
            {
              coding: [
                {
                  system: typeSystemUrl,
                  code: {
                    $function: {
                      body: `function (code) {
                             const userRoleLabels = ${JSON.stringify(
                               userRoleLabels
                             )}

                              return JSON.stringify(userRoleLabels[code])
                    }`,
                      args: [
                        {
                          $first: {
                            $first: '$code.coding.code'
                          }
                        }
                      ],
                      lang: 'js'
                    }
                  }
                }
              ]
            }
          ]
        ]
      }
    }
  }
]
