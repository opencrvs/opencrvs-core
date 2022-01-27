import { IFormSectionGroup, IFormSection } from '@client/forms'
import { IApplication } from '@client/applications'
import { getValidationErrorsForForm } from '@client/forms/validation'

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
export function sectionHasError(
  group: IFormSectionGroup,
  section: IFormSection,
  application: IApplication
) {
  const errors = getValidationErrorsForForm(
    group.fields,
    application.data[section.id] || {}
  )

  let error = false

  group.fields.forEach((field) => {
    const fieldErrors = errors[field.name].errors
    const nestedFieldErrors = errors[field.name].nestedFields

    if (fieldErrors.length > 0) {
      error = true
    }

    if (field.nestedFields) {
      Object.values(field.nestedFields).forEach((nestedFields) => {
        nestedFields.forEach((nestedField) => {
          if (
            nestedFieldErrors[nestedField.name] &&
            nestedFieldErrors[nestedField.name].length > 0
          ) {
            error = true
          }
        })
      })
    }
  })
  return error
}
