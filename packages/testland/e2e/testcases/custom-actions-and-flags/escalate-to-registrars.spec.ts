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
import {
  formatName,
  getToken,
  login,
  searchFromSearchBar,
  switchEventTab
} from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '@e2e/support/constants'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { createDeclaration } from '@e2e/support/test-data/birth-declaration-with-father-brother'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

test('Escalation of birth registration by Registrar', async ({ page }) => {
  test.setTimeout(300_000)

  const childNameForRegGeneral = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName('female')
  }
  const childNameForProvincialRegistrar = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName('female')
  }
  const childNameForRegGeneralFormatted = formatName(childNameForRegGeneral)
  const childNameForProvincialFormatted = formatName(
    childNameForProvincialRegistrar
  )
  const token = await getToken(CREDENTIALS.REGISTRAR)
  await createDeclaration(
    token,
    {
      'child.name': {
        firstname: childNameForRegGeneral.firstNames,
        surname: childNameForRegGeneral.familyName
      }
    },
    'REGISTER',
    'HEALTH_FACILITY'
  )
  await createDeclaration(
    token,
    {
      'child.name': {
        firstname: childNameForProvincialRegistrar.firstNames,
        surname: childNameForProvincialRegistrar.familyName
      }
    },
    'REGISTER',
    'HEALTH_FACILITY'
  )
  await login(page, CREDENTIALS.REGISTRAR)

  await test.step('Escalate to Provincial Registrar', async () => {
    await test.step('Registrar assigns birth registration', async () => {
      await page.getByText('Pending certification').click()
      await openRecordByTitle(page, childNameForProvincialFormatted)
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR, {
        timeout: 15_000
      })
    })

    await test.step("Event should not have the 'Escalated' -flag", async () => {
      await expect(
        page.getByText('Escalated', { exact: true })
      ).not.toBeVisible()
    })

    await test.step('Escalate to Provincial Registrar', async () => {
      await selectAction(page, 'Escalate')
      await expect(page.getByText('Escalate to')).toBeVisible()
      await expect(page.getByText('Reason')).toBeVisible()

      const confirmButton = page.getByRole('button', { name: 'Confirm' })
      await expect(confirmButton).toBeDisabled()

      await page.locator('#escalate-to').click()
      await page
        .getByText('My state provincial registrar', { exact: true })
        .first()
        .click()

      const notesField = page.locator('#reason')
      await notesField.fill(
        'Escalating this case to Provincial Registrar for further review.'
      )

      const escalateResponse = page.waitForResponse(
        (response) =>
          response.url().includes('event.actions.custom') &&
          response.status() === 200
      )

      await expect(confirmButton).toBeEnabled()
      await confirmButton.click()
      await escalateResponse
    })
  })

  await test.step('Escalate to Registrar General', async () => {
    await test.step('Registrar assigns birth registration', async () => {
      await searchFromSearchBar(page, childNameForRegGeneralFormatted)
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    })

    await test.step("Event should not have the 'Escalated' -flag", async () => {
      await expect(
        page.getByText('Escalated', { exact: true })
      ).not.toBeVisible()
    })

    await test.step('Escalate to Registrar General', async () => {
      await selectAction(page, 'Escalate')
      await expect(page.getByText('Escalate to')).toBeVisible()
      await expect(page.getByText('Reason')).toBeVisible()

      const confirmButton = page.getByRole('button', { name: 'Confirm' })
      await expect(confirmButton).toBeDisabled()

      await page.locator('#escalate-to').click()
      await page.getByText('Registrar General').click()

      const notesField = page.locator('#reason')
      await notesField.fill(
        'Escalating this case to Registrar General for further review.'
      )

      const escalateResponse = page.waitForResponse(
        (response) =>
          response.url().includes('event.actions.custom') && response.ok()
      )

      await expect(confirmButton).toBeEnabled()
      await confirmButton.click()

      await escalateResponse
    })
  })

  await test.step('Verify Escalated Status by Registrar General', async () => {
    await test.step('Verify Registrar General Escalated Status', async () => {
      await login(page, CREDENTIALS.REGISTRAR_GENERAL)
      await page.getByText('Pending feedback').click()

      await openRecordByTitle(page, childNameForRegGeneralFormatted)
    })

    await test.step('Assign', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_GENERAL)
    })

    await test.step('Event should have the correct flag', async () => {
      await expect(
        page.getByText('Escalated to Registrar General')
      ).toBeVisible()
      await expect(
        page.getByText('Escalated to Provincial Registrar')
      ).not.toBeVisible()
    })

    await test.step('Registrar general should have the action Registrar General feedback', async () => {
      await selectAction(page, 'Registrar general feedback')

      const feedbackResponse = page.waitForResponse(
        (response) =>
          response.url().includes('event.actions.custom') && response.ok()
      )
      const confirmButton = page.getByRole('button', { name: 'Confirm' })
      await expect(confirmButton).toBeDisabled()

      const notesField = page.locator('#notes')
      await notesField.fill('Approving after verifying record - by RG.')

      await expect(confirmButton).toBeEnabled()
      await confirmButton.click()

      await feedbackResponse
    })
  })

  await test.step('Verify Escalated Status by Provincial Registrar', async () => {
    await test.step('Verify Provincial Registrar Escalated Status', async () => {
      await login(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
      await page.getByText('Pending feedback').click()
      await openRecordByTitle(page, childNameForProvincialFormatted)
    })

    await test.step('Assign', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
    })

    await test.step('Event should have the correct flag', async () => {
      await expect(
        page.getByText('Escalated to Registrar General')
      ).not.toBeVisible()
      await expect(
        page.getByText('Escalated to Provincial Registrar')
      ).toBeVisible()
    })

    await test.step('Provincial Registrar should have the action Provincial registrar feedback', async () => {
      await selectAction(page, 'Provincial registrar feedback')

      const confirmButton = page.getByRole('button', { name: 'Confirm' })
      await expect(confirmButton).toBeDisabled()

      const notesField = page.locator('#notes')
      await notesField.fill('Approving after verifying record - by PR.')

      await expect(confirmButton).toBeEnabled()

      const feedbackResponse = page.waitForResponse(
        (response) =>
          response.url().includes('event.actions.custom') && response.ok()
      )

      await confirmButton.click()

      await feedbackResponse
    })
  })

  await test.step('Audit review by LR', async () => {
    await test.step('Verify audit trail of Registrar General feedback action', async () => {
      await test.step('Navigate to the declaration review page', async () => {
        await login(page, CREDENTIALS.REGISTRAR, true)
        await searchFromSearchBar(page, childNameForRegGeneralFormatted)
      })

      await test.step('Assign', async () => {
        await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      })

      await test.step('LR should still have the option to Escalate', async () => {
        await page.getByRole('button', { name: 'Action', exact: true }).click()
        await expect(page.getByText('Escalate', { exact: true })).toBeVisible()
        await switchEventTab(page, 'Audit')
      })

      await test.step('Verify audit of escalate action', async () => {
        await page
          .getByRole('button', { name: 'Escalated', exact: true })
          .click()

        await expect(
          page.getByText('Escalate to', { exact: true })
        ).toBeVisible()

        await expect(page.getByText('Reason', { exact: true })).toBeVisible()
        const modal = page.getByTestId('event-history-modal')

        await expect(
          modal.getByText('Registrar General', { exact: true })
        ).toBeVisible()

        await expect(
          page.getByText(
            'Escalating this case to Registrar General for further review.',
            { exact: true }
          )
        ).toBeVisible()

        await page.locator('#close-dialog').click()
      })

      await test.step('Validate that action and form field value appearing in audit trail', async () => {
        await page
          .getByRole('button', { name: 'Escalation feedback', exact: true })
          .click()
        await expect(
          page.getByText('Approving after verifying record - by RG.')
        ).toBeVisible()
      })

      await test.step('Exit to workqueue', async () => {
        await page.locator('#close-dialog').click()
        await page.getByTestId('exit-event').click()
      })
    })

    await test.step('Verify audit trail of Provincial Registrar feedback action', async () => {
      await test.step('Navigate to the declaration review page', async () => {
        await searchFromSearchBar(page, childNameForProvincialFormatted)
      })

      await test.step('Assign', async () => {
        await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      })

      await test.step('LR should still have the option to Escalate', async () => {
        await page.getByRole('button', { name: 'Action', exact: true }).click()
        await expect(page.getByText('Escalate', { exact: true })).toBeVisible()
        await switchEventTab(page, 'Audit')
      })

      await test.step('Verify audit of escalate action', async () => {
        await page
          .getByRole('button', { name: 'Escalated', exact: true })
          .click()

        await expect(
          page.getByText('Escalate to', { exact: true })
        ).toBeVisible()

        await expect(page.getByText('Reason', { exact: true })).toBeVisible()

        const modal = page.getByTestId('event-history-modal')
        await expect(
          modal.getByText('My state provincial registrar', { exact: true })
        ).toBeVisible()

        await expect(
          page.getByText(
            'Escalating this case to Provincial Registrar for further review.',
            { exact: true }
          )
        ).toBeVisible()

        await page.locator('#close-dialog').click()
      })

      await test.step('Validate that action and form field value appearing in audit trail', async () => {
        await page
          .getByRole('button', { name: 'Escalation feedback', exact: true })
          .click()
        await expect(
          page.getByText('Approving after verifying record - by PR.')
        ).toBeVisible()
      })
    })
  })
})
