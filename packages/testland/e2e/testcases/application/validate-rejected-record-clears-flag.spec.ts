import { expect, test } from '@playwright/test'

import { login, getToken, triggerDeclarationAction } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { createDeclaration } from '../test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '../birth/helpers'
import {
  ensureAssignedToUser,
  navigateToWorkqueue,
  selectAction
} from '../../utils'
import { openRecordByTitle } from '../print-certificate/birth/helpers'
import { faker } from '@faker-js/faker'

test('Validating a rejected declaration clears the Rejected flag', async ({
  browser
}) => {
  const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
  const { declaration } = await createDeclaration(
    token,
    undefined,
    ActionType.DECLARE
  )
  const childName = formatV2ChildName(declaration)
  const page = await browser.newPage()

  await test.step('Registrar rejects the declaration (Send For Update)', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, childName)

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Reject')
    await page.getByTestId('reject-reason').fill(faker.lorem.sentence())
    await page.getByRole('button', { name: 'Send For Update' }).click()
  })

  await test.step('Registration Officer finds it in "Pending updates"', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)

    await page.getByText('Pending updates').click()
    await expect(page.getByRole('button', { name: childName })).toBeVisible()
  })

  await test.step('Open the record and perform the Validate action', async () => {
    await openRecordByTitle(page, childName)
    await expect(page.getByTestId('flags-value')).toContainText('Rejected')
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    await triggerDeclarationAction(page, 'Validate')
  })

  await test.step('Record no longer appears in "Pending updates"', async () => {
    await navigateToWorkqueue(page, 'Pending updates')
    await expect(
      page.getByRole('button', { name: childName })
    ).not.toBeVisible()
  })

  await test.step('Only the "Validated" flag remains (Rejected flag cleared)', async () => {
    await navigateToWorkqueue(page, 'Recent')
    await openRecordByTitle(page, childName)

    await expect(page.getByTestId('flags-value')).toHaveText('Validated')
  })
})
