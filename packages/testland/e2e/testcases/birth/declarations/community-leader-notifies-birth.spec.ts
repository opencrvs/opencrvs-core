import { test, expect } from '@playwright/test'
import {
  drawSignature,
  formatName,
  goToSection,
  login,
  triggerDeclarationAction
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { openRecordByTitle } from '../../print-certificate/birth/helpers'

test('Community leader notifies birth', async ({ page }) => {
  const childName = {
    firstNames: faker.person.firstName(),
    familyName: faker.person.lastName()
  }

  await test.step('Login as Community leader', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER)
  })

  await test.step('Initiate birth declaration', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Fill child details', async () => {
    await page.locator('#firstname').fill(childName.firstNames)
    await page.locator('#surname').fill(childName.familyName)
  })

  await test.step('Continue to review', async () => {
    await goToSection(page, 'review')
  })

  await test.step('Provide informant signature, then delete it', async () => {
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    await expect(page.getByRole('dialog')).not.toBeVisible()

    await page.getByRole('button', { name: 'Delete', exact: true }).click()

    await expect(
      page.getByRole('button', { name: 'Sign', exact: true })
    ).toBeVisible()
  })

  await test.step('Notify', async () => {
    await triggerDeclarationAction(page, 'Notify')
  })

  await test.step('Open record', async () => {
    await page.getByText('Recent').click()

    await openRecordByTitle(page, formatName(childName))
  })

  await test.step('Assert that record is notified', async () => {
    await expect(page.getByTestId('status-value')).toHaveText('Notified')
  })
})
