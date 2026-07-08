import { expect, test, type Page } from '@playwright/test'
import { login, triggerDeclarationAction } from '../../helpers'
import path from 'path'
import { faker } from '@faker-js/faker'
import { expectInUrl, selectAction } from '../../utils'
import { trackAndDeleteCreatedEvents } from '../test-data/eventDeletion'

const child = {
  name: {
    firstNames: faker.person.firstName('female'),
    surname: faker.person.lastName()
  }
}

test.describe.serial('1. Birth event declaration', () => {
  trackAndDeleteCreatedEvents()

  test.describe.serial('Fill all form sections. Save & Exit', () => {
    let page: Page
    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('1.1. Navigate to the birth event declaration page', async () => {
      await login(page)

      await page.click('#header-new-event')
      await expect(page.getByText('New Declaration')).toBeVisible()
      await expect(
        page.getByText('What type of event do you want to declare?')
      ).toBeVisible()
    })

    test.describe('1.2. Validate event selection page', async () => {
      test('1.2.1 Validate the contents of the event type page', async () => {
        /*
         * Expected result: should show
         * - Radio buttons of the events
         * - Continue button
         * - Exit button
         */
        await expect(
          page.getByLabel('Tennis club membership application')
        ).toBeVisible()

        await expect(
          page.getByRole('button', { name: 'Continue' })
        ).toBeVisible()
        await expect(page.getByRole('button', { name: 'Exit' })).toBeVisible()
      })

      test('1.2.2 Click the "Continue" button without selecting any event', async () => {
        await page.getByRole('button', { name: 'Continue' }).click()
        /*
         * Expected result: should throw an error as below:
         * "Please select the type of event"
         */
        await expect(
          page.getByText('Please select the type of event')
        ).toBeVisible()
      })

      test('1.2.3 Select the "Birth" event and click "Continue" button', async () => {
        await page.getByLabel('Birth').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        /*
         * Expected result: User should navigate to the "Introduction" page
         */
      })
    })

    test.describe('1.3 Validate "Introduction" page', async () => {
      test('1.3.1 Validate the contents of introduction page', async () => {
        /*
         * Expected result: should show
         * - verbiage of birth event introduction
         * - Continue Button
         * - Exit Button
         * - Save and exit button
         * - 3dot menu (delete option)
         */
        //  await expect(page.getByLabel('Continue')).toBeVisible()
        await expect(
          page.getByText(
            'Introduce the birth registration process to the informant'
          )
        ).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Continue' })
        ).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Exit', exact: true })
        ).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Save & Exit' })
        ).toBeVisible()

        await page.locator('#event-menu-dropdownMenu').click()
        await expect(
          page
            .locator('#event-menu-dropdownMenu')
            .getByRole('listitem')
            .filter({ hasText: 'Delete declaration' })
        ).toBeVisible()
      })

      test('1.3.2 Verify the verbiage of introduction page of birth event', async () => {
        /*
         * Expected result: should show
         * - I am going to help you make a declaration of birth.
         * - As the legal Informant it is important that all the information provided by you is accurate.
         * - Once the declaration is processed you will receive an SMS to tell you
         *   when to visit the office to collect the certificate - Take your ID with you.
         * - Make sure you collect the certificate. A birth certificate is critical for this child,
         *   especially to make their life easy later on. It will help to access health services, school examinations and government benefits.
         */
        await expect(
          page.getByText('I am going to help you make a declaration of birth.')
        ).toBeVisible()
        await expect(
          page.getByText(
            'As the legal Informant it is important that all the information provided by you is accurate.'
          )
        ).toBeVisible()
        await expect(
          page.getByText(
            'Once the declaration is processed you will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.'
          )
        ).toBeVisible()
        await expect(
          page.getByText(
            'Make sure you collect the certificate. A birth certificate is critical for this child, especially to make their life easy later on. It will help to access health services, school examinations and government benefits.'
          )
        ).toBeVisible()
      })

      test('1.3.3 Click the "continue" button', async () => {
        await page.getByRole('button', { name: 'Continue' }).click()
        /*
         * Expected result: should navigate to the "Child details" page
         */
        await expect(page.getByText("Child's details")).toBeVisible()
      })
    })

    test.describe('1.4 Validate "Child Details" page', async () => {
      test('1.4.1 Validate the contents of Child details page', async () => {
        /*
         * Expected result: should see
         * - Child details block
         * - Continue Button
         * - Exit Button
         * - Save and exit button
         * - 3dot menu (delete option)
         */
        await expect(
          page.getByRole('button', { name: 'Continue' })
        ).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Exit', exact: true })
        ).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Save & Exit' })
        ).toBeVisible()

        await page.locator('#event-menu-dropdownMenu').click()
        await expect(
          page
            .locator('#event-menu-dropdownMenu')
            .getByRole('listitem')
            .filter({ hasText: 'Delete declaration' })
        ).toBeVisible()
      })

      test('1.4.2 Validate Child details block', async () => {
        await page.locator('#firstname').fill(child.name.firstNames)
        await page.locator('#firstname').blur()
        await page.locator('#surname').fill(child.name.surname)
        await page.locator('#surname').blur()
      })

      test('1.4.3 Click "continue"', async () => {
        await page.getByRole('button', { name: 'Continue' }).click()

        /*
         * Expected result: should navigate to 'informant details' page
         */
        await expect(page.getByText("Informant's details")).toBeVisible()
      })
    })

    test.describe('1.5 Validate "Informant details" page', async () => {
      test('1.5.1 Validate the contents of informant details page', async () => {
        /*
         * Expected result: should see
         * - Relationship to child dropdown
         * - Phone number field
         * - Email address field
         * - Continue button
         * - Exit button
         * - Save &exit button
         * - 3dot menu (delete option)
         */
        await expect(page.getByText('Relationship to child')).toBeVisible()
        await expect(page.getByText('Phone number')).toBeVisible()
        await expect(page.getByText('Email')).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Continue' })
        ).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Exit', exact: true })
        ).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Save & Exit' })
        ).toBeVisible()
        await page.locator('#event-menu-dropdownMenu').click()
        await expect(
          page
            .locator('#event-menu-dropdownMenu')
            .getByRole('listitem')
            .filter({ hasText: 'Delete declaration' })
        ).toBeVisible()
      })

      test('1.5.3 Select any option in relationship to child and click the "continue" button', async () => {
        await page.getByText('Select').click()
        await page.getByText('Mother', { exact: true }).click()
        await page.getByRole('button', { name: 'Continue' }).click()

        /*
         * Expected result: should navigate to "mother's details" page
         */
        await expect(
          page.getByText("Mother's details", { exact: true })
        ).toBeVisible()
      })
    })

    test.describe('1.6 Validate "Mother Details" page', async () => {
      test("1.6.1 validate the contents of mother's details page", async () => {
        /*
         * Expected result: should see
         * - Mother's details block
         * - Continue button
         * - Exit button
         * - Save & exit button
         * - 3dot menu (delete option)
         */

        await expect(
          page.getByText("Mother's details", { exact: true })
        ).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Continue' })
        ).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Exit', exact: true })
        ).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Save & Exit' })
        ).toBeVisible()
        await page.locator('#event-menu-dropdownMenu').click()
        await expect(
          page
            .locator('#event-menu-dropdownMenu')
            .getByRole('listitem')
            .filter({ hasText: 'Delete declaration' })
        ).toBeVisible()
      })

      test.skip("1.6.2 Validate Mother's details block", async () => {})

      test('1.6.3 click continue', async () => {
        await page.getByRole('button', { name: 'Continue' }).click()

        /*
         * Expected result: should navigate to "Father's details" page
         */
        await expect(
          page.getByText("Father's details", { exact: true })
        ).toBeVisible()
      })
    })

    test.describe('1.7 Validate "Father Details" page', async () => {
      test("1.7.1 validate the contents of Father's details page", async () => {
        /*
         * Expected result: should see
         * - Father's details block
         * - Continue button
         * - Exit button
         * - Save & exit button
         * - 3dot menu (delete option)
         */

        await expect(
          page.getByText("Father's details", { exact: true })
        ).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Continue' })
        ).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Exit', exact: true })
        ).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Save & Exit' })
        ).toBeVisible()
        await page.locator('#event-menu-dropdownMenu').click()
        await expect(
          page
            .locator('#event-menu-dropdownMenu')
            .getByRole('listitem')
            .filter({ hasText: 'Delete declaration' })
        ).toBeVisible()
      })

      test.skip("1.7.2 Validate Father's details block", async () => {})

      test('1.7.3 click continue', async () => {
        await page.getByRole('button', { name: 'Continue' }).click()

        /*
         * Expected result: should navigate to "Supporting documents" page
         */
        await expect(
          page.getByText('Upload supporting documents', { exact: true })
        ).toBeVisible()
      })
    })

    test.describe('1.8 Validate "Supporting Document" page', async () => {
      test('1.8.1 validate the contents of Supporting Document page', async () => {
        /*
         * Expected result: should see
         * - Supporting Document block
         * - Continue button
         * - Exit button
         * - Save & exit button
         * - 3dot menu (delete option)
         */
        await expect(
          page.getByText('Upload supporting documents', { exact: true })
        ).toBeVisible()

        await expect(
          page.getByRole('button', { name: 'Continue' })
        ).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Exit', exact: true })
        ).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Save & Exit' })
        ).toBeVisible()
        await page.locator('#event-menu-dropdownMenu').click()
        await expect(
          page
            .locator('#event-menu-dropdownMenu')
            .getByRole('listitem')
            .filter({ hasText: 'Delete declaration' })
        ).toBeVisible()
      })

      test('1.8.2 Validate Supporting Document block', async () => {
        await page
          .locator('#documents____proofOfMother-form-input div')
          .filter({ hasText: /^Select\.\.\.$/ })
          .nth(2)
          .click()
        await page.getByText('Birth Certificate', { exact: true }).click()
        await page.locator('button[name="documents____proofOfMother"]').click()

        await page
          .locator('input[data-testid="documents____proofOfMother"]')
          .setInputFiles(path.join(__dirname, 'test_img.png'))

        await expect(
          page.locator('#document_BIRTH_CERTIFICATE_link')
        ).toContainText('Birth Certificate')
        await expect(page.getByLabel('Delete attachment')).toBeVisible()
      })

      test('1.8.3 click continue', async () => {
        await page.getByRole('button', { name: 'Continue' }).click()
        await expectInUrl(page, `/review`)
      })
    })

    test.describe('1.9 Validate "Save & Exit" Button', () => {
      test('1.9.1 Click the "Save & Exit" button from review page', async () => {
        await page.getByRole('button', { name: 'Action' }).click()
        await page.getByText('Save & Exit', { exact: true }).click()

        /*
         * Expected result: should open modal with:
         * - Title: Save & Exit
         * - Helper text: All inputted data will be kept secure for future editing.
         *                Are you ready to save any changes to this declaration form?
         * - Cancel Button
         * - Confirm Button
         */

        await expect(
          page.getByRole('heading', { name: 'Save & exit?' })
        ).toBeVisible()

        await expect(
          page.getByText(
            'All inputted data will be kept secure for future editing. Are you ready to save any changes to this declaration form?'
          )
        ).toBeVisible()
        await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Confirm' })
        ).toBeVisible()
      })

      test('1.9.2 Click Cancel', async () => {
        await page.getByRole('button', { name: 'Cancel' }).click()

        /*
         * Expected result: should close the modal
         */
        await expect(
          page.getByRole('heading', { name: 'Save & exit?' })
        ).toBeHidden()
      })

      test('1.9.3 Click Confirm', async () => {
        await triggerDeclarationAction(page, 'Save & Exit')

        /*
         * Expected result: should
         * - be navigated to "my-drafts" tab
         * - find the declared birth event record on this page list with saved data
         */
        //@todo: The user should be navigated to "my-drafts" tab by default
        await page.getByText('Drafts').click()

        await expect(page.locator('#content-name')).toHaveText('Drafts')

        await expect(page.getByText(child.name.firstNames)).toBeVisible()
      })

      test('1.9.4 Reopen draft and navigate to review page', async () => {
        await page
          .getByRole('button', {
            name: child.name.firstNames + ' ' + child.name.surname
          })
          .click()

        await selectAction(page, 'Update')

        await expect(page.locator('#select_document')).toContainText(
          "Proof of mother's ID (Birth Certificate)"
        )
        await expect(
          page.getByRole('img', { name: 'Supporting Document' })
        ).toBeVisible()
      })
    })
  })

  test.describe('1.10 Validate "Exit" Button', async () => {
    test.beforeEach(async ({ page }) => {
      await login(page)

      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()

      await page.getByRole('button', { name: 'Exit', exact: true }).click()
    })

    test('1.10.1 Click the "Exit" button from any page', async ({ page }) => {
      /*
       * Expected result: should open modal with:
       * - Title: Exit without saving changes?
       * - Helper text: You have unsaved changes on your declaration form. Are you sure you want to exit without saving?
       * - Cancel Button
       * - Confirm Button
       */
      await expect(
        page.getByRole('heading', { name: 'Exit without saving changes?' })
      ).toBeVisible()
      await expect(
        page.getByText(
          'You have unsaved changes on your declaration form. Are you sure you want to exit without saving?'
        )
      ).toBeVisible()
      await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible()
    })

    test('1.10.2 Click Cancel', async ({ page }) => {
      await page.getByRole('button', { name: 'Cancel' }).click()

      /*
       * Expected result: should close the modal
       */
      await expect(
        page.getByRole('heading', { name: 'Exit without saving changes?' })
      ).toBeHidden()
    })

    test('1.10.3 Click Confirm', async ({ page }) => {
      await page.getByRole('button', { name: 'Confirm' }).click()

      await expect(
        page
          .getByTestId('search-result')
          .getByText('Assigned to you', { exact: true })
      ).toBeVisible()
    })
  })

  test.describe('1.11 Validate "Delete Declaration" Button  ', async () => {
    test.beforeEach(async ({ page }) => {
      await login(page)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()

      await page.locator('#event-menu-dropdownMenu').click()
      await page
        .locator('#event-menu-dropdownMenu')
        .getByRole('listitem')
        .filter({ hasText: 'Delete declaration' })
        .click()
    })

    test('1.11.1 Click the "Delete Declaration" button from any page', async ({
      page
    }) => {
      /*
       * Expected result: should open modal with:
       * - Title: Delete draft?
       * - Helper text: Are you sure you want to delete this declaration?
       * - Cancel Button
       * - Confirm Button
       */
      await expect(
        page.getByRole('heading', { name: 'Delete draft?' })
      ).toBeVisible()
      await expect(
        page.getByText('Are you sure you want to delete this declaration?')
      ).toBeVisible()
      await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible()
    })

    test('1.11.2 Click Cancel', async ({ page }) => {
      await page.getByRole('button', { name: 'Cancel' }).click()

      /*
       * Expected result: should close the modal
       */
      await expect(
        page.getByRole('heading', { name: 'Exit without saving changes?' })
      ).toBeHidden()
    })

    test('1.11.3 Click Confirm', async ({ page }) => {
      await page.getByRole('button', { name: 'Confirm' }).click()

      await expect(
        page.getByTestId('search-result').getByText('Assigned to you')
      ).toBeVisible()
    })
  })

  // @TODO: This test is not implemented in V2 events yet
  test.describe.skip('1.12 Technical test for shortcuts', () => {
    test.skip('Shortcut for quickly creating declarations', async () => {})
  })
})
