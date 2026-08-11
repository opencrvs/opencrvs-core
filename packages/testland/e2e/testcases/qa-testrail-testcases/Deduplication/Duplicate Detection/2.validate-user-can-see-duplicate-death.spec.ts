// TestRail Test Case ID: 2475---https://ocrvs.testrail.io/index.php?/cases/view/2475
import { expect, test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { format, subDays, addDays, subYears } from 'date-fns'
import { getToken, login } from '../../../../helpers'
import { CREDENTIALS } from '../../../../constants'
import { createDeclaration } from '../../../test-data/death-declaration'
import { assertRecordInWorkqueue } from '../../../birth/helpers'
import { ActionType } from '@opencrvs/toolkit/events'
import { ensureAssignedToUser } from '../../../../utils'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'

const isoDate = (date: Date) => format(date, 'yyyy-MM-dd')

const formatDeceasedName = (obj: {
  'deceased.name': { firstname: string; surname: string }
  [key: string]: any
}) => `${obj['deceased.name'].firstname} ${obj['deceased.name'].surname}`

function fakerNameAtLeast(min: number, generator: () => string): string {
  let value = generator()
  while (value.length < min) {
    value = generator()
  }
  return value
}

function withOneLetterChanged(value: string): string {
  const first = value[0]
  const base = first.toLowerCase()
  const replacement =
    base === 'z' ? 'a' : String.fromCharCode(base.charCodeAt(0) + 1)
  const isUpperCase = first === first.toUpperCase()

  return (
    (isUpperCase ? replacement.toUpperCase() : replacement) + value.slice(1)
  )
}

test('2.1. Standard checks for duplicate record flag the second declaration as a potential duplicate', async ({
  page
}) => {
  const deceasedFirstName = fakerNameAtLeast(4, () => faker.person.firstName())
  const deceasedSurname = fakerNameAtLeast(4, () => faker.person.lastName())
  const deceasedNid = faker.string.numeric(10)
  const deceasedDob = isoDate(subYears(new Date(), 70))

  const dateOfDeathOne = isoDate(subDays(new Date(), 30))
  const dateOfDeathTwo = isoDate(addDays(subDays(new Date(), 30), 3))

  const firstDeclarationDetails = {
    'deceased.name': { firstname: deceasedFirstName, surname: deceasedSurname },
    'deceased.dob': deceasedDob,
    'deceased.idType': 'NATIONAL_ID',
    'deceased.nid': deceasedNid,
    'eventDetails.date': dateOfDeathOne
  }

  const secondDeclarationDetails = {
    'deceased.name': {
      firstname: withOneLetterChanged(deceasedFirstName),
      surname: withOneLetterChanged(deceasedSurname)
    },
    'deceased.dob': deceasedDob,
    'deceased.idType': 'NATIONAL_ID',
    'deceased.nid': deceasedNid,
    'eventDetails.date': dateOfDeathTwo
  }

  const secondDeclarationName = formatDeceasedName(secondDeclarationDetails)

  await test.step('Register the first declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, firstDeclarationDetails)
    expect(res.eventId).toBeDefined()
  })

  await test.step('Declare a second, similar declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(token, secondDeclarationDetails, ActionType.DECLARE)
  })

  await test.step('Open the second declaration from the Potential duplicate workqueue', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, secondDeclarationName)
  })

  await test.step('The second declaration is flagged as a potential duplicate of the first', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await expect(page.getByText(/Potential duplicate of record/)).toBeVisible()
  })
})

test('2.2. Standard checks for duplicate record do not flag dissimilar declarations as duplicates', async ({
  page
}) => {
  const firstDeclarationDetails = {
    'deceased.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'deceased.dob': isoDate(subYears(new Date(), 60)),
    'deceased.idType': 'NATIONAL_ID',
    'deceased.nid': faker.string.numeric(10),
    'eventDetails.date': isoDate(subDays(new Date(), 30))
  }

  const secondDeclarationDetails = {
    'deceased.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'deceased.dob': isoDate(subYears(new Date(), 20)),
    'deceased.idType': 'NONE',
    'deceased.nid': null,
    'eventDetails.date': isoDate(subDays(new Date(), 5))
  }

  const secondDeclarationName = formatDeceasedName(secondDeclarationDetails)

  await test.step('Register the first declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, firstDeclarationDetails)
    expect(res.eventId).toBeDefined()
  })

  await test.step('Declare a second, dissimilar declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(token, secondDeclarationDetails, ActionType.DECLARE)
  })

  await test.step('The second declaration is not flagged as a potential duplicate', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await assertRecordInWorkqueue({
      page,
      name: secondDeclarationName,
      workqueues: [
        { title: 'Potential duplicate', exists: false },
        { title: 'Pending registration', exists: true }
      ]
    })
  })
})
