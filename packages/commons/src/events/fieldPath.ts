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
import * as z from 'zod/v4'
import { FieldConfig } from './FieldConfig'
import { mapFieldTypeToZod } from './FieldTypeMapping'

/** Whether a value of `schema` can have a property at `keys`, such as `['firstname']` for a name. */
function schemaHasPath(schema: z.core.$ZodType, keys: string[]): boolean {
  if (keys.length === 0) {
    return true
  }
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return schemaHasPath(schema.unwrap(), keys)
  }
  if (schema instanceof z.ZodUnion) {
    return schema.options.some((option) => schemaHasPath(option, keys))
  }
  if (schema instanceof z.ZodObject) {
    const [key, ...rest] = keys
    return (
      Object.hasOwn(schema.shape, key) && schemaHasPath(schema.shape[key], rest)
    )
  }
  return false
}

/**
 * Finds the field that `path` names a part of, such as `child.name` for
 * `child.name.firstname`. A field whose id is the whole path is not looked at.
 */
export function findFieldPartOfPath(
  path: string,
  fields: FieldConfig[]
): { field: FieldConfig; part: string[] } | undefined {
  for (const parent of fields) {
    const prefix = `${parent.id}.` // 'child.name.' with the dot
    if (!path.startsWith(prefix)) {
      continue
    }
    const part = path.slice(prefix.length).split('.')
    if (schemaHasPath(mapFieldTypeToZod(parent), part)) {
      return { field: parent, part }
    }
  }
  return undefined
}

/**
 * Finds the field that `path` names: a field id, or a field id and a part of its value,
 * such as `child.name.firstname`. A field whose id is the whole path comes first.
 *
 * @returns the field, and the keys of the part (empty for the whole field)
 */
export function findFieldOfPath(
  path: string,
  fields: FieldConfig[]
): { field: FieldConfig; part: string[] } | undefined {
  const field = fields.find(({ id }) => id === path)
  if (field) {
    return { field, part: [] }
  }
  return findFieldPartOfPath(path, fields)
}
