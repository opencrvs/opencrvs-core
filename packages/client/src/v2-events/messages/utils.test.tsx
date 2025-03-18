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
import { useIntlFormatMessageWithFlattenedParams } from './utils'

describe('useIntlFormatMessageWithFlattenedParams', () => {
  describe('formatMessage()', () => {
    const messages = {
      'test.message': 'Hello, {name} :)',
      'test.nested': 'Your order {order.id} is confirmed.',
      'test.missing': 'This should not be missing.',
      'test.select':
        '{applicant.firstname, select, __EMPTY__ {Hello} other {{applicant.surname, select, __EMPTY__ {Hello} other {Hello to {applicant.firstname} {applicant.surname}}}}}'
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

    it('throws an error if message string has variables that are were provided', () => {
      const { result } = renderUseIntlHook()
      expect(() =>
        result.current.formatMessage({ id: 'test.message' }, {})
      ).toThrow()
    })

    it('does not throw if a variable is null', () => {
      const { result } = renderUseIntlHook()
      expect(
        result.current.formatMessage({ id: 'test.message' }, { name: null })
      ).toBe('Hello,  :)')
    })

    describe('__EMPTY__ token functionality', () => {
      it('correctly selects __EMPTY__ option if no values given', () => {
        const message = {
          id: 'test.select',
          defaultMessage: 'Fallback message',
          description: 'test'
        }

        const { result } = renderUseIntlHook()

        const formattedMessage = result.current.formatMessage(message, {
          'applicant.firstname': null,
          'applicant.surname': null
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
          'applicant.firstname': 'John',
          'applicant.surname': 'Doe'
        })

        expect(formattedMessage).toBe('Hello to John Doe')
      })
    })
  })
})
