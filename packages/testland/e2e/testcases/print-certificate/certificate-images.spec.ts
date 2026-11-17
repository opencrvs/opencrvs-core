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
import fs from 'fs'
import path from 'path'
import { test, expect, type Page } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@opencrvs/toolkit/api'
import { getToken, login } from '@e2e/support/helpers'
import {
  CLIENT_URL,
  CREDENTIALS,
  GATEWAY_HOST
} from '@e2e/support/constants'
import { ASSETS_DIR } from '@e2e/support/paths'
import { ensureAssignedToUser } from '@e2e/support/utils'
import {
  selectCertificationType,
  selectRequesterType
} from '@e2e/support/print-certificate/birth/helpers'

const TEMPLATE = 'Tennis Club Membership Certificate Multipage'

/**
 * Uploads a file under the record's prefix, as the client does when a file
 * is attached to a form.
 */
async function uploadRecordFile(eventId: string, token: string) {
  const image = fs.readFileSync(path.join(ASSETS_DIR, 'sign1.png'))

  const form = new FormData()
  form.append(
    'file',
    new File([new Uint8Array(image)], 'applicant.png', { type: 'image/png' })
  )
  form.append('transactionId', uuidv4())
  form.append('path', `events/${eventId}`)

  const response = await fetch(new URL('/upload', GATEWAY_HOST), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  })

  if (!response.ok) {
    throw new Error(`Failed to upload the file: ${response.statusText}`)
  }

  return {
    path: await response.text(),
    originalFilename: 'applicant.png',
    type: 'image/png'
  }
}

/**
 * Returns the content type of each linked image in the certificate preview.
 * `fetch` resolves the href against the page URL in the same way as the
 * <image> element does.
 */
async function getCertificateImageContentTypes(page: Page) {
  return page.locator('#print image').evaluateAll(async (images) =>
    Promise.all(
      images
        .map(
          (image) =>
            image.getAttribute('xlink:href') ?? image.getAttribute('href') ?? ''
        )
        .filter((href) => href !== '' && !href.startsWith('data:'))
        .map(async (href) => {
          const response = await fetch(href)
          return {
            href,
            contentType: response.headers.get('content-type')
          }
        })
    )
  )
}

/**
 * Reproduces https://github.com/opencrvs/opencrvs-core/issues/14187
 *
 * Images from the declaration must render on the certificate preview.
 */
test('Images from the declaration render on the certificate preview', async ({
  page
}) => {
  let eventId = ''
  let imagePath = ''

  await test.step('Register a tennis club membership with an applicant image (via API)', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

    const event = await client.event.create.mutate({
      type: 'tennis-club-membership',
      transactionId: uuidv4()
    })
    eventId = event.id

    const image = await uploadRecordFile(eventId, token)
    imagePath = image.path

    const declaration = {
      'applicant.name': {
        firstname: faker.person.firstName(),
        surname: faker.person.lastName()
      },
      'applicant.dob': '2000-01-15',
      'applicant.image': image,
      'recommender.none': true
    }

    await client.event.actions.declare.request.mutate({
      eventId,
      transactionId: uuidv4(),
      declaration,
      annotation: {},
      keepAssignment: true
    })

    await client.event.actions.register.request.mutate({
      eventId,
      transactionId: uuidv4(),
      declaration,
      annotation: {}
    })
  })

  await test.step('Open the certificate preview', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.goto(`${CLIENT_URL}/events/${eventId}`)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    // The tennis club event names its print action "Print certificate".
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await page
      .locator('#action-Dropdown-Content')
      .getByText('Print certificate', { exact: true })
      .click()

    await selectCertificationType(page, TEMPLATE)
    await selectRequesterType(page, 'Print in advance')
    await page.getByRole('button', { name: 'Continue' }).click()

    // The tennis club print form also has a payment page.
    await expect(page.getByText('Collect Payment')).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.locator('#print svg').first()).toBeVisible()
  })

  await test.step('The applicant image is an image', async () => {
    const images = await getCertificateImageContentTypes(page)

    const applicantImage = images.find(({ href }) =>
      href.endsWith(path.basename(imagePath))
    )
    expect(applicantImage, 'The certificate links the image').toBeDefined()

    for (const image of images) {
      expect(image.contentType, image.href).toMatch(/^image\//)
    }
  })
})
