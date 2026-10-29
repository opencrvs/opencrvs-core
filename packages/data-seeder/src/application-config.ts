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
import fetch from 'node-fetch'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { joinUrl } from '@opencrvs/commons'
import { env } from './environment'
import { raise } from './utils'
import { formatUnwrittenFailure } from './seed-failure'
import { Read } from './read'

const ApplicationConfigSchema = z.object({
  PHONE_NUMBER_PATTERN: z.string()
})

export type ApplicationConfigProblem =
  | { kind: 'applicationConfigUnparsed'; message: string }
  | { kind: 'invalidPhoneNumberPattern'; pattern: string }

export type ApplicationConfigRead = Read<
  { PHONE_NUMBER_PATTERN: string },
  ApplicationConfigProblem
>

function compile(pattern: string): RegExp | undefined {
  try {
    return new RegExp(pattern)
  } catch {
    return undefined
  }
}

export function parseApplicationConfig(
  document: unknown
): ApplicationConfigRead {
  const parsed = ApplicationConfigSchema.safeParse(document)

  if (!parsed.success) {
    return {
      readable: false,
      problem: {
        kind: 'applicationConfigUnparsed',
        message: fromZodError(parsed.error, { prefix: null }).message
      }
    }
  }

  const { PHONE_NUMBER_PATTERN } = parsed.data

  return {
    readable: true,
    PHONE_NUMBER_PATTERN,
    problems:
      compile(PHONE_NUMBER_PATTERN) === undefined
        ? [
            {
              kind: 'invalidPhoneNumberPattern',
              pattern: PHONE_NUMBER_PATTERN
            }
          ]
        : []
  }
}

export async function readApplicationConfig(): Promise<ApplicationConfigRead> {
  const url = joinUrl(env.COUNTRY_CONFIG_URL, 'config/application')
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' }
  })

  if (!res.ok) {
    raise(
      formatUnwrittenFailure(
        `Expected to get the application config from ${url}`
      )
    )
  }

  return parseApplicationConfig(await res.json())
}

export function getPhoneNumberPattern(
  read: ApplicationConfigRead
): { source: string; expression: RegExp } | undefined {
  if (!read.readable) {
    return undefined
  }

  const expression = compile(read.PHONE_NUMBER_PATTERN)

  return expression === undefined
    ? undefined
    : { source: read.PHONE_NUMBER_PATTERN, expression }
}
