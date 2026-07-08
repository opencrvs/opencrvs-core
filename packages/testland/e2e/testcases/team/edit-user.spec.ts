import { expect, test } from '@playwright/test'
import { CREDENTIALS, GATEWAY_HOST } from '../../constants'
import { getToken, login } from '../../helpers'
import { createClient } from '@opencrvs/toolkit/api'
import { faker } from '@faker-js/faker'
import { getIdByName, getLocations } from '../birth/helpers'

test("Can update newly created user's location and role", async ({
  browser
}) => {
  const page = await browser.newPage()

  const name = {
    firstname: faker.person.firstName(),
    surname: faker.person.lastName()
  }
  const fullName = `${name.firstname} ${name.surname}`

  await test.step('Create a new Community Leader in Quanza Village Office', async () => {
    const token = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
    const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

    const offices = await getLocations('CRVS_OFFICE', token)
    const quanzaVillageOfficeId = getIdByName(offices, 'Quanza Village Office')

    const user = {
      name,
      role: 'COMMUNITY_LEADER',
      primaryOfficeId: quanzaVillageOfficeId,
      mobile: `07${faker.string.numeric(8)}`,
      email: faker.internet.email(),
      fullHonorificName: fullName,
      device: 'web',
      data: {}
    }

    await client.user.create.mutate(user)
  })

  await test.step('Go to user details page', async () => {
    await login(page, CREDENTIALS.LOCAL_SYSTEM_ADMIN)
    await page.getByRole('button', { name: 'Central' }).click()
    await page.getByRole('button', { name: 'Ibombo' }).click()
    await page.getByRole('button', { name: 'Quanza' }).click()
    await page.getByRole('button', { name: 'Quanza Village Office' }).click()
    await page.getByRole('button', { name: fullName }).click()
    await expect(page.locator('#content-name')).toHaveText(fullName)
  })

  await test.step('Can only select locations in central province', async () => {
    await page
      .locator('//nav[@id="sub-page-header-munu-button-dropdownMenu"]')
      .click()
    await page.getByText('Edit details').click()
    await expect(page.getByText('Confirm details')).toBeVisible()
    await page.getByTestId('change-button-primaryOfficeId').click()
    await page.locator('#searchable-select-primaryOfficeId').click()
    await page.locator('#primaryOfficeId').fill('Sulaka')
    await expect(page.getByText('Sulaka Province Office')).not.toBeVisible()
    await page.locator('#primaryOfficeId').fill('Ezhi')
    await page.getByText('Ezhi District Hospital').click()
  })

  await test.step('Can update user role', async () => {
    await page.getByText('Continue').click()
    await page.locator('#role').click()

    for (const role of [
      'Registration Officer',
      'Registrar',
      'Provincial Registrar',
      'Hospital Official'
    ]) {
      await expect(page.getByText(role, { exact: true })).toBeVisible()
    }
    await expect(
      page.getByText('Community Leader', { exact: true })
    ).toHaveCount(2)
    await page.getByText('Hospital Official').click()
    await page.getByText('Continue').click()
  })

  await test.step('Verify user details', async () => {
    await expect(page.getByTestId('row-value-primaryOfficeId')).toHaveText(
      'Ezhi District Hospital, Ezhi, Central, Farajaland'
    )
    await expect(page.getByTestId('row-value-role')).toHaveText(
      'Hospital Official'
    )
  })

  await test.step('Confirm user update', async () => {
    await page.getByRole('button', { name: 'Confirm' }).click()
    await page.locator('#confirm_office_change').click()
    await expect(page.locator('#content-name')).toHaveText(fullName)
    await expect(page.getByTestId('office-link-value')).toHaveText(
      'Ezhi District Hospital'
    )
    await expect(page.getByText('RoleHospital Official')).toBeVisible()
  })
})
