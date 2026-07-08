import { expect, test } from '@playwright/test'
import { login } from '../../helpers'
import { assertTexts, selectLocationOption } from '../../utils'
import { CREDENTIALS } from '../../constants'

test.describe("Advanced Search 8 - Death - Deceased's place of death", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, CREDENTIALS.REGISTRAR_VILLAGE)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await page.getByText('Death').click()
    await page.getByText('Event details').click()
  })

  test('8.1 Before selecting a place of death', async ({ page }) => {
    await expect(
      page.getByText('Place of death', { exact: true })
    ).toBeVisible()
    await expect(
      page
        .locator('#eventDetails____deathLocation-form-input')
        .getByText('Health Institution', { exact: true })
    ).not.toBeVisible()
    await expect(page.getByText('Country')).not.toBeVisible()
  })
  test('8.2 Select Health Institution', async ({ page }) => {
    await page.getByTestId('select__eventDetails____placeOfDeath').click()
    await page.getByText('Health Institution', { exact: true }).click()
    await expect(
      page
        .locator('#eventDetails____deathLocation-form-input')
        .getByText('Health Institution', { exact: true })
    ).toBeVisible()

    await expect(page.getByText('Country')).not.toBeVisible()

    await page.locator('#eventDetails____deathLocation').fill('Klow')
    await selectLocationOption(page, 'Klow Village Hospital')

    await page.getByTestId('search').click()
    await expect(page.getByText(/Search results\s*\(\d+\)/)).toBeVisible()

    await assertTexts({
      root: page,
      texts: [
        'Event: Death',
        "Deceased's Health Institution: Klow Village Hospital, Klow, Ibombo, Central, Farajaland",
        'Place of death: Health Institution'
      ],
      testId: 'search-result'
    })
  })
  test('8.3 Select Residential address', async ({ page }) => {
    await page.getByTestId('select__eventDetails____placeOfDeath').click()
    await page.getByText('Residential address', { exact: true }).click()
    await expect(
      page
        .locator('#eventDetails____deathLocation-form-input')
        .getByText('Health Institution', { exact: true })
    ).not.toBeVisible()
    await expect(page.getByText('Country')).toBeVisible()

    await page.getByTestId('search').click()
    await expect(page.getByText(/Search results\s*\(\d+\)/)).toBeVisible()

    await assertTexts({
      root: page,
      texts: [
        'Event: Death',
        'Usual place of residence: Farajaland, Central, Ibombo, Klow',
        'Place of death: Residential address'
      ],
      testId: 'search-result'
    })
  })
  test('8.4 Select Other', async ({ page }) => {
    await page.getByTestId('select__eventDetails____placeOfDeath').click()
    await page.getByText('Other', { exact: true }).click()
    await expect(
      page
        .locator('#eventDetails____deathLocation-form-input')
        .getByText('Health Institution', { exact: true })
    ).not.toBeVisible()
    await expect(page.getByText('Country')).toBeVisible()

    await page.getByTestId('search').click()
    await expect(page.getByText(/Search results\s*\(\d+\)/)).toBeVisible()
    await assertTexts({
      root: page,
      texts: [
        'Event: Death',
        'Death location address: Farajaland, Central, Ibombo',
        'Place of death: Other'
      ],
      testId: 'search-result'
    })
  })
})
