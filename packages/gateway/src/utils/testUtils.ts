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
export const mockPatient = {
  resourceType: 'Patient',
  active: true,
  identifier: [
    {
      use: 'official',
      system: '',
      value: ''
    }
  ],
  name: [
    {
      use: 'official',
      prefix: ['Mr'],
      family: ['Matinyana'],
      given: ['Charlton', 'Joseph']
    }
  ],
  gender: 'male',
  birthDate: '1970-07-21',
  telecom: [
    {
      use: '',
      system: 'email',
      value: 'charlton@email.com'
    },
    {
      use: 'mobile',
      system: 'phone',
      value: '27831234567'
    }
  ],
  address: [
    {
      use: 'home',
      type: 'both',
      line: ['2760 Mlosi Street', 'Wallacedene', 'Kraaifontein'],
      state: 'Western Cape',
      city: 'Cape Town',
      postalCode: '7570',
      period: {
        start: '',
        end: ''
      }
    }
  ],
  maritalStatus: {
    coding: [
      {
        system: 'http://hl7.org/fhir/ValueSet/marital-status',
        code: 'M'
      }
    ],
    text: 'Married'
  },
  multipleBirthInteger: 1,
  photo: [
    {
      contentType: '',
      data: '<base64Binary>'
    }
  ],
  deceasedBoolean: 'true',
  deceasedDateTime: '2010-01-01',
  communication: [
    {
      language: {
        coding: [
          {
            system: 'urn:ietf:bcp:47',
            code: 'en'
          }
        ],
        text: 'English'
      },
      preferred: true
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
              { system: 'urn:iso:std:iso:3166', code: 'BN' },
              { system: 'urn:iso:std:iso:3166', code: 'EN' }
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
      url: 'http://opencrvs.org/specs/extension/date-of-marriage',
      valueDateTime: '2014-01-28'
    },
    {
      url: 'http://opencrvs.org/specs/extension/patient-occupation',
      valueString: 'Some Occupation'
    },
    {
      url: 'http://opencrvs.org/specs/extension/educational-attainment',
      valueString: 'SECOND_STAGE_TERTIARY_ISCED_6'
    },
    {
      url: 'http://opencrvs.org/specs/extension/migrant-status',
      valueString: 'RESIDENT'
    }
  ],
  link: [
    {
      type: 'also-see',
      other: {
        reference: 'RelatedPerson/123' // for mother and father for fhir relationship links
      }
    }
  ]
}

export const mockDocumentReference = {
  resourceType: 'DocumentReference',
  masterIdentifier: {
    system: 'urn:ietf:rfc:3986',
    value: 'b9648bdf-fb4e-4216-905f-d7fc3930301d'
  },
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/original-file-name',
      value: 'scan.pdf'
    },
    {
      system: 'http://opencrvs.org/specs/id/system-file-name',
      value: '1234.pdf'
    }
  ],
  status: 'current',
  docStatus: 'final', // 'final' when submitted | 'preliminary' when not validated | 'entered-in-error' when deleted
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/supporting-doc-type',
        code: 'PASSPORT'
      }
    ]
  },
  subject: {
    reference: 'Patient/123', // reference to who this supporting docuemnt is about
    display: 'MOTHER'
  },
  created: '2018-10-18T14:13:03+02:00',
  indexed: '2018-10-18T14:13:03+02:00',
  content: [
    {
      attachment: {
        contentType: 'image/jpeg | image/png | application/pdf',
        data: 'PGJhc2U2NEJpbmFyeT4K'
      }
    }
  ]
}

export const mockUser = {
  type: 'CHAIRMAN',
  role: 'LOCAL_REGISTRAR',
  name: [
    {
      firstNames: 'Kennedy',
      familyName: 'Mweene',
      use: 'en'
    }
  ]
}

