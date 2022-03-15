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
export const mockBirthFhirBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:bcf4e631-ba4f-447b-b630-993709a38d71',
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'BDQNYZH'
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
                reference: 'urn:uuid:e74ed25d-8c9c-49aa-9abc-d2a659078b22'
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
                reference: 'urn:uuid:dcca6eb2-b608-4bb3-b17e-31ae9caa74dc'
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
                reference: 'urn:uuid:63e5ea6d-6dc7-4df7-b908-328872e770e3'
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
                reference: 'urn:uuid:cc24dfad-228e-4155-ba9d-533a674ec23b'
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
                reference: 'urn:uuid:63e5ea6d-6dc7-4df7-b908-328872e770e3'
              }
            ]
          },
          {
            title: 'Birth encounter',
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
                reference: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df'
              }
            ]
          }
        ],
        subject: {},
        date: '2019-04-03T08:56:10.718Z',
        author: [],
        id: 'b7a1743e-1431-41ed-87a8-3606ec7f6671'
      }
    },
    {
      fullUrl: 'urn:uuid:791afdc5-2d8b-4e05-bd99-4aeea0b0480c',
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
        focus: {
          reference: 'urn:uuid:bcf4e631-ba4f-447b-b630-993709a38d71'
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'FATHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '01711111111'
          },
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
        lastModified: '2019-04-03T08:56:12.031Z',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BDQNYZH'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'DECLARED'
            }
          ]
        }
      }
    },
    {
      fullUrl: 'urn:uuid:e74ed25d-8c9c-49aa-9abc-d2a659078b22',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'bn',
            given: ['রফিক'],
            family: ['ইসলাম']
          },
          {
            use: 'en',
            given: ['Rafiq'],
            family: ['Islam']
          }
        ],
        gender: 'male',
        birthDate: '2010-01-01'
      }
    },
    {
      fullUrl: 'urn:uuid:dcca6eb2-b608-4bb3-b17e-31ae9caa74dc',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '12341234123412341',
            type: 'BIRTH_REGISTRATION_NUMBER'
          }
        ],
        name: [
          {
            use: 'bn',
            given: ['বেগম'],
            family: ['রোকেয়া']
          },
          {
            use: 'en',
            given: ['Begum'],
            family: ['Rokeya']
          }
        ],
        birthDate: '1980-01-01',
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
            valueDateTime: '2008-01-01'
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
            valueString: 'PRIMARY_ISCED_1'
          }
        ],
        multipleBirthInteger: 1,
        address: [
          {
            type: 'PERMANENT',
            line: ['', '', '', '', '', '265abf9c-09d4-4b34-a0c6-336a53e23e4a'],
            district: 'a5010297-2d10-4109-8cb3-353ff9c084c2',
            state: '2414fc3f-7670-4d22-a053-5694858d72a2',
            country: 'BGD'
          },
          {
            type: 'CURRENT',
            line: ['', '', '', '', '', '265abf9c-09d4-4b34-a0c6-336a53e23e4a'],
            district: 'a5010297-2d10-4109-8cb3-353ff9c084c2',
            state: '2414fc3f-7670-4d22-a053-5694858d72a2',
            country: 'BGD'
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:e74ed25d-8c9c-49aa-9abc-d2a659078bp9',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'bn',
            given: ['রাসেল'],
            family: ['ইসলাম']
          },
          {
            use: 'en',
            given: ['Rasel'],
            family: ['Islam']
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:63e5ea6d-6dc7-4df7-b908-328872e770e3',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '17238230233223321',
            type: 'BIRTH_REGISTRATION_NUMBER'
          }
        ],
        name: [
          {
            use: 'bn',
            given: ['ফারুক'],
            family: ['ইসলাম']
          },
          {
            use: 'en',
            given: ['Faruq'],
            family: ['Islam']
          }
        ],
        birthDate: '1970-01-01',
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
            valueDateTime: '2008-01-01'
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
            valueString: 'LOWER_SECONDARY_ISCED_2'
          }
        ],
        address: [
          {
            type: 'CURRENT',
            line: ['', '', '', '', '', '265abf9c-09d4-4b34-a0c6-336a53e23e4a'],
            district: 'a5010297-2d10-4109-8cb3-353ff9c084c2',
            state: '2414fc3f-7670-4d22-a053-5694858d72a2',
            country: 'BGD'
          },
          {
            type: 'PERMANENT',
            line: ['', '', '', '', '', '265abf9c-09d4-4b34-a0c6-336a53e23e4a'],
            district: 'a5010297-2d10-4109-8cb3-353ff9c084c2',
            state: '2414fc3f-7670-4d22-a053-5694858d72a2',
            country: 'BGD'
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:cc24dfad-228e-4155-ba9d-533a674ec23b',
      resource: {
        resourceType: 'RelatedPerson',
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'MOTHER'
            }
          ]
        },
        patient: {
          reference: 'urn:uuid:dcca6eb2-b608-4bb3-b17e-31ae9caa74dc'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df',
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: 'urn:uuid:3e199a21-3f71-41eb-b8ba-215e547d0d05'
            }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:3e199a21-3f71-41eb-b8ba-215e547d0d05',
      resource: {
        resourceType: 'Location',
        mode: 'instance',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'HOSPITAL'
            }
          ]
        },
        address: {
          line: ['', '', '', '', '', ''],
          district: '',
          state: '',
          postalCode: '',
          country: ''
        }
      }
    },
    {
      fullUrl: 'urn:uuid:e7249ecd-fb11-42cd-aa3b-d48e2288f504',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df'
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
      fullUrl: 'urn:uuid:e7249ecd-fb11-42cd-aa3b-d48e2288f599',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df'
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
              code: 'primary-caregiver',
              display: 'Primary caregiver'
            }
          ]
        },
        valueString: 'OTHER',
        subject: {
          reference: 'urn:uuid:e74ed25d-8c9c-49aa-9abc-d2a659078bp9'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:3a7eb860-2bdd-4a44-846b-74d6ce8a65cb',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df'
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
          value: 2,
          unit: 'kg',
          system: 'http://unitsofmeasure.org',
          code: 'kg'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:372abcdc-7b1d-4671-92dc-4a0353916cbe',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df'
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
        valueString: 'PHYSICIAN'
      }
    },
    {
      fullUrl: 'urn:uuid:99315e6d-bcb6-4e9a-ba85-a41cff4f3b08',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df'
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
        valueString: 'BOTH_PARENTS'
      }
    }
  ],
  meta: {
    lastUpdated: '2019-04-03T08:56:10.718Z'
  }
}

