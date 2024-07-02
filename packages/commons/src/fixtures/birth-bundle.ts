/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { UUID } from '..'
import {
  Composition,
  Encounter,
  Location,
  Observation,
  Patient,
  Practitioner,
  PractitionerRole,
  RegistrationNumber,
  RelatedPerson,
  ResourceIdentifier,
  Saved,
  SavedBundle,
  Task,
  TrackingID,
  URLReference
} from '../types'

export const BIRTH_BUNDLE: SavedBundle<
  Saved<
    | Composition
    | Encounter
    | Patient
    | RelatedPerson
    | Location
    | PractitionerRole
    | Practitioner
    | Observation
    | Task
  >
> = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        '/fhir/Composition/09f39e17-ca23-4905-9ab3-f3649c4e3162/_history/f37805b6-4852-4ddc-8bb7-5f7be7e9a466' as URLReference,
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'a31f6159-0d40-461c-aeaa-9dff5b62cbfa'
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
                reference:
                  'Encounter/e7ed42ae-bd54-4d7c-ad9d-0af7506d1d64' as ResourceIdentifier
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
                reference:
                  'RelatedPerson/a0fd7881-33e6-4751-a346-78f820aa3dbb' as ResourceIdentifier
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
                reference:
                  'Patient/cd5693ed-dd33-4c3a-a9fc-7479b132a4ea' as ResourceIdentifier
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
                reference:
                  'Patient/dfac3127-963e-4ef2-b875-3123e08da3d9' as ResourceIdentifier
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
                reference:
                  'Patient/3ee05cf9-a550-4d7f-abde-54313f7bd41a' as ResourceIdentifier
              }
            ]
          }
        ],
        subject: {},
        date: '2023-08-11T05:26:26.000Z',
        author: [],
        id: '09f39e17-ca23-4905-9ab3-f3649c4e3162' as UUID,
        meta: {
          lastUpdated: '2023-09-13T12:40:00.103+00:00',
          versionId: 'f37805b6-4852-4ddc-8bb7-5f7be7e9a466'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Encounter/e7ed42ae-bd54-4d7c-ad9d-0af7506d1d64/_history/94577be6-2f4f-40aa-9a83-a0b22351acf7' as URLReference,
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        id: 'e7ed42ae-bd54-4d7c-ad9d-0af7506d1d64' as UUID,
        location: [
          {
            location: {
              reference:
                'Location/565d957a-109a-4bf3-a3af-f0ad52c719cd' as ResourceIdentifier
            }
          }
        ],
        meta: {
          lastUpdated: '2023-09-13T12:40:00.114+00:00',
          versionId: '94577be6-2f4f-40aa-9a83-a0b22351acf7'
        }
      }
    },
    {
      fullUrl:
        '/fhir/RelatedPerson/a0fd7881-33e6-4751-a346-78f820aa3dbb/_history/2cd33315-51cd-4cf6-a869-40bf23fa0a4b' as URLReference,
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
          reference:
            'Patient/cd5693ed-dd33-4c3a-a9fc-7479b132a4ea' as ResourceIdentifier
        },
        id: 'a0fd7881-33e6-4751-a346-78f820aa3dbb' as UUID,
        meta: {
          lastUpdated: '2023-09-13T12:40:00.141+00:00',
          versionId: '2cd33315-51cd-4cf6-a869-40bf23fa0a4b'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/3ee05cf9-a550-4d7f-abde-54313f7bd41a/_history/b6aadf39-2d7d-465c-b6c6-eca0f9a8d7f6' as URLReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        id: '3ee05cf9-a550-4d7f-abde-54313f7bd41a' as UUID,
        identifier: [
          {
            value: '8762475961',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'NATIONAL_ID'
                }
              ]
            }
          }
        ],
        name: [
          {
            use: 'en',
            given: ['Baumbach'],
            family: ['Neil']
          }
        ],
        birthDate: '2003-07-11',
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
            valueString: 'Bookkeeper'
          },
          {
            url: 'http://opencrvs.org/specs/extension/date-of-marriage',
            valueDateTime: '2021-07-11'
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
                      code: 'FAR'
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
            valueString: 'POST_SECONDARY_ISCED_4'
          }
        ],
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: [
              '12',
              'Usual Street',
              'Usual Residental Area',
              '',
              '',
              'URBAN'
            ],
            city: 'South Jamelmouth',
            district: 'e66643ac-9ea9-4314-b842-f4fb3ad9e83a',
            state: '1cfe40fa-7b43-4c1e-aa05-4281e5122d9b',
            postalCode: '34422-6447',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference: 'Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a'
                }
              }
            ]
          }
        ],
        meta: {
          lastUpdated: '2023-09-13T12:40:00.170+00:00',
          versionId: 'b6aadf39-2d7d-465c-b6c6-eca0f9a8d7f6'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/cd5693ed-dd33-4c3a-a9fc-7479b132a4ea/_history/40daecc4-a58e-4a9a-9cc7-0d51111e72af' as URLReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '2253499797',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'NATIONAL_ID'
                }
              ]
            }
          }
        ],
        name: [
          {
            use: 'en',
            given: ['Sophia'],
            family: ['Baumbach']
          }
        ],
        telecom: [
          {
            system: 'phone',
            value: '+260711384538'
          }
        ],
        birthDate: '2003-07-11',
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
            valueString: 'Farmer'
          },
          {
            url: 'http://opencrvs.org/specs/extension/date-of-marriage',
            valueDateTime: '2021-07-11'
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
                      code: 'FAR'
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
            valueString: 'POST_SECONDARY_ISCED_4'
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
                      code: 'FAR'
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
        multipleBirthInteger: 2,
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: [
              '12',
              'Usual Street',
              'Usual Residental Area',
              '',
              '',
              'URBAN',
              '12',
              'Usual Street',
              'Usual Residental Area',
              '',
              '',
              'URBAN'
            ],
            city: 'South Jamelmouth',
            district: 'e66643ac-9ea9-4314-b842-f4fb3ad9e83a',
            state: '1cfe40fa-7b43-4c1e-aa05-4281e5122d9b',
            postalCode: '34422-6447',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference: 'Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a'
                }
              }
            ]
          }
        ],
        id: 'cd5693ed-dd33-4c3a-a9fc-7479b132a4ea' as UUID,
        meta: {
          lastUpdated: '2023-09-13T12:40:00.147+00:00',
          versionId: '40daecc4-a58e-4a9a-9cc7-0d51111e72af'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/dfac3127-963e-4ef2-b875-3123e08da3d9/_history/a556dc54-724d-48f8-bd50-ac788c684a5d' as URLReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        id: 'dfac3127-963e-4ef2-b875-3123e08da3d9' as UUID,
        name: [
          {
            use: 'en',
            given: ['Isadore'],
            family: ['Baumbach']
          }
        ],
        gender: 'female',
        birthDate: '2023-07-11',
        meta: {
          lastUpdated: '2023-09-13T12:40:00.465+00:00',
          versionId: 'a556dc54-724d-48f8-bd50-ac788c684a5d'
        },
        identifier: [
          {
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'BIRTH_REGISTRATION_NUMBER'
                }
              ]
            },
            value: '2023B3VUXES'
          },
          {
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'BIRTH_CONFIGURABLE_IDENTIFIER_1'
                }
              ]
            },
            value: ''
          },
          {
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'BIRTH_CONFIGURABLE_IDENTIFIER_2'
                }
              ]
            },
            value: ''
          },
          {
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'BIRTH_CONFIGURABLE_IDENTIFIER_3'
                }
              ]
            },
            value: ''
          }
        ]
      }
    },
    {
      fullUrl:
        '/fhir/Task/358c0c75-9855-4812-b560-c1b5fbf48e5a/_history/3a52f418-7137-4c03-90ae-821123db4db1' as URLReference,
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
          reference:
            'Composition/09f39e17-ca23-4905-9ab3-f3649c4e3162' as ResourceIdentifier
        },
        id: '358c0c75-9855-4812-b560-c1b5fbf48e5a' as UUID,
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '09f39e17-ca23-4905-9ab3-f3649c4e3162' as UUID
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B3VUXES' as TrackingID
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2023B3VUXES' as RegistrationNumber
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+260711384538'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'Sophia.Baumbach95@gmail.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 1077227
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueString: 'Ibombo District Office',
            valueReference: {
              reference: 'Location/e9e1b362-27c9-4ce1-82ad-57fe9d5650e4'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference:
                'Practitioner/48455871-1636-46a1-8279-aaa76dec03d4' as ResourceIdentifier
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regAssigned'
          }
        ],
        lastModified: '2023-10-02T13:51:55.410Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'WAITING_VALIDATION'
            }
          ]
        },
        meta: {
          lastUpdated: '2023-10-02T13:51:55.645+00:00',
          versionId: '3a52f418-7137-4c03-90ae-821123db4db1'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/78e42deb-c50e-43c8-853f-71ccc6398512/_history/fb32c976-fef0-4dcb-85c3-846a6afcf810' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e7ed42ae-bd54-4d7c-ad9d-0af7506d1d64'
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
        id: '78e42deb-c50e-43c8-853f-71ccc6398512' as UUID,
        valueQuantity: {
          value: 'SINGLE'
        },
        meta: {
          lastUpdated: '2023-09-13T12:40:00.121+00:00',
          versionId: 'fb32c976-fef0-4dcb-85c3-846a6afcf810'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/d47d4a55-bf18-4704-ac3a-0066e3ecff6f/_history/724e2f8c-3095-4d11-8ea1-ef39418e7192' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e7ed42ae-bd54-4d7c-ad9d-0af7506d1d64'
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
        id: 'd47d4a55-bf18-4704-ac3a-0066e3ecff6f' as UUID,
        valueQuantity: {
          value: 4.1,
          unit: 'kg',
          system: 'http://unitsofmeasure.org',
          code: 'kg'
        },
        meta: {
          lastUpdated: '2023-09-13T12:40:00.127+00:00',
          versionId: '724e2f8c-3095-4d11-8ea1-ef39418e7192'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/942901b9-e03f-4209-953d-fd094e5e8231/_history/09dd28ef-f51d-4481-acb5-26b2c6ef75ab' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e7ed42ae-bd54-4d7c-ad9d-0af7506d1d64'
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
        valueString: 'PHYSICIAN',
        meta: {
          lastUpdated: '2023-09-13T12:40:00.099+00:00',
          versionId: '09dd28ef-f51d-4481-acb5-26b2c6ef75ab'
        },

        id: '942901b9-e03f-4209-953d-fd094e5e8231' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Practitioner/48455871-1636-46a1-8279-aaa76dec03d4/_history/11f94e98-4492-4834-8371-0bf75d58c8ad' as URLReference,
      resource: {
        resourceType: 'Practitioner',
        identifier: [],
        telecom: [
          {
            system: 'phone'
          },
          {
            system: 'email',
            value: ''
          }
        ],
        name: [
          {
            use: 'en',
            given: ['Kennedy'],
            family: 'Mweene'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/employee-signature',
            valueSignature: {
              type: [
                {
                  system: 'urn:iso-astm:E1762-95:2013',
                  code: '1.2.840.10065.1.12.1.13',
                  display: 'Review Signature'
                }
              ],
              when: '2023-09-19T06:47:48.225Z',
              contentType: 'image/png',
              blob: 'data:image/png;base64,'
            }
          }
        ],
        id: '48455871-1636-46a1-8279-aaa76dec03d4' as UUID,
        meta: {
          lastUpdated: '2023-09-19T06:47:48.290+00:00',
          versionId: '11f94e98-4492-4834-8371-0bf75d58c8ad'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a/_history/df1ba3bc-0ec3-4f5f-81ee-8a635019de0c' as URLReference,
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_oEBf29y8JP8'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Ibombo',
        alias: ['Ibombo'],
        description: 'oEBf29y8JP8',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference:
            'Location/1cfe40fa-7b43-4c1e-aa05-4281e5122d9b' as ResourceIdentifier
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-13T12:36:07.426+00:00',
          versionId: 'df1ba3bc-0ec3-4f5f-81ee-8a635019de0c'
        },

        id: 'e66643ac-9ea9-4314-b842-f4fb3ad9e83a' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/e9e1b362-27c9-4ce1-82ad-57fe9d5650e4/_history/ebe887c3-35fd-4af3-9163-c4decf93797f' as URLReference,
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'CRVS_OFFICE_JWMRGwDBXK'
          }
        ],
        name: 'Ibombo District Office',
        alias: ['Ibombo District Office'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference:
            'Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a' as ResourceIdentifier
        },
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
        meta: {
          lastUpdated: '2023-09-13T12:36:08.749+00:00',
          versionId: 'ebe887c3-35fd-4af3-9163-c4decf93797f'
        },

        id: 'e9e1b362-27c9-4ce1-82ad-57fe9d5650e4' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/565d957a-109a-4bf3-a3af-f0ad52c719cd/_history/1dc58c47-e0e3-4d54-89b5-df4b6ed6c5f4' as URLReference,
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_TsWOcEzohYx'
          }
        ],
        name: 'Keembe Rural Health Centre',
        alias: ['Keembe Rural Health Centre'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference:
            'Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a' as ResourceIdentifier
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
        meta: {
          lastUpdated: '2023-09-13T12:36:07.601+00:00',
          versionId: '1dc58c47-e0e3-4d54-89b5-df4b6ed6c5f4'
        },

        id: '565d957a-109a-4bf3-a3af-f0ad52c719cd' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/PractitionerRole/5f675c08-9494-462f-9fac-043755b865ad/_history/e51b99bc-c7e6-4672-af5e-7d5496c5b8eb' as URLReference,
      resource: {
        resourceType: 'PractitionerRole',
        practitioner: {
          reference: 'Practitioner/48455871-1636-46a1-8279-aaa76dec03d4'
        },
        code: [
          {
            coding: [
              {
                system: 'http://opencrvs.org/specs/roles',
                code: 'LOCAL_REGISTRAR'
              }
            ]
          },
          {
            coding: [
              {
                system: 'http://opencrvs.org/specs/types',
                code: '[{"lang":"en","label":"Local Registrar"},{"lang":"fr","label":"Registraire local"}]'
              }
            ]
          }
        ],
        location: [
          {
            reference: 'Location/e9e1b362-27c9-4ce1-82ad-57fe9d5650e4'
          },
          {
            reference: 'Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a'
          },
          {
            reference: 'Location/1cfe40fa-7b43-4c1e-aa05-4281e5122d9b'
          }
        ],
        id: '5f675c08-9494-462f-9fac-043755b865ad' as UUID,
        meta: {
          lastUpdated: '2023-09-19T06:47:48.411+00:00',
          versionId: 'e51b99bc-c7e6-4672-af5e-7d5496c5b8eb'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Location/1cfe40fa-7b43-4c1e-aa05-4281e5122d9b/_history/585dad70-a478-43af-8bb6-07b7f67f998d' as URLReference,
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_AWn3s2RqgAN'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'STATE'
          }
        ],
        name: 'Central',
        alias: ['Central'],
        description: 'AWn3s2RqgAN',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/0' as ResourceIdentifier
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":20000},{"2008":20000},{"2009":20000},{"2010":20000},{"2011":20000},{"2012":20000},{"2013":20000},{"2014":20000},{"2015":20000},{"2016":20000},{"2017":20000},{"2018":20000},{"2019":20000},{"2020":20000},{"2021":20000},{"2022":30000},{"2023":40000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":20000},{"2008":20000},{"2009":20000},{"2010":20000},{"2011":20000},{"2012":20000},{"2013":20000},{"2014":20000},{"2015":20000},{"2016":20000},{"2017":20000},{"2018":20000},{"2019":20000},{"2020":20000},{"2021":20000},{"2022":30000},{"2023":40000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":40000},{"2008":40000},{"2009":40000},{"2010":40000},{"2011":40000},{"2012":40000},{"2013":40000},{"2014":40000},{"2015":40000},{"2016":40000},{"2017":40000},{"2018":40000},{"2019":40000},{"2020":40000},{"2021":40000},{"2022":60000},{"2023":80000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-13T12:36:07.387+00:00',
          versionId: '585dad70-a478-43af-8bb6-07b7f67f998d'
        },
        id: '1cfe40fa-7b43-4c1e-aa05-4281e5122d9b' as UUID
      }
    }
  ]
}
