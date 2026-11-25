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

import { afterEach, expect, test, vi } from 'vitest'
import superjson from 'superjson'
import { reuseSerializedResponse, transformer } from './serialization'

afterEach(() => {
  vi.restoreAllMocks()
})

test('a registered response is not serialized again', () => {
  const response = reuseSerializedResponse([
    { id: 'birth', updatedAt: new Date('2026-01-01T00:00:00Z') }
  ])
  const expected = superjson.serialize(response)

  const serialize = vi.spyOn(superjson, 'serialize')
  const first = transformer.output.serialize(response)
  const second = transformer.output.serialize(response)

  expect(serialize).not.toHaveBeenCalled()
  expect(first).toEqual(expected)
  expect(second).toBe(first)
})

test('an unregistered response is serialized on every call', () => {
  const response = [{ id: 'birth' }]

  const serialize = vi.spyOn(superjson, 'serialize')
  transformer.output.serialize(response)
  transformer.output.serialize(response)

  expect(serialize).toHaveBeenCalledTimes(2)
})

test('primitive responses are serialized normally', () => {
  expect(transformer.output.serialize(null)).toEqual(superjson.serialize(null))
  expect(transformer.output.serialize('text')).toEqual(
    superjson.serialize('text')
  )
})
