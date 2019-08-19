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
  FETCH_BUTTON,
  ISerializedFormSection
} from '@register/forms'
import { validIDNumber } from '@register/utils/validate'
import { countries } from '@register/forms/countries'
import {
  identityNameMapper,
  identityTypeMapper,
  deathIdentityOptions
} from '@register/forms/identity'
import { formMessages as messages } from '@register/i18n/messages'
import { OFFLINE_LOCATIONS_KEY } from '@register/offline/reducer'
import { conditionals } from '@register/forms/utils'

import { OBJECT_TYPE } from '@register/forms/register/fieldDefinitions/death/mappings/mutation/applicant-mapping'
import {
  FETCH_REGISTRATION,
  transformRegistrationData
} from '@register/forms/register/queries/registration'
import {
  FETCH_PERSON,
  transformInformantData
} from '@register/forms/register/queries/person'

const NESTED_SECTION = 'individual'

export const applicantsSection: ISerializedFormSection = {
  id: 'informant',
  viewType: 'form' as ViewType,
  name: messages.applicantName,
  title: messages.applicantTitle,
  hasDocumentSection: true,
  groups: [
    {
      id: 'informant-view-group',
      fields: [
        {
          name: 'iDType',
          type: SELECT_WITH_OPTIONS,
          label: messages.applicantsIdType,
          required: true,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
          options: deathIdentityOptions,
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToIdentifierTransformer',
                  parameters: ['type']
                }
              ]
            },

            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'identifierToFieldTransformer',
                  parameters: ['type']
                }
              ]
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
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToIdentifierTransformer',
                  parameters: ['otherType']
                }
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'identifierToFieldTransformer',
                  parameters: ['otherType']
                }
              ]
            }
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
          label: messages.iD,
          required: true,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.iDAvailable],
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToIdentifierTransformer',
                  parameters: ['id']
                }
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'identifierToFieldTransformer',
                  parameters: ['id']
                }
              ]
            }
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
          name: 'nationality',
          type: SELECT_WITH_OPTIONS,
          label: messages.applicantsNationality,
          required: false,
          initialValue: 'BGD',
          validate: [],
          placeholder: messages.select,
          options: countries,
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                { operation: 'fieldToArrayTransformer', parameters: [] }
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                { operation: 'arrayToFieldTransformer', parameters: [] }
              ]
            }
          }
        },
        {
          name: 'applicantFirstNames',
          type: TEXT,
          label: messages.applicantsGivenNames,
          required: false,
          initialValue: '',
          validate: [{ operation: 'bengaliOnlyNameFormat', parameters: [] }],
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToNameTransformer',
                  parameters: ['bn', 'firstNames']
                },
                OBJECT_TYPE.NAME
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'nameToFieldTransformer',
                  parameters: ['bn', 'firstNames']
                }
              ]
            }
          }
        },
        {
          name: 'applicantFamilyName',
          type: TEXT,
          label: messages.applicantsFamilyName,
          required: true,
          initialValue: '',
          validate: [{ operation: 'bengaliOnlyNameFormat', parameters: [] }],
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToNameTransformer',
                  parameters: ['bn', 'familyName']
                },
                OBJECT_TYPE.NAME
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'nameToFieldTransformer',
                  parameters: ['bn', 'familyName']
                }
              ]
            }
          }
        },
        {
          name: 'applicantFirstNamesEng',
          type: TEXT,
          label: messages.applicantsGivenNamesEng,
          required: false,
          initialValue: '',
          validate: [{ operation: 'englishOnlyNameFormat', parameters: [] }],
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToNameTransformer',
                  parameters: ['en', 'firstNames']
                },
                OBJECT_TYPE.NAME
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'firstNames']
                }
              ]
            }
          }
        },
        {
          name: 'applicantFamilyNameEng',
          type: TEXT,
          label: messages.applicantsFamilyNameEng,
          required: true,
          initialValue: '',
          validate: [{ operation: 'englishOnlyNameFormat', parameters: [] }],
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToNameTransformer',
                  parameters: ['en', 'familyName']
                },
                OBJECT_TYPE.NAME
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'familyName']
                }
              ]
            }
          }
        },
        {
          name: 'applicantBirthDate',
          type: DATE,
          label: messages.applicantsDateOfBirth,
          required: false,
          initialValue: '',
          validate: [
            { operation: 'isValidBirthDate', parameters: [] },
            { operation: 'isDateInPast', parameters: [] }
          ],
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                { operation: 'fieldNameTransformer', parameters: ['birthDate'] }
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldValueTransformer',
                  parameters: ['birthDate']
                }
              ]
            }
          }
        },
        {
          name: 'applicantsRelationToDeceased',
          type: SELECT_WITH_OPTIONS,
          label: messages.applicantsRelationWithDeceased,
          required: true,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
          hidden: true,
          options: [
            { value: 'FATHER', label: messages.father },
            { value: 'MOTHER', label: messages.mother },
            { value: 'SPOUSE', label: messages.spouse },
            {
              value: 'SON',
              label: messages.son
            },
            {
              value: 'DAUGHTER',
              label: messages.daughter
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
            mutation: {
              operation: 'fieldValueSectionExchangeTransformer',
              parameters: ['informant', 'relationship']
            },
            query: {
              operation: 'sectionFieldExchangeTransformer',
              parameters: ['informant', 'relationship']
            }
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
            mutation: {
              operation: 'fieldValueSectionExchangeTransformer',
              parameters: ['informant', 'otherRelationship']
            },
            query: {
              operation: 'sectionFieldExchangeTransformer',
              parameters: ['informant', 'otherRelationship']
            }
          },
          conditionals: [conditionals.otherRelationship]
        },
        {
          name: 'applicantPhone',
          type: TEL,
          label: messages.phoneNumber,
          required: true,
          initialValue: '',
          validate: [{ operation: 'phoneNumberFormat', parameters: [] }],
          hidden: true,
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                { operation: 'fieldToPhoneNumberTransformer', parameters: [] }
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                { operation: 'phoneNumberToFieldTransformer', parameters: [] }
              ]
            }
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
          label: messages.country,
          required: true,
          initialValue: window.config.COUNTRY.toUpperCase(),
          validate: [],
          placeholder: messages.select,
          options: countries,
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['CURRENT']
                },
                OBJECT_TYPE.NAME
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['CURRENT']
                }
              ]
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
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['CURRENT']
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['CURRENT']
                }
              ]
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
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['CURRENT']
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['CURRENT']
                }
              ]
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
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['CURRENT', 6]
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['CURRENT', 6]
                }
              ]
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
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['CURRENT', 4]
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['CURRENT', 4]
                }
              ]
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
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['CURRENT', 5]
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['CURRENT', 5]
                }
              ]
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
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['CURRENT', 3]
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['CURRENT', 3]
                }
              ]
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
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['CURRENT', 2]
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['CURRENT', 2]
                }
              ]
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
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['CURRENT', 0, 'postalCode']
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['CURRENT', 0, 'postalCode']
                }
              ]
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
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['CURRENT', 1]
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['CURRENT', 1]
                }
              ]
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
            conditionals.addressLine3
          ],
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['CURRENT', 0, 'postalCode']
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['CURRENT', 0, 'postalCode']
                }
              ]
            }
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
            { value: true, label: messages.confirm },
            { value: false, label: messages.deny }
          ],
          conditionals: [],
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'copyAddressTransformer',
                  parameters: [
                    'CURRENT',
                    'informant',
                    'PERMANENT',
                    'informant',
                    true,
                    NESTED_SECTION
                  ]
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'sameAddressFieldTransformer',
                  parameters: [
                    'CURRENT',
                    NESTED_SECTION,
                    'PERMANENT',
                    NESTED_SECTION
                  ]
                }
              ]
            }
          }
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
          conditionals: [conditionals.applicantPermanentAddressSameAsCurrent],
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['PERMANENT', 0, 'country']
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['PERMANENT', 0, 'country']
                }
              ]
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
          conditionals: [
            conditionals.countryPermanent,
            conditionals.applicantPermanentAddressSameAsCurrent
          ],
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['PERMANENT', 0, 'state']
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['PERMANENT', 0, 'state']
                }
              ]
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
            conditionals.statePermanent,
            conditionals.applicantPermanentAddressSameAsCurrent
          ],
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['PERMANENT', 0, 'district']
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['PERMANENT', 0, 'district']
                }
              ]
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
            conditionals.districtPermanent,
            conditionals.applicantPermanentAddressSameAsCurrent
          ],
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['PERMANENT', 6]
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['PERMANENT', 6]
                }
              ]
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
            conditionals.isNotCityLocationPermanent,
            conditionals.applicantPermanentAddressSameAsCurrent
          ],
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['PERMANENT', 4]
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['PERMANENT', 4]
                }
              ]
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
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['PERMANENT', 5]
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['PERMANENT', 5]
                }
              ]
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
            conditionals.addressLine3Permanent,
            conditionals.applicantPermanentAddressSameAsCurrent
          ],
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['PERMANENT', 3]
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['PERMANENT', 3]
                }
              ]
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
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['PERMANENT', 2]
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['PERMANENT', 2]
                }
              ]
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
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['PERMANENT', 0, 'postalCode']
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['PERMANENT', 0, 'postalCode']
                }
              ]
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
            conditionals.addressLine3Permanent,
            conditionals.applicantPermanentAddressSameAsCurrent
          ],
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['PERMANENT', 1]
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['PERMANENT', 1]
                }
              ]
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
            conditionals.addressLine3Permanent,
            conditionals.applicantPermanentAddressSameAsCurrent
          ],
          mapping: {
            mutation: {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: ['PERMANENT', 0, 'postalCode']
                },
                OBJECT_TYPE.ADDRESS
              ]
            },
            query: {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                NESTED_SECTION,
                {
                  operation: 'addressToFieldTransformer',
                  parameters: ['PERMANENT', 0, 'postalCode']
                }
              ]
            }
          }
        }
      ]
    }
  ],
  mapping: {
    mutation: { operation: 'setInformantSectionTransformer', parameters: [] },
    query: { operation: 'getInformantSectionTransformer', parameters: [] }
  }
}
