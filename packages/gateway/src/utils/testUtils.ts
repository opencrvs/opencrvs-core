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
  multipleBirthInteger: 1, // the number is the birth number in the sequence. E.g. The middle birth in tripplets would be valueInteger=2 and the third born would have valueInteger=3
  photo: [
    {
      contentType: '',
      data: '<base64Binary>'
    }
  ],
  deceasedBoolean: 'false',
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

export const mockTask = {
  resourceType: 'Task',
  status: 'requested',
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
        code: 'birth-registration'
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
      valueString: 'Practitioner/123'
    },
    {
      url: 'http://opencrvs.org/specs/extension/regLastLocation',
      valueString: 'Location/123'
    },
    {
      url: 'http://opencrvs.org/specs/extension/contact-person',
      valueString: 'MOTHER'
    }
  ]
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
  ]
}

export const mockLocation = {
  fullUrl: 'urn:uuid:<uuid>',
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
  presentAtBirthRegistration: {
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
                code: 'present-at-birth-reg',
                display: 'Present at birth registration'
              }
            ]
          },
          effectiveDateTime: '2016-03-28', // same as registration date
          valueString: 'BOTH_PARENTS'
        }
      }
    ]
  },
  childrenBornAliveToMother: {
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
  },
  foetalDeathsToMother: {
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
  },
  lastPreviousLiveBirth: {
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
}
