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

import { createIntl } from 'react-intl'
import {
  ActionDocument,
  AddressType,
  eventQueryDataGenerator,
  tennisClubMembershipEvent,
  UUID
} from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import {
  tennisClubMembershipEventDocument,
  tennisClubMembershipEventIndex
} from '../../fixtures'

import { stringifyEventMetadata, compileSvg } from './pdfUtils'

const adminLevels = [
  {
    id: 'province',
    label: {
      id: 'v2.field.address.province.label',
      defaultMessage: 'Province',
      description: 'Label for province in address'
    }
  },
  {
    id: 'district',
    label: {
      id: 'v2.field.address.district.label',
      defaultMessage: 'District',
      description: 'Label for district in address'
    }
  }
]

describe('stringifyEventMetadata — versioned offices (per-fact anchors)', () => {
  // One office, renamed on 2008-06-01.
  const OFFICE_ID = '11111111-1111-4111-8111-111111111111' as UUID
  const RENAME_VERSION_ID = '22222222-2222-4222-8222-222222222222' as UUID

  const versionedLocations = new Map([
    [
      OFFICE_ID,
      {
        id: OFFICE_ID,
        administrativeAreaId: null,
        locationType: 'CRVS_OFFICE',
        versions: [
          {
            versionId: OFFICE_ID,
            effectiveFrom: '0001-01-01',
            name: 'Alaminos Registry',
            externalId: null,
            status: 'active' as const
          },
          {
            versionId: RENAME_VERSION_ID,
            effectiveFrom: '2008-06-01',
            name: 'Alaminos City Registry Office',
            externalId: null,
            status: 'active' as const
          }
        ]
      }
    ]
  ])

  function stringifyWithOffice(recordCreatedAt: string, registeredAt: string) {
    const generator = testDataGenerator()
    const { declaration, ...metadata } = eventQueryDataGenerator({
      createdBy: generator.user.id.localRegistrar,
      createdByUserType: 'user',
      createdAt: recordCreatedAt,
      createdAtLocation: OFFICE_ID,
      updatedAtLocation: OFFICE_ID,
      updatedAt: recordCreatedAt,
      updatedBy: generator.user.id.localRegistrar,
      legalStatuses: {
        REGISTERED: {
          createdAt: registeredAt,
          acceptedAt: registeredAt,
          createdBy: generator.user.id.localRegistrar,
          createdByRole: 'LOCAL_REGISTRAR',
          createdAtLocation: OFFICE_ID,
          registrationNumber: '2010000001'
        }
      }
    })

    return stringifyEventMetadata({
      metadata: {
        ...metadata,
        modifiedAt: recordCreatedAt,
        copiesPrintedForTemplate: 1
      },
      locations: versionedLocations,
      administrativeAreas: new Map(),
      users: [generator.user.localRegistrar().v2],
      intl: createIntl({ locale: 'en' }),
      adminLevels
    })
  }

  it('renders the registered-at office under its name as of the registration date', () => {
    // Registered in 2010, after the 2008 rename → the new name.
    const stringified = stringifyWithOffice(
      new Date('2004-01-01').toISOString(),
      new Date('2010-03-01').toISOString()
    )
    expect(
      stringified.legalStatuses.REGISTERED?.createdAtLocation
    ).toMatchObject({ name: 'Alaminos City Registry Office' })
  })

  it('resolves the same office to different names per fact — record creation vs registration', () => {
    // The record was created in 2004 (before the rename) and registered in 2010
    // (after it). The same office therefore carries its old name where the
    // record-creation fact is rendered and its new name at registration.
    const stringified = stringifyWithOffice(
      new Date('2004-01-01').toISOString(),
      new Date('2010-03-01').toISOString()
    )
    expect(stringified.createdAtLocation).toMatchObject({
      name: 'Alaminos Registry'
    })
    expect(
      stringified.legalStatuses.REGISTERED?.createdAtLocation
    ).toMatchObject({ name: 'Alaminos City Registry Office' })
  })
})

describe('compileSvg — versioned place of event', () => {
  // A province renamed on 2005-03-28: Alaminos → Alaminos City.
  const PROVINCE_ID = '33333333-3333-4333-8333-333333333333' as UUID
  const RENAME_VERSION_ID = '44444444-4444-4444-8444-444444444444' as UUID

  const versionedAreas = new Map([
    [
      PROVINCE_ID,
      {
        id: PROVINCE_ID,
        parentId: null,
        versions: [
          {
            versionId: PROVINCE_ID,
            effectiveFrom: '0001-01-01',
            name: 'Alaminos',
            externalId: null,
            status: 'active' as const
          },
          {
            versionId: RENAME_VERSION_ID,
            effectiveFrom: '2005-03-28',
            name: 'Alaminos City',
            externalId: null,
            status: 'active' as const
          }
        ]
      }
    ]
  ])

  function renderPlaceOfEventAt(dateOfEvent: string) {
    const generator = testDataGenerator(2323)
    const registrar = generator.user.localRegistrar()
    const { declaration: _decl, ...metadata } = tennisClubMembershipEventIndex

    return compileSvg({
      templateString:
        '<svg><text>{{$lookup $declaration "applicant.address.province"}}</text></svg>',
      $metadata: {
        ...metadata,
        dateOfEvent,
        createdBy: registrar.v2.id,
        modifiedAt: new Date().toISOString(),
        copiesPrintedForTemplate: 1
      },
      $actions: tennisClubMembershipEventDocument.actions as ActionDocument[],
      $declaration: {
        'applicant.address': {
          addressType: AddressType.DOMESTIC,
          administrativeArea: PROVINCE_ID,
          country: 'FAR'
        }
      },
      review: false,
      locations: new Map(),
      administrativeAreas: versionedAreas,
      users: [registrar.v2],
      language: { lang: 'en', messages: {} },
      config: tennisClubMembershipEvent,
      adminLevels
    })
  }

  it('renders the name valid at the event date, not today, for a pre-rename event', () => {
    // A 1995 event under a province not renamed until 2005 → the old name.
    expect(renderPlaceOfEventAt('1995-05-20')).toBe(
      '<svg><text>Alaminos</text></svg>'
    )
  })

  it('renders the later name when the event date is after the rename', () => {
    expect(renderPlaceOfEventAt('2021-01-01')).toBe(
      '<svg><text>Alaminos City</text></svg>'
    )
  })
})
