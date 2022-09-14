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
import { Cursor, MongoClient } from 'mongodb'
import { createObjectCsvWriter as createCSV } from 'csv-writer'

const HEARTH_MONGO_URL = process.env.HEARTH_MONGO_URL || 'mongodb://localhost'
const DB_NAME = 'hearth-dev'
const client = new MongoClient(HEARTH_MONGO_URL)
const officeLocationExtURL = 'http://opencrvs.org/specs/extension/regLastOffice'
const patientOccupationExtURL =
  'http://opencrvs.org/specs/extension/patient-occupation'
const patientEduAttainmentExtURL =
  'http://opencrvs.org/specs/extension/educational-attainment'

type IPatient = ReturnType<typeof makePatientsObject>

type IObservation = {
  causeOfDeathMethod: string
  birthPluralityOfPregnancy: string
  bodyWeightMeasured: string
  birthAttendantTitle: string
  uncertifiedMannerOfDeath: string
  verbalAutopsyDescription: string
  causeOfDeathEstablished: string
  causeOfDeath: string
  numMaleDependentsOnDeceased: string
  numFemaleDependentsOnDeceased: string
  presentAtBirthReg: string
}

interface IInformant extends IPatient {
  relationship: string
}

const TITLE_MAP = {
  'Child details': 'child',
  'Deceased details': 'deceased',
  [`Mother's details`]: 'mother',
  [`Father's details`]: 'father',
  [`Informant's details`]: 'informant'
}

type IBirthRow = {
  childGen: string
  childDOB: string
  childOrd: number
  birthCity: string
  birthState: string
  birthDistrict: string
  healthCenter: string
  officeLocation: string
  birthPluralityOfPregnancy: string
  bodyWeightMeasured: string
  birthAttendantTitle: string
  presentAtBirthReg: string
  motherDOB: string
  motherMaritalStatus: string
  motherOccupation: string
  motherEducationalAttainment: string
  motherCity: string
  motherDistrict: string
  motherState: string
  fatherDOB: string
  fatherMaritalStatus: string
  fatherOccupation: string
  fatherEducationalAttainment: string
  fatherCity: string
  fatherDistrict: string
  fatherState: string
  informantDOB: string
  informantMaritalStatus: string
  informantOccupation: string
  informantEducationalAttainment: string
  informantCity: string
  informantDistrict: string
  informantState: string
  informantRelationship: string
}

type IDeathRow = {
  deceasedGen: string
  deceasedDOB: string
  deceasedMaritalStatus: string
  deceasedDate: string
  deathCity: string
  deathState: string
  deathDistrict: string
  healthCenter: string
  officeLocation: string
  uncertifiedMannerOfDeath: string
  verbalAutopsyDescription: string
  causeOfDeathMethod: string
  causeOfDeathEstablished: string
  causeOfDeath: string
  numMaleDependentsOnDeceased: string
  numFemaleDependentsOnDeceased: string
  informantDOB: string
  informantMaritalStatus: string
  informantOccupation: string
  informantCity: string
  informantDistrict: string
  informantState: string
  informantRelationship: string
}

interface IFullComposition {
  event: 'Birth' | 'Death'
  deceased: IPatient
  child: IPatient
  father: IPatient
  mother: IPatient
  informant: IInformant
  observations: IObservation
  officeLocation: string
  healthCenter: string
  eventDistrict: string
  eventState: string
  eventCity: string
}

const COLLECTION_NAMES = {
  COMPOSITION: 'Composition',
  ENCOUNTER: 'Encounter',
  LOCATION: 'Location',
  OBSERVATION: 'Observation',
  PATIENT: 'Patient',
  RELATEDPERSON: 'RelatedPerson',
  TASK: 'Task'
}

