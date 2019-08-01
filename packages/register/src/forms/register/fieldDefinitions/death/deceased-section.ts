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
import { formMessages as messages } from '@register/i18n/messages'
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
  identityNameMapper,
  identityTypeMapper,
  deathIdentityOptions
} from '@register/forms/identity'
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

export const deceasedSection: IFormSection = {
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
            mutation: fieldToIdentifierTransformer('type'),
            query: identifierToFieldTransformer('type')
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
          label: messages.iD,
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
          validate: [isValidBirthDate]
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
            mutation: fieldToAddressTransformer('PERMANENT', 0, 'country'),
            query: addressToFieldTransformer('PERMANENT', 0, 'country')
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
            mutation: fieldToAddressTransformer('PERMANENT', 0, 'state'),
            query: addressToFieldTransformer('PERMANENT', 0, 'state')
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
            mutation: fieldToAddressTransformer('PERMANENT', 0, 'district'),
            query: addressToFieldTransformer('PERMANENT', 0, 'district')
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
            mutation: fieldToAddressTransformer('PERMANENT', 6),
            query: addressToFieldTransformer('PERMANENT', 6)
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
            mutation: fieldToAddressTransformer('PERMANENT', 4),
            query: addressToFieldTransformer('PERMANENT', 4)
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
            mutation: fieldToAddressTransformer('PERMANENT', 5),
            query: addressToFieldTransformer('PERMANENT', 5)
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
            mutation: fieldToAddressTransformer('PERMANENT', 3),
            query: addressToFieldTransformer('PERMANENT', 3)
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
            mutation: fieldToAddressTransformer('PERMANENT', 2),
            query: addressToFieldTransformer('PERMANENT', 2)
          }
        },
        {
          name: 'postCodeCityOptionPermanent',
          type: TEL,
          label: messages.postCode,
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
            mutation: fieldToAddressTransformer('PERMANENT', 1),
            query: addressToFieldTransformer('PERMANENT', 1)
          }
        },
        {
          name: 'postCodePermanent',
          type: TEL,
          label: messages.postCode,
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
          label: messages.country,
          required: true,
          initialValue: window.config.COUNTRY.toUpperCase(),
          validate: [],
          placeholder: messages.select,
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
            mutation: fieldToAddressTransformer('CURRENT'),
            query: addressToFieldTransformer('CURRENT')
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
            mutation: fieldToAddressTransformer('CURRENT'),
            query: addressToFieldTransformer('CURRENT')
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
            mutation: fieldToAddressTransformer('CURRENT', 6),
            query: addressToFieldTransformer('CURRENT', 6)
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
            mutation: fieldToAddressTransformer('CURRENT', 4),
            query: addressToFieldTransformer('CURRENT', 4)
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
            mutation: fieldToAddressTransformer('CURRENT', 5),
            query: addressToFieldTransformer('CURRENT', 5)
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
            mutation: fieldToAddressTransformer('CURRENT', 3),
            query: addressToFieldTransformer('CURRENT', 3)
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
            mutation: fieldToAddressTransformer('CURRENT', 2),
            query: addressToFieldTransformer('CURRENT', 2)
          }
        },
        {
          name: 'postCodeCityOption',
          type: TEL,
          label: messages.postCode,
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
            mutation: fieldToAddressTransformer('CURRENT', 1),
            query: addressToFieldTransformer('CURRENT', 1)
          }
        },
        {
          name: 'postCode',
          type: TEL,
          label: messages.postCode,
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
  ]
}
