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
import { describe, it, expect, vi } from 'vitest'
import {
  field,
  generateTranslationConfig,
  PageConfig,
  ValidatorContext
} from '@opencrvs/commons/client'
import { getFormBackAction } from './FormBackAction'

const label = generateTranslationConfig('label')

function formPage(
  id: string,
  conditional?: PageConfig['conditional']
): PageConfig {
  return {
    id,
    type: 'FORM',
    title: label,
    requireCompletionToContinue: false,
    fields: [],
    ...(conditional ? { conditional } : {})
  } as unknown as PageConfig
}

const validatorContext = {} as ValidatorContext

describe('getFormBackAction', () => {
  it('returns undefined on the first page', () => {
    const back = getFormBackAction({
      formPages: [formPage('a'), formPage('b')],
      formData: {},
      validatorContext,
      pageId: 'a',
      onNavigateToPage: vi.fn()
    })

    expect(back).toBeUndefined()
  })

  it('returns undefined when the page is not found', () => {
    const back = getFormBackAction({
      formPages: [formPage('a'), formPage('b')],
      formData: {},
      validatorContext,
      pageId: 'missing',
      onNavigateToPage: vi.fn()
    })

    expect(back).toBeUndefined()
  })

  it('navigates to the previous page', () => {
    const onNavigateToPage = vi.fn()
    const back = getFormBackAction({
      formPages: [formPage('a'), formPage('b'), formPage('c')],
      formData: {},
      validatorContext,
      pageId: 'c',
      onNavigateToPage
    })

    expect(back).toBeTypeOf('function')
    back?.()
    expect(onNavigateToPage).toHaveBeenCalledExactlyOnceWith('b')
  })

  it('skips a hidden page when resolving the previous page', () => {
    const onNavigateToPage = vi.fn()
    // Page 'b' is only visible when toggle === 'true'. With toggle unset it is
    // hidden, so going back from 'c' must land on 'a', not the hidden 'b'.
    const back = getFormBackAction({
      formPages: [
        formPage('a'),
        formPage('b', field('toggle').isEqualTo('true')),
        formPage('c')
      ],
      formData: {},
      validatorContext,
      pageId: 'c',
      onNavigateToPage
    })

    back?.()
    expect(onNavigateToPage).toHaveBeenCalledExactlyOnceWith('a')
  })
})
