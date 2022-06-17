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
import styled from '@client/styledComponents'
import {
  ListViewSimplified,
  ListViewItemSimplified
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import { messages } from '@client/i18n/messages/views/formConfig'
import { useIntl } from 'react-intl'
import {
  getContentKeys,
  getCertificateHandlebar,
  IDefaultConfigField,
  IPreviewGroupConfigField,
  getFirstFieldOfPreviewGroup,
  isDefaultConfigField,
  getFieldDefinition
} from '@client/forms/configuration/formConfig/utils'
import { useDispatch } from 'react-redux'
import { fieldTypeLabel } from '@client/forms'
import { FieldEnabled } from '@client/forms/configuration'
import { modifyConfigField } from '@client/forms/configuration/formConfig/actions'
import {
  Title,
  Label,
  CenteredToggle,
  RequiredToggleAction,
  ToolTip
} from './components'
import { useDefaultForm } from '@client/views/SysAdmin/Config/Forms/hooks'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Subtitle = styled.span`
  ${({ theme }) => theme.fonts.bold14}
  display: flex;
  align-items: center;
  gap: 4px;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
`

const HandleBar = styled.div`
  display: flex;
  flex-direction: column;
`

const Body = styled.span`
  ${({ theme }) => theme.fonts.reg14}
  color: ${({ theme }) => theme.colors.grey500};
  text-overflow: ellipsis;
  overflow: hidden;
`

function HideToggleAction({ fieldId, enabled }: IDefaultConfigField) {
  const dispatch = useDispatch()

  return (
    <CenteredToggle
      id={`${fieldId}_hide`}
      defaultChecked={enabled === FieldEnabled.DISABLED}
      onChange={() =>
        dispatch(
          modifyConfigField(fieldId, {
            enabled:
              enabled === FieldEnabled.DISABLED ? '' : FieldEnabled.DISABLED
          })
        )
      }
    />
  )
}

export function DefaultFieldTools({
  configField
}: {
  configField: IDefaultConfigField | IPreviewGroupConfigField
}) {
  const intl = useIntl()
  const defaultForm = useDefaultForm()
  const formField = isDefaultConfigField(configField)
    ? getFieldDefinition(configField, defaultForm)
    : getFieldDefinition(getFirstFieldOfPreviewGroup(configField), defaultForm)
  const handleBar = getCertificateHandlebar(formField)
  const contentKeys = getContentKeys(configField, defaultForm)
  const fieldType = fieldTypeLabel(formField.type)

  return (
    <Container>
      <Title>{intl.formatMessage(fieldType)}</Title>
      {isDefaultConfigField(configField) && formField.customisable && (
        <ListViewSimplified bottomBorder>
          <ListViewItemSimplified
            label={<Label>{intl.formatMessage(messages.hideField)}</Label>}
            actions={<HideToggleAction {...configField} />}
          />
          <ListViewItemSimplified
            label={
              <Label>
                {intl.formatMessage(messages.requiredForRegistration)}
                <ToolTip
                  label={intl.formatMessage(
                    messages.requiredForRegistrationTooltip
                  )}
                  id={'required-for-registration'}
                />
              </Label>
            }
            actions={<RequiredToggleAction {...configField} />}
          />
        </ListViewSimplified>
      )}

      <Content>
        <Subtitle>
          {intl.formatMessage(messages.contentKey)}
          <ToolTip
            label={intl.formatMessage(messages.contentKeyTooltip)}
            id={'content-key'}
          />
        </Subtitle>
        {contentKeys.map((content, index) => (
          <Body key={index}>{content}</Body>
        ))}
      </Content>

      {handleBar && (
        <HandleBar>
          <Subtitle>
            {intl.formatMessage(messages.certificateHandlebars)}
            <ToolTip
              label={intl.formatMessage(messages.certHandelbarsTooltip)}
              id={'cert-handelbars'}
            />
          </Subtitle>
          <Body>{`{{ ${handleBar} }}`}</Body>
        </HandleBar>
      )}
    </Container>
  )
}
