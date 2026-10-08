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
import { EventConfigInput } from './EventConfig'
import { ActionType } from './ActionType'
import { getDeclaration } from './utils'
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

describe('defineConfig()', () => {
  let warn: jest.SpyInstance

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    warn.mockRestore()
  })

  it('should keep a declaration given on the DECLARE action', () => {
    const config = defineConfig(tennisClubMembershipEvent)

    expect(getDeclaration(config)).toEqual(declaration)
    expect(warn).not.toHaveBeenCalled()
  })

  it('should move a top-level declaration onto the DECLARE action', () => {
    const config = defineConfig({
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
      `Event must have a DECLARE action. Found none for event ${tennisClubMembershipEvent.id}`
    )
  })

  describe('action versions', () => {
    const declareAction = tennisClubMembershipEvent.actions[declareActionIndex]
    const declareActionWithoutDeclaration =
      actionsWithoutDeclaration[declareActionIndex]
    const actionCount = tennisClubMembershipEvent.actions.length

    it('should accept an action given as versions with different effectiveFrom values', () => {
      const config = defineConfig({
        ...tennisClubMembershipEvent,
        actions: [
          ...tennisClubMembershipEvent.actions.filter(
            (action) => action.type !== ActionType.DECLARE
          ),
          { ...declareAction, effectiveFrom: '2020-01-01' },
          { ...declareAction, effectiveFrom: '2025-01-01' }
        ]
      })

      expect(
        config.actions
          .filter((action) => action.type === ActionType.DECLARE)
          .map((action) => action.effectiveFrom)
      ).toEqual(['2020-01-01', '2025-01-01'])
    })

    it('should accept an action given as one version without effectiveFrom', () => {
      const config = defineConfig(tennisClubMembershipEvent)

      expect(config.actions[declareActionIndex].effectiveFrom).toBeUndefined()
    })

    it('should accept a version without effectiveFrom alongside dated versions', () => {
      expect(() =>
        defineConfig({
          ...tennisClubMembershipEvent,
          actions: [
            ...tennisClubMembershipEvent.actions,
            { ...declareAction, effectiveFrom: '2020-01-01' }
          ]
        })
      ).not.toThrow()
    })

    it('should throw naming the action and the date when two versions have the same effectiveFrom', () => {
      expect(() =>
        defineConfig({
          ...tennisClubMembershipEvent,
          actions: [
            ...tennisClubMembershipEvent.actions,
            { ...declareAction, effectiveFrom: '2020-01-01' },
            { ...declareAction, effectiveFrom: '2020-01-01' }
          ]
        })
      ).toThrow(
        `Action 'DECLARE' of event '${tennisClubMembershipEvent.id}' has more than one version with \`effectiveFrom\` '2020-01-01'. Each version must have a different \`effectiveFrom\`.`
      )
    })

    it('should throw when two versions have no effectiveFrom', () => {
      expect(() =>
        defineConfig({
          ...tennisClubMembershipEvent,
          actions: [...tennisClubMembershipEvent.actions, declareAction]
        })
      ).toThrow(
        `Action 'DECLARE' of event '${tennisClubMembershipEvent.id}' has more than one version without \`effectiveFrom\`. At most one version may omit it.`
      )
    })

    it('should move a top-level declaration onto every version of the DECLARE action', () => {
      const config = defineConfig({
        ...tennisClubMembershipEvent,
        actions: [
          ...actionsWithoutDeclaration,
          { ...declareActionWithoutDeclaration, effectiveFrom: '2020-01-01' }
        ],
        declaration
      })

      const declareVersions = config.actions.filter(
        (action) => action.type === ActionType.DECLARE
      )
      expect(declareVersions).toHaveLength(2)
      declareVersions.forEach((action) =>
        expect(action.declaration).toEqual(declaration)
      )
    })

    it('should throw naming the versions without a declaration when only some versions define one', () => {
      expect(() =>
        defineConfig({
          ...tennisClubMembershipEvent,
          actions: [
            ...tennisClubMembershipEvent.actions,
            { ...declareActionWithoutDeclaration, effectiveFrom: '2020-01-01' }
          ]
        })
      ).toThrow(
        `Event '${tennisClubMembershipEvent.id}' defines \`declaration\` on some versions of the DECLARE action but not on \`actions[${actionCount}].declaration\` (\`effectiveFrom\` '2020-01-01'). Define it on every version, or remove it from every version and define it once at the top level.`
      )
    })

    it('should throw naming the versions with a declaration when a top-level declaration is also given', () => {
      expect(() =>
        defineConfig({
          ...tennisClubMembershipEvent,
          actions: [
            ...tennisClubMembershipEvent.actions,
            { ...declareActionWithoutDeclaration, effectiveFrom: '2020-01-01' }
          ],
          declaration
        })
      ).toThrow(
        `Event '${tennisClubMembershipEvent.id}' defines \`declaration\` both at the top level and on versions of the DECLARE action (\`actions[${declareActionIndex}].declaration\` (no \`effectiveFrom\`)). Define it either only at the top level, to share it across every version, or on every version and not at the top level.`
      )
    })

    it('should throw naming every version when no version defines a declaration and none is given at the top level', () => {
      expect(() =>
        defineConfig({
          ...tennisClubMembershipEvent,
          actions: [
            ...actionsWithoutDeclaration,
            { ...declareActionWithoutDeclaration, effectiveFrom: '2020-01-01' }
          ]
        })
      ).toThrow(
        `Event '${tennisClubMembershipEvent.id}' does not define \`declaration\`. Define it either at the top level or on every version of the DECLARE action (\`actions[${declareActionIndex}].declaration\` (no \`effectiveFrom\`), \`actions[${actionCount}].declaration\` (\`effectiveFrom\` '2020-01-01')).`
      )
    })
  })
})