export const mockBirthFhirBundleWithoutCompositionId = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:a2cb0db6-3526-4c2e-aa22-2f8fef9eef46',
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'BLNMDOY'
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
                reference: 'urn:uuid:d449b644-5c1a-4355-bc82-7473d6a235b8'
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
                reference: 'urn:uuid:afb2ecf4-76d8-46fa-854d-3651130a28db'
              }
            ]
          },
          {
            title: 'Birth encounter',
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
                reference: 'urn:uuid:f5858402-c61a-48a2-876d-93cf06f876cb'
              }
            ]
          }
        ],
        subject: {},
        date: '2019-03-27T11:34:46.928Z',
        author: []
      }
    },
    {
      fullUrl: 'urn:uuid:412e286c-8839-4f1d-b7c0-4d069b2ec58c',
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
        focus: {
          reference: 'urn:uuid:a2cb0db6-3526-4c2e-aa22-2f8fef9eef46'
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '01722222222'
          },
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
        lastModified: '2019-03-27T11:34:48.804Z',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BLNMDOZ'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'DECLARED'
            }
          ]
        }
      }
    },
    {
      fullUrl: 'urn:uuid:d449b644-5c1a-4355-bc82-7473d6a235b8',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'bn',
            family: ['ম দুই']
          },
          {
            use: 'en',
            family: ['m two']
          }
        ],
        gender: 'male',
        birthDate: '2007-01-01'
      }
    },
    {
      fullUrl: 'urn:uuid:afb2ecf4-76d8-46fa-854d-3651130a28db',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '12341234123412341',
            type: 'BIRTH_REGISTRATION_NUMBER'
          }
        ],
        name: [
          {
            use: 'bn',
            family: ['ম ম দুই']
          },
          {
            use: 'en',
            family: ['m m two']
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
      fullUrl: 'urn:uuid:f5858402-c61a-48a2-876d-93cf06f876cb',
      resource: {
        resourceType: 'Encounter',
        status: 'finished'
      }
    },
    {
      fullUrl: 'urn:uuid:4a093653-085d-4064-98b8-4d7508493207',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:f5858402-c61a-48a2-876d-93cf06f876cb'
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
    lastUpdated: '2019-03-27T11:34:46.928Z'
  }
}

