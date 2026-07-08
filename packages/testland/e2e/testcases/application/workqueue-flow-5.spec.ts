import { faker } from '@faker-js/faker'
import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatName,
  getRandomDate,
  goToSection,
  login,
  triggerDeclarationAction
} from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { ensureAssignedToUser, selectAction } from '../../utils'
import { assertRecordInWorkqueue, fillDate } from '../birth/helpers'
import { openRecordByTitle } from '../print-certificate/birth/helpers'

// HO Notifies => RO Rejects => RO Declares and validates => Registrar rejects
// => RO Re-declares again => Registrar registers
test.describe.serial('5. Workqueue flow - 5', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      gender: 'Male',
      birthDate: getRandomDate(0, 200)
    },
    placeOfBirth: 'Health Institution',
    birthLocation: { facility: 'Klow Village Hospital' },
    informantType: 'Mother',
    informantEmail: faker.internet.email(),
    mother: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      birthDate: getRandomDate(20, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.string.numeric(10),
        type: 'National ID'
      },
      address: {
        country: 'Farajaland',
        province: 'Sulaka',
        district: 'Irundu',
        village: 'Xhosa'
      }
    },
    father: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      birthDate: getRandomDate(22, 200),
      nationality: 'Gabon',
      identifier: {
        id: faker.string.numeric(10),
        type: 'National ID'
      },
      address: {
        sameAsMother: true
      }
    }
  }

  const childName = formatName(declaration.child.name)

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('5.1 Notify by HO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('5.1.1 Fill child details', async () => {
      await page.locator('#firstname').fill(declaration.child.name.firstNames)
      await page.locator('#surname').fill(declaration.child.name.familyName)
      await page.locator('#child____gender').click()
      await page.getByText(declaration.child.gender, { exact: true }).click()

      await page.getByPlaceholder('dd').fill(declaration.child.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.child.birthDate.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.child.birthDate.yyyy)

      await page.locator('#child____placeOfBirth').click()
      await page
        .getByText(declaration.placeOfBirth, {
          exact: true
        })
        .click()
      await page
        .locator('#child____birthLocation')
        .fill(declaration.birthLocation.facility.slice(0, 3))
      await page.getByText(declaration.birthLocation.facility).click()
    })

    test('5.1.2 Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('5.1.3 Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('5.1.4 Notify', async () => {
      await triggerDeclarationAction(page, 'Notify')
    })
  })

  test.describe('5.2 Reject by RO', async () => {
    test('5.2.1 Login', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    })

    test('5.2.2 Reject', async () => {
      await page.getByText('Notifications').click()

      await openRecordByTitle(page, childName)

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
      await selectAction(page, 'Reject')
      await page.getByTestId('reject-reason').fill(faker.lorem.sentence())

      const rejectResponse = page.waitForResponse(
        (res) => res.url().includes('event.actions.reject') && res.ok()
      )

      await page.getByRole('button', { name: 'Send For Update' }).click()

      await rejectResponse
    })

    test('5.2.3 Ensure rejection is no longer available', async () => {
      await page.getByRole('button', { name: 'Recent' }).click()
      await openRecordByTitle(page, childName)

      await expect(page.getByText('Rejected')).toBeVisible()

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
      await page.getByRole('button', { name: 'Action' }).click()
      await expect(page.getByText('Reject', { exact: true })).not.toBeVisible()
      await expect(page.getByText('Review', { exact: true })).not.toBeVisible()
      await page.getByRole('button', { name: 'Action' }).click()
    })

    test('5.2.4 Unassign', async () => {
      await selectAction(page, 'Unassign')
      await page.getByRole('button', { name: 'Unassign', exact: true }).click()
      await expect(page.getByText('Not assigned')).toBeVisible()
      if (await page.getByTestId('exit-event').isVisible()) {
        await page.getByTestId('exit-event').click()
      }
    })
  })

  test.describe('5.3 Declare and validate by RO', async () => {
    test('5.3.1 Verify workqueue', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER, true)

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: true },
          { title: 'Notifications', exists: false },
          { title: 'Pending validation', exists: false },
          { title: 'Pending updates', exists: true },
          { title: 'Pending approval', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'Pending external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })

    test('5.3.2 Go to edit', async () => {
      await page.getByText('Pending updates').click()

      await openRecordByTitle(page, childName)
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

      await selectAction(page, 'Edit')
    })

    test('5.3.3 Fill informant details', async () => {
      await page
        .getByTestId('accordion-Accordion_informant')
        .getByRole('button', { name: 'Change all' })
        .click()

      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.locator('#informant____email').fill(declaration.informantEmail)

      await continueForm(page)
    })

    test('5.3.4 Fill mother and father details', async () => {
      await page.locator('#firstname').fill(declaration.mother.name.firstNames)
      await page.locator('#surname').fill(declaration.mother.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.mother.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.mother.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.mother.birthDate.yyyy)

      await page.locator('#mother____idType').click()
      await page
        .getByText(declaration.mother.identifier.type, { exact: true })
        .click()

      await page
        .locator('#mother____nid')
        .fill(declaration.mother.identifier.id)

      await page.locator('#country').click()
      await page
        .locator('#country input')
        .fill(declaration.mother.address.country.slice(0, 3))
      await page
        .locator('#country')
        .getByText(declaration.mother.address.country, { exact: true })
        .click()

      await page.locator('#province').click()
      await page
        .getByText(declaration.mother.address.province, { exact: true })
        .click()
      await page.locator('#district').click()
      await page
        .getByText(declaration.mother.address.district, { exact: true })
        .click()
      await page.locator('#village').click()
      await page
        .getByText(declaration.mother.address.village, { exact: true })
        .click()

      await continueForm(page)

      await page.locator('#firstname').fill(declaration.father.name.firstNames)
      await page.locator('#surname').fill(declaration.father.name.familyName)

      await fillDate(page, declaration.father.birthDate)

      await page.locator('#father____idType').click()
      await page
        .getByText(declaration.father.identifier.type, { exact: true })
        .click()

      await page
        .locator('#father____nid')
        .fill(declaration.father.identifier.id)

      await page.locator('#father____nationality').click()
      await page
        .getByText(declaration.father.nationality, { exact: true })
        .click()

      await page.locator('#father____addressSameAs_YES').click()
      await continueForm(page, 'Go to review')
    })

    test('5.3.5 Declare with edits', async () => {
      await triggerDeclarationAction(page, 'Declare with edits')
    })
  })

  test.describe('5.4 Reject by Registrar', async () => {
    test('5.4.1 Login with Registrar', async () => {
      await login(page, CREDENTIALS.REGISTRAR)

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Outbox', exists: false },
          { title: 'Drafts', exists: false },
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: false },
          { title: 'Notifications', exists: false },
          { title: 'Potential duplicate', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Pending registration', exists: true },
          { title: 'Escalated', exists: false },
          { title: 'Pending external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })
    test('5.4.2 Reject', async () => {
      await page.getByText('Pending registration').click()

      await openRecordByTitle(page, childName)

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

      await selectAction(page, 'Reject')

      await page.getByTestId('reject-reason').fill(faker.lorem.sentence())

      const rejectResponse = page.waitForResponse(
        (res) => res.url().includes('event.actions.reject') && res.ok()
      )
      await page.getByRole('button', { name: 'Send For Update' }).click()

      await rejectResponse

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Outbox', exists: false },
          { title: 'Drafts', exists: false },
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: true },
          { title: 'Notifications', exists: false },
          { title: 'Potential duplicate', exists: false },
          { title: 'Pending updates', exists: true },
          { title: 'Pending approval', exists: false },
          { title: 'Pending registration', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'Pending external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })
  })
  test.describe('5.5 Re-declare with edits by RO', async () => {
    test('5.5.1 Login with RO', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER, true)

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: false },
          { title: 'Notifications', exists: false },
          { title: 'Pending validation', exists: false },
          { title: 'Pending updates', exists: true },
          { title: 'Pending approval', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'Pending external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })

    test('5.5.2 Go to edit', async () => {
      await page.getByText('Pending updates').click()
      await openRecordByTitle(page, childName)

      await expect(
        page.getByTestId('status-value').locator('span')
      ).toContainText('Declared')

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
      await selectAction(page, 'Edit')
    })

    test('5.5.3 Change informant email', async () => {
      await page
        .getByTestId('accordion-Accordion_informant')
        .getByRole('button', { name: 'Change all' })
        .click()

      await page.locator('#informant____email').fill(faker.internet.email())

      await page
        .getByRole('button', { name: 'Go to review', exact: true })
        .click()
    })

    test('5.5.4 Re-declare with edits', async () => {
      await triggerDeclarationAction(page, 'Declare with edits')

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: true },
          { title: 'Notifications', exists: false },
          { title: 'Pending validation', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'Pending external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })
  })

  test.describe('5.6 Register by Registrar', async () => {
    test('5.6.1 Login with Registrar', async () => {
      await login(page, CREDENTIALS.REGISTRAR, true)

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Outbox', exists: false },
          { title: 'Drafts', exists: false },
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: false },
          { title: 'Notifications', exists: false },
          { title: 'Potential duplicate', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Pending registration', exists: true },
          { title: 'Escalated', exists: false },
          { title: 'Pending external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })
    test('5.6.2 Register', async () => {
      await page.getByText('Pending registration').click()

      await openRecordByTitle(page, childName)

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

      await triggerDeclarationAction(page, 'Register')

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Outbox', exists: false },
          { title: 'Drafts', exists: false },
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: true },
          { title: 'Notifications', exists: false },
          { title: 'Potential duplicate', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Pending registration', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'Pending external validation', exists: false },
          { title: 'Pending certification', exists: true },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })
  })
})
