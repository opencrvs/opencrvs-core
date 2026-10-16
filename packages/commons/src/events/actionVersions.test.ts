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

import { tennisClubMembershipEvent } from '../fixtures'
import { ActionType } from './ActionType'
import {
  getAllDeclarationFields,
  getEventConfigEffectiveAt,
  getEventConfigForAction,
  getEventConfigForRecord,
  resolveActionVersion
} from './actionVersions'
import { DeclareActionConfig } from './ActionConfig'
import { EventConfig } from './EventConfig'
import { FieldConfig } from './FieldConfig'
import { FieldType } from './FieldType'
import { getActionConfig, getDeclaration, getDeclarationFields } from './utils'
import { generateEventDocument } from './test.utils'

function v(effectiveFrom?: string) {
  return { effectiveFrom }
}

describe('resolveActionVersion()', () => {
  it('returns the latest version not after the date', () => {
    const versions = [v('2000-01-01'), v('2010-01-01'), v('2030-01-01')]
    expect(resolveActionVersion(versions, '2020-06-01')).toBe(versions[1])
  })

  it('includes a version effective on the date itself', () => {
    const versions = [v('2000-01-01'), v('2020-06-01')]
    expect(resolveActionVersion(versions, '2020-06-01')).toBe(versions[1])
  })

  it('treats a version without effectiveFrom as the earliest, whatever its position', () => {
    const versions = [v('2010-01-01'), v()]
    expect(resolveActionVersion(versions, '2005-01-01')).toBe(versions[1])
    expect(resolveActionVersion(versions, '2015-01-01')).toBe(versions[0])
  })

  it('returns undefined when every version is in the future', () => {
    expect(
      resolveActionVersion([v('2999-01-01')], '2020-01-01')
    ).toBeUndefined()
  })
})

describe('getEventConfigEffectiveAt()', () => {
  const declare = tennisClubMembershipEvent.actions.find(
    (a) => a.type === ActionType.DECLARE
  )
  if (!declare || declare.type !== ActionType.DECLARE) {
    throw new Error('Expected a DECLARE action')
  }
  const laterDeclaration = {
    ...declare.declaration,
    label: { ...declare.declaration.label, defaultMessage: 'Later form' }
  }
  const config = {
    ...tennisClubMembershipEvent,
    actions: [
      ...tennisClubMembershipEvent.actions,
      { ...declare, effectiveFrom: '2010-01-01', declaration: laterDeclaration }
    ]
  }

  it('keeps only the version effective at the date, so first-match helpers find it', () => {
    expect(
      getDeclaration(getEventConfigEffectiveAt(config, '2005-01-01'))
    ).toBe(declare.declaration)
    expect(
      getDeclaration(getEventConfigEffectiveAt(config, '2020-01-01'))
    ).toBe(laterDeclaration)
  })

  it('drops an action whose versions are all in the future', () => {
    const futureOnly = {
      ...tennisClubMembershipEvent,
      actions: tennisClubMembershipEvent.actions.map((a) =>
        a.type === ActionType.REGISTER
          ? { ...a, effectiveFrom: '2999-01-01' }
          : a
      )
    }
    expect(
      getActionConfig({
        eventConfiguration: getEventConfigEffectiveAt(futureOnly, '2020-01-01'),
        actionType: ActionType.REGISTER
      })
    ).toBeUndefined()
  })

  it('does not group a custom action with the core action its customActionType matches', () => {
    const custom = {
      type: ActionType.CUSTOM,
      customActionType: ActionType.DECLARE,
      form: [],
      flags: [],
      label: declare.label,
      auditHistoryLabel: declare.label
    }
    const withCustom = {
      ...tennisClubMembershipEvent,
      actions: [...tennisClubMembershipEvent.actions, custom]
    }
    const view = getEventConfigEffectiveAt(withCustom, '2020-01-01')
    expect(view.actions).toHaveLength(withCustom.actions.length)
  })

  it('returns the same object for the same config and date', () => {
    expect(getEventConfigEffectiveAt(config, '2020-01-01')).toBe(
      getEventConfigEffectiveAt(config, '2020-01-01')
    )
  })
})

