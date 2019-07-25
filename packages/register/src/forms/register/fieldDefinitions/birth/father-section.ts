import { formMessages as messages } from '@register/i18n/messages'
import { countries } from '@register/forms/countries'
import {
  birthIdentityOptions,
  identityTypeMapper,
  identityNameMapper
} from '@register/forms/identity'
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

export const fatherSection: IFormSection = {
  id: 'father',
  viewType: 'form' as ViewType,
  name: messages.fatherName,
  title: messages.fatherTitle,
  hasDocumentSection: true,
  groups: [
    {
      id: 'father-view-group',
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
          conditionals: [conditionals.fatherContactDetailsRequired],
          mapping: {
            mutation: sectionRemoveTransformer
          }
        },
        {
          name: 'iDType',
          type: SELECT_WITH_OPTIONS,
          label: messages.iDType,
          required: true,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
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
          label: messages.iDTypeOtherLabel,
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
          label: messages.iD,
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
          placeholder: messages.select,
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
              value: 'NOT_STATED',
              label: messages.maritalStatusNotStated
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
          label: messages.dateOfMarriage,
          required: false,
          initialValue: '',
          validate: [],
          conditionals: [
            conditionals.fathersDetailsExist,
            conditionals.isMarried
          ]
        },
        {
          name: 'educationalAttainment',
          type: SELECT_WITH_OPTIONS,
          label: messages.fatherEducationAttainment,
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
          ],
          conditionals: [conditionals.fathersDetailsExist]
        },
        {
          name: 'addressSameAsMother',
          type: RADIO_GROUP,
          label: messages.addressSameAsMother,
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
          label: messages.country,
          required: true,
          initialValue: window.config.COUNTRY.toUpperCase(),
          validate: [],
          placeholder: messages.select,
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
            conditionals.addressSameAsMother
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
          label: messages.addressLine3CityOption,
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
          label: messages.addressLine1,
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
          label: messages.postCode,
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
          label: messages.permanentAddressSameAsMother,
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
          label: messages.country,
          required: true,
          initialValue: window.config.COUNTRY.toUpperCase(),
          validate: [],
          placeholder: messages.select,
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
          label: messages.state,
          required: true,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
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
          label: messages.addressLine3CityOption,
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
          label: messages.addressLine2,
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
          label: messages.addressLine1,
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
          label: messages.postCode,
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
          label: messages.addressLine1,
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
          label: messages.postCode,
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
      ]
    }
  ],
  mapping: {
    query: emptyFatherSectionTransformer
  }
}