const OBSERVATION_CODE = {
  CAUSE_OF_DEATH_METHOD: 'cause-of-death-method',
  BIRTH_PLURALITY_OF_PREGNANCY: '57722-1',
  BODY_WEIGHT_MEASURED: '3141-9',
  BIRTH_ATTENDANT_TITLE: '73764-3',
  CAUSE_OF_DEATH: 'ICD10',
  UNCERTIFIED_MANNER_OF_DEATH: 'uncertified-manner-of-death',
  VERBAL_AUTOPSY_DESCRIPTION: 'lay-reported-or-verbal-autopsy-description',
  CAUSE_OF_DEATH_ESTABLISHED: 'cause-of-death-established',
  NUM_MALE_DEPENDENTS_ON_DECEASED: 'num-male-dependents-on-deceased',
  NUM_FEMALE_DEPENDENTS_ON_DECEASED: 'num-female-dependents-on-deceased',
  PRESENT_AT_BIRTH_REG: 'present-at-birth-reg'
}

const connect = async () => {
  try {
    await client.connect()
    // tslint:disable-next-line
    console.log('Connected to mongoDB')
  } catch (err) {
    // tslint:disable-next-line
    console.log('Error occured while connecting to mongoDB', err)
  }
}

async function getCompositionCursor() {
  const db = client.db(DB_NAME)
  return db
    .collection(COLLECTION_NAMES.COMPOSITION)
    .find({
      date: { $gt: process.argv[2], $lt: process.argv[3] }
    })
    .project({ id: 1, title: 1, section: 1, date: 1, _id: 0 })
}

async function getCollectionDocuments(collectionName: string, ids: string[]) {
  const db = client.db(DB_NAME)
  if (ids.length > 0) {
    return db
      .collection(collectionName)
      .find({
        id: { $in: ids }
      })
      .toArray()
  } else {
    return db.collection(collectionName).find().toArray()
  }
}

async function getObservationDocByEncounterId(encounterId: string) {
  const db = client.db(DB_NAME)
  return db
    .collection(COLLECTION_NAMES.OBSERVATION)
    .find({
      'context.reference': encounterId
    })
    .toArray()
}

async function getTaskDocByCompositionId(compositionId: string) {
  const db = client.db(DB_NAME)
  return db
    .collection(COLLECTION_NAMES.TASK)
    .find({
      'focus.reference': compositionId
    })
    .toArray()
}

function findCodeInObservation(observation: fhir.Observation, code: string) {
  return observation.code.coding?.[0].code === code ? observation : undefined
}

function getValueFromExt(doc: fhir.Patient, extURL: string) {
  if (!doc.extension) {
    return ''
  }
  const docExt = doc.extension.find((obj) => obj.url === extURL)
  return docExt ? docExt.valueString : ''
}

function makePatientObject(patient: fhir.Patient) {
  return {
    gender: patient.gender ?? '',
    birthDate: patient.birthDate ?? '',
    deceasedDate: patient.deceasedDateTime ?? '',
    maritalStatus: patient.maritalStatus?.text ?? '',
    multipleBirth: patient.multipleBirthInteger ?? 0,
    occupation: getValueFromExt(patient, patientOccupationExtURL) ?? '',
    educational_attainment:
      getValueFromExt(patient, patientEduAttainmentExtURL) ?? '',
    city: patient.address?.[0].city ?? '',
    district: patient.address?.[0].district ?? '',
    state: patient.address?.[0].state ?? ''
  }
}

async function setPatientsAddress(
  patients: fhir.Patient[],
  locations: fhir.Location[]
) {
  patients.forEach(
    (patient: { address: { district: string; state: string }[] }) => {
      if (patient.address) {
        if (patient.address[0].district) {
          const districtAddress = locations.find(
            ({ id }) => id === patient.address[0].district
          )
          patient.address[0].district = districtAddress?.name ?? ''
        }
        if (patient.address[0].state) {
          const stateAddress = locations.find(
            ({ id }) => id === patient.address[0].state
          )
          patient.address[0].state = stateAddress?.name ?? ''
        }
      }
    }
  )
}

