import { expect, test } from '@playwright/test'
import {
  getToken,
  login,
  searchFromSearchBar,
  switchEventTab
} from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'
import { createDeclaration } from '../test-data/birth-declaration-with-mother-father'
import { formatV2ChildName } from '../birth/helpers'
import { ActionType } from '@opencrvs/toolkit/events'
import { ensureAssignedToUser, selectAction } from '../../utils'
import { openRecordByTitle } from '../print-certificate/birth/helpers'

test('Duplicate overview', async ({ page }) => {
  const details = {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': new Date(Date.now() - 60 * 60 * 24 * 1000)
      .toISOString()
      .split('T')[0],
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': '1995-09-12',
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10)
  }

  const name = formatV2ChildName(details)
  let trackingId: string
  let duplicateTrackingId: string

  await test.step('First declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, details)

    expect(res.trackingId).toBeDefined()

    trackingId = res.trackingId!
  })

  await test.step('Second declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, details, ActionType.DECLARE)
    duplicateTrackingId = res.trackingId!
  })

  await test.step("Navigate to potential duplicate's overview", async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, name)
  })

  await test.step('Validate duplicate in overview page', async () => {
    await page.getByRole('button', { name: 'Assign record' }).click()
    await page.getByRole('button', { name: 'Assign', exact: true }).click()

    await expect(
      page.getByText(`Potential duplicate of record ${trackingId}`)
    ).toBeVisible()

    await page.getByRole('button', { name: 'Audit', exact: true }).click()

    await page
      .getByRole('button', { name: 'Flagged as potential duplicate' })
      .click()

    await expect(
      page.locator('#event-history-modal').getByText('Matched to')
    ).toBeVisible()

    await expect(
      page.locator('#event-history-modal').getByText(trackingId)
    ).toBeVisible()
    await page.locator('#close-dialog').click()
  })

  await test.step('Mark as duplicate', async () => {
    await selectAction(page, 'Review potential duplicates')
    await page.getByRole('button', { name: 'Mark as duplicate' }).click()
    await page.locator('.react-select__control').first().click()
    await page.locator('.react-select__option').getByText(trackingId).click()

    await page.locator('#describe-reason').fill('Test reason')

    await page.getByTestId('mark-as-duplicate-button').click()
  })

  await test.step("Navigate back to duplicate's overview and validate audit", async () => {
    await searchFromSearchBar(page, duplicateTrackingId, false)
    await openRecordByTitle(page, name)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await expect(page.getByTestId('status-value')).toHaveText('Archived')

    // Open the audit page and check for "Marked as duplicate" action
    await switchEventTab(page, 'Audit')

    await expect(
      page.getByRole('button', { name: 'Marked as a duplicate', exact: true })
    ).toBeVisible()
  })
})
