import {
  ViewType,
  DATE,
  SELECT_WITH_OPTIONS,
  RADIO_GROUP,
  SELECT_WITH_DYNAMIC_OPTIONS,
  TEXT,
  NUMBER,
  ISerializedFormSection
} from '@register/forms'
import { RadioSize } from '@opencrvs/components/lib/forms'

import { formMessages as messages } from '@register/i18n/messages'
import { countries } from '@register/forms/countries'
import { conditionals } from '@register/forms/utils'
import {
  OFFLINE_FACILITIES_KEY,
  OFFLINE_LOCATIONS_KEY
} from '@register/offline/reducer'

export const eventSection: ISerializedFormSection = {
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
          validate: [{ operation: 'isValidDeathOccurrenceDate' }],
          mapping: {
            mutation: {
              operation: 'fieldToDeceasedDateTransformation',
              parameters: ['deceased']
            },
            query: {
              operation: 'deceasedDateToFieldTransformation',
              parameters: ['deceased']
            }
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
            mutation: {
              operation: 'sectionFieldToBundleFieldTransformer',
              parameters: ['mannerOfDeath']
            },
            query: {
              operation: 'bundleFieldToSectionFieldTransformer',
              parameters: ['mannerOfDeath']
            }
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
            mutation: {
              operation: 'copyEventAddressTransformer',
              parameters: ['deceased']
            },
            query: { operation: 'deathPlaceToFieldTransformer' }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: []
            },
            query: {
              operation: 'eventLocationIDQueryTransformer',
              parameters: []
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: []
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: []
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: []
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: []
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: []
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: []
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: [6]
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: [6]
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: [4]
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: [4]
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: [5]
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: [5]
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: [3]
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: [3]
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: [2]
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: [2]
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: [0, 'postalCode']
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: [0, 'postalCode']
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: [1]
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: [1]
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: [0, 'postalCode']
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: [0, 'postalCode']
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: []
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: []
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: []
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: []
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: []
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: []
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: [6]
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: [6]
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: [4]
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: [4]
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: [5]
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: [5]
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: [3]
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: [3]
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: [2]
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: [2]
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: [0, 'postalCode']
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: [0, 'postalCode']
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: [1]
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: [1]
            }
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
            mutation: {
              operation: 'deathEventLocationMutationTransformer',
              parameters: [0, 'postalCode']
            },
            query: {
              operation: 'eventLocationQueryTransformer',
              parameters: [0, 'postalCode']
            }
          }
        }
      ]
    }
  ],
  mapping: {
    mutation: {
      operation: 'setDeathRegistrationSectionTransformer'
    },
    query: {
      operation: 'getDeathRegistrationSectionTransformer'
    }
  }
}
