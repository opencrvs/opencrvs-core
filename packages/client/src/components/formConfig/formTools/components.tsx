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
import { previewSectionFilter } from '@client/components/formConfig/SectionNavigation'
import { BirthSection, DeathSection } from '@client/forms'
import { getFieldId } from '@client/forms/configuration/defaultUtils'
import { modifyConfigField } from '@client/forms/configuration/formConfig/actions'
import {
  ICustomConfigField,
  IDefaultConfigField
} from '@client/forms/configuration/formConfig/utils'
import { IConditionalConfig } from '@client/forms/questionConfig'
import { formSectionToFieldIdentifiers } from '@client/forms/questionConfig/transformers'
import styled from '@client/styledComponents'
import { Event } from '@client/utils/gateway'
import { useDefaultForm } from '@client/views/SysAdmin/Config/Forms/hooks'
import { Tooltip } from '@opencrvs/components/lib/icons'
import { Toggle } from '@opencrvs/components/lib/Toggle'
import React from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router'
import ReactTooltip from 'react-tooltip'

export const Title = styled.h3`
  margin: 0;
  ${({ theme }) => theme.fonts.h3}
`

export const Label = styled.span`
  ${({ theme }) => theme.fonts.reg14}
  color: ${({ theme }) => theme.colors.grey600};
  display: flex;
  align-items: center;
  gap: 4px;
`

export const CenteredToggle = styled(Toggle)`
  align-self: center;
`

export const StyledTooltip = styled(Tooltip)`
  height: 16px;
  width: 16px;
`

const TooltipContainer = styled.div`
  .tooltip {
    opacity: 1 !important;
    width: 248px;
    text-align: center;
    ::after {
      display: none;
    }
  }
`

export function RequiredToggleAction({
  fieldId,
  required
}: IDefaultConfigField | ICustomConfigField) {
  const dispatch = useDispatch()

  return (
    <CenteredToggle
      id={'required-toggle-button'}
      defaultChecked={!!required}
      onChange={() =>
        dispatch(
          modifyConfigField(fieldId, {
            required: !required
          })
        )
      }
    />
  )
}

export function ConditionalToggleAction({
  fieldId,
  conditionals,
  initConditionals
}: ICustomConfigField & { initConditionals: IConditionalConfig[] }) {
  const dispatch = useDispatch()
  return (
    <CenteredToggle
      id={'conditional-toggle-button'}
      defaultChecked={!!conditionals}
      onChange={() =>
        dispatch(
          modifyConfigField(fieldId, {
            conditionals: conditionals ? undefined : initConditionals
          })
        )
      }
    />
  )
}

export const ToolTip = ({ label, id }: { label: string; id: string }) => {
  return (
    <TooltipContainer>
      <StyledTooltip data-tip data-for={id} />
      <ReactTooltip id={id} place="top" effect="solid" className="tooltip">
        {label}
      </ReactTooltip>
    </TooltipContainer>
  )
}

export const RegisterFormFieldIds = ({
  children
}: {
  children: (fieldIds: string[]) => JSX.Element
}) => {
  const defaultForm = useDefaultForm()
  const { event } = useParams<{ event: Event }>()
  const sections = Object.values<BirthSection | DeathSection>(
    event === Event.Birth ? BirthSection : DeathSection
  )

  const fieldIds = sections
    .filter(previewSectionFilter)
    .flatMap((section) => formSectionToFieldIdentifiers(defaultForm, section))
    .map((identifier) => getFieldId(event, identifier, defaultForm))

  const filteredFieldIds = fieldIds.filter((fieldId) => {
    if (!fieldId.includes('seperator')) {
      return true
    }
    return false
  })

  return children(filteredFieldIds)
}
