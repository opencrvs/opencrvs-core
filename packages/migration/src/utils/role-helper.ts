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

/**
 * Transform role code based on the english label to match how the scripts will generate new roles from aliases
 */
export const transformRoleCodes = (doc: any) => {
  const updatedCode = [...doc.code]

  // Find the types system code and extract the English label
  const typesCodeEntry = doc.code.find((c: any) =>
    c?.coding?.find((cod: any) => cod?.system === typeSystemUrl)
  )

  const typesCoding = typesCodeEntry?.coding?.find(
    (cod: any) => cod?.system === typeSystemUrl
  )

  if (typesCoding?.code) {
    try {
      const labelArray = JSON.parse(typesCoding.code)

      const englishLabel = labelArray?.find(
        (item: any) => item?.lang === 'en' && item?.label
      )

      if (englishLabel?.label) {
        const transformedLabel = englishLabel.label
          .replace(/[^a-zA-Z0-9 ]/g, '')
          .toUpperCase()
          .replace(/ /g, '_')

        // Find and update the roles system code
        const rolesCodeIndex = updatedCode.findIndex((c: any) =>
          c?.coding?.find((cod: any) => cod?.system === roleSystemUrl)
        )

        if (rolesCodeIndex !== -1) {
          const rolesCodingIndex = updatedCode[rolesCodeIndex].coding.findIndex(
            (cod: any) => cod?.system === roleSystemUrl
          )

          if (rolesCodingIndex !== -1) {
            updatedCode[rolesCodeIndex].coding[rolesCodingIndex].code =
              transformedLabel
          }
        }
      } else {
        console.warn(
          `Document ${doc._id}: No valid English label found in types code`
        )
      }
    } catch (parseError) {
      console.warn(
        `Document ${doc._id}: Could not parse types code as JSON, skipping role update:`,
        parseError
      )
    }
  }

  // Remove the types system from the code array
  const filteredCode = updatedCode.filter((c: any) =>
    c?.coding?.find((cod: any) => cod?.system !== typeSystemUrl)
  )
  return filteredCode
}
