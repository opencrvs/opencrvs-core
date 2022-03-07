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
import { IForm } from '@client/forms/index'

/*interface IRegisterForms {
  birth: IForm
  death: IForm
}*/

export const registerForms = {
  birth: {
    sections: [
      {
        id: 'registration',
        viewType: 'form',
        name: {
          defaultMessage: 'Registration',
          description: 'Form section name for Registration',
          id: 'form.section.application.name'
        },
        title: {
          defaultMessage: 'Declaration Details',
          description: 'Form section title for Registration',
          id: 'form.section.application.title'
        },
        groups: [
          {
            id: 'informant-relation',
            title: {
              defaultMessage: 'Who is the informant?',
              description: 'Form section title for contact point',
              id: 'register.selectInformant.relation'
            },
            conditionals: [
              {
                action: 'hide',
                expression:
                  '(!draftData || !draftData.registration || draftData.registration.presentAtBirthRegistration !== "OTHER" || draftData.registration.presentAtBirthRegistration === "BOTH_PARENTS" )'
              }
            ],
            preventContinueIfError: true,
            showExitButtonOnly: true,
            fields: [
              {
                name: 'informant',
                type: 'RADIO_GROUP_WITH_NESTED_FIELDS',
                label: {
                  defaultMessage: 'Who is the informant?',
                  description: 'Form section title for contact point',
                  id: 'register.selectInformant.relation'
                },
                required: true,
                readonly: true,
                hideHeader: true,
                initialValue: '',
                validate: [],
                size: 'large',
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: [
                  {
                    value: 'GRANDFATHER',
                    label: {
                      defaultMessage: 'Grandfather',
                      description: 'Option for form field: Grandfather',
                      id: 'form.field.label.relationGrandfather'
                    }
                  },
                  {
                    value: 'GRANDMOTHER',
                    label: {
                      defaultMessage: 'Grandmother',
                      description: 'Option for form field: Grandmother',
                      id: 'form.field.label.relationGrandmother'
                    }
                  },
                  {
                    value: 'BROTHER',
                    label: {
                      defaultMessage: 'Brother',
                      description: 'Option for form field: Brother',
                      id: 'form.field.label.relationBrother'
                    }
                  },
                  {
                    value: 'SISTER',
                    label: {
                      defaultMessage: 'Sister',
                      description: 'Option for form field: Sister',
                      id: 'form.field.label.relationSister'
                    }
                  },
                  {
                    value: 'OTHER_FAMILY_MEMBER',
                    label: {
                      defaultMessage: 'Other family member',
                      description: 'Option for form field: Other family member',
                      id: 'form.field.label.relationOtherFamilyMember'
                    }
                  },
                  {
                    value: 'LEGAL_GUARDIAN',
                    label: {
                      defaultMessage: 'Legal guardian',
                      description: 'Option for form field: Legal guardian',
                      id: 'register.selectinformant.legalGuardian'
                    }
                  },
                  {
                    value: 'INSTITUTION_HEAD_PLACE_OF_BIRTH',
                    label: {
                      defaultMessage:
                        'Head of the institution where the birth occurred',
                      description:
                        'Option for form field: Head of the institution where the birth occurred',
                      id: 'form.field.label.relInstHeadPlaceOfBirth'
                    }
                  },
                  {
                    value: 'HOUSE_OWNER',
                    label: {
                      defaultMessage:
                        'Owner of the house or building where the birth occurred',
                      description:
                        'Option for form field: Owner of the house or building where the birth occurred',
                      id: 'form.field.label.relationHouseOwner'
                    }
                  },
                  {
                    value: 'OPERATOR',
                    label: {
                      defaultMessage:
                        'Driver or operator of the land or water vehicle or aircraft where the birth occurred',
                      description:
                        'Option for form field: Driver or operator of the land or water vehicle or aircraft where the birth occurred',
                      id: 'form.field.label.relationOperator'
                    }
                  },
                  {
                    value: 'OFFICE_IN_CHARGE',
                    label: {
                      defaultMessage:
                        'Officer-in-charge of the Thana of a road or public space where the birth occurred',
                      description:
                        'Option for form field: Officer-in-charge of the Thana of a road or public space where the birth occurred',
                      id: 'form.field.label.relationOfficeInCharge'
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
                  GRANDFATHER: [],
                  GRANDMOTHER: [],
                  BROTHER: [],
                  SISTER: [],
                  OTHER_FAMILY_MEMBER: [
                    {
                      name: 'otherRelationShip',
                      type: 'TEXT',
                      label: {
                        defaultMessage: 'Relationship to child',
                        id: 'form.field.label.informantsRelationWithChild',
                        description: 'Label for input Relationship to child'
                      },
                      placeholder: {
                        defaultMessage: 'eg. Grandmother',
                        description: 'Placeholder for example of relationship',
                        id: 'form.field.label.relationshipPlaceHolder'
                      },
                      required: true,
                      initialValue: '',
                      validate: [],
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
                  LEGAL_GUARDIAN: [],
                  INSTITUTION_HEAD_PLACE_OF_BIRTH: [],
                  HOUSE_OWNER: [],
                  OPERATOR: [],
                  OFFICE_IN_CHARGE: [],
                  OTHER: [
                    {
                      name: 'otherRelationShip',
                      type: 'TEXT',
                      label: {
                        defaultMessage: 'Relationship to child',
                        id: 'form.field.label.informantsRelationWithChild',
                        description: 'Label for input Relationship to child'
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
                  ]
                },
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
            id: 'primary-informant',
            title: {
              defaultMessage:
                'Who is the primary informant for this application?',
              description: 'Form section title for primary informant',
              id: 'register.primaryInformant.registerNewEventHeading'
            },
            conditionals: [
              {
                action: 'hide',
                expression:
                  '(!draftData || !draftData.registration || draftData.registration.presentAtBirthRegistration !== "BOTH_PARENTS" || draftData.registration.presentAtBirthRegistration === "OTHER")'
              }
            ],
            preventContinueIfError: true,
            showExitButtonOnly: true,
            fields: [
              {
                name: 'paragraph',
                type: 'PARAGRAPH',
                label: {
                  defaultMessage:
                    'This person is responsible for providing accurate information in this application.',
                  description: 'Documents Paragraph text',
                  id: 'register.primaryInformant.description'
                },
                initialValue: '',
                validate: [],
                conditionals: []
              },
              {
                name: 'informant',
                type: 'RADIO_GROUP_WITH_NESTED_FIELDS',
                label: {
                  defaultMessage: 'Who is the primary informant?',
                  description: 'Label for field primary informant',
                  id: 'register.selectInformant.primaryInformant'
                },
                hideHeader: true,
                size: 'large',
                required: true,
                readonly: true,
                initialValue: '',
                validate: [],
                options: [
                  {
                    value: 'MOTHER',
                    label: {
                      defaultMessage: 'Mother',
                      description: 'Mother as informant',
                      id: 'form.field.label.informantRelation.mother'
                    }
                  },
                  {
                    value: 'FATHER',
                    label: {
                      defaultMessage: 'Father',
                      description: 'Father as informant',
                      id: 'form.field.label.informantRelation.father'
                    }
                  }
                ],
                nestedFields: {
                  MOTHER: [],
                  FATHER: []
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
            id: 'contact-view-group',
            title: {
              defaultMessage:
                'Who is the main point of contact for this application?',
              description: 'Form section title for contact point',
              id: 'register.SelectContactPoint.heading'
            },
            conditionals: [],
            preventContinueIfError: true,
            showExitButtonOnly: true,
            previewGroups: [
              {
                id: 'contactPointGroup',
                label: {
                  defaultMessage: 'Main Contact',
                  description: 'Label for form field: Place of delivery',
                  id: 'form.field.label.application.mainContact'
                },
                required: false,
                initialValue: '',
                fieldToRedirect: 'contactPoint'
              }
            ],
            fields: [
              {
                name: 'presentAtBirthRegistration',
                type: 'RADIO_GROUP',
                required: true,
                readonly: true,
                hidden: true,
                hideInPreview: false,
                initialValue: '',
                validate: [],
                options: [
                  {
                    value: 'MOTHER',
                    label: {
                      defaultMessage: 'Mother',
                      description: 'Label for option Mother',
                      id: 'form.field.label.informantRelation.mother'
                    }
                  },
                  {
                    value: 'FATHER',
                    label: {
                      defaultMessage: 'Father',
                      description: 'Label for option Father',
                      id: 'form.field.label.informantRelation.father'
                    }
                  },
                  {
                    value: 'BOTH_PARENTS',
                    label: {
                      id: 'register.selectInformant.parents',
                      defaultMessage: 'Mother & Father',
                      description:
                        'The description that appears when selecting the parent as informant'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Someone else',
                      description: 'Other Label',
                      id: 'form.field.label.someoneElse'
                    }
                  }
                ],
                label: {
                  defaultMessage: 'Who is present for the birth registration?',
                  description: 'Form section title for contact point',
                  id: 'form.field.label.application.whoIsPresent'
                },
                reviewOverrides: {
                  residingSection: 'registration',
                  reference: {
                    sectionID: 'registration',
                    groupID: 'contact-view-group',
                    fieldName: 'contactPoint'
                  },
                  position: 'before',
                  labelAs: {
                    defaultMessage: 'Who is the informant?',
                    description: 'Form section title for contact point',
                    id: 'register.selectInformant.relation'
                  },
                  conditionals: [
                    {
                      action: 'hide',
                      expression:
                        '(!draftData || !draftData.registration || draftData.registration.presentAtBirthRegistration === "OTHER")'
                    }
                  ]
                },
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
                name: 'informant',
                type: 'RADIO_GROUP_WITH_NESTED_FIELDS',
                readonly: true,
                hidden: true,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '(!draftData || !draftData.registration || draftData.registration.presentAtBirthRegistration !== "LEGAL_GUARDIAN")'
                  }
                ],
                label: {
                  defaultMessage: 'Informant',
                  description: 'Form section title for contact point',
                  id: 'form.section.informant.name'
                },
                options: [
                  {
                    value: 'LEGAL_GUARDIAN',
                    label: {
                      defaultMessage: 'Legal guardian',
                      description: 'Option for form field: Legal Guardian',
                      id: 'register.selectinformant.legalGuardian'
                    }
                  }
                ],
                nestedFields: {
                  LEGAL_GUARDIAN: []
                },
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
                size: 'large',
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
      },
      {
        id: 'child',
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
                label: {
                  defaultMessage: 'Sex',
                  description: 'Label for form field: Sex name',
                  id: 'form.field.label.childSex'
                },
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
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
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Attendant at birth',
                  description: 'Label for form field: Attendant at birth',
                  id: 'form.field.label.attendantAtBirth'
                },
                required: false,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
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
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Type of birth',
                  description: 'Label for form field: Type of birth',
                  id: 'form.field.label.birthType'
                },
                required: false,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
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
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
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
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: []
                  },
                  query: {
                    operation: 'eventLocationIDQueryTransformer',
                    parameters: []
                  }
                }
              },
              {
                name: 'country',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'placeOfBirth',
                required: true,
                initialValue: 'FAR',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: {
                  resource: 'countries'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: []
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: []
                  }
                }
              },
              {
                name: 'state',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'Province',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'placeOfBirth',
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'country',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.country)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: []
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      0,
                      'state',
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrict',
                          'internationalState'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'district',
                          'state'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'district',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'placeOfBirth',
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'state',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.country)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: []
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      0,
                      'district',
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrict',
                          'internationalState'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'district',
                          'state'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'ruralOrUrban',
                type: 'RADIO_GROUP',
                label: {
                  defaultMessage: ' ',
                  description: 'Empty label for form field',
                  id: 'form.field.label.emptyLabel'
                },
                options: [
                  {
                    label: {
                      defaultMessage: 'Urban',
                      id: 'form.field.label.urban',
                      description: 'Label for form field checkbox option Urban'
                    },
                    value: 'URBAN'
                  },
                  {
                    label: {
                      defaultMessage: 'Rural',
                      id: 'form.field.label.rural',
                      description: 'Label for form field checkbox option Rural'
                    },
                    value: 'RURAL'
                  }
                ],
                initialValue: 'URBAN',
                flexDirection: 'row',
                required: false,
                hideValueInPreview: true,
                previewGroup: 'placeOfBirth',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: [7]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [7]
                  }
                }
              },
              {
                name: 'addressChief',
                type: 'TEXT',
                label: {
                  id: 'form.field.label.addressChief',
                  defaultMessage: 'Chief',
                  description: 'The lable for form field chief'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "RURAL"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: [6]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [6]
                  }
                }
              },
              {
                name: 'addressLine4CityOption',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.addressLine4CityOption'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "URBAN"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: [4]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [4]
                  }
                }
              },
              {
                name: 'addressLine3CityOption',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 3 option 2',
                  id: 'form.field.label.addressLine3CityOption'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "URBAN"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: [3]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [3]
                  }
                }
              },
              {
                name: 'addressLine2CityOption',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street / Plot Number',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine2CityOption'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "URBAN"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: [2]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [2]
                  }
                }
              },
              {
                name: 'numberOption',
                type: 'NUMBER',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "URBAN"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: [1]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [1]
                  }
                }
              },
              {
                name: 'addressLine1',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "RURAL"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: [5]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [5]
                  }
                }
              },
              {
                name: 'internationalState',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'placeOfBirth',
                required: true,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: [0, 'state']
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      0,
                      'state',
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrict',
                          'internationalState'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'district',
                          'state'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrict',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'placeOfBirth',
                required: true,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: [0, 'district']
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      0,
                      'district',
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrict',
                          'internationalState'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'district',
                          'state'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCity',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: [0, 'city']
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [0, 'city']
                  }
                }
              },
              {
                name: 'internationalAddressLine1',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: [7]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [7]
                  }
                }
              },
              {
                name: 'internationalAddressLine2',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: [8]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [8]
                  }
                }
              },
              {
                name: 'internationalAddressLine3',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: [9]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [9]
                  }
                }
              },
              {
                name: 'internationalPostcode',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'birthEventLocationMutationTransformer',
                    parameters: [0, 'postalCode']
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [0, 'postalCode']
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'placeOfBirth',
                label: {
                  defaultMessage: 'Place of delivery',
                  description: 'Title for place of birth sub section',
                  id: 'form.field.label.placeOfBirthPreview'
                },
                fieldToRedirect: 'placeOfBirth'
              },
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
        id: 'informant',
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
                  '(!draftData || !draftData.registration || !((draftData.presentAtBirthRegistration && (draftData.presentAtBirthRegistration === "LEGAL_GUARDIAN" || draftData.presentAtBirthRegistration === "OTHER")) || (draftData.registration.presentAtBirthRegistration && (draftData.registration.presentAtBirthRegistration === "LEGAL_GUARDIAN" || draftData.registration.presentAtBirthRegistration === "OTHER")  )))'
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
                initialValue: 'FAR',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
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
                type: 'NUMBER',
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
                name: 'permanentAddress',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: 'What is their residential address?',
                  description: 'Title for the permanent address fields',
                  id: 'form.field.label.informantPermanentAddress'
                },
                initialValue: '',
                previewGroup: 'permanentAddress',
                validate: []
              },
              {
                name: 'countryPermanent',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: 'FAR',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: {
                  resource: 'countries'
                },
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 0, 'country']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
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
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'Province',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPermanent',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 0, 'state']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
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
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePermanent',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 0, 'district']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 0, 'district']
                      }
                    ]
                  }
                }
              },
              {
                name: 'ruralOrUrbanPermanent',
                type: 'RADIO_GROUP',
                label: {
                  defaultMessage: ' ',
                  description: 'Empty label for form field',
                  id: 'form.field.label.emptyLabel'
                },
                options: [
                  {
                    label: {
                      defaultMessage: 'Urban',
                      id: 'form.field.label.urban',
                      description: 'Label for form field checkbox option Urban'
                    },
                    value: 'URBAN'
                  },
                  {
                    label: {
                      defaultMessage: 'Rural',
                      id: 'form.field.label.rural',
                      description: 'Label for form field checkbox option Rural'
                    },
                    value: 'RURAL'
                  }
                ],
                initialValue: 'URBAN',
                flexDirection: 'row',
                previewGroup: 'permanentAddress',
                hideValueInPreview: true,
                required: false,
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 7]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 7]
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressChiefPermanent',
                type: 'TEXT',
                label: {
                  id: 'form.field.label.addressChief',
                  defaultMessage: 'Chief',
                  description: 'The lable for form field chief'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "RURAL"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 6]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 6]
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine4CityOptionPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.addressLine4CityOption'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 4]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
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
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 3 option 2',
                  id: 'form.field.label.addressLine3CityOption'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 3]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 3]
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine2CityOptionPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street / Plot Number',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine2CityOption'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 2]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 2]
                      }
                    ]
                  }
                }
              },
              {
                name: 'numberOptionPermanent',
                type: 'NUMBER',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 1]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 1]
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "RURAL"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 5]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 5]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalStatePermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 0, 'state']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 0, 'state']
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrictPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 0, 'district']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 0, 'district']
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCityPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 0, 'city']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 0, 'city']
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine1Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 7]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 7]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine2Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 8]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 8]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine3Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 9]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 9]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalPostcodePermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 0, 'postalCode']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 0, 'postalCode']
                      }
                    ]
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'permanentAddress',
                label: {
                  defaultMessage: 'Residential address',
                  description:
                    'Preview groups label for form field: residential address',
                  id: 'form.field.previewGroups.permanentAddress'
                },
                fieldToRedirect: 'countryPermanent'
              },
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
        id: 'primaryCaregiver',
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
                  '(!draftData || !draftData.registration || !((draftData.presentAtBirthRegistration && (draftData.presentAtBirthRegistration === "LEGAL_GUARDIAN" || draftData.presentAtBirthRegistration === "OTHER")) || (draftData.registration.presentAtBirthRegistration && (draftData.registration.presentAtBirthRegistration === "LEGAL_GUARDIAN" || draftData.registration.presentAtBirthRegistration === "OTHER")  )))'
              }
            ],
            fields: [
              {
                name: 'parentDetailsType',
                type: 'RADIO_GROUP',
                size: 'large',
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
                  '(!draftData || !draftData.registration || !((draftData.presentAtBirthRegistration && (draftData.presentAtBirthRegistration === "LEGAL_GUARDIAN" || draftData.presentAtBirthRegistration === "OTHER")) || (draftData.registration.presentAtBirthRegistration && (draftData.registration.presentAtBirthRegistration === "LEGAL_GUARDIAN" || draftData.registration.presentAtBirthRegistration === "OTHER")  )))'
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
                      '',
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
                      '',
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
                  '(!draftData || !draftData.registration || !((draftData.presentAtBirthRegistration && (draftData.presentAtBirthRegistration === "LEGAL_GUARDIAN" || draftData.presentAtBirthRegistration === "OTHER")) || (draftData.registration.presentAtBirthRegistration && (draftData.registration.presentAtBirthRegistration === "LEGAL_GUARDIAN" || draftData.registration.presentAtBirthRegistration === "OTHER")  )))'
              }
            ],
            fields: [
              {
                name: 'primaryCaregiverType',
                type: 'RADIO_GROUP_WITH_NESTED_FIELDS',
                size: 'large',
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
                        id: 'form.field.label.application.phone',
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
                        id: 'form.field.label.application.phone',
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
        id: 'mother',
        viewType: 'form',
        replaceable: true,
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
                initialValue: 'FAR',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: {
                  resource: 'countries'
                },
                mapping: {
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
                type: 'NUMBER',
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
                type: 'NUMBER',
                label: {
                  defaultMessage: 'Social Security No',
                  description: 'text for social security number form field',
                  id: 'form.field.label.socialSecurityNumber'
                },
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
                    parameters: [5],
                    dependencies: []
                  }
                ],
                mapping: {
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
                required: false,
                initialValue: 'MARRIED',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
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
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
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
              },
              {
                name: 'placeOfHeritage',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: 'What is her place of origin (heritage)?',
                  description: 'Title for mother place of birth',
                  id: 'form.field.label.motherPlaceOfHeritage'
                },
                previewGroup: 'placeOfHeritage',
                initialValue: '',
                validate: []
              },
              {
                name: 'countryPlaceOfHeritage',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'placeOfHeritage',
                required: true,
                initialValue: 'FAR',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: {
                  resource: 'countries'
                },
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['PLACE_OF_HERITAGE', 0, 'country']
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['PLACE_OF_HERITAGE', 0, 'country']
                  }
                }
              },
              {
                name: 'statePlaceOfHeritage',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'Province',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'placeOfHeritage',
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPlaceOfHeritage',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPlaceOfHeritage)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceOfHeritage'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['PLACE_OF_HERITAGE', 0, 'state']
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['PLACE_OF_HERITAGE', 0, 'state']
                  }
                }
              },
              {
                name: 'districtPlaceOfHeritage',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'placeOfHeritage',
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePlaceOfHeritage',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPlaceOfHeritage)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceOfHeritage'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceOfHeritage'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['PLACE_OF_HERITAGE', 0, 'district']
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['PLACE_OF_HERITAGE', 0, 'district']
                  }
                }
              },
              {
                name: 'addressChiefPlaceOfHeritage',
                type: 'TEXT',
                label: {
                  id: 'form.field.label.addressChief',
                  defaultMessage: 'Chief',
                  description: 'The lable for form field chief'
                },
                previewGroup: 'placeOfHeritage',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceOfHeritage'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceOfHeritage'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceOfHeritage'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['PLACE_OF_HERITAGE', 3]
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['PLACE_OF_HERITAGE', 3]
                  }
                }
              },
              {
                name: 'addressLine1PlaceOfHeritage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1'
                },
                previewGroup: 'placeOfHeritage',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceOfHeritage'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceOfHeritage'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceOfHeritage'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['PLACE_OF_HERITAGE', 1]
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['PLACE_OF_HERITAGE', 1]
                  }
                }
              },
              {
                name: 'internationalStatePlaceOfHeritage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'placeOfHeritage',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPlaceOfHeritage)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PLACE_OF_HERITAGE', 0, 'state']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PLACE_OF_HERITAGE', 0, 'state']
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrictPlaceOfHeritage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'placeOfHeritage',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPlaceOfHeritage)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PLACE_OF_HERITAGE', 0, 'district']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PLACE_OF_HERITAGE', 0, 'district']
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCityPlaceOfHeritage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'placeOfHeritage',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPlaceOfHeritage)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PLACE_OF_HERITAGE', 0, 'city']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PLACE_OF_HERITAGE', 0, 'city']
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine1PlaceOfHeritage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'placeOfHeritage',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPlaceOfHeritage)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PLACE_OF_HERITAGE', 8]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PLACE_OF_HERITAGE', 8]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine2PlaceOfHeritage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'placeOfHeritage',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPlaceOfHeritage)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PLACE_OF_HERITAGE', 9]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PLACE_OF_HERITAGE', 9]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine3PlaceOfHeritage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'placeOfHeritage',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPlaceOfHeritage)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PLACE_OF_HERITAGE', 10]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PLACE_OF_HERITAGE', 10]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalPostcodePlaceOfHeritage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'placeOfHeritage',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPlaceOfHeritage)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PLACE_OF_HERITAGE', 0, 'postalCode']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PLACE_OF_HERITAGE', 0, 'postalCode']
                      }
                    ]
                  }
                }
              },
              {
                name: 'permanentAddress',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: 'What is her residential address?',
                  description: 'Title for the permanent address fields',
                  id: 'form.field.label.motherPermanentAddress'
                },
                previewGroup: 'permanentAddress',
                initialValue: '',
                validate: []
              },
              {
                name: 'countryPermanent',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: 'FAR',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: {
                  resource: 'countries'
                },
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
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'Province',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPermanent',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPermanent)'
                  }
                ],
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
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePermanent',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  }
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
                name: 'ruralOrUrbanPermanent',
                type: 'RADIO_GROUP',
                label: {
                  defaultMessage: ' ',
                  description: 'Empty label for form field',
                  id: 'form.field.label.emptyLabel'
                },
                options: [
                  {
                    label: {
                      defaultMessage: 'Urban',
                      id: 'form.field.label.urban',
                      description: 'Label for form field checkbox option Urban'
                    },
                    value: 'URBAN'
                  },
                  {
                    label: {
                      defaultMessage: 'Rural',
                      id: 'form.field.label.rural',
                      description: 'Label for form field checkbox option Rural'
                    },
                    value: 'RURAL'
                  }
                ],
                initialValue: 'URBAN',
                flexDirection: 'row',
                previewGroup: 'permanentAddress',
                hideValueInPreview: true,
                required: false,
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['PERMANENT', 7]
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['PERMANENT', 7]
                  }
                }
              },
              {
                name: 'addressChiefPermanent',
                type: 'TEXT',
                label: {
                  id: 'form.field.label.addressChief',
                  defaultMessage: 'Chief',
                  description: 'The lable for form field chief'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "RURAL"'
                  }
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
                name: 'addressLine4CityOptionPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.addressLine4CityOption'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
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
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 3 option 2',
                  id: 'form.field.label.addressLine3CityOption'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
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
                name: 'addressLine2CityOptionPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street / Plot Number',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine2CityOption'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
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
                name: 'numberOptionPermanent',
                type: 'NUMBER',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
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
                name: 'addressLine1Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "RURAL"'
                  }
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
                name: 'internationalStatePermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 0, 'state']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 0, 'state']
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrictPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 0, 'district']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 0, 'district']
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCityPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 0, 'city']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 0, 'city']
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine1Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 8]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 8]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine2Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 9]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 9]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine3Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 10]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 10]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalPostcodePermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 0, 'postalCode']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 0, 'postalCode']
                      }
                    ]
                  }
                }
              },
              {
                name: 'currentAddressSameAsPermanent',
                type: 'RADIO_GROUP',
                label: {
                  defaultMessage:
                    'Is her usual place of residence the same as her residential address?',
                  description:
                    'Title for the radio button to select that the mothers current address is the same as her permanent address',
                  id: 'form.field.label.currentAddressSameAsPermanent'
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
                type: 'SUBSECTION',
                label: {
                  defaultMessage: 'Current Address',
                  description: 'Title for the current address fields',
                  id: 'form.field.label.currentAddress'
                },
                previewGroup: 'currentAddress',
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
                ]
              },
              {
                name: 'country',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'currentAddress',
                required: true,
                initialValue: 'FAR',
                validate: [],
                options: {
                  resource: 'countries'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
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
                name: 'state',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'Province',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'currentAddress',
                required: true,
                initialValue: '',
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                validate: [],
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'country'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
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
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'currentAddress',
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'state'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
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
                name: 'ruralOrUrban',
                type: 'RADIO_GROUP',
                label: {
                  defaultMessage: ' ',
                  description: 'Empty label for form field',
                  id: 'form.field.label.emptyLabel'
                },
                options: [
                  {
                    label: {
                      defaultMessage: 'Urban',
                      id: 'form.field.label.urban',
                      description: 'Label for form field checkbox option Urban'
                    },
                    value: 'URBAN'
                  },
                  {
                    label: {
                      defaultMessage: 'Rural',
                      id: 'form.field.label.rural',
                      description: 'Label for form field checkbox option Rural'
                    },
                    value: 'RURAL'
                  }
                ],
                initialValue: 'URBAN',
                flexDirection: 'row',
                previewGroup: 'currentAddress',
                hideValueInPreview: true,
                required: false,
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['CURRENT', 7]
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['CURRENT', 7]
                  }
                }
              },
              {
                name: 'addressChief',
                type: 'TEXT',
                label: {
                  id: 'form.field.label.addressChief',
                  defaultMessage: 'Chief',
                  description: 'The lable for form field chief'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "RURAL"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
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
                name: 'addressLine4CityOption',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.addressLine4CityOption'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
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
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 3 option 2',
                  id: 'form.field.label.addressLine3CityOption'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
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
                name: 'addressLine2CityOption',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street / Plot Number',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine2CityOption'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
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
                name: 'numberOption',
                type: 'NUMBER',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
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
                name: 'addressLine1',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "RURAL"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
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
                name: 'internationalState',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['CURRENT', 0, 'state']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['CURRENT', 0, 'state']
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrict',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['CURRENT', 0, 'district']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['CURRENT', 0, 'district']
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCity',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['CURRENT', 0, 'city']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['CURRENT', 0, 'city']
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine1',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['CURRENT', 8]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['CURRENT', 8]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine2',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['CURRENT', 9]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['CURRENT', 9]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine3',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['CURRENT', 10]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['CURRENT', 10]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalPostcode',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression: 'values.currentAddressSameAsPermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['CURRENT', 0, 'postalCode']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['CURRENT', 0, 'postalCode']
                      }
                    ]
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'placeOfHeritage',
                label: {
                  defaultMessage: 'Place of origin (heritage)',
                  description: 'Tag definition for placeOfHeritage',
                  id: 'form.preview.tag.placeOfHeritage'
                },
                fieldToRedirect: 'countryPlaceOfHeritage'
              },
              {
                id: 'permanentAddress',
                label: {
                  defaultMessage: 'Permanent address',
                  description: 'Tag definition for permanentAddress',
                  id: 'form.preview.tag.permanent.address'
                },
                fieldToRedirect: 'countryPermanent'
              },
              {
                id: 'currentAddress',
                label: {
                  defaultMessage: 'Current address',
                  description: 'Tag definition for crrent address',
                  id: 'form.preview.tag.current.address'
                },
                fieldToRedirect: 'country'
              },
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
        id: 'father',
        viewType: 'form',
        replaceable: true,
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
                type: 'NUMBER',
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
                type: 'NUMBER',
                label: {
                  defaultMessage: 'Social Security No',
                  description: 'text for social security number form field',
                  id: 'form.field.label.socialSecurityNumber'
                },
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
                initialValue: 'FAR',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
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
                required: false,
                initialValue: 'MARRIED',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.fathersDetailsExist'
                  }
                ],
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
                required: false,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
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
              },
              {
                name: 'permanentAddressSameAsMother',
                type: 'RADIO_GROUP',
                label: {
                  defaultMessage:
                    "Is his residential address the same as the mother's?",
                  description:
                    "Title for the radio button to select that the father's permanent address is the same as the mother's address",
                  id: 'form.field.label.permanentAddressSameAsMother'
                },
                required: true,
                initialValue: false,
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
                    expression: '!values.fathersDetailsExist'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData && draftData.primaryCaregiver && draftData.primaryCaregiver.parentDetailsType && draftData.primaryCaregiver.parentDetailsType ===  "FATHER_ONLY")'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'copyAddressTransformer',
                    parameters: ['PERMANENT', 'mother', 'PERMANENT', 'father']
                  },
                  query: {
                    operation: 'sameAddressFieldTransformer',
                    parameters: ['PERMANENT', 'mother', 'PERMANENT', 'father']
                  }
                }
              },
              {
                name: 'permanentAddress',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: 'What is his residential address?',
                  description: 'Title for the permanent address fields',
                  id: 'form.field.label.fatherPermanentAddress'
                },
                previewGroup: 'permanentAddress',
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.fathersDetailsExist'
                  },
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  }
                ]
              },
              {
                name: 'countryPermanent',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: 'FAR',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: {
                  resource: 'countries'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.fathersDetailsExist'
                  },
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  }
                ],
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
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'Province',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPermanent',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPermanent)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.fathersDetailsExist'
                  },
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  }
                ],
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
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePermanent',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPermanent)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.fathersDetailsExist'
                  },
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  }
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
                name: 'ruralOrUrbanPermanent',
                type: 'RADIO_GROUP',
                label: {
                  defaultMessage: ' ',
                  description: 'Empty label for form field',
                  id: 'form.field.label.emptyLabel'
                },
                options: [
                  {
                    label: {
                      defaultMessage: 'Urban',
                      id: 'form.field.label.urban',
                      description: 'Label for form field checkbox option Urban'
                    },
                    value: 'URBAN'
                  },
                  {
                    label: {
                      defaultMessage: 'Rural',
                      id: 'form.field.label.rural',
                      description: 'Label for form field checkbox option Rural'
                    },
                    value: 'RURAL'
                  }
                ],
                initialValue: 'URBAN',
                flexDirection: 'row',
                previewGroup: 'permanentAddress',
                hideValueInPreview: true,
                required: false,
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.fathersDetailsExist'
                  },
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['PERMANENT', 7]
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['PERMANENT', 7]
                  }
                }
              },
              {
                name: 'addressChiefPermanent',
                type: 'TEXT',
                label: {
                  id: 'form.field.label.addressChief',
                  defaultMessage: 'Chief',
                  description: 'The lable for form field chief'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.fathersDetailsExist'
                  },
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "RURAL"'
                  }
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
                name: 'addressLine4CityOptionPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.addressLine4CityOption'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.fathersDetailsExist'
                  },
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
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
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 3 option 2',
                  id: 'form.field.label.addressLine3CityOption'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.fathersDetailsExist'
                  },
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
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
                name: 'addressLine2CityOptionPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street / Plot Number',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine2CityOption'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.fathersDetailsExist'
                  },
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
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
                name: 'numberOptionPermanent',
                type: 'NUMBER',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.fathersDetailsExist'
                  },
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
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
                name: 'addressLine1Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.fathersDetailsExist'
                  },
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "RURAL"'
                  }
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
                name: 'internationalStatePermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
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
                name: 'internationalDistrictPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
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
                name: 'internationalCityPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['PERMANENT', 0, 'city']
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['PERMANENT', 0, 'city']
                  }
                }
              },
              {
                name: 'internationalAddressLine1Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['PERMANENT', 8]
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['PERMANENT', 8]
                  }
                }
              },
              {
                name: 'internationalAddressLine2Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['PERMANENT', 9]
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['PERMANENT', 9]
                  }
                }
              },
              {
                name: 'internationalAddressLine3Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['PERMANENT', 10]
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['PERMANENT', 10]
                  }
                }
              },
              {
                name: 'internationalPostcodePermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
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
              }
            ],
            previewGroups: [
              {
                id: 'permanentAddress',
                label: {
                  defaultMessage: 'Permanent address',
                  description: 'Tag definition for permanentAddress',
                  id: 'form.preview.tag.permanent.address'
                },
                fieldToRedirect: 'countryPermanent'
              },
              {
                id: 'currentAddress',
                label: {
                  defaultMessage: 'Current address',
                  description: 'Tag definition for crrent address',
                  id: 'form.preview.tag.current.address'
                },
                fieldToRedirect: 'country'
              },
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
        id: 'documents',
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
                extraValue: 'APPLICANT_ID_PROOF',
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
                      '(draftData && draftData.registration && draftData.registration.presentAtBirthRegistration !== "LEGAL_GUARDIAN" && draftData.registration.presentAtBirthRegistration !== "OTHER")'
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
                      '(draftData && draftData.registration && draftData.registration.presentAtBirthRegistration !== "LEGAL_GUARDIAN")'
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
                      '(draftData && draftData.registration && draftData.registration.presentAtBirthRegistration !== "OTHER")'
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
        id: 'registration',
        viewType: 'form',
        name: {
          defaultMessage: 'Registration',
          description: 'Form section name for Registration',
          id: 'form.section.application.name'
        },
        title: {
          defaultMessage: 'Declaration Details',
          description: 'Form section title for Registration',
          id: 'form.section.application.title'
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
                size: 'large',
                required: true,
                initialValue: '',
                validate: [],
                options: [
                  {
                    value: 'HEAD_OF_THE_INSTITUTE',
                    label: {
                      defaultMessage:
                        'Head of the institution where the death occurred',
                      description:
                        'Option for form field: Head of the institute',
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
                      description:
                        'Option for form field: Driver of the vehicle',
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
                'Who is the main point of contact for this application?',
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
                    'Who is the main point of contact for this application?',
                  description: 'Form section title for contact point',
                  id: 'register.SelectContactPoint.heading'
                },
                conditionals: [],
                hideHeader: true,
                required: true,
                initialValue: '',
                validate: [],
                size: 'large',
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
      },
      {
        id: 'deceased',
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
                type: 'NUMBER',
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
                type: 'NUMBER',
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
                initialValue: 'FAR',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: {
                  resource: 'countries'
                },
                mapping: {
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
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
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
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
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
              },
              {
                name: 'permanentAddress',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: 'What was their residential address?',
                  description: 'Title for the residential address fields',
                  id: 'form.field.label.permanentAddress'
                },
                previewGroup: 'permanentAddress',
                initialValue: '',
                validate: []
              },
              {
                name: 'countryPermanent',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: 'FAR',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: {
                  resource: 'countries'
                },
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
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'Province',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPermanent',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPermanent)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  }
                ],
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
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePermanent',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPermanent)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  }
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
                name: 'ruralOrUrbanPermanent',
                type: 'RADIO_GROUP',
                label: {
                  defaultMessage: ' ',
                  description: 'Empty label for form field',
                  id: 'form.field.label.emptyLabel'
                },
                options: [
                  {
                    label: {
                      defaultMessage: 'Urban',
                      id: 'form.field.label.urban',
                      description: 'Label for form field checkbox option Urban'
                    },
                    value: 'URBAN'
                  },
                  {
                    label: {
                      defaultMessage: 'Rural',
                      id: 'form.field.label.rural',
                      description: 'Label for form field checkbox option Rural'
                    },
                    value: 'RURAL'
                  }
                ],
                initialValue: 'URBAN',
                flexDirection: 'row',
                previewGroup: 'permanentAddress',
                hideValueInPreview: true,
                required: false,
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['PERMANENT', 7]
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['PERMANENT', 7]
                  }
                }
              },
              {
                name: 'addressChiefPermanent',
                type: 'TEXT',
                label: {
                  id: 'form.field.label.addressChief',
                  defaultMessage: 'Chief',
                  description: 'The lable for form field chief'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "RURAL"'
                  }
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
                name: 'addressLine4CityOptionPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.addressLine4CityOption'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
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
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 3 option 2',
                  id: 'form.field.label.addressLine3CityOption'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
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
                name: 'addressLine2CityOptionPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street / Plot Number',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine2CityOption'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
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
                name: 'numberOptionPermanent',
                type: 'NUMBER',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
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
                name: 'addressLine1Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "RURAL"'
                  }
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
                name: 'internationalStatePermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  },
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
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
                name: 'internationalDistrictPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  },
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
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
                name: 'internationalCityPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  },
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['PERMANENT', 0, 'city']
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['PERMANENT', 0, 'city']
                  }
                }
              },
              {
                name: 'internationalAddressLine1Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  },
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['PERMANENT', 8]
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['PERMANENT', 8]
                  }
                }
              },
              {
                name: 'internationalAddressLine2Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  },
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['PERMANENT', 9]
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['PERMANENT', 9]
                  }
                }
              },
              {
                name: 'internationalAddressLine3Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  },
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldToAddressTransformer',
                    parameters: ['PERMANENT', 10]
                  },
                  query: {
                    operation: 'addressToFieldTransformer',
                    parameters: ['PERMANENT', 10]
                  }
                }
              },
              {
                name: 'internationalPostcodePermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.permanentAddressSameAsMother'
                  },
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPermanent)'
                  }
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
              }
            ],
            previewGroups: [
              {
                id: 'permanentAddress',
                label: {
                  defaultMessage: 'Permanent address',
                  description: 'Tag definition for permanentAddress',
                  id: 'form.preview.tag.permanent.address'
                },
                fieldToRedirect: 'countryPermanent'
              },
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
        id: 'deathEvent',
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
            id: 'deathEvent-deathDate',
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
              }
            ]
          },
          {
            id: 'deathEvent-deathManner',
            fields: [
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
                size: 'large',
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
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
              }
            ]
          },
          {
            id: 'deathEvent-deathPlaceAddress',
            fields: [
              {
                name: 'deathPlaceAddress',
                type: 'RADIO_GROUP',
                label: {
                  defaultMessage: 'Where did the death occur?',
                  description:
                    'Label for form field: Place of occurrence of death',
                  id: 'form.field.label.deathPlaceAddress'
                },
                required: true,
                initialValue: '',
                validate: [],
                size: 'large',
                options: [
                  {
                    value: 'PERMANENT',
                    label: {
                      defaultMessage: 'Residential address of the deceased',
                      description: 'Select item for Private Home',
                      id: 'form.field.label.resedentialAddress'
                    }
                  },
                  {
                    value: 'HEALTH_FACILITY',
                    label: {
                      defaultMessage: 'Health Institution',
                      description: 'Select item for Health Institution',
                      id: 'form.field.label.healthInstitution'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other address',
                      description: 'Select item for Other address',
                      id: 'form.field.label.otherAddress'
                    }
                  }
                ],
                conditionals: [],
                mapping: {
                  mutation: {
                    operation: 'copyEventAddressTransformer',
                    parameters: ['deceased']
                  },
                  query: {
                    operation: 'deathPlaceToFieldTransformer'
                  }
                }
              }
            ]
          },
          {
            id: 'deathEvent-deathLocation',
            conditionals: [
              {
                action: 'hide',
                expression: 'values.deathPlaceAddress!="HEALTH_FACILITY"'
              }
            ],
            fields: [
              {
                name: 'deathLocation',
                type: 'LOCATION_SEARCH_INPUT',
                label: {
                  defaultMessage: 'What hospital did the death occur at?',
                  description:
                    'Label for form field: Hospital or Health Institution',
                  id: 'form.field.label.deathAtFacility'
                },
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
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: []
                  },
                  query: {
                    operation: 'sectionFieldExchangeTransformer',
                    parameters: ['eventLocation', 'id']
                  }
                }
              }
            ]
          },
          {
            id: 'deathEvent-deathAtOtherLocation',
            title: {
              defaultMessage:
                'What is the other address did the death occur at?',
              description: 'Label for form field: Other Location Address',
              id: 'form.field.label.deathAtOtherLocation'
            },
            conditionals: [
              {
                action: 'hide',
                expression: 'values.deathPlaceAddress !== "OTHER"'
              }
            ],
            previewGroups: [
              {
                id: 'deathPlaceAddress',
                label: {
                  defaultMessage:
                    'What is the other address did the death occur at?',
                  description: 'Label for form field: Other Location Address',
                  id: 'form.field.label.deathAtOtherLocation'
                },
                fieldToRedirect: 'country'
              }
            ],
            fields: [
              {
                name: 'country',
                type: 'SELECT_WITH_OPTIONS',
                previewGroup: 'deathPlaceAddress',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                required: true,
                initialValue: 'FAR',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: {
                  resource: 'countries'
                },
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: []
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: []
                  }
                }
              },
              {
                name: 'state',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                previewGroup: 'deathPlaceAddress',
                label: {
                  defaultMessage: 'Province',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'country'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.country'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: []
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      0,
                      'state',
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrict',
                          'internationalState'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'district',
                          'state'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'district',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                previewGroup: 'deathPlaceAddress',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'state'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.country)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: []
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      0,
                      'district',
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrict',
                          'internationalState'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'district',
                          'state'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'ruralOrUrban',
                type: 'RADIO_GROUP',
                previewGroup: 'deathPlaceAddress',
                label: {
                  defaultMessage: ' ',
                  description: 'Empty label for form field',
                  id: 'form.field.label.emptyLabel'
                },
                options: [
                  {
                    label: {
                      defaultMessage: 'Urban',
                      id: 'form.field.label.urban',
                      description: 'Label for form field checkbox option Urban'
                    },
                    value: 'URBAN'
                  },
                  {
                    label: {
                      defaultMessage: 'Rural',
                      id: 'form.field.label.rural',
                      description: 'Label for form field checkbox option Rural'
                    },
                    value: 'RURAL'
                  }
                ],
                initialValue: 'URBAN',
                flexDirection: 'row',
                required: false,
                hideValueInPreview: true,
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: [7]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [7]
                  }
                }
              },
              {
                name: 'addressChief',
                type: 'TEXT',
                previewGroup: 'deathPlaceAddress',
                label: {
                  id: 'form.field.label.addressChief',
                  defaultMessage: 'Chief',
                  description: 'The lable for form field chief'
                },
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "RURAL"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: [6]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [6]
                  }
                }
              },
              {
                name: 'addressLine4CityOption',
                type: 'TEXT',
                previewGroup: 'deathPlaceAddress',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.addressLine4CityOption'
                },
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "URBAN"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: [4]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [4]
                  }
                }
              },
              {
                name: 'addressLine3CityOption',
                type: 'TEXT',
                previewGroup: 'deathPlaceAddress',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 3 option 2',
                  id: 'form.field.label.addressLine3CityOption'
                },
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "URBAN"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: [3]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [3]
                  }
                }
              },
              {
                name: 'addressLine2CityOption',
                type: 'TEXT',
                previewGroup: 'deathPlaceAddress',
                label: {
                  defaultMessage: 'Street / Plot Number',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine2CityOption'
                },
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "URBAN"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: [2]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [2]
                  }
                }
              },
              {
                name: 'numberOption',
                type: 'NUMBER',
                previewGroup: 'deathPlaceAddress',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "URBAN"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: [1]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [1]
                  }
                }
              },
              {
                name: 'addressLine1',
                type: 'TEXT',
                previewGroup: 'deathPlaceAddress',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1'
                },
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.country'
                  },
                  {
                    action: 'hide',
                    expression: '!values.state'
                  },
                  {
                    action: 'hide',
                    expression: '!values.district'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrban !== "RURAL"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: [5]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [5]
                  }
                }
              },
              {
                name: 'internationalState',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'privateHome',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: [0, 'state']
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      0,
                      'state',
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrict',
                          'internationalState'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'district',
                          'state'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrict',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'privateHome',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: [0, 'district']
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      0,
                      'district',
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrict',
                          'internationalState'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'district',
                          'state'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCity',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'privateHome',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: [0, 'city']
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [0, 'city']
                  }
                }
              },
              {
                name: 'internationalAddressLine1',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'privateHome',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: [8]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [8]
                  }
                }
              },
              {
                name: 'internationalAddressLine2',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'privateHome',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: [9]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [9]
                  }
                }
              },
              {
                name: 'internationalAddressLine3',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'privateHome',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: [10]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [10]
                  }
                }
              },
              {
                name: 'internationalPostcode',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'privateHome',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'deathEventLocationMutationTransformer',
                    parameters: [0, 'postalCode']
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [0, 'postalCode']
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
        id: 'causeOfDeath',
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
                    'A Medically Certified Cause of Death is not mandatory to submit the application. This can be added at a later date.',
                  description: 'Form section notice for Cause of Death',
                  id: 'form.section.causeOfDeathNotice'
                },
                required: false,
                initialValue: '',
                size: 'large',
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
        id: 'informant',
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
                initialValue: 'FAR',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
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
                type: 'NUMBER',
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
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
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
                  position: 'before',
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
              },
              {
                name: 'permanentAddress',
                type: 'SUBSECTION',
                label: {
                  defaultMessage: 'What is their residential address?',
                  description: 'Title for the permanent address fields',
                  id: 'form.field.label.informantPermanentAddress'
                },
                initialValue: '',
                previewGroup: 'permanentAddress',
                validate: []
              },
              {
                name: 'countryPermanent',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: 'FAR',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: {
                  resource: 'countries'
                },
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 0, 'country']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
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
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'Province',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPermanent',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPermanent)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 0, 'state']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
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
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'permanentAddress',
                required: true,
                initialValue: '',
                validate: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePermanent',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPermanent)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 0, 'district']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 0, 'district']
                      }
                    ]
                  }
                }
              },
              {
                name: 'ruralOrUrbanPermanent',
                type: 'RADIO_GROUP',
                label: {
                  defaultMessage: ' ',
                  description: 'Empty label for form field',
                  id: 'form.field.label.emptyLabel'
                },
                options: [
                  {
                    label: {
                      defaultMessage: 'Urban',
                      id: 'form.field.label.urban',
                      description: 'Label for form field checkbox option Urban'
                    },
                    value: 'URBAN'
                  },
                  {
                    label: {
                      defaultMessage: 'Rural',
                      id: 'form.field.label.rural',
                      description: 'Label for form field checkbox option Rural'
                    },
                    value: 'RURAL'
                  }
                ],
                initialValue: 'URBAN',
                flexDirection: 'row',
                previewGroup: 'permanentAddress',
                hideValueInPreview: true,
                required: false,
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 7]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 7]
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressChiefPermanent',
                type: 'TEXT',
                label: {
                  id: 'form.field.label.addressChief',
                  defaultMessage: 'Chief',
                  description: 'The lable for form field chief'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "RURAL"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 6]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 6]
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine4CityOptionPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.addressLine4CityOption'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 4]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
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
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 3 option 2',
                  id: 'form.field.label.addressLine3CityOption'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 3]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 3]
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine2CityOptionPermanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street / Plot Number',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine2CityOption'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 2]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 2]
                      }
                    ]
                  }
                }
              },
              {
                name: 'numberOptionPermanent',
                type: 'NUMBER',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "URBAN"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 1]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 1]
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1Permanent',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1'
                },
                previewGroup: 'permanentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePermanent'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPermanent'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPermanent !== "RURAL"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['PERMANENT', 5]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['PERMANENT', 5]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalState',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['CURRENT', 0, 'state']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['CURRENT', 0, 'state']
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrict',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['CURRENT', 0, 'district']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['CURRENT', 0, 'district']
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCity',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['CURRENT', 0, 'city']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['CURRENT', 0, 'city']
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine1',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['CURRENT', 8]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['CURRENT', 8]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine2',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['CURRENT', 9]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['CURRENT', 9]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine3',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['CURRENT', 10]
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['CURRENT', 10]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalPostcode',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'currentAddress',
                required: false,
                initialValue: '',
                validate: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.country)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueNestingTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'fieldToAddressTransformer',
                        parameters: ['CURRENT', 0, 'postalCode']
                      },
                      'address'
                    ]
                  },
                  query: {
                    operation: 'nestedValueToFieldTransformer',
                    parameters: [
                      'individual',
                      {
                        operation: 'addressToFieldTransformer',
                        parameters: ['CURRENT', 0, 'postalCode']
                      }
                    ]
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'permanentAddress',
                label: {
                  defaultMessage: 'Residential address',
                  description:
                    'Preview groups label for form field: residential address',
                  id: 'form.field.previewGroups.permanentAddress'
                },
                fieldToRedirect: 'countryPermanent'
              },
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
        id: 'father',
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
        id: 'mother',
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
        id: 'spouse',
        viewType: 'form',
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
                size: 'large',
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
        id: 'documents',
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
                extraValue: 'APPLICANT_ID_PROOF',
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
