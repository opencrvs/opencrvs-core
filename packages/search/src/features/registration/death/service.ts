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
import {
  indexComposition,
  searchByCompositionId,
  updateComposition
} from '@search/elasticsearch/dbhelper'
import {
  ARCHIVED_STATUS,
  CERTIFIED_STATUS,
  createStatusHistory,
  DECLARED_STATUS,
  detectDeathDuplicates,
  EVENT,
  getCreatedBy,
  getStatus,
  ICompositionBody,
  IDeathCompositionBody,
  IN_PROGRESS_STATUS,
  IOperationHistory,
  NAME_EN,
  REGISTERED_STATUS,
  REJECTED_STATUS,
  VALIDATED_STATUS
} from '@search/elasticsearch/utils'
import {
  addEventLocation,
  addFlaggedAsPotentialDuplicate,
  findEntry,
  findEntryResourceByUrl,
  findName,
  findNameLocale,
  findTask,
  findTaskExtension,
  findTaskIdentifier,
  getdeclarationJurisdictionIds
} from '@search/features/fhir/fhir-utils'
import * as Hapi from '@hapi/hapi'
import { client } from '@search/elasticsearch/client'
import { logger } from '@search/logger'
import { updateCompositionWithDuplicates } from '@search/features/registration/birth/service'

const DECEASED_CODE = 'deceased-details'
const INFORMANT_CODE = 'informant-details'
const MOTHER_CODE = 'mother-details'
const FATHER_CODE = 'father-details'
const SPOUSE_CODE = 'spouse-details'
const DEATH_ENCOUNTER_CODE = 'death-encounter'

export async function upsertEvent(requestBundle: Hapi.Request) {
  const bundle = requestBundle.payload as fhir.Bundle
  const bundleEntries = bundle.entry
  const authHeader = requestBundle.headers.authorization

  const isCompositionInBundle = bundleEntries?.some(
    ({ resource }) => resource?.resourceType === 'Composition'
  )

  if (!isCompositionInBundle) {
    await updateEvent(bundle, authHeader)
    return
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

  await indexDeclaration(compositionId, composition, authHeader, bundleEntries)
}

/**
 * Updates the search index with the latest information of the composition
 * Supports 1 task and 1 patient maximum
 */
async function updateEvent(bundle: fhir.Bundle, authHeader: string) {
  const task = findTask(bundle.entry)

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
  const registrationNumberIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/death-registration-number'
  )

  const body: ICompositionBody = {
    operationHistories: (await getStatus(compositionId)) as IOperationHistory[]
  }

  body.type =
    task &&
    task.businessStatus &&
    task.businessStatus.coding &&
    task.businessStatus.coding[0].code
  body.modifiedAt = Date.now().toString()
  if (body.type === REJECTED_STATUS) {
    const nodeText =
      (task && task.note && task.note[0].text && task.note[0].text) || ''
    body.rejectReason = (task && task.reason && task.reason.text) || ''
    body.rejectComment = nodeText
  }
  body.updatedBy =
    regLastUserIdentifier &&
    regLastUserIdentifier.valueReference &&
    regLastUserIdentifier.valueReference.reference &&
    regLastUserIdentifier.valueReference.reference.split('/')[1]
  body.registrationNumber =
    registrationNumberIdentifier && registrationNumberIdentifier.value
  if (
    [
      REJECTED_STATUS,
      VALIDATED_STATUS,
      REGISTERED_STATUS,
      CERTIFIED_STATUS,
      ARCHIVED_STATUS
    ].includes(body.type ?? '')
  ) {
    body.assignment = null
  }
  await createStatusHistory(body, task, authHeader)
  await updateComposition(compositionId, body, client)
}

async function indexDeclaration(
  compositionId: string,
  composition: fhir.Composition,
  authHeader: string,
  bundleEntries?: fhir.BundleEntry[]
) {
  const result = await searchByCompositionId(compositionId, client)
  const body: ICompositionBody = {
    event: EVENT.DEATH,
    createdAt:
      (result &&
        result.body.hits.hits.length > 0 &&
        result.body.hits.hits[0]._source.createdAt) ||
      Date.now().toString(),
    operationHistories: (await getStatus(compositionId)) as IOperationHistory[]
  }

  await createIndexBody(body, composition, authHeader, bundleEntries)
  await indexComposition(compositionId, body, client)

  if (body.type === DECLARED_STATUS || body.type === IN_PROGRESS_STATUS) {
    await detectAndUpdateDeathDuplicates(compositionId, composition, body)
  }
}

