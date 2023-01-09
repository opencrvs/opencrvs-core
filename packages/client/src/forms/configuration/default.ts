/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { RadioSize } from '@opencrvs/components/lib/forms'
import {
  BirthSection,
  ISerializedForm,
  DeathSection
} from '@client/forms/index'
import { formMessageDescriptors } from '@client/i18n/messages'
import { messages as informantMessageDescriptors } from '@client/i18n/messages/views/selectInformant'
import {
  birthDocumentForWhomFhirMapping,
  birthDocumentTypeFhirMapping
} from '@client/forms/register/fieldMappings/birth/mutation/documents-mappings'
import {
  deathDocumentForWhomFhirMapping,
  deathDocumentTypeFhirMapping
} from '@client/forms/register/fieldMappings/death/mutation/documents-mappings'
import { formatName } from '@client/utils/name'
import { STATE_OF_ORIGINS } from '@client/forms/stateOfOrigins'
import { ETHNIC_ORIGINS } from '@client/forms/ethnicOrigins'

// THIS FILE CONTAINS THE DEFAULT, FACTORY RESET FORM CONFIGURATIONS

function nameTransformer([surname, ...firstNames]: string[]) {
  const isEmptyField = surname === '-'
  if (isEmptyField) {
    return '-'
  }
  return formatName(`${surname}, ${firstNames.join(' ')}`)
}

interface IDefaultRegisterForms {
  birth: ISerializedForm
  death: ISerializedForm
  marriage: ISerializedForm
  divorce: ISerializedForm
  adoption: ISerializedForm
}

