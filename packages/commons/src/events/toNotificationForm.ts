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
import * as z from 'zod/v4'
import { FieldType } from './FieldType'
import { FieldConfig, FieldConfigInput } from './FieldConfig'
import { DeclarationFormConfig, DeclarationFormConfigInput } from './FormConfig'
import { DeclarationReviewConfig } from './ActionConfig'

type DeclarationReviewConfigInput = z.input<typeof DeclarationReviewConfig>
type DeclarationReviewConfigOutput = z.infer<typeof DeclarationReviewConfig>

/**
 * Makes a field (and the fields of a field group) optional, and removes its validations.
 */
function toOptionalField<F extends FieldConfig | FieldConfigInput>(
  field: F
): F {
  const { validation: _validation, ...rest } = field

  if (rest.type === FieldType.FIELD_GROUP && 'fields' in rest) {
    return {
      ...rest,
      required: false,
      fields: (rest.fields as F[]).map(toOptionalField)
    } as F
  }

  return { ...rest, required: false } as F
}

/**
 * NOTIFY submits incomplete records, and its notification form is validated like any form.
 *
 * @returns a copy of the declaration form with every field optional and without validations, to use as the NOTIFY `notificationForm`.
 */
export function toNotificationForm<
  F extends DeclarationFormConfig | DeclarationFormConfigInput
>(declaration: F): F {
  return {
    ...declaration,
    pages: declaration.pages.map((page) => ({
      ...page,
      fields: (page.fields as Array<FieldConfig | FieldConfigInput>).map(
        toOptionalField
      )
    }))
  } as F
}

/**
 * @returns a copy of the DECLARE review with every field optional and without validations, to use as the NOTIFY `review`.
 */
export function toNotificationReview<
  R extends DeclarationReviewConfigOutput | DeclarationReviewConfigInput
>(review: R): R {
  return {
    ...review,
    fields: (review.fields as Array<FieldConfig | FieldConfigInput>).map(
      toOptionalField
    )
  } as R
}
