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
  defineFormPage,
  FieldConfig,
  FieldType,
  PageTypes,
  TranslationConfig
} from '@opencrvs/toolkit/events'

/**
 * The declaration fields for an adoptive parent. Adoptive parent 1 is
 * mandatory; adoptive parent 2 uses the same fields but optionally.
 */
export function createAdoptiveParentPage(
  prefix: string,
  title: TranslationConfig,
  required: boolean
) {
  return defineFormPage({
    id: prefix,
    type: PageTypes.enum.FORM,
    title,
    fields: [
      {
        id: `${prefix}.firstName`,
        type: FieldType.TEXT,
        required,
        label: {
          defaultMessage: "Adoptive parent's first name(s)",
          description: 'This is the label for the field',
          id: 'event.adoption.action.declare.form.section.adoptiveParent.field.firstName.label'
        }
      },
      {
        id: `${prefix}.lastName`,
        type: FieldType.TEXT,
        required,
        label: {
          defaultMessage: "Adoptive parent's last name",
          description: 'This is the label for the field',
          id: 'event.adoption.action.declare.form.section.adoptiveParent.field.lastName.label'
        }
      },
      {
        id: `${prefix}.idNumber`,
        type: FieldType.TEXT,
        required,
        label: {
          defaultMessage: "Adoptive parent's ID number",
          description: 'This is the label for the field',
          id: 'event.adoption.action.declare.form.section.adoptiveParent.field.idNumber.label'
        }
      }
    ] satisfies FieldConfig[]
  })
}
