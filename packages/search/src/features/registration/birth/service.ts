/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  indexComposition,
  updateComposition
} from '@search/elasticsearch/dbhelper'
import {
  detectDuplicates,
  EVENT,
  IBirthCompositionBody,
  ICompositionBody,
  getCreatedBy,
  IStatus,
  getStatus,
  createStatusHistory
} from '@search/elasticsearch/utils'
import {
  addDuplicatesToComposition,
  findEntry,
  findName,
  findTask,
  findTaskExtension,
  findTaskIdentifier,
  getCompositionById,
  updateInHearth
} from '@search/features/fhir/fhir-utils'
import { logger } from '@search/logger'

const MOTHER_CODE = 'mother-details'
const FATHER_CODE = 'father-details'
const CHILD_CODE = 'child-details'
const BIRTH_ENCOUNTER_CODE = 'birth-encounter'
const NAME_EN = 'en'
const NAME_BN = 'bn'

export async function upsertEvent(bundle: fhir.Bundle) {
  const bundleEntries = bundle.entry

  if (bundleEntries && bundleEntries.length === 1) {
    const resource = bundleEntries[0].resource
    if (resource && resource.resourceType === 'Task') {
      await updateEvent(resource as fhir.Task)
      return
    }
  }

  const composition = (bundleEntries &&
    bundleEntries[0].resource) as fhir.Composition
  if (!composition) {
    throw new Error('Composition not found')
  }

  const compositionId = composition.id

  if (!compositionId) {
    throw new Error(`Composition ID not found`)
  }

  await indexAndSearchComposition(compositionId, composition, bundleEntries)
}

async function updateEvent(task: fhir.Task) {
  const compositionId =
    task &&
    task.focus &&
    task.focus.reference &&
    task.focus.reference.split('/')[1]

  if (!compositionId) {
    throw new Error('No Composition ID found')
  }

  const regLastUserIdentifier = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastUser'
  )
  const body: ICompositionBody = {
    status: (await getStatus(compositionId)) as IStatus[]
  }
  body.type =
    task &&
    task.businessStatus &&
    task.businessStatus.coding &&
    task.businessStatus.coding[0].code
  body.modifiedAt = Date.now().toString()
  const nodeText =
    task && task.note && task.note[0].text && task.note[0].text.split('&')
  body.rejectReason = nodeText && nodeText[0] && nodeText[0].split('=')[1]
  body.rejectComment = nodeText && nodeText[1] && nodeText[1].split('=')[1]
  body.updatedBy =
    regLastUserIdentifier &&
    regLastUserIdentifier.valueReference &&
    regLastUserIdentifier.valueReference.reference &&
    regLastUserIdentifier.valueReference.reference.split('/')[1]

  await createStatusHistory(body)
  await updateComposition(compositionId, body)
}

async function indexAndSearchComposition(
  compositionId: string,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const body: IBirthCompositionBody = {
    event: EVENT.BIRTH,
    createdAt: Date.now().toString(),
    status: (await getStatus(compositionId)) as IStatus[]
  }

  await createIndexBody(body, composition, bundleEntries)
  await indexComposition(compositionId, body)

  await detectAndUpdateDuplicates(compositionId, composition, body)
}

async function createIndexBody(
  body: IBirthCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  createChildIndex(body, composition, bundleEntries)
  createMotherIndex(body, composition, bundleEntries)
  createFatherIndex(body, composition, bundleEntries)
  await createApplicationIndex(body, composition, bundleEntries)
  await createStatusHistory(body)
}

function createChildIndex(
  body: IBirthCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const child = findEntry(
    CHILD_CODE,
    composition,
    bundleEntries
  ) as fhir.Patient

  const birthEncounter = findEntry(
    BIRTH_ENCOUNTER_CODE,
    composition,
    bundleEntries
  ) as fhir.Encounter

  const childName = child && findName(NAME_EN, child)
  const childNameLocal = child && findName(NAME_BN, child)

  body.childFirstNames =
    childName && childName.given && childName.given.join(' ')
  body.childFamilyName = childName && childName.family && childName.family[0]
  body.childFirstNamesLocal =
    childNameLocal && childNameLocal.given && childNameLocal.given.join(' ')
  body.childFamilyNameLocal =
    childNameLocal && childNameLocal.family && childNameLocal.family[0]
  body.childDoB = child && child.birthDate
  body.gender = child && child.gender
  body.eventLocationId =
    birthEncounter &&
    birthEncounter.location &&
    birthEncounter.location[0].location.reference &&
    birthEncounter.location[0].location.reference.split('/')[1]
}

