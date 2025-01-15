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

import { env } from '@events/environment'
import fetch from 'node-fetch'
import { ApplicationConfigResponseSchema } from '@opencrvs/commons'
import z from 'zod'

export async function getAppConfigurations(token: string) {
  const res = await fetch(new URL('/config', env.CONFIG_API_URL), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    throw new Error('Failed to fetch events config')
  }

  return ApplicationConfigResponseSchema.parse(await res.json())
}

export async function getCertificateTemplateById(token: string, id: string) {
  console.log(new URL(`/certificates/${id}.svg`, env.COUNTRY_CONFIG_URL))
  console.log(token)
  const res = await fetch(
    new URL(`/certificates/${id}.svg`, env.COUNTRY_CONFIG_URL),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (!res.ok) {
    console.log(res)
    throw new Error('Failed to fetch events config')
  }

  return z.string().parse(await res.text())
}
