import { IFormData } from '../../forms'
export interface IdraftDetails {
  [key: string]: any
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
  const newDraftDetails = {
    child: {},
    mother: {},
    registration: {},
    father: {},
    createdAt: new Date()
  }
  console.log(JSON.stringify(child))
  Object.keys(child).forEach((filterKey: string) => {
    if (typeof child[filterKey] !== 'undefined') {
      newDraftDetails.child[filterKey] = child[filterKey]
    }
  })
  console.log(JSON.stringify(newDraftDetails.child))
  const fatherPermanentAddress = father.permanentAddressSameAsMother
    ? mother
    : father
  const fatherCurrentAddress = father.addressSameAsMother ? mother : father

  const motherDetails: IPersonDetails = {
    name: [
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
    ],
    identifier: [{ id: mother.iD, type: mother.iDType }],
    nationality: [mother.nationality],
    birthDate: mother.motherBirthDate,
    maritalStatus: mother.maritalStatus,
    dateOfMarriage: mother.dateOfMarriage,
    educationalAttainment: mother.educationalAttainment,
    multipleBirth: child.orderOfBirth,
    address: [
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
  }

  const fatherDetails: IPersonDetails = {
    name: [
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
    ],
    identifier: [{ id: father.iD, type: father.iDType }],
    nationality: [father.nationality],
    birthDate: father.fatherBirthDate,
    maritalStatus: father.maritalStatus,
    dateOfMarriage: father.dateOfMarriage,
    educationalAttainment: mother.educationalAttainment,
    address: [
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
  }

  const parentDetails =
    registration.whoseContactDetails === 'MOTHER'
      ? motherDetails
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

  const draftDetails: IdraftDetails = {
    child: {
      gender: child.gender,
      name: [
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
      ],
      birthDate: child.childBirthDate
    },
    mother: motherDetails,
    registration: {
      contact: registration.whoseContactDetails,
      paperFormID: registration.paperFormNumber,
      status: [
        {
          comments: [
            {
              comment: registration.commentsOrNotes,
              createdAt: new Date()
            }
          ],
          timestamp: new Date()
        }
      ],
      attachments
    },
    attendantAtBirth: child.attendantAtBirth,
    birthType: child.typeOfBirth,
    weightAtBirth: child.weightAtBirth,
    presentAtBirthRegistration: registration.presentAtBirthRegistration,
    createdAt: new Date()
  }

  if (father.fathersDetailsExist) {
    draftDetails.father = fatherDetails
  }

  return draftDetails
}

export default processDraftData
