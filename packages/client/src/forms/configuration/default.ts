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
  REVIEW_OVERRIDE_POSITION,
  FLEX_DIRECTION,
  ISerializedForm,
  Event,
  IConditionals,
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
        id: BirthSection.Registration,
        viewType: 'form',
        name: formMessageDescriptors.registrationName,
        title: formMessageDescriptors.registrationTitle,
        groups: [
          {
            id: 'who-is-applying-view-group',
            title: informantMessageDescriptors.birthInformantTitle,
            conditionals: [],
            preventContinueIfError: true,
            showExitButtonOnly: true,
            fields: [
              {
                name: 'informantType',
                type: 'RADIO_GROUP_WITH_NESTED_FIELDS',
                label: informantMessageDescriptors.birthInformantTitle,
                hideHeader: true,
                required: true,
                hideInPreview: false,
                initialValue: '',
                validate: [],
                size: RadioSize.LARGE,
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
                    value: 'GRANDFATHER',
                    label: informantMessageDescriptors.grandfather
                  },
                  {
                    value: 'GRANDMOTHER',
                    label: informantMessageDescriptors.grandmother
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
                    value: 'OTHER',
                    label: formMessageDescriptors.someoneElse
                  }
                ],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                nestedFields: {
                  MOTHER: [],
                  FATHER: [],
                  GRANDFATHER: [],
                  GRANDMOTHER: [],
                  BROTHER: [],
                  SISTER: [],
                  OTHER_FAMILY_MEMBER: [],
                  LEGAL_GUARDIAN: [],
                  OTHER: [
                    {
                      name: 'otherInformantType',
                      type: 'TEXT',
                      label: formMessageDescriptors.informantsRelationWithChild,
                      placeholder:
                        formMessageDescriptors.relationshipPlaceHolder,
                      required: false,
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
                    value: 'MOTHER',
                    label: informantMessageDescriptors.mother
                  },
                  {
                    value: 'FATHER',
                    label: informantMessageDescriptors.father
                  },
                  {
                    value: 'GRANDFATHER',
                    label: informantMessageDescriptors.grandfather
                  },
                  {
                    value: 'GRANDMOTHER',
                    label: informantMessageDescriptors.grandmother
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
                    value: 'OTHER',
                    label: formMessageDescriptors.someoneElse
                  }
                ],
                nestedFields: {
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
                  GRANDFATHER: [
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
                  GRANDMOTHER: [
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
                  BROTHER: [
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
                  SISTER: [
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
                  LEGAL_GUARDIAN: [
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
              fieldName: 'registrationLocation',
              operation: 'registrationLocationUserTransformer'
            }
          ],
          mutation: {
            operation: 'setBirthRegistrationSectionTransformer'
          },
          query: {
            operation: 'getBirthRegistrationSectionTransformer'
          }
        }
      },
      {
        id: BirthSection.Child,
        viewType: 'form',
        name: formMessageDescriptors.childTab,
        title: formMessageDescriptors.childTitle,
        hasDocumentSection: true,
        groups: [
          {
            id: 'child-view-group',
            fields: [
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
                name: 'firstNamesEng',
                previewGroup: 'childNameInEnglish',
                customisable: false,
                type: 'TEXT',
                label: formMessageDescriptors.childFirstNamesEng,
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
                    fieldName: 'informantFirstName',
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
                previewGroup: 'childNameInEnglish',
                customisable: false,
                type: 'TEXT',
                label: formMessageDescriptors.childFamilyNameEng,
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
                    fieldName: 'informantFamilyName',
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
                  },
                  {
                    value: 'unknown',
                    label: formMessageDescriptors.childSexUnknown
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
                validate: [],
                conditionals: []
              },
              {
                name: 'attendantAtBirth',
                customisable: true,
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.attendantAtBirth,
                required: false,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: [
                  {
                    value: 'PHYSICIAN',
                    label: formMessageDescriptors.physician
                  },
                  {
                    value: 'NURSE',
                    label: formMessageDescriptors.attendantAtBirthNurse
                  },
                  {
                    value: 'MIDWIFE',
                    label: formMessageDescriptors.attendantAtBirthMidwife
                  },
                  {
                    value: 'OTHER_PARAMEDICAL_PERSONNEL',
                    label:
                      formMessageDescriptors.attendantAtBirthOtherParamedicalPersonnel
                  },
                  {
                    value: 'LAYPERSON',
                    label: formMessageDescriptors.attendantAtBirthLayperson
                  },
                  {
                    value: 'TRADITIONAL_BIRTH_ATTENDANT',
                    label:
                      formMessageDescriptors.attendantAtBirthTraditionalBirthAttendant
                  },
                  {
                    value: 'NONE',
                    label: formMessageDescriptors.attendantAtBirthNone
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
                name: 'birthType',
                customisable: true,
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Type of birth',
                  description: 'Label for form field: Type of birth',
                  id: 'form.field.label.birthType'
                },
                required: false,
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
                name: 'weightAtBirth',
                type: 'NUMBER',
                step: 0.01,
                label: formMessageDescriptors.weightAtBirth,
                customisable: true,
                required: false,
                initialValue: '',
                validate: [
                  {
                    operation: 'range',
                    parameters: [0, 6]
                  }
                ],
                postfix: 'Kg',
                mapping: {
                  mutation: {
                    operation: 'sectionFieldToBundleFieldTransformer',
                    parameters: []
                  },
                  query: {
                    operation: 'bundleFieldToSectionFieldTransformer',
                    parameters: []
                  }
                },
                inputFieldWidth: '78px'
              },
              {
                name: 'placeOfBirthTitle',
                type: 'SUBSECTION',
                label: formMessageDescriptors.placeOfBirthPreview,
                previewGroup: 'placeOfBirtrh',
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
                name: 'birthLocation',
                customisable: false,
                type: 'LOCATION_SEARCH_INPUT',
                label: formMessageDescriptors.healthInstitution,
                previewGroup: 'placeOfBirth',
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
                    expression: '(values.placeOfBirth!="HEALTH_FACILITY")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'placeOfBirth',
                    operation: 'eventLocationNameQueryOfflineTransformer',
                    parameters: ['facilities']
                  },
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: []
                  },
                  query: {
                    operation: 'eventLocationIDQueryTransformer',
                    parameters: []
                  }
                }
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
            conditionals: [
              {
                action: 'hide',
                expression:
                  "(draftData && draftData.registration && draftData.registration.informantType && selectedInformantAndContactType.selectedInformantType && (selectedInformantAndContactType.selectedInformantType === 'MOTHER' || selectedInformantAndContactType.selectedInformantType === 'FATHER'))"
              }
            ],
            fields: [
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.nationality,
                required: true,
                initialValue: window.config.COUNTRY.toUpperCase(),
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
                initialValue: '',
                validate: [
                  {
                    operation: 'dateFormatIsCorrect',
                    parameters: []
                  },
                  {
                    operation: 'dateInPast',
                    parameters: []
                  },
                  {
                    operation: 'isValidParentsBirthDate',
                    parameters: [5]
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
                label: {
                  defaultMessage: 'First name(s)',
                  description: 'Label for form field: Given names',
                  id: 'form.field.label.childFirstNamesEng'
                },
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
                label: {
                  defaultMessage: 'Last name',
                  description: 'Label for form field: Last name in english',
                  id: 'form.field.label.childFamilyNameEng'
                },
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
        id: BirthSection.Mother,
        viewType: 'form',
        name: formMessageDescriptors.motherName,
        title: formMessageDescriptors.motherTitle,
        hasDocumentSection: true,
        groups: [
          {
            id: 'mother-view-group',
            fields: [
              {
                name: 'detailsExist',
                type: 'RADIO_GROUP',
                label: formMessageDescriptors.mothersDetailsExist,
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
                    expression:
                      'mothersDetailsExistBasedOnContactAndInformant || values.detailsExist'
                  }
                ],
                type: 'TEXT',
                label: formMessageDescriptors.reasonMNA,
                validate: [],
                initialValue: '',
                required: true
              },
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.nationality,
                required: true,
                initialValue: window.config.COUNTRY.toUpperCase(),
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
                name: 'iD',
                type: 'TEXT',
                label: formMessageDescriptors.iDTypeNationalID,
                required: false,
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
              },
              {
                name: 'motherBirthDate',
                type: 'DATE',
                label: {
                  defaultMessage: 'Date of birth',
                  description: 'Label for form field: Date of birth',
                  id: 'form.field.label.motherDateOfBirth'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'dateFormatIsCorrect',
                    parameters: []
                  },
                  {
                    operation: 'dateInPast',
                    parameters: []
                  },
                  {
                    operation: 'isValidParentsBirthDate',
                    parameters: [5]
                  }
                ],
                mapping: {
                  template: {
                    operation: 'dateFormatTransformer',
                    fieldName: 'motherBirthDate',
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
                name: 'firstNamesEng',
                previewGroup: 'motherNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First Name',
                  description: 'Label for form field: First names in english',
                  id: 'form.field.label.motherFirstNamesEng'
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
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'motherFirstName',
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
                name: 'seperator',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
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
                name: 'maritalStatus',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Marital status',
                  description: 'Label for form field: Marital status',
                  id: 'form.field.label.maritalStatus'
                },
                customisable: true,
                required: false,
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
                name: 'multipleBirth',
                type: 'NUMBER',
                label: {
                  defaultMessage: 'No. of previous births',
                  description: 'Label for form field: multipleBirth',
                  id: ' '
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                  }
                ],
                customisable: false,
                required: false,
                initialValue: '',
                validate: [
                  {
                    operation: 'greaterThanZero'
                  },
                  {
                    operation: 'maxLength',
                    parameters: [2]
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
                name: 'educationalAttainment',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'level of education',
                  description: 'Label for form field: Mother education',
                  id: 'form.field.label.motherEducationAttainment'
                },
                required: false,
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
                    value: 'NO_SCHOOLING',
                    label: {
                      defaultMessage: 'No schooling',
                      description: 'Option for form field: no education',
                      id: 'form.field.label.educationAttainmentNone'
                    }
                  },
                  {
                    value: 'PRIMARY_ISCED_1',
                    label: {
                      defaultMessage: 'Primary',
                      description: 'Option for form field: ISCED1 education',
                      id: 'form.field.label.educationAttainmentISCED1'
                    }
                  },
                  {
                    value: 'POST_SECONDARY_ISCED_4',
                    label: {
                      defaultMessage: 'Secondary',
                      description: 'Option for form field: ISCED4 education',
                      id: 'form.field.label.educationAttainmentISCED4'
                    }
                  },
                  {
                    value: 'FIRST_STAGE_TERTIARY_ISCED_5',
                    label: {
                      defaultMessage: 'Tertiary',
                      description: 'Option for form field: ISCED5 education',
                      id: 'form.field.label.educationAttainmentISCED5'
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
                name: 'detailsExist',
                type: 'RADIO_GROUP',
                label: {
                  defaultMessage: "Do you have the father's details?",
                  description:
                    "Question to ask the user if they have the father's details",
                  id: 'form.field.label.fathersDetailsExist'
                },
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
                    expression: 'fathersDetailsExistBasedOnContactAndInformant'
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
                    expression:
                      'fathersDetailsExistBasedOnContactAndInformant || values.detailsExist'
                  }
                ],
                type: 'TEXT',
                label: formMessageDescriptors.reasonFNA,
                validate: [],
                initialValue: '',
                required: true
              },
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.nationality,
                required: true,
                initialValue: window.config.COUNTRY.toUpperCase(),
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
              {
                name: 'iD',
                type: 'TEXT',
                label: formMessageDescriptors.iDTypeNationalID,
                required: false,
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
              {
                name: 'fatherBirthDate',
                type: 'DATE',
                label: {
                  defaultMessage: 'Date of birth',
                  description: 'Label for form field: Date of birth',
                  id: 'form.field.label.motherDateOfBirth'
                },
                required: true,
                initialValue: '',
                validate: [
                  {
                    operation: 'dateFormatIsCorrect',
                    parameters: []
                  },
                  {
                    operation: 'dateInPast',
                    parameters: []
                  },
                  {
                    operation: 'isValidParentsBirthDate',
                    parameters: [10]
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
                    operation: 'dateFormatTransformer',
                    fieldName: 'fatherBirthDate',
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
                name: 'seperator',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
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
              {
                name: 'maritalStatus',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Marital status',
                  description: 'Label for form field: Marital status',
                  id: 'form.field.label.maritalStatus'
                },
                customisable: true,
                required: false,
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
              {
                name: 'educationalAttainment',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'level of education',
                  description: 'Label for form field: Mother education',
                  id: 'form.field.label.motherEducationAttainment'
                },
                customisable: true,
                required: false,
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
                options: [
                  {
                    value: 'NO_SCHOOLING',
                    label: {
                      defaultMessage: 'No schooling',
                      description: 'Option for form field: no education',
                      id: 'form.field.label.educationAttainmentNone'
                    }
                  },
                  {
                    value: 'PRIMARY_ISCED_1',
                    label: {
                      defaultMessage: 'Primary',
                      description: 'Option for form field: ISCED1 education',
                      id: 'form.field.label.educationAttainmentISCED1'
                    }
                  },
                  {
                    value: 'POST_SECONDARY_ISCED_4',
                    label: {
                      defaultMessage: 'Secondary',
                      description: 'Option for form field: ISCED4 education',
                      id: 'form.field.label.educationAttainmentISCED4'
                    }
                  },
                  {
                    value: 'FIRST_STAGE_TERTIARY_ISCED_5',
                    label: {
                      defaultMessage: 'Tertiary',
                      description: 'Option for form field: ISCED5 education',
                      id: 'form.field.label.educationAttainmentISCED5'
                    }
                  }
                ]
              }
              // PRIMARY ADDRESS SAME AS MOTHER
              // PRIMARY ADDRESS SUBSECTION
              // PRIMARY ADDRESS
              // SECONDARY ADDRESS SAME AS MOTHER
              // SECONDARY ADDRESS SUBSECTION
              // SECONDARY ADDRESS
            ],
            previewGroups: [
              {
                id: 'fatherNameInEnglish',
                label: {
                  defaultMessage: "Father's English name",
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
                      '!draftData.mother.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
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
                      '!draftData.father.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
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
                      "(draftData && draftData.registration && draftData.registration.informantType && selectedInformantAndContactType.selectedInformantType && (selectedInformantAndContactType.selectedInformantType === 'MOTHER' || selectedInformantAndContactType.selectedInformantType === 'FATHER'))"
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
                    value: birthDocumentTypeFhirMapping.BIRTH_CERTIFICATE,
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
                      "(draftData && draftData.registration && draftData.registration.informantType && selectedInformantAndContactType.selectedInformantType && (selectedInformantAndContactType.selectedInformantType === 'MOTHER' || selectedInformantAndContactType.selectedInformantType === 'FATHER'))"
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
                      required: false,
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
              fieldName: 'registrationLocation',
              operation: 'registrationLocationUserTransformer'
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
                initialValue: window.config.COUNTRY.toUpperCase(),
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
                validate: [],
                conditionals: []
              },
              {
                name: 'maritalStatus',
                type: 'SELECT_WITH_OPTIONS',
                label: formMessageDescriptors.maritalStatus,
                required: false,
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
                required: false,
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
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.causeOfDeathEstablished'
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
        id: DeathSection.Informants,
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
                initialValue: window.config.COUNTRY.toUpperCase(),
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
                name: 'firstNamesEng',
                previewGroup: 'informantNameInEnglish',
                type: 'TEXT',
                label: formMessageDescriptors.childFirstNamesEng,
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
                label: formMessageDescriptors.childFamilyNameEng,
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
