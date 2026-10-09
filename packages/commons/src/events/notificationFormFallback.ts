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

/*
 * Builds the NOTIFY notification form and review from the DECLARE action, for events that do not configure them.
 * Not exported from the package: only `defineConfig` and test utilities use it.
 */

import * as z from 'zod/v4'
import { FieldType } from './FieldType'
import { FieldConfigInput } from './FieldConfig'
import { DeclarationFormConfigInput } from './FormConfig'
import { DeclarationReviewConfig } from './ActionConfig'

type DeclarationReviewConfigInput = z.input<typeof DeclarationReviewConfig>

/**
 * Makes a field (and the fields of a field group) optional, and removes its validations.
 * The notification form generated from the declaration accepts what NOTIFY accepts today:
 * structural checks only.
 */
function toOptionalField(field: FieldConfigInput): FieldConfigInput {
  const { validation: _validation, ...rest } = field

  if (rest.type === FieldType.FIELD_GROUP) {
    return {
      ...rest,
      required: false,
      fields: rest.fields.map(toOptionalField)
    }
  }

  return { ...rest, required: false }
}

/** @returns the declaration form with every field optional. */
export function generateNotificationForm(
  declaration: DeclarationFormConfigInput
): DeclarationFormConfigInput {
  return {
    ...declaration,
    pages: declaration.pages.map((page) => ({
      ...page,
      fields: page.fields.map(toOptionalField)
    }))
  }
}

/** @returns the DECLARE review with every field optional. */
export function generateNotifyReview(
  declareReview: DeclarationReviewConfigInput
): DeclarationReviewConfigInput {
  return {
    ...declareReview,
    fields: declareReview.fields.map(toOptionalField)
  }
}
