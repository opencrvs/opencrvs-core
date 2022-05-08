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

import { Event } from '@client/forms'
import { FieldPosition } from '@client/forms/configuration'
import { IConfigField, IConfigFieldMap } from './utils'

export function getConfigFieldIdentifiers(fieldId: string) {
  const [event, sectionId] = fieldId.split('.')
  return {
    event: event as Event,
    sectionId
  }
}

export function hasPreviewGroup(field: IConfigField) {
  return Boolean(field.previewGroupID)
}

export function getElementsOfPreviewGroup(
  section: IConfigFieldMap,
  previewGroupID: string | undefined
) {
  return Object.values(section).filter((s) => {
    return s.previewGroupID === previewGroupID
  })
}

export function getIndexOfPlaceholderPreviewGroup(
  section: IConfigFieldMap,
  givenField: IConfigField,
  reverse?: boolean
) {
  if (!givenField.previewGroupID) {
    return -1
  }

  const elements = getElementsOfPreviewGroup(section, givenField.previewGroupID)

  return reverse
    ? elements.reverse().indexOf(givenField)
    : elements.indexOf(givenField)
}

export function shiftCurrentFieldUp(
  section: IConfigFieldMap,
  currentField: IConfigField,
  previousField: IConfigField | undefined,
  nextField: IConfigField | undefined
) {
  if (currentField.preceedingFieldId === FieldPosition.TOP) return section

  const newSection = {
    ...section
  }
  if (previousField) {
    if (
      previousField.preceedingFieldId &&
      previousField.preceedingFieldId !== FieldPosition.TOP
    ) {
      /* change the previous of the previousField's next pointer */
      newSection[previousField.preceedingFieldId] = {
        ...newSection[previousField.preceedingFieldId],
        foregoingFieldId: currentField.fieldId
      }
    }

    /* change currentField's previous and next pointer */
    newSection[currentField.fieldId] = {
      ...newSection[currentField.fieldId],
      preceedingFieldId: previousField.preceedingFieldId,
      foregoingFieldId: previousField.fieldId
    }

    /* change previousField's previous and next pointer */
    newSection[previousField.fieldId] = {
      ...newSection[previousField.fieldId],
      preceedingFieldId: currentField.fieldId,
      foregoingFieldId: currentField.foregoingFieldId
    }
  }

  if (nextField) {
    /* change nextField's previous pointer */
    newSection[nextField.fieldId] = {
      ...newSection[nextField.fieldId],
      preceedingFieldId: currentField.preceedingFieldId
    }
  }
  return newSection
}

export function shiftCurrentFieldDown(
  section: IConfigFieldMap,
  currentField: IConfigField,
  previousField: IConfigField | undefined,
  nextField: IConfigField | undefined
) {
  if (currentField.foregoingFieldId === FieldPosition.BOTTOM) return section

  const newSection = {
    ...section
  }
  if (nextField) {
    if (nextField.foregoingFieldId !== FieldPosition.BOTTOM) {
      /* change the next of the nextField's previous pointer */
      newSection[nextField.foregoingFieldId] = {
        ...newSection[nextField.foregoingFieldId],
        preceedingFieldId: currentField.fieldId
      }
    }

    /* change currentField's previous and next pointer */
    newSection[currentField.fieldId] = {
      ...newSection[currentField.fieldId],
      preceedingFieldId: nextField.fieldId,
      foregoingFieldId: nextField.foregoingFieldId
    }

    /* change nextField's previous and next pointer */
    newSection[nextField.fieldId] = {
      ...newSection[nextField.fieldId],
      preceedingFieldId: currentField.preceedingFieldId,
      foregoingFieldId: currentField.fieldId
    }
  }

  if (previousField) {
    /* change previousField's next pointer */
    newSection[previousField.fieldId] = {
      ...newSection[previousField.fieldId],
      foregoingFieldId: currentField.foregoingFieldId
    }
  }
  return newSection
}
