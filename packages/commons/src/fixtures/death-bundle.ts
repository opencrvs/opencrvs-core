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
  DocumentReference,
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

export const DEATH_BUNDLE: SavedBundle<
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
    | DocumentReference
  >
> = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        '/fhir/Composition/a959c616-934a-4139-a123-37bb4a1be39e/_history/913175fd-b4d6-4636-b8be-2216106d403c' as URLReference,
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'c61c6817-3f9d-4c47-9b52-e99b536bfda3'
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
                reference:
                  'Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593' as ResourceIdentifier
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
                  'RelatedPerson/7106d752-1e34-47fe-8726-a9fd11042a4d' as ResourceIdentifier
              }
            ]
          },
          {
            title: 'Supporting Documents',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'supporting-documents'
                }
              ],
              text: 'Supporting Documents'
            },
            entry: [
              {
                reference:
                  'DocumentReference/b494d60d-676f-437e-95aa-6ebb7792b58c' as ResourceIdentifier
              },
              {
                reference:
                  'DocumentReference/13a8cc00-189e-4882-9e23-29bc6d7fa735' as ResourceIdentifier
              }
            ]
          },
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
                reference:
                  'Patient/d55283fe-b5bc-497d-86f3-5370957b0642' as ResourceIdentifier
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
                  'Patient/977cee5f-ebbf-4744-a184-ccba8d919d1c' as ResourceIdentifier
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
                  'Patient/d89b25da-edd5-4941-b2dd-84e93868c1a7' as ResourceIdentifier
              }
            ]
          }
        ],
        subject: {},
        date: '2023-08-16T06:55:19.000Z',
        author: [],
        id: 'a959c616-934a-4139-a123-37bb4a1be39e' as UUID,
        extension: [
          {
            url: 'http://opencrvs.org/specs/duplicate',
            valueBoolean: true
          }
        ],
        meta: {
          lastUpdated: '2023-09-13T12:39:48.057+00:00',
          versionId: '913175fd-b4d6-4636-b8be-2216106d403c'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593/_history/02a4ebde-26ec-4192-8cfc-d032f47b8ec8' as URLReference,
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        id: 'e668f0dc-aacd-45be-bd5f-2a81c3161593' as UUID,
        location: [
          {
            location: {
              reference:
                'Location/4ba43b39-547b-41a8-8af1-c515786f36e5' as ResourceIdentifier
            }
          }
        ],
        meta: {
          lastUpdated: '2023-09-13T12:39:48.062+00:00',
          versionId: '02a4ebde-26ec-4192-8cfc-d032f47b8ec8'
        }
      }
    },
    {
      fullUrl:
        '/fhir/RelatedPerson/7106d752-1e34-47fe-8726-a9fd11042a4d/_history/50cef67d-a167-436b-af68-384393949b9f' as URLReference,
      resource: {
        resourceType: 'RelatedPerson',
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'SPOUSE'
            }
          ]
        },
        id: '7106d752-1e34-47fe-8726-a9fd11042a4d' as UUID,
        patient: {
          reference:
            'Patient/9fbbb561-dd3c-4b9f-8765-829a4c75493e' as ResourceIdentifier
        },
        meta: {
          lastUpdated: '2023-09-13T12:39:48.106+00:00',
          versionId: '50cef67d-a167-436b-af68-384393949b9f'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/977cee5f-ebbf-4744-a184-ccba8d919d1c/_history/e5401779-ca79-49e5-9011-91115560f4c1' as URLReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        id: '977cee5f-ebbf-4744-a184-ccba8d919d1c' as UUID,
        name: [
          {
            use: 'en',
            given: [''],
            family: ['Pacocha']
          }
        ],

        meta: {
          lastUpdated: '2023-09-13T12:39:48.125+00:00',
          versionId: 'e5401779-ca79-49e5-9011-91115560f4c1'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/d55283fe-b5bc-497d-86f3-5370957b0642/_history/dcd40b11-003a-4ea5-8f14-11052f549e3d' as URLReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        id: 'd55283fe-b5bc-497d-86f3-5370957b0642' as UUID,
        identifier: [
          {
            value: '8360781537',
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
            value: '565195261',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'SOCIAL_SECURITY_NO'
                }
              ]
            }
          },
          {
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'DEATH_REGISTRATION_NUMBER'
                }
              ]
            },
            value: '2023DL1W8FV'
          }
        ],
        name: [
          {
            use: 'en',
            given: ['Zack'],
            family: ['Pacocha']
          }
        ],
        gender: 'female',
        birthDate: '1948-07-24',
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/age',
            valueString: 75
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
            type: 'PRIMARY_ADDRESS',
            line: ['44444 Predovic Mount', '87740', 'URBAN', '', '', 'URBAN'],
            city: 'Rudyboro',
            district: 'e66643ac-9ea9-4314-b842-f4fb3ad9e83a',
            state: '1cfe40fa-7b43-4c1e-aa05-4281e5122d9b',
            postalCode: '09840-0103',
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
        deceasedDateTime: '2023-07-24',
        meta: {
          lastUpdated: '2023-09-13T12:39:48.320+00:00',
          versionId: 'dcd40b11-003a-4ea5-8f14-11052f549e3d'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/d89b25da-edd5-4941-b2dd-84e93868c1a7/_history/6e50611f-ccf5-4560-a67c-b0e9f1f58363' as URLReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        id: 'd89b25da-edd5-4941-b2dd-84e93868c1a7' as UUID,
        name: [
          {
            use: 'en',
            given: [''],
            family: ['Pacocha']
          }
        ],

        meta: {
          lastUpdated: '2023-09-13T12:39:48.132+00:00',
          versionId: '6e50611f-ccf5-4560-a67c-b0e9f1f58363'
        }
      }
    },
    {
      fullUrl:
        '/fhir/DocumentReference/13a8cc00-189e-4882-9e23-29bc6d7fa735/_history/e1f017d5-f4e4-4aef-bff9-d27c118c1b82' as URLReference,
      resource: {
        resourceType: 'DocumentReference',
        masterIdentifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'f0d0ff44-1dc5-435e-a8cf-7a11fb8fc663'
        },
        status: 'current',
        content: [
          {
            attachment: {
              contentType: 'image/png',
              data: '/ocrvs/02b19c1f-a9d7-4135-afe4-e80ea9d5100e.png'
            }
          }
        ],
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/supporting-doc-type',
              code: 'NATIONAL_ID'
            }
          ]
        },
        subject: {
          display: 'DECEASED_ID_PROOF'
        },

        meta: {
          lastUpdated: '2023-09-13T12:39:48.053+00:00',
          versionId: 'e1f017d5-f4e4-4aef-bff9-d27c118c1b82'
        },
        id: '13a8cc00-189e-4882-9e23-29bc6d7fa735' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/DocumentReference/b494d60d-676f-437e-95aa-6ebb7792b58c/_history/f38dcdd1-5329-4922-a959-0c5405933eca' as URLReference,
      resource: {
        resourceType: 'DocumentReference',
        masterIdentifier: {
          system: 'urn:ietf:rfc:3986',
          value: '5e642507-570d-4ba2-99e9-20e962376152'
        },
        status: 'current',
        content: [
          {
            attachment: {
              contentType: 'image/png',
              data: '/ocrvs/d40e904b-53ff-4639-bdcf-a2ba8fb236f5.png'
            }
          }
        ],
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/supporting-doc-type',
              code: 'OTHER'
            }
          ]
        },
        subject: {
          display: 'INFORMANT_ID_PROOF'
        },

        meta: {
          lastUpdated: '2023-09-13T12:39:48.051+00:00',
          versionId: 'f38dcdd1-5329-4922-a959-0c5405933eca'
        },
        id: 'b494d60d-676f-437e-95aa-6ebb7792b58c' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Task/b1a6925a-47ae-431e-8f61-4cd0929e8518/_history/c047e6ad-d615-4d51-986f-92f2c80e59a9' as URLReference,
      resource: {
        resourceType: 'Task',
        status: 'ready',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'DEATH'
            }
          ]
        },
        focus: {
          reference:
            'Composition/a959c616-934a-4139-a123-37bb4a1be39e' as ResourceIdentifier
        },
        id: 'b1a6925a-47ae-431e-8f61-4cd0929e8518' as UUID,
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/death-tracking-id',
            value: 'DL1W8FV' as TrackingID
          },
          {
            system: 'http://opencrvs.org/specs/id/death-registration-number',
            value: '2023DL1W8FV' as RegistrationNumber
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'SPOUSE'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+260734085893'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'Frank24@gmail.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 986665
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
              reference: 'Practitioner/525094f5-3c5f-4e72-af3b-adda8617839f'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regViewed'
          }
        ],
        lastModified: '2023-09-22T11:52:48.439Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2023-09-22T11:52:48.611+00:00',
          versionId: 'c047e6ad-d615-4d51-986f-92f2c80e59a9'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/9fbbb561-dd3c-4b9f-8765-829a4c75493e/_history/02480691-fba2-4a6d-8b04-4b28deeae3ca' as URLReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        id: '9fbbb561-dd3c-4b9f-8765-829a4c75493e' as UUID,
        identifier: [
          {
            value: '2464716794',
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
            given: ['Frank'],
            family: ['Pacocha']
          }
        ],
        birthDate: '2003-08-16',
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/patient-occupation',
            valueString: 'consultant'
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
            line: ['817 Avis Point', '06074', 'URBAN', '', '', 'URBAN'],
            city: 'New Julio',
            district: 'e66643ac-9ea9-4314-b842-f4fb3ad9e83a',
            state: '1cfe40fa-7b43-4c1e-aa05-4281e5122d9b',
            postalCode: '24575',
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
          lastUpdated: '2023-09-13T12:39:48.119+00:00',
          versionId: '02480691-fba2-4a6d-8b04-4b28deeae3ca'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/3d196967-7c4a-4807-ad42-13b4b2ca43a3/_history/de3aaad3-002c-4d26-a393-e0843d9d43f9' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593'
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
        id: '3d196967-7c4a-4807-ad42-13b4b2ca43a3' as UUID,
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/manner-of-death',
              code: 'NATURAL_CAUSES'
            }
          ]
        },
        meta: {
          lastUpdated: '2023-09-13T12:39:48.066+00:00',
          versionId: 'de3aaad3-002c-4d26-a393-e0843d9d43f9'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/d5c9d991-69c1-4269-baec-77b5667f2eea/_history/ef12ac6e-ab73-457a-8221-ae5e9fedb386' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593'
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
              code: 'lay-reported-or-verbal-autopsy-description',
              display: 'Lay reported or verbal autopsy description'
            }
          ]
        },
        id: 'd5c9d991-69c1-4269-baec-77b5667f2eea' as UUID,
        meta: {
          lastUpdated: '2023-09-13T12:39:48.071+00:00',
          versionId: 'ef12ac6e-ab73-457a-8221-ae5e9fedb386'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/ff9a538b-c551-4edc-9631-fa2169a37f20/_history/b6b4f8e4-6363-4392-a0f0-38b70fa378d1' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593'
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
              code: 'cause-of-death-method',
              display: 'Cause of death method'
            }
          ]
        },
        id: 'ff9a538b-c551-4edc-9631-fa2169a37f20' as UUID,
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/cause-of-death-method',
              code: 'PHYSICIAN'
            }
          ]
        },
        meta: {
          lastUpdated: '2023-09-13T12:39:48.079+00:00',
          versionId: 'b6b4f8e4-6363-4392-a0f0-38b70fa378d1'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/fb98ff5b-3aa1-40c2-87bf-4bd6df091dd2/_history/9362f1f8-2e9f-49ee-a65e-7851b246b28f' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593'
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
              code: 'cause-of-death-established',
              display: 'Cause of death established'
            }
          ]
        },
        id: 'fb98ff5b-3aa1-40c2-87bf-4bd6df091dd2' as UUID,
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/cause-of-death-established',
              code: 'true'
            }
          ]
        },
        meta: {
          lastUpdated: '2023-09-13T12:39:48.085+00:00',
          versionId: '9362f1f8-2e9f-49ee-a65e-7851b246b28f'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/3cae74a3-042c-4faf-9dde-8b716d094033/_history/2d331243-3674-4edc-99c3-c74764d726b2' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593'
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
              code: 'ICD10',
              display: 'Cause of death'
            }
          ]
        },
        id: '3cae74a3-042c-4faf-9dde-8b716d094033' as UUID,
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/cause-of-death',
              code: 'Natural cause'
            }
          ]
        },
        meta: {
          lastUpdated: '2023-09-13T12:39:48.090+00:00',
          versionId: '2d331243-3674-4edc-99c3-c74764d726b2'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/5965002b-52a6-40b4-b95e-5e84b48e3042/_history/98c0a9b1-bba4-47e8-a977-ed8ab288bf8b' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593'
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
              code: 'num-male-dependents-on-deceased',
              display: 'Number of male dependents on Deceased'
            }
          ]
        },
        id: '5965002b-52a6-40b4-b95e-5e84b48e3042' as UUID,
        valueString: 3,
        meta: {
          lastUpdated: '2023-09-13T12:39:48.094+00:00',
          versionId: '98c0a9b1-bba4-47e8-a977-ed8ab288bf8b'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/fbaa8c21-2b9f-48c7-bb09-b15911685b31/_history/55c1d789-3a56-4075-b8d5-4c81eb7bab3b' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593'
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
              code: 'num-female-dependents-on-deceased',
              display: 'Number of female dependents on Deceased'
            }
          ]
        },
        id: 'fbaa8c21-2b9f-48c7-bb09-b15911685b31' as UUID,
        valueString: 4,
        meta: {
          lastUpdated: '2023-09-13T12:39:48.098+00:00',
          versionId: '55c1d789-3a56-4075-b8d5-4c81eb7bab3b'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Practitioner/525094f5-3c5f-4e72-af3b-adda8617839f/_history/079ca353-4f47-426d-ae60-feb517e66e71' as URLReference,
      resource: {
        resourceType: 'Practitioner',
        identifier: [],
        telecom: [
          {
            system: 'phone',
            value: '0922222222'
          },
          {
            system: 'email',
            value: ''
          }
        ],
        name: [
          {
            use: 'en',
            family: 'Katongo',
            given: ['Felix']
          }
        ],
        meta: {
          lastUpdated: '2023-09-13T12:36:12.149+00:00',
          versionId: '079ca353-4f47-426d-ae60-feb517e66e71'
        },
        id: '525094f5-3c5f-4e72-af3b-adda8617839f' as UUID
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
        '/fhir/Location/4ba43b39-547b-41a8-8af1-c515786f36e5/_history/c0bb92c4-1dc9-4d78-aaac-8ea8cd8965cc' as URLReference,
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_xUFGW5vo7No'
          }
        ],
        name: 'Golden Valley Rural Health Centre',
        alias: ['Golden Valley Rural Health Centre'],
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
          lastUpdated: '2023-09-13T12:36:07.562+00:00',
          versionId: 'c0bb92c4-1dc9-4d78-aaac-8ea8cd8965cc'
        },
        id: '4ba43b39-547b-41a8-8af1-c515786f36e5' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/PractitionerRole/42ed0f8d-38b0-448d-992f-a85283e32bcf/_history/6e28e902-c96e-4139-9b59-ce1fdcd757f1' as URLReference,
      resource: {
        resourceType: 'PractitionerRole',
        practitioner: {
          reference: 'Practitioner/525094f5-3c5f-4e72-af3b-adda8617839f'
        },
        code: [
          {
            coding: [
              {
                system: 'http://opencrvs.org/specs/roles',
                code: 'REGISTRATION_AGENT'
              }
            ]
          },
          {
            coding: [
              {
                system: 'http://opencrvs.org/specs/types',
                code: '[{"lang":"en","label":"Registration Agent"},{"lang":"fr","label":"Agent d\'enregistrement"}]'
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
        meta: {
          lastUpdated: '2023-09-13T12:36:13.834+00:00',
          versionId: '6e28e902-c96e-4139-9b59-ce1fdcd757f1'
        },
        id: '42ed0f8d-38b0-448d-992f-a85283e32bcf' as UUID
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
