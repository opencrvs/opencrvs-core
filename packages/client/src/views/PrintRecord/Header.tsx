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
import { CountryLogo } from '@opencrvs/components/lib/icons'
import { getOfflineData } from '@client/offline/selectors'
import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { Text } from '@opencrvs/components/lib/Text'
import { messages as reviewMessages } from '@client/i18n/messages/views/review'
import { IntlShape } from 'react-intl'
import { IDeclaration } from '@client/declarations'
import { constantsMessages } from '@client/i18n/messages'
import { formatMessage } from '@client/views/PrintRecord/utils'
import { printRecordMessages } from '@client/i18n/messages/views/printRecord'

interface PrintRecordHeaderProps {
  declaration: IDeclaration
  intls: IntlShape[]
}

const Container = styled.div`
  display: flex;
  align-items: center;
`
const TextContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`

const CapitalText = styled(Text)`
  text-transform: uppercase;
`

const SubheaderText = styled(CapitalText)`
  color: ${({ theme }) => theme.colors.subheaderCopy};
`
const StyledCountryLogo = styled(CountryLogo)`
  height: 48px;
  width: 48px;
  margin-right: 16px;
`

const Box = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.copy};
  border-radius: 4px;
  padding: 4px 8px;
`

export function PrintRecordHeader(props: PrintRecordHeaderProps) {
  const offlineData = useSelector(getOfflineData)
  const { declaration, intls } = props

  return (
    <Container>
      <StyledCountryLogo src={offlineData.config.COUNTRY_LOGO.file} />
      <TextContainer>
        <CapitalText variant="bold12" element="span">
          {formatMessage(intls, reviewMessages.govtName)}
        </CapitalText>
        <Text variant="bold18" element="span">
          {formatMessage(intls, printRecordMessages.civilRegistrationCentre)}
        </Text>
        <SubheaderText variant="bold12" element="span">
          {formatMessage(intls, reviewMessages.headerSubjectWithoutName, {
            eventType: props.declaration.event
          })}
        </SubheaderText>
      </TextContainer>
      {declaration.data?.registration?.trackingId && (
        <Box>
          <Text variant="bold12" element="span">
            <>
              {formatMessage(intls, constantsMessages.trackingId)}
              <br />
              {declaration.data.registration.trackingId}
            </>
          </Text>
        </Box>
      )}
    </Container>
  )
}
