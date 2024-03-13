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
  Bundle,
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
  Task,
  TrackingID,
  URLReference
} from '../types'

export const MARRIAGE_BUNDLE: Saved<
  Bundle<
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
        '/fhir/Composition/b2e4d436-d7fb-4b0f-9674-628b5af8f42e/_history/11b58bf1-72db-4d24-ac7e-678594445f16' as URLReference,
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: '894fa4ff-4f5c-4d11-a338-5b5858051776'
        },
        resourceType: 'Composition',
        status: 'preliminary',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'marriage-declaration'
            }
          ],
          text: 'Marriage Declaration'
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
        title: 'Marriage Declaration',
        section: [
          {
            title: 'Marriage encounter',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'marriage-encounter'
                }
              ],
              text: 'Marriage encounter'
            },
            entry: [
              {
                reference:
                  'Encounter/669cb7d8-5963-4b49-b647-7463d9e135b5' as ResourceIdentifier
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
                  'RelatedPerson/4065eb20-d02b-48d7-a783-5d7e452c7a7d' as ResourceIdentifier
              }
            ]
          },
          {
            title: "Groom's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'groom-details'
                }
              ],
              text: "Groom's details"
            },
            entry: [
              {
                reference:
                  'Patient/1a5ad72e-9241-4358-a937-861cfdf44f4d' as ResourceIdentifier
              }
            ]
          },
          {
            title: "Bride's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'bride-details'
                }
              ],
              text: "Bride's details"
            },
            entry: [
              {
                reference:
                  'Patient/5b979fe9-eaa3-4c4e-87ab-ee48ea1abb16' as ResourceIdentifier
              }
            ]
          },
          {
            title: "Witness One's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'witness-one-details'
                }
              ],
              text: "Witness One's details"
            },
            entry: [
              {
                reference:
                  'RelatedPerson/d2f33008-1486-4f09-845e-ceae40c05b48' as ResourceIdentifier
              }
            ]
          },
          {
            title: "Witness Two's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'witness-two-details'
                }
              ],
              text: "Witness Two's details"
            },
            entry: [
              {
                reference:
                  'RelatedPerson/ef774525-966c-4136-b0b8-753ca0eccfb7' as ResourceIdentifier
              }
            ]
          }
        ],
        subject: {},
        date: '2023-09-22T08:54:48.780Z',
        author: [],
        id: 'b2e4d436-d7fb-4b0f-9674-628b5af8f42e' as UUID,
        meta: {
          lastUpdated: '2023-09-22T08:54:49.693+00:00',
          versionId: '11b58bf1-72db-4d24-ac7e-678594445f16'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Encounter/669cb7d8-5963-4b49-b647-7463d9e135b5/_history/0914aaa0-0489-4a76-9cb9-a6b7f094d608' as URLReference,
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        id: '669cb7d8-5963-4b49-b647-7463d9e135b5' as UUID,
        location: [
          {
            location: {
              reference:
                'Location/461a4ba8-5592-4b1a-a30b-747150a01623' as ResourceIdentifier
            }
          }
        ],
        meta: {
          lastUpdated: '2023-09-22T08:54:49.699+00:00',
          versionId: '0914aaa0-0489-4a76-9cb9-a6b7f094d608'
        }
      }
    },
    {
      fullUrl:
        '/fhir/RelatedPerson/4065eb20-d02b-48d7-a783-5d7e452c7a7d/_history/020d755a-56f7-4de4-b04b-d9f3aac9d75e' as URLReference,
      resource: {
        resourceType: 'RelatedPerson',
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'GROOM'
            }
          ]
        },
        patient: {
          reference:
            'Patient/1a5ad72e-9241-4358-a937-861cfdf44f4d' as ResourceIdentifier
        },
        id: '4065eb20-d02b-48d7-a783-5d7e452c7a7d' as UUID,
        meta: {
          lastUpdated: '2023-09-22T08:54:49.715+00:00',
          versionId: '020d755a-56f7-4de4-b04b-d9f3aac9d75e'
        }
      }
    },
    {
      fullUrl:
        '/fhir/RelatedPerson/d2f33008-1486-4f09-845e-ceae40c05b48/_history/22b3b1bf-5140-4186-9ff1-f1e1da7c4509' as URLReference,
      resource: {
        resourceType: 'RelatedPerson',
        id: 'd2f33008-1486-4f09-845e-ceae40c05b48' as UUID,
        patient: {
          reference:
            'Patient/4512feb1-a96d-40b4-bfdc-7f437993bfa8' as ResourceIdentifier
        },
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'HEAD_OF_GROOM_FAMILY'
            }
          ]
        },
        meta: {
          lastUpdated: '2023-09-22T08:54:49.736+00:00',
          versionId: '22b3b1bf-5140-4186-9ff1-f1e1da7c4509'
        }
      }
    },
    {
      fullUrl:
        '/fhir/RelatedPerson/ef774525-966c-4136-b0b8-753ca0eccfb7/_history/b0ef1364-8763-4b9b-9de9-eed75b2ef4e0' as URLReference,
      resource: {
        resourceType: 'RelatedPerson',
        id: 'ef774525-966c-4136-b0b8-753ca0eccfb7' as UUID,
        patient: {
          reference:
            'Patient/93de5304-f816-493e-968a-86c3a3d5ee7a' as ResourceIdentifier
        },
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'HEAD_OF_BRIDE_FAMILY'
            }
          ]
        },
        meta: {
          lastUpdated: '2023-09-22T08:54:49.754+00:00',
          versionId: 'b0ef1364-8763-4b9b-9de9-eed75b2ef4e0'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/1a5ad72e-9241-4358-a937-861cfdf44f4d/_history/97bff9b3-4e8f-4833-a0e5-edc7abb1f1ce' as URLReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        id: '1a5ad72e-9241-4358-a937-861cfdf44f4d' as UUID,
        identifier: [
          {
            value: '8675646566',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'NATIONAL_ID'
                }
              ]
            }
          },
          {
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'MARRIAGE_REGISTRATION_NUMBER'
                }
              ]
            },
            value: '2023MTNJUSI'
          }
        ],
        name: [
          {
            use: 'en',
            given: ['george'],
            family: ['test']
          }
        ],
        birthDate: '1999-11-13',
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/date-of-marriage',
            valueDateTime: '2021-02-24'
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
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: [
              '',
              '',
              '',
              '',
              '',
              'URBAN',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              ''
            ],
            district: 'e66643ac-9ea9-4314-b842-f4fb3ad9e83a',
            state: '1cfe40fa-7b43-4c1e-aa05-4281e5122d9b',
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
          lastUpdated: '2023-09-22T08:54:49.914+00:00',
          versionId: '97bff9b3-4e8f-4833-a0e5-edc7abb1f1ce'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/5b979fe9-eaa3-4c4e-87ab-ee48ea1abb16/_history/4446ab01-3a79-44e4-97bc-880b4d79963d' as URLReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        id: '5b979fe9-eaa3-4c4e-87ab-ee48ea1abb16' as UUID,
        identifier: [
          {
            value: '2323444434',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'NATIONAL_ID'
                }
              ]
            }
          },
          {
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'MARRIAGE_REGISTRATION_NUMBER'
                }
              ]
            },
            value: '2023MTNJUSI'
          }
        ],
        name: [
          {
            use: 'en',
            given: ['genie'],
            family: ['test']
          }
        ],
        birthDate: '2001-02-22',
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/date-of-marriage',
            valueDateTime: '2021-02-24'
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
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: [
              '',
              '',
              '',
              '',
              '',
              'URBAN',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              ''
            ],
            district: 'e66643ac-9ea9-4314-b842-f4fb3ad9e83a',
            state: '1cfe40fa-7b43-4c1e-aa05-4281e5122d9b',
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
          lastUpdated: '2023-09-22T08:54:49.922+00:00',
          versionId: '4446ab01-3a79-44e4-97bc-880b4d79963d'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Task/6cc01269-6b36-4aa5-9bb0-21944d685e42/_history/55bf4dc2-a905-4092-98d5-37834ee5ce57' as URLReference,
      resource: {
        resourceType: 'Task',
        status: 'ready',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'MARRIAGE'
            }
          ]
        },
        focus: {
          reference: 'Composition/b2e4d436-d7fb-4b0f-9674-628b5af8f42e'
        },
        id: '6cc01269-6b36-4aa5-9bb0-21944d685e42' as UUID,
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: 'b2e4d436-d7fb-4b0f-9674-628b5af8f42e'
          },
          {
            system: 'http://opencrvs.org/specs/id/marriage-tracking-id',
            value: 'MTNJUSI' as TrackingID
          },
          {
            system: 'http://opencrvs.org/specs/id/marriage-registration-number',
            value: '2023MTNJUSI' as RegistrationNumber
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/groom-signature',
            valueString: '/ocrvs/8d8e954f-cc9e-4217-bb95-1528ca1153a4.png'
          },
          {
            url: 'http://opencrvs.org/specs/extension/bride-signature',
            valueString: '/ocrvs/a7614bee-73f9-40ab-8236-77b49c9b3d2b.png'
          },
          {
            url: 'http://opencrvs.org/specs/extension/witness-one-signature',
            valueString: '/ocrvs/e5f56d67-b123-49ec-beef-711d45583adb.png'
          },
          {
            url: 'http://opencrvs.org/specs/extension/witness-two-signature',
            valueString: '/ocrvs/1fae5d32-4015-42ce-bf54-15e1ba67b49b.png'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'GROOM'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'aaa@gmail.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 62588
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
              reference: 'Practitioner/48455871-1636-46a1-8279-aaa76dec03d4'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regAssigned'
          }
        ],
        lastModified: '2023-09-22T08:54:57.632Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2023-09-22T08:54:57.825+00:00',
          versionId: '55bf4dc2-a905-4092-98d5-37834ee5ce57'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/4512feb1-a96d-40b4-bfdc-7f437993bfa8/_history/8feb1472-5547-45da-8227-6df716a210e6' as URLReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        id: '4512feb1-a96d-40b4-bfdc-7f437993bfa8' as UUID,
        name: [
          {
            use: 'en',
            given: ['wit'],
            family: ['one']
          }
        ],
        meta: {
          lastUpdated: '2023-09-22T08:54:49.742+00:00',
          versionId: '8feb1472-5547-45da-8227-6df716a210e6'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/93de5304-f816-493e-968a-86c3a3d5ee7a/_history/9563955b-2b6d-4099-9a2e-f2e62939c3cd' as URLReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        id: '93de5304-f816-493e-968a-86c3a3d5ee7a' as UUID,
        name: [
          {
            use: 'en',
            given: ['wit'],
            family: ['two']
          }
        ],
        meta: {
          lastUpdated: '2023-09-22T08:54:49.759+00:00',
          versionId: '9563955b-2b6d-4099-9a2e-f2e62939c3cd'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/c01c802f-e5fe-46d8-b35c-deffe87a6fd9/_history/464b6c78-e306-4987-9f97-465a1d66282d' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/669cb7d8-5963-4b49-b647-7463d9e135b5'
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
              code: 'partnership',
              display: 'Types of marriage partnerships'
            }
          ]
        },
        id: 'c01c802f-e5fe-46d8-b35c-deffe87a6fd9' as UUID,
        valueQuantity: {
          value: 'MONOGAMY'
        },
        meta: {
          lastUpdated: '2023-09-22T08:54:49.704+00:00',
          versionId: '464b6c78-e306-4987-9f97-465a1d66282d'
        }
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
        '/fhir/Location/461a4ba8-5592-4b1a-a30b-747150a01623/_history/37be7f2e-03aa-429b-9e4a-2d4fb699f3dd' as URLReference,
      resource: {
        resourceType: 'Location',
        mode: 'instance',
        address: {
          line: [
            '',
            '',
            '',
            '',
            '',
            'URBAN',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
          ],
          city: '',
          district: 'bbee20e1-68c4-4e0c-a0cd-44336341e005',
          state: '1cfe40fa-7b43-4c1e-aa05-4281e5122d9b',
          postalCode: '',
          country: 'FAR',
          extension: [
            {
              url: 'http://opencrvs.org/specs/extension/part-of',
              valueReference: {
                reference: 'Location/bbee20e1-68c4-4e0c-a0cd-44336341e005'
              }
            }
          ]
        },
        meta: {
          lastUpdated: '2023-09-22T08:54:49.685+00:00',
          versionId: '37be7f2e-03aa-429b-9e4a-2d4fb699f3dd'
        },

        id: '461a4ba8-5592-4b1a-a30b-747150a01623' as UUID
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
