export const mockBirthFhirBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:c79e8d62-335e-458d-9fcc-45ec5836c404',
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'c79e8d62-335e-458d-9fcc-45ec5836c404'
        },
        resourceType: 'Composition',
        status: 'preliminary',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'birth-declaration'
            }
          ],
          text: 'Birth Declaration'
        },
        class: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-classes',
              code: 'crvs-document'
            }
          ],
          text: 'CRVS Document'
        },
        title: 'Birth Declaration',
        section: [
          {
            title: 'Supporting documents',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'supporting-documents'
                }
              ],
              text: 'Supporting documents'
            },
            entry: [
              {
                reference: 'urn:uuid:5e63d942-b948-4274-9219-65b501074220'
              }
            ]
          },
          {
            title: 'Child details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'child-details'
                }
              ],
              text: 'Child details'
            },
            entry: [
              {
                reference: 'urn:uuid:847f0c22-0327-4b9c-94f5-b7eae5df124f'
              }
            ]
          },
          {
            title: "Mother's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'mother-details'
                }
              ],
              text: "Mother's details"
            },
            entry: [
              {
                reference: 'urn:uuid:d49fb3c1-4585-484f-9083-04088bfcdafb'
              }
            ]
          },
          {
            title: "Father's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'father-details'
                }
              ],
              text: "Father's details"
            },
            text: '',
            entry: [
              {
                reference: 'urn:uuid:d59fb3c1-4585-484f-9083-04088bfcdafb'
              }
            ]
          },
          {
            title: 'Birth Encounter',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'birth-encounter'
                }
              ],
              text: 'Birth encounter'
            },
            entry: [
              {
                reference: 'urn:uuid:74fa59b6-ee75-41f1-af30-4edb73b73a00'
              }
            ]
          }
        ],
        subject: {},
        date: '2019-01-07T12:27:38.918Z',
        author: []
      }
    },
    {
      fullUrl: 'urn:uuid:847f0c22-0327-4b9c-94f5-b7eae5df124f',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'bn',
            given: ['asdd'],
            family: ['সরর']
          },
          {
            use: 'en',
            given: ['আনিস'],
            family: ['asd']
          }
        ],
        gender: 'male',
        birthDate: '1990-02-01'
      }
    },
    {
      fullUrl: 'urn:uuid:d49fb3c1-4585-484f-9083-04088bfcdafb',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            id: '22123123123123123',
            type: 'PASSPORT'
          }
        ],
        name: [
          {
            use: 'bn',
            given: ['চট্টগ্রাম'],
            family: ['সরকার']
          },
          {
            use: 'en',
            given: ['test'],
            family: ['asd']
          }
        ],
        telecom: [
          {
            system: 'phone',
            value: '01710278466'
          },
          {
            system: 'email',
            value: 'tofael.ahmed@dsinnovators.com'
          }
        ],
        birthDate: '1960-02-01'
      }
    },
    {
      fullUrl: 'urn:uuid:d59fb3c1-4585-484f-9083-04088bfcdafb',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            id: '22123123123123123',
            type: 'PASSPORT'
          }
        ],
        name: [
          {
            use: 'bn',
            given: ['চট্টগ্রাম'],
            family: ['সরকার']
          },
          {
            use: 'en',
            given: ['test'],
            family: ['asd']
          }
        ],
        telecom: [
          {
            system: 'phone',
            value: '01710278466'
          },
          {
            system: 'email',
            value: 'tofael.ahmed@dsinnovators.com'
          }
        ],
        birthDate: '1960-02-01'
      }
    }
  ],
  meta: {
    lastUpdated: '2019-01-07T12:27:38.918Z'
  }
}

