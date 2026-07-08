import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatDateTo_dMMMMyyyy,
  formatName,
  goToSection,
  login,
  switchEventTab,
  validateActionMenuButton,
  getEventIdFromUrl,
  triggerDeclarationAction
} from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'
import { ensureAssignedToUser, selectAction } from '../../utils'
import { format, subDays } from 'date-fns'
import { openRecordByTitle } from '../print-certificate/birth/helpers'

const recentDate = subDays(new Date(), 2)
const recentDay = format(recentDate, 'dd')
const recentMonth = format(recentDate, 'MM')
const recentYear = format(recentDate, 'yyyy')

const lateRegDate = subDays(recentDate, 500)
const lateRegDay = format(lateRegDate, 'dd')
const lateRegMonth = format(lateRegDate, 'MM')
const lateRegYear = format(lateRegDate, 'yyyy')

test.describe
  .serial('Approval of late birth registration -flag can be removed during edit and redeclare', () => {
  let page: Page

  const childName = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName('female')
  }

  const childNameFormatted = formatName(childName)

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('Declaration started by HO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Fill child details with birth date from over a year ago', async () => {
      await page.locator('#firstname').fill(childName.firstNames)
      await page.locator('#surname').fill(childName.familyName)
      await page.locator('#child____gender').click()
      await page.getByText('Female', { exact: true }).click()

      await page.getByPlaceholder('dd').fill(lateRegDay)
      await page.getByPlaceholder('mm').fill(lateRegMonth)
      await page.getByPlaceholder('yyyy').fill(lateRegYear)
      await page.locator('#child____reason').fill('Late registration reason')

      await page.locator('#child____placeOfBirth').click()
      await page.getByText('Health Institution', { exact: true }).click()
      await page
        .locator('#child____birthLocation')
        .fill('Klow Village Hospital'.slice(0, 3))
      await page.getByText('Klow Village Hospital').click()

      await continueForm(page)
    })

    test('Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page.getByText('Mother', { exact: true }).click()

      await page.locator('#informant____email').fill('test@example.com')

      await continueForm(page)
    })

    test("Fill mother's details", async () => {
      await page.locator('#firstname').fill(faker.person.firstName('female'))
      await page.locator('#surname').fill(faker.person.lastName('female'))

      await page.getByPlaceholder('dd').fill('12')
      await page.getByPlaceholder('mm').fill('05')
      await page.getByPlaceholder('yyyy').fill('1991')

      await page.locator('#mother____idType').click()
      await page.getByText('None', { exact: true }).click()

      await continueForm(page)
    })

    test("Fill father's details", async () => {
      await page.locator('#firstname').fill(faker.person.firstName('male'))
      await page.locator('#surname').fill(faker.person.lastName('male'))

      await page.getByPlaceholder('dd').fill('12')
      await page.getByPlaceholder('mm').fill('05')
      await page.getByPlaceholder('yyyy').fill('1980')

      await page.locator('#father____idType').click()
      await page.getByText('None', { exact: true }).click()

      await page.locator('#father____nationality').click()
      await page.getByText('Gabon', { exact: true }).click()

      await page.locator('#father____addressSameAs_YES').click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('Declare', async () => {
      await triggerDeclarationAction(page, 'Declare')
      await page.getByText('Recent').click()
    })
  })

  test.describe('Declaration Review by RO', async () => {
    test('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      await page.getByText('Pending validation').click()
      await openRecordByTitle(page, childNameFormatted)
    })

    test('Assign', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    })

    test("Event should have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).toBeVisible()
    })

    test('Select Edit-action', async () => {
      await selectAction(page, 'Edit')
    })

    test('Change child dob to recent date', async () => {
      await page.getByTestId('change-button-child.dob').click()

      await page.getByPlaceholder('dd').fill(recentDay)
      await page.getByPlaceholder('mm').fill(recentMonth)
      await page.getByPlaceholder('yyyy').fill(recentYear)
    })

    test('Go back to review', async () => {
      await page.getByRole('button', { name: 'Go to review' }).click()
    })

    test('Declare with edits', async () => {
      await triggerDeclarationAction(page, 'Declare with edits')
    })

    test('Go to record', async () => {
      await page.getByText('Recent').click()
      await openRecordByTitle(page, childNameFormatted)
    })

    test("Event should not have the 'Approval required for late registration' -flag", async () => {
      await expect(page.getByTestId('flags-value')).toHaveText('Validated')
      await expect(
        page.getByText('Approval required for late registration')
      ).not.toBeVisible()
      await expect(page.getByTestId('flags-value')).not.toHaveText(
        'Edit in progress'
      )
    })
  })
})

