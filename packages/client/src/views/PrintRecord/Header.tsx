/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { CountryLogo } from '@opencrvs/components/lib/icons'
import React from 'react'
import styled from 'styled-components'
import { Text } from '@opencrvs/components/lib/Text'
import { colors } from '@opencrvs/components/lib'

interface PrintRecordHeaderProps {
  logoSrc: React.ImgHTMLAttributes<HTMLImageElement>['src']
  title: string
  heading: string
  subject: string
  info?: { label: string; value: string }
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

const SubheaderText = styled(CapitalText)<{ color: keyof typeof colors }>`
  color: ${({ theme, color }) => theme.colors[color] || theme.colors.copy};
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
  const { logoSrc, title, heading, subject, info } = props

  return (
    <Container>
      <StyledCountryLogo src={logoSrc} />
      <TextContainer>
        <CapitalText variant="bold12" element="span">
          {title}
        </CapitalText>
        <Text variant="bold18" element="span">
          {heading}
        </Text>
        <SubheaderText variant="bold12" element="span" color="grey600">
          {subject}
        </SubheaderText>
      </TextContainer>
      {info && (
        <Box>
          <Text variant="bold12" element="span">
            <>
              {info.label}
              <br />
              {info.value}
            </>
          </Text>
        </Box>
      )}
    </Container>
  )
}
