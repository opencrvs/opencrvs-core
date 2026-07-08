import { expect, test, type Page } from '@playwright/test'
import { joinValuesWith, login, triggerDeclarationAction } from '../../helpers'
import { faker } from '@faker-js/faker'
import { expectInUrl, type } from '../../utils'

test.describe
  .serial("Advanced Search - Birth Event Declaration - Informant's details", () => {
  let page: Page
  let firstname: string
  let surname: string

  test.beforeAll(async ({ browser }) => {
    firstname = faker.person.firstName()
    surname = faker.person.firstName()
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('7.1 Create a draft birth declaration by filling in child details', async () => {
    await login(page)
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await type(page, '#firstname', firstname)
    await type(page, '#surname', surname)
    await page.locator('#child____gender').click()
    await page.getByText('Female', { exact: true }).click()

    await expect(
      page.getByRole('button', { name: 'Save & Exit' })
    ).toBeVisible()

    const draftResponse = page.waitForResponse(
      (res) => res.url().includes('event.draft.create') && res.ok()
    )
    await page.getByRole('button', { name: 'Save & Exit' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await draftResponse

    //@todo: The user should be navigated to "my-drafts" tab by default
    await page.getByText('Drafts').click()

    await expect(
      page.getByText(joinValuesWith([firstname, surname]))
    ).toBeVisible()
  })

  test('7.2 - Navigate to the advanced search page and select Birth event type', async () => {
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await page.getByText('Birth').click()
  })

  test('7.3 - Search for birth declaration using child name and status filter', async () => {
    await page.getByText('Registration details').click()

    await page.locator('#event____status').click()
    await expect(page.getByText('Created')).toBeHidden()
    await page.getByText(/^Any status$/).click()

    await page.getByText('Child details').click()

    await type(page, '#firstname', firstname)
    await type(page, '#surname', surname)

    await page.click('#search')
    await expect(page).toHaveURL(/.*\/search-result/)
  })

  test('7.4 - Confirm that draft records do not appear in search results', async () => {
    await expect(page.getByText('Search results')).toBeVisible()
    const searchResult = await page.locator('#content-name').textContent()
    const searchResultCountNumberInBracketsRegex = /\((\d+)\)$/
    expect(searchResult).toMatch(searchResultCountNumberInBracketsRegex)
    expectInUrl(page, 'event.status=ALL')

    expect(page.url()).toContain(
      `child.name=${encodeURIComponent(JSON.stringify({ firstname, surname }))}`
    )
    await expect(
      page.getByRole('button', { name: joinValuesWith([firstname, surname]) })
    ).not.toBeVisible()
  })
})
