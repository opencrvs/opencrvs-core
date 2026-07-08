import { test, expect } from '@playwright/test'
import { getToken, login, searchFromSearchBar } from '../../helpers'
import { CLIENT_URL, CREDENTIALS } from '../../constants'
import {
  createDeclaration,
  Declaration,
  getDeclaration
} from '../test-data/birth-declaration'
import {
  formatV2ChildName,
  getAdministrativeAreas,
  getIdByName
} from '../birth/helpers'
import { ActionType, AddressType } from '@opencrvs/toolkit/events'
import { ensureAssignedToUser } from '../../utils'

test('Record declared in one administrative area should not appear for users in another administrative area', async ({
  browser
}) => {
  let declaration: Declaration
  let childName: string
  let eventId: string
  const page = await browser.newPage()

  await test.step('Register record in Pualula District Office', async () => {
    const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER_PUALULA)

    const administrativeAreas = await getAdministrativeAreas(token)
    const village = getIdByName(administrativeAreas, 'Oya')

    const declarationData = await getDeclaration({
      token,
      partialDeclaration: {
        'child.placeOfBirth': 'PRIVATE_HOME',
        'child.birthLocation.privateHome': {
          country: 'FAR',
          addressType: AddressType.DOMESTIC,
          administrativeArea: village
        },
        'child.birthLocationId': village
      }
    })

    const res = await createDeclaration(
      token,
      declarationData,
      ActionType.DECLARE
    )

    declaration = res.declaration
    eventId = res.eventId
    childName = formatV2ChildName(declaration)
  })

  await test.step('Registrar from Ibombo District Office', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await test.step('Record should not be visible on workqueues', async () => {
      await page.getByRole('button', { name: 'Pending registration' }).click()
      await expect(
        page.getByRole('button', { name: childName })
      ).not.toBeVisible()
    })

    await test.step('User should not be able to find the record via search', async () => {
      await searchFromSearchBar(page, childName, false)
    })

    await test.step('User should not be able to navigate to record via direct URL', async () => {
      await page.goto(`${CLIENT_URL}/events/${eventId}`)
      // Add extra timeout to wait for the page.goto() to complete
      await expect(
        page.getByText(`No event or draft found with id: ${eventId}`)
      ).toBeVisible({ timeout: 30_000 })
    })
  })

  await test.step('Registrar from Pualula District Office', async () => {
    await login(page, CREDENTIALS.REGISTRAR_PUALULA)

    await test.step('Record should be visible on workqueues', async () => {
      await page.getByRole('button', { name: 'Pending registration' }).click()
      await expect(page.getByRole('button', { name: childName })).toBeVisible()
    })

    await test.step('User should be able to find the record via search', async () => {
      await searchFromSearchBar(page, childName, true)
    })

    await test.step('User should be able to navigate to record via direct URL', async () => {
      await page.goto(`${CLIENT_URL}/events/${eventId}`)
      // Add extra timeout to wait for the page.goto() to complete
      await expect(page.locator('#content-name')).toHaveText(childName, {
        timeout: 30_000
      })
    })

    await test.step('Place of birth should be Farajaland, Pualula, Oya', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_PUALULA)
      await expect(
        page.getByTestId('child.birthLocation.privateHome-value')
      ).toHaveText('FarajalandPualula-Oya')
    })
  })
})
