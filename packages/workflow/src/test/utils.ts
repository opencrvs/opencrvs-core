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
export const testFhirBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: `urn:uuid:888`,
      resource: {
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
        resourceType: 'Task',
        status: 'requested',
        intent: '',
        focus: {
          reference: 'urn:uuid:888'
        },
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
            value: 'B5WGYJE'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+8801622688231'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: { reference: '123' }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:ab392b88-1861-44e8-b5b0-f6e0525b2662',
      resource: {
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

export const testFhirBundleWithIds = {
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
            value: 'B5WGYJE'
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

export const testFhirBundleWithIdsForDeath = {
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
        subject: {},
        date: '2018-05-23T14:44:58+02:00',
        author: [],
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
                reference: 'urn:uuid:ab392b88-1861-44e8-b5b0-f6e0525b2662'
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
                reference: 'urn:uuid:43b3d0b4-2749-4494-a15d-2ad6051217bc'
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
              code: 'death-registration'
            }
          ]
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/death-tracking-id',
            value: 'D5WGYJE'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+8801818181818'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: { reference: '123' }
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
      fullUrl: 'urn:uuid:43b3d0b4-2749-4494-a15d-2ad6051217bc',
      resource: {
        resourceType: 'RelatedPerson',
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'OTHER'
            }
          ],
          text: 'Nephew'
        },
        patient: { reference: 'urn:uuid:14fc828b-281c-4a2e-a9ef-44d4361fca57' }
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
    }
  ]
}

export const testFhirTaskBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/ba0412c6-5125-4447-bd32-fb5cf336ddbc',
      resource: {
        resourceType: 'Task',
        status: 'requested',
        intent: '',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: { reference: 'DUMMY' }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regDownloaded',
            valueString: 'REGISTERED'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regAssigned',
            valueReference: {
              reference: 'Practitioner/34562b20-718f-4272-9596-66cb89f2fe7b'
            }
          }
        ],
        note: [
          {
            text: 'reason=Misspelling&comment=CHild name was misspelled',
            time: '2018-11-28T15:13:57.492Z',
            authorString: ''
          }
        ],
        focus: {
          reference: 'Composition/df3fb104-4c2c-486f-97b3-edbeabcd4422'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B1mW7jA'
          }
        ],
        businessStatus: {
          coding: [
            { system: 'http://opencrvs.org/specs/reg-status', code: 'DECLARED' }
          ]
        },
        meta: {
          lastUpdated: '2018-11-29T15:11:13.041+00:00',
          versionId: 'f2efacc4-b00c-4ee9-a9f0-4a33870e64ae'
        },
        id: 'ba0412c6-5125-4447-bd32-fb5cf336ddbc'
      }
    }
  ]
}

export const testDeathFhirTaskBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/ba0412c6-5125-4447-bd32-fb5cf336ddbc',
      resource: {
        id: '222',
        resourceType: 'Task',
        status: 'requested',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'death-registration'
            }
          ]
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/death-tracking-id',
            value: 'D5WGYJE'
          }
        ],
        businessStatus: {
          coding: [
            { system: 'http://opencrvs.org/specs/reg-status', code: 'REJECTED' }
          ]
        }
      }
    }
  ]
}

export const taskResouceMock = JSON.stringify({
  resourceType: 'Task',
  status: 'requested',
  code: {
    coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
  },
  extension: [
    {
      url: 'http://opencrvs.org/specs/extension/contact-person',
      valueString: 'MOTHER'
    },
    {
      url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
      valueString: '+8801818181818'
    },
    {
      url: 'http://opencrvs.org/specs/extension/regLastUser',
      valueReference: { reference: 'DUMMY' }
    }
  ],
  note: [
    {
      text: 'reason=Misspelling&comment=CHild name was misspelled',
      time: '2018-11-28T15:13:57.492Z',
      authorString: ''
    }
  ],
  focus: {
    reference: 'Composition/df3fb104-4c2c-486f-97b3-edbeabcd4422'
  },
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/birth-tracking-id',
      value: 'B1mW7jA'
    }
  ],
  businessStatus: {
    coding: [
      { system: 'http://opencrvs.org/specs/reg-status', code: 'DECLARED' }
    ]
  },
  meta: {
    lastUpdated: '2018-11-29T15:11:13.041+00:00',
    versionId: 'f2efacc4-b00c-4ee9-a9f0-4a33870e64ae'
  },
  id: 'ba0412c6-5125-4447-bd32-fb5cf336ddbc'
})

export const userMock = JSON.stringify({
  mobile: '+880711111111'
})