function createMotherIndex(
  body: IBirthCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const mother = findEntry(
    MOTHER_CODE,
    composition,
    bundleEntries
  ) as fhir.Patient

  const motherName = mother && findName(NAME_EN, mother)
  const motherNameLocal = mother && findName(NAME_BN, mother)

  body.motherFirstNames =
    motherName && motherName.given && motherName.given.join(' ')
  body.motherFamilyName =
    motherName && motherName.family && motherName.family[0]
  body.motherFirstNamesLocal =
    motherNameLocal && motherNameLocal.given && motherNameLocal.given.join(' ')
  body.motherFamilyNameLocal =
    motherNameLocal && motherNameLocal.family && motherNameLocal.family[0]
  body.motherDoB = mother.birthDate
  body.motherIdentifier =
    mother.identifier && mother.identifier[0] && mother.identifier[0].value
}

function createFatherIndex(
  body: IBirthCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const father = findEntry(
    FATHER_CODE,
    composition,
    bundleEntries
  ) as fhir.Patient

  if (!father) {
    return
  }

  const fatherName = father && findName(NAME_EN, father)
  const fatherNameLocal = father && findName(NAME_BN, father)

  body.fatherFirstNames =
    fatherName && fatherName.given && fatherName.given.join(' ')
  body.fatherFamilyName =
    fatherName && fatherName.family && fatherName.family[0]
  body.fatherFirstNamesLocal =
    fatherNameLocal && fatherNameLocal.given && fatherNameLocal.given.join(' ')
  body.fatherFamilyNameLocal =
    fatherNameLocal && fatherNameLocal.family && fatherNameLocal.family[0]
  body.fatherDoB = father.birthDate
  body.fatherIdentifier =
    father.identifier && father.identifier[0] && father.identifier[0].value
}

async function createApplicationIndex(
  body: IBirthCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const task = findTask(bundleEntries)
  const contactNumberExtension = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/contact-person-phone-number'
  )
  const placeOfApplicationExtension = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastOffice'
  )

  const trackingIdIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/birth-tracking-id'
  )
  const registrationNumberIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/birth-registration-number'
  )

  const regLastUserIdentifier = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastUser'
  )

  const regLastUser =
    regLastUserIdentifier &&
    regLastUserIdentifier.valueReference &&
    regLastUserIdentifier.valueReference.reference &&
    regLastUserIdentifier.valueReference.reference.split('/')[1]

  const compositionTypeCode =
    composition.type.coding &&
    composition.type.coding.find(
      code => code.system === 'http://opencrvs.org/doc-types'
    )

  body.contactNumber =
    contactNumberExtension && contactNumberExtension.valueString
  body.type =
    task &&
    task.businessStatus &&
    task.businessStatus.coding &&
    task.businessStatus.coding[0].code
  body.dateOfApplication = task && task.lastModified
  body.trackingId = trackingIdIdentifier && trackingIdIdentifier.value
  body.registrationNumber =
    registrationNumberIdentifier && registrationNumberIdentifier.value
  body.applicationLocationId =
    placeOfApplicationExtension &&
    placeOfApplicationExtension.valueReference &&
    placeOfApplicationExtension.valueReference.reference &&
    placeOfApplicationExtension.valueReference.reference.split('/')[1]
  body.compositionType =
    (compositionTypeCode && compositionTypeCode.code) || 'birth-application'

  const createdBy = await getCreatedBy(composition.id || '')

  if (createdBy) {
    body.createdBy = createdBy
    body.updatedBy = regLastUser
  } else {
    body.createdBy = regLastUser
  }
}

async function detectAndUpdateDuplicates(
  compositionId: string,
  composition: fhir.Composition,
  body: IBirthCompositionBody
) {
  const duplicates = await detectDuplicates(compositionId, body)
  if (!duplicates.length) {
    return
  }
  logger.info(
    `Search/service: ${duplicates.length} duplicate composition(s) found`
  )

  return await updateCompositionWithDuplicates(composition, duplicates)
}

async function updateCompositionWithDuplicates(
  composition: fhir.Composition,
  duplicates: string[]
) {
  const duplicateCompositions = await Promise.all(
    // tslint:disable-next-line
    duplicates.map(duplicate => getCompositionById(duplicate))
  )

  const duplicateCompositionIds = duplicateCompositions.map(
    dupComposition => dupComposition.id
  )

  if (composition && composition.id) {
    const body: ICompositionBody = {}
    body.relatesTo = duplicateCompositionIds
    updateComposition(composition.id, body)
  }
  const compositionFromFhir = (await getCompositionById(
    composition.id as string
  )) as fhir.Composition
  addDuplicatesToComposition(duplicateCompositionIds, compositionFromFhir)

  return updateInHearth(compositionFromFhir, compositionFromFhir.id)
}