async function setPatientsDetailsInComposition(
  composition: fhir.Composition,
  fullComposition: Partial<IFullComposition>,
  locations: fhir.Location[]
) {
  const patientList = composition.section?.filter((section) =>
    section.entry?.[0].reference?.startsWith('Patient/')
  )
  const patientIds = patientList?.map((patient) =>
    patient.entry?.[0].reference?.replace('Patient/', '')
  ) as string[]
  const patients: fhir.Patient[] = await getCollectionDocuments(
    COLLECTION_NAMES.PATIENT,
    patientIds
  )
  await setPatientsAddress(patients, locations)

  composition.section?.forEach((section) => {
    if (
      typeof section.entry?.[0].reference === 'string' &&
      section.entry[0].reference.startsWith('Patient/')
    ) {
      const patientId = section.entry[0].reference.replace('Patient/', '')
      const patient = patients.find(({ id }) => id === patientId)
      if (patient && section.title) {
        fullComposition[TITLE_MAP[section.title]] = makePatientObject(patient)
      }
    }
  })
}

async function setLocationInComposition(
  composition: fhir.Composition,
  fullComposition: Partial<IFullComposition>,
  locations: fhir.Location[]
) {
  const encounter = composition.section?.find(
    (section) =>
      typeof section.entry?.[0].reference === 'string' &&
      section.entry[0].reference.startsWith('Encounter/')
  )
  const encounterId =
    encounter?.entry?.[0].reference?.replace('Encounter/', '') ?? ''
  const encounterDoc: fhir.Encounter[] = await getCollectionDocuments(
    COLLECTION_NAMES.ENCOUNTER,
    [encounterId]
  )
  const locationId = encounterDoc[0].location?.[0].location.reference?.replace(
    'Location/',
    ''
  )
  const location = locations.find(
    ({ id }) => id === locationId
  ) as fhir.Location

  const districtLocation = locations.find(
    ({ id }) => id === location.address?.district
  )
  const stateLocation = locations.find(
    ({ id }) => id === location.address?.state
  )
  fullComposition['healthCenter'] = location.name ?? ''
  fullComposition['eventDistrict'] = districtLocation?.name ?? ''
  fullComposition['eventState'] = stateLocation?.name ?? ''
  fullComposition['eventCity'] = location.address?.city ?? ''

  const [task] = (await getTaskDocByCompositionId(
    `Composition/${composition.id}`
  )) as [fhir.Task]

  const officeLocationId = task.extension
    ?.find((obj) => obj.url === officeLocationExtURL)
    ?.valueReference?.reference?.replace('Location/', '')

  const officeLocation = locations.find(({ id }) => id === officeLocationId)
  fullComposition['officeLocation'] = officeLocation?.name ?? ''
}

