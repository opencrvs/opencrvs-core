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
import { Toggle } from '@opencrvs/components/lib/buttons/Toggle'
import { IntlShape } from 'react-intl'
import { messages } from '@client/i18n/messages/views/formConfig'
import {
  ListViewSimplified,
  ListViewItemSimplified
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'

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

interface IFormTools {
  intl: IntlShape
}

const listViewItems = (intl: IntlShape) => {
  const items = [
    {
      label: intl.formatMessage(messages.textInput),
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: () => {}
    },
    {
      label: intl.formatMessage(messages.textAreaInput),
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: () => {}
    },
    {
      label: intl.formatMessage(messages.numberInput),
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: () => {}
    },
    {
      label: intl.formatMessage(messages.phoneNumberInput),
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: () => {}
    },
    {
      label: intl.formatMessage(messages.heading),
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: () => {}
    },
    {
      label: intl.formatMessage(messages.supportingCopy),
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: () => {}
    }
  ]
  return items
}

export const FormTools = (props: IFormTools) => {
  const [toggleSelected, setToggleSelected] = React.useState(false)

  const toggleOnChange = () => {
    setToggleSelected(!toggleSelected)
  }

  return (
    <>
      <ListViewSimplified>
        <ListViewItemSimplified
          label={
            <Label>{props.intl.formatMessage(messages.showHiddenFields)}</Label>
          }
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
        {props.intl.formatMessage(messages.addInputContent)}
      </TitleContainer>
      <ListViewSimplified>
        {listViewItems(props.intl).map((item, idx) => (
          <ListViewItemSimplified
            key={idx}
            label={<Label key={idx}>{item.label}</Label>}
            actions={[
              <LinkButton key={idx} onClick={item.handler}>
                {item.actionLabel}
              </LinkButton>
            ]}
          />
        ))}
      </ListViewSimplified>
    </>
  )
}
