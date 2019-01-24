import { IFormData, IFormSectionData } from '../../forms'

export interface IPersonDetails {
  [key: string]: any
}

export interface IRegistrationDetails {
  [key: string]: any
}

export interface IImage {
  data: string
  optionValues: string[]
  type: string
  title?: string
  description?: string
}

export const documentForWhomFhirMapping = {
  Child: 'CHILD',
  Father: 'FATHER',
  Mother: 'MOTHER',
  Other: 'OTHER'
}

export const documentTypeFhirMapping = {
  'Birth Registration': 'BIRTH_REGISTRATION',
  NID: 'NATIONAL_ID',
  Passport: 'PASSPORT',
  'School Certificate': 'SCHOOL_CERTIFICATE',
  Other: 'OTHER'
}

const customKeys = [
  'firstNames',
  'familyName',
  'firstNamesEng',
  'familyNameEng',
  'iD',
  'iDType',
  'nationality',
  'childBirthDate',
  'motherBirthDate',
  'fatherBirthDate',
  'countryPermanent',
  'statePermanent',
  'districtPermanent',
  'postCodePermanent',
  'addressLine1Permanent',
  'addressLine2Permanent',
  'addressLine3Permanent',
  'addressLine4Permanent',
  'permanentAddressSameAsMother',
  'fathersDetailsExist',
  'addressSameAsMother',
  'country',
  'state',
  'district',
  'postCode',
  'addressLine1',
  'addressLine2',
  'addressLine3',
  'addressLine4',
  'presentAtBirthRegistration',
  'attendantAtBirth',
  'birthType',
  'weightAtBirth',
  '_fhirID',
  'placeOfBirth',
  'currentAddressSameAsPermanent'
]

const removeEmpty = (sectionData: IFormSectionData): IPersonDetails => {
  const parsed = {}
  Object.keys(sectionData).forEach((filterKey: string) => {
    if (sectionData[filterKey] && !customKeys.includes(filterKey)) {
      parsed[filterKey] = sectionData[filterKey]
    }
  })
  return parsed
}

