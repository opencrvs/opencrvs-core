import { defineMessages } from 'react-intl'
import {
  ViewType,
  TEXT,
  NUMBER,
  DATE,
  SELECT_WITH_OPTIONS,
  SELECT_WITH_DYNAMIC_OPTIONS
} from '@register/forms'
import {
  bengaliOnlyNameFormat,
  englishOnlyNameFormat,
  range,
  isValidBirthDate,
  greaterThanZero,
  maxLength
} from '@register/utils/validate'
import { conditionals } from '@register/forms/utils'
import {
  OFFLINE_FACILITIES_KEY,
  OFFLINE_LOCATIONS_KEY
} from '@register/offline/reducer'
import { messages as addressMessages } from '@register/forms/address'
import { countries } from '@register/forms/countries'
import {
  fieldToNameTransformer,
  sectionFieldToBundleFieldTransformer,
  fieldNameTransformer,
  fieldValueSectionExchangeTransformer
} from '@register/forms/mappings/mutation/field-mappings'
import { eventLocationMutationTransformer } from '@register/forms/register/fieldDefinitions/birth/mappings/mutation/child-mappings'
import {
  nameToFieldTransformer,
  fieldValueTransformer,
  bundleFieldToSectionFieldTransformer,
  sectionFieldExchangeTransformer,
  eventLocationTypeQueryTransformer,
  eventLocationIDQueryTransformer,
  eventLocationQueryTransformer
} from '@register/forms/mappings/query/field-mappings'
import { IFormSection } from '@register/forms/index'

