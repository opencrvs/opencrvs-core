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
import { connect } from 'react-redux'
import { IStoreState } from '@client/store'
import { getRegisterFormSection } from '@client/forms/register/declaration-selectors'
import { Event, BirthSection, IFormSection, IFormField } from '@client/forms'
import { FormFieldGenerator } from '@client/components/form/FormFieldGenerator'

/* Further refactoring will be needed when merging with #2740 */

const CanvasBox = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 689px;
  margin: 0 auto;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  border-radius: 4px;
`

type ICanvasProps = ReturnType<typeof mapStateToProps>

type IConfigFormField = {
  fieldId: string
  precedingFieldId: string | null
  foregoingFieldId: string | null
  required: boolean
  enabled: boolean
  custom: boolean
  definition: IFormField
}

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

function useConfigFieldsMap(event: Event, section: IFormSection) {
  const formFieldMap = React.useMemo(() => {
    let precedingFieldId: string | null = null
    return section.groups.reduce<IFormFieldMap>(
      (groupFieldMap, group) =>
        group.fields.reduce((fieldMap, field) => {
          const fieldId = [event.toLowerCase(), group.id, field.name].join('.')
          /* We need to build the field regardless of the conditionals */
          delete field.conditionals
          fieldMap[fieldId] = {
            fieldId,
            precedingFieldId: precedingFieldId ? precedingFieldId : null,
            foregoingFieldId: null,
            required: field.required || false,
            enabled: true,
            custom: field.custom || false,
            definition: field
          }
          if (precedingFieldId) {
            fieldMap[precedingFieldId].foregoingFieldId = fieldId
          }
          precedingFieldId = fieldId
          return fieldMap
        }, groupFieldMap),
      {}
    )
  }, [event, section])
  return formFieldMap
}

export function CanvasView({ event, section }: ICanvasProps) {
  const configFieldsMap = useConfigFieldsMap(event, section)
  const configFields = generateConfigFields(configFieldsMap)
  return (
    <CanvasBox>
      {configFields.map((configField) => (
        <FormConfigElementCard key={configField.fieldId}>
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

function mapStateToProps(store: IStoreState) {
  return {
    event: Event.BIRTH,
    section: getRegisterFormSection(store, BirthSection.Mother, Event.BIRTH)
  }
}

export const Canvas = connect(mapStateToProps)(CanvasView)
