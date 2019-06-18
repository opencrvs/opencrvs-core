import {
  IFormSection,
  ViewType,
  TEXT,
  SELECT_WITH_OPTIONS,
  DATE,
  SUBSECTION,
  SELECT_WITH_DYNAMIC_OPTIONS,
  RADIO_GROUP,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  FETCH_BUTTON,
  TEL
} from '@register/forms'
import { defineMessages } from 'react-intl'
import {
  bengaliOnlyNameFormat,
  englishOnlyNameFormat,
  isValidBirthDate,
  validIDNumber,
  numeric,
  maxLength
} from '@register/utils/validate'
import { countries } from '@register/forms/countries'

import {
  messages as identityMessages,
  identityNameMapper,
  identityTypeMapper,
  deathIdentityOptions
} from '@register/forms/identity'
import { messages as maritalStatusMessages } from '@register/forms/maritalStatus'
import { messages as addressMessages } from '@register/forms/address'

import { OFFLINE_LOCATIONS_KEY } from '@register/offline/reducer'
import { conditionals } from '@register/forms/utils'
import {
  fieldToNameTransformer,
  fieldToArrayTransformer,
  fieldToIdentifierTransformer,
  fieldToAddressTransformer,
  copyAddressTransformer
} from '@register/forms/mappings/mutation/field-mappings'
import {
  nameToFieldTransformer,
  arrayToFieldTransformer,
  identifierToFieldTransformer,
  addressToFieldTransformer,
  sameAddressFieldTransformer
} from '@register/forms/mappings/query/field-mappings'
import {
  FETCH_REGISTRATION,
  transformRegistrationData
} from '@opencrvs/register/src/forms/register/queries/registration'
import {
  FETCH_PERSON,
  transformPersonData
} from '@opencrvs/register/src/forms/register/queries/person'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  deceasedTab: {
    id: 'register.form.tabs.deceasedTab',
    defaultMessage: 'Deceased',
    description: 'Tab title for Deceased'
  },
  deceasedTitle: {
    id: 'register.form.section.deceasedTitle',
    defaultMessage: "Deceased's details",
    description: 'Form section title for Deceased'
  },
  deceasedIdType: {
    id: 'formFields.deceasedIdType',
    defaultMessage: 'Existing ID',
    description: 'Label for form field: Existing ID'
  },
  fetchDeceasedDetails: {
    id: 'formFields.fetchDeceasedDetails',
    defaultMessage: "Retrieve Deceased's Details",
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
  },
  deceasedGivenNames: {
    id: 'formFields.deceasedGivenNames',
    defaultMessage: 'First Name(s) in Bengali',
    description: 'Label for form field: Given names'
  },
  deceasedFamilyName: {
    id: 'formFields.deceasedFamilyName',
    defaultMessage: 'Last Name(s) in Bengali',
    description: 'Label for form field: Family name'
  },
  deceasedGivenNamesEng: {
    id: 'formFields.deceasedGivenNamesEng',
    defaultMessage: 'First Name(s) in English',
    description: 'Label for form field: Given names in english'
  },
  deceasedFamilyNameEng: {
    id: 'formFields.deceasedFamilyNameEng',
    defaultMessage: 'Last Name(s) in English',
    description: 'Label for form field: Family name in english'
  },
  nationality: {
    id: 'formFields.deceased.nationality',
    defaultMessage: 'Nationality',
    description: 'Label for form field: Nationality'
  },
  deceasedSex: {
    id: 'formFields.deceasedSex',
    defaultMessage: 'Sex',
    description: 'Label for form field: Sex name'
  },
  deceasedSexMale: {
    id: 'formFields.deceasedSexMale',
    defaultMessage: 'Male',
    description: 'Option for form field: Sex name'
  },
  deceasedSexFemale: {
    id: 'formFields.deceasedSexFemale',
    defaultMessage: 'Female',
    description: 'Option for form field: Sex name'
  },
  deceasedSexOther: {
    id: 'formFields.deceasedSexOther',
    defaultMessage: 'Other',
    description: 'Option for form field: Sex name'
  },
  deceasedSexUnknown: {
    id: 'formFields.deceasedSexUnknown',
    defaultMessage: 'Unknown',
    description: 'Option for form field: Sex name'
  },
  deceasedDateOfBirth: {
    id: 'formFields.deceasedDateOfBirth',
    defaultMessage: 'Date of Birth',
    description: 'Label for form field: Date of birth'
  },
  currentAddressSameAsPermanent: {
    id: 'formFields.deceasedCurrentAddressSameAsPermanent',
    defaultMessage:
      'Is deceased’s current address the same as their permanent address?',
    description:
      'Title for the radio button to select that the deceased current address is the same as their permanent address'
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
  }
})

