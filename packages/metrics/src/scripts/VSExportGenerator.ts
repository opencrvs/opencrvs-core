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
import { FindCursor, Document, MongoClient } from 'mongodb'
import { createObjectCsvWriter as createCSV } from 'csv-writer'
import * as DateFNS from 'date-fns'
import { CsvWriter } from 'csv-writer/src/lib/csv-writer'
import * as fs from 'fs'
// eslint-disable-next-line import/no-relative-parent-imports
import { BIRTH_REPORT_PATH, DEATH_REPORT_PATH } from '../constants'

const HEARTH_MONGO_URL =
  process.env.HEARTH_MONGO_URL || 'mongodb://localhost/hearth-dev'
const client = new MongoClient(HEARTH_MONGO_URL)
const officeLocationExtURL = 'http://opencrvs.org/specs/extension/regLastOffice'
const patientOccupationExtURL =
  'http://opencrvs.org/specs/extension/patient-occupation'
const patientNationalityExtURL =
  'http://hl7.org/fhir/StructureDefinition/patient-nationality'
const patientEduAttainmentExtURL =
  'http://opencrvs.org/specs/extension/educational-attainment'

type IPatient = ReturnType<typeof makePatientObject>

type IObservation = {
  causeOfDeathMethod: string
  birthPluralityOfPregnancy: string
  bodyWeightMeasured: string
  birthAttendantTitle: string
  uncertifiedMannerOfDeath: string
  verbalAutopsyDescription: string
  causeOfDeathEstablished: string
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
  officeLocation: string
  childGen: string
  childDOB: string
  childOrd: number
  birthCity: string
  birthState: string
  birthDistrict: string
  healthCenter: string
  birthPluralityOfPregnancy: string
  bodyWeightMeasured: string
  birthAttendantTitle: string
  motherNationality: string
  motherDOB: string
  motherMaritalStatus: string
  motherOccupation: string
  motherEducationalAttainment: string
  motherCity: string
  motherDistrict: string
  motherState: string
  fatherNationality: string
  fatherDOB: string
  fatherMaritalStatus: string
  fatherOccupation: string
  fatherEducationalAttainment: string
  fatherCity: string
  fatherDistrict: string
  fatherState: string
  informantNationality: string
  informantDOB: string
  informantCity: string
  informantDistrict: string
  informantState: string
}

