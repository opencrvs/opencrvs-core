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
  searchByCompositionId
} from '@search/elasticsearch/dbhelper'
import {
  composeOperationHistories,
  createStatusHistory,
  DeathDocument,
  NAME_EN,
  composeAssignment
} from '@search/elasticsearch/utils'
import {
  addEventLocation,
  findEntry,
  findName,
  findNameLocale,
  findTaskExtension,
  findTaskIdentifier,
  updateCompositionBodyWithDuplicateIds
} from '@search/features/fhir/fhir-utils'
import { getOrCreateClient } from '@search/elasticsearch/client'
import {
  getComposition,
  SavedComposition,
  getFromBundleById,
  getTaskFromSavedBundle,
  Patient,
  SavedBundle,
  SavedRelatedPerson,
  resourceIdentifierToUUID,
  findFirstTaskHistory,
  getInformantType,
  ValidRecord,
  REJECTED_STATUS,
  IOperationHistory,
  EVENT,
  getLastStatusChangedAt
} from '@opencrvs/commons/types'
import { findAssignment } from '@opencrvs/commons/assignment'
import { findPatientPrimaryIdentifier } from '@search/features/search/utils'

const DECEASED_CODE = 'deceased-details'
const INFORMANT_CODE = 'informant-details'
const MOTHER_CODE = 'mother-details'
const FATHER_CODE = 'father-details'
const SPOUSE_CODE = 'spouse-details'
const DEATH_ENCOUNTER_CODE = 'death-encounter'

export const composeDocument = (
  bundle: SavedBundle,
  existingDocument?: Awaited<ReturnType<typeof searchByCompositionId>>
) => {
  const task = getTaskFromSavedBundle(bundle)
  const composition = getComposition(bundle)

  const body: DeathDocument = {
    compositionId: composition.id,
    event: EVENT.DEATH,
    createdAt:
      existingDocument?.body?.hits?.hits?.[0]?._source?.createdAt ||
      Date.now().toString(),
    operationHistories: composeOperationHistories(bundle) as IOperationHistory[]
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
    body.rejectReason =
      (task && task.statusReason && task.statusReason.text) || ''
    body.rejectComment = nodeText
  }

  createIndexBody(body, composition, bundle)
  updateCompositionBodyWithDuplicateIds(composition, body)
  return body
}

export async function indexRecord(record: SavedBundle) {
  const client = getOrCreateClient()

  const composition = getComposition(record)
  const compositionId = composition.id
  const result = await searchByCompositionId(compositionId, client)
  const body = composeDocument(record, result)
  await indexComposition(compositionId, body, client)
}

function createIndexBody(
  body: DeathDocument,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  createDeceasedIndex(body, composition, bundle)
  addEventLocation(bundle, body, DEATH_ENCOUNTER_CODE)
  createFatherIndex(body, composition, bundle)
  createMotherIndex(body, composition, bundle)
  createSpouseIndex(body, composition, bundle)
  createInformantIndex(body, composition, bundle)
  createDeclarationIndex(body, composition, bundle)
  const task = getTaskFromSavedBundle(bundle)
  createStatusHistory(body, task)

  const assignment = findAssignment(bundle)
  body.assignment =
    assignment && composeAssignment(assignment.office, assignment.practitioner)
}

function createDeceasedIndex(
  body: DeathDocument,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const deceased = findEntry<Patient>(DECEASED_CODE, composition, bundle)

  if (!deceased) {
    return
  }

  const deceasedName = findName(NAME_EN, deceased.name)
  const deceasedNameLocal = findNameLocale(deceased.name)

  body.deceasedFirstNames = deceasedName?.given?.at(0)
  body.deceasedMiddleName = deceasedName?.given?.at(1)
  body.deceasedFamilyName = deceasedName?.family
  body.deceasedFirstNamesLocal = deceasedNameLocal?.given?.at(0)
  body.deceasedMiddleNameLocal = deceasedNameLocal?.given?.at(1)
  body.deceasedFamilyNameLocal = deceasedNameLocal?.family
  body.deathDate = deceased.deceasedDateTime
  body.gender = deceased.gender
  body.deceasedIdentifier = findPatientPrimaryIdentifier(deceased)?.value
  body.deceasedDoB = deceased.birthDate
  // what happens if country demands name like : familyName firstName
  body.name =
    (body.deceasedFirstNames || '') +
    ' ' +
    (body.deceasedMiddleName || '') +
    ' ' +
    (body.deceasedFamilyName || '')
}

