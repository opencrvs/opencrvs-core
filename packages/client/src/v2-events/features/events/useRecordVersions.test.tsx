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
import React, { PropsWithChildren } from 'react'
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  ActionType,
  EventDocument,
  RecordForm,
  generateEventDocument,
  getCurrentEventState,
  getRecordVersions,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { useRecordVersions } from './useRecordVersions'

const configuration = tennisClubMembershipEvent

function wrapperFor(search: string) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <MemoryRouter initialEntries={[`/events/x/record${search}`]}>
        {children}
      </MemoryRouter>
    )
  }
}

function renderVersions(event: EventDocument, search = '') {
  return renderHook(
    () =>
      useRecordVersions({
        event,
        configuration,
        currentState: getCurrentEventState(event, configuration)
      }),
    { wrapper: wrapperFor(search) }
  )
}

/**
 * Declared, edited once, then registered — three versions across two forms.
 *
 * Editing emits EDIT followed by a fresh DECLARE, which is what the client
 * actually does; the EDIT itself is not a version.
 */
function editedThenRegistered() {
  return generateEventDocument({
    configuration,
    actions: [
      { type: ActionType.CREATE },
      {
        type: ActionType.DECLARE,
        declarationOverrides: { 'applicant.email': 'original@example.com' }
      },
      {
        type: ActionType.EDIT,
        declarationOverrides: { 'applicant.email': 'edited@example.com' }
      },
      {
        type: ActionType.DECLARE,
        declarationOverrides: { 'applicant.email': 'edited@example.com' }
      },
      { type: ActionType.REGISTER }
    ]
  })
}

describe('useRecordVersions', () => {
  it('defaults to the newest version', () => {
    const event = editedThenRegistered()
    const { result } = renderVersions(event)

    expect(result.current.versions).toHaveLength(3)
    expect(result.current.selected?.form).toBe(RecordForm.REGISTRATION)
    expect(result.current.selected?.isLatestOfForm).toBe(true)
    expect(result.current.isLatest).toBe(true)
  })

  /*
   * Regression: the fallback used to resolve `selected` but not the index it
   * came from, so with no `version` in the url — the default when the Record
   * tab opens — there was never a previous version to compare against.
   */
  it('resolves the previous version when no version param is given', () => {
    const event = editedThenRegistered()
    const { result } = renderVersions(event)

    expect(result.current.previous).toBeDefined()
    expect(result.current.previous?.actionId).toBe(
      result.current.versions.at(-2)?.actionId
    )
    expect(result.current.previousState).toBeDefined()
  })

  it('has no previous version on the first one', () => {
    const event = editedThenRegistered()
    const first = getRecordVersions(event)[0]
    const { result } = renderVersions(event, `?version=${first.actionId}`)

    expect(result.current.previous).toBeUndefined()
    expect(result.current.previousState).toBeUndefined()
  })

  it('honours a version search param', () => {
    const event = editedThenRegistered()
    const { result: withDefault } = renderVersions(event)
    const declareVersion = withDefault.current.versions.find(
      (v) => v.form === RecordForm.DECLARATION && v.indexInForm === 0
    )

    if (!declareVersion) {
      throw new Error('the declaration version was not found')
    }

    const { result } = renderVersions(
      event,
      `?version=${declareVersion.actionId}`
    )

    expect(result.current.selected?.actionId).toBe(declareVersion.actionId)
    expect(result.current.isLatest).toBe(false)
    expect(result.current.selectedState.declaration['applicant.email']).toBe(
      'original@example.com'
    )
  })

  it('falls back to the newest version when the param is unknown', () => {
    const event = editedThenRegistered()
    const { result } = renderVersions(
      event,
      '?version=00000000-0000-4000-8000-000000000000'
    )

    expect(result.current.isLatest).toBe(true)
    expect(result.current.selected?.form).toBe(RecordForm.REGISTRATION)
  })

  it('reports no versions for a record with only a CREATE action', () => {
    const event = generateEventDocument({
      configuration,
      actions: [{ type: ActionType.CREATE }]
    })

    const { result } = renderVersions(event)

    expect(result.current.versions).toEqual([])
    expect(result.current.selected).toBeUndefined()
    // Falls back to the current state so the tab still renders.
    expect(result.current.selectedState).toBeDefined()
    expect(result.current.isLatest).toBe(true)
  })
})