async function setObservationDetailsInComposition(
  composition: fhir.Composition,
  fullComposition: Partial<IFullComposition>
) {
  const encounter = composition.section?.find(
    (section) =>
      typeof section.entry?.[0].reference === 'string' &&
      section.entry[0].reference.startsWith('Encounter/')
  )
  const observations = (await getObservationDocByEncounterId(
    String(encounter?.entry?.[0].reference)
  )) as fhir.Observation[]
  const observationObj: IObservation = {
    causeOfDeathMethod: '',
    birthPluralityOfPregnancy: '',
    bodyWeightMeasured: '',
    birthAttendantTitle: '',
    uncertifiedMannerOfDeath: '',
    verbalAutopsyDescription: '',
    causeOfDeathEstablished: '',
    causeOfDeath: '',
    numMaleDependentsOnDeceased: '',
    numFemaleDependentsOnDeceased: '',
    presentAtBirthReg: ''
  }

  observations.forEach((observation) => {
    const causeOfDeathMethod = findCodeInObservation(
      observation,
      OBSERVATION_CODE.CAUSE_OF_DEATH_METHOD
    )
    const birthPluralityOfPregnancy = findCodeInObservation(
      observation,
      OBSERVATION_CODE.BIRTH_PLURALITY_OF_PREGNANCY
    )
    const bodyWeightMeasured = findCodeInObservation(
      observation,
      OBSERVATION_CODE.BODY_WEIGHT_MEASURED
    )
    const birthAttendantTitle = findCodeInObservation(
      observation,
      OBSERVATION_CODE.BIRTH_ATTENDANT_TITLE
    )
    const uncertifiedMannerOfDeath = findCodeInObservation(
      observation,
      OBSERVATION_CODE.UNCERTIFIED_MANNER_OF_DEATH
    )
    const verbalAutopsyDescription = findCodeInObservation(
      observation,
      OBSERVATION_CODE.VERBAL_AUTOPSY_DESCRIPTION
    )
    const causeOfDeathEstablished = findCodeInObservation(
      observation,
      OBSERVATION_CODE.CAUSE_OF_DEATH_ESTABLISHED
    )
    const causeOfDeath = findCodeInObservation(
      observation,
      OBSERVATION_CODE.CAUSE_OF_DEATH
    )
    const numMaleDependentsOnDeceased = findCodeInObservation(
      observation,
      OBSERVATION_CODE.NUM_MALE_DEPENDENTS_ON_DECEASED
    )
    const numFemaleDependentsOnDeceased = findCodeInObservation(
      observation,
      OBSERVATION_CODE.NUM_FEMALE_DEPENDENTS_ON_DECEASED
    )
    const presentAtBirthReg = findCodeInObservation(
      observation,
      OBSERVATION_CODE.PRESENT_AT_BIRTH_REG
    )

    if (causeOfDeathMethod) {
      observationObj['causeOfDeathMethod'] =
        causeOfDeathMethod.valueCodeableConcept?.coding?.[0].code ?? ''
    }
    if (birthPluralityOfPregnancy) {
      observationObj['birthPluralityOfPregnancy'] =
        birthPluralityOfPregnancy.valueQuantity?.value?.toString() ?? ''
    }
    if (bodyWeightMeasured) {
      observationObj[
        'bodyWeightMeasured'
      ] = `${bodyWeightMeasured.valueQuantity?.value} ${bodyWeightMeasured.valueQuantity?.unit}`
    }
    if (birthAttendantTitle) {
      observationObj['birthAttendantTitle'] =
        birthAttendantTitle.valueString ?? ''
    }
    if (uncertifiedMannerOfDeath) {
      observationObj['uncertifiedMannerOfDeath'] =
        uncertifiedMannerOfDeath.valueCodeableConcept?.coding?.[0].code ?? ''
    }
    if (verbalAutopsyDescription) {
      observationObj['verbalAutopsyDescription'] =
        verbalAutopsyDescription.valueString ?? ''
    }
    if (causeOfDeathEstablished) {
      observationObj['causeOfDeathEstablished'] =
        causeOfDeathEstablished.valueCodeableConcept?.coding?.[0].code ?? ''
    }
    if (causeOfDeath) {
      observationObj['causeOfDeath'] =
        causeOfDeath.valueCodeableConcept?.coding?.[0].code ?? ''
    }
    if (numMaleDependentsOnDeceased) {
      observationObj['numMaleDependentsOnDeceased'] =
        numMaleDependentsOnDeceased.valueString ?? ''
    }
    if (numFemaleDependentsOnDeceased) {
      observationObj['numFemaleDependentsOnDeceased'] =
        numFemaleDependentsOnDeceased.valueString ?? ''
    }
    if (presentAtBirthReg) {
      observationObj['presentAtBirthReg'] = presentAtBirthReg.valueString ?? ''
    }
  })
  fullComposition.observations = observationObj
}

