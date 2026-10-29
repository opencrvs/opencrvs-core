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
import { toNotificationForm, toNotificationReview } from './toNotificationForm'
import { FieldType } from './FieldType'
import { FieldConfig } from './FieldConfig'
import { DeclarationFormConfig } from './FormConfig'
import { field } from './field'

const label = {
  id: 'event.tennis-club-membership.test.label',
  defaultMessage: 'Test',
  description: 'Test label'
}

const requiredField = {
  id: 'applicant.nickname',
  type: FieldType.TEXT,
  label,
  required: true,
  validation: [
    {
      validator: field('applicant.nickname').isValidEnglishName(),
      message: label
    }
  ]
} satisfies FieldConfig

const fieldGroup = {
  id: 'applicant.group',
  type: FieldType.FIELD_GROUP,
  label,
  required: true,
  fields: [{ ...requiredField, id: 'applicant.group.nickname' }]
} satisfies FieldConfig

const declaration = {
  label,
  pages: [
    { id: 'applicant', title: label, fields: [requiredField, fieldGroup] }
  ]
} as DeclarationFormConfig

describe('toNotificationForm()', () => {
  it('should make fields and field group subfields optional, without validations', () => {
    const [nickname, group] = toNotificationForm(declaration).pages[0].fields

    expect(nickname).toMatchObject({
      id: 'applicant.nickname',
      required: false
    })
    expect(nickname).not.toHaveProperty('validation')
    expect(group).toMatchObject({
      required: false,
      fields: [{ id: 'applicant.group.nickname', required: false }]
    })
    expect(
      group.type === FieldType.FIELD_GROUP && group.fields[0]
    ).not.toHaveProperty('validation')
  })

  it('should not change the declaration', () => {
    toNotificationForm(declaration)

    expect(declaration.pages[0].fields[0]).toMatchObject({
      required: true,
      validation: [{ message: label }]
    })
  })
})

describe('toNotificationReview()', () => {
  it('should make review fields optional, without validations', () => {
    const review = toNotificationReview({
      title: label,
      fields: [requiredField]
    })

    expect(review.title).toEqual(label)
    expect(review.fields[0]).toMatchObject({ required: false })
    expect(review.fields[0]).not.toHaveProperty('validation')
  })
})