export interface IChildSectionFormData {
  firstName: string
  foo: string
  bar: string
  baz: string
}

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  childTab: {
    id: 'register.form.tabs.childTab',
    defaultMessage: 'Child',
    description: 'Tab title for Child'
  },
  childTitle: {
    id: 'register.form.section.childTitle',
    defaultMessage: "Child's details",
    description: 'Form section title for Child'
  },
  childFirstNames: {
    id: 'formFields.childFirstNames',
    defaultMessage: 'First Name(s) in Bengali',
    description: 'Label for form field: First names'
  },
  childFamilyName: {
    id: 'formFields.childFamilyName',
    defaultMessage: 'Last Name(s) in Bengali',
    description: 'Label for form field: Family name'
  },
  childFirstNamesEng: {
    id: 'formFields.childFirstNamesEng',
    defaultMessage: 'First Name(s) in English',
    description: 'Label for form field: First names in english'
  },
  childFamilyNameEng: {
    id: 'formFields.childFamilyNameEng',
    defaultMessage: 'Last Name(s) in English',
    description: 'Label for form field: Family name in english'
  },
  childSex: {
    id: 'formFields.childSex',
    defaultMessage: 'Sex',
    description: 'Label for form field: Sex name'
  },
  childSexMale: {
    id: 'formFields.childSexMale',
    defaultMessage: 'Male',
    description: 'Option for form field: Sex name'
  },
  childSexFemale: {
    id: 'formFields.childSexFemale',
    defaultMessage: 'Female',
    description: 'Option for form field: Sex name'
  },
  childSexOther: {
    id: 'formFields.childSexOther',
    defaultMessage: 'Other',
    description: 'Option for form field: Sex name'
  },
  childSexUnknown: {
    id: 'formFields.childSexUnknown',
    defaultMessage: 'Unknown',
    description: 'Option for form field: Sex name'
  },
  childDateOfBirth: {
    id: 'formFields.childDateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth'
  },
  attendantAtBirth: {
    id: 'formFields.attendantAtBirth',
    defaultMessage: 'Attendant at birth',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthPhysician: {
    id: 'formFields.attendantAtBirthPhysician',
    defaultMessage: 'Physician',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthNurse: {
    id: 'formFields.attendantAtBirthNurse',
    defaultMessage: 'Nurse',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthMidwife: {
    id: 'formFields.attendantAtBirthMidwife',
    defaultMessage: 'Midwife',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthOtherParamedicalPersonnel: {
    id: 'formFields.attendantAtBirthOtherParamedicalPersonnel',
    defaultMessage: 'Other paramedical personnel',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthLayperson: {
    id: 'formFields.attendantAtBirthLayperson',
    defaultMessage: 'Layperson',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthNone: {
    id: 'formFields.attendantAtBirthNone',
    defaultMessage: 'None',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthOther: {
    id: 'formFields.attendantAtBirthOther',
    defaultMessage: 'Other',
    description: 'Label for form field: Attendant at birth'
  },
  birthType: {
    id: 'formFields.birthType',
    defaultMessage: 'Type of birth',
    description: 'Label for form field: Type of birth'
  },
  birthTypeSingle: {
    id: 'formFields.birthTypeSingle',
    defaultMessage: 'Single',
    description: 'Label for form field: Type of birth'
  },
  birthTypeTwin: {
    id: 'formFields.birthTypeTwin',
    defaultMessage: 'Twin',
    description: 'Label for form field: Type of birth'
  },
  birthTypeTriplet: {
    id: 'formFields.birthTypeTriplet',
    defaultMessage: 'Triplet',
    description: 'Label for form field: Type of birth'
  },
  birthTypeQuadruplet: {
    id: 'formFields.birthTypeQuadruplet',
    defaultMessage: 'Quadruplet',
    description: 'Label for form field: Type of birth'
  },
  birthTypeHigherMultipleDelivery: {
    id: 'formFields.birthTypeHigherMultipleDelivery',
    defaultMessage: 'Higher multiple delivery',
    description: 'Label for form field: Type of birth'
  },
  multipleBirth: {
    id: 'formFields.multipleBirth',
    defaultMessage: 'Order of birth (number)',
    description: 'Label for form field: Order of birth'
  },
  weightAtBirth: {
    id: 'formFields.weightAtBirth',
    defaultMessage: 'Weight at birth',
    description: 'Label for form field: Weight at birth'
  },
  placeOfBirth: {
    id: 'formFields.placeOfBirth',
    defaultMessage: 'Place of delivery',
    description: 'Label for form field: Place of delivery'
  },
  birthLocation: {
    id: 'formFields.birthLocation',
    defaultMessage: 'Hospital / Clinic',
    description: 'Label for form field: Hospital or Health Institution'
  },
  deliveryInstitution: {
    id: 'formFields.deliveryInstitution',
    defaultMessage: 'Type or select institution',
    description: 'Label for form field: Type or select institution'
  },
  deliveryAddress: {
    id: 'formFields.deliveryAddress',
    defaultMessage: 'Address of place of delivery',
    description: 'Label for form field: Address of place of delivery'
  },
  hospital: {
    id: 'formFields.hospital',
    defaultMessage: 'Hospital',
    description: 'Select item for hospital'
  },
  otherHealthInstitution: {
    id: 'formFields.otherHealthInstitution',
    defaultMessage: 'Other Health Institution',
    description: 'Select item for Other Health Institution'
  },
  privateHome: {
    id: 'formFields.privateHome',
    defaultMessage: 'Private Home',
    description: 'Select item for Private Home'
  },
  otherInstitution: {
    id: 'formFields.otherInstitution',
    defaultMessage: 'Other Institution',
    description: 'Select item for Other Institution'
  },
  optionalLabel: {
    id: 'formFields.optionalLabel',
    defaultMessage: 'Optional',
    description: 'Optional label'
  }
})

export const childSection: IFormSection = {
  id: 'child',
  viewType: 'form' as ViewType,
  name: messages.childTab,
  title: messages.childTitle,
  fields: [
    {
      name: 'firstNames',
      type: TEXT,
      label: messages.childFirstNames,
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
      label: messages.childFamilyName,
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
      label: messages.childFirstNamesEng,
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
      label: messages.childFamilyNameEng,
      required: true,
      initialValue: '',
      validate: [englishOnlyNameFormat],
      mapping: {
        mutation: fieldToNameTransformer('en', 'familyName'),
        query: nameToFieldTransformer('en', 'familyName')
      }
    },
    {
      name: 'gender',
      type: SELECT_WITH_OPTIONS,
      label: messages.childSex,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'male', label: messages.childSexMale },
        { value: 'female', label: messages.childSexFemale },
        { value: 'other', label: messages.childSexOther },
        { value: 'unknown', label: messages.childSexUnknown }
      ]
    },
    {
      name: 'childBirthDate',
      type: DATE,
      label: messages.childDateOfBirth,
      required: true,
      initialValue: '',
      validate: [isValidBirthDate],
      mapping: {
        mutation: fieldNameTransformer('birthDate'),
        query: fieldValueTransformer('birthDate')
      }
    },
    {
      name: 'attendantAtBirth',
      type: SELECT_WITH_OPTIONS,
      label: messages.attendantAtBirth,
      required: false,
      initialValue: '',
      validate: [],
      options: [
        { value: 'PHYSICIAN', label: messages.attendantAtBirthPhysician },
        { value: 'NURSE', label: messages.attendantAtBirthNurse },
        { value: 'MIDWIFE', label: messages.attendantAtBirthMidwife },
        {
          value: 'OTHER_PARAMEDICAL_PERSONNEL',
          label: messages.attendantAtBirthOtherParamedicalPersonnel
        },
        { value: 'LAYPERSON', label: messages.attendantAtBirthLayperson },
        { value: 'NONE', label: messages.attendantAtBirthNone },
        { value: 'OTHER', label: messages.attendantAtBirthOther }
      ],
      mapping: {
        mutation: sectionFieldToBundleFieldTransformer(),
        query: bundleFieldToSectionFieldTransformer()
      }
    },
    {
      name: 'birthType',
      type: SELECT_WITH_OPTIONS,
      label: messages.birthType,
      required: false,
      initialValue: '',
      validate: [],
      options: [
        { value: 'SINGLE', label: messages.birthTypeSingle },
        { value: 'TWIN', label: messages.birthTypeTwin },
        { value: 'TRIPLET', label: messages.birthTypeTriplet },
        { value: 'QUADRUPLET', label: messages.birthTypeQuadruplet },
        {
          value: 'HIGHER_MULTIPLE_DELIVERY',
          label: messages.birthTypeHigherMultipleDelivery
        }
      ],
      mapping: {
        mutation: sectionFieldToBundleFieldTransformer(),
        query: bundleFieldToSectionFieldTransformer()
      }
    },
    {
      name: 'multipleBirth',
      type: NUMBER,
      label: messages.multipleBirth,
      required: true,
      initialValue: '',
      validate: [greaterThanZero, maxLength(2)],
      mapping: {
        mutation: fieldValueSectionExchangeTransformer('mother'),
        query: sectionFieldExchangeTransformer('mother')
      }
    },
    {
      name: 'weightAtBirth',
      type: NUMBER,
      step: 0.01,
      label: messages.weightAtBirth,
      required: false,
      initialValue: '',
      validate: [range(0, 6)],
      postfix: 'Kg',
      mapping: {
        mutation: sectionFieldToBundleFieldTransformer(),
        query: bundleFieldToSectionFieldTransformer()
      }
    },
    {
      name: 'placeOfBirth',
      type: SELECT_WITH_OPTIONS,
      label: messages.placeOfBirth,
      required: false,
      initialValue: '',
      validate: [],
      options: [
        { value: 'HOSPITAL', label: messages.hospital },
        {
          value: 'OTHER_HEALTH_INSTITUTION',
          label: messages.otherHealthInstitution
        },
        { value: 'PRIVATE_HOME', label: messages.privateHome },
        { value: 'OTHER', label: messages.otherInstitution }
      ],
      mapping: {
        mutation: eventLocationMutationTransformer(),
        query: eventLocationTypeQueryTransformer()
      }
    },
    {
      name: 'birthLocation',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: messages.birthLocation,
      required: false,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_FACILITIES_KEY,
        dependency: 'placeOfBirth'
      },
      conditionals: [conditionals.placeOfBirthHospital],
      mapping: {
        mutation: eventLocationMutationTransformer(),
        query: eventLocationIDQueryTransformer()
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
      conditionals: [conditionals.otherBirthEventLocation],
      mapping: {
        mutation: eventLocationMutationTransformer(),
        query: eventLocationQueryTransformer()
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
        conditionals.otherBirthEventLocation
      ],
      mapping: {
        mutation: eventLocationMutationTransformer(),
        query: eventLocationQueryTransformer()
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
        conditionals.otherBirthEventLocation
      ],
      mapping: {
        mutation: eventLocationMutationTransformer(),
        query: eventLocationQueryTransformer()
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
        conditionals.otherBirthEventLocation
      ],
      mapping: {
        mutation: eventLocationMutationTransformer(6),
        query: eventLocationQueryTransformer(6)
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
        conditionals.otherBirthEventLocation,
        conditionals.isNotCityLocation
      ],
      mapping: {
        mutation: eventLocationMutationTransformer(4),
        query: eventLocationQueryTransformer(4)
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
        conditionals.otherBirthEventLocation,
        conditionals.isCityLocation
      ],
      mapping: {
        mutation: eventLocationMutationTransformer(5),
        query: eventLocationQueryTransformer(5)
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
        conditionals.otherBirthEventLocation
      ],
      mapping: {
        mutation: eventLocationMutationTransformer(3),
        query: eventLocationQueryTransformer(3)
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
        conditionals.otherBirthEventLocation,
        conditionals.isCityLocation
      ],
      mapping: {
        mutation: eventLocationMutationTransformer(2),
        query: eventLocationQueryTransformer(2)
      }
    },
    {
      name: 'postCodeCityOption',
      type: NUMBER,
      label: addressMessages.postCode,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.otherBirthEventLocation,
        conditionals.isCityLocation
      ],
      mapping: {
        mutation: eventLocationMutationTransformer(0, 'postalCode'),
        query: eventLocationQueryTransformer(0, 'postalCode')
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
        conditionals.otherBirthEventLocation
      ],
      mapping: {
        mutation: eventLocationMutationTransformer(1),
        query: eventLocationQueryTransformer(1)
      }
    },
    {
      name: 'postCode',
      type: NUMBER,
      label: addressMessages.postCode,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.addressLine3,
        conditionals.otherBirthEventLocation
      ],
      mapping: {
        mutation: eventLocationMutationTransformer(0, 'postalCode'),
        query: eventLocationQueryTransformer(0, 'postalCode')
      }
    }
  ]
}
