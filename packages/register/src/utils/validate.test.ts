import {
  messages,
  isAValidPhoneNumberFormat,
  requiredSymbol,
  required,
  minLength,
  numeric,
  phoneNumberFormat,
  dateFormat,
  emailAddressFormat,
  bengaliOnlyNameFormat,
  englishOnlyNameFormat,
  range,
  validIDNumber,
  maxLength,
  isValidBirthDate
} from './validate'

describe('validate', () => {
  describe('isAValidPhoneNumberFormat. Checks a local phone number format complies with regex', () => {
    it('should error when supplied a bad value.', () => {
      const badValue = 'hgjhg'
      const response = false
      expect(isAValidPhoneNumberFormat(badValue, 'bgd')).toEqual(response)
    })
    it('should error when given an invalid phone number', () => {
      const badNumber = '01200345678'
      const response = false
      expect(isAValidPhoneNumberFormat(badNumber, 'bgd')).toEqual(response)
    })
    it('should pass when supplied a good value for a British number', () => {
      const goodValue = '07111111111'
      const response = true
      expect(isAValidPhoneNumberFormat(goodValue, 'gbr')).toEqual(response)
    })
    it('should pass when supplied a good value for a Bangladeshi number', () => {
      const goodValue = '01720067890'
      const response = true
      expect(isAValidPhoneNumberFormat(goodValue, 'bgd')).toEqual(response)
    })
    it('should pass when supplied a good value and country is not added to the lookup table', () => {
      const goodValue = '01720067890'
      const response = true
      expect(isAValidPhoneNumberFormat(goodValue, 'th')).toEqual(response)
    })
  })

  describe('requiredSymbol. Used for number fields that use a symbol (e.g.: x) as an error message', () => {
    it('Should error when supplied a bad value. ', () => {
      const badValue = ''
      const response = {
        message: {
          defaultMessage: '',
          description:
            'A blank error message. Used for highlighting a required field without showing an error',
          id: 'validations.requiredSymbol'
        }
      }
      expect(requiredSymbol(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = 'jkgjgjgkgjkj'
      const response = undefined
      expect(requiredSymbol(goodValue)).toEqual(response)
    })
  })

  describe('required. Used for fields that must have a value', () => {
    it('Should error when supplied a bad value. ', () => {
      const badValue = ''
      const response = {
        message: {
          id: 'validations.required',
          defaultMessage: 'Required',
          description: 'The error message that appears on required fields'
        }
      }
      expect(required(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = 'jkgjgjgkgjkj'
      const response = undefined
      expect(required(goodValue)).toEqual(response)
    })
    it('should pass when supplied a good boolean value', () => {
      const goodValue = true
      const response = undefined
      expect(required(goodValue)).toEqual(response)
    })
  })

  describe('minLength. Used for fields that have a minimum length', () => {
    it('Should error when supplied a bad value. ', () => {
      const badValue = '1'
      const response = {
        message: {
          id: 'validations.minLength',
          defaultMessage: 'Must be {min} characters or more',
          description:
            'The error message that appears on fields with a minimum length'
        },
        props: {
          min: 10
        }
      }
      expect(minLength(10)(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = '1234567890'
      const response = undefined
      expect(minLength(10)(goodValue)).toEqual(response)
    })
  })

  describe('maxLength. Used for fields that have a maximum length', () => {
    it('Should error when supplied a bad value. ', () => {
      const badValue = '186821638721616236132872163781268316863'
      const response = {
        message: {
          id: 'validations.maxLength',
          defaultMessage: 'Must not be more than {max} characters',
          description:
            'The error message that appears on fields with a maximum length'
        },
        props: {
          max: 17
        }
      }
      expect(maxLength(17)(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = '1234567890'
      const response = undefined
      expect(maxLength(17)(goodValue)).toEqual(response)
    })
  })

  describe('range. Used for fields that have a range limit', () => {
    it('Should error when supplied a bad value. ', () => {
      const badValue = '9'
      const response = {
        message: {
          id: 'validations.range',
          defaultMessage: 'Must be within {min} and {max}',
          description:
            'The error message that appears when an out of range value is used'
        },
        props: {
          min: 0,
          max: 6
        }
      }
      expect(range(0, 6)(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value. ', () => {
      const goodValue = '5'
      const response = undefined
      expect(range(0, 6)(goodValue)).toEqual(response)
    })
  })

  describe('validIDNumber. Used for ID number field that has a specific validation', () => {
    it('Should error when supplied a bad value as National ID.', () => {
      const badValue = '2019BrTVz8945'
      const typeOfID = 'NATIONAL_ID'
      const response = {
        message: {
          id: 'validations.validNationalId',
          defaultMessage:
            'The National ID can only be numeric and must be {validLength} digits long',
          description:
            'The error message that appears when an invalid value is used as nid'
        },
        props: {
          validLength: 13
        }
      }
      expect(validIDNumber(typeOfID)(badValue)).toEqual(response)
    })
    it('Should pass when supplied a good value as National ID.', () => {
      const goodValue = '2019783948945'
      const typeOfID = 'NATIONAL_ID'
      const response = undefined
      expect(validIDNumber(typeOfID)(goodValue)).toEqual(response)
    })
    it('Should error when supplied a bad value as Birth Registration Number.', () => {
      const badValue = '2019BrTVz8945AVC9'
      const typeOfID = 'BIRTH_REGISTRATION_NUMBER'
      const response = {
        message: {
          id: 'validations.validBirthRegistrationNumber',
          defaultMessage:
            'The Birth Registration Number can only be alpha numeric and must be {validLength} characters long',
          description:
            'The error message that appears when an invalid value is used as brn'
        },
        props: {
          validLength: 17
        }
      }
      expect(validIDNumber(typeOfID)(badValue)).toEqual(response)
    })
    it('Should pass when supplied a good value as Birth Registration Number.', () => {
      const goodValue = '2019BRTVZ8945AVC9'
      const typeOfID = 'BIRTH_REGISTRATION_NUMBER'
      const response = undefined
      expect(validIDNumber(typeOfID)(goodValue)).toEqual(response)
    })
    it('Should error when supplied a bad value as Pasport Number.', () => {
      const badValue = '2019BrTVz8'
      const typeOfID = 'PASSPORT'
      const response = {
        message: {
          id: 'validations.validPassportNumber',
          defaultMessage:
            'The Passport Number can only be alpha numeric and must be {validLength} characters long',
          description:
            'The error message that appears when an invalid value is used as passport number'
        },
        props: {
          validLength: 9
        }
      }
      expect(validIDNumber(typeOfID)(badValue)).toEqual(response)
    })
    it('Should pass when supplied a good value as Birth Registration Number.', () => {
      const goodValue = '2019BrTVz'
      const typeOfID = 'PASSPORT'
      const response = undefined
      expect(validIDNumber(typeOfID)(goodValue)).toEqual(response)
    })
  })

  describe('numeric. Checks a value is numeric', () => {
    it('should error when supplied a bad value.', () => {
      const badValue = 'hgjhg'
      const response = {
        message: {
          id: 'validations.numberRequired',
          defaultMessage: 'Must be a number',
          description:
            'The error message that appears on fields where the value must be a number'
        }
      }
      expect(numeric(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = '7'
      const response = undefined
      expect(numeric(goodValue)).toEqual(response)
    })
  })

  describe('phoneNumberFormat. Checks a value is a valid phone number returning the message descriptor', () => {
    it('should error when supplied a bad value.', () => {
      const badValue = 'hgjhg'
      const response = {
        message: {
          id: 'validations.phoneNumberFormat',
          defaultMessage:
            'Must be 11 digit valid mobile phone number that stars with 01',
          description:
            'The error message that appears on phone numbers where the first two characters must be a 01 and length must be 11'
        },
        props: {
          example: '01741234567'
        }
      }
      expect(phoneNumberFormat(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = '01845678912'
      const response = undefined
      expect(phoneNumberFormat(goodValue)).toEqual(response)
    })
  })

  describe('emailAddressFormat. Checks a value is a valid email address returning the message descriptor', () => {
    it('should error when supplied a value invalid email.', () => {
      const badValue = 'user@domain'
      const response = {
        message: {
          id: 'validations.emailAddressFormat',
          defaultMessage: 'Must be a valid email address',
          description:
            'The error message appears when the email addresses are not valid'
        }
      }
      expect(emailAddressFormat(badValue)).toEqual(response)
    })
    it('should error when supplied a value with invalid domain.', () => {
      const badValue = 'user@example.c'
      const response = {
        message: {
          id: 'validations.emailAddressFormat',
          defaultMessage: 'Must be a valid email address',
          description:
            'The error message appears when the email addresses are not valid'
        }
      }
      expect(emailAddressFormat(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = 'root@opencrvs.org'
      const response = undefined
      expect(emailAddressFormat(goodValue)).toEqual(response)
    })
  })

  describe('dateFormat. Checks a given date is a valid date', () => {
    it('should error when input invalid chararcters', () => {
      const invalidDate = '1901-+2-2e'
      expect(dateFormat(invalidDate)).toEqual({ message: messages.dateFormat })
    })

    it('should error when input invalid format', () => {
      const invalidDate = '190-2-21'
      expect(dateFormat(invalidDate)).toEqual({ message: messages.dateFormat })
    })

    it('should error when input invalid date', () => {
      const invalidDate = '2017-2-29'
      expect(dateFormat(invalidDate)).toEqual({ message: messages.dateFormat })
    })

    it('should pass when supplied a valid date with single digit', () => {
      const validDate = '2011-8-12'
      const response = undefined
      expect(dateFormat(validDate)).toEqual(response)
    })

    it('should pass when supplied a valid date', () => {
      const validDate = '2011-08-12'
      const response = undefined
      expect(dateFormat(validDate)).toEqual(response)
    })
  })

  describe('isValidBirthDate. Checks a given date is a valid birth date', () => {
    it('should error when input invalid chararcters', () => {
      const invalidDate = '1901-+2-2e'
      expect(isValidBirthDate(invalidDate)).toEqual({
        message: messages.isValidBirthDate
      })
    })

    it('should error when input invalid format', () => {
      const invalidDate = '190-2-21'
      expect(isValidBirthDate(invalidDate)).toEqual({
        message: messages.isValidBirthDate
      })
    })

    it('should error when input invalid date', () => {
      const invalidDate = '2017-2-29'
      expect(isValidBirthDate(invalidDate)).toEqual({
        message: messages.isValidBirthDate
      })
    })

    it('should error when input a future date', () => {
      const invalidDate = '2037-2-29'
      expect(isValidBirthDate(invalidDate)).toEqual({
        message: messages.isValidBirthDate
      })
    })

    it('should pass when supplied a valid birth date with single digit', () => {
      const validDate = '2011-8-12'
      const response = undefined
      expect(isValidBirthDate(validDate)).toEqual(response)
    })

    it('should pass when supplied a valid birth date', () => {
      const validDate = '2011-08-12'
      const response = undefined
      expect(isValidBirthDate(validDate)).toEqual(response)
    })
  })

  describe('bengaliOnlyNameFormat. Checks a value is a valid Bengali name', () => {
    it('should error when a Bengali punctuation is given', () => {
      const badValue = 'মাসুম।'
      expect(bengaliOnlyNameFormat(badValue)).toEqual({
        message: messages.bengaliOnlyNameFormat
      })
    })
    it('should error when a Bengali number is given', () => {
      const badValue = 'মাসুম১'
      expect(bengaliOnlyNameFormat(badValue)).toEqual({
        message: messages.bengaliOnlyNameFormat
      })
    })
    it('should error when an English number is given', () => {
      const badValue = 'মাসুম1'
      expect(bengaliOnlyNameFormat(badValue)).toEqual({
        message: messages.bengaliOnlyNameFormat
      })
    })
    it('should error when a non Bengali character is given', () => {
      const badValue = 'Masum'
      expect(bengaliOnlyNameFormat(badValue)).toEqual({
        message: messages.bengaliOnlyNameFormat
      })
    })
    it('should pass when given a good name in Bengali', () => {
      const goodValue = 'মাসুম'
      expect(bengaliOnlyNameFormat(goodValue)).toBeUndefined()
    })
    it('should pass when given a good name in Bengali with multiple words', () => {
      const goodValue = 'আব্দুল জলিল'
      expect(bengaliOnlyNameFormat(goodValue)).toBeUndefined()
    })
    it('should pass when a hyphenated Bengali name is given', () => {
      const goodValue = 'আব্দুল-জলিল'
      expect(bengaliOnlyNameFormat(goodValue)).toBeUndefined()
    })
  })

  describe('englishOnlyNameFormat. Checks a value is a valid English name', () => {
    it('should error when an English punctuation is given', () => {
      const badValue = 'John.'
      expect(englishOnlyNameFormat(badValue)).toEqual({
        message: messages.englishOnlyNameFormat
      })
    })
    it('should error when an English number is given', () => {
      const badValue = 'John1'
      expect(englishOnlyNameFormat(badValue)).toEqual({
        message: messages.englishOnlyNameFormat
      })
    })
    it('should error when a Bengali number is given', () => {
      const badValue = 'John১'
      expect(englishOnlyNameFormat(badValue)).toEqual({
        message: messages.englishOnlyNameFormat
      })
    })
    it('should error when a non English character is given', () => {
      const badValue = 'জন'
      expect(englishOnlyNameFormat(badValue)).toEqual({
        message: messages.englishOnlyNameFormat
      })
    })
    it('should pass when given a good name in English', () => {
      const goodValue = 'John'
      expect(englishOnlyNameFormat(goodValue)).toBeUndefined()
    })
    it('should pass when given a good name in English with multiple words', () => {
      const goodValue = 'John Doe'
      expect(englishOnlyNameFormat(goodValue)).toBeUndefined()
    })
    it('should pass when a hyphenated English name is given', () => {
      const goodValue = 'Anne-Marie'
      expect(englishOnlyNameFormat(goodValue)).toBeUndefined()
    })
  })
})
