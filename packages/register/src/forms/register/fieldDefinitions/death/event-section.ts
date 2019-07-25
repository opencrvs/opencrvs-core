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
import { formMessages as messages } from '@register/i18n/messages'
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

export const eventSection: IFormSection = {
  id: 'deathEvent',
  viewType: 'form' as ViewType,
  name: messages.deathEventName,
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
          label: messages.manner,
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
          label: messages.country,
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
          label: messages.state,
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
          label: messages.district,
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
          label: messages.addressLine4,
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
          label: messages.addressLine3,
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
          label: messages.addressLine3CityOption,
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
          label: messages.addressLine2,
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
          label: messages.addressLine1,
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
          label: messages.postCode,
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
          label: messages.addressLine1,
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
          label: messages.postCode,
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
          label: messages.country,
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
          label: messages.state,
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
          label: messages.district,
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
          label: messages.addressLine4,
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
          label: messages.addressLine3,
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
          label: messages.addressLine3CityOption,
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
          label: messages.addressLine2,
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
          label: messages.addressLine1,
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
          label: messages.postCode,
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
          label: messages.addressLine1,
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
          label: messages.postCode,
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
