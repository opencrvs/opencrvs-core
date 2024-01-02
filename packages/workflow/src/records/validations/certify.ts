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
import { EVENT_TYPE } from '@opencrvs/commons/types'
import { z } from 'zod'

export const requestSchema = z.object({
  event: z.custom<EVENT_TYPE>(),
  certificate: z.object({
    hasShowedVerifiedDocument: z.boolean(),
    data: z.string(),
    collector: z
      .object({
        relationship: z.string()
      })
      .or(
        z.object({
          relationship: z.string(),
          otherRelationship: z.string(),
          name: z.array(
            z.object({
              use: z.string(),
              firstNames: z.string(),
              familyName: z.string()
            })
          ),
          affidavit: z
            .array(
              z.object({
                contentType: z.string(),
                data: z.string()
              })
            )
            .optional(),
          identifier: z.array(
            z.object({
              id: z.string(),
              type: z.string()
            })
          )
        })
      )
  })
})

export type CertificateInput = z.TypeOf<typeof requestSchema>['certificate']
