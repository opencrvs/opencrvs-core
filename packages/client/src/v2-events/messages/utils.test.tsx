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
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { useEventFormData } from '../features/events/useEventFormData'
import { useActionAnnotation } from '../features/events/useActionAnnotation'
import {
  EMPTY_TOKEN,
  useIntlFormatMessageWithFlattenedParams,
  useIntlWithFormData
} from './utils'

describe('useIntlFormatMessageWithFlattenedParams', () => {
  describe('formatMessage()', () => {
    const messages = {
      'test.message': 'Hello, {name} :)',
      'test.nested': 'Your order {order.id} is confirmed.',
      'test.missing': 'This should not be missing.',
      'test.select':
        '{applicant.name.firstname, select, __EMPTY__ {Hello} other {{applicant.name.surname, select, __EMPTY__ {Hello} other {Hello to {applicant.name.firstname} {applicant.name.surname}}}}}'
    }

    function renderUseIntlHook() {
      return renderHook(() => useIntlFormatMessageWithFlattenedParams(), {
        wrapper: ({ children }) => (
          <IntlProvider locale="en" messages={messages}>
            {children}
          </IntlProvider>
        )
      })
    }

    it('formats a simple message with a parameter', () => {
      const { result } = renderUseIntlHook()
      const formattedMessage = result.current.formatMessage(
        { id: 'test.message', defaultMessage: 'Hello, {name}!' },
        { name: 'John' }
      )
      expect(formattedMessage).toBe('Hello, John :)')
    })

    it('formats a message with flattened parameters', () => {
      const { result } = renderUseIntlHook()
      const formattedMessage = result.current.formatMessage(
        {
          id: 'test.nested',
          defaultMessage: 'Your order {order.id} is confirmed.'
        },
        { 'order.id': '12345' }
      )
      expect(formattedMessage).toBe('Your order 12345 is confirmed.')
    })

    it('falls back to defaultMessage if id is not found', () => {
      const { result } = renderUseIntlHook()
      const formattedMessage = result.current.formatMessage(
        { id: 'non.existent', defaultMessage: 'Fallback message for {value}.' },
        { value: 'test' }
      )
      expect(formattedMessage).toBe('Fallback message for test.')
    })

    it('defaults to empty strings if message strings refers to non-existing variables', () => {
      const { result } = renderUseIntlHook()
      expect(result.current.formatMessage({ id: 'test.message' }, {})).toBe(
        'Hello,  :)'
      )
    })

    it('does not throw if a variable is null', () => {
      const { result } = renderUseIntlHook()
      expect(
        result.current.formatMessage({ id: 'test.message' }, { name: null })
      ).toBe('Hello,  :)')
    })

    describe(`${EMPTY_TOKEN} token functionality`, () => {
      it(`correctly selects ${EMPTY_TOKEN} option if no values given`, () => {
        const message = {
          id: 'test.select',
          defaultMessage: 'Fallback message',
          description: 'test'
        }

        const { result } = renderUseIntlHook()

        const formattedMessage = result.current.formatMessage(message, {
          'applicant.name': {
            firstname: null,
            surname: null
          }
        })

        expect(formattedMessage).toBe('Hello')
      })

      it('correctly selects option with values if values given', () => {
        const message = {
          id: 'test.select',
          defaultMessage: 'Fallback message',
          description: 'test'
        }

        const { result } = renderUseIntlHook()

        const formattedMessage = result.current.formatMessage(message, {
          'applicant.name': {
            firstname: 'John',
            surname: 'Doe'
          }
        })

        expect(formattedMessage).toBe('Hello to John Doe')
      })
    })
  })
})

describe('useIntlWithFormData', () => {
  beforeEach(() => {
    useEventFormData.setState({
      formValues: { 'person.firstname': 'Tareq' }
    })
    useActionAnnotation.setState({ annotation: { lastname: 'Aziz' } })
  })

  const messages = {
    'test.greeting': 'Hello, {person.firstname} {lastname}!',
    'test.partial': 'Hi, {person.firstname}!',
    'test.missing': 'Nothing here.',
    'test.params': 'Hello, {person.firstname} {sruname}'
  }

  function renderUseIntlHook() {
    return renderHook(() => useIntlWithFormData(), {
      wrapper: ({ children }) => (
        <IntlProvider locale="en" messages={messages}>
          {children}
        </IntlProvider>
      )
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('formats a message using formValues and annotation', () => {
    const { result } = renderUseIntlHook()
    const formatted = result.current.formatMessage({
      id: 'test.greeting',
      defaultMessage: 'Hello Stranger'
    })
    expect(formatted).toBe('Hello, Tareq Aziz!')
  })

  it('formats a message if only some values exist', () => {
    const { result } = renderUseIntlHook()
    const formatted = result.current.formatMessage({
      id: 'test.partial',
      defaultMessage: 'Hi!'
    })
    expect(formatted).toBe('Hi, Tareq!')
  })

  it('falls back to defaultMessage if id not found', () => {
    const { result } = renderUseIntlHook()
    const formatted = result.current.formatMessage(
      { id: 'non.existent', defaultMessage: 'Default says hi {person.name}.' },
      { 'person.name': 'Tareq' }
    )
    expect(formatted).toBe('Default says hi Tareq.')
  })

  it('does not throw if provided variable is null', () => {
    const { result } = renderUseIntlHook()
    const formatted = result.current.formatMessage(
      { id: 'test.greeting', defaultMessage: 'Hello Stranger' },
      { firstname: null }
    )
    expect(formatted).toContain('Hello,')
  })

  it('render with provided variable', () => {
    const { result } = renderUseIntlHook()
    const formatted = result.current.formatMessage(
      { id: 'test.params', defaultMessage: 'Hello Stranger' },
      { 'person.firstname': 'Jon', sruname: 'Doe' }
    )
    expect(formatted).toContain('Hello, Jon Doe')
  })
})
