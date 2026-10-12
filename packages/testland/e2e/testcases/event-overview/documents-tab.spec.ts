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
import { test, expect, type Page } from '@playwright/test'
import { format, subDays } from 'date-fns'
import { faker } from '@faker-js/faker'
import {
  getToken,
  login,
  switchEventTab,
  triggerDeclarationAction,
  uploadImage,
  uploadImageToSection
} from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  mockNetworkConditions,
  restoreNetworkConditions
} from '@e2e/support/mock-network-conditions'
import {
  ensureAssignedToUser,
  expectInUrl,
  selectAction,
  type,
  waitForCorrectionAction
} from '@e2e/support/utils'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import {
  createDeclaration,
  Declaration,
  getDeclaration
} from '@e2e/support/test-data/birth-declaration'
import { getSignatureFile, uploadFile } from '@e2e/support/test-data/utils'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '@e2e/support/birth/helpers'

const PROOF_OF_BIRTH_LABEL = 'Proof of birth'

/**
 * Declares a birth via the API with a proof-of-birth document attached, so the
 * declaration action already carries one document on the Documents tab.
 */
async function declareWithProofOfBirth(): Promise<Declaration> {
  const token = await getToken(CREDENTIALS.REGISTRAR)
  const proofOfBirth = await uploadFile(getSignatureFile(), token)
  const declarationRequest = await getDeclaration({
    token,
    partialDeclaration: {
      'documents.proofOfBirth': proofOfBirth
    }
  })
  const res = await createDeclaration(
    token,
    declarationRequest,
    ActionType.DECLARE
  )
  return res.declaration
}

/**
 * Declares a birth via the API with two proof-of-mother's-ID documents
 * (National ID and Birth Certificate), both under the same FILE_WITH_OPTIONS field.
 */
async function declareWithProofOfMother(): Promise<Declaration> {
  const token = await getToken(CREDENTIALS.REGISTRAR)
  const nationalId = await uploadFile(getSignatureFile(), token)
  const birthCertificate = await uploadFile(getSignatureFile(), token)
  const declarationRequest = await getDeclaration({
    token,
    partialDeclaration: {
      'documents.proofOfMother': [
        { ...nationalId, option: 'NATIONAL_ID' },
        { ...birthCertificate, option: 'BIRTH_CERTIFICATE' }
      ]
    }
  })
  const res = await createDeclaration(
    token,
    declarationRequest,
    ActionType.DECLARE
  )
  return res.declaration
}

/** The row of the Documents tab listing the given document. */
function documentRow(page: Page, documentName: string) {
  return page
    .locator('#listTable-documents [id^="row_"]')
    .filter({ hasText: documentName })
}

test('Documents tab lists both the original and the replacement of an edited document', async ({
  page
}) => {
  const declaration = await declareWithProofOfBirth()

  await test.step('Navigate to the record and assign', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Edit the declaration and replace the proof of birth', async () => {
    await selectAction(page, 'Edit')
    await page
      .getByTestId('accordion-Accordion_documents')
      .getByRole('button', { name: 'Change all' })
      .click()

    // Re-uploading a single FILE field replaces its value, so this becomes a
    // second upload of the same field (a different file than the declaration).
    await uploadImage(
      page,
      page.locator('button[name="documents____proofOfBirth"]'),
      './e2e/assets/image.png'
    )

    await page.getByRole('button', { name: 'Go to review' }).click()
    await triggerDeclarationAction(page, 'Declare with edits')
  })

  await test.step('Documents tab shows the original and the replacement', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await switchEventTab(page, 'Documents')

    // One row from the declaration, one from the edit that replaced it.
    await expect(
      page.locator('#listTable-documents').getByText(PROOF_OF_BIRTH_LABEL)
    ).toHaveCount(2)
  })
})