function createMotherIndex(
  body: DeathDocument,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const mother = findEntry<Patient>(MOTHER_CODE, composition, bundle)

  if (!mother) {
    return
  }

  const motherName = findName(NAME_EN, mother.name)
  const motherNameLocal = findNameLocale(mother.name)

  body.motherFirstNames = motherName?.given?.at(0)
  body.motherMiddleName = motherName?.given?.at(1)
  body.motherFamilyName = motherName?.family
  body.motherFirstNamesLocal = motherNameLocal?.given?.at(0)
  body.motherMiddleNameLocal = motherNameLocal?.given?.at(1)
  body.motherFamilyNameLocal = motherNameLocal?.family
}

function createFatherIndex(
  body: DeathDocument,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const father = findEntry<Patient>(FATHER_CODE, composition, bundle)

  if (!father) {
    return
  }

  const fatherName = findName(NAME_EN, father.name)
  const fatherNameLocal = findNameLocale(father.name)

  body.fatherFirstNames = fatherName?.given?.at(0)
  body.fatherMiddleName = fatherName?.given?.at(1)
  body.fatherFamilyName = fatherName?.family
  body.fatherFirstNamesLocal = fatherNameLocal?.given?.at(0)
  body.fatherMiddleNameLocal = fatherNameLocal?.given?.at(1)
  body.fatherFamilyNameLocal = fatherNameLocal?.family
}

function createSpouseIndex(
  body: DeathDocument,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const spouse = findEntry<Patient>(SPOUSE_CODE, composition, bundle)

  if (!spouse) {
    return
  }

  const spouseName = findName(NAME_EN, spouse.name)
  const spouseNameLocal = findNameLocale(spouse.name)

  body.spouseFirstNames = spouseName?.given?.at(0)
  body.spouseMiddleName = spouseName?.given?.at(1)
  body.spouseFamilyName = spouseName?.family
  body.spouseFirstNamesLocal = spouseNameLocal?.given?.at(0)
  body.spouseMiddleNameLocal = spouseNameLocal?.given?.at(1)
  body.spouseFamilyNameLocal = spouseNameLocal?.family
  body.spouseIdentifier = findPatientPrimaryIdentifier(spouse)?.value
}

function createInformantIndex(
  body: DeathDocument,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const informantRef = findEntry<SavedRelatedPerson>(
    INFORMANT_CODE,
    composition,
    bundle
  )

  if (!informantRef || !informantRef.patient) {
    return
  }

  const informant = getFromBundleById<Patient>(
    bundle,
    resourceIdentifierToUUID(informantRef.patient.reference)
  )?.resource

  if (!informant) {
    return
  }

  const informantName = findName(NAME_EN, informant.name)
  const informantNameLocal = findNameLocale(informant.name)

  body.informantFirstNames = informantName?.given?.at(0)
  body.informantMiddleName = informantName?.given?.at(1)
  body.informantFamilyName = informantName?.family
  body.informantFirstNamesLocal = informantNameLocal?.given?.at(0)
  body.informantMiddleNameLocal = informantNameLocal?.given?.at(1)
  body.informantFamilyNameLocal = informantNameLocal?.family
  body.informantDoB = informant.birthDate
  body.informantIdentifier = findPatientPrimaryIdentifier(informant)?.value
}

function createDeclarationIndex(
  body: DeathDocument,
  composition: fhir.Composition,
  bundle: SavedBundle
) {
  const task = getTaskFromSavedBundle(bundle)
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

  const otherInformantType =
    (contactPersonRelationshipExtention &&
      contactPersonRelationshipExtention.valueString) ||
    (contactPersonExtention && contactPersonExtention.valueString)

  const informantType = getInformantType(bundle as ValidRecord)

  body.informantType = informantType || otherInformantType
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
  body.declarationJurisdictionIds = body.declarationLocationId
    ? [body.declarationLocationId]
    : []

  body.compositionType =
    (compositionTypeCode && compositionTypeCode.code) || 'death-declaration'

  const firstTaskHistory = findFirstTaskHistory(bundle)
  body.lastStatusChangedAt = getLastStatusChangedAt(bundle, task)

  const firstRegLastUserExtension =
    firstTaskHistory &&
    findTaskExtension(
      firstTaskHistory,
      'http://opencrvs.org/specs/extension/regLastUser'
    )
  const firstRegLastUser =
    firstRegLastUserExtension &&
    resourceIdentifierToUUID(firstRegLastUserExtension.valueReference.reference)

  body.createdBy = firstRegLastUser || regLastUser
  body.updatedBy = regLastUser
}
