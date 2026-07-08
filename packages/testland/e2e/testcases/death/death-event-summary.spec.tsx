import { test, expect, type Page } from '@playwright/test'
import { faker } from '@faker-js/faker'
import {
  continueForm,
  expectRowValueWithChangeButton,
  getRandomDate,
  goToSection,
  joinValuesWith,
  login,
  triggerDeclarationAction
} from '../../helpers'

test.describe.serial('Death event summary', () => {
  let page: Page

  const declaration = {
    deceased: {
      name: {
        firstname: faker.person.firstName('male'),
        surname: faker.person.lastName('male')
      },
      address: {
        country: 'Farajaland',
        province: 'Sulaka',
        district: 'Irundu',
        village: 'Xhosa',
        town: 'Deceased Town',
        residentalArea: 'Deceased Area',
        street: 'Deceased Street',
        house: '123',
        postalCode: '12345'
      }
    },
    eventDetails: {
      date: getRandomDate(0, 20),
      causeOfDeathEstablished: false,
      placeOfDeath: 'Other',
      address: {
        country: 'Farajaland',
        province: 'Central',
        district: 'Ibombo',
        village: 'Klow',
        town: 'Place of death Town',
        residentalArea: 'Place of death Area',
        street: 'Place of death Street',
        house: '987',
        postalCode: '65432'
      }
    }
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Log in', async () => {
    await login(page)
  })

  test('Start death event declaration', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Input deceased address', async () => {
    await page.locator('#firstname').fill(declaration.deceased.name.firstname)
    await page.locator('#surname').fill(declaration.deceased.name.surname)

    await page.locator('#province').click()
    await page
      .getByText(declaration.deceased.address.province, { exact: true })
      .click()
    await page.locator('#district').click()
    await page
      .getByText(declaration.deceased.address.district, { exact: true })
      .click()
    await page.locator('#village').click()
    await page
      .getByText(declaration.deceased.address.village, { exact: true })
      .click()

    await page.locator('#town').fill(declaration.deceased.address.town)

    await page
      .locator('#residentialArea')
      .fill(declaration.deceased.address.residentalArea)

    await page.locator('#street').fill(declaration.deceased.address.street)

    await page.locator('#number').fill(declaration.deceased.address.house)

    await page.locator('#zipCode').fill(declaration.deceased.address.postalCode)

    await continueForm(page)
  })

  test('Input place of death address', async () => {
    await page.locator('#eventDetails____placeOfDeath').click()
    await page
      .getByText(declaration.eventDetails.placeOfDeath, { exact: true })
      .click()

    await page.locator('#village').click()
    await page
      .getByText(declaration.eventDetails.address.village, { exact: true })
      .click()

    await page.locator('#town').fill(declaration.eventDetails.address.town)

    await page
      .locator('#residentialArea')
      .fill(declaration.eventDetails.address.residentalArea)

    await page.locator('#street').fill(declaration.eventDetails.address.street)

    await page.locator('#number').fill(declaration.eventDetails.address.house)

    await page
      .locator('#zipCode')
      .fill(declaration.eventDetails.address.postalCode)

    await goToSection(page, 'review')
  })

  test('Verify input in review section', async () => {
    await expectRowValueWithChangeButton(
      page,
      'deceased.address',
      joinValuesWith([...Object.values(declaration.deceased.address)], '')
    )

    await expectRowValueWithChangeButton(
      page,
      'eventDetails.deathLocationOther',
      joinValuesWith([...Object.values(declaration.eventDetails.address)], '')
    )
  })

  test('Save draft and find it in workqueue', async () => {
    await triggerDeclarationAction(page, 'Save & Exit')

    await page.getByRole('button', { name: 'Drafts' }).click()

    await page
      .getByRole('button', {
        name: joinValuesWith(Object.values(declaration.deceased.name), ' ')
      })
      .click()
  })

  test('Uses "other" location in summary', async () => {
    await expect(
      page.getByTestId('eventDetails.deathLocationOther')
    ).toContainText(
      joinValuesWith([...Object.values(declaration.eventDetails.address)], '')
    )
  })
})
