import { formMessages as messages } from '@register/i18n/messages'
import {
  birthIdentityOptions,
  identityTypeMapper,
  identityNameMapper
} from '@register/forms/identity'
import {
  getMotherDateOfBirthLabel,
  getDateOfMarriageLabel
} from '@register/forms/register/fieldDefinitions/birth/staticLabel'
import {
  ViewType,
  SELECT_WITH_OPTIONS,
  TEXT,
  DATE,
  SUBSECTION,
  RADIO_GROUP,
  SELECT_WITH_DYNAMIC_OPTIONS,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  FETCH_BUTTON,
  TEL,
  ISerializedFormSection
} from '@register/forms'
import {
  validIDNumber,
  dateGreaterThan,
  dateLessThan,
  dateNotInFuture,
  dateFormatIsCorrect,
  dateInPast
} from '@register/utils/validate'

import { countries } from '@register/forms/countries'
import { conditionals } from '@register/forms/utils'
import { OFFLINE_LOCATIONS_KEY } from '@register/offline/reducer'

import {
  transformPersonData,
  FETCH_PERSON
} from '@register/forms/register/queries/person'
import {
  transformRegistrationData,
  FETCH_REGISTRATION
} from '@register/forms/register/queries/registration'

export interface IMotherSectionFormData {
  firstName: string
}

export const motherSection: ISerializedFormSection = {
  id: 'mother',
  viewType: 'form' as ViewType,
  name: messages.motherName,
  title: messages.motherTitle,
  hasDocumentSection: true,
  groups: [
    {
      id: 'mother-view-group',
      fields: [
        {
          name: 'iDType',
          type: SELECT_WITH_OPTIONS,
          label: messages.iDType,
          required: true,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
          options: birthIdentityOptions,
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
          label: messages.fetchMotherDetails,
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
          placeholder: messages.select,
          options: countries,
          mapping: {
            mutation: { operation: 'fieldToArrayTransformer', parameters: [] },
            query: { operation: 'arrayToFieldTransformer', parameters: [] }
          }
        },
        {
          name: 'firstNames',
          type: TEXT,
          label: messages.motherFirstNames,
          required: false,
          initialValue: '',
          validate: [{ operation: 'bengaliOnlyNameFormat', parameters: [] }],
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
          label: messages.motherFamilyName,
          required: true,
          initialValue: '',
          validate: [{ operation: 'bengaliOnlyNameFormat', parameters: [] }],
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
          label: messages.motherFirstNamesEng,
          required: false,
          initialValue: '',
          validate: [{ operation: 'englishOnlyNameFormat', parameters: [] }],
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
          label: messages.motherFamilyNameEng,
          required: true,
          initialValue: '',
          validate: [{ operation: 'englishOnlyNameFormat', parameters: [] }],
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
          name: 'motherBirthDate',
          type: FIELD_WITH_DYNAMIC_DEFINITIONS,
          dynamicDefinitions: {
            label: {
              dependency: 'motherBirthDate',
              labelMapper: getMotherDateOfBirthLabel
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
          label: messages.motherDateOfBirth,
          required: false,
          initialValue: '',
          validate: [],
          mapping: {
            mutation: {
              operation: 'fieldNameTransformer',
              parameters: ['birthDate']
            },
            query: {
              operation: 'fieldValueTransformer',
              parameters: ['birthDate']
            }
          }
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
                dependencies: ['motherBirthDate']
              }
            ]
          },
          label: messages.dateOfMarriage,
          required: false,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.isMarried]
        },
        {
          name: 'educationalAttainment',
          type: SELECT_WITH_OPTIONS,
          label: messages.motherEducationAttainment,
          required: false,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
          options: [
            {
              value: 'NO_SCHOOLING',
              label: messages.educationAttainmentNone
            },
            {
              value: 'PRIMARY_ISCED_1',
              label: messages.educationAttainmentISCED1
            },
            {
              value: 'LOWER_SECONDARY_ISCED_2',
              label: messages.educationAttainmentISCED2
            },
            {
              value: 'UPPER_SECONDARY_ISCED_3',
              label: messages.educationAttainmentISCED3
            },
            {
              value: 'POST_SECONDARY_ISCED_4',
              label: messages.educationAttainmentISCED4
            },
            {
              value: 'FIRST_STAGE_TERTIARY_ISCED_5',
              label: messages.educationAttainmentISCED5
            },
            {
              value: 'SECOND_STAGE_TERTIARY_ISCED_6',
              label: messages.educationAttainmentISCED6
            },
            {
              value: 'NOT_STATED',
              label: messages.educationAttainmentNotStated
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
          placeholder: messages.select,
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
            { operation: 'numeric', parameters: [] },
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
            { operation: 'numeric', parameters: [] },
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
          label: messages.currentAddressSameAsPermanent,
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
              parameters: ['PERMANENT', 'mother', 'CURRENT', 'mother']
            },
            query: {
              operation: 'sameAddressFieldTransformer',
              parameters: ['PERMANENT', 'mother', 'CURRENT', 'mother']
            }
          }
        },
        {
          name: 'currentAddress',
          type: SUBSECTION,
          label: messages.currentAddress,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.currentAddressSameAsPermanent]
        },
        {
          name: 'country',
          type: SELECT_WITH_OPTIONS,
          label: messages.country,
          required: true,
          initialValue: window.config.COUNTRY.toUpperCase(),
          validate: [],
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
          placeholder: messages.select,
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
            conditionals.currentAddressSameAsPermanent,
            conditionals.isNotCityLocation
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
            { operation: 'numeric', parameters: [] },
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
            { operation: 'numeric', parameters: [] },
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
