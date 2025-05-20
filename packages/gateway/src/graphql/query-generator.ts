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
  GraphQLObjectType,
  GraphQLSchema,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType
} from 'graphql'

export function generateQueryForType(
  schema: GraphQLSchema,
  typeName: string
): string {
  const type = schema.getType(typeName)

  if (!type || !isObjectType(type)) {
    throw new Error(
      `Type "${typeName}" not found in schema or is not an object type.`
    )
  }

  function buildFields(type: GraphQLObjectType): string {
    const fields = type.getFields()
    let fieldStr = ''

    for (const fieldName in fields) {
      const field = fields[fieldName]
      let fieldType = field.type

      if (isNonNullType(fieldType)) {
        fieldType = fieldType.ofType
      }
      if (isListType(fieldType)) {
        fieldType = fieldType.ofType
      }

      if (isObjectType(fieldType)) {
        fieldStr += `${fieldName} { ${buildFields(fieldType)} } `
      } else if (isScalarType(fieldType)) {
        fieldStr += `${fieldName} `
      } else {
        // throw new Error(`Unknown type! ${fieldType}`);
      }
    }
    return fieldStr.trim()
  }

  return buildFields(type)
}
