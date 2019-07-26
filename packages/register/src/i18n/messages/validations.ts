import { defineMessages } from 'react-intl'

interface IValidationMessages {
  blockAlphaNumericDot: ReactIntl.FormattedMessage.MessageDescriptor
  required: ReactIntl.FormattedMessage.MessageDescriptor
  minLength: ReactIntl.FormattedMessage.MessageDescriptor
  maxLength: ReactIntl.FormattedMessage.MessageDescriptor
  numberRequired: ReactIntl.FormattedMessage.MessageDescriptor
  phoneNumberFormat: ReactIntl.FormattedMessage.MessageDescriptor
  dateFormat: ReactIntl.FormattedMessage.MessageDescriptor
  isValidBirthDate: ReactIntl.FormattedMessage.MessageDescriptor
  dobEarlierThanDom: ReactIntl.FormattedMessage.MessageDescriptor
  domLaterThanDob: ReactIntl.FormattedMessage.MessageDescriptor
  emailAddressFormat: ReactIntl.FormattedMessage.MessageDescriptor
  requiredSymbol: ReactIntl.FormattedMessage.MessageDescriptor
  bengaliOnlyNameFormat: ReactIntl.FormattedMessage.MessageDescriptor
  englishOnlyNameFormat: ReactIntl.FormattedMessage.MessageDescriptor
  range: ReactIntl.FormattedMessage.MessageDescriptor
  validNationalId: ReactIntl.FormattedMessage.MessageDescriptor
  validBirthRegistrationNumber: ReactIntl.FormattedMessage.MessageDescriptor
  validDeathRegistrationNumber: ReactIntl.FormattedMessage.MessageDescriptor
  validPassportNumber: ReactIntl.FormattedMessage.MessageDescriptor
  greaterThanZero: ReactIntl.FormattedMessage.MessageDescriptor
  isValidDateOfDeath: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IValidationMessages = {
  required: {
    id: 'validations.required',
    defaultMessage: 'Required',
    description: 'The error message that appears on required fields'
  },
  minLength: {
    id: 'validations.minLength',
    defaultMessage: 'Must be {min} characters or more',
    description:
      'The error message that appears on fields with a minimum length'
  },
  maxLength: {
    id: 'validations.maxLength',
    defaultMessage: 'Must not be more than {max} characters',
    description:
      'The error message that appears on fields with a maximum length'
  },
  numberRequired: {
    id: 'validations.numberRequired',
    defaultMessage: 'Must be a number',
    description:
      'The error message that appears on fields where the value must be a number'
  },
  phoneNumberFormat: {
    id: 'validations.phoneNumberFormat',
    defaultMessage:
      'Must be {num} digit valid mobile phone number that stars with {start}',
    description:
      'The error message that appears on phone numbers where the first two characters must be a 01 and length must be 11'
  },
  dateFormat: {
    id: 'validations.dateFormat',
    defaultMessage: 'Must be a valid date',
    description: 'The error message appears when the given date is not valid'
  },
  isValidBirthDate: {
    id: 'validations.isValidBirthDate',
    defaultMessage: 'Must be a valid birth date',
    description:
      'The error message appears when the given birth date is not valid'
  },
  dobEarlierThanDom: {
    id: 'validations.dobEarlierThanDom',
    defaultMessage: 'Must be earlier than marriage date',
    description:
      'The error message appears when the given birth date is later than the given marriage date'
  },
  domLaterThanDob: {
    id: 'validations.domLaterThanDob',
    defaultMessage: 'Must be later than birth date',
    description:
      'The error message appears when the given marriage date is earlier than the given birth date'
  },
  emailAddressFormat: {
    id: 'validations.emailAddressFormat',
    defaultMessage: 'Must be a valid email address',
    description:
      'The error message appears when the email addresses are not valid'
  },
  requiredSymbol: {
    id: 'validations.requiredSymbol',
    defaultMessage: '',
    description:
      'A blank error message. Used for highlighting a required field without showing an error'
  },
  bengaliOnlyNameFormat: {
    id: 'validations.bengaliOnlyNameFormat',
    defaultMessage: 'Must contain only Bengali characters',
    description:
      'The error message that appears when a non bengali character is used in a Bengali name'
  },
  englishOnlyNameFormat: {
    id: 'validations.englishOnlyNameFormat',
    defaultMessage: 'Must contain only English characters',
    description:
      'The error message that appears when a non English character is used in an English name'
  },
  range: {
    id: 'validations.range',
    defaultMessage: 'Must be within {min} and {max}',
    description:
      'The error message that appears when an out of range value is used'
  },
  validNationalId: {
    id: 'validations.validNationalId',
    defaultMessage:
      'The National ID can only be numeric and must be {validLength} digits long',
    description:
      'The error message that appears when an invalid value is used as nid'
  },
  validBirthRegistrationNumber: {
    id: 'validations.validBirthRegistrationNumber',
    defaultMessage:
      'The Birth Registration Number can only contain block character and number where the length must be within {min} and {max}',
    description:
      'The error message that appears when an invalid value is used as brn'
  },
  validDeathRegistrationNumber: {
    id: 'validations.validDeathRegistrationNumber',
    defaultMessage:
      'The Death Registration Number can only be alpha numeric and must be {validLength} characters long',
    description:
      'The error message that appears when an invalid value is used as drn'
  },
  validPassportNumber: {
    id: 'validations.validPassportNumber',
    defaultMessage:
      'The Passport Number can only be alpha numeric and must be {validLength} characters long',
    description:
      'The error message that appears when an invalid value is used as passport number'
  },
  isValidDateOfDeath: {
    id: 'validations.isValidDateOfDeath',
    defaultMessage: 'Must be a valid date of death',
    description:
      'The error message appears when the given date of death is not valid'
  },
  greaterThanZero: {
    id: 'validations.greaterThanZero',
    defaultMessage: 'Must be a greater than zero',
    description:
      'The error message appears when input is less than or equal to 0'
  },
  blockAlphaNumericDot: {
    id: 'validations.blockAlphaNumericDot',
    defaultMessage:
      'Can contain only block character, number and dot (e.g. C91.5)',
    description: 'The error message that appears when an invalid value is used'
  }
}

export const validationMessages: IValidationMessages = defineMessages(
  messagesToDefine
)
