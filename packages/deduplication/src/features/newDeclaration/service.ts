import {
  findEntry,
  findName,
  updateInHearth,
  getCompositionByIdentifier,
  addDuplicatesToComposition
} from 'src/features/fhir/fhir-utils'
import { logger } from 'src/logger'
import { ICompositionBody, detectDuplicates } from 'src/elasticsearch/utils'
import { indexComposition } from 'src/elasticsearch/dbhelper'

const MOTHER_CODE = 'mother-details'
const FATHER_CODE = 'father-details'
const CHILD_CODE = 'child-details'
const NAME_EN = 'en'
const NAME_BN = 'bn'

export async function insertNewDeclaration(bundle: fhir.Bundle) {
  const bundleEntries = bundle.entry
  const composition = (bundleEntries &&
    bundleEntries[0].resource) as fhir.Composition
  const compositionIdentifier =
    composition.identifier && composition.identifier.value

  if (!compositionIdentifier) {
    throw new Error(`Composition Identifier not found`)
  }

  indexAndSearchComposition(compositionIdentifier, composition, bundleEntries)
}

export async function insertUpdatedDeclaration(bundle: fhir.Bundle) {
  const bundleEntries = bundle.entry

  if (bundleEntries && bundleEntries.length === 1) {
    const resource = bundleEntries[0].resource
    if (resource && resource.resourceType === 'Task') {
      logger.info(`Composition not updated, skipping`)
      return
    }
  }

  const composition = (bundleEntries &&
    bundleEntries[0].resource) as fhir.Composition
  const compositionIdentifier =
    composition.identifier && composition.identifier.value

  if (!compositionIdentifier) {
    throw new Error(`Composition Identifier not found`)
  }

  indexAndSearchComposition(compositionIdentifier, composition, bundleEntries)
}

async function indexAndSearchComposition(
  compositionIdentifier: string,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const body: ICompositionBody = {}
  createIndexBody(body, composition, bundleEntries)
  await indexComposition(compositionIdentifier, body)
  await detectAndUpdateDuplicates(compositionIdentifier, composition, body)
}

function createIndexBody(
  body: ICompositionBody,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  createChildIndex(body, composition, bundleEntries)
  createMotherIndex(body, composition, bundleEntries)
  createFatherIndex(body, composition, bundleEntries)
}
function createChildIndex(
  body: ICompositionBody,
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
  body: ICompositionBody,
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
  body.motherIdentifier = mother.identifier && mother.identifier[0].id
}

function createFatherIndex(
  body: ICompositionBody,
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
  body.fatherIdentifier = father.identifier && father.identifier[0].id
}

async function detectAndUpdateDuplicates(
  compositionIdentifier: string,
  composition: fhir.Composition,
  body: ICompositionBody
) {
  const duplicates = await detectDuplicates(compositionIdentifier, body)
  if (!duplicates.length) {
    return
  }
  logger.info(
    `Deduplication/service: ${duplicates.length} duplicate composition(s) found`
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
  addDuplicatesToComposition(duplicates, composition)

  return updateInHearth(composition, composition.id)
}
