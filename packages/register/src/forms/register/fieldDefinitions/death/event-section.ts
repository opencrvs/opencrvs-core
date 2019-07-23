import {
  IFormSection,
  ViewType,
  DATE,
  SELECT_WITH_OPTIONS,
  SUBSECTION,
  RADIO_GROUP,
  SELECT_WITH_DYNAMIC_OPTIONS,
  TEXT,
  NUMBER
} from '@register/forms'
import { RadioSize } from '@opencrvs/components/lib/forms'
import { defineMessages } from 'react-intl'
import { isValidDeathOccurrenceDate } from '@register/utils/validate'
import { messages as addressMessages } from '@register/forms/address'
import { countries } from '@register/forms/countries'
import { conditionals } from '@register/forms/utils'
import {
  OFFLINE_FACILITIES_KEY,
  OFFLINE_LOCATIONS_KEY
} from '@register/offline/reducer'
import {
  sectionFieldToBundleFieldTransformer,
  copyEventAddressTransformer
} from '@register/forms/mappings/mutation/field-mappings'
import {
  fieldToDeceasedDateTransformation,
  eventLocationMutationTransformer,
  setRegistrationSectionTransformer
} from '@register/forms/register/fieldDefinitions/death/mappings/mutation/event-mappings'
import {
  eventLocationIDQueryTransformer,
  bundleFieldToSectionFieldTransformer,
  eventLocationQueryTransformer
} from '@register/forms/mappings/query/field-mappings'
import {
  deceasedDateToFieldTransformation,
  deathPlaceToFieldTransformer,
  getRegistrationSectionTransformer
} from '@register/forms/register/fieldDefinitions/death/mappings/query/event-mappings'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  deathEventTab: {
    id: 'register.form.section.deathEvent.name',
    defaultMessage: 'When did the death occur?',
    description: 'Form section name for Death Event'
  },
  deathEventTitle: {
    id: 'register.form.section.deathEvent.title',
    defaultMessage: 'When did the death occur?',
    description: 'Form section title for Death Event'
  },
  deathDate: {
    id: 'form.field.label.deathDate',
    defaultMessage:
      'Enter the date in the format day, month and year. For example 24 10 2020.',
    description: 'Label for form field: Date of occurrence'
  },
  manner: {
    id: 'form.field.label.mannerOfDeath',
    defaultMessage: 'What was the manner of death?',
    description: 'Label for form field: Manner of death'
  },
  selectOne: {
    id: 'form.field.label.selectOne',
    defaultMessage: 'Please select an option',
    description: 'Generic label for select on option'
  },
  mannerNatural: {
    id: 'form.field.label.mannerOfDeathNatural',
    defaultMessage: 'Natural causes',
    description: 'Option for form field: Manner of death'
  },
  mannerAccident: {
    id: 'form.field.label.mannerOfDeathAccident',
    defaultMessage: 'Accident',
    description: 'Option for form field: Manner of death'
  },
  mannerSuicide: {
    id: 'form.field.label.mannerOfDeathSuicide',
    defaultMessage: 'Suicide',
    description: 'Option for form field: Manner of death'
  },
  mannerHomicide: {
    id: 'form.field.label.mannerOfDeathHomicide',
    defaultMessage: 'Homicide',
    description: 'Option for form field: Manner of death'
  },
  mannerUndetermined: {
    id: 'form.field.label.mannerOfDeathUndetermined',
    defaultMessage: 'Manner undetermined',
    description: 'Option for form field: Manner of death'
  },
  deathPlace: {
    id: 'form.field.label.deathPlace',
    defaultMessage: 'Place of Occurrence of Death',
    description: 'Title for place of occurrence of death'
  },
  deathAtFacility: {
    id: 'form.field.label.deathAtFacility',
    defaultMessage: 'What hospital did the death occur at?',
    description: 'Label for form field: Hospital or Health Institution'
  },
  deathAtPrivateHome: {
    id: 'form.field.label.deathAtPrivateHome',
    defaultMessage: 'What is the address of the private home?',
    description: 'Label for form field: Private Home Address'
  },
  deathAtOtherLocation: {
    id: 'form.field.label.deathAtOtherLocation',
    defaultMessage: 'What is the other address did the death occur at?',
    description: 'Label for form field: Other Location Address'
  },
  deathPlaceAddress: {
    id: 'form.field.label.deathPlaceAddress',
    defaultMessage: 'Where did the death occur?',
    description: 'Label for form field: Place of occurrence of death'
  },
  deathPlaceAddressSameAsPermanent: {
    id: 'form.field.label.deathPlaceAddressSameAsPermanent',
    defaultMessage: 'Permanent address of the deceased',
    description: 'Option for form field: Place of occurrence of death'
  },
  deathPlaceAddressSameAsCurrent: {
    id: 'form.field.label.deathPlaceAddressSameAsCurrent',
    defaultMessage: 'Current address of the deceased',
    description: 'Option for form field: Place of occurrence of death'
  },
  deathPlaceAddressOther: {
    id: 'form.field.label.deathPlaceAddressOther',
    defaultMessage: 'Different Address',
    description: 'Option for form field: Place of occurrence of death'
  },
  deathPlaceAddressType: {
    id: 'form.field.label.deathPlaceAddressType',
    defaultMessage: 'Type of Place',
    description: 'Label for form field: Type of place of death occurrence'
  },
  hospital: {
    id: 'form.field.label.hospital',
    defaultMessage: 'Hospital',
    description: 'Select item for hospital'
  },
  otherHealthInstitution: {
    id: 'form.field.label.otherHealthInstitution',
    defaultMessage: 'Other Health Institution',
    description: 'Select item for Other Health Institution'
  },
  healthInstitution: {
    id: 'form.field.label.healthInstitution',
    defaultMessage: 'Health Institution',
    description: 'Select item for Health Institution'
  },
  privateHome: {
    id: 'form.field.label.privateHome',
    defaultMessage: 'Private Home',
    description: 'Select item for Private Home'
  },
  otherInstitution: {
    id: 'form.field.label.otherInstitution',
    defaultMessage: 'Other',
    description: 'Select item for Other Institution'
  },
  select: {
    id: 'register.select.placeholder',
    defaultMessage: 'Select'
  }
})

