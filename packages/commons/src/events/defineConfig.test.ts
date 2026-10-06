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
  it('should keep a declaration given on the DECLARE action', () => {
    const config = defineConfig(tennisClubMembershipEvent)

    expect(getDeclaration(config)).toEqual(declaration)
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
})
