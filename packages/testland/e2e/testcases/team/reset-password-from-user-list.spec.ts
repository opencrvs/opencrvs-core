import { expect, test } from '@playwright/test'
import { CREDENTIALS, GATEWAY_HOST } from '../../constants'
import { getToken, login } from '../../helpers'
import { createClient } from '@opencrvs/toolkit/api'
import { faker } from '@faker-js/faker'
import { getIdByName, getLocations } from '../birth/helpers'

test('Resetting password from user list should update the users status to pending', async ({
  browser
}) => {
  const page = await browser.newPage()

  const name = {
    firstname: faker.person.firstName(),
    surname: faker.person.lastName()
  }
  const fullName = `${name.firstname} ${name.surname}`

  await test.step('Create a new User', async () => {
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

  await test.step('Go to user list page', async () => {
    await login(page, CREDENTIALS.LOCAL_SYSTEM_ADMIN)
    await page.getByRole('button', { name: 'Central' }).click()
    await page.getByRole('button', { name: 'Ibombo' }).click()
    await page.getByRole('button', { name: 'Quanza' }).click()
    await page.getByRole('button', { name: 'Quanza Village Office' }).click()
    await expect(page.locator('#content-name')).toHaveText(
      'Quanza Village Office'
    )
  })

  await test.step('Can reset user password', async () => {
    const rows = page.locator('#user_list tr:has(td)')

    const userRow = rows.filter({
      hasText: fullName
    })

    await userRow.getByRole('navigation').click()
    await userRow.getByText('Reset password').click()
    await expect(page.getByText('Reset password?')).toBeVisible()
    await page.getByText('Confirm').click()
    await expect(
      page.getByText(`Temporary password sent to ${fullName}`)
    ).toBeVisible()
  })

  await test.step('Status updates to Pending after refetch', async () => {
    const rows = page.locator('#user_list tr:has(td)')
    const userRow = rows.filter({
      hasText: fullName
    })

    await expect(userRow.getByText('Pending')).toBeVisible()
    await expect(userRow.getByText('Active')).not.toBeVisible()
  })
})
