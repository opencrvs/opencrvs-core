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

import z from 'zod'

export const CredentialSubject = z.object({
  id: z.string(), // child DID/URN

  givenName: z.string(),
  middleName: z.string().optional(),
  familyName: z.string(),

  gender: z.string(), // use controlled vocab / ISO/ICD

  birthDate: z.string(), // date (YYYY-MM-DD)
  birthTime: z.string().optional(), // time (HH:MM)

  birthPlace: z.object({
    name: z.string(), // human-readable
    code: z.record(z.string(), z.string()) // e.g. { country, prov, dist }
  }),

  plurality: z.number().int().optional(),
  birthOrder: z.number().int().optional(),

  // B. Parent / guardian
  parent: z
    .array(
      z.object({
        name: z.string(),
        birthDate: z.string().optional(), // date
        nationality: z.string().optional(), // ISO-3166-1 alpha-3
        identifier: z.string().optional() // NIN/UIN/NUC
      })
    )
    .optional(),

  parentalStatus: z.string().optional(), // marital status at birth

  // G. Local extensions
  nationality: z.string().optional(), // child nationality
  nationalIdentifier: z.string().optional(), // child UIN/NUC
  nameVariant: z.array(z.string()).optional()
})
