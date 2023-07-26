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
import { formatMessage } from './utils'

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
  margin-right: 8px;
`

const Box = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.copy};
  border-radius: 4px;
  padding: 8px;
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
        <Text variant="h2" element="span">
          {formatMessage(intls, reviewMessages.civilRegistrationCentre)}
        </Text>
        <SubheaderText variant="bold12" element="span">
          {formatMessage(intls, reviewMessages.headerSubjectWithoutName, {
            eventType: props.declaration.event
          })}
        </SubheaderText>
      </TextContainer>
      {declaration.trackingId && (
        <Box>
          <Text variant="bold12" element="span">
            {formatMessage(intls, constantsMessages.trackingId)}
            <br />
            {declaration.trackingId}
          </Text>
        </Box>
      )}
    </Container>
  )
}
