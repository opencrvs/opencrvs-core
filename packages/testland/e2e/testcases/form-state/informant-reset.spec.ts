import { Page, expect, test } from '@playwright/test'
import { goToSection, login } from '../../helpers'
import { openBirthDeclaration } from '../birth/helpers'
import { CREDENTIALS } from '../../constants'

test.describe('Informant details resets when relation is changed', () => {
  test.describe.serial('Birth', async () => {
    let page: Page

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('Fill in informant details', async () => {
      await login(page, CREDENTIALS.REGISTRAR_VILLAGE)
      await openBirthDeclaration(page)

      await goToSection(page, 'informant')

      await page.locator('#informant____relation').click()
      await page
        .getByText('Brother', {
          exact: true
        })
        .click()

      await page.locator('#firstname').fill('Bart')
      await page.locator('#surname').fill('simpson')

      await page.getByPlaceholder('dd').fill('11')
      await page.getByPlaceholder('mm').fill('11')
      await page.getByPlaceholder('yyyy').fill('1999')

      await page.locator('#informant____idType').click()
      await page.getByText('National ID', { exact: true }).click()

      await page.locator('#informant____nid').fill('1234567890')
      await expect(
        page.locator('label', {
          hasText: 'ID Number'
        })
      ).toBeVisible()

      await page.locator('#country').click()
      await page.getByText('Estonia', { exact: true }).click()
      await page.locator('#state').fill('Springfield')
      await page.locator('#district2').fill('Spring County')
      await page.locator('#cityOrTown').fill('Spring City')
      await page.locator('#addressLine1').fill('Evergreen')
      await page.locator('#addressLine2').fill('Terrace')
      await page.locator('#addressLine3').fill('742')
      await page.locator('#postcodeOrZip').fill('1320')

      await page.locator('#informant____phoneNo').fill('0712345612')
      await page.locator('#informant____email').fill('bart@gmail.com')
    })

    test('Change informant', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText('Sister', {
          exact: true
        })
        .click()

      await expect(page.locator('#firstname')).toHaveValue('')
      await expect(page.locator('#surname')).toHaveValue('')

      await expect(page.locator('#informant____dob-dd')).toHaveValue('')
      await expect(page.locator('#informant____dob-mm')).toHaveValue('')
      await expect(page.locator('#informant____dob-yyyy')).toHaveValue('')

      await expect(
        page.locator('label', {
          hasText: 'ID Number'
        })
      ).toBeHidden()

      await expect(page.getByText('Estonia')).toBeHidden()
      await expect(page.locator('#country')).toHaveText('Farajaland')
      await expect(page.locator('#searchable-select-province')).toHaveText(
        'Central'
      )
      await expect(page.locator('#searchable-select-district')).toHaveText(
        'Ibombo'
      )

      await expect(page.locator('#informant____phoneNo')).toHaveValue('')
      await expect(page.locator('#informant____email')).toHaveValue('')
    })
  })

  test.describe.serial('Death', async () => {
    let page: Page

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('Fill in informant details', async () => {
      await login(page)
      await page.click('#header-new-event')
      await page.getByLabel('Death').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await goToSection(page, 'informant')

      await page.locator('#informant____relation').click()
      await page
        .getByText('Son', {
          exact: true
        })
        .click()

      await page.locator('#firstname').fill('Bart')
      await page.locator('#surname').fill('simpson')

      await page.getByPlaceholder('dd').fill('11')
      await page.getByPlaceholder('mm').fill('11')
      await page.getByPlaceholder('yyyy').fill('1999')

      await page.locator('#informant____idType').click()
      await page.getByText('National ID', { exact: true }).click()

      await page.locator('#informant____nid').fill('1234567890')
      await expect(
        page.locator('label', {
          hasText: 'ID Number'
        })
      ).toBeVisible()

      await page.locator('#informant____addressSameAs_NO').check()

      await page.locator('#country').click()
      await page.getByText('Estonia', { exact: true }).click()
      await page.locator('#state').fill('Springfield')
      await page.locator('#district2').fill('Spring County')
      await page.locator('#cityOrTown').fill('Spring City')
      await page.locator('#addressLine1').fill('Evergreen')
      await page.locator('#addressLine2').fill('Terrace')
      await page.locator('#addressLine3').fill('742')
      await page.locator('#postcodeOrZip').fill('1320')

      await page.locator('#informant____phoneNo').fill('0712345612')
      await page.locator('#informant____email').fill('bart@gmail.com')
    })

    test('Change informant', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText('Daughter', {
          exact: true
        })
        .click()

      await expect(page.locator('#firstname')).toHaveValue('')
      await expect(page.locator('#surname')).toHaveValue('')

      await expect(page.locator('#informant____dob-dd')).toHaveValue('')
      await expect(page.locator('#informant____dob-mm')).toHaveValue('')
      await expect(page.locator('#informant____dob-yyyy')).toHaveValue('')

      await expect(
        page.locator('label', {
          hasText: 'ID Number'
        })
      ).toBeHidden()

      await expect(page.getByText('Estonia')).toBeHidden()
      await expect(page.locator('#country')).toBeHidden()

      await expect(page.locator('#informant____phoneNo')).toHaveValue('')
      await expect(page.locator('#informant____email')).toHaveValue('')
    })
  })
})