const processDraftData = (draftData: IFormData) => {
  const { child, father, mother, registration, documents } = draftData

  if (
    !draftData ||
    !child ||
    !father ||
    !mother ||
    !registration ||
    !documents
  ) {
    return draftData
  }

  const draftDetails: any = {
    child: removeEmpty(child),
    mother: removeEmpty(mother),
    createdAt: new Date()
  }

  const fatherDetails = removeEmpty(father)

  if (mother.currentAddressSameAsPermanent) {
    mother.country = mother.countryPermanent
    mother.state = mother.statePermanent
    mother.district = mother.districtPermanent
    mother.postCode = mother.postCodePermanent
    mother.addressLine1 = mother.addressLine1Permanent
    mother.addressLine2 = mother.addressLine2Permanent
    mother.addressLine3 = mother.addressLine3Permanent
    mother.addressLine4 = mother.addressLine4Permanent
  }

  const fatherPermanentAddress = father.permanentAddressSameAsMother
    ? mother
    : father
  const fatherCurrentAddress = father.addressSameAsMother ? mother : father

  draftDetails.child.name = [
    {
      use: 'bn',
      firstNames: child.firstNames,
      familyName: child.familyName
    },
    {
      use: 'en',
      firstNames: child.firstNamesEng,
      familyName: child.familyNameEng
    }
  ]

  if (child._fhirID) {
    draftDetails.child._fhirID = child._fhirID
  }

  if (child.childBirthDate) {
    draftDetails.child.birthDate = child.childBirthDate
  }

  draftDetails.mother.name = [
    {
      use: 'bn',
      firstNames: mother.firstNames,
      familyName: mother.familyName
    },
    {
      use: 'en',
      firstNames: mother.firstNamesEng,
      familyName: mother.familyNameEng
    }
  ]
  if (mother.nationality) {
    draftDetails.mother.nationality = [mother.nationality]
  }
  if (mother.iD && mother.iDType) {
    draftDetails.mother.identifier = [{ id: mother.iD, type: mother.iDType }]
  }
  if (mother._fhirID) {
    draftDetails.mother._fhirID = mother._fhirID
  }
  if (mother.motherBirthDate) {
    draftDetails.mother.birthDate = mother.motherBirthDate
  }

  draftDetails.mother.address = [
    {
      type: 'PERMANENT',
      country: mother.countryPermanent,
      state: mother.statePermanent,
      district: mother.districtPermanent,
      postalCode: mother.postCodePermanent,
      line: [
        mother.addressLine1Permanent,
        mother.addressLine2Permanent,
        mother.addressLine3,
        mother.addressLine4Permanent
      ]
    },
    {
      type: 'CURRENT',
      country: mother.country,
      state: mother.state,
      district: mother.district,
      postalCode: mother.postCode,
      line: [
        mother.addressLine1,
        mother.addressLine2,
        mother.addressLine3,
        mother.addressLine4
      ]
    }
  ]

  fatherDetails.name = [
    {
      use: 'bn',
      firstNames: father.firstNames,
      familyName: father.familyName
    },
    {
      use: 'en',
      firstNames: father.firstNamesEng,
      familyName: father.familyNameEng
    }
  ]
  if (father.nationality) {
    fatherDetails.nationality = [father.nationality]
  }
  if (father.iD && father.iDType) {
    fatherDetails.identifier = [{ id: father.iD, type: father.iDType }]
  }
  if (father._fhirID) {
    fatherDetails._fhirID = father._fhirID
  }
  if (father.fatherBirthDate) {
    fatherDetails.birthDate = father.fatherBirthDate
  }

  fatherDetails.address = [
    {
      type: 'PERMANENT',
      country: fatherPermanentAddress.countryPermanent,
      state: fatherPermanentAddress.statePermanent,
      district: fatherPermanentAddress.districtPermanent,
      postalCode: fatherPermanentAddress.postCodePermanent,
      line: [
        fatherPermanentAddress.addressLine1Permanent,
        fatherPermanentAddress.addressLine2Permanent,
        fatherPermanentAddress.addressLine3,
        fatherPermanentAddress.addressLine4Permanent
      ]
    },
    {
      type: 'CURRENT',
      country: fatherCurrentAddress.country,
      state: fatherCurrentAddress.state,
      district: fatherCurrentAddress.district,
      postalCode: fatherCurrentAddress.postCode,
      line: [
        fatherCurrentAddress.addressLine1,
        fatherCurrentAddress.addressLine2,
        fatherCurrentAddress.addressLine3,
        fatherCurrentAddress.addressLine4
      ]
    }
  ]

  const parentDetails =
    registration.whoseContactDetails === 'MOTHER'
      ? draftDetails.mother
      : registration.whoseContactDetails === 'FATHER'
      ? fatherDetails
      : null

  if (parentDetails) {
    parentDetails.telecom = [
      { system: 'phone', value: registration.registrationPhone }
    ]
  }

  const images = (documents.image_uploader as IImage[]) || []
  const attachments = images.map(img => {
    return {
      data: img.data,
      subject: documentForWhomFhirMapping[img.optionValues[0]],
      type: documentTypeFhirMapping[img.optionValues[1]],
      contentType: img.type
    }
  })

  draftDetails.registration = {
    attachments
  }

  if (registration.whoseContactDetails) {
    draftDetails.registration.contact = registration.whoseContactDetails
  }

  if (registration.paperFormNumber) {
    draftDetails.registration.paperFormID = registration.paperFormNumber
  }

  if (registration.trackingId) {
    draftDetails.registration.trackingId = registration.trackingId
  }

  if (registration.registrationNumber) {
    draftDetails.registration.registrationNumber =
      registration.registrationNumber
  }

  if (registration.commentsOrNotes) {
    draftDetails.registration.status = [
      {
        comments: [
          {
            comment: registration.commentsOrNotes,
            createdAt: new Date()
          }
        ],
        timestamp: new Date()
      }
    ]
  } else {
    draftDetails.registration.status = [
      {
        timestamp: new Date()
      }
    ]
  }

  if (registration._fhirID) {
    draftDetails.registration._fhirID = registration._fhirID
  }

  if (child.attendantAtBirth) {
    draftDetails.attendantAtBirth = child.attendantAtBirth
  }

  if (child.birthType) {
    draftDetails.birthType = child.birthType
  }

  if (child.weightAtBirth) {
    draftDetails.weightAtBirth = child.weightAtBirth
  }

  if (registration.presentAtBirthRegistration) {
    draftDetails.presentAtBirthRegistration =
      registration.presentAtBirthRegistration
  }

  if (draftData._fhirIDMap) {
    draftDetails._fhirIDMap = draftData._fhirIDMap
  }
  if (father.fathersDetailsExist) {
    draftDetails.father = fatherDetails
  }

  return draftDetails
}

export default processDraftData
