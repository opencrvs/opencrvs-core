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
  DeathSection,
  TEXTAREA
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

// THIS FILE CONTAINS THE DEFAULT, FACTORY RESET FORM CONFIGURATIONS

interface IDefaultRegisterForms {
  birth: ISerializedForm
  death: ISerializedForm
}

export const registerForms: IDefaultRegisterForms = {
  birth: {
    sections: [
      {
        id: BirthSection.Child,
        viewType: 'form',
        name: formMessageDescriptors.childTab,
        title: formMessageDescriptors.childTitle,
        hasDocumentSection: true,
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
                    value: 'HEALTH_FACILITY',
                    label: formMessageDescriptors.healthInstitution
                  },
                  {
                    value: 'PRIVATE_HOME',
                    label: formMessageDescriptors.privateHome
                  },
                  {
                    value: 'TRADITIONAL_DOCTORS',
                    label: formMessageDescriptors.placeOfBirthTraditionalDoctors
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
                    operation: 'ageAtBirthOfChildTransformer',
                    parameters: ['birthDate', 'child.childBirthDate']
                  },
                  query: {
                    operation: 'ageAtBirthOfChildQueryTransformer',
                    parameters: ['birthDate']
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
                options: [
                  { value: 'Abia', label: formMessageDescriptors.abia },
                  { value: 'Adamawa', label: formMessageDescriptors.adamawa },
                  { value: 'Akwa Ibom', label: formMessageDescriptors.akwa },
                  { value: 'Anambra', label: formMessageDescriptors.anambra },
                  { value: 'Bauchi', label: formMessageDescriptors.bauchi },
                  { value: 'Bayelsa', label: formMessageDescriptors.bayelsa },
                  { value: 'Benue', label: formMessageDescriptors.benue },
                  { value: 'Borno', label: formMessageDescriptors.borno },
                  { value: 'Cross River', label: formMessageDescriptors.cross },
                  { value: 'Delta', label: formMessageDescriptors.delta },
                  { value: 'Ebonyi', label: formMessageDescriptors.ebonyi },
                  { value: 'Edo', label: formMessageDescriptors.edo },
                  { value: 'Ekiti', label: formMessageDescriptors.ekiti },
                  { value: 'Enugu', label: formMessageDescriptors.enugu },
                  {
                    value: 'Federal Capital Territory',
                    label: formMessageDescriptors.federal
                  },
                  { value: 'Gombe', label: formMessageDescriptors.gombe },
                  { value: 'Imo', label: formMessageDescriptors.imo },
                  { value: 'Jigawa', label: formMessageDescriptors.jigawa },
                  { value: 'Kaduna', label: formMessageDescriptors.kaduna },
                  { value: 'Kano', label: formMessageDescriptors.kano },
                  { value: 'Katsina', label: formMessageDescriptors.katsina },
                  { value: 'Kebbi', label: formMessageDescriptors.kebbi },
                  { value: 'Kogi', label: formMessageDescriptors.kogi },
                  { value: 'Kwara', label: formMessageDescriptors.kwara },
                  { value: 'Lagos', label: formMessageDescriptors.lagos },
                  { value: 'Nasarawa', label: formMessageDescriptors.nasarawa },
                  { value: 'Niger', label: formMessageDescriptors.niger },
                  { value: 'Ogun', label: formMessageDescriptors.ogun },
                  { value: 'Ondo', label: formMessageDescriptors.ondo },
                  { value: 'Osun', label: formMessageDescriptors.osun },
                  { value: 'Oyo', label: formMessageDescriptors.oyo },
                  { value: 'Plateau', label: formMessageDescriptors.plateau },
                  { value: 'Rivers', label: formMessageDescriptors.rivers },
                  { value: 'Sokoto', label: formMessageDescriptors.sokoto },
                  { value: 'Taraba', label: formMessageDescriptors.taraba },
                  { value: 'Yobe', label: formMessageDescriptors.yobe },
                  { value: 'Zamfara', label: formMessageDescriptors.zamfara }
                ],
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
                options: [
                  { value: 'ABUA', label: formMessageDescriptors.abua },
                  {
                    value: 'ADRA_ADARAWA',
                    label: formMessageDescriptors.adraAdarawa
                  },
                  { value: 'ADUN', label: formMessageDescriptors.adun },
                  { value: 'AFCABEYA', label: formMessageDescriptors.afcabeya },
                  { value: 'AFEMAI', label: formMessageDescriptors.afemai },
                  { value: 'AFIZIRE', label: formMessageDescriptors.afizire },
                  { value: 'AGATU', label: formMessageDescriptors.agatu },
                  { value: 'AGBASSA', label: formMessageDescriptors.agbassa },
                  { value: 'AGBOR', label: formMessageDescriptors.agbor },
                  { value: 'AFO', label: formMessageDescriptors.afo },
                  { value: 'AJOWA', label: formMessageDescriptors.ajowa },
                  { value: 'AKPA', label: formMessageDescriptors.akpa },
                  { value: 'AKWAI', label: formMessageDescriptors.akwai },
                  { value: 'AKYE', label: formMessageDescriptors.akye },
                  { value: 'ALAGO', label: formMessageDescriptors.alago },
                  { value: 'AMAMONG', label: formMessageDescriptors.amamong },
                  { value: 'AMO', label: formMessageDescriptors.amo },
                  { value: 'ANA', label: formMessageDescriptors.ana },
                  { value: 'ANAGUTA', label: formMessageDescriptors.anaguta },
                  { value: 'ANKWAI', label: formMessageDescriptors.ankwai },
                  { value: 'ANNANG', label: formMessageDescriptors.annang },
                  { value: 'ARAB', label: formMessageDescriptors.arab },
                  { value: 'ARABO', label: formMessageDescriptors.arabo },
                  { value: 'ARBAR', label: formMessageDescriptors.arbar },
                  { value: 'ARUGU', label: formMessageDescriptors.arugu },
                  {
                    value: 'ATEN_ATAM',
                    label: formMessageDescriptors.atenAtam
                  },
                  { value: 'ATTAKAR', label: formMessageDescriptors.attakar },
                  { value: 'AUCHI', label: formMessageDescriptors.auchi },
                  {
                    value: 'AULLIMINDEN',
                    label: formMessageDescriptors.aulliminden
                  },
                  { value: 'AWO', label: formMessageDescriptors.awo },
                  {
                    value: 'AYETORO_GBEDE',
                    label: formMessageDescriptors.ayetoroGbede
                  },
                  { value: 'BADARARE', label: formMessageDescriptors.badarare },
                  {
                    value: 'BADE_BADAWE',
                    label: formMessageDescriptors.badeBadawe
                  },
                  { value: 'BAFEKE', label: formMessageDescriptors.bafeke },
                  {
                    value: 'BAGATHIYA',
                    label: formMessageDescriptors.bagathiya
                  },
                  { value: 'BAGGARA', label: formMessageDescriptors.baggara },
                  {
                    value: 'BAGUNGE_BADAGIRE',
                    label: formMessageDescriptors.bagungeBadagire
                  },
                  { value: 'BAHNAKE', label: formMessageDescriptors.bahnake },
                  {
                    value: 'BAJI_BIJI',
                    label: formMessageDescriptors.bajiBiji
                  },
                  { value: 'BAJJU', label: formMessageDescriptors.bajju },
                  { value: 'BAMBARO', label: formMessageDescriptors.bambaro },
                  { value: 'BAMBUKA', label: formMessageDescriptors.bambuka },
                  { value: 'BANDAWA', label: formMessageDescriptors.bandawa },
                  { value: 'BANGUJI', label: formMessageDescriptors.banguji },
                  {
                    value: 'BANKALAWA',
                    label: formMessageDescriptors.bankalawa
                  },
                  { value: 'BCHAMA', label: formMessageDescriptors.bchama },
                  { value: 'BARABACI', label: formMessageDescriptors.barabaci },
                  { value: 'BARAWA', label: formMessageDescriptors.barawa },
                  { value: 'BARGAWA', label: formMessageDescriptors.bargawa },
                  { value: 'BASSA', label: formMessageDescriptors.bassa },
                  { value: 'BEKWORAS', label: formMessageDescriptors.bekworas },
                  { value: 'BEROM', label: formMessageDescriptors.berom },
                  { value: 'BINI_EDO', label: formMessageDescriptors.biniEdo },
                  { value: 'BOGOM', label: formMessageDescriptors.bogom },
                  {
                    value: 'BOIYAWA_BOZAYA',
                    label: formMessageDescriptors.boiyawaBozaya
                  },
                  {
                    value: 'BOLAWA_BOLEWA',
                    label: formMessageDescriptors.bolawaBolewa
                  },
                  { value: 'BUDUMA', label: formMessageDescriptors.buduma },
                  { value: 'BUKO', label: formMessageDescriptors.buko },
                  {
                    value: 'BURA_BABUR',
                    label: formMessageDescriptors.buraBabur
                  },
                  { value: 'BUZU', label: formMessageDescriptors.buzu },
                  { value: 'BYAZHI', label: formMessageDescriptors.byazhi },
                  { value: 'CALABAR', label: formMessageDescriptors.calabar },
                  { value: 'CHALA', label: formMessageDescriptors.chala },
                  { value: 'CHAMBA', label: formMessageDescriptors.chamba },
                  { value: 'CHIBA', label: formMessageDescriptors.chiba },
                  { value: 'CHIBOK_G', label: formMessageDescriptors.chibokG },
                  { value: 'CHIP', label: formMessageDescriptors.chip },
                  { value: 'DADIYA', label: formMessageDescriptors.dadiya },
                  {
                    value: 'BADAKARE_DAKARKARI',
                    label: formMessageDescriptors.badakareDakarkari
                  },
                  {
                    value: 'DAKKA_DOKA',
                    label: formMessageDescriptors.dakkaDoka
                  },
                  { value: 'DANGULA', label: formMessageDescriptors.dangula },
                  {
                    value: 'DAURAWA_DAGARAWA',
                    label: formMessageDescriptors.daurawaDagarawa
                  },
                  { value: 'DEFAKA', label: formMessageDescriptors.defaka },
                  { value: 'DEGIMA', label: formMessageDescriptors.degima },
                  {
                    value: 'DELTA_IBO',
                    label: formMessageDescriptors.deltaIbo
                  },
                  { value: 'DIBO', label: formMessageDescriptors.dibo },
                  { value: 'DIGUZA', label: formMessageDescriptors.diguza },
                  { value: 'DJERMA', label: formMessageDescriptors.djerma },
                  { value: 'DMOKO', label: formMessageDescriptors.dmoko },
                  { value: 'DOLCHI', label: formMessageDescriptors.dolchi },
                  {
                    value: 'EBIRA_IGBIRA',
                    label: formMessageDescriptors.ebiraIgbira
                  },
                  { value: 'EBU', label: formMessageDescriptors.ebu },
                  { value: 'EFIK', label: formMessageDescriptors.efik },
                  { value: 'EGBA', label: formMessageDescriptors.egba },
                  { value: 'EGBADO', label: formMessageDescriptors.egbado },
                  { value: 'EGGON', label: formMessageDescriptors.eggon },
                  { value: 'EGUN', label: formMessageDescriptors.egun },
                  { value: 'EKET', label: formMessageDescriptors.eket },
                  { value: 'EKOI', label: formMessageDescriptors.ekoi },
                  {
                    value: 'EKPEYE_AFISA_EPIE',
                    label: formMessageDescriptors.ekpeyeAfisaEpie
                  },
                  { value: 'EKULU', label: formMessageDescriptors.ekulu },
                  { value: 'ELEME', label: formMessageDescriptors.eleme },
                  { value: 'EMU', label: formMessageDescriptors.emu },
                  { value: 'ESAN', label: formMessageDescriptors.esan },
                  { value: 'ETINA', label: formMessageDescriptors.etina },
                  { value: 'ETSAKO', label: formMessageDescriptors.etsako },
                  { value: 'ETULO', label: formMessageDescriptors.etulo },
                  { value: 'HADEJAWA', label: formMessageDescriptors.hadejawa },
                  { value: 'FANSO', label: formMessageDescriptors.fanso },
                  { value: 'FEMAWA', label: formMessageDescriptors.femawa },
                  { value: 'FER', label: formMessageDescriptors.fer },
                  {
                    value: 'FILIYA_FALI',
                    label: formMessageDescriptors.filiyaFali
                  },
                  { value: 'FON', label: formMessageDescriptors.fon },
                  { value: 'FORON', label: formMessageDescriptors.foron },
                  { value: 'FRENCH', label: formMessageDescriptors.french },
                  { value: 'FULANI', label: formMessageDescriptors.fulani },
                  { value: 'GAMAKU', label: formMessageDescriptors.gamaku },
                  { value: 'GAMARU', label: formMessageDescriptors.gamaru },
                  { value: 'GAMUNI', label: formMessageDescriptors.gamuni },
                  {
                    value: 'GANA_GANA',
                    label: formMessageDescriptors.ganaGana
                  },
                  { value: 'GANAWURI', label: formMessageDescriptors.ganawuri },
                  {
                    value: 'GBAJU_GBAGI',
                    label: formMessageDescriptors.gbajuGbagi
                  },
                  {
                    value: 'GEDE_GUDE_GAI',
                    label: formMessageDescriptors.gedeGudeGai
                  },
                  { value: 'GERAWA', label: formMessageDescriptors.gerawa },
                  { value: 'GIZMAWA', label: formMessageDescriptors.gizmawa },
                  { value: 'GLAUDA', label: formMessageDescriptors.glauda },
                  { value: 'GMENCHI', label: formMessageDescriptors.gmenchi },
                  {
                    value: 'GOMO_GAMOYAYA',
                    label: formMessageDescriptors.gomoGamoyaya
                  },
                  {
                    value: 'GOBIRI_GOBIRAWA_BOGOBIRI',
                    label: formMessageDescriptors.gobiriGobirawaBogobiri
                  },
                  {
                    value: 'GUJJURAWA',
                    label: formMessageDescriptors.gujjurawa
                  },
                  { value: 'GUEMAI', label: formMessageDescriptors.guemai },
                  {
                    value: 'GUMBARAWA',
                    label: formMessageDescriptors.gumbarawa
                  },
                  {
                    value: 'GUNGANCHI',
                    label: formMessageDescriptors.gunganchi
                  },
                  { value: 'GWANDARA', label: formMessageDescriptors.gwandara },
                  { value: 'GWANTU', label: formMessageDescriptors.gwantu },
                  { value: 'HANKWE', label: formMessageDescriptors.hankwe },
                  { value: 'HAUSA', label: formMessageDescriptors.hausa },
                  { value: 'HIGGI', label: formMessageDescriptors.higgi },
                  { value: 'IBARIBA', label: formMessageDescriptors.ibariba },
                  { value: 'IBIBIO', label: formMessageDescriptors.ibibio },
                  { value: 'ICHEN', label: formMessageDescriptors.ichen },
                  { value: 'IDANRE', label: formMessageDescriptors.idanre },
                  { value: 'IDOMA', label: formMessageDescriptors.idoma },
                  { value: 'IGALA', label: formMessageDescriptors.igala },
                  { value: 'IGBO_IBO', label: formMessageDescriptors.igboIbo },
                  { value: 'IGEDE', label: formMessageDescriptors.igede },
                  {
                    value: 'IJAW_IZON',
                    label: formMessageDescriptors.ijawIzon
                  },
                  { value: 'IJEDE', label: formMessageDescriptors.ijede },
                  { value: 'IJEME', label: formMessageDescriptors.ijeme },
                  { value: 'IKA', label: formMessageDescriptors.ika },
                  { value: 'IKAJO', label: formMessageDescriptors.ikajo },
                  { value: 'IKARA', label: formMessageDescriptors.ikara },
                  { value: 'IKPESHI', label: formMessageDescriptors.ikpeshi },
                  { value: 'IKPIDE', label: formMessageDescriptors.ikpide },
                  { value: 'IKULU', label: formMessageDescriptors.ikulu },
                  { value: 'IKWERE', label: formMessageDescriptors.ikwere },
                  { value: 'ILAJE', label: formMessageDescriptors.ilaje },
                  { value: 'IRIGWE', label: formMessageDescriptors.irigwe },
                  { value: 'ISHAN', label: formMessageDescriptors.ishan },
                  { value: 'ISOKO', label: formMessageDescriptors.isoko },
                  { value: 'ITSEKIRI', label: formMessageDescriptors.itsekiri },
                  { value: 'JABA', label: formMessageDescriptors.jaba },
                  { value: 'JAJIRI', label: formMessageDescriptors.jajiri },
                  { value: 'JAKATOE', label: formMessageDescriptors.jakatoe },
                  { value: 'JAKU', label: formMessageDescriptors.jaku },
                  { value: 'JARA', label: formMessageDescriptors.jara },
                  { value: 'JARAWA', label: formMessageDescriptors.jarawa },
                  { value: 'JIBU', label: formMessageDescriptors.jibu },
                  { value: 'JONJO', label: formMessageDescriptors.jonjo },
                  { value: 'JUKUN', label: formMessageDescriptors.jukun },
                  { value: 'KABAWA', label: formMessageDescriptors.kabawa },
                  { value: 'KADARA', label: formMessageDescriptors.kadara },
                  { value: 'KAGOMA', label: formMessageDescriptors.kagoma },
                  { value: 'KAGORO', label: formMessageDescriptors.kagoro },
                  { value: 'KAKA', label: formMessageDescriptors.kaka },
                  { value: 'KAKANDA', label: formMessageDescriptors.kakanda },
                  { value: 'KAMANTAM', label: formMessageDescriptors.kamantam },
                  { value: 'KAMBARI', label: formMessageDescriptors.kambari },
                  {
                    value: 'KAMBU_KANGU',
                    label: formMessageDescriptors.kambuKangu
                  },
                  { value: 'KAMUKU', label: formMessageDescriptors.kamuku },
                  { value: 'KANAKURU', label: formMessageDescriptors.kanakuru },
                  { value: 'KANAWA', label: formMessageDescriptors.kanawa },
                  { value: 'KANINKO', label: formMessageDescriptors.kaninko },
                  {
                    value: 'KANTANAWA',
                    label: formMessageDescriptors.kantanawa
                  },
                  {
                    value: 'KANURI_BERIBERI',
                    label: formMessageDescriptors.kanuriBeriberi
                  },
                  { value: 'MANGA', label: formMessageDescriptors.manga },
                  { value: 'KAREKARE', label: formMessageDescriptors.karekare },
                  {
                    value: 'KATAF_ATYAP',
                    label: formMessageDescriptors.katafAtyap
                  },
                  { value: 'KENTO', label: formMessageDescriptors.kento },
                  { value: 'KIBAKU', label: formMessageDescriptors.kibaku },
                  { value: 'KILBA', label: formMessageDescriptors.kilba },
                  { value: 'KIRDI', label: formMessageDescriptors.kirdi },
                  { value: 'KODKI', label: formMessageDescriptors.kodki },
                  { value: 'KOFYAR', label: formMessageDescriptors.kofyar },
                  { value: 'KONA', label: formMessageDescriptors.kona },
                  { value: 'KORO', label: formMessageDescriptors.koro },
                  { value: 'KOTO', label: formMessageDescriptors.koto },
                  { value: 'KUENUEM', label: formMessageDescriptors.kuenuem },
                  { value: 'KUMBO', label: formMessageDescriptors.kumbo },
                  {
                    value: 'KUNKAWA_KAWA',
                    label: formMessageDescriptors.kunkawaKawa
                  },
                  { value: 'KURAMA', label: formMessageDescriptors.kurama },
                  { value: 'KUTEB', label: formMessageDescriptors.kuteb },
                  { value: 'KUTURM', label: formMessageDescriptors.kuturm },
                  {
                    value: 'KWALE_UKWUANI',
                    label: formMessageDescriptors.kwaleUkwuani
                  },
                  { value: 'KWANZO', label: formMessageDescriptors.kwanzo },
                  { value: 'LAGELU', label: formMessageDescriptors.lagelu },
                  { value: 'LANTANG', label: formMessageDescriptors.lantang },
                  { value: 'LEMORO', label: formMessageDescriptors.lemoro },
                  { value: 'LOH', label: formMessageDescriptors.loh },
                  { value: 'LUNGUDA', label: formMessageDescriptors.lunguda },
                  {
                    value: 'MABA_MBADOWA',
                    label: formMessageDescriptors.mabaMbadowa
                  },
                  { value: 'MADA', label: formMessageDescriptors.mada },
                  {
                    value: 'MAFA_MAKA_MAGA',
                    label: formMessageDescriptors.mafaMakaMaga
                  },
                  { value: 'MAMBILA', label: formMessageDescriptors.mambila },
                  { value: 'MANDARA', label: formMessageDescriptors.mandara },
                  {
                    value: 'MANGUS_MANJU',
                    label: formMessageDescriptors.mangusManju
                  },
                  {
                    value: 'MARGHI_MANGI',
                    label: formMessageDescriptors.marghiMangi
                  },
                  { value: 'MBWA', label: formMessageDescriptors.mbwa },
                  { value: 'MINGO', label: formMessageDescriptors.mingo },
                  { value: 'MIRNANG', label: formMessageDescriptors.mirnang },
                  { value: 'MONTOR', label: formMessageDescriptors.montor },
                  {
                    value: 'MTCHIGA_MICHIKA',
                    label: formMessageDescriptors.mtchigaMichika
                  },
                  { value: 'MUMUYE', label: formMessageDescriptors.mumuye },
                  { value: 'MUNGA', label: formMessageDescriptors.munga },
                  { value: 'MUPUNG', label: formMessageDescriptors.mupung },
                  { value: 'MUSHERE', label: formMessageDescriptors.mushere },
                  { value: 'MWAGAVOL', label: formMessageDescriptors.mwagavol },
                  { value: 'NAIAWUM', label: formMessageDescriptors.naiawum },
                  { value: 'NAMOEN', label: formMessageDescriptors.namoen },
                  { value: 'NDOKWA', label: formMessageDescriptors.ndokwa },
                  { value: 'NDOLA', label: formMessageDescriptors.ndola },
                  { value: 'NGAMO', label: formMessageDescriptors.ngamo },
                  { value: 'UKALE', label: formMessageDescriptors.ukale },
                  { value: 'NGOSHE', label: formMessageDescriptors.ngoshe },
                  { value: 'NILI', label: formMessageDescriptors.nili },
                  { value: 'NINNMA', label: formMessageDescriptors.ninnma },
                  { value: 'NINZOM', label: formMessageDescriptors.ninzom },
                  { value: 'NKOROO', label: formMessageDescriptors.nkoroo },
                  { value: 'NNEBE', label: formMessageDescriptors.nnebe },
                  { value: 'NUMANA', label: formMessageDescriptors.numana },
                  { value: 'NUNGU', label: formMessageDescriptors.nungu },
                  { value: 'NUNKU', label: formMessageDescriptors.nunku },
                  { value: 'NUPE', label: formMessageDescriptors.nupe },
                  { value: 'OBUBUA', label: formMessageDescriptors.obubua },
                  { value: 'ODU', label: formMessageDescriptors.odu },
                  { value: 'OGOJA', label: formMessageDescriptors.ogoja },
                  { value: 'OGONI', label: formMessageDescriptors.ogoni },
                  { value: 'OGUGU', label: formMessageDescriptors.ogugu },
                  {
                    value: 'OKORI_OGORI',
                    label: formMessageDescriptors.okoriOgori
                  },
                  { value: 'OMELE', label: formMessageDescriptors.omele },
                  { value: 'ORA', label: formMessageDescriptors.ora },
                  { value: 'ORON', label: formMessageDescriptors.oron },
                  { value: 'OWAN', label: formMessageDescriptors.owan },
                  { value: 'OWO', label: formMessageDescriptors.owo },
                  { value: 'PA_AWA', label: formMessageDescriptors.paAwa },
                  { value: 'PABURI', label: formMessageDescriptors.paburi },
                  { value: 'PAIBUN', label: formMessageDescriptors.paibun },
                  { value: 'PANYA', label: formMessageDescriptors.panya },
                  { value: 'PASAMA', label: formMessageDescriptors.pasama },
                  { value: 'PERO', label: formMessageDescriptors.pero },
                  { value: 'PIYA', label: formMessageDescriptors.piya },
                  { value: 'PYEM', label: formMessageDescriptors.pyem },
                  { value: 'RUKUBA', label: formMessageDescriptors.rukuba },
                  { value: 'RULERE', label: formMessageDescriptors.rulere },
                  { value: 'RUNDAWA', label: formMessageDescriptors.rundawa },
                  {
                    value: 'SAYAWA_SIYAWA',
                    label: formMessageDescriptors.sayawaSiyawa
                  },
                  { value: 'SEKERE', label: formMessageDescriptors.sekere },
                  { value: 'SHARAWA', label: formMessageDescriptors.sharawa },
                  { value: 'SHOMO', label: formMessageDescriptors.shomo },
                  { value: 'SHUWA', label: formMessageDescriptors.shuwa },
                  { value: 'SOMUNKA', label: formMessageDescriptors.somunka },
                  {
                    value: 'SULLUBAWA',
                    label: formMessageDescriptors.sullubawa
                  },
                  { value: 'SURA', label: formMessageDescriptors.sura },
                  { value: 'TAIRA', label: formMessageDescriptors.taira },
                  { value: 'TANGALE', label: formMessageDescriptors.tangale },
                  { value: 'TAROK', label: formMessageDescriptors.tarok },
                  { value: 'TERA', label: formMessageDescriptors.tera },
                  { value: 'TESKWA', label: formMessageDescriptors.teskwa },
                  { value: 'TIGUNI', label: formMessageDescriptors.tiguni },
                  { value: 'TIV', label: formMessageDescriptors.tiv },
                  { value: 'TIYARI', label: formMessageDescriptors.tiyari },
                  { value: 'TULA', label: formMessageDescriptors.tula },
                  { value: 'UBAIJA', label: formMessageDescriptors.ubaija },
                  { value: 'UGBIA', label: formMessageDescriptors.ugbia },
                  {
                    value: 'UHIONIGBE',
                    label: formMessageDescriptors.uhionigbe
                  },
                  { value: 'UKWUANI', label: formMessageDescriptors.ukwuani },
                  { value: 'URHOBO', label: formMessageDescriptors.urhobo },
                  { value: 'UYO', label: formMessageDescriptors.uyo },
                  { value: 'UZAURUE', label: formMessageDescriptors.uzaurue },
                  { value: 'UZEBA', label: formMessageDescriptors.uzeba },
                  { value: 'WAJA', label: formMessageDescriptors.waja },
                  { value: 'WAKA', label: formMessageDescriptors.waka },
                  { value: 'WANU', label: formMessageDescriptors.wanu },
                  { value: 'WARI', label: formMessageDescriptors.wari },
                  { value: 'WARJAWA', label: formMessageDescriptors.warjawa },
                  { value: 'WODAABE', label: formMessageDescriptors.wodaabe },
                  { value: 'WURKUM', label: formMessageDescriptors.wurkum },
                  { value: 'YAKURR', label: formMessageDescriptors.yakurr },
                  { value: 'YANDANG', label: formMessageDescriptors.yandang },
                  { value: 'YENDRE', label: formMessageDescriptors.yendre },
                  { value: 'YONUBI', label: formMessageDescriptors.yonubi },
                  { value: 'YORUBA', label: formMessageDescriptors.yoruba },
                  {
                    value: 'ZABARMAWA',
                    label: formMessageDescriptors.zabarmawa
                  },
                  { value: 'KAJE', label: formMessageDescriptors.kaje },
                  { value: 'IGBANKO', label: formMessageDescriptors.igbanko },
                  {
                    value: 'OKORI_OGORI',
                    label: formMessageDescriptors.okoriOgori
                  },
                  { value: 'MIGILI', label: formMessageDescriptors.migili },
                  { value: 'GWARI', label: formMessageDescriptors.gwari },
                  { value: 'URU', label: formMessageDescriptors.uru },
                  { value: 'OKIRIKA', label: formMessageDescriptors.okirika },
                  { value: 'EGI', label: formMessageDescriptors.egi },
                  { value: 'OGBA', label: formMessageDescriptors.ogba },
                  { value: 'MOROA', label: formMessageDescriptors.moroa },
                  { value: 'MARWA', label: formMessageDescriptors.marwa },
                  { value: 'TOFF', label: formMessageDescriptors.toff },
                  { value: 'FULFULDE', label: formMessageDescriptors.fulfulde },
                  {
                    value: 'KABBA_OKUN',
                    label: formMessageDescriptors.kabbaOkun
                  },
                  { value: 'BAKABE', label: formMessageDescriptors.bakabe },
                  { value: 'BURMANCH', label: formMessageDescriptors.burmanch },
                  { value: 'KALABARI', label: formMessageDescriptors.kalabari },
                  { value: 'MISHIP', label: formMessageDescriptors.miship },
                  { value: 'KARIMJO', label: formMessageDescriptors.karimjo },
                  { value: 'KWA', label: formMessageDescriptors.kwa },
                  { value: 'ANGAS', label: formMessageDescriptors.angas },
                  { value: 'BOBARI', label: formMessageDescriptors.bobari },
                  { value: 'YARIMAWA', label: formMessageDescriptors.yarimawa },
                  { value: 'BAKENGA', label: formMessageDescriptors.bakenga },
                  { value: 'AGAZAWA', label: formMessageDescriptors.agazawa },
                  { value: 'GWOZA', label: formMessageDescriptors.gwoza },
                  { value: 'ZALIDVA', label: formMessageDescriptors.zalidva },
                  {
                    value: 'NYANGDANG',
                    label: formMessageDescriptors.nyangdang
                  },
                  { value: 'NGEZIM', label: formMessageDescriptors.ngezim },
                  { value: 'HANBAGDA', label: formMessageDescriptors.hanbagda },
                  { value: 'NJANYI', label: formMessageDescriptors.njanyi },
                  { value: 'DUMAK', label: formMessageDescriptors.dumak },
                  { value: 'KWALLA', label: formMessageDescriptors.kwalla },
                  {
                    value: 'YESKWA_AND_MUBULA',
                    label: formMessageDescriptors.yeskwaAndMubula
                  },
                  { value: 'BILE', label: formMessageDescriptors.bile },
                  { value: 'OFFA', label: formMessageDescriptors.offa },
                  { value: 'YUNGUR', label: formMessageDescriptors.yungur },
                  {
                    value: 'PURA_PURA',
                    label: formMessageDescriptors.puraPura
                  },
                  { value: 'RINDRE', label: formMessageDescriptors.rindre },
                  { value: 'DUKAWA', label: formMessageDescriptors.dukawa },
                  { value: 'NINGI', label: formMessageDescriptors.ningi },
                  { value: 'CHAM', label: formMessageDescriptors.cham },
                  { value: 'KAMO', label: formMessageDescriptors.kamo },
                  { value: 'LALA', label: formMessageDescriptors.lala },
                  { value: 'LARU', label: formMessageDescriptors.laru },
                  { value: 'LISA', label: formMessageDescriptors.lisa },
                  { value: 'GAANDA', label: formMessageDescriptors.gaanda },
                  { value: 'EZZA', label: formMessageDescriptors.ezza },
                  { value: 'KUBASAWA', label: formMessageDescriptors.kubasawa },
                  { value: 'GUSU', label: formMessageDescriptors.gusu },
                  { value: 'IKPOMA', label: formMessageDescriptors.ikpoma },
                  { value: 'BUH', label: formMessageDescriptors.buh },
                  { value: 'MUSHERE', label: formMessageDescriptors.mushere },
                  { value: 'CHAKEEM', label: formMessageDescriptors.chakeem },
                  { value: 'JIPAL', label: formMessageDescriptors.jipal },
                  { value: 'UGEB', label: formMessageDescriptors.ugeb },
                  { value: 'KOMA', label: formMessageDescriptors.koma },
                  {
                    value: 'VERRE_KILA',
                    label: formMessageDescriptors.verreKila
                  },
                  { value: 'ZURU', label: formMessageDescriptors.zuru },
                  { value: 'HONNA', label: formMessageDescriptors.honna },
                  { value: 'KAPSIKI', label: formMessageDescriptors.kapsiki },
                  { value: 'JERE', label: formMessageDescriptors.jere },
                  {
                    value: 'GIZI_YOBE',
                    label: formMessageDescriptors.giziYobe
                  },
                  { value: 'KAREKARE', label: formMessageDescriptors.karekare },
                  { value: 'KULERE', label: formMessageDescriptors.kulere },
                  { value: 'BETEER', label: formMessageDescriptors.beteer },
                  { value: 'BASHAMA', label: formMessageDescriptors.bashama },
                  { value: 'ANTOCHA', label: formMessageDescriptors.antocha },
                  {
                    value: 'BARUBA_BARUNTIN',
                    label: formMessageDescriptors.barubaBaruntin
                  },
                  { value: 'NEZOU', label: formMessageDescriptors.nezou },
                  { value: 'DIBBA', label: formMessageDescriptors.dibba },
                  { value: 'KANUM', label: formMessageDescriptors.kanum },
                  { value: 'GASAWA', label: formMessageDescriptors.gasawa },
                  { value: 'MURYAN', label: formMessageDescriptors.muryan },
                  { value: 'BAGERI', label: formMessageDescriptors.bageri },
                  { value: 'AHU', label: formMessageDescriptors.ahu },
                  { value: 'BASANGE', label: formMessageDescriptors.basange },
                  { value: 'NAKERE', label: formMessageDescriptors.nakere },
                  { value: 'BATUNU', label: formMessageDescriptors.batunu },
                  { value: 'SANGA', label: formMessageDescriptors.sanga },
                  { value: 'OHARI', label: formMessageDescriptors.ohari },
                  { value: 'NUMURO', label: formMessageDescriptors.numuro },
                  { value: 'TANGALE', label: formMessageDescriptors.tangale },
                  { value: 'GURUMA', label: formMessageDescriptors.guruma },
                  { value: 'OTUWO', label: formMessageDescriptors.otuwo },
                  { value: 'BATALA', label: formMessageDescriptors.batala },
                  { value: 'OGBO', label: formMessageDescriptors.ogbo },
                  { value: 'EGBEMA', label: formMessageDescriptors.egbema },
                  { value: 'DARA', label: formMessageDescriptors.dara },
                  { value: 'ANDONI', label: formMessageDescriptors.andoni },
                  { value: 'OBOLO', label: formMessageDescriptors.obolo },
                  { value: 'PEGAN', label: formMessageDescriptors.pegan },
                  { value: 'IYALA', label: formMessageDescriptors.iyala },
                  { value: 'JIBAWA', label: formMessageDescriptors.jibawa },
                  {
                    value: 'MUNGADUSO',
                    label: formMessageDescriptors.mungaduso
                  },
                  { value: 'OKOBO', label: formMessageDescriptors.okobo },
                  { value: 'OTHERS', label: formMessageDescriptors.others },
                  { value: 'DK', label: formMessageDescriptors.dk },
                  { value: 'MISSING', label: formMessageDescriptors.missing }
                ],
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
        groups: [
          {
            id: 'father-view-group',
            fields: [
              {
                name: 'reasonNotApplying',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.detailsExist'
                  }
                ],
                type: 'TEXT',
                label: formMessageDescriptors.reasonFNA,
                validate: [],
                initialValue: '',
                customisable: true,
                required: false
              },
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
                    operation: 'ageAtBirthOfChildTransformer',
                    parameters: ['birthDate', 'child.childBirthDate']
                  },
                  query: {
                    operation: 'ageAtBirthOfChildQueryTransformer',
                    parameters: ['birthDate']
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
                options: [
                  { value: 'Abia', label: formMessageDescriptors.abia },
                  { value: 'Adamawa', label: formMessageDescriptors.adamawa },
                  { value: 'Akwa', label: formMessageDescriptors.akwa },
                  { value: 'Anambra', label: formMessageDescriptors.anambra },
                  { value: 'Bauchi', label: formMessageDescriptors.bauchi },
                  { value: 'Bayelsa', label: formMessageDescriptors.bayelsa },
                  { value: 'Benue', label: formMessageDescriptors.benue },
                  { value: 'Borno', label: formMessageDescriptors.borno },
                  { value: 'Cross', label: formMessageDescriptors.cross },
                  { value: 'Delta', label: formMessageDescriptors.delta },
                  { value: 'Ebonyi', label: formMessageDescriptors.ebonyi },
                  { value: 'Edo', label: formMessageDescriptors.edo },
                  { value: 'Ekiti', label: formMessageDescriptors.ekiti },
                  { value: 'Enugu', label: formMessageDescriptors.enugu },
                  { value: 'Federal', label: formMessageDescriptors.federal },
                  { value: 'Gombe', label: formMessageDescriptors.gombe },
                  { value: 'Imo', label: formMessageDescriptors.imo },
                  { value: 'Jigawa', label: formMessageDescriptors.jigawa },
                  { value: 'Kaduna', label: formMessageDescriptors.kaduna },
                  { value: 'Kano', label: formMessageDescriptors.kano },
                  { value: 'Katsina', label: formMessageDescriptors.katsina },
                  { value: 'Kebbi', label: formMessageDescriptors.kebbi },
                  { value: 'Kogi', label: formMessageDescriptors.kogi },
                  { value: 'Kwara', label: formMessageDescriptors.kwara },
                  { value: 'Lagos', label: formMessageDescriptors.lagos },
                  { value: 'Nasarawa', label: formMessageDescriptors.nasarawa },
                  { value: 'Niger', label: formMessageDescriptors.niger },
                  { value: 'Ogun', label: formMessageDescriptors.ogun },
                  { value: 'Ondo', label: formMessageDescriptors.ondo },
                  { value: 'Osun', label: formMessageDescriptors.osun },
                  { value: 'Oyo', label: formMessageDescriptors.oyo },
                  { value: 'Plateau', label: formMessageDescriptors.plateau },
                  { value: 'Rivers', label: formMessageDescriptors.rivers },
                  { value: 'Sokoto', label: formMessageDescriptors.sokoto },
                  { value: 'Taraba', label: formMessageDescriptors.taraba },
                  { value: 'Yobe', label: formMessageDescriptors.yobe },
                  { value: 'Zamfara', label: formMessageDescriptors.zamfara }
                ],
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
                options: [
                  { value: 'ABUA', label: formMessageDescriptors.abua },
                  {
                    value: 'ADRA_ADARAWA',
                    label: formMessageDescriptors.adraAdarawa
                  },
                  { value: 'ADUN', label: formMessageDescriptors.adun },
                  { value: 'AFCABEYA', label: formMessageDescriptors.afcabeya },
                  { value: 'AFEMAI', label: formMessageDescriptors.afemai },
                  { value: 'AFIZIRE', label: formMessageDescriptors.afizire },
                  { value: 'AGATU', label: formMessageDescriptors.agatu },
                  { value: 'AGBASSA', label: formMessageDescriptors.agbassa },
                  { value: 'AGBOR', label: formMessageDescriptors.agbor },
                  { value: 'AFO', label: formMessageDescriptors.afo },
                  { value: 'AJOWA', label: formMessageDescriptors.ajowa },
                  { value: 'AKPA', label: formMessageDescriptors.akpa },
                  { value: 'AKWAI', label: formMessageDescriptors.akwai },
                  { value: 'AKYE', label: formMessageDescriptors.akye },
                  { value: 'ALAGO', label: formMessageDescriptors.alago },
                  { value: 'AMAMONG', label: formMessageDescriptors.amamong },
                  { value: 'AMO', label: formMessageDescriptors.amo },
                  { value: 'ANA', label: formMessageDescriptors.ana },
                  { value: 'ANAGUTA', label: formMessageDescriptors.anaguta },
                  { value: 'ANKWAI', label: formMessageDescriptors.ankwai },
                  { value: 'ANNANG', label: formMessageDescriptors.annang },
                  { value: 'ARAB', label: formMessageDescriptors.arab },
                  { value: 'ARABO', label: formMessageDescriptors.arabo },
                  { value: 'ARBAR', label: formMessageDescriptors.arbar },
                  { value: 'ARUGU', label: formMessageDescriptors.arugu },
                  {
                    value: 'ATEN_ATAM',
                    label: formMessageDescriptors.atenAtam
                  },
                  { value: 'ATTAKAR', label: formMessageDescriptors.attakar },
                  { value: 'AUCHI', label: formMessageDescriptors.auchi },
                  {
                    value: 'AULLIMINDEN',
                    label: formMessageDescriptors.aulliminden
                  },
                  { value: 'AWO', label: formMessageDescriptors.awo },
                  {
                    value: 'AYETORO_GBEDE',
                    label: formMessageDescriptors.ayetoroGbede
                  },
                  { value: 'BADARARE', label: formMessageDescriptors.badarare },
                  {
                    value: 'BADE_BADAWE',
                    label: formMessageDescriptors.badeBadawe
                  },
                  { value: 'BAFEKE', label: formMessageDescriptors.bafeke },
                  {
                    value: 'BAGATHIYA',
                    label: formMessageDescriptors.bagathiya
                  },
                  { value: 'BAGGARA', label: formMessageDescriptors.baggara },
                  {
                    value: 'BAGUNGE_BADAGIRE',
                    label: formMessageDescriptors.bagungeBadagire
                  },
                  { value: 'BAHNAKE', label: formMessageDescriptors.bahnake },
                  {
                    value: 'BAJI_BIJI',
                    label: formMessageDescriptors.bajiBiji
                  },
                  { value: 'BAJJU', label: formMessageDescriptors.bajju },
                  { value: 'BAMBARO', label: formMessageDescriptors.bambaro },
                  { value: 'BAMBUKA', label: formMessageDescriptors.bambuka },
                  { value: 'BANDAWA', label: formMessageDescriptors.bandawa },
                  { value: 'BANGUJI', label: formMessageDescriptors.banguji },
                  {
                    value: 'BANKALAWA',
                    label: formMessageDescriptors.bankalawa
                  },
                  { value: 'BCHAMA', label: formMessageDescriptors.bchama },
                  { value: 'BARABACI', label: formMessageDescriptors.barabaci },
                  { value: 'BARAWA', label: formMessageDescriptors.barawa },
                  { value: 'BARGAWA', label: formMessageDescriptors.bargawa },
                  { value: 'BASSA', label: formMessageDescriptors.bassa },
                  { value: 'BEKWORAS', label: formMessageDescriptors.bekworas },
                  { value: 'BEROM', label: formMessageDescriptors.berom },
                  { value: 'BINI_EDO', label: formMessageDescriptors.biniEdo },
                  { value: 'BOGOM', label: formMessageDescriptors.bogom },
                  {
                    value: 'BOIYAWA_BOZAYA',
                    label: formMessageDescriptors.boiyawaBozaya
                  },
                  {
                    value: 'BOLAWA_BOLEWA',
                    label: formMessageDescriptors.bolawaBolewa
                  },
                  { value: 'BUDUMA', label: formMessageDescriptors.buduma },
                  { value: 'BUKO', label: formMessageDescriptors.buko },
                  {
                    value: 'BURA_BABUR',
                    label: formMessageDescriptors.buraBabur
                  },
                  { value: 'BUZU', label: formMessageDescriptors.buzu },
                  { value: 'BYAZHI', label: formMessageDescriptors.byazhi },
                  { value: 'CALABAR', label: formMessageDescriptors.calabar },
                  { value: 'CHALA', label: formMessageDescriptors.chala },
                  { value: 'CHAMBA', label: formMessageDescriptors.chamba },
                  { value: 'CHIBA', label: formMessageDescriptors.chiba },
                  { value: 'CHIBOK_G', label: formMessageDescriptors.chibokG },
                  { value: 'CHIP', label: formMessageDescriptors.chip },
                  { value: 'DADIYA', label: formMessageDescriptors.dadiya },
                  {
                    value: 'BADAKARE_DAKARKARI',
                    label: formMessageDescriptors.badakareDakarkari
                  },
                  {
                    value: 'DAKKA_DOKA',
                    label: formMessageDescriptors.dakkaDoka
                  },
                  { value: 'DANGULA', label: formMessageDescriptors.dangula },
                  {
                    value: 'DAURAWA_DAGARAWA',
                    label: formMessageDescriptors.daurawaDagarawa
                  },
                  { value: 'DEFAKA', label: formMessageDescriptors.defaka },
                  { value: 'DEGIMA', label: formMessageDescriptors.degima },
                  {
                    value: 'DELTA_IBO',
                    label: formMessageDescriptors.deltaIbo
                  },
                  { value: 'DIBO', label: formMessageDescriptors.dibo },
                  { value: 'DIGUZA', label: formMessageDescriptors.diguza },
                  { value: 'DJERMA', label: formMessageDescriptors.djerma },
                  { value: 'DMOKO', label: formMessageDescriptors.dmoko },
                  { value: 'DOLCHI', label: formMessageDescriptors.dolchi },
                  {
                    value: 'EBIRA_IGBIRA',
                    label: formMessageDescriptors.ebiraIgbira
                  },
                  { value: 'EBU', label: formMessageDescriptors.ebu },
                  { value: 'EFIK', label: formMessageDescriptors.efik },
                  { value: 'EGBA', label: formMessageDescriptors.egba },
                  { value: 'EGBADO', label: formMessageDescriptors.egbado },
                  { value: 'EGGON', label: formMessageDescriptors.eggon },
                  { value: 'EGUN', label: formMessageDescriptors.egun },
                  { value: 'EKET', label: formMessageDescriptors.eket },
                  { value: 'EKOI', label: formMessageDescriptors.ekoi },
                  {
                    value: 'EKPEYE_AFISA_EPIE',
                    label: formMessageDescriptors.ekpeyeAfisaEpie
                  },
                  { value: 'EKULU', label: formMessageDescriptors.ekulu },
                  { value: 'ELEME', label: formMessageDescriptors.eleme },
                  { value: 'EMU', label: formMessageDescriptors.emu },
                  { value: 'ESAN', label: formMessageDescriptors.esan },
                  { value: 'ETINA', label: formMessageDescriptors.etina },
                  { value: 'ETSAKO', label: formMessageDescriptors.etsako },
                  { value: 'ETULO', label: formMessageDescriptors.etulo },
                  { value: 'HADEJAWA', label: formMessageDescriptors.hadejawa },
                  { value: 'FANSO', label: formMessageDescriptors.fanso },
                  { value: 'FEMAWA', label: formMessageDescriptors.femawa },
                  { value: 'FER', label: formMessageDescriptors.fer },
                  {
                    value: 'FILIYA_FALI',
                    label: formMessageDescriptors.filiyaFali
                  },
                  { value: 'FON', label: formMessageDescriptors.fon },
                  { value: 'FORON', label: formMessageDescriptors.foron },
                  { value: 'FRENCH', label: formMessageDescriptors.french },
                  { value: 'FULANI', label: formMessageDescriptors.fulani },
                  { value: 'GAMAKU', label: formMessageDescriptors.gamaku },
                  { value: 'GAMARU', label: formMessageDescriptors.gamaru },
                  { value: 'GAMUNI', label: formMessageDescriptors.gamuni },
                  {
                    value: 'GANA_GANA',
                    label: formMessageDescriptors.ganaGana
                  },
                  { value: 'GANAWURI', label: formMessageDescriptors.ganawuri },
                  {
                    value: 'GBAJU_GBAGI',
                    label: formMessageDescriptors.gbajuGbagi
                  },
                  {
                    value: 'GEDE_GUDE_GAI',
                    label: formMessageDescriptors.gedeGudeGai
                  },
                  { value: 'GERAWA', label: formMessageDescriptors.gerawa },
                  { value: 'GIZMAWA', label: formMessageDescriptors.gizmawa },
                  { value: 'GLAUDA', label: formMessageDescriptors.glauda },
                  { value: 'GMENCHI', label: formMessageDescriptors.gmenchi },
                  {
                    value: 'GOMO_GAMOYAYA',
                    label: formMessageDescriptors.gomoGamoyaya
                  },
                  {
                    value: 'GOBIRI_GOBIRAWA_BOGOBIRI',
                    label: formMessageDescriptors.gobiriGobirawaBogobiri
                  },
                  {
                    value: 'GUJJURAWA',
                    label: formMessageDescriptors.gujjurawa
                  },
                  { value: 'GUEMAI', label: formMessageDescriptors.guemai },
                  {
                    value: 'GUMBARAWA',
                    label: formMessageDescriptors.gumbarawa
                  },
                  {
                    value: 'GUNGANCHI',
                    label: formMessageDescriptors.gunganchi
                  },
                  { value: 'GWANDARA', label: formMessageDescriptors.gwandara },
                  { value: 'GWANTU', label: formMessageDescriptors.gwantu },
                  { value: 'HANKWE', label: formMessageDescriptors.hankwe },
                  { value: 'HAUSA', label: formMessageDescriptors.hausa },
                  { value: 'HIGGI', label: formMessageDescriptors.higgi },
                  { value: 'IBARIBA', label: formMessageDescriptors.ibariba },
                  { value: 'IBIBIO', label: formMessageDescriptors.ibibio },
                  { value: 'ICHEN', label: formMessageDescriptors.ichen },
                  { value: 'IDANRE', label: formMessageDescriptors.idanre },
                  { value: 'IDOMA', label: formMessageDescriptors.idoma },
                  { value: 'IGALA', label: formMessageDescriptors.igala },
                  { value: 'IGBO_IBO', label: formMessageDescriptors.igboIbo },
                  { value: 'IGEDE', label: formMessageDescriptors.igede },
                  {
                    value: 'IJAW_IZON',
                    label: formMessageDescriptors.ijawIzon
                  },
                  { value: 'IJEDE', label: formMessageDescriptors.ijede },
                  { value: 'IJEME', label: formMessageDescriptors.ijeme },
                  { value: 'IKA', label: formMessageDescriptors.ika },
                  { value: 'IKAJO', label: formMessageDescriptors.ikajo },
                  { value: 'IKARA', label: formMessageDescriptors.ikara },
                  { value: 'IKPESHI', label: formMessageDescriptors.ikpeshi },
                  { value: 'IKPIDE', label: formMessageDescriptors.ikpide },
                  { value: 'IKULU', label: formMessageDescriptors.ikulu },
                  { value: 'IKWERE', label: formMessageDescriptors.ikwere },
                  { value: 'ILAJE', label: formMessageDescriptors.ilaje },
                  { value: 'IRIGWE', label: formMessageDescriptors.irigwe },
                  { value: 'ISHAN', label: formMessageDescriptors.ishan },
                  { value: 'ISOKO', label: formMessageDescriptors.isoko },
                  { value: 'ITSEKIRI', label: formMessageDescriptors.itsekiri },
                  { value: 'JABA', label: formMessageDescriptors.jaba },
                  { value: 'JAJIRI', label: formMessageDescriptors.jajiri },
                  { value: 'JAKATOE', label: formMessageDescriptors.jakatoe },
                  { value: 'JAKU', label: formMessageDescriptors.jaku },
                  { value: 'JARA', label: formMessageDescriptors.jara },
                  { value: 'JARAWA', label: formMessageDescriptors.jarawa },
                  { value: 'JIBU', label: formMessageDescriptors.jibu },
                  { value: 'JONJO', label: formMessageDescriptors.jonjo },
                  { value: 'JUKUN', label: formMessageDescriptors.jukun },
                  { value: 'KABAWA', label: formMessageDescriptors.kabawa },
                  { value: 'KADARA', label: formMessageDescriptors.kadara },
                  { value: 'KAGOMA', label: formMessageDescriptors.kagoma },
                  { value: 'KAGORO', label: formMessageDescriptors.kagoro },
                  { value: 'KAKA', label: formMessageDescriptors.kaka },
                  { value: 'KAKANDA', label: formMessageDescriptors.kakanda },
                  { value: 'KAMANTAM', label: formMessageDescriptors.kamantam },
                  { value: 'KAMBARI', label: formMessageDescriptors.kambari },
                  {
                    value: 'KAMBU_KANGU',
                    label: formMessageDescriptors.kambuKangu
                  },
                  { value: 'KAMUKU', label: formMessageDescriptors.kamuku },
                  { value: 'KANAKURU', label: formMessageDescriptors.kanakuru },
                  { value: 'KANAWA', label: formMessageDescriptors.kanawa },
                  { value: 'KANINKO', label: formMessageDescriptors.kaninko },
                  {
                    value: 'KANTANAWA',
                    label: formMessageDescriptors.kantanawa
                  },
                  {
                    value: 'KANURI_BERIBERI',
                    label: formMessageDescriptors.kanuriBeriberi
                  },
                  { value: 'MANGA', label: formMessageDescriptors.manga },
                  { value: 'KAREKARE', label: formMessageDescriptors.karekare },
                  {
                    value: 'KATAF_ATYAP',
                    label: formMessageDescriptors.katafAtyap
                  },
                  { value: 'KENTO', label: formMessageDescriptors.kento },
                  { value: 'KIBAKU', label: formMessageDescriptors.kibaku },
                  { value: 'KILBA', label: formMessageDescriptors.kilba },
                  { value: 'KIRDI', label: formMessageDescriptors.kirdi },
                  { value: 'KODKI', label: formMessageDescriptors.kodki },
                  { value: 'KOFYAR', label: formMessageDescriptors.kofyar },
                  { value: 'KONA', label: formMessageDescriptors.kona },
                  { value: 'KORO', label: formMessageDescriptors.koro },
                  { value: 'KOTO', label: formMessageDescriptors.koto },
                  { value: 'KUENUEM', label: formMessageDescriptors.kuenuem },
                  { value: 'KUMBO', label: formMessageDescriptors.kumbo },
                  {
                    value: 'KUNKAWA_KAWA',
                    label: formMessageDescriptors.kunkawaKawa
                  },
                  { value: 'KURAMA', label: formMessageDescriptors.kurama },
                  { value: 'KUTEB', label: formMessageDescriptors.kuteb },
                  { value: 'KUTURM', label: formMessageDescriptors.kuturm },
                  {
                    value: 'KWALE_UKWUANI',
                    label: formMessageDescriptors.kwaleUkwuani
                  },
                  { value: 'KWANZO', label: formMessageDescriptors.kwanzo },
                  { value: 'LAGELU', label: formMessageDescriptors.lagelu },
                  { value: 'LANTANG', label: formMessageDescriptors.lantang },
                  { value: 'LEMORO', label: formMessageDescriptors.lemoro },
                  { value: 'LOH', label: formMessageDescriptors.loh },
                  { value: 'LUNGUDA', label: formMessageDescriptors.lunguda },
                  {
                    value: 'MABA_MBADOWA',
                    label: formMessageDescriptors.mabaMbadowa
                  },
                  { value: 'MADA', label: formMessageDescriptors.mada },
                  {
                    value: 'MAFA_MAKA_MAGA',
                    label: formMessageDescriptors.mafaMakaMaga
                  },
                  { value: 'MAMBILA', label: formMessageDescriptors.mambila },
                  { value: 'MANDARA', label: formMessageDescriptors.mandara },
                  {
                    value: 'MANGUS_MANJU',
                    label: formMessageDescriptors.mangusManju
                  },
                  {
                    value: 'MARGHI_MANGI',
                    label: formMessageDescriptors.marghiMangi
                  },
                  { value: 'MBWA', label: formMessageDescriptors.mbwa },
                  { value: 'MINGO', label: formMessageDescriptors.mingo },
                  { value: 'MIRNANG', label: formMessageDescriptors.mirnang },
                  { value: 'MONTOR', label: formMessageDescriptors.montor },
                  {
                    value: 'MTCHIGA_MICHIKA',
                    label: formMessageDescriptors.mtchigaMichika
                  },
                  { value: 'MUMUYE', label: formMessageDescriptors.mumuye },
                  { value: 'MUNGA', label: formMessageDescriptors.munga },
                  { value: 'MUPUNG', label: formMessageDescriptors.mupung },
                  { value: 'MUSHERE', label: formMessageDescriptors.mushere },
                  { value: 'MWAGAVOL', label: formMessageDescriptors.mwagavol },
                  { value: 'NAIAWUM', label: formMessageDescriptors.naiawum },
                  { value: 'NAMOEN', label: formMessageDescriptors.namoen },
                  { value: 'NDOKWA', label: formMessageDescriptors.ndokwa },
                  { value: 'NDOLA', label: formMessageDescriptors.ndola },
                  { value: 'NGAMO', label: formMessageDescriptors.ngamo },
                  { value: 'UKALE', label: formMessageDescriptors.ukale },
                  { value: 'NGOSHE', label: formMessageDescriptors.ngoshe },
                  { value: 'NILI', label: formMessageDescriptors.nili },
                  { value: 'NINNMA', label: formMessageDescriptors.ninnma },
                  { value: 'NINZOM', label: formMessageDescriptors.ninzom },
                  { value: 'NKOROO', label: formMessageDescriptors.nkoroo },
                  { value: 'NNEBE', label: formMessageDescriptors.nnebe },
                  { value: 'NUMANA', label: formMessageDescriptors.numana },
                  { value: 'NUNGU', label: formMessageDescriptors.nungu },
                  { value: 'NUNKU', label: formMessageDescriptors.nunku },
                  { value: 'NUPE', label: formMessageDescriptors.nupe },
                  { value: 'OBUBUA', label: formMessageDescriptors.obubua },
                  { value: 'ODU', label: formMessageDescriptors.odu },
                  { value: 'OGOJA', label: formMessageDescriptors.ogoja },
                  { value: 'OGONI', label: formMessageDescriptors.ogoni },
                  { value: 'OGUGU', label: formMessageDescriptors.ogugu },
                  {
                    value: 'OKORI_OGORI',
                    label: formMessageDescriptors.okoriOgori
                  },
                  { value: 'OMELE', label: formMessageDescriptors.omele },
                  { value: 'ORA', label: formMessageDescriptors.ora },
                  { value: 'ORON', label: formMessageDescriptors.oron },
                  { value: 'OWAN', label: formMessageDescriptors.owan },
                  { value: 'OWO', label: formMessageDescriptors.owo },
                  { value: 'PA_AWA', label: formMessageDescriptors.paAwa },
                  { value: 'PABURI', label: formMessageDescriptors.paburi },
                  { value: 'PAIBUN', label: formMessageDescriptors.paibun },
                  { value: 'PANYA', label: formMessageDescriptors.panya },
                  { value: 'PASAMA', label: formMessageDescriptors.pasama },
                  { value: 'PERO', label: formMessageDescriptors.pero },
                  { value: 'PIYA', label: formMessageDescriptors.piya },
                  { value: 'PYEM', label: formMessageDescriptors.pyem },
                  { value: 'RUKUBA', label: formMessageDescriptors.rukuba },
                  { value: 'RULERE', label: formMessageDescriptors.rulere },
                  { value: 'RUNDAWA', label: formMessageDescriptors.rundawa },
                  {
                    value: 'SAYAWA_SIYAWA',
                    label: formMessageDescriptors.sayawaSiyawa
                  },
                  { value: 'SEKERE', label: formMessageDescriptors.sekere },
                  { value: 'SHARAWA', label: formMessageDescriptors.sharawa },
                  { value: 'SHOMO', label: formMessageDescriptors.shomo },
                  { value: 'SHUWA', label: formMessageDescriptors.shuwa },
                  { value: 'SOMUNKA', label: formMessageDescriptors.somunka },
                  {
                    value: 'SULLUBAWA',
                    label: formMessageDescriptors.sullubawa
                  },
                  { value: 'SURA', label: formMessageDescriptors.sura },
                  { value: 'TAIRA', label: formMessageDescriptors.taira },
                  { value: 'TANGALE', label: formMessageDescriptors.tangale },
                  { value: 'TAROK', label: formMessageDescriptors.tarok },
                  { value: 'TERA', label: formMessageDescriptors.tera },
                  { value: 'TESKWA', label: formMessageDescriptors.teskwa },
                  { value: 'TIGUNI', label: formMessageDescriptors.tiguni },
                  { value: 'TIV', label: formMessageDescriptors.tiv },
                  { value: 'TIYARI', label: formMessageDescriptors.tiyari },
                  { value: 'TULA', label: formMessageDescriptors.tula },
                  { value: 'UBAIJA', label: formMessageDescriptors.ubaija },
                  { value: 'UGBIA', label: formMessageDescriptors.ugbia },
                  {
                    value: 'UHIONIGBE',
                    label: formMessageDescriptors.uhionigbe
                  },
                  { value: 'UKWUANI', label: formMessageDescriptors.ukwuani },
                  { value: 'URHOBO', label: formMessageDescriptors.urhobo },
                  { value: 'UYO', label: formMessageDescriptors.uyo },
                  { value: 'UZAURUE', label: formMessageDescriptors.uzaurue },
                  { value: 'UZEBA', label: formMessageDescriptors.uzeba },
                  { value: 'WAJA', label: formMessageDescriptors.waja },
                  { value: 'WAKA', label: formMessageDescriptors.waka },
                  { value: 'WANU', label: formMessageDescriptors.wanu },
                  { value: 'WARI', label: formMessageDescriptors.wari },
                  { value: 'WARJAWA', label: formMessageDescriptors.warjawa },
                  { value: 'WODAABE', label: formMessageDescriptors.wodaabe },
                  { value: 'WURKUM', label: formMessageDescriptors.wurkum },
                  { value: 'YAKURR', label: formMessageDescriptors.yakurr },
                  { value: 'YANDANG', label: formMessageDescriptors.yandang },
                  { value: 'YENDRE', label: formMessageDescriptors.yendre },
                  { value: 'YONUBI', label: formMessageDescriptors.yonubi },
                  { value: 'YORUBA', label: formMessageDescriptors.yoruba },
                  {
                    value: 'ZABARMAWA',
                    label: formMessageDescriptors.zabarmawa
                  },
                  { value: 'KAJE', label: formMessageDescriptors.kaje },
                  { value: 'IGBANKO', label: formMessageDescriptors.igbanko },
                  {
                    value: 'OKORI_OGORI',
                    label: formMessageDescriptors.okoriOgori
                  },
                  { value: 'MIGILI', label: formMessageDescriptors.migili },
                  { value: 'GWARI', label: formMessageDescriptors.gwari },
                  { value: 'URU', label: formMessageDescriptors.uru },
                  { value: 'OKIRIKA', label: formMessageDescriptors.okirika },
                  { value: 'EGI', label: formMessageDescriptors.egi },
                  { value: 'OGBA', label: formMessageDescriptors.ogba },
                  { value: 'MOROA', label: formMessageDescriptors.moroa },
                  { value: 'MARWA', label: formMessageDescriptors.marwa },
                  { value: 'TOFF', label: formMessageDescriptors.toff },
                  { value: 'FULFULDE', label: formMessageDescriptors.fulfulde },
                  {
                    value: 'KABBA_OKUN',
                    label: formMessageDescriptors.kabbaOkun
                  },
                  { value: 'BAKABE', label: formMessageDescriptors.bakabe },
                  { value: 'BURMANCH', label: formMessageDescriptors.burmanch },
                  { value: 'KALABARI', label: formMessageDescriptors.kalabari },
                  { value: 'MISHIP', label: formMessageDescriptors.miship },
                  { value: 'KARIMJO', label: formMessageDescriptors.karimjo },
                  { value: 'KWA', label: formMessageDescriptors.kwa },
                  { value: 'ANGAS', label: formMessageDescriptors.angas },
                  { value: 'BOBARI', label: formMessageDescriptors.bobari },
                  { value: 'YARIMAWA', label: formMessageDescriptors.yarimawa },
                  { value: 'BAKENGA', label: formMessageDescriptors.bakenga },
                  { value: 'AGAZAWA', label: formMessageDescriptors.agazawa },
                  { value: 'GWOZA', label: formMessageDescriptors.gwoza },
                  { value: 'ZALIDVA', label: formMessageDescriptors.zalidva },
                  {
                    value: 'NYANGDANG',
                    label: formMessageDescriptors.nyangdang
                  },
                  { value: 'NGEZIM', label: formMessageDescriptors.ngezim },
                  { value: 'HANBAGDA', label: formMessageDescriptors.hanbagda },
                  { value: 'NJANYI', label: formMessageDescriptors.njanyi },
                  { value: 'DUMAK', label: formMessageDescriptors.dumak },
                  { value: 'KWALLA', label: formMessageDescriptors.kwalla },
                  {
                    value: 'YESKWA_AND_MUBULA',
                    label: formMessageDescriptors.yeskwaAndMubula
                  },
                  { value: 'BILE', label: formMessageDescriptors.bile },
                  { value: 'OFFA', label: formMessageDescriptors.offa },
                  { value: 'YUNGUR', label: formMessageDescriptors.yungur },
                  {
                    value: 'PURA_PURA',
                    label: formMessageDescriptors.puraPura
                  },
                  { value: 'RINDRE', label: formMessageDescriptors.rindre },
                  { value: 'DUKAWA', label: formMessageDescriptors.dukawa },
                  { value: 'NINGI', label: formMessageDescriptors.ningi },
                  { value: 'CHAM', label: formMessageDescriptors.cham },
                  { value: 'KAMO', label: formMessageDescriptors.kamo },
                  { value: 'LALA', label: formMessageDescriptors.lala },
                  { value: 'LARU', label: formMessageDescriptors.laru },
                  { value: 'LISA', label: formMessageDescriptors.lisa },
                  { value: 'GAANDA', label: formMessageDescriptors.gaanda },
                  { value: 'EZZA', label: formMessageDescriptors.ezza },
                  { value: 'KUBASAWA', label: formMessageDescriptors.kubasawa },
                  { value: 'GUSU', label: formMessageDescriptors.gusu },
                  { value: 'IKPOMA', label: formMessageDescriptors.ikpoma },
                  { value: 'BUH', label: formMessageDescriptors.buh },
                  { value: 'MUSHERE', label: formMessageDescriptors.mushere },
                  { value: 'CHAKEEM', label: formMessageDescriptors.chakeem },
                  { value: 'JIPAL', label: formMessageDescriptors.jipal },
                  { value: 'UGEB', label: formMessageDescriptors.ugeb },
                  { value: 'KOMA', label: formMessageDescriptors.koma },
                  {
                    value: 'VERRE_KILA',
                    label: formMessageDescriptors.verreKila
                  },
                  { value: 'ZURU', label: formMessageDescriptors.zuru },
                  { value: 'HONNA', label: formMessageDescriptors.honna },
                  { value: 'KAPSIKI', label: formMessageDescriptors.kapsiki },
                  { value: 'JERE', label: formMessageDescriptors.jere },
                  {
                    value: 'GIZI_YOBE',
                    label: formMessageDescriptors.giziYobe
                  },
                  { value: 'KAREKARE', label: formMessageDescriptors.karekare },
                  { value: 'KULERE', label: formMessageDescriptors.kulere },
                  { value: 'BETEER', label: formMessageDescriptors.beteer },
                  { value: 'BASHAMA', label: formMessageDescriptors.bashama },
                  { value: 'ANTOCHA', label: formMessageDescriptors.antocha },
                  {
                    value: 'BARUBA_BARUNTIN',
                    label: formMessageDescriptors.barubaBaruntin
                  },
                  { value: 'NEZOU', label: formMessageDescriptors.nezou },
                  { value: 'DIBBA', label: formMessageDescriptors.dibba },
                  { value: 'KANUM', label: formMessageDescriptors.kanum },
                  { value: 'GASAWA', label: formMessageDescriptors.gasawa },
                  { value: 'MURYAN', label: formMessageDescriptors.muryan },
                  { value: 'BAGERI', label: formMessageDescriptors.bageri },
                  { value: 'AHU', label: formMessageDescriptors.ahu },
                  { value: 'BASANGE', label: formMessageDescriptors.basange },
                  { value: 'NAKERE', label: formMessageDescriptors.nakere },
                  { value: 'BATUNU', label: formMessageDescriptors.batunu },
                  { value: 'SANGA', label: formMessageDescriptors.sanga },
                  { value: 'OHARI', label: formMessageDescriptors.ohari },
                  { value: 'NUMURO', label: formMessageDescriptors.numuro },
                  { value: 'TANGALE', label: formMessageDescriptors.tangale },
                  { value: 'GURUMA', label: formMessageDescriptors.guruma },
                  { value: 'OTUWO', label: formMessageDescriptors.otuwo },
                  { value: 'BATALA', label: formMessageDescriptors.batala },
                  { value: 'OGBO', label: formMessageDescriptors.ogbo },
                  { value: 'EGBEMA', label: formMessageDescriptors.egbema },
                  { value: 'DARA', label: formMessageDescriptors.dara },
                  { value: 'ANDONI', label: formMessageDescriptors.andoni },
                  { value: 'OBOLO', label: formMessageDescriptors.obolo },
                  { value: 'PEGAN', label: formMessageDescriptors.pegan },
                  { value: 'IYALA', label: formMessageDescriptors.iyala },
                  { value: 'JIBAWA', label: formMessageDescriptors.jibawa },
                  {
                    value: 'MUNGADUSO',
                    label: formMessageDescriptors.mungaduso
                  },
                  { value: 'OKOBO', label: formMessageDescriptors.okobo },
                  { value: 'OTHERS', label: formMessageDescriptors.others },
                  { value: 'DK', label: formMessageDescriptors.dk },
                  { value: 'MISSING', label: formMessageDescriptors.missing }
                ],
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
            operation: 'setInformantRegistrationComposedTransformer'
          },
          query: {
            operation: 'getInformantRegistrationComposedTransformer'
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
        id: DeathSection.Registration,
        viewType: 'form',
        name: formMessageDescriptors.registrationName,
        title: formMessageDescriptors.registrationTitle,
        groups: [
          {
            id: 'who-is-applying-view-group',
            title: informantMessageDescriptors.deathInformantTitle,
            conditionals: [],
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
          },
          {
            id: 'contact-view-group',
            title: informantMessageDescriptors.selectContactPoint,
            conditionals: [],
            preventContinueIfError: true,
            showExitButtonOnly: true,
            previewGroups: [
              {
                id: 'contactPointGroup',
                label: formMessageDescriptors.reviewLabelMainContact,
                required: false,
                initialValue: '',
                fieldToRedirect: 'contactPoint'
              }
            ],
            fields: [
              {
                name: 'contactPoint',
                type: 'RADIO_GROUP_WITH_NESTED_FIELDS',
                label: formMessageDescriptors.selectContactPoint,
                conditionals: [],
                previewGroup: 'contactPointGroup',
                required: true,
                hideHeader: true,
                initialValue: '',
                validate: [],
                size: RadioSize.LARGE,
                placeholder: formMessageDescriptors.formSelectPlaceholder,
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
                nestedFields: {
                  SPOUSE: [
                    {
                      name: 'registrationPhone',
                      type: 'TEL',
                      label: formMessageDescriptors.phoneNumber,
                      required: true,
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
                    }
                  ],
                  SON: [
                    {
                      name: 'registrationPhone',
                      type: 'TEL',
                      label: formMessageDescriptors.phoneNumber,
                      required: true,
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
                    }
                  ],
                  DAUGHTER: [
                    {
                      name: 'registrationPhone',
                      type: 'TEL',
                      label: formMessageDescriptors.phoneNumber,
                      required: true,
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
                    }
                  ],
                  SON_IN_LAW: [
                    {
                      name: 'registrationPhone',
                      type: 'TEL',
                      label: formMessageDescriptors.phoneNumber,
                      required: true,
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
                    }
                  ],
                  DAUGHTER_IN_LAW: [
                    {
                      name: 'registrationPhone',
                      type: 'TEL',
                      label: formMessageDescriptors.phoneNumber,
                      required: true,
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
                    }
                  ],
                  MOTHER: [
                    {
                      name: 'registrationPhone',
                      type: 'TEL',
                      label: formMessageDescriptors.phoneNumber,
                      required: true,
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
                    }
                  ],
                  FATHER: [
                    {
                      name: 'registrationPhone',
                      type: 'TEL',
                      label: formMessageDescriptors.phoneNumber,
                      required: true,
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
                    }
                  ],
                  GRANDSON: [
                    {
                      name: 'registrationPhone',
                      type: 'TEL',
                      label: formMessageDescriptors.phoneNumber,
                      required: true,
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
                    }
                  ],
                  GRANDDAUGHTER: [
                    {
                      name: 'registrationPhone',
                      type: 'TEL',
                      label: formMessageDescriptors.phoneNumber,
                      required: true,
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
                    }
                  ],
                  OTHER: [
                    {
                      name: 'registrationPhone',
                      type: 'TEL',
                      label: formMessageDescriptors.phoneNumber,
                      required: true,
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
                    }
                  ]
                },
                mapping: {
                  mutation: {
                    operation: 'nestedRadioFieldToBundleFieldTransformer',
                    parameters: ['registration.contact']
                  },
                  query: {
                    operation: 'bundleFieldToNestedRadioFieldTransformer',
                    parameters: ['registration.contact']
                  }
                }
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
            }
          ],
          mutation: {
            operation: 'setDeathRegistrationSectionTransformer'
          },
          query: {
            operation: 'getDeathRegistrationSectionTransformer'
          }
        }
      },
      {
        id: DeathSection.Deceased,
        viewType: 'form',
        name: formMessageDescriptors.deceasedName,
        title: formMessageDescriptors.deceasedTitle,
        hasDocumentSection: true,
        groups: [
          {
            id: 'deceased-view-group',
            fields: [
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
                name: 'iD',
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
                    parameters: ['informant.informantID']
                  }
                ],
                conditionals: [],
                mapping: {
                  template: {
                    fieldName: 'deceasedNID',
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
              {
                name: 'birthDate',
                type: 'DATE',
                label: formMessageDescriptors.deceasedDateOfBirth,
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'isValidBirthDate'
                  }
                ],
                mapping: {
                  template: {
                    operation: 'dateFormatTransformer',
                    fieldName: 'deceasedBirthDate',
                    parameters: ['birthDate', 'en', 'do MMMM yyyy']
                  },
                  mutation: {
                    operation: 'longDateTransformer',
                    parameters: []
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
                  },
                  {
                    value: 'unknown',
                    label: formMessageDescriptors.deceasedSexUnknown
                  }
                ]
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
                name: 'maritalStatus',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.maritalStatus,
                required: false,
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
              }
              // PRIMARY ADDRESS SUBSECTION
              // PRIMARY ADDRESS
              // SECONDARY ADDRESS SAME AS PRIMARY
              // SECONDARY ADDRESS SUBSECTION
              // SECONDARY ADDRESS
            ],
            previewGroups: [
              {
                id: 'deceasedNameInEnglish',
                label: formMessageDescriptors.nameInEnglishPreviewGroup,
                fieldToRedirect: 'familyNameEng',
                delimiter: ' '
              }
            ]
          }
        ]
      },
      {
        id: DeathSection.Event,
        viewType: 'form',
        name: formMessageDescriptors.deathEventName,
        title: formMessageDescriptors.deathEventTitle,
        groups: [
          {
            id: 'death-event-details',
            fields: [
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
                name: 'manner',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.manner,
                required: false,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: [
                  {
                    value: 'NATURAL_CAUSES',
                    label: formMessageDescriptors.mannerNatural
                  },
                  {
                    value: 'ACCIDENT',
                    label: formMessageDescriptors.mannerAccident
                  },
                  {
                    value: 'SUICIDE',
                    label: formMessageDescriptors.mannerSuicide
                  },
                  {
                    value: 'HOMICIDE',
                    label: formMessageDescriptors.mannerHomicide
                  },
                  {
                    value: 'MANNER_UNDETERMINED',
                    label: formMessageDescriptors.mannerUndetermined
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
              },
              {
                name: 'causeOfDeathEstablished',
                type: 'RADIO_GROUP',
                label: formMessageDescriptors.causeOfDeathEstablished,
                required: true,
                customisable: true,
                initialValue: 'true',
                size: RadioSize.NORMAL,
                validate: [],
                options: [
                  {
                    value: 'true',
                    label: formMessageDescriptors.confirm
                  },
                  {
                    value: 'false',
                    label: formMessageDescriptors.deny
                  }
                ],
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
                name: 'causeOfDeathMethod',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.causeOfDeathMethod,
                required: true,
                customisable: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.causeOfDeathEstablished !== "true"'
                  }
                ],
                options: [
                  {
                    value: 'PHYSICIAN',
                    label: formMessageDescriptors.physician
                  },
                  {
                    value: 'LAY_REPORTED',
                    label: formMessageDescriptors.layReported
                  },
                  {
                    value: 'VERBAL_AUTOPSY',
                    label: formMessageDescriptors.verbalAutopsy
                  },
                  {
                    value: 'MEDICALLY_CERTIFIED',
                    label: formMessageDescriptors.medicallyCertified
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'sectionFieldToBundleFieldTransformer',
                    parameters: ['causeOfDeathMethod']
                  },
                  query: {
                    operation: 'bundleFieldToSectionFieldTransformer',
                    parameters: ['causeOfDeathMethod']
                  }
                }
              },
              {
                name: 'deathDescription',
                type: TEXTAREA,
                label: formMessageDescriptors.deathDescription,
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'values.causeOfDeathMethod !== "LAY_REPORTED" && values.causeOfDeathMethod !== "VERBAL_AUTOPSY"'
                  }
                ],
                initialValue: '',
                validate: [],
                required: true,
                customisable: true,
                maxLength: 500,
                mapping: {
                  mutation: {
                    operation: 'sectionFieldToBundleFieldTransformer',
                    parameters: ['deathDescription']
                  },
                  query: {
                    operation: 'bundleFieldToSectionFieldTransformer',
                    parameters: ['deathDescription']
                  }
                }
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
                    value: 'HEALTH_FACILITY',
                    label: formMessageDescriptors.healthInstitution
                  },
                  {
                    value: 'DECEASED_USUAL_RESIDENCE',
                    label: formMessageDescriptors.placeOfDeathSameAsPrimary
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

              {
                name: 'deathLocation',
                customisable: false,
                type: 'LOCATION_SEARCH_INPUT',
                label: {
                  defaultMessage: 'Health institution',
                  description: 'Label for form field: Health Institution',
                  id: 'form.field.label.healthInstitution'
                },
                previewGroup: 'placeOfDeath',
                required: true,
                initialValue: '',
                searchableResource: 'facilities',
                searchableType: 'HEALTH_FACILITY',
                dynamicOptions: {
                  resource: 'facilities'
                },
                validate: [
                  {
                    operation: 'facilityMustBeSelected'
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '(values.placeOfDeath!="HEALTH_FACILITY")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'placeOfDeath',
                    operation: 'eventLocationNameQueryOfflineTransformer',
                    parameters: ['facilities']
                  },
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
          }
        ]
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
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToArrayTransformer'
                      }
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'arrayToFieldTransformer'
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
              },
              {
                name: 'informantBirthDate',
                type: 'DATE',
                label: formMessageDescriptors.motherDateOfBirth,
                required: true,
                customisable: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'dateFormatIsCorrect',
                    parameters: []
                  },
                  {
                    operation: 'dateInPast',
                    parameters: []
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'longDateTransformer',
                        parameters: ['birthDate']
                      },
                      'birthDate'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldValueTransformer',
                        parameters: ['birthDate']
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
              }
              // PRIMARY ADDRESS SUBSECTION
              // PRIMARY ADDRESS
              // SECONDARY ADDRESS SAME AS PRIMARY
              // SECONDARY ADDRESS SUBSECTION
              // SECONDARY ADDRESS
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
            operation: 'setInformantSectionTransformer'
          },
          query: {
            operation: 'getInformantSectionTransformer'
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
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'draftData?.deathEvent?.causeOfDeathEstablished !== "true"'
                  }
                ],
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
