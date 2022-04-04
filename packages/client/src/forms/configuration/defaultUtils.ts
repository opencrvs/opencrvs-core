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

import {
  BirthSection,
  DeathSection,
  ISerializedForm,
  IQuestionConfig,
  SerializedFormField,
  Event,
  REVIEW_OVERRIDE_POSITION,
  ISerializedFormSection
} from '@client/forms/index'
import { cloneDeep } from 'lodash'
import { getGroup, getQuestionsIdentifiersFromFieldId, getSection } from '.'
import { RadioSize } from '@opencrvs/components/lib/forms'
import { messages as informantMessageDescriptors } from '@client/i18n/messages/views/selectInformant'
import { formMessages } from '@client/i18n/messages'

// THIS FILE CONTAINS FUNCTIONS TO CONFIGURE THE DEFAULT CONFIGURATION

export interface IDefaultField {
  index: number
  selectedSectionIndex: number
  selectedGroupIndex: number
  field: SerializedFormField
}

export interface IDefaultFieldCustomisation {
  question: IQuestionConfig
  defaultField: IDefaultField
}

export function getDefaultField(
  form: ISerializedForm,
  fieldId: string
): IDefaultField | undefined {
  const questionIdentifiers = getQuestionsIdentifiersFromFieldId(fieldId)
  const selectedSection = getSection(
    form.sections,
    questionIdentifiers.sectionId
  )
  const selectedGroup = getGroup(
    selectedSection.section.groups,
    questionIdentifiers.groupId
  )
  const selectedField = selectedGroup.group.fields.filter(
    (field) => field.name === questionIdentifiers.fieldName
  )[0]
  if (!selectedField) {
    return undefined
  }
  return {
    index: selectedGroup.group.fields.indexOf(selectedField),
    field: selectedField,
    selectedGroupIndex: selectedGroup.index,
    selectedSectionIndex: selectedSection.index
  }
}

export function configureDefaultQuestions(
  defaultFieldCustomisations: IDefaultFieldCustomisation[],
  defaultEventForm: ISerializedForm
): ISerializedForm {
  const newForm = cloneDeep(defaultEventForm)
  defaultFieldCustomisations.forEach((defaultFieldCustomisation) => {
    // this is a customisation to a default field
    // default fields can only be enabled or disabled at present
    if (defaultFieldCustomisation.question.enabled === 'DISABLED') {
      newForm.sections[
        defaultFieldCustomisation.defaultField.selectedSectionIndex
      ].groups[
        defaultFieldCustomisation.defaultField.selectedGroupIndex
      ].fields.splice(defaultFieldCustomisation.defaultField.index, 1)
    }
  })
  return newForm
}

