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
export const persistenceMapper = async (data: any) => {
  const parsed = JSON.parse(data)

  const mapped: any = {}
  const persistEntities: any[] = []
  const rootQuery = parsed['ROOT_QUERY']

  mapped['ROOT_QUERY'] = Object.keys(rootQuery).reduce(
    (obj: any, key: string) => {
      if (key === '__typename') return obj

      if (/@persist$/.test(key)) {
        obj[key] = rootQuery[key]

        if (Array.isArray(rootQuery[key])) {
          const entities = rootQuery[key].map((item: any) => item.__ref)
          persistEntities.push(...entities)
        } else {
          const entity = rootQuery[key].__ref
          persistEntities.push(entity)
        }
      }

      return obj
    },
    { __typename: 'Query' }
  )

  persistEntities.reduce((obj, key) => {
    obj[key] = parsed[key]
    return obj
  }, mapped)

  return JSON.stringify(mapped)
}
