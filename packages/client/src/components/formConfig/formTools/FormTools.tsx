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
import { ListView, IListRowProps } from '@opencrvs/components/lib/interface'
import { Toggle } from '@opencrvs/components/lib/buttons/Toggle'
import { IntlShape } from 'react-intl'
import { configMessage } from '@client/components/formConfig/FormConfig'

const Container = styled.div`
  right: 0px;
  top: 56px;
  width: 348px;
  position: fixed;
  padding-left: 24px;
  padding-right: 24px;
  height: 100%;
  border-left: 1px solid ${({ theme }) => theme.colors.grey300};
  background-color: ${({ theme }) => theme.colors.white};
`

const TopListViewContainer = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
`

interface IFormTools {
  intl: IntlShape
}

const getTopListViewItems = (
  intl: IntlShape,
  selected: boolean,
  onChange: () => void
) => {
  const items: IListRowProps[] = [
    {
      label: intl.formatMessage(configMessage.showHiddenFields),
      actionsMenu: <Toggle selected={selected} onChange={onChange} />
    }
  ]
  return items
}

const getSecondListViewProps = (intl: IntlShape) => {
  const items: IListRowProps[] = [
    {
      label: intl.formatMessage(configMessage.textInput),
      action: {
        label: intl.formatMessage(configMessage.add)
      }
    },
    {
      label: intl.formatMessage(configMessage.textAreaInput),
      action: {
        label: intl.formatMessage(configMessage.add)
      }
    },
    {
      label: <span>{intl.formatMessage(configMessage.numberInput)}</span>,
      action: {
        label: intl.formatMessage(configMessage.add)
      }
    },
    {
      label: intl.formatMessage(configMessage.phoneNumberInput),
      action: {
        label: intl.formatMessage(configMessage.add)
      }
    },
    {
      label: intl.formatMessage(configMessage.heading),
      action: {
        label: intl.formatMessage(configMessage.add)
      }
    },
    {
      label: intl.formatMessage(configMessage.supportingCopy),
      action: {
        label: intl.formatMessage(configMessage.add)
      }
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
      {/* <TopListViewContainer> */}
      <ListView
        items={getTopListViewItems(props.intl, toggleSelected, toggleOnChange)}
      />
      {/* </TopListViewContainer> */}

      <ListView
        title={props.intl.formatMessage(configMessage.addInputContent)}
        items={getSecondListViewProps(props.intl)}
      />
    </Container>
  )
}
