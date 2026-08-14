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

// TestRail Test Case ID: 2482---https://ocrvs.testrail.io/index.php?/cases/view/2482
import { expect, test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { subDays, addDays, subYears } from 'date-fns'
import { ActionType } from '@opencrvs/toolkit/events'
import { getToken, login, triggerDeclarationAction } from '../../../../helpers'
import { CREDENTIALS } from '../../../../constants'
import { createDeclaration } from '../../../test-data/birth-declaration-with-mother-father'
import {
  formatV2ChildName,
  assertRecordInWorkqueue
} from '../../../birth/helpers'
import { ensureAssignedToUser, selectAction } from '../../../../utils'
import { openRecordByTitle } from '../../../print-certificate/birth/helpers'
import {
  isoDate,
  toDateParts,
  fakerNameAtLeast,
  withOneLetterChanged,
  editNameField,
  editDateField,
  editTextField
} from './helpers'

test('3.1. Editing a declaration to match an existing record flags it as a potential duplicate on re-declare', async ({
  page
}) => {
  const childFirstName = fakerNameAtLeast(4, () => faker.person.firstName())
  const childSurname = fakerNameAtLeast(4, () => faker.person.lastName())
  const motherFirstName = fakerNameAtLeast(4, () => faker.person.firstName())
  const motherSurname = fakerNameAtLeast(4, () => faker.person.lastName())
  const motherDobDate = subYears(new Date(), 28)
  const motherDob = isoDate(motherDobDate)
  const motherNid = faker.string.numeric(10)
  const childOneDob = isoDate(subDays(new Date(), 30))
  const childTwoDobDate = addDays(subDays(new Date(), 30), 3)
  const childTwoDob = isoDate(childTwoDobDate)

  const baselineDetails = {
    'child.name': { firstname: childFirstName, surname: childSurname },
    'child.dob': childOneDob,
    'mother.name': { firstname: motherFirstName, surname: motherSurname },
    'mother.dob': motherDob,
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': motherNid
  }

  const dissimilarDetails = {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': isoDate(subDays(new Date(), 200)),
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': isoDate(subYears(new Date(), 22)),
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10)
  }

  const editedChildName = {
    firstname: withOneLetterChanged(childFirstName),
    surname: withOneLetterChanged(childSurname)
  }
  const editedMotherName = {
    firstname: withOneLetterChanged(motherFirstName),
    surname: withOneLetterChanged(motherSurname)
  }

  const editedDetails = {
    'child.name': editedChildName,
    'child.dob': childTwoDob,
    'mother.name': editedMotherName,
    'mother.dob': motherDob,
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': motherNid
  }

  let baselineTrackingId: string

  await test.step('Register the baseline declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, baselineDetails)
    expect(res.trackingId).toBeDefined()
    baselineTrackingId = res.trackingId!
  })

  await test.step('Declare a second, dissimilar declaration (not yet a duplicate)', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(token, dissimilarDetails, ActionType.DECLARE)
  })

  await test.step('Edit it to match the baseline declaration, then re-declare', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Pending registration' }).click()
    await openRecordByTitle(page, formatV2ChildName(dissimilarDetails))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Edit')

    await editNameField(page, 'child.name', editedChildName)
    await editDateField(page, 'child.dob', toDateParts(childTwoDobDate))
    await editNameField(page, 'mother.name', editedMotherName)
    await editDateField(page, 'mother.dob', toDateParts(motherDobDate))
    await editTextField(page, 'mother.nid', 'text__mother____nid', motherNid)

    await triggerDeclarationAction(page, 'Declare with edits')
  })

  await test.step('Open the edited declaration from the Potential duplicate workqueue', async () => {
    await page.getByRole('button', { name: 'Potential duplicate' }).click()
    await openRecordByTitle(page, formatV2ChildName(editedDetails))
  })

  await test.step('The edited declaration is flagged as a potential duplicate of the baseline', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await expect(
      page.getByText(`Potential duplicate of record ${baselineTrackingId}`)
    ).toBeVisible()
  })
})

test('3.2. Editing a declaration while keeping it dissimilar does not flag it as a duplicate on re-declare', async ({
  page
}) => {
  const baselineDetails = {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': isoDate(subDays(new Date(), 30)),
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': isoDate(subYears(new Date(), 27)),
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10)
  }

  const dissimilarDetails = {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': isoDate(subDays(new Date(), 200)),
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': isoDate(subYears(new Date(), 22)),
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10)
  }

  const editedMotherNid = faker.string.numeric(10)
  const editedDetails = {
    ...dissimilarDetails,
    'mother.nid': editedMotherNid
  }

  await test.step('Register the baseline declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token, baselineDetails)
    expect(res.trackingId).toBeDefined()
  })

  await test.step('Declare a second, dissimilar declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await createDeclaration(token, dissimilarDetails, ActionType.DECLARE)
  })

  await test.step('Edit it (still dissimilar), then re-declare', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Pending registration' }).click()
    await openRecordByTitle(page, formatV2ChildName(dissimilarDetails))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Edit')

    await editTextField(
      page,
      'mother.nid',
      'text__mother____nid',
      editedMotherNid
    )

    await triggerDeclarationAction(page, 'Declare with edits')
  })

  await test.step('The edited declaration is not flagged as a potential duplicate', async () => {
    await assertRecordInWorkqueue({
      page,
      name: formatV2ChildName(editedDetails),
      workqueues: [
        { title: 'Potential duplicate', exists: false },
        { title: 'Pending registration', exists: true }
      ]
    })
  })
})
