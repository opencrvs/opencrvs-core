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

import superjson from 'superjson'

const serializedResponses = new WeakMap<
  object,
  ReturnType<typeof superjson.serialize>
>()

/**
 * Serializes `value` once and reuses the result for every later response that
 * returns the same object. Only for values that are never mutated.
 */
export function reuseSerializedResponse<T extends object>(value: T): T {
  serializedResponses.set(value, superjson.serialize(value))
  return value
}

/**
 * superjson, except responses registered with `reuseSerializedResponse` skip
 * re-serialization.
 */
export const transformer = {
  input: superjson,
  output: {
    serialize: (value: unknown) =>
      (typeof value === 'object' &&
        value !== null &&
        serializedResponses.get(value)) ||
      superjson.serialize(value),
    deserialize: superjson.deserialize
  }
}
