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
import { useSelector, useDispatch } from 'react-redux'
import { IStoreState } from '@client/store'
import { FormFieldGenerator } from '@client/components/form/FormFieldGenerator'
import { selectConfigFields } from '@client/forms/configuration/configFields/selectors'
import {
  IConfigField,
  IConfigFieldMap,
  getFieldDefinition
} from '@client/forms/configuration/configFields/utils'
import { getRegisterFormSection } from '@client/forms/register/declaration-selectors'
import { FieldPosition } from '@client/forms/configuration'
import { useParams } from 'react-router'
import { BirthSection, DeathSection, Event } from '@client/forms'
import {
  shiftConfigFieldUp,
  shiftConfigFieldDown
} from '@client/forms/configuration/configFields/actions'
import { FieldEnabled } from '@client/forms/configuration/defaultUtils'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/formConfig'

const CanvasBox = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  border-radius: 4px;
`

function generateConfigFields(formFieldMap: IConfigFieldMap) {
  const firstField = Object.values(formFieldMap).find(
    (formField) => formField.preceedingFieldId === FieldPosition.TOP
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

type IRouteProps = {
  event: Event
  section: BirthSection | DeathSection
}

type ICanvasProps = {
  showHiddenFields: boolean
  selectedField: IConfigField | null
  setSelectedField: React.Dispatch<React.SetStateAction<string | null>>
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
  const formSection = useSelector((store: IStoreState) =>
    getRegisterFormSection(store, section, event)
  )
  const configFields = generateConfigFields(fieldsMap)

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
            key={fieldId}
            selected={isSelected}
            onClick={() => setSelectedField(fieldId)}
            movable={isSelected}
            status={isHidden ? intl.formatMessage(messages.hidden) : undefined}
            isUpDisabled={preceedingFieldId === FieldPosition.TOP}
            isDownDisabled={foregoingFieldId === FieldPosition.BOTTOM}
            onMoveUp={() => dispatch(shiftConfigFieldUp(fieldId))}
            onMoveDown={() => dispatch(shiftConfigFieldDown(fieldId))}
          >
            <FormFieldGenerator
              id={fieldId}
              onChange={() => {}}
              fields={[getFieldDefinition(formSection, configField)]}
              setAllFieldsDirty={false}
            />
          </FormConfigElementCard>
        )
      })}
    </CanvasBox>
  )
}
