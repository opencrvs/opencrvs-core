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
import { http, HttpResponse } from 'msw'
import { LocationType, SCOPES } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { env } from '../../environment'
import { mswServer } from '../../tests/msw'

test('prevents access when required scope is missing', async () => {
  const { user } = await setupTestCase()

  const registrarClient = createTestClient(user)

  await expect(
    registrarClient.administrativeHierarchy.sync()
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Allows syncing administrative hierarchy with USER_DATA_SEEDING scope', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  mswServer.use(
    http.get(`${env.CONFIG_URL}/locations`, ({ request }) => {
      if (request.url.includes('type=ADMIN_STRUCTURE')) {
        return HttpResponse.json({
          resourceType: 'Bundle',
          id: '109636d2-09f0-4444-b42c-e22edce0539e',
          meta: { lastUpdated: '2025-01-17T05:18:12.105+00:00' },
          type: 'searchset',
          total: 17,
          link: [
            {
              relation: 'self',
              url: 'http://config:2021/location?type=ADMIN_STRUCTURE&_count=0'
            },
            {
              relation: 'next',
              url: 'http://config:2021/location?type=ADMIN_STRUCTURE&_count=0&_getpagesoffset=0'
            }
          ],
          entry: [
            {
              fullUrl:
                'http://localhost:2021/location/62a0ccb4-880d-4f30-8882-f256007dfff9/_history/8ae119de-682a-40fa-be03-9de10fc07d53',
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
                  reference: 'Location/0'
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
                  coding: [{ code: 'jdn', display: 'Jurisdiction' }]
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
                      '[{"2007":10},{"2008":10},{"2009":10},{"2010":10},{"2011":10},{"2012":10},{"2013":10},{"2014":10},{"2015":10},{"2016":10},{"2017":10},{"2018":10},{"2019":10},{"2020":10},{"2021":10},{"2022":15},{"2023":20}]'
                  }
                ],
                meta: {
                  lastUpdated: '2025-02-05T07:52:42.267+00:00',
                  versionId: '8ae119de-682a-40fa-be03-9de10fc07d53'
                },
                id: '62a0ccb4-880d-4f30-8882-f256007dfff9'
              },
              request: {
                method: 'PUT',
                url: 'Location/62a0ccb4-880d-4f30-8882-f256007dfff9'
              }
            }
          ]
        })
      }

      if (request.url.includes(`type=${LocationType.enum.CRVS_OFFICE}`)) {
        return HttpResponse.json({
          resourceType: 'Bundle',
          id: '109636d2-09f0-4444-b42c-e22edce0539e',
          meta: { lastUpdated: '2025-01-17T05:18:12.105+00:00' },
          type: 'searchset',
          total: 17,
          link: [
            {
              relation: 'self',
              url: 'http://config:2021/location?type=ADMIN_STRUCTURE&_count=0'
            },
            {
              relation: 'next',
              url: 'http://config:2021/location?type=ADMIN_STRUCTURE&_count=0&_getpagesoffset=0'
            }
          ],
          entry: [
            {
              fullUrl:
                'http://config:2021/location/92ab695b-9362-4682-a861-ddce87a3a905/_history/f11c3af0-b945-4082-8902-c66e4f9b43da',
              resource: {
                resourceType: 'Location',
                identifier: [
                  {
                    system: 'http://opencrvs.org/specs/id/internal-id',
                    value: 'CRVS_OFFICE_2OKicPQMNI'
                  }
                ],
                name: 'HQ Office',
                alias: ['HQ Office'],
                status: 'active',
                mode: 'instance',
                partOf: {
                  reference: 'Location/62a0ccb4-880d-4f30-8882-f256007dfff9'
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
                  coding: [{ code: 'bu', display: 'Building' }]
                },
                meta: {
                  lastUpdated: '2025-01-08T09:11:38.743+00:00',
                  versionId: 'f11c3af0-b945-4082-8902-c66e4f9b43da'
                },
                id: '92ab695b-9362-4682-a861-ddce87a3a905'
              },
              request: {
                method: 'PUT',
                url: 'Location/92ab695b-9362-4682-a861-ddce87a3a905'
              }
            }
          ]
        })
      }

      if (request.url.includes(`type=${LocationType.enum.HEALTH_FACILITY}`)) {
        return HttpResponse.json({
          resourceType: 'Bundle',
          id: '109636d2-09f0-4444-b42c-e22edce0539e',
          meta: { lastUpdated: '2025-01-17T05:18:12.105+00:00' },
          type: 'searchset',
          total: 17,
          link: [
            {
              relation: 'self',
              url: 'http://config:2021/location?type=CRVS_OFFICE&_count=0'
            },
            {
              relation: 'next',
              url: 'http://config:2021/location?type=CRVS_OFFICE&_count=0&_getpagesoffset=0'
            }
          ],
          entry: [
            {
              fullUrl:
                'http://localhost:2021/location/465c448a-2c85-45f5-80f0-967e91f51de9/_history/b7990a30-5093-409e-9a61-8cba9906687f',
              resource: {
                resourceType: 'Location',
                identifier: [
                  {
                    system: 'http://opencrvs.org/specs/id/internal-id',
                    value: 'HEALTH_FACILITY_di3U5u7F8Y3'
                  }
                ],
                name: 'Ibombo Rural Health Centre',
                alias: ['Ibombo Rural Health Centre'],
                status: 'active',
                mode: 'instance',
                partOf: {
                  reference: 'Location/62a0ccb4-880d-4f30-8882-f256007dfff9'
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
                  lastUpdated: '2025-03-18T09:29:59.674+00:00',
                  versionId: 'b7990a30-5093-409e-9a61-8cba9906687f'
                },
                id: '465c448a-2c85-45f5-80f0-967e91f51de9'
              },
              request: {
                method: 'PUT',
                url: 'Location/465c448a-2c85-45f5-80f0-967e91f51de9'
              }
            }
          ]
        })
      }

      throw new Error('should not happen')
    })
  )

  await expect(
    dataSeedingClient.administrativeHierarchy.sync()
  ).resolves.toEqual(undefined)

  const administrativeAreas = await dataSeedingClient.administrativeAreas.list()
  const locations = await dataSeedingClient.locations.list()

  expect(
    administrativeAreas.find((aa) => aa.name === 'Ibombo')
  ).not.toBeUndefined()
  expect(locations.find((loc) => loc.name === 'HQ Office')).not.toBeUndefined()
  expect(
    locations.find((loc) => loc.name === 'Ibombo Rural Health Centre')
  ).not.toBeUndefined()
})
