import { expect, test, type Page } from '@playwright/test'
import { auditRecord, getToken, goBackToReview, login } from '../../helpers'
import { faker } from '@faker-js/faker'
import {
  createDeclaration as createDeclarationV2,
  Declaration as DeclarationV2
} from '../test-data/birth-declaration-with-mother-father'
import { format, subDays, subYears } from 'date-fns'
import { CREDENTIALS } from '../../constants'
import { formatV2ChildName } from '../birth/helpers'
import { ensureAssignedToUser, expectInUrl, selectAction } from '../../utils'

test.describe.serial('Direct correction offline', () => {
  let declaration: DeclarationV2
  let trackingId = ''
  let eventId: string
  let page: Page

  const updatedChildDetails = {
    firstname: faker.person.firstName(),
    surname: faker.person.lastName()
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test('Shortcut declaration', async () => {
    let token = await getToken(CREDENTIALS.REGISTRAR)

    const res = await createDeclarationV2(
      token,
      {
        'child.name': {
          firstname: faker.person.firstName('male'),
          surname: faker.person.lastName()
        },
        'child.gender': 'male',
        'child.dob': format(subDays(new Date(), 2), 'yyyy-MM-dd'),
        'child.placeOfBirth': 'PRIVATE_HOME',
        'child.attendantAtBirth': 'PHYSICIAN',
        'child.birthType': 'SINGLE',
        'child.weightAtBirth': 3,
        'informant.relation': 'MOTHER',
        'informant.phoneNo': '0911725897',
        'mother.name': {
          firstname: faker.person.firstName('female'),
          surname: faker.person.lastName('female')
        },
        'mother.dob': format(subYears(new Date(), 29), 'yyyy-MM-dd'),
        'mother.nationality': 'FAR',
        'mother.idType': 'NATIONAL_ID',
        'mother.nid': faker.string.numeric(10),
        'mother.maritalStatus': 'SINGLE',
        'mother.educationalAttainment': 'NO_SCHOOLING',
        'mother.occupation': 'Housewife',
        'mother.previousBirths': 0,
        'father.name': {
          firstname: faker.person.firstName('male'),
          surname: faker.person.lastName('male')
        },
        'father.detailsNotAvailable': false,
        'father.dob': format(subYears(new Date(), 31), 'yyyy-MM-dd'),
        'father.idType': 'NATIONAL_ID',
        'father.nid': faker.string.numeric(10),
        'father.nationality': 'FAR',
        'father.maritalStatus': 'SINGLE',
        'father.educationalAttainment': 'NO_SCHOOLING',
        'father.occupation': 'Unemployed',
        'father.addressSameAs': 'YES'
      },
      'REGISTER',
      'PRIVATE_HOME'
    )
    expect(res).toEqual(
      expect.objectContaining({
        trackingId: expect.any(String)
      })
    )
    trackingId = res.trackingId!
    eventId = res.eventId
    token = await getToken(CREDENTIALS.REGISTRAR)
    declaration = res.declaration
  })

  test('Navigate to record correction', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await auditRecord({
      page,
      name: formatV2ChildName(declaration),
      trackingId
    })
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await selectAction(page, 'Correct')
  })

  test('Add correction requester', async () => {
    await page.locator('#requester____type').click()
    await page.getByText('Legal Guardian', { exact: true }).click()
    await page.locator('#reason____option').click()
    await page
      .getByText('Informant provided incorrect information (Material error)', {
        exact: true
      })
      .click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Verify identity', async () => {
    await page.getByRole('button', { name: 'Verified' }).click()
  })

  test('Skip uploading documents', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Add correction fee', async () => {
    await page
      .locator('#fees____amount')
      .fill(faker.number.int({ min: 1, max: 1000 }).toString())

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Change child name', async () => {
    await page.getByTestId('change-button-child.name').click()

    await page
      .getByTestId('text__firstname')
      .fill(updatedChildDetails.firstname)

    await page.getByTestId('text__surname').fill(updatedChildDetails.surname)

    await goBackToReview(page)
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Make correction while offline', async () => {
    // Go offline
    await page.context().setOffline(true)

    await page.getByRole('button', { name: 'Correct record' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expectInUrl(page, `events/${eventId}`)

    // We expect to see the optimistically updated new child name instead of the old one
    await expect(
      page.locator('#content-name', {
        hasText: formatV2ChildName({ 'child.name': updatedChildDetails })
      })
    ).toBeVisible()

    await page.getByTestId('exit-event').click()

    await page.getByRole('button', { name: 'Outbox' }).click()
    await expect(page.getByText('Offline')).toBeVisible()
  })

  test('Go back online', async () => {
    const correctionResponse = page.waitForResponse(
      (res) =>
        res.url().includes('event.actions.correction.approve') && res.ok()
    )

    // Go back online
    await page.context().setOffline(false)

    await correctionResponse

    await expect(page.getByText('Offline')).not.toBeVisible()
  })
})