async function setInformantDetailsInComposition(
  composition: fhir.Composition,
  fullComposition: Partial<IFullComposition>,
  locations: fhir.Location[]
) {
  const informant = composition.section?.find(
    (section) =>
      typeof section.entry?.[0].reference === 'string' &&
      section.entry[0].reference.startsWith('RelatedPerson/')
  )
  const informantId =
    informant?.entry?.[0].reference?.replace('RelatedPerson/', '') ?? ''
  const relatedPerson: fhir.RelatedPerson[] = await getCollectionDocuments(
    COLLECTION_NAMES.RELATEDPERSON,
    [informantId]
  )
  const patientId = relatedPerson?.[0].patient.reference?.replace(
    'Patient/',
    ''
  )
  const patient: fhir.Patient[] = await getCollectionDocuments(
    COLLECTION_NAMES.PATIENT,
    [String(patientId)]
  )

  await setPatientsAddress(patient, locations)

  fullComposition.informant = {
    relationship: relatedPerson[0].relationship?.coding?.[0].code ?? '',
    ...makePatientObject(patient[0])
  }
}

async function createBirthDeclarationCSVWriter() {
  const birthCSV = createCSV({
    path: './scripts/Birth_Report.csv',
    append: true,
    header: [
      'childGen',
      'childDOB',
      'childOrd',
      'birthCity',
      'birthState',
      'birthDistrict',
      'healthCenter',
      'officeLocation',
      'birthPluralityOfPregnancy',
      'bodyWeightMeasured',
      'birthAttendantTitle',
      'presentAtBirthReg',
      'motherDOB',
      'motherMaritalStatus',
      'motherOccupation',
      'motherEducationalAttainment',
      'motherCity',
      'motherDistrict',
      'motherState',
      'fatherDOB',
      'fatherMaritalStatus',
      'fatherOccupation',
      'fatherEducationalAttainment',
      'fatherCity',
      'fatherDistrict',
      'fatherState',
      'informantDOB',
      'informantMaritalStatus',
      'informantOccupation',
      'informantEducationalAttainment',
      'informantCity',
      'informantDistrict',
      'informantState',
      'informantRelationship'
    ]
  })
  const birthCSVHeader = [
    {
      childGen: 'CHILD GENDER',
      childDOB: 'CHILD DOB',
      childOrd: 'CHILD ORDER',
      birthCity: 'BIRTH CITY',
      birthState: 'BIRTH STATE',
      birthDistrict: 'BIRTH DISTRICT',
      healthCenter: 'HEALTH CENTER',
      officeLocation: 'OFFICE LOCATION',
      birthPluralityOfPregnancy: 'PLURALITY OF PREGNANCY',
      bodyWeightMeasured: 'BODY WEIGHT MEASURED',
      birthAttendantTitle: 'ATTENDANT TITLE',
      presentAtBirthReg: 'PRESENT AT REG',
      motherDOB: 'MOTHER DOB',
      motherMaritalStatus: 'MOTHER MARITAL STATUS',
      motherOccupation: 'MOTHER OCCUPATION',
      motherEducationalAttainment: 'MOTHER EDUCATION',
      motherCity: 'MOTHER CITY',
      motherDistrict: 'MOTHER DISTRICT',
      motherState: 'MOTHER STATE',
      fatherDOB: 'FATHER DOB',
      fatherMaritalStatus: 'FATHER MARITAL STATUS',
      fatherOccupation: 'FATHER OCCUPATION',
      fatherEducationalAttainment: 'FATHER EDUCATION',
      fatherCity: 'FATHER CITY',
      fatherDistrict: 'FATHER DISTRICT',
      fatherState: 'FATHER STATE',
      informantDOB: 'INFORMANT DOB',
      informantMaritalStatus: 'INFORMANT MARITAL STATUS',
      informantOccupation: 'INFORMANT OCCUPATION',
      informantEducationalAttainment: 'INFORMANT EDUCATION',
      informantCity: 'INFORMANT CITY',
      informantDistrict: 'INFORMANT DISTRICT',
      informantState: 'INFORMANT STATE',
      informantRelationship: 'INFORMANT RELATIONSHIP'
    }
  ]
  await birthCSV.writeRecords(birthCSVHeader)
  return birthCSV
}

