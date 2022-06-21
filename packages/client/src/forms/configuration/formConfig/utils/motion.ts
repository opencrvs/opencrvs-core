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
import { FieldPosition } from '@client/forms/configuration'
import { IConfigField, IConfigFieldMap } from '.'

export function shiftCurrentFieldUp(
  fields: IConfigFieldMap,
  currentField: IConfigField,
  previousField: IConfigField | undefined,
  nextField: IConfigField | undefined
) {
  if (!previousField) return fields

  fields = { ...fields }

  if (previousField.precedingFieldId !== FieldPosition.TOP) {
    /* change the previous previous field's next pointer */
    fields[previousField.precedingFieldId] = {
      ...fields[previousField.precedingFieldId],
      foregoingFieldId: currentField.fieldId
    }
  }

  /* change current field's previous and next pointer */
  fields[currentField.fieldId] = {
    ...fields[currentField.fieldId],
    precedingFieldId: previousField.precedingFieldId,
    foregoingFieldId: previousField.fieldId
  }

  /* change previous field's previous and next pointer */
  fields[previousField.fieldId] = {
    ...fields[previousField.fieldId],
    precedingFieldId: currentField.fieldId,
    foregoingFieldId: currentField.foregoingFieldId
  }

  if (nextField) {
    /* change next field's previous pointer */
    fields[nextField.fieldId] = {
      ...fields[nextField.fieldId],
      precedingFieldId: currentField.precedingFieldId
    }
  }
  return fields
}

export function shiftCurrentFieldDown(
  fields: IConfigFieldMap,
  currentField: IConfigField,
  previousField: IConfigField | undefined,
  nextField: IConfigField | undefined
) {
  if (!nextField) return fields

  fields = { ...fields }

  if (nextField.foregoingFieldId !== FieldPosition.BOTTOM) {
    /* change the next next field's previous pointer */
    fields[nextField.foregoingFieldId] = {
      ...fields[nextField.foregoingFieldId],
      precedingFieldId: currentField.fieldId
    }
  }

  /* change current field's previous and next pointer */
  fields[currentField.fieldId] = {
    ...fields[currentField.fieldId],
    precedingFieldId: nextField.fieldId,
    foregoingFieldId: nextField.foregoingFieldId
  }

  /* change next field's previous and next pointer */
  fields[nextField.fieldId] = {
    ...fields[nextField.fieldId],
    precedingFieldId: currentField.precedingFieldId,
    foregoingFieldId: currentField.fieldId
  }

  if (previousField) {
    /* change previous field's next pointer */
    fields[previousField.fieldId] = {
      ...fields[previousField.fieldId],
      foregoingFieldId: currentField.foregoingFieldId
    }
  }
  return fields
}
