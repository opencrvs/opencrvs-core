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
import {
  createDeclaration as createDeathDeclaration,
  type Declaration as DeathDeclaration
} from '../../../../testcases/test-data/death-declaration'
import { fillDate, formatV2ChildName } from '../../../../testcases/birth/helpers'
import {
  getToken,
  goToSection,
  joinValuesWith,
  login,
  switchEventTab,
  triggerDeclarationAction,
  validateActionMenuButton
} from '../../../../helpers'
import { openRecordByTitle } from '../../helpers'

const formatV2DeceasedName = (declaration: {
  'deceased.name': { firstname: string; surname: string }
  [key: string]: any
}) =>
  joinValuesWith([
    declaration['deceased.name'].firstname,
    declaration['deceased.name'].surname
  ])

// Community Leader and Hospital Official (notify-only, see el-notify.spec.ts) are
// already exercised there for the incomplete-record case, including the
// disabled 'Declare' action. Here we cover the roles that create declarations
// directly (Registration Officer and Registrar).

// TestRail TC-0057: Verify user unable to declare incomplete record
test('Verify user unable to declare incomplete record', async ({ page }) => {
  test.setTimeout(180_000)

  const childName = {
    firstNames: faker.person.firstName(),
    familyName: faker.person.lastName()
  }
  const deceasedName = {
    firstNames: faker.person.firstName(),
    familyName: faker.person.lastName()
  }

  await test.step('Login as Registration Officer', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Start an incomplete birth declaration', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#firstname').fill(childName.firstNames)
    await page.locator('#surname').fill(childName.familyName)

    await goToSection(page, 'review')
  })

  await test.step("Action menu has 'Declare' (disabled) for the incomplete birth declaration", async () => {
    await validateActionMenuButton(page, 'Declare', false)
  })

  await test.step('Start an incomplete death declaration', async () => {
    await page.getByTestId('exit-button').click()
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()

    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#firstname').fill(deceasedName.firstNames)
    await page.locator('#surname').fill(deceasedName.familyName)

    await goToSection(page, 'review')
  })

  await test.step("Action menu has 'Declare' (disabled) for the incomplete death declaration", async () => {
    await validateActionMenuButton(page, 'Declare', false)
  })
})

// TestRail TC-0058: Verify user can declare previously NOTIFIED records
// (1 of 2 e2e tests in this file covering this test case - the birth/RO
// variant; see the death/Community Leader variant below)
test('Verify Registration Officer can declare a previously NOTIFIED birth record via edit', async ({
  page
}) => {
  test.setTimeout(300_000)

  let declaration: BirthDeclaration

  await test.step('Community Leader notifies a birth record via API', async () => {
    const token = await getToken(CREDENTIALS.COMMUNITY_LEADER)
    // The default NOTIFY declaration deliberately omits mother.nid/mother.dob
    // (see the comment in createDeclaration), leaving the record incomplete
    // for Declare until it is edited - matching the workflow the spreadsheet
    // describes.
    const res = await createBirthDeclaration(
      token,
      undefined,
      ActionType.NOTIFY
    )
    declaration = res.declaration
  })

  await test.step('Login as Registration Officer', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Notifications workqueue lists the notified record', async () => {
    await page.getByText('Notifications').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
  })

  await test.step('Assign and start editing', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    await selectAction(page, 'Edit')
    await goToSection(page, 'review')
  })

  await test.step("'Declare with edits' is disabled while mother's date of birth/ID are still missing", async () => {
    await validateActionMenuButton(page, 'Declare with edits', false)
  })

  await test.step("Fill in mother's missing date of birth and ID", async () => {
    await page.getByTestId('change-button-mother.dob').click()
    await fillDate(page, { dd: '15', mm: '06', yyyy: '1998' })
    await page.locator('#mother____nid').fill(faker.string.numeric(10))

    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  await test.step("'Declare with edits' is enabled once required information is complete", async () => {
    await validateActionMenuButton(page, 'Declare with edits', true)
  })

  await test.step('Declare with edits', async () => {
    await triggerDeclarationAction(page, 'Declare with edits')
  })

  await test.step('Record is Declared, with Edited and Declared audit entries', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await expect(page.getByTestId('status-value')).toHaveText('Declared')

    await switchEventTab(page, 'Audit')
    await expect(
      page.getByRole('button', { name: 'Edited', exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Declared', exact: true })
    ).toBeVisible()
  })
})

// TestRail TC-0058: Verify user can declare previously NOTIFIED records
// (2 of 2 e2e tests in this file covering this test case - the death/CL
// variant; see the birth/Registration Officer variant above)
//
// Known issue: When CL notifies a death record, the 'Attestation required' flag is added.
// Which shouldn't have. If fixed it'll pass.

test.skip('Verify Community Leader can declare their own previously NOTIFIED death record via edit', async ({  // Known issue: When CL notifies a death record, the 'Attestation required' flag is added. Which shouldn't have. If fixed it'll pass.
  page
}) => {
  test.setTimeout(180_000)

  let declaration: DeathDeclaration

  await test.step('Community Leader notifies a death record via API', async () => {
    const token = await getToken(CREDENTIALS.COMMUNITY_LEADER)
    const res = await createDeathDeclaration(
      token,
      undefined,
      ActionType.NOTIFY
    )
    declaration = res.declaration
  })

  await test.step('Login as Community Leader', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER)
  })

  await test.step('Own notified record is found in Recent', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatV2DeceasedName(declaration))

    await expect(page.getByTestId('status-value')).toHaveText('Notified')
  })

  await test.step('Assign and start editing', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.COMMUNITY_LEADER)
    await selectAction(page, 'Edit')
  })

  await test.step('Make a change and go back to review', async () => {
    await goToSection(page, 'review')
    await page.getByTestId('change-button-informant.email').click()
    await page.locator('#informant____email').fill(faker.internet.email())
    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  await test.step('Declare with edits', async () => {
    await validateActionMenuButton(page, 'Declare with edits', true)
    await triggerDeclarationAction(page, 'Declare with edits')
  })

  await test.step('Record is Declared, with Edited and Declared audit entries', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formatV2DeceasedName(declaration))

    await expect(page.getByTestId('status-value')).toHaveText('Declared')

    await ensureAssignedToUser(page, CREDENTIALS.COMMUNITY_LEADER)
    await switchEventTab(page, 'Audit')
    await expect(
      page.getByRole('button', { name: 'Edited', exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Declared', exact: true })
    ).toBeVisible()
  })
})