export const eventSection: IFormSection = {
  id: 'deathEvent',
  viewType: 'form' as ViewType,
  name: messages.deathEventTab,
  title: messages.deathEventTitle,
  groups: [
    {
      id: 'deathEvent-deathDate',
      fields: [
        {
          name: 'deathDate',
          type: DATE,
          label: messages.deathEventTitle,
          notice: messages.deathDate,
          ignorePlaceHolder: true,
          required: true,
          initialValue: '',
          validate: [isValidDeathOccurrenceDate],
          mapping: {
            mutation: fieldToDeceasedDateTransformation('deceased'),
            query: deceasedDateToFieldTransformation('deceased')
          }
        }
      ]
    },
    {
      id: 'deathEvent-deathManner',
      fields: [
        {
          name: 'manner',
          type: RADIO_GROUP,
          label: messages.deathEventMannerTitle,
          required: false,
          initialValue: '',
          validate: [],
          size: RadioSize.LARGE,
          placeholder: messages.select,
          options: [
            { value: 'NATURAL_CAUSES', label: messages.mannerNatural },
            { value: 'ACCIDENT', label: messages.mannerAccident },
            {
              value: 'SUICIDE',
              label: messages.mannerSuicide
            },
            {
              value: 'HOMICIDE',
              label: messages.mannerHomicide
            },
            {
              value: 'MANNER_UNDETERMINED',
              label: messages.mannerUndetermined
            }
          ],
          mapping: {
            mutation: sectionFieldToBundleFieldTransformer('mannerOfDeath'),
            query: bundleFieldToSectionFieldTransformer('mannerOfDeath')
          }
        }
      ]
    },
    {
      id: 'deathEvent-deathPlaceAddress',
      fields: [
        {
          name: 'deathPlaceAddress',
          type: RADIO_GROUP,
          label: messages.deathPlaceAddress,
          required: true,
          initialValue: '',
          validate: [],
          size: RadioSize.LARGE,
          options: [
            {
              value: 'PERMANENT',
              label: messages.deathPlaceAddressSameAsPermanent
            },
            {
              value: 'CURRENT',
              label: messages.deathPlaceAddressSameAsCurrent
            },
            { value: 'PRIVATE_HOME', label: messages.privateHome },
            { value: 'HEALTH_INSTITUTION', label: messages.healthInstitution },
            { value: 'OTHER', label: messages.otherInstitution }
          ],
          conditionals: [],
          mapping: {
            mutation: copyEventAddressTransformer('deceased'),
            query: deathPlaceToFieldTransformer
          }
        }
      ]
    },
    {
      id: 'deathEvent-deathLocation',
      conditionals: [conditionals.deathPlaceAddressTypeHeathInstitue],
      fields: [
        {
          name: 'deathLocation',
          type: SELECT_WITH_DYNAMIC_OPTIONS,
          label: messages.deathAtFacility,
          required: false,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
          dynamicOptions: {
            resource: OFFLINE_FACILITIES_KEY,
            dependency: 'deathPlaceAddress'
          },
          mapping: {
            mutation: eventLocationMutationTransformer(),
            query: eventLocationIDQueryTransformer()
          }
        }
      ]
    },
    {
      id: 'deathEvent-deathAtPrivateHome',
      title: messages.deathAtPrivateHome,
      conditionals: [conditionals.deathPlaceAtPrivateHome],
      fields: [
        {
          name: 'country',
          type: SELECT_WITH_OPTIONS,
          label: addressMessages.country,
          required: true,
          initialValue: window.config.COUNTRY.toUpperCase(),
          validate: [],
          placeholder: messages.select,
          options: countries,
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
          placeholder: messages.select,
          dynamicOptions: {
            resource: OFFLINE_LOCATIONS_KEY,
            dependency: 'country'
          },
          conditionals: [conditionals.country],
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
          placeholder: messages.select,
          dynamicOptions: {
            resource: OFFLINE_LOCATIONS_KEY,
            dependency: 'state'
          },
          conditionals: [conditionals.country, conditionals.state],
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
          placeholder: messages.select,
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
          placeholder: messages.select,
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
            conditionals.addressLine3
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
            conditionals.addressLine3
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
            conditionals.addressLine3
          ],
          mapping: {
            mutation: eventLocationMutationTransformer(0, 'postalCode'),
            query: eventLocationQueryTransformer(0, 'postalCode')
          }
        }
      ]
    },
    {
      id: 'deathEvent-deathAtOtherLocation',
      title: messages.deathAtOtherLocation,
      conditionals: [conditionals.deathPlaceOther],
      fields: [
        {
          name: 'country',
          type: SELECT_WITH_OPTIONS,
          label: addressMessages.country,
          required: true,
          initialValue: window.config.COUNTRY.toUpperCase(),
          validate: [],
          placeholder: messages.select,
          options: countries,
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
          placeholder: messages.select,
          dynamicOptions: {
            resource: OFFLINE_LOCATIONS_KEY,
            dependency: 'country'
          },
          conditionals: [conditionals.country],
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
          placeholder: messages.select,
          dynamicOptions: {
            resource: OFFLINE_LOCATIONS_KEY,
            dependency: 'state'
          },
          conditionals: [conditionals.country, conditionals.state],
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
          placeholder: messages.select,
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
          placeholder: messages.select,
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
            conditionals.addressLine3
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
            conditionals.addressLine3
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
            conditionals.addressLine3
          ],
          mapping: {
            mutation: eventLocationMutationTransformer(0, 'postalCode'),
            query: eventLocationQueryTransformer(0, 'postalCode')
          }
        }
      ]
    }
  ],
  mapping: {
    mutation: setRegistrationSectionTransformer,
    query: getRegistrationSectionTransformer
  }
}