async function createDeathDeclarationCSVWriter() {
  const deathCSV = createCSV({
    path: './scripts/Death_Report.csv',
    append: true,
    header: [
      'deceasedGen',
      'deceasedDOB',
      'deceasedMaritalStatus',
      'deceasedDate',
      'deathCity',
      'deathState',
      'deathDistrict',
      'healthCenter',
      'officeLocation',
      'uncertifiedMannerOfDeath',
      'verbalAutopsyDescription',
      'causeOfDeathMethod',
      'causeOfDeathEstablished',
      'causeOfDeath',
      'numMaleDependentsOnDeceased',
      'numFemaleDependentsOnDeceased',
      'informantDOB',
      'informantMaritalStatus',
      'informantOccupation',
      'informantCity',
      'informantDistrict',
      'informantState',
      'informantRelationship'
    ]
  })
  const deathCSVHeader = [
    {
      deceasedGen: 'DECEASED GENDER',
      deceasedDOB: 'DECEASED DOB',
      deceasedMaritalStatus: 'DECEASED MARITAL STATUS',
      deceasedDate: 'DECEASED DATE',
      deathCity: 'DEATH CITY',
      deathState: 'DEATH STATE',
      deathDistrict: 'DEATH DISTRICT',
      healthCenter: 'HEALTH CENTER',
      officeLocation: 'OFFICE LOCATION',
      uncertifiedMannerOfDeath: 'UNCERTIFIED MANNER OF DEATH',
      verbalAutopsyDescription: 'VERBAL AUTOPSY DESCRIPTION',
      causeOfDeathMethod: 'CAUSE OF DEATH METHOD',
      causeOfDeathEstablished: 'CAUSE OF DEATH ESTABLISHED',
      causeOfDeath: 'CAUSE OF DEATH',
      numMaleDependentsOnDeceased: 'NUM MALE DEPENDENTS ON DECEASED',
      numFemaleDependentsOnDeceased: 'NUM FEMALE DEPENDENTS ON DECEASED',
      informantDOB: 'INFORMANT DOB',
      informantMaritalStatus: 'INFORMANT MARITAL STATUS',
      informantOccupation: 'INFORMANT OCCUPATION',
      informantCity: 'INFORMANT CITY',
      informantDistrict: 'INFORMANT DISTRICT',
      informantState: 'INFORMANT STATE',
      informantRelationship: 'INFORMANT RELATIONSHIP'
    }
  ]
  await deathCSV.writeRecords(deathCSVHeader)
  return deathCSV
}

