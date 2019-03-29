import {
  findEntry,
  findName,
  updateInHearth,
  getCompositionByIdentifier,
  addDuplicatesToComposition,
  findTask,
  findTaskExtension,
  findTaskIdentifier
} from 'src/features/fhir/fhir-utils'
import { logger } from 'src/logger'
import {
  IBirthCompositionBody,
  detectDuplicates,
  EVENT,
  ICompositionBody
} from 'src/elasticsearch/utils'
import { indexComposition, updateComposition } from 'src/elasticsearch/dbhelper'

const MOTHER_CODE = 'mother-details'
const FATHER_CODE = 'father-details'
const CHILD_CODE = 'child-details'
const NAME_EN = 'en'
const NAME_BN = 'bn'

export async function upsertEvent(bundle: fhir.Bundle) {
  const bundleEntries = bundle.entry

  if (bundleEntries && bundleEntries.length === 1) {
    const resource = bundleEntries[0].resource
    if (resource && resource.resourceType === 'Task') {
      updateEvent(resource as fhir.Task)
      return
    }
  }

  const composition = (bundleEntries &&
    bundleEntries[0].resource) as fhir.Composition
  if (!composition) {
    throw new Error('Composition not found')
  }

  const task = findTask(bundleEntries)
  const trackingIdIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/birth-tracking-id'
  )
  const compositionIdentifier =
    trackingIdIdentifier && trackingIdIdentifier.value

  if (!compositionIdentifier) {
    throw new Error(`Composition Identifier not found`)
  }

  indexAndSearchComposition(compositionIdentifier, composition, bundleEntries)
}

async function updateEvent(task: fhir.Task) {
  const trackingIdIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/birth-tracking-id'
  )
  const trackingId = trackingIdIdentifier && trackingIdIdentifier.value

  if (!trackingId) {
    throw new Error('Tracking ID not found')
  }

  const body: ICompositionBody = {}
  body.type =
    task &&
    task.businessStatus &&
    task.businessStatus.coding &&
    task.businessStatus.coding[0].code
  const nodeText =
    task && task.note && task.note[0].text && task.note[0].text.split('&')
  body.rejectReason = nodeText && nodeText[0] && nodeText[0].split('=')[1]
  body.rejectComment = nodeText && nodeText[1] && nodeText[1].split('=')[1]

  await updateComposition(trackingId, body)
}

async function indexAndSearchComposition(
  compositionIdentifier: string,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const body: IBirthCompositionBody = { event: EVENT.BIRTH }

  createIndexBody(body, composition, bundleEntries)
  await indexComposition(compositionIdentifier, body)

  await detectAndUpdateDuplicates(compositionIdentifier, composition, body)
}

function createIndexBody(
  body: IBirthCompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  createChildIndex(body, composition, bundleEntries)
  createMotherIndex(body, composition, bundleEntries)
  createFatherIndex(body, composition, bundleEntries)
  createApplicationIndex(body, bundleEntries)
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

  const childName = child && findName(NAME_EN, child)
  const childNameLocal = child && findName(NAME_BN, child)

  body.childFirstNames =
    childName && childName.given && childName.given.join(' ')
  body.childFamilyName = childName && childName.family && childName.family[0]
  body.childFirstNamesLocal =
    childNameLocal && childNameLocal.given && childNameLocal.given.join(' ')
  body.childFamilyNameLocal =
    childNameLocal && childNameLocal.family && childNameLocal.family[0]
  body.childDoB = child.birthDate
  body.gender = child.gender
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
  body.motherIdentifier = mother.identifier && mother.identifier[0].value
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
  body.fatherIdentifier = father.identifier && father.identifier[0].value
}

function createApplicationIndex(
  body: IBirthCompositionBody,
  bundleEntries?: fhir.BundleEntry[]
) {
  const task = findTask(bundleEntries)
  const contactNumberExtension = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/contact-person-phone-number'
  )
  const placeOfApplicationExtension = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastLocation'
  )

  const trackingIdIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/birth-tracking-id'
  )
  const registrationNumberIdentifier = findTaskIdentifier(
    task,
    'http://opencrvs.org/specs/id/birth-registration-number'
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
    placeOfApplicationExtension.valueReference.reference
}

async function detectAndUpdateDuplicates(
  compositionIdentifier: string,
  composition: fhir.Composition,
  body: IBirthCompositionBody
) {
  const duplicates = await detectDuplicates(compositionIdentifier, body)
  if (!duplicates.length) {
    return
  }
  logger.info(
    `Search/service: ${duplicates.length} duplicate composition(s) found`
  )

  if (composition.id) {
    return await updateCompositionWithDuplicates(composition, duplicates)
  }
  const compositionWithId = await getCompositionByIdentifier(
    compositionIdentifier
  )
  return await updateCompositionWithDuplicates(compositionWithId, duplicates)
}

async function updateCompositionWithDuplicates(
  composition: fhir.Composition,
  duplicates: string[]
) {
  const duplicateCompositions = await Promise.all(
    duplicates.map(duplicate => getCompositionByIdentifier(duplicate))
  )

  const duplicateCompositionIds = duplicateCompositions.map(
    dupComposition => dupComposition.id
  )

  addDuplicatesToComposition(duplicateCompositionIds, composition)

  return updateInHearth(composition, composition.id)
}
