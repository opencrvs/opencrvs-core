import { expect, Page, test } from '@playwright/test'
import { auditRecord, getToken, goBackToReview, login } from '../../helpers'
import { faker } from '@faker-js/faker'
import {
  createDeclaration as createDeclarationV2,
  Declaration as DeclarationV2
} from '../test-data/birth-declaration-with-mother-father'
import { format, subDays, subYears } from 'date-fns'
import { CREDENTIALS } from '../../constants'
import { formatV2ChildName } from '../birth/helpers'
import {
  ensureAssignedToUser,
  expectInUrl,
  selectAction,
  type,
  waitForCorrectionAction
} from '../../utils'
import { openRecordByTitle } from '../print-certificate/birth/helpers'

test.describe
  .serial('Request correction, escalate, then approve as Local Registrar', () => {
  // Explicit longer timeout. test.step pattern seems to behave differently with respect to timeouts and kill the test before all steps have completed.
  test.setTimeout(120_000)
  let page: Page
  let declaration: DeclarationV2
  let trackingId = ''
  let eventId: string

  const updatedChildDetails = {
    firstname: faker.person.firstName(),
    surname: faker.person.lastName()
  }
  const correctionFee = faker.number.int({ min: 1, max: 1000 })
  const escalationReason =
    'Escalating this correction to Provincial Registrar for further review.'

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Shortcut declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)

    const res = await createDeclarationV2(
      token,
      {
        'child.name': {
          firstname: faker.person.firstName('male'),
          surname: faker.person.lastName()
        },
        'child.gender': 'male',
        'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd'),
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
    declaration = res.declaration
  })

  test('Login as Registration Agent', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  test('Navigate to record correction', async () => {
    await auditRecord({
      page,
      name: formatV2ChildName(declaration),
      trackingId
    })
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

    await selectAction(page, 'Correct')
  })

  test('Add correction requester and reason', async () => {
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
    await page.locator('#fees____amount').fill(correctionFee.toString())
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

  test('Submit correction request', async () => {
    const correctionResponse = page.waitForResponse(
      (res) =>
        res.url().includes('event.actions.correction.request') && res.ok()
    )
    await page
      .getByRole('button', { name: 'Submit correction request' })
      .click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await correctionResponse
    await expectInUrl(page, `events/${eventId}`)

    await expect(
      page.locator('#content-name', {
        hasText: formatV2ChildName(declaration)
      })
    ).toBeVisible()

    await page.getByTestId('exit-event').click()
  })

  test('Navigate back to the record', async () => {
    await auditRecord({
      page,
      name: formatV2ChildName(declaration),
      trackingId
    })
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  test("Event should not yet have an 'Escalated' flag", async () => {
    await expect(page.getByText('Escalated', { exact: true })).not.toBeVisible()
  })

  test('Escalate from the action menu', async () => {
    await selectAction(page, 'Escalate')

    await expect(page.getByText('Escalate to')).toBeVisible()
    await expect(page.getByText('Reason')).toBeVisible()

    const confirmButton = page.getByRole('button', { name: 'Confirm' })
    await expect(confirmButton).toBeDisabled()

    await page.locator('#escalate-to').click()
    await page
      .getByText('My state provincial registrar', { exact: true })
      .first()
      .click()

    await page.locator('#reason').fill(escalationReason)

    const escalateResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.custom') && response.ok()
    )

    await expect(confirmButton).toBeEnabled()
    await confirmButton.click()

    await escalateResponse
  })

  test('Login as Local Registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  test('Navigate to the record by tracking ID', async () => {
    await type(page, '#searchText', trackingId)
    await page.locator('#searchIconButton').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  test('Record carries the Escalated to Provincial Registrar flag', async () => {
    await expect(
      page.getByText('Escalated to Provincial Registrar')
    ).toBeVisible()
  })

  test('Open the correction approval page', async () => {
    await selectAction(page, 'Review correction request')
  })

  test('Approval page shows requester, reason and fee', async () => {
    await expect(page.getByText('RequesterLegal Guardian')).toBeVisible()
    await expect(
      page.getByText(
        'Reason for correctionInformant provided incorrect information (Material error)'
      )
    ).toBeVisible()
    await expect(page.getByText(`Fee total$${correctionFee}`)).toBeVisible()
  })

  test('Approval page shows the corrected child name (original vs updated)', async () => {
    await expect(
      page.getByRole('heading', { name: "Child's details" })
    ).toBeVisible()

    await expect(
      page
        .locator('#listTable-corrections-table-child')
        .getByText(
          "Child's name" +
            `${declaration['child.name'].firstname} ${declaration['child.name'].surname}` +
            `${updatedChildDetails.firstname} ${updatedChildDetails.surname}`
        )
    ).toBeVisible()
  })

  test('Approval page exposes Approve and Reject buttons', async () => {
    await expect(
      page.getByRole('button', { name: 'Approve', exact: true })
    ).toBeEnabled()
    await expect(
      page.getByRole('button', { name: 'Reject', exact: true })
    ).toBeEnabled()
  })

  test('Approve the correction', async () => {
    await page.getByRole('button', { name: 'Approve', exact: true }).click()

    await waitForCorrectionAction(
      page,
      'approve',
      async () => {
        await page.getByRole('button', { name: 'Confirm', exact: true }).click()
      },
      { waitForUnassign: true, eventId }
    )

    await expectInUrl(page, `/events/${eventId}`)

    await expect(
      page.locator('#content-name', {
        hasText: formatV2ChildName({ 'child.name': updatedChildDetails })
      })
    ).toBeVisible({ timeout: 60_000 })
  })

  test('Audit history records the correction request and approval', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await page.getByRole('button', { name: 'Audit' }).click()

    await expect(
      page.getByRole('button', { name: 'Correction requested', exact: true })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Next page' }).click()
    await expect(
      page.getByRole('button', { name: 'Correction approved', exact: true })
    ).toBeVisible()
  })

  test("Approved correction appears in the Registrar's 'Recent' workqueue", async () => {
    await page.getByTestId('exit-event').click()
    await page.getByText('Recent').click()

    await expect(
      page.getByRole('button', {
        name: formatV2ChildName({ 'child.name': updatedChildDetails })
      })
    ).toBeVisible()
  })
})