type IDeathRow = {
  officeLocation: string
  deceasedNationality: string
  deceasedGen: string
  deceasedDOB: string
  deceasedMaritalStatus: string
  deceasedDate: string
  deathCity: string
  deathState: string
  deathDistrict: string
  healthCenter: string
  uncertifiedMannerOfDeath: string
  causeOfDeathEstablished: string
  causeOfDeathMethod: string
  verbalAutopsyDescription: string
  informantNationality: string
  informantDOB: string
  informantCity: string
  informantDistrict: string
  informantState: string
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

const EDUCATION_LEVEL_MAP = {
  PRIMARY_ISCED_1: 'Primary',
  POST_SECONDARY_ISCED_4: 'Secondary',
  FIRST_STAGE_TERTIARY_ISCED_5: 'Tertiary',
  NO_SCHOOLING: 'No schooling'
}

const connect = async () => {
  try {
    await client.connect()
    console.log('Connected to mongoDB')
  } catch (err) {
    console.log('Error occured while connecting to mongoDB', err)
  }
}

const disconnect = async () => {
  try {
    await client.close()
    console.log('Closed mongoDB connection.')
  } catch (err) {
    console.log('Error occured while disconnecting to mongoDB', err)
  }
}

async function getCompositionCursor(startDate: string, endDate: string) {
  const db = client.db()
  return db
    .collection(COLLECTION_NAMES.COMPOSITION)
    .find({
      date: {
        $gte: startDate,
        $lte: endDate
      },
      'type.coding.code': {
        $in: ['birth-declaration', 'death-declaration']
      }
    })
    .project({ id: 1, title: 1, section: 1, date: 1, _id: 0 })
}

async function getCollectionDocuments(collectionName: string, ids: string[]) {
  const db = client.db()
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
  const db = client.db()
  return db
    .collection(COLLECTION_NAMES.OBSERVATION)
    .find({
      'context.reference': encounterId
    })
    .toArray()
}

async function getTaskDocByCompositionId(compositionId: string) {
  const db = client.db()
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

function getNationalityByExt(doc: fhir.Patient, extURL: string) {
  if (!doc.extension) {
    return ''
  }
  const docExt = doc.extension.find((obj) => obj.url === extURL)
  return docExt
    ? docExt.extension?.[0].valueCodeableConcept?.coding?.[0].code
    : ''
}

function makePatientObject(patient: fhir.Patient) {
  return {
    gender: patient.gender ?? '',
    birthDate: patient.birthDate ?? '',
    deceasedDate: patient.deceasedDateTime ?? '',
    maritalStatus: patient.maritalStatus?.text ?? '',
    multipleBirth: patient.multipleBirthInteger ?? 0,
    occupation: getValueFromExt(patient, patientOccupationExtURL) ?? '',
    nationality: getNationalityByExt(patient, patientNationalityExtURL) ?? '',
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
  patients.forEach((patient) => {
    if (patient.address) {
      if (patient.address[0].district) {
        const districtAddress = locations.find(
          ({ id }) => id === patient.address?.[0].district
        )
        patient.address[0].district = districtAddress?.name ?? ''
      }
      if (patient.address[0].state) {
        const stateAddress = locations.find(
          ({ id }) => id === patient.address?.[0].state
        )
        patient.address[0].state = stateAddress?.name ?? ''
      }
    }
  })
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
  const patients = (await getCollectionDocuments(
    COLLECTION_NAMES.PATIENT,
    patientIds
  )) as unknown as fhir.Patient[]
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
  locations: fhir.Location[],
  task: fhir.Task
) {
  const encounter = composition.section?.find(
    (section) =>
      typeof section.entry?.[0].reference === 'string' &&
      section.entry[0].reference.startsWith('Encounter/')
  )
  const encounterId =
    encounter?.entry?.[0].reference?.replace('Encounter/', '') ?? ''
  const encounterDoc = await getCollectionDocuments(
    COLLECTION_NAMES.ENCOUNTER,
    [encounterId]
  )
  const locationId = encounterDoc[0].location?.[0].location.reference?.replace(
    'Location/',
    ''
  )
  const locationDoc = locations.find(
    ({ id }) => id === locationId
  ) as fhir.Location

  const isLocationHealthFacility =
    locationDoc.type?.coding?.[0].code === 'HEALTH_FACILITY'

  if (isLocationHealthFacility) {
    const districtLocationId = String(
      locationDoc.partOf?.reference?.replace('Location/', '')
    )
    const districtLocationDoc = locations.find(
      ({ id }) => id === districtLocationId
    )
    const stateLocationId = String(
      districtLocationDoc?.partOf?.reference?.replace('Location/', '')
    )
    const stateLocationDoc = locations.find(({ id }) => id === stateLocationId)
    fullComposition['healthCenter'] = locationDoc.name ?? ''
    fullComposition['eventDistrict'] = districtLocationDoc?.name ?? ''
    fullComposition['eventState'] = stateLocationDoc?.name ?? ''
  } else {
    const districtLocation = locations.find(
      ({ id }) => id === locationDoc.address?.district
    )
    const stateLocation = locations.find(
      ({ id }) => id === locationDoc.address?.state
    )
    fullComposition['eventDistrict'] = districtLocation?.name ?? ''
    fullComposition['eventState'] = stateLocation?.name ?? ''
  }

  fullComposition['eventCity'] = locationDoc.address?.city ?? ''

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
  )) as unknown as fhir.Observation[]
  const observationObj: IObservation = {
    causeOfDeathMethod: '',
    birthPluralityOfPregnancy: '',
    bodyWeightMeasured: '',
    birthAttendantTitle: '',
    uncertifiedMannerOfDeath: '',
    verbalAutopsyDescription: '',
    causeOfDeathEstablished: ''
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
  const relatedPerson = (await getCollectionDocuments(
    COLLECTION_NAMES.RELATEDPERSON,
    [informantId]
  )) as unknown as fhir.RelatedPerson[]

  if (relatedPerson?.[0].patient) {
    const patientId = relatedPerson?.[0].patient.reference?.replace(
      'Patient/',
      ''
    )
    const patient = (await getCollectionDocuments(COLLECTION_NAMES.PATIENT, [
      String(patientId)
    ])) as unknown as fhir.Patient[]

    await setPatientsAddress(patient, locations)

    fullComposition.informant = {
      relationship: relatedPerson[0].relationship?.coding?.[0].code ?? '',
      ...makePatientObject(patient[0])
    }
  }
}

async function createBirthDeclarationCSVWriter() {
  const birthCSV = createCSV({
    path: BIRTH_REPORT_PATH,
    append: true,
    header: [
      'officeLocation',
      'childGen',
      'childDOB',
      'childOrd',
      'birthCity',
      'birthState',
      'birthDistrict',
      'healthCenter',
      'birthPluralityOfPregnancy',
      'bodyWeightMeasured',
      'birthAttendantTitle',
      'motherNationality',
      'motherDOB',
      'motherMaritalStatus',
      'motherOccupation',
      'motherEducationalAttainment',
      'motherCity',
      'motherDistrict',
      'motherState',
      'fatherNationality',
      'fatherDOB',
      'fatherMaritalStatus',
      'fatherOccupation',
      'fatherEducationalAttainment',
      'fatherCity',
      'fatherDistrict',
      'fatherState',
      'informantNationality',
      'informantDOB',
      'informantCity',
      'informantDistrict',
      'informantState'
    ]
  })
  const birthCSVHeader = [
    {
      officeLocation: 'OFFICE LOCATION',
      childGen: 'CHILD GENDER',
      childDOB: 'CHILD DOB',
      childOrd: 'CHILD ORDER',
      birthCity: 'BIRTH CITY',
      birthState: 'BIRTH STATE',
      birthDistrict: 'BIRTH DISTRICT',
      healthCenter: 'HEALTH CENTER',
      birthPluralityOfPregnancy: 'TYPE OF BIRTH',
      bodyWeightMeasured: 'WEIGHT AT BIRTH',
      birthAttendantTitle: 'ATTENDANT AT BIRTH',
      motherNationality: 'MOTHER NATIONALITY',
      motherDOB: 'MOTHER DOB',
      motherMaritalStatus: 'MOTHER MARITAL STATUS',
      motherOccupation: 'MOTHER OCCUPATION',
      motherEducationalAttainment: 'MOTHER EDUCATION',
      motherCity: 'MOTHER CITY',
      motherDistrict: 'MOTHER DISTRICT',
      motherState: 'MOTHER STATE',
      fatherNationality: 'FATHER NATIONALITY',
      fatherDOB: 'FATHER DOB',
      fatherMaritalStatus: 'FATHER MARITAL STATUS',
      fatherOccupation: 'FATHER OCCUPATION',
      fatherEducationalAttainment: 'FATHER EDUCATION',
      fatherCity: 'FATHER CITY',
      fatherDistrict: 'FATHER DISTRICT',
      fatherState: 'FATHER STATE',
      informantNationality: 'INFORMANT NATIONALITY',
      informantDOB: 'INFORMANT DOB',
      informantCity: 'INFORMANT CITY',
      informantDistrict: 'INFORMANT DISTRICT',
      informantState: 'INFORMANT STATE'
    }
  ]
  if (!fs.existsSync(BIRTH_REPORT_PATH)) {
    await birthCSV.writeRecords(birthCSVHeader)
  }
  return birthCSV
}

async function createDeathDeclarationCSVWriter() {
  const deathCSV = createCSV({
    path: DEATH_REPORT_PATH,
    append: true,
    header: [
      'officeLocation',
      'deceasedNationality',
      'deceasedGen',
      'deceasedDOB',
      'deceasedMaritalStatus',
      'deceasedDate',
      'deathCity',
      'deathState',
      'deathDistrict',
      'healthCenter',
      'uncertifiedMannerOfDeath',
      'causeOfDeathEstablished',
      'causeOfDeathMethod',
      'verbalAutopsyDescription',
      'informantNationality',
      'informantDOB',
      'informantCity',
      'informantDistrict',
      'informantState'
    ]
  })
  const deathCSVHeader = [
    {
      officeLocation: 'OFFICE LOCATION',
      deceasedNationality: 'DECEASED NATIONALITY',
      deceasedGen: 'DECEASED GENDER',
      deceasedDOB: 'DECEASED DOB',
      deceasedMaritalStatus: 'DECEASED MARITAL STATUS',
      deceasedDate: 'DECEASED DATE',
      deathCity: 'DEATH CITY',
      deathState: 'DEATH STATE',
      deathDistrict: 'DEATH DISTRICT',
      healthCenter: 'HEALTH CENTER',
      uncertifiedMannerOfDeath: 'MANNER OF DEATH',
      causeOfDeathEstablished: 'CAUSE OF DEATH ESTABLISHED',
      causeOfDeathMethod: 'SOURCE OF CAUSE OF DEATH',
      verbalAutopsyDescription: 'VERBAL AUTOPSY DESCRIPTION',
      informantNationality: 'INFORMANT NATIONALITY',
      informantDOB: 'INFORMANT DOB',
      informantCity: 'INFORMANT CITY',
      informantDistrict: 'INFORMANT DISTRICT',
      informantState: 'INFORMANT STATE'
    }
  ]
  if (!fs.existsSync(DEATH_REPORT_PATH)) {
    await deathCSV.writeRecords(deathCSVHeader)
  }
  return deathCSV
}

async function makeCompositionAndExportCSVReport(
  compositionsCursor: FindCursor<Document>,
  locations: fhir.Location[],
  birthCSVWriter: CsvWriter<any>,
  deathCSVWriter: CsvWriter<any>,
  startDate: string,
  endDate: string
) {
  const totalCompositionCount = await compositionsCursor.count()
  let processedDatacount = 0
  if (totalCompositionCount > 0) {
    while (await compositionsCursor.hasNext()) {
      try {
        processedDatacount++
        const percentage = Math.round(
          (processedDatacount / totalCompositionCount) * 100
        )
        console.log(
          `VSEXPORT GENERATION: Vital statistics export for month ${DateFNS.format(
            new Date(startDate),
            'MMMM'
          )} of ${DateFNS.format(
            new Date(startDate),
            'yyyy'
          )} at: ${percentage}%`
        )
        const composition =
          (await compositionsCursor.next()) as fhir.Composition
        const [task] = (await getTaskDocByCompositionId(
          `Composition/${composition.id}`
        )) as unknown as [fhir.Task]

        const businessStatus = task.businessStatus?.coding?.[0].code

        if (businessStatus === 'CERTIFIED' || 'REGISTERED' || 'ISSUED') {
          composition.section = composition.section?.filter(
            (sec) =>
              sec.title &&
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
          await setLocationInComposition(
            composition,
            fullComposition,
            locations,
            task
          )
          await setObservationDetailsInComposition(composition, fullComposition)
          await setInformantDetailsInComposition(
            composition,
            fullComposition,
            locations
          )
          if (fullComposition.event === 'Birth') {
            const birthRow: IBirthRow = {
              officeLocation: '',
              childGen: '',
              childDOB: '',
              childOrd: 0,
              birthCity: '',
              birthState: '',
              birthDistrict: '',
              healthCenter: '',
              birthPluralityOfPregnancy: '',
              bodyWeightMeasured: '',
              birthAttendantTitle: '',
              motherNationality: '',
              motherDOB: '',
              motherMaritalStatus: '',
              motherOccupation: '',
              motherEducationalAttainment: '',
              motherCity: '',
              motherDistrict: '',
              motherState: '',
              fatherNationality: '',
              fatherDOB: '',
              fatherMaritalStatus: '',
              fatherOccupation: '',
              fatherEducationalAttainment: '',
              fatherCity: '',
              fatherDistrict: '',
              fatherState: '',
              informantNationality: '',
              informantDOB: '',
              informantCity: '',
              informantDistrict: '',
              informantState: ''
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
            birthRow.motherNationality =
              fullComposition.mother?.nationality ?? ''
            birthRow.motherDOB = fullComposition.mother?.birthDate ?? ''
            birthRow.motherMaritalStatus =
              fullComposition.mother?.maritalStatus ?? ''
            birthRow.motherOccupation = fullComposition.mother?.occupation ?? ''
            birthRow.motherEducationalAttainment =
              (fullComposition.mother?.educational_attainment &&
                EDUCATION_LEVEL_MAP[
                  fullComposition.mother?.educational_attainment
                ]) ??
              ''
            birthRow.motherCity = fullComposition.mother?.city ?? ''
            birthRow.motherDistrict = fullComposition.mother?.district ?? ''
            birthRow.motherState = fullComposition.mother?.state ?? ''

            //Father details
            birthRow.fatherNationality =
              fullComposition.father?.nationality ?? ''
            birthRow.fatherDOB = fullComposition.father?.birthDate ?? ''
            birthRow.fatherMaritalStatus =
              fullComposition.father?.maritalStatus ?? ''
            birthRow.fatherOccupation = fullComposition.father?.occupation ?? ''
            birthRow.fatherEducationalAttainment =
              (fullComposition.father?.educational_attainment &&
                EDUCATION_LEVEL_MAP[
                  fullComposition.father?.educational_attainment
                ]) ??
              ''
            birthRow.fatherCity = fullComposition.father?.city ?? ''
            birthRow.fatherDistrict = fullComposition.father?.district ?? ''
            birthRow.fatherState = fullComposition.father?.state ?? ''

            //Informant details
            birthRow.informantNationality =
              fullComposition.informant?.nationality ?? ''
            birthRow.informantDOB = fullComposition.informant?.birthDate ?? ''
            birthRow.informantCity = fullComposition.informant?.city ?? ''
            birthRow.informantDistrict =
              fullComposition.informant?.district ?? ''
            birthRow.informantState = fullComposition.informant?.state ?? ''

            //Observations
            birthRow.birthPluralityOfPregnancy =
              fullComposition.observations?.birthPluralityOfPregnancy ?? ''
            birthRow.bodyWeightMeasured =
              fullComposition.observations?.bodyWeightMeasured ?? ''
            birthRow.birthAttendantTitle =
              fullComposition.observations?.birthAttendantTitle ?? ''

            await birthCSVWriter.writeRecords([birthRow])
          } else if (fullComposition.event === 'Death') {
            const deathRow: IDeathRow = {
              officeLocation: '',
              deceasedNationality: '',
              deceasedGen: '',
              deceasedDOB: '',
              deceasedMaritalStatus: '',
              deceasedDate: '',
              deathCity: '',
              deathState: '',
              deathDistrict: '',
              healthCenter: '',
              uncertifiedMannerOfDeath: '',
              verbalAutopsyDescription: '',
              causeOfDeathMethod: '',
              causeOfDeathEstablished: '',
              informantNationality: '',
              informantDOB: '',
              informantCity: '',
              informantDistrict: '',
              informantState: ''
            }

            //Address
            deathRow.healthCenter = fullComposition.healthCenter ?? ''
            deathRow.officeLocation = fullComposition.officeLocation ?? ''
            deathRow.deathDistrict = fullComposition.deceased?.district ?? ''
            deathRow.deathState = fullComposition.deceased?.state ?? ''
            deathRow.deathCity = fullComposition.deceased?.city ?? ''

            //Deceased details
            deathRow.deceasedNationality =
              fullComposition.deceased?.nationality ?? ''
            deathRow.deceasedGen = fullComposition.deceased?.gender ?? ''
            deathRow.deceasedDOB = fullComposition.deceased?.birthDate ?? ''
            deathRow.deceasedMaritalStatus =
              fullComposition.deceased?.maritalStatus ?? ''
            deathRow.deceasedDate = fullComposition.deceased?.deceasedDate ?? ''

            //Informant details
            deathRow.informantNationality =
              fullComposition.informant?.nationality ?? ''
            deathRow.informantDOB = fullComposition.informant?.birthDate ?? ''
            deathRow.informantCity = fullComposition.informant?.city ?? ''
            deathRow.informantDistrict =
              fullComposition.informant?.district ?? ''
            deathRow.informantState = fullComposition.informant?.state ?? ''

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

            await deathCSVWriter.writeRecords([deathRow])
          }
        }
      } catch (error) {
        console.log('Sorry. Something went wrong!', error)
      }
    }
    console.log(
      `VSEXPORT GENERATION: Successfully generated CSV report for birth and death declarations from ${startDate} to ${endDate}`
    )
  } else {
    console.log(
      `VSEXPORT GENERATION: No record found from ${startDate} to ${endDate}`
    )
  }
}

const startScript = async () => {
  await connect()
  let startDate = new Date(process.argv[2])
  const endDate = new Date(process.argv[3])
  const totalMonths = DateFNS.differenceInCalendarMonths(endDate, startDate) + 1
  const birthCSVWriter = await createBirthDeclarationCSVWriter()
  const deathCSVWriter = await createDeathDeclarationCSVWriter()
  for (let month = 0; month < totalMonths; month++) {
    console.log(
      `VSEXPORT GENERATION: Commencing vital statistics export for month ${
        month + 1
      } of ${totalMonths}`
    )
    const daysInMonths = DateFNS.getDaysInMonth(startDate)
    const dayPassed = DateFNS.getDate(startDate)
    const daysToMonth = daysInMonths - dayPassed
    let lastOneMonth = DateFNS.addDays(startDate, daysToMonth)
    if (month + 1 === totalMonths) {
      lastOneMonth = endDate
    }
    const formatedStartDate = `${DateFNS.format(
      startDate,
      'yyyy-MM-dd'
    )}T00:00:00.000Z`

    const formatedEndDate = `${DateFNS.format(
      lastOneMonth,
      'yyyy-MM-dd'
    )}T23:59:59.000Z`

    const compositionsCursor = await getCompositionCursor(
      formatedStartDate,
      formatedEndDate
    )
    const locations = (await getCollectionDocuments(
      COLLECTION_NAMES.LOCATION,
      []
    )) as unknown as fhir.Location[]

    await makeCompositionAndExportCSVReport(
      compositionsCursor,
      locations,
      birthCSVWriter,
      deathCSVWriter,
      formatedStartDate,
      formatedEndDate
    )

    startDate = DateFNS.addDays(lastOneMonth, 1)
  }
  await disconnect()
  process.exit()
}

startScript()
