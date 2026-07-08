import { expect, test, type Page } from '@playwright/test'
import { createClient } from '@opencrvs/toolkit/api'
import { aggregateActionDeclarations } from '@opencrvs/toolkit/events'
import { omit } from 'lodash'
import { getToken, login } from '../../helpers'
import {
  getDeclaration,
  createDeclaration,
  type Declaration
} from '../test-data/birth-declaration'
import { CREDENTIALS, GATEWAY_HOST } from '../../constants'
import { assertTexts, ensureAssignedToUser, type } from '../../utils'
import { formatV2ChildName } from '../birth/helpers'
import { openRecordByTitle } from '../print-certificate/birth/helpers'

/*
 * Female identity from mock-identities.json (Sahara Wendy Moyo, NID: 1234567899).
 * mother.nid and mother.idType are intentionally omitted from the declaration
 * because eSignet authentication hides those fields — the backend rejects
 * hidden fields receiving values. Setting mother.verified = 'authenticated'
 * causes MOSIP to forward the birth registration and assign a child.nid.
 */
const AVAILABLE_IDENTITIES = [
  {
    firstName: 'Jenny',
    familyName: 'Doe',
    birthDate: '2002-02-01',
    nid: '1234567891'
  },
  {
    firstName: 'Monica',
    familyName: 'Geller',
    birthDate: '2005-02-25',
    nid: '1234567894'
  },
  {
    firstName: 'Phoebe',
    familyName: 'Buffay',
    birthDate: '2002-02-24',
    nid: '1234567896'
  },
  {
    firstName: 'Saida',
    familyName: 'Sharma',
    birthDate: '1997-12-24',
    nid: '1234567898'
  },
  {
    firstName: 'Sahara',
    familyName: 'Moyo',
    birthDate: '1994-10-02',
    nid: '1234567899'
  },
  {
    firstName: 'Tharushi',
    familyName: 'Perera',
    birthDate: '1998-05-21',
    nid: '1234567926'
  },
  {
    firstName: 'Nadeesha',
    familyName: 'Perera',
    birthDate: '1991-10-19',
    nid: '1234567931'
  },
  {
    firstName: 'Kanchana',
    familyName: 'Perera',
    birthDate: '1998-09-13',
    nid: '1234567937'
  },
  {
    firstName: 'Amaya',
    familyName: 'Senanayake',
    birthDate: '1998-10-06',
    nid: '1234567980'
  },
  {
    firstName: 'Vishmi',
    familyName: 'Senanayake',
    birthDate: '1994-08-23',
    nid: '1234567990'
  }
]

test.describe
  .serial('Advanced Search - Birth Event Declaration - Child NID', () => {
  let page: Page
  let childNid: string
  let declaration: Declaration
  let eventId: string

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(CREDENTIALS.REGISTRAR)

    // Having a single identity results to duplicate detected on problem situations. Pick randomly, removing it from the list.
    const randomIndex = Math.floor(Math.random() * AVAILABLE_IDENTITIES.length)
    const [MOTHER_IDENTITY] = AVAILABLE_IDENTITIES.splice(randomIndex, 1)

    const declData = await getDeclaration({
      token,
      partialDeclaration: {
        'mother.verified': 'authenticated',
        'mother.name': {
          firstname: MOTHER_IDENTITY.firstName,
          surname: MOTHER_IDENTITY.familyName
        },
        'mother.dob': MOTHER_IDENTITY.birthDate
      }
    })

    // mother.idType and mother.nid are hidden when mother.verified === 'authenticated'
    // (eSignet flow) so the backend rejects those fields — same approach as
    // birth-registration-forwarding.spec.ts
    const res = await createDeclaration(
      token,
      omit(declData, ['mother.idType', 'mother.nid'])
    )
    declaration = res.declaration
    eventId = res.eventId

    const client = createClient(`${GATEWAY_HOST}/events`, `Bearer ${token}`)

    await expect
      .poll(
        async () => {
          const event = await client.event.get.query({
            eventId,
            waitFor: false
          })
          const aggregated = aggregateActionDeclarations(event)
          childNid = aggregated['child.nid'] as string
          return Boolean(childNid)
        },
        {
          timeout: 60_000,
          intervals: [...Array(5).fill(1_000), ...Array(5).fill(2_000), 5_000]
        }
      )
      .toBe(true)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Navigate to advanced search', async () => {
    await login(page)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await page.getByText('Birth').click()
  })

  test('Search by child name and NID and verify search results', async () => {
    await page.getByText('Child details').click()

    await type(page, '#firstname', declaration['child.name'].firstname)
    await type(page, '#surname', declaration['child.name'].surname)
    await type(page, '#child____nid', childNid)

    await page.click('#search')
    await expect(page).toHaveURL(/.*\/search-result/)
    expect(page.url()).toContain(`child.nid=${childNid}`)

    const searchResult = await page.locator('#content-name').textContent()
    const searchResultCountNumberInBracketsRegex = /\((\d+)\)$/
    expect(searchResult).toMatch(searchResultCountNumberInBracketsRegex)

    await assertTexts({
      root: page,
      testId: 'search-result',
      texts: [
        'Event: Birth',
        `Child's National ID: ${childNid}`,
        `Child's Name: ${declaration['child.name'].firstname} ${declaration['child.name'].surname}`
      ]
    })
  })

  test('Open record from search results and verify NID is visible in summary', async () => {
    const childName = formatV2ChildName(declaration)
    await openRecordByTitle(page, childName)

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await expect(page.getByTestId('child.nid-value')).toContainText(childNid)
  })
})