test.describe
  .serial('Approval of late birth registration -flag can be added during edit and redeclare', () => {
  let page: Page

  const childName = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName('female')
  }

  const childNameFormatted = formatName(childName)

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('Declaration started by RO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Fill child details with birth date from recent date', async () => {
      await page.locator('#firstname').fill(childName.firstNames)
      await page.locator('#surname').fill(childName.familyName)
      await page.locator('#child____gender').click()
      await page.getByText('Female', { exact: true }).click()

      await page.getByPlaceholder('dd').fill(recentDay)
      await page.getByPlaceholder('mm').fill(recentMonth)
      await page.getByPlaceholder('yyyy').fill(recentYear)

      await page.locator('#child____placeOfBirth').click()
      await page.getByText('Health Institution', { exact: true }).click()
      await page
        .locator('#child____birthLocation')
        .fill('Ibombo District Hospital'.slice(0, 3))
      await page.getByText('Ibombo District Hospital').click()

      await continueForm(page)
    })

    test('Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page.getByText('Mother', { exact: true }).click()

      await page.locator('#informant____email').fill('test@example.com')

      await continueForm(page)
    })

    test("Fill mother's details", async () => {
      await page.locator('#firstname').fill(faker.person.firstName('female'))
      await page.locator('#surname').fill(faker.person.lastName('female'))

      await page.getByPlaceholder('dd').fill('12')
      await page.getByPlaceholder('mm').fill('05')
      await page.getByPlaceholder('yyyy').fill('1991')

      await page.locator('#mother____idType').click()
      await page.getByText('None', { exact: true }).click()

      await page.locator('#country').click()
      await page.locator('#country input').fill('Far')
      await page
        .locator('#country')
        .getByText('Farajaland', { exact: true })
        .click()

      await page.locator('#village').click()
      await page.getByText('Klow', { exact: true }).click()

      await continueForm(page)
    })

    test("Fill father's details", async () => {
      await page.locator('#firstname').fill(faker.person.firstName('male'))
      await page.locator('#surname').fill(faker.person.lastName('male'))

      await page.getByPlaceholder('dd').fill('12')
      await page.getByPlaceholder('mm').fill('05')
      await page.getByPlaceholder('yyyy').fill('1980')

      await page.locator('#father____idType').click()
      await page.getByText('None', { exact: true }).click()

      await page.locator('#father____nationality').click()
      await page.getByText('Gabon', { exact: true }).click()

      await page.locator('#father____addressSameAs_YES').click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('Declare', async () => {
      await triggerDeclarationAction(page, 'Declare')

      await page.getByText('Recent').click()
    })
  })

  test.describe('Declaration Review by Registrar', async () => {
    test('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      await page.getByText('Pending registration').click()
      await openRecordByTitle(page, childNameFormatted)
    })

    test('Assign', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    })

    test("Event should not have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).not.toBeVisible()
    })

    test('Select Edit-action', async () => {
      await selectAction(page, 'Edit')
    })

    test('Change child dob to over a year ago date', async () => {
      await page.getByTestId('change-button-child.dob').click()

      await page.getByPlaceholder('dd').fill(lateRegDay)
      await page.getByPlaceholder('mm').fill(lateRegMonth)
      await page.getByPlaceholder('yyyy').fill(lateRegYear)
      await page.locator('#child____reason').fill('Late registration reason')
    })

    test('Go back to review', async () => {
      await page.getByRole('button', { name: 'Go to review' }).click()
    })

    test('Register with edits should be unavailable', async () => {
      await validateActionMenuButton(page, 'Register with edits', false)
    })

    test('Declare with edits', async () => {
      await triggerDeclarationAction(page, 'Declare with edits', {
        waitForUnassign: true,
        eventId: getEventIdFromUrl(page)
      })
    })

    test('Go to record', async () => {
      await page.getByText('Recent').click()

      await openRecordByTitle(page, childNameFormatted)
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    })

    test("Event should have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).toBeVisible()
      await expect(page.getByTestId('flags-value')).not.toHaveText('Validated')
      await expect(page.getByTestId('flags-value')).not.toHaveText(
        'Edit in progress'
      )
    })

    test('Assert audit trail', async () => {
      await switchEventTab(page, 'Audit')

      await page.getByRole('button', { name: 'Edited', exact: true }).click()
      await expect(
        page.getByText(
          'Date of birth' +
            formatDateTo_dMMMMyyyy(format(recentDate, 'yyyy-MM-dd')) +
            formatDateTo_dMMMMyyyy(format(lateRegDate, 'yyyy-MM-dd'))
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Reason for delayed registration-Late registration reason'
        )
      ).toBeVisible()
    })
  })
})
