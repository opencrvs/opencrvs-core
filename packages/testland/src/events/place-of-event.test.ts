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

import { describe, expect, test } from 'vitest'
import {
  AddressType,
  EventConfig,
  EventState,
  FieldConfig,
  FieldReference,
  FieldValue,
  FieldType,
  flattenFieldReference,
  getDeclarationFields,
  isFieldVisible,
  resolvePlaceOfEvent,
  UUID
} from '@opencrvs/toolkit/events'
import { deathEvent } from './death'
import { birthEvent } from './birth'
import { PlaceOfDeath } from './death/forms/pages/eventDetails'
import { PlaceOfBirth } from './birth/forms/pages/child'

/** The office an embassy official is posted to. Sits directly under the country. */
const EMBASSY_OFFICE_ID = '00000000-0000-4000-8000-000000000001' as UUID
/** An administrative area in Farajaland, outside the jurisdiction of the embassy. */
const HOME_DISTRICT_ID = '00000000-0000-4000-8000-000000000002' as UUID
const HEALTH_FACILITY_ID = '00000000-0000-4000-8000-000000000003' as UUID

const FOREIGN_ADDRESS = {
  country: 'FRA',
  addressType: AddressType.INTERNATIONAL,
  streetLevelDetails: { town: 'Paris' }
}

const HOME_ADDRESS = {
  country: 'FAR',
  addressType: AddressType.DOMESTIC,
  administrativeArea: HOME_DISTRICT_ID
}

/**
 * Mirrors how the client keeps a hidden field in sync with the fields it reads
 * from: a field the form hides carries no value, and of the `value` references
 * of the ones it shows, the first non-falsy wins.
 *
 * @see resolveSyncedFieldValue in packages/client
 */
function resolveSyncedValue(field: FieldConfig, form: EventState) {
  const refs = ([] as FieldReference[]).concat(
    ('value' in field ? field.value : undefined) ?? []
  )

  for (const ref of refs) {
    const referenced = flattenFieldReference(ref).reduce<unknown>(
      (value, key) =>
        value && typeof value === 'object'
          ? (value as Record<string, unknown>)[key]
          : undefined,
      form
    )

    if (referenced) {
      return referenced as FieldValue
    }
  }

  return undefined
}

/**
 * Where the record lands, for the given form input, when an embassy official
 * declares it: the declaration the client submits, run through the same
 * resolution the events service indexes the record by.
 *
 * The hidden fields the declaration carries are resolved in the order the form
 * declares them, each from the ones resolved before it.
 */
function placeOfEventOf(eventConfig: EventConfig, form: EventState) {
  const declaration = getDeclarationFields(eventConfig)
    .filter((field) => field.type === FieldType.ALPHA_HIDDEN)
    .reduce<EventState>(
      (state, field) => ({
        ...state,
        [field.id]: isFieldVisible(field, state, {})
          ? resolveSyncedValue(field, state)
          : undefined
      }),
      form
    )

  return resolvePlaceOfEvent(
    { createdAtLocation: EMBASSY_OFFICE_ID },
    declaration,
    eventConfig
  )
}

describe('place of event of a death declaration', () => {
  test('a death abroad is placed at the office that declared it, not at the home district of the deceased', () => {
    expect(
      placeOfEventOf(deathEvent, {
        'eventDetails.placeOfDeath': PlaceOfDeath.OTHER,
        'eventDetails.deathLocationOther': FOREIGN_ADDRESS,
        'deceased.address': HOME_ADDRESS
      })
    ).toBe(EMBASSY_OFFICE_ID)
  })

  test('a death at the usual residence is placed at that residence', () => {
    expect(
      placeOfEventOf(deathEvent, {
        'eventDetails.placeOfDeath': PlaceOfDeath.DECEASED_USUAL_RESIDENCE,
        'deceased.address': HOME_ADDRESS
      })
    ).toBe(HOME_DISTRICT_ID)
  })

  test('a death at a residence abroad is placed at the office that declared it', () => {
    expect(
      placeOfEventOf(deathEvent, {
        'eventDetails.placeOfDeath': PlaceOfDeath.DECEASED_USUAL_RESIDENCE,
        'deceased.address': FOREIGN_ADDRESS
      })
    ).toBe(EMBASSY_OFFICE_ID)
  })

  test('a death elsewhere in the country is placed at that address', () => {
    expect(
      placeOfEventOf(deathEvent, {
        'eventDetails.placeOfDeath': PlaceOfDeath.OTHER,
        'eventDetails.deathLocationOther': HOME_ADDRESS,
        'deceased.address': HOME_ADDRESS
      })
    ).toBe(HOME_DISTRICT_ID)
  })

  test('a death at a health institution is placed at that institution', () => {
    expect(
      placeOfEventOf(deathEvent, {
        'eventDetails.placeOfDeath': PlaceOfDeath.HEALTH_FACILITY,
        'eventDetails.deathLocation': HEALTH_FACILITY_ID,
        'deceased.address': HOME_ADDRESS
      })
    ).toBe(HEALTH_FACILITY_ID)
  })
})

/**
 * A birth reads its place of event from the place of birth alone, each of whose
 * addresses the form shows for one answer only. The mother's address is filled
 * in every declaration and belongs to no answer, so it must not stand in for a
 * place of birth the form has no administrative area for.
 */
describe('place of event of a birth declaration', () => {
  test('a birth abroad is placed at the office that declared it, not at the address of the mother', () => {
    expect(
      placeOfEventOf(birthEvent, {
        'child.placeOfBirth': PlaceOfBirth.OTHER,
        'child.birthLocation.other': FOREIGN_ADDRESS,
        'mother.address': HOME_ADDRESS
      })
    ).toBe(EMBASSY_OFFICE_ID)
  })

  test('a birth at a residential address abroad is placed at the office that declared it', () => {
    expect(
      placeOfEventOf(birthEvent, {
        'child.placeOfBirth': PlaceOfBirth.PRIVATE_HOME,
        'child.birthLocation.privateHome': FOREIGN_ADDRESS,
        'mother.address': HOME_ADDRESS
      })
    ).toBe(EMBASSY_OFFICE_ID)
  })

  test('a birth at a residential address in the country is placed at that address', () => {
    expect(
      placeOfEventOf(birthEvent, {
        'child.placeOfBirth': PlaceOfBirth.PRIVATE_HOME,
        'child.birthLocation.privateHome': HOME_ADDRESS,
        'mother.address': HOME_ADDRESS
      })
    ).toBe(HOME_DISTRICT_ID)
  })

  test('a birth at a health institution is placed at that institution', () => {
    expect(
      placeOfEventOf(birthEvent, {
        'child.placeOfBirth': PlaceOfBirth.HEALTH_FACILITY,
        'child.birthLocation': HEALTH_FACILITY_ID,
        'mother.address': HOME_ADDRESS
      })
    ).toBe(HEALTH_FACILITY_ID)
  })
})
