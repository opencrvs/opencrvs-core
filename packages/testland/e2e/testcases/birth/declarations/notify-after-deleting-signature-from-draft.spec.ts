import { test, expect } from '@playwright/test'
import {
  drawSignature,
  formatName,
  goToSection,
  login,
  logout,
  triggerDeclarationAction
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { ensureAssignedToUser, selectAction } from '../../../utils'
import {
  getRowByTitle,
  openRecordByTitle
} from '../../print-certificate/birth/helpers'

/**
 * Regression test for https://github.com/opencrvs/opencrvs-core/issues/12803
 *
 * Sign on the review page → save as draft → reopen the draft → delete the
 * persisted signature → Notify. Pre-fix, the annotation payload kept
 * `{ 'review.signature': null }` and the record got stuck in the outbox.
 * Post-fix (`deepDropNulls` applied to the annotation before submission),
 * the `review.signature` key is omitted entirely and the record is notified
 * normally.
 *
 * Exercising the draft round-trip is the realistic path for this regression:
 * declare actions require a signature, so the only place where a previously
 * persisted signature can be cleared is a Notify (or a draft that ends in a
 * Notify).
 */
test('Community leader notifies a birth after deleting a previously persisted signature from a draft', async ({
  page
}) => {
  const childName = {
    firstNames: faker.person.firstName(),
    familyName: faker.person.lastName()
  }
  const formattedChildName = formatName(childName)

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

  await test.step('Provide informant signature', async () => {
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  await test.step('Save & Exit to persist the signature in a draft', async () => {
    await page.getByRole('button', { name: 'Action' }).click()
    await page.getByText('Save & Exit', { exact: true }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()
  })

  await test.step('Reopen the draft from the Drafts workqueue', async () => {
    await page.getByRole('button', { name: 'Drafts' }).click()
    await getRowByTitle(page, formattedChildName)
      .getByRole('button', { name: 'Update' })
      .click()
  })

  await test.step('Delete the persisted signature', async () => {
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

    await openRecordByTitle(page, formattedChildName)
  })

  await test.step('Assert that record is notified', async () => {
    await expect(page.getByTestId('status-value')).toHaveText('Notified')
  })

  await test.step('Log out from Community Leader', async () => {
    await logout(page)
  })

  await test.step('Log in as Registration Officer', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('Open the notification and start the Declare flow', async () => {
    await page.getByText('Notifications').click()
    await openRecordByTitle(page, formattedChildName)

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    await selectAction(page, 'Edit')
  })

  await test.step('Signature is not carried over from the cleared Notify', async () => {
    // The SignatureField only renders Delete when a signature value exists,
    // so the absence of the Delete button (and the presence of the Sign
    // button) is direct evidence that nothing leaked through from the
    // previous action's annotation.
    await expect(
      page.getByRole('button', { name: 'Sign', exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Delete', exact: true })
    ).not.toBeVisible()
  })
})
