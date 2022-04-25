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
  DeathSection
} from '@client/forms/index'
import { formMessageDescriptors } from '@client/i18n/messages'
import { messages as informantMessageDescriptors } from '@client/i18n/messages/views/selectInformant'

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
                    }
                  ],
                  FATHER: [
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
                    }
                  ],
                  GRANDFATHER: [
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
                    }
                  ],
                  GRANDMOTHER: [
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
                    }
                  ],
                  BROTHER: [
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
                    }
                  ],
                  SISTER: [
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
                    }
                  ],
                  LEGAL_GUARDIAN: [
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
                    }
                  ],
                  OTHER: [
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
        name: {
          defaultMessage: 'Child',
          description: 'Form section name for Child',
          id: 'form.section.child.name'
        },
        title: {
          defaultMessage: "Child's details",
          description: 'Form section title for Child',
          id: 'form.section.child.title'
        },
        hasDocumentSection: true,
        groups: [
          {
            id: 'child-view-group',
            fields: [
              {
                name: 'firstNamesEng',
                previewGroup: 'childNameInEnglish',
                customisable: false,
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
                label: {
                  defaultMessage: 'Sex',
                  description: 'Label for form field: Sex name',
                  id: 'form.field.label.childSex'
                },
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
                    label: {
                      defaultMessage: 'Male',
                      description: 'Option for form field: Sex name',
                      id: 'form.field.label.childSexMale'
                    }
                  },
                  {
                    value: 'female',
                    label: {
                      defaultMessage: 'Female',
                      description: 'Option for form field: Sex name',
                      id: 'form.field.label.childSexFemale'
                    }
                  },
                  {
                    value: 'other',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Option for form field: Sex name',
                      id: 'form.field.label.childSexOther'
                    }
                  },
                  {
                    value: 'unknown',
                    label: {
                      defaultMessage: 'Unknown',
                      description: 'Option for form field: Sex name',
                      id: 'form.field.label.childSexUnknown'
                    }
                  }
                ]
              },
              {
                name: 'childBirthDate',
                customisable: false,
                type: 'DATE',
                label: {
                  defaultMessage: 'Date of birth',
                  description: 'Label for form field: Date of birth',
                  id: 'form.field.label.childDateOfBirth'
                },
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
                name: 'attendantAtBirth',
                customisable: true,
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Attendant at birth',
                  description: 'Label for form field: Attendant at birth',
                  id: 'form.field.label.attendantAtBirth'
                },
                required: false,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: [
                  {
                    value: 'PHYSICIAN',
                    label: {
                      defaultMessage: 'Physician',
                      description: 'Label for form field: Attendant at birth',
                      id: 'form.field.label.attendantAtBirthPhysician'
                    }
                  },
                  {
                    value: 'NURSE',
                    label: {
                      defaultMessage: 'Nurse',
                      description: 'Label for form field: Attendant at birth',
                      id: 'form.field.label.attendantAtBirthNurse'
                    }
                  },
                  {
                    value: 'MIDWIFE',
                    label: {
                      defaultMessage: 'Midwife',
                      description: 'Label for form field: Attendant at birth',
                      id: 'form.field.label.attendantAtBirthMidwife'
                    }
                  },
                  {
                    value: 'OTHER_PARAMEDICAL_PERSONNEL',
                    label: {
                      defaultMessage: 'Other paramedical personnel',
                      description: 'Label for form field: Attendant at birth',
                      id: 'form.field.label.attBirthOtherParaPers'
                    }
                  },
                  {
                    value: 'LAYPERSON',
                    label: {
                      defaultMessage: 'Layperson',
                      description: 'Label for form field: Attendant at birth',
                      id: 'form.field.label.attendantAtBirthLayperson'
                    }
                  },
                  {
                    value: 'TRADITIONAL_BIRTH_ATTENDANT',
                    label: {
                      defaultMessage: 'Traditional birth attendant',
                      description: 'Label for form field: Attendant at birth',
                      id: 'form.field.label.attendantAtBirthTraditionalBirthAttendant'
                    }
                  },
                  {
                    value: 'NONE',
                    label: {
                      defaultMessage: 'None',
                      description: 'Label for form field: Attendant at birth',
                      id: 'form.field.label.attendantAtBirthNone'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Label for form field: Attendant at birth',
                      id: 'form.field.label.attendantAtBirthOther'
                    }
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
                    label: {
                      defaultMessage: 'Single',
                      description: 'Label for form field: Type of birth',
                      id: 'form.field.label.birthTypeSingle'
                    }
                  },
                  {
                    value: 'TWIN',
                    label: {
                      defaultMessage: 'Twin',
                      description: 'Label for form field: Type of birth',
                      id: 'form.field.label.birthTypeTwin'
                    }
                  },
                  {
                    value: 'TRIPLET',
                    label: {
                      defaultMessage: 'Triplet',
                      description: 'Label for form field: Type of birth',
                      id: 'form.field.label.birthTypeTriplet'
                    }
                  },
                  {
                    value: 'QUADRUPLET',
                    label: {
                      defaultMessage: 'Quadruplet',
                      description: 'Label for form field: Type of birth',
                      id: 'form.field.label.birthTypeQuadruplet'
                    }
                  },
                  {
                    value: 'HIGHER_MULTIPLE_DELIVERY',
                    label: {
                      defaultMessage: 'Higher multiple delivery',
                      description: 'Label for form field: Type of birth',
                      id: 'form.field.label.birthTypeHigherMultipleDelivery'
                    }
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
                label: {
                  defaultMessage: 'Order of birth (number)',
                  description: 'Label for form field: Order of birth',
                  id: 'form.field.label.multipleBirth'
                },
                customisable: false,
                required: true,
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
                name: 'weightAtBirth',
                type: 'NUMBER',
                step: 0.01,
                label: {
                  defaultMessage: 'Weight at birth',
                  description: 'Label for form field: Weight at birth',
                  id: 'form.field.label.weightAtBirth'
                },
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
                label: {
                  defaultMessage: 'Place of delivery',
                  description: 'Title for place of birth sub section',
                  id: 'form.field.label.placeOfBirthPreview'
                },
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
                label: {
                  defaultMessage: 'Location',
                  description: 'Label for form field: Place of delivery',
                  id: 'form.field.label.placeOfBirth'
                },
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: [
                  {
                    value: 'HEALTH_FACILITY',
                    label: {
                      defaultMessage: 'Health Institution',
                      description: 'Select item for Health Institution',
                      id: 'form.field.label.healthInstitution'
                    }
                  },
                  {
                    value: 'PRIVATE_HOME',
                    label: {
                      defaultMessage: 'Private Home',
                      description: 'Select item for Private Home',
                      id: 'form.field.label.privateHome'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other Institution',
                      description: 'Select item for Other Institution',
                      id: 'form.field.label.otherInstitution'
                    }
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
                label: {
                  defaultMessage: 'Health institution',
                  description: 'Label for form field: Health Institution',
                  id: 'form.field.label.healthInstitution'
                },
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
                label: {
                  defaultMessage: 'English name',
                  description: 'Label for child name in english',
                  id: 'form.preview.group.label.english.name'
                },
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
        title: {
          defaultMessage: "What are the informant's details?",
          description: 'Form section title for informants',
          id: 'form.section.informant.title'
        },
        hasDocumentSection: true,
        groups: [
          {
            id: 'informant-view-group',
            conditionals: [
              {
                action: 'hide',
                expression:
                  "(draftData && draftData.registration && draftData.registration.informantType && selectedInformantType && (selectedInformantType === 'MOTHER' || selectedInformantType === 'FATHER'))"
              }
            ],
            fields: [
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Nationality',
                  description: 'Label for form field: Nationality',
                  id: 'form.field.label.deceased.nationality'
                },
                required: false,
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
                label: {
                  defaultMessage: 'National ID',
                  description: 'Option for form field: Type of ID',
                  id: 'form.field.label.iDTypeNationalID'
                },
                required: true,
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
        id: BirthSection.Parent,
        hasDocumentSection: true,
        viewType: 'form',
        name: {
          defaultMessage: 'Parents details',
          description: 'Form section name or title for primary caregiver',
          id: 'form.section.primaryCaregiver.nameOrTitle'
        },
        title: {
          defaultMessage: 'Parents details',
          description: 'Form section name or title for primary caregiver',
          id: 'form.section.primaryCaregiver.nameOrTitle'
        },
        groups: [
          {
            id: 'parent-details-view-group',
            conditionals: [
              {
                action: 'hide',
                expression:
                  '(!draftData || !draftData.registration || !((draftData.informantType && (draftData.informantType === "LEGAL_GUARDIAN" || draftData.informantType === "OTHER")) || (draftData.registration.informantType && (draftData.registration.informantType === "LEGAL_GUARDIAN" || draftData.registration.informantType === "OTHER") )))'
              }
            ],
            fields: [
              {
                name: 'parentDetailsType',
                type: 'RADIO_GROUP',
                size: RadioSize.LARGE,
                label: {
                  defaultMessage:
                    "Do you have the mother and father's details?",
                  description:
                    'Question to ask the user if they have the parents details',
                  id: 'form.field.label.parentDetailsType'
                },
                initialValue: '',
                required: true,
                validate: [],
                options: [
                  {
                    value: 'MOTHER_AND_FATHER',
                    label: {
                      defaultMessage: 'Yes',
                      description:
                        'confirmation label for parents radio button',
                      id: 'buttons.yes'
                    }
                  },
                  {
                    value: 'MOTHER_ONLY',
                    label: {
                      defaultMessage: "Only the mother's",
                      description: 'deny label for mother radio button',
                      id: 'form.field.label.radio.mother'
                    }
                  },
                  {
                    value: 'FATHER_ONLY',
                    label: {
                      defaultMessage: "Only the father's",
                      description: 'deny label for father radio button',
                      id: 'form.field.label.radio.father'
                    }
                  },
                  {
                    value: 'NONE',
                    label: {
                      defaultMessage: 'No',
                      description: 'confirmation label for No radio button',
                      id: 'buttons.no'
                    }
                  }
                ]
              }
            ]
          },
          {
            id: 'parent-not-applying-view-group',
            conditionals: [
              {
                action: 'hide',
                expression:
                  '(!draftData || !draftData.registration || !((draftData.informantType && (draftData.informantType === "LEGAL_GUARDIAN" || draftData.informantType === "OTHER")) || (draftData.registration.informantType && (draftData.registration.informantType === "LEGAL_GUARDIAN" || draftData.registration.informantType === "OTHER") )))'
              }
            ],
            title: {
              defaultMessage: 'Why are the mother and father not applying?',
              description:
                'Form group name for reason parents are not applying',
              id: 'form.group.reasonNotApplying.parents'
            },
            fields: [
              {
                name: 'reasonMotherNotApplying',
                conditionals: [
                  {
                    action: 'disable',
                    expression:
                      '(draftData && draftData.primaryCaregiver && draftData.primaryCaregiver.motherIsDeceased && draftData.primaryCaregiver.motherIsDeceased.toString() === ["deceased"].toString())'
                  }
                ],
                type: 'TEXT',
                label: {
                  defaultMessage: 'Reason for mother',
                  description: 'Label for form field: reasonMotherNotApplying',
                  id: 'form.field.label.reasonMotherNotApplying'
                },
                validate: [],
                initialValue: '',
                ignoreBottomMargin: true,
                required: true,
                extraValue: 'MOTHER',
                previewGroup: 'reasonMotherNotApplying',
                mapping: {
                  mutation: {
                    operation: 'fieldToReasonsNotApplyingTransformer',
                    parameters: [
                      'reasonsNotApplying',
                      'reasonNotApplying',
                      'primaryCaregiverType'
                    ]
                  },
                  query: {
                    operation: 'reasonsNotApplyingToFieldValueTransformer',
                    parameters: [
                      'reasonsNotApplying',
                      'reasonNotApplying',
                      'primaryCaregiverType'
                    ]
                  }
                }
              },
              {
                name: 'motherIsDeceased',
                type: 'CHECKBOX_GROUP',
                label: {
                  defaultMessage: ' ',
                  description: 'Label for form field: motherIsDeceased',
                  id: 'print.certificate.noLabel'
                },
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '(draftData && draftData.registration && draftData.registration.contactPoint && draftData.registration.contactPoint.value && draftData.registration.contactPoint.value === "MOTHER")'
                  }
                ],
                initialValue: [],
                extraValue: 'MOTHER',
                required: false,
                previewGroup: 'reasonMotherNotApplying',
                options: [
                  {
                    value: 'deceased',
                    label: {
                      defaultMessage: 'Mother has died',
                      description: 'Label for form field: motherIsDeceased',
                      id: 'form.field.label.motherIsDeceased'
                    }
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToReasonsNotApplyingTransformer',
                    parameters: [
                      'reasonsNotApplying',
                      'isDeceased',
                      'primaryCaregiverType',
                      true
                    ]
                  },
                  query: {
                    operation: 'reasonsNotApplyingToFieldValueTransformer',
                    parameters: [
                      'reasonsNotApplying',
                      'isDeceased',
                      'primaryCaregiverType',
                      undefined,
                      ['deceased']
                    ]
                  }
                }
              },
              {
                name: 'reasonFatherNotApplying',
                conditionals: [
                  {
                    action: 'disable',
                    expression:
                      '(draftData && draftData.primaryCaregiver && draftData.primaryCaregiver.fatherIsDeceased && draftData.primaryCaregiver.fatherIsDeceased.toString() === ["deceased"].toString())'
                  }
                ],
                type: 'TEXT',
                label: {
                  defaultMessage: 'Reason for father',
                  description: 'Label for form field: reasonFatherNotApplying',
                  id: 'form.field.label.reasonFatherNotApplying'
                },
                validate: [],
                initialValue: '',
                ignoreBottomMargin: true,
                required: true,
                previewGroup: 'reasonFatherNotApplying',
                extraValue: 'FATHER',
                mapping: {
                  mutation: {
                    operation: 'fieldToReasonsNotApplyingTransformer',
                    parameters: [
                      'reasonsNotApplying',
                      'reasonNotApplying',
                      'primaryCaregiverType'
                    ]
                  },
                  query: {
                    operation: 'reasonsNotApplyingToFieldValueTransformer',
                    parameters: [
                      'reasonsNotApplying',
                      'reasonNotApplying',
                      'primaryCaregiverType'
                    ]
                  }
                }
              },
              {
                name: 'fatherIsDeceased',
                type: 'CHECKBOX_GROUP',
                label: {
                  defaultMessage: '',
                  description: 'Label for form field: fatherIsDeceased',
                  id: 'print.certificate.noLabel'
                },
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '(draftData && draftData.registration && draftData.registration.contactPoint && draftData.registration.contactPoint.value && draftData.registration.contactPoint.value === "FATHER")'
                  }
                ],
                initialValue: [],
                extraValue: 'FATHER',
                required: false,
                previewGroup: 'reasonFatherNotApplying',
                options: [
                  {
                    value: 'deceased',
                    label: {
                      defaultMessage: 'Father has died',
                      description: 'Label for form field: fatherIsDeceased',
                      id: 'form.field.label.fatherIsDeceased'
                    }
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToReasonsNotApplyingTransformer',
                    parameters: [
                      'reasonsNotApplying',
                      'isDeceased',
                      'primaryCaregiverType',
                      true
                    ]
                  },
                  query: {
                    operation: 'reasonsNotApplyingToFieldValueTransformer',
                    parameters: [
                      'reasonsNotApplying',
                      'isDeceased',
                      'primaryCaregiverType',
                      undefined,
                      ['deceased']
                    ]
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'reasonMotherNotApplying',
                label: {
                  defaultMessage: 'Reason for mother not applying',
                  description:
                    'Label for form field: reasonMotherNotApplyingPreview',
                  id: 'form.field.label.reasonMotherNotApplyingPreview'
                },
                fieldToRedirect: 'reasonMotherNotApplying'
              },
              {
                id: 'reasonFatherNotApplying',
                label: {
                  defaultMessage: 'Reason for father not applying',
                  description:
                    'Label for form field: reasonFatherNotApplyingPreview',
                  id: 'form.field.label.reasonFatherNotApplyingPreview'
                },
                fieldToRedirect: 'reasonFatherNotApplying'
              }
            ]
          },
          {
            id: 'caregiver-details-view-group',
            conditionals: [
              {
                action: 'hide',
                expression:
                  '(!draftData || !draftData.registration || !((draftData.informantType && (draftData.informantType === "LEGAL_GUARDIAN" || draftData.informantType === "OTHER")) || (draftData.registration.informantType && (draftData.registration.informantType === "LEGAL_GUARDIAN" || draftData.registration.informantType === "OTHER") )))'
              }
            ],
            fields: [
              {
                name: 'primaryCaregiverType',
                type: 'RADIO_GROUP_WITH_NESTED_FIELDS',
                size: RadioSize.LARGE,
                label: {
                  defaultMessage: 'Who is looking after the child?',
                  description: 'Question to ask the user about caregiver',
                  id: 'form.field.label.primaryCaregiverType'
                },
                initialValue: '',
                required: true,
                validate: [],
                options: [
                  {
                    value: 'MOTHER_AND_FATHER',
                    label: {
                      defaultMessage: 'Mother and father',
                      description: 'label for parents radio button',
                      id: 'form.field.label.caregiver.parents'
                    },
                    conditionals: [
                      {
                        action: 'hide',
                        expression:
                          '(draftData && draftData.primaryCaregiver && ((draftData.primaryCaregiver.motherIsDeceased && draftData.primaryCaregiver.motherIsDeceased.toString() === ["deceased"].toString()) || (draftData.primaryCaregiver.fatherIsDeceased && draftData.primaryCaregiver.fatherIsDeceased.toString() === ["deceased"].toString())))'
                      }
                    ]
                  },
                  {
                    value: 'MOTHER',
                    label: {
                      defaultMessage: 'Mother',
                      description: 'label for mother radio button',
                      id: 'form.field.label.caregiver.mother'
                    },
                    conditionals: [
                      {
                        action: 'hide',
                        expression:
                          '(draftData && draftData.primaryCaregiver && (draftData.primaryCaregiver.motherIsDeceased && draftData.primaryCaregiver.motherIsDeceased.toString() === ["deceased"].toString()))'
                      }
                    ]
                  },
                  {
                    value: 'FATHER',
                    label: {
                      defaultMessage: 'Father',
                      description: 'label for father radio button',
                      id: 'form.field.label.caregiver.father'
                    },
                    conditionals: [
                      {
                        action: 'hide',
                        expression:
                          '(draftData && draftData.primaryCaregiver &&  (draftData.primaryCaregiver.fatherIsDeceased && draftData.primaryCaregiver.fatherIsDeceased.toString() === ["deceased"].toString()))'
                      }
                    ]
                  },
                  {
                    value: 'LEGAL_GUARDIAN',
                    label: {
                      defaultMessage: 'Legal guardian',
                      description: 'label for Legal guardian radio button',
                      id: 'form.field.label.caregiver.legalGuardian'
                    },
                    conditionals: [
                      {
                        action: 'hide',
                        expression:
                          '(draftData && draftData.registration && draftData.registration.informant && draftData.registration.informant.value === "LEGAL_GUARDIAN")'
                      }
                    ]
                  },
                  {
                    value: 'INFORMANT',
                    label: {
                      defaultMessage: 'Informant is the primary caregiver',
                      description: 'label for informant radio button',
                      id: 'form.field.label.caregiver.informant'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other caregiver',
                      description: 'label for Other caregiver radio button',
                      id: 'form.field.label.caregiver.other'
                    }
                  }
                ],
                nestedFields: {
                  MOTHER_AND_FATHER: [],
                  MOTHER: [],
                  FATHER: [],
                  LEGAL_GUARDIAN: [
                    {
                      name: 'name',
                      type: 'TEXT',
                      label: {
                        id: 'form.field.label.name',
                        defaultMessage: 'Name',
                        description: 'field label for name'
                      },
                      initialValue: '',
                      validate: [],
                      required: true,
                      maxLength: 32,
                      mapping: {
                        mutation: {
                          operation: 'nestedRadioFieldTransformer',
                          parameters: [
                            {
                              operation: 'fieldValueNestingTransformer',
                              parameters: [
                                'primaryCaregiver',
                                {
                                  operation: 'fieldToNameTransformer',
                                  parameters: ['en', 'familyName']
                                },
                                'name'
                              ]
                            }
                          ]
                        },
                        query: {
                          operation: 'valueToNestedRadioFieldTransformer',
                          parameters: [
                            {
                              operation: 'nestedValueToFieldTransformer',
                              parameters: [
                                'primaryCaregiver',
                                {
                                  operation: 'nameToFieldTransformer',
                                  parameters: ['en', 'familyName']
                                }
                              ]
                            }
                          ]
                        }
                      }
                    },
                    {
                      name: 'phone',
                      type: 'TEL',
                      label: {
                        id: 'form.field.label.declaration.phone',
                        defaultMessage: 'Phone number',
                        description: 'field label for phone'
                      },
                      initialValue: '',
                      required: true,
                      validate: [
                        {
                          operation: 'phoneNumberFormat'
                        }
                      ],
                      mapping: {
                        mutation: {
                          operation: 'nestedRadioFieldTransformer',
                          parameters: [
                            {
                              operation: 'fieldValueNestingTransformer',
                              parameters: [
                                'primaryCaregiver',
                                {
                                  operation: 'fieldToPhoneNumberTransformer',
                                  parameters: []
                                },
                                'phone'
                              ]
                            }
                          ]
                        },
                        query: {
                          operation: 'valueToNestedRadioFieldTransformer',
                          parameters: [
                            {
                              operation: 'nestedValueToFieldTransformer',
                              parameters: [
                                'primaryCaregiver',
                                {
                                  operation: 'phoneNumberToFieldTransformer'
                                }
                              ]
                            }
                          ]
                        }
                      }
                    },
                    {
                      name: 'reasonNotApplying',
                      type: 'TEXT',
                      label: {
                        id: 'form.field.label.reasonNotApplying',
                        defaultMessage: 'Reason not applying',
                        description: 'field label for reasonNotApplying'
                      },
                      initialValue: '',
                      validate: [],
                      extraValue: 'LEGAL_GUARDIAN',
                      required: false,
                      mapping: {
                        mutation: {
                          operation: 'nestedRadioFieldTransformer',
                          parameters: [
                            {
                              operation: 'fieldToReasonsNotApplyingTransformer',
                              parameters: [
                                'reasonsNotApplying',
                                'reasonNotApplying',
                                'primaryCaregiverType'
                              ]
                            }
                          ]
                        },
                        query: {
                          operation: 'valueToNestedRadioFieldTransformer',
                          parameters: [
                            {
                              operation:
                                'reasonsNotApplyingToFieldValueTransformer',
                              parameters: [
                                'reasonsNotApplying',
                                'reasonNotApplying',
                                'primaryCaregiverType',
                                ['LEGAL_GUARDIAN']
                              ]
                            }
                          ]
                        }
                      }
                    }
                  ],
                  INFORMANT: [],
                  OTHER: [
                    {
                      name: 'name',
                      type: 'TEXT',
                      label: {
                        id: 'form.field.label.name',
                        defaultMessage: 'Name',
                        description: 'field label for name'
                      },
                      initialValue: '',
                      required: true,
                      maxLength: 32,
                      validate: [],
                      mapping: {
                        mutation: {
                          operation: 'nestedRadioFieldTransformer',
                          parameters: [
                            {
                              operation: 'fieldValueNestingTransformer',
                              parameters: [
                                'primaryCaregiver',
                                {
                                  operation: 'fieldToNameTransformer',
                                  parameters: ['en', 'familyName']
                                },
                                'name'
                              ]
                            }
                          ]
                        },
                        query: {
                          operation: 'valueToNestedRadioFieldTransformer',
                          parameters: [
                            {
                              operation: 'nestedValueToFieldTransformer',
                              parameters: [
                                'primaryCaregiver',
                                {
                                  operation: 'nameToFieldTransformer',
                                  parameters: ['en', 'familyName']
                                }
                              ]
                            }
                          ]
                        }
                      }
                    },
                    {
                      name: 'phone',
                      type: 'TEL',
                      label: {
                        id: 'form.field.label.declaration.phone',
                        defaultMessage: 'Phone number',
                        description: 'field label for phone'
                      },
                      initialValue: '',
                      required: true,
                      validate: [
                        {
                          operation: 'phoneNumberFormat'
                        }
                      ],
                      mapping: {
                        mutation: {
                          operation: 'nestedRadioFieldTransformer',
                          parameters: [
                            {
                              operation: 'fieldValueNestingTransformer',
                              parameters: [
                                'primaryCaregiver',
                                {
                                  operation: 'fieldToPhoneNumberTransformer',
                                  parameters: []
                                },
                                'phone'
                              ]
                            }
                          ]
                        },
                        query: {
                          operation: 'valueToNestedRadioFieldTransformer',
                          parameters: [
                            {
                              operation: 'nestedValueToFieldTransformer',
                              parameters: [
                                'primaryCaregiver',
                                {
                                  operation: 'phoneNumberToFieldTransformer'
                                }
                              ]
                            }
                          ]
                        }
                      }
                    },
                    {
                      name: 'reasonNotApplying',
                      type: 'TEXT',
                      label: {
                        id: 'form.field.label.reasonNotApplying',
                        defaultMessage: 'Reason not applying',
                        description: 'field label for reasonNotApplying'
                      },
                      initialValue: '',
                      validate: [],
                      required: false,
                      extraValue: 'OTHER',
                      mapping: {
                        mutation: {
                          operation: 'nestedRadioFieldTransformer',
                          parameters: [
                            {
                              operation: 'fieldToReasonsNotApplyingTransformer',
                              parameters: [
                                'reasonsNotApplying',
                                'reasonNotApplying',
                                'primaryCaregiverType'
                              ]
                            }
                          ]
                        },
                        query: {
                          operation: 'valueToNestedRadioFieldTransformer',
                          parameters: [
                            {
                              operation:
                                'reasonsNotApplyingToFieldValueTransformer',
                              parameters: [
                                'reasonsNotApplying',
                                'reasonNotApplying',
                                'primaryCaregiverType',
                                ['OTHER']
                              ]
                            }
                          ]
                        }
                      }
                    }
                  ]
                },
                mapping: {
                  mutation: {
                    operation: 'nestedRadioFieldTransformer',
                    parameters: [
                      {
                        operation: 'fieldToReasonsNotApplyingTransformer',
                        parameters: [
                          'reasonsNotApplying',
                          'primaryCaregiverType',
                          '',
                          false,
                          true
                        ]
                      }
                    ]
                  },
                  query: {
                    operation: 'valueToNestedRadioFieldTransformer',
                    parameters: [
                      {
                        operation: 'reasonsNotApplyingToFieldValueTransformer',
                        parameters: [
                          'reasonsNotApplying',
                          'primaryCaregiverType',
                          '',
                          [
                            'MOTHER_AND_FATHER',
                            'MOTHER',
                            'FATHER',
                            'INFORMANT',
                            'OTHER',
                            'LEGAL_GUARDIAN'
                          ]
                        ]
                      }
                    ]
                  }
                }
              }
            ]
          }
        ]
      },
      {
        id: BirthSection.Mother,
        viewType: 'form',
        name: {
          defaultMessage: 'Mother',
          description: 'Form section name for Mother',
          id: 'form.section.mother.name'
        },
        title: {
          defaultMessage: "Mother's details",
          description: 'Form section title for Mother',
          id: 'form.section.mother.title'
        },
        hasDocumentSection: true,
        groups: [
          {
            id: 'mother-view-group',
            conditionals: [
              {
                action: 'hide',
                expression:
                  '(draftData && draftData.primaryCaregiver && draftData.primaryCaregiver.parentDetailsType && (draftData.primaryCaregiver.parentDetailsType ===  "FATHER_ONLY" || draftData.primaryCaregiver.parentDetailsType ===  "NONE" ))'
              }
            ],
            fields: [
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Nationality',
                  description: 'Label for form field: Nationality',
                  id: 'form.field.label.deceased.nationality'
                },
                required: false,
                initialValue: window.config.COUNTRY.toUpperCase(),
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: {
                  resource: 'countries'
                },
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
                label: {
                  defaultMessage: 'National ID',
                  description: 'Option for form field: Type of ID',
                  id: 'form.field.label.iDTypeNationalID'
                },
                required: true,
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
                conditionals: [],
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
                name: 'socialSecurityNo',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Social Security No',
                  description: 'text for social security number form field',
                  id: 'form.field.label.socialSecurityNumber'
                },
                customisable: true,
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [],
                mapping: {
                  mutation: {
                    operation: 'fieldToIdentityTransformer',
                    parameters: ['id', 'SOCIAL_SECURITY_NO']
                  },
                  query: {
                    operation: 'identityToFieldTransformer',
                    parameters: ['id', 'SOCIAL_SECURITY_NO']
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
                required: false,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
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
                name: 'motherBirthDate',
                type: 'DATE',
                label: {
                  defaultMessage: 'Date of birth',
                  description: 'Label for form field: Date of birth',
                  id: 'form.field.label.motherDateOfBirth'
                },
                required: false,
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
                label: {
                  defaultMessage: 'Marital status',
                  description: 'Label for form field: Marital status',
                  id: 'form.field.label.maritalStatus'
                },
                customisable: true,
                required: false,
                initialValue: 'MARRIED',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                mapping: {
                  template: {
                    fieldName: 'motherMaritalStatus',
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
                conditionals: []
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
        ]
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
            conditionals: [
              {
                action: 'hide',
                expression:
                  '(draftData && draftData.primaryCaregiver && draftData.primaryCaregiver.parentDetailsType && (draftData.primaryCaregiver.parentDetailsType ===  "MOTHER_ONLY" || draftData.primaryCaregiver.parentDetailsType ===  "NONE" ))'
              }
            ],
            fields: [
              {
                name: 'fathersDetailsExist',
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
                    label: {
                      defaultMessage: 'Yes',
                      description:
                        'confirmation label for yes / no radio button',
                      id: 'form.field.label.confirm'
                    }
                  },
                  {
                    value: false,
                    label: {
                      defaultMessage: 'No',
                      description: 'deny label for yes / no radio button',
                      id: 'form.field.label.deny'
                    }
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '(draftData && draftData.registration && draftData.registration.whoseContactDetails === "FATHER")'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'sectionRemoveTransformer',
                    parameters: []
                  }
                }
              },
              {
                name: 'iD',
                type: 'TEXT',
                label: {
                  defaultMessage: 'National ID',
                  description: 'Option for form field: Type of ID',
                  id: 'form.field.label.iDTypeNationalID'
                },
                required: true,
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
                    expression: '!values.fathersDetailsExist'
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
                name: 'socialSecurityNo',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Social Security No',
                  description: 'text for social security number form field',
                  id: 'form.field.label.socialSecurityNumber'
                },
                customisable: true,
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.fathersDetailsExist'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToIdentityTransformer',
                    parameters: ['id', 'SOCIAL_SECURITY_NO']
                  },
                  query: {
                    operation: 'identityToFieldTransformer',
                    parameters: ['id', 'SOCIAL_SECURITY_NO']
                  }
                }
              },
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Nationality',
                  description: 'Label for form field: Nationality',
                  id: 'form.field.label.deceased.nationality'
                },
                required: false,
                initialValue: window.config.COUNTRY.toUpperCase(),
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: {
                  resource: 'countries'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.fathersDetailsExist'
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
                name: 'firstNamesEng',
                previewGroup: 'fatherNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First Name',
                  description: 'Label for form field: First names in english',
                  id: 'form.field.label.fatherFirstNamesEng'
                },
                maxLength: 32,
                required: false,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.fathersDetailsExist'
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
                    expression: '!values.fathersDetailsExist'
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
                    expression: '!values.fathersDetailsExist'
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
                    expression: '!values.fathersDetailsExist'
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
                initialValue: 'MARRIED',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.fathersDetailsExist'
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
                    expression: '!values.fathersDetailsExist'
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
                    expression: '!values.fathersDetailsExist'
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
        name: {
          defaultMessage: 'Documents',
          description: 'Form section name for Documents',
          id: 'form.section.documents.name'
        },
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
                label: {
                  defaultMessage:
                    'For birth registration of birth the following documents are required:',
                  description: 'Documents Paragraph text',
                  id: 'form.section.documents.birth.requirements'
                },
                initialValue: '',
                validate: []
              },
              {
                name: 'uploadDocForChildDOB',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: {
                  defaultMessage: 'Proof of Place and Date of Birth of Child',
                  description: 'Label for list item Child Birth Proof',
                  id: 'form.field.label.proofOfBirthPlaceAndDate'
                },
                initialValue: '',
                extraValue: 'CHILD',
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value: 'Original Birth Record',
                    label: {
                      defaultMessage: 'Original birth record',
                      description:
                        'Label for select option original Birth Record',
                      id: 'form.field.label.docTypeChildBirthProof'
                    }
                  },
                  {
                    value: 'Under Five Card',
                    label: {
                      defaultMessage: 'Under five card',
                      description: 'Label for select option Under five card',
                      id: 'form.field.label.docTypeChildUnderFiveCard'
                    }
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
                label: {
                  defaultMessage: "Proof of Mother's ID",
                  description: 'Label for list item Mother ID Proof',
                  id: 'form.field.label.proofOfMothersID'
                },
                initialValue: '',
                extraValue: 'MOTHER',
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value: 'National ID (front)',
                    label: {
                      defaultMessage: 'Front of national ID',
                      description:
                        'Label for select option front of national ID',
                      id: 'form.field.label.docTypeNIDFront'
                    }
                  },
                  {
                    value: 'National ID (back)',
                    label: {
                      defaultMessage: "Back of national ID'",
                      description:
                        "Label for select option back of national ID'",
                      id: 'form.field.label.docTypeNIDBack'
                    }
                  }
                ],
                conditionals: [
                  {
                    description:
                      'Hidden for Parent Details none or Mother only',
                    action: 'hide',
                    expression:
                      '(draftData && draftData.primaryCaregiver && draftData.primaryCaregiver.parentDetailsType === "NONE") || (draftData && draftData.primaryCaregiver && draftData.primaryCaregiver.parentDetailsType === "FATHER_ONLY")'
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
                label: {
                  defaultMessage: "Proof of Father's ID",
                  description: 'Label for list item Father ID Proof',
                  id: 'form.field.label.proofOfFathersID'
                },
                initialValue: '',
                extraValue: 'FATHER',
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value: 'National ID (front)',
                    label: {
                      defaultMessage: 'Front of national ID',
                      description:
                        'Label for select option front of national ID',
                      id: 'form.field.label.docTypeNIDFront'
                    }
                  },
                  {
                    value: 'National ID (back)',
                    label: {
                      defaultMessage: 'Back of national ID',
                      description:
                        "Label for select option back of national ID'",
                      id: 'form.field.label.docTypeNIDBack'
                    }
                  }
                ],
                conditionals: [
                  {
                    description:
                      'Hidden for Parent Details none or Father only',
                    action: 'hide',
                    expression:
                      '(draftData && draftData.primaryCaregiver && draftData.primaryCaregiver.parentDetailsType === "NONE") || (draftData && draftData.primaryCaregiver && draftData.primaryCaregiver.parentDetailsType === "MOTHER_ONLY") || (draftData && draftData.father && draftData.father.fathersDetailsExist === false)'
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
                label: {
                  defaultMessage: "Proof of informant's ID",
                  description:
                    'Option for radio group field: Type of Document To Upload',
                  id: 'form.field.label.informantIDProof'
                },
                initialValue: '',
                extraValue: 'INFORMANT_ID_PROOF',
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value: 'National ID (front)',
                    label: {
                      defaultMessage: 'National ID (Front)',
                      description:
                        'Label for select option radio option NID front',
                      id: 'form.field.label.docTypeNIDFront'
                    }
                  },
                  {
                    value: 'National ID (back)',
                    label: {
                      defaultMessage: 'National ID (Back)',
                      description:
                        'Label for select option radio option NID back',
                      id: 'form.field.label.docTypeNIDBack'
                    }
                  },
                  {
                    value: 'Birth Registration',
                    label: {
                      defaultMessage: 'Birth registration certificate',
                      description: 'Label for select option Birth Registration',
                      id: 'form.field.label.docTypeBR'
                    }
                  },
                  {
                    value: 'Passport',
                    label: {
                      defaultMessage: 'Passport',
                      description: 'Label for radio option Passport',
                      id: 'form.field.label.docTypePassport'
                    }
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      "(draftData && draftData.registration && draftData.registration.informantType && selectedInformantType && (selectedInformantType === 'MOTHER' || selectedInformantType === 'FATHER'))"
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
                name: 'uploadDocForProofOfLegarGuardian',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: {
                  defaultMessage: 'Proof of legal guardianship',
                  description:
                    'Option for radio group field: Type of Document To Upload',
                  id: 'form.field.label.legalGuardianProof'
                },
                initialValue: '',
                extraValue: 'LEGAL_GUARDIAN_PROOF',
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value: 'Proof of legal guardianship',
                    label: {
                      defaultMessage: 'Proof of legal guardianship',
                      description:
                        'Label for select option radio option NID front',
                      id: 'form.field.label.legalGuardianProof'
                    }
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      "(draftData && draftData.registration && draftData.registration.informantType && selectedInformantType && (selectedInformantType !== 'LEGAL_GUARDIAN'))"
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
                name: 'uploadDocForProofOfAssignedResponsibility',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: {
                  defaultMessage: 'Proof of assigned responsibility',
                  description:
                    'Option for radio group field: Type of Document To Upload',
                  id: 'form.field.label.assignedResponsibilityProof'
                },
                initialValue: '',
                extraValue: 'ASSIGNED_RESPONSIBILITY_PROOF',
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value: 'Proof of assigned responsibility',
                    label: {
                      defaultMessage: 'Proof of assigned responsibility',
                      description:
                        'Label for select option radio option NID front',
                      id: 'form.field.label.assignedResponsibilityProof'
                    }
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      "(draftData && draftData.registration && draftData.registration.informantType && selectedInformantType && (selectedInformantType === 'MOTHER' || selectedInformantType === 'FATHER'))"
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
                    }
                  ],
                  SON: [
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
                    }
                  ],
                  DAUGHTER: [
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
                    }
                  ],
                  SON_IN_LAW: [
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
                    }
                  ],
                  DAUGHTER_IN_LAW: [
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
                    }
                  ],
                  MOTHER: [
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
                    }
                  ],
                  FATHER: [
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
                    }
                  ],
                  GRANDSON: [
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
                    }
                  ],
                  GRANDDAUGHTER: [
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
                    }
                  ],
                  OTHER: [
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
        name: {
          defaultMessage: 'Deceased',
          description: 'Form section name for Deceased',
          id: 'form.section.deceased.name'
        },
        title: {
          defaultMessage: 'What are the deceased details?',
          description: 'Form section title for Deceased',
          id: 'form.section.deceased.title'
        },
        hasDocumentSection: true,
        groups: [
          {
            id: 'deceased-view-group',
            fields: [
              {
                name: 'iD',
                type: 'TEXT',
                label: {
                  defaultMessage: 'National ID',
                  description: 'Option for form field: Type of ID',
                  id: 'form.field.label.iDTypeNationalID'
                },
                required: true,
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
                name: 'socialSecurityNo',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Social security no./NAPSA',
                  description: 'text for social security number form field',
                  id: 'form.field.label.socialSecurityNumber'
                },
                required: true,
                initialValue: '',
                validate: [],
                conditionals: [],
                mapping: {
                  mutation: {
                    operation: 'fieldToIdentityTransformer',
                    parameters: ['id', 'SOCIAL_SECURITY_NO']
                  },
                  query: {
                    operation: 'identityToFieldTransformer',
                    parameters: ['id', 'SOCIAL_SECURITY_NO']
                  }
                }
              },
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Nationality',
                  description: 'Label for form field: Nationality',
                  id: 'form.field.label.deceased.nationality'
                },
                required: false,
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
                name: 'firstNamesEng',
                previewGroup: 'deceasedNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First name(s)',
                  description: 'Label for form field: Given names',
                  id: 'form.field.label.deceasedGivenNamesEng'
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
                label: {
                  defaultMessage: 'Last name',
                  description: 'Label for form field: Last name in english',
                  id: 'form.field.label.deceasedFamilyNameEng'
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
                name: 'birthDate',
                type: 'DATE',
                label: {
                  defaultMessage: 'Date of Birth',
                  description: 'Label for form field: Date of birth',
                  id: 'form.field.label.deceasedDateOfBirth'
                },
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
                name: 'gender',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Sex',
                  description: 'Label for form field: Sex name',
                  id: 'form.field.label.deceasedSex'
                },
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
                    label: {
                      defaultMessage: 'Male',
                      description: 'Option for form field: Sex name',
                      id: 'form.field.label.deceasedSexMale'
                    }
                  },
                  {
                    value: 'female',
                    label: {
                      defaultMessage: 'Female',
                      description: 'Option for form field: Sex name',
                      id: 'form.field.label.deceasedSexFemale'
                    }
                  },
                  {
                    value: 'other',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Option for form field: Sex name',
                      id: 'form.field.label.deceasedSexOther'
                    }
                  },
                  {
                    value: 'unknown',
                    label: {
                      defaultMessage: 'Unknown',
                      description: 'Option for form field: Sex name',
                      id: 'form.field.label.deceasedSexUnknown'
                    }
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
                label: {
                  defaultMessage: 'Marital status',
                  description: 'Label for form field: Marital status',
                  id: 'form.field.label.maritalStatus'
                },
                required: false,
                initialValue: 'MARRIED',
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
                name: 'occupation',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Occupation',
                  description: 'text for occupation form field',
                  id: 'form.field.label.occupation'
                },
                required: false,
                initialValue: '',
                validate: [],
                conditionals: []
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
                label: {
                  defaultMessage: 'English name',
                  description: 'Label for deceased name in english',
                  id: 'form.preview.group.label.english.name'
                },
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
        name: {
          defaultMessage: 'When did the death occur?',
          description: 'Form section name for Death Event',
          id: 'form.section.deathEvent.name'
        },
        title: {
          defaultMessage: 'When did the death occur?',
          description: 'Form section title for Death Event',
          id: 'form.section.deathEvent.title'
        },
        groups: [
          {
            id: 'death-event-details',
            fields: [
              {
                name: 'deathDate',
                type: 'DATE',
                label: {
                  defaultMessage: 'When did the death occur?',
                  description: 'Form section title for Death Event',
                  id: 'form.section.deathEvent.title'
                },
                notice: {
                  defaultMessage:
                    'Enter the date as: day, month, year e.g. 24 10 2020',
                  description: 'Label for form field: Date of occurrence',
                  id: 'form.field.label.deathDate'
                },
                ignorePlaceHolder: true,
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
                type: 'RADIO_GROUP',
                label: {
                  defaultMessage: 'What was the manner of death?',
                  description: 'Label for form field: Manner of death',
                  id: 'form.field.label.mannerOfDeath'
                },
                required: false,
                initialValue: '',
                validate: [],
                size: RadioSize.LARGE,
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: [
                  {
                    value: 'NATURAL_CAUSES',
                    label: {
                      defaultMessage: 'Natural causes',
                      description: 'Option for form field: Manner of death',
                      id: 'form.field.label.mannerOfDeathNatural'
                    }
                  },
                  {
                    value: 'ACCIDENT',
                    label: {
                      defaultMessage: 'Accident',
                      description: 'Option for form field: Manner of death',
                      id: 'form.field.label.mannerOfDeathAccident'
                    }
                  },
                  {
                    value: 'SUICIDE',
                    label: {
                      defaultMessage: 'Suicide',
                      description: 'Option for form field: Manner of death',
                      id: 'form.field.label.mannerOfDeathSuicide'
                    }
                  },
                  {
                    value: 'HOMICIDE',
                    label: {
                      defaultMessage: 'Homicide',
                      description: 'Option for form field: Manner of death',
                      id: 'form.field.label.mannerOfDeathHomicide'
                    }
                  },
                  {
                    value: 'MANNER_UNDETERMINED',
                    label: {
                      defaultMessage: 'Manner undetermined',
                      description: 'Option for form field: Manner of death',
                      id: 'form.field.label.mannerOfDeathUndetermined'
                    }
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
                name: 'placeOfDeath',
                customisable: false,
                type: 'SELECT_WITH_OPTIONS',
                previewGroup: 'placeOfDeath',
                ignoreFieldLabelOnErrorMessage: true,
                label: {
                  defaultMessage: 'Location',
                  description: 'Label for form field: Place of delivery',
                  id: 'form.field.label.placeOfDeath'
                },
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                options: [
                  {
                    value: 'HEALTH_FACILITY',
                    label: {
                      defaultMessage: 'Health Institution',
                      description: 'Select item for Health Institution',
                      id: 'form.field.label.healthInstitution'
                    }
                  },
                  {
                    value: 'PRIVATE_HOME',
                    label: {
                      defaultMessage: 'Private Home',
                      description: 'Select item for Private Home',
                      id: 'form.field.label.privateHome'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other Institution',
                      description: 'Select item for Other Institution',
                      id: 'form.field.label.otherInstitution'
                    }
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
        id: DeathSection.CauseOfDeath,
        viewType: 'form',
        name: {
          defaultMessage: 'What is the official cause of death?',
          description: 'Form section name for Cause of Death',
          id: 'form.section.causeOfDeath.name'
        },
        title: {
          defaultMessage: 'What is the official cause of death?',
          description: 'Form section title for Cause of Death',
          id: 'form.section.causeOfDeath.title'
        },
        groups: [
          {
            id: 'causeOfDeath-causeOfDeathEstablished',
            fields: [
              {
                name: 'causeOfDeathEstablished',
                type: 'RADIO_GROUP',
                label: {
                  defaultMessage:
                    'Has an official cause of death been established ?',
                  description:
                    'Label for form field: Cause of Death Established',
                  id: 'form.field.label.causeOfDeathEstablished'
                },
                notice: {
                  defaultMessage:
                    'A Medically Certified Cause of Death is not mandatory to submit the declaration. This can be added at a later date.',
                  description: 'Form section notice for Cause of Death',
                  id: 'form.section.causeOfDeathNotice'
                },
                required: false,
                initialValue: '',
                size: RadioSize.LARGE,
                validate: [],
                options: [
                  {
                    value: true,
                    label: {
                      defaultMessage: 'Yes',
                      description:
                        'confirmation label for yes / no radio button',
                      id: 'form.field.label.confirm'
                    }
                  },
                  {
                    value: false,
                    label: {
                      defaultMessage: 'No',
                      description: 'deny label for yes / no radio button',
                      id: 'form.field.label.deny'
                    }
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'ignoreFieldTransformer'
                  },
                  query: {
                    operation: 'hasCaseOfDeathSectionTransformer'
                  }
                }
              }
            ]
          },
          {
            id: 'causeOfDeath-methodOfCauseOfDeathSection',
            title: {
              defaultMessage: 'What is the medically certified cause of death?',
              description: 'Form section title for Cause of Death',
              id: 'form.section.causeOfDeath.title'
            },
            conditionals: [
              {
                action: 'hide',
                expression: '!values.causeOfDeathEstablished'
              }
            ],
            fields: [
              {
                name: 'paragraph',
                type: 'PARAGRAPH',
                hidden: true,
                label: {
                  defaultMessage: ' ',
                  description: 'No Label',
                  id: 'print.certificate.noLabel'
                },
                initialValue: '',
                validate: []
              },
              {
                name: 'causeOfDeathCode',
                type: 'TEXT',
                initialValue: '',
                label: {
                  defaultMessage: 'Underlying cause of death',
                  description:
                    'Label for form field: Underlying cause of death',
                  id: 'form.field.label.causeOfDeathCode'
                },
                required: false,
                validate: [],
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
            ]
          }
        ]
      },
      {
        id: DeathSection.Informants,
        viewType: 'form',
        name: {
          defaultMessage: 'Informant',
          description: 'Form section name for Informant',
          id: 'form.section.informant.name'
        },
        title: {
          defaultMessage: "What are the informant's details?",
          description: 'Form section title for informants',
          id: 'form.section.informant.title'
        },
        hasDocumentSection: true,
        groups: [
          {
            id: 'informant-view-group',
            fields: [
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Nationality',
                  description: 'Label for form field: Nationality',
                  id: 'form.field.label.deceased.nationality'
                },
                required: false,
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
                label: {
                  defaultMessage: 'National ID',
                  description: 'Option for form field: Type of ID',
                  id: 'form.field.label.iDTypeNationalID'
                },
                required: true,
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
              },
              {
                name: 'relationship',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Relationship to Deceased',
                  description: 'Label for Relationship to Deceased select',
                  id: 'form.field.label.informantsRelationWithDeceased'
                },
                required: true,
                initialValue: '',
                validate: [],
                placeholder: formMessageDescriptors.formSelectPlaceholder,
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '(draftData && draftData.registration && draftData.registration.relationship && draftData.registration.relationship.value === "OFFICER_IN_CHARGE")'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData && draftData.registration && draftData.registration.relationship && draftData.registration.relationship.value === "DRIVER_OF_THE_VEHICLE")'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData && draftData.registration && draftData.registration.relationship && draftData.registration.relationship.value === "OWNER_OF_THE_HOUSE")'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData && draftData.registration && draftData.registration.relationship && draftData.registration.relationship.value === "HEAD_OF_THE_INSTITUTE")'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData && draftData.registration && draftData.registration.relationship && draftData.registration.relationship.value === "OTHER")'
                  }
                ],
                readonly: true,
                hidden: true,
                options: [
                  {
                    value: 'FATHER',
                    label: {
                      defaultMessage: 'Father',
                      description: 'Label for option Father',
                      id: 'form.field.label.informantRelation.father'
                    }
                  },
                  {
                    value: 'MOTHER',
                    label: {
                      defaultMessage: 'Mother',
                      description: 'Label for option Mother',
                      id: 'form.field.label.informantRelation.mother'
                    }
                  },
                  {
                    value: 'SPOUSE',
                    label: {
                      defaultMessage: 'Spouse',
                      description: 'Label for option Spouse',
                      id: 'form.field.label.informantRelation.spouse'
                    }
                  },
                  {
                    value: 'SON',
                    label: {
                      defaultMessage: 'Son',
                      description: 'Label for option Son',
                      id: 'form.field.label.informantRelation.son'
                    }
                  },
                  {
                    value: 'DAUGHTER',
                    label: {
                      defaultMessage: 'Daughter',
                      description: 'Label for option Daughter',
                      id: 'form.field.label.informantRelation.daughter'
                    }
                  },
                  {
                    value: 'SON_IN_LAW',
                    label: {
                      defaultMessage: 'Son in law',
                      description: 'Label for option Son in law',
                      id: 'form.field.label.informantRelation.sonInLaw'
                    }
                  },
                  {
                    value: 'DAUGHTER_IN_LAW',
                    label: {
                      defaultMessage: 'Daughter in law',
                      description: 'Label for option Daughter in law',
                      id: 'form.field.label.informantRelation.daughterInLaw'
                    }
                  },
                  {
                    value: 'DAUGHTER',
                    label: {
                      defaultMessage: 'Daughter',
                      description: 'Label for option Daughter',
                      id: 'form.field.label.informantRelation.daughter'
                    }
                  },
                  {
                    value: 'GRANDSON',
                    label: {
                      defaultMessage: 'Grandson',
                      description: 'Label for option Grandson',
                      id: 'form.field.label.informantRelation.grandson'
                    }
                  },
                  {
                    value: 'GRANDDAUGHTER',
                    label: {
                      defaultMessage: 'Granddaughter',
                      description: 'Label for option Granddaughter',
                      id: 'form.field.label.informantRelation.granddaughter'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other (Specify)',
                      description: 'Label for option Other',
                      id: 'form.field.label.informantRelation.other'
                    }
                  }
                ],
                reviewOverrides: {
                  residingSection: 'informant',
                  reference: {
                    sectionID: 'registration',
                    groupID: 'point-of-contact',
                    fieldName: 'contactPoint'
                  },
                  position: REVIEW_OVERRIDE_POSITION.BEFORE,
                  labelAs: {
                    defaultMessage: 'Who is the informant?',
                    description: 'Form section title for contact point',
                    id: 'register.selectInformant.relation'
                  },
                  conditionals: [
                    {
                      action: 'hide',
                      expression:
                        '(!draftData || !draftData.informant || draftData.informant.relationship === "OTHER")'
                    }
                  ]
                },
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
        id: DeathSection.Father,
        viewType: 'form',
        name: {
          defaultMessage: "What is the deceased's father name?",
          description: 'Form section name for father section',
          id: 'form.section.deceased.father.name'
        },
        title: {
          defaultMessage: "Father's details",
          description: 'Form section name for father section',
          id: 'form.section.deceased.father.title'
        },
        groups: [
          {
            id: 'father-view-group',
            conditionals: [
              {
                action: 'hide',
                expression:
                  '(draftData && draftData.informant && draftData.informant.relationship === "FATHER")'
              }
            ],
            fields: [
              {
                name: 'fatherFirstNamesEng',
                previewGroup: 'fatherNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First Name(s) in English',
                  description: 'Label for form field: Given names in english',
                  id: 'form.field.label.deceasedFathersGivenNamesEng'
                },
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
                name: 'fatherFamilyNameEng',
                previewGroup: 'fatherNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Last Name(s) in English',
                  description: 'Label for form field: Family name in english',
                  id: 'form.field.label.deceasedFathersFamilyNameEng'
                },
                required: true,
                initialValue: '',
                maxLength: 32,
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
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
              }
            ],
            previewGroups: [
              {
                id: 'fatherNameInEnglish',
                label: {
                  defaultMessage: "Father's English name",
                  description: "Group label for father's name in english",
                  id: 'form.preview.group.label.father.english.name'
                },
                fieldToRedirect: 'fatherFamilyNameEng',
                delimiter: ' '
              }
            ]
          }
        ]
      },
      {
        id: DeathSection.Mother,
        viewType: 'form',
        name: {
          defaultMessage: "What is the deceased's mother name?",
          description: 'Form section name for mother section',
          id: 'form.section.deceased.mother.name'
        },
        title: {
          defaultMessage: "Mother's details",
          description: 'Form section name for mother section',
          id: 'form.section.deceased.mother.title'
        },
        groups: [
          {
            id: 'mother-view-group',
            conditionals: [
              {
                action: 'hide',
                expression:
                  '(draftData && draftData.informant && draftData.informant.relationship === "MOTHER")'
              }
            ],
            fields: [
              {
                name: 'motherFirstNamesEng',
                previewGroup: 'motherNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First Name(s) in English',
                  description: 'Label for form field: Given names in english',
                  id: 'form.field.label.deceasedMothersGivenNamesEng'
                },
                required: false,
                maxLength: 32,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
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
                name: 'motherFamilyNameEng',
                previewGroup: 'motherNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Last Name(s) in English',
                  description: 'Label for form field: Family name in english',
                  id: 'form.field.label.deceasedMothersFamilyNameEng'
                },
                required: true,
                maxLength: 32,
                initialValue: '',
                validate: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
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
                fieldToRedirect: 'motherFamilyNameEng',
                delimiter: ' '
              }
            ]
          }
        ]
      },
      {
        id: DeathSection.Spouse,
        viewType: 'form',
        name: {
          defaultMessage: "Spouse's details",
          description: 'Form section title for spouse section',
          id: 'form.section.deceased.spouse.title'
        },
        title: {
          defaultMessage: "Spouse's details",
          description: 'Form section title for spouse section',
          id: 'form.section.deceased.spouse.title'
        },
        groups: [
          {
            id: 'spouse-view-group',
            conditionals: [
              {
                action: 'hide',
                expression:
                  '(draftData && draftData.informant && draftData.informant.relationship === "SPOUSE")'
              }
            ],
            fields: [
              {
                name: 'hasDetails',
                type: 'RADIO_GROUP_WITH_NESTED_FIELDS',
                label: {
                  defaultMessage: 'Does the deceased have a spouse?',
                  description: 'Form section title for spouse section',
                  id: 'form.section.deceased.spouse.name'
                },
                hideHeader: true,
                size: RadioSize.LARGE,
                required: true,
                initialValue: '',
                validate: [],
                options: [
                  {
                    value: 'Yes',
                    label: {
                      defaultMessage: 'Yes',
                      description: 'Option for form field: Deceased has spouse',
                      id: 'form.section.deceased.hasSpouse'
                    }
                  },
                  {
                    value: 'No',
                    label: {
                      defaultMessage: 'No / Unknown',
                      description:
                        "Option for form field: Deceased doesn't have spouse",
                      id: 'form.section.deceased.noSpouse'
                    }
                  }
                ],
                nestedFields: {
                  Yes: [
                    {
                      name: 'spouseFirstNamesEng',
                      previewGroup: 'spouseNameInEnglish',
                      type: 'TEXT',
                      label: {
                        defaultMessage: 'First Name(s) in English',
                        description:
                          'Label for form field: Given names in english',
                        id: 'form.field.label.deceasedSpousesGivenNamesEng'
                      },
                      maxLength: 32,
                      required: false,
                      initialValue: '',
                      extraValue: 'Yes',
                      validate: [
                        {
                          operation: 'englishOnlyNameFormat'
                        }
                      ],
                      mapping: {
                        mutation: {
                          operation: 'nestedRadioFieldTransformer',
                          parameters: [
                            {
                              operation: 'fieldToNameTransformer',
                              parameters: ['en', 'firstNames']
                            }
                          ]
                        },
                        query: {
                          operation: 'valueToNestedRadioFieldTransformer',
                          parameters: [
                            {
                              operation: 'nameToFieldTransformer',
                              parameters: ['en', 'firstNames']
                            }
                          ]
                        }
                      }
                    },
                    {
                      name: 'spouseFamilyNameEng',
                      previewGroup: 'spouseNameInEnglish',
                      type: 'TEXT',
                      label: {
                        defaultMessage: 'Last Name(s) in English',
                        description:
                          'Label for form field: Family name in english',
                        id: 'form.field.label.deceasedSpousesFamilyNameEng'
                      },
                      maxLength: 32,
                      required: true,
                      initialValue: '',
                      extraValue: 'Yes',
                      validate: [
                        {
                          operation: 'englishOnlyNameFormat'
                        }
                      ],
                      mapping: {
                        mutation: {
                          operation: 'nestedRadioFieldTransformer',
                          parameters: [
                            {
                              operation: 'fieldToNameTransformer',
                              parameters: ['en', 'familyName']
                            }
                          ]
                        },
                        query: {
                          operation: 'valueToNestedRadioFieldTransformer',
                          parameters: [
                            {
                              operation: 'nameToFieldTransformer',
                              parameters: ['en', 'familyName']
                            }
                          ]
                        }
                      }
                    }
                  ],
                  No: []
                },
                ignoreNestedFieldWrappingInPreview: true,
                conditionals: [],
                mapping: {
                  mutation: {
                    operation: 'ignoreFieldTransformer'
                  },
                  query: {
                    operation: 'hasSpouseDetailsTransformer'
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'spouseNameInEnglish',
                label: {
                  defaultMessage: "Spouse's English name",
                  description: "Group label for spouse's name in english",
                  id: 'form.preview.group.label.spouse.english.name'
                },
                fieldToRedirect: 'spouseFamilyNameEng',
                delimiter: ' '
              }
            ]
          }
        ]
      },
      {
        id: DeathSection.DeathDocuments,
        viewType: 'form',
        name: {
          defaultMessage: 'Documents',
          description: 'Form section name for Documents',
          id: 'form.section.documents.name'
        },
        title: {
          defaultMessage: 'Attach supporting documents',
          description: 'Form section title for Documents',
          id: 'form.section.documents.title'
        },
        groups: [
          {
            id: 'documents-view-group',
            fields: [
              {
                name: 'paragraph',
                type: 'PARAGRAPH',
                label: {
                  defaultMessage:
                    'For a death registration the following documents are required:',
                  description: 'Documents Paragraph text',
                  id: 'form.field.label.deceasedDocumentParagraph'
                },
                initialValue: '',
                validate: []
              },
              {
                name: 'uploadDocForDeceased',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: {
                  defaultMessage: "Proof of deceased's ID",
                  description:
                    'Option for radio group field: Type of Document To Upload',
                  id: 'form.field.label.deceasedIDProof'
                },
                initialValue: '',
                extraValue: 'DECEASED_ID_PROOF',
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value: 'National ID (front)',
                    label: {
                      defaultMessage: 'National ID (Front)',
                      description:
                        'Label for select option radio option NID front',
                      id: 'form.field.label.docTypeNIDFront'
                    }
                  },
                  {
                    value: 'National ID (back)',
                    label: {
                      defaultMessage: 'National ID (Back)',
                      description:
                        'Label for select option radio option NID back',
                      id: 'form.field.label.docTypeNIDBack'
                    }
                  },
                  {
                    value: 'Birth Registration',
                    label: {
                      defaultMessage: 'Birth registration certificate',
                      description: 'Label for select option Birth Registration',
                      id: 'form.field.label.docTypeBR'
                    }
                  },
                  {
                    value: 'Passport',
                    label: {
                      defaultMessage: 'Passport',
                      description: 'Label for radio option Passport',
                      id: 'form.field.label.docTypePassport'
                    }
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
                label: {
                  defaultMessage: 'Informant ID',
                  description:
                    'Option for radio group field: Type of Document To Upload',
                  id: 'form.field.label.informantIDProof'
                },
                initialValue: '',
                extraValue: 'INFORMANT_ID_PROOF',
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value: 'National ID (front)',
                    label: {
                      defaultMessage: 'Front of national ID',
                      description:
                        'Label for select option radio option NID front',
                      id: 'form.field.label.docTypeNIDFront'
                    }
                  },
                  {
                    value: 'National ID (back)',
                    label: {
                      defaultMessage: 'Back of national ID',
                      description:
                        'Label for select option radio option NID back',
                      id: 'form.field.label.docTypeNIDBack'
                    }
                  },
                  {
                    value: 'Birth Registration',
                    label: {
                      defaultMessage: 'Birth registration certificate',
                      description: 'Label for select option Birth Registration',
                      id: 'form.field.label.docTypeBR'
                    }
                  },
                  {
                    value: 'Passport',
                    label: {
                      defaultMessage: 'Passport',
                      description: 'Label for radio option Passport',
                      id: 'form.field.label.docTypePassport'
                    }
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
                label: {
                  defaultMessage: 'Proof of death of deceased',
                  description:
                    'Option for radio group field: Type of Document To Upload',
                  id: 'form.field.label.deceasedDeathProof'
                },
                initialValue: '',
                extraValue: 'DECEASED_DEATH_PROOF',
                hideAsterisk: true,
                validate: [],
                options: [
                  {
                    value: 'Police Brought In Dead Certificate',
                    label: {
                      defaultMessage: 'Police brought in dead certificate',
                      description:
                        'Label for select option Police brought in dead certificate',
                      id: 'form.field.label.docTypePoliceBroughtInDeathCertificate'
                    }
                  },
                  {
                    value: 'Certified Post Mortem Report',
                    label: {
                      defaultMessage: 'Certified post mortem report',
                      description: 'Label for select option Post Mortem Report',
                      id: 'form.field.label.docTypePostMortemReport'
                    }
                  },
                  {
                    value: 'Hospital Discharge Certificate',
                    label: {
                      defaultMessage: 'Hospital discharge certificate',
                      description:
                        'Label for select option Hospital Discharge Certificate',
                      id: 'form.field.label.docHospDischCert'
                    }
                  },
                  {
                    value: 'Attested Letter of Death',
                    label: {
                      defaultMessage: 'Attested letter of death',
                      description:
                        'Label for select option Attested Letter of Death',
                      id: 'form.field.label.docTypeLetterOfDeath'
                    }
                  },
                  {
                    value: 'Attested Certificate of Death',
                    label: {
                      defaultMessage: 'Attested certificate of death',
                      description:
                        'Label for select option Attested Certificate of Death',
                      id: 'form.field.label.docTypeDeathCertificate'
                    }
                  },
                  {
                    value: 'Certified Copy of Burial Receipt',
                    label: {
                      defaultMessage: 'Certified copy of burial receipt',
                      description:
                        'Label for select option Certified Copy of Burial Receipt',
                      id: 'form.field.label.docTypeCopyOfBurialReceipt'
                    }
                  },
                  {
                    value: 'Certified Copy of Funeral Receipt',
                    label: {
                      defaultMessage: 'Certified copy of funeral receipt',
                      description:
                        'Label for select option Certified Copy of Funeral Receipt',
                      id: 'form.field.label.docTypeFuneralReceipt'
                    }
                  },
                  {
                    value: 'Coroners Report',
                    label: {
                      defaultMessage: "Coroner's report",
                      description: "Label for select option Coroner's report",
                      id: 'form.field.label.docTypeCoronersReport'
                    }
                  },
                  {
                    value: 'Other',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Label for radio option Other',
                      id: 'form.field.label.docTypeOther'
                    }
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
