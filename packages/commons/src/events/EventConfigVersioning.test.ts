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

import { EventConfig } from './EventConfig'
import { tennisClubMembershipEvent } from '../fixtures'
import { defineNextVersion } from './defineConfig'
import { validateEventConfigVersions } from './eventConfigValidation'
import {
  findEventConfigVersion,
  getDeclarationFieldById,
  resolveVersionForDate
} from './utils'
import { PlainDate } from './PlainDate'

const date = (value: string) => PlainDate.parse(value)

describe('EventConfig versioning', () => {
  it('defaults version/effectiveFrom so pre-versioning configs keep parsing unchanged', () => {
    const parsed = EventConfig.parse(tennisClubMembershipEvent)
    expect(parsed.version).toBe('legacy')
    expect(parsed.effectiveFrom).toBe('1970-01-01')
    expect(parsed.effectiveTo).toBeUndefined()
  })

  it('accepts an explicit version/effectiveFrom/effectiveTo/versionLabel', () => {
    const parsed = EventConfig.parse({
      ...tennisClubMembershipEvent,
      version: 'v2',
      effectiveFrom: '2027-01-01',
      effectiveTo: '2030-01-01',
      versionLabel: { defaultMessage: '2027 Legal Update', id: 'v2.label', description: 'label' }
    })
    expect(parsed.version).toBe('v2')
    expect(parsed.effectiveFrom).toBe('2027-01-01')
    expect(parsed.effectiveTo).toBe('2030-01-01')
  })

  it('rejects effectiveTo at or before effectiveFrom', () => {
    const res = EventConfig.safeParse({
      ...tennisClubMembershipEvent,
      version: 'v2',
      effectiveFrom: '2027-01-01',
      effectiveTo: '2027-01-01'
    })
    expect(res.success).toBe(false)
  })

  describe('resolveVersionForDate / findEventConfigVersion', () => {
    const v1 = EventConfig.parse({
      ...tennisClubMembershipEvent,
      version: 'v1',
      effectiveFrom: '2015-01-01'
    })
    const v2 = EventConfig.parse({
      ...tennisClubMembershipEvent,
      version: 'v2',
      effectiveFrom: '2027-01-01'
    })
    // Published after v1/v2 already exist, for digitizing pre-1996 paper records —
    // resolution must not depend on authoring order.
    const legacy = EventConfig.parse({
      ...tennisClubMembershipEvent,
      version: 'legacy-1990',
      effectiveFrom: '1990-01-01',
      effectiveTo: '1996-01-01'
    })
    const configs = [v1, v2, legacy]

    it('resolves the version whose window covers the date, regardless of authoring order', () => {
      expect(
        resolveVersionForDate(configs, tennisClubMembershipEvent.id, date('1992-06-01'))
      ).toBe(legacy)
      expect(
        resolveVersionForDate(configs, tennisClubMembershipEvent.id, date('2020-01-01'))
      ).toBe(v1)
      expect(
        resolveVersionForDate(configs, tennisClubMembershipEvent.id, date('2028-01-01'))
      ).toBe(v2)
    })

    it('throws when no version is active for the date', () => {
      expect(() =>
        resolveVersionForDate(configs, tennisClubMembershipEvent.id, date('1980-01-01'))
      ).toThrow()
    })

    it('finds a version by explicit id, for digitization flows', () => {
      expect(
        findEventConfigVersion(configs, tennisClubMembershipEvent.id, 'legacy-1990')
      ).toBe(legacy)
    })
  })

  describe('validateEventConfigVersions', () => {
    it('rejects duplicate (id, version) pairs', () => {
      const v1 = { ...tennisClubMembershipEvent, version: 'v1', effectiveFrom: date('2015-01-01') } as unknown as EventConfig
      const v1Again = { ...tennisClubMembershipEvent, version: 'v1', effectiveFrom: date('2020-01-01') } as unknown as EventConfig
      expect(() => validateEventConfigVersions([v1, v1Again])).toThrow(/Duplicate/)
    })

    it('rejects overlapping windows for the same event type', () => {
      const v1 = {
        ...tennisClubMembershipEvent,
        version: 'v1',
        effectiveFrom: date('2015-01-01'),
        effectiveTo: date('2027-06-01')
      } as unknown as EventConfig
      const v2 = {
        ...tennisClubMembershipEvent,
        version: 'v2',
        effectiveFrom: date('2027-01-01')
      } as unknown as EventConfig
      expect(() => validateEventConfigVersions([v1, v2])).toThrow(/Overlapping/)
    })

    it('accepts adjacent, non-overlapping windows', () => {
      const v1 = {
        ...tennisClubMembershipEvent,
        version: 'v1',
        effectiveFrom: date('2015-01-01'),
        effectiveTo: date('2027-01-01')
      } as unknown as EventConfig
      const v2 = {
        ...tennisClubMembershipEvent,
        version: 'v2',
        effectiveFrom: date('2027-01-01')
      } as unknown as EventConfig
      expect(() => validateEventConfigVersions([v1, v2])).not.toThrow()
    })
  })

  describe('defineNextVersion', () => {
    const v1 = EventConfig.parse({
      ...tennisClubMembershipEvent,
      version: 'v1',
      effectiveFrom: '2015-01-01'
    })

    it('authors a diffed version that is still a complete, independently valid EventConfig', () => {
      const fieldId = v1.declaration.pages[0].fields[0].id
      const originalLabel = getDeclarationFieldById(v1, fieldId).label

      const v2 = defineNextVersion(
        v1,
        { version: 'v2', effectiveFrom: '2027-01-01' },
        (draft) => {
          const field = getDeclarationFieldById(draft, fieldId)
          field.label = {
            ...field.label,
            defaultMessage: 'Renamed in v2'
          }
        }
      )

      expect(v2.version).toBe('v2')
      expect(v2.supersedes).toBe('v1')
      expect(getDeclarationFieldById(v2, fieldId).label.defaultMessage).toBe(
        'Renamed in v2'
      )
      // v1 is untouched — cloned, not mutated.
      expect(getDeclarationFieldById(v1, fieldId).label).toEqual(originalLabel)
    })
  })
})
