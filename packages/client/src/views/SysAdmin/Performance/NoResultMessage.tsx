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
import { messages } from '@client/i18n/messages/views/performance'
import styled from '@client/styledComponents'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'

const StyledHeader = styled.h5`
  color: ${({ theme }) => theme.colors.menuBackground};
  ${({ theme }) => theme.fonts.h5Style};
  margin: 16px 0;
`
const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0;
`
const StyledText = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  ${({ theme }) => theme.fonts.bodyStyle};
  margin-bottom: 10px;
`

interface NoResultMessageProps {
  id?: string
  searchedLocation: string
}

type Props = NoResultMessageProps & WrappedComponentProps

type State = {}

class NoResultMessageComponent extends React.Component<Props, State> {
  render() {
    const { id, intl, searchedLocation } = this.props
    return (
      <MessageContainer>
        <StyledHeader id={`noResults-${id}`}>
          {intl.formatMessage(messages.noResultForLocation, {
            searchedLocation
          })}
        </StyledHeader>
        <StyledText>Bhurungamari Upazila</StyledText>
        <StyledText>Narsingdi Upazila</StyledText>
      </MessageContainer>
    )
  }
}

export const NoResultMessage = injectIntl(NoResultMessageComponent)
