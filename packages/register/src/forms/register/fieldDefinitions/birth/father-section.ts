import { defineMessages } from 'react-intl'
import { messages as addressMessages } from '@register/forms/address'
import { countries } from '@register/forms/countries'
import {
  messages as identityMessages,
  birthIdentityOptions,
  identityTypeMapper,
  identityNameMapper
} from '@register/forms/identity'
import { messages as maritalStatusMessages } from '@register/forms/maritalStatus'
import { messages as educationMessages } from '@register/forms/education'
import { OFFLINE_LOCATIONS_KEY } from '@register/offline/reducer'
import {
  ViewType,
  RADIO_GROUP,
  TEXT,
  DATE,
  SUBSECTION,
  SELECT_WITH_OPTIONS,
  SELECT_WITH_DYNAMIC_OPTIONS,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  FETCH_BUTTON,
  TEL
} from '@register/forms'
import {
  bengaliOnlyNameFormat,
  englishOnlyNameFormat,
  validIDNumber,
  dateGreaterThan,
  dateLessThan,
  dateNotInFuture,
  dateFormatIsCorrect,
  maxLength,
  numeric,
  dateInPast
} from '@register/utils/validate'

import { IFormSection } from '@register/forms/index'
import { conditionals } from '@register/forms/utils'
import {
  fieldToNameTransformer,
  fieldToArrayTransformer,
  fieldToIdentifierTransformer,
  fieldToAddressTransformer,
  copyAddressTransformer,
  sectionRemoveTransformer,
  fieldNameTransformer
} from '@register/forms/mappings/mutation/field-mappings'

import {
  nameToFieldTransformer,
  fieldValueTransformer,
  arrayToFieldTransformer,
  identifierToFieldTransformer,
  addressToFieldTransformer,
  sameAddressFieldTransformer
} from '@register/forms/mappings/query/field-mappings'
import { emptyFatherSectionTransformer } from '@register/forms/register/fieldDefinitions/birth/mappings/query/father-mappings'
import {
  transformRegistrationData,
  FETCH_REGISTRATION
} from '@register/forms/register/queries/registration'
import {
  FETCH_PERSON,
  transformPersonData
} from '@register/forms/register/queries/person'
import {
  getFatherDateOfBirthLabel,
  getDateOfMarriageLabel
} from '@register/forms/register/fieldDefinitions/birth/staticLabel'

