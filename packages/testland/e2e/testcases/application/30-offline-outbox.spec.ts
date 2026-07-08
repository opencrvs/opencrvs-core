import { test, expect, type Page } from '@playwright/test'

import {
  continueForm,
  drawSignature,
  formatName,
  getRandomDate,
  goToSection,
  login
} from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'
import { fillDate } from '../birth/helpers'

test.describe
  .serial('30: Validate user can send multiple complete and incomplete records offline', () => {
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
    attendantAtBirth: 'Physician',
    birthType: 'Single',
    weightAtBirth: 2.4,
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
        village: 'Xhosa',
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      },
      maritalStatus: 'Single',
      levelOfEducation: 'No schooling'
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
      maritalStatus: 'Single',
      levelOfEducation: 'No schooling',
      address: {
        sameAsMother: true
      }
    }
  }
  const partialDeclaration1 = {
    child: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      }
    }
  }

  const partialDeclaration2 = {
    child: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      }
    }
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('30.0 Login', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)

    // this is needed to get eventConfig before going offline
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await goToSection(page, 'review')
    await page.getByTestId('exit-button').click()
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()

    await page.context().setOffline(true)
  })

  test.describe('30.1 Send a complete declaration', async () => {
    test.beforeAll(async () => {
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('30.1.1 Fill child details', async () => {
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

      await page.locator('#child____attendantAtBirth').click()
      await page
        .getByText(declaration.attendantAtBirth, {
          exact: true
        })
        .click()

      await page.locator('#child____birthType').click()
      await page
        .getByText(declaration.birthType, {
          exact: true
        })
        .click()

      await page
        .locator('#child____weightAtBirth')
        .fill(declaration.weightAtBirth.toString())

      await continueForm(page)
    })

    test('30.1.2 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.locator('#informant____email').fill(declaration.informantEmail)

      await continueForm(page)
    })

    test("30.1.3 Fill mother's details", async () => {
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

      await page.locator('#town').fill(declaration.mother.address.town)
      await page
        .locator('#residentialArea')
        .fill(declaration.mother.address.residentialArea)
      await page.locator('#street').fill(declaration.mother.address.street)
      await page.locator('#number').fill(declaration.mother.address.number)
      await page
        .locator('#zipCode')
        .fill(declaration.mother.address.postcodeOrZip)

      await page.locator('#mother____maritalStatus').click()
      await page
        .getByText(declaration.mother.maritalStatus, { exact: true })
        .click()

      await page.locator('#mother____educationalAttainment').click()
      await page
        .getByText(declaration.mother.levelOfEducation, { exact: true })
        .click()

      await continueForm(page)
    })

    test("30.1.4 Fill father's details", async () => {
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

      await page.locator('#father____maritalStatus').click()
      await page
        .getByText(declaration.father.maritalStatus, { exact: true })
        .click()

      await page.locator('#father____educationalAttainment').click()
      await page
        .getByText(declaration.father.levelOfEducation, { exact: true })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('30.1.5 Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('30.1.7 Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('30.1.8 Declare', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()

      await page.getByText('Declare', { exact: true }).click()

      await page.getByRole('button', { name: 'Declare', exact: true }).click()
    })
  })

  test.describe('30.2 Send an incomplete declaration', async () => {
    test.beforeAll(async () => {
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('30.2.1 Fill child details', async () => {
      await page
        .locator('#firstname')
        .fill(partialDeclaration1.child.name.firstNames)
      await page
        .locator('#surname')
        .fill(partialDeclaration1.child.name.familyName)
      await goToSection(page, 'review')
    })
    test('30.2.2 Notify', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await page.getByText('Notify', { exact: true }).click()
      await page.getByRole('button', { name: 'Notify', exact: true }).click()
    })
  })

  test.describe('30.3 Send an incomplete declaration', async () => {
    test.beforeAll(async () => {
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('30.3.1 Fill child details', async () => {
      await page
        .locator('#firstname')
        .fill(partialDeclaration2.child.name.firstNames)
      await page
        .locator('#surname')
        .fill(partialDeclaration2.child.name.familyName)
      await goToSection(page, 'review')
    })
    test('30.3.2 Notify', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await page.getByText('Notify', { exact: true }).click()
      await page.getByRole('button', { name: 'Notify', exact: true }).click()
    })
  })

  test('30.4 Validate outbox', async () => {
    const rows = [
      { row: '#row_2', name: formatName(declaration.child.name) },
      { row: '#row_1', name: formatName(partialDeclaration1.child.name) },
      { row: '#row_0', name: formatName(partialDeclaration2.child.name) }
    ]
    const searchResult = page.getByTestId('search-result')

    await page.getByText('Outbox').click()

    for (const { row, name } of rows) {
      await expect(searchResult.locator(row)).toContainText(name)
      await expect(searchResult.locator(row)).toContainText('Waiting to send')
    }

    await page.context().setOffline(false)

    // transient state — tolerate missing it on a fast network
    await expect(searchResult)
      .toContainText('Sending', { timeout: 5_000 })
      .catch(() => {})

    // end state: outbox fully drained
    await expect(page.getByRole('button', { name: 'Outbox' })).toHaveText(
      'Outbox',
      { timeout: 60_000 }
    )

    for (const { name } of rows) {
      await expect(searchResult).not.toContainText(name)
    }
  })
})