async function detectAndUpdateDeathDuplicates(
  compositionId: string,
  composition: fhir.Composition,
  body: IDeathCompositionBody
) {
  const duplicates = await detectDeathDuplicates(compositionId, body)
  if (!duplicates.length) {
    return
  }
  logger.info(
    `Search/service:death: ${duplicates.length} duplicate composition(s) found`
  )
  await addFlaggedAsPotentialDuplicate(
    duplicates.map((ite) => ite.trackingId).join(','),
    compositionId
  )
  return await updateCompositionWithDuplicates(
    composition,
    duplicates.map((it) => it.id)
  )
}

async function createIndexBody(
  body: IDeathCompositionBody,
  composition: fhir.Composition,
  authHeader: string,
  bundleEntries?: fhir.BundleEntry[]
) {
  await createDeceasedIndex(body, composition, bundleEntries)
  createFatherIndex(body, composition, bundleEntries)
  createMotherIndex(body, composition, bundleEntries)
  createSpouseIndex(body, composition, bundleEntries)
  createInformantIndex(body, composition, bundleEntries)
  await createDeclarationIndex(body, composition, bundleEntries)
  const task = findTask(bundleEntries)
  await createStatusHistory(body, task, authHeader)
}

async function createDeceasedIndex(
  body: IDeathCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const deceased = findEntry(
    DECEASED_CODE,
    composition,
    bundleEntries
  ) as fhir.Patient

  await addEventLocation(body, DEATH_ENCOUNTER_CODE, composition)

  const deceasedName = deceased && findName(NAME_EN, deceased.name)
  const deceasedNameLocal = deceased && findNameLocale(deceased.name)

  body.deceasedFirstNames =
    deceasedName && deceasedName.given && deceasedName.given.join(' ')
  body.deceasedFamilyName =
    deceasedName && deceasedName.family && deceasedName.family[0]
  body.deceasedFirstNamesLocal =
    deceasedNameLocal &&
    deceasedNameLocal.given &&
    deceasedNameLocal.given.join(' ')
  body.deceasedFamilyNameLocal =
    deceasedNameLocal && deceasedNameLocal.family && deceasedNameLocal.family[0]
  body.deathDate = deceased && deceased.deceasedDateTime
  body.gender = deceased && deceased.gender
  body.deceasedIdentifier =
    deceased.identifier &&
    deceased.identifier.find(
      (identifier) => identifier.type?.coding?.[0].code === 'NATIONAL_ID'
    )?.value
  body.deceasedDoB = deceased && deceased.birthDate
}

function createMotherIndex(
  body: IDeathCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const mother = findEntry(
    MOTHER_CODE,
    composition,
    bundleEntries
  ) as fhir.Patient

  if (!mother) {
    return
  }

  const motherName = findName(NAME_EN, mother.name)
  const motherNameLocal = findNameLocale(mother.name)

  body.motherFirstNames =
    motherName && motherName.given && motherName.given.join(' ')
  body.motherFamilyName =
    motherName && motherName.family && motherName.family[0]
  body.motherFirstNamesLocal =
    motherNameLocal && motherNameLocal.given && motherNameLocal.given.join(' ')
  body.motherFamilyNameLocal =
    motherNameLocal && motherNameLocal.family && motherNameLocal.family[0]
}

function createFatherIndex(
  body: IDeathCompositionBody,
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

  const fatherName = findName(NAME_EN, father.name)
  const fatherNameLocal = findNameLocale(father.name)

  body.fatherFirstNames =
    fatherName && fatherName.given && fatherName.given.join(' ')
  body.fatherFamilyName =
    fatherName && fatherName.family && fatherName.family[0]
  body.fatherFirstNamesLocal =
    fatherNameLocal && fatherNameLocal.given && fatherNameLocal.given.join(' ')
  body.fatherFamilyNameLocal =
    fatherNameLocal && fatherNameLocal.family && fatherNameLocal.family[0]
}