export const mockTask = {
  resourceType: 'Task',
  status: 'requested',
  intent: '',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/birth-tracking-id',
      value: '123'
    },
    {
      system: 'http://opencrvs.org/specs/id/birth-registration-number',
      value: '123'
    },
    { system: 'http://opencrvs.org/specs/id/paper-form-id', value: '123' },
    { system: 'http://opencrvs.org/specs/id/paper-form-page', value: '123' },
    { system: 'http://opencrvs.org/specs/id/paper-form-book', value: '123' }
  ],
  businessStatus: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/reg-status',
        code: 'DECLARED | VERIFIED | REGISTERED | CERTIFIED'
      }
    ]
  },
  code: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/types',
        code: 'BIRTH'
      }
    ]
  },
  focus: {
    reference: 'Composition/123' // the composition encompassing this registration
  },
  authoredOn: '2016-10-31T08:25:05+10:00',
  lastModified: '2016-10-31T09:45:05+10:00',
  note: [
    {
      authorString: 'Practitioner/12121212',
      text: 'Comment',
      time: '2016-10-31T09:45:05+10:00'
    }
  ],
  extension: [
    {
      url: 'http://opencrvs.org/specs/extension/regLastUser',
      valueReference: { reference: 'Practitioner/123' }
    },
    {
      url: 'http://opencrvs.org/specs/extension/regLastLocation',
      valueReference: { reference: 'Location/123' }
    },
    {
      url: 'http://opencrvs.org/specs/extension/regLastOffice',
      valueReference: {
        reference: 'Location/43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
      }
    },
    {
      url: 'http://opencrvs.org/specs/extension/contact-person',
      valueString: 'MOTHER'
    },
    {
      url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
      valueString: '01733333333'
    }
  ],
  meta: {
    versionId: '123'
  }
}

export const mockTaskDownloaded = {
  resourceType: 'Task',
  status: 'requested',
  intent: '',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/birth-tracking-id',
      value: '123'
    },
    {
      system: 'http://opencrvs.org/specs/id/birth-registration-number',
      value: '123'
    },
    { system: 'http://opencrvs.org/specs/id/paper-form-id', value: '123' },
    { system: 'http://opencrvs.org/specs/id/paper-form-page', value: '123' },
    { system: 'http://opencrvs.org/specs/id/paper-form-book', value: '123' }
  ],
  businessStatus: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/reg-status',
        code: 'DECLARED'
      }
    ]
  },
  code: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/types',
        code: 'BIRTH'
      }
    ]
  },
  focus: {
    reference: 'Composition/123' // the composition encompassing this registration
  },
  authoredOn: '2016-10-31T08:25:05+10:00',
  lastModified: '2016-10-31T09:45:05+10:00',
  statusReason: {
    text: 'Rejected reason'
  },
  note: [
    {
      authorString: 'Practitioner/12121212',
      text: 'Comment',
      time: '2016-10-31T09:45:05+10:00'
    }
  ],
  extension: [
    {
      url: 'http://opencrvs.org/specs/extension/regLastUser',
      valueReference: { reference: 'Practitioner/123' }
    },
    {
      url: 'http://opencrvs.org/specs/extension/regLastLocation',
      valueReference: { reference: 'Location/123' }
    },
    {
      url: 'http://opencrvs.org/specs/extension/regLastOffice',
      valueReference: {
        reference: 'Location/43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
      }
    },
    {
      url: 'http://opencrvs.org/specs/extension/contact-person',
      valueString: 'MOTHER'
    },
    {
      url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
      valueString: '01733333333'
    },
    {
      url: 'http://opencrvs.org/specs/extension/regDownloaded',
      valueString: 'DECLARED'
    },
    {
      url: 'http://opencrvs.org/specs/extension/regReinstated',
      valueString: '01733333333'
    }
  ],
  meta: {
    versionId: '123',
    lastUpdated: '2016-10-31T09:45:05+10:00'
  }
}

export const mockTaskForDeath = {
  resourceType: 'Task',
  status: 'requested',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/death-tracking-id',
      value: '123'
    },
    {
      system: 'http://opencrvs.org/specs/id/death-registration-number',
      value: '123'
    },
    { system: 'http://opencrvs.org/specs/id/paper-form-id', value: '123' },
    { system: 'http://opencrvs.org/specs/id/paper-form-page', value: '123' },
    { system: 'http://opencrvs.org/specs/id/paper-form-book', value: '123' }
  ],
  businessStatus: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/reg-status',
        code: 'DECLARED | VERIFIED | REGISTERED | CERTIFIED'
      }
    ]
  },
  code: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/types',
        code: 'DEATH'
      }
    ]
  },
  focus: {
    reference: 'Composition/123' // the composition encompassing this registration
  },
  authoredOn: '2016-10-31T08:25:05+10:00',
  lastModified: '2016-10-31T09:45:05+10:00',
  note: [
    {
      authorString: '<username>',
      text: 'Comment',
      time: '2016-10-31T09:45:05+10:00'
    }
  ],
  extension: [
    {
      url: 'http://opencrvs.org/specs/extension/regLastUser',
      valueReference: { reference: 'Practitioner/123' }
    },
    {
      url: 'http://opencrvs.org/specs/extension/regLastLocation',
      valueReference: { reference: 'Location/123' }
    },
    {
      url: 'http://opencrvs.org/specs/extension/regLastOffice',
      valueReference: { reference: 'Location/123' }
    },
    {
      url: 'http://opencrvs.org/specs/extension/contact-person',
      valueString: 'MOTHER'
    }
  ],
  meta: {
    versionId: '123'
  }
}

