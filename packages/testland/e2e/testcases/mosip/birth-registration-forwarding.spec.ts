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
import { expect, test } from '@playwright/test'
import { createClient } from '@opencrvs/toolkit/api'
import { omit } from 'lodash'
import { CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import { getToken, login } from '@e2e/support/helpers'
import {
  createDeclaration,
  getDeclaration
} from '@e2e/support/test-data/birth-declaration'
import {
  navigateToCertificatePrintAction,
  selectCertificationType,
  selectRequesterType
} from '@e2e/support/print-certificate/birth/helpers'

async function getEventById(eventId: string, token: string) {
  const client = createClient(`${GATEWAY_HOST}/events`, `Bearer ${token}`)
  return client.event.get.query({ eventId })
}

test('Birth registration forwarding to MOSIP attributes the certificate to the registrar', async ({
  page
}) => {
  const token = await getToken(CREDENTIALS.REGISTRAR)

  const { declaration, eventId } =
    await test.step('register a birth via the MOSIP forwarding flow (accepted asynchronously)', async () => {
      const declarationForMosipForwarding = await getDeclaration({
        token,
        partialDeclaration: {
          'mother.verified': 'authenticated'
        }
      })

      const res = await createDeclaration(
        token,
        omit(declarationForMosipForwarding, ['mother.idType', 'mother.nid'])
      )

      // No registration number synchronously — MOSIP accepts it asynchronously.
      expect(res.registrationNumber).toBeUndefined()
      expect(
        (res.declaration as Record<string, unknown>)['mother.verified']
      ).toBe('authenticated')

      return { declaration: res.declaration, eventId: res.eventId }
    })

  await test.step('register action is requested then accepted through MOSIP flow', async () => {
    await expect
      .poll(
        async () => {
          const event = await getEventById(eventId, token)
          const registerActions = event.actions.filter(
            (action: { type: string }) => action.type === 'REGISTER'
          )

          const hasRequestedRegisterAction = registerActions.some(
            (action: { status: string }) => action.status === 'Requested'
          )
          const acceptedAction = registerActions.find(
            (action: { status: string }) => action.status === 'Accepted'
          )

          if (!hasRequestedRegisterAction || !acceptedAction) {
            return false
          }

          const acceptedActionRegistrationNumber = (
            acceptedAction as { registrationNumber?: string }
          ).registrationNumber

          return Boolean(acceptedActionRegistrationNumber)
        },
        {
          timeout: 30_000,
          intervals: [500, 1000, 2000]
        }
      )
      .toBe(true)
  })

  await test.step('log in as the registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('open the birth certificate preview', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(
      page,
      declaration,
      CREDENTIALS.REGISTRAR
    )
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('"Registered by" shows the registrar who requested the registration', async () => {
    await expect(page.locator('#print')).toContainText('Kennedy Mweene')
  })
})
