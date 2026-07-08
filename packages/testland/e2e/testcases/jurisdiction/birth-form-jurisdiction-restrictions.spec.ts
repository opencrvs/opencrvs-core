import { expect, test, type Page } from '@playwright/test'

import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { openBirthDeclaration } from '../birth/helpers'

test.describe('Birth form - child place of birth jurisdiction restrictions', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('Hospital Official should be able to only choose their own location as Health Institution', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await openBirthDeclaration(page)

    await page.locator('#child____placeOfBirth').click()
    await page.getByText('Health Institution', { exact: true }).click()

    const locationInput = await page.locator('#child____birthLocation')
    await locationInput.click()

    const dropdown = await page.locator(
      '#searchable-select-child____birthLocation .react-select__menu'
    )
    await expect(dropdown).toBeVisible()

    // Make sure select menu only has one visible option and that it contains "Klow Village Hospital"
    const options = await dropdown.locator('[role="list"] > li')
    await expect(options).toHaveCount(1)
    await expect(options.first()).toHaveText('Klow Village Hospital')
  })

  // @TODO: This limitation is not properly implemented yet, will be implemented after:
  // https://github.com/opencrvs/opencrvs-core/issues/11936
  test.skip('Hospital Official should not be able to choose an Residential Address or Other location', async () => {})

  test('Registrar should be able to only choose locations in their own administrative area as Health Institution', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await openBirthDeclaration(page)

    await page.locator('#child____placeOfBirth').click()
    await page.getByText('Health Institution', { exact: true }).click()

    const locationInput = await page.locator('#child____birthLocation')
    await locationInput.click()

    const dropdown = await page.locator(
      '#searchable-select-child____birthLocation .react-select__menu'
    )
    await expect(dropdown).toBeVisible()

    // Make sure select menu only has one visible option and that it contains locations in user's administrative area
    const options = await dropdown.locator('[role="list"] > li')
    await expect(options).toHaveCount(2)
    await expect(options.nth(1)).toHaveText('Ibombo District Hospital')
  })

  test('Registrar should be able to only choose an address in their own administrative area as Residential Address', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await openBirthDeclaration(page)

    await page.locator('#child____placeOfBirth').click()
    await page.getByText('Residential address', { exact: true }).click()

    await expect(
      page.locator(
        '#child____birthLocation____privateHome-form-input #province'
      )
    ).toBeDisabled()

    await expect(page.locator('#searchable-select-province')).toHaveText(
      'Central'
    )

    await expect(
      page.locator(
        '#child____birthLocation____privateHome-form-input #district'
      )
    ).toBeDisabled()

    await expect(page.locator('#searchable-select-district')).toHaveText(
      'Ibombo'
    )
  })

  test('Registrar should be able to only choose an address in their own administrative area as Other', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await openBirthDeclaration(page)

    await page.locator('#child____placeOfBirth').click()
    await page.getByText('Other', { exact: true }).click()

    await expect(
      page.locator('#child____birthLocation____other-form-input #province')
    ).toBeDisabled()

    await expect(page.locator('#searchable-select-province')).toHaveText(
      'Central'
    )

    await expect(
      page.locator('#child____birthLocation____other-form-input #district')
    ).toBeDisabled()

    await expect(page.locator('#searchable-select-district')).toHaveText(
      'Ibombo'
    )
  })
})
