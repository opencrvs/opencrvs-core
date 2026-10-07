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
import { test, expect } from '@playwright/test'
import { format, subDays } from 'date-fns'
import {
  getToken,
  goToSection,
  login,
  switchEventTab,
  triggerDeclarationAction,
  uploadImage
} from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
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
