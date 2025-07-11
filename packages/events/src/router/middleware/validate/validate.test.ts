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
import { ConditionalType, field, FieldType } from '@opencrvs/commons'
import { getFieldErrors } from './index'

describe('getFieldErrors()', () => {
  it('should return an empty array there are no fields to validate', () => {
    const errors = getFieldErrors([], {}, {})
    expect(errors).toEqual([])
  })

  it('should return an error if a required field is not provided', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.checkbox',
          type: FieldType.CHECKBOX,
          required: true,
          label: {
            id: 'test.checkbox.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          }
        }
      ],
      {},
      {}
    )
    expect(errors).toMatchSnapshot()
  })

  it('should not return an error if a required field is provided', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.checkbox',
          type: FieldType.CHECKBOX,
          required: true,
          label: {
            id: 'test.checkbox.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          }
        }
      ],
      { 'test.checkbox': true }
    )

    expect(errors).toMatchSnapshot()
  })

  it('should return an error if a value for a conditionally hidden required field is provided', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.checkbox',
          type: FieldType.CHECKBOX,
          required: true,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('test.text').isEqualTo('helloooo')
            }
          ]
        }
      ],
      { 'test.checkbox': true },
      {}
    )

    expect(errors).toMatchSnapshot()
  })

  it('should not return an error if a value for a conditionally hidden required field is not provided', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.checkbox',
          type: FieldType.CHECKBOX,
          required: true,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('test.text').isEqualTo('helloooo')
            }
          ]
        }
      ],
      {},
      {}
    )

    expect(errors).toMatchSnapshot()
  })

  it('should not return an error if a value for a conditionally visible required field is provided', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.checkbox',
          type: FieldType.CHECKBOX,
          required: true,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('test.text').isEqualTo('helloooo')
            }
          ]
        }
      ],
      { 'test.checkbox': true },
      { 'test.text': 'helloooo' }
    )

    expect(errors).toMatchSnapshot()
  })

  it('should not return error if multiple fields with same id are configured, and value is provided', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.input',
          type: FieldType.TEXT,
          required: true,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('test.text').isEqualTo('helloooo')
            }
          ]
        },
        {
          id: 'test.input',
          type: FieldType.TEXT,
          required: true,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('test.other').isEqualTo('helloooo')
            }
          ]
        }
      ],
      { 'test.checkbox': true },
      { 'test.text': 'helloooo' }
    )

    expect(errors).toMatchSnapshot()
  })

  it('should return errors for field with custom validation if value does not pass validation', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.input',
          type: FieldType.TEXT,
          required: true,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          validation: [
            {
              message: {
                id: 'test.field.validation.message',
                defaultMessage: 'Failed validation!',
                description: 'Test Field Validation Message Description'
              },
              validator: field('test.input').isEqualTo('helloooo')
            }
          ]
        }
      ],
      { 'test.input': 'not hello!' },
      {}
    )

    expect(errors).toMatchSnapshot()
  })

  it('should not return errors for field with custom validations if value passes validation', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.input',
          type: FieldType.TEXT,
          required: true,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          validation: [
            {
              message: {
                id: 'test.field.validation.message',
                defaultMessage: 'Failed validation!',
                description: 'Test Field Validation Message Description'
              },
              validator: field('test.input').isEqualTo('helloooo')
            }
          ]
        }
      ],
      { 'test.input': 'helloooo' },
      {}
    )

    expect(errors).toMatchSnapshot()
  })
})