function getFixtureDeclare(): DeclareActionConfig {
  const declare = tennisClubMembershipEvent.actions.find(
    (action): action is DeclareActionConfig =>
      action.type === ActionType.DECLARE
  )
  if (!declare) {
    throw new Error('Expected a DECLARE action')
  }
  return declare
}

describe('getEventConfigForRecord()', () => {
  const declare = getActionConfig({
    eventConfiguration: tennisClubMembershipEvent,
    actionType: ActionType.DECLARE
  })
  const register = getActionConfig({
    eventConfiguration: tennisClubMembershipEvent,
    actionType: ActionType.REGISTER
  })
  if (
    declare?.type !== ActionType.DECLARE ||
    register?.type !== ActionType.REGISTER
  ) {
    throw new Error('Expected DECLARE and REGISTER actions')
  }
  const laterDeclare = {
    ...declare,
    effectiveFrom: '2010-01-01',
    declaration: {
      ...declare.declaration,
      label: { ...declare.declaration.label, defaultMessage: 'Later form' }
    }
  }
  const laterRegister = { ...register, effectiveFrom: '2010-01-01' }
  const config = {
    ...tennisClubMembershipEvent,
    actions: [...tennisClubMembershipEvent.actions, laterDeclare, laterRegister]
  }
  const generated = generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: [{ type: ActionType.CREATE }, { type: ActionType.DECLARE }]
  })
  // Created and declared before the later versions took effect.
  const event = {
    ...generated,
    actions: generated.actions.map((action) =>
      action.type === ActionType.CREATE
        ? { ...action, performedAt: '2005-01-01T00:00:00.000Z' }
        : action
    )
  }
  const now = new Date('2020-01-01T00:00:00.000Z')

  it("uses today's version of each action, with the record's DECLARE version", () => {
    const view = getEventConfigForRecord(config, event, now)

    expect(getDeclaration(view)).toBe(declare.declaration)
    expect(
      getActionConfig({
        eventConfiguration: view,
        actionType: ActionType.REGISTER
      })
    ).toBe(laterRegister)
  })

  it('gives an action on the record the DECLARE version the server resolves', () => {
    expect(
      getDeclaration(
        getEventConfigForAction(
          config,
          { type: ActionType.DECLARE },
          event,
          now
        )
      )
    ).toBe(declare.declaration)
    expect(
      getDeclaration(
        getEventConfigForAction(
          config,
          { type: ActionType.REGISTER },
          event,
          now
        )
      )
    ).toBe(declare.declaration)
  })
})

describe('getAllDeclarationFields()', () => {
  const declare = getFixtureDeclare()
  const [firstPage, ...otherPages] = declare.declaration.pages
  const [firstField, ...otherFields] = firstPage.fields
  const label = { id: 'extra', defaultMessage: 'Extra', description: 'Extra' }

  it('returns the declaration fields when there is one DECLARE version', () => {
    expect(getAllDeclarationFields(tennisClubMembershipEvent)).toEqual(
      getDeclarationFields(tennisClubMembershipEvent)
    )
  })

  it('includes fields only a later-listed version defines, first-listed winning on a shared id', () => {
    const fields: FieldConfig[] = [
      { ...firstField, label },
      ...otherFields,
      { id: 'applicant.extra', type: FieldType.TEXT, label }
    ]
    const later: DeclareActionConfig = {
      ...declare,
      effectiveFrom: '2010-01-01',
      declaration: {
        ...declare.declaration,
        pages: [{ ...firstPage, fields }, ...otherPages]
      }
    }
    const config: EventConfig = {
      ...tennisClubMembershipEvent,
      actions: [...tennisClubMembershipEvent.actions, later]
    }

    const allFields = getAllDeclarationFields(config)

    expect(allFields.map(({ id }) => id)).toEqual([
      ...getDeclarationFields(tennisClubMembershipEvent).map(({ id }) => id),
      'applicant.extra'
    ])
    expect(allFields.find(({ id }) => id === firstField.id)).toBe(firstField)
  })
})
