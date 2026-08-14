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
import {
  goToSection,
  login,
  uploadImage,
  uploadImageToSection
} from '../../../../helpers'
import { openBirthDeclaration } from '../../../birth/helpers'
import { trackAndDeleteCreatedEvents } from '../../../test-data/eventDeletion'

/*
 * QA case: "Validate Supporting documents page". The informant is set to
 * "Brother" so all four optional document slots (mother, father, informant,
 * other) are visible alongside the always-present "Proof of birth" slot -
 * see the show-conditions on documents.proofOfMother/proofOfFather (require
 * mother/father details) and proofOfInformant/proofOther (informant not
 * mother/father) in packages/testland/src/events/birth/forms/pages/documents.ts.
 */

const beginAtDocumentsPage = async (page: Page) => {
  await login(page)
  await openBirthDeclaration(page)
  // Edge-case child name from the birth sample-data sheet (sample 6:
  // "Complete declaration by National Registrar" - tests an apostrophe).
  await page.locator('#firstname').fill("O'Neill")
  await page.locator('#surname').fill('Samson')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#informant____relation').click()
  await page.getByText('Brother', { exact: true }).click()
  await page.locator('#informant____email').fill('informant@opencrvs.dev')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(
    page.getByText('Upload supporting documents', { exact: true })
  ).toBeVisible()
}

/*
 * Drives a fresh declaration to the Documents page for a given informant
 * relation, optionally marking a parent's details unavailable along the
 * way - see requireMotherDetails/requireFatherDetails in
 * packages/testland/src/events/birth/forms/pages/mother.ts and father.ts.
 */
const beginAtDocumentsPageAs = async (
  page: Page,
  relation: 'Mother' | 'Father' | 'Brother',
  unavailable: { mother?: boolean; father?: boolean } = {}
) => {
  await login(page)
  await openBirthDeclaration(page)
  await page.locator('#firstname').fill('Test')
  await page.locator('#surname').fill('Child')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#informant____relation').click()
  await page.getByText(relation, { exact: true }).click()
  await page.locator('#informant____email').fill('informant@opencrvs.dev')
  await page.getByRole('button', { name: 'Continue' }).click()

  /*
   * Expected result: the "Mother's details are not available" checkbox
   * is hidden precisely when the informant IS the mother - her details
   * are still collected either way.
   */
  if (relation === 'Mother') {
    await expect(
      page.getByText("Mother's details are not available")
    ).toBeHidden()
  } else {
    await expect(
      page.getByText("Mother's details are not available")
    ).toBeVisible()
    if (unavailable.mother) {
      await page.getByText("Mother's details are not available").click()
      await page.locator('#mother____reason').fill('Deceased.')
    }
  }
  await page.getByRole('button', { name: 'Continue' }).click()

  /*
   * Expected result: symmetrically, the father's own checkbox is hidden
   * precisely when the informant IS the father.
   */
  if (relation === 'Father') {
    await expect(
      page.getByText("Father's details are not available")
    ).toBeHidden()
  } else {
    await expect(
      page.getByText("Father's details are not available")
    ).toBeVisible()
    if (unavailable.father) {
      await page.getByText("Father's details are not available").click()
      await page.locator('#father____reason').fill('Deceased.')
    }
  }
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(
    page.getByText('Upload supporting documents', { exact: true })
  ).toBeVisible()
}

const expectDocumentOptions = async (
  page: Page,
  expected: {
    mother: boolean
    father: boolean
    informant: boolean
    other: boolean
  }
) => {
  /*
   * Expected result: "Proof of birth" has no conditional at all - always
   * present regardless of informant relation or parent availability.
   */
  await expect(
    page.locator('button[name="documents____proofOfBirth"]')
  ).toBeVisible()

  /*
   * Each dropdown container and its (possibly disabled) upload button
   * share the same id, so scope to the first match to avoid a
   * strict-mode violation.
   */
  const proofOfMother = page.locator('#documents____proofOfMother').first()
  const proofOfFather = page.locator('#documents____proofOfFather').first()
  const proofOfInformant = page
    .locator('#documents____proofOfInformant')
    .first()
  const proofOther = page.locator('#documents____proofOther').first()

  await expect(proofOfMother)[expected.mother ? 'toBeVisible' : 'toBeHidden']()
  await expect(proofOfFather)[expected.father ? 'toBeVisible' : 'toBeHidden']()
  await expect(proofOfInformant)[
    expected.informant ? 'toBeVisible' : 'toBeHidden'
  ]()
  await expect(proofOther)[expected.other ? 'toBeVisible' : 'toBeHidden']()
}

trackAndDeleteCreatedEvents()

