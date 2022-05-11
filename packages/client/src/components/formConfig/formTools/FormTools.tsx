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

import { QuestionConfigFieldType, Event } from '@client/forms'
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/formConfig'
import styled from '@client/styledComponents'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { Toggle } from '@opencrvs/components/lib/buttons/Toggle'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import React from 'react'
import { useIntl, MessageDescriptor } from 'react-intl'
import { prepareNewCustomFieldConfig } from '@client/forms/configuration/formConfig/utils'
import { useSelector, useDispatch } from 'react-redux'
import { IStoreState } from '@client/store'
import { selectConfigFields } from '@client/forms/configuration/formConfig/selectors'
import { useParams } from 'react-router'
import { addCustomField } from '@client/forms/configuration/formConfig/actions'
import { flushSync } from 'react-dom'

const TitleContainer = styled.div`
  margin-top: 24px;
  margin-bottom: 15px;
  ${({ theme }) => theme.fonts.bold14}
`

const Label = styled.span`
  ${({ theme }) => theme.fonts.reg14};
  color: ${({ theme }) => theme.colors.grey600};
`

const CenteredToggle = styled(Toggle)`
  align-self: center;
`

const MESSAGE_MAP: Record<QuestionConfigFieldType, MessageDescriptor> = {
  [QuestionConfigFieldType.TEXT]: messages.textInput,
  [QuestionConfigFieldType.TEL]: messages.phoneNumberInput,
  [QuestionConfigFieldType.NUMBER]: messages.numberInput,
  [QuestionConfigFieldType.TEXTAREA]: messages.textAreaInput,
  /* TODO */
  [QuestionConfigFieldType.SUBSECTION]: messages.supportingCopy,
  [QuestionConfigFieldType.PARAGRAPH]: messages.heading
}

type IRouteProps = {
  event: Event
  section: string
}

type IFormToolsProps = {
  groupId: string
  showHiddenFields: boolean
  setShowHiddenFields: React.Dispatch<React.SetStateAction<boolean>>
  setSelectedField: React.Dispatch<React.SetStateAction<string | null>>
}

export const FormTools = ({
  showHiddenFields,
  groupId,
  setShowHiddenFields,
  setSelectedField
}: IFormToolsProps) => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const { event, section } = useParams<IRouteProps>()
  const fieldsMap = useSelector((store: IStoreState) =>
    selectConfigFields(store, event, section)
  )

  const toggleShowHiddenFields = () => setShowHiddenFields((prev) => !prev)

  const createCustomField = (fieldType: QuestionConfigFieldType) => {
    const customConfigField = prepareNewCustomFieldConfig(
      fieldsMap,
      event,
      section,
      groupId,
      fieldType
    )
    dispatch(addCustomField(event, section, customConfigField))
    flushSync(() => setSelectedField(customConfigField.fieldId))
    document
      .getElementById(customConfigField.fieldId)
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <ListViewSimplified>
        <ListViewItemSimplified
          label={<Label>{intl.formatMessage(messages.showHiddenFields)}</Label>}
          actions={
            <CenteredToggle
              defaultChecked={showHiddenFields}
              onChange={toggleShowHiddenFields}
            />
          }
        />
      </ListViewSimplified>
      <TitleContainer>
        {intl.formatMessage(messages.addInputContent)}
      </TitleContainer>
      <ListViewSimplified>
        {Object.values(QuestionConfigFieldType).map((fieldType) => (
          <ListViewItemSimplified
            key={fieldType}
            label={<Label>{intl.formatMessage(MESSAGE_MAP[fieldType])}</Label>}
            actions={
              <LinkButton
                onClick={() => createCustomField(fieldType)}
                size="small"
                /* TODO */
                disabled={
                  fieldType === QuestionConfigFieldType.PARAGRAPH ||
                  fieldType === QuestionConfigFieldType.SUBSECTION
                }
              >
                {intl.formatMessage(buttonMessages.add)}
              </LinkButton>
            }
          />
        ))}
      </ListViewSimplified>
    </>
  )
}
