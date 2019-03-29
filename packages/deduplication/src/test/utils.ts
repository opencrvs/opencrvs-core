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

export const mockSearchResult = {
  took: 1,
  timed_out: false,
  _shards: {
    total: 10,
    successful: 10,
    skipped: 0,
    failed: 0
  },
  hits: {
    total: 6,
    max_score: 1,
    hits: [
      {
        _index: 'ocrvs',
        _type: 'compositions',
        _id: 'BGM9CA2',
        _score: 1,
        _source: {
          childFamilyName: 'Moajjem',
          childFamilyNameLocal: 'মোয়াজ্জেম',
          childDoB: '2011-11-11',
          gender: 'male',
          motherFamilyName: 'Moajjem',
          motherFamilyNameLocal: 'মোয়াজ্জেম',
          motherIdentifier: '11111111111111111'
        }
      }
    ]
  }
}
