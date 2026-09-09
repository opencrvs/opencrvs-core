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
import {
  farajalandNameConfig,
  invalidNameValidator
} from '@countryconfig/events/birth/validators'

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
        id: `${prefix}.name`,
        type: FieldType.NAME,
        required,
        configuration: farajalandNameConfig,
        hideLabel: true,
        label: {
          defaultMessage: "Adoptive parent's name",
          description: 'This is the label for the field',
          id: 'event.adoption.action.declare.form.section.adoptiveParent.field.name.label'
        },
        validation: [invalidNameValidator(`${prefix}.name`)]
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
