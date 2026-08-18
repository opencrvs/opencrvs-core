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
import { faker } from '@faker-js/faker'
import { ActionType } from '@opencrvs/toolkit/events'
import { CREDENTIALS } from '../../../../constants'
import { ensureAssignedToUser } from '../../utils'
import { selectAction } from '../../../../utils'
import {
  createDeclaration as createBirthDeclaration,
  type Declaration as BirthDeclaration
} from '../../../../testcases/test-data/birth-declaration'
import { fillDate, formatV2ChildName } from '../../../../testcases/birth/helpers'
import {
  drawSignature,
  formatName,
  getToken,
  goToSection,
  login,
  switchEventTab,
  triggerDeclarationAction,
  uploadImageToSection
} from '../../../../helpers'
import { openRecordByTitle, searchFromSearchBar } from '../../helpers'

// TestRail TC-0061: Verify user can edit supporting docs
// (covers the "no document -> upload one, birth" sub-scenario of this
// test case; the death/replace/delete sub-scenarios aren't automated here)
test('Verify user can attach a supporting document to a NOTIFIED birth record that had none', async ({
  page
}) => {
  test.setTimeout(180_000)

  let declaration: BirthDeclaration

  await test.step('Community Leader notifies a birth record via API (no documents attached)', async () => {
    const token = await getToken(CREDENTIALS.COMMUNITY_LEADER)
    const res = await createBirthDeclaration(
      token,
      undefined,
      ActionType.NOTIFY
    )
    declaration = res.declaration
  })

  await test.step('Login as Community Leader', async () => {
    // Registration Officer/Registrar don't hold record.notify (see
    // roles.ts) - only Community Leader/Hospital Official do - so "Notify
    // with edits" below is only ever offered to the record's own notifier.
    await login(page, CREDENTIALS.COMMUNITY_LEADER)
  })

  await test.step('Assign the notified record and start editing', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.COMMUNITY_LEADER)

    await selectAction(page, 'Edit')
  })

  await test.step("Upload proof of mother's ID under Supporting documents", async () => {
    // Documents are declaration fields, not annotation fields, so unlike
    // the informant signature they aren't editable inline on the review
    // page - Change/Change all always navigates to the dedicated
    // edit/pages/documents route, where the same upload widgets as the
    // fresh declare flow are mounted. The accordion has to be expanded
    // first ("Show") since its rows (and their Change links) only render
    // while active.
    await page
      .locator('#Accordion_documents-accordion')
      .getByRole('button', { name: 'Show' })
      .click()
    await page.getByTestId('change-button-documents.proofOfMother').click()

    await uploadImageToSection({
      page,
      sectionLocator: page.locator('#documents____proofOfMother'),
      sectionTitle: 'National ID',
      buttonLocator: page.locator('button[name="documents____proofOfMother"]')
    })

    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  await test.step('The uploaded document is shown on the review page', async () => {
    await expect(
      page.locator('#Accordion_documents-accordion').getByText('National ID')
    ).toBeVisible()
  })

  await test.step('Notify with edits', async () => {
    await triggerDeclarationAction(page, 'Notify with edits')
  })
})

// TestRail TC-0062: Verify user can edit informant's signature
// (1 of 2 e2e tests in this file covering this test case - adding a
// signature where none existed)
test('Verify user can add a signature to a NOTIFIED birth record that had none', async ({
  page
}) => {
  test.setTimeout(180_000)

  const childName = {
    firstNames: faker.person.firstName(),
    familyName: faker.person.lastName()
  }

  await test.step('Login as Community Leader', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER)
  })

  await test.step('Start a birth declaration and skip the signature', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#firstname').fill(childName.firstNames)
    await page.locator('#surname').fill(childName.familyName)

    await goToSection(page, 'review')
  })

  await test.step('Notify without a signature', async () => {
    await triggerDeclarationAction(page, 'Notify')
  })

  await test.step('Assign the notified record and start editing', async () => {
    // Stay logged in as the same Community Leader who notified it -
    // Registration Officer/Registrar don't hold record.notify (see
    // roles.ts), so "Notify with edits" below would never be offered to
    // them; only the record's own notifier (or Hospital Official) can.
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatName(childName))
    await ensureAssignedToUser(page, CREDENTIALS.COMMUNITY_LEADER)

    await selectAction(page, 'Edit')
  })

  await test.step('No signature carried over from the sign-less Notify', async () => {
    await goToSection(page, 'review')

    await expect(
      page.getByRole('button', { name: 'Sign', exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Delete', exact: true })
    ).not.toBeVisible()
  })

  await test.step('Add the informant signature', async () => {
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Delete', exact: true })
    ).toBeVisible()
  })

  await test.step('Notify with edits', async () => {
    // await page.locator('#review____comment').fill('Adding the comment')
    await triggerDeclarationAction(page, 'Notify with edits')
  })
})