export const registerForms: IDefaultRegisterForms = {
  marriage: { sections: [] },
  divorce: { sections: [] },
  adoption: { sections: [] },
  birth: {
    sections: [
      {
        id: BirthSection.Child,
        viewType: 'form',
        name: formMessageDescriptors.childTab,
        title: formMessageDescriptors.childTitle,
        hasDocumentSection: true,
        previewGroupTransformers: {
          childNameInEnglish: nameTransformer
        },
        mapping: {
          template: [
            {
              fieldName: 'registrationNumber',
              operation: 'registrationNumberTransformer'
            },
            {
              fieldName: 'certificateDate',
              operation: 'certificateDateTransformer',
              parameters: ['en', 'do MMMM yyyy']
            },
            {
              fieldName: 'registrarName',
              operation: 'registrarNameUserTransformer'
            },
            {
              fieldName: 'registrationDate',
              operation: 'registrationDateTransformer'
            },
            {
              fieldName: 'placeOfBirthLocality',
              operation: 'placeOfBirthLocalityTransformer'
            },
            {
              fieldName: 'placeOfBirthLGA',
              operation: 'placeOfBirthLGATransformer'
            },
            {
              fieldName: 'placeOfBirthState',
              operation: 'placeOfBirthStateTransformer'
            },
            {
              fieldName: 'role',
              operation: 'roleUserTransformer'
            },
            {
              fieldName: 'registrarSignature',
              operation: 'registrarSignatureUserTransformer'
            },
            {
              fieldName: 'qrCode',
              operation: 'QRCodeTransformerTransformer'
            },
            {
              fieldName: 'registrationCentre',
              operation: 'registrationLocationUserTransformer',
              parameters: [':office']
            },
            {
              fieldName: 'registrationLGA',
              operation: 'registrationLocationUserTransformer',
              parameters: [':district']
            },
            {
              fieldName: 'registrationState',
              operation: 'registrationLocationUserTransformer',
              parameters: [':state']
            }
          ]
        },
        groups: [
          {
            id: 'child-view-group',
            includeHiddenValues: true,
            fields: [
              {
                name: 'familyNameEng',
                previewGroup: 'childNameInEnglish',
                customisable: false,
                type: 'TEXT',
                label: formMessageDescriptors.childFamilyName,
                maxLength: 32,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'childFamilyName',
                    operation: 'upperCaseNameToFieldTransformer',
                    parameters: ['en', 'familyName']
                  },
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
                name: 'firstNamesEng',
                previewGroup: 'childNameInEnglish',
                customisable: false,
                type: 'TEXT',
                label: formMessageDescriptors.childFirstNames,
                maxLength: 32,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  },
                  {
                    operation: 'maxNames',
                    parameters: [1]
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'childFirstName',
                    operation: 'upperCaseNameToFieldTransformer',
                    parameters: ['en', 'firstNames']
                  },
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
                name: 'middleNamesEng',
                previewGroup: 'childNameInEnglish',
                customisable: false,
                type: 'TEXT',
                label: formMessageDescriptors.middleNames,
                maxLength: 32,
                required: false,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  },
                  {
                    operation: 'maxNames',
                    parameters: [1]
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'childMiddleNames',
                    operation: 'upperCaseNameToFieldTransformer',
                    parameters: ['en', 'middleNames']
                  },
                  mutation: {
                    operation: 'fieldToNameTransformer',
                    parameters: ['en', 'middleNames']
                  },
                  query: {
                    operation: 'nameToFieldTransformer',
                    parameters: ['en', 'middleNames']
                  }
                }
              },
              {
                name: 'childBirthDate',
                customisable: false,
                type: 'DATE',
                label: formMessageDescriptors.childDateOfBirth,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'isValidChildBirthDate'
                  }
                ],
                mapping: {
                  template: {
                    operation: 'dateFormatTransformer',
                    fieldName: 'eventDate',
                    parameters: ['birthDate', 'en', 'do MMMM yyyy']
                  },
                  mutation: {
                    operation: 'longDateTransformer',
                    parameters: ['birthDate']
                  },
                  query: {
                    operation: 'fieldValueTransformer',
                    parameters: ['birthDate']
                  }
                }
              },
              {
                name: 'gender',
                customisable: false,
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.childSex,
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                mapping: {
                  template: {
                    fieldName: 'informantGender',
                    operation: 'selectTransformer'
                  }
                },
                options: [
                  {
                    value: 'male',
                    label: formMessageDescriptors.childSexMale
                  },
                  {
                    value: 'female',
                    label: formMessageDescriptors.childSexFemale
                  }
                ]
              },
              {
                name: 'placeOfBirthTitle',
                type: 'SUBSECTION',
                label: formMessageDescriptors.placeOfBirthPreview,
                previewGroup: 'placeOfBirth',
                ignoreBottomMargin: true,
                initialValue: '',
                validate: []
              },
              {
                name: 'placeOfBirth',
                customisable: false,
                type: 'SELECT_WITH_OPTIONS',
                previewGroup: 'placeOfBirth',
                ignoreFieldLabelOnErrorMessage: true,
                label: formMessageDescriptors.placeOfBirth,
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: [
                  {
                    value: 'MATERNITY_HOME',
                    label: formMessageDescriptors.maternityHome
                  },
                  {
                    value: 'HEALTH_FACILITY',
                    label: formMessageDescriptors.hospital
                  },
                  {
                    value: 'PRIVATE_HOME',
                    label: formMessageDescriptors.privateHome
                  },
                  {
                    value: 'CAR_TAXI',
                    label: formMessageDescriptors.placeOfBirthCarTaxi
                  },
                  {
                    value: 'BUS',
                    label: formMessageDescriptors.placeOfBirthBus
                  },
                  {
                    value: 'TRAIN',
                    label: formMessageDescriptors.placeOfBirthTrain
                  },
                  {
                    value: 'ROADSIDE',
                    label: formMessageDescriptors.placeOfBirthRoadside
                  },
                  {
                    value: 'AEROPLANE',
                    label: formMessageDescriptors.placeOfBirthAeroplane
                  },
                  {
                    value: 'SHIP',
                    label: formMessageDescriptors.placeOfBirthShip
                  },
                  {
                    value: 'TRADITIONAL_MATERNITY_HOMES',
                    label:
                      formMessageDescriptors.placeOfBirthTraditionalMaternityHomes
                  },
                  {
                    value: 'TRADITIONAL_DOCTORS',
                    label: formMessageDescriptors.placeOfBirthTraditionalDoctors
                  },
                  {
                    value: 'TRADITIONAL_HERBALIST',
                    label:
                      formMessageDescriptors.placeOfBirthTraditionalHerbalist
                  },
                  {
                    value: 'SPIRITUAL_HOMES',
                    label: formMessageDescriptors.placeOfBirthSpiritualHomes
                  },
                  {
                    value: 'OTHER',
                    label: formMessageDescriptors.otherInstitution
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: []
                  },
                  query: {
                    operation: 'eventLocationTypeQueryTransformer',
                    parameters: []
                  }
                }
              },
              {
                name: 'seperator',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
                initialValue: '',
                ignoreBottomMargin: true,
                validate: [],
                conditionals: []
              },
              {
                name: 'birthType',
                customisable: true,
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Type of birth',
                  description: 'Label for form field: Type of birth',
                  id: 'form.field.label.birthType'
                },
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: [
                  {
                    value: 'SINGLE',
                    label: formMessageDescriptors.birthTypeSingle
                  },
                  {
                    value: 'TWIN',
                    label: formMessageDescriptors.birthTypeTwin
                  },
                  {
                    value: 'TRIPLET',
                    label: formMessageDescriptors.birthTypeTriplet
                  },
                  {
                    value: 'QUADRUPLET',
                    label: formMessageDescriptors.birthTypeQuadruplet
                  },
                  {
                    value: 'HIGHER_MULTIPLE_DELIVERY',
                    label:
                      formMessageDescriptors.birthTypeHigherMultipleDelivery
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'sectionFieldToBundleFieldTransformer',
                    parameters: []
                  },
                  query: {
                    operation: 'bundleFieldToSectionFieldTransformer',
                    parameters: []
                  }
                }
              },
              {
                name: 'multipleBirth',
                type: 'NUMBER',
                required: true,
                label: {
                  defaultMessage: 'No. of previous births',
                  description: 'Label for form field: multipleBirth',
                  id: 'form.field.label.multipleBirth'
                },
                customisable: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'isInBetween',
                    parameters: [1, 20]
                  }
                ]
              }
            ],
            previewGroups: [
              {
                id: 'childNameInEnglish',
                label: formMessageDescriptors.nameInEnglishPreviewGroup,
                fieldToRedirect: 'familyNameEng',
                delimiter: ' '
              }
            ]
          }
        ]
      },
      {
        id: BirthSection.Mother,
        viewType: 'form',
        name: formMessageDescriptors.motherName,
        title: formMessageDescriptors.motherTitle,
        hasDocumentSection: true,
        previewGroupTransformers: {
          motherNameInEnglish: nameTransformer
        },
        groups: [
          {
            id: 'mother-view-group',
            includeHiddenValues: true,
            fields: [
              {
                name: 'detailsExist',
                type: 'RADIO_GROUP',
                label: formMessageDescriptors.mothersDetailsExist,
                hidden: true,
                hideInPreview: true,
                required: true,
                initialValue: true,
                validate: [],
                options: [
                  {
                    value: true,
                    label: formMessageDescriptors.confirm
                  },
                  {
                    value: false,
                    label: formMessageDescriptors.deny
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'mothersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                mapping: {
                  query: {
                    operation: 'booleanTransformer'
                  }
                }
              },
              {
                name: 'reasonNotApplying',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.detailsExist'
                  }
                ],
                type: 'TEXT',
                label: formMessageDescriptors.reasonMNA,
                validate: [],
                initialValue: '',
                customisable: true,
                required: false
              },
              {
                name: 'familyNameEng',
                previewGroup: 'motherNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Last Name',
                  description: 'Label for form field: Family name in english',
                  id: 'form.field.label.motherFamilyNameEng'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                maxLength: 32,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'motherFamilyName',
                    operation: 'upperCaseNameToFieldTransformer',
                    parameters: ['en', 'familyName']
                  },
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
                name: 'firstNamesEng',
                previewGroup: 'motherNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First name(s)',
                  description: 'Label for form field: First names in english',
                  id: 'form.field.label.motherFirstNamesEng'
                },
                maxLength: 32,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  },
                  {
                    operation: 'maxNames',
                    parameters: [1]
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'motherFirstName',
                    operation: 'upperCaseNameToFieldTransformer',
                    parameters: ['en', 'firstNames']
                  },
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
                name: 'middleNamesEng',
                previewGroup: 'motherNameInEnglish',
                type: 'TEXT',
                label: formMessageDescriptors.middleNames,
                maxLength: 32,
                required: false,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  },
                  {
                    operation: 'maxNames',
                    parameters: [1]
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'motherMiddleNames',
                    operation: 'upperCaseNameToFieldTransformer',
                    parameters: ['en', 'middleNames']
                  },
                  mutation: {
                    operation: 'fieldToNameTransformer',
                    parameters: ['en', 'middleNames']
                  },
                  query: {
                    operation: 'nameToFieldTransformer',
                    parameters: ['en', 'middleNames']
                  }
                }
              },
              {
                name: 'address-separator',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
                initialValue: '',
                ignoreBottomMargin: true,
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ]
              },
              {
                name: 'ageAtBirthOfChild',
                type: 'FORCED_NUMBER_MAX_LENGTH',
                maxLength: 2,
                label: {
                  defaultMessage: 'Age at birth of child',
                  description: 'Label for form field: ageAtBirthOfChild',
                  id: 'form.field.label.ageAtBirthOfChild'
                },
                inputFieldWidth: '60px',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                customisable: true,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'isValidMotherBirth',
                    parameters: ['child.multipleBirth']
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'ageAtEventTransformer',
                    parameters: ['birthDate', 'child.childBirthDate']
                  },
                  query: {
                    operation: 'ageAtEventQueryTransformer',
                    parameters: [
                      'mother.birthDate',
                      'child.birthDate',
                      'ageAtBirthOfChild'
                    ]
                  }
                }
              },
              {
                name: 'maritalStatus',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Marital status',
                  description: 'Label for form field: Marital status',
                  id: 'form.field.label.maritalStatus'
                },
                customisable: true,
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                mapping: {
                  template: {
                    fieldName: 'motherMaritalStatus',
                    operation: 'selectTransformer'
                  }
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                options: [
                  {
                    value: 'SINGLE',
                    label: {
                      defaultMessage: 'Single',
                      description: 'Option for form field: Marital status',
                      id: 'form.field.label.maritalStatusSingle'
                    }
                  },
                  {
                    value: 'MARRIED',
                    label: {
                      defaultMessage: 'Married',
                      description: 'Option for form field: Marital status',
                      id: 'form.field.label.maritalStatusMarried'
                    }
                  },
                  {
                    value: 'SEPARATED',
                    label: {
                      id: 'form.field.label.maritalStatusSeparated',
                      defaultMessage: 'Separated',
                      description: 'Option for form field: Marital status'
                    }
                  },
                  {
                    value: 'DIVORCED',
                    label: {
                      defaultMessage: 'Divorced',
                      description: 'Option for form field: Marital status',
                      id: 'form.field.label.maritalStatusDivorced'
                    }
                  },
                  {
                    value: 'WIDOWED',
                    label: {
                      defaultMessage: 'Widowed',
                      description: 'Option for form field: Marital status',
                      id: 'form.field.label.maritalStatusWidowed'
                    }
                  }
                ]
              },
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.nationality,
                required: true,
                initialValue:
                  typeof window !== 'undefined'
                    ? (window as any).config.COUNTRY.toUpperCase()
                    : 'FAR',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: {
                  resource: 'countries'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'motherNationality',
                    operation: 'selectTransformer'
                  },
                  mutation: {
                    operation: 'fieldToArrayTransformer'
                  },
                  query: {
                    operation: 'arrayToFieldTransformer'
                  }
                }
              },
              {
                name: 'stateOfOrigin',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.stateOfOrigin,
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: STATE_OF_ORIGINS,
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist || values.nationality !== "NGA"'
                  }
                ]
              },
              {
                name: 'ethnicOrigin',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.ethnicOrigin,
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: ETHNIC_ORIGINS,
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist || values.nationality !== "NGA"'
                  }
                ]
              },

              {
                name: 'nationality-seperator',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
                initialValue: '',
                ignoreBottomMargin: true,
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ]
              },
              {
                name: 'literacy',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'literacy',
                  description: 'Label for form field: Mother literacy',
                  id: 'form.field.label.motherLiteracy'
                },
                required: true,
                customisable: true,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: [
                  {
                    value: 'LITERATE',
                    label: {
                      defaultMessage: 'Literate',
                      description: 'Label for literacy option Literate',
                      id: 'form.field.label.literacy.literate'
                    }
                  },
                  {
                    value: 'ILLITERATE',
                    label: {
                      defaultMessage: 'Illiterate',
                      description: 'Label for literacy option Illiterate',
                      id: 'form.field.label.literacy.illiterate'
                    }
                  }
                ]
              },
              {
                name: 'educationalAttainment',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'level of education',
                  description: 'Label for form field: Mother education',
                  id: 'form.field.label.motherEducationAttainment'
                },
                required: true,
                customisable: true,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  },
                  {
                    action: 'hide',
                    expression: 'values.literacy === "ILLITERATE"'
                  }
                ],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: [
                  {
                    value: 'KORANIC',
                    label: {
                      defaultMessage: 'Koranic',
                      description: 'Label for education option Koranic',
                      id: 'form.field.label.educationAttainment.koranic'
                    }
                  },
                  {
                    value: 'PRIMARY',
                    label: {
                      defaultMessage: 'Primary',
                      description: 'Label for education option Primary',
                      id: 'form.field.label.educationAttainment.primary'
                    }
                  },
                  {
                    value: 'MODERN',
                    label: {
                      defaultMessage: 'Modern',
                      description: 'Label for education option Modern',
                      id: 'form.field.label.educationAttainment.modern'
                    }
                  },
                  {
                    value: 'SECONDARY',
                    label: {
                      defaultMessage: 'Secondary',
                      description: 'Label for education option Secondary',
                      id: 'form.field.label.educationAttainment.secondary'
                    }
                  },
                  {
                    value: 'HIGHER_SCHOOL',
                    label: {
                      defaultMessage: 'Higher School',
                      description: 'Label for education option Higher School',
                      id: 'form.field.label.educationAttainment.higherSchool'
                    }
                  },
                  {
                    value: 'POLYTECNIC_NCE',
                    label: {
                      defaultMessage: 'Polytecnic/NCE',
                      description: 'Label for education option Polytecnic/NCE',
                      id: 'form.field.label.educationAttainment.polytecnicNce'
                    }
                  },
                  {
                    value: 'UNIVERSITY',
                    label: {
                      defaultMessage: 'University',
                      description: 'Label for education option University',
                      id: 'form.field.label.educationAttainment.university'
                    }
                  },
                  {
                    value: 'NO_EDUCATION',
                    label: {
                      defaultMessage: 'No formal education',
                      description:
                        'Label for education option No formal education',
                      id: 'form.field.label.educationAttainmentNoEducation'
                    }
                  }
                ]
              },
              {
                name: 'occupation',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Occupation',
                  description: 'text for occupation form field',
                  id: 'form.field.label.occupation'
                },
                customisable: true,
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ]
              },
              {
                name: 'phoneNumber',
                type: 'BIG_NUMBER',
                label: formMessageDescriptors.phoneNumber,
                required: false,
                initialValue: '',
                mapping: {
                  mutation: {
                    operation: 'changeHirerchyMutationTransformerConditional',
                    parameters: [
                      'registration.contactPhoneNumber',
                      'isMotherInformant',
                      {
                        operation: 'msisdnTransformer',
                        parameters: ['registration.contactPhoneNumber']
                      },
                      {
                        operation: 'fieldToTelecomTransformer',
                        parameters: []
                      }
                    ]
                  },
                  query: {
                    operation: 'changeHirerchyQueryTransformerConditional',
                    parameters: [
                      'registration.contactPhoneNumber',
                      'isMotherInformant',
                      {
                        operation: 'localPhoneTransformer',
                        parameters: ['registration.contactPhoneNumber']
                      },
                      {
                        operation: 'telecomToFieldTransformer',
                        parameters: []
                      }
                    ]
                  }
                },
                validate: [
                  {
                    operation: 'phoneNumberFormat'
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ]
              },
              {
                name: 'iD',
                type: 'BIG_NUMBER',
                label: formMessageDescriptors.iDTypeNationalID,
                required: false,
                customisable: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'validIDNumber',
                    parameters: ['NATIONAL_ID']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['father.iD']
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'motherNID',
                    operation: 'identityToFieldTransformer',
                    parameters: ['id', 'NATIONAL_ID']
                  },
                  mutation: {
                    operation: 'fieldToIdentityTransformer',
                    parameters: ['id', 'NATIONAL_ID']
                  },
                  query: {
                    operation: 'identityToFieldTransformer',
                    parameters: ['id', 'NATIONAL_ID']
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'motherNameInEnglish',
                label: {
                  defaultMessage: "Mother's English name",
                  description: "Group label for mother's name in english",
                  id: 'form.preview.group.label.mother.english.name'
                },
                fieldToRedirect: 'familyNameEng',
                delimiter: ' '
              }
            ]
          }
        ],
        mapping: {
          query: {
            operation: 'emptyMotherSectionTransformer'
          }
        }
      },
      {
        id: BirthSection.Father,
        viewType: 'form',
        name: {
          defaultMessage: 'Father',
          description: 'Form section name for Father',
          id: 'form.section.father.name'
        },
        title: {
          defaultMessage: "Father's details",
          description: 'Form section title for Father',
          id: 'form.section.father.title'
        },
        hasDocumentSection: true,
        previewGroupTransformers: {
          fatherNameInEnglish: nameTransformer
        },
        groups: [
          {
            id: 'father-view-group',
            fields: [
              // Last name
              {
                name: 'familyNameEng',
                previewGroup: 'fatherNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Last Name',
                  description: 'Label for form field: Family name in english',
                  id: 'form.field.label.fatherFamilyNameEng'
                },
                maxLength: 32,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'fatherFamilyName',
                    operation: 'upperCaseNameToFieldTransformer',
                    parameters: ['en', 'familyName']
                  },
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
              // First name
              {
                name: 'firstNamesEng',
                previewGroup: 'fatherNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First Name',
                  description: 'Label for form field: First names in english',
                  id: 'form.field.label.fatherFirstNamesEng'
                },
                maxLength: 32,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  },
                  {
                    operation: 'maxNames',
                    parameters: [1]
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'fatherFirstName',
                    operation: 'upperCaseNameToFieldTransformer',
                    parameters: ['en', 'firstNames']
                  },
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
              // Middle name
              {
                name: 'middleNamesEng',
                previewGroup: 'fatherNameInEnglish',
                customisable: false,
                type: 'TEXT',
                label: formMessageDescriptors.middleNames,
                maxLength: 32,
                required: false,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  },
                  {
                    operation: 'maxNames',
                    parameters: [1]
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'fatherMiddleNames',
                    operation: 'upperCaseNameToFieldTransformer',
                    parameters: ['en', 'middleNames']
                  },
                  mutation: {
                    operation: 'fieldToNameTransformer',
                    parameters: ['en', 'middleNames']
                  },
                  query: {
                    operation: 'nameToFieldTransformer',
                    parameters: ['en', 'middleNames']
                  }
                }
              },
              // Separator
              {
                name: 'address-seperator',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
                initialValue: '',
                ignoreBottomMargin: true,
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                  }
                ]
              },
              // Birthdate
              {
                name: 'ageAtBirthOfChild',
                type: 'FORCED_NUMBER_MAX_LENGTH',
                maxLength: 2,
                label: {
                  defaultMessage: 'Age at birth of child',
                  description: 'Label for form field: ageAtBirthOfChild',
                  id: 'form.field.label.ageAtBirthOfChild'
                },
                inputFieldWidth: '60px',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                customisable: true,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'isInBetween',
                    parameters: [13, 99]
                  },
                  {
                    operation: 'maxLength',
                    parameters: [2]
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'ageAtEventTransformer',
                    parameters: ['birthDate', 'child.childBirthDate']
                  },
                  query: {
                    operation: 'ageAtEventQueryTransformer',
                    parameters: [
                      'father.birthDate',
                      'child.birthDate',
                      'ageAtBirthOfChild'
                    ]
                  }
                }
              },
              // Marital status
              {
                name: 'maritalStatus',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Marital status',
                  description: 'Label for form field: Marital status',
                  id: 'form.field.label.maritalStatus'
                },
                customisable: true,
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'fatherMaritalStatus',
                    operation: 'selectTransformer'
                  }
                },
                options: [
                  {
                    value: 'SINGLE',
                    label: {
                      defaultMessage: 'Single',
                      description: 'Option for form field: Marital status',
                      id: 'form.field.label.maritalStatusSingle'
                    }
                  },
                  {
                    value: 'MARRIED',
                    label: {
                      defaultMessage: 'Married',
                      description: 'Option for form field: Marital status',
                      id: 'form.field.label.maritalStatusMarried'
                    }
                  },
                  {
                    value: 'SEPARATED',
                    label: {
                      id: 'form.field.label.maritalStatusSeparated',
                      defaultMessage: 'Separated',
                      description: 'Option for form field: Marital status'
                    }
                  },
                  {
                    value: 'DIVORCED',
                    label: {
                      defaultMessage: 'Divorced',
                      description: 'Option for form field: Marital status',
                      id: 'form.field.label.maritalStatusDivorced'
                    }
                  },
                  {
                    value: 'WIDOWED',
                    label: {
                      defaultMessage: 'Widowed',
                      description: 'Option for form field: Marital status',
                      id: 'form.field.label.maritalStatusWidowed'
                    }
                  }
                ]
              },
              // Nationality
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.nationality,
                required: true,
                initialValue:
                  typeof window !== 'undefined'
                    ? (window as any).config.COUNTRY.toUpperCase()
                    : 'FAR',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: {
                  resource: 'countries'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'fatherNationality',
                    operation: 'selectTransformer'
                  },
                  mutation: {
                    operation: 'fieldToArrayTransformer'
                  },
                  query: {
                    operation: 'arrayToFieldTransformer'
                  }
                }
              },
              // State of origin
              {
                name: 'stateOfOrigin',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.stateOfOrigin,
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: STATE_OF_ORIGINS,
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist || values.nationality !== "NGA"'
                  }
                ]
              },
              // Ethnicity
              {
                name: 'ethnicOrigin',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.ethnicOrigin,
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: ETHNIC_ORIGINS,
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist || values.nationality !== "NGA"'
                  }
                ]
              },
              // Separator
              {
                name: 'seperator',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
                initialValue: '',
                ignoreBottomMargin: true,
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                  }
                ]
              },
              // Education
              {
                name: 'literacy',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'literacy',
                  description: 'Label for form field: Mother literacy',
                  id: 'form.field.label.motherLiteracy'
                },
                required: true,
                customisable: true,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: [
                  {
                    value: 'LITERATE',
                    label: {
                      defaultMessage: 'Literate',
                      description: 'Label for literacy option Literate',
                      id: 'form.field.label.literacy.literate'
                    }
                  },
                  {
                    value: 'ILLITERATE',
                    label: {
                      defaultMessage: 'Illiterate',
                      description: 'Label for literacy option Illiterate',
                      id: 'form.field.label.literacy.illiterate'
                    }
                  }
                ]
              },
              {
                name: 'educationalAttainment',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'level of education',
                  description: 'Label for form field: Mother education',
                  id: 'form.field.label.motherEducationAttainment'
                },
                customisable: true,
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                  },
                  {
                    action: 'hide',
                    expression: 'values.literacy === "ILLITERATE"'
                  }
                ],
                options: [
                  {
                    value: 'KORANIC',
                    label: {
                      defaultMessage: 'Koranic',
                      description: 'Label for education option Koranic',
                      id: 'form.field.label.educationAttainment.koranic'
                    }
                  },
                  {
                    value: 'PRIMARY',
                    label: {
                      defaultMessage: 'Primary',
                      description: 'Label for education option Primary',
                      id: 'form.field.label.educationAttainment.primary'
                    }
                  },
                  {
                    value: 'MODERN',
                    label: {
                      defaultMessage: 'Modern',
                      description: 'Label for education option Modern',
                      id: 'form.field.label.educationAttainment.modern'
                    }
                  },
                  {
                    value: 'SECONDARY',
                    label: {
                      defaultMessage: 'Secondary',
                      description: 'Label for education option Secondary',
                      id: 'form.field.label.educationAttainment.secondary'
                    }
                  },
                  {
                    value: 'HIGHER_SCHOOL',
                    label: {
                      defaultMessage: 'Higher School',
                      description: 'Label for education option Higher School',
                      id: 'form.field.label.educationAttainment.higherSchool'
                    }
                  },
                  {
                    value: 'POLYTECNIC_NCE',
                    label: {
                      defaultMessage: 'Polytecnic/NCE',
                      description: 'Label for education option Polytecnic/NCE',
                      id: 'form.field.label.educationAttainment.polytecnicNce'
                    }
                  },
                  {
                    value: 'UNIVERSITY',
                    label: {
                      defaultMessage: 'University',
                      description: 'Label for education option University',
                      id: 'form.field.label.educationAttainment.university'
                    }
                  },
                  {
                    value: 'NO_EDUCATION',
                    label: {
                      defaultMessage: 'No formal education',
                      description:
                        'Label for education option No formal education',
                      id: 'form.field.label.educationAttainmentNoEducation'
                    }
                  }
                ]
              },
              // Occupation
              {
                name: 'occupation',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Occupation',
                  description: 'text for occupation form field',
                  id: 'form.field.label.occupation'
                },
                customisable: true,
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                  }
                ]
              },
              // Phone number
              {
                name: 'phoneNumber',
                type: 'BIG_NUMBER',
                label: formMessageDescriptors.phoneNumber,
                required: false,
                initialValue: '',
                mapping: {
                  mutation: {
                    operation: 'changeHirerchyMutationTransformerConditional',
                    parameters: [
                      'registration.contactPhoneNumber',
                      'isFatherInformant',
                      {
                        operation: 'msisdnTransformer',
                        parameters: ['registration.contactPhoneNumber']
                      },
                      {
                        operation: 'fieldToTelecomTransformer',
                        parameters: []
                      }
                    ]
                  },
                  query: {
                    operation: 'changeHirerchyQueryTransformerConditional',
                    parameters: [
                      'registration.contactPhoneNumber',
                      'isFatherInformant',
                      {
                        operation: 'localPhoneTransformer',
                        parameters: ['registration.contactPhoneNumber']
                      },
                      {
                        operation: 'telecomToFieldTransformer',
                        parameters: []
                      }
                    ]
                  }
                },
                validate: [
                  {
                    operation: 'phoneNumberFormat'
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                  }
                ]
              },
              // NiD
              {
                name: 'iD',
                type: 'BIG_NUMBER',
                label: formMessageDescriptors.iDTypeNationalID,
                required: false,
                customisable: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'validIDNumber',
                    parameters: ['NATIONAL_ID']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['mother.iD']
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'fatherNID',
                    operation: 'identityToFieldTransformer',
                    parameters: ['id', 'NATIONAL_ID']
                  },
                  mutation: {
                    operation: 'fieldToIdentityTransformer',
                    parameters: ['id', 'NATIONAL_ID']
                  },
                  query: {
                    operation: 'identityToFieldTransformer',
                    parameters: ['id', 'NATIONAL_ID']
                  }
                }
              },
              // Details exists
              {
                name: 'detailsExist',
                type: 'CHECKBOX',
                label: formMessageDescriptors.fathersDetailsExist,
                required: true,
                checkedValue: false,
                uncheckedValue: true,
                hideHeader: true,
                initialValue: true,
                validate: [],
                reviewOverrideLabels: [
                  {
                    value: false,
                    label: formMessageDescriptors.fathersDetailsUnavailable
                  }
                ],
                reviewConditionals: [
                  {
                    action: 'hide',
                    expression: 'values.detailsExist'
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'fathersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                mapping: {
                  query: {
                    operation: 'booleanTransformer'
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'fatherNameInEnglish',
                label: {
                  defaultMessage: "Father's fullname",
                  description: "Group label for father's name in english",
                  id: 'form.preview.group.label.father.english.name'
                },
                fieldToRedirect: 'familyNameEng',
                delimiter: ' '
              }
            ]
          }
        ],
        mapping: {
          query: {
            operation: 'emptyFatherSectionTransformer'
          }
        }
      },
      {
        id: BirthSection.Registration,
        viewType: 'form',
        name: formMessageDescriptors.registrationName,
        title: formMessageDescriptors.registrationTitle,
        groups: [
          {
            id: 'who-is-applying-view-group',
            title: {
              defaultMessage: 'Informant',
              description: 'Form section name for Informant',
              id: 'form.section.informant.title'
            },
            conditionals: [
              {
                action: 'hide',
                expression: 'true'
              }
            ],
            preventContinueIfError: true,
            showExitButtonOnly: false,
            fields: [
              {
                name: 'informantType',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.informantsRelationWithChild,
                hideHeader: false,
                required: true,
                hideInPreview: false,
                initialValue: '',
                validate: [
                  {
                    operation: 'validInformant'
                  }
                ],
                options: [
                  {
                    value: 'MOTHER',
                    label: informantMessageDescriptors.mother
                  },
                  {
                    value: 'FATHER',
                    label: informantMessageDescriptors.father
                  },
                  {
                    value: 'PATERNAL_GRANDFATHER',
                    label: informantMessageDescriptors.paternalGrandfather
                  },
                  {
                    value: 'PATERNAL_GRANDMOTHER',
                    label: informantMessageDescriptors.paternalGrandmother
                  },
                  {
                    value: 'MATERNAL_GRANDFATHER',
                    label: informantMessageDescriptors.maternalGrandfather
                  },
                  {
                    value: 'MATERNAL_GRANDMOTHER',
                    label: informantMessageDescriptors.maternalGrandmother
                  },
                  {
                    value: 'BROTHER',
                    label: informantMessageDescriptors.brother
                  },
                  {
                    value: 'SISTER',
                    label: informantMessageDescriptors.sister
                  },
                  {
                    value: 'OTHER_FAMILY_MEMBER',
                    label: informantMessageDescriptors.otherFamilyMember
                  },
                  {
                    value: 'LEGAL_GUARDIAN',
                    label: informantMessageDescriptors.legalGuardian
                  },

                  {
                    value: 'MOTHERS_BROTHER',
                    label: informantMessageDescriptors.mothersBrother
                  },
                  {
                    value: 'MOTHERS_SISTER',
                    label: informantMessageDescriptors.mothersSister
                  },
                  {
                    value: 'FATHERS_BROTHER',
                    label: informantMessageDescriptors.fathersBrother
                  },
                  {
                    value: 'FATHERS_SISTER',
                    label: informantMessageDescriptors.fathersSister
                  },
                  {
                    value: 'OTHER',
                    label: formMessageDescriptors.someoneElse
                  }
                ],
                placeholder: formMessageDescriptors.formSelectPlaceholder
              },
              {
                name: 'otherInformantType',
                type: 'TEXT',
                label: formMessageDescriptors.informantsOtherRelationWithChild,
                placeholder: formMessageDescriptors.relationshipPlaceHolder,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.informantType || values.informantType !== "OTHER"'
                  }
                ]
              }
            ]
          }
        ],
        mapping: {
          template: [],
          mutation: {
            operation: 'setBirthRegistrationSectionTransformer'
          },
          query: {
            operation: 'getBirthRegistrationSectionTransformer'
          }
        }
      },
      {
        id: BirthSection.Informant,
        viewType: 'form',
        name: {
          defaultMessage: 'Informant',
          description: 'Form section name for Informant',
          id: 'form.section.informant.name'
        },
        title: formMessageDescriptors.informantTitle,
        hasDocumentSection: true,
        previewGroupTransformers: {
          informantNameInEnglish: nameTransformer
        },
        groups: [
          {
            id: 'informant-view-group',
            conditionals: [],
            fields: [
              {
                name: 'informantType',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.informantsRelationWithChild,
                hideHeader: false,
                required: true,
                hideInPreview: false,
                initialValue: '',
                validate: [
                  {
                    operation: 'validInformant'
                  }
                ],
                options: [
                  {
                    value: 'MOTHER',
                    label: informantMessageDescriptors.mother
                  },
                  {
                    value: 'FATHER',
                    label: informantMessageDescriptors.father
                  },
                  {
                    value: 'PATERNAL_GRANDFATHER',
                    label: informantMessageDescriptors.paternalGrandfather
                  },
                  {
                    value: 'PATERNAL_GRANDMOTHER',
                    label: informantMessageDescriptors.paternalGrandmother
                  },
                  {
                    value: 'MATERNAL_GRANDFATHER',
                    label: informantMessageDescriptors.maternalGrandfather
                  },
                  {
                    value: 'MATERNAL_GRANDMOTHER',
                    label: informantMessageDescriptors.maternalGrandmother
                  },
                  {
                    value: 'BROTHER',
                    label: informantMessageDescriptors.brother
                  },
                  {
                    value: 'SISTER',
                    label: informantMessageDescriptors.sister
                  },
                  {
                    value: 'MOTHERS_BROTHER',
                    label: informantMessageDescriptors.mothersBrother
                  },
                  {
                    value: 'MOTHERS_SISTER',
                    label: informantMessageDescriptors.mothersSister
                  },
                  {
                    value: 'FATHERS_BROTHER',
                    label: informantMessageDescriptors.fathersBrother
                  },
                  {
                    value: 'FATHERS_SISTER',
                    label: informantMessageDescriptors.fathersSister
                  },
                  {
                    value: 'OTHER_FAMILY_MEMBER',
                    label: informantMessageDescriptors.otherFamilyMember
                  },
                  {
                    value: 'LEGAL_GUARDIAN',
                    label: informantMessageDescriptors.legalGuardian
                  },
                  {
                    value: 'OTHER',
                    label: formMessageDescriptors.someoneElse
                  }
                ],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                mapping: {
                  mutation: {
                    operation: 'changeHirerchyMutationTransformer',
                    parameters: ['registration.informantType']
                  },
                  query: {
                    operation: 'changeHirerchyQueryTransformer',
                    parameters: ['registration.informantType']
                  }
                }
              },
              {
                name: 'otherInformantType',
                type: 'TEXT',
                label: formMessageDescriptors.informantsOtherRelationWithChild,
                placeholder: formMessageDescriptors.relationshipPlaceHolder,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.informantType || values.informantType !== "OTHER"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'changeHirerchyMutationTransformer',
                    parameters: ['registration.otherInformantType']
                  },
                  query: {
                    operation: 'changeHirerchyQueryTransformer',
                    parameters: ['registration.otherInformantType']
                  }
                }
              },
              {
                name: 'familyNameEng',
                previewGroup: 'informantNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Last name',
                  description: 'Label for form field: Last name in english',
                  id: 'form.field.label.childFamilyName'
                },
                maxLength: 32,
                required: true,
                initialValue: '',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.informantType || values.informantType == "MOTHER" || values.informantType == "FATHER"'
                  }
                ],
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToNameTransformer',
                        parameters: ['en', 'familyName']
                      },
                      'name'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'nameToFieldTransformer',
                        parameters: ['en', 'familyName']
                      }
                    ]
                  }
                }
              },
              {
                name: 'firstNamesEng',
                previewGroup: 'informantNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First name(s)',
                  description: 'Label for form field: Given names',
                  id: 'form.field.label.childFirstNames'
                },
                maxLength: 32,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  },
                  {
                    operation: 'maxNames',
                    parameters: [1]
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.informantType || values.informantType == "MOTHER" || values.informantType == "FATHER"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToNameTransformer',
                        parameters: ['en', 'firstNames']
                      },
                      'name'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'nameToFieldTransformer',
                        parameters: ['en', 'firstNames']
                      }
                    ]
                  }
                }
              },
              {
                name: 'middleNamesEng',
                previewGroup: 'informantNameInEnglish',
                label: formMessageDescriptors.middleNames,
                type: 'TEXT',
                maxLength: 32,
                required: false,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  },
                  {
                    operation: 'maxNames',
                    parameters: [1]
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.informantType || values.informantType == "MOTHER" || values.informantType == "FATHER"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToNameTransformer',
                        parameters: ['en', 'middleNames']
                      },
                      'name'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'nameToFieldTransformer',
                        parameters: ['en', 'middleNames']
                      }
                    ]
                  }
                }
              },
              {
                name: 'seperator',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
                initialValue: '',
                ignoreBottomMargin: true,
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.informantType || values.informantType == "MOTHER" || values.informantType == "FATHER"'
                  }
                ]
              },
              {
                name: 'registrationPhone',
                type: 'BIG_NUMBER',
                label: formMessageDescriptors.phoneNumber,
                required: false,
                initialValue: '',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.informantType || values.informantType == "MOTHER" || values.informantType == "FATHER"'
                  }
                ],
                validate: [
                  {
                    operation: 'phoneNumberFormat'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'changeHirerchyMutationTransformer',
                    parameters: [
                      'registration.contactPhoneNumber',
                      {
                        operation: 'msisdnTransformer',
                        parameters: ['registration.contactPhoneNumber']
                      }
                    ]
                  },
                  query: {
                    operation: 'changeHirerchyQueryTransformer',
                    parameters: [
                      'registration.contactPhoneNumber',
                      {
                        operation: 'localPhoneTransformer',
                        parameters: ['registration.contactPhoneNumber']
                      }
                    ]
                  }
                }
              },
              {
                name: 'informantID',
                type: 'BIG_NUMBER',
                label: formMessageDescriptors.iDTypeNationalID,
                required: false,
                customisable: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'validIDNumber',
                    parameters: ['NATIONAL_ID']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['deceased.iD']
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.informantType || values.informantType == "MOTHER" || values.informantType == "FATHER"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToIdentityTransformer',
                        parameters: ['id', 'NATIONAL_ID']
                      }
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'identityToFieldTransformer',
                        parameters: ['id', 'NATIONAL_ID']
                      }
                    ]
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'informantNameInEnglish',
                label: {
                  defaultMessage: "Informant's fullname",
                  description: "Label for informant's name in english",
                  id: 'form.preview.group.label.informant.english.name'
                },
                fieldToRedirect: 'informantFamilyNameEng',
                delimiter: ' '
              }
            ]
          }
        ],
        mapping: {
          mutation: {
            operation: 'setInformantRegistrationComposedTransformer',
            parameters: ['birth']
          },
          query: {
            operation: 'getInformantRegistrationComposedTransformer',
            parameters: ['birth']
          }
        }
      },
      {
        id: BirthSection.Documents,
        viewType: 'form',
        name: formMessageDescriptors.documentsName,
        title: {
          defaultMessage: 'Attaching supporting documents',
          description: 'Form section title for Documents',
          id: 'form.section.documents.title'
        },
        groups: [
          {
            id: 'documents-view-group',
            conditionals: [
              {
                description: 'Hidden for record correction',
                action: 'hide',
                expression:
                  'draftData && draftData.corrector && draftData.corrector.relationship'
              }
            ],
            fields: [
              {
                name: 'paragraph',
                type: 'PARAGRAPH',
                label: formMessageDescriptors.documentsParagraph,
                initialValue: '',
                validate: []
              },
              {
                name: 'uploadDocForB1Form',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: formMessageDescriptors.docTypeBirthDeclaration,
                initialValue: '',
                extraValue: birthDocumentForWhomFhirMapping.BIRTH_DECLARATION,
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value: birthDocumentTypeFhirMapping.B1_FORM,
                    label: formMessageDescriptors.docTypeB1Form
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'birthAttachmentToFieldTransformer'
                  }
                }
              },
              {
                name: 'uploadDocForChildDOB',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: formMessageDescriptors.proofOfBirth,
                initialValue: '',
                extraValue: birthDocumentForWhomFhirMapping.CHILD,
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value: birthDocumentTypeFhirMapping.NOTIFICATION_OF_BIRTH,
                    label: formMessageDescriptors.docTypeChildBirthProof
                  },
                  {
                    value: birthDocumentTypeFhirMapping.VACCINATION_CARD,
                    label:
                      formMessageDescriptors.docTypeChildBirthProofVaccinationCard
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'birthAttachmentToFieldTransformer'
                  }
                }
              },
              {
                name: 'uploadDocForMother',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: formMessageDescriptors.proofOfMothersID,
                initialValue: '',
                extraValue: birthDocumentForWhomFhirMapping.MOTHER,
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value: birthDocumentTypeFhirMapping.NATIONAL_ID,
                    label: formMessageDescriptors.docTypeNID
                  },
                  {
                    value: birthDocumentTypeFhirMapping.PASSPORT,
                    label: formMessageDescriptors.docTypePassport
                  },
                  {
                    value: birthDocumentTypeFhirMapping.VOTERS_CARD,
                    label: formMessageDescriptors.docTypeVotersCard
                  },
                  {
                    value: birthDocumentTypeFhirMapping.BIRTH_CERTIFICATE,
                    label: formMessageDescriptors.docTypeBirthCert
                  },
                  {
                    value: birthDocumentTypeFhirMapping.OTHER,
                    label: formMessageDescriptors.docTypeOther
                  }
                ],
                conditionals: [
                  {
                    description:
                      'Hidden for Parent Details none or Mother only',
                    action: 'hide',
                    expression:
                      'draftData && draftData.mother && !draftData.mother.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'birthAttachmentToFieldTransformer'
                  }
                }
              },
              {
                name: 'uploadDocForFather',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: formMessageDescriptors.proofOfFathersID,
                initialValue: '',
                extraValue: birthDocumentForWhomFhirMapping.FATHER,
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value: birthDocumentTypeFhirMapping.NATIONAL_ID,
                    label: formMessageDescriptors.docTypeNID
                  },
                  {
                    value: birthDocumentTypeFhirMapping.PASSPORT,
                    label: formMessageDescriptors.docTypePassport
                  },
                  {
                    value: birthDocumentTypeFhirMapping.VOTERS_CARD,
                    label: formMessageDescriptors.docTypeVotersCard
                  },
                  {
                    value: birthDocumentTypeFhirMapping.BIRTH_CERTIFICATE,
                    label: formMessageDescriptors.docTypeBirthCert
                  },
                  {
                    value: birthDocumentTypeFhirMapping.OTHER,
                    label: formMessageDescriptors.docTypeOther
                  }
                ],
                conditionals: [
                  {
                    description:
                      'Hidden for Parent Details none or Father only',
                    action: 'hide',
                    expression:
                      'draftData && draftData.father && !draftData.father.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'birthAttachmentToFieldTransformer'
                  }
                }
              },
              {
                name: 'uploadDocForInformant',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: formMessageDescriptors.proofOfInformantsID,
                initialValue: '',
                extraValue: birthDocumentForWhomFhirMapping.INFORMANT_ID_PROOF,
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value: birthDocumentTypeFhirMapping.NATIONAL_ID,
                    label: formMessageDescriptors.docTypeNID
                  },
                  {
                    value: birthDocumentTypeFhirMapping.PASSPORT,
                    label: formMessageDescriptors.docTypePassport
                  },
                  {
                    value: birthDocumentTypeFhirMapping.BIRTH_CERTIFICATE,
                    label: formMessageDescriptors.docTypeBirthCert
                  },
                  {
                    value: birthDocumentTypeFhirMapping.OTHER,
                    label: formMessageDescriptors.docTypeOther
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      "(draftData && draftData.informant && draftData.informant.informantType && (draftData.informant.informantType === 'MOTHER' || draftData.informant.informantType === 'FATHER'))"
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'birthAttachmentToFieldTransformer'
                  }
                }
              },
              {
                name: 'uploadDocForProofOfLegarGuardian',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: formMessageDescriptors.otherBirthSupportingDocuments,
                initialValue: '',
                extraValue:
                  birthDocumentForWhomFhirMapping.LEGAL_GUARDIAN_PROOF,
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value:
                      birthDocumentTypeFhirMapping.PROOF_OF_LEGAL_GUARDIANSHIP,
                    label: formMessageDescriptors.legalGuardianProof
                  },
                  {
                    value:
                      birthDocumentTypeFhirMapping.PROOF_OF_ASSIGNED_RESPONSIBILITY,
                    label: formMessageDescriptors.assignedResponsibilityProof
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      "(draftData && draftData.informant && draftData.informant.informantType && (draftData.informant.informantType === 'MOTHER' || draftData.informant.informantType === 'FATHER'))"
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'birthAttachmentToFieldTransformer'
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  },
  death: {
    sections: [
      {
        id: DeathSection.Deceased,
        viewType: 'form',
        name: formMessageDescriptors.deceasedName,
        title: formMessageDescriptors.deceasedTitle,
        hasDocumentSection: true,
        previewGroupTransformers: {
          deceasedNameInEnglish: nameTransformer
        },
        groups: [
          {
            id: 'deceased-view-group',
            includeHiddenValues: true,
            fields: [
              {
                name: 'familyNameEng',
                previewGroup: 'deceasedNameInEnglish',
                type: 'TEXT',
                label: formMessageDescriptors.deceasedFamilyNameEng,
                maxLength: 32,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'deceasedFamilyName',
                    operation: 'nameToFieldTransformer',
                    parameters: ['en', 'familyName']
                  },
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
                name: 'firstNamesEng',
                previewGroup: 'deceasedNameInEnglish',
                type: 'TEXT',
                label: formMessageDescriptors.deceasedGivenNamesEng,
                maxLength: 32,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'deceasedFirstName',
                    operation: 'nameToFieldTransformer',
                    parameters: ['en', 'firstNames']
                  },
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
                name: 'middleNamesEng',
                previewGroup: 'deceasedNameInEnglish',
                customisable: false,
                type: 'TEXT',
                label: formMessageDescriptors.middleNames,
                maxLength: 32,
                required: false,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  },
                  {
                    operation: 'maxNames',
                    parameters: [1]
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'deceasedMiddleNames',
                    operation: 'upperCaseNameToFieldTransformer',
                    parameters: ['en', 'middleNames']
                  },
                  mutation: {
                    operation: 'fieldToNameTransformer',
                    parameters: ['en', 'middleNames']
                  },
                  query: {
                    operation: 'nameToFieldTransformer',
                    parameters: ['en', 'middleNames']
                  }
                }
              },
              {
                name: 'deathDate',
                type: 'DATE',
                label: formMessageDescriptors.deathEventDate,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'isValidDeathOccurrenceDate'
                  }
                ],
                mapping: {
                  template: {
                    operation: 'deceasedDateFormatTransformation',
                    fieldName: 'eventDate',
                    parameters: ['en', 'do MMMM yyyy', 'deceased']
                  },
                  mutation: {
                    operation: 'fieldToDeceasedDateTransformation',
                    parameters: [
                      'deceased',
                      {
                        operation: 'longDateTransformer',
                        parameters: []
                      }
                    ]
                  },
                  query: {
                    operation: 'deceasedDateToFieldTransformation',
                    parameters: ['deceased']
                  }
                }
              },
              {
                name: 'gender',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.deceasedSex,
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                mapping: {
                  template: {
                    fieldName: 'deceasedGender',
                    operation: 'selectTransformer'
                  }
                },
                options: [
                  {
                    value: 'male',
                    label: formMessageDescriptors.deceasedSexMale
                  },
                  {
                    value: 'female',
                    label: formMessageDescriptors.deceasedSexFemale
                  }
                ]
              },
              {
                name: 'placeOfDeathTitle',
                type: 'SUBSECTION',
                label: formMessageDescriptors.placeOfDeathPreview,
                initialValue: '',
                ignoreBottomMargin: true,
                validate: [],
                conditionals: []
              },
              {
                name: 'placeOfDeath',
                customisable: false,
                type: 'SELECT_WITH_OPTIONS',
                previewGroup: 'placeOfDeath',
                ignoreFieldLabelOnErrorMessage: true,
                label: formMessageDescriptors.placeOfDeath,
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: [
                  {
                    value: 'MATERNITY_HOME',
                    label: formMessageDescriptors.maternityHome
                  },
                  {
                    value: 'HEALTH_FACILITY',
                    label: formMessageDescriptors.hospital
                  },
                  {
                    value: 'PRIVATE_HOME',
                    label: formMessageDescriptors.privateHome
                  },
                  {
                    value: 'CAR_TAXI',
                    label: formMessageDescriptors.placeOfBirthCarTaxi
                  },
                  {
                    value: 'BUS',
                    label: formMessageDescriptors.placeOfBirthBus
                  },
                  {
                    value: 'TRAIN',
                    label: formMessageDescriptors.placeOfBirthTrain
                  },
                  {
                    value: 'ROADSIDE',
                    label: formMessageDescriptors.placeOfBirthRoadside
                  },
                  {
                    value: 'AEROPLANE',
                    label: formMessageDescriptors.placeOfBirthAeroplane
                  },
                  {
                    value: 'SHIP',
                    label: formMessageDescriptors.placeOfBirthShip
                  },
                  {
                    value: 'TRADITIONAL_MATERNITY_HOMES',
                    label:
                      formMessageDescriptors.placeOfBirthTraditionalMaternityHomes
                  },
                  {
                    value: 'TRADITIONAL_DOCTORS',
                    label: formMessageDescriptors.placeOfBirthTraditionalDoctors
                  },
                  {
                    value: 'TRADITIONAL_HERBALIST',
                    label:
                      formMessageDescriptors.placeOfBirthTraditionalHerbalist
                  },
                  {
                    value: 'SPIRITUAL_HOMES',
                    label: formMessageDescriptors.placeOfBirthSpiritualHomes
                  },
                  {
                    value: 'OTHER',
                    label: formMessageDescriptors.otherInstitution
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: []
                  },
                  query: {
                    operation: 'eventLocationTypeQueryTransformer',
                    parameters: []
                  }
                }
              },
              // PRIMARY ADDRESS SUBSECTION
              // PRIMARY ADDRESS
              // SECONDARY ADDRESS SAME AS PRIMARY
              // SECONDARY ADDRESS SUBSECTION
              // SECONDARY ADDRESS
              {
                name: 'deceased-details-separator',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
                initialValue: '',
                ignoreBottomMargin: true,
                validate: [],
                conditionals: []
              },
              {
                name: 'ageAtDeathInYears',
                type: 'FORCED_NUMBER_MAX_LENGTH',
                maxLength: 2,
                label: formMessageDescriptors.ageAtDeath,
                inputFieldWidth: '60px',
                customisable: true,
                postfix: 'years',
                required: true,
                initialValue: '',
                conditionals: [
                  {
                    action: 'disable',
                    expression: 'values.ageUnderOneYear === true'
                  }
                ],
                validate: [],
                mapping: {
                  mutation: {
                    operation: 'ageAtEventTransformer',
                    parameters: ['birthDate', 'deceased.deathDate']
                  },
                  query: {
                    operation: 'ageAtEventQueryTransformer',
                    parameters: [
                      'deceased.birthDate',
                      'deceased.deceased.deathDate',
                      'ageAtDeathInYears'
                    ]
                  }
                }
              },
              {
                name: 'ageUnderOneYear',
                type: 'CHECKBOX',
                label: formMessageDescriptors.ageUnderOneYear,
                required: false,
                customisable: true,
                checkedValue: true,
                uncheckedValue: false,
                hideHeader: true,
                hideInPreview: true,
                initialValue: false,
                validate: [],
                mapping: {
                  query: {
                    operation: 'ageUnderOneYearQueryTransformer',
                    parameters: [
                      'birthDate',
                      'deceased.deathDate',
                      'ageUnderOneYear'
                    ]
                  },
                  mutation: {
                    operation: 'ignoreFieldTransformer'
                  }
                }
              },
              {
                name: 'ageAtDeathInMonths',
                type: 'DATE',
                label: formMessageDescriptors.ageAtDeathInMonths,
                required: true,
                hideYear: true,
                initialValue: '',
                previewGroup: 'deceasedAge',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.ageUnderOneYear !== true'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'ageInMonthsBeforeEventTransformer',
                    parameters: ['birthDate', 'deceased.deathDate']
                  },
                  query: {
                    operation: 'ageInMonthsQueryTransformer',
                    parameters: [
                      'birthDate',
                      'deceased.deathDate',
                      'ageAtDeathInMonths'
                    ]
                  }
                }
              },
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.nationality,
                required: true,
                initialValue:
                  typeof window !== 'undefined'
                    ? (window as any).config.COUNTRY.toUpperCase()
                    : 'FAR',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: {
                  resource: 'countries'
                },
                mapping: {
                  template: {
                    fieldName: 'deceasedNationality',
                    operation: 'selectTransformer'
                  },
                  mutation: {
                    operation: 'fieldToArrayTransformer'
                  },
                  query: {
                    operation: 'arrayToFieldTransformer'
                  }
                }
              },
              {
                name: 'stateOfOrigin',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.stateOfOrigin,
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: STATE_OF_ORIGINS,
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.nationality !== "NGA"'
                  }
                ]
              },
              {
                name: 'ethnicOrigin',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.ethnicOrigin,
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: ETHNIC_ORIGINS,
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.nationality !== "NGA"'
                  }
                ]
              },
              {
                name: 'deceased-marital-status-separator',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
                initialValue: '',
                ignoreBottomMargin: true,
                validate: [],
                conditionals: []
              },
              {
                name: 'maritalStatus',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.maritalStatus,
                required: true,
                customisable: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                mapping: {
                  template: {
                    fieldName: 'deceasedMaritalStatus',
                    operation: 'selectTransformer'
                  }
                },
                options: [
                  {
                    value: 'SINGLE',
                    label: {
                      defaultMessage: 'Unmarried',
                      description: 'Option for form field: Marital status',
                      id: 'form.field.label.maritalStatusSingle'
                    }
                  },
                  {
                    value: 'MARRIED',
                    label: {
                      defaultMessage: 'Married',
                      description: 'Option for form field: Marital status',
                      id: 'form.field.label.maritalStatusMarried'
                    }
                  },
                  {
                    value: 'WIDOWED',
                    label: {
                      defaultMessage: 'Widowed',
                      description: 'Option for form field: Marital status',
                      id: 'form.field.label.maritalStatusWidowed'
                    }
                  },
                  {
                    value: 'DIVORCED',
                    label: {
                      defaultMessage: 'Divorced',
                      description: 'Option for form field: Marital status',
                      id: 'form.field.label.maritalStatusDivorced'
                    }
                  },
                  {
                    value: 'SEPARATED',
                    label: {
                      id: 'form.field.label.maritalStatusSeparated',
                      defaultMessage: 'Separated',
                      description: 'Option for form field: Marital status'
                    }
                  },
                  {
                    value: 'NOT_STATED',
                    label: {
                      defaultMessage: 'Not stated',
                      description: 'Option for form field: Marital status',
                      id: 'form.field.label.maritalStatusNotStated'
                    }
                  }
                ]
              },
              {
                name: 'literacy',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'literacy',
                  description: 'Label for form field: Mother literacy',
                  id: 'form.field.label.motherLiteracy'
                },
                required: true,
                customisable: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: [
                  {
                    value: 'LITERATE',
                    label: {
                      defaultMessage: 'Literate',
                      description: 'Label for literacy option Literate',
                      id: 'form.field.label.literacy.literate'
                    }
                  },
                  {
                    value: 'ILLITERATE',
                    label: {
                      defaultMessage: 'Illiterate',
                      description: 'Label for literacy option Illiterate',
                      id: 'form.field.label.literacy.illiterate'
                    }
                  }
                ]
              },
              {
                name: 'educationalAttainment',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'level of education',
                  description: 'Label for form field: Mother education',
                  id: 'form.field.label.motherEducationAttainment'
                },
                required: true,
                customisable: true,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.literacy === "ILLITERATE"'
                  }
                ],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: [
                  {
                    value: 'KORANIC',
                    label: {
                      defaultMessage: 'Koranic',
                      description: 'Label for education option Koranic',
                      id: 'form.field.label.educationAttainment.koranic'
                    }
                  },
                  {
                    value: 'PRIMARY',
                    label: {
                      defaultMessage: 'Primary',
                      description: 'Label for education option Primary',
                      id: 'form.field.label.educationAttainment.primary'
                    }
                  },
                  {
                    value: 'MODERN',
                    label: {
                      defaultMessage: 'Modern',
                      description: 'Label for education option Modern',
                      id: 'form.field.label.educationAttainment.modern'
                    }
                  },
                  {
                    value: 'SECONDARY',
                    label: {
                      defaultMessage: 'Secondary',
                      description: 'Label for education option Secondary',
                      id: 'form.field.label.educationAttainment.secondary'
                    }
                  },
                  {
                    value: 'HIGHER_SCHOOL',
                    label: {
                      defaultMessage: 'Higher School',
                      description: 'Label for education option Higher School',
                      id: 'form.field.label.educationAttainment.higherSchool'
                    }
                  },
                  {
                    value: 'POLYTECNIC_NCE',
                    label: {
                      defaultMessage: 'Polytecnic/NCE',
                      description: 'Label for education option Polytecnic/NCE',
                      id: 'form.field.label.educationAttainment.polytecnicNce'
                    }
                  },
                  {
                    value: 'UNIVERSITY',
                    label: {
                      defaultMessage: 'University',
                      description: 'Label for education option University',
                      id: 'form.field.label.educationAttainment.university'
                    }
                  },
                  {
                    value: 'NO_EDUCATION',
                    label: {
                      defaultMessage: 'No formal education',
                      description:
                        'Label for education option No formal education',
                      id: 'form.field.label.educationAttainmentNoEducation'
                    }
                  }
                ]
              },
              {
                name: 'event-details-separator',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
                initialValue: '',
                ignoreBottomMargin: true,
                validate: [],
                conditionals: []
              },
              /*
               * TODO: Create a separate certifiedByDoctor field
               * currently only the label is changed
               */
              {
                name: 'causeOfDeathEstablished',
                type: 'CHECKBOX',
                label: formMessageDescriptors.causeOfDeathEstablished,
                required: true,
                customisable: true,
                checkedValue: 'true',
                uncheckedValue: 'false',
                hideHeader: true,
                initialValue: 'false',
                validate: [],
                mapping: {
                  mutation: {
                    operation: 'sectionFieldToBundleFieldTransformer',
                    parameters: ['causeOfDeathEstablished']
                  },
                  query: {
                    operation: 'bundleFieldToSectionFieldTransformer',
                    parameters: ['causeOfDeathEstablished']
                  }
                }
              },
              {
                name: 'causeOfDeath',
                type: 'TEXT',
                label: formMessageDescriptors.causeOfDeath,
                required: true,
                customisable: true,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.causeOfDeathEstablished!=="true"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'sectionFieldToBundleFieldTransformer',
                    parameters: ['causeOfDeath']
                  },
                  query: {
                    operation: 'bundleFieldToSectionFieldTransformer',
                    parameters: ['causeOfDeath']
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'deceasedNameInEnglish',
                label: formMessageDescriptors.nameInEnglishPreviewGroup,
                fieldToRedirect: 'familyNameEng',
                delimiter: ' '
              },
              {
                id: 'deceasedAge',
                label: formMessageDescriptors.ageAtDeath
              }
            ]
          }
        ],
        mapping: {
          template: [
            {
              fieldName: 'registrationNumber',
              operation: 'registrationNumberTransformer'
            },
            {
              fieldName: 'registrationDate',
              operation: 'registrationDateTransformer'
            },
            {
              fieldName: 'certificateDate',
              operation: 'certificateDateTransformer',
              parameters: ['en', 'dd MMMM yyyy']
            },
            {
              fieldName: 'registrarName',
              operation: 'registrarNameUserTransformer'
            },
            {
              fieldName: 'role',
              operation: 'roleUserTransformer'
            },
            {
              fieldName: 'registrarSignature',
              operation: 'registrarSignatureUserTransformer'
            },
            {
              fieldName: 'qrCode',
              operation: 'QRCodeTransformerTransformer'
            },
            {
              fieldName: 'registrationCentre',
              operation: 'registrationLocationUserTransformer',
              parameters: [':office']
            },
            {
              fieldName: 'registrationLGA',
              operation: 'registrationLocationUserTransformer',
              parameters: [':district']
            },
            {
              fieldName: 'registrationState',
              operation: 'registrationLocationUserTransformer',
              parameters: [':state']
            },
            {
              fieldName: 'placeOfDeathLocality',
              operation: 'placeOfDeathLocalityTransformer'
            },
            {
              fieldName: 'placeOfDeathLGA',
              operation: 'placeOfDeathLGATransformer'
            },
            {
              fieldName: 'placeOfDeathState',
              operation: 'placeOfDeathStateTransformer'
            }
          ]
        }
      },
      {
        id: DeathSection.Informant,
        viewType: 'form',
        name: formMessageDescriptors.informantName,
        title: formMessageDescriptors.informantTitle,
        hasDocumentSection: true,
        groups: [
          {
            id: 'informant-view-group',
            fields: [
              {
                name: 'informantType',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.informantsRelationWithDeceased,
                required: true,
                hideInPreview: false,
                initialValue: '',
                validate: [],
                options: [
                  {
                    value: 'MOTHER',
                    label: informantMessageDescriptors.mother
                  },
                  {
                    value: 'FATHER',
                    label: informantMessageDescriptors.father
                  },
                  {
                    value: 'PATERNAL_GRANDFATHER',
                    label: informantMessageDescriptors.paternalGrandfather
                  },
                  {
                    value: 'PATERNAL_GRANDMOTHER',
                    label: informantMessageDescriptors.paternalGrandmother
                  },
                  {
                    value: 'MATERNAL_GRANDFATHER',
                    label: informantMessageDescriptors.maternalGrandfather
                  },
                  {
                    value: 'MATERNAL_GRANDMOTHER',
                    label: informantMessageDescriptors.maternalGrandmother
                  },
                  {
                    value: 'BROTHER',
                    label: informantMessageDescriptors.brother
                  },
                  {
                    value: 'SISTER',
                    label: informantMessageDescriptors.sister
                  },
                  {
                    value: 'MOTHERS_BROTHER',
                    label: informantMessageDescriptors.mothersBrother
                  },
                  {
                    value: 'MOTHERS_SISTER',
                    label: informantMessageDescriptors.mothersSister
                  },
                  {
                    value: 'FATHERS_BROTHER',
                    label: informantMessageDescriptors.fathersBrother
                  },
                  {
                    value: 'FATHERS_SISTER',
                    label: informantMessageDescriptors.fathersSister
                  },
                  {
                    value: 'OTHER_FAMILY_MEMBER',
                    label: informantMessageDescriptors.otherFamilyMember
                  },
                  {
                    value: 'LEGAL_GUARDIAN',
                    label: informantMessageDescriptors.legalGuardian
                  },
                  {
                    value: 'OTHER',
                    label: formMessageDescriptors.someoneElse
                  }
                ],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                mapping: {
                  mutation: {
                    operation: 'changeHirerchyMutationTransformer',
                    parameters: ['registration.informantType']
                  },
                  query: {
                    operation: 'changeHirerchyQueryTransformer',
                    parameters: ['registration.informantType']
                  }
                }
              },
              {
                name: 'otherInformantType',
                type: 'TEXT',
                label:
                  formMessageDescriptors.informantsOtherRelationWithDeceased,
                placeholder: formMessageDescriptors.relationshipPlaceHolder,
                required: true,
                initialValue: '',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.informantType || values.informantType !== "OTHER"'
                  }
                ],
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'changeHirerchyMutationTransformer',
                    parameters: ['registration.otherInformantType']
                  },
                  query: {
                    operation: 'changeHirerchyQueryTransformer',
                    parameters: ['registration.otherInformantType']
                  }
                }
              },
              {
                name: 'familyNameEng',
                previewGroup: 'informantNameInEnglish',
                type: 'TEXT',
                label: formMessageDescriptors.childFamilyName,
                maxLength: 32,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToNameTransformer',
                        parameters: ['en', 'familyName']
                      },
                      'name'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'nameToFieldTransformer',
                        parameters: ['en', 'familyName']
                      }
                    ]
                  }
                }
              },
              {
                name: 'firstNamesEng',
                previewGroup: 'informantNameInEnglish',
                type: 'TEXT',
                label: formMessageDescriptors.childFirstNames,
                maxLength: 32,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToNameTransformer',
                        parameters: ['en', 'firstNames']
                      },
                      'name'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'nameToFieldTransformer',
                        parameters: ['en', 'firstNames']
                      }
                    ]
                  }
                }
              },
              {
                name: 'middleNamesEng',
                previewGroup: 'informantNameInEnglish',
                type: 'TEXT',
                label: formMessageDescriptors.middleNames,
                maxLength: 32,
                required: false,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToNameTransformer',
                        parameters: ['en', 'middleNames']
                      },
                      'name'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'nameToFieldTransformer',
                        parameters: ['en', 'middleNames']
                      }
                    ]
                  }
                }
              },
              // PRIMARY ADDRESS SUBSECTION
              // PRIMARY ADDRESS
              {
                name: 'seperator',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
                initialValue: '',
                ignoreBottomMargin: true,
                validate: [],
                conditionals: []
              },
              {
                name: 'registrationPhone',
                type: 'TEL',
                label: formMessageDescriptors.phoneNumber,
                required: false,
                initialValue: '',
                validate: [
                  {
                    operation: 'phoneNumberFormat'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'changeHirerchyMutationTransformer',
                    parameters: [
                      'registration.contactPhoneNumber',
                      {
                        operation: 'msisdnTransformer',
                        parameters: ['registration.contactPhoneNumber']
                      }
                    ]
                  },
                  query: {
                    operation: 'changeHirerchyQueryTransformer',
                    parameters: [
                      'registration.contactPhoneNumber',
                      {
                        operation: 'localPhoneTransformer',
                        parameters: ['registration.contactPhoneNumber']
                      }
                    ]
                  }
                }
              },
              {
                name: 'informantID',
                type: 'TEXT',
                label: formMessageDescriptors.iDTypeNationalID,
                required: false,
                customisable: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'validIDNumber',
                    parameters: ['NATIONAL_ID']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['deceased.iD']
                  }
                ],
                conditionals: [],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToIdentityTransformer',
                        parameters: ['id', 'NATIONAL_ID']
                      }
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'identityToFieldTransformer',
                        parameters: ['id', 'NATIONAL_ID']
                      }
                    ]
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'informantNameInEnglish',
                label: {
                  defaultMessage: "Informant's English name",
                  description: "Label for informant's name in english",
                  id: 'form.preview.group.label.informant.english.name'
                },
                fieldToRedirect: 'informantFamilyNameEng',
                delimiter: ' '
              }
            ]
          }
        ],
        mapping: {
          mutation: {
            operation: 'setInformantRegistrationComposedTransformer',
            parameters: ['death']
          },
          query: {
            operation: 'getInformantRegistrationComposedTransformer',
            parameters: ['death']
          }
        }
      },
      {
        id: DeathSection.Registration,
        viewType: 'form',
        name: formMessageDescriptors.registrationName,
        title: formMessageDescriptors.registrationTitle,
        groups: [
          {
            id: 'who-is-applying-view-group',
            title: informantMessageDescriptors.deathInformantTitle,
            conditionals: [{ action: 'hide', expression: 'true' }],
            preventContinueIfError: true,
            showExitButtonOnly: true,
            fields: [
              {
                name: 'informantType',
                type: 'RADIO_GROUP_WITH_NESTED_FIELDS',
                label: informantMessageDescriptors.deathInformantTitle,
                hideHeader: true,
                required: true,
                hideInPreview: false,
                initialValue: '',
                validate: [],
                size: RadioSize.LARGE,
                options: [
                  {
                    value: 'SPOUSE',
                    label: informantMessageDescriptors.spouse
                  },
                  {
                    value: 'SON',
                    label: informantMessageDescriptors.son
                  },
                  {
                    value: 'DAUGHTER',
                    label: informantMessageDescriptors.daughter
                  },
                  {
                    value: 'SON_IN_LAW',
                    label: informantMessageDescriptors.sonInLaw
                  },
                  {
                    value: 'DAUGHTER_IN_LAW',
                    label: informantMessageDescriptors.daughterInLaw
                  },
                  {
                    value: 'MOTHER',
                    label: informantMessageDescriptors.mother
                  },
                  {
                    value: 'FATHER',
                    label: informantMessageDescriptors.father
                  },
                  {
                    value: 'GRANDSON',
                    label: informantMessageDescriptors.grandson
                  },
                  {
                    value: 'GRANDDAUGHTER',
                    label: informantMessageDescriptors.granddaughter
                  },
                  {
                    value: 'OTHER',
                    label: formMessageDescriptors.someoneElse
                  }
                ],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                nestedFields: {
                  SPOUSE: [],
                  SON: [],
                  DAUGHTER: [],
                  SON_IN_LAW: [],
                  DAUGHTER_IN_LAW: [],
                  MOTHER: [],
                  FATHER: [],
                  GRANDSON: [],
                  GRANDDAUGHTER: [],
                  OTHER: [
                    {
                      name: 'otherInformantType',
                      type: 'TEXT',
                      label:
                        formMessageDescriptors.informantsRelationWithDeceased,
                      placeholder:
                        formMessageDescriptors.relationshipPlaceHolder,
                      required: true,
                      initialValue: '',
                      validate: [
                        {
                          operation: 'englishOnlyNameFormat'
                        }
                      ],
                      mapping: {
                        mutation: {
                          operation: 'changeHirerchyMutationTransformer',
                          parameters: ['registration.otherInformantType']
                        },
                        query: {
                          operation: 'changeHirerchyQueryTransformer',
                          parameters: ['registration.otherInformantType']
                        }
                      }
                    }
                  ]
                },
                mapping: {
                  mutation: {
                    operation: 'nestedRadioFieldToBundleFieldTransformer',
                    parameters: ['registration.informantType']
                  },
                  query: {
                    operation: 'bundleFieldToNestedRadioFieldTransformer',
                    parameters: ['registration.informantType']
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
      },
      {
        id: DeathSection.DeathDocuments,
        viewType: 'form',
        name: formMessageDescriptors.documentsName,
        title: formMessageDescriptors.documentsTitle,
        groups: [
          {
            id: 'documents-view-group',
            fields: [
              {
                name: 'paragraph',
                type: 'PARAGRAPH',
                label: formMessageDescriptors.deceasedParagraph,
                initialValue: '',
                validate: []
              },
              {
                name: 'uploadDocForDeceased',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: formMessageDescriptors.deceasedIDProof,
                initialValue: '',
                extraValue: deathDocumentForWhomFhirMapping.DECEASED_ID_PROOF,
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value: deathDocumentTypeFhirMapping.NATIONAL_ID,
                    label: formMessageDescriptors.docTypeNID
                  },
                  {
                    value: deathDocumentTypeFhirMapping.PASSPORT,
                    label: formMessageDescriptors.docTypePassport
                  },
                  {
                    value: deathDocumentTypeFhirMapping.BIRTH_CERTIFICATE,
                    label: formMessageDescriptors.docTypeBirthCert
                  },
                  {
                    value: deathDocumentTypeFhirMapping.OTHER,
                    label: formMessageDescriptors.docTypeOther
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'deathAttachmentToFieldTransformer'
                  }
                }
              },
              {
                name: 'uploadDocForInformant',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: formMessageDescriptors.proofOfInformantsID,
                initialValue: '',
                extraValue: deathDocumentForWhomFhirMapping.INFORMANT_ID_PROOF,
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value: deathDocumentTypeFhirMapping.NATIONAL_ID,
                    label: formMessageDescriptors.docTypeNID
                  },
                  {
                    value: deathDocumentTypeFhirMapping.PASSPORT,
                    label: formMessageDescriptors.docTypePassport
                  },
                  {
                    value: deathDocumentTypeFhirMapping.BIRTH_CERTIFICATE,
                    label: formMessageDescriptors.docTypeBirthCert
                  },
                  {
                    value: deathDocumentTypeFhirMapping.OTHER,
                    label: formMessageDescriptors.docTypeOther
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'deathAttachmentToFieldTransformer'
                  }
                }
              },
              {
                name: 'uploadDocForDeceasedDeath',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: formMessageDescriptors.deceasedDeathProof,
                initialValue: '',
                extraValue:
                  deathDocumentForWhomFhirMapping.DECEASED_DEATH_PROOF,
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value:
                      deathDocumentTypeFhirMapping.ATTESTED_LETTER_OF_DEATH,
                    label: formMessageDescriptors.docTypeLetterOfDeath
                  },
                  {
                    value:
                      deathDocumentTypeFhirMapping.POLICE_CERTIFICATE_OF_DEATH,
                    label: formMessageDescriptors.docTypePoliceCertificate
                  },
                  {
                    value:
                      deathDocumentTypeFhirMapping.HOSPITAL_CERTIFICATE_OF_DEATH,
                    label:
                      formMessageDescriptors.docTypeHospitalDeathCertificate
                  },
                  {
                    value: deathDocumentTypeFhirMapping.CORONERS_REPORT,
                    label: formMessageDescriptors.docTypeCoronersReport
                  },
                  {
                    value: deathDocumentTypeFhirMapping.BURIAL_RECEIPT,
                    label: formMessageDescriptors.docTypeCopyOfBurialReceipt
                  },
                  {
                    value: deathDocumentTypeFhirMapping.OTHER,
                    label: formMessageDescriptors.docTypeOther
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'deathAttachmentToFieldTransformer'
                  }
                }
              },
              {
                name: 'uploadDocForCauseOfDeath',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: formMessageDescriptors.causeOfDeathProof,
                initialValue: '',
                extraValue:
                  deathDocumentForWhomFhirMapping.DECEASED_DEATH_CAUSE_PROOF,
                hideAsterisk: true,
                validate: [],
                conditionals: [],
                options: [
                  {
                    value:
                      deathDocumentTypeFhirMapping.MEDICALLY_CERTIFIED_CAUSE_OF_DEATH,
                    label: formMessageDescriptors.medicallyCertified
                  },
                  {
                    value: deathDocumentTypeFhirMapping.VERBAL_AUTOPSY_REPORT,
                    label: formMessageDescriptors.verbalAutopsyReport
                  },
                  {
                    value: deathDocumentTypeFhirMapping.OTHER,
                    label: formMessageDescriptors.docTypeOther
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'deathAttachmentToFieldTransformer'
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  }
}

export const PlaceholderPreviewGroups = [
  'placeOfBirth',
  'placeOfDeath',
  'secondaryAddress',
  'primaryAddress'
]
