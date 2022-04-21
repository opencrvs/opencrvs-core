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
// @ts-ignore
import * as fakerModule from 'cdnjs.cloudflare.com/ajax/libs/Faker/3.1.0/faker.min.js'

export default (rates) => {
  // Add typing for faker, needed due to url import
  const faker: Faker.FakerStatic = fakerModule

  const compositionUuid = faker.random.uuid()
  const childFirstName = faker.name.firstName()
  const childLastName = faker.name.lastName()
  const childFirstNameBN = 'গাজী'
  const childLastNameBN = 'আশরাফ'
  const childGender = Math.random() > rates.femaleRate ? 'male' : 'female'
  const regDate = faker.date.past(5, new Date())
  const childDOB = faker.date.past(5, regDate)

  // Set earliest parent age to 16 at child DOB
  const earliestParentAge = new Date(childDOB.getTime())
  earliestParentAge.setFullYear(earliestParentAge.getFullYear() - 16)

  const motherNID = faker.random
    .number({
      min: 1000000000000,
      max: 9999999999999
    })
    .toString()
  const motherFirstName = faker.name.firstName()
  const motherLastName = faker.name.lastName()
  const motherFirstNameBN = 'গাজী'
  const motherLastNameBN = 'আশরাফ'
  const motherDOB = faker.date.past(20, earliestParentAge)

  const fatherNID = faker.random
    .number({
      min: 1000000000000,
      max: 9999999999999
    })
    .toString()
  const fatherFirstName = faker.name.firstName()
  const fatherLastName = faker.name.lastName()
  const fatherFirstNameBN = 'গাজী'
  const fatherLastNameBN = 'আশরাফ'
  const fatherDOB = faker.date.past(20, earliestParentAge)

  const dateOfMarriage = faker.date.past(5, earliestParentAge)

  const addressNumber = faker.random.number(999)
  const addressStreet = faker.address.streetName()

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
          date: regDate.toISOString(),
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
              url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
              valueString: '01711111111'
            }
          ],
          lastModified: regDate.toISOString(),
          note: [{ text: 'note', time: regDate.toISOString() }]
        }
      },
      {
        fullUrl: 'urn:uuid:f573d755-1454-4c85-af6b-80d3e709b8ad',
        resource: {
          resourceType: 'Patient',
          active: true,
          name: [
            { use: 'bn', given: [childFirstNameBN], family: [childLastNameBN] }, // TODO use bn names
            {
              use: 'en',
              given: [childFirstName],
              family: [childLastName]
            }
          ],
          gender: childGender,
          birthDate: childDOB.toISOString().substring(0, 10)
        }
      },
      {
        fullUrl: 'urn:uuid:e8e4b622-541a-459e-8bc7-52c80f30e8f6',
        resource: {
          resourceType: 'Patient',
          active: true,
          identifier: [{ value: motherNID, type: 'NATIONAL_ID' }],
          name: [
            {
              use: 'bn',
              given: [motherFirstNameBN],
              family: [motherLastNameBN]
            },
            { use: 'en', given: [fatherFirstName], family: [fatherLastName] }
          ],
          birthDate: motherDOB.toISOString().substring(0, 10),
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
              valueDateTime: dateOfMarriage.toISOString().substring(0, 10)
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
              type: 'PRIMARY_ADDRESS',
              line: [
                addressNumber,
                '',
                addressStreet,
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
              type: 'SECONDARY_ADDRESS',
              line: [
                addressNumber,
                '',
                addressStreet,
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
          identifier: [{ value: fatherNID, type: 'NATIONAL_ID' }],
          name: [
            {
              use: 'bn',
              given: [fatherFirstNameBN],
              family: [fatherLastNameBN]
            },
            { use: 'en', given: [fatherFirstName], family: [fatherLastName] }
          ],
          birthDate: fatherDOB.toISOString().substring(0, 10),
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
              valueDateTime: dateOfMarriage.toISOString().substring(0, 10)
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
          address: [
            {
              type: 'SECONDARY_ADDRESS',
              line: [
                addressNumber,
                '',
                addressStreet,
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
              type: 'PRIMARY_ADDRESS',
              line: [
                addressNumber,
                '',
                addressStreet,
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
    meta: { lastUpdated: regDate.toISOString() }
  }
}
