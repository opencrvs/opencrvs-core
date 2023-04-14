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

import { RadioSize } from '@opencrvs/components/lib/Radio'
import { BirthSection, ISerializedForm } from '@client/forms/index'
import { formMessageDescriptors } from '@client/i18n/messages'
import { messages as informantMessageDescriptors } from '@client/i18n/messages/views/selectInformant'
import {
  birthDocumentForWhomFhirMapping,
  birthDocumentTypeFhirMapping
} from '@client/forms/register/fieldMappings/birth/mutation/documents-mappings'

export const birthRegisterForms: ISerializedForm = {
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
              validator: [],
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
                    placeholder: formMessageDescriptors.relationshipPlaceHolder,
                    required: true,
                    initialValue: '',
                    validator: [
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
              validator: [],
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
                    validator: [
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
                    validator: [
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
                    validator: [
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
                    validator: [
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
                    validator: [
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
                    validator: [
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
                OTHER_FAMILY_MEMBER: [
                  {
                    name: 'registrationPhone',
                    type: 'TEL',
                    label: formMessageDescriptors.phoneNumber,
                    required: true,
                    initialValue: '',
                    validator: [
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
                    validator: [
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
                    validator: [
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
            fieldName: 'qrCode',
            operation: 'QRCodeTransformerTransformer'
          },
          {
            fieldName: 'mosipAid',
            operation: 'mosipAidTransformer'
          },
          {
            fieldName: 'mosipAIDLabel',
            operation: 'mosipAidLabelTransformer'
          },
          {
            fieldName: 'certificateDate',
            operation: 'certificateDateTransformer',
            parameters: ['en', 'dd MMMM yyyy']
          },
          {
            fieldName: 'registrar',
            operation: 'userTransformer',
            parameters: ['REGISTERED']
          },
          {
            fieldName: 'registrationAgent',
            operation: 'userTransformer',
            parameters: ['VALIDATED']
          },
          // backward compatibility
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
            fieldName: 'registrationDate',
            operation: 'registrationDateTransformer',
            parameters: ['en', 'dd MMMM yyyy']
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
              label: formMessageDescriptors.dateOfBirth,
              required: true,
              initialValue: '',
              validator: [
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
              label: formMessageDescriptors.firstName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              mapping: {
                template: {
                  fieldName: 'childFirstName',
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
              label: formMessageDescriptors.familyName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              mapping: {
                template: {
                  fieldName: 'childFamilyName',
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
              label: formMessageDescriptors.sex,
              required: true,
              initialValue: '',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              mapping: {
                template: {
                  fieldName: 'childGender',
                  operation: 'selectTransformer'
                }
              },
              options: [
                {
                  value: 'male',
                  label: formMessageDescriptors.sexMale
                },
                {
                  value: 'female',
                  label: formMessageDescriptors.sexFemale
                },
                {
                  value: 'unknown',
                  label: formMessageDescriptors.sexUnknown
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
              validator: [],
              conditionals: []
            },
            {
              name: 'attendantAtBirth',
              customisable: true,
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.attendantAtBirth,
              required: false,
              initialValue: '',
              validator: [],
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
                },
                template: {
                  fieldName: 'attendantAtBirth',
                  operation: 'selectTransformer'
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
              validator: [],
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
                  label: formMessageDescriptors.birthTypeHigherMultipleDelivery
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
                },
                template: {
                  fieldName: 'birthType',
                  operation: 'selectTransformer'
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
              validator: [
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
                },
                template: {
                  fieldName: 'weightAtBirth',
                  operation: 'plainInputTransformer'
                }
              },
              inputFieldWidth: '78px'
            },
            {
              name: 'placeOfBirthTitle',
              type: 'SUBSECTION',
              label: formMessageDescriptors.placeOfBirthPreview,
              previewGroup: 'placeOfBirth',
              ignoreBottomMargin: true,
              initialValue: '',
              validator: []
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
              validator: [],
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
              searchableResource: ['facilities'],
              searchableType: ['HEALTH_FACILITY'],
              dynamicOptions: {
                resource: 'facilities'
              },
              validator: [
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
                  parameters: ['facilities', 'placeOfBirth']
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
              initialValue:
                typeof window !== 'undefined'
                  ? (window as any).config.COUNTRY.toUpperCase()
                  : 'FAR',
              validator: [],
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
                },
                template: {
                  fieldName: 'informantNationality',
                  operation: 'nationalityTransformer'
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
              validator: [
                {
                  operation: 'validIDNumber',
                  parameters: ['NATIONAL_ID']
                },
                {
                  operation: 'duplicateIDNumber',
                  parameters: ['deceased.iD']
                },
                {
                  operation: 'duplicateIDNumber',
                  parameters: ['mother.iD']
                },
                {
                  operation: 'duplicateIDNumber',
                  parameters: ['father.iD']
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
                },
                template: {
                  fieldName: 'informantNID',
                  operation: 'identityToFieldTransformer',
                  parameters: ['id', 'NATIONAL_ID', 'individual']
                }
              }
            },
            {
              name: 'informantBirthDate',
              type: 'DATE',
              label: formMessageDescriptors.dateOfBirth,
              required: true,
              customisable: true,
              initialValue: '',
              validator: [
                {
                  operation: 'dateFormatIsCorrect',
                  parameters: []
                },
                {
                  operation: 'dateInPast',
                  parameters: []
                }
              ],
              conditionals: [
                {
                  action: 'disable',
                  expression: 'values.exactDateOfBirthUnknown'
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
                },
                template: {
                  operation: 'dateFormatTransformer',
                  fieldName: 'informantBirthDate',
                  parameters: ['birthDate', 'en', 'do MMMM yyyy', 'individual']
                }
              }
            },
            {
              name: 'exactDateOfBirthUnknown',
              type: 'CHECKBOX',
              label: {
                defaultMessage: 'Exact date of birth unknown',
                description: 'Checkbox for exact date of birth unknown',
                id: 'form.field.label.exactDateOfBirthUnknown'
              },
              hideInPreview: true,
              required: false,
              hideHeader: true,
              initialValue: false,
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression: '!window.config.DATE_OF_BIRTH_UNKNOWN'
                }
              ],
              mapping: {
                mutation: {
                  operation: 'ignoreFieldTransformer'
                },
                query: {
                  operation: 'nestedValueToFieldTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'booleanTransformer'
                    }
                  ]
                }
              }
            },
            {
              name: 'ageOfIndividualInYears',
              type: 'NUMBER',
              label: formMessageDescriptors.ageOfInformant,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'range',
                  parameters: [12, 120]
                },
                {
                  operation: 'maxLength',
                  parameters: [3]
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression: '!values.exactDateOfBirthUnknown'
                }
              ],
              postfix: 'years',
              inputFieldWidth: '78px',
              mapping: {
                mutation: {
                  operation: 'fieldValueNestingTransformer',
                  parameters: ['individual']
                },
                query: {
                  operation: 'nestedValueToFieldTransformer',
                  parameters: ['individual']
                }
              }
            },
            {
              name: 'firstNamesEng',
              previewGroup: 'informantNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.firstNames,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
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
                },
                template: {
                  fieldName: 'informantFirstName',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'firstNames', 'informant', 'individual']
                }
              }
            },
            {
              name: 'familyNameEng',
              previewGroup: 'informantNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.familyName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
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
                },
                template: {
                  fieldName: 'informantFamilyName',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'familyName', 'informant', 'individual']
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
              type: 'CHECKBOX',
              label: formMessageDescriptors.mothersDetailsExist,
              required: true,
              checkedValue: false,
              uncheckedValue: true,
              hideHeader: true,
              initialValue: true,
              validator: [],
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
              label: formMessageDescriptors.reasonNA,
              validator: [],
              initialValue: '',
              customisable: true,
              required: true,
              mapping: {
                template: {
                  fieldName: 'motherReasonNotApplying',
                  operation: 'plainInputTransformer'
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
              validator: [],
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
                  operation: 'nationalityTransformer'
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
              validator: [
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
              label: formMessageDescriptors.dateOfBirth,
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                },
                {
                  action: 'disable',
                  expression: 'values.exactDateOfBirthUnknown'
                }
              ],
              required: true,
              initialValue: '',
              validator: [
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
              name: 'exactDateOfBirthUnknown',
              type: 'CHECKBOX',
              label: {
                defaultMessage: 'Exact date of birth unknown',
                description: 'Checkbox for exact date of birth unknown',
                id: 'form.field.label.exactDateOfBirthUnknown'
              },
              required: false,
              hideInPreview: true,
              hideHeader: true,
              initialValue: false,
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!window.config.DATE_OF_BIRTH_UNKNOWN || (!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant)'
                }
              ],
              mapping: {
                query: {
                  operation: 'booleanTransformer'
                },
                mutation: {
                  operation: 'ignoreFieldTransformer'
                }
              }
            },
            {
              name: 'ageOfIndividualInYears',
              type: 'NUMBER',
              label: formMessageDescriptors.ageOfMother,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'range',
                  parameters: [12, 120]
                },
                {
                  operation: 'maxLength',
                  parameters: [3]
                },
                {
                  operation: 'isValidParentsBirthDate',
                  parameters: [5, true]
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.exactDateOfBirthUnknown || (!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant)'
                }
              ],
              postfix: 'years',
              inputFieldWidth: '78px'
            },
            {
              name: 'firstNamesEng',
              previewGroup: 'motherNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.firstName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
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
              label: formMessageDescriptors.familyName,
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
              validator: [
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
              ignoreBottomMargin: true,
              validator: [],
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
              validator: [],
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
                id: 'form.field.label.multipleBirth'
              },
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                }
              ],
              customisable: true,
              required: false,
              initialValue: '',
              validator: [
                {
                  operation: 'greaterThanZero'
                },
                {
                  operation: 'maxLength',
                  parameters: [2]
                }
              ],
              mapping: {
                template: {
                  fieldName: 'multipleBirth',
                  operation: 'plainInputTransformer'
                }
              }
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
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                }
              ],
              mapping: {
                template: {
                  fieldName: 'motherOccupation',
                  operation: 'plainInputTransformer'
                }
              }
            },
            {
              name: 'educationalAttainment',
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.educationAttainment,
              required: false,
              customisable: true,
              initialValue: '',
              validator: [],
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
              ],
              mapping: {
                template: {
                  fieldName: 'motherEducationalAttainment',
                  operation: 'selectTransformer'
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
              type: 'CHECKBOX',
              label: formMessageDescriptors.fathersDetailsExist,
              required: true,
              checkedValue: false,
              uncheckedValue: true,
              hideHeader: true,
              initialValue: true,
              validator: [],
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
              label: formMessageDescriptors.reasonNA,
              customisable: true,
              validator: [],
              initialValue: '',
              required: true,
              mapping: {
                template: {
                  fieldName: 'fatherReasonNotApplying',
                  operation: 'plainInputTransformer'
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
              validator: [],
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
                  operation: 'nationalityTransformer'
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
              validator: [
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
              label: formMessageDescriptors.dateOfBirth,
              required: true,
              initialValue: '',
              validator: [
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
                },
                {
                  action: 'disable',
                  expression: 'values.exactDateOfBirthUnknown'
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
              name: 'exactDateOfBirthUnknown',
              type: 'CHECKBOX',
              label: {
                defaultMessage: 'Exact date of birth unknown',
                description: 'Checkbox for exact date of birth unknown',
                id: 'form.field.label.exactDateOfBirthUnknown'
              },
              required: false,
              hideInPreview: true,
              hideHeader: true,
              initialValue: false,
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!window.config.DATE_OF_BIRTH_UNKNOWN || (!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant)'
                }
              ],
              mapping: {
                query: {
                  operation: 'booleanTransformer'
                },
                mutation: {
                  operation: 'ignoreFieldTransformer'
                }
              }
            },
            {
              name: 'ageOfIndividualInYears',
              type: 'NUMBER',
              label: formMessageDescriptors.ageOfFather,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'range',
                  parameters: [12, 120]
                },
                {
                  operation: 'maxLength',
                  parameters: [3]
                },
                {
                  operation: 'isValidParentsBirthDate',
                  parameters: [10, true]
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.exactDateOfBirthUnknown || (!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant)'
                }
              ],
              postfix: 'years',
              inputFieldWidth: '78px'
            },
            {
              name: 'firstNamesEng',
              previewGroup: 'fatherNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.firstName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
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
              label: formMessageDescriptors.familyName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
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
              ignoreBottomMargin: true,
              validator: [],
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
              validator: [],
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
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                }
              ],
              mapping: {
                template: {
                  fieldName: 'fatheroccupation',
                  operation: 'plainInputTransformer'
                }
              }
            },
            {
              name: 'educationalAttainment',
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.educationAttainment,
              customisable: true,
              required: false,
              initialValue: '',
              validator: [],
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
              ],
              mapping: {
                template: {
                  fieldName: 'fatherEducationalAttainment',
                  operation: 'selectTransformer'
                }
              }
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
          fields: [
            {
              name: 'paragraph',
              type: 'PARAGRAPH',
              label: formMessageDescriptors.documentsParagraph,
              initialValue: '',
              validator: []
            },
            {
              name: 'uploadDocForChildDOB',
              type: 'DOCUMENT_UPLOADER_WITH_OPTION',
              label: formMessageDescriptors.proofOfBirth,
              initialValue: '',
              extraValue: birthDocumentForWhomFhirMapping.CHILD,
              hideAsterisk: true,
              validator: [],
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
              validator: [],
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
                  description: 'Hidden for Parent Details none or Mother only',
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
              validator: [],
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
                  description: 'Hidden for Parent Details none or Father only',
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
              validator: [],
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
              extraValue: birthDocumentForWhomFhirMapping.LEGAL_GUARDIAN_PROOF,
              hideAsterisk: true,
              validator: [],
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
}
