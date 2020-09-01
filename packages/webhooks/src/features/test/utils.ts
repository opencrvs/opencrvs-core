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
export const testBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      resource: {
        resourceType: 'Composition',
        status: 'preliminary',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'birth-application'
            }
          ],
          text: 'Birth Application'
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
        title: 'Birth Application',
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
              { reference: 'Patient/3cb39d61-cd70-4fe2-a133-469acd24b7b9' }
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
              { reference: 'Patient/759e9b2c-bcb8-4e3e-8649-f4e6e7e95300' }
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
              { reference: 'Patient/05b47ce8-ed74-4d7f-ac73-3701081abd2e' }
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
              { reference: 'Encounter/c860182f-f310-46be-a2d6-4bc94e706005' }
            ]
          }
        ],
        subject: {},
        date: '2020-07-29T12:52:04.801Z',
        author: [],
        meta: {
          lastUpdated: '2020-07-29T12:52:05.334+00:00',
          versionId: 'b78c164f-0380-418b-ae4d-cbb01942d5ac'
        },
        id: '5be040ce-a37a-4d4d-ab2a-7b992b245aef'
      }
    },
    {
      resource: {
        resourceType: 'Task',
        status: 'requested',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: {
          reference: 'Composition/5be040ce-a37a-4d4d-ab2a-7b992b245aef'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: 'cea395a4-8afc-427b-88f5-dde67fc132c2'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BLA7SHP'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2020BLA7SHP'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-relationship',
            valueString: ''
          },
          {
            url:
              'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+260798989899'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 175612
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/23919090-f59c-4185-b256-69faf8b519d5'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/43f37076-bf0e-46c6-97cb-4c2bd12dbdac'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/531e9275-40e4-4ab5-a12c-6fa74d7b5b61'
            }
          }
        ],
        lastModified: '2020-07-29T12:52:05.312Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2020-07-29T12:52:05.355+00:00',
          versionId: '6ce29ac8-ad73-4658-9ac4-fd337c75b8fc'
        },
        id: '9aca0171-16c0-4503-878d-26e3019b1a46'
      }
    },
    {
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [{ use: 'en', given: ['Olivier'], family: ['Richards'] }],
        gender: 'male',
        birthDate: '2020-02-23',
        multipleBirthInteger: 1,
        meta: {
          lastUpdated: '2020-07-29T12:52:05.378+00:00',
          versionId: '15d6ced2-85e4-4479-9ab3-3ccd3903f629'
        },
        id: '3cb39d61-cd70-4fe2-a133-469acd24b7b9',
        identifier: [
          { type: 'BIRTH_REGISTRATION_NUMBER', value: '2020BLA7SHP' }
        ]
      }
    },
    {
      resourceType: 'Patient',
      active: true,
      identifier: [{ value: '123654654', type: 'NATIONAL_ID' }],
      name: [{ use: 'en', given: ['Manue'], family: ['Hamilton'] }],
      birthDate: '1995-11-25',
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
          url: 'http://opencrvs.org/specs/extension/patient-occupation',
          valueString: 'Teacher'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
          extension: [
            {
              url: 'code',
              valueCodeableConcept: {
                coding: [{ system: 'urn:iso:std:iso:3166', code: 'ZMB' }]
              }
            },
            { url: 'period', valuePeriod: { start: '', end: '' } }
          ]
        },
        {
          url: 'http://opencrvs.org/specs/extension/educational-attainment',
          valueString: 'FIRST_STAGE_TERTIARY_ISCED_5'
        }
      ],
      address: [
        {
          type: 'PLACE_OF_HERITAGE',
          line: ['', '', '', '', '', ''],
          district: '06230f8f-1bf6-420f-9d1f-37551fa2f790',
          state: '3e4239cd-9912-49bf-b41d-296e5cea5bc7',
          country: 'ZMB'
        },
        {
          type: 'PERMANENT',
          line: ['', '', '', '', '', '', 'URBAN'],
          district: 'ba930475-9828-4ab0-9a8b-ed6fb77108f8',
          state: 'd1b2c88a-d178-45b1-9f98-6bec75dbe590',
          country: 'ZMB'
        },
        {
          type: 'CURRENT',
          line: ['', '', '', '', '', '', 'URBAN'],
          district: 'ba930475-9828-4ab0-9a8b-ed6fb77108f8',
          state: 'd1b2c88a-d178-45b1-9f98-6bec75dbe590',
          country: 'ZMB'
        }
      ],
      meta: {
        lastUpdated: '2020-07-29T12:52:05.399+00:00',
        versionId: '5226aeed-e915-4e71-8e92-6791aade1ddc'
      },
      id: '759e9b2c-bcb8-4e3e-8649-f4e6e7e95300'
    },
    {
      resourceType: 'Patient',
      active: true,
      identifier: [{ value: '987654654', type: 'NATIONAL_ID' }],
      name: [{ use: 'en', given: ['Carl'], family: ['Hamilton'] }],
      birthDate: '1990-06-10',
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
          url: 'http://opencrvs.org/specs/extension/patient-occupation',
          valueString: 'Teacher'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
          extension: [
            {
              url: 'code',
              valueCodeableConcept: {
                coding: [{ system: 'urn:iso:std:iso:3166', code: 'ZMB' }]
              }
            },
            { url: 'period', valuePeriod: { start: '', end: '' } }
          ]
        },
        {
          url: 'http://opencrvs.org/specs/extension/educational-attainment',
          valueString: 'FIRST_STAGE_TERTIARY_ISCED_5'
        }
      ],
      address: [
        {
          type: 'PERMANENT',
          line: ['', '', '', '', '', '', 'URBAN'],
          district: 'a2cde683-f423-47f5-93c4-2effa5c31f86',
          state: 'cd5e34cb-abe0-4900-9509-28f378b8d8e8',
          country: 'ZMB'
        }
      ],
      meta: {
        lastUpdated: '2020-07-29T12:52:05.404+00:00',
        versionId: '944834ce-27dd-437d-bf13-b5aa73cc6328'
      },
      id: '05b47ce8-ed74-4d7f-ac73-3701081abd2e'
    },
    {
      resourceType: 'Encounter',
      status: 'finished',
      location: [
        {
          location: {
            reference: 'Location/4e9f6ae9-67e9-494b-8ad7-1f677babb74e'
          }
        }
      ],
      meta: {
        lastUpdated: '2020-07-29T12:52:05.408+00:00',
        versionId: '9b5b95cd-8d5a-45e8-9811-16306780b44e'
      },
      id: 'c860182f-f310-46be-a2d6-4bc94e706005'
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Observation/84d7a4df-dcfd-430c-9881-d0b56dd7ec28/_history/abd569eb-84de-4ade-9431-71972e88a341',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/c860182f-f310-46be-a2d6-4bc94e706005'
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
        valueQuantity: { value: 'SINGLE' },
        meta: {
          lastUpdated: '2020-07-29T12:52:05.426+00:00',
          versionId: 'abd569eb-84de-4ade-9431-71972e88a341'
        },
        id: '84d7a4df-dcfd-430c-9881-d0b56dd7ec28'
      },
      request: { method: 'POST', url: 'Observation' }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Observation/ae0e18ae-f60c-4c29-b477-3abf65823ebc/_history/48a4f8e9-4179-4c58-9933-bd51672e39bc',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/c860182f-f310-46be-a2d6-4bc94e706005'
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
          value: 4,
          unit: 'kg',
          system: 'http://unitsofmeasure.org',
          code: 'kg'
        },
        meta: {
          lastUpdated: '2020-07-29T12:52:05.445+00:00',
          versionId: '48a4f8e9-4179-4c58-9933-bd51672e39bc'
        },
        id: 'ae0e18ae-f60c-4c29-b477-3abf65823ebc'
      },
      request: { method: 'POST', url: 'Observation' }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Observation/de353f5d-4420-4b97-a3d0-ded9b51227d6/_history/ebccafcb-deb6-4c0b-b1d5-ee5417dce65e',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/c860182f-f310-46be-a2d6-4bc94e706005'
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
        valueString: 'MIDWIFE',
        meta: {
          lastUpdated: '2020-07-29T12:52:05.447+00:00',
          versionId: 'ebccafcb-deb6-4c0b-b1d5-ee5417dce65e'
        },
        id: 'de353f5d-4420-4b97-a3d0-ded9b51227d6'
      },
      request: { method: 'POST', url: 'Observation' }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Observation/cb136014-349d-4a3a-84f0-e77a329f7f27/_history/2487549e-133e-4712-b8ba-fce66fbbebbd',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/c860182f-f310-46be-a2d6-4bc94e706005'
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
        valueString: 'MOTHER',
        meta: {
          lastUpdated: '2020-07-29T12:52:05.449+00:00',
          versionId: '2487549e-133e-4712-b8ba-fce66fbbebbd'
        },
        id: 'cb136014-349d-4a3a-84f0-e77a329f7f27'
      },
      request: { method: 'POST', url: 'Observation' }
    }
  ]
}
