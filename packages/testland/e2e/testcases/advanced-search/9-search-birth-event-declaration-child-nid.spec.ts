/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { expect, test, type Page } from '@playwright/test'
import { createClient } from '@opencrvs/toolkit/api'
import { aggregateActionDeclarations } from '@opencrvs/toolkit/events'
import { omit } from 'lodash'
import { getToken, login } from '@e2e/support/helpers'
import {
  getDeclaration,
  createDeclaration,
  type Declaration
} from '@e2e/support/test-data/birth-declaration'
import { CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import { assertTexts, ensureAssignedToUser, type } from '@e2e/support/utils'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

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
    middleName: 'Debra',
    familyName: 'Doe',
    birthDate: '2002-02-01',
    gender: 'female',
    nid: '1234567891'
  },
  {
    firstName: 'Monica',
    middleName: 'Michelle',
    familyName: 'Geller',
    birthDate: '2005-02-25',
    gender: 'female',
    nid: '1234567894'
  },
  {
    firstName: 'Phoebe',
    middleName: 'Seni',
    familyName: 'Buffay',
    birthDate: '2002-02-24',
    gender: 'female',
    nid: '1234567896'
  },
  {
    firstName: 'Saida',
    middleName: 'Lyla',
    familyName: 'Sharma',
    birthDate: '1997-12-24',
    gender: 'female',
    nid: '1234567898'
  },
  {
    firstName: 'Prabodha',
    middleName: 'Weerasinghe',
    familyName: 'Perera',
    birthDate: '1993-06-18',
    gender: 'female',
    nid: '1234567925'
  },
  {
    firstName: 'Tharushi',
    middleName: 'Nimasha',
    familyName: 'Perera',
    birthDate: '1998-05-21',
    gender: 'female',
    nid: '1234567926'
  },
  {
    firstName: 'Dilani',
    middleName: 'Madushika',
    familyName: 'Perera',
    birthDate: '1991-05-15',
    gender: 'female',
    nid: '1234567927'
  },
  {
    firstName: 'Tharushi',
    middleName: 'Nimasha',
    familyName: 'Perera',
    birthDate: '1999-01-23',
    gender: 'female',
    nid: '1234567928'
  },
  {
    firstName: 'Nimali',
    middleName: 'Rajapaksha',
    familyName: 'Perera',
    birthDate: '1991-06-11',
    gender: 'female',
    nid: '1234567929'
  },
  {
    firstName: 'Prabodha',
    middleName: 'Weerasinghe',
    familyName: 'Perera',
    birthDate: '1992-03-23',
    gender: 'female',
    nid: '1234567930'
  },
  {
    firstName: 'Nadeesha',
    middleName: 'Lakmali',
    familyName: 'Perera',
    birthDate: '1991-10-19',
    gender: 'female',
    nid: '1234567931'
  },
  {
    firstName: 'Prabodha',
    middleName: 'Weerasinghe',
    familyName: 'Perera',
    birthDate: '1991-07-04',
    gender: 'female',
    nid: '1234567932'
  },
  {
    firstName: 'Udari',
    middleName: 'Manike',
    familyName: 'Perera',
    birthDate: '1992-01-08',
    gender: 'female',
    nid: '1234567933'
  },
  {
    firstName: 'Ishara',
    middleName: 'Sandamini',
    familyName: 'Perera',
    birthDate: '1999-09-01',
    gender: 'female',
    nid: '1234567934'
  },
  {
    firstName: 'Dilani',
    middleName: 'Madushika',
    familyName: 'Perera',
    birthDate: '1994-09-03',
    gender: 'female',
    nid: '1234567935'
  },
  {
    firstName: 'Imesha',
    middleName: 'Senali',
    familyName: 'Perera',
    birthDate: '1990-08-02',
    gender: 'female',
    nid: '1234567936'
  },
  {
    firstName: 'Kanchana',
    middleName: 'Dilani',
    familyName: 'Perera',
    birthDate: '1998-09-13',
    gender: 'female',
    nid: '1234567937'
  },
  {
    firstName: 'Nimesha',
    middleName: 'Madubhashini',
    familyName: 'Perera',
    birthDate: '1995-08-02',
    gender: 'female',
    nid: '1234567938'
  },
  {
    firstName: 'Sulochana',
    middleName: 'Hansika',
    familyName: 'Perera',
    birthDate: '1993-12-04',
    gender: 'female',
    nid: '1234567939'
  },
  {
    firstName: 'Chamodi',
    middleName: 'Hansani',
    familyName: 'Perera',
    birthDate: '1991-03-19',
    gender: 'female',
    nid: '1234567940'
  },
  {
    firstName: 'Prabodha',
    middleName: 'Weerasinghe',
    familyName: 'Perera',
    birthDate: '2000-06-07',
    gender: 'female',
    nid: '1234567941'
  },
  {
    firstName: 'Ayesha',
    middleName: 'Thilakarathna',
    familyName: 'Perera',
    birthDate: '1991-06-26',
    gender: 'female',
    nid: '1234567942'
  },
  {
    firstName: 'Nimali',
    middleName: 'Rajapaksha',
    familyName: 'Perera',
    birthDate: '1991-02-26',
    gender: 'female',
    nid: '1234567943'
  },
  {
    firstName: 'Harshani',
    middleName: 'Dinithi',
    familyName: 'Perera',
    birthDate: '1991-04-05',
    gender: 'female',
    nid: '1234567944'
  },
  {
    firstName: 'Sulochana',
    middleName: 'Hansika',
    familyName: 'Perera',
    birthDate: '2000-08-10',
    gender: 'female',
    nid: '1234567945'
  },
  {
    firstName: 'Sanduni',
    middleName: 'Fernando',
    familyName: 'Perera',
    birthDate: '1990-12-02',
    gender: 'female',
    nid: '1234567946'
  },
  {
    firstName: 'Udari',
    middleName: 'Manike',
    familyName: 'Perera',
    birthDate: '1994-10-19',
    gender: 'female',
    nid: '1234567947'
  },
  {
    firstName: 'Shanika',
    middleName: 'Dilrukshi',
    familyName: 'Perera',
    birthDate: '1992-12-26',
    gender: 'female',
    nid: '1234567948'
  },
  {
    firstName: 'Chamodi',
    middleName: 'Hansani',
    familyName: 'Perera',
    birthDate: '1997-11-09',
    gender: 'female',
    nid: '1234567949'
  },
  {
    firstName: 'Dinuli',
    middleName: 'Wickramasinghe',
    familyName: 'Senanayake',
    birthDate: '1995-11-25',
    gender: 'female',
    nid: '1234567975'
  },
  {
    firstName: 'Thanuri',
    middleName: 'Madushika',
    familyName: 'Senanayake',
    birthDate: '1991-08-15',
    gender: 'female',
    nid: '1234567976'
  },
  {
    firstName: 'Disni',
    middleName: 'Ranasinghe',
    familyName: 'Senanayake',
    birthDate: '2000-12-02',
    gender: 'female',
    nid: '1234567977'
  },
  {
    firstName: 'Minoli',
    middleName: 'Perera',
    familyName: 'Senanayake',
    birthDate: '1996-08-16',
    gender: 'female',
    nid: '1234567978'
  },
  {
    firstName: 'Oshadi',
    middleName: 'Gunarathna',
    familyName: 'Senanayake',
    birthDate: '1990-07-20',
    gender: 'female',
    nid: '1234567979'
  },
  {
    firstName: 'Amaya',
    middleName: 'Sooriyabandara',
    familyName: 'Senanayake',
    birthDate: '1998-10-06',
    gender: 'female',
    nid: '1234567980'
  },
  {
    firstName: 'Chalani',
    middleName: 'Gunawardena',
    familyName: 'Senanayake',
    birthDate: '1999-03-25',
    gender: 'female',
    nid: '1234567981'
  },
  {
    firstName: 'Rukshani',
    middleName: 'Abeyratne',
    familyName: 'Senanayake',
    birthDate: '1999-03-19',
    gender: 'female',
    nid: '1234567982'
  },
  {
    firstName: 'Samadhi',
    middleName: 'Manoratne',
    familyName: 'Senanayake',
    birthDate: '1995-07-24',
    gender: 'female',
    nid: '1234567983'
  },
  {
    firstName: 'Rashmi',
    middleName: 'Tharushika',
    familyName: 'Senanayake',
    birthDate: '1999-04-20',
    gender: 'female',
    nid: '1234567984'
  },
  {
    firstName: 'Kavisha',
    middleName: 'Rathnayake',
    familyName: 'Senanayake',
    birthDate: '1996-07-07',
    gender: 'female',
    nid: '1234567985'
  },
  {
    firstName: 'Hansani',
    middleName: 'Silva',
    familyName: 'Senanayake',
    birthDate: '1991-08-11',
    gender: 'female',
    nid: '1234567986'
  },
  {
    firstName: 'Ruwani',
    middleName: 'Jayasinghe',
    familyName: 'Senanayake',
    birthDate: '1999-07-10',
    gender: 'female',
    nid: '1234567987'
  },
  {
    firstName: 'Kaushalya',
    middleName: 'Weerasooriya',
    familyName: 'Senanayake',
    birthDate: '2000-01-31',
    gender: 'female',
    nid: '1234567988'
  },
  {
    firstName: 'Purnima',
    middleName: 'Senaviratne',
    familyName: 'Senanayake',
    birthDate: '1995-01-19',
    gender: 'female',
    nid: '1234567989'
  },
  {
    firstName: 'Vishmi',
    middleName: 'Rajapaksha',
    familyName: 'Senanayake',
    birthDate: '1994-08-23',
    gender: 'female',
    nid: '1234567990'
  },
  {
    firstName: 'Nuwangi',
    middleName: 'Hettiarachchi',
    familyName: 'Senanayake',
    birthDate: '1995-06-12',
    gender: 'female',
    nid: '1234567991'
  },
  {
    firstName: 'Chamari',
    middleName: 'Priyangika',
    familyName: 'Senanayake',
    birthDate: '1998-08-03',
    gender: 'female',
    nid: '1234567992'
  },
  {
    firstName: 'Imasha',
    middleName: 'Thilini',
    familyName: 'Senanayake',
    birthDate: '1993-03-28',
    gender: 'female',
    nid: '1234567993'
  },
  {
    firstName: 'Tharuka',
    middleName: 'Madushani',
    familyName: 'Senanayake',
    birthDate: '1998-12-24',
    gender: 'female',
    nid: '1234567994'
  },
  {
    firstName: 'Kalani',
    middleName: 'Perera',
    familyName: 'Senanayake',
    birthDate: '1996-04-10',
    gender: 'female',
    nid: '1234567995'
  },
  {
    firstName: 'Nimesha',
    middleName: 'Dilhani',
    familyName: 'Senanayake',
    birthDate: '2000-06-07',
    gender: 'female',
    nid: '1234567996'
  },
  {
    firstName: 'Isurika',
    middleName: 'Sathsarani',
    familyName: 'Senanayake',
    birthDate: '2000-05-26',
    gender: 'female',
    nid: '1234567997'
  },
  {
    firstName: 'Udani',
    middleName: 'Dilrukshi',
    familyName: 'Senanayake',
    birthDate: '1994-09-08',
    gender: 'female',
    nid: '1234567998'
  },
  {
    firstName: 'Sachini',
    middleName: 'Madhushika',
    familyName: 'Senanayake',
    birthDate: '1994-08-03',
    gender: 'female',
    nid: '1234567999'
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
