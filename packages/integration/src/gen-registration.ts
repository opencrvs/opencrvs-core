// @ts-ignore
import * as faker from 'cdnjs.cloudflare.com/ajax/libs/Faker/3.1.0/faker.min.js'

export default rates => {
  const compositionUuid = faker.random.uuid()
  const childFirstName = faker.name.firstName()
  const childLastName = faker.name.lastName()
  const childGender = Math.random() > rates.femaleRate ? 'male' : 'female'
  const childDob = faker.date.past(5, new Date())

  return {
    resourceType: 'Bundle',
    type: 'document',
    entry: [
      {
        fullUrl: `urn:uuid:${compositionUuid}`,
        resource: {
          identifier: {
            system: 'urn:ietf:rfc:3986',
            value: compositionUuid
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
                { reference: 'urn:uuid:f573d755-1454-4c85-af6b-80d3e709b8ad' }
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
                { reference: 'urn:uuid:e8e4b622-541a-459e-8bc7-52c80f30e8f6' }
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
                { reference: 'urn:uuid:96bb7d41-5c8c-484f-b967-2229d3b7c039' }
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
                { reference: 'urn:uuid:30baba39-05a5-4545-a349-e3a6cde66530' }
              ]
            }
          ],
          subject: {},
          date: '2019-05-06T13:10:09.023Z',
          author: []
        }
      },
      {
        fullUrl: 'urn:uuid:cdce7fff-3512-4c60-a81e-28725d2ec61c',
        resource: {
          resourceType: 'Task',
          status: 'requested',
          code: {
            coding: [
              { system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }
            ]
          },
          focus: { reference: `urn:uuid:${compositionUuid}` },
          extension: [
            {
              url: 'http://opencrvs.org/specs/extension/contact-person',
              valueString: 'FATHER'
            },
            {
              url:
                'http://opencrvs.org/specs/extension/contact-person-phone-number',
              valueString: '01711111111'
            }
          ],
          lastModified: '2019-05-06T13:10:09.033Z',
          note: [{ text: 'note', time: '2019-05-06T13:10:09.033Z' }]
        }
      },
      {
        fullUrl: 'urn:uuid:f573d755-1454-4c85-af6b-80d3e709b8ad',
        resource: {
          resourceType: 'Patient',
          active: true,
          name: [
            { use: 'bn', given: [childFirstName], family: [childLastName] }, // TODO use bn names
            {
              use: 'en',
              given: [childFirstName],
              family: [childLastName]
            }
          ],
          gender: childGender,
          birthDate: childDob.toISOString().substring(0, 10)
        }
      },
      {
        fullUrl: 'urn:uuid:e8e4b622-541a-459e-8bc7-52c80f30e8f6',
        resource: {
          resourceType: 'Patient',
          active: true,
          identifier: [{ value: '1234567898765', type: 'NATIONAL_ID' }],
          name: [
            { use: 'bn', given: ['গায়ত্রী'], family: ['স্পিভক'] },
            { use: 'en', given: ['Gayatri'], family: ['Spivak'] }
          ],
          birthDate: '2010-08-01',
          maritalStatus: {
            coding: [
              {
                system:
                  'http://hl7.org/fhir/StructureDefinition/marital-status',
                code: 'M'
              }
            ],
            text: 'MARRIED'
          },
          extension: [
            {
              url: 'http://opencrvs.org/specs/extension/date-of-marriage',
              valueDateTime: '2018-08-01'
            },
            {
              url:
                'http://hl7.org/fhir/StructureDefinition/patient-nationality',
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
              type: 'PERMANENT',
              line: [
                '40',
                '',
                'My street',
                '692344f2-9185-4649-b515-66fc1e33147f',
                '',
                '7719942b-16a7-474a-8af1-cd0c94c730d2'
              ],
              district: '95754572-ab6f-407b-b51a-1636cb3d0683',
              state: 'b21ce04e-7ccd-4d65-929f-453bc193a736',
              postalCode: '1024',
              country: 'BGD'
            },
            {
              type: 'CURRENT',
              line: [
                '40',
                '',
                'My street',
                '692344f2-9185-4649-b515-66fc1e33147f',
                '',
                '7719942b-16a7-474a-8af1-cd0c94c730d2'
              ],
              district: '95754572-ab6f-407b-b51a-1636cb3d0683',
              state: 'b21ce04e-7ccd-4d65-929f-453bc193a736',
              postalCode: '1024',
              country: 'BGD'
            }
          ]
        }
      },
      {
        fullUrl: 'urn:uuid:96bb7d41-5c8c-484f-b967-2229d3b7c039',
        resource: {
          resourceType: 'Patient',
          active: true,
          identifier: [{ value: '1234567898765', type: 'NATIONAL_ID' }],
          name: [
            { use: 'bn', given: ['গায়ত্রী'], family: ['স্পিভক'] },
            { use: 'en', given: ['Gayatri'], family: ['Spivak'] }
          ],
          birthDate: '2010-08-01',
          maritalStatus: {
            coding: [
              {
                system:
                  'http://hl7.org/fhir/StructureDefinition/marital-status',
                code: 'M'
              }
            ],
            text: 'MARRIED'
          },
          extension: [
            {
              url: 'http://opencrvs.org/specs/extension/date-of-marriage',
              valueDateTime: '2018-08-01'
            },
            {
              url:
                'http://hl7.org/fhir/StructureDefinition/patient-nationality',
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
          address: [
            {
              type: 'CURRENT',
              line: [
                '40',
                '',
                'My street',
                '692344f2-9185-4649-b515-66fc1e33147f',
                '',
                '7719942b-16a7-474a-8af1-cd0c94c730d2'
              ],
              district: '95754572-ab6f-407b-b51a-1636cb3d0683',
              state: 'b21ce04e-7ccd-4d65-929f-453bc193a736',
              postalCode: '1024',
              country: 'BGD'
            },
            {
              type: 'PERMANENT',
              line: [
                '40',
                '',
                'My street',
                '692344f2-9185-4649-b515-66fc1e33147f',
                '',
                '7719942b-16a7-474a-8af1-cd0c94c730d2'
              ],
              district: '95754572-ab6f-407b-b51a-1636cb3d0683',
              state: 'b21ce04e-7ccd-4d65-929f-453bc193a736',
              postalCode: '1024',
              country: 'BGD'
            }
          ]
        }
      },
      {
        fullUrl: 'urn:uuid:30baba39-05a5-4545-a349-e3a6cde66530',
        resource: {
          resourceType: 'Encounter',
          status: 'finished',
          location: [
            {
              location: {
                reference: 'urn:uuid:713c9689-c945-4342-8a3e-7abc0a9b946d'
              }
            }
          ]
        }
      },
      {
        fullUrl: 'urn:uuid:713c9689-c945-4342-8a3e-7abc0a9b946d',
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
        fullUrl: 'urn:uuid:537582f8-889b-488f-892f-37a9a113f19c',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'urn:uuid:30baba39-05a5-4545-a349-e3a6cde66530'
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
          valueQuantity: { value: 'SINGLE' }
        }
      },
      {
        fullUrl: 'urn:uuid:bb852146-e133-4a55-8713-e365710addb4',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'urn:uuid:30baba39-05a5-4545-a349-e3a6cde66530'
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
        fullUrl: 'urn:uuid:656867a4-7f58-45ec-9885-5fb6a6679adf',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'urn:uuid:30baba39-05a5-4545-a349-e3a6cde66530'
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
          valueString: 'MIDWIFE'
        }
      },
      {
        fullUrl: 'urn:uuid:b2dfebd2-782e-447a-9f7d-6e20787ea885',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          context: {
            reference: 'urn:uuid:30baba39-05a5-4545-a349-e3a6cde66530'
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
    meta: { lastUpdated: '2019-05-06T13:10:09.023Z' }
  }
}