export const mockDeathFhirBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:a2e730c8-07c8-4943-b66b-4ef9e4bde7a1',
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'DH86EY1'
        },
        resourceType: 'Composition',
        status: 'preliminary',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'death-declaration'
            }
          ],
          text: 'Death Declaration'
        },
        class: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-classes',
              code: 'crvs-document'
            }
          ],
          text: 'CRVS Document'
        },
        title: 'Death Declaration',
        section: [
          {
            title: 'Deceased details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'deceased-details'
                }
              ],
              text: 'Deceased details'
            },
            entry: [
              {
                reference: 'urn:uuid:6167c7ac-ddde-4c84-ae9f-af3850b9f2bd'
              }
            ]
          },
          {
            title: "Informant's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'informant-details'
                }
              ],
              text: "Informant's details"
            },
            entry: [
              {
                reference: 'urn:uuid:d9dc4e44-987a-4313-89b1-0a71780c6bea'
              }
            ]
          },
          {
            title: 'Death encounter',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'death-encounter'
                }
              ],
              text: 'Death encounter'
            },
            entry: [
              {
                reference: 'urn:uuid:db0f9b0b-1cc8-48bb-b4fc-23584937d5df'
              }
            ]
          }
        ],
        subject: {},
        date: '2019-03-19T13:05:13.524Z',
        author: []
      }
    },
    {
      fullUrl: 'urn:uuid:6167c7ac-ddde-4c84-ae9f-af3850b9f2bd',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '1234567890123',
            type: 'NATIONAL_ID'
          }
        ],
        name: [
          {
            use: 'bn',
            family: ['এলাস্তিচ']
          },
          {
            use: 'en',
            family: ['elastic']
          }
        ],
        gender: 'male',
        birthDate: '1940-01-01',
        maritalStatus: {
          coding: [
            {
              system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
              code: 'M'
            }
          ],
          text: 'MARRIED'
        },
        address: [
          {
            type: 'PERMANENT',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          },
          {
            type: 'CURRENT',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          }
        ],
        deceasedBoolean: true,
        deceasedDateTime: '2019-02-01',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
            extension: [
              {
                url: 'code',
                valueCodeableConcept: {
                  coding: [
                    {
                      system: 'urn:iso:std:iso:3166',
                      code: 'BGD'
                    }
                  ]
                }
              },
              {
                url: 'period',
                valuePeriod: {
                  start: '',
                  end: ''
                }
              }
            ]
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:d9dc4e44-987a-4313-89b1-0a71780c6bea',
      resource: {
        resourceType: 'RelatedPerson',
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'EXTENDED_FAMILY'
            }
          ]
        },
        patient: {
          reference: 'urn:uuid:16d007fa-e516-4f71-8c4e-671c39274d1d'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:16d007fa-e516-4f71-8c4e-671c39274d1d',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '123123123',
            type: 'PASSPORT'
          }
        ],
        name: [
          {
            use: 'bn',
            family: ['এলাস্তিচ']
          },
          {
            use: 'en',
            family: ['elastic']
          }
        ],
        telecom: [
          {
            system: 'phone',
            value: '01711111115'
          }
        ],
        address: [
          {
            type: 'CURRENT',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          },
          {
            type: 'PERMANENT',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          }
        ],
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
            extension: [
              {
                url: 'code',
                valueCodeableConcept: {
                  coding: [
                    {
                      system: 'urn:iso:std:iso:3166',
                      code: 'BGD'
                    }
                  ]
                }
              },
              {
                url: 'period',
                valuePeriod: {
                  start: '',
                  end: ''
                }
              }
            ]
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:db0f9b0b-1cc8-48bb-b4fc-23584937d5df',
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: 'urn:uuid:b11350af-826d-4573-a256-6ecede0d8fd9'
            }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:b11350af-826d-4573-a256-6ecede0d8fd9',
      resource: {
        resourceType: 'Location',
        mode: 'instance',
        partOf: {
          reference: 'Location/ee72f497-343f-4f0f-9062-d618fafc175c'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'PERMANENT'
            }
          ]
        },
        address: {
          type: 'PERMANENT',
          line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
          district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          state: '9a236522-0c3d-40eb-83ad-e8567518c763',
          country: 'BGD'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:3cf94b36-1bba-4914-89ed-1e57230aba47',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:db0f9b0b-1cc8-48bb-b4fc-23584937d5df'
        },
        category: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: 'uncertified-manner-of-death',
              display: 'Uncertified manner of death'
            }
          ]
        },
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/icd-10',
              code: 'NATURAL_CAUSES'
            }
          ]
        }
      }
    },
    {
      fullUrl: 'urn:uuid:cd9330bb-f406-464b-9508-253c727feb31',
      resource: {
        resourceType: 'Task',
        status: 'requested',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'DEATH'
            }
          ]
        },
        focus: {
          reference: 'urn:uuid:a2e730c8-07c8-4943-b66b-4ef9e4bde7a1'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/death-tracking-id',
            value: 'DH86EY1'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'DECLARED'
            }
          ]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/cabb1751-2f1f-48a4-8ff5-31e7b1d79005'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/308c35b4-04f8-4664-83f5-9790e790cde1'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/b49503bf-531d-4642-ae1b-13f647b88ec6'
            }
          }
        ],
        lastModified: '2019-03-19T13:05:19.260Z'
      }
    }
  ],
  meta: {
    lastUpdated: '2019-03-19T13:05:13.524Z'
  }
}

