import { expect, test } from '@playwright/test'

import { login } from '../../helpers'
import { CLIENT_URL, CREDENTIALS } from '../../constants'
import { expectBirthsTabSelected, expectNoBrokenCards } from './utils'

// Every card on the Births tab, in dashboard grid order. The markdown intro
// card has no title element.
const EXPECTED_CARD_TITLES = [
  'Completeness rate',
  'Birth registration completeness rates by province (children under 1 year of age)',
  'Birth registration completeness rates by district (children under 1 year of age)',
  'Birth registration completeness rates (over time)'
]
const UNTITLED_CARDS = 1 // markdown intro card

test('Completeness dashboard cards render and survive filtering', async ({
  page
}) => {
  await login(page, CREDENTIALS.REGISTRAR)
  await page.goto(`${CLIENT_URL}/performance/dashboard/completeness`)
  const frame = page.frameLocator('iframe')

  await test.step('All cards render without errors on the Births tab', async () => {
    await expectBirthsTabSelected(frame)
    await expectNoBrokenCards(frame, EXPECTED_CARD_TITLES, UNTITLED_CARDS)
  })

  await test.step('Year filter does not break any card', async () => {
    // Defaults to the current year. Year options are a single-select list;
    // charts also contain year texts, so target the option's testid.
    const previousYear = new Date().getFullYear() - 1

    await frame.getByRole('button', { name: 'Year' }).click()
    await frame.getByTestId(`${previousYear}-filter-value`).click()
    await frame.getByRole('button', { name: 'Update filter' }).click()

    await expect(frame.getByText(`Year: ${previousYear}`)).toBeVisible()
    await expectNoBrokenCards(frame, EXPECTED_CARD_TITLES, UNTITLED_CARDS)
  })

  await test.step('Resetting the year filter does not break any card', async () => {
    const currentYear = new Date().getFullYear()

    await frame
      .locator('[data-testid="parameter-widget"]', { hasText: 'Year' })
      .getByRole('button', { name: /reset filter|clear/i })
      .click()

    await expect(frame.getByText(`Year: ${currentYear}`)).toBeVisible()
    await expectNoBrokenCards(frame, EXPECTED_CARD_TITLES, UNTITLED_CARDS)
  })
})