export const mockDeathFhirBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:a2e730c8-07c8-4943-b66b-4ef9e4bde7a1',
      resource: {
        id: 'ff6a4fce-4e72-463c-a6aa-718054643983',
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
                reference: 'urn:uuid:8c6e014a-c93f-4d9b-bb13-f82e3d9da153'
              }
            ]
          },
          {
            title: "Spouse's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'spouse-details'
                }
              ],
              text: "Spouse's details"
            },
            entry: [
              {
                reference: 'urn:uuid:938a0989-e9da-43eb-b71b-c23c20803e80'
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
                reference: 'urn:uuid:8c6e014a-c93f-4d9b-bb13-f82e3d9da132'
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
      fullUrl: 'urn:uuid:8c6e014a-c93f-4d9b-bb13-f82e3d9da153',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'bn',
            given: ['হাবিবা'],
            family: ['আক্তার']
          },
          {
            use: 'en',
            given: ['Habiba'],
            family: ['Akter']
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:938a0989-e9da-43eb-b71b-c23c20803e80',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'bn',
            given: ['ফারাবি'],
            family: ['আক্তার']
          },
          {
            use: 'en',
            given: ['Farabi'],
            family: ['Akter']
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:8c6e014a-c93f-4d9b-bb13-f82e3d9da132',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'bn',
            given: ['হাবিব'],
            family: ['হাসান']
          },
          {
            use: 'en',
            given: ['Habib'],
            family: ['Hasan']
          }
        ]
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
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'EXTENDED_FAMILY'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '01711111114'
          },
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

export const mockDeathFhirBundleWithoutCompositionId = {
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
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'EXTENDED_FAMILY'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '01711111114'
          },
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

export const mockComposition: fhir.Composition = {
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
      text: {
        status: '',
        div: ''
      },
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
      text: {
        status: '',
        div: ''
      },
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
      text: {
        status: '',
        div: ''
      },
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
      text: {
        status: '',
        div: ''
      },
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
      text: {
        status: '',
        div: ''
      },
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
      text: {
        status: '',
        div: ''
      },
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
  body: {
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
            motherIdentifier: '22123123123123123',
            createdBy: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
            updatedBy: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de'
          }
        }
      ]
    }
  }
}

