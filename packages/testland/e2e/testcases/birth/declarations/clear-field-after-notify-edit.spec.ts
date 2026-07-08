import { test, expect } from '@playwright/test'
import {
  formatName,
  goToSection,
  login,
  switchEventTab,
  triggerDeclarationAction
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { ensureAssignedToUser, selectAction } from '../../../utils'
import { fillDate } from '../helpers'
import { openRecordByTitle } from '../../print-certificate/birth/helpers'

test('Cleared field values are removed after editing and re-notifying a declaration', async ({
  page
}) => {
  const childName = {
    firstNames: faker.person.firstName(),
    familyName: faker.person.lastName()
  }
  const formattedChildName = formatName(childName)
  const childDob = { dd: '12', mm: '03', yyyy: '2015' }
  const childWeight = '3.5'
  let dobValueBefore = ''
  let nameValueBefore = ''
  let recordUrl = ''

  await test.step('Login as Community Leader', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER)
  })

  await test.step('Initiate birth declaration', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step("Fill child's name, date of birth and weight at birth", async () => {
    await page.locator('#firstname').fill(childName.firstNames)
    await page.locator('#surname').fill(childName.familyName)
    await fillDate(page, childDob)
    // A non-mandatory field that we will later clear during edit.
    await page.locator('#child____weightAtBirth').fill(childWeight)
  })

  await test.step('Continue to review and Notify', async () => {
    await goToSection(page, 'review')
    await triggerDeclarationAction(page, 'Notify')
  })

  await test.step('Open the notified record and capture the values shown', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formattedChildName)
    await expect(page.getByTestId('status-value')).toHaveText('Notified')
    // Capture the record URL so it can be reopened after the name (used as the workqueue row title) has been cleared.
    recordUrl = page.url()

    await ensureAssignedToUser(page, CREDENTIALS.COMMUNITY_LEADER)
    await switchEventTab(page, 'Record')

    const dob = page.getByTestId('row-value-child.dob')
    await expect(dob).toContainText(childDob.yyyy)
    dobValueBefore = (await dob.innerText()).trim()

    const name = page.getByTestId('row-value-child.name')
    await expect(name).toContainText(childName.familyName)
    nameValueBefore = (await name.innerText()).trim()
  })

  await test.step('Edit the notification and clear the date of birth, the name and the weight', async () => {
    await selectAction(page, 'Edit')

    await page.getByTestId('change-button-child.dob').click()

    // Clear the date of birth ...
    await fillDate(page, { dd: '', mm: '', yyyy: '' })

    // ... clear the child's name, a complex (multi-part) field, on the same
    // page ...
    await page.locator('#firstname').fill('')
    await page.locator('#surname').fill('')

    // ... and clear the weight at birth, a non-mandatory field on the same
    // page.
    await page.locator('#child____weightAtBirth').fill('')

    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  await test.step('Review page during edit shows the cleared weight as deleted', async () => {
    const weightRow = page.getByTestId('row-value-child.weightAtBirth')

    // The previous value is shown as deleted
    await expect(weightRow.locator('del')).toContainText(childWeight)
  })

  await test.step('Notify again with the cleared field', async () => {
    await triggerDeclarationAction(page, 'Notify with edits')
  })

  await test.step('Record no longer shows the previously entered date of birth or name', async () => {
    // The name was cleared, so the record can no longer be found by its title;
    // reopen it directly via the URL captured earlier.
    await page.goto(recordUrl)

    await expect(page.getByLabel('Assign record')).toBeVisible()
    await ensureAssignedToUser(page, CREDENTIALS.COMMUNITY_LEADER)
    await switchEventTab(page, 'Record')

    // The cleared values must not persist: neither the date of birth nor the
    // name row may still display the value entered before the edit.
    await expect(page.getByTestId('row-value-child.dob')).not.toHaveText(
      dobValueBefore
    )
    await expect(page.getByTestId('row-value-child.name')).not.toHaveText(
      nameValueBefore
    )
    await expect(
      page.getByTestId('row-value-child.weightAtBirth')
    ).not.toContainText(childWeight)
  })
})