export const mockComposition = {
  identifier: {
    system: 'urn:ietf:rfc:3986',
    value: '{{urn_uuid}}'
  },
  resourceType: 'Composition',
  status: 'final', // 'final' when submitted | 'preliminary' when still a draft
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
          reference: 'urn:uuid:xxx' // reference to Encounter resource contained below
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
    },

    {
      title: "Primary caregiver's details",
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/doc-sections',
            code: 'primary-caregiver-details'
          }
        ],
        text: "Primary caregiver's details"
      },
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        }
      ]
    }
  ],
  id: '123',
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

export const mockDeathComposition = {
  identifier: {
    system: 'urn:ietf:rfc:3986',
    value: '{{urn_uuid}}'
  },
  resourceType: 'Composition',
  status: 'final', // 'final' when submitted | 'preliminary' when still a draft
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/types',
        code: 'death-registration'
      }
    ],
    text: 'Death Registration'
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
  title: 'Death Registration',
  section: [
    {
      title: 'Deceased details',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'deceased-details'
          }
        ],
        text: 'Deceased details'
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
      title: "Spouse's details",
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'spouse-details'
          }
        ],
        text: "Spouse's details"
      },
      text: '',
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        }
      ]
    },
    {
      title: 'Death Encounter',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'death-encounter'
          }
        ],
        text: 'Death encounter'
      },
      text: '',
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to Encounter resource contained below
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
  id: '123'
}

