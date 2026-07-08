import { test, expect, type Page } from '@playwright/test'
import { loginWithNewUser, continueForm, login } from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'

test.describe.serial('1. Create and update user -1', () => {
  let page: Page
  const userinfo = {
    firstName: faker.person.firstName('male'),
    surname: faker.person.lastName('male'),
    email: faker.internet.email().toLowerCase(),
    device: faker.phone.imei(),
    phone: '0785963' + (Math.floor(Math.random() * 900) + 100),
    role: 'Community Leader'
  }

  const updatedUserInfo = {
    firstName: faker.person.firstName('male'),
    surname: faker.person.lastName('male'),
    email: faker.internet.email().toLowerCase(),
    device: faker.phone.imei(),
    phone: '0785963' + (Math.floor(Math.random() * 900) + 100),
    role: 'Hospital Official'
  }

  const username = `${userinfo.firstName[0]}.${userinfo.surname}`.toLowerCase()
  const fullname = `${userinfo.firstName} ${userinfo.surname}`
  const updatedUsername =
    `${updatedUserInfo.firstName[0]}.${updatedUserInfo.surname}`.toLowerCase()
  const updatedFullname = `${updatedUserInfo.firstName} ${updatedUserInfo.surname}`

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('1.1 User creation started by local system admin', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.LOCAL_SYSTEM_ADMIN)
      await page.getByRole('button', { name: 'Team' }).click()
      await expect(page.locator('#content-name')).toHaveText(
        'Central Province Office'
      )

      await page
        .getByRole('button', {
          name: /Central Province Office, Central/
        })
        .click()
      await page.getByTestId('locationSearchInput').fill('Zimbi')

      await page.getByText(/Zimbi Village Office, Zimbi, Isamba/).click()

      await page.click('#add-user')
      await expect(page.getByText('User details')).toBeVisible()
    })

    test('1.1.1 Fill user details', async () => {
      await page.locator('#surname').fill(userinfo.surname)
      await page.locator('#firstname').fill(userinfo.firstName)
      await page.locator('#phoneNumber').fill(userinfo.phone)
      await page.locator('#email').fill(userinfo.email)
      await page.locator('#fullHonorificName').fill(fullname)
      await page.locator('#role').click()
      await page.getByText(userinfo.role, { exact: true }).click()
      await page.locator('#device').fill(userinfo.device)
      await continueForm(page)
    })

    test('1.1.2 Create user', async () => {
      await page.getByRole('button', { name: 'Create user' }).click()

      await expect(page.getByText('New user created')).toBeVisible()

      await expect(page.locator('#header')).toContainText(
        'Zimbi Village Office'
      )

      await expect(
        page.getByText('Zimbi, Isamba, Central', {
          exact: true
        })
      ).toBeVisible()

      await expect(
        page.getByText(fullname, {
          exact: true
        })
      ).toBeVisible()
    })

    test('1.1.3 Verify user details', async () => {
      await page.getByRole('button', { name: fullname }).click()
      await page.locator('#sub-page-header-munu-button-dropdownMenu').click()
      await page.getByText('Edit details').click()

      await expect(page.getByTestId('row-value-primaryOfficeId')).toHaveText(
        'Zimbi Village Office, Zimbi, Isamba, Central, Farajaland'
      )
      await expect(page.getByTestId('row-value-name')).toHaveText(fullname)
      await expect(page.getByTestId('row-value-phoneNumber')).toHaveText(
        userinfo.phone
      )
      await expect(page.getByTestId('row-value-email')).toHaveText(
        userinfo.email
      )
      await expect(page.getByTestId('row-value-fullHonorificName')).toHaveText(
        fullname
      )
      await expect(page.getByTestId('row-value-role')).toHaveText(userinfo.role)
      await expect(page.getByTestId('row-value-device')).toHaveText(
        userinfo.device
      )
    })

    test('1.1.4 Update user details', async () => {
      await page.getByTestId('change-button-name').click()

      await page.locator('#surname').fill(updatedUserInfo.surname)
      await page.locator('#firstname').fill(updatedUserInfo.firstName)
      await page.locator('#phoneNumber').fill(updatedUserInfo.phone)
      await page.locator('#email').fill(updatedUserInfo.email)
      await page.locator('#fullHonorificName').fill(updatedFullname)
      await page.locator('#role').click()
      await page.getByText(updatedUserInfo.role, { exact: true }).click()
      await page.locator('#device').fill(updatedUserInfo.device)
      await continueForm(page)

      await page.getByRole('button', { name: 'Confirm' }).click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()
    })

    test('1.1.5 Verify user details', async () => {
      await page.locator('#sub-page-header-munu-button-dropdownMenu').click()
      await page.getByText('Edit details').click()

      await expect(page.getByTestId('row-value-primaryOfficeId')).toHaveText(
        'Zimbi Village Office, Zimbi, Isamba, Central, Farajaland'
      )
      await expect(page.getByTestId('row-value-name')).toHaveText(
        updatedFullname
      )
      await expect(page.getByTestId('row-value-phoneNumber')).toHaveText(
        updatedUserInfo.phone
      )
      await expect(page.getByTestId('row-value-email')).toHaveText(
        updatedUserInfo.email
      )
      await expect(page.getByTestId('row-value-fullHonorificName')).toHaveText(
        updatedFullname
      )
      await expect(page.getByTestId('row-value-role')).toHaveText(
        updatedUserInfo.role
      )
      await expect(page.getByTestId('row-value-device')).toHaveText(
        updatedUserInfo.device
      )
    })
  })

  test.describe('2.1 Login with newly created user credentials', () => {
    test('2.1.1 Enter your username and password', async ({ page }) => {
      await loginWithNewUser(page, updatedUsername)
    })
  })
})
