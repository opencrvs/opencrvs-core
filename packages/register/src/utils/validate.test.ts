import {
  messages,
  isAValidPhoneNumberFormat,
  requiredSymbol,
  required,
  minLength,
  isNumber,
  phoneNumberFormat,
  emailAddressFormat,
  bengaliOnlyNameFormat,
  englishOnlyNameFormat
} from './validate'
import { config } from '../config'

describe('validate', () => {
  describe('isAValidPhoneNumberFormat. Checks a local phone number format complies with regex', () => {
    it('should error when supplied a bad value.', () => {
      const badValue = 'hgjhg'
      const response = false
      expect(isAValidPhoneNumberFormat(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = '07111111111'
      const response = true
      expect(isAValidPhoneNumberFormat(goodValue)).toEqual(response)
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

  describe('isNumber. Checks a value is a number', () => {
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
      expect(isNumber(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = '7'
      const response = undefined
      expect(isNumber(goodValue)).toEqual(response)
    })
  })

  describe('phoneNumberFormat. Checks a value is a valid phone number returning the message descriptor', () => {
    it('should error when supplied a bad value.', () => {
      const badValue = 'hgjhg'
      const response = {
        message: {
          id: 'validations.phoneNumberFormat',
          defaultMessage:
            'Must be a valid {locale} mobile phone number. Starting with 0. E.G. {format}',
          description:
            'The error message that appears on phone numbers where the first character must be a 0'
        },
        props: {
          locale: config.LOCALE.toUpperCase(),
          format: '07123456789',
          min: 10
        }
      }
      expect(phoneNumberFormat(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = '07111111111'
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

  describe('bengaliOnlyNameFormat. Checks a value is a valid Bengali name', () => {
    it('should error when a Bengali punctuation is given', () => {
      const badValue = 'মাসুম।'
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
    it.skip('should pass when given a good name in Bengali with multiple words', () => {
      const goodValue = 'আব্দুল জলিল'
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
    it.skip('should pass when given a good name in English with multiple words', () => {
      const goodValue = 'John Doe'
      expect(englishOnlyNameFormat(goodValue)).toBeUndefined()
    })
  })
})