export const mockFhirBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: `urn:uuid:888`,
      resource: {
        id: '111',
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: '0ab5e4cd-a49b-4bf3-b03a-08b2e65e642a'
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
        subject: {},
        date: '2018-05-23T14:44:58+02:00',
        author: [],
        title: 'Birth Declaration',
        section: [
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
                reference: 'urn:uuid:ab392b88-1861-44e8-b5b0-f6e0525b2662'
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
                reference: 'urn:uuid:14fc828b-281c-4a2e-a9ef-44d4361fca57'
              }
            ]
          },
          {
            title: "Father's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'father-details'
                }
              ],
              text: "Father's details"
            },
            entry: [
              {
                reference: 'urn:uuid:b9044443-c708-4977-b0e7-7e51ef0c9221'
              }
            ]
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:104ad8fd-e7b8-4e3e-8193-abc2c473f2c9',
      resource: {
        id: '222',
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
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/paper-form-id',
            value: '12345678'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BDESC12'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '12345678331'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:ab392b88-1861-44e8-b5b0-f6e0525b2662',
      resource: {
        id: '333',
        resourceType: 'Patient',
        active: true,
        name: [
          {
            family: ['অনিক'],
            given: ['অনিক'],
            use: 'bn'
          }
        ],
        gender: 'male'
      }
    },
    {
      fullUrl: 'urn:uuid:14fc828b-281c-4a2e-a9ef-44d4361fca57',
      resource: {
        id: '444',
        resourceType: 'Patient',
        active: true,
        name: [
          {
            given: ['Jane'],
            family: ['Doe']
          }
        ],
        gender: 'female',
        telecom: [
          {
            system: 'phone',
            value: '+8801622688231'
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:b9044443-c708-4977-b0e7-7e51ef0c9221',
      resource: {
        id: '555',
        resourceType: 'Patient',
        active: true,
        name: [
          {
            given: ['Jack'],
            family: ['Doe']
          }
        ],
        gender: 'male'
      }
    }
  ]
}

export const mockLocation = {
  fullUrl: 'urn:uuid:<uuid>',
  id: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba',
  resource: {
    resourceType: 'Location',
    status: 'active',
    mode: 'instance',
    name: '{{villageName}}',
    physicalType: {
      coding: [
        {
          system: 'http://hl7.org/fhir/ValueSet/location-physical-type',
          code: 'area'
        }
      ],
      text: 'Area'
    },
    position: {
      longitude: 18.4392,
      latitude: -34.08002
    }
  }
}

export const mockObservations = {
  birthWeight: {
    entry: [
      {
        fullUrl: 'urn:uuid:<uuid>',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'Encounter/123' // the birth encounter
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
                code: '29463-7',
                display: 'Body Weight'
              },
              {
                system: 'http://loinc.org',
                code: '3141-9',
                display: 'Body weight Measured'
              }
            ]
          },
          subject: {
            reference: 'Patient/123' // reference child by fullUrl
          },
          effectiveDateTime: '2016-03-28', // same as birthdate
          valueQuantity: {
            value: 1.25,
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        }
      }
    ]
  },
  birthType: {
    entry: [
      {
        fullUrl: 'urn:uuid:<uuid>',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'Encounter/123' // the birth encounter
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
          subject: {
            reference: 'Patient/123' // reference mother by fullUrl
          },
          effectiveDateTime: '2016-03-28', // same as birthdate
          valueQuantity: {
            value: 2
          }
        }
      }
    ]
  },
  birthAttendant: {
    entry: [
      {
        fullUrl: 'urn:uuid:<uuid>',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'Encounter/123' // the birth encounter
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
          subject: {
            reference: 'Patient/123' // reference mother by fullUrl
          },
          effectiveDateTime: '2016-03-28', // same as birthdate
          valueString: 'PHYSICIAN'
        }
      }
    ]
  },
  birthRegistration: {
    entry: [
      {
        fullUrl: 'urn:uuid:<uuid>',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'Encounter/123' // the birth encounter
          },
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/obs-type',
                code: 'birth-reg-type',
                display: 'Birth registration type'
              }
            ]
          },
          effectiveDateTime: '2016-03-28', // same as birthdate
          valueString: 'BOTH_PARENTS'
        }
      }
    ]
  },
  birthRegistrationType: {
    entry: [
      {
        fullUrl: 'urn:uuid:<uuid>',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'Encounter/123' // the birth encounter
          },
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/obs-type',
                code: 'birth-reg-type',
                display: 'Birth registration type'
              }
            ]
          },
          effectiveDateTime: '2016-03-28', // same as birthdate
          valueString: 'BOTH_PARENTS'
        }
      }
    ]
  },
  childrenBornAliveToMother: {
    entry: [
      {
        fullUrl: 'urn:uuid:<uuid>',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'Encounter/123' // the birth encounter
          },
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/obs-type',
                code: 'num-born-alive',
                display: 'Number born alive to mother'
              }
            ]
          },
          subject: {
            reference: 'Patient/123' // reference mother by fullUrl
          },
          effectiveDateTime: '2016-03-28', // same as birthdate
          valueInteger: 2
        }
      }
    ]
  },
  foetalDeathsToMother: {
    entry: [
      {
        fullUrl: 'urn:uuid:<uuid>',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'Encounter/123' // the birth encounter
          },
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/obs-type',
                code: 'num-foetal-death',
                display: 'Number foetal deaths to mother'
              }
            ]
          },
          subject: {
            reference: 'Patient/123' // reference mother by fullUrl
          },
          effectiveDateTime: '2016-03-28', // same as birthdate
          valueInteger: 0
        }
      }
    ]
  },
  lastPreviousLiveBirth: {
    entry: [
      {
        fullUrl: 'urn:uuid:<uuid>',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'Encounter/123' // the birth encounter
          },
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '68499-3',
                display: 'Date last live birth'
              }
            ]
          },
          subject: {
            reference: 'Patient/123' // reference mother by fullUrl
          },
          effectiveDateTime: '2016-03-28', // same as birthdate
          valueDateTime: '2014-01-28' // previous birth date
        }
      }
    ]
  },
  deathLocation: {
    entry: [
      {
        fullUrl: 'urn:uuid:<uuid>',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'Encounter/123' // the death encounter
          },
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/obs-type',
                code: 'health-facility-death',
                display: 'Health facility death location'
              }
            ]
          },
          subject: {
            reference: 'Patient/123' // reference deceased by fullUrl
          },
          effectiveDateTime: '2016-03-28', // same as death date
          valueString: 'Location/123' // reference to a location
        }
      }
    ]
  },
  deathLocationType: {
    entry: [
      {
        fullUrl: 'urn:uuid:<uuid>',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'Encounter/123' // the death encounter
          },
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/obs-type',
                code: 'death-location-type',
                display: 'Type of death location'
              }
            ]
          },
          subject: {
            reference: 'Patient/123' // reference deceased by fullUrl
          },
          effectiveDateTime: '2016-03-28', // same as death date
          valueString: 'BIRTH_PLACE'
        }
      }
    ]
  },
  mannerOfDeath: {
    entry: [
      {
        fullUrl: 'urn:uuid:<uuid>',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'Encounter/123' // the death encounter
          },
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/obs-type',
                code: 'uncertified-manner-of-death',
                display: 'Uncertified manner of death'
              }
            ]
          },
          subject: {
            reference: 'Patient/123' // reference deceased by fullUrl
          },
          effectiveDateTime: '2016-03-28', // same as death date
          valueCodeableConcept: {
            coding: [
              {
                code: 'NATURAL_CAUSES'
              }
            ]
          }
        }
      }
    ]
  },
  causeOfDeathMethod: {
    entry: [
      {
        fullUrl: 'urn:uuid:<uuid>',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'Encounter/123' // the death encounter
          },
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/obs-type',
                code: 'cause-of-death-method',
                display: 'Cause of death method'
              }
            ]
          },
          subject: {
            reference: 'Patient/123' // reference deceased by fullUrl
          },
          effectiveDateTime: '2016-03-28', // same as death date
          valueCodeableConcept: {
            coding: [
              {
                code: 'VERBAL_AUTOPSY'
              }
            ]
          }
        }
      }
    ]
  },
  causeOfDeath: {
    entry: [
      {
        fullUrl: 'urn:uuid:<uuid>',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'Encounter/123' // the death encounter
          },
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: 'ICD10',
                display: 'Cause of death'
              }
            ]
          },
          subject: {
            reference: 'Patient/123' // reference deceased by fullUrl
          },
          effectiveDateTime: '2016-03-28', // same as death date
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/icd-10',
                code: 'OTHER'
              }
            ]
          }
        }
      }
    ]
  }
}

