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

// TestRail Test Case ID: 2483---https://ocrvs.testrail.io/index.php?/cases/view/2483
import { expect, test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { subDays, addDays, subYears } from 'date-fns'
import { ActionType } from '@opencrvs/toolkit/events'
import { getToken, login, triggerDeclarationAction } from '../../../../helpers'
import { CREDENTIALS } from '../../../../constants'
import { createDeclaration } from '../../../test-data/death-declaration'
import { assertRecordInWorkqueue } from '../../../birth/helpers'
import { ensureAssignedToUser, selectAction } from '../../../../utils'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'
import {
  isoDate,
  toDateParts,
  fakerNameAtLeast,
  withOneLetterChanged,
  formatDeceasedName,
  editNameField,
  editDateField,
  editTextField
} from './helpers'

test('4.1. Editing a declaration to match an existing record flags it as a potential duplicate on re-declare', async ({
  page
}) => {
  const deceasedFirstName = fakerNameAtLeast(4, () => faker.person.firstName())
  const deceasedSurname = fakerNameAtLeast(4, () => faker.person.lastName())
  const deceasedNid = faker.string.numeric(10)
  const deceasedDobDate = subYears(new Date(), 70)
  const deceasedDob = isoDate(deceasedDobDate)
  const dateOfDeathOne = isoDate(subDays(new Date(), 30))
  const dateOfDeathTwoDate = addDays(subDays(new Date(), 30), 3)
  const dateOfDeathTwo = isoDate(dateOfDeathTwoDate)

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

  const editedDeceasedName = {
    firstname: withOneLetterChanged(deceasedFirstName),
    surname: withOneLetterChanged(deceasedSurname)
  }

  const editedDetails = {
    'deceased.name': editedDeceasedName,
    'deceased.dob': deceasedDob,
    'deceased.idType': 'NATIONAL_ID',
    'deceased.nid': deceasedNid,
    'eventDetails.date': dateOfDeathTwo
  }

  await test.step('Register the baseline declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, baselineDetails)
    expect(res.eventId).toBeDefined()
  })

  await test.step('Declare a second, dissimilar declaration (not yet a duplicate)', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(token, dissimilarDetails, ActionType.DECLARE)
  })

  await test.step('Edit it to match the baseline declaration, then re-declare', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Pending registration' }).click()
    await openRecordByTitle(page, formatDeceasedName(dissimilarDetails))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Edit')

    await editNameField(page, 'deceased.name', editedDeceasedName)
    await editDateField(page, 'deceased.dob', toDateParts(deceasedDobDate))
    await editTextField(page, 'deceased.nid', 'text__deceased____nid', deceasedNid)
    await editDateField(
      page,
      'eventDetails.date',
      toDateParts(dateOfDeathTwoDate)
    )

    await triggerDeclarationAction(page, 'Declare with edits')
  })

  await test.step('Open the edited declaration from the Potential duplicate workqueue', async () => {
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

  const editedDeceasedNid = faker.string.numeric(10)
  const editedDetails = {
    ...dissimilarDetails,
    'deceased.nid': editedDeceasedNid
  }

  await test.step('Register the baseline declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, baselineDetails)
    expect(res.eventId).toBeDefined()
  })

  await test.step('Declare a second, dissimilar declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(token, dissimilarDetails, ActionType.DECLARE)
  })

  await test.step('Edit it (still dissimilar), then re-declare', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Pending registration' }).click()
    await openRecordByTitle(page, formatDeceasedName(dissimilarDetails))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Edit')

    await editTextField(
      page,
      'deceased.nid',
      'text__deceased____nid',
      editedDeceasedNid
    )

    await triggerDeclarationAction(page, 'Declare with edits')
  })

  await test.step('The edited declaration is not flagged as a potential duplicate', async () => {
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