export const deceasedSection: IFormSection = {
  id: 'deceased',
  viewType: 'form' as ViewType,
  name: messages.deceasedTab,
  title: messages.deceasedTitle,
  fields: [
    {
      name: 'iDType',
      type: SELECT_WITH_OPTIONS,
      label: messages.deceasedIdType,
      required: true,
      initialValue: '',
      validate: [],
      options: deathIdentityOptions,
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
      conditionals: [conditionals.iDType],
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
      conditionals: [conditionals.iDAvailable],
      mapping: {
        mutation: fieldToIdentifierTransformer('id'),
        query: identifierToFieldTransformer('id')
      }
    },
    {
      name: 'fetchButton',
      type: FETCH_BUTTON,
      label: messages.fetchDeceasedDetails,
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
      name: 'firstNames',
      type: TEXT,
      label: messages.deceasedGivenNames,
      required: false,
      initialValue: '',
      validate: [bengaliOnlyNameFormat],
      mapping: {
        mutation: fieldToNameTransformer('bn'),
        query: nameToFieldTransformer('bn')
      }
    },
    {
      name: 'familyName',
      type: TEXT,
      label: messages.deceasedFamilyName,
      required: true,
      initialValue: '',
      validate: [bengaliOnlyNameFormat],
      mapping: {
        mutation: fieldToNameTransformer('bn'),
        query: nameToFieldTransformer('bn')
      }
    },
    {
      name: 'firstNamesEng',
      type: TEXT,
      label: messages.deceasedGivenNamesEng,
      required: false,
      initialValue: '',
      validate: [englishOnlyNameFormat],
      mapping: {
        mutation: fieldToNameTransformer('en', 'firstNames'),
        query: nameToFieldTransformer('en', 'firstNames')
      }
    },
    {
      name: 'familyNameEng',
      type: TEXT,
      label: messages.deceasedFamilyNameEng,
      required: true,
      initialValue: '',
      validate: [englishOnlyNameFormat],
      mapping: {
        mutation: fieldToNameTransformer('en', 'familyName'),
        query: nameToFieldTransformer('en', 'familyName')
      }
    },
    {
      name: 'nationality',
      type: SELECT_WITH_OPTIONS,
      label: messages.nationality,
      required: true,
      initialValue: 'BGD',
      validate: [],
      options: countries,
      mapping: {
        mutation: fieldToArrayTransformer,
        query: arrayToFieldTransformer
      }
    },
    {
      name: 'gender',
      type: SELECT_WITH_OPTIONS,
      label: messages.deceasedSex,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'male', label: messages.deceasedSexMale },
        { value: 'female', label: messages.deceasedSexFemale },
        { value: 'other', label: messages.deceasedSexOther },
        { value: 'unknown', label: messages.deceasedSexUnknown }
      ]
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
      ]
    },
    {
      name: 'birthDate',
      type: DATE,
      label: messages.deceasedDateOfBirth,
      required: true,
      initialValue: '',
      validate: [isValidBirthDate]
    },
    {
      name: 'permanentAddress',
      type: SUBSECTION,
      label: messages.permanentAddress,
      initialValue: '',
      validate: []
    },
    {
      name: 'countryPermanent',
      type: SELECT_WITH_OPTIONS,
      label: addressMessages.country,
      required: true,
      initialValue: window.config.COUNTRY.toUpperCase(),
      validate: [],
      options: countries,
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
      conditionals: [conditionals.countryPermanent],
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
    },
    {
      name: 'currentAddress',
      type: SUBSECTION,
      label: messages.currentAddress,
      initialValue: '',
      validate: [],
      conditionals: []
    },
    {
      name: 'currentAddressSameAsPermanent',
      type: RADIO_GROUP,
      label: messages.currentAddressSameAsPermanent,
      required: true,
      initialValue: true,
      validate: [],
      options: [
        { value: true, label: addressMessages.confirm },
        { value: false, label: addressMessages.deny }
      ],
      conditionals: [],
      mapping: {
        mutation: copyAddressTransformer(
          'PERMANENT',
          'deceased',
          'CURRENT',
          'deceased'
        ),
        query: sameAddressFieldTransformer(
          'PERMANENT',
          'deceased',
          'CURRENT',
          'deceased'
        )
      }
    },
    {
      name: 'country',
      type: SELECT_WITH_OPTIONS,
      label: addressMessages.country,
      required: true,
      initialValue: window.config.COUNTRY.toUpperCase(),
      validate: [],
      options: countries,
      conditionals: [conditionals.currentAddressSameAsPermanent],
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
      conditionals: [
        conditionals.country,
        conditionals.currentAddressSameAsPermanent
      ],
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
        conditionals.currentAddressSameAsPermanent
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
        conditionals.currentAddressSameAsPermanent
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
        conditionals.isNotCityLocation,
        conditionals.currentAddressSameAsPermanent
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
        conditionals.currentAddressSameAsPermanent,
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
        conditionals.currentAddressSameAsPermanent
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
        conditionals.currentAddressSameAsPermanent,
        conditionals.isCityLocation
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
        conditionals.currentAddressSameAsPermanent,
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
        conditionals.currentAddressSameAsPermanent
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
        conditionals.currentAddressSameAsPermanent
      ],
      mapping: {
        mutation: fieldToAddressTransformer('CURRENT', 0, 'postalCode'),
        query: addressToFieldTransformer('CURRENT', 0, 'postalCode')
      }
    }
  ]
}
