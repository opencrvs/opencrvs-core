import { test, type Page } from '@playwright/test'
import { getToken, login, searchFromSearchBar } from '../../helpers'
import { trackAndDeleteCreatedEvents } from '../test-data/eventDeletion'
import { CREDENTIALS } from '../../constants'
import {
  createDeclaration,
  getDeclaration,
  getPlaceOfBirth
} from '../test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '../birth/helpers'

test.describe.serial('1.Farajaland as location parent', () => {
  trackAndDeleteCreatedEvents()

  let page: Page
  let declaration: any
  let name: string
  let token: string

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.HOSPITAL_OFFICIAL)
    declaration = await getDeclaration({
      partialDeclaration: {
        'mother.nid': null,
        'mother.dob': null,
        ...(await getPlaceOfBirth(
          'HEALTH_FACILITY',
          token,
          'Klow Village Hospital'
        ))
      },
      token
    })

    name = formatV2ChildName(declaration)

    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.1.0 Hospital official creates an incomplete declaration', async () => {
    token = await getToken(CREDENTIALS.HOSPITAL_OFFICIAL)

    await createDeclaration(token, declaration, ActionType.NOTIFY)
  })

  test('1.1.1 Embassy official in another administrative area should not find the declaration', async () => {
    await login(page, CREDENTIALS.EMBASSY_OFFICIAL)

    await searchFromSearchBar(page, name, false)
  })

  test('1.1.2 Registrar general within the same administrative area should find the declaration', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)

    await searchFromSearchBar(page, name, true)
  })
})