test('Documents tab does not duplicate a document that an edit left unchanged', async ({
  page
}) => {
  const declaration = await declareWithProofOfBirth()

  await test.step('Navigate to the record and assign', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Edit a non-document field, leaving the proof of birth untouched', async () => {
    await selectAction(page, 'Edit')

    // Change the date of birth to another recent date — a non-document edit
    // that keeps the record out of the late-registration approval flow.
    await page.getByTestId('change-button-child.dob').click()
    const [year, month, day] = format(
      subDays(new Date(), 5),
      'yyyy-MM-dd'
    ).split('-')
    await page.getByPlaceholder('dd').fill(day)
    await page.getByPlaceholder('mm').fill(month)
    await page.getByPlaceholder('yyyy').fill(year)

    await page.getByRole('button', { name: 'Go to review' }).click()
    await triggerDeclarationAction(page, 'Declare with edits')
  })

  await test.step('Documents tab shows the unchanged proof of birth only once', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await switchEventTab(page, 'Documents')

    await expect(
      page.locator('#listTable-documents').getByText(PROOF_OF_BIRTH_LABEL)
    ).toHaveCount(1)
  })
})

test('Documents tab lists a document replaced during "Register with edits"', async ({
  page
}) => {
  const declaration = await declareWithProofOfBirth()

  await test.step('Navigate to the record and assign', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Edit the declaration, replace the proof of birth and register', async () => {
    await selectAction(page, 'Edit')
    await page
      .getByTestId('accordion-Accordion_documents')
      .getByRole('button', { name: 'Change all' })
      .click()

    await uploadImage(
      page,
      page.locator('button[name="documents____proofOfBirth"]'),
      './e2e/assets/image.png'
    )

    await page.getByRole('button', { name: 'Go to review' }).click()
    await triggerDeclarationAction(page, 'Register with edits')
  })

  await test.step('Documents tab shows the original and the replacement', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await switchEventTab(page, 'Documents')

    // One row from the declaration, one from the edit that replaced it.
    await expect(
      page.locator('#listTable-documents').getByText(PROOF_OF_BIRTH_LABEL)
    ).toHaveCount(2)
  })
})

test('Documents tab lists only the file added to a multi-file document during an edit', async ({
  page
}) => {
  const declaration = await declareWithProofOfMother()

  await test.step('Navigate to the record and assign', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  await test.step("Edit the declaration and add a passport to the proof of mother's ID", async () => {
    await selectAction(page, 'Edit')
    await page
      .getByTestId('accordion-Accordion_documents')
      .getByRole('button', { name: 'Change all' })
      .click()

    await uploadImageToSection({
      page,
      sectionLocator: page.locator('#documents____proofOfMother-form-input'),
      sectionTitle: 'Passport',
      buttonLocator: page.locator('button[name="documents____proofOfMother"]')
    })

    await page.getByRole('button', { name: 'Go to review' }).click()
    await triggerDeclarationAction(page, 'Declare with edits')
  })

  await test.step('Documents tab lists each file once, under the action that added it', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await switchEventTab(page, 'Documents')

    // The edit resends the whole field, but only the passport is new.
    await expect(
      page.locator('#listTable-documents').getByText("Proof of mother's ID")
    ).toHaveCount(3)
    await expect(
      documentRow(page, "Proof of mother's ID (National ID)")
    ).toHaveCount(1)
    await expect(
      documentRow(page, "Proof of mother's ID (Birth Certificate)")
    ).toHaveCount(1)
    await expect(
      documentRow(page, "Proof of mother's ID (Passport)")
    ).toHaveCount(1)
  })
})