async function makeCompositionAndExportCSVReport(
  compositionsCursor: Cursor<any>,
  locations: fhir.Location[]
) {
  const birthCSVWriter = await createBirthDeclarationCSVWriter()
  const deathCSVWriter = await createDeathDeclarationCSVWriter()
  try {
    while (await compositionsCursor.hasNext()) {
      const composition = (await compositionsCursor.next()) as fhir.Composition
      composition.section = composition.section?.filter(
        (sec: { title: string }) =>
          !['Certificates', 'Supporting Documents'].includes(sec.title)
      )
      const fullComposition: Partial<IFullComposition> = {}
      fullComposition.event =
        composition.title === 'Birth Declaration' ? 'Birth' : 'Death'
      await setPatientsDetailsInComposition(
        composition,
        fullComposition,
        locations
      )
      await setLocationInComposition(composition, fullComposition, locations)
      await setObservationDetailsInComposition(composition, fullComposition)
      await setInformantDetailsInComposition(
        composition,
        fullComposition,
        locations
      )
      if (fullComposition.event === 'Birth') {
        const birthRow: IBirthRow = {
          childGen: '',
          childDOB: '',
          childOrd: 0,
          birthCity: '',
          birthState: '',
          birthDistrict: '',
          healthCenter: '',
          officeLocation: '',
          birthPluralityOfPregnancy: '',
          bodyWeightMeasured: '',
          birthAttendantTitle: '',
          presentAtBirthReg: '',
          motherDOB: '',
          motherMaritalStatus: '',
          motherOccupation: '',
          motherEducationalAttainment: '',
          motherCity: '',
          motherDistrict: '',
          motherState: '',
          fatherDOB: '',
          fatherMaritalStatus: '',
          fatherOccupation: '',
          fatherEducationalAttainment: '',
          fatherCity: '',
          fatherDistrict: '',
          fatherState: '',
          informantDOB: '',
          informantMaritalStatus: '',
          informantOccupation: '',
          informantEducationalAttainment: '',
          informantCity: '',
          informantDistrict: '',
          informantState: '',
          informantRelationship: ''
        }

        //Address
        birthRow.birthDistrict = fullComposition.eventDistrict ?? ''
        birthRow.birthState = fullComposition.eventState ?? ''
        birthRow.birthCity = fullComposition.eventCity ?? ''
        birthRow.healthCenter = fullComposition.healthCenter ?? ''
        birthRow.officeLocation = fullComposition.officeLocation ?? ''

        //Child details
        birthRow.childGen = fullComposition.child?.gender ?? ''
        birthRow.childDOB = fullComposition.child?.birthDate ?? ''
        birthRow.childOrd = fullComposition.child?.multipleBirth ?? 0

        //Mother details
        birthRow.motherDOB = fullComposition.mother?.birthDate ?? ''
        birthRow.motherMaritalStatus =
          fullComposition.mother?.maritalStatus ?? ''
        birthRow.motherOccupation = fullComposition.mother?.occupation ?? ''
        birthRow.motherEducationalAttainment =
          fullComposition.mother?.educational_attainment ?? ''
        birthRow.motherCity = fullComposition.mother?.city ?? ''
        birthRow.motherDistrict = fullComposition.mother?.district ?? ''
        birthRow.motherState = fullComposition.mother?.state ?? ''

        //Father details
        birthRow.fatherDOB = fullComposition.father?.birthDate ?? ''
        birthRow.fatherMaritalStatus =
          fullComposition.father?.maritalStatus ?? ''
        birthRow.fatherOccupation = fullComposition.father?.occupation ?? ''
        birthRow.fatherEducationalAttainment =
          fullComposition.father?.educational_attainment ?? ''
        birthRow.fatherCity = fullComposition.father?.city ?? ''
        birthRow.fatherDistrict = fullComposition.father?.district ?? ''
        birthRow.fatherState = fullComposition.father?.state ?? ''

        //Informant details
        birthRow.informantDOB = fullComposition.informant?.birthDate ?? ''
        birthRow.informantMaritalStatus =
          fullComposition.informant?.maritalStatus ?? ''
        birthRow.informantOccupation =
          fullComposition.informant?.occupation ?? ''
        birthRow.informantEducationalAttainment =
          fullComposition.informant?.educational_attainment ?? ''
        birthRow.informantCity = fullComposition.informant?.city ?? ''
        birthRow.informantDistrict = fullComposition.informant?.district ?? ''
        birthRow.informantState = fullComposition.informant?.state ?? ''
        birthRow.informantRelationship =
          fullComposition.informant?.relationship ?? ''

        //Observations
        birthRow.birthPluralityOfPregnancy =
          fullComposition.observations?.birthPluralityOfPregnancy ?? ''
        birthRow.bodyWeightMeasured =
          fullComposition.observations?.bodyWeightMeasured ?? ''
        birthRow.birthAttendantTitle =
          fullComposition.observations?.birthAttendantTitle ?? ''
        birthRow.presentAtBirthReg =
          fullComposition.observations?.presentAtBirthReg ?? ''

        // tslint:disable-next-line
        console.log('Writing CSV row for birth declaration...')
        await birthCSVWriter.writeRecords([birthRow])
      } else if (fullComposition.event === 'Death') {
        const deathRow: IDeathRow = {
          deceasedGen: '',
          deceasedDOB: '',
          deceasedMaritalStatus: '',
          deceasedDate: '',
          deathCity: '',
          deathState: '',
          deathDistrict: '',
          healthCenter: '',
          officeLocation: '',
          uncertifiedMannerOfDeath: '',
          verbalAutopsyDescription: '',
          causeOfDeathMethod: '',
          causeOfDeathEstablished: '',
          causeOfDeath: '',
          numMaleDependentsOnDeceased: '',
          numFemaleDependentsOnDeceased: '',
          informantDOB: '',
          informantMaritalStatus: '',
          informantOccupation: '',
          informantCity: '',
          informantDistrict: '',
          informantState: '',
          informantRelationship: ''
        }

        //Address
        deathRow.healthCenter = fullComposition.healthCenter ?? ''
        deathRow.officeLocation = fullComposition.officeLocation ?? ''
        deathRow.deathDistrict = fullComposition.deceased?.district ?? ''
        deathRow.deathState = fullComposition.deceased?.state ?? ''
        deathRow.deathCity = fullComposition.deceased?.city ?? ''

        //Deceased details
        deathRow.deceasedGen = fullComposition.deceased?.gender ?? ''
        deathRow.deceasedDOB = fullComposition.deceased?.birthDate ?? ''
        deathRow.deceasedMaritalStatus =
          fullComposition.deceased?.maritalStatus ?? ''
        deathRow.deceasedDate = fullComposition.deceased?.deceasedDate ?? ''

        //Informant details
        deathRow.informantDOB = fullComposition.informant?.birthDate ?? ''
        deathRow.informantMaritalStatus =
          fullComposition.informant?.maritalStatus ?? ''
        deathRow.informantOccupation =
          fullComposition.informant?.occupation ?? ''
        deathRow.informantCity = fullComposition.informant?.city ?? ''
        deathRow.informantDistrict = fullComposition.informant?.district ?? ''
        deathRow.informantState = fullComposition.informant?.state ?? ''
        deathRow.informantRelationship =
          fullComposition.informant?.relationship ?? ''

        //Observations
        deathRow.uncertifiedMannerOfDeath =
          fullComposition.observations?.uncertifiedMannerOfDeath ?? ''
        deathRow.verbalAutopsyDescription =
          fullComposition.observations?.verbalAutopsyDescription ?? ''
        deathRow.causeOfDeathMethod =
          fullComposition.observations?.causeOfDeathMethod ?? ''
        deathRow.causeOfDeathEstablished = fullComposition.observations
          ?.causeOfDeathEstablished
          ? 'Yes'
          : 'No'
        deathRow.causeOfDeath = fullComposition.observations?.causeOfDeath ?? ''
        deathRow.numMaleDependentsOnDeceased =
          fullComposition.observations?.numMaleDependentsOnDeceased ?? ''
        deathRow.numFemaleDependentsOnDeceased =
          fullComposition.observations?.numFemaleDependentsOnDeceased ?? ''

        // tslint:disable-next-line
        console.log('Writing CSV row for death declaration...')
        await deathCSVWriter.writeRecords([deathRow])
      }
    }
    // tslint:disable-next-line
    console.log(
      'Successfully generated CSV report for birth and death declarations.'
    )
  } catch (error) {
    // tslint:disable-next-line
    console.log('Sorry. Something went wrong!', error)
  }
}

const startScript = async () => {
  await connect()
  const compositionsCursor = await getCompositionCursor()
  const locations: fhir.Location[] = await getCollectionDocuments(
    COLLECTION_NAMES.LOCATION,
    []
  )
  await makeCompositionAndExportCSVReport(compositionsCursor, locations)
  process.exit()
}

startScript()
