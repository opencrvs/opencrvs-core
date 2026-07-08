import { expect, test } from '@playwright/test'

import { login } from '../../helpers'
import { CLIENT_URL, CREDENTIALS } from '../../constants'
import {
  expectBirthsTabSelected,
  expectNoBrokenCards,
  populateDashboardRecords
} from './utils'

// Every card on the Births tab, in dashboard grid order. The markdown intro
// card ("Registrations Dashboard") has no title element.
const EXPECTED_CARD_TITLES = [
  'Births registrations total',
  'Birth registrations by time period and by sex',
  'Birth registrations by age and by sex',
  'Birth registrations by sex',
  'Birth registrations by type of location and by sex',
  'Birth registrations by province',
  'Birth registrations by district',
  'Birth registration certification rate',
  "Birth registrations by mother's age in years",
  "Birth registrations by father's age in years",
  'Birth registrations by type of birth'
]
const UNTITLED_CARDS = 1 // markdown intro card

test('Registrations dashboard cards render and survive filtering', async ({
  page
}) => {
  await populateDashboardRecords(page)

  await login(page, CREDENTIALS.REGISTRAR)
  await page.goto(`${CLIENT_URL}/performance/dashboard/registrations`)
  const frame = page.frameLocator('iframe')

  await test.step('All cards render without errors on the Births tab', async () => {
    await expectBirthsTabSelected(frame)
    await expectNoBrokenCards(frame, EXPECTED_CARD_TITLES, UNTITLED_CARDS)
  })

  await test.step('Location filter does not break any card', async () => {
    await frame.getByRole('button', { name: 'Location' }).click()
    await frame.getByText('Ibombo District Office', { exact: true }).click()
    await frame.getByRole('button', { name: 'Add filter' }).click()

    await expect(
      frame.getByText('Location: Ibombo District Office')
    ).toBeVisible()
    await expectNoBrokenCards(frame, EXPECTED_CARD_TITLES, UNTITLED_CARDS)
  })

  await test.step('Date filter does not break any card', async () => {
    // Defaults to "Date: This year"; selecting a relative range applies it
    // immediately without a confirm button
    await frame.getByText('Date:', { exact: false }).click()
    await frame.getByText('Previous 30 days', { exact: true }).click()

    await expect(frame.getByText('Date: Previous 30 days')).toBeVisible()
    await expectNoBrokenCards(frame, EXPECTED_CARD_TITLES, UNTITLED_CARDS)
  })

  await test.step('Resetting the date filter does not break any card', async () => {
    // The widget's button is labelled "Clear" when the default value is
    // selected and "Reset filter to default state" otherwise. Scope to the
    // Date widget — the applied Location filter has a similar button.
    await frame
      .locator('[data-testid="parameter-widget"]', { hasText: 'Date:' })
      .getByRole('button', { name: /reset filter|clear/i })
      .click()

    await expect(frame.getByText('Date: This year')).toBeVisible()
    await expectNoBrokenCards(frame, EXPECTED_CARD_TITLES, UNTITLED_CARDS)
  })
})
