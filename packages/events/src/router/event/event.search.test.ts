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

import { createTestClient, setupTestCase } from '@events/tests/utils'
import { AddressType } from '@opencrvs/commons'

test('Returns empty list when no events match search criteria', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const initialData = {
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
    'applicant.dob': '2000-01-01',
    'recommender.none': true,
    'applicant.address': {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
      district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
      urbanOrRural: 'RURAL' as const,
      village: 'Small village'
    }
  }

  const event = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id, {
      declaration: initialData
    })
  )
  const searchCriteria = {
    'applicant.firstname': 'Johnson',
    type: 'TENNIS_CLUB_MEMBERSHIP'
  }

  const fetchedEvents = await client.event.search(searchCriteria)

  expect(fetchedEvents).toEqual([])
})

test('Returns events that match the text field criteria of applicant', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const record1 = {
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
    'applicant.dob': '2000-01-01',
    'recommender.none': true,
    'applicant.address': {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
      district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
      urbanOrRural: 'RURAL' as const,
      village: 'Small village'
    }
  }

  const record2 = {
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
    'applicant.dob': '2000-01-01',
    'recommender.none': true,
    'applicant.address': {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
      district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
      urbanOrRural: 'RURAL' as const,
      village: 'Small village'
    }
  }

  const record3 = {
    'applicant.firstname': 'Johnson', // different first name than previous records
    'applicant.surname': 'Doe',
    'applicant.dob': '2000-01-01',
    'recommender.none': true,
    'applicant.address': {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
      district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
      urbanOrRural: 'RURAL' as const,
      village: 'Small village'
    }
  }

  const event1 = await client.event.create(generator.event.create())
  const event2 = await client.event.create(generator.event.create())
  const event3 = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event1.id, {
      declaration: record1
    })
  )
  await client.event.actions.declare.request(
    generator.event.actions.declare(event2.id, {
      declaration: record2
    })
  )
  await client.event.actions.declare.request(
    generator.event.actions.declare(event3.id, {
      declaration: record3
    })
  )
  const searchCriteria = {
    'applicant.firstname': 'John',
    'applicant.dob': '2000-01-01',

    type: 'TENNIS_CLUB_MEMBERSHIP'
  }

  const fetchedEvents = await client.event.search(searchCriteria)

  expect(fetchedEvents).toHaveLength(2)
})

test('Returns events that match date of birth of applicant', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const record1 = {
    'applicant.firstname': 'Johnson',
    'applicant.surname': 'Doe',
    'applicant.dob': '2000-01-01',
    'recommender.none': true,
    'applicant.address': {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
      district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
      urbanOrRural: 'RURAL' as const,
      village: 'Small village'
    }
  }

  const record2 = {
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
    'applicant.dob': '2000-01-12', // different dob
    'recommender.none': true,
    'applicant.address': {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
      district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
      urbanOrRural: 'RURAL' as const,
      village: 'Small village'
    }
  }

  const event1 = await client.event.create(generator.event.create())
  const event2 = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event1.id, {
      declaration: record1
    })
  )
  await client.event.actions.declare.request(
    generator.event.actions.declare(event2.id, {
      declaration: record2
    })
  )

  const searchCriteria = {
    'applicant.dob': '2000-01-01',
    type: 'TENNIS_CLUB_MEMBERSHIP'
  }

  const fetchedEvents = await client.event.search(searchCriteria)
  expect(fetchedEvents[0].declaration['applicant.firstname']).toBe('Johnson') // fetches first document as result
  expect(fetchedEvents).toHaveLength(1)
})

test('Does not return events when searching with a similar but different date of birth', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const record1 = {
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
    'applicant.dob': '2024-11-11',
    'recommender.none': true,
    'applicant.address': {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
      district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
      urbanOrRural: 'RURAL' as const,
      village: 'Small village'
    }
  }

  const record2 = {
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
    'applicant.dob': '2024-12-12',
    'recommender.none': true,
    'applicant.address': {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
      district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
      urbanOrRural: 'RURAL' as const,
      village: 'Small village'
    }
  }

  const event1 = await client.event.create(generator.event.create())
  const event2 = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event1.id, {
      declaration: record1
    })
  )
  await client.event.actions.declare.request(
    generator.event.actions.declare(event2.id, {
      declaration: record2
    })
  )

  const searchCriteria = {
    'applicant.dob': '1999-11-11', // search with same day and month
    type: 'TENNIS_CLUB_MEMBERSHIP'
  }

  const fetchedEvents = await client.event.search(searchCriteria)
  expect(fetchedEvents).toHaveLength(0)
})
