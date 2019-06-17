import { defineMessages, FormattedMessage } from 'react-intl'
import { NUMBER, TEXT, IDynamicFieldTypeMapper } from '.'

export const NATIONAL_ID = 'NATIONAL_ID'
export const BIRTH_REGISTRATION_NUMBER = 'BIRTH_REGISTRATION_NUMBER'
export const PASSPORT = 'PASSPORT'
export const DEATH_REGISTRATION_NUMBER = 'DEATH_REGISTRATION_NUMBER'
export const DRIVING_LICENSE = 'DRIVING_LICENSE'
export const REFUGEE_NUMBER = 'REFUGEE_NUMBER'
export const ALIEN_NUMBER = 'ALIEN_NUMBER'
export const OTHER = 'OTHER'
export const NO_ID = 'NO_ID'

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  iDType: {
    id: 'formFields.iDType',
    defaultMessage: 'Type of ID',
    description: 'Label for form field: Type of ID'
  },
  iDTypePassport: {
    id: 'formFields.iDTypePassport',
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID'
  },
  iDTypeNationalID: {
    id: 'formFields.iDTypeNationalID',
    defaultMessage: 'National ID',
    description: 'Option for form field: Type of ID'
  },
  iDTypeDrivingLicense: {
    id: 'formFields.iDTypeDrivingLicense',
    defaultMessage: 'Drivers License',
    description: 'Option for form field: Type of ID'
  },
  iDTypeBRN: {
    id: 'formFields.iDTypeBRN',
    defaultMessage: 'Birth Registration Number',
    description: 'Option for form field: Type of ID'
  },
  iDTypeDRN: {
    id: 'formFields.iDTypeDRN',
    defaultMessage: 'Death Registration Number',
    description: 'Option for form field: Type of ID'
  },
  iDTypeRefugeeNumber: {
    id: 'formFields.iDTypeRefugeeNumber',
    defaultMessage: 'Refugee Number',
    description: 'Option for form field: Type of ID'
  },
  iDTypeAlienNumber: {
    id: 'formFields.iDTypeAlienNumber',
    defaultMessage: 'Alien Number',
    description: 'Option for form field: Type of ID'
  },
  iDTypeOther: {
    id: 'formFields.iDTypeOther',
    defaultMessage: 'Other',
    description: 'Option for form field: Type of ID'
  },
  iDTypeNoId: {
    id: 'formFields.iDTypeNoID',
    defaultMessage: 'No ID available',
    description: 'Option for form field: Type of ID'
  },
  iDTypeOtherLabel: {
    id: 'formFields.iDTypeOtherLabel',
    defaultMessage: 'Other type of ID',
    description: 'Label for form field: Other type of ID'
  },
  iD: {
    id: 'formFields.iD',
    defaultMessage: 'ID Number',
    description: 'Label for form field: ID Number'
  }
})

export const birthIdentityOptions = [
  { value: NATIONAL_ID, label: messages.iDTypeNationalID },
  {
    value: BIRTH_REGISTRATION_NUMBER,
    label: messages.iDTypeBRN
  },
  { value: PASSPORT, label: messages.iDTypePassport },
  { value: OTHER, label: messages.iDTypeOther }
]

export const deathIdentityOptions = [
  { value: PASSPORT, label: messages.iDTypePassport },
  { value: NATIONAL_ID, label: messages.iDTypeNationalID },
  {
    value: DRIVING_LICENSE,
    label: messages.iDTypeDrivingLicense
  },
  {
    value: BIRTH_REGISTRATION_NUMBER,
    label: messages.iDTypeBRN
  },
  {
    value: REFUGEE_NUMBER,
    label: messages.iDTypeRefugeeNumber
  },
  { value: ALIEN_NUMBER, label: messages.iDTypeAlienNumber },
  { value: NO_ID, label: messages.iDTypeNoId },
  { value: OTHER, label: messages.iDTypeOther }
]

export const identityTypeMapper: IDynamicFieldTypeMapper = (key: string) => {
  switch (key) {
    case NATIONAL_ID:
      return NUMBER
    default:
      return TEXT
  }
}

export function identityNameMapper(
  code: string
): FormattedMessage.MessageDescriptor {
  switch (code) {
    case 'NATIONAL_ID':
      return messages.iDTypeNationalID
    case 'PASSPORT':
      return messages.iDTypePassport
    case 'DRIVING_LICENSE':
      return messages.iDTypeDrivingLicense
    case 'BIRTH_REGISTRATION_NUMBER':
      return messages.iDTypeBRN
    case 'DEATH_REGISTRATION_NUMBER':
      return messages.iDTypeDRN
    case 'REFUGEE_NUMBER':
      return messages.iDTypeRefugeeNumber
    case 'ALIEN_NUMBER':
      return messages.iDTypeAlienNumber
    default:
      return messages.iD
  }
}
