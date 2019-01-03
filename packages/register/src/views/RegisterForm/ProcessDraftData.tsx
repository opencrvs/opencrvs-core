import { IFormData, IFormSectionData } from '../../forms'

export interface IHumanName {
  use: string
  firstNames: string
  familyName: string
}
export interface IPersonDetails {
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
  'countryPermanent',
  'statePermanent',
  'districtPermanent',
  'postCodePermanent',
  'addressLine1Permanent',
  'addressLine2Permanent',
  'addressLine3Options1Permanent',
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
  'addressLine3Options1',
  'addressLine4',
  'presentAtBirthRegistration',
  'attendantAtBirth',
  'birthType',
  'weightAtBirth',
  'placeOfBirth'
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
        mother.addressLine3Options1Permanent,
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
        mother.addressLine3Options1,
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
        fatherPermanentAddress.addressLine3Options1Permanent,
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
        fatherCurrentAddress.addressLine3Options1,
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
      { system: 'phone', value: registration.registrationPhone },
      { system: 'email', value: registration.registrationEmail }
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

  if (father.fathersDetailsExist) {
    draftDetails.father = fatherDetails
  }

  return draftDetails
}

export default processDraftData
