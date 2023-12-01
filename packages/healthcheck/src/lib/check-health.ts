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

export enum Status {
  OK = 'ok',
  ERROR = 'error',
  LOADING = 'loading'
}

export interface Service extends Record<string, unknown> {
  name: string
  status: string
  error?: string
  url?: string
  ping?: number
}

export const checkHealth = async (): Promise<Service[]> => {
  if (!process.env.HEALTHCHECK_URL) {
    throw new Error(`Environment variable "HEALTHCHECK_URL" is not set.

Run the following command in packages/healthcheck and restart services:
echo "HEALTHCHECK_URL=http://localhost:7070/ping" > .env.local`)
  }

  const res = await fetch(process.env.HEALTHCHECK_URL!)
  return res.json()
}
