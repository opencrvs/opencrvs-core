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
import { expect, Page, test } from '@playwright/test'
import {
  continueForm,
  login,
  drawSignature,
  getToken,
  goToSection,
  triggerDeclarationAction
} from '../../helpers'
import { faker } from '@faker-js/faker'
import {
  fillChildDetails,
  openBirthDeclaration,
  REQUIRED_VALIDATION_ERROR
} from '../birth/helpers'
import { CLIENT_URL, CREDENTIALS } from '../../constants'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { selectAction, type } from '../../utils'
import {
  navigateToCertificatePrintAction,
  openRecordByTitle,
  selectRequesterType
} from '../print-certificate/birth/helpers'

test.describe('Form state', () => {
  test.describe
    .serial('Declaration form state or annotation is not persisted to a new event', async () => {
    let childName = ''
    let page: Page

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('Login', async () => {
      await login(page)
    })

    test('Create a draft', async () => {
      await openBirthDeclaration(page)
      childName = await fillChildDetails(page)

      await goToSection(page, 'review')

      // Fill annotation
      const sentence = faker.lorem.sentence(5)
      await page.locator('#review____comment').fill(sentence)
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page.getByRole('button', { name: 'Apply' }).click()

      // Save & Exit draft
      await triggerDeclarationAction(page, 'Save & Exit')
    })

    test('Form states and annotations are not persisted', async () => {
      //@todo: The user should be navigated to "my-drafts" tab by default
      await page.getByText('Drafts').click()

      await expect(
        page.getByRole('button', { name: childName, exact: true })
      ).toBeVisible()

      await openBirthDeclaration(page)
      await goToSection(page, 'review')

      // Child name fields should be empty
      await expect(page.getByTestId('child.name-value')).toHaveText(
        REQUIRED_VALIDATION_ERROR
      )
      // Comment should be empty and sign button should be visible
      await expect(page.locator('#review____comment')).toHaveValue('')
      await expect(page.getByRole('button', { name: 'Sign' })).toBeVisible()
    })
  })

  test.describe
    .serial('Declaration form state or annotation is not persisted to another events action', async () => {
    let page: Page
    let actionableEventChildName = ''

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('Login', async () => {
      await login(page)
    })

    test('Create a draft', async () => {
      await openBirthDeclaration(page)
      actionableEventChildName = await fillChildDetails(page)

      await page.getByRole('button', { name: 'Save & Exit' }).click()
      await page.getByRole('button', { name: 'Confirm' }).click()

      // Now create another draft and fill in more details, incl. annotation
      await openBirthDeclaration(page)
      await fillChildDetails(page)
      await page.getByRole('button', { name: 'Continue' }).click()
      await page
        .getByTestId('text__informant____email')
        .fill(faker.internet.email())

      await goToSection(page, 'review')

      // Fill annotation
      const sentence = faker.lorem.sentence(5)
      await page.locator('#review____comment').fill(sentence)
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page.getByRole('button', { name: 'Apply' }).click()

      // Save & Exit draft
      await triggerDeclarationAction(page, 'Save & Exit')
    })

    test('Form states and annotations are not persisted', async () => {
      await page.getByRole('button', { name: 'Drafts' }).click()

      await openRecordByTitle(page, actionableEventChildName)

      await selectAction(page, 'Update')

      await expect(page.getByTestId('child.name-value')).not.toHaveText(
        REQUIRED_VALIDATION_ERROR
      )

      await expect(page.getByTestId('informant.email-value')).toHaveText(
        REQUIRED_VALIDATION_ERROR
      )
      // Comment should be empty and sign button should be visible
      await expect(page.locator('#review____comment')).toHaveValue('')
      await expect(page.getByRole('button', { name: 'Sign' })).toBeVisible()
    })
  })

  test.describe
    .serial('Action annotation state is not persisted to another action instance', async () => {
    let declaration: Declaration
    let page: Page

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('Create a declaration', async () => {
      const token = await getToken(CREDENTIALS.REGISTRAR)
      declaration = (await createDeclaration(token)).declaration
    })

    test('Login', async () => {
      await login(page)
    })

    test('Form changes in correction are persisted after reload', async () => {
      const updatedMotherName = faker.person.firstName('female')
      expect(declaration).toBeDefined()
      await page.getByRole('button', { name: 'Pending certification' }).click()
      await navigateToCertificatePrintAction(
        page,
        declaration!,
        CREDENTIALS.REGISTRAR
      )
      await selectRequesterType(page, 'Print and issue to Informant (Mother)')
      await continueForm(page)
      await page.getByRole('button', { name: 'Verified' }).click()
      await continueForm(page)
      await page.getByRole('button', { name: 'No, make correction' }).click()
      await page.locator('#requester____type').click()
      await page.getByText('Informant (Mother)', { exact: true }).click()

      await page.locator('#reason____option').click()
      await page
        .getByText(
          'Informant provided incorrect information (Material error)',
          {
            exact: true
          }
        )
        .click()

      await page.getByRole('button', { name: 'Continue', exact: true }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      await continueForm(page)
      await page
        .locator('#fees____amount')
        .fill(faker.number.int({ min: 1, max: 1000 }).toString())
      await continueForm(page)
      await page.getByTestId('change-button-mother.name').click()
      await type(page, '#firstname', updatedMotherName)
      await page.reload()
      await expect(page.locator('#firstname')).toHaveValue(updatedMotherName)
    })

    test('Form states and annotations are not persisted', async () => {
      expect(declaration).toBeDefined()

      await page.goto(CLIENT_URL)
      await page.getByRole('button', { name: 'Pending certification' }).click()
      await navigateToCertificatePrintAction(
        page,
        declaration!,
        CREDENTIALS.REGISTRAR
      )
      await selectRequesterType(page, 'Print and issue to someone else')

      await page.getByTestId('text__firstname').fill(faker.person.firstName())

      await page.getByTestId('exit-button').click()

      await navigateToCertificatePrintAction(
        page,
        declaration!,
        CREDENTIALS.REGISTRAR
      )

      await expect(
        page.getByTestId('select__collector____requesterId')
      ).not.toHaveText('Print and issue to someone else')

      await expect(page.getByTestId('text__firstname')).not.toBeVisible()
    })
  })

  test.describe
    .serial('Declaration form is populated after refresh', async () => {
    let page: Page

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('Login', async () => {
      await login(page)
    })
    test('Move to birth form', async () => {
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Input child fields', async () => {
      const firstname = 'foo'
      const surname = 'bar'
      await type(page, '#firstname', firstname)
      await type(page, '#surname', surname)
    })

    test('refresh the page and verify fields are populated', async () => {
      await page.reload()
      await expect(page.locator('#firstname')).toHaveValue('foo')
      await expect(page.locator('#surname')).toHaveValue('bar')
    })
  })
})