export const getInformantSection = (event: string): ISerializedFormSection => {
  if (event === Event.BIRTH) {
    return {
      id: BirthSection.Registration,
      viewType: 'form',
      name: formMessages.registrationName,
      title: formMessages.registrationTitle,
      groups: [
        {
          id: 'who-is-applying-view-group',
          title: informantMessageDescriptors.birthInformantTitle,
          conditionals: [],
          preventContinueIfError: true,
          showExitButtonOnly: true,
          previewGroups: [
            {
              id: 'contactPointGroup',
              label: {
                defaultMessage: 'Main Contact',
                description: 'Label for point of contact on the review page',
                id: 'form.field.label.declaration.mainContact'
              },
              required: false,
              initialValue: '',
              fieldToRedirect: 'contactPoint'
            }
          ],
          fields: [
            {
              name: 'informantType',
              type: 'RADIO_GROUP_WITH_NESTED_FIELDS',
              label: informantMessageDescriptors.birthInformantTitle,
              hideHeader: true,
              required: true,
              readonly: true,
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
                  label: formMessages.someoneElse
                }
              ],
              placeholder: {
                defaultMessage: 'Select',
                description: 'Placeholder text for a select',
                id: 'form.field.select.placeholder'
              },
              reviewOverrides: {
                residingSection: 'registration',
                reference: {
                  sectionID: 'registration',
                  groupID: 'contact-view-group',
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
                      '(!draftData || !draftData.registration || draftData.registration.informantType === "OTHER")'
                  }
                ]
              },
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
                    name: 'otherRelationShip',
                    type: 'TEXT',
                    label: {
                      defaultMessage: 'Relationship to child',
                      id: 'form.field.label.applicantsRelationWithChild',
                      description: 'Label for input Relationship to child'
                    },
                    placeholder: {
                      defaultMessage: 'eg. Grandmother',
                      description: 'Placeholder for example of relationship',
                      id: 'form.field.label.relationshipPlaceHolder'
                    },
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
                        parameters: ['informant.otherRelationship']
                      },
                      query: {
                        operation: 'changeHirerchyQueryTransformer',
                        parameters: ['informant.otherRelationship']
                      }
                    }
                  }
                ]
              },
              mapping: {
                mutation: {
                  operation: 'nestedRadioFieldToBundleFieldTransformer',
                  parameters: ['informant.informantType']
                },
                query: {
                  operation: 'bundleFieldToNestedRadioFieldTransformer',
                  parameters: ['informant.informantType']
                }
              }
            },
            {
              name: 'contactPoint',
              type: 'RADIO_GROUP_WITH_NESTED_FIELDS',
              label: {
                defaultMessage: ' ',
                description: 'Form section title for contact point',
                id: 'register.SelectContactPoint.heading'
              },
              conditionals: [],
              previewGroup: 'contactPointGroup',
              required: true,
              hideHeader: true,
              initialValue: '',
              validate: [],
              size: RadioSize.LARGE,
              placeholder: {
                defaultMessage: 'Select',
                description: 'Placeholder text for a select',
                id: 'form.field.select.placeholder'
              },
              options: [
                {
                  value: 'MOTHER',
                  label: {
                    defaultMessage: 'Mother',
                    description: 'Label for "Mother" radio option',
                    id: 'form.field.label.app.whoContDet.mother'
                  }
                },
                {
                  value: 'FATHER',
                  label: {
                    defaultMessage: 'Father',
                    description: 'Label for "Father" radio option',
                    id: 'form.field.label.app.whoContDet.father'
                  }
                },
                {
                  value: 'GRANDFATHER',
                  label: {
                    defaultMessage: 'Grandfather',
                    description: 'Label for "Grandfather" radio option',
                    id: 'form.field.label.app.whoContDet.grandFather'
                  }
                },
                {
                  value: 'GRANDMOTHER',
                  label: {
                    defaultMessage: 'Grandmother',
                    description: 'Label for "Grandmother" radio option',
                    id: 'form.field.label.app.whoContDet.grandMother'
                  }
                },
                {
                  value: 'BROTHER',
                  label: {
                    defaultMessage: 'Brother',
                    description: 'Label for "Broher" radio option',
                    id: 'form.field.label.app.whoContDet.brother'
                  }
                },
                {
                  value: 'SISTER',
                  label: {
                    defaultMessage: 'Sister',
                    description: 'Label for "Sister" radio option',
                    id: 'form.field.label.app.whoContDet.sister'
                  }
                },
                {
                  value: 'LEGALGUARDIAN',
                  label: {
                    defaultMessage: 'Legal Guardian',
                    description: 'Label for "Legal Guardian" radio option',
                    id: 'form.field.label.app.whoContDet.legalGuardian'
                  }
                },
                {
                  value: 'OTHER',
                  label: {
                    defaultMessage: 'Someone else',
                    description: 'Label for "Someone else" radio option',
                    id: 'form.field.label.someoneElse'
                  }
                }
              ],
              nestedFields: {
                MOTHER: [
                  {
                    name: 'registrationPhone',
                    type: 'TEL',
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
                LEGALGUARDIAN: [
                  {
                    name: 'registrationPhone',
                    type: 'TEL',
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
        mutation: {
          operation: 'setBirthRegistrationSectionTransformer'
        },
        query: {
          operation: 'getBirthRegistrationSectionTransformer'
        }
      }
    }
  } else {
    return {
      id: DeathSection.Registration,
      viewType: 'form',
      name: {
        defaultMessage: 'Registration',
        description: 'Form section name for Registration',
        id: 'form.section.declaration.name'
      },
      title: {
        defaultMessage: 'Declaration Details',
        description: 'Form section title for Registration',
        id: 'form.section.declaration.title'
      },
      groups: [
        {
          id: 'other-relationship-with-deceased',
          title: {
            defaultMessage:
              "What is the informant's relationship to the deceased?",
            description: 'Form section title for primary informant',
            id: 'register.selInf.deathInfSomeoneElse'
          },
          conditionals: [
            {
              action: 'hide',
              expression:
                '(!draftData || !draftData.informant || !["OTHER", "OFFICER_IN_CHARGE", "DRIVER_OF_THE_VEHICLE", "OWNER_OF_THE_HOUSE", "HEAD_OF_THE_INSTITUTE"].includes(draftData.informant.relationship))'
            }
          ],
          showExitButtonOnly: true,
          preventContinueIfError: true,
          fields: [
            {
              name: 'relationship',
              type: 'RADIO_GROUP_WITH_NESTED_FIELDS',
              label: {
                defaultMessage:
                  "What is the informant's relationship to the deceased?",
                description: 'Form section title for primary informant',
                id: 'register.selInf.deathInfSomeoneElse'
              },
              hideHeader: true,
              size: RadioSize.LARGE,
              required: true,
              initialValue: '',
              validate: [],
              options: [
                {
                  value: 'HEAD_OF_THE_INSTITUTE',
                  label: {
                    defaultMessage:
                      'Head of the institution where the death occurred',
                    description: 'Option for form field: Head of the institute',
                    id: 'form.field.label.informantRelation.headInst'
                  }
                },
                {
                  value: 'OWNER_OF_THE_HOUSE',
                  label: {
                    defaultMessage:
                      'Owner of the house or building where the death occurred',
                    description: 'Option for form field: Owner of the house',
                    id: 'form.field.label.informantRelation.owner'
                  }
                },
                {
                  value: 'DRIVER_OF_THE_VEHICLE',
                  label: {
                    defaultMessage:
                      'Driver or operator of the land or water vehicle or aircraft where the death occurred',
                    description: 'Option for form field: Driver of the vehicle',
                    id: 'form.field.label.informantRelation.driver'
                  }
                },
                {
                  value: 'OFFICER_IN_CHARGE',
                  label: {
                    defaultMessage:
                      'Officer-in-charge of the Thana of a road or public space where the death occurred',
                    description: 'Option for form field: Officer-in-charge',
                    id: 'form.field.label.informantRelation.officer'
                  }
                },
                {
                  value: 'OTHER',
                  label: {
                    defaultMessage: 'Someone else',
                    description: 'Option for form field: Someone else',
                    id: 'form.field.label.relationSomeoneElse'
                  }
                }
              ],
              nestedFields: {
                OTHER: [
                  {
                    name: 'otherRelationship',
                    type: 'TEXT',
                    label: {
                      defaultMessage: 'Relationship to deceased',
                      id: 'register.selectInformant.relationshipLabel',
                      description: 'Label for input Relationship to deceased'
                    },
                    placeholder: {
                      defaultMessage: 'eg. Grandmother',
                      description: 'Placeholder for example of relationship',
                      id: 'form.field.label.relationshipPlaceHolder'
                    },
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
                        parameters: ['informant.otherRelationship']
                      },
                      query: {
                        operation: 'changeHirerchyQueryTransformer',
                        parameters: ['informant.otherRelationship']
                      }
                    }
                  }
                ],
                OFFICER_IN_CHARGE: [],
                DRIVER_OF_THE_VEHICLE: [],
                OWNER_OF_THE_HOUSE: [],
                HEAD_OF_THE_INSTITUTE: []
              },
              conditionals: [],
              mapping: {
                mutation: {
                  operation: 'nestedRadioFieldToBundleFieldTransformer',
                  parameters: ['informant.relationship']
                },
                query: {
                  operation: 'bundleFieldToNestedRadioFieldTransformer',
                  parameters: ['informant.relationship']
                }
              }
            }
          ]
        },
        {
          id: 'point-of-contact',
          title: {
            defaultMessage:
              'Who is the main point of contact for this declaration?',
            description: 'Form section title for contact point',
            id: 'register.SelectContactPoint.heading'
          },
          preventContinueIfError: true,
          showExitButtonOnly: true,
          conditionals: [],
          fields: [
            {
              name: 'contactPoint',
              type: 'RADIO_GROUP_WITH_NESTED_FIELDS',
              label: {
                defaultMessage:
                  'Who is the main point of contact for this declaration?',
                description: 'Form section title for contact point',
                id: 'register.SelectContactPoint.heading'
              },
              conditionals: [],
              hideHeader: true,
              required: true,
              initialValue: '',
              validate: [],
              size: RadioSize.LARGE,
              placeholder: {
                defaultMessage: 'Select',
                description: 'Placeholder text for a select',
                id: 'form.field.select.placeholder'
              },
              options: [
                {
                  value: 'SPOUSE',
                  label: {
                    defaultMessage: 'Spouse',
                    description: 'Label for "Spouse" radio option',
                    id: 'form.field.label.spouse'
                  }
                },
                {
                  value: 'SON',
                  label: {
                    defaultMessage: 'Son',
                    description: 'Label for "Son" radio option',
                    id: 'form.field.label.son'
                  }
                },
                {
                  value: 'DAUGHTER',
                  label: {
                    defaultMessage: 'Daughter',
                    description: 'Label for "Daughter" radio option',
                    id: 'form.field.label.daughter'
                  }
                },
                {
                  value: 'SON_IN_LAW',
                  label: {
                    defaultMessage: 'Son in law',
                    description: 'Label for "Son in law" radio option',
                    id: 'form.field.label.sonInLaw'
                  }
                },
                {
                  value: 'DAUGHTER_IN_LAW',
                  label: {
                    defaultMessage: 'Daughter in law',
                    description: 'Label for "Daughter in law" radio option',
                    id: 'form.field.label.daughterInLaw'
                  }
                },
                {
                  value: 'FATHER',
                  label: {
                    defaultMessage: 'Father',
                    description: 'Label for "Father" radio option',
                    id: 'form.field.label.father'
                  }
                },
                {
                  value: 'MOTHER',
                  label: {
                    defaultMessage: 'Mother',
                    description: 'Label for "Mother" radio option',
                    id: 'form.field.label.mother'
                  }
                },
                {
                  value: 'GRANDSON',
                  label: {
                    defaultMessage: 'Grandson',
                    description: 'Label for "Grandson" radio option',
                    id: 'form.field.label.grandSon'
                  }
                },
                {
                  value: 'GRANDDAUGHTER',
                  label: {
                    defaultMessage: 'Granddaughter',
                    description: 'Label for "Granddaughter" radio option',
                    id: 'form.field.label.grandDaughter'
                  }
                },
                {
                  value: 'OTHER',
                  label: {
                    defaultMessage: 'Someone else',
                    description: 'Label for "Someone else" radio option',
                    id: 'form.field.label.someoneElse'
                  }
                }
              ],
              nestedFields: {
                SPOUSE: [
                  {
                    name: 'registrationPhone',
                    type: 'TEL',
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
                    label: {
                      defaultMessage: 'Phone number',
                      description: 'Input label for phone input',
                      id: 'form.field.label.phoneNumber'
                    },
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
        mutation: {
          operation: 'setDeathRegistrationSectionTransformer'
        },
        query: {
          operation: 'getDeathRegistrationSectionTransformer'
        }
      }
    }
  }
}
