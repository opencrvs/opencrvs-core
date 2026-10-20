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
import { auditRecord, getToken, login } from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import {
  createDeclaration as createDeclarationV2,
  Declaration as DeclarationV2
} from '@e2e/support/test-data/birth-declaration-with-mother-father'
import { format, subDays, subYears } from 'date-fns'
import { CREDENTIALS } from '@e2e/support/constants'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import {
  ensureAssignedToUser,
  expectInUrl,
  selectAction,
  type,
  waitForCorrectionAction
} from '@e2e/support/utils'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import { requestCorrectionViaApi } from '@e2e/support/test-data/api-actions'

test('Request correction, escalate, then approve as Local Registrar', async ({
  page
}) => {
  // Explicit longer timeout. test.step pattern seems to behave differently with respect to timeouts and kill the test before all steps have completed.
  test.setTimeout(240_000)
  let declaration: DeclarationV2
  let trackingId = ''
  let eventId: string

  const updatedChildDetails = {
    firstname: faker.person.firstName(),
    surname: faker.person.lastName()
  }
  const correctionFee = faker.number.int({ min: 1, max: 1000 })
  const escalationReason =
    'Escalating this correction to Provincial Registrar for further review.'

  await test.step('Shortcut declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)

    const res = await createDeclarationV2(
      token,
      {
        'child.name': {
          firstname: faker.person.firstName('male'),
          surname: faker.person.lastName()
        },
        'child.gender': 'male',
        'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd'),
        'child.placeOfBirth': 'PRIVATE_HOME',
        'child.attendantAtBirth': 'PHYSICIAN',
        'child.birthType': 'SINGLE',
        'child.weightAtBirth': 3,
        'informant.relation': 'MOTHER',
        'informant.phoneNo': '0911725897',
        'mother.name': {
          firstname: faker.person.firstName('female'),
          surname: faker.person.lastName('female')
        },
        'mother.dob': format(subYears(new Date(), 29), 'yyyy-MM-dd'),
        'mother.nationality': 'FAR',
        'mother.idType': 'NATIONAL_ID',
        'mother.nid': faker.string.numeric(10),
        'mother.maritalStatus': 'SINGLE',
        'mother.educationalAttainment': 'NO_SCHOOLING',
        'mother.occupation': 'Housewife',
        'mother.previousBirths': 0,
        'father.name': {
          firstname: faker.person.firstName('male'),
          surname: faker.person.lastName('male')
        },
        'father.detailsNotAvailable': false,
        'father.dob': format(subYears(new Date(), 31), 'yyyy-MM-dd'),
        'father.idType': 'NATIONAL_ID',
        'father.nid': faker.string.numeric(10),
        'father.nationality': 'FAR',
        'father.maritalStatus': 'SINGLE',
        'father.educationalAttainment': 'NO_SCHOOLING',
        'father.occupation': 'Unemployed',
        'father.addressSameAs': 'YES'
      },
      'REGISTER',
      'PRIVATE_HOME'
    )

    expect(res).toEqual(
      expect.objectContaining({
        trackingId: expect.any(String)
      })
    )
    trackingId = res.trackingId!
    eventId = res.eventId
    declaration = res.declaration
  })

  await test.step('Request correction as Registration Agent via API', async () => {
    await requestCorrectionViaApi({
      token: await getToken(CREDENTIALS.REGISTRATION_OFFICER),
      eventId,
      declaration: { 'child.name': updatedChildDetails },
      annotation: {
        'requester.type': 'LEGAL_GUARDIAN',
        'reason.option': 'MATERIAL_ERROR',
        'requester.identity.verify': true,
        'fees.amount': correctionFee
      }
    })
  })

  await test.step('Login as Registration Agent', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Navigate to the record', async () => {
    await auditRecord({
      page,
      name: formatV2ChildName(declaration),
      trackingId
    })
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step("Event should not yet have an 'Escalated' flag", async () => {
    await expect(page.getByText('Escalated', { exact: true })).not.toBeVisible()
  })

  await test.step('Escalate from the action menu', async () => {
    await selectAction(page, 'Escalate')

    await expect(page.getByText('Escalate to')).toBeVisible()
    await expect(page.getByText('Reason')).toBeVisible()

    const confirmButton = page.getByRole('button', { name: 'Confirm' })
    await expect(confirmButton).toBeDisabled()

    await page.locator('#escalate-to').click()
    await page
      .getByText('My state provincial registrar', { exact: true })
      .first()
      .click()

    await page.locator('#reason').fill(escalationReason)

    const escalateResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.custom') && response.ok()
    )

    await expect(confirmButton).toBeEnabled()
    await confirmButton.click()

    await escalateResponse
  })

  await test.step('Login as Local Registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Navigate to the record by tracking ID', async () => {
    await type(page, '#searchText', trackingId)
    await page.locator('#searchIconButton').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Record carries the Escalated to Provincial Registrar flag', async () => {
    await expect(
      page.getByText('Escalated to Provincial Registrar')
    ).toBeVisible()
  })

  await test.step('Open the correction approval page', async () => {
    await selectAction(page, 'Review correction request')
  })

  await test.step('Approval page shows requester, reason and fee', async () => {
    await expect(page.getByText('RequesterLegal Guardian')).toBeVisible()
    await expect(
      page.getByText(
        'Reason for correctionInformant provided incorrect information (Material error)'
      )
    ).toBeVisible()
    await expect(page.getByText(`Fee total$${correctionFee}`)).toBeVisible()
  })

  await test.step('Approval page shows the corrected child name (original vs updated)', async () => {
    await expect(
      page.getByRole('heading', { name: "Child's details" })
    ).toBeVisible()

    await expect(
      page
        .locator('#listTable-corrections-table-child')
        .getByText(
          "Child's name" +
            `${declaration['child.name'].firstname} ${declaration['child.name'].surname}` +
            `${updatedChildDetails.firstname} ${updatedChildDetails.surname}`
        )
    ).toBeVisible()
  })

  await test.step('Approval page exposes Approve and Reject buttons', async () => {
    await expect(
      page.getByRole('button', { name: 'Approve', exact: true })
    ).toBeEnabled()
    await expect(
      page.getByRole('button', { name: 'Reject', exact: true })
    ).toBeEnabled()
  })

  await test.step('Approve the correction', async () => {
    await page.getByRole('button', { name: 'Approve', exact: true }).click()

    await waitForCorrectionAction(page, 'approve', async () => {
      await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    })

    await expectInUrl(page, `/events/${eventId}`)

    await expect(
      page.locator('#content-name', {
        hasText: formatV2ChildName({ 'child.name': updatedChildDetails })
      })
    ).toBeVisible({ timeout: 60_000 })
  })

  await test.step('Audit history records the correction request and approval', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await page.getByRole('button', { name: 'Audit' }).click()

    await expect(
      page.getByRole('button', { name: 'Correction approved', exact: true })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Next page' }).click()
    await expect(
      page.getByRole('button', { name: 'Correction requested', exact: true })
    ).toBeVisible()
  })

  await test.step("Approved correction appears in the Registrar's 'Recent' workqueue", async () => {
    await page.getByTestId('exit-event').click()
    await page.getByText('Recent').click()

    await expect(
      page.getByRole('button', {
        name: formatV2ChildName({ 'child.name': updatedChildDetails })
      })
    ).toBeVisible()
  })
})
