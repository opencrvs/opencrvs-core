// TestRail Test Case ID: 2483---https://ocrvs.testrail.io/index.php?/cases/view/2483
import { expect, test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { format, subDays, addDays, subYears } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@opencrvs/toolkit/api'
import { ActionType } from '@opencrvs/toolkit/events'
import { getToken, login } from '../../../../helpers'
import { CREDENTIALS, GATEWAY_HOST } from '../../../../constants'
import { createDeclaration } from '../../../test-data/death-declaration'
import { getSignatureFile, uploadFile } from '../../../test-data/utils'
import { assertRecordInWorkqueue } from '../../../birth/helpers'
import { ensureAssignedToUser } from '../../../../utils'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'

const isoDate = (date: Date) => format(date, 'yyyy-MM-dd')

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

async function buildAnnotation(token: string) {
  const filename = await uploadFile(getSignatureFile(), token)
  return {
    'review.comment': 'Edited before re-submitting',
    'review.signature': filename
  }
}

function getUserIdFromToken(token: string): string {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).sub
}

const formatDeceasedName = (obj: {
  'deceased.name': { firstname: string; surname: string }
  [key: string]: any
}) => `${obj['deceased.name'].firstname} ${obj['deceased.name'].surname}`

test('4.1. Editing a declaration to match an existing record flags it as a potential duplicate on re-declare', async ({
  page
}) => {
  const deceasedFirstName = fakerNameAtLeast(4, () => faker.person.firstName())
  const deceasedSurname = fakerNameAtLeast(4, () => faker.person.lastName())
  const deceasedNid = faker.string.numeric(10)
  const deceasedDob = isoDate(subYears(new Date(), 70))
  const dateOfDeathOne = isoDate(subDays(new Date(), 30))
  const dateOfDeathTwo = isoDate(addDays(subDays(new Date(), 30), 3))

  const baselineDetails = {
    'deceased.name': { firstname: deceasedFirstName, surname: deceasedSurname },
    'deceased.dob': deceasedDob,
    'deceased.idType': 'NATIONAL_ID',
    'deceased.nid': deceasedNid,
    'eventDetails.date': dateOfDeathOne
  }

  const dissimilarDetails = {
    'deceased.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'deceased.dob': isoDate(subYears(new Date(), 40)),
    'deceased.idType': 'NATIONAL_ID',
    'deceased.nid': faker.string.numeric(10),
    'eventDetails.date': isoDate(subDays(new Date(), 15))
  }

  const editedDetails = {
    'deceased.name': {
      firstname: withOneLetterChanged(deceasedFirstName),
      surname: withOneLetterChanged(deceasedSurname)
    },
    'deceased.dob': deceasedDob,
    'deceased.idType': 'NATIONAL_ID',
    'deceased.nid': deceasedNid,
    'eventDetails.date': dateOfDeathTwo
  }

  let editedToken: string
  let editedEventId: string

  await test.step('Register the baseline declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, baselineDetails)
    expect(res.eventId).toBeDefined()
  })

  await test.step('Declare a second, dissimilar declaration (not yet a duplicate)', async () => {
    editedToken = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(
      editedToken,
      dissimilarDetails,
      ActionType.DECLARE
    )
    editedEventId = res.eventId
  })

  await test.step('Edit it to match the baseline declaration, then re-declare', async () => {
    const client = createClient(
      `${GATEWAY_HOST}/events`,
      `Bearer ${editedToken}`
    )

    await client.event.actions.assignment.assign.mutate({
      eventId: editedEventId,
      transactionId: uuidv4(),
      type: ActionType.ASSIGN,
      assignedTo: getUserIdFromToken(editedToken)
    })

    const annotation = await buildAnnotation(editedToken)

    await client.event.actions.edit.request.mutate({
      eventId: editedEventId,
      transactionId: uuidv4(),
      declaration: editedDetails,
      annotation,
      keepAssignmentIfAccepted: true
    })

    await client.event.actions.declare.request.mutate({
      eventId: editedEventId,
      transactionId: uuidv4(),
      declaration: editedDetails,
      annotation,
      keepAssignment: true
    })
  })

  await test.step('Open the edited declaration from the Potential duplicate workqueue', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, formatDeceasedName(editedDetails))
  })

  await test.step('The edited declaration is flagged as a potential duplicate of the baseline', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await expect(page.getByText(/Potential duplicate of record/)).toBeVisible()
  })
})

test('4.2. Editing a declaration while keeping it dissimilar does not flag it as a duplicate on re-declare', async ({
  page
}) => {
  const baselineDetails = {
    'deceased.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'deceased.dob': isoDate(subYears(new Date(), 60)),
    'deceased.idType': 'NATIONAL_ID',
    'deceased.nid': faker.string.numeric(10),
    'eventDetails.date': isoDate(subDays(new Date(), 30))
  }

  const dissimilarDetails = {
    'deceased.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'deceased.dob': isoDate(subYears(new Date(), 20)),
    'deceased.idType': 'NATIONAL_ID',
    'deceased.nid': faker.string.numeric(10),
    'eventDetails.date': isoDate(subDays(new Date(), 5))
  }

  const editedDetails = {
    ...dissimilarDetails,
    'deceased.nid': faker.string.numeric(10)
  }

  let editedToken: string
  let editedEventId: string

  await test.step('Register the baseline declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, baselineDetails)
    expect(res.eventId).toBeDefined()
  })

  await test.step('Declare a second, dissimilar declaration', async () => {
    editedToken = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(
      editedToken,
      dissimilarDetails,
      ActionType.DECLARE
    )
    editedEventId = res.eventId
  })

  await test.step('Edit it (still dissimilar), then re-declare', async () => {
    const client = createClient(
      `${GATEWAY_HOST}/events`,
      `Bearer ${editedToken}`
    )

    await client.event.actions.assignment.assign.mutate({
      eventId: editedEventId,
      transactionId: uuidv4(),
      type: ActionType.ASSIGN,
      assignedTo: getUserIdFromToken(editedToken)
    })

    const annotation = await buildAnnotation(editedToken)

    await client.event.actions.edit.request.mutate({
      eventId: editedEventId,
      transactionId: uuidv4(),
      declaration: editedDetails,
      annotation,
      keepAssignmentIfAccepted: true
    })

    await client.event.actions.declare.request.mutate({
      eventId: editedEventId,
      transactionId: uuidv4(),
      declaration: editedDetails,
      annotation,
      keepAssignment: true
    })
  })

  await test.step('The edited declaration is not flagged as a potential duplicate', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await assertRecordInWorkqueue({
      page,
      name: formatDeceasedName(editedDetails),
      workqueues: [
        { title: 'Potential duplicate', exists: false },
        { title: 'Pending registration', exists: true }
      ]
    })
  })
})