export const mockSearchResponseWithoutCreatedBy = {
  body: {
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
}

export const mockCompositionBody = {
  childFirstNames: 'hasan',
  childFamilyName: 'sarkar',
  childFirstNamesLocal: 'test',
  childFamilyNameLocal: 'সরকার',
  childDoB: '1990-02-01',
  gender: 'male',
  motherFirstNames: 'anninda',
  motherFamilyName: 'sarkar',
  motherFirstNamesLocal: 'চট্টগ্রাম',
  motherFamilyNameLocal: 'সরকার',
  fatherFirstNames: 'raihan',
  fatherFamilyName: 'khilzee',
  fatherDoB: '1960-02-01',
  motherDoB: '1960-02-01',
  motherIdentifier: '22123123123123123',
  fatherIdentifier: '221211111113123123'
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

export const mockCompositionResponse = {
  identifier: { system: 'urn:ietf:rfc:3986', value: 'BLURQJG' },
  resourceType: 'Composition',
  status: 'preliminary',
  type: {
    coding: [
      { system: 'http://opencrvs.org/doc-types', code: 'birth-declaration' }
    ],
    text: 'Birth Declaration'
  },
  class: {
    coding: [
      { system: 'http://opencrvs.org/doc-classes', code: 'crvs-document' }
    ],
    text: 'CRVS Document'
  },
  title: 'Birth Declaration',
  section: [
    {
      title: 'Child details',
      code: {
        coding: [
          { system: 'http://opencrvs.org/doc-sections', code: 'child-details' }
        ],
        text: 'Child details'
      },
      entry: [{ reference: 'urn:uuid:fc3fd2df-92cc-452d-855f-5277396f9cce' }]
    },
    {
      title: "Mother's details",
      code: {
        coding: [
          { system: 'http://opencrvs.org/doc-sections', code: 'mother-details' }
        ],
        text: "Mother's details"
      },
      entry: [{ reference: 'urn:uuid:feb86ab7-437a-43e7-8d10-7fad17cda5f9' }]
    },
    {
      title: 'Birth encounter',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'birth-encounter'
          }
        ],
        text: 'Birth encounter'
      },
      entry: [{ reference: 'urn:uuid:6077ab73-2e55-4aa8-8b85-f733c44c1b77' }]
    }
  ],
  subject: {},
  date: '2019-04-02T11:22:46.135Z',
  author: [],
  id: '9acd5bb1-696c-4fdf-ad3a-59c75634ea69',
  relatesTo: [
    {
      code: 'duplicate',
      targetReference: {
        reference: 'Composition/ff6a4fce-4e72-463c-a6aa-718054643983'
      }
    },
    {
      code: 'duplicate',
      targetReference: {
        reference: 'Composition/3a092303-6ecd-46db-b0b3-fa236964ba32'
      }
    }
  ],
  meta: {
    lastUpdated: '201$-04-02T12:56:18.460+00:00',
    versionId: '074c1544-7f3a-4825-816d-8d8fff90934f'
  }
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

export const mockBirthRejectionTaskBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/16b3a085-0cf8-40db-8213-58ecc8f72790/_history/99c8a143-675e-4a5c-a6d7-aaa5f10e8b9e',
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
        focus: {
          reference: 'Composition/d6667198-3581-4beb-b9a6-52b93aee3159'
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '01722222222'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
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
        lastModified: '2019-03-27T11:40:09.493Z',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BLNMDOZ'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REJECTED'
            }
          ]
        },
        meta: {
          lastUpdated: '2019-03-27T11:34:48.970+00:00',
          versionId: '99c8a143-675e-4a5c-a6d7-aaa5f10e8b9e'
        },
        id: '16b3a085-0cf8-40db-8213-58ecc8f72790',
        note: [
          {
            text: 'reason=duplicate&comment=Possible Duplicate found!',
            time: 'Wed, 27 Mar 2019 11:40:09 GMT',
            authorString: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
          }
        ]
      },
      request: {
        method: 'POST',
        url: 'Task'
      }
    }
  ]
}

export const mockBirthRejectionTaskBundleWithoutCompositionReference = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/16b3a085-0cf8-40db-8213-58ecc8f72790/_history/99c8a143-675e-4a5c-a6d7-aaa5f10e8b9e',
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
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '01722222222'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
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
        lastModified: '2019-03-27T11:40:09.493Z',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BLNMDOZ'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REJECTED'
            }
          ]
        },
        meta: {
          lastUpdated: '2019-03-27T11:34:48.970+00:00',
          versionId: '99c8a143-675e-4a5c-a6d7-aaa5f10e8b9e'
        },
        id: '16b3a085-0cf8-40db-8213-58ecc8f72790',
        note: [
          {
            text: 'reason=duplicate&comment=Possible Duplicate found!',
            time: 'Wed, 27 Mar 2019 11:40:09 GMT',
            authorString: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
          }
        ]
      },
      request: {
        method: 'POST',
        url: 'Task'
      }
    }
  ]
}

export const mockDeathRejectionTaskBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/be13e81f-0cd7-4ff3-a2d3-a1bc7a7f543a/_history/57a41663-6f07-42b7-9cce-c2945ddd3a0c',
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
          reference: 'Composition/37df1f45-0b27-43da-aebb-8041a73cb103'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/death-tracking-id',
            value: 'DKCGBVI'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REJECTED'
            }
          ]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
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
        lastModified: '2019-03-27T11:44:41.407Z',
        meta: {
          lastUpdated: '2019-03-27T11:38:44.701+00:00',
          versionId: '57a41663-6f07-42b7-9cce-c2945ddd3a0c'
        },
        id: 'be13e81f-0cd7-4ff3-a2d3-a1bc7a7f543a',
        note: [
          {
            text: 'reason=missing_supporting_doc&comment=No documents found!',
            time: 'Wed, 27 Mar 2019 11:44:41 GMT',
            authorString: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
          }
        ]
      },
      request: {
        method: 'POST',
        url: 'Task'
      }
    }
  ]
}

