import {
  IFormSection,
  ViewType,
  TEXT,
  SELECT_WITH_OPTIONS,
  DATE,
  SUBSECTION,
  SELECT_WITH_DYNAMIC_OPTIONS,
  RADIO_GROUP,
  TEL,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  FETCH_BUTTON
} from '@register/forms'
import { defineMessages } from 'react-intl'
import {
  bengaliOnlyNameFormat,
  englishOnlyNameFormat,
  isValidBirthDate,
  validIDNumber,
  numeric,
  maxLength,
  isDateInPast,
  phoneNumberFormat
} from '@register/utils/validate'
import { countries } from '@register/forms/countries'
import {
  messages as identityMessages,
  identityNameMapper,
  identityTypeMapper,
  deathIdentityOptions
} from '@register/forms/identity'
import { messages as addressMessages } from '@register/forms/address'
import { OFFLINE_LOCATIONS_KEY } from '@register/offline/reducer'
import { conditionals } from '@register/forms/utils'

import {
  fieldValueSectionExchangeTransformer,
  fieldToAddressTransformer,
  fieldToIdentifierTransformer,
  fieldToNameTransformer,
  fieldNameTransformer,
  fieldToArrayTransformer,
  copyAddressTransformer,
  fieldToPhoneNumberTransformer
} from '@register/forms/mappings/mutation/field-mappings'
import {
  nestedValueToFieldTransformer,
  identifierToFieldTransformer,
  nameToFieldTransformer,
  arrayToFieldTransformer,
  fieldValueTransformer,
  addressToFieldTransformer,
  sameAddressFieldTransformer,
  sectionFieldExchangeTransformer
} from '@register/forms/mappings/query/field-mappings'
import {
  phoneNumberToFieldTransformer,
  getInformantSectionTransformer
} from '@register/forms/register/fieldDefinitions/death/mappings/query/application-mappings'
import {
  fieldValueNestingTransformer,
  setInformantSectionTransformer,
  OBJECT_TYPE
} from '@register/forms/register/fieldDefinitions/death/mappings/mutation/applicant-mapping'
import {
  FETCH_REGISTRATION,
  transformRegistrationData
} from '@register/forms/register/queries/registration'
import {
  FETCH_PERSON,
  transformInformantData
} from '@register/forms/register/queries/person'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  applicantTab: {
    id: 'register.form.tabs.applicantTab',
    defaultMessage: 'Applicant',
    description: 'Tab title for Applicant'
  },
  applicantTitle: {
    id: 'register.form.section.applicantTitle',
    defaultMessage: "Applicant's details",
    description: 'Form section title for applicants'
  },
  applicantsIdType: {
    id: 'formFields.applicantsIdType',
    defaultMessage: 'Existing ID',
    description: 'Label for form field: Existing ID'
  },
  applicantsGivenNames: {
    id: 'formFields.applicantsGivenNames',
    defaultMessage: 'First Name(s) in Bengali',
    description: 'Label for form field: Given names'
  },
  applicantsFamilyName: {
    id: 'formFields.applicantsFamilyName',
    defaultMessage: 'Last Name(s) in Bengali',
    description: 'Label for form field: Family name'
  },
  applicantsGivenNamesEng: {
    id: 'formFields.applicantsGivenNamesEng',
    defaultMessage: 'First Name(s) in English',
    description: 'Label for form field: Given names in english'
  },
  applicantsFamilyNameEng: {
    id: 'formFields.applicantsFamilyNameEng',
    defaultMessage: 'Last Name(s) in English',
    description: 'Label for form field: Family name in english'
  },
  applicantsNationality: {
    id: 'formFields.applicants.nationality',
    defaultMessage: 'Nationality',
    description: 'Label for form field: Nationality'
  },
  applicantsDateOfBirth: {
    id: 'formFields.applicantsDateOfBirth',
    defaultMessage: 'Date of Birth',
    description: 'Label for form field: Date of birth'
  },
  applicantsRelationWithDeceased: {
    id: 'formFields.applicantsRelationWithDeceased',
    defaultMessage: 'Relationship to Deceased',
    description: 'Label for Relationship to Deceased select'
  },
  relationFather: {
    id: 'formFields.applicantRelation.father',
    defaultMessage: 'Father',
    description: 'Label for option Father'
  },
  relationMother: {
    id: 'formFields.applicantRelation.mother',
    defaultMessage: 'Mother',
    description: 'Label for option Mother'
  },
  relationSpouse: {
    id: 'formFields.applicantRelation.spouse',
    defaultMessage: 'Spouse',
    description: 'Label for option Spouse'
  },
  relationSon: {
    id: 'formFields.applicantRelation.son',
    defaultMessage: 'Son',
    description: 'Label for option Son'
  },
  relationDaughter: {
    id: 'formFields.applicantRelation.daughter',
    defaultMessage: 'Daughter',
    description: 'Label for option Daughter'
  },
  relationExtendedFamily: {
    id: 'formFields.applicantRelation.extendedFamily',
    defaultMessage: 'Extended Family',
    description: 'Label for option Extended Family'
  },
  relationOther: {
    id: 'formFields.applicantRelation.other',
    defaultMessage: 'Other(Specify)',
    description: 'Label for option Other'
  },
  applicantOtherRelationship: {
    id: 'formFields.applicantOtherRelationship',
    defaultMessage: 'Other relation',
    description: 'Label for form field: Other relation'
  },
  permanentAddressSameAsCurrent: {
    id: 'formFields.applicantsCurrentAddressSameAsPermanent',
    defaultMessage:
      'Is applicant’s permanent address the same as their current address?',
    description:
      'Title for the radio button to select that the applicants current address is the same as their permanent address'
  },
  applicantsPhone: {
    defaultMessage: 'Phone number',
    id: 'formFields.applicant.phone',
    description: 'Input label for phone input'
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
  fetchInformantDetails: {
    id: 'formFields.fetchInformantDetails',
    defaultMessage: "Retrieve Informant's Details",
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

const NESTED_SECTION = 'individual'

export const applicantsSection: IFormSection = {
  id: 'informant',
  viewType: 'form' as ViewType,
  name: messages.applicantTab,
  title: messages.applicantTitle,
  fields: [
    {
      name: 'iDType',
      type: SELECT_WITH_OPTIONS,
      label: messages.applicantsIdType,
      required: true,
      initialValue: '',
      validate: [],
      options: deathIdentityOptions,
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToIdentifierTransformer('type')
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          identifierToFieldTransformer('type')
        )
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
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToIdentifierTransformer('otherType')
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          identifierToFieldTransformer('otherType')
        )
      }
    },
    {
      name: 'applicantID',
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
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToIdentifierTransformer('id')
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          identifierToFieldTransformer('id')
        )
      }
    },
    {
      name: 'fetchButton',
      type: FETCH_BUTTON,
      label: messages.fetchInformantDetails,
      required: false,
      initialValue: '',
      queryMap: {
        BIRTH_REGISTRATION_NUMBER: {
          query: FETCH_REGISTRATION,
          inputs: [
            {
              name: 'identifier',
              valueField: 'applicantID'
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
              valueField: 'applicantID'
            }
          ],
          responseTransformer: transformInformantData,
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
      name: 'applicantFirstNames',
      type: TEXT,
      label: messages.applicantsGivenNames,
      required: false,
      initialValue: '',
      validate: [bengaliOnlyNameFormat],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToNameTransformer('bn', 'firstNames'),
          OBJECT_TYPE.NAME
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          nameToFieldTransformer('bn', 'firstNames')
        )
      }
    },
    {
      name: 'applicantFamilyName',
      type: TEXT,
      label: messages.applicantsFamilyName,
      required: true,
      initialValue: '',
      validate: [bengaliOnlyNameFormat],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToNameTransformer('bn', 'familyName'),
          OBJECT_TYPE.NAME
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          nameToFieldTransformer('bn', 'familyName')
        )
      }
    },
    {
      name: 'applicantFirstNamesEng',
      type: TEXT,
      label: messages.applicantsGivenNamesEng,
      required: false,
      initialValue: '',
      validate: [englishOnlyNameFormat],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToNameTransformer('en', 'firstNames'),
          OBJECT_TYPE.NAME
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          nameToFieldTransformer('en', 'firstNames')
        )
      }
    },
    {
      name: 'applicantFamilyNameEng',
      type: TEXT,
      label: messages.applicantsFamilyNameEng,
      required: true,
      initialValue: '',
      validate: [englishOnlyNameFormat],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToNameTransformer('en', 'familyName'),
          OBJECT_TYPE.NAME
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          nameToFieldTransformer('en', 'familyName')
        )
      }
    },
    {
      name: 'nationality',
      type: SELECT_WITH_OPTIONS,
      label: messages.applicantsNationality,
      required: false,
      initialValue: 'BGD',
      validate: [],
      options: countries,
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToArrayTransformer
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          arrayToFieldTransformer
        )
      }
    },
    {
      name: 'applicantBirthDate',
      type: DATE,
      label: messages.applicantsDateOfBirth,
      required: false,
      initialValue: '',
      validate: [isValidBirthDate, isDateInPast],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldNameTransformer('birthDate')
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          fieldValueTransformer('birthDate')
        )
      }
    },
    {
      name: 'applicantsRelationToDeceased',
      type: SELECT_WITH_OPTIONS,
      label: messages.applicantsRelationWithDeceased,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'FATHER', label: messages.relationFather },
        { value: 'MOTHER', label: messages.relationMother },
        { value: 'SPOUSE', label: messages.relationSpouse },
        {
          value: 'SON',
          label: messages.relationSon
        },
        {
          value: 'DAUGHTER',
          label: messages.relationDaughter
        },
        {
          value: 'EXTENDED_FAMILY',
          label: messages.relationExtendedFamily
        },
        {
          value: 'OTHER',
          label: messages.relationOther
        }
      ],
      mapping: {
        mutation: fieldValueSectionExchangeTransformer(
          'informant',
          'relationship'
        ),
        query: sectionFieldExchangeTransformer('informant', 'relationship')
      }
    },
    {
      name: 'applicantOtherRelationship',
      type: TEXT,
      label: messages.applicantOtherRelationship,
      required: true,
      initialValue: '',
      validate: [],
      mapping: {
        mutation: fieldValueSectionExchangeTransformer(
          'informant',
          'otherRelationship'
        ),
        query: sectionFieldExchangeTransformer('informant', 'otherRelationship')
      },
      conditionals: [conditionals.otherRelationship]
    },
    {
      name: 'applicantPhone',
      type: TEL,
      label: messages.applicantsPhone,
      required: true,
      initialValue: '',
      validate: [phoneNumberFormat],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToPhoneNumberTransformer()
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          phoneNumberToFieldTransformer
        )
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
      name: 'country',
      type: SELECT_WITH_OPTIONS,
      label: addressMessages.country,
      required: true,
      initialValue: window.config.COUNTRY.toUpperCase(),
      validate: [],
      options: countries,
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('CURRENT'),
          OBJECT_TYPE.NAME
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('CURRENT')
        )
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
      conditionals: [conditionals.country],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('CURRENT'),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('CURRENT')
        )
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
      conditionals: [conditionals.country, conditionals.state],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('CURRENT'),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('CURRENT')
        )
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
        conditionals.district
      ],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('CURRENT', 6),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('CURRENT', 6)
        )
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
        conditionals.isNotCityLocation
      ],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('CURRENT', 4),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('CURRENT', 4)
        )
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
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('CURRENT', 5),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('CURRENT', 5)
        )
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
        conditionals.addressLine3
      ],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('CURRENT', 3),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('CURRENT', 3)
        )
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
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('CURRENT', 2),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('CURRENT', 2)
        )
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
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('CURRENT', 0, 'postalCode'),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('CURRENT', 0, 'postalCode')
        )
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
        conditionals.addressLine3
      ],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('CURRENT', 1),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('CURRENT', 1)
        )
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
        conditionals.addressLine3
      ],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('CURRENT', 0, 'postalCode'),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('CURRENT', 0, 'postalCode')
        )
      }
    },
    {
      name: 'permanentAddress',
      type: SUBSECTION,
      label: messages.permanentAddress,
      initialValue: '',
      validate: [],
      mapping: {
        mutation: fieldValueNestingTransformer(NESTED_SECTION)
      }
    },
    {
      name: 'applicantPermanentAddressSameAsCurrent',
      type: RADIO_GROUP,
      label: messages.permanentAddressSameAsCurrent,
      required: true,
      initialValue: true,
      validate: [],
      options: [
        { value: true, label: addressMessages.confirm },
        { value: false, label: addressMessages.deny }
      ],
      conditionals: [],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          copyAddressTransformer(
            'CURRENT',
            'informant',
            'PERMANENT',
            'informant',
            true,
            NESTED_SECTION
          ),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          sameAddressFieldTransformer(
            'CURRENT',
            NESTED_SECTION,
            'PERMANENT',
            NESTED_SECTION
          )
        )
      }
    },
    {
      name: 'countryPermanent',
      type: SELECT_WITH_OPTIONS,
      label: addressMessages.country,
      required: true,
      initialValue: window.config.COUNTRY.toUpperCase(),
      validate: [],
      options: countries,
      conditionals: [conditionals.applicantPermanentAddressSameAsCurrent],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('PERMANENT', 0, 'country'),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('PERMANENT', 0, 'country')
        )
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
        conditionals.countryPermanent,
        conditionals.applicantPermanentAddressSameAsCurrent
      ],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('PERMANENT', 0, 'state'),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('PERMANENT', 0, 'state')
        )
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
        conditionals.statePermanent,
        conditionals.applicantPermanentAddressSameAsCurrent
      ],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('PERMANENT', 0, 'district'),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('PERMANENT', 0, 'district')
        )
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
        conditionals.districtPermanent,
        conditionals.applicantPermanentAddressSameAsCurrent
      ],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('PERMANENT', 6),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('PERMANENT', 6)
        )
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
        conditionals.isNotCityLocationPermanent,
        conditionals.applicantPermanentAddressSameAsCurrent
      ],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('PERMANENT', 4),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('PERMANENT', 4)
        )
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
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('PERMANENT', 5),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('PERMANENT', 5)
        )
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
        conditionals.addressLine3Permanent,
        conditionals.applicantPermanentAddressSameAsCurrent
      ],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('PERMANENT', 3),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('PERMANENT', 3)
        )
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
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('PERMANENT', 2),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('PERMANENT', 2)
        )
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
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('PERMANENT', 0, 'postalCode'),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('PERMANENT', 0, 'postalCode')
        )
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
        conditionals.addressLine3Permanent,
        conditionals.applicantPermanentAddressSameAsCurrent
      ],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('PERMANENT', 1),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('PERMANENT', 1)
        )
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
        conditionals.addressLine3Permanent,
        conditionals.applicantPermanentAddressSameAsCurrent
      ],
      mapping: {
        mutation: fieldValueNestingTransformer(
          NESTED_SECTION,
          fieldToAddressTransformer('PERMANENT', 0, 'postalCode'),
          OBJECT_TYPE.ADDRESS
        ),
        query: nestedValueToFieldTransformer(
          NESTED_SECTION,
          addressToFieldTransformer('PERMANENT', 0, 'postalCode')
        )
      }
    }
  ],
  mapping: {
    mutation: setInformantSectionTransformer,
    query: getInformantSectionTransformer
  }
}
