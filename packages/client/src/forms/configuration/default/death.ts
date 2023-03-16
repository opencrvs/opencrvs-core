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
import { ISerializedForm, DeathSection, TEXTAREA } from '@client/forms/index'
import { formMessageDescriptors } from '@client/i18n/messages'
import { messages as informantMessageDescriptors } from '@client/i18n/messages/views/selectInformant'
import {
  deathDocumentForWhomFhirMapping,
  deathDocumentTypeFhirMapping
} from '@client/forms/register/fieldMappings/death/mutation/documents-mappings'

export const deathRegisterForms: ISerializedForm = {
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
                    placeholder: formMessageDescriptors.relationshipPlaceHolder,
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
              label: formMessageDescriptors.dateOfBirth,
              required: true,
              initialValue: '',
              conditionals: [
                {
                  action: 'disable',
                  expression: 'values.exactDateOfBirthUnknown'
                }
              ],
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
              validate: [],
              conditionals: [
                {
                  action: 'hide',
                  expression: '!window.config.DATE_OF_BIRTH_UNKNOWN'
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
              label: formMessageDescriptors.ageOfDeceased,
              required: true,
              initialValue: '',
              validate: [
                {
                  operation: 'range',
                  parameters: [1, 120]
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
              inputFieldWidth: '78px'
            },
            {
              name: 'firstNamesEng',
              previewGroup: 'deceasedNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.firstName,
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
              label: formMessageDescriptors.familyName,
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
              label: formMessageDescriptors.sex,
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
              name: 'mannerOfDeath',
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
                },
                template: {
                  fieldName: 'mannerOfDeath',
                  operation: 'selectTransformer'
                }
              }
            },
            {
              name: 'causeOfDeathEstablished',
              type: 'CHECKBOX',
              label: formMessageDescriptors.causeOfDeathEstablished,
              required: true,
              checkedValue: 'true',
              uncheckedValue: 'false',
              customisable: true,
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
                },
                template: {
                  fieldName: 'causeOfDeathEstablished',
                  operation: 'plainInputTransformer'
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
                },
                template: {
                  fieldName: 'causeOfDeathMethod',
                  operation: 'selectTransformer'
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
                    'values.causeOfDeathEstablished !== "true" || values.causeOfDeathMethod !== "LAY_REPORTED" && values.causeOfDeathMethod !== "VERBAL_AUTOPSY"'
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
                },
                template: {
                  fieldName: 'deathDescription',
                  operation: 'plainInputTransformer'
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
              searchableResource: ['facilities'],
              searchableType: ['HEALTH_FACILITY'],
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
                  parameters: ['facilities', 'placeOfDeath']
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
              conditionals: [
                {
                  action: 'disable',
                  expression: 'values.exactDateOfBirthUnknown'
                }
              ],
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
              validate: [],
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
              validate: [
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
              label: formMessageDescriptors.firstName,
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
              extraValue: deathDocumentForWhomFhirMapping.DECEASED_DEATH_PROOF,
              hideAsterisk: true,
              validate: [],
              options: [
                {
                  value: deathDocumentTypeFhirMapping.ATTESTED_LETTER_OF_DEATH,
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
                  label: formMessageDescriptors.docTypeHospitalDeathCertificate
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