export const fieldAgentPractitionerMock = JSON.stringify({
  resourceType: 'Bundle',
  id: 'eacae600-a501-42d6-9d59-b8b94f3e50c1',
  meta: { lastUpdated: '2018-11-27T17:13:20.662+00:00' },
  type: 'searchset',
  total: 1,
  link: [
    {
      relation: 'self',
      url: 'http://localhost:3447/fhir/Practitioner?telecom=phone%7C01711111111'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Practitioner/b1f46aba-075d-431e-8aeb-ebc57a4a0ad0',
      resource: {
        resourceType: 'Practitioner',
        identifier: [
          { use: 'official', system: 'mobile', value: '01711111111' }
        ],
        telecom: [{ system: 'phone', value: '01711111111' }],
        name: [
          { use: 'en', family: 'Al Hasan', given: ['Shakib'] },
          { use: 'bn', family: '', given: [''] }
        ],
        gender: 'male',
        meta: {
          lastUpdated: '2018-11-25T17:31:08.062+00:00',
          versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
        },
        id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
      }
    }
  ]
})

export const fieldAgentPractitionerRoleMock = JSON.stringify({
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/PractitionerRole/9c8b8ac2-9044-4b66-8d31-07c5a4b4348d',
      resource: {
        resourceType: 'PractitionerRole',
        practitioner: {
          reference: 'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
        },
        code: [
          {
            coding: [
              {
                system: 'http://opencrvs.org/specs/roles',
                code: 'FIELD_AGENT'
              }
            ]
          }
        ],
        location: [
          {
            reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacd9173'
          },
          {
            reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdxxx'
          },
          {
            reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdy48y'
          },
          {
            reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacd12yy'
          }
        ],
        meta: {
          lastUpdated: '2018-11-25T17:31:08.096+00:00',
          versionId: '2f79ee2d-3b78-4c90-91d8-278e4a28caf7'
        },
        id: '9c8b8ac2-9044-4b66-8d31-07c5a4b4348d'
      }
    }
  ]
})

export const districtMock = JSON.stringify({
  resourceType: 'Location',
  id: 'd33e4cb2-670e-4564-a8ed-c72baacd9173',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/geo-id',
      value: '165'
    },
    { system: 'http://opencrvs.org/specs/id/bbs-code', value: '10' },
    {
      system: 'http://opencrvs.org/specs/id/jurisdiction-type',
      value: 'DISTRICT'
    }
  ],
  physicalType: {
    coding: [
      {
        code: 'area',
        display: 'Jurisdiction'
      }
    ]
  }
})

export const upazilaMock = JSON.stringify({
  resourceType: 'Location',
  id: 'd33e4cb2-670e-4564-a8ed-c72baacdxxx',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/geo-id',
      value: '165'
    },
    { system: 'http://opencrvs.org/specs/id/bbs-code', value: '34' },
    {
      system: 'http://opencrvs.org/specs/id/jurisdiction-type',
      value: 'UPAZILA'
    }
  ],
  partOf: {
    reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacd9173'
  },
  physicalType: {
    coding: [
      {
        code: 'area',
        display: 'Jurisdiction'
      }
    ]
  }
})

export const unionMock = JSON.stringify({
  resourceType: 'Location',
  id: 'd33e4cb2-670e-4564-a8ed-c72baacdy48y',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/geo-id',
      value: '165'
    },
    { system: 'http://opencrvs.org/specs/id/bbs-code', value: '21' },
    {
      system: 'http://opencrvs.org/specs/id/jurisdiction-type',
      value: 'UNION'
    }
  ],
  partOf: {
    reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdxxx'
  },
  physicalType: {
    coding: [
      {
        code: 'area',
        display: 'Jurisdiction'
      }
    ]
  }
})

export const officeMock = JSON.stringify({
  resourceType: 'Location',
  id: 'd33e4cb2-670e-4564-a8ed-c72baacd12yy',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/geo-id',
      value: '165'
    },
    { system: 'http://opencrvs.org/specs/id/bbs-code', value: '21' },
    {
      system: 'http://opencrvs.org/specs/id/jurisdiction-type',
      value: 'CRVS_OFFICE'
    }
  ],
  partOf: {
    reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdy48y'
  },
  type: {
    coding: [{ code: 'CRVS_OFFICE' }]
  },
  name: 'Dummy CRVS Office',
  alias: ['নকল অফিস'],
  physicalType: {
    coding: [
      {
        code: 'bu',
        display: 'Building'
      }
    ]
  }
})

