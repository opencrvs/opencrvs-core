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
import { TRPCError } from '@trpc/server'
import { getTokenPayload, UUID } from '@opencrvs/commons'
import { router, systemProcedure } from '@events/router/trpc'
import { createCredentialOfferUri } from '@events/service/openid4vc/credential-offer'
import { getEventById } from '@events/service/events/events'
import { signBirthCertificateVc } from '@events/service/openid4vc/sign'

const CredentialRequest = z.object({
  credential_configuration_id: z.string().optional()
})

export const openid4vcRouter = router({
  issuance: router({
    offer: systemProcedure
      .input(UUID) // eventId, eventually credentialSubject payload
      .mutation(({ input }) => {
        const offerUri = createCredentialOfferUri(input as UUID)

        return {
          credentialOfferUri: offerUri,
          deepLink: `openid-credential-offer://?credential_offer_uri=${encodeURIComponent(
            offerUri
          )}`
        }
      }),
    offers: systemProcedure
      .input(UUID) // eventId as "pre-authorized code" in PoC
      .query(async ({ input }) => {
        const eventId = input as UUID

        // verify that the event exists
        await getEventById(eventId)

        // Minimal OID4VCI-style credential_offer object
        return {
          // where your /.well-known/openid-credential-issuer lives
          credential_issuer:
            'http://localhost:7070/.well-known/openid-credential-issuer',

          // which credential configuration(s) this offer is for
          credential_configuration_ids: ['BirthCertificateCredential'],

          grants: {
            'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
              'pre-authorized_code': eventId, // PoC: using eventId directly
              user_pin_required: false
            }
          }
        }
      }),
    credential: systemProcedure
      .input(CredentialRequest)
      .mutation(async ({ input, ctx }) => {
        // parse eventId token from ctx.token JWT
        const { eventId } = getTokenPayload(ctx.token)

        if (!eventId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'missing eventId in token'
          })
        }

        const configId =
          input.credential_configuration_id ?? 'BirthCertificateCredential'

        if (configId !== 'BirthCertificateCredential') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'unsupported_credential_configuration'
          })
        }

        const event = await getEventById(eventId)

        const jwtVc = await signBirthCertificateVc({
          subjectId: eventId, // or some subject mapping
          event
        })

        return {
          format: 'jwt_vc_json',
          credential: jwtVc
        }
      })
  })
})
