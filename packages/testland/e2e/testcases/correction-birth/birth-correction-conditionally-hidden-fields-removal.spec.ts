import { test, expect, type Page } from '@playwright/test'
import { getToken, login, switchEventTab } from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'
import {
  formatV2ChildName,
  getAdministrativeAreas,
  getIdByName
} from '../birth/helpers'
import {
  createDeclaration,
  Declaration
} from '../test-data/birth-declaration-with-mother-father'
import { ensureAssignedToUser, selectAction } from '../../utils'
import { AddressType } from '@opencrvs/toolkit/events'
import { format, subDays, subYears } from 'date-fns'

test.describe
  .serial('Birth declaration case - Conditional Hidden Fields Removal', () => {
  let page: Page
  let declaration: Declaration

  const informantName = {
    firstname: faker.person.firstName('male'),
    surname: faker.person.lastName('male')
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Create and register declaration via API', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const administrativeAreas = await getAdministrativeAreas(token)
    const village = getIdByName(administrativeAreas, 'Klow')

    const res = await createDeclaration(
      token,
      {
        'child.gender': 'unknown',
        'child.dob': format(
          subDays(new Date(), Math.ceil(50 * Math.random()) + 1),
          'yyyy-MM-dd'
        ),
        'child.attendantAtBirth': 'MIDWIFE',
        'child.birthType': 'TRIPLET',
        'informant.relation': 'GRANDFATHER',
        'informant.email': faker.internet.email(),
        'informant.name': informantName,
        'informant.dob': format(subYears(new Date(), 50), 'yyyy-MM-dd'),
        'informant.nationality': 'FAR',
        'informant.idType': 'NATIONAL_ID',
        'informant.nid': faker.string.numeric(10),
        'informant.address': {
          country: 'FAR',
          administrativeArea: village,
          addressType: AddressType.DOMESTIC
        },
        'father.detailsNotAvailable': false,
        'father.addressSameAs': 'YES',
        'mother.maritalStatus': 'WIDOWED',
        'mother.educationalAttainment': 'SECOND_LEVEL',
        'mother.occupation': 'House Wife'
      },
      'REGISTER',
      'HEALTH_FACILITY'
    )
    declaration = res.declaration
  })

  test.describe('Review and update declaration by Local Registrar', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.REGISTRAR)
    })

    test('Check if mother occupation is set', async () => {
      await page.getByRole('button', { name: 'Pending certification' }).click()
      const childButton = page.getByRole('button', {
        name: formatV2ChildName(declaration)
      })
      await expect(childButton).toBeVisible({ timeout: 30_000 })
      await childButton.click()
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await switchEventTab(page, 'Record')
      await expect(page.getByTestId('row-value-mother.occupation')).toHaveText(
        'House Wife'
      )

      await page.getByTestId('exit-event').click()
    })

    test('Search by informant name', async () => {
      await page
        .locator('#searchText')
        .fill(informantName.firstname + ' ' + informantName.surname)

      await page.locator('#searchIconButton').click()
      await expect(
        page.getByRole('button', {
          name: formatV2ChildName(declaration)
        })
      ).toBeVisible()
    })

    test('Correct the informant info', async () => {
      await page
        .getByRole('button', {
          name: formatV2ChildName(declaration)
        })
        .click()

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await selectAction(page, 'Correct')
      await page.locator('#requester____type').click()
      await page.getByText('Informant (Grandfather)', { exact: true }).click()

      await page.locator('#reason____option').click()
      await page
        .getByText('Myself or an agent made a mistake (Clerical error)', {
          exact: true
        })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Fill in the fees form', async () => {
      const fee = faker.number.int({ min: 1, max: 10 })
      await page.locator('#fees____amount').fill(fee.toString())

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Change informant to mother', async () => {
      await page.getByTestId('change-button-informant.relation').click()
      await page.locator('#informant____relation').click()
      await page
        .getByText('Mother', {
          exact: true
        })
        .click()
      await page.locator('#informant____email').fill(faker.internet.email())
      await page.getByRole('button', { name: 'Go to review' }).click()
    })

    test('Submit correction', async () => {
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByTestId('make-correction').click()

      await expect(page.getByText('Correct record?')).toBeVisible()

      await page.getByRole('button', { name: 'Confirm', exact: true }).click()
      await page.getByTestId('exit-event').click()
      await page.getByRole('button', { name: 'Pending certification' }).click()
      await expect(
        page.getByRole('button', {
          name: formatV2ChildName(declaration)
        })
      ).toBeVisible({ timeout: 30_000 })
    })

    test('Search by informant name should not get any result', async () => {
      await page
        .locator('#searchText')
        .fill(informantName.firstname + ' ' + informantName.surname)

      await page.locator('#searchIconButton').click()
      await expect(
        page.getByRole('button', {
          name: formatV2ChildName(declaration)
        })
      ).not.toBeVisible()
    })
  })
})