export const compositionMock = JSON.stringify({
  identifier: {
    system: 'urn:ietf:rfc:3986',
    value: 'B5JUNQO'
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
          reference: 'Patient/58efd5d1-d07f-4bac-af8e-771be81db047'
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
          reference: 'Patient/0477b181-9e79-4f41-ac5b-54cdf3a4ca9d'
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
          reference: 'Encounter/a6ace176-f6fe-404d-9bed-236e1ce50b93'
        }
      ]
    }
  ],
  subject: {},
  date: '2019-02-06T11:24:04.264Z',
  author: [],
  meta: {
    lastUpdated: '2019-02-06T11:24:06.089+00:00',
    versionId: '7b6d3f45-f607-4f40-adc5-3a5a958882f9'
  },
  _request: {
    method: 'POST'
  },
  id: '95035079-ec2c-451c-b514-664e838e8a5b'
})

export const deathCompositionMock = JSON.stringify({
  identifier: {
    system: 'urn:ietf:rfc:3986',
    value: '98df1315-47fd-4fc8-a505-9439ad7c6778'
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
      { system: 'http://opencrvs.org/doc-classes', code: 'crvs-document' }
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
      entry: [{ reference: 'urn:uuid:186f02ab-e039-4924-9cd0-32d61797e624' }]
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
      entry: [{ reference: 'urn:uuid:43b3d0b4-2749-4494-a15d-2ad6051217bc' }]
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
      entry: [{ reference: 'urn:uuid:a2e4fe6a-5a9d-4113-8da7-5618d27f1c0a' }]
    }
  ],
  subject: {},
  date: '2019-02-11',
  author: []
})

export const patientMock = JSON.stringify({
  resourceType: 'Patient',
  active: true,
  id: '1c9add9b-9215-49d7-bfaa-226c82ac47d1',
  name: [
    {
      use: 'bn',
      family: ['লদলদসসসস']
    },
    {
      use: 'en',
      family: ['ttttttt']
    }
  ],
  gender: 'male',
  birthDate: '2020-07-01',
  multipleBirthInteger: 1
})

