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

import React from 'react'
import { Box } from '@opencrvs/components/lib/interface'
import { FormConfigElementCard } from '@opencrvs/components/lib/interface/FormConfigElementCard'
import styled from '@client/styledComponents'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { Event, DeathSection, BirthSection } from '@client/forms'
import { FormFieldGenerator } from '@client/components/form/FormFieldGenerator'
import { selectEventSectionFieldsMap } from '@client/forms/configuration/configFields/selectors'
import { IConfigFormField } from '@client/forms/configuration/configFields/utils'

const CanvasBox = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  border-radius: 4px;
`

type IFormFieldMap = Record<string, IConfigFormField>

function generateConfigFields(formFieldMap: IFormFieldMap) {
  const firstField = Object.values(formFieldMap).find(
    (formField) => !formField.precedingFieldId
  )

  if (!firstField) {
    throw new Error(`No field found in section`)
  }

  const configFields: IConfigFormField[] = []
  let currentField: IConfigFormField | null = firstField
  while (currentField) {
    configFields.push(currentField)
    currentField = currentField.foregoingFieldId
      ? formFieldMap[currentField.foregoingFieldId]
      : null
  }
  return configFields
}

type ICanvasProps = {
  event: Event
  selectedField: IConfigFormField | null
  section: BirthSection | DeathSection
  onFieldSelect: (field: IConfigFormField) => void
}

export function Canvas({
  event,
  section,
  selectedField,
  onFieldSelect
}: ICanvasProps) {
  const fieldsMap = useSelector((store: IStoreState) =>
    selectEventSectionFieldsMap(store, event, section)
  )
  const configFields = generateConfigFields(fieldsMap)

  return (
    <CanvasBox>
      {configFields.map((configField) => (
        <FormConfigElementCard
          key={configField.fieldId}
          selected={selectedField?.fieldId === configField.fieldId}
          onClick={() => onFieldSelect(configField)}
        >
          <FormFieldGenerator
            id={configField.fieldId}
            onChange={() => {}}
            fields={[configField.definition]}
            setAllFieldsDirty={false}
          />
        </FormConfigElementCard>
      ))}
    </CanvasBox>
  )
}
