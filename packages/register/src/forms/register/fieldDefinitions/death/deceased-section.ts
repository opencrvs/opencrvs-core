import {
  ViewType,
  TEXT,
  SELECT_WITH_OPTIONS,
  DATE,
  SUBSECTION,
  SELECT_WITH_DYNAMIC_OPTIONS,
  RADIO_GROUP,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  FETCH_BUTTON,
  TEL,
  ISerializedFormSection
} from '@register/forms'
import { formMessages as messages } from '@register/i18n/messages'

import { countries } from '@register/forms/countries'
import { deathIdentityOptions } from '@register/forms/identity'
import { OFFLINE_LOCATIONS_KEY } from '@register/offline/reducer'
import { conditionals } from '@register/forms/utils'

import {
  FETCH_REGISTRATION,
  transformRegistrationData
} from '@opencrvs/register/src/forms/register/queries/registration'
import {
  FETCH_PERSON,
  transformPersonData
} from '@opencrvs/register/src/forms/register/queries/person'

export const deceasedSection: ISerializedFormSection = {
  id: 'deceased',
  viewType: 'form' as ViewType,
  name: messages.deceasedName,
  title: messages.deceasedTitle,
  hasDocumentSection: true,
  groups: [
    {
      id: 'deceased-view-group',
      fields: [
        {
          name: 'iDType',
          type: SELECT_WITH_OPTIONS,
          label: messages.deceasedIdType,
          required: true,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
          options: deathIdentityOptions,
          mapping: {
            mutation: {
              operation: 'fieldToIdentifierTransformer',
              parameters: ['type']
            },
            query: {
              operation: 'identifierToFieldTransformer',
              parameters: ['type']
            }
          }
        },
        {
          name: 'iDTypeOther',
          type: TEXT,
          label: messages.iDTypeOtherLabel,
          required: true,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.iDType],
          mapping: {
            mutation: {
              operation: 'fieldToIdentifierTransformer',
              parameters: ['otherType']
            },
            query: {
              operation: 'identifierToFieldTransformer',
              parameters: ['otherType']
            }
          }
        },
        {
          name: 'iD',
          type: FIELD_WITH_DYNAMIC_DEFINITIONS,
          dynamicDefinitions: {
            label: {
              dependency: 'iDType',
              labelMapper: { operation: 'identityNameMapper' }
            },
            type: {
              kind: 'dynamic',
              dependency: 'iDType',
              typeMapper: { operation: 'identityTypeMapper' }
            },
            validate: [
              {
                validator: { operation: 'validIDNumber', parameters: [] },
                dependencies: ['iDType']
              }
            ]
          },
          label: messages.iD,
          required: true,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.iDAvailable],
          mapping: {
            mutation: {
              operation: 'fieldToIdentifierTransformer',
              parameters: ['id']
            },
            query: {
              operation: 'identifierToFieldTransformer',
              parameters: ['id']
            }
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
              query: { operation: 'FETCH_REGISTRATION' },
              inputs: [
                {
                  name: 'identifier',
                  valueField: 'iD'
                }
              ],
              responseTransformer: { operation: 'transformRegistrationData' },
              modalInfoText: messages.fetchRegistrationModalInfo,
              errorText: messages.fetchRegistrationModalErrorText
            },
            NATIONAL_ID: {
              query: { operation: 'FETCH_PERSON' },
              inputs: [
                {
                  name: 'identifier',
                  valueField: 'iD'
                }
              ],
              responseTransformer: { operation: 'transformPersonData' },
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
          required: true,
          initialValue: 'BGD',
          validate: [],
          options: countries,
          mapping: {
            mutation: { operation: 'fieldToArrayTransformer' },
            query: { operation: 'arrayToFieldTransformer' }
          }
        },
        {
          name: 'firstNames',
          type: TEXT,
          label: messages.deceasedGivenNames,
          required: false,
          initialValue: '',
          validate: [{ operation: 'bengaliOnlyNameFormat' }],
          mapping: {
            mutation: {
              operation: 'fieldToNameTransformer',
              parameters: ['bn']
            },
            query: { operation: 'nameToFieldTransformer', parameters: ['bn'] }
          }
        },
        {
          name: 'familyName',
          type: TEXT,
          label: messages.deceasedFamilyName,
          required: true,
          initialValue: '',
          validate: [{ operation: 'bengaliOnlyNameFormat' }],
          mapping: {
            mutation: {
              operation: 'fieldToNameTransformer',
              parameters: ['bn']
            },
            query: { operation: 'nameToFieldTransformer', parameters: ['bn'] }
          }
        },
        {
          name: 'firstNamesEng',
          type: TEXT,
          label: messages.deceasedGivenNamesEng,
          required: false,
          initialValue: '',
          validate: [{ operation: 'englishOnlyNameFormat' }],
          mapping: {
            mutation: {
              operation: 'fieldToNameTransformer',
              parameters: ['en', 'firstNames']
            },
            query: {
              operation: 'nameToFieldTransformer',
              parameters: ['en', 'firstNames']
            }
          }
        },
        {
          name: 'familyNameEng',
          type: TEXT,
          label: messages.deceasedFamilyNameEng,
          required: true,
          initialValue: '',
          validate: [{ operation: 'englishOnlyNameFormat' }],
          mapping: {
            mutation: {
              operation: 'fieldToNameTransformer',
              parameters: ['en', 'familyName']
            },
            query: {
              operation: 'nameToFieldTransformer',
              parameters: ['en', 'familyName']
            }
          }
        },
        {
          name: 'gender',
          type: SELECT_WITH_OPTIONS,
          label: messages.deceasedSex,
          required: true,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
          options: [
            { value: 'male', label: messages.deceasedSexMale },
            { value: 'female', label: messages.deceasedSexFemale },
            { value: 'other', label: messages.deceasedSexOther },
            { value: 'unknown', label: messages.deceasedSexUnknown }
          ]
        },
        {
          name: 'birthDate',
          type: DATE,
          label: messages.deceasedDateOfBirth,
          required: true,
          initialValue: '',
          validate: [{ operation: 'isValidBirthDate' }]
        },
        {
          name: 'maritalStatus',
          type: SELECT_WITH_OPTIONS,
          label: messages.maritalStatus,
          required: false,
          initialValue: 'MARRIED',
          validate: [],
          placeholder: messages.select,
          options: [
            {
              value: 'SINGLE',
              label: messages.maritalStatusSingle
            },
            {
              value: 'MARRIED',
              label: messages.maritalStatusMarried
            },
            {
              value: 'WIDOWED',
              label: messages.maritalStatusWidowed
            },
            {
              value: 'DIVORCED',
              label: messages.maritalStatusDivorced
            },
            {
              value: 'SEPARATED',
              label: messages.maritalStatusSeparated
            },
            {
              value: 'NOT_STATED',
              label: messages.maritalStatusNotStated
            }
          ]
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
          label: messages.country,
          required: true,
          initialValue: window.config.COUNTRY.toUpperCase(),
          validate: [],
          options: countries,
          mapping: {
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['PERMANENT', 0, 'country']
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['PERMANENT', 0, 'country']
            }
          }
        },
        {
          name: 'statePermanent',
          type: SELECT_WITH_DYNAMIC_OPTIONS,
          label: messages.state,
          required: true,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
          dynamicOptions: {
            resource: OFFLINE_LOCATIONS_KEY,
            dependency: 'countryPermanent'
          },
          conditionals: [conditionals.countryPermanent],
          mapping: {
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['PERMANENT', 0, 'state']
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['PERMANENT', 0, 'state']
            }
          }
        },
        {
          name: 'districtPermanent',
          type: SELECT_WITH_DYNAMIC_OPTIONS,
          label: messages.district,
          required: true,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
          dynamicOptions: {
            resource: OFFLINE_LOCATIONS_KEY,
            dependency: 'statePermanent'
          },
          conditionals: [
            conditionals.countryPermanent,
            conditionals.statePermanent
          ],
          mapping: {
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['PERMANENT', 0, 'district']
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['PERMANENT', 0, 'district']
            }
          }
        },
        {
          name: 'addressLine4Permanent',
          type: SELECT_WITH_DYNAMIC_OPTIONS,
          label: messages.addressLine4,
          required: true,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
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
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['PERMANENT', 6]
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['PERMANENT', 6]
            }
          }
        },
        {
          name: 'addressLine3Permanent',
          type: SELECT_WITH_DYNAMIC_OPTIONS,
          label: messages.addressLine3,
          required: false,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
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
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['PERMANENT', 4]
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['PERMANENT', 4]
            }
          }
        },
        {
          name: 'addressLine3CityOptionPermanent',
          type: TEXT,
          label: messages.addressLine3CityOption,
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
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['PERMANENT', 5]
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['PERMANENT', 5]
            }
          }
        },
        {
          name: 'addressLine2Permanent',
          type: TEXT,
          label: messages.addressLine2,
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
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['PERMANENT', 3]
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['PERMANENT', 3]
            }
          }
        },
        {
          name: 'addressLine1CityOptionPermanent',
          type: TEXT,
          label: messages.addressLine1,
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
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['PERMANENT', 2]
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['PERMANENT', 2]
            }
          }
        },
        {
          name: 'postCodeCityOptionPermanent',
          type: TEL,
          label: messages.postCode,
          required: false,
          initialValue: '',
          validate: [
            { operation: 'numeric' },
            { operation: 'maxLength', parameters: [4] }
          ],
          conditionals: [
            conditionals.countryPermanent,
            conditionals.statePermanent,
            conditionals.districtPermanent,
            conditionals.addressLine4Permanent,
            conditionals.isCityLocationPermanent
          ],
          mapping: {
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['PERMANENT', 0, 'postalCode']
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['PERMANENT', 0, 'postalCode']
            }
          }
        },
        {
          name: 'addressLine1Permanent',
          type: TEXT,
          label: messages.addressLine1,
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
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['PERMANENT', 1]
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['PERMANENT', 1]
            }
          }
        },
        {
          name: 'postCodePermanent',
          type: TEL,
          label: messages.postCode,
          required: false,
          initialValue: '',
          validate: [
            { operation: 'numeric' },
            { operation: 'maxLength', parameters: [4] }
          ],
          conditionals: [
            conditionals.countryPermanent,
            conditionals.statePermanent,
            conditionals.districtPermanent,
            conditionals.addressLine4Permanent,
            conditionals.addressLine3Permanent
          ],
          mapping: {
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['PERMANENT', 0, 'postalCode']
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['PERMANENT', 0, 'postalCode']
            }
          }
        },
        {
          name: 'currentAddressSameAsPermanent',
          type: RADIO_GROUP,
          label: messages.deceasedCurrentAddressSameAsPermanent,
          required: true,
          initialValue: true,
          validate: [],
          options: [
            { value: true, label: messages.confirm },
            { value: false, label: messages.deny }
          ],
          conditionals: [],
          mapping: {
            mutation: {
              operation: 'copyAddressTransformer',
              parameters: ['PERMANENT', 'deceased', 'CURRENT', 'deceased']
            },
            query: {
              operation: 'sameAddressFieldTransformer',
              parameters: ['PERMANENT', 'deceased', 'CURRENT', 'deceased']
            }
          }
        },
        {
          name: 'country',
          type: SELECT_WITH_OPTIONS,
          label: messages.country,
          required: true,
          initialValue: window.config.COUNTRY.toUpperCase(),
          validate: [],
          placeholder: messages.select,
          options: countries,
          conditionals: [conditionals.currentAddressSameAsPermanent],
          mapping: {
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['CURRENT']
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['CURRENT']
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
          conditionals: [
            conditionals.country,
            conditionals.currentAddressSameAsPermanent
          ],
          mapping: {
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['CURRENT']
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['CURRENT']
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
          conditionals: [
            conditionals.country,
            conditionals.state,
            conditionals.currentAddressSameAsPermanent
          ],
          mapping: {
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['CURRENT']
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['CURRENT']
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
            conditionals.district,
            conditionals.currentAddressSameAsPermanent
          ],
          mapping: {
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['CURRENT', 6]
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['CURRENT', 6]
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
            conditionals.isNotCityLocation,
            conditionals.currentAddressSameAsPermanent
          ],
          mapping: {
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['CURRENT', 4]
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['CURRENT', 4]
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
            conditionals.currentAddressSameAsPermanent,
            conditionals.isCityLocation
          ],
          mapping: {
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['CURRENT', 5]
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['CURRENT', 5]
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
            conditionals.addressLine3,
            conditionals.currentAddressSameAsPermanent
          ],
          mapping: {
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['CURRENT', 3]
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['CURRENT', 3]
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
            conditionals.currentAddressSameAsPermanent,
            conditionals.isCityLocation
          ],
          mapping: {
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['CURRENT', 2]
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['CURRENT', 2]
            }
          }
        },
        {
          name: 'postCodeCityOption',
          type: TEL,
          label: messages.postCode,
          required: false,
          initialValue: '',
          validate: [
            { operation: 'numeric' },
            { operation: 'maxLength', parameters: [4] }
          ],
          conditionals: [
            conditionals.country,
            conditionals.state,
            conditionals.district,
            conditionals.addressLine4,
            conditionals.currentAddressSameAsPermanent,
            conditionals.isCityLocation
          ],
          mapping: {
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['CURRENT', 0, 'postalCode']
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['CURRENT', 0, 'postalCode']
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
            conditionals.addressLine3,
            conditionals.currentAddressSameAsPermanent
          ],
          mapping: {
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['CURRENT', 1]
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['CURRENT', 1]
            }
          }
        },
        {
          name: 'postCode',
          type: TEL,
          label: messages.postCode,
          required: false,
          initialValue: '',
          validate: [
            { operation: 'numeric' },
            { operation: 'maxLength', parameters: [4] }
          ],
          conditionals: [
            conditionals.country,
            conditionals.state,
            conditionals.district,
            conditionals.addressLine4,
            conditionals.addressLine3,
            conditionals.currentAddressSameAsPermanent
          ],
          mapping: {
            mutation: {
              operation: 'fieldToAddressTransformer',
              parameters: ['CURRENT', 0, 'postalCode']
            },
            query: {
              operation: 'addressToFieldTransformer',
              parameters: ['CURRENT', 0, 'postalCode']
            }
          }
        }
      ]
    }
  ]
}