export interface IFatherSectionFormData {
  firstName: string
  foo: string
  bar: string
  baz: string
}

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  fatherTab: {
    id: 'register.form.tabs.fatherTab',
    defaultMessage: 'Father',
    description: 'Tab title for Father'
  },
  fatherTitle: {
    id: 'register.form.section.fatherTitle',
    defaultMessage: "Father's details",
    description: 'Form section title for Father'
  },
  fathersDetailsExist: {
    id: 'formFields.fathersDetailsExist',
    defaultMessage: "Do you have the father's details?",
    description: "Question to ask the user if they have the father's details"
  },
  confirm: {
    id: 'formFields.confirm',
    defaultMessage: 'Yes',
    description: 'confirmation label for yes / no radio button'
  },
  deny: {
    id: 'formFields.deny',
    defaultMessage: 'No',
    description: 'deny label for yes / no radio button'
  },
  nationality: {
    id: 'formFields.father.nationality',
    defaultMessage: 'Nationality',
    description: 'Label for form field: Nationality'
  },
  nationalityBangladesh: {
    id: 'formFields.father.nationalityBangladesh',
    defaultMessage: 'Bangladesh',
    description: 'Option for form field: Nationality'
  },
  fatherFirstNames: {
    id: 'formFields.fatherFirstNames',
    defaultMessage: 'First Name(s) in Bengali',
    description: 'Label for form field: First name'
  },
  fatherFamilyName: {
    id: 'formFields.fatherFamilyName',
    defaultMessage: 'Last Name(s) in Bengali',
    description: 'Label for form field: Family name'
  },
  fatherFirstNamesEng: {
    id: 'formFields.fatherFirstNamesEng',
    defaultMessage: 'First Name(s) in English',
    description: 'Label for form field: First names in english'
  },
  fatherFamilyNameEng: {
    id: 'formFields.fatherFamilyNameEng',
    defaultMessage: 'Last Name(s) in English',
    description: 'Label for form field: Family name in english'
  },
  defaultLabel: {
    id: 'formFields.defaultLabel',
    defaultMessage: 'Label goes here',
    description: 'default label'
  },
  fatherDateOfBirth: {
    id: 'formFields.fatherDateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth'
  },
  fatherEducationAttainment: {
    id: 'formFields.fatherEducationAttainment',
    defaultMessage: "Father's level of formal education attained",
    description: 'Label for form field: Father education'
  },
  currentAddress: {
    id: 'formFields.currentAddress',
    defaultMessage: 'Current Address',
    description: 'Title for the current address fields'
  },
  permanentAddress: {
    id: 'formFields.permanentAddress',
    defaultMessage: 'Permanent Address',
    description: 'Title for the permanent address fields'
  },
  optionalLabel: {
    id: 'formFields.optionalLabel',
    defaultMessage: 'Optional',
    description: 'Optional label'
  },
  fetchFatherDetails: {
    id: 'formFields.fetchFatherDetails',
    defaultMessage: "Retrieve Father's Details",
    description: 'Label for loader button'
  },
  fetchIdentifierModalTitle: {
    id: 'formFields.fetchIdentifierModalTitle',
    defaultMessage: 'Checking',
    description: 'Label for fetch modal title'
  },
  fetchIdentifierModalSuccessTitle: {
    id: 'formFields.fetchIdentifierModalSuccessTitle',
    defaultMessage: 'ID valid',
    description: 'Label for fetch modal success title'
  },
  fetchIdentifierModalErrorTitle: {
    id: 'formFields.fetchIdentifierModalErrorTitle',
    defaultMessage: 'Invalid Id',
    description: 'Label for fetch modal error title'
  },
  fetchRegistrationModalErrorText: {
    id: 'formFields.fetchRegistrationModalErrorText',
    defaultMessage: 'No registration found for provided BRN',
    description: 'Label for fetch modal error title'
  },
  fetchPersonByNIDModalErrorText: {
    id: 'formFields.fetchPersonByNIDModalErrorText',
    defaultMessage: 'No person found for provided NID',
    description: 'Label for fetch modal error title'
  },
  fetchRegistrationModalInfo: {
    id: 'formFields.fetchRegistrationModalInfo',
    defaultMessage: 'Birth Registration Number',
    description: 'Label for loader button'
  },
  fetchPersonByNIDModalInfo: {
    id: 'formFields.fetchPersonByNIDModalInfo',
    defaultMessage: 'National ID',
    description: 'Label for loader button'
  }
})

