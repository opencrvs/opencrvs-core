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
import {
  ConditionalType,
  field,
  FieldConfig,
  FieldType,
  FormConfig
} from '@opencrvs/commons/client'
import { validationErrorsInActionFormExist } from './validation'

const formConfig: FormConfig = {
  label: { id: 'form.label', defaultMessage: 'Form', description: 'Form' },
  pages: []
}

const secondParentSignature = {
  id: 'review.secondParentSignature',
  type: FieldType.SIGNATURE,
  required: true,
  label: {
    id: 'review.secondParentSignature.label',
    defaultMessage: 'Signature of second parent',
    description: 'Signature of second parent'
  },
  signaturePromptLabel: {
    id: 'review.secondParentSignature.prompt',
    defaultMessage: 'Draw signature',
    description: 'Draw signature'
  },
  configuration: { maxFileSize: 5 * 1024 * 1024 },
  conditionals: [
    {
      type: ConditionalType.SHOW,
      conditional: field('parents.count').isEqualTo(2)
    }
  ]
} satisfies FieldConfig

const signature = {
  path: '4f095fc4-4312-4de2-aa38-86dcc0f71044.png',
  originalFilename: 'abcd.png',
  type: 'image/png'
}

describe('validationErrorsInActionFormExist', () => {
  it('accepts a signed review field whose visibility depends on the declaration', () => {
    expect(
      validationErrorsInActionFormExist({
        formConfig,
        form: { 'parents.count': 2 },
        annotation: { 'review.secondParentSignature': signature },
        reviewFields: [secondParentSignature],
        context: {}
      })
    ).toBe(false)
  })

  it('requires the review field when the declaration shows it', () => {
    expect(
      validationErrorsInActionFormExist({
        formConfig,
        form: { 'parents.count': 2 },
        annotation: {},
        reviewFields: [secondParentSignature],
        context: {}
      })
    ).toBe(true)
  })

  it('does not require the review field when the declaration hides it', () => {
    expect(
      validationErrorsInActionFormExist({
        formConfig,
        form: { 'parents.count': 1 },
        annotation: {},
        reviewFields: [secondParentSignature],
        context: {}
      })
    ).toBe(false)
  })
})