// TestRail TC-0062: Verify user can edit informant's signature
// (2 of 2 e2e tests in this file covering this test case - replacing an
// existing signature)
test("Verify user can replace an existing informant signature on a DECLARED birth record", async ({
  page
}) => {
  test.setTimeout(180_000)

  let declaration: BirthDeclaration

  await test.step('Community Leader declares a birth record via API (with a signature)', async () => {
    const token = await getToken(CREDENTIALS.COMMUNITY_LEADER)
    const res = await createBirthDeclaration(
      token,
      undefined,
      ActionType.DECLARE
    )
    declaration = res.declaration
  })

  await test.step('Login as Registration Officer', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Assign the declared record and start editing', async () => {
    await page.getByText('Pending validation').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await selectAction(page, 'Edit')
    await goToSection(page, 'review')
  })

  await test.step('Delete the existing signature', async () => {
    await expect(
      page.getByRole('button', { name: 'Delete', exact: true })
    ).toBeVisible()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()

    await expect(
      page.getByRole('button', { name: 'Sign', exact: true })
    ).toBeVisible()
  })

  await test.step('Provide a new signature', async () => {
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  await test.step('Declare with edits', async () => {
    await triggerDeclarationAction(page, 'Declare with edits')
  })
})

// TestRail TC-0063: Verify user can edit informant type
test('Verify user can edit the informant type, including via "Someone else"', async ({
  page
}) => {
  test.setTimeout(180_000)

  let declaration: BirthDeclaration

  await test.step('Community Leader declares a birth record via API (informant: Mother)', async () => {
    const token = await getToken(CREDENTIALS.COMMUNITY_LEADER)
    const res = await createBirthDeclaration(
      token,
      undefined,
      ActionType.DECLARE
    )
    declaration = res.declaration
  })

  await test.step('Login as Registration Officer', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Assign the declared record and start editing', async () => {
    await page.getByText('Pending validation').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await selectAction(page, 'Edit')
  })

  await test.step("Change informant to 'Someone else'", async () => {
    await page.getByTestId('change-button-informant.relation').click()

    await page.locator('#informant____relation').click()
    await page.getByText('Someone else', { exact: true }).click()

    // 'Someone else' shows a free-text 'Relationship to child' field instead
    // of the mother/father radio options.
    await expect(page.locator('#informant____other____relation')).toBeVisible()
    await page.locator('#informant____other____relation').fill('Uncle')
    await page.locator('#informant____email').fill(faker.internet.email())

    await page.getByRole('button', { name: 'Go to review' }).click()

    await expect(
      page.getByTestId('informant.other.relation-value')
    ).toContainText('Uncle')
  })

  await test.step('Change informant back to Father', async () => {
    await page.getByTestId('change-button-informant.relation').click()

    await page.locator('#informant____relation').click()
    await page.getByText('Father', { exact: true }).click()
    await page.locator('#informant____email').fill(faker.internet.email())

    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  const father = {
    firstNames: faker.person.firstName('male'),
    familyName: faker.person.lastName('male')
  }

  await test.step("Father's details are required now that he is the informant", async () => {
    await expect(page.getByTestId('father.name-value')).toContainText(
      'Required'
    )

    await page.getByTestId('change-button-father.name').click()

    await page.locator('#firstname').fill(father.firstNames)
    await page.locator('#surname').fill(father.familyName)
    await fillDate(page, { dd: '12', mm: '05', yyyy: '1985' })
    await page.getByTestId('select__father____idType').click()
    await page.getByText('None', { exact: true }).click()
    await page.locator('#father____addressSameAs_YES').click()

    await page.getByRole('button', { name: 'Go to review' }).click()

    await expect(page.getByTestId('father.name-value')).toContainText(
      father.firstNames + ' ' + father.familyName
    )
  })

  await test.step('Declare with edits', async () => {
    await triggerDeclarationAction(page, 'Declare with edits')
  })

  await test.step('View page (Record tab) shows the updated informant type', async () => {
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await switchEventTab(page, 'Record')
    await expect(page.getByTestId('informant.relation-value')).toHaveText(
      'Father'
    )
    await expect(page.getByTestId('father.name-value')).toContainText(
      father.firstNames + ' ' + father.familyName
    )
  })

  await test.step("Audit trail's Edited entry lists the original and corrected informant type", async () => {
    await switchEventTab(page, 'Audit')
    await page.getByRole('button', { name: 'Edited', exact: true }).first().click()

    const modal = page.getByTestId('event-history-modal')
    await expect(modal.getByText("Informant's details")).toBeVisible()
    await expect(modal.getByText("Father's details")).toBeVisible()
    await expect(modal.getByText('Original').first()).toBeVisible()
    await expect(modal.getByText('Correction').first()).toBeVisible()
    await expect(modal.getByText(father.firstNames + ' ' + father.familyName)).toBeVisible()

    await page.locator('#close-dialog').click()
  })
})