export const mockComposition = {
  identifier: {
    system: 'urn:ietf:rfc:3986',
    value: '{{urn_uuid}}'
  },
  resourceType: 'Composition',
  status: 'preliminary',
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/types',
        code: 'birth-registration'
      }
    ],
    text: 'Birth Registration'
  },
  class: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/classes',
        code: 'crvs-document'
      }
    ],
    text: 'CRVS Document'
  },
  subject: {
    reference: 'Patient/xyz' // A reference to the person being registered, by fullUrl
  },
  date: '{{logicalCompositionDate}}', // declaration date
  author: [
    {
      reference: 'Practitioner/xyz' // CHW that declared the event
    }
  ],
  title: 'Birth Registration',
  section: [
    {
      title: 'Child details',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'child-details'
          }
        ],
        text: 'Child details'
      },
      text: '',
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        },
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        }
      ]
    },

    {
      title: "Mother's details",
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'mother-details'
          }
        ],
        text: "Mother's details"
      },
      text: '',
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        }
      ]
    },

    {
      title: "Father's details",
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'father-details'
          }
        ],
        text: "Father's details"
      },
      text: '',
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        }
      ]
    },

    {
      title: "Informant's details",
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'informant-details'
          }
        ],
        text: "Informant's details"
      },
      text: '',
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        }
      ]
    },

    {
      title: 'Birth Encounter',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'birth-encounter'
          }
        ],
        text: 'Birth encounter'
      },
      text: '',
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to Encounter resource contained below, the encounter may have zero or more observations attached to it
        }
      ]
    },

    {
      title: 'Supporting documents',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'supporting-documents'
          }
        ],
        text: 'Supporting documents'
      },
      text: '',
      entry: [
        {
          reference: 'DocumentReference/xxx' // reference to a DocumentReference resource contained below
        },
        {
          reference: 'DocumentReference/yyy' // reference to a DocumentReference resource contained below
        },
        {
          reference: 'DocumentReference/zzz' // reference to a DocumentReference resource contained below
        }
      ]
    }
  ],
  relatesTo: [
    {
      code: 'duplicate',
      targetReference: {
        reference: 'Composition/xyz'
      }
    },
    {
      code: 'duplicate',
      targetReference: {
        reference: 'Composition/abc'
      }
    }
  ]
}

export const mockSearchResponse = {
  hits: {
    total: 2,
    max_score: 2.7509375,
    hits: [
      {
        _index: 'ocrvs',
        _type: 'compositions',
        _id: 'c99e8d62-335e-458d-9fcc-45ec5836c404',
        _score: 2.7509375,
        _source: {
          childFirstNames: '',
          childFamilyName: 'sarkar',
          childFirstNamesLocal: 'test',
          childFamilyNameLocal: 'সরকার',
          childDoB: '1990-02-01',
          motherFirstNames: '',
          motherFamilyName: 'sarkar',
          motherFirstNamesLocal: 'চট্টগ্রাম',
          motherFamilyNameLocal: 'সরকার',
          motherDoB: '1960-02-01',
          motherIdentifier: '22123123123123123'
        }
      }
    ]
  }
}

export const mockCompositionBody = {
  childFirstNames: '',
  childFamilyName: 'sarkar',
  childFirstNamesLocal: 'test',
  childFamilyNameLocal: 'সরকার',
  childDoB: '1990-02-01',
  motherFirstNames: '',
  motherFamilyName: 'sarkar',
  motherFirstNamesLocal: 'চট্টগ্রাম',
  motherFamilyNameLocal: 'সরকার',
  motherDoB: '1960-02-01',
  motherIdentifier: '22123123123123123'
}

export const mockCompositionEntry = {
  resourceType: 'Bundle',
  id: '9c0dde8d-65b2-49dd-8b7e-5dd0c7c63779',
  meta: {
    lastUpdated: '2019-01-14T10:58:20.694+00:00'
  },
  type: 'searchset',
  total: 1,
  link: [
    {
      relation: 'self',
      url: 'http://localhost:3447/fhir/Composition?identifier=Bt40VoY'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Composition/7b381f4e-2864-441a-9146-faa3929eeaa8',
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'Bt40VoY'
        },
        resourceType: 'Composition',
        status: 'preliminary',
        id: '489b76cf-6b58-4b0d-96ba-caa1271f787b'
      }
    }
  ]
}

export const mockTaskBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/e849ceb4-0adc-4be2-8fc8-8a4c41781bb5',
      resource: {
        resourceType: 'Task',
        status: 'requested',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'BIRTH'
            }
          ]
        },
        id: 'e849ceb4-0adc-4be2-8fc8-8a4c41781bb5'
      }
    }
  ]
}