test('Documents tab tells correction request documents apart from direct correction documents', async ({
  page
}) => {
  const token = await getToken(CREDENTIALS.REGISTRAR)
  const { declaration, trackingId } = await createDeclaration(
    token,
    undefined,
    ActionType.REGISTER
  )

  async function openRecord() {
    await type(page, '#searchText', trackingId!)
    await page.locator('#searchIconButton').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
  }

  async function fillCorrectionDetails(supportingDocument: string) {
    await page.locator('#requester____type').click()
    await page.getByText('Legal Guardian', { exact: true }).click()
    await page.locator('#reason____option').click()
    await page
      .getByText('Myself or an agent made a mistake (Clerical error)', {
        exact: true
      })
      .click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Verified' }).click()

    await page.getByText('Select', { exact: true }).click()
    await page.getByText(supportingDocument, { exact: true }).click()
    await uploadImage(
      page,
      page.locator('button[name="documents____supportingDocs"]')
    )
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#fees____amount').fill('10')
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByTestId('change-button-child.name').click()
    await page.getByTestId('text__firstname').fill(faker.person.firstName())
    await page.getByRole('button', { name: 'Go to review' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  }

  await test.step('Registration Officer requests a correction with an affidavit', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await openRecord()
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    await selectAction(page, 'Correct')

    await fillCorrectionDetails('Affidavit')

    const correctionRequest = page.waitForResponse(
      (res) =>
        res.url().includes('event.actions.correction.request') && res.ok()
    )
    await page
      .getByRole('button', { name: 'Submit correction request' })
      .click()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await correctionRequest
  })

  await test.step('Registrar rejects the correction request', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await openRecord()
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Review correction request')

    await page.getByRole('button', { name: 'Reject', exact: true }).click()
    await page.locator('#reject-correction-reason').fill('No legal proof')
    await waitForCorrectionAction(page, 'reject', async () => {
      await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    })
  })

  await test.step('Registrar corrects the record directly with a court document', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Correct')

    await fillCorrectionDetails('Court Document')

    await page.getByRole('button', { name: 'Correct' }).click()
    await waitForCorrectionAction(page, 'approve', async () => {
      await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    })
    await expectInUrl(page, `/events/`)
  })

  await test.step('Documents tab labels each document with the correction action that added it', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await switchEventTab(page, 'Documents')

    await expect(
      documentRow(page, 'Supporting documents (Affidavit)')
    ).toContainText('Request correction')
    await expect(
      documentRow(page, 'Supporting documents (Court Document)')
    ).toContainText('Correct')
    await expect(
      documentRow(page, 'Supporting documents (Court Document)')
    ).not.toContainText('Request correction')
  })
})

test('Documents tab shows an offline state while offline', async ({ page }) => {
  const declaration = await declareWithProofOfBirth()

  const documentsOfflineMessage =
    "This record's documents have not been downloaded yet, so they cannot be opened offline. Please reconnect to the internet to view them."

  await test.step('Navigate to the record and assign', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Offline, the Documents tab shows the offline state, not the list', async () => {
    await mockNetworkConditions(page, 'offline')
    await switchEventTab(page, 'Documents')

    await expect(page.getByText(documentsOfflineMessage)).toBeVisible()
    await expect(
      page.locator('#listTable-documents').getByText(PROOF_OF_BIRTH_LABEL)
    ).not.toBeVisible()
  })

  await test.step('Back online, the offline state is replaced by the document list', async () => {
    await restoreNetworkConditions(page)

    await expect(
      page.locator('#listTable-documents').getByText(PROOF_OF_BIRTH_LABEL)
    ).toBeVisible()
    await expect(page.getByText(documentsOfflineMessage)).not.toBeVisible()
  })
})

test('Documents tab shows a loading state while the documents are fetched', async ({
  page
}) => {
  const declaration = await declareWithProofOfBirth()

  await test.step('Login and open the record (without downloading it)', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
  })

  await test.step('Opening the Documents tab shows a loading state before the list', async () => {
    // Hold the on-demand event download until the loading state is asserted.
    // The record is not assigned, so the Documents tab downloads it on open.
    let releaseEventGet!: () => void
    const eventGetReleased = new Promise<void>((resolve) => {
      releaseEventGet = resolve
    })
    await page.route(/event\.get/, async (route) => {
      await eventGetReleased
      await route.continue()
    })

    await switchEventTab(page, 'Documents')

    await expect(page.getByTestId('documents-loading')).toBeVisible()
    // The empty state must not flash before the fetch resolves.
    await expect(page.getByText('No documents found')).not.toBeVisible()

    releaseEventGet()
    await page.unrouteAll({ behavior: 'wait' })
  })

  await test.step('Once fetched, the loading state is replaced by the list', async () => {
    await expect(
      page.locator('#listTable-documents').getByText(PROOF_OF_BIRTH_LABEL)
    ).toBeVisible()
    await expect(page.getByTestId('documents-loading')).not.toBeVisible()
  })
})
