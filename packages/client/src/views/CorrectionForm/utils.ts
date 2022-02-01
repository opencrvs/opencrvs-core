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

  for (const field of group.fields) {
    const fieldErrors = errors[field.name].errors
    const nestedFieldErrors = errors[field.name].nestedFields

    if (fieldErrors.length > 0) {
      return true
    }

    if (field.nestedFields) {
      for (const nestedFields of Object.values(field.nestedFields)) {
        for (const nestedField of nestedFields) {
          if (
            nestedFieldErrors[nestedField.name] &&
            nestedFieldErrors[nestedField.name].length > 0
          ) {
            return true
          }
        }
      }
    }
  }

  return false
}