test('Validate Supporting documents page', async ({ page }) => {
  await beginAtDocumentsPage(page)

  await test.step('1-2. Navigate to the page and validate the available options', async () => {
    /*
     * Expected result: Proof of birth is always shown (no dropdown, just
     * an Upload button)
     */
    await expect(
      page.locator('button[name="documents____proofOfBirth"]')
    ).toBeVisible()

    for (const section of ['documents____proofOfMother', 'documents____proofOfFather']) {
      await page
        .locator(`#${section}`)
        .getByText('Select', { exact: true })
        .click()
      for (const option of [
        'National ID',
        'Passport',
        'Birth Certificate',
        'Other'
      ]) {
        await expect(
          page.locator(`#${section}`).getByText(option, { exact: true })
        ).toBeVisible()
      }
      await page.keyboard.press('Escape')
    }

    /*
     * Expected result: "Proof of informant's ID" and "Other" appear
     * because the informant is not mother/father
     */
    /*
     * The dropdown container and its (currently disabled) upload button
     * share the same id, so scope to the first match to avoid a
     * strict-mode violation.
     */
    await expect(
      page.locator('#documents____proofOfInformant').first()
    ).toBeVisible()
    await expect(page.locator('#documents____proofOther').first()).toBeVisible()

    await page
      .locator('#documents____proofOther')
      .getByText('Select', { exact: true })
      .click()
    for (const option of [
      'Proof of legal guardianship',
      'Proof of assigned responsibility'
    ]) {
      await expect(
        page.locator('#documents____proofOther').getByText(option, { exact: true })
      ).toBeVisible()
    }
    await page.keyboard.press('Escape')
  })

  await test.step('3-4. Validate the file-uploading system', async () => {
    /*
     * Expected result: user finds a dropdown and corresponding Upload
     * button for each supporting-document slot
     */
    await uploadImageToSection({
      page,
      sectionLocator: page.locator('#documents____proofOfMother'),
      sectionTitle: 'Birth Certificate',
      buttonLocator: page.locator(
        'button[name="documents____proofOfMother"]'
      )
    })

    /*
     * Expected result: the trash/delete icon is available after upload
     */
    await expect(
      page.locator('#document_BIRTH_CERTIFICATE_link')
    ).toContainText('Birth Certificate')
    await expect(page.getByLabel('Delete attachment')).toBeVisible()

    await page.getByLabel('Delete attachment').click()

    /*
     * Expected result: clicking the trash icon removes the attachment
     */
    await expect(
      page.locator('#document_BIRTH_CERTIFICATE_link')
    ).toBeHidden()
  })

  await test.step('5-6. Uploading a document type hides it from the dropdown afterwards', async () => {
    await uploadImageToSection({
      page,
      sectionLocator: page.locator('#documents____proofOfFather'),
      sectionTitle: 'National ID',
      buttonLocator: page.locator(
        'button[name="documents____proofOfFather"]'
      )
    })

    await page
      .locator('#documents____proofOfFather')
      .getByText('Select', { exact: true })
      .click()

    /*
     * Expected result: "National ID" is no longer offered, since it has
     * already been uploaded
     */
    await expect(
      page
        .locator('#documents____proofOfFather')
        .getByText('National ID', { exact: true })
    ).toBeHidden()
    await expect(
      page
        .locator('#documents____proofOfFather')
        .getByText('Passport', { exact: true })
    ).toBeVisible()
    await page.keyboard.press('Escape')
  })

  await test.step('7. An unsupported file type is rejected', async () => {
    await uploadImage(
      page,
      page.locator('button[name="documents____proofOfBirth"]'),
      './e2e/testcases/qa-testrail-testcases/Birth-Death form/assets/invalid-type.txt'
    )

    /*
     * Expected result: "File format not supported. Please attach jpeg,
     * png, jpg, pdf (max 5mb)"
     */
    await expect(
      page.getByText(
        'File format not supported. Please attach jpeg, png, jpg, pdf (max 5mb)'
      )
    ).toBeVisible()
  })

  await test.step('8. A file over 5mb is rejected', async () => {
    await uploadImage(
      page,
      page.locator('button[name="documents____proofOfBirth"]'),
      './e2e/testcases/qa-testrail-testcases/Birth-Death form/assets/6MB-oversized.png'
    )

    /*
     * Expected result: "File size must be less than 5mb"
     */
    await expect(
      page.getByText('File size must be less than 5mb')
    ).toBeVisible()
  })

  await test.step('9. "Continue" navigates to the Review page', async () => {
    await goToSection(page, 'review')

    /*
     * Expected result: user is redirected to the "Declaration review"
     * page
     */
    await expect(page).toHaveURL(/\/review/)
  })
})

/*
 * Each scenario below drives its own fresh declaration (login + full page
 * navigation), which doesn't fit inside a single test's default timeout
 * when combined with the other six - split into one test per scenario, as
 * done elsewhere in this folder (e.g. birth/9's per-page tests).
 */
test("Informant is Mother, Father's details are present", async ({
  page
}) => {
  await beginAtDocumentsPageAs(page, 'Mother')
  await expectDocumentOptions(page, {
    mother: true,
    father: true,
    informant: false,
    other: false
  })
})

test("Informant is Mother, Father's details are marked unavailable", async ({
  page
}) => {
  await beginAtDocumentsPageAs(page, 'Mother', { father: true })
  await expectDocumentOptions(page, {
    mother: true,
    father: false,
    informant: false,
    other: false
  })
})

test("Informant is Father, Mother's details are present", async ({
  page
}) => {
  await beginAtDocumentsPageAs(page, 'Father')
  await expectDocumentOptions(page, {
    mother: true,
    father: true,
    informant: false,
    other: false
  })
})

test("Informant is Father, Mother's details are marked unavailable", async ({
  page
}) => {
  await beginAtDocumentsPageAs(page, 'Father', { mother: true })
  await expectDocumentOptions(page, {
    mother: false,
    father: true,
    informant: false,
    other: false
  })
})

test("Informant is neither parent, both parents' details are present", async ({
  page
}) => {
  await beginAtDocumentsPageAs(page, 'Brother')
  await expectDocumentOptions(page, {
    mother: true,
    father: true,
    informant: true,
    other: true
  })
})

test("Informant is neither parent, only one parent's details are present", async ({
  page
}) => {
  await beginAtDocumentsPageAs(page, 'Brother', { mother: true })
  await expectDocumentOptions(page, {
    mother: false,
    father: true,
    informant: true,
    other: true
  })
})

test("Informant is neither parent, neither parent's details are present", async ({
  page
}) => {
  await beginAtDocumentsPageAs(page, 'Brother', {
    mother: true,
    father: true
  })
  await expectDocumentOptions(page, {
    mother: false,
    father: false,
    informant: true,
    other: true
  })
})
