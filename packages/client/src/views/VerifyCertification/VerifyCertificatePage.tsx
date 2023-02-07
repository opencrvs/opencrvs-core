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
import * as React from 'react'
import { useIntl } from 'react-intl'
import {
  constantsMessages,
  userMessages as messages
} from '@client/i18n/messages'

import { Box } from '@opencrvs/components/lib/Box'
import { Frame } from '@opencrvs/components/lib/Frame'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Alert } from '@opencrvs/components/lib/Alert'
import { Text } from '@opencrvs/components/lib/Text'
import { Icon } from '@opencrvs/components/lib/Icon'
import styled from 'styled-components'
import {
  ListViewSimplified,
  ListViewItemSimplified
} from '@opencrvs/components/lib/ListViewSimplified'

const Container = styled.div<{ size: string }>`
  position: relative;
  margin: 24px auto;
  max-width: min(
    ${({ size }) => (size === 'large' ? '1140px' : '778px')},
    100% - 24px - 24px
  );
  box-sizing: border-box;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 0;
    border: 0;
    border-radius: 0;
    max-width: 100%;
    padding: 16px;
    background: white;
  }
`

const LogoDiv = styled.div`
  margin: 40px 0px;
`

const SpaceDiv = styled.div`
  height: 16px;
`

export enum ContentSize {
  LARGE = 'large',
  NORMAL = 'normal'
}

export function VerifyCertificatePage() {
  const intl = useIntl()

  return (
    <Frame
      header={
        <AppBar mobileTitle="Cameroon CRVS" desktopTitle="Cameroon CRVS" />
      }
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <Container size={ContentSize.NORMAL}>
        <LogoDiv>LOGO HERE</LogoDiv>
        <Alert type="success">
          <Text variant={'bold16'} element={'span'} color={'greenDark'}>
            Valid QR code
          </Text>{' '}
          <br />
          <Text variant={'reg16'} element={'span'} color={'greenDark'}>
            Compare the partial details of the record below against those
            recorded on the certificate
          </Text>
        </Alert>
        <SpaceDiv />
        <Alert type="success" customIcon={<Icon name={'Lock'} />}>
          <Text variant={'bold16'} element={'span'} color={'greenDark'}>
            URL Vérification
          </Text>{' '}
          <br />
          <Text variant={'reg16'} element={'span'} color={'greenDark'}>
            https://www.opencrvs-core.com
          </Text>
        </Alert>
        <SpaceDiv />
        <Alert onActionClick={() => {}} type="error">
          <Text variant={'bold16'} element={'span'} color={'redDark'}>
            Invalid QR code
          </Text>{' '}
          <br />
          <Text variant={'reg16'} element={'span'} color={'redDark'}>
            The certificate is a potential forgery please...
          </Text>
        </Alert>
        <SpaceDiv />
        <Box>
          <ListViewSimplified rowHeight={'small'}>
            <ListViewItemSimplified
              label={
                <Text variant={'bold16'} element={'span'}>
                  Item 1
                </Text>
              }
              value={
                <Text variant={'reg16'} element={'span'}>
                  Item 1
                </Text>
              }
            />
            <ListViewItemSimplified
              label={
                <Text variant={'bold16'} element={'span'}>
                  Item 2
                </Text>
              }
              value={
                <Text variant={'reg16'} element={'span'}>
                  Item 2
                </Text>
              }
            />
          </ListViewSimplified>
        </Box>
      </Container>
    </Frame>
  )
}
