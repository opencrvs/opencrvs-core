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
import { FormFieldGenerator } from '@client/components/form/FormFieldGenerator'
import { BirthSection, DeathSection } from '@client/forms'
import { Event } from '@client/utils/gateway'
import { FieldPosition, FieldEnabled } from '@client/forms/configuration'
import {
  removeCustomField,
  shiftConfigFieldDown,
  shiftConfigFieldUp
} from '@client/forms/configuration/formConfig/actions'
import { selectConfigFields } from '@client/forms/configuration/formConfig/selectors'
import {
  IConfigField,
  IConfigFieldMap,
  isDefaultConfigField,
  isPreviewGroupConfigField,
  isCustomConfigField,
  IDefaultConfigField,
  ICustomConfigField
} from '@client/forms/configuration/formConfig/utils'
import { messages } from '@client/i18n/messages/views/formConfig'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import { useFieldDefinition } from '@client/views/SysAdmin/Config/Forms/hooks'
import { FormConfigElementCard } from '@opencrvs/components/lib/interface/FormConfigElementCard'
import React from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import ConfigPlaceholder from './ConfigPlaceholder'

const CanvasBox = styled.div`
  display: flex;
  padding: 16px;
  background: ${({ theme }) => theme.colors.white};
  flex-direction: column;
  gap: 8px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  border-radius: 4px;
`

type IRouteProps = {
  event: Event
  section: BirthSection | DeathSection
}

type ICanvasProps = {
  showHiddenFields: boolean
  selectedField: IConfigField | null
  setSelectedField: React.Dispatch<React.SetStateAction<string | null>>
  ref: React.RefObject<HTMLDivElement>
}

function generateConfigFields(formFieldMap: IConfigFieldMap) {
  const firstField = Object.values(formFieldMap).find(
    (formField) => formField.precedingFieldId === FieldPosition.TOP
  )

  if (!firstField) {
    throw new Error(`No starting field found in section`)
  }

  const configFields: IConfigField[] = []
  let currentField: IConfigField | null = firstField
  while (currentField) {
    configFields.push(currentField)
    currentField = currentField.foregoingFieldId
      ? formFieldMap[currentField.foregoingFieldId]
      : null
  }
  return configFields
}

function useConfigFields() {
  const { event, section } = useParams<IRouteProps>()
  const fieldsMap = useSelector((store: IStoreState) =>
    selectConfigFields(store, event, section)
  )
  return React.useMemo(() => generateConfigFields(fieldsMap), [fieldsMap])
}

function FormField({
  configField
}: {
  configField: IDefaultConfigField | ICustomConfigField
}) {
  const formField = useFieldDefinition(configField)
  const { fieldId } = configField
  return (
    <FormFieldGenerator
      id={fieldId}
      onChange={() => {}}
      fields={[formField]}
      setAllFieldsDirty={false}
    />
  )
}

export const Canvas = React.forwardRef<HTMLDivElement, ICanvasProps>(
  function Canvas({ showHiddenFields, selectedField, setSelectedField }, ref) {
    const dispatch = useDispatch()
    const intl = useIntl()
    const fields = useConfigFields()

    return (
      <CanvasBox ref={ref}>
        {(showHiddenFields
          ? fields
          : fields.filter((configField) =>
              isDefaultConfigField(configField)
                ? configField.enabled !== FieldEnabled.DISABLED
                : true
            )
        ).map((configField) => {
          const { fieldId, precedingFieldId, foregoingFieldId } = configField
          const isCustom = isCustomConfigField(configField)
          const isSelected = selectedField?.fieldId === fieldId
          const isHidden =
            isDefaultConfigField(configField) &&
            configField.enabled === FieldEnabled.DISABLED

          return (
            <FormConfigElementCard
              id={fieldId}
              key={fieldId}
              selected={isSelected}
              onClick={() => setSelectedField(fieldId)}
              movable={isCustom && isSelected}
              status={
                isHidden ? intl.formatMessage(messages.hidden) : undefined
              }
              removable={isCustom}
              isUpDisabled={precedingFieldId === FieldPosition.TOP}
              isDownDisabled={foregoingFieldId === FieldPosition.BOTTOM}
              onMoveUp={() => dispatch(shiftConfigFieldUp(fieldId))}
              onMoveDown={() => dispatch(shiftConfigFieldDown(fieldId))}
              onRemove={() => {
                selectedField &&
                  dispatch(removeCustomField(selectedField.fieldId))
              }}
            >
              {isPreviewGroupConfigField(configField) ? (
                <ConfigPlaceholder label={configField.previewGroupLabel} />
              ) : (
                <FormField configField={configField} />
              )}
            </FormConfigElementCard>
          )
        })}
      </CanvasBox>
    )
  }
)
