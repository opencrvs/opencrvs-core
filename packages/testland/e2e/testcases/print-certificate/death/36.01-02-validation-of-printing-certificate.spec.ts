import { expect, test, type Page } from '@playwright/test'
import { getToken, joinValuesWith, login } from '../../../helpers'
import { CREDENTIALS } from '../../../constants'
import {
  createDeclaration,
  Declaration
} from '../../test-data/death-declaration'
import { navigateToCertificatePrintAction } from '../death/helpers'
import { REQUIRED_VALIDATION_ERROR } from '../../birth/helpers'
import { expectInUrl } from '../../../utils'
import { faker } from '@faker-js/faker'

test.describe.serial('Certified copies', () => {
  let page: Page
  let declaration: Declaration

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token)
    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.0.1 Log in', async () => {
    await login(page)
  })

  test('1.0.2 Click on "Print certificate" from action menu', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(
      page,
      declaration,
      CREDENTIALS.REGISTRAR
    )
  })

  test.describe('2.0 Validate "Certify record" page', async () => {
    test('2.1 Click continue without selecting collector type and template type', async () => {
      await expect(
        page.locator('#certificateTemplateId').getByText('Death Certificate')
      ).toBeVisible()
    })

    test('2.2 Click continue without selecting collector type', async () => {
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(
        page
          .locator('#collector____requesterId_error')
          .getByText(REQUIRED_VALIDATION_ERROR)
      ).toBeVisible()
    })

    test('2.3 Click continue after selecting requester type and template type', async () => {
      await page.reload()
      await page.locator('#collector____requesterId').click()

      const selectOptionsLabels = [
        'Print and issue to Informant (Spouse)',
        'Print and issue to someone else'
      ]

      for (const label of selectOptionsLabels) {
        await expect(page.getByText(label, { exact: true })).toBeVisible()
      }

      await page.getByText(selectOptionsLabels[0], { exact: true }).click()

      await expect(page.getByText('Certify record')).toBeVisible()

      await page.getByRole('button', { name: 'Continue' }).click()
      await expectInUrl(page, '/pages/collector.identity.verify')

      await page.getByText('Verify their identity').isVisible()

      await page.getByText('Type of ID').isVisible()
      await page.getByText(declaration?.['spouse.idType']).isVisible()
      await page.getByText(declaration?.['spouse.nid']).isVisible()

      await page.getByText("Spouse's name").isVisible()
      await page
        .getByText(
          joinValuesWith([...Object.values(declaration['spouse.name'])])
        )
        .isVisible()

      await page.getByText('Date of birth').isVisible()
      await page.getByText(declaration['spouse.dob']).isVisible()

      await page.getByText('Nationality').isVisible()
      await page.getByText(declaration['spouse.nationality']).isVisible()
    })
  })
})

test.describe.serial('Certified copies renders spouse age correctly', () => {
  let page: Page
  let declaration: Declaration

  const spouseAge = 25

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, () => ({
      'spouse.dobUnknown': true,
      'spouse.age': {
        age: spouseAge,
        asOfDateRef: 'eventDetails.date'
      },
      'spouse.dob': undefined
    }))
    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.0.1 Log in', async () => {
    await login(page)
  })

  test('1.0.2 Click on "Print certificate" from action menu', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(
      page,
      declaration,
      CREDENTIALS.REGISTRAR
    )
  })

  test.describe('2.0 Validate "Certify record" page', async () => {
    test('2.1 Ensure data content is visible for spouse', async () => {
      await page.reload()
      await page.locator('#collector____requesterId').click()
      const selectOptionsLabels = [
        'Print and issue to Informant (Spouse)',
        'Print and issue to someone else'
      ]
      for (const label of selectOptionsLabels) {
        await expect(page.getByText(label, { exact: true })).toBeVisible()
      }

      await page.getByText(selectOptionsLabels[0], { exact: true }).click()

      await expect(page.getByText('Certify record')).toBeVisible()

      await page.getByRole('button', { name: 'Continue' }).click()
      await expectInUrl(page, '/pages/collector.identity.verify')

      await page.getByText('Verify their identity').isVisible()

      await page.getByText('Type of ID').isVisible()
      await page.getByText(declaration['spouse.idType']).isVisible()
      await page.getByText(declaration['spouse.nid']).isVisible()
      await page.getByText("Spouse's name").isVisible()
      await page
        .getByText(
          joinValuesWith([...Object.values(declaration['spouse.name'])])
        )
        .isVisible()

      await page.getByText('Age of spouse (at the time of event)').isVisible()
      await page.getByText(joinValuesWith([spouseAge, 'years'])).isVisible()

      await page.getByText('Nationality').isVisible()
      await page.getByText(declaration['spouse.nationality']).isVisible()
    })
  })
})

test.describe
  .serial('Certified copies renders non-spouse informant age correctly', () => {
  let page: Page
  let declaration: Declaration

  const informantAge = faker.number.int({ min: 18, max: 90 })

  const declarationOverrides = {
    'informant.relation': 'SON',
    'informant.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'informant.dobUnknown': true,
    'informant.dob': undefined,
    'informant.nationality': 'FAR',
    'informant.idType': 'NATIONAL_ID',
    'informant.nid': faker.string.numeric(10),
    'informant.addressSameAs': 'YES'
  }

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)

    const res = await createDeclaration(token, (mockDeclaration) => ({
      ...declarationOverrides,
      'informant.age': {
        age: informantAge,
        asOfDateRef: 'eventDetails.date'
      }
    }))

    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.0.1 Log in', async () => {
    await login(page)
  })

  test('1.0.2 Click on "Print certificate" from action menu', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(
      page,
      declaration,
      CREDENTIALS.REGISTRAR
    )
  })

  test.describe('2.0 Validate "Certify record" page', async () => {
    test('2.1 Ensure data content is visible for informant', async () => {
      await page.reload()
      await page.locator('#collector____requesterId').click()
      const selectOptionsLabels = [
        'Print and issue to Informant (Son)',
        'Print and issue to someone else'
      ]
      for (const label of selectOptionsLabels) {
        await expect(page.getByText(label, { exact: true })).toBeVisible()
      }

      await page.getByText(selectOptionsLabels[0], { exact: true }).click()

      await expect(page.getByText('Certify record')).toBeVisible()

      await page.getByRole('button', { name: 'Continue' }).click()
      await expectInUrl(page, '/pages/collector.identity.verify')

      await page.getByText('Verify their identity').isVisible()

      await page.getByText('Type of ID').isVisible()
      await page.getByText(declarationOverrides['informant.idType']).isVisible()
      await page.getByText(declarationOverrides['informant.nid']).isVisible()
      await page.getByText("Son's name").isVisible()
      await page
        .getByText(
          joinValuesWith([
            ...Object.values(declarationOverrides['informant.name'])
          ])
        )
        .isVisible()

      await page
        .getByText('Age of informant (at the time of event)')
        .isVisible()
      await page.getByText(joinValuesWith([informantAge, 'years'])).isVisible()

      await page.getByText('Nationality').isVisible()
      await page
        .getByText(declarationOverrides['informant.nationality'])
        .isVisible()
    })
  })
})