export const mockDeathRejectionTaskBundleWithoutCompositionReference = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/be13e81f-0cd7-4ff3-a2d3-a1bc7a7f543a/_history/57a41663-6f07-42b7-9cce-c2945ddd3a0c',
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
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/death-tracking-id',
            value: 'DKCGBVI'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REJECTED'
            }
          ]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
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
        lastModified: '2019-03-27T11:44:41.407Z',
        meta: {
          lastUpdated: '2019-03-27T11:38:44.701+00:00',
          versionId: '57a41663-6f07-42b7-9cce-c2945ddd3a0c'
        },
        id: 'be13e81f-0cd7-4ff3-a2d3-a1bc7a7f543a',
        note: [
          {
            text: 'reason=missing_supporting_doc&comment=No documents found!',
            time: 'Wed, 27 Mar 2019 11:44:41 GMT',
            authorString: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
          }
        ]
      },
      request: {
        method: 'POST',
        url: 'Task'
      }
    }
  ]
}

export const mockSearchResult = {
  body: {
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
            event: 'BIRTH',
            childFamilyName: 'Moajjem',
            childFamilyNameLocal: 'মোয়াজ্জেম',
            declarationLocationId: '123',
            childDoB: '2011-11-11',
            gender: 'male',
            motherFamilyName: 'Moajjem',
            motherFamilyNameLocal: 'মোয়াজ্জেম',
            motherIdentifier: '11111111111111111'
          }
        },
        {
          _index: 'ocrvs',
          _type: 'compositions',
          _id: 'DGM9CA2',
          _score: 1,
          _source: {
            event: 'DEATH',
            deceasedFamilyName: 'Moajjem',
            deceasedFamilyNameLocal: 'মোয়াজ্জেম',
            declarationLocationId: '123',
            deceasedDoB: '2011-11-11',
            gender: 'male',
            motherFamilyName: 'Moajjem',
            motherFamilyNameLocal: 'মোয়াজ্জেম',
            motherIdentifier: '11111111111111111'
          }
        }
      ]
    }
  }
}

