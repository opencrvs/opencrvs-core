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
export const persistenceMapper = async (data: any) => {
  const parsed = JSON.parse(data)

  const mapped: any = {}
  const persistEntities: Set<string> = new Set()
  const rootQuery = parsed['ROOT_QUERY']

  // recursively identify all the nested entities
  function persistEntity(entity: any) {
    if (Array.isArray(entity)) {
      entity.forEach((item: any) => persistEntity(item))
    } else if (entity && typeof entity === 'object') {
      if ('__ref' in entity) {
        const ref = entity.__ref as string
        persistEntities.add(ref)
        persistEntity(parsed[ref])
      }
      Object.values(entity).forEach((nestedEntity) => {
        if (nestedEntity && typeof nestedEntity === 'object') {
          persistEntity(nestedEntity)
        }
      })
    }
  }

  mapped['ROOT_QUERY'] = Object.keys(rootQuery).reduce(
    (obj: any, key: string) => {
      if (key === '__typename') return obj

      if (/@persist$/.test(key)) {
        obj[key] = rootQuery[key]

        persistEntity(rootQuery[key])
      }

      return obj
    },
    { __typename: 'Query' }
  )

  persistEntities.forEach(
    (entityRef) => (mapped[entityRef] = parsed[entityRef])
  )

  return JSON.stringify(mapped)
}
