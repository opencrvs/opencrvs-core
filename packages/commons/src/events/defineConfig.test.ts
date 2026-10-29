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
import { defineConfig } from './defineConfig'
import {
  DEFAULT_EVENT_CONFIG_VERSION_ID,
  EventConfigInput,
  resolveEventConfig,
  VersionedEventConfig
} from './EventConfig'
import { ActionType } from './ActionType'
import { getActionConfig, getDeclaration } from './utils'
import { tennisClubMembershipEvent } from '../fixtures'

const declaration = getDeclaration(tennisClubMembershipEvent)

const declareActionIndex = tennisClubMembershipEvent.actions.findIndex(
  (action) => action.type === ActionType.DECLARE
)

const actionsWithoutDeclaration: EventConfigInput['actions'] =
  tennisClubMembershipEvent.actions.map((action) => {
    if (action.type !== ActionType.DECLARE) {
      return action
    }
    const { declaration: _, ...rest } = action
    return rest
  })

/** The configuration of the only version of an event defined without `versions`. */
function defineResolvedConfig(config: EventConfigInput) {
  return resolveEventConfig(defineConfig(config))
}

describe('defineConfig()', () => {
  let warn: jest.SpyInstance

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    warn.mockRestore()
  })

  it('should keep a declaration given on the DECLARE action', () => {
    const config = defineResolvedConfig(tennisClubMembershipEvent)

    expect(getDeclaration(config)).toEqual(declaration)
    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining('defines `declaration` at the top level')
    )
  })

  it('should move a top-level declaration onto the DECLARE action', () => {
    const config = defineResolvedConfig({
      ...tennisClubMembershipEvent,
      actions: actionsWithoutDeclaration,
      declaration
    })

    expect(getDeclaration(config)).toEqual(declaration)
    expect(config).not.toHaveProperty('declaration')
  })

  it('should warn that a top-level declaration is deprecated', () => {
    defineConfig({
      ...tennisClubMembershipEvent,
      actions: actionsWithoutDeclaration,
      declaration
    })

    expect(warn).toHaveBeenCalledWith(
      `Event '${tennisClubMembershipEvent.id}' defines \`declaration\` at the top level, which is deprecated and will be removed in a future release. Define it on the DECLARE action instead.`
    )
  })

  it('should throw when declaration is given both at the top level and on the DECLARE action', () => {
    expect(() =>
      defineConfig({ ...tennisClubMembershipEvent, declaration })
    ).toThrow(
      `Event '${tennisClubMembershipEvent.id}' defines \`declaration\` both at the top level and on the DECLARE action (\`actions[${declareActionIndex}].declaration\`). Define it in only one of these places.`
    )
  })

  it('should throw when declaration is given nowhere', () => {
    expect(() =>
      defineConfig({
        ...tennisClubMembershipEvent,
        actions: actionsWithoutDeclaration
      })
    ).toThrow(
      `Event '${tennisClubMembershipEvent.id}' does not define \`declaration\`. Define it either at the top level or on the DECLARE action (\`actions[${declareActionIndex}].declaration\`).`
    )
  })

  it('should throw when there is more than one DECLARE action', () => {
    expect(() =>
      defineConfig({
        ...tennisClubMembershipEvent,
        actions: [
          ...tennisClubMembershipEvent.actions,
          tennisClubMembershipEvent.actions[declareActionIndex]
        ],
        declaration
      })
    ).toThrow(
      `Event must have exactly one DECLARE action. Found 2 for event ${tennisClubMembershipEvent.id}`
    )
  })

  it('should throw when the event has no DECLARE action', () => {
    expect(() =>
      defineConfig({
        ...tennisClubMembershipEvent,
        actions: actionsWithoutDeclaration.filter(
          (action) => action.type !== ActionType.DECLARE
        ),
        declaration
      })
    ).toThrow(
      `Event must have exactly one DECLARE action. Found 0 for event ${tennisClubMembershipEvent.id}`
    )
  })

  describe('NOTIFY action', () => {
    const notifyActionIndex = tennisClubMembershipEvent.actions.findIndex(
      (action) => action.type === ActionType.NOTIFY
    )

    const notifyAction = tennisClubMembershipEvent.actions[notifyActionIndex]
    if (notifyAction.type !== ActionType.NOTIFY) {
      throw new Error('Expected the NOTIFY action')
    }

    it('should keep the configured notification form and review', () => {
      const config = defineResolvedConfig(tennisClubMembershipEvent)

      expect(
        getActionConfig({
          eventConfiguration: config,
          actionType: ActionType.NOTIFY
        })
      ).toMatchObject({
        notificationForm: notifyAction.notificationForm,
        review: notifyAction.review
      })
    })

    // Guards against defineConfig filling in NOTIFY config before EventConfig parses it
    it.each(['notificationForm', 'review'] as const)(
      'should throw when NOTIFY has no %s',
      (key) => {
        const { [key]: _omitted, ...notifyActionWithoutKey } = notifyAction

        expect(() =>
          defineConfig({
            ...tennisClubMembershipEvent,
            actions: tennisClubMembershipEvent.actions.map((action, index) =>
              index === notifyActionIndex
                ? (notifyActionWithoutKey as EventConfigInput['actions'][number])
                : action
            )
          })
        ).toThrow(`"${key}"`)
      }
    )

    // Guards against defineConfig generating a NOTIFY action
    it('should accept an event without a NOTIFY action, and not add one', () => {
      const config = defineResolvedConfig({
        ...tennisClubMembershipEvent,
        actions: tennisClubMembershipEvent.actions.filter(
          (action) => action.type !== ActionType.NOTIFY
        )
      })

      expect(
        config.actions.some((action) => action.type === ActionType.NOTIFY)
      ).toBe(false)
    })
  })

  describe('versions', () => {
    const {
      id: eventId,
      label,
      advancedSearch,
      ...versionFields
    } = tennisClubMembershipEvent

    const v1 = { ...versionFields, id: 'v1' }
    const v2 = { ...versionFields, id: 'v2', effectiveFrom: '2027-03-01' }

    it('should accept two versions with distinct ids and dates', () => {
      const config = defineConfig({
        id: eventId,
        label,
        advancedSearch,
        versions: [v1, v2]
      })

      expect(config.versions.map(({ id }) => id)).toEqual(['v1', 'v2'])
      expect(config.versions[1].effectiveFrom).toBe('2027-03-01')
      expect(config).toMatchObject({ id: eventId, label, advancedSearch })
    })

    it('should take an event without versions as one version with id `default`, effective from the beginning of time', () => {
      const config = defineConfig(tennisClubMembershipEvent)

      expect(config.versions).toHaveLength(1)
      expect(config.versions[0].id).toBe(DEFAULT_EVENT_CONFIG_VERSION_ID)
      expect(config.versions[0].effectiveFrom).toBe('0001-01-01')
      expect(config).not.toHaveProperty('actions')
    })

    it('should reject two versions with the same id, naming the event and the id', () => {
      expect(() =>
        defineConfig({
          id: eventId,
          label,
          advancedSearch,
          versions: [v1, { ...v2, id: 'v1' }]
        })
      ).toThrow(
        `Event '${eventId}' has more than one version with id 'v1'. Each version must have a different id.`
      )
    })

    it('should reject two versions with the same `effectiveFrom`, naming the event and the date', () => {
      expect(() =>
        defineConfig({
          id: eventId,
          label,
          advancedSearch,
          versions: [{ ...v1, effectiveFrom: '2027-03-01' }, v2]
        })
      ).toThrow(
        `Event '${eventId}' has more than one version with \`effectiveFrom\` '2027-03-01'. Each version must have a different \`effectiveFrom\`.`
      )
    })

    it('should reject two versions without `effectiveFrom`', () => {
      expect(() =>
        defineConfig({
          id: eventId,
          label,
          advancedSearch,
          versions: [v1, { ...v2, effectiveFrom: undefined }]
        })
      ).toThrow(
        `Event '${eventId}' has more than one version without \`effectiveFrom\`. At most one version may omit it.`
      )
    })

    it('should report an invalid version under its index', () => {
      const result = VersionedEventConfig.safeParse({
        id: eventId,
        label,
        advancedSearch,
        versions: [
          v1,
          {
            ...v2,
            actions: v2.actions.filter(
              (action) => action.type !== ActionType.DECLARE
            )
          }
        ]
      })

      expect(result.success).toBe(false)
      expect(result.error?.issues).toContainEqual(
        expect.objectContaining({ path: ['versions', 1, 'actions'] })
      )
    })

    it('should use the first version until versions are resolved from the record', () => {
      const config = defineConfig({
        id: eventId,
        label,
        advancedSearch,
        versions: [
          v1,
          { ...v2, title: { ...v2.title, defaultMessage: 'Version 2' } }
        ]
      })

      expect(resolveEventConfig(config).title).toEqual(v1.title)
      expect(resolveEventConfig(config)).toBe(resolveEventConfig(config))
    })

    it('should resolve a refetched event to its new label when its version is the same object', () => {
      const config = defineConfig({
        id: eventId,
        label,
        advancedSearch,
        versions: [v1]
      })
      const refetched = {
        ...config,
        label: { ...label, defaultMessage: 'Renamed' }
      }

      expect(resolveEventConfig(config).label).toEqual(label)
      expect(resolveEventConfig(refetched).label).toEqual(refetched.label)
    })

    it('should reject a version field (e.g. actions) at the top level of an event with versions', () => {
      expect(() =>
        defineConfig({
          id: eventId,
          label,
          advancedSearch,
          actions: v1.actions,
          versions: [v1]
        })
      ).toThrow(
        `Event '${eventId}' defines \`versions\`, so \`actions\` must be defined on each version, not at the top level.`
      )
    })
  })
})