export const motherMock = JSON.stringify({
  resourceType: 'Patient',
  active: true,
  identifier: [
    {
      id: '12341234123412341',
      type: 'NATIONAL_ID'
    }
  ],
  name: [
    {
      use: 'bn',
      family: ['নাম্বারো']
    }
  ],
  telecom: [
    {
      system: 'phone',
      value: '01711111111'
    }
  ],
  maritalStatus: {
    coding: [
      {
        system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
        code: 'M'
      }
    ],
    text: 'MARRIED'
  },
  multipleBirthInteger: 1,
  address: [
    {
      type: 'PRIMARY_ADDRESS',
      line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
      district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
      state: '9a236522-0c3d-40eb-83ad-e8567518c763',
      country: 'BGD'
    },
    {
      type: 'SECONDARY_ADDRESS',
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
  ],
  _transforms: {
    matching: {
      name: {
        family: [['', '']]
      }
    }
  },
  meta: {
    lastUpdated: '2019-02-06T11:24:06.097+00:00',
    versionId: '66791cd4-2867-4414-bb3e-9d411038c3df'
  },
  _request: {
    method: 'POST'
  },
  id: '0477b181-9e79-4f41-ac5b-54cdf3a4ca9d'
})

export const testDeathFhirBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:98df1315-47fd-4fc8-a505-9439ad7c6778',
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: '98df1315-47fd-4fc8-a505-9439ad7c6778'
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
            { system: 'http://opencrvs.org/doc-classes', code: 'crvs-document' }
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
              { reference: 'urn:uuid:186f02ab-e039-4924-9cd0-32d61797e624' }
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
              { reference: 'urn:uuid:43b3d0b4-2749-4494-a15d-2ad6051217bc' }
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
              { reference: 'urn:uuid:a2e4fe6a-5a9d-4113-8da7-5618d27f1c0a' }
            ]
          }
        ],
        subject: {},
        date: '2019-02-11',
        author: []
      }
    },
    {
      fullUrl: 'urn:uuid:186f02ab-e039-4924-9cd0-32d61797e624',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [{ id: '123456', type: 'OTHER', otherType: 'Custom type' }],
        name: [{ use: 'en', given: ['Jane'], family: ['Doe'] }],
        gender: 'female',
        birthDate: '2000-01-28',
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
            valueDateTime: '2014-01-28'
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
            extension: [
              {
                url: 'code',
                valueCodeableConcept: {
                  coding: [{ system: 'urn:iso:std:iso:3166', code: 'BGD' }]
                }
              },
              { url: 'period', valuePeriod: { start: '', end: '' } }
            ]
          },
          {
            url: 'http://opencrvs.org/specs/extension/educational-attainment',
            valueString: 'UPPER_SECONDARY_ISCED_3'
          }
        ],
        multipleBirthInteger: 1,
        deceasedBoolean: true,
        deceasedDateTime: '2014-01-28'
      }
    },
    {
      fullUrl: 'urn:uuid:43b3d0b4-2749-4494-a15d-2ad6051217bc',
      resource: {
        resourceType: 'RelatedPerson',
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'OTHER'
            }
          ],
          text: 'Nephew'
        },
        patient: { reference: 'urn:uuid:030b5690-c5c9-4dc5-a55d-045c2f9b9bd7' }
      }
    },
    {
      fullUrl: 'urn:uuid:030b5690-c5c9-4dc5-a55d-045c2f9b9bd7',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [{ id: '123456', type: 'OTHER', otherType: 'Custom type' }],
        name: [{ use: 'en', given: ['John'], family: ['Doe'] }],
        telecom: [{ system: 'phone', value: '0171111111', use: 'mobile' }],
        gender: 'male',
        birthDate: '2000-01-28',
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
            valueDateTime: '2014-01-28'
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
            extension: [
              {
                url: 'code',
                valueCodeableConcept: {
                  coding: [{ system: 'urn:iso:std:iso:3166', code: 'BGD' }]
                }
              },
              { url: 'period', valuePeriod: { start: '', end: '' } }
            ]
          },
          {
            url: 'http://opencrvs.org/specs/extension/educational-attainment',
            valueString: 'UPPER_SECONDARY_ISCED_3'
          }
        ],
        multipleBirthInteger: 1,
        address: [
          {
            use: 'home',
            type: 'SECONDARY_ADDRESS',
            line: ['2760 Mlosi Street', 'Wallacedene'],
            city: 'Cape Town',
            district: 'Kraaifontein',
            state: 'Western Cape',
            postalCode: '7570',
            country: 'BGD'
          },
          {
            use: 'home',
            type: 'PRIMARY_ADDRESS',
            text: 'Optional address text',
            line: ['40 Orbis Wharf', 'Wallacedene'],
            city: 'Cape Town',
            district: 'Kraaifontein',
            state: 'Western Cape',
            postalCode: '7570',
            country: 'BGD'
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:a2e4fe6a-5a9d-4113-8da7-5618d27f1c0a',
      resource: { resourceType: 'Encounter', status: 'finished' }
    },
    {
      fullUrl: 'urn:uuid:fff280db-e146-40bf-a53d-850bb7972f0e',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: { reference: 'urn:uuid:a2e4fe6a-5a9d-4113-8da7-5618d27f1c0a' },
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
              code: 'health-facility-death',
              display: 'Health facility death location'
            }
          ]
        },
        valueString: 'Location/123'
      }
    },
    {
      fullUrl: 'urn:uuid:dc488e79-0cf9-4fa1-b9d0-3dd142d01d03',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: { reference: 'urn:uuid:a2e4fe6a-5a9d-4113-8da7-5618d27f1c0a' },
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
              code: 'death-location-type',
              display: 'Type of death location'
            }
          ]
        },
        valueString: 'PRIVATE_HOME'
      }
    },
    {
      fullUrl: 'urn:uuid:eb58c885-606b-46ef-9a44-c06a8d073ced',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: { reference: 'urn:uuid:a2e4fe6a-5a9d-4113-8da7-5618d27f1c0a' },
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
      fullUrl: 'urn:uuid:04b79f83-779c-4a33-a1c9-714ea0b1d020',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: { reference: 'urn:uuid:a2e4fe6a-5a9d-4113-8da7-5618d27f1c0a' },
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
              code: 'cause-of-death-method',
              display: 'Cause of death method'
            }
          ]
        },
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/icd-10',
              code: 'MEDICALLY_CERTIFIED'
            }
          ]
        }
      }
    },
    {
      fullUrl: 'urn:uuid:e01d0427-d219-41b3-8452-f23def5b824f',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: { reference: 'urn:uuid:a2e4fe6a-5a9d-4113-8da7-5618d27f1c0a' },
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
              code: 'ICD10',
              display: 'Cause of death'
            }
          ]
        },
        valueCodeableConcept: {
          coding: [
            { system: 'http://hl7.org/fhir/ValueSet/icd-10', code: 'age' }
          ]
        }
      }
    }
  ],
  meta: { lastUpdated: '2019-02-11' }
}

