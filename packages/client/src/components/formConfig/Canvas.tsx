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
import { BirthSection, DeathSection, Event, IFormSection } from '@client/forms'
import { FieldPosition } from '@client/forms/configuration'
import { PlaceholderPreviewGroups } from '@client/forms/configuration/default'
import { FieldEnabled } from '@client/forms/configuration/defaultUtils'
import {
  removeCustomField,
  shiftConfigFieldDown,
  shiftConfigFieldUp
} from '@client/forms/configuration/formConfig/actions'
import {
  selectConfigFields,
  selectConfigRegisterForm
} from '@client/forms/configuration/formConfig/selectors'
import {
  generateKeyFromObj,
  getFieldDefinition,
  IConfigField,
  IConfigFieldMap
} from '@client/forms/configuration/formConfig/utils'
import { messages } from '@client/i18n/messages/views/formConfig'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import { useFieldDefinition } from '@client/views/SysAdmin/Config/Forms/hooks'
import { Box } from '@opencrvs/components/lib/interface'
import { FormConfigElementCard } from '@opencrvs/components/lib/interface/FormConfigElementCard'
import React from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import ConfigPlaceholder from './ConfigPlaceholder'

const CanvasBox = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  border-radius: 4px;
`

function preparePlaceholderConfigAndVerify(
  formSection: IFormSection,
  currentField: IConfigField,
  fields: IConfigField[]
) {
  const field = getFieldDefinition(formSection, currentField)

  if (
    field.customisable === true ||
    !field.previewGroup ||
    !PlaceholderPreviewGroups.includes(field.previewGroup)
  ) {
    return true
  }

  if (field.customisable === false && field.previewGroup) {
    const previewGroup = formSection.groups.map((group) =>
      group.previewGroups?.find(
        (previewGroup) => previewGroup.id === field.previewGroup
      )
    )[0]
    if (previewGroup) {
      currentField.previewGroupID = previewGroup.id
      currentField.previewGroupLabel = previewGroup.label
    }
  }

  return !fields.find(
    (tempField) =>
      tempField.previewGroupID === currentField.previewGroupID &&
      field.customisable === false
  )
}

function generateConfigFields(
  formFieldMap: IConfigFieldMap,
  formSection: IFormSection
) {
  const firstField = Object.values(formFieldMap).find(
    (formField) => formField.preceedingFieldId === FieldPosition.TOP
  )

  if (!firstField) {
    throw new Error(`No starting field found in section`)
  }

  const configFields: IConfigField[] = []
  let currentField: IConfigField | null = firstField
  while (currentField) {
    if (
      preparePlaceholderConfigAndVerify(formSection, currentField, configFields)
    ) {
      configFields.push(currentField)
    }
    currentField = currentField.foregoingFieldId
      ? formFieldMap[currentField.foregoingFieldId]
      : null
  }
  return configFields
}

type IRouteProps = {
  event: Event
  section: BirthSection | DeathSection
}

type ICanvasProps = {
  showHiddenFields: boolean
  selectedField: IConfigField | null
  setSelectedField: React.Dispatch<React.SetStateAction<string | null>>
}

function FormField({ configField }: { configField: IConfigField }) {
  const formField = useFieldDefinition(configField)
  const { fieldId } = configField
  return (
    <FormFieldGenerator
      key={generateKeyFromObj(configField)}
      id={fieldId}
      onChange={() => {}}
      fields={[formField]}
      setAllFieldsDirty={false}
    />
  )
}

export function Canvas({
  showHiddenFields,
  selectedField,
  setSelectedField
}: ICanvasProps) {
  const { event, section } = useParams<IRouteProps>()
  const dispatch = useDispatch()
  const intl = useIntl()
  const fieldsMap = useSelector((store: IStoreState) =>
    selectConfigFields(store, event, section)
  )
  const form = useSelector((store: IStoreState) =>
    selectConfigRegisterForm(store, event)
  )
  const formSection = form.sections.find((sec) => sec.id === section)

  if (!formSection) {
    throw Error('No valid section found')
  }

  const configFields = generateConfigFields(fieldsMap, formSection)
  return (
    <CanvasBox>
      {(showHiddenFields
        ? configFields
        : configFields.filter(
            ({ enabled }) => enabled !== FieldEnabled.DISABLED
          )
      ).map((configField) => {
        const {
          fieldId,
          preceedingFieldId,
          foregoingFieldId,
          enabled,
          custom
        } = configField
        const isSelected = selectedField?.fieldId === fieldId
        const isHidden = !custom && enabled === FieldEnabled.DISABLED

        return (
          <FormConfigElementCard
            id={fieldId}
            key={fieldId}
            selected={isSelected}
            onClick={() => setSelectedField(fieldId)}
            movable={custom && isSelected}
            status={isHidden ? intl.formatMessage(messages.hidden) : undefined}
            removable={custom}
            isUpDisabled={preceedingFieldId === FieldPosition.TOP}
            isDownDisabled={foregoingFieldId === FieldPosition.BOTTOM}
            onMoveUp={() => dispatch(shiftConfigFieldUp(fieldId))}
            onMoveDown={() => dispatch(shiftConfigFieldDown(fieldId))}
            onRemove={() => {
              selectedField &&
                dispatch(removeCustomField(selectedField.fieldId))
            }}
          >
            {configField.previewGroupLabel && (
              <ConfigPlaceholder label={configField.previewGroupLabel} />
            )}

            {!configField.previewGroupLabel && (
              <FormField configField={configField} />
            )}
          </FormConfigElementCard>
        )
      })}
    </CanvasBox>
  )
}
