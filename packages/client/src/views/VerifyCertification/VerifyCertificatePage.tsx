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
import { useSelector } from 'react-redux'
import {
  selectApplicationName,
  selectCountryLogo
} from '@client/offline/selectors'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import { Spinner, Stack } from '@opencrvs/components'
import {Toast} from "@opencrvs/components/lib/Toast/Toast";

const Container = styled.div<{ size: string; checking: boolean }>`
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
    ${({ checking }) => !checking && 'background: white;'}
`

const LogoDiv = styled.div`
  margin: 48px 0px;
  flex-direction: row;
  display: flex;
  justify-content: center;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    & svg {
      transform: scale(0.8);
    }
  }
`

const SpaceDiv = styled.div`
  height: 16px;
`

export enum ContentSize {
  LARGE = 'large',
  NORMAL = 'normal'
}

const CheckingContainer = styled.div`
  min-height: 400px;
  flex-direction: col;
  display: flex;
  justify-content: center;
  align-items: center;
`

const SpinnerContainer = styled.div`
  position: relative;
`

const StyledSpinner = styled(Spinner)`
  position: absolute;
  margin-left: -24px;
  margin-top: -24px;
  top: calc(50% - 20px);
  left: 50%;
  width: 30px;
  height: 30px;
`

export function VerifyCertificatePage() {
  const intl = useIntl()

  const logo = useSelector(selectCountryLogo)
  const appName = useSelector(selectApplicationName)

  const [fetchData, setFetchData] = React.useState(true)
  const [closeWindow, setCloseWindow] = React.useState(false)
  const [timeOut, setTimeOut] = React.useState(false)

  React.useEffect(() => {
    setTimeout(() => {
      setFetchData(false)
    }, 2000)

    setTimeout(() => {
      setCloseWindow(true)
    }, 6000) // 60000 is correct value

    setTimeout(() => {
      setCloseWindow(false)
      setTimeOut(true)
    }, 8000) // 600000 is correct value
  }, [])

  const closeWindowAction = () => {
    const blank = window.open('about:blank', '_self')
    // @ts-ignore
    blank.close()
  }

  return (
    <Frame
      header={<AppBar mobileTitle={appName} desktopTitle={appName} />}
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <Container size={ContentSize.NORMAL} checking={fetchData}>
        <LogoDiv>
          <CountryLogo src={logo} />
        </LogoDiv>
        {fetchData || timeOut ? (
          <CheckingContainer>
            <Stack alignItems="center" direction="column">
              <SpaceDiv />
              {fetchData && (
                <>
                  <SpinnerContainer>
                    <StyledSpinner id="appSpinner" />
                  </SpinnerContainer>
                  <Text variant={'reg16'} element={'h4'}>
                    Verifying certificate
                  </Text>
                </>
              )}

              {timeOut && (
                <>
                  <Text variant={'reg16'} element={'h4'}>
                    You been timed out
                  </Text>
                </>
              )}
              <SpaceDiv />
            </Stack>
          </CheckingContainer>
        ) : (
          <>
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
          </>
        )}
      </Container>
      {closeWindow && (
        <Toast type={'info'} onClose={closeWindowAction} duration={null}>
          After verifying the certificate, please close the browser window
        </Toast>
      )}
    </Frame>
  )
}