export const testInProgressFhirBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: `urn:uuid:888`,
      resource: {
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
        section: []
      }
    },
    {
      fullUrl: 'urn:uuid:104ad8fd-e7b8-4e3e-8193-abc2c473f2c9',
      resource: {
        resourceType: 'Task',
        status: 'draft',
        intent: '',
        focus: {
          reference: 'urn:uuid:888'
        },
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'birth-registration'
            }
          ]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+8801622688231'
          }
        ]
      }
    }
  ]
}

export const testInProgressDeathFhirBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:98df1315-47fd-4fc8-a505-9439ad7c6778',
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: '98df1315-47fd-4fc8-a505-9439ad7c6778'
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
            { system: 'http://opencrvs.org/doc-classes', code: 'crvs-document' }
          ],
          text: 'CRVS Document'
        },
        title: 'Death Declaration',
        section: [],
        subject: {},
        date: '2019-02-11',
        author: []
      }
    },
    {
      fullUrl: 'urn:uuid:104ad8fd-e7b8-4e3e-8193-abc2c473f2c9',
      resource: {
        resourceType: 'Task',
        status: 'draft',
        intent: '',
        focus: {
          reference: 'urn:uuid:888'
        },
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'death-registration'
            }
          ]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+8801622688231'
          }
        ]
      }
    }
  ],
  meta: { lastUpdated: '2019-02-11' }
}

export const deathTaskMock = JSON.stringify({
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
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/paper-form-id',
      value: '12345678'
    },
    {
      system: 'http://opencrvs.org/specs/id/death-tracking-id',
      value: 'B5WGYJE'
    }
  ],
  focus: {
    reference: 'Composition/df3fb104-4c2c-486f-97b3-edbeabcd4422'
  },
  extension: [
    {
      url: 'http://opencrvs.org/specs/extension/contact-person',
      valueString: 'MOTHER'
    }
  ],
  id: '104ad8fd-e7b8-4e3e-8193-abc2c473f2c9'
})

export const hearthResponseMock = JSON.stringify({
  resourceType: 'Bundle',
  entry: [
    {
      response: {
        status: '200',
        location:
          '/fhir/Composition/d10947db-51e1-4f47-a5e1-3f9d1b58eee8/_history/2a70a1cd-fd08-4eab-a134-39769e34d41e'
      }
    },
    {
      response: {
        status: '200',
        location:
          '/fhir/Encounter/d3b9f408-a16a-42c2-9cfe-53ad2fbfda99/_history/e927451f-e19f-40dd-be7b-5b6c50c26d9d'
      }
    },
    {
      response: {
        status: '200',
        location:
          '/fhir/Observation/d617505b-047f-459f-b486-9eb7c3fb0a82/_history/e3264e1a-4a74-45e1-891d-7d27c7eb45a4'
      }
    },
    {
      response: {
        status: '200',
        location:
          '/fhir/Task/fb4a19b4-8f5f-4660-98a5-0a149d1580b3/_history/2482bf54-673a-4d80-a1ce-07c921820efb'
      }
    },
    {
      response: {
        status: '200',
        location:
          '/fhir/Patient/f814a8d6-abd4-4ccd-8ed9-235e0908edfc/_history/e26f454e-f55f-43fb-92c4-25c9d88d5b2a'
      }
    },
    {
      response: {
        status: '200',
        location:
          '/fhir/Patient/5de966c5-cc82-47a4-9676-4ea66285c3be/_history/fb4947b8-f541-4afb-a797-7c859d5a7c33'
      }
    },
    {
      response: {
        status: '201',
        location:
          '/fhir/RelatedPerson/8ca66791-362d-479d-8eb9-13d1929139dc/_history/4a1a9be8-fca4-4b6c-b097-5277c3d15ff3'
      }
    },
    {
      response: {
        status: '201',
        location:
          '/fhir/Location/43f49a50-d8f4-4f30-ba84-6bc7bc181b67/_history/139f61a3-7a3a-4532-8392-7094de3f1d80'
      }
    }
  ],
  type: 'transaction-response'
})

export const relatedPersonMock = JSON.stringify({
  resourceType: 'RelatedPerson',
  relationship: {
    coding: [
      {
        system: 'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
        code: 'OTHER'
      }
    ],
    text: 'Nephew'
  },
  patient: { reference: 'urn:uuid:14fc828b-281c-4a2e-a9ef-44d4361fca57' }
})

export function wrapInBundle(...resources: [fhir.Resource | string]): string {
  return JSON.stringify({
    resourceType: 'Bundle',
    type: 'document',
    entry: resources.map((resource) => ({
      resource: typeof resource === 'string' ? JSON.parse(resource) : resource
    }))
  })
}
