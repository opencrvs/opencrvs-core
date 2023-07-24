import { CountryLogo } from '@opencrvs/components/lib/icons'
import { getOfflineData } from '@client/offline/selectors'
import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { Text } from '@opencrvs/components/lib/Text'
import { messages as reviewMessages } from '@client/i18n/messages/views/review'
import { getLanguages } from '@client/i18n/selectors'
import { ILanguageState } from '@client/i18n/reducer'
import {
  createIntl,
  createIntlCache,
  IntlCache,
  IntlShape,
  MessageDescriptor
} from 'react-intl'
import { IDeclaration } from '@client/declarations'
import { constantsMessages } from '@client/i18n/messages'

interface PrintRecordHeaderProps {
  declaration: IDeclaration
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
function formatMessage(
  intls: IntlShape[],
  descriptor: MessageDescriptor,
  options?: Record<string, string>
) {
  return intls
    .map((intl) => intl.formatMessage(descriptor, options))
    .join(' / ')
}

function createSeparateIntls(languages: ILanguageState, cache: IntlCache) {
  return (window.config.LANGUAGES.split(',') || [])
    .slice(0, 2)
    .reverse()
    .map((locale) =>
      createIntl({ locale, messages: languages[locale].messages }, cache)
    )
}

export function PrintRecordHeader(props: PrintRecordHeaderProps) {
  const offlineData = useSelector(getOfflineData)
  const languages = useSelector(getLanguages)
  const cache = createIntlCache()
  const intls = createSeparateIntls(languages, cache)
  const { declaration } = props

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