export const mockBirthFhirBundleWithoutParents = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:bcf4e631-ba4f-447b-b630-993709a38d71',
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'BDQNYZH'
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
                reference: 'urn:uuid:e74ed25d-8c9c-49aa-9abc-d2a659078b22'
              }
            ]
          },
          {
            title: 'Birth encounter',
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
                reference: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df'
              }
            ]
          }
        ],
        subject: {},
        date: '2019-04-03T08:56:10.718Z',
        author: [],
        id: 'b7a1743e-1431-41ed-87a8-3606ec7f6671'
      }
    },
    {
      fullUrl: 'urn:uuid:791afdc5-2d8b-4e05-bd99-4aeea0b0480c',
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
        focus: {
          reference: 'urn:uuid:bcf4e631-ba4f-447b-b630-993709a38d71'
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'FATHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '01711111111'
          },
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
        lastModified: '2019-04-03T08:56:12.031Z',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BDQNYZH'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'DECLARED'
            }
          ]
        }
      }
    },
    {
      fullUrl: 'urn:uuid:e74ed25d-8c9c-49aa-9abc-d2a659078b22',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'bn',
            given: ['রফিক'],
            family: ['ইসলাম']
          },
          {
            use: 'en',
            given: ['Rafiq'],
            family: ['Islam']
          }
        ],
        gender: 'male',
        birthDate: '2010-01-01'
      }
    },
    {
      fullUrl: 'urn:uuid:dcca6eb2-b608-4bb3-b17e-31ae9caa74dc',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '12341234123412341',
            type: 'BIRTH_REGISTRATION_NUMBER'
          }
        ],
        name: [
          {
            use: 'bn',
            given: ['বেগম'],
            family: ['রোকেয়া']
          },
          {
            use: 'en',
            given: ['Begum'],
            family: ['Rokeya']
          }
        ],
        birthDate: '1980-01-01',
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
            valueDateTime: '2008-01-01'
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
            valueString: 'PRIMARY_ISCED_1'
          }
        ],
        multipleBirthInteger: 1,
        address: [
          {
            type: 'PERMANENT',
            line: ['', '', '', '', '', '265abf9c-09d4-4b34-a0c6-336a53e23e4a'],
            district: 'a5010297-2d10-4109-8cb3-353ff9c084c2',
            state: '2414fc3f-7670-4d22-a053-5694858d72a2',
            country: 'BGD'
          },
          {
            type: 'CURRENT',
            line: ['', '', '', '', '', '265abf9c-09d4-4b34-a0c6-336a53e23e4a'],
            district: 'a5010297-2d10-4109-8cb3-353ff9c084c2',
            state: '2414fc3f-7670-4d22-a053-5694858d72a2',
            country: 'BGD'
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:63e5ea6d-6dc7-4df7-b908-328872e770e3',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '17238230233223321',
            type: 'BIRTH_REGISTRATION_NUMBER'
          }
        ],
        name: [
          {
            use: 'bn',
            given: ['ফারুক'],
            family: ['ইসলাম']
          },
          {
            use: 'en',
            given: ['Faruq'],
            family: ['Islam']
          }
        ],
        birthDate: '1970-01-01',
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
            valueDateTime: '2008-01-01'
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
            valueString: 'LOWER_SECONDARY_ISCED_2'
          }
        ],
        address: [
          {
            type: 'CURRENT',
            line: ['', '', '', '', '', '265abf9c-09d4-4b34-a0c6-336a53e23e4a'],
            district: 'a5010297-2d10-4109-8cb3-353ff9c084c2',
            state: '2414fc3f-7670-4d22-a053-5694858d72a2',
            country: 'BGD'
          },
          {
            type: 'PERMANENT',
            line: ['', '', '', '', '', '265abf9c-09d4-4b34-a0c6-336a53e23e4a'],
            district: 'a5010297-2d10-4109-8cb3-353ff9c084c2',
            state: '2414fc3f-7670-4d22-a053-5694858d72a2',
            country: 'BGD'
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df',
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: 'urn:uuid:3e199a21-3f71-41eb-b8ba-215e547d0d05'
            }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:3e199a21-3f71-41eb-b8ba-215e547d0d05',
      resource: {
        resourceType: 'Location',
        mode: 'instance',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'HOSPITAL'
            }
          ]
        },
        address: {
          line: ['', '', '', '', '', ''],
          district: '',
          state: '',
          postalCode: '',
          country: ''
        }
      }
    },
    {
      fullUrl: 'urn:uuid:e7249ecd-fb11-42cd-aa3b-d48e2288f504',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df'
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
      fullUrl: 'urn:uuid:3a7eb860-2bdd-4a44-846b-74d6ce8a65cb',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df'
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
          value: 2,
          unit: 'kg',
          system: 'http://unitsofmeasure.org',
          code: 'kg'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:372abcdc-7b1d-4671-92dc-4a0353916cbe',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df'
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
        valueString: 'PHYSICIAN'
      }
    },
    {
      fullUrl: 'urn:uuid:99315e6d-bcb6-4e9a-ba85-a41cff4f3b08',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df'
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
        valueString: 'BOTH_PARENTS'
      }
    }
  ],
  meta: {
    lastUpdated: '2019-04-03T08:56:10.718Z'
  }
}

export const mockMinimalDeathFhirBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:a2e730c8-07c8-4943-b66b-4ef9e4bde7a1',
      resource: {
        id: 'ff6a4fce-4e72-463c-a6aa-718054643983',
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

export const mockUserModelResponse = {
  catchmentAreaIds: [
    'c93cb3cf-38aa-4f07-b9a0-fe8b865a9fd9',
    'd5ccd1d1-ca47-435b-93db-36c626ad2dfa',
    '94429795-0a09-4de8-8e1e-27dab01877d2',
    '1490d3dd-71a9-47e8-b143-f9fc64f71294',
    '1490d3dd-71a9-47e8-b143-f9fc64f71294'
  ],
  scope: ['register', 'performance', 'certify', 'demo'],
  status: 'active',
  _id: '5ddfdfec61f7c0d1aafe1961',
  name: [
    {
      given: ['Mohammad'],
      use: 'en',
      family: 'Ashraful'
    }
  ],
  username: 'mohammad.ashraful',
  email: 'test@test.org',
  mobile: '+8801733333333',
  passwordHash: 'hash',
  salt: '78e7e7a1-9e21-42d7-b535-ca3d982fcbaf',
  role: 'LOCAL_REGISTRAR',
  type: 'CHAIRMAN',
  practitionerId: '7f65e00c-88fc-4dd0-a7af-5ea42960ae61',
  primaryOfficeId: '45e37658-cec7-4c61-b999-c49cfaf16da5',
  securityQuestionAnswers: [],
  identifiers: [],
  creationDate: 1574952940762
}

export const mockEncounterResponse = {
  resourceType: 'Encounter',
  status: 'finished',
  id: 'd3b9f408-a16a-42c2-9cfe-53ad2fbfda99',
  location: [
    { location: { reference: 'Location/43f49a50-d8f4-4f30-ba84-6bc7bc181b67' } }
  ],
  meta: {
    lastUpdated: '2020-03-09T10:20:36.532+00:00',
    versionId: 'e927451f-e19f-40dd-be7b-5b6c50c26d9d'
  }
}

export const mockLocationResponse = {
  resourceType: 'Location',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/internal-id',
      value: 'CRVS_FACILITY000002302'
    }
  ],
  name: 'Alokbali Union Parishad',
  alias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
  status: 'active',
  mode: 'instance',
  partOf: {
    reference: 'Location/c93cb3cf-38aa-4f07-b9a0-fe8b865a9fd9'
  },
  extension: [
    {
      url: 'http://opencrvs.org/extension/parent-location-reference',
      valueString: 'Location/c93cb3cf-38aa-4f07-b9a0-fe8b865a9fd9'
    }
  ],
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/location-type',
        code: 'CRVS_OFFICE'
      }
    ]
  },
  physicalType: {
    coding: [
      {
        code: 'bu',
        display: 'Building'
      }
    ]
  },
  address: {
    line: ['Alokbali', 'Narsingdi '],
    district: 'Narsingdi',
    state: 'Dhaka'
  },
  meta: {
    lastUpdated: '2019-11-28T14:54:11.918+00:00',
    versionId: '8de2fb91-0ba2-4179-841c-6867dc29abe2'
  },
  id: '45e37658-cec7-4c61-b999-c49cfaf16da5'
}

export const mockFacilityResponse = {
  resourceType: 'Location',
  name: 'Charmadhabpur(bakharnagar) Cc - Narsingdi Sadar',
  alias: ['Charmadhabpur(bakharnagar) Cc - Narsingdi Sadar'],
  status: 'active',
  mode: 'instance',
  partOf: {
    reference: 'Location/240e4216-5c32-41d3-b8a8-025e8c8260cb'
  },
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/location-type',
        code: 'HEALTH_FACILITY'
      }
    ]
  },
  physicalType: {
    coding: [
      {
        code: 'bu',
        display: 'Building'
      }
    ]
  },
  telecom: [],
  address: {
    line: ['Alokbali', 'Narsingdi Sadar'],
    district: 'Narsingdi',
    state: 'Dhaka'
  },
  meta: {
    lastUpdated: '2019-12-19T16:45:00.661+00:00',
    versionId: '25b82e56-003f-4da7-975a-e9395100e819'
  },
  id: 'f1ea7c2f-0b71-43e8-a199-a92a0e17102c'
}

export const mockTaskBirthCorrectionBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/e849ceb4-0adc-4be2-8fc8-8a4c41781bb5',
      resource: {
        resourceType: 'Task',
        status: 'requested',
        intent: '',
        input: [
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueCode: 'child',
            valueId: 'name',
            valueString: 'Old name'
          }
        ],
        output: [
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueCode: 'child',
            valueId: 'name',
            valueString: 'New name'
          }
        ],
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