export const fatherSection: IFormSection = {
  id: 'father',
  viewType: 'form' as ViewType,
  name: messages.fatherTab,
  title: messages.fatherTitle,
  fields: [
    {
      name: 'fathersDetailsExist',
      type: RADIO_GROUP,
      label: messages.fathersDetailsExist,
      required: true,
      initialValue: true,
      validate: [],
      options: [
        { value: true, label: messages.confirm },
        { value: false, label: messages.deny }
      ],
      mapping: {
        mutation: sectionRemoveTransformer
      }
    },
    {
      name: 'iDType',
      type: SELECT_WITH_OPTIONS,
      label: identityMessages.iDType,
      required: true,
      initialValue: '',
      validate: [],
      options: birthIdentityOptions,
      conditionals: [conditionals.fathersDetailsExist],
      mapping: {
        mutation: fieldToIdentifierTransformer('type'),
        query: identifierToFieldTransformer('type')
      }
    },
    {
      name: 'iDTypeOther',
      type: TEXT,
      label: identityMessages.iDTypeOtherLabel,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.fathersDetailsExist, conditionals.iDType],
      mapping: {
        mutation: fieldToIdentifierTransformer('otherType'),
        query: identifierToFieldTransformer('otherType')
      }
    },
    {
      name: 'iD',
      type: FIELD_WITH_DYNAMIC_DEFINITIONS,
      dynamicDefinitions: {
        label: {
          dependency: 'iDType',
          labelMapper: identityNameMapper
        },
        type: {
          kind: 'dynamic',
          dependency: 'iDType',
          typeMapper: identityTypeMapper
        },
        validate: [
          {
            validator: validIDNumber,
            dependencies: ['iDType']
          }
        ]
      },
      label: identityMessages.iD,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.fathersDetailsExist],
      mapping: {
        mutation: fieldToIdentifierTransformer('id'),
        query: identifierToFieldTransformer('id')
      }
    },
    {
      name: 'fetchButton',
      type: FETCH_BUTTON,
      label: messages.fetchFatherDetails,
      required: false,
      initialValue: '',
      queryMap: {
        BIRTH_REGISTRATION_NUMBER: {
          query: FETCH_REGISTRATION,
          inputs: [
            {
              name: 'identifier',
              valueField: 'iD'
            }
          ],
          responseTransformer: transformRegistrationData,
          modalInfoText: messages.fetchRegistrationModalInfo,
          errorText: messages.fetchRegistrationModalErrorText
        },
        NATIONAL_ID: {
          query: FETCH_PERSON,
          inputs: [
            {
              name: 'identifier',
              valueField: 'iD'
            }
          ],
          responseTransformer: transformPersonData,
          modalInfoText: messages.fetchPersonByNIDModalInfo,
          errorText: messages.fetchPersonByNIDModalErrorText
        }
      },
      querySelectorInput: {
        name: 'identifierType',
        valueField: 'iDType'
      },
      validate: [],
      conditionals: [conditionals.identifierIDSelected],
      modalTitle: messages.fetchIdentifierModalTitle,
      successTitle: messages.fetchIdentifierModalSuccessTitle,
      errorTitle: messages.fetchIdentifierModalErrorTitle
    },
    {
      name: 'nationality',
      type: SELECT_WITH_OPTIONS,
      label: messages.nationality,
      required: false,
      initialValue: 'BGD',
      validate: [],
      options: countries,
      conditionals: [conditionals.fathersDetailsExist],
      mapping: {
        mutation: fieldToArrayTransformer,
        query: arrayToFieldTransformer
      }
    },
    {
      name: 'firstNames',
      type: TEXT,
      label: messages.fatherFirstNames,
      required: false,
      initialValue: '',
      validate: [bengaliOnlyNameFormat],
      conditionals: [conditionals.fathersDetailsExist],
      mapping: {
        mutation: fieldToNameTransformer('bn'),
        query: nameToFieldTransformer('bn')
      }
    },
    {
      name: 'familyName',
      type: TEXT,
      label: messages.fatherFamilyName,
      required: true,
      initialValue: '',
      validate: [bengaliOnlyNameFormat],
      conditionals: [conditionals.fathersDetailsExist],
      mapping: {
        mutation: fieldToNameTransformer('bn'),
        query: nameToFieldTransformer('bn')
      }
    },
    {
      name: 'firstNamesEng',
      type: TEXT,
      label: messages.fatherFirstNamesEng,
      required: false,
      initialValue: '',
      validate: [englishOnlyNameFormat],
      conditionals: [conditionals.fathersDetailsExist],
      mapping: {
        mutation: fieldToNameTransformer('en', 'firstNames'),
        query: nameToFieldTransformer('en', 'firstNames')
      }
    },
    {
      name: 'familyNameEng',
      type: TEXT,
      label: messages.fatherFamilyNameEng,
      required: true,
      initialValue: '',
      validate: [englishOnlyNameFormat],
      conditionals: [conditionals.fathersDetailsExist],
      mapping: {
        mutation: fieldToNameTransformer('en', 'familyName'),
        query: nameToFieldTransformer('en', 'familyName')
      }
    },
    {
      name: 'fatherBirthDate',
      type: FIELD_WITH_DYNAMIC_DEFINITIONS,
      dynamicDefinitions: {
        label: {
          dependency: 'fatherBirthDate',
          labelMapper: getFatherDateOfBirthLabel
        },
        type: {
          kind: 'static',
          staticType: DATE
        },
        validate: [
          {
            validator: dateFormatIsCorrect,
            dependencies: []
          },
          {
            validator: dateInPast,
            dependencies: []
          },
          {
            validator: dateLessThan,
            dependencies: ['dateOfMarriage']
          }
        ]
      },
      label: messages.fatherDateOfBirth,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.fathersDetailsExist],
      mapping: {
        mutation: fieldNameTransformer('birthDate'),
        query: fieldValueTransformer('birthDate')
      }
    },
    {
      name: 'maritalStatus',
      type: SELECT_WITH_OPTIONS,
      label: maritalStatusMessages.maritalStatus,
      required: false,
      initialValue: 'MARRIED',
      validate: [],
      options: [
        { value: 'SINGLE', label: maritalStatusMessages.maritalStatusSingle },
        { value: 'MARRIED', label: maritalStatusMessages.maritalStatusMarried },
        { value: 'WIDOWED', label: maritalStatusMessages.maritalStatusWidowed },
        {
          value: 'DIVORCED',
          label: maritalStatusMessages.maritalStatusDivorced
        },
        {
          value: 'NOT_STATED',
          label: maritalStatusMessages.maritalStatusNotStated
        }
      ],
      conditionals: [conditionals.fathersDetailsExist]
    },
    {
      name: 'dateOfMarriage',
      type: FIELD_WITH_DYNAMIC_DEFINITIONS,
      dynamicDefinitions: {
        label: {
          dependency: 'dateOfMarriage',
          labelMapper: getDateOfMarriageLabel
        },
        type: {
          kind: 'static',
          staticType: DATE
        },
        validate: [
          {
            validator: dateFormatIsCorrect,
            dependencies: []
          },
          {
            validator: dateNotInFuture,
            dependencies: []
          },
          {
            validator: dateGreaterThan,
            dependencies: ['fatherBirthDate']
          }
        ]
      },
      label: maritalStatusMessages.dateOfMarriage,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.fathersDetailsExist, conditionals.isMarried]
    },
    {
      name: 'educationalAttainment',
      type: SELECT_WITH_OPTIONS,
      label: messages.fatherEducationAttainment,
      required: false,
      initialValue: '',
      validate: [],
      options: [
        {
          value: 'NO_SCHOOLING',
          label: educationMessages.educationAttainmentNone
        },
        {
          value: 'PRIMARY_ISCED_1',
          label: educationMessages.educationAttainmentISCED1
        },
        {
          value: 'LOWER_SECONDARY_ISCED_2',
          label: educationMessages.educationAttainmentISCED2
        },
        {
          value: 'UPPER_SECONDARY_ISCED_3',
          label: educationMessages.educationAttainmentISCED3
        },
        {
          value: 'POST_SECONDARY_ISCED_4',
          label: educationMessages.educationAttainmentISCED4
        },
        {
          value: 'FIRST_STAGE_TERTIARY_ISCED_5',
          label: educationMessages.educationAttainmentISCED5
        },
        {
          value: 'SECOND_STAGE_TERTIARY_ISCED_6',
          label: educationMessages.educationAttainmentISCED6
        },
        {
          value: 'NOT_STATED',
          label: educationMessages.educationAttainmentNotStated
        }
      ],
      conditionals: [conditionals.fathersDetailsExist]
    },
    {
      name: 'addressSameAsMother',
      type: RADIO_GROUP,
      label: addressMessages.addressSameAsMother,
      required: true,
      initialValue: true,
      validate: [],
      options: [
        { value: true, label: addressMessages.confirm },
        { value: false, label: addressMessages.deny }
      ],
      conditionals: [conditionals.fathersDetailsExist],
      mapping: {
        mutation: copyAddressTransformer(
          'CURRENT',
          'mother',
          'CURRENT',
          'father'
        ),
        query: sameAddressFieldTransformer(
          'CURRENT',
          'mother',
          'CURRENT',
          'father'
        )
      }
    },
    {
      name: 'currentAddress',
      type: SUBSECTION,
      label: messages.currentAddress,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.fathersDetailsExist,
        conditionals.addressSameAsMother
      ]
    },
    {
      name: 'country',
      type: SELECT_WITH_OPTIONS,
      label: addressMessages.country,
      required: true,
      initialValue: window.config.COUNTRY.toUpperCase(),
      validate: [],
      options: countries,
      conditionals: [conditionals.addressSameAsMother],
      mapping: {
        mutation: fieldToAddressTransformer('CURRENT'),
        query: addressToFieldTransformer('CURRENT')
      }
    },
    {
      name: 'state',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.state,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_LOCATIONS_KEY,
        dependency: 'country'
      },
      conditionals: [conditionals.country, conditionals.addressSameAsMother],
      mapping: {
        mutation: fieldToAddressTransformer('CURRENT'),
        query: addressToFieldTransformer('CURRENT')
      }
    },
    {
      name: 'district',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.district,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_LOCATIONS_KEY,
        dependency: 'state'
      },
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.addressSameAsMother
      ],
      mapping: {
        mutation: fieldToAddressTransformer('CURRENT'),
        query: addressToFieldTransformer('CURRENT')
      }
    },
    {
      name: 'addressLine4',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.addressLine4,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_LOCATIONS_KEY,
        dependency: 'district'
      },
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressSameAsMother
      ],
      mapping: {
        mutation: fieldToAddressTransformer('CURRENT', 6),
        query: addressToFieldTransformer('CURRENT', 6)
      }
    },
    {
      name: 'addressLine3',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.addressLine3,
      required: false,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_LOCATIONS_KEY,
        dependency: 'addressLine4'
      },
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.addressSameAsMother,
        conditionals.isNotCityLocation
      ],
      mapping: {
        mutation: fieldToAddressTransformer('CURRENT', 4),
        query: addressToFieldTransformer('CURRENT', 4)
      }
    },
    {
      name: 'addressLine3CityOption',
      type: TEXT,
      label: addressMessages.addressLine3CityOption,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.addressSameAsMother,
        conditionals.isCityLocation
      ],
      mapping: {
        mutation: fieldToAddressTransformer('CURRENT', 5),
        query: addressToFieldTransformer('CURRENT', 5)
      }
    },
    {
      name: 'addressLine2',
      type: TEXT,
      label: addressMessages.addressLine2,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.addressLine3,
        conditionals.addressSameAsMother
      ],
      mapping: {
        mutation: fieldToAddressTransformer('CURRENT', 3),
        query: addressToFieldTransformer('CURRENT', 3)
      }
    },
    {
      name: 'addressLine1CityOption',
      type: TEXT,
      label: addressMessages.addressLine1,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.isCityLocation,
        conditionals.addressSameAsMother
      ],
      mapping: {
        mutation: fieldToAddressTransformer('CURRENT', 2),
        query: addressToFieldTransformer('CURRENT', 2)
      }
    },
    {
      name: 'postCodeCityOption',
      type: TEL,
      label: addressMessages.postCode,
      required: false,
      initialValue: '',
      validate: [numeric, maxLength(4)],
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.addressSameAsMother,
        conditionals.isCityLocation
      ],
      mapping: {
        mutation: fieldToAddressTransformer('CURRENT', 0, 'postalCode'),
        query: addressToFieldTransformer('CURRENT', 0, 'postalCode')
      }
    },
    {
      name: 'addressLine1',
      type: TEXT,
      label: addressMessages.addressLine1,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.addressLine3,
        conditionals.addressSameAsMother
      ],
      mapping: {
        mutation: fieldToAddressTransformer('CURRENT', 1),
        query: addressToFieldTransformer('CURRENT', 1)
      }
    },
    {
      name: 'postCode',
      type: TEL,
      label: addressMessages.postCode,
      required: false,
      initialValue: '',
      validate: [numeric, maxLength(4)],
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.addressLine3,
        conditionals.addressSameAsMother
      ],
      mapping: {
        mutation: fieldToAddressTransformer('CURRENT', 0, 'postalCode'),
        query: addressToFieldTransformer('CURRENT', 0, 'postalCode')
      }
    },
    {
      name: 'permanentAddressSameAsMother',
      type: RADIO_GROUP,
      label: addressMessages.permanentAddressSameAsMother,
      required: true,
      initialValue: true,
      validate: [],
      options: [
        { value: true, label: messages.confirm },
        { value: false, label: messages.deny }
      ],
      conditionals: [conditionals.fathersDetailsExist],
      mapping: {
        mutation: copyAddressTransformer(
          'PERMANENT',
          'mother',
          'PERMANENT',
          'father'
        ),
        query: sameAddressFieldTransformer(
          'PERMANENT',
          'mother',
          'PERMANENT',
          'father'
        )
      }
    },
    {
      name: 'permanentAddress',
      type: SUBSECTION,
      label: messages.permanentAddress,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.fathersDetailsExist,
        conditionals.permanentAddressSameAsMother
      ]
    },
    {
      name: 'countryPermanent',
      type: SELECT_WITH_OPTIONS,
      label: addressMessages.country,
      required: true,
      initialValue: window.config.COUNTRY.toUpperCase(),
      validate: [],
      options: countries,
      conditionals: [
        conditionals.fathersDetailsExist,
        conditionals.permanentAddressSameAsMother
      ],
      mapping: {
        mutation: fieldToAddressTransformer('PERMANENT', 0, 'country'),
        query: addressToFieldTransformer('PERMANENT', 0, 'country')
      }
    },
    {
      name: 'statePermanent',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.state,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_LOCATIONS_KEY,
        dependency: 'countryPermanent'
      },
      conditionals: [
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent
      ],
      mapping: {
        mutation: fieldToAddressTransformer('PERMANENT', 0, 'state'),
        query: addressToFieldTransformer('PERMANENT', 0, 'state')
      }
    },
    {
      name: 'districtPermanent',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.district,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_LOCATIONS_KEY,
        dependency: 'statePermanent'
      },
      conditionals: [
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent,
        conditionals.statePermanent
      ],
      mapping: {
        mutation: fieldToAddressTransformer('PERMANENT', 0, 'district'),
        query: addressToFieldTransformer('PERMANENT', 0, 'district')
      }
    },
    {
      name: 'addressLine4Permanent',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.addressLine4,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_LOCATIONS_KEY,
        dependency: 'districtPermanent'
      },
      conditionals: [
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent
      ],
      mapping: {
        mutation: fieldToAddressTransformer('PERMANENT', 6),
        query: addressToFieldTransformer('PERMANENT', 6)
      }
    },
    {
      name: 'addressLine3Permanent',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.addressLine3,
      required: false,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_LOCATIONS_KEY,
        dependency: 'addressLine4Permanent'
      },
      conditionals: [
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent,
        conditionals.addressLine4Permanent,
        conditionals.isNotCityLocationPermanent
      ],
      mapping: {
        mutation: fieldToAddressTransformer('PERMANENT', 4),
        query: addressToFieldTransformer('PERMANENT', 4)
      }
    },
    {
      name: 'addressLine3CityOptionPermanent',
      type: TEXT,
      label: addressMessages.addressLine3CityOption,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent,
        conditionals.addressLine4Permanent,
        conditionals.isCityLocationPermanent
      ],
      mapping: {
        mutation: fieldToAddressTransformer('PERMANENT', 5),
        query: addressToFieldTransformer('PERMANENT', 5)
      }
    },
    {
      name: 'addressLine2Permanent',
      type: TEXT,
      label: addressMessages.addressLine2,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent,
        conditionals.addressLine4Permanent,
        conditionals.addressLine3Permanent
      ],
      mapping: {
        mutation: fieldToAddressTransformer('PERMANENT', 3),
        query: addressToFieldTransformer('PERMANENT', 3)
      }
    },
    {
      name: 'addressLine1CityOptionPermanent',
      type: TEXT,
      label: addressMessages.addressLine1,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent,
        conditionals.addressLine4Permanent,
        conditionals.isCityLocationPermanent
      ],
      mapping: {
        mutation: fieldToAddressTransformer('PERMANENT', 2),
        query: addressToFieldTransformer('PERMANENT', 2)
      }
    },
    {
      name: 'postCodeCityOptionPermanent',
      type: TEL,
      label: addressMessages.postCode,
      required: false,
      initialValue: '',
      validate: [numeric, maxLength(4)],
      conditionals: [
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent,
        conditionals.addressLine4Permanent,
        conditionals.isCityLocationPermanent
      ],
      mapping: {
        mutation: fieldToAddressTransformer('PERMANENT', 0, 'postalCode'),
        query: addressToFieldTransformer('PERMANENT', 0, 'postalCode')
      }
    },
    {
      name: 'addressLine1Permanent',
      type: TEXT,
      label: addressMessages.addressLine1,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent,
        conditionals.addressLine4Permanent,
        conditionals.addressLine3Permanent
      ],
      mapping: {
        mutation: fieldToAddressTransformer('PERMANENT', 1),
        query: addressToFieldTransformer('PERMANENT', 1)
      }
    },
    {
      name: 'postCodePermanent',
      type: TEL,
      label: addressMessages.postCode,
      required: false,
      initialValue: '',
      validate: [numeric, maxLength(4)],
      conditionals: [
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent,
        conditionals.addressLine4Permanent,
        conditionals.addressLine3Permanent
      ],
      mapping: {
        mutation: fieldToAddressTransformer('PERMANENT', 0, 'postalCode'),
        query: addressToFieldTransformer('PERMANENT', 0, 'postalCode')
      }
    }
  ],
  mapping: {
    query: emptyFatherSectionTransformer
  }
}
