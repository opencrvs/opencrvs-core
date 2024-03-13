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
  IMarriageCompositionBody,
  IOperationHistory,
  NAME_EN,
  REJECTED_STATUS
} from '@search/elasticsearch/utils'
import {
  findEntry,
  findName,
  findNameLocale,
  findTaskExtension,
  findTaskIdentifier,
  getdeclarationJurisdictionIds,
  addEventLocation,
  findExtension
} from '@search/features/fhir/fhir-utils'
import * as Hapi from '@hapi/hapi'
import { OPENCRVS_SPECIFICATION_URL } from '@search/constants'
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
  resourceIdentifierToUUID,
  SavedRelatedPerson
} from '@opencrvs/commons/types'

const BRIDE_CODE = 'bride-details'
const GROOM_CODE = 'groom-details'
const WITNESS_ONE_CODE = 'witness-one-details'
const WITNESS_TWO_CODE = 'witness-two-details'
const MARRIAGE_ENCOUNTER_CODE = 'marriage-encounter'

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
    event: EVENT.MARRIAGE,
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
  await indexComposition(compositionId, body, client)
}

async function createIndexBody(
  body: IMarriageCompositionBody,
  composition: SavedComposition,
  authHeader: string,
  bundle: SavedBundle
) {
  await createBrideIndex(body, composition, bundle)
  await createGroomIndex(body, composition, bundle)
  createWitnessOneIndex(body, composition, bundle)
  createWitnessTwoIndex(body, composition, bundle)
  await createDeclarationIndex(body, composition, bundle)
  const task = getTaskFromSavedBundle(bundle)
  await createStatusHistory(body, task, authHeader, bundle)
}

async function createBrideIndex(
  body: IMarriageCompositionBody,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const bride = findEntry<Patient>(BRIDE_CODE, composition, bundle)

  await addEventLocation(body, MARRIAGE_ENCOUNTER_CODE, composition)

  const marriageExtension = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/date-of-marriage`,
    bride?.extension
  )

  const brideName = bride && findName(NAME_EN, bride.name)
  const brideNameLocal = bride && findNameLocale(bride.name)

  body.brideFirstNames = brideName?.given?.at(0)
  body.brideMiddleName = brideName?.given?.at(1)
  body.brideFamilyName = brideName && brideName.family && brideName.family[0]
  body.brideFirstNamesLocal = brideNameLocal?.given?.at(0)
  body.brideMiddleNameLocal = brideNameLocal?.given?.at(1)
  body.brideFamilyNameLocal =
    brideNameLocal && brideNameLocal.family && brideNameLocal.family[0]
  if (marriageExtension) {
    body.marriageDate = marriageExtension.valueDateTime
  }

  body.brideIdentifier =
    bride && bride.identifier && getSubmittedIdentifier(bride.identifier)
  body.brideDoB = bride && bride.birthDate
}

async function createGroomIndex(
  body: IMarriageCompositionBody,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const groom = findEntry<Patient>(GROOM_CODE, composition, bundle)

  await addEventLocation(body, MARRIAGE_ENCOUNTER_CODE, composition)

  const marriageExtension = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/date-of-marriage`,
    groom?.extension
  )

  const groomName = groom && findName(NAME_EN, groom.name)
  const groomNameLocal = groom && findNameLocale(groom.name)

  body.groomFirstNames = groomName?.given?.at(0)
  body.groomMiddleName = groomName?.given?.at(1)
  body.groomFamilyName = groomName && groomName.family && groomName.family[0]
  body.groomFirstNamesLocal = groomNameLocal?.given?.at(0)
  body.groomMiddleNameLocal = groomNameLocal?.given?.at(1)
  body.groomFamilyNameLocal =
    groomNameLocal && groomNameLocal.family && groomNameLocal.family[0]

  if (marriageExtension) {
    body.marriageDate = marriageExtension.valueDateTime
  }

  body.groomIdentifier =
    groom && groom.identifier && getSubmittedIdentifier(groom.identifier)
  body.groomDoB = groom && groom.birthDate
}

function createWitnessOneIndex(
  body: IMarriageCompositionBody,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const witnessRef = findEntry<SavedRelatedPerson>(
    WITNESS_ONE_CODE,
    composition,
    bundle
  )

  if (!witnessRef || !witnessRef.patient) {
    return
  }

  const witness = getFromBundleById<Patient>(
    bundle,
    resourceIdentifierToUUID(witnessRef.patient.reference)
  ).resource

  if (!witness) {
    return
  }

  const witnessName = findName(NAME_EN, witness.name)
  const witnessNameLocal = findNameLocale(witness.name)

  body.witnessOneFirstNames = witnessName?.given?.at(0)
  body.witnessOneMiddleName = witnessName?.given?.at(1)
  body.witnessOneFamilyName =
    witnessName && witnessName.family && witnessName.family[0]
  body.witnessOneFirstNamesLocal = witnessNameLocal?.given?.at(0)
  body.witnessOneMiddleNameLocal = witnessNameLocal?.given?.at(1)
  body.witnessOneFamilyNameLocal =
    witnessNameLocal && witnessNameLocal.family && witnessNameLocal.family[0]
}

function createWitnessTwoIndex(
  body: IMarriageCompositionBody,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const witnessRef = findEntry<SavedRelatedPerson>(
    WITNESS_TWO_CODE,
    composition,
    bundle
  )

  if (!witnessRef || !witnessRef.patient) {
    return
  }

  const witness = getFromBundleById<Patient>(
    bundle,
    resourceIdentifierToUUID(witnessRef.patient.reference)
  ).resource

  if (!witness) {
    return
  }

  const witnessName = findName(NAME_EN, witness.name)
  const witnessNameLocal = findNameLocale(witness.name)
  body.witnessTwoFirstNames = witnessName?.given?.at(0)
  body.witnessTwoMiddleName = witnessName?.given?.at(1)
  body.witnessTwoFamilyName =
    witnessName && witnessName.family && witnessName.family[0]
  body.witnessTwoFirstNamesLocal = witnessNameLocal?.given?.at(0)
  body.witnessTwoMiddleNameLocal = witnessNameLocal?.given?.at(1)
  body.witnessTwoFamilyNameLocal =
    witnessNameLocal && witnessNameLocal.family && witnessNameLocal.family[0]
}

async function createDeclarationIndex(
  body: IMarriageCompositionBody,
  composition: fhir.Composition,
  bundleEntries: SavedBundle
) {
  const task = getTaskFromSavedBundle(bundleEntries)
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
    'http://opencrvs.org/specs/id/marriage-tracking-id'
  )
  const registrationNumberIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/marriage-registration-number'
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
    (compositionTypeCode && compositionTypeCode.code) || 'marriage-declaration'

  const createdBy = await getCreatedBy(composition.id as string)

  body.createdBy = createdBy || regLastUser
  body.updatedBy = regLastUser
}
