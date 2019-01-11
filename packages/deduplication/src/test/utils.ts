export const mockFhirBundle = {
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
      fullUrl: 'urn:uuid:f6b08f54-669b-49a6-bf56-e974be8c05cf',
      resource: {
        resourceType: 'Task',
        status: 'requested',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'birth-registration'
            }
          ]
        },
        focus: {
          reference: 'urn:uuid:ce9e8d62-335e-458d-9fcc-45ec5836c404'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/paper-form-id',
            value: '12'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          }
        ],
        lastModified: '2019-01-07T12:27:38.918Z',
        note: [
          {
            text: '',
            time: '2019-01-07T12:27:38.918Z'
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:5e63d942-b948-4274-9219-65b501074220',
      resource: {
        resourceType: 'DocumentReference',
        masterIdentifier: {
          system: 'urn:ietf:rfc:3986',
          value: '5e63d942-b948-4274-9219-65b501074220'
        },
        status: 'current',
        content: [
          {
            attachment: {
              contentType: 'image/png',
              data: 'asd'
            }
          }
        ],
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/supporting-doc-type',
              code: 'NATIONAL_ID'
            }
          ]
        },
        subject: {
          display: 'MOTHER'
        }
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
            given: [''],
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
            given: [''],
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
        birthDate: '1960-02-01',
        maritalStatus: {
          coding: [
            {
              system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
              code: 'M'
            }
          ],
          text: 'MARRIED'
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/date-of-marriage',
            valueDateTime: '1985-01-01'
          },
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
          },
          {
            url: 'http://opencrvs.org/specs/extension/educational-attainment',
            valueString: 'NO_SCHOOLING'
          }
        ],
        multipleBirthInteger: 1,
        address: [
          {
            type: 'PERMANENT',
            line: ['', '', '', 'upazila1'],
            district: 'district2',
            state: 'state2',
            postalCode: '',
            country: 'BGD'
          },
          {
            type: 'CURRENT',
            line: ['', '', '', 'upazila2'],
            district: 'district2',
            state: 'state2',
            postalCode: '',
            country: 'BGD'
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:74fa59b6-ee75-41f1-af30-4edb73b73a00',
      resource: {
        resourceType: 'Encounter',
        status: 'finished'
      }
    },
    {
      fullUrl: 'urn:uuid:150a23c6-a949-4d08-be0e-f8c1ec40df61',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:74fa59b6-ee75-41f1-af30-4edb73b73a00'
        },
        category: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/observation-category',
                code: 'procedure',
                display: 'Procedure'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '57722-1',
              display: 'Birth plurality of Pregnancy'
            }
          ]
        },
        valueQuantity: {
          value: 'SINGLE'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:7b5c9ac0-dd8d-42bc-b907-7280f53b3898',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:74fa59b6-ee75-41f1-af30-4edb73b73a00'
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
              code: '3141-9',
              display: 'Body weight Measured'
            }
          ]
        },
        valueQuantity: {
          value: 1,
          unit: 'kg',
          system: 'http://unitsofmeasure.org',
          code: 'kg'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:682c3456-ecc9-4757-b74c-44d4cecb38ac',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:74fa59b6-ee75-41f1-af30-4edb73b73a00'
        },
        category: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/observation-category',
                code: 'procedure',
                display: 'Procedure'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '73764-3',
              display: 'Birth attendant title'
            }
          ]
        },
        valueString: 'OTHER'
      }
    },
    {
      fullUrl: 'urn:uuid:620d9795-fc3f-4661-b600-fcce30d4d6f0',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:74fa59b6-ee75-41f1-af30-4edb73b73a00'
        },
        category: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/observation-category',
                code: 'procedure',
                display: 'Procedure'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: 'present-at-birth-reg',
              display: 'Present at birth registration'
            }
          ]
        },
        valueString: 'MOTHER_ONLY'
      }
    }
  ],
  meta: {
    lastUpdated: '2019-01-07T12:27:38.918Z'
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
