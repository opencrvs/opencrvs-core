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

import {
  IConfigFormField,
  ICustomFieldAttribute
} from '@client/forms/configuration/configFields/utils'
import { DEFAULT_TEXT } from '@client/forms/configuration/default'
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/formConfig'
import { getDefaultLanguage } from '@client/i18n/utils'
import styled from '@client/styledComponents'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { Toggle } from '@opencrvs/components/lib/buttons/Toggle'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import React from 'react'
import { IntlShape, useIntl } from 'react-intl'
import { NUMBER, TEL, TEXT, TEXTAREA } from '@client/forms'

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

interface IFormToolsProps {
  onAddClickListener: (fieldType: string) => void
}

const DEFAULT_CUSTOM_FIELD_ATTRIBUTE: ICustomFieldAttribute = {
  label: [
    {
      lang: getDefaultLanguage(),
      descriptor: DEFAULT_TEXT.label
    }
  ]
}

const customField: IConfigFormField = {
  fieldId: 'customField',
  precedingFieldId: null,
  foregoingFieldId: null,
  required: false,
  enabled: 'enabled',
  custom: true,
  customizedFieldAttributes: DEFAULT_CUSTOM_FIELD_ATTRIBUTE,
  definition: {
    ...DEFAULT_TEXT
  }
}

const listViewItems = (intl: IntlShape) => {
  const items = [
    {
      label: intl.formatMessage(messages.textInput),
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: (dispatchAction: (fieldType: string) => void) => {
        dispatchAction(TEXT)
      }
    },
    {
      label: intl.formatMessage(messages.textAreaInput),
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: (dispatchAction: (fieldType: string) => void) => {
        dispatchAction(TEXTAREA)
      }
    },
    {
      label: intl.formatMessage(messages.numberInput),
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: (dispatchAction: (fieldType: string) => void) => {
        dispatchAction(NUMBER)
      }
    },
    {
      label: intl.formatMessage(messages.phoneNumberInput),
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: (dispatchAction: (fieldType: string) => void) => {
        dispatchAction(TEL)
      }
    },
    {
      label: intl.formatMessage(messages.heading),
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: (dispatchAction: (fieldType: string) => void) => {
        dispatchAction(TEXT)
      }
    },
    {
      label: intl.formatMessage(messages.supportingCopy),
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: (dispatchAction: (fieldType: string) => void) => {
        dispatchAction(TEXT)
      }
    }
  ]
  return items
}

export const FormTools = ({ onAddClickListener }: IFormToolsProps) => {
  const [toggleSelected, setToggleSelected] = React.useState(false)
  const intl = useIntl()

  const toggleOnChange = () => {
    setToggleSelected(!toggleSelected)
  }

  return (
    <>
      <ListViewSimplified>
        <ListViewItemSimplified
          label={<Label>{intl.formatMessage(messages.showHiddenFields)}</Label>}
          actions={[
            <CenteredToggle
              key="toggle"
              selected={toggleSelected}
              onChange={toggleOnChange}
            />
          ]}
        />
      </ListViewSimplified>
      <TitleContainer>
        {intl.formatMessage(messages.addInputContent)}
      </TitleContainer>
      <ListViewSimplified>
        {listViewItems(intl).map((item, idx) => (
          <ListViewItemSimplified
            key={idx}
            label={<Label key={idx}>{item.label}</Label>}
            actions={[
              <LinkButton
                key={idx}
                onClick={() => item.handler(onAddClickListener)}
              >
                {item.actionLabel}
              </LinkButton>
            ]}
          />
        ))}
      </ListViewSimplified>
    </>
  )
}