function createSpouseIndex(
  body: IDeathCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const spouse = findEntry(
    SPOUSE_CODE,
    composition,
    bundleEntries
  ) as fhir.Patient

  if (!spouse) {
    return
  }

  const spouseName = findName(NAME_EN, spouse.name)
  const spouseNameLocal = findNameLocale(spouse.name)

  body.spouseFirstNames =
    spouseName && spouseName.given && spouseName.given.join(' ')
  body.spouseFamilyName =
    spouseName && spouseName.family && spouseName.family[0]
  body.spouseFirstNamesLocal =
    spouseNameLocal && spouseNameLocal.given && spouseNameLocal.given.join(' ')
  body.spouseFamilyNameLocal =
    spouseNameLocal && spouseNameLocal.family && spouseNameLocal.family[0]
}

function createInformantIndex(
  body: IDeathCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const informantRef = findEntry(
    INFORMANT_CODE,
    composition,
    bundleEntries
  ) as fhir.RelatedPerson

  if (!informantRef || !informantRef.patient) {
    return
  }

  const informant = findEntryResourceByUrl(
    informantRef.patient.reference,
    bundleEntries
  ) as fhir.Patient

  if (!informant) {
    return
  }

  const informantName = findName(NAME_EN, informant.name)
  const informantNameLocal = findNameLocale(informant.name)

  body.informantFirstNames =
    informantName && informantName.given && informantName.given.join(' ')
  body.informantFamilyName =
    informantName && informantName.family && informantName.family[0]
  body.informantFirstNamesLocal =
    informantNameLocal &&
    informantNameLocal.given &&
    informantNameLocal.given.join(' ')
  body.informantFamilyNameLocal =
    informantNameLocal &&
    informantNameLocal.family &&
    informantNameLocal.family[0]
  body.informantDoB = informant.birthDate
  body.informantIdentifier =
    informant.identifier &&
    informant.identifier.find(
      (identifier) => identifier.type?.coding?.[0].code === 'NATIONAL_ID'
    )?.value
}

async function createDeclarationIndex(
  body: IDeathCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const task = findTask(bundleEntries)
  const contactPersonExtention = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/contact-person'
  )
  const contactPersonRelationshipExtention = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/contact-relationship'
  )
  const contactNumberExtension = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/contact-person-phone-number'
  )
  const emailExtension = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/contact-person-email'
  )
  const placeOfDeclarationExtension = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastOffice'
  )

  const trackingIdIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/death-tracking-id'
  )
  const registrationNumberIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/death-registration-number'
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
      (code) => code.system === 'http://opencrvs.org/doc-types'
    )

  body.contactRelationship =
    (contactPersonRelationshipExtention &&
      contactPersonRelationshipExtention.valueString) ||
    (contactPersonExtention && contactPersonExtention.valueString)
  body.contactNumber =
    contactNumberExtension && contactNumberExtension.valueString
  body.contactEmail = emailExtension && emailExtension.valueString
  body.type =
    task &&
    task.businessStatus &&
    task.businessStatus.coding &&
    task.businessStatus.coding[0].code
  body.dateOfDeclaration = task && task.lastModified
  body.trackingId = trackingIdIdentifier && trackingIdIdentifier.value
  body.registrationNumber =
    registrationNumberIdentifier && registrationNumberIdentifier.value
  body.declarationLocationId =
    placeOfDeclarationExtension &&
    placeOfDeclarationExtension.valueReference &&
    placeOfDeclarationExtension.valueReference.reference &&
    placeOfDeclarationExtension.valueReference.reference.split('/')[1]
  body.declarationJurisdictionIds = await getdeclarationJurisdictionIds(
    body.declarationLocationId
  )

  body.compositionType =
    (compositionTypeCode && compositionTypeCode.code) || 'death-declaration'

  const createdBy = await getCreatedBy(composition.id as string)

  body.createdBy = createdBy || regLastUser
  body.updatedBy = regLastUser
}
