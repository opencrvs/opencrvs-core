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

import { ISerializedForm } from '@client/forms'
import { IFieldIdentifiers } from '@client/forms/questionConfig'
import { FieldPosition } from '.'
import { Event } from '@client/utils/gateway'

export function getSection(
  { sectionIndex }: IFieldIdentifiers,
  defaultForm: ISerializedForm
) {
  return defaultForm.sections[sectionIndex]
}

export function getGroup(
  identifiers: IFieldIdentifiers,
  defaultForm: ISerializedForm
) {
  const section = getSection(identifiers, defaultForm)
  return section.groups[identifiers.groupIndex]
}

export function getField(
  identifiers: IFieldIdentifiers,
  defaultForm: ISerializedForm
) {
  const group = getGroup(identifiers, defaultForm)
  return group.fields[identifiers.fieldIndex]
}

export function getFieldId(
  event: Event,
  identifiers: IFieldIdentifiers,
  defaultForm: ISerializedForm
) {
  const section = getSection(identifiers, defaultForm)
  const group = getGroup(identifiers, defaultForm)
  const field = getField(identifiers, defaultForm)
  return [event, section.id, group.id, field.name].join('.')
}

export function getPrecedingDefaultFieldIdAcrossSections(
  event: Event,
  identifiers: IFieldIdentifiers,
  defaultForm: ISerializedForm
) {
  const { sectionIndex } = identifiers
  const precedingDefaultFieldId = getPrecedingDefaultFieldIdAcrossGroups(
    event,
    identifiers,
    defaultForm
  )
  const isFirstSection = !sectionIndex
  if (precedingDefaultFieldId === FieldPosition.TOP && !isFirstSection) {
    const previousSectionIdentifiers = {
      sectionIndex: sectionIndex - 1,
      groupIndex: -1,
      fieldIndex: -1
    }
    const previousSection = getSection(previousSectionIdentifiers, defaultForm)
    const lastGroup = getGroup(
      {
        ...previousSectionIdentifiers,
        groupIndex: previousSection.groups.length - 1
      },
      defaultForm
    )
    return getFieldId(
      event,
      {
        ...previousSectionIdentifiers,
        groupIndex: previousSection.groups.length - 1,
        fieldIndex: lastGroup.fields.length - 1
      },
      defaultForm
    )
  }
  return precedingDefaultFieldId
}

export function getPrecedingDefaultFieldIdAcrossGroups(
  event: Event,
  identifiers: IFieldIdentifiers,
  defaultForm: ISerializedForm
) {
  const { sectionIndex, groupIndex } = identifiers
  const precedingDefaultFieldId = getPrecedingDefaultFieldId(
    event,
    identifiers,
    defaultForm
  )
  const isFirstGroupOfSection = !groupIndex
  if (precedingDefaultFieldId === FieldPosition.TOP && !isFirstGroupOfSection) {
    const previousGroupIdentifiers = {
      sectionIndex,
      groupIndex: groupIndex - 1,
      fieldIndex: -1
    }
    const previousGroup = getGroup(previousGroupIdentifiers, defaultForm)
    return getFieldId(
      event,
      {
        ...previousGroupIdentifiers,
        fieldIndex: previousGroup.fields.length - 1
      },
      defaultForm
    )
  }
  return precedingDefaultFieldId
}

export function getPrecedingDefaultFieldId(
  event: Event,
  identifiers: IFieldIdentifiers,
  defaultForm: ISerializedForm
) {
  const { sectionIndex, groupIndex, fieldIndex } = identifiers
  const isFirstFieldOfGroup = !fieldIndex
  if (isFirstFieldOfGroup) {
    return FieldPosition.TOP
  }
  return getFieldId(
    event,
    { sectionIndex, groupIndex, fieldIndex: fieldIndex - 1 },
    defaultForm
  )
}
