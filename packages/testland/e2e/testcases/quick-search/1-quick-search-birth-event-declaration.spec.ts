import { expect, test, type Page } from '@playwright/test'
import { getToken, login } from '../../helpers'
import {
  createDeclaration,
  getChildNameFromRecord
} from '../test-data/birth-declaration-with-father-brother'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'
import { ensureAssignedToUser } from '../../utils'
import { openRecordByTitle } from '../print-certificate/birth/helpers'
import { formatV2ChildName } from '../birth/helpers'

test.describe
  .serial("Quick Search - Birth Event Declaration - Child's details", () => {
  let page: Page
  let record: Awaited<ReturnType<typeof createDeclaration>>
  let recordWithDefaultEmail: Awaited<ReturnType<typeof createDeclaration>>
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(CREDENTIALS.REGISTRAR)

    recordWithDefaultEmail = await createDeclaration(
      token,
      {
        'informant.email': faker.internet.email()
      },
      'REGISTER',
      'HEALTH_FACILITY'
    )

    record = await createDeclaration(
      token,
      {
        'informant.email': faker.internet.email()
      },
      'REGISTER',
      'HEALTH_FACILITY'
    )
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.1 Should search from home page using informant email and return correct record', async () => {
    await login(page)
    await page
      .locator('#searchText')
      .fill(recordWithDefaultEmail.declaration['informant.email']) // search by email
    await page.locator('#searchIconButton').click()
    const searchResultRegex = /Search result for “([^”]+)”/
    const searchResult = await page.locator('#content-name').textContent()
    await expect(searchResult).toMatch(searchResultRegex)
    await expect(
      page.getByText(getChildNameFromRecord(recordWithDefaultEmail))
    ).toBeVisible()
  })

  test('1.2 Should display informant email correctly in record details', async () => {
    await openRecordByTitle(
      page,
      getChildNameFromRecord(recordWithDefaultEmail)
    )
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await expect(page.getByTestId('assignedTo-value')).toHaveText(
      'Kennedy Mweene'
    )

    await expect(page.getByTestId('informant.contact-value')).toContainText(
      recordWithDefaultEmail.declaration['informant.email']
    )
  })

  test('1.3 Should perform case-insensitive email search from workqueue and display matching record', async () => {
    await page.getByTestId('exit-event').click()
    await page.locator('#navigation_workqueue_assigned-to-you').click()
    await expect(page.locator('#searchText')).toHaveValue('')

    await page
      .locator('#searchText')
      .fill(recordWithDefaultEmail.declaration['informant.email'].toUpperCase()) // Search by uppercase email
    await page.locator('#searchIconButton').click()
    const searchResultRegex = /Search result for “([^”]+)”/
    const searchResult = await page.locator('#content-name').textContent()
    await expect(searchResult).toMatch(searchResultRegex)
    await expect(
      page.getByText(getChildNameFromRecord(recordWithDefaultEmail))
    ).toBeVisible()

    await page
      .getByRole('button', {
        name: getChildNameFromRecord(recordWithDefaultEmail)
      })
      .click()

    await expect(page.getByTestId('assignedTo-value')).toHaveText(
      'Kennedy Mweene'
    )
    await expect(page.getByTestId('informant.contact-value')).toContainText(
      recordWithDefaultEmail.declaration['informant.email']
    )
  })

  test('1.4 Should search from workqueue using a different email and return the correct record', async () => {
    await page.getByTestId('exit-event').click()
    await page.locator('#navigation_workqueue_assigned-to-you').click()
    await expect(page.locator('#searchText')).toHaveValue('')

    await page
      .locator('#searchText')
      .fill(record.declaration['informant.email']) // search by different email
    await page.locator('#searchIconButton').click()
    const searchResultRegex = /Search result for “([^”]+)”/
    const searchResult = await page.locator('#content-name').textContent()
    await expect(searchResult).toMatch(searchResultRegex)
    await expect(page.getByText(getChildNameFromRecord(record))).toBeVisible()

    await openRecordByTitle(page, getChildNameFromRecord(record))

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await expect(page.getByTestId('assignedTo-value')).toHaveText(
      'Kennedy Mweene'
    )
    await expect(page.getByTestId('informant.contact-value')).toContainText(
      record.declaration['informant.email']
    )
  })

  test('1.5 Should search from workqueue using informant phone number and return the correct record', async () => {
    await page.getByTestId('exit-event').click()
    await page.locator('#navigation_workqueue_assigned-to-you').click()
    await expect(page.locator('#searchText')).toHaveValue('')
    await page
      .locator('#searchText')
      .fill(record.declaration['informant.phoneNo']) // search by phone
    await page.locator('#searchIconButton').click()
    const searchResultRegex = /Search result for “([^”]+)”/
    const searchResult = await page.locator('#content-name').textContent()
    await expect(searchResult).toMatch(searchResultRegex)
    await expect(page.getByText(getChildNameFromRecord(record))).toBeVisible()

    await page
      .getByRole('button', {
        name: getChildNameFromRecord(record)
      })
      .click()

    await expect(page.getByTestId('assignedTo-value')).toHaveText(
      'Kennedy Mweene'
    )
    await expect(page.getByTestId('informant.contact-value')).toContainText(
      record.declaration['informant.phoneNo']
    )
  })

  test('1.6 Should search from workqueue using informant national ID and return the correct record', async () => {
    await page.getByTestId('exit-event').click()
    await page.locator('#navigation_workqueue_assigned-to-you').click()
    await expect(page.locator('#searchText')).toHaveValue('')
    await page.locator('#searchText').fill(record.declaration['informant.nid']) // search by id
    await page.locator('#searchIconButton').click()
    const searchResultRegex = /Search result for “([^”]+)”/
    const searchResult = await page.locator('#content-name').textContent()
    await expect(searchResult).toMatch(searchResultRegex)
    await expect(page.getByText(getChildNameFromRecord(record))).toBeVisible()
  })

  test('1.7 Should search from workqueue using tracking ID and return the correct record with tracking ID visible', async () => {
    await page.locator('#navigation_workqueue_assigned-to-you').click()
    await expect(page.locator('#searchText')).toHaveValue('')
    await page.locator('#searchText').fill(record.trackingId) // search by tracking id
    await page.locator('#searchIconButton').click()
    const searchResultRegex = /Search result for “([^”]+)”/
    const searchResult = await page.locator('#content-name').textContent()
    await expect(searchResult).toMatch(searchResultRegex)
    await expect(page.getByText(getChildNameFromRecord(record))).toBeVisible()

    await page
      .getByRole('button', {
        name: getChildNameFromRecord(record)
      })
      .click()

    await expect(page.getByTestId('assignedTo-value')).toHaveText(
      'Kennedy Mweene'
    )
    await expect(page.getByTestId('tracking-id-value')).toContainText(
      record.trackingId
    )
  })
})
