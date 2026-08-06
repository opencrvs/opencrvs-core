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
import React from 'react'
import { beforeAll, describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { ThemeProvider } from 'styled-components'
import { getTheme } from '@opencrvs/components/lib/theme'
import {
  ActionType,
  RecordForm,
  RecordVersion,
  UUID
} from '@opencrvs/commons/client'
import { RecordVersionSelect } from './RecordVersionSelect'

function version(
  id: string,
  form: RecordForm,
  indexInForm: number,
  isLatestOfForm: boolean
): RecordVersion {
  return {
    actionId: id as UUID,
    actionType: ActionType.DECLARE,
    form,
    indexInForm,
    isLatestOfForm,
    createdAt: '2026-05-08T10:00:00.000Z',
    createdBy: 'user-1'
  }
}

function renderSelect(
  versions: RecordVersion[],
  selected: RecordVersion,
  onSelect = vi.fn()
) {
  render(
    <ThemeProvider theme={getTheme()}>
      <IntlProvider locale="en" messages={{}}>
        <RecordVersionSelect
          selected={selected}
          versions={versions}
          onSelect={onSelect}
        />
      </IntlProvider>
    </ThemeProvider>
  )
  return { onSelect }
}

/*
 * jsdom 16 has no Popover API, which DropdownMenu drives its open state with.
 * Stub it so a click on an item does not throw before the handler runs.
 */
beforeAll(() => {
  const noop = function noop() {
    return undefined
  }
  Object.assign(HTMLElement.prototype, {
    togglePopover: noop,
    showPopover: noop,
    hidePopover: noop
  })
})

function textOf(testId: string) {
  return screen.getByTestId(testId).textContent
}

describe('RecordVersionSelect', () => {
  it('reads "Only version" when the form has exactly one', () => {
    const versions = [
      version('a', RecordForm.DECLARATION, 0, true),
      version('b', RecordForm.REGISTRATION, 0, true)
    ]

    renderSelect(versions, versions[1])

    expect(textOf('record-version-select')).toContain(
      'Registration • Only version'
    )
  })

  it('reads "Latest", "Original" and a number for a form with several versions', () => {
    const versions = [
      version('a', RecordForm.DECLARATION, 0, true),
      version('b', RecordForm.REGISTRATION, 0, false),
      version('c', RecordForm.REGISTRATION, 1, false),
      version('d', RecordForm.REGISTRATION, 2, true)
    ]

    renderSelect(versions, versions[3])

    expect(textOf('record-version-select')).toContain('Registration • Latest')
    expect(textOf('record-version-option-b')).toBe('Registration • Original')
    expect(textOf('record-version-option-c')).toBe('Registration • Version 2')
    // The declaration has one version, so it does not read "Latest".
    expect(textOf('record-version-option-a')).toBe(
      'Declaration • Only version'
    )
  })

  it('lists the newest version first', () => {
    const versions = [
      version('a', RecordForm.NOTIFICATION, 0, true),
      version('b', RecordForm.DECLARATION, 0, true),
      version('c', RecordForm.REGISTRATION, 0, true)
    ]

    renderSelect(versions, versions[2])

    const rendered = screen
      .getAllByTestId(/^record-version-option-/)
      .map((node) => node.getAttribute('data-testid'))

    expect(rendered).toEqual([
      'record-version-option-c',
      'record-version-option-b',
      'record-version-option-a'
    ])
  })

  it('reports the chosen version to the caller', () => {
    const versions = [
      version('a', RecordForm.DECLARATION, 0, true),
      version('b', RecordForm.REGISTRATION, 0, true)
    ]

    const { onSelect } = renderSelect(versions, versions[1])

    fireEvent.click(screen.getByTestId('record-version-option-a'))

    expect(onSelect).toHaveBeenCalledWith('a')
  })
})
