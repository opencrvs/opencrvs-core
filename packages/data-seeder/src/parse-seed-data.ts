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
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

/** Parsing a list and parsing its elements are separate steps, so that one bad
 * element does not take the whole document down with it. */
export const ListSchema = z.array(z.unknown())

export function describeParseFailure(error: z.ZodError): string {
  return fromZodError(error, { prefix: null }).message
}

/** A field read back off a record that did not parse. Nothing else about such
 * a record can be trusted. */
export function readString(record: unknown, field: string): string | undefined {
  if (typeof record !== 'object' || record === null) {
    return undefined
  }

  const value = (record as Record<string, unknown>)[field]

  return typeof value === 'string' ? value : undefined
}