export const mockRelatedPerson = {
  fullUrl: 'urn:uuid:<uuid>',
  id: '9185c9f1-a491-41f0-b823-6cba987b550b',
  resource: {
    resourceType: 'RelatedPerson',
    relationship: {
      coding: [
        {
          system: 'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
          code: 'OTHER' // or string for unsupported other
        }
      ],
      text: 'Nephew'
    },
    patient: {
      reference: 'Patient/123' // reference to deceased
    }
  }
}

export const mockCertificate = {
  resourceType: 'DocumentReference',
  total: 1,
  extension: [
    {
      url: 'http://opencrvs.org/specs/extension/collector',
      valueReference: {
        reference: 'RelatedPerson/3215'
      }
    }
  ]
}

export const mockCertificateComposition = {
  resourceType: 'Composition',
  id: '123',
  total: 1,
  entry: [
    {
      resource: {
        resourceType: 'Task',
        id: 'd7e3f7cd-f02d-47fd-922c-30e62b1157e5',
        section: [
          {
            title: 'Certificates',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'certificates'
                }
              ],
              text: 'Certificates'
            },
            entry: [
              {
                reference: 'DocumentReference/321'
              }
            ]
          }
        ]
      }
    }
  ]
}

export const mockErrorComposition = {
  resourceType: 'Composition',
  id: '123',
  total: 1,
  entry: null
}

export const mockTaskForError = {
  resourceType: 'Task',
  status: 'requested',
  id: 'd7e3f7cd-f02d-47fd-922c-30e62b1157e5',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/birth-tracking-id',
      value: '123'
    },
    {
      system: 'http://opencrvs.org/specs/id/birth-registration-number',
      value: '123'
    },
    { system: 'http://opencrvs.org/specs/id/paper-form-id', value: '123' },
    { system: 'http://opencrvs.org/specs/id/paper-form-page', value: '123' },
    { system: 'http://opencrvs.org/specs/id/paper-form-book', value: '123' }
  ],
  businessStatus: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/reg-status',
        code: 'DECLARED | VERIFIED | REGISTERED | CERTIFIED'
      }
    ]
  },
  code: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/types',
        code: 'BIRTH'
      }
    ]
  },
  focus: {
    reference: 'Composition/210e184a-fe81-4207-bfc8-b6259973093c'
  },
  authoredOn: '2016-10-31T08:25:05+10:00',
  lastModified: '2016-10-31T09:45:05+10:00',
  note: [
    {
      authorString: '<username>',
      text: 'Comment',
      time: '2016-10-31T09:45:05+10:00'
    }
  ],
  extension: [
    {
      url: 'http://opencrvs.org/specs/extension/contact-person',
      valueString: 'MOTHER'
    },
    {
      url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
      valueString: '01733333333'
    }
  ],
  meta: {
    versionId: '123'
  }
}
