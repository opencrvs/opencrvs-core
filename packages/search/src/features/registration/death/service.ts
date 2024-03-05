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
  createStatusHistory,
  EVENT,
  getCreatedBy,
  getStatus,
  ICompositionBody,
  IDeathCompositionBody,
  IOperationHistory,
  NAME_EN,
  REJECTED_STATUS
} from '@search/elasticsearch/utils'
import {
  addEventLocation,
  findEntry,
  findName,
  findNameLocale,
  findTaskExtension,
  findTaskIdentifier,
  getdeclarationJurisdictionIds,
  updateCompositionBodyWithDuplicateIds
} from '@search/features/fhir/fhir-utils'
import * as Hapi from '@hapi/hapi'
import { client } from '@search/elasticsearch/client'
import { getSubmittedIdentifier } from '@search/features/search/utils'
import {
  getComposition,
  SavedComposition,
  ValidRecord,
  getFromBundleById,
  getTaskFromSavedBundle,
  Patient,
  SavedBundle,
  SavedRelatedPerson,
  resourceIdentifierToUUID
} from '@opencrvs/commons/types'

const DECEASED_CODE = 'deceased-details'
const INFORMANT_CODE = 'informant-details'
const MOTHER_CODE = 'mother-details'
const FATHER_CODE = 'father-details'
const SPOUSE_CODE = 'spouse-details'
const DEATH_ENCOUNTER_CODE = 'death-encounter'

export async function upsertEvent(requestBundle: Hapi.Request) {
  const bundle = requestBundle.payload as ValidRecord
  const authHeader = requestBundle.headers.authorization

  const composition = getComposition(bundle)

  await indexDeclaration(composition, authHeader, bundle)
}

async function indexDeclaration(
  composition: SavedComposition,
  authHeader: string,
  bundle: SavedBundle
) {
  const compositionId = composition.id
  const result = await searchByCompositionId(compositionId, client)
  const task = getTaskFromSavedBundle(bundle)

  const body: ICompositionBody = {
    event: EVENT.DEATH,
    createdAt:
      (result &&
        result.body.hits.hits.length > 0 &&
        result.body.hits.hits[0]._source.createdAt) ||
      Date.now().toString(),
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
    body.rejectReason =
      (task && task.statusReason && task.statusReason.text) || ''
    body.rejectComment = nodeText
  }

  await createIndexBody(body, composition, authHeader, bundle)
  updateCompositionBodyWithDuplicateIds(composition, body)
  await indexComposition(compositionId, body, client)
}

async function createIndexBody(
  body: IDeathCompositionBody,
  composition: SavedComposition,
  authHeader: string,
  bundle: SavedBundle
) {
  await createDeceasedIndex(body, composition, bundle)
  createFatherIndex(body, composition, bundle)
  createMotherIndex(body, composition, bundle)
  createSpouseIndex(body, composition, bundle)
  createInformantIndex(body, composition, bundle)
  await createDeclarationIndex(body, composition, bundle)
  const task = getTaskFromSavedBundle(bundle)
  await createStatusHistory(body, task, authHeader, bundle)
}

async function createDeceasedIndex(
  body: IDeathCompositionBody,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const deceased = findEntry<Patient>(DECEASED_CODE, composition, bundle)

  if (!deceased) {
    return
  }

  await addEventLocation(body, DEATH_ENCOUNTER_CODE, composition)

  const deceasedName = findName(NAME_EN, deceased.name)
  const deceasedNameLocal = findNameLocale(deceased.name)

  body.deceasedFirstNames = deceasedName?.given?.at(0)
  body.deceasedMiddleName = deceasedName?.given?.at(1)
  body.deceasedFamilyName =
    deceasedName && deceasedName.family && deceasedName.family[0]
  body.deceasedFirstNamesLocal = deceasedNameLocal?.given?.at(0)
  body.deceasedMiddleNameLocal = deceasedNameLocal?.given?.at(1)
  body.deceasedFamilyNameLocal =
    deceasedNameLocal && deceasedNameLocal.family && deceasedNameLocal.family[0]
  body.deathDate = deceased.deceasedDateTime
  body.gender = deceased.gender
  body.deceasedIdentifier =
    deceased.identifier && getSubmittedIdentifier(deceased.identifier)
  body.deceasedDoB = deceased.birthDate
}

function createMotherIndex(
  body: IDeathCompositionBody,
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
  body.motherFamilyName =
    motherName && motherName.family && motherName.family[0]
  body.motherFirstNamesLocal = motherNameLocal?.given?.at(0)
  body.motherMiddleNameLocal = motherNameLocal?.given?.at(1)
  body.motherFamilyNameLocal =
    motherNameLocal && motherNameLocal.family && motherNameLocal.family[0]
}

function createFatherIndex(
  body: IDeathCompositionBody,
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
  body.fatherFamilyName =
    fatherName && fatherName.family && fatherName.family[0]
  body.fatherFirstNamesLocal = fatherNameLocal?.given?.at(0)
  body.fatherMiddleNameLocal = fatherNameLocal?.given?.at(1)
  body.fatherFamilyNameLocal =
    fatherNameLocal && fatherNameLocal.family && fatherNameLocal.family[0]
}

function createSpouseIndex(
  body: IDeathCompositionBody,
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
  body.spouseFamilyName =
    spouseName && spouseName.family && spouseName.family[0]
  body.spouseFirstNamesLocal = spouseNameLocal?.given?.at(0)
  body.spouseMiddleNameLocal = spouseNameLocal?.given?.at(1)
  body.spouseFamilyNameLocal =
    spouseNameLocal && spouseNameLocal.family && spouseNameLocal.family[0]
}

function createInformantIndex(
  body: IDeathCompositionBody,
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
  body.informantFamilyName =
    informantName && informantName.family && informantName.family[0]
  body.informantFirstNamesLocal = informantNameLocal?.given?.at(0)
  body.informantMiddleNameLocal = informantNameLocal?.given?.at(1)
  body.informantFamilyNameLocal =
    informantNameLocal &&
    informantNameLocal.family &&
    informantNameLocal.family[0]
  body.informantDoB = informant.birthDate
  body.informantIdentifier =
    informant.identifier && getSubmittedIdentifier(informant.identifier)
}

async function createDeclarationIndex(
  body: IDeathCompositionBody,
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

  body.informantType =
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
