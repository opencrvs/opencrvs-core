import { expect, test, type Page } from '@playwright/test'
import { login, triggerDeclarationAction } from '../../helpers'
import { faker } from '@faker-js/faker'
import { expectInUrl, type } from '../../utils'
const deceased = {
  name: {
    firstname: faker.person.firstName('male')
  }
}

test.describe('1. Death event declaration', () => {
  test.describe.serial('Fill all form sections. Save & Exit', () => {
    let page: Page
    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('1.1. Navigate to the death event declaration page', async () => {
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
        await expect(page.getByLabel('Birth')).toBeVisible()
        await expect(page.getByLabel('Death')).toBeVisible()

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

      test('1.2.3 Select the "Death" event and click "Continue" button', async () => {
        await page.getByLabel('Death').click()
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
         * - verbiage of death event introduction
         * - Continue Button
         * - Exit Button
         * - Save and exit button
         * - 3dot menu (delete option)
         */
        //  await expect(page.getByLabel('Continue')).toBeVisible()
        await expect(
          page.getByText(
            'Introduce the death registration process to the informant'
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

      test('1.3.2 Verify the verbiage of introduction page of death event', async () => {
        /*
         * Expected result: should show
         * - I am going to help you make a declaration of death.
         * - As the legal Informant it is important that all the information provided by you is accurate.
         * - Once the declaration is processed you will receive an email to tell you
         *   when to visit the office to collect the certificate - Take your ID with you.
         * - Make sure you collect the certificate. A death certificate is critical to support with
         *   inheritance claims and to resolve the affairs of the deceased e.g. closing bank accounts and setting loans.
         */
        await expect(
          page.getByText('I am going to help you make a declaration of death.')
        ).toBeVisible()
        await expect(
          page.getByText(
            'As the legal Informant it is important that all the information provided by you is accurate.'
          )
        ).toBeVisible()
        await expect(
          page.getByText(
            'Once the declaration is processed you will receive an email to tell you when to visit the office to collect the certificate - Take your ID with you.'
          )
        ).toBeVisible()
        await expect(
          page.getByText(
            'Make sure you collect the certificate. A death certificate is critical to support with inheritance claims and to resolve the affairs of the deceased e.g. closing bank accounts and setting loans.'
          )
        ).toBeVisible()
      })

      test('1.3.3 Click the "continue" button', async () => {
        await page.getByRole('button', { name: 'Continue' }).click()
        /*
         * Expected result: should navigate to the "Deceased details" page
         */
        await expect(page.getByText("Deceased's details")).toBeVisible()
      })
    })

    test.describe('1.4 Validate "Deceased Details" page', async () => {
      test('1.4.1 Validate the contents of Deceased details page', async () => {
        /*
         * Expected result: should see
         * - Deceased details block
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

      test('1.4.2 Validate Deceased details block', async () => {
        await page.locator('#firstname').fill(deceased.name.firstname)
      })

      test('1.4.3 Click "continue"', async () => {
        await page.getByRole('button', { name: 'Continue' }).click()

        /*
         * Expected result: should navigate to 'event details' page
         */
        await expect(page.getByText('Event details')).toBeVisible()
      })
    })

    test.describe('1.5 Validate "Event Details" page', async () => {
      test('1.5.1 Validate the contents of Event details page', async () => {
        /*
         * Expected result: should see
         * - Event details block
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

      test.skip('1.5.2 Validate Event details block', async () => {})

      test('1.5.3 Click "continue"', async () => {
        await page.getByRole('button', { name: 'Continue' }).click()

        /*
         * Expected result: should navigate to 'informant details' page
         */
        await expect(page.getByText("Informant's details")).toBeVisible()
      })
    })

    test.describe('1.6 Validate "Informant details" page', async () => {
      test('1.6.1 Validate the contents of informant details page', async () => {
        /*
         * Expected result: should see
         * - Relationship to deceased dropdown
         * - Phone number field
         * - Email address field
         * - Continue button
         * - Exit button
         * - Save &exit button
         * - 3dot menu (delete option)
         */
        await expect(page.getByText('Informant Type')).toBeVisible()
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

      test.skip('1.6.2 Click the "continue" button without selecting any relationship to deceased', async () => {})

      test('misc: shows validation error for phone number', async () => {
        await type(page, '#informant____phoneNo', '123')
        await expect(page.locator('#informant____phoneNo_error')).toHaveText(
          'Must be a valid 10 digit number that starts with 0(7|9)'
        )
        await type(page, '#informant____phoneNo', '')
      })

      test('1.6.3 Select eny option in relatinship to deceased and click the "continue" button', async () => {
        await page.getByText('Select').click()
        await page.getByText('Son', { exact: true }).click()
        await page.getByRole('button', { name: 'Continue' }).click()

        /*
         * Expected result: should navigate to "sposue details" page
         */
        await expect(
          page.getByText('Spouse details', { exact: true })
        ).toBeVisible()
      })
    })

    test.describe('1.7 Validate "Spouse Details" page', async () => {
      test('1.7.1 validate the contents of spouse details page', async () => {
        /*
         * Expected result: should see
         * - Spouse details block
         * - Continue button
         * - Exit button
         * - Save & exit button
         * - 3dot menu (delete option)
         */

        await expect(
          page.getByText('Spouse details', { exact: true })
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

      test.skip('1.7.2 Validate Spouse details block', async () => {})

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

      test.skip('1.8.2 Validate Supporting Document block', async () => {})

      test('1.8.3 click continue', async () => {
        await page.getByRole('button', { name: 'Continue' }).click()
        await expectInUrl(page, `/review`)
      })
    })

    test.describe('1.9 Validate "Save & Exit" Button  ', async () => {
      test('1.9.1 Click the "Save & Exit" button from any page', async () => {
        await page.getByRole('button', { name: 'Action', exact: true }).click()
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
         * - find the declared death event record on this page list with saved data
         */
        //@todo: The user should be navigated to "my-drafts" tab by default
        await page.getByText('Drafts').click()

        await expect(page.locator('#content-name')).toHaveText('Drafts')

        await expect(
          page.getByText(deceased.name.firstname, { exact: true })
        ).toBeVisible()
      })
    })
  })
  test.describe('1.10 Validate "Exit" Button', async () => {
    test.beforeEach(async ({ page }) => {
      await login(page)

      await page.click('#header-new-event')
      await page.getByLabel('Death').click()
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
      /*
       * Expected result: should be navigated to "my-drafts" tab but no draft will be saved
       */

      await expect(page.locator('#content-name')).toHaveText('Assigned to you')

      await expect(
        page.getByText(deceased.name.firstname, { exact: true })
      ).toBeHidden()
    })
  })

  test.describe('1.11 Validate "Delete Declaration" Button  ', async () => {
    test.beforeEach(async ({ page }) => {
      await login(page)
      await page.click('#header-new-event')
      await page.getByLabel('Death').click()
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
       * - Helper text: Are you certain you want to delete this draft declaration form? Please note, this action cant be undone.
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
      const deleteResponse = page.waitForResponse(
        (response) => response.url().includes('event.delete') && response.ok()
      )
      await page.getByRole('button', { name: 'Confirm' }).click()
      await deleteResponse

      /*
       * Expected result: should be navigated to "my-drafts" tab but no draft will be saved
       */

      await expect(page.locator('#content-name')).toHaveText('Assigned to you')

      await expect(
        page.getByText(deceased.name.firstname, { exact: true })
      ).toBeHidden()
    })

    // @TODO: This test is not implemented in V2 events yet
    test.describe.skip('1.12 Technical test for shortcuts', () => {
      test.skip('Shortcut for quickly creating declarations', async () => {})
    })
  })
})
