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
import { configMessage } from '@client/components/formConfig/FormConfig'
import {
  ListViewSimplified,
  ListViewItemSimplified
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'

const Container = styled.div`
  right: 0px;
  top: 56px;
  width: 348px;
  position: fixed;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 30px;
  height: 100%;
  border-left: 1px solid ${({ theme }) => theme.colors.grey300};
  background-color: ${({ theme }) => theme.colors.white};
`

const TitleContainer = styled.div`
  margin-top: 24px;
  margin-bottom: 15px;
  ${({ theme }) => theme.fonts.subtitleStyle}
`

const Label = styled.div`
  ${({ theme }) => theme.fonts.chartLegendStyle};
  color: ${({ theme }) => theme.colors.grey600};
`
interface IFormTools {
  intl: IntlShape
}

const listViewItems = (intl: IntlShape) => {
  const items = [
    {
      label: intl.formatMessage(configMessage.textInput),
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: () => {}
    },
    {
      label: intl.formatMessage(configMessage.textAreaInput),
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: () => {}
    },
    {
      label: <span>{intl.formatMessage(configMessage.numberInput)}</span>,
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: () => {}
    },
    {
      label: intl.formatMessage(configMessage.phoneNumberInput),
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: () => {}
    },
    {
      label: intl.formatMessage(configMessage.heading),
      actionLabel: intl.formatMessage(buttonMessages.add),
      handler: () => {}
    },
    {
      label: intl.formatMessage(configMessage.supportingCopy),
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
    <Container>
      <ListViewSimplified>
        <ListViewItemSimplified
          label={
            <Label>
              {props.intl.formatMessage(configMessage.showHiddenFields)}
            </Label>
          }
          actions={[
            <Toggle selected={toggleSelected} onChange={toggleOnChange} />
          ]}
        />
      </ListViewSimplified>
      <TitleContainer>
        {props.intl.formatMessage(configMessage.addInputContent)}
      </TitleContainer>
      <ListViewSimplified>
        {listViewItems(props.intl).map((item, idx) => (
          <ListViewItemSimplified
            key={idx}
            label={<Label>{item.label}</Label>}
            actions={[
              <LinkButton key={idx} onClick={item.handler}>
                {item.actionLabel}
              </LinkButton>
            ]}
          />
        ))}
      </ListViewSimplified>
    </Container>
  )
}
