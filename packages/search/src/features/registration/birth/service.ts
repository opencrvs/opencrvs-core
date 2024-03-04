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
  IBirthCompositionBody,
  NAME_EN,
  IOperationHistory,
  REJECTED_STATUS
} from '@search/elasticsearch/utils'
import {
  findEntry,
  findName,
  findNameLocale,
  findTaskExtension,
  findTaskIdentifier,
  addEventLocation,
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
  SavedBundle,
  Patient,
  getFromBundleById,
  getTaskFromSavedBundle,
  SavedTask,
  resourceIdentifierToUUID,
  SavedRelatedPerson
} from '@opencrvs/commons/types'

const MOTHER_CODE = 'mother-details'
const FATHER_CODE = 'father-details'
const INFORMANT_CODE = 'informant-details'
const CHILD_CODE = 'child-details'
const BIRTH_ENCOUNTER_CODE = 'birth-encounter'

function getTypeFromTask(task: SavedTask) {
  return task?.businessStatus?.coding?.[0]?.code
}

export async function upsertEvent(requestBundle: Hapi.Request) {
  const bundle = requestBundle.payload as ValidRecord
  const authHeader = requestBundle.headers.authorization

  await indexAndSearchComposition(getComposition(bundle), authHeader, bundle)
}

async function indexAndSearchComposition(
  composition: SavedComposition,
  authHeader: string,
  bundle: SavedBundle
) {
  const compositionId = composition.id
  const result = await searchByCompositionId(compositionId, client)
  const task = getTaskFromSavedBundle(bundle)

  const body: IBirthCompositionBody = {
    event: EVENT.BIRTH,
    createdAt:
      (result &&
        result.body.hits.hits.length > 0 &&
        result.body.hits.hits[0]._source.createdAt) ||
      Date.now().toString(),
    modifiedAt: Date.now().toString(),
    operationHistories: (await getStatus(compositionId)) as IOperationHistory[]
  }

  body.type = getTypeFromTask(task)
  body.modifiedAt = Date.now().toString()

  if (body.type === REJECTED_STATUS) {
    const rejectAnnotation: fhir.Annotation = (task &&
      task.note &&
      Array.isArray(task.note) &&
      task.note.length > 0 &&
      task.note[task.note.length - 1]) || { text: '' }
    const nodeText = rejectAnnotation.text
    body.rejectReason =
      (task && task.statusReason && task.statusReason.text) || ''
    body.rejectComment = nodeText
  }

  const regLastUserIdentifier = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastUser'
  )

  body.updatedBy =
    regLastUserIdentifier &&
    regLastUserIdentifier.valueReference &&
    regLastUserIdentifier.valueReference.reference &&
    regLastUserIdentifier.valueReference.reference.split('/')[1]

  await createIndexBody(body, composition, authHeader, bundle)
  updateCompositionBodyWithDuplicateIds(composition, body)
  await indexComposition(compositionId, body, client)
}

async function createIndexBody(
  body: IBirthCompositionBody,
  composition: SavedComposition,
  authHeader: string,
  bundle: SavedBundle
) {
  await createChildIndex(body, composition, bundle)
  createMotherIndex(body, composition, bundle)
  createFatherIndex(body, composition, bundle)
  createInformantIndex(body, composition, bundle)
  await createDeclarationIndex(body, composition, bundle)
  const task = getTaskFromSavedBundle(bundle)
  await createStatusHistory(body, task, authHeader, bundle)
}

async function createChildIndex(
  body: IBirthCompositionBody,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const child = findEntry<Patient>(CHILD_CODE, composition, bundle)

  if (!child) {
    return
  }

  await addEventLocation(body, BIRTH_ENCOUNTER_CODE, composition)

  const childName = findName(NAME_EN, child.name)
  const childNameLocal = findNameLocale(child.name)

  body.childIdentifier =
    child.identifier && getSubmittedIdentifier(child.identifier)
  body.childFirstNames = childName?.given?.at(0)
  body.childMiddleName = childName?.given?.at(1)
  body.childFamilyName = childName && childName.family && childName.family[0]
  body.childFirstNamesLocal = childNameLocal?.given?.at(0)
  body.childMiddleNameLocal = childNameLocal?.given?.at(1)
  body.childFamilyNameLocal =
    childNameLocal && childNameLocal.family && childNameLocal.family[0]
  body.childDoB = child.birthDate
  body.gender = child.gender
}

function createMotherIndex(
  body: IBirthCompositionBody,
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
  body.motherDoB = mother.birthDate
  body.motherIdentifier =
    mother.identifier && getSubmittedIdentifier(mother.identifier)
}

function createFatherIndex(
  body: IBirthCompositionBody,
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
  body.fatherDoB = father.birthDate
  body.fatherIdentifier =
    father.identifier && getSubmittedIdentifier(father.identifier)
}

function createInformantIndex(
  body: IBirthCompositionBody,
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
  body: IBirthCompositionBody,
  composition: SavedComposition,
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
      (code) => code.system === 'http://opencrvs.org/doc-types'
    )

  body.informantType =
    (contactPersonRelationshipExtention &&
      contactPersonRelationshipExtention.valueString) ||
    (contactPersonExtention && contactPersonExtention.valueString)
  body.contactNumber =
    contactNumberExtension && contactNumberExtension.valueString
  body.contactEmail = emailExtension && emailExtension.valueString
  body.type = task && getTypeFromTask(task)
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
    (compositionTypeCode && compositionTypeCode.code) || 'birth-declaration'

  const createdBy = await getCreatedBy(composition.id || '')

  body.createdBy = createdBy || regLastUser
  body.updatedBy = regLastUser
}
