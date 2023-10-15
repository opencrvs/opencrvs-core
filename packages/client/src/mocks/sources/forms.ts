const forms = {
  version: 'v1.0.0',
  birth: {
    sections: [
      {
        id: 'registration',
        viewType: 'hidden',
        name: {
          defaultMessage: 'Registration',
          description: 'Form section name for Registration',
          id: 'form.section.declaration.name'
        },
        groups: [],
        mapping: {
          template: [
            {
              fieldName: 'registrationNumber',
              operation: 'registrationNumberTransformer'
            },
            {
              fieldName: 'qrCode',
              operation: 'QRCodeTransformer'
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
        id: 'information',
        viewType: 'form',
        name: {
          defaultMessage: 'Information',
          description: 'Form section name for Information',
          id: 'form.section.information.name'
        },
        groups: [
          {
            id: 'information-group',
            title: {
              defaultMessage:
                'Introduce the birth registration process to the informant',
              description: 'Event information title for the birth',
              id: 'register.eventInfo.birth.title'
            },
            conditionals: [
              {
                action: 'hide',
                expression:
                  'window.config.HIDE_BIRTH_EVENT_REGISTER_INFORMATION'
              }
            ],
            fields: [
              {
                name: 'list',
                type: 'BULLET_LIST',
                items: [
                  {
                    defaultMessage:
                      'I am going to help you make a declaration of birth.',
                    description: 'Form information for birth',
                    id: 'form.section.information.birth.bullet1'
                  },
                  {
                    defaultMessage:
                      'As the legal Informant it is important that all the information provided by you is accurate.',
                    description: 'Form information for birth',
                    id: 'form.section.information.birth.bullet2'
                  },
                  {
                    defaultMessage:
                      'Once the declaration is processed you will receive you will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
                    description: 'Form information for birth',
                    id: 'form.section.information.birth.bullet3'
                  },
                  {
                    defaultMessage:
                      'Make sure you collect the certificate. A birth certificate is critical for this child, especially to make their life easy later on. It will help to access health services, school examinations and government benefits.',
                    description: 'Form information for birth',
                    id: 'form.section.information.birth.bullet4'
                  }
                ],
                label: {
                  id: 'register.eventInfo.birth.title'
                },
                initialValue: '',
                validator: []
              }
            ]
          }
        ]
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
        mapping: {
          template: [
            {
              fieldName: 'birthConfigurableIdentifier1',
              operation: 'childIdentityToFieldTransformer',
              parameters: [['BIRTH_CONFIGURABLE_IDENTIFIER_1']]
            },
            {
              fieldName: 'birthConfigurableIdentifier2',
              operation: 'childIdentityToFieldTransformer',
              parameters: [['BIRTH_CONFIGURABLE_IDENTIFIER_2']]
            },
            {
              fieldName: 'birthConfigurableIdentifier3',
              operation: 'childIdentityToFieldTransformer',
              parameters: [['BIRTH_CONFIGURABLE_IDENTIFIER_3']]
            }
          ],
          mutation: {
            operation: 'childFieldToIdentityTransformer',
            parameters: [
              [
                'BIRTH_CONFIGURABLE_IDENTIFIER_1',
                'BIRTH_CONFIGURABLE_IDENTIFIER_2',
                'BIRTH_CONFIGURABLE_IDENTIFIER_3'
              ]
            ]
          },
          query: {
            operation: 'childIdentityToFieldTransformer',
            parameters: [
              [
                'BIRTH_CONFIGURABLE_IDENTIFIER_1',
                'BIRTH_CONFIGURABLE_IDENTIFIER_2',
                'BIRTH_CONFIGURABLE_IDENTIFIER_3'
              ]
            ]
          }
        },
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
                  description: 'Label for form field: First names',
                  id: 'form.field.label.firstNames'
                },
                conditionals: [],
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
                conditionals: [],
                type: 'TEXT',
                label: {
                  defaultMessage: 'Last name',
                  description: 'Label for family name text input',
                  id: 'form.field.label.familyName'
                },
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
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Sex',
                  description: 'Label for form field: Sex name',
                  id: 'form.field.label.sex'
                },
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                mapping: {
                  template: {
                    fieldName: 'childGender',
                    operation: 'selectTransformer'
                  }
                },
                options: [
                  {
                    value: 'male',
                    label: {
                      defaultMessage: 'Male',
                      description: 'Option for form field: Sex name',
                      id: 'form.field.label.sexMale'
                    }
                  },
                  {
                    value: 'female',
                    label: {
                      defaultMessage: 'Female',
                      description: 'Option for form field: Sex name',
                      id: 'form.field.label.sexFemale'
                    }
                  },
                  {
                    value: 'unknown',
                    label: {
                      defaultMessage: 'Unknown',
                      description: 'Option for form field: Sex name',
                      id: 'form.field.label.sexUnknown'
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
                  id: 'form.field.label.dateOfBirth'
                },
                required: true,
                conditionals: [],
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
                name: 'place-of-birth',
                type: 'DIVIDER',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
                initialValue: '',
                ignoreBottomMargin: true,
                validator: []
              },
              {
                name: 'placeOfBirth',
                type: 'SELECT_WITH_OPTIONS',
                previewGroup: 'placeOfBirth',
                ignoreFieldLabelOnErrorMessage: true,
                label: {
                  defaultMessage: 'Place of delivery',
                  description: 'Title for place of birth sub section',
                  id: 'form.field.label.placeOfBirthPreview'
                },
                required: true,
                initialValue: '',
                validator: [],
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
                      defaultMessage: 'Residential address',
                      description: 'Select item for Private Home',
                      id: 'form.field.label.privateHome'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Select item for Other location',
                      id: 'form.field.label.otherInstitution'
                    }
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth'
                      }
                    ]
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
                  defaultMessage: 'Health Institution',
                  description: 'Select item for Health Institution',
                  id: 'form.field.label.healthInstitution'
                },
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
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationIDQueryTransformer',
                    parameters: []
                  }
                }
              },
              {
                name: 'countryPlaceofbirth',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'placeOfBirth',
                required: true,
                initialValue: 'FAR',
                validator: [],
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
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'countryPlaceofbirth',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['country']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        transformedFieldName: 'country'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'country'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofbirth',
                          'internationalStatePlaceofbirth'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofbirth',
                          'locationLevel4Placeofbirth',
                          'locationLevel5Placeofbirth',
                          'districtPlaceofbirth',
                          'statePlaceofbirth'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'statePlaceofbirth',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'placeOfBirth',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPlaceofbirth',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofbirth)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'statePlaceofbirth',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['state']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'state'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofbirth',
                          'internationalStatePlaceofbirth'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofbirth',
                          'locationLevel4Placeofbirth',
                          'locationLevel5Placeofbirth',
                          'districtPlaceofbirth',
                          'statePlaceofbirth'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'districtPlaceofbirth',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'placeOfBirth',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePlaceofbirth',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofbirth)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'districtPlaceofbirth',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['district']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'district'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofbirth',
                          'internationalStatePlaceofbirth'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofbirth',
                          'locationLevel4Placeofbirth',
                          'locationLevel5Placeofbirth',
                          'districtPlaceofbirth',
                          'statePlaceofbirth'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'ruralOrUrbanPlaceofbirth',
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
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofbirth)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofbirth'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        lineNumber: 5
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 5
                      }
                    ]
                  }
                }
              },
              {
                name: 'cityPlaceofbirth',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.cityUrbanOption'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofbirth',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofbirth !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofbirth)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofbirth'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'cityPlaceofbirth',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['city']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'city'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofbirth',
                          'internationalStatePlaceofbirth'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofbirth',
                          'locationLevel4Placeofbirth',
                          'locationLevel5Placeofbirth',
                          'districtPlaceofbirth',
                          'statePlaceofbirth'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1UrbanOptionPlaceofbirth',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1UrbanOption'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofbirth',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofbirth !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofbirth)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofbirth'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1UrbanOptionPlaceofbirth',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [2, 'addressLine1UrbanOptionPlaceofbirth', '']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        lineNumber: 2
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 2
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine2UrbanOptionPlaceofbirth',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street',
                  description: 'Title for the address line 2',
                  id: 'form.field.label.addressLine2UrbanOption'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofbirth',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofbirth !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofbirth)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofbirth'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine2UrbanOptionPlaceofbirth',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [1, 'addressLine2UrbanOptionPlaceofbirth', '']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        lineNumber: 1
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 1
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine3UrbanOptionPlaceofbirth',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofbirth',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofbirth !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofbirth)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofbirth'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine3UrbanOptionPlaceofbirth',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        lineNumber: 0
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 0
                      }
                    ]
                  }
                }
              },
              {
                name: 'postalCodePlaceofbirth',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofbirth',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofbirth !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofbirth)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofbirth'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'postalCodePlaceofbirth',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['postalCode']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'postalCode'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofbirth',
                          'internationalStatePlaceofbirth'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofbirth',
                          'locationLevel4Placeofbirth',
                          'locationLevel5Placeofbirth',
                          'districtPlaceofbirth',
                          'statePlaceofbirth'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1RuralOptionPlaceofbirth',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1RuralOption'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofbirth',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofbirth !== "RURAL"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofbirth)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofbirth'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofbirth'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1RuralOptionPlaceofbirth',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [4, 'addressLine1RuralOptionPlaceofbirth', '']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        lineNumber: 4
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 4
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalStatePlaceofbirth',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'placeOfBirth',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofbirth',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPlaceofbirth)'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalStatePlaceofbirth',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['state']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'state'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofbirth',
                          'internationalStatePlaceofbirth'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofbirth',
                          'locationLevel4Placeofbirth',
                          'locationLevel5Placeofbirth',
                          'districtPlaceofbirth',
                          'statePlaceofbirth'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrictPlaceofbirth',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'placeOfBirth',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofbirth',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPlaceofbirth)'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalDistrictPlaceofbirth',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['district']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'district'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofbirth',
                          'internationalStatePlaceofbirth'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofbirth',
                          'locationLevel4Placeofbirth',
                          'locationLevel5Placeofbirth',
                          'districtPlaceofbirth',
                          'statePlaceofbirth'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCityPlaceofbirth',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofbirth',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPlaceofbirth)'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalCityPlaceofbirth',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['city']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'city'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofbirth',
                          'internationalStatePlaceofbirth'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofbirth',
                          'locationLevel4Placeofbirth',
                          'locationLevel5Placeofbirth',
                          'districtPlaceofbirth',
                          'statePlaceofbirth'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine1Placeofbirth',
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
                validator: [],
                dependency: 'countryPlaceofbirth',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPlaceofbirth)'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine1Placeofbirth',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [6, 'internationalAddressLine1Placeofbirth', '']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        lineNumber: 6
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 6
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine2Placeofbirth',
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
                validator: [],
                dependency: 'countryPlaceofbirth',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPlaceofbirth)'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine2Placeofbirth',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [7, 'internationalAddressLine2Placeofbirth', '']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        lineNumber: 7
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 7
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine3Placeofbirth',
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
                validator: [],
                dependency: 'countryPlaceofbirth',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPlaceofbirth)'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine3Placeofbirth',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [8, 'internationalAddressLine3Placeofbirth', '']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        lineNumber: 8
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 8
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalPostalCodePlaceofbirth',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'placeOfBirth',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofbirth',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPlaceofbirth)'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME"'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalPostalCodePlaceofbirth',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['postalCode']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfBirth',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [{}]
                  }
                }
              },
              {
                name: 'place-of-birth-seperator',
                type: 'DIVIDER',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
                initialValue: '',
                ignoreBottomMargin: true,
                validator: []
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
                validator: [],
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
                      description: 'Label for form field: physician',
                      id: 'form.field.label.physician'
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
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Type of birth',
                  description: 'Label for form field: Type of birth',
                  id: 'form.field.label.birthType'
                },
                required: false,
                initialValue: '',
                validator: [],
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
                label: {
                  defaultMessage: 'Weight at birth',
                  description: 'Label for form field: Weight at birth',
                  id: 'form.field.label.weightAtBirth'
                },
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
              }
            ],
            previewGroups: [
              {
                id: 'childNameInEnglish',
                label: {
                  defaultMessage: 'Full name',
                  description: 'Label for child name in english',
                  id: 'form.preview.group.label.english.name'
                },
                fieldToRedirect: 'familyNameEng',
                delimiter: ' '
              },
              {
                id: 'placeOfBirth',
                label: {
                  defaultMessage: 'Place of delivery',
                  description: 'Title for place of birth sub section',
                  id: 'form.field.label.placeOfBirthPreview'
                },
                fieldToRedirect: 'placeOfBirth'
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
          defaultMessage: "Informant's details?",
          description: 'Form section title for informants',
          id: 'form.section.informant.title'
        },
        groups: [
          {
            id: 'informant-view-group',
            fields: [
              {
                name: 'informantType',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Relationship to child',
                  description: 'Label for Relationship to child',
                  id: 'form.field.label.informantsRelationWithChild'
                },
                required: true,
                hideInPreview: false,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                mapping: {
                  mutation: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: ['registration', 'informantType']
                  },
                  query: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: ['registration', 'informantType']
                  },
                  template: {
                    fieldName: 'informantType',
                    operation: 'selectTransformer'
                  }
                },
                options: [
                  {
                    value: 'MOTHER',
                    label: {
                      defaultMessage: 'Mother',
                      description: 'Label for option mother',
                      id: 'form.field.label.informantRelation.mother'
                    }
                  },
                  {
                    value: 'FATHER',
                    label: {
                      defaultMessage: 'Father',
                      description: 'Label for option father',
                      id: 'form.field.label.informantRelation.father'
                    }
                  },
                  {
                    value: 'GRANDFATHER',
                    label: {
                      defaultMessage: 'Grandfather',
                      description: 'Label for option Grandfather',
                      id: 'form.field.label.informantRelation.grandfather'
                    }
                  },
                  {
                    value: 'GRANDMOTHER',
                    label: {
                      defaultMessage: 'Grandmother',
                      description: 'Label for option Grandmother',
                      id: 'form.field.label.informantRelation.grandmother'
                    }
                  },
                  {
                    value: 'BROTHER',
                    label: {
                      defaultMessage: 'Brother',
                      description: 'Label for option brother',
                      id: 'form.field.label.informantRelation.brother'
                    }
                  },
                  {
                    value: 'SISTER',
                    label: {
                      defaultMessage: 'Sister',
                      description: 'Label for option Sister',
                      id: 'form.field.label.informantRelation.sister'
                    }
                  },
                  {
                    value: 'OTHER_FAMILY_MEMBER',
                    label: {
                      defaultMessage: 'Other family member',
                      description: 'Label for other family member relation',
                      id: 'form.field.label.relationOtherFamilyMember'
                    }
                  },
                  {
                    value: 'LEGAL_GUARDIAN',
                    label: {
                      defaultMessage: 'Legal guardian',
                      description: 'Label for option Legal Guardian',
                      id: 'form.field.label.informantRelation.legalGuardian'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Someone else',
                      description: 'Label for option someone else',
                      id: 'form.field.label.informantRelation.others'
                    }
                  }
                ]
              },
              {
                name: 'otherInformantType',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Relationship to child',
                  description: 'Label for Relationship to child',
                  id: 'form.field.label.informantsRelationWithChild'
                },
                placeholder: {
                  defaultMessage: 'eg. Grandmother',
                  description: 'Relationship place holder',
                  id: 'form.field.label.relationshipPlaceHolder'
                },
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
                    expression: 'values.informantType !== "OTHER"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: ['registration', 'otherInformantType']
                  },
                  query: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: ['registration', 'otherInformantType']
                  }
                }
              },
              {
                name: 'firstNamesEng',
                previewGroup: 'informantNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First name(s)',
                  description: 'Label for form field: First names',
                  id: 'form.field.label.firstNames'
                },
                conditionals: [
                  {
                    action: 'disable',
                    expression:
                      "draftData?.informant?.fieldsModifiedByNidUserInfo?.includes('firstNamesEng')"
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
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
                previewGroup: 'informantNameInEnglish',
                conditionals: [
                  {
                    action: 'disable',
                    expression:
                      "draftData?.informant?.fieldsModifiedByNidUserInfo?.includes('familyNameEng')"
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                type: 'TEXT',
                label: {
                  defaultMessage: 'Last name',
                  description: 'Label for family name text input',
                  id: 'form.field.label.familyName'
                },
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
                name: 'informantBirthDate',
                type: 'DATE',
                label: {
                  defaultMessage: 'Date of birth',
                  description: 'Label for form field: Date of birth',
                  id: 'form.field.label.dateOfBirth'
                },
                required: true,
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.exactDateOfBirthUnknown'
                  },
                  {
                    action: 'disable',
                    expression:
                      "draftData?.informant?.fieldsModifiedByNidUserInfo?.includes('informantBirthDate')"
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
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
                mapping: {
                  template: {
                    operation: 'dateFormatTransformer',
                    fieldName: 'informantBirthDate',
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
                hideInPreview: true,
                required: false,
                hideHeader: true,
                initialValue: false,
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!window.config.DATE_OF_BIRTH_UNKNOWN'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
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
                label: {
                  defaultMessage: 'Age of informant',
                  description: 'Label for form field: Age of informant',
                  id: 'form.field.label.ageOfInformant'
                },
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
                    expression: '!values.exactDateOfBirthUnknown'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                postfix: 'years',
                inputFieldWidth: '78px'
              },
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Nationality',
                  description: 'Label for form field: Nationality',
                  id: 'form.field.label.nationality'
                },
                required: true,
                initialValue: 'FAR',
                validator: [],
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
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'informantNationality',
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
                name: 'informantID',
                type: 'TEXT',
                label: {
                  defaultMessage: 'National ID number (in English)',
                  description: 'Option for form field: Type of ID',
                  id: 'form.field.label.iDTypeNationalID'
                },
                required: false,
                initialValue: '',
                validator: [
                  {
                    operation: 'validIDNumber',
                    parameters: ['NATIONAL_ID']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['deceased.deceasedID']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['mother.iD']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['father.iD']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['groom.iD']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['bride.iD']
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      "const nationalIdSystem =\n          offlineCountryConfig &&\n          offlineCountryConfig.systems.find(s => s.integratingSystemType === 'MOSIP');\n          nationalIdSystem &&\n          nationalIdSystem.settings.openIdProviderBaseUrl &&\n          nationalIdSystem.settings.openIdProhideIfNidIntegrationDisabledviderClientId &&\n          nationalIdSystem.settings.openIdProviderClaims;\n      "
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'informantNID',
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
                name: 'informant-nid-seperator',
                type: 'DIVIDER',
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
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ]
              },
              {
                name: 'primaryAddress',
                type: 'HEADING3',
                label: {
                  defaultMessage: 'Usual place of residence',
                  description: 'Title of the primary adress ',
                  id: 'form.field.label.primaryAddress'
                },
                previewGroup: 'primaryAddress',
                initialValue: '',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ]
              },
              {
                name: 'countryPrimaryInformant',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: 'FAR',
                validator: [],
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
                    action: 'disable',
                    expression:
                      "values?.fieldsModifiedByNidUserInfo?.includes('countryPrimaryInformant')"
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'countryPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'country']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'country'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'country'
                      }
                    ]
                  }
                }
              },
              {
                name: 'statePrimaryInformant',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPrimaryInformant',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'statePrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'state']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  }
                }
              },
              {
                name: 'districtPrimaryInformant',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePrimaryInformant',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'districtPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'district']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  }
                }
              },
              {
                name: 'ruralOrUrbanPrimaryInformant',
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
                previewGroup: 'primaryAddress',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 5
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 5
                      }
                    ]
                  }
                }
              },
              {
                name: 'cityPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.cityUrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'cityPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'city']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1UrbanOptionPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1UrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1UrbanOptionPrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      2,
                      'addressLine1UrbanOptionPrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 2
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 2
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine2UrbanOptionPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street',
                  description: 'Title for the address line 2',
                  id: 'form.field.label.addressLine2UrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine2UrbanOptionPrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      1,
                      'addressLine2UrbanOptionPrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 1
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 1
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine3UrbanOptionPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine3UrbanOptionPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', '']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 0
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 0
                      }
                    ]
                  }
                }
              },
              {
                name: 'postalCodePrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'postalCodePrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'postalCode']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1RuralOptionPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1RuralOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "RURAL"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1RuralOptionPrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      4,
                      'addressLine1RuralOptionPrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 4
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 4
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalStatePrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalStatePrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'state']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrictPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalDistrictPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'district']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCityPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalCityPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'city']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine1PrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine1PrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      6,
                      'internationalAddressLine1PrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 6
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 6
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine2PrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine2PrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      7,
                      'internationalAddressLine2PrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 7
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 7
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine3PrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine3PrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      8,
                      'internationalAddressLine3PrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 8
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 8
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalPostalCodePrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalPostalCodePrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'postalCode']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  }
                }
              },
              {
                name: 'informant-address-seperator',
                type: 'DIVIDER',
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
                      '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'
                  }
                ]
              },
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
                validator: [
                  {
                    operation: 'phoneNumberFormat'
                  }
                ],
                conditionals: [],
                mapping: {
                  mutation: {
                    operation: 'sectionFieldToBundleFieldTransformer',
                    parameters: [
                      'registration.contactPhoneNumber',
                      {
                        operation: 'msisdnTransformer',
                        parameters: ['registration.contactPhoneNumber']
                      }
                    ]
                  },
                  query: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: [
                      'registration',
                      'contactPhoneNumber',
                      {
                        operation: 'localPhoneTransformer',
                        parameters: ['registration.contactPhoneNumber']
                      }
                    ]
                  },
                  template: {
                    fieldName: 'contactPhoneNumber',
                    operation: 'selectTransformer'
                  }
                }
              },
              {
                name: 'registrationEmail',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Email',
                  description: 'Input label for email',
                  id: 'form.field.label.email'
                },
                required: true,
                initialValue: '',
                validator: [
                  {
                    operation: 'emailAddressFormat'
                  }
                ],
                conditionals: [],
                mapping: {
                  mutation: {
                    operation: 'sectionFieldToBundleFieldTransformer',
                    parameters: ['registration.contactEmail']
                  },
                  query: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: ['registration', 'contactEmail']
                  },
                  template: {
                    fieldName: 'contactEmail',
                    operation: 'plainInputTransformer'
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'informantNameInEnglish',
                label: {
                  defaultMessage: 'Full name',
                  description: "Label for informant's name in english",
                  id: 'form.preview.group.label.informant.english.name'
                },
                fieldToRedirect: 'informantFamilyNameEng',
                delimiter: ' '
              },
              {
                id: 'primaryAddress',
                label: {
                  defaultMessage: 'Residential address',
                  description:
                    'Preview groups label for form field: residential address',
                  id: 'form.field.previewGroups.primaryAddress'
                },
                fieldToRedirect: 'countryPrimary'
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
        id: 'mother',
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
        groups: [
          {
            id: 'mother-view-group',
            fields: [
              {
                name: 'detailsExist',
                type: 'CHECKBOX',
                label: {
                  defaultMessage: "Mother's details are not available",
                  description:
                    "Question to ask the user if they have the mother's details",
                  id: 'form.field.label.mothersDetailsExist'
                },
                required: true,
                checkedValue: false,
                uncheckedValue: true,
                hideHeader: true,
                initialValue: true,
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'draftData?.informant?.informantType==="MOTHER"'
                  },
                  {
                    action: 'hideInPreview',
                    expression: 'values.detailsExist'
                  }
                ],
                mapping: {
                  query: {
                    operation: 'booleanTransformer'
                  }
                },
                ignoreBottomMargin: true
              },
              {
                name: 'mother-details-seperator',
                type: 'DIVIDER',
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
                    expression: 'draftData?.informant?.informantType==="MOTHER"'
                  },
                  {
                    action: 'hideInPreview',
                    expression: 'values.detailsExist'
                  }
                ]
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
                label: {
                  defaultMessage: 'Reason',
                  description: 'Label for form field: reasonNotApplying',
                  id: 'form.field.label.reasonNotApplying'
                },
                validator: [],
                initialValue: '',
                required: true,
                mapping: {
                  template: {
                    fieldName: 'motherReasonNotApplying',
                    operation: 'plainInputTransformer'
                  }
                }
              },
              {
                name: 'firstNamesEng',
                previewGroup: 'motherNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First name(s)',
                  description: 'Label for form field: First names',
                  id: 'form.field.label.firstNames'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
                  },
                  {
                    action: 'disable',
                    expression:
                      "draftData?.mother?.fieldsModifiedByNidUserInfo?.includes('firstNamesEng')"
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
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
                  },
                  {
                    action: 'disable',
                    expression:
                      "draftData?.mother?.fieldsModifiedByNidUserInfo?.includes('familyNameEng')"
                  }
                ],
                type: 'TEXT',
                label: {
                  defaultMessage: 'Last name',
                  description: 'Label for family name text input',
                  id: 'form.field.label.familyName'
                },
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
                name: 'motherBirthDate',
                type: 'DATE',
                label: {
                  defaultMessage: 'Date of birth',
                  description: 'Label for form field: Date of birth',
                  id: 'form.field.label.dateOfBirth'
                },
                required: true,
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
                  },
                  {
                    action: 'hide',
                    expression: 'values.exactDateOfBirthUnknown'
                  },
                  {
                    action: 'disable',
                    expression:
                      "draftData?.mother?.fieldsModifiedByNidUserInfo?.includes('motherBirthDate')"
                  }
                ],
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
                hideInPreview: true,
                required: false,
                hideHeader: true,
                initialValue: false,
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!window.config.DATE_OF_BIRTH_UNKNOWN'
                  },
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
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
                label: {
                  defaultMessage: 'Age of mother',
                  description: 'Label for form field: Age of mother',
                  id: 'form.field.label.ageOfMother'
                },
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
                    expression: '!values.exactDateOfBirthUnknown'
                  },
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
                  }
                ],
                postfix: 'years',
                inputFieldWidth: '78px'
              },
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Nationality',
                  description: 'Label for form field: Nationality',
                  id: 'form.field.label.nationality'
                },
                required: true,
                initialValue: 'FAR',
                validator: [],
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
                    expression: '!values.detailsExist'
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
                label: {
                  defaultMessage: 'National ID number (in English)',
                  description: 'Option for form field: Type of ID',
                  id: 'form.field.label.iDTypeNationalID'
                },
                required: false,
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
                      "const nationalIdSystem =\n          offlineCountryConfig &&\n          offlineCountryConfig.systems.find(s => s.integratingSystemType === 'MOSIP');\n          nationalIdSystem &&\n          nationalIdSystem.settings.openIdProviderBaseUrl &&\n          nationalIdSystem.settings.openIdProhideIfNidIntegrationDisabledviderClientId &&\n          nationalIdSystem.settings.openIdProviderClaims;\n      "
                  },
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
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
                name: 'mother-nid-seperator',
                type: 'DIVIDER',
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
                    expression: '!values.detailsExist'
                  }
                ]
              },
              {
                name: 'primaryAddress',
                type: 'HEADING3',
                label: {
                  defaultMessage: 'Usual place of residence',
                  description: 'Title of the primary adress ',
                  id: 'form.field.label.primaryAddress'
                },
                previewGroup: 'primaryAddress',
                initialValue: '',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ]
              },
              {
                name: 'countryPrimaryMother',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: 'FAR',
                validator: [],
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
                    action: 'disable',
                    expression:
                      "values?.fieldsModifiedByNidUserInfo?.includes('countryPrimaryMother')"
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'countryPrimaryMother',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'country']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'country'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'country'
                      }
                    ]
                  }
                }
              },
              {
                name: 'statePrimaryMother',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPrimaryMother',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryMother)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'statePrimaryMother',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'state']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  }
                }
              },
              {
                name: 'districtPrimaryMother',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePrimaryMother',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryMother)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'districtPrimaryMother',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'district']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  }
                }
              },
              {
                name: 'ruralOrUrbanPrimaryMother',
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
                previewGroup: 'primaryAddress',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryMother)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 5
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 5
                      }
                    ]
                  }
                }
              },
              {
                name: 'cityPrimaryMother',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.cityUrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryMother',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryMother !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryMother)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'cityPrimaryMother',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'city']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1UrbanOptionPrimaryMother',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1UrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryMother',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryMother !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryMother)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1UrbanOptionPrimaryMother',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      2,
                      'addressLine1UrbanOptionPrimaryMother',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 2
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 2
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine2UrbanOptionPrimaryMother',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street',
                  description: 'Title for the address line 2',
                  id: 'form.field.label.addressLine2UrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryMother',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryMother !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryMother)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine2UrbanOptionPrimaryMother',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      1,
                      'addressLine2UrbanOptionPrimaryMother',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 1
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 1
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine3UrbanOptionPrimaryMother',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryMother',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryMother !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryMother)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine3UrbanOptionPrimaryMother',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', '']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 0
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 0
                      }
                    ]
                  }
                }
              },
              {
                name: 'postalCodePrimaryMother',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryMother',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryMother !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryMother)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'postalCodePrimaryMother',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'postalCode']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1RuralOptionPrimaryMother',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1RuralOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryMother',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryMother !== "RURAL"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryMother)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryMother'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1RuralOptionPrimaryMother',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      4,
                      'addressLine1RuralOptionPrimaryMother',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 4
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 4
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalStatePrimaryMother',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryMother',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryMother)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalStatePrimaryMother',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'state']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrictPrimaryMother',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryMother',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryMother)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalDistrictPrimaryMother',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'district']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCityPrimaryMother',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryMother',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryMother)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalCityPrimaryMother',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'city']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine1PrimaryMother',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryMother',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryMother)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine1PrimaryMother',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      6,
                      'internationalAddressLine1PrimaryMother',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 6
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 6
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine2PrimaryMother',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryMother',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryMother)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine2PrimaryMother',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      7,
                      'internationalAddressLine2PrimaryMother',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 7
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 7
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine3PrimaryMother',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryMother',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryMother)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine3PrimaryMother',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      8,
                      'internationalAddressLine3PrimaryMother',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 8
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 8
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalPostalCodePrimaryMother',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryMother',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryMother)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalPostalCodePrimaryMother',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'postalCode']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  }
                }
              },
              {
                name: 'mother-address-seperator',
                type: 'DIVIDER',
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
                    expression: '!values.detailsExist'
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
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                mapping: {
                  template: {
                    fieldName: 'motherMaritalStatus',
                    operation: 'selectTransformer'
                  }
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
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
                name: 'educationalAttainment',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Level of education',
                  description: 'Label for form field: Education Attainment',
                  id: 'form.field.label.educationAttainment'
                },
                required: false,
                initialValue: '',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
                  }
                ],
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
                ],
                mapping: {
                  template: {
                    fieldName: 'motherEducationalAttainment',
                    operation: 'selectTransformer'
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
                required: false,
                initialValue: '',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
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
                    expression: '!values.detailsExist'
                  }
                ],
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
                },
                inputFieldWidth: '64px'
              }
            ],
            previewGroups: [
              {
                id: 'motherNameInEnglish',
                label: {
                  defaultMessage: 'Full name',
                  description: "Group label for mother's name in english",
                  id: 'form.preview.group.label.mother.english.name'
                },
                fieldToRedirect: 'familyNameEng',
                delimiter: ' '
              },
              {
                id: 'primaryAddress',
                label: {
                  defaultMessage: 'Residential address',
                  description:
                    'Preview groups label for form field: residential address',
                  id: 'form.field.previewGroups.primaryAddress'
                },
                fieldToRedirect: 'countryPrimary'
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
        id: 'father',
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
        groups: [
          {
            id: 'father-view-group',
            fields: [
              {
                name: 'detailsExist',
                type: 'CHECKBOX',
                label: {
                  defaultMessage: "Father's details are not available",
                  description:
                    "Question to ask the user if they have the father's details",
                  id: 'form.field.label.fathersDetailsExist'
                },
                required: true,
                checkedValue: false,
                uncheckedValue: true,
                hideHeader: true,
                initialValue: true,
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'draftData?.informant?.informantType==="FATHER"'
                  },
                  {
                    action: 'hideInPreview',
                    expression: 'values.detailsExist'
                  }
                ],
                mapping: {
                  query: {
                    operation: 'booleanTransformer'
                  }
                },
                ignoreBottomMargin: true
              },
              {
                name: 'father-details-seperator',
                type: 'DIVIDER',
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
                    expression: 'draftData?.informant?.informantType==="FATHER"'
                  },
                  {
                    action: 'hideInPreview',
                    expression: 'values.detailsExist'
                  }
                ]
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
                label: {
                  defaultMessage: 'Reason',
                  description: 'Label for form field: reasonNotApplying',
                  id: 'form.field.label.reasonNotApplying'
                },
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
                name: 'firstNamesEng',
                previewGroup: 'fatherNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First name(s)',
                  description: 'Label for form field: First names',
                  id: 'form.field.label.firstNames'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
                  },
                  {
                    action: 'disable',
                    expression:
                      "draftData?.father?.fieldsModifiedByNidUserInfo?.includes('firstNamesEng')"
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
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
                  },
                  {
                    action: 'disable',
                    expression:
                      "draftData?.father?.fieldsModifiedByNidUserInfo?.includes('familyNameEng')"
                  }
                ],
                type: 'TEXT',
                label: {
                  defaultMessage: 'Last name',
                  description: 'Label for family name text input',
                  id: 'form.field.label.familyName'
                },
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
                  id: 'form.field.label.dateOfBirth'
                },
                required: true,
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
                  },
                  {
                    action: 'hide',
                    expression: 'values.exactDateOfBirthUnknown'
                  },
                  {
                    action: 'disable',
                    expression:
                      "draftData?.father?.fieldsModifiedByNidUserInfo?.includes('fatherBirthDate')"
                  }
                ],
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
                hideInPreview: true,
                required: false,
                hideHeader: true,
                initialValue: false,
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!window.config.DATE_OF_BIRTH_UNKNOWN'
                  },
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
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
                label: {
                  defaultMessage: 'Age of father',
                  description: 'Label for form field: Age of father',
                  id: 'form.field.label.ageOfFather'
                },
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
                    expression: '!values.exactDateOfBirthUnknown'
                  },
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
                  }
                ],
                postfix: 'years',
                inputFieldWidth: '78px'
              },
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Nationality',
                  description: 'Label for form field: Nationality',
                  id: 'form.field.label.nationality'
                },
                required: true,
                initialValue: 'FAR',
                validator: [],
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
                    expression: '!values.detailsExist'
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
                label: {
                  defaultMessage: 'National ID number (in English)',
                  description: 'Option for form field: Type of ID',
                  id: 'form.field.label.iDTypeNationalID'
                },
                required: false,
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
                      "const nationalIdSystem =\n          offlineCountryConfig &&\n          offlineCountryConfig.systems.find(s => s.integratingSystemType === 'MOSIP');\n          nationalIdSystem &&\n          nationalIdSystem.settings.openIdProviderBaseUrl &&\n          nationalIdSystem.settings.openIdProhideIfNidIntegrationDisabledviderClientId &&\n          nationalIdSystem.settings.openIdProviderClaims;\n      "
                  },
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
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
                name: 'father-nid-seperator',
                type: 'DIVIDER',
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
                    expression: '!values.detailsExist'
                  }
                ]
              },
              {
                name: 'primaryAddress',
                type: 'HEADING3',
                label: {
                  defaultMessage: 'Usual place of residence',
                  description: 'Title of the primary adress ',
                  id: 'form.field.label.primaryAddress'
                },
                previewGroup: 'primaryAddress',
                initialValue: '',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '(draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist'
                  }
                ]
              },
              {
                name: 'primaryAddressSameAsOtherPrimary',
                type: 'RADIO_GROUP',
                label: {
                  defaultMessage: "Same as mother's usual place of residence?",
                  description:
                    "Title for the radio button to select that the persons primary address is the same as the mother's primary address",
                  id: 'form.field.label.primaryAddressSameAsOtherPrimary'
                },
                required: true,
                initialValue: true,
                previewGroup: 'primaryAddress',
                validator: [],
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
                      '(!values.detailsExist || draftData && draftData.mother && !draftData.mother.detailsExist)'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'copyAddressTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      'mother',
                      'PRIMARY_ADDRESS',
                      'father'
                    ]
                  },
                  query: {
                    operation: 'sameAddressFieldTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      'mother',
                      'PRIMARY_ADDRESS',
                      'father'
                    ]
                  }
                }
              },
              {
                name: 'countryPrimaryFather',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: 'FAR',
                validator: [],
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
                    action: 'disable',
                    expression:
                      "values?.fieldsModifiedByNidUserInfo?.includes('countryPrimaryFather')"
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'countryPrimaryFather',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'country']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'country'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'country'
                      }
                    ]
                  }
                }
              },
              {
                name: 'statePrimaryFather',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPrimaryFather',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryFather)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'statePrimaryFather',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'state']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  }
                }
              },
              {
                name: 'districtPrimaryFather',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePrimaryFather',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryFather)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'districtPrimaryFather',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'district']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  }
                }
              },
              {
                name: 'ruralOrUrbanPrimaryFather',
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
                previewGroup: 'primaryAddress',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryFather)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 5
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 5
                      }
                    ]
                  }
                }
              },
              {
                name: 'cityPrimaryFather',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.cityUrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryFather',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryFather !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryFather)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'cityPrimaryFather',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'city']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1UrbanOptionPrimaryFather',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1UrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryFather',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryFather !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryFather)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1UrbanOptionPrimaryFather',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      2,
                      'addressLine1UrbanOptionPrimaryFather',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 2
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 2
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine2UrbanOptionPrimaryFather',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street',
                  description: 'Title for the address line 2',
                  id: 'form.field.label.addressLine2UrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryFather',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryFather !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryFather)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine2UrbanOptionPrimaryFather',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      1,
                      'addressLine2UrbanOptionPrimaryFather',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 1
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 1
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine3UrbanOptionPrimaryFather',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryFather',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryFather !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryFather)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine3UrbanOptionPrimaryFather',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', '']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 0
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 0
                      }
                    ]
                  }
                }
              },
              {
                name: 'postalCodePrimaryFather',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryFather',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryFather !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryFather)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'postalCodePrimaryFather',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'postalCode']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1RuralOptionPrimaryFather',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1RuralOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryFather',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryFather !== "RURAL"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryFather)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryFather'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1RuralOptionPrimaryFather',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      4,
                      'addressLine1RuralOptionPrimaryFather',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 4
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 4
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalStatePrimaryFather',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryFather',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryFather)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalStatePrimaryFather',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'state']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrictPrimaryFather',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryFather',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryFather)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalDistrictPrimaryFather',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'district']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCityPrimaryFather',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryFather',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryFather)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalCityPrimaryFather',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'city']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine1PrimaryFather',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryFather',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryFather)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine1PrimaryFather',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      6,
                      'internationalAddressLine1PrimaryFather',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 6
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 6
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine2PrimaryFather',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryFather',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryFather)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine2PrimaryFather',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      7,
                      'internationalAddressLine2PrimaryFather',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 7
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 7
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine3PrimaryFather',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryFather',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryFather)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine3PrimaryFather',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      8,
                      'internationalAddressLine3PrimaryFather',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 8
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 8
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalPostalCodePrimaryFather',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryFather',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryFather)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(((draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist || values.primaryAddressSameAsOtherPrimary) && !(draftData && draftData.mother && !draftData.mother.detailsExist) || ((!values.detailsExist) && (draftData && draftData.mother && !draftData.mother.detailsExist)))'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalPostalCodePrimaryFather',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'postalCode']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  }
                }
              },
              {
                name: 'father-address-seperator',
                type: 'DIVIDER',
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
                    expression: '!values.detailsExist'
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
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                mapping: {
                  template: {
                    fieldName: 'fatherMaritalStatus',
                    operation: 'selectTransformer'
                  }
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
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
                name: 'educationalAttainment',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Level of education',
                  description: 'Label for form field: Education Attainment',
                  id: 'form.field.label.educationAttainment'
                },
                required: false,
                initialValue: '',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
                  }
                ],
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
                ],
                mapping: {
                  template: {
                    fieldName: 'fatherEducationalAttainment',
                    operation: 'selectTransformer'
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
                required: false,
                initialValue: '',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.detailsExist'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'fatherOccupation',
                    operation: 'plainInputTransformer'
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'fatherNameInEnglish',
                label: {
                  defaultMessage: 'Full name',
                  description: "Group label for father's name in english",
                  id: 'form.preview.group.label.father.english.name'
                },
                fieldToRedirect: 'familyNameEng',
                delimiter: ' '
              },
              {
                id: 'primaryAddress',
                label: {
                  defaultMessage: 'Residential address',
                  description:
                    'Preview groups label for form field: residential address',
                  id: 'form.field.previewGroups.primaryAddress'
                },
                fieldToRedirect: 'countryPrimary'
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
                  defaultMessage: 'The following documents are required',
                  description: 'Documents Paragraph text',
                  id: 'form.section.documents.birth.requirements'
                },
                initialValue: '',
                validator: []
              },
              {
                name: 'uploadDocForChildDOB',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: {
                  defaultMessage: 'Proof of birth',
                  description: 'Label for list item Proof of birth',
                  id: 'form.field.label.proofOfBirth'
                },
                initialValue: '',
                extraValue: 'CHILD',
                hideAsterisk: true,
                validator: [],
                options: [
                  {
                    value: 'NOTIFICATION_OF_BIRTH',
                    label: {
                      defaultMessage: 'Notification of birth',
                      description:
                        'Label for select option Notification of birth',
                      id: 'form.field.label.docTypeChildBirthProof'
                    }
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'eventAttachmentToFieldTransformer'
                  }
                }
              },
              {
                name: 'uploadDocForMother',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: {
                  defaultMessage: "Mother's identity",
                  description: 'Label for list item Mother ID Proof',
                  id: 'form.field.label.proofOfMothersID'
                },
                initialValue: '',
                extraValue: 'MOTHER',
                hideAsterisk: true,
                validator: [],
                options: [
                  {
                    value: 'NATIONAL_ID',
                    label: {
                      defaultMessage: 'National ID',
                      description: 'Label for select option radio option NID',
                      id: 'form.field.label.docTypeNID'
                    }
                  },
                  {
                    value: 'PASSPORT',
                    label: {
                      defaultMessage: 'Passport',
                      description: 'Label for radio option Passport',
                      id: 'form.field.label.docTypePassport'
                    }
                  },
                  {
                    value: 'BIRTH_CERTIFICATE',
                    label: {
                      defaultMessage: 'Birth certificate',
                      description: 'Label for select option birth certificate',
                      id: 'form.field.label.docTypeBirthCert'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Label for radio option Other',
                      id: 'form.field.label.docTypeOther'
                    }
                  }
                ],
                conditionals: [
                  {
                    description:
                      'Hidden for Parent Details none or Mother only',
                    action: 'hide',
                    expression:
                      'draftData && draftData.mother && !draftData.mother.detailsExist'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'eventAttachmentToFieldTransformer'
                  }
                }
              },
              {
                name: 'uploadDocForFather',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: {
                  defaultMessage: "Father's identity",
                  description: 'Label for list item Father ID Proof',
                  id: 'form.field.label.proofOfFathersID'
                },
                initialValue: '',
                extraValue: 'FATHER',
                hideAsterisk: true,
                validator: [],
                options: [
                  {
                    value: 'NATIONAL_ID',
                    label: {
                      defaultMessage: 'National ID',
                      description: 'Label for select option radio option NID',
                      id: 'form.field.label.docTypeNID'
                    }
                  },
                  {
                    value: 'PASSPORT',
                    label: {
                      defaultMessage: 'Passport',
                      description: 'Label for radio option Passport',
                      id: 'form.field.label.docTypePassport'
                    }
                  },
                  {
                    value: 'BIRTH_CERTIFICATE',
                    label: {
                      defaultMessage: 'Birth certificate',
                      description: 'Label for select option birth certificate',
                      id: 'form.field.label.docTypeBirthCert'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Label for radio option Other',
                      id: 'form.field.label.docTypeOther'
                    }
                  }
                ],
                conditionals: [
                  {
                    description:
                      'Hidden for Parent Details none or Father only',
                    action: 'hide',
                    expression:
                      'draftData && draftData.father && !draftData.father.detailsExist'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'eventAttachmentToFieldTransformer'
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
                  id: 'form.field.label.proofOfInformantsID'
                },
                initialValue: '',
                extraValue: 'INFORMANT_ID_PROOF',
                hideAsterisk: true,
                validator: [],
                options: [
                  {
                    value: 'NATIONAL_ID',
                    label: {
                      defaultMessage: 'National ID',
                      description: 'Label for select option radio option NID',
                      id: 'form.field.label.docTypeNID'
                    }
                  },
                  {
                    value: 'PASSPORT',
                    label: {
                      defaultMessage: 'Passport',
                      description: 'Label for radio option Passport',
                      id: 'form.field.label.docTypePassport'
                    }
                  },
                  {
                    value: 'BIRTH_CERTIFICATE',
                    label: {
                      defaultMessage: 'Birth certificate',
                      description: 'Label for select option birth certificate',
                      id: 'form.field.label.docTypeBirthCert'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Label for radio option Other',
                      id: 'form.field.label.docTypeOther'
                    }
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      "draftData?.informant?.informantType === 'MOTHER' || draftData?.informant?.informantType === 'FATHER'"
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'eventAttachmentToFieldTransformer'
                  }
                }
              },
              {
                name: 'uploadDocForProofOfLegalGuardian',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: {
                  defaultMessage: 'Other',
                  description: 'Option for other supporting documents',
                  id: 'form.field.label.otherBirthSupportingDocuments'
                },
                initialValue: '',
                extraValue: 'LEGAL_GUARDIAN_PROOF',
                hideAsterisk: true,
                validator: [],
                options: [
                  {
                    value: 'PROOF_OF_LEGAL_GUARDIANSHIP',
                    label: {
                      defaultMessage: 'Proof of legal guardianship',
                      description:
                        'Label for document option Proof of legal guardianship',
                      id: 'form.field.label.legalGuardianProof'
                    }
                  },
                  {
                    value: 'PROOF_OF_ASSIGNED_RESPONSIBILITY',
                    label: {
                      defaultMessage: 'Proof of assigned responsibility',
                      description:
                        'Label for docuemnt option Proof of assigned responsibility',
                      id: 'form.field.label.assignedResponsibilityProof'
                    }
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
                    operation: 'eventFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'eventAttachmentToFieldTransformer'
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
        viewType: 'hidden',
        name: {
          defaultMessage: 'Registration',
          description: 'Form section name for Registration',
          id: 'form.section.declaration.name'
        },
        groups: [],
        mapping: {
          template: [
            {
              fieldName: 'registrationNumber',
              operation: 'registrationNumberTransformer'
            },
            {
              fieldName: 'qrCode',
              operation: 'QRCodeTransformer'
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
        id: 'information',
        viewType: 'form',
        name: {
          defaultMessage: 'Information',
          description: 'Form section name for Information',
          id: 'form.section.information.name'
        },
        groups: [
          {
            id: 'information-group',
            title: {
              defaultMessage:
                'Introduce the death registration process to the informant',
              description: 'Event information title for the birth',
              id: 'register.eventInfo.death.title'
            },
            conditionals: [
              {
                action: 'hide',
                expression:
                  'window.config.HIDE_DEATH_EVENT_REGISTER_INFORMATION'
              }
            ],
            fields: [
              {
                name: 'list',
                type: 'BULLET_LIST',
                items: [
                  {
                    defaultMessage:
                      'I am going to help you make a declaration of death.',
                    description: 'Form information for birth',
                    id: 'form.section.information.death.bullet1'
                  },
                  {
                    defaultMessage:
                      'As the legal Informant it is important that all the information provided by you is accurate.',
                    description: 'Form information for birth',
                    id: 'form.section.information.death.bullet2'
                  },
                  {
                    defaultMessage:
                      'Once the declaration is processed you will receive you will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
                    description: 'Form information for birth',
                    id: 'form.section.information.death.bullet3'
                  },
                  {
                    defaultMessage:
                      'Make sure you collect the certificate. A death certificate is critical to support with inheritance claims and to resolve the affairs of the deceased e.g. closing bank accounts and setting loans.',
                    description: 'Form information for birth',
                    id: 'form.section.information.death.bullet4'
                  }
                ],
                label: {
                  id: 'register.eventInfo.death.title'
                },
                initialValue: '',
                validator: []
              }
            ]
          }
        ]
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
        groups: [
          {
            id: 'deceased-view-group',
            fields: [
              {
                name: 'firstNamesEng',
                previewGroup: 'deceasedNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First name(s)',
                  description: 'Label for form field: First names',
                  id: 'form.field.label.firstNames'
                },
                conditionals: [],
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
                conditionals: [],
                type: 'TEXT',
                label: {
                  defaultMessage: 'Last name',
                  description: 'Label for family name text input',
                  id: 'form.field.label.familyName'
                },
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
                label: {
                  defaultMessage: 'Sex',
                  description: 'Label for form field: Sex name',
                  id: 'form.field.label.sex'
                },
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
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
                      id: 'form.field.label.sexMale'
                    }
                  },
                  {
                    value: 'female',
                    label: {
                      defaultMessage: 'Female',
                      description: 'Option for form field: Sex name',
                      id: 'form.field.label.sexFemale'
                    }
                  },
                  {
                    value: 'unknown',
                    label: {
                      defaultMessage: 'Unknown',
                      description: 'Option for form field: Sex name',
                      id: 'form.field.label.sexUnknown'
                    }
                  }
                ]
              },
              {
                name: 'deceasedBirthDate',
                type: 'DATE',
                label: {
                  defaultMessage: 'Date of birth',
                  description: 'Label for form field: Date of birth',
                  id: 'form.field.label.dateOfBirth'
                },
                required: true,
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.exactDateOfBirthUnknown'
                  }
                ],
                initialValue: '',
                validator: [
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
                label: {
                  defaultMessage: 'Age of informant',
                  description: 'Label for form field: Age of informant',
                  id: 'form.field.label.ageOfInformant'
                },
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
                    expression: '!values.exactDateOfBirthUnknown'
                  }
                ],
                postfix: 'years',
                inputFieldWidth: '78px'
              },
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Nationality',
                  description: 'Label for form field: Nationality',
                  id: 'form.field.label.nationality'
                },
                required: true,
                initialValue: 'FAR',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: {
                  resource: 'countries'
                },
                conditionals: [],
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
                name: 'deceasedID',
                type: 'TEXT',
                label: {
                  defaultMessage: 'National ID number (in English)',
                  description: 'Option for form field: Type of ID',
                  id: 'form.field.label.iDTypeNationalID'
                },
                required: false,
                initialValue: '',
                validator: [
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
                name: 'maritalStatus',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Marital status',
                  description: 'Label for form field: Marital status',
                  id: 'form.field.label.maritalStatus'
                },
                required: false,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                mapping: {
                  template: {
                    fieldName: 'deceasedMaritalStatus',
                    operation: 'selectTransformer'
                  }
                },
                conditionals: [],
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
                name: 'primaryAddress',
                type: 'HEADING3',
                label: {
                  defaultMessage: 'Usual place of residence',
                  description:
                    'Title for the primary address fields for the deceased',
                  id: 'form.field.label.deceasedPrimaryAddress'
                },
                previewGroup: 'primaryAddress',
                initialValue: '',
                validator: []
              },
              {
                name: 'countryPrimaryDeceased',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: 'FAR',
                validator: [],
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
                    action: 'disable',
                    expression:
                      "values?.fieldsModifiedByNidUserInfo?.includes('countryPrimaryDeceased')"
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'countryPrimaryDeceased',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'country']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'country'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'country'
                      }
                    ]
                  }
                }
              },
              {
                name: 'statePrimaryDeceased',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPrimaryDeceased',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryDeceased)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'statePrimaryDeceased',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'state']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  }
                }
              },
              {
                name: 'districtPrimaryDeceased',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePrimaryDeceased',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryDeceased)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'districtPrimaryDeceased',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'district']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  }
                }
              },
              {
                name: 'ruralOrUrbanPrimaryDeceased',
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
                previewGroup: 'primaryAddress',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryDeceased)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryDeceased'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 5
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 5
                      }
                    ]
                  }
                }
              },
              {
                name: 'cityPrimaryDeceased',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.cityUrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryDeceased',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryDeceased !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryDeceased)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryDeceased'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'cityPrimaryDeceased',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'city']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1UrbanOptionPrimaryDeceased',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1UrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryDeceased',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryDeceased !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryDeceased)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryDeceased'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1UrbanOptionPrimaryDeceased',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      2,
                      'addressLine1UrbanOptionPrimaryDeceased',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 2
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 2
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine2UrbanOptionPrimaryDeceased',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street',
                  description: 'Title for the address line 2',
                  id: 'form.field.label.addressLine2UrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryDeceased',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryDeceased !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryDeceased)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryDeceased'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine2UrbanOptionPrimaryDeceased',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      1,
                      'addressLine2UrbanOptionPrimaryDeceased',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 1
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 1
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine3UrbanOptionPrimaryDeceased',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryDeceased',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryDeceased !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryDeceased)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryDeceased'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine3UrbanOptionPrimaryDeceased',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', '']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 0
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 0
                      }
                    ]
                  }
                }
              },
              {
                name: 'postalCodePrimaryDeceased',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryDeceased',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryDeceased !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryDeceased)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryDeceased'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'postalCodePrimaryDeceased',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'postalCode']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1RuralOptionPrimaryDeceased',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1RuralOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryDeceased',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryDeceased !== "RURAL"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryDeceased)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryDeceased'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryDeceased'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1RuralOptionPrimaryDeceased',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      4,
                      'addressLine1RuralOptionPrimaryDeceased',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 4
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 4
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalStatePrimaryDeceased',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryDeceased',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryDeceased)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalStatePrimaryDeceased',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'state']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrictPrimaryDeceased',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryDeceased',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryDeceased)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalDistrictPrimaryDeceased',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'district']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCityPrimaryDeceased',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryDeceased',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryDeceased)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalCityPrimaryDeceased',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'city']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine1PrimaryDeceased',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryDeceased',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryDeceased)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine1PrimaryDeceased',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      6,
                      'internationalAddressLine1PrimaryDeceased',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 6
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 6
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine2PrimaryDeceased',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryDeceased',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryDeceased)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine2PrimaryDeceased',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      7,
                      'internationalAddressLine2PrimaryDeceased',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 7
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 7
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine3PrimaryDeceased',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryDeceased',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryDeceased)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine3PrimaryDeceased',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      8,
                      'internationalAddressLine3PrimaryDeceased',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 8
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 8
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalPostalCodePrimaryDeceased',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryDeceased',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryDeceased)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalPostalCodePrimaryDeceased',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'postalCode']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'deceasedNameInEnglish',
                label: {
                  defaultMessage: 'Full name',
                  description: 'Label for child name in english',
                  id: 'form.preview.group.label.english.name'
                },
                fieldToRedirect: 'familyNameEng',
                delimiter: ' '
              },
              {
                id: 'primaryAddress',
                label: {
                  defaultMessage: 'Residential address',
                  description:
                    'Preview groups label for form field: residential address',
                  id: 'form.field.previewGroups.primaryAddress'
                },
                fieldToRedirect: 'countryPrimary'
              }
            ]
          }
        ]
      },
      {
        id: 'deathEvent',
        viewType: 'form',
        name: {
          defaultMessage: 'Death event details',
          description: 'Form section name for Death Event',
          id: 'form.section.deathEvent.name'
        },
        title: {
          defaultMessage: 'Death details?',
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
                  defaultMessage: 'Date of death',
                  description: 'Form section title for date of Death Event',
                  id: 'form.section.deathEvent.date'
                },
                required: true,
                conditionals: [],
                initialValue: '',
                validator: [
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
                label: {
                  defaultMessage: 'Manner of death',
                  description: 'Label for form field: Manner of death',
                  id: 'form.field.label.mannerOfDeath'
                },
                required: false,
                initialValue: '',
                validator: [],
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
                    parameters: []
                  },
                  query: {
                    operation: 'bundleFieldToSectionFieldTransformer',
                    parameters: []
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
                label: {
                  defaultMessage: 'Cause of death has been established',
                  description:
                    'Label for form field: Cause of Death Established',
                  id: 'form.field.label.causeOfDeathEstablished'
                },
                required: true,
                checkedValue: 'true',
                uncheckedValue: 'false',
                hideHeader: true,
                initialValue: 'false',
                validator: [],
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
                    fieldName: 'causeOfDeathEstablished',
                    operation: 'plainInputTransformer'
                  }
                }
              },
              {
                name: 'causeOfDeathMethod',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Source of cause of death',
                  description: 'Source of cause of death',
                  id: 'form.field.label.causeOfDeathMethod'
                },
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.causeOfDeathEstablished !== "true"'
                  }
                ],
                options: [
                  {
                    value: 'PHYSICIAN',
                    label: {
                      defaultMessage: 'Physician',
                      description: 'Label for form field: physician',
                      id: 'form.field.label.physician'
                    }
                  },
                  {
                    value: 'LAY_REPORTED',
                    label: {
                      defaultMessage: 'Lay reported',
                      description: 'Label for form field: Lay reported',
                      id: 'form.field.label.layReported'
                    }
                  },
                  {
                    value: 'VERBAL_AUTOPSY',
                    label: {
                      defaultMessage: 'Verbal autopsy',
                      description: 'Option for form field: verbalAutopsy',
                      id: 'form.field.label.verbalAutopsy'
                    }
                  },
                  {
                    value: 'MEDICALLY_CERTIFIED',
                    label: {
                      defaultMessage: 'Medically Certified Cause of Death',
                      description:
                        'Option for form field: Method of Cause of Death',
                      id: 'form.field.label.medicallyCertified'
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
                  },
                  template: {
                    fieldName: 'causeOfDeathMethod',
                    operation: 'selectTransformer'
                  }
                }
              },
              {
                name: 'deathDescription',
                type: 'TEXTAREA',
                label: {
                  defaultMessage: 'Description',
                  description:
                    'Description of cause of death by lay person or verbal autopsy',
                  id: 'form.field.label.deathDescription'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'values.causeOfDeathEstablished !== "true" || values.causeOfDeathMethod !== "LAY_REPORTED" && values.causeOfDeathMethod !== "VERBAL_AUTOPSY"'
                  }
                ],
                initialValue: '',
                validator: [],
                required: true,
                maxLength: 500,
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
                    fieldName: 'deathDescription',
                    operation: 'plainInputTransformer'
                  }
                }
              },
              {
                name: 'placeOfDeathTitle',
                type: 'HEADING3',
                label: {
                  defaultMessage: 'Where did the death occur?',
                  description:
                    'Label for form field: Place of occurrence of death',
                  id: 'form.field.label.placeOfDeath'
                },
                previewGroup: 'placeOfDeath',
                ignoreBottomMargin: false,
                initialValue: '',
                validator: []
              },
              {
                name: 'place-of-death-seperator',
                type: 'DIVIDER',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
                initialValue: '',
                ignoreBottomMargin: true,
                validator: []
              },
              {
                name: 'placeOfDeath',
                type: 'SELECT_WITH_OPTIONS',
                previewGroup: 'placeOfDeath',
                ignoreFieldLabelOnErrorMessage: true,
                label: {
                  defaultMessage: 'Where did the death occur?',
                  description:
                    'Label for form field: Place of occurrence of death',
                  id: 'form.field.label.placeOfDeath'
                },
                required: true,
                initialValue: '',
                validator: [],
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
                    value: 'DECEASED_USUAL_RESIDENCE',
                    label: {
                      defaultMessage: "Deceased's usual place of residence",
                      description:
                        'Option for place of occurrence of death same as deceased primary address  ',
                      id: 'form.field.label.placeOfDeathSameAsPrimary'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Select item for Other location',
                      id: 'form.field.label.otherInstitution'
                    }
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationTypeQueryTransformer',
                    parameters: []
                  }
                }
              },
              {
                name: 'deathLocation',
                type: 'LOCATION_SEARCH_INPUT',
                label: {
                  defaultMessage: 'Health Institution',
                  description: 'Select item for Health Institution',
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
                validator: [
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
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationIDQueryTransformer',
                    parameters: []
                  }
                }
              },
              {
                name: 'countryPlaceofdeath',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'placeOfDeath',
                required: true,
                initialValue: 'FAR',
                validator: [],
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
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'countryPlaceofdeath',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['country']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        transformedFieldName: 'country'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'country'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofdeath',
                          'internationalStatePlaceofdeath'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofdeath',
                          'locationLevel4Placeofdeath',
                          'locationLevel5Placeofdeath',
                          'districtPlaceofdeath',
                          'statePlaceofdeath'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'statePlaceofdeath',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'placeOfDeath',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPlaceofdeath',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofdeath)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'statePlaceofdeath',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['state']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'state'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofdeath',
                          'internationalStatePlaceofdeath'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofdeath',
                          'locationLevel4Placeofdeath',
                          'locationLevel5Placeofdeath',
                          'districtPlaceofdeath',
                          'statePlaceofdeath'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'districtPlaceofdeath',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'placeOfDeath',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePlaceofdeath',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofdeath)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'districtPlaceofdeath',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['district']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'district'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofdeath',
                          'internationalStatePlaceofdeath'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofdeath',
                          'locationLevel4Placeofdeath',
                          'locationLevel5Placeofdeath',
                          'districtPlaceofdeath',
                          'statePlaceofdeath'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'ruralOrUrbanPlaceofdeath',
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
                previewGroup: 'placeOfDeath',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofdeath)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofdeath'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        lineNumber: 5
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 5
                      }
                    ]
                  }
                }
              },
              {
                name: 'cityPlaceofdeath',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.cityUrbanOption'
                },
                previewGroup: 'placeOfDeath',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofdeath',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofdeath !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofdeath)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofdeath'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'cityPlaceofdeath',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['city']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'city'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofdeath',
                          'internationalStatePlaceofdeath'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofdeath',
                          'locationLevel4Placeofdeath',
                          'locationLevel5Placeofdeath',
                          'districtPlaceofdeath',
                          'statePlaceofdeath'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1UrbanOptionPlaceofdeath',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1UrbanOption'
                },
                previewGroup: 'placeOfDeath',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofdeath',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofdeath !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofdeath)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofdeath'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1UrbanOptionPlaceofdeath',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [2, 'addressLine1UrbanOptionPlaceofdeath', '']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        lineNumber: 2
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 2
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine2UrbanOptionPlaceofdeath',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street',
                  description: 'Title for the address line 2',
                  id: 'form.field.label.addressLine2UrbanOption'
                },
                previewGroup: 'placeOfDeath',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofdeath',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofdeath !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofdeath)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofdeath'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine2UrbanOptionPlaceofdeath',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [1, 'addressLine2UrbanOptionPlaceofdeath', '']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        lineNumber: 1
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 1
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine3UrbanOptionPlaceofdeath',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'placeOfDeath',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofdeath',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofdeath !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofdeath)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofdeath'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine3UrbanOptionPlaceofdeath',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        lineNumber: 0
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 0
                      }
                    ]
                  }
                }
              },
              {
                name: 'postalCodePlaceofdeath',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'placeOfDeath',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofdeath',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofdeath !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofdeath)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofdeath'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'postalCodePlaceofdeath',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['postalCode']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'postalCode'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofdeath',
                          'internationalStatePlaceofdeath'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofdeath',
                          'locationLevel4Placeofdeath',
                          'locationLevel5Placeofdeath',
                          'districtPlaceofdeath',
                          'statePlaceofdeath'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1RuralOptionPlaceofdeath',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1RuralOption'
                },
                previewGroup: 'placeOfDeath',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofdeath',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofdeath !== "RURAL"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPlaceofdeath)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofdeath'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofdeath'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1RuralOptionPlaceofdeath',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [4, 'addressLine1RuralOptionPlaceofdeath', '']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        lineNumber: 4
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 4
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalStatePlaceofdeath',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'placeOfDeath',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofdeath',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPlaceofdeath)'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalStatePlaceofdeath',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['state']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'state'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofdeath',
                          'internationalStatePlaceofdeath'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofdeath',
                          'locationLevel4Placeofdeath',
                          'locationLevel5Placeofdeath',
                          'districtPlaceofdeath',
                          'statePlaceofdeath'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrictPlaceofdeath',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'placeOfDeath',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofdeath',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPlaceofdeath)'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalDistrictPlaceofdeath',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['district']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'district'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofdeath',
                          'internationalStatePlaceofdeath'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofdeath',
                          'locationLevel4Placeofdeath',
                          'locationLevel5Placeofdeath',
                          'districtPlaceofdeath',
                          'statePlaceofdeath'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCityPlaceofdeath',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'placeOfDeath',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofdeath',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPlaceofdeath)'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalCityPlaceofdeath',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['city']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'city'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofdeath',
                          'internationalStatePlaceofdeath'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofdeath',
                          'locationLevel4Placeofdeath',
                          'locationLevel5Placeofdeath',
                          'districtPlaceofdeath',
                          'statePlaceofdeath'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine1Placeofdeath',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'placeOfDeath',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofdeath',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPlaceofdeath)'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine1Placeofdeath',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [6, 'internationalAddressLine1Placeofdeath', '']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        lineNumber: 6
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 6
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine2Placeofdeath',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'placeOfDeath',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofdeath',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPlaceofdeath)'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine2Placeofdeath',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [7, 'internationalAddressLine2Placeofdeath', '']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        lineNumber: 7
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 7
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine3Placeofdeath',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'placeOfDeath',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofdeath',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPlaceofdeath)'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine3Placeofdeath',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [8, 'internationalAddressLine3Placeofdeath', '']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        lineNumber: 8
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 8
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalPostalCodePlaceofdeath',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'placeOfDeath',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofdeath',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPlaceofdeath)'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME"'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalPostalCodePlaceofdeath',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['postalCode']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfDeath',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [{}]
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'placeOfDeath',
                label: {
                  defaultMessage: 'Where did the death occur?',
                  description: 'Title for place of death sub section',
                  id: 'form.field.label.placeOfDeath'
                },
                fieldToRedirect: 'placeOfDeath'
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
          defaultMessage: "Informant's details?",
          description: 'Form section title for informants',
          id: 'form.section.informant.title'
        },
        groups: [
          {
            id: 'informant-view-group',
            fields: [
              {
                name: 'informantType',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Informant type',
                  description: 'Who is applying for birth registration',
                  id: 'register.selectInformant.birthInformantTitle'
                },
                required: true,
                previewGroup: 'contactPointGroup',
                hideInPreview: false,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                mapping: {
                  mutation: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: ['registration', 'informantType']
                  },
                  query: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: ['registration', 'informantType']
                  },
                  template: {
                    fieldName: 'informantType',
                    operation: 'selectTransformer'
                  }
                },
                options: [
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
                    value: 'MOTHER',
                    label: {
                      defaultMessage: 'Mother',
                      description: 'Label for option mother',
                      id: 'form.field.label.informantRelation.mother'
                    }
                  },
                  {
                    value: 'FATHER',
                    label: {
                      defaultMessage: 'Father',
                      description: 'Label for option father',
                      id: 'form.field.label.informantRelation.father'
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
                      defaultMessage: 'Someone else',
                      description: 'Label for option someone else',
                      id: 'form.field.label.informantRelation.others'
                    }
                  }
                ]
              },
              {
                name: 'otherInformantType',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Relationship to deceased',
                  description:
                    'Relationship of applicant to the deceased person',
                  id: 'form.section.deceased.relationship'
                },
                placeholder: {
                  defaultMessage: 'eg. Grandmother',
                  description: 'Relationship place holder',
                  id: 'form.field.label.relationshipPlaceHolder'
                },
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
                    expression: 'values.informantType !== "OTHER"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: ['registration', 'otherInformantType']
                  },
                  query: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: ['registration', 'otherInformantType']
                  }
                }
              },
              {
                name: 'firstNamesEng',
                previewGroup: 'informantNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First name(s)',
                  description: 'Label for form field: First names',
                  id: 'form.field.label.firstNames'
                },
                conditionals: [
                  {
                    action: 'disable',
                    expression:
                      "draftData?.informant?.fieldsModifiedByNidUserInfo?.includes('firstNamesEng')"
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
                previewGroup: 'informantNameInEnglish',
                conditionals: [
                  {
                    action: 'disable',
                    expression:
                      "draftData?.informant?.fieldsModifiedByNidUserInfo?.includes('familyNameEng')"
                  }
                ],
                type: 'TEXT',
                label: {
                  defaultMessage: 'Last name',
                  description: 'Label for family name text input',
                  id: 'form.field.label.familyName'
                },
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
                name: 'informantBirthDate',
                type: 'DATE',
                label: {
                  defaultMessage: 'Date of birth',
                  description: 'Label for form field: Date of birth',
                  id: 'form.field.label.dateOfBirth'
                },
                required: true,
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.exactDateOfBirthUnknown'
                  },
                  {
                    action: 'disable',
                    expression:
                      "draftData?.informant?.fieldsModifiedByNidUserInfo?.includes('informantBirthDate')"
                  }
                ],
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
                mapping: {
                  template: {
                    operation: 'dateFormatTransformer',
                    fieldName: 'informantBirthDate',
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
                label: {
                  defaultMessage: 'Age of informant',
                  description: 'Label for form field: Age of informant',
                  id: 'form.field.label.ageOfInformant'
                },
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
                    expression: '!values.exactDateOfBirthUnknown'
                  }
                ],
                postfix: 'years',
                inputFieldWidth: '78px'
              },
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Nationality',
                  description: 'Label for form field: Nationality',
                  id: 'form.field.label.nationality'
                },
                required: true,
                initialValue: 'FAR',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: {
                  resource: 'countries'
                },
                conditionals: [],
                mapping: {
                  template: {
                    fieldName: 'informantNationality',
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
                name: 'informantID',
                type: 'TEXT',
                label: {
                  defaultMessage: 'National ID number (in English)',
                  description: 'Option for form field: Type of ID',
                  id: 'form.field.label.iDTypeNationalID'
                },
                required: false,
                initialValue: '',
                validator: [
                  {
                    operation: 'validIDNumber',
                    parameters: ['NATIONAL_ID']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['deceased.deceasedID']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['mother.iD']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['father.iD']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['groom.iD']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['bride.iD']
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      "const nationalIdSystem =\n          offlineCountryConfig &&\n          offlineCountryConfig.systems.find(s => s.integratingSystemType === 'MOSIP');\n          nationalIdSystem &&\n          nationalIdSystem.settings.openIdProviderBaseUrl &&\n          nationalIdSystem.settings.openIdProhideIfNidIntegrationDisabledviderClientId &&\n          nationalIdSystem.settings.openIdProviderClaims;\n      "
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'informantNID',
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
                name: 'primaryAddressSameAsOtherPrimary',
                type: 'RADIO_GROUP',
                label: {
                  defaultMessage: "Same as deceased's usual place of residence",
                  description:
                    "Label for informant's address to be same as deceased's usual place of residence",
                  id: 'form.field.label.primaryAddressSameAsDeceasedsPrimary'
                },
                required: true,
                initialValue: true,
                previewGroup: 'primaryAddress',
                validator: [],
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
                    parameters: [
                      'PRIMARY_ADDRESS',
                      'deceased',
                      'PRIMARY_ADDRESS',
                      'informant'
                    ]
                  },
                  query: {
                    operation: 'sameAddressFieldTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      'deceased',
                      'PRIMARY_ADDRESS',
                      'informant'
                    ]
                  }
                }
              },
              {
                name: 'primaryAddress',
                type: 'HEADING3',
                label: {
                  defaultMessage: 'Usual place of residence',
                  description:
                    'Title for the primary address fields for the informant',
                  id: 'form.field.label.informantPrimaryAddress'
                },
                previewGroup: 'primaryAddress',
                initialValue: '',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ]
              },
              {
                name: 'countryPrimaryInformant',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: 'FAR',
                validator: [],
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
                    action: 'disable',
                    expression:
                      "values?.fieldsModifiedByNidUserInfo?.includes('countryPrimaryInformant')"
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'countryPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'country']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'country'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'country'
                      }
                    ]
                  }
                }
              },
              {
                name: 'statePrimaryInformant',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPrimaryInformant',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'statePrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'state']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  }
                }
              },
              {
                name: 'districtPrimaryInformant',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePrimaryInformant',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'districtPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'district']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  }
                }
              },
              {
                name: 'ruralOrUrbanPrimaryInformant',
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
                previewGroup: 'primaryAddress',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 5
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 5
                      }
                    ]
                  }
                }
              },
              {
                name: 'cityPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.cityUrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'cityPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'city']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1UrbanOptionPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1UrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1UrbanOptionPrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      2,
                      'addressLine1UrbanOptionPrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 2
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 2
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine2UrbanOptionPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street',
                  description: 'Title for the address line 2',
                  id: 'form.field.label.addressLine2UrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine2UrbanOptionPrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      1,
                      'addressLine2UrbanOptionPrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 1
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 1
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine3UrbanOptionPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine3UrbanOptionPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', '']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 0
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 0
                      }
                    ]
                  }
                }
              },
              {
                name: 'postalCodePrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'postalCodePrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'postalCode']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1RuralOptionPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1RuralOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "RURAL"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1RuralOptionPrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      4,
                      'addressLine1RuralOptionPrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 4
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 4
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalStatePrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalStatePrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'state']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrictPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalDistrictPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'district']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCityPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalCityPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'city']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine1PrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine1PrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      6,
                      'internationalAddressLine1PrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 6
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 6
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine2PrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine2PrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      7,
                      'internationalAddressLine2PrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 7
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 7
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine3PrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine3PrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      8,
                      'internationalAddressLine3PrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 8
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 8
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalPostalCodePrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: 'values.primaryAddressSameAsOtherPrimary'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalPostalCodePrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'postalCode']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  }
                }
              },
              {
                name: 'informant-address-separator',
                type: 'DIVIDER',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
                initialValue: '',
                ignoreBottomMargin: true,
                validator: []
              },
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
                validator: [
                  {
                    operation: 'phoneNumberFormat'
                  }
                ],
                conditionals: [],
                mapping: {
                  mutation: {
                    operation: 'sectionFieldToBundleFieldTransformer',
                    parameters: [
                      'registration.contactPhoneNumber',
                      {
                        operation: 'msisdnTransformer',
                        parameters: ['registration.contactPhoneNumber']
                      }
                    ]
                  },
                  query: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: [
                      'registration',
                      'contactPhoneNumber',
                      {
                        operation: 'localPhoneTransformer',
                        parameters: ['registration.contactPhoneNumber']
                      }
                    ]
                  },
                  template: {
                    fieldName: 'contactPhoneNumber',
                    operation: 'selectTransformer'
                  }
                }
              },
              {
                name: 'registrationEmail',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Email',
                  description: 'Input label for email',
                  id: 'form.field.label.email'
                },
                required: true,
                initialValue: '',
                validator: [
                  {
                    operation: 'emailAddressFormat'
                  }
                ],
                conditionals: [],
                mapping: {
                  mutation: {
                    operation: 'sectionFieldToBundleFieldTransformer',
                    parameters: ['registration.contactEmail']
                  },
                  query: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: ['registration', 'contactEmail']
                  },
                  template: {
                    fieldName: 'contactEmail',
                    operation: 'plainInputTransformer'
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'informantNameInEnglish',
                label: {
                  defaultMessage: 'Full name',
                  description: "Label for informant's name in english",
                  id: 'form.preview.group.label.informant.english.name'
                },
                fieldToRedirect: 'informantFamilyNameEng',
                delimiter: ' '
              },
              {
                id: 'primaryAddress',
                label: {
                  defaultMessage: 'Residential address',
                  description:
                    'Preview groups label for form field: residential address',
                  id: 'form.field.previewGroups.primaryAddress'
                },
                fieldToRedirect: 'countryPrimary'
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
                    'For this death registration, the following documents are required:',
                  description: 'Documents Paragraph text',
                  id: 'form.field.label.deceasedDocumentParagraph'
                },
                initialValue: '',
                validator: []
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
                validator: [],
                options: [
                  {
                    value: 'NATIONAL_ID',
                    label: {
                      defaultMessage: 'National ID',
                      description: 'Label for select option radio option NID',
                      id: 'form.field.label.docTypeNID'
                    }
                  },
                  {
                    value: 'PASSPORT',
                    label: {
                      defaultMessage: 'Passport',
                      description: 'Label for radio option Passport',
                      id: 'form.field.label.docTypePassport'
                    }
                  },
                  {
                    value: 'BIRTH_CERTIFICATE',
                    label: {
                      defaultMessage: 'Birth certificate',
                      description: 'Label for select option birth certificate',
                      id: 'form.field.label.docTypeBirthCert'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Label for radio option Other',
                      id: 'form.field.label.docTypeOther'
                    }
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'eventAttachmentToFieldTransformer'
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
                  id: 'form.field.label.proofOfInformantsID'
                },
                initialValue: '',
                extraValue: 'INFORMANT_ID_PROOF',
                hideAsterisk: true,
                validator: [],
                options: [
                  {
                    value: 'NATIONAL_ID',
                    label: {
                      defaultMessage: 'National ID',
                      description: 'Label for select option radio option NID',
                      id: 'form.field.label.docTypeNID'
                    }
                  },
                  {
                    value: 'PASSPORT',
                    label: {
                      defaultMessage: 'Passport',
                      description: 'Label for radio option Passport',
                      id: 'form.field.label.docTypePassport'
                    }
                  },
                  {
                    value: 'BIRTH_CERTIFICATE',
                    label: {
                      defaultMessage: 'Birth certificate',
                      description: 'Label for select option birth certificate',
                      id: 'form.field.label.docTypeBirthCert'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Label for radio option Other',
                      id: 'form.field.label.docTypeOther'
                    }
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'eventAttachmentToFieldTransformer'
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
                validator: [],
                options: [
                  {
                    value: 'ATTESTED_LETTER_OF_DEATH',
                    label: {
                      defaultMessage: 'Attested letter of death',
                      description:
                        'Label for select option Attested Letter of Death',
                      id: 'form.field.label.docTypeLetterOfDeath'
                    }
                  },
                  {
                    value: 'POLICE_CERTIFICATE_OF_DEATH',
                    label: {
                      defaultMessage: 'Police certificate of death',
                      description:
                        'Label for select option Police death certificate',
                      id: 'form.field.label.docTypePoliceCertificate'
                    }
                  },
                  {
                    value: 'HOSPITAL_CERTIFICATE_OF_DEATH',
                    label: {
                      defaultMessage: 'Hospital certificate of death',
                      description:
                        'Label for select option Hospital certificate of death',
                      id: 'form.field.label.docTypeHospitalDeathCertificate'
                    }
                  },
                  {
                    value: 'CORONERS_REPORT',
                    label: {
                      defaultMessage: "Coroner's report",
                      description: "Label for select option Coroner's report",
                      id: 'form.field.label.docTypeCoronersReport'
                    }
                  },
                  {
                    value: 'BURIAL_RECEIPT',
                    label: {
                      defaultMessage: 'Certified copy of burial receipt',
                      description:
                        'Label for select option Certified Copy of Burial Receipt',
                      id: 'form.field.label.docTypeCopyOfBurialReceipt'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Label for radio option Other',
                      id: 'form.field.label.docTypeOther'
                    }
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'eventAttachmentToFieldTransformer'
                  }
                }
              },
              {
                name: 'uploadDocForCauseOfDeath',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: {
                  defaultMessage: 'Proof of cause of death',
                  description: 'Label for doc section: Proof of cause of death',
                  id: 'form.field.label.causeOfDeathProof'
                },
                initialValue: '',
                extraValue: 'DECEASED_DEATH_CAUSE_PROOF',
                hideAsterisk: true,
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'draftData?.deathEvent?.causeOfDeathEstablished !== "true"'
                  }
                ],
                options: [
                  {
                    value: 'MEDICALLY_CERTIFIED_CAUSE_OF_DEATH',
                    label: {
                      defaultMessage: 'Medically Certified Cause of Death',
                      description:
                        'Option for form field: Method of Cause of Death',
                      id: 'form.field.label.medicallyCertified'
                    }
                  },
                  {
                    value: 'VERBAL_AUTOPSY_REPORT',
                    label: {
                      defaultMessage: 'Verbal autopsy report',
                      description: 'Option for form field: verbalAutopsyReport',
                      id: 'form.field.label.verbalAutopsyReport'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Label for radio option Other',
                      id: 'form.field.label.docTypeOther'
                    }
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'eventAttachmentToFieldTransformer'
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  },
  marriage: {
    sections: [
      {
        id: 'registration',
        viewType: 'hidden',
        name: {
          defaultMessage: 'Registration',
          description: 'Form section name for Registration',
          id: 'form.section.declaration.name'
        },
        groups: [],
        mapping: {
          template: [
            {
              fieldName: 'registrationNumber',
              operation: 'registrationNumberTransformer'
            },
            {
              fieldName: 'qrCode',
              operation: 'QRCodeTransformer'
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
            },
            {
              fieldName: 'groomSignature',
              operation: 'groomSignatureTransformer'
            },
            {
              fieldName: 'brideSignature',
              operation: 'brideSignatureTransformer'
            },
            {
              fieldName: 'witnessOneSignature',
              operation: 'witnessOneSignatureTransformer'
            },
            {
              fieldName: 'witnessTwoSignature',
              operation: 'witnessTwoSignatureTransformer'
            }
          ],
          mutation: {
            operation: 'setMarriageRegistrationSectionTransformer'
          },
          query: {
            operation: 'getMarriageRegistrationSectionTransformer'
          }
        }
      },
      {
        id: 'informant',
        viewType: 'form',
        name: {
          defaultMessage: 'Registration Name',
          description: 'Label for registration name',
          id: 'form.field.label.registrationName'
        },
        title: {
          defaultMessage: "Informant's details",
          description: 'Label for informant details',
          id: 'form.field.label.informantTitle'
        },
        groups: [
          {
            id: 'who-is-applying-view-group',
            title: {
              defaultMessage: 'Who is applying for marriage registration?',
              description: 'Who is applying for marriage registration',
              id: 'register.selectInformant.marriageInformantTitle'
            },
            conditionals: [],
            fields: [
              {
                name: 'informantType',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Informant type',
                  description: 'Who is applying for birth registration',
                  id: 'register.selectInformant.birthInformantTitle'
                },
                required: true,
                hideInPreview: false,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                mapping: {
                  mutation: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: ['registration', 'informantType']
                  },
                  query: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: ['registration', 'informantType']
                  },
                  template: {
                    fieldName: 'informantType',
                    operation: 'selectTransformer'
                  }
                },
                options: [
                  {
                    value: 'GROOM',
                    label: {
                      defaultMessage: 'Groom',
                      description: 'Label for option groom',
                      id: 'form.field.label.informantRelation.groom'
                    }
                  },
                  {
                    value: 'BRIDE',
                    label: {
                      defaultMessage: 'Bride',
                      description: 'Label for option bride',
                      id: 'form.field.label.informantRelation.bride'
                    }
                  },
                  {
                    value: 'HEAD_OF_GROOM_FAMILY',
                    label: {
                      defaultMessage: "Head of groom's family",
                      description:
                        'Form select option for witness relationship',
                      id: 'form.section.groom.headOfGroomFamily'
                    }
                  },
                  {
                    value: 'HEAD_OF_BRIDE_FAMILY',
                    label: {
                      defaultMessage: "Head of bride's family",
                      description:
                        'Form select option for witness relationship',
                      id: 'form.section.bride.headOfBrideFamily'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Someone else',
                      description: 'Label for option someone else',
                      id: 'form.field.label.informantRelation.others'
                    }
                  }
                ]
              },
              {
                name: 'otherInformantType',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Relationship to spouses',
                  description:
                    "Input label for witness's relationship with spouses",
                  id: 'form.field.label.relationshipToSpouses'
                },
                placeholder: {
                  defaultMessage: 'eg. Grandmother',
                  description: 'Relationship place holder',
                  id: 'form.field.label.relationshipPlaceHolder'
                },
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
                    expression: 'values.informantType !== "OTHER"'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: ['registration', 'otherInformantType']
                  },
                  query: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: ['registration', 'otherInformantType']
                  }
                }
              },
              {
                name: 'firstNamesEng',
                previewGroup: 'informantNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First name(s)',
                  description: 'Label for form field: First names',
                  id: 'form.field.label.firstNames'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
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
                previewGroup: 'informantNameInEnglish',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                type: 'TEXT',
                label: {
                  defaultMessage: 'Last name',
                  description: 'Label for family name text input',
                  id: 'form.field.label.familyName'
                },
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
                name: 'informantBirthDate',
                type: 'DATE',
                label: {
                  defaultMessage: 'Date of birth',
                  description: 'Label for form field: Date of birth',
                  id: 'form.field.label.dateOfBirth'
                },
                required: true,
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  },
                  {
                    action: 'hide',
                    expression: 'values.exactDateOfBirthUnknown'
                  }
                ],
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
                mapping: {
                  template: {
                    operation: 'dateFormatTransformer',
                    fieldName: 'informantBirthDate',
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
                hideInPreview: true,
                required: false,
                hideHeader: true,
                initialValue: false,
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!window.config.DATE_OF_BIRTH_UNKNOWN'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
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
                label: {
                  defaultMessage: 'Age of informant',
                  description: 'Label for form field: Age of informant',
                  id: 'form.field.label.ageOfInformant'
                },
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
                    expression: '!values.exactDateOfBirthUnknown'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                postfix: 'years',
                inputFieldWidth: '78px'
              },
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Nationality',
                  description: 'Label for form field: Nationality',
                  id: 'form.field.label.nationality'
                },
                required: true,
                initialValue: 'FAR',
                validator: [],
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
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'informantNationality',
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
                name: 'informantID',
                type: 'TEXT',
                label: {
                  defaultMessage: 'National ID number (in English)',
                  description: 'Option for form field: Type of ID',
                  id: 'form.field.label.iDTypeNationalID'
                },
                required: false,
                initialValue: '',
                validator: [
                  {
                    operation: 'validIDNumber',
                    parameters: ['NATIONAL_ID']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['deceased.deceasedID']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['mother.iD']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['father.iD']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['groom.iD']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['bride.iD']
                  }
                ],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'informantNID',
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
                name: 'primaryAddress',
                type: 'HEADING3',
                label: {
                  defaultMessage: 'Usual place of residence',
                  description: 'Title of the primary adress ',
                  id: 'form.field.label.primaryAddress'
                },
                previewGroup: 'primaryAddress',
                initialValue: '',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ]
              },
              {
                name: 'countryPrimaryInformant',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: 'FAR',
                validator: [],
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
                    action: 'disable',
                    expression:
                      "values?.fieldsModifiedByNidUserInfo?.includes('countryPrimaryInformant')"
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'countryPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'country']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'country'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'country'
                      }
                    ]
                  }
                }
              },
              {
                name: 'statePrimaryInformant',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPrimaryInformant',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'statePrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'state']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  }
                }
              },
              {
                name: 'districtPrimaryInformant',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePrimaryInformant',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'districtPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'district']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  }
                }
              },
              {
                name: 'ruralOrUrbanPrimaryInformant',
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
                previewGroup: 'primaryAddress',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 5
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 5
                      }
                    ]
                  }
                }
              },
              {
                name: 'cityPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.cityUrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'cityPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'city']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1UrbanOptionPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1UrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1UrbanOptionPrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      2,
                      'addressLine1UrbanOptionPrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 2
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 2
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine2UrbanOptionPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street',
                  description: 'Title for the address line 2',
                  id: 'form.field.label.addressLine2UrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine2UrbanOptionPrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      1,
                      'addressLine2UrbanOptionPrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 1
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 1
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine3UrbanOptionPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine3UrbanOptionPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', '']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 0
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 0
                      }
                    ]
                  }
                }
              },
              {
                name: 'postalCodePrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'postalCodePrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'postalCode']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1RuralOptionPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1RuralOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      'values.ruralOrUrbanPrimaryInformant !== "RURAL"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryInformant'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1RuralOptionPrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      4,
                      'addressLine1RuralOptionPrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 4
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 4
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalStatePrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalStatePrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'state']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrictPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalDistrictPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'district']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCityPrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalCityPrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'city']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine1PrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine1PrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      6,
                      'internationalAddressLine1PrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 6
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 6
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine2PrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine2PrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      7,
                      'internationalAddressLine2PrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 7
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 7
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine3PrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine3PrimaryInformant',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      8,
                      'internationalAddressLine3PrimaryInformant',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 8
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 8
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalPostalCodePrimaryInformant',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryInformant',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPrimaryInformant)'
                  },
                  {
                    action: 'hide',
                    expression:
                      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalPostalCodePrimaryInformant',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'postalCode']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  }
                }
              },
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
                validator: [
                  {
                    operation: 'phoneNumberFormat'
                  }
                ],
                conditionals: [],
                mapping: {
                  mutation: {
                    operation: 'sectionFieldToBundleFieldTransformer',
                    parameters: [
                      'registration.contactPhoneNumber',
                      {
                        operation: 'msisdnTransformer',
                        parameters: ['registration.contactPhoneNumber']
                      }
                    ]
                  },
                  query: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: [
                      'registration',
                      'contactPhoneNumber',
                      {
                        operation: 'localPhoneTransformer',
                        parameters: ['registration.contactPhoneNumber']
                      }
                    ]
                  },
                  template: {
                    fieldName: 'contactPhoneNumber',
                    operation: 'selectTransformer'
                  }
                }
              },
              {
                name: 'registrationEmail',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Email',
                  description: 'Input label for email',
                  id: 'form.field.label.email'
                },
                required: true,
                initialValue: '',
                validator: [
                  {
                    operation: 'emailAddressFormat'
                  }
                ],
                conditionals: [],
                mapping: {
                  mutation: {
                    operation: 'sectionFieldToBundleFieldTransformer',
                    parameters: ['registration.contactEmail']
                  },
                  query: {
                    operation: 'fieldValueSectionExchangeTransformer',
                    parameters: ['registration', 'contactEmail']
                  },
                  template: {
                    fieldName: 'contactEmail',
                    operation: 'plainInputTransformer'
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'informantNameInEnglish',
                label: {
                  defaultMessage: 'Full name',
                  description: "Label for informant's name in english",
                  id: 'form.preview.group.label.informant.english.name'
                },
                fieldToRedirect: 'informantFamilyNameEng',
                delimiter: ' '
              },
              {
                id: 'primaryAddress',
                label: {
                  defaultMessage: 'Residential address',
                  description:
                    'Preview groups label for form field: residential address',
                  id: 'form.field.previewGroups.primaryAddress'
                },
                fieldToRedirect: 'countryPrimary'
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
        id: 'groom',
        viewType: 'form',
        name: {
          defaultMessage: 'Groom',
          description: 'Form section name for Groom',
          id: 'form.section.groom.name'
        },
        title: {
          defaultMessage: "Groom's details",
          description: 'Form section title for Groom',
          id: 'form.section.groom.title'
        },
        groups: [
          {
            id: 'groom-view-group',
            fields: [
              {
                name: 'firstNamesEng',
                previewGroup: 'groomNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First name(s)',
                  description: 'Label for form field: First names',
                  id: 'form.field.label.firstNames'
                },
                conditionals: [],
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
                    fieldName: 'groomFirstName',
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
                previewGroup: 'groomNameInEnglish',
                conditionals: [],
                type: 'TEXT',
                label: {
                  defaultMessage: 'Last name',
                  description: 'Label for family name text input',
                  id: 'form.field.label.familyName'
                },
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
                    fieldName: 'groomFamilyName',
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
                name: 'groomBirthDate',
                type: 'DATE',
                label: {
                  defaultMessage: 'Date of birth',
                  description: 'Label for form field: Date of birth',
                  id: 'form.field.label.dateOfBirth'
                },
                required: true,
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.exactDateOfBirthUnknown'
                  }
                ],
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
                    operation: 'isValidDateOfBirthForMarriage',
                    parameters: ['groom', 18]
                  }
                ],
                mapping: {
                  template: {
                    operation: 'dateFormatTransformer',
                    fieldName: 'groomBirthDate',
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
                label: {
                  defaultMessage: 'Age of groom',
                  description: 'Label for form field: Age of groom',
                  id: 'form.field.label.ageOfGroom'
                },
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
                    expression: '!values.exactDateOfBirthUnknown'
                  }
                ],
                postfix: 'years',
                inputFieldWidth: '78px'
              },
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Nationality',
                  description: 'Label for form field: Nationality',
                  id: 'form.field.label.nationality'
                },
                required: true,
                initialValue: 'FAR',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: {
                  resource: 'countries'
                },
                conditionals: [],
                mapping: {
                  template: {
                    fieldName: 'groomNationality',
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
                label: {
                  defaultMessage: 'National ID number (in English)',
                  description: 'Option for form field: Type of ID',
                  id: 'form.field.label.iDTypeNationalID'
                },
                required: false,
                initialValue: '',
                validator: [
                  {
                    operation: 'validIDNumber',
                    parameters: ['NATIONAL_ID']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['bride.iD']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['informant.informantID']
                  }
                ],
                conditionals: [],
                mapping: {
                  template: {
                    fieldName: 'groomNID',
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
                name: 'marriedLastNameEng',
                previewGroup: 'marriedLastNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage:
                    'Last name at birth (if different from above)',
                  description: 'Label for a different last name text input',
                  id: 'form.field.label.lastNameAtBirth'
                },
                maxLength: 32,
                initialValue: '',
                required: false,
                validator: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'groomMarriedLastNameEng',
                    operation: 'nameToFieldTransformer',
                    parameters: ['en', 'marriedLastName']
                  },
                  mutation: {
                    operation: 'fieldToNameTransformer',
                    parameters: ['en', 'marriedLastName']
                  },
                  query: {
                    operation: 'nameToFieldTransformer',
                    parameters: ['en', 'marriedLastName']
                  }
                }
              },
              {
                name: 'primaryAddress',
                type: 'HEADING3',
                label: {
                  defaultMessage: 'Usual place of residence',
                  description: 'Title of the primary adress ',
                  id: 'form.field.label.primaryAddress'
                },
                previewGroup: 'primaryAddress',
                initialValue: '',
                validator: []
              },
              {
                name: 'countryPrimaryGroom',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: 'FAR',
                validator: [],
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
                    action: 'disable',
                    expression:
                      "values?.fieldsModifiedByNidUserInfo?.includes('countryPrimaryGroom')"
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'countryPrimaryGroom',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'country']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'country'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'country'
                      }
                    ]
                  }
                }
              },
              {
                name: 'statePrimaryGroom',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPrimaryGroom',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryGroom)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'statePrimaryGroom',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'state']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  }
                }
              },
              {
                name: 'districtPrimaryGroom',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePrimaryGroom',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryGroom)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'districtPrimaryGroom',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'district']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  }
                }
              },
              {
                name: 'ruralOrUrbanPrimaryGroom',
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
                previewGroup: 'primaryAddress',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryGroom)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryGroom'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 5
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 5
                      }
                    ]
                  }
                }
              },
              {
                name: 'cityPrimaryGroom',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.cityUrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryGroom',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryGroom !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryGroom)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryGroom'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'cityPrimaryGroom',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'city']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1UrbanOptionPrimaryGroom',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1UrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryGroom',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryGroom !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryGroom)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryGroom'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1UrbanOptionPrimaryGroom',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      2,
                      'addressLine1UrbanOptionPrimaryGroom',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 2
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 2
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine2UrbanOptionPrimaryGroom',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street',
                  description: 'Title for the address line 2',
                  id: 'form.field.label.addressLine2UrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryGroom',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryGroom !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryGroom)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryGroom'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine2UrbanOptionPrimaryGroom',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      1,
                      'addressLine2UrbanOptionPrimaryGroom',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 1
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 1
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine3UrbanOptionPrimaryGroom',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryGroom',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryGroom !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryGroom)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryGroom'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine3UrbanOptionPrimaryGroom',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', '']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 0
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 0
                      }
                    ]
                  }
                }
              },
              {
                name: 'postalCodePrimaryGroom',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryGroom',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryGroom !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryGroom)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryGroom'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'postalCodePrimaryGroom',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'postalCode']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1RuralOptionPrimaryGroom',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1RuralOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryGroom',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryGroom !== "RURAL"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryGroom)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryGroom'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryGroom'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1RuralOptionPrimaryGroom',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      4,
                      'addressLine1RuralOptionPrimaryGroom',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 4
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 4
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalStatePrimaryGroom',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryGroom',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryGroom)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalStatePrimaryGroom',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'state']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrictPrimaryGroom',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryGroom',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryGroom)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalDistrictPrimaryGroom',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'district']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCityPrimaryGroom',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryGroom',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryGroom)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalCityPrimaryGroom',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'city']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine1PrimaryGroom',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryGroom',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryGroom)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine1PrimaryGroom',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      6,
                      'internationalAddressLine1PrimaryGroom',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 6
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 6
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine2PrimaryGroom',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryGroom',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryGroom)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine2PrimaryGroom',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      7,
                      'internationalAddressLine2PrimaryGroom',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 7
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 7
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine3PrimaryGroom',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryGroom',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryGroom)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine3PrimaryGroom',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      8,
                      'internationalAddressLine3PrimaryGroom',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 8
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 8
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalPostalCodePrimaryGroom',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryGroom',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryGroom)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalPostalCodePrimaryGroom',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'postalCode']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'groomNameInEnglish',
                label: {
                  defaultMessage: 'Full name',
                  description: "Group label for groom's name in english",
                  id: 'form.preview.group.label.groom.english.name'
                },
                fieldToRedirect: 'familyNameEng',
                delimiter: ' '
              },
              {
                id: 'primaryAddress',
                label: {
                  defaultMessage: 'Residential address',
                  description:
                    'Preview groups label for form field: residential address',
                  id: 'form.field.previewGroups.primaryAddress'
                },
                fieldToRedirect: 'countryPrimary'
              }
            ]
          }
        ]
      },
      {
        id: 'bride',
        viewType: 'form',
        name: {
          defaultMessage: 'Bride',
          description: 'Form section name for Bride',
          id: 'form.section.bride.name'
        },
        title: {
          defaultMessage: "Bride's details",
          description: 'Form section title for Bride',
          id: 'form.section.bride.title'
        },
        groups: [
          {
            id: 'bride-view-group',
            fields: [
              {
                name: 'firstNamesEng',
                previewGroup: 'brideNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First name(s)',
                  description: 'Label for form field: First names',
                  id: 'form.field.label.firstNames'
                },
                conditionals: [],
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
                    fieldName: 'brideFirstName',
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
                previewGroup: 'brideNameInEnglish',
                conditionals: [],
                type: 'TEXT',
                label: {
                  defaultMessage: 'Last name',
                  description: 'Label for family name text input',
                  id: 'form.field.label.familyName'
                },
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
                    fieldName: 'brideFamilyName',
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
                name: 'brideBirthDate',
                type: 'DATE',
                label: {
                  defaultMessage: 'Date of birth',
                  description: 'Label for form field: Date of birth',
                  id: 'form.field.label.dateOfBirth'
                },
                required: true,
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'values.exactDateOfBirthUnknown'
                  }
                ],
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
                    operation: 'isValidDateOfBirthForMarriage',
                    parameters: ['bride', 18]
                  }
                ],
                mapping: {
                  template: {
                    operation: 'dateFormatTransformer',
                    fieldName: 'brideBirthDate',
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
                label: {
                  defaultMessage: 'Age of bride',
                  description: 'Label for form field: Age of bride',
                  id: 'form.field.label.ageOfBride'
                },
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
                    expression: '!values.exactDateOfBirthUnknown'
                  }
                ],
                postfix: 'years',
                inputFieldWidth: '78px'
              },
              {
                name: 'nationality',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Nationality',
                  description: 'Label for form field: Nationality',
                  id: 'form.field.label.nationality'
                },
                required: true,
                initialValue: 'FAR',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: {
                  resource: 'countries'
                },
                conditionals: [],
                mapping: {
                  template: {
                    fieldName: 'brideNationality',
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
                label: {
                  defaultMessage: 'National ID number (in English)',
                  description: 'Option for form field: Type of ID',
                  id: 'form.field.label.iDTypeNationalID'
                },
                required: false,
                initialValue: '',
                validator: [
                  {
                    operation: 'validIDNumber',
                    parameters: ['NATIONAL_ID']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['groom.iD']
                  },
                  {
                    operation: 'duplicateIDNumber',
                    parameters: ['informant.informantID']
                  }
                ],
                conditionals: [],
                mapping: {
                  template: {
                    fieldName: 'brideNID',
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
                name: 'marriedLastNameEng',
                previewGroup: 'marriedLastNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage:
                    'Last name at birth (if different from above)',
                  description: 'Label for a different last name text input',
                  id: 'form.field.label.lastNameAtBirth'
                },
                maxLength: 32,
                initialValue: '',
                required: false,
                validator: [
                  {
                    operation: 'englishOnlyNameFormat'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'brideMarriedLastNameEng',
                    operation: 'nameToFieldTransformer',
                    parameters: ['en', 'marriedLastName']
                  },
                  mutation: {
                    operation: 'fieldToNameTransformer',
                    parameters: ['en', 'marriedLastName']
                  },
                  query: {
                    operation: 'nameToFieldTransformer',
                    parameters: ['en', 'marriedLastName']
                  }
                }
              },
              {
                name: 'primaryAddress',
                type: 'HEADING3',
                label: {
                  defaultMessage: 'Usual place of residence',
                  description: 'Title of the primary adress ',
                  id: 'form.field.label.primaryAddress'
                },
                previewGroup: 'primaryAddress',
                initialValue: '',
                validator: []
              },
              {
                name: 'countryPrimaryBride',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: 'FAR',
                validator: [],
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
                    action: 'disable',
                    expression:
                      "values?.fieldsModifiedByNidUserInfo?.includes('countryPrimaryBride')"
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'countryPrimaryBride',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'country']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'country'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'country'
                      }
                    ]
                  }
                }
              },
              {
                name: 'statePrimaryBride',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPrimaryBride',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryBride)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'statePrimaryBride',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'state']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  }
                }
              },
              {
                name: 'districtPrimaryBride',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePrimaryBride',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryBride)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'districtPrimaryBride',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'district']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  }
                }
              },
              {
                name: 'ruralOrUrbanPrimaryBride',
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
                previewGroup: 'primaryAddress',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryBride)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryBride'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 5
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 5
                      }
                    ]
                  }
                }
              },
              {
                name: 'cityPrimaryBride',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.cityUrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryBride',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryBride !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryBride)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryBride'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'cityPrimaryBride',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'city']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1UrbanOptionPrimaryBride',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1UrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryBride',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryBride !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryBride)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryBride'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1UrbanOptionPrimaryBride',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      2,
                      'addressLine1UrbanOptionPrimaryBride',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 2
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 2
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine2UrbanOptionPrimaryBride',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street',
                  description: 'Title for the address line 2',
                  id: 'form.field.label.addressLine2UrbanOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryBride',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryBride !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryBride)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryBride'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine2UrbanOptionPrimaryBride',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      1,
                      'addressLine2UrbanOptionPrimaryBride',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 1
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 1
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine3UrbanOptionPrimaryBride',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryBride',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryBride !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryBride)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryBride'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine3UrbanOptionPrimaryBride',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', '']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 0
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 0
                      }
                    ]
                  }
                }
              },
              {
                name: 'postalCodePrimaryBride',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryBride',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryBride !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryBride)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryBride'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'postalCodePrimaryBride',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'postalCode']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1RuralOptionPrimaryBride',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1RuralOption'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPrimaryBride',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPrimaryBride !== "RURAL"'
                  },
                  {
                    action: 'hide',
                    expression: '!isDefaultCountry(values.countryPrimaryBride)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePrimaryBride'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPrimaryBride'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1RuralOptionPrimaryBride',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      4,
                      'addressLine1RuralOptionPrimaryBride',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 4
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 4
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalStatePrimaryBride',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryBride',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryBride)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalStatePrimaryBride',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'state']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'state'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrictPrimaryBride',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'primaryAddress',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryBride',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryBride)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalDistrictPrimaryBride',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'district']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'district'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCityPrimaryBride',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryBride',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryBride)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalCityPrimaryBride',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'city']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'city'
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine1PrimaryBride',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryBride',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryBride)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine1PrimaryBride',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      6,
                      'internationalAddressLine1PrimaryBride',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 6
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 6
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine2PrimaryBride',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryBride',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryBride)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine2PrimaryBride',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      7,
                      'internationalAddressLine2PrimaryBride',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 7
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 7
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine3PrimaryBride',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryBride',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryBride)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine3PrimaryBride',
                    operation: 'addressLineTemplateTransformer',
                    parameters: [
                      'PRIMARY_ADDRESS',
                      8,
                      'internationalAddressLine3PrimaryBride',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 8
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        lineNumber: 8
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalPostalCodePrimaryBride',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'primaryAddress',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPrimaryBride',
                conditionals: [
                  {
                    action: 'hide',
                    expression: 'isDefaultCountry(values.countryPrimaryBride)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalPostalCodePrimaryBride',
                    operation: 'addressFHIRPropertyTemplateTransformer',
                    parameters: ['PRIMARY_ADDRESS', 'postalCode']
                  },
                  mutation: {
                    operation: 'addressMutationTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'addressQueryTransformer',
                    parameters: [
                      {
                        useCase: 'PRIMARY_ADDRESS',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'brideNameInEnglish',
                label: {
                  defaultMessage: 'Full name',
                  description: "Group label for bride's name in english",
                  id: 'form.preview.group.label.bride.english.name'
                },
                fieldToRedirect: 'familyNameEng',
                delimiter: ' '
              },
              {
                id: 'primaryAddress',
                label: {
                  defaultMessage: 'Residential address',
                  description:
                    'Preview groups label for form field: residential address',
                  id: 'form.field.previewGroups.primaryAddress'
                },
                fieldToRedirect: 'countryPrimary'
              }
            ]
          }
        ]
      },
      {
        id: 'marriageEvent',
        viewType: 'form',
        name: {
          defaultMessage: 'Marriage event details',
          description: 'Form section name for Marriage Event',
          id: 'form.section.marriageEvent.name'
        },
        title: {
          defaultMessage: 'Marriage details?',
          description: 'Form section title for Marriage Event',
          id: 'form.section.marriageEvent.title'
        },
        groups: [
          {
            id: 'marriage-event-details',
            fields: [
              {
                name: 'marriageDate',
                type: 'DATE',
                label: {
                  defaultMessage: 'Date of marriage',
                  description: 'Form section title for date of Marriage Event',
                  id: 'form.section.marriageEvent.date'
                },
                required: true,
                initialValue: '',
                validator: [
                  {
                    operation: 'checkMarriageDate',
                    parameters: [18]
                  }
                ],
                mapping: {
                  template: {
                    operation: 'marriageDateFormatTransformation',
                    fieldName: 'eventDate',
                    parameters: ['en', 'do MMMM yyyy', ['bride', 'groom']]
                  },
                  mutation: {
                    operation: 'fieldToMarriageDateTransformation',
                    parameters: [
                      ['bride', 'groom'],
                      {
                        operation: 'longDateTransformer',
                        parameters: []
                      }
                    ]
                  },
                  query: {
                    operation: 'marriageDateToFieldTransformation',
                    parameters: [['bride', 'groom']]
                  }
                }
              },
              {
                name: 'typeOfMarriage',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Type of marriage',
                  description: 'Option for form field: Type of marriage',
                  id: 'form.field.label.typeOfMarriage'
                },
                required: false,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: [
                  {
                    value: 'MONOGAMY',
                    label: {
                      defaultMessage: 'Monogamous',
                      description: 'Option for form field: Monogamy',
                      id: 'form.field.label.monogamy'
                    }
                  },
                  {
                    value: 'POLYGAMY',
                    label: {
                      defaultMessage: 'Polygamous',
                      description: 'Option for form field: Polygamy',
                      id: 'form.field.label.polygamy'
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
                  },
                  template: {
                    fieldName: 'typeOfMarriage',
                    operation: 'selectTransformer'
                  }
                }
              },
              {
                name: 'placeOfMarriageTitle',
                type: 'HEADING3',
                label: {
                  defaultMessage: 'Place of marriage',
                  description:
                    'Label for form field: Place of occurrence of marriage',
                  id: 'form.field.label.placeOfMarriage'
                },
                previewGroup: 'placeOfMarriage',
                ignoreBottomMargin: true,
                initialValue: '',
                validator: []
              },
              {
                name: 'place-of-marriage-seperator',
                type: 'DIVIDER',
                label: {
                  defaultMessage: ' ',
                  description: 'empty string',
                  id: 'form.field.label.empty'
                },
                initialValue: '',
                ignoreBottomMargin: true,
                validator: []
              },
              {
                name: 'countryPlaceofmarriage',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Country',
                  description: 'Title for the country select',
                  id: 'form.field.label.country'
                },
                previewGroup: 'placeOfMarriage',
                required: true,
                initialValue: 'FAR',
                validator: [],
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
                    expression: ''
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'countryPlaceofmarriage',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['country']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        transformedFieldName: 'country'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'country'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofmarriage',
                          'internationalStatePlaceofmarriage'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofmarriage',
                          'locationLevel4Placeofmarriage',
                          'locationLevel5Placeofmarriage',
                          'districtPlaceofmarriage',
                          'statePlaceofmarriage'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'statePlaceofmarriage',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the state select',
                  id: 'form.field.label.state'
                },
                previewGroup: 'placeOfMarriage',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'countryPlaceofmarriage',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: ''
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPlaceofmarriage)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'statePlaceofmarriage',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['state']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'state'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofmarriage',
                          'internationalStatePlaceofmarriage'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofmarriage',
                          'locationLevel4Placeofmarriage',
                          'locationLevel5Placeofmarriage',
                          'districtPlaceofmarriage',
                          'statePlaceofmarriage'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'districtPlaceofmarriage',
                type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the district select',
                  id: 'form.field.label.district'
                },
                previewGroup: 'placeOfMarriage',
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                dynamicOptions: {
                  resource: 'locations',
                  dependency: 'statePlaceofmarriage',
                  initialValue: 'agentDefault'
                },
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: ''
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPlaceofmarriage)'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'districtPlaceofmarriage',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['district']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'district'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofmarriage',
                          'internationalStatePlaceofmarriage'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofmarriage',
                          'locationLevel4Placeofmarriage',
                          'locationLevel5Placeofmarriage',
                          'districtPlaceofmarriage',
                          'statePlaceofmarriage'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'ruralOrUrbanPlaceofmarriage',
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
                previewGroup: 'placeOfMarriage',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: ''
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPlaceofmarriage)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofmarriage'
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        lineNumber: 5
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 5
                      }
                    ]
                  }
                }
              },
              {
                name: 'cityPlaceofmarriage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Town',
                  description: 'Title for the address line 4',
                  id: 'form.field.label.cityUrbanOption'
                },
                previewGroup: 'placeOfMarriage',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofmarriage',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: ''
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofmarriage !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPlaceofmarriage)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofmarriage'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'cityPlaceofmarriage',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['city']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'city'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofmarriage',
                          'internationalStatePlaceofmarriage'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofmarriage',
                          'locationLevel4Placeofmarriage',
                          'locationLevel5Placeofmarriage',
                          'districtPlaceofmarriage',
                          'statePlaceofmarriage'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1UrbanOptionPlaceofmarriage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Residential Area',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1UrbanOption'
                },
                previewGroup: 'placeOfMarriage',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofmarriage',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: ''
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofmarriage !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPlaceofmarriage)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofmarriage'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1UrbanOptionPlaceofmarriage',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [
                      2,
                      'addressLine1UrbanOptionPlaceofmarriage',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        lineNumber: 2
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 2
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine2UrbanOptionPlaceofmarriage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Street',
                  description: 'Title for the address line 2',
                  id: 'form.field.label.addressLine2UrbanOption'
                },
                previewGroup: 'placeOfMarriage',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofmarriage',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: ''
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofmarriage !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPlaceofmarriage)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofmarriage'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine2UrbanOptionPlaceofmarriage',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [
                      1,
                      'addressLine2UrbanOptionPlaceofmarriage',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        lineNumber: 1
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 1
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine3UrbanOptionPlaceofmarriage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Number',
                  description: 'Title for the number field',
                  id: 'form.field.label.number'
                },
                previewGroup: 'placeOfMarriage',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofmarriage',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: ''
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofmarriage !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPlaceofmarriage)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofmarriage'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine3UrbanOptionPlaceofmarriage',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        lineNumber: 0
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 0
                      }
                    ]
                  }
                }
              },
              {
                name: 'postalCodePlaceofmarriage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'placeOfMarriage',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofmarriage',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: ''
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofmarriage !== "URBAN"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPlaceofmarriage)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofmarriage'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'postalCodePlaceofmarriage',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['postalCode']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'postalCode'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofmarriage',
                          'internationalStatePlaceofmarriage'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofmarriage',
                          'locationLevel4Placeofmarriage',
                          'locationLevel5Placeofmarriage',
                          'districtPlaceofmarriage',
                          'statePlaceofmarriage'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'addressLine1RuralOptionPlaceofmarriage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Village',
                  description: 'Title for the address line 1',
                  id: 'form.field.label.addressLine1RuralOption'
                },
                previewGroup: 'placeOfMarriage',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'districtPlaceofmarriage',
                conditionals: [
                  {
                    action: 'hide',
                    expression: '!values.countryPlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: ''
                  },
                  {
                    action: 'hide',
                    expression: 'values.ruralOrUrbanPlaceofmarriage !== "RURAL"'
                  },
                  {
                    action: 'hide',
                    expression:
                      '!isDefaultCountry(values.countryPlaceofmarriage)'
                  },
                  {
                    action: 'hide',
                    expression: '!values.statePlaceofmarriage'
                  },
                  {
                    action: 'hide',
                    expression: '!values.districtPlaceofmarriage'
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'addressLine1RuralOptionPlaceofmarriage',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [
                      4,
                      'addressLine1RuralOptionPlaceofmarriage',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        lineNumber: 4
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 4
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalStatePlaceofmarriage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'State',
                  description: 'Title for the international state select',
                  id: 'form.field.label.internationalState'
                },
                previewGroup: 'placeOfMarriage',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofmarriage',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPlaceofmarriage)'
                  },
                  {
                    action: 'hide',
                    expression: ''
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalStatePlaceofmarriage',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['state']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        transformedFieldName: 'state'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'state'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofmarriage',
                          'internationalStatePlaceofmarriage'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofmarriage',
                          'locationLevel4Placeofmarriage',
                          'locationLevel5Placeofmarriage',
                          'districtPlaceofmarriage',
                          'statePlaceofmarriage'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalDistrictPlaceofmarriage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'District',
                  description: 'Title for the international district select',
                  id: 'form.field.label.internationalDistrict'
                },
                previewGroup: 'placeOfMarriage',
                required: true,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofmarriage',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPlaceofmarriage)'
                  },
                  {
                    action: 'hide',
                    expression: ''
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalDistrictPlaceofmarriage',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['district']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        transformedFieldName: 'district'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'district'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofmarriage',
                          'internationalStatePlaceofmarriage'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofmarriage',
                          'locationLevel4Placeofmarriage',
                          'locationLevel5Placeofmarriage',
                          'districtPlaceofmarriage',
                          'statePlaceofmarriage'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalCityPlaceofmarriage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'City / Town',
                  description: 'Title for the international city select',
                  id: 'form.field.label.internationalCity'
                },
                previewGroup: 'placeOfMarriage',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofmarriage',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPlaceofmarriage)'
                  },
                  {
                    action: 'hide',
                    expression: ''
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalCityPlaceofmarriage',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['city']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        transformedFieldName: 'city'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        transformedFieldName: 'city'
                      },
                      {
                        fieldsToIgnoreForLocalAddress: [
                          'internationalDistrictPlaceofmarriage',
                          'internationalStatePlaceofmarriage'
                        ],
                        fieldsToIgnoreForInternationalAddress: [
                          'locationLevel3Placeofmarriage',
                          'locationLevel4Placeofmarriage',
                          'locationLevel5Placeofmarriage',
                          'districtPlaceofmarriage',
                          'statePlaceofmarriage'
                        ]
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine1Placeofmarriage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 1',
                  description:
                    'Title for the international address line 1 select',
                  id: 'form.field.label.internationalAddressLine1'
                },
                previewGroup: 'placeOfMarriage',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofmarriage',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPlaceofmarriage)'
                  },
                  {
                    action: 'hide',
                    expression: ''
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine1Placeofmarriage',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [
                      6,
                      'internationalAddressLine1Placeofmarriage',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        lineNumber: 6
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 6
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine2Placeofmarriage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 2',
                  description:
                    'Title for the international address line 2 select',
                  id: 'form.field.label.internationalAddressLine2'
                },
                previewGroup: 'placeOfMarriage',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofmarriage',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPlaceofmarriage)'
                  },
                  {
                    action: 'hide',
                    expression: ''
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine2Placeofmarriage',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [
                      7,
                      'internationalAddressLine2Placeofmarriage',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        lineNumber: 7
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 7
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalAddressLine3Placeofmarriage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Address Line 3',
                  description:
                    'Title for the international address line 3 select',
                  id: 'form.field.label.internationalAddressLine3'
                },
                previewGroup: 'placeOfMarriage',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofmarriage',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPlaceofmarriage)'
                  },
                  {
                    action: 'hide',
                    expression: ''
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalAddressLine3Placeofmarriage',
                    operation: 'eventLocationAddressLineTemplateTransformer',
                    parameters: [
                      8,
                      'internationalAddressLine3Placeofmarriage',
                      ''
                    ]
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        lineNumber: 8
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [
                      {
                        lineNumber: 8
                      }
                    ]
                  }
                }
              },
              {
                name: 'internationalPostalCodePlaceofmarriage',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Postcode / Zip',
                  description: 'Title for the international postcode',
                  id: 'form.field.label.internationalPostcode'
                },
                previewGroup: 'placeOfMarriage',
                required: false,
                initialValue: '',
                validator: [],
                dependency: 'countryPlaceofmarriage',
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      'isDefaultCountry(values.countryPlaceofmarriage)'
                  },
                  {
                    action: 'hide',
                    expression: ''
                  }
                ],
                mapping: {
                  template: {
                    fieldName: 'internationalPostalCodePlaceofmarriage',
                    operation:
                      'eventLocationAddressFHIRPropertyTemplateTransformer',
                    parameters: ['postalCode']
                  },
                  mutation: {
                    operation: 'eventLocationMutationTransformer',
                    parameters: [
                      {
                        useCase: 'placeOfMarriage',
                        transformedFieldName: 'postalCode'
                      }
                    ]
                  },
                  query: {
                    operation: 'eventLocationQueryTransformer',
                    parameters: [{}]
                  }
                }
              }
            ],
            previewGroups: [
              {
                id: 'placeOfMarriage',
                label: {
                  defaultMessage: 'Place of marriage',
                  description:
                    'Label for form field: Place of occurrence of marriage',
                  id: 'form.field.label.placeOfMarriage'
                },
                fieldToRedirect: 'placeOfMarriage'
              }
            ]
          }
        ]
      },
      {
        id: 'witnessOne',
        viewType: 'form',
        name: {
          defaultMessage: 'Witness',
          description: 'Form section name for Witness',
          id: 'form.section.witness.name'
        },
        title: {
          defaultMessage: 'What are the witnesses one details?',
          description: 'Form section title for witnesses',
          id: 'form.section.witnessOne.title'
        },
        groups: [
          {
            id: 'witness-view-group',
            fields: [
              {
                name: 'firstNamesEng',
                previewGroup: 'witnessOneNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First name(s)',
                  description: 'Label for form field: First names',
                  id: 'form.field.label.firstNames'
                },
                conditionals: [],
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
                    fieldName: 'witnessOneFirstName',
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
                previewGroup: 'witnessOneNameInEnglish',
                conditionals: [],
                type: 'TEXT',
                label: {
                  defaultMessage: 'Last name',
                  description: 'Label for family name text input',
                  id: 'form.field.label.familyName'
                },
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
                    fieldName: 'witnessOneFamilyName',
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
                name: 'relationship',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Relationship to spouses',
                  description:
                    "Input label for witness's relationship with spouses",
                  id: 'form.field.label.relationshipToSpouses'
                },
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: [
                  {
                    value: 'HEAD_OF_GROOM_FAMILY',
                    label: {
                      defaultMessage: "Head of groom's family",
                      description:
                        'Form select option for witness relationship',
                      id: 'form.section.groom.headOfGroomFamily'
                    }
                  },
                  {
                    value: 'HEAD_OF_BRIDE_FAMILY',
                    label: {
                      defaultMessage: "Head of bride's family",
                      description:
                        'Form select option for witness relationship',
                      id: 'form.section.bride.headOfBrideFamily'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Option for form field: Other',
                      id: 'form.field.label.other'
                    }
                  }
                ]
              },
              {
                name: 'otherRelationship',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Other',
                  description: 'Option for form field: Other',
                  id: 'form.field.label.other'
                },
                maxLength: 32,
                required: true,
                initialValue: '',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '(values.relationship!=="OTHER")'
                  }
                ]
              }
            ],
            previewGroups: [
              {
                id: 'witnessOneNameInEnglish',
                label: {
                  defaultMessage: 'Witness One English name',
                  description: 'Label for Witness one name in english',
                  id: 'form.preview.group.label.witness.one.english.name'
                },
                fieldToRedirect: 'witnessOneFamilyNameEng',
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
        id: 'witnessTwo',
        viewType: 'form',
        name: {
          defaultMessage: 'Witness',
          description: 'Form section name for Witness',
          id: 'form.section.witness.name'
        },
        title: {
          defaultMessage: 'What are the witnesses two details?',
          description: 'Form section title for witnesses',
          id: 'form.section.witnessTwo.title'
        },
        groups: [
          {
            id: 'witness-view-group',
            fields: [
              {
                name: 'firstNamesEng',
                previewGroup: 'witnessTwoNameInEnglish',
                type: 'TEXT',
                label: {
                  defaultMessage: 'First name(s)',
                  description: 'Label for form field: First names',
                  id: 'form.field.label.firstNames'
                },
                conditionals: [],
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
                    fieldName: 'witnessTwoFirstName',
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
                previewGroup: 'witnessTwoNameInEnglish',
                conditionals: [],
                type: 'TEXT',
                label: {
                  defaultMessage: 'Last name',
                  description: 'Label for family name text input',
                  id: 'form.field.label.familyName'
                },
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
                    fieldName: 'witnessTwoFamilyName',
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
                name: 'relationship',
                type: 'SELECT_WITH_OPTIONS',
                label: {
                  defaultMessage: 'Relationship to spouses',
                  description:
                    "Input label for witness's relationship with spouses",
                  id: 'form.field.label.relationshipToSpouses'
                },
                required: true,
                initialValue: '',
                validator: [],
                placeholder: {
                  defaultMessage: 'Select',
                  description: 'Placeholder text for a select',
                  id: 'form.field.select.placeholder'
                },
                options: [
                  {
                    value: 'HEAD_OF_GROOM_FAMILY',
                    label: {
                      defaultMessage: "Head of groom's family",
                      description:
                        'Form select option for witness relationship',
                      id: 'form.section.groom.headOfGroomFamily'
                    }
                  },
                  {
                    value: 'HEAD_OF_BRIDE_FAMILY',
                    label: {
                      defaultMessage: "Head of bride's family",
                      description:
                        'Form select option for witness relationship',
                      id: 'form.section.bride.headOfBrideFamily'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Option for form field: Other',
                      id: 'form.field.label.other'
                    }
                  }
                ]
              },
              {
                name: 'otherRelationship',
                type: 'TEXT',
                label: {
                  defaultMessage: 'Other',
                  description: 'Option for form field: Other',
                  id: 'form.field.label.other'
                },
                maxLength: 32,
                required: true,
                initialValue: '',
                validator: [],
                conditionals: [
                  {
                    action: 'hide',
                    expression: '(values.relationship!=="OTHER")'
                  }
                ]
              }
            ],
            previewGroups: [
              {
                id: 'witnessTwoNameInEnglish',
                label: {
                  defaultMessage: 'Full name',
                  description: 'Label for Witness two name in english',
                  id: 'form.preview.group.label.witness.two.english.name'
                },
                fieldToRedirect: 'witnessTwoFamilyNameEng',
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
                  defaultMessage: 'The following documents are required',
                  description: 'Documents Paragraph text',
                  id: 'form.section.documents.birth.requirements'
                },
                initialValue: '',
                validator: []
              },
              {
                name: 'uploadDocForMarriageProof',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: {
                  defaultMessage: 'Notice of intention to marriage',
                  description: 'Label for list item notice of marriage',
                  id: 'form.field.label.proofOfMarriageNotice'
                },
                required: false,
                initialValue: '',
                extraValue: 'MARRIAGE_NOTICE_PROOF',
                hideAsterisk: true,
                conditionals: [],
                validator: [],
                options: [
                  {
                    value: 'MARRIAGE_NOTICE',
                    label: {
                      defaultMessage: 'Notice of marriage',
                      description:
                        'Label for document section for marriage notice',
                      id: 'form.field.label.docTypeMarriageNotice'
                    }
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'eventAttachmentToFieldTransformer'
                  }
                }
              },
              {
                name: 'uploadDocForGroom',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: {
                  defaultMessage: "Proof of Groom's identity",
                  description: 'Label for list item Groom ID Proof',
                  id: 'form.field.label.proofOfGroomsID'
                },
                required: false,
                initialValue: '',
                extraValue: 'GROOM',
                hideAsterisk: true,
                conditionals: [],
                validator: [],
                options: [
                  {
                    value: 'NATIONAL_ID',
                    label: {
                      defaultMessage: 'National ID',
                      description: 'Label for select option radio option NID',
                      id: 'form.field.label.docTypeNID'
                    }
                  },
                  {
                    value: 'PASSPORT',
                    label: {
                      defaultMessage: 'Passport',
                      description: 'Label for radio option Passport',
                      id: 'form.field.label.docTypePassport'
                    }
                  },
                  {
                    value: 'BIRTH_CERTIFICATE',
                    label: {
                      defaultMessage: 'Birth certificate',
                      description: 'Label for select option birth certificate',
                      id: 'form.field.label.docTypeBirthCert'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Label for radio option Other',
                      id: 'form.field.label.docTypeOther'
                    }
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'eventAttachmentToFieldTransformer'
                  }
                }
              },
              {
                name: 'uploadDocForBride',
                type: 'DOCUMENT_UPLOADER_WITH_OPTION',
                label: {
                  defaultMessage: "Proof of Bride's identity",
                  description: 'Label for list item Bride ID Proof',
                  id: 'form.field.label.proofOfBridesID'
                },
                required: false,
                initialValue: '',
                extraValue: 'BRIDE',
                hideAsterisk: true,
                conditionals: [],
                validator: [],
                options: [
                  {
                    value: 'NATIONAL_ID',
                    label: {
                      defaultMessage: 'National ID',
                      description: 'Label for select option radio option NID',
                      id: 'form.field.label.docTypeNID'
                    }
                  },
                  {
                    value: 'PASSPORT',
                    label: {
                      defaultMessage: 'Passport',
                      description: 'Label for radio option Passport',
                      id: 'form.field.label.docTypePassport'
                    }
                  },
                  {
                    value: 'BIRTH_CERTIFICATE',
                    label: {
                      defaultMessage: 'Birth certificate',
                      description: 'Label for select option birth certificate',
                      id: 'form.field.label.docTypeBirthCert'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Label for radio option Other',
                      id: 'form.field.label.docTypeOther'
                    }
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'eventAttachmentToFieldTransformer'
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
                  id: 'form.field.label.proofOfInformantsID'
                },
                required: false,
                initialValue: '',
                extraValue: 'INFORMANT',
                hideAsterisk: true,
                conditionals: [
                  {
                    action: 'hide',
                    expression:
                      "(draftData && draftData.informant && draftData.informant.informantType && (draftData.informant.informantType === 'BRIDE' || draftData.informant.informantType === 'GROOM' ))"
                  }
                ],
                validator: [],
                options: [
                  {
                    value: 'NATIONAL_ID',
                    label: {
                      defaultMessage: 'National ID',
                      description: 'Label for select option radio option NID',
                      id: 'form.field.label.docTypeNID'
                    }
                  },
                  {
                    value: 'PASSPORT',
                    label: {
                      defaultMessage: 'Passport',
                      description: 'Label for radio option Passport',
                      id: 'form.field.label.docTypePassport'
                    }
                  },
                  {
                    value: 'BIRTH_CERTIFICATE',
                    label: {
                      defaultMessage: 'Birth certificate',
                      description: 'Label for select option birth certificate',
                      id: 'form.field.label.docTypeBirthCert'
                    }
                  },
                  {
                    value: 'OTHER',
                    label: {
                      defaultMessage: 'Other',
                      description: 'Label for radio option Other',
                      id: 'form.field.label.docTypeOther'
                    }
                  }
                ],
                mapping: {
                  mutation: {
                    operation: 'eventFieldToAttachmentTransformer'
                  },
                  query: {
                    operation: 'eventAttachmentToFieldTransformer'
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

export default forms
