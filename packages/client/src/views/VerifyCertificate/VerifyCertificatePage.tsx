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
import * as React from 'react'
import { useIntl } from 'react-intl'
import { constantsMessages, countryMessages } from '@client/i18n/messages'
import { Button } from '@opencrvs/components/lib/Button'
import { messageToDefine } from '@client/i18n/messages/views/verifyCertificate'
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
import { useDispatch, useSelector } from 'react-redux'
import {
  getOfflineData,
  selectApplicationName,
  selectCountryLogo
} from '@client/offline/selectors'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import { Spinner, Stack } from '@opencrvs/components'
import { Toast } from '@opencrvs/components/lib/Toast/Toast'
import { useParams } from 'react-router'
import formatDate from '@client/utils/date-formatting'
import {
  BirthRegistration,
  DeathRegistration,
  History,
  RecordDetails,
  RegistrationType,
  RegStatus
} from '@client/utils/gateway'
import { useTimeout } from '@client/hooks/useTimeout'
import { goToHome } from '@client/navigation'
import { EMPTY_STRING } from '@client/utils/constants'
import { compact } from 'lodash'
import { useVerificationRecordDetails } from './useVerificationRecordDetails'

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
  }
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

enum ContentSize {
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

const LoadingState = () => {
  const intl = useIntl()
  return (
    <CheckingContainer>
      <Stack alignItems="center" direction="column">
        <SpaceDiv />
        <SpinnerContainer>
          <StyledSpinner id="appSpinner" />
        </SpinnerContainer>
        <Text variant={'reg16'} element={'h4'}>
          {intl.formatMessage(messageToDefine.loadingState)}
        </Text>
      </Stack>
    </CheckingContainer>
  )
}

const ErrorState = () => {
  const intl = useIntl()
  return (
    <>
      <Alert onActionClick={() => {}} type="error">
        <Text variant={'bold16'} element={'span'} color={'redDark'}>
          {intl.formatMessage(messageToDefine.errorAlertTitle)}
        </Text>{' '}
        <br />
        <Text variant={'reg16'} element={'span'} color={'redDark'}>
          {intl.formatMessage(messageToDefine.errorAlertMessage)}
        </Text>
      </Alert>
    </>
  )
}

const TimeOutState = () => {
  const intl = useIntl()
  return (
    <>
      <CheckingContainer>
        <Stack alignItems="center" direction="column">
          <SpaceDiv />
          <Text variant={'reg16'} element={'h4'}>
            {intl.formatMessage(messageToDefine.timeOutState)}
          </Text>
          <SpaceDiv />
        </Stack>
      </CheckingContainer>
    </>
  )
}

const isBirthRegistration = (
  data: RecordDetails
): data is BirthRegistration => {
  return data.registration?.type === RegistrationType.Birth
}

const isDeathRegistration = (
  data: RecordDetails
): data is DeathRegistration => {
  return data.registration?.type === RegistrationType.Death
}

export function VerifyCertificatePage() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const { declarationId } = useParams<{ declarationId: string }>()

  const logo = useSelector(selectCountryLogo)
  const appName = useSelector(selectApplicationName)
  const offlineData = useSelector(getOfflineData)

  const [closeWindow, setCloseWindow] = React.useState(false)
  const [timeOut, setTimeOut] = React.useState(false)

  const { loading, error, data } = useVerificationRecordDetails()

  useTimeout(
    () => {
      setCloseWindow(true)
    },
    60000,
    Boolean(data)
  )

  useTimeout(
    () => {
      setCloseWindow(false)
      setTimeOut(true)
    },
    600000,
    Boolean(data)
  )

  const closeWindowAction = () => {
    const blank = window.open('about:blank', '_self')
    blank?.close()
  }

  const getFullName = (data: RecordDetails) => {
    if (isBirthRegistration(data)) {
      return (
        data.child?.name?.[0]?.firstNames +
        ' ' +
        data.child?.name?.[0]?.familyName
      )
    }

    if (data.registration?.type === RegistrationType.Death) {
      return (
        data.deceased?.name?.[0]?.firstNames +
        ' ' +
        data.deceased?.name?.[0]?.familyName
      )
    }
  }

  const getDateOfBirthOrOfDeceased = (data: RecordDetails) => {
    if (isBirthRegistration(data) && data.child?.birthDate)
      return formatDate(new Date(data.child.birthDate), 'dd MMMM yyyy')
    if (isDeathRegistration(data) && data.deceased?.deceased?.deathDate)
      return formatDate(
        new Date(data.deceased.deceased.deathDate),
        'dd MMMM yyyy'
      )
    return undefined
  }

  const getGender = (data: RecordDetails) => {
    if (isBirthRegistration(data)) return data.child?.gender
    if (isDeathRegistration(data)) return data.deceased?.gender
  }

  // This function currently supports upto two location levels
  const getLocation = (data: RecordDetails) => {
    const location = data.eventLocation

    if (location?.type === 'HEALTH_FACILITY') {
      return location?.name ?? EMPTY_STRING
    }

    const country =
      location?.address?.country &&
      intl.formatMessage(countryMessages[location?.address?.country])

    const city = location?.address?.city ?? EMPTY_STRING

    if (location?.address?.country === window.config.COUNTRY) {
      const district =
        location.address.district &&
        offlineData.locations[location.address.district].name
      const state =
        location.address.state &&
        offlineData.locations[location.address.state].name
      return [city, district, state, country]
        .filter((label) => Boolean(label))
        .join(', ')
    }

    //international address

    return [
      city,
      location?.address?.district,
      location?.address?.state,
      country
    ]
      .filter((label) => Boolean(label))
      .join(', ')
  }

  const getRegistarData = (data: RecordDetails) => {
    const history = compact(data.history).find(
      ({ action, regStatus }: History) =>
        !action && regStatus === RegStatus.Registered
    )

    return {
      registar:
        history &&
        history?.user?.name[0]?.firstNames +
          ' ' +
          history?.user?.name[0]?.familyName,
      center:
        history &&
        history?.user?.catchmentArea?.length &&
        history?.user?.catchmentArea
          ?.map((_: { name?: string | null }) => _?.name)
          .join(', ')
    }
  }

  return (
    <Frame
      header={
        <AppBar
          mobileTitle={appName}
          desktopTitle={appName}
          mobileRight={
            <Button
              size="medium"
              type="icon"
              onClick={() => dispatch(goToHome())}
            >
              <Icon name={'X'} weight={'bold'} />
            </Button>
          }
          desktopRight={
            <Button
              size="medium"
              type="icon"
              onClick={() => dispatch(goToHome())}
            >
              <Icon name={'X'} weight={'bold'} />
            </Button>
          }
        />
      }
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <Container size={ContentSize.NORMAL} checking={Boolean(data) || timeOut}>
        <LogoDiv>
          <CountryLogo src={logo} />
        </LogoDiv>
        {declarationId ? (
          <>
            {loading && <LoadingState />}
            {error && <ErrorState />}
            {data && !timeOut && (
              <>
                <Alert type="success">
                  <Text variant={'bold16'} element={'span'} color={'greenDark'}>
                    {intl.formatMessage(messageToDefine.successAlertTitle)}
                  </Text>{' '}
                  <br />
                  <Text variant={'reg16'} element={'span'} color={'greenDark'}>
                    {intl.formatMessage(messageToDefine.successAlertMessage)}
                  </Text>
                </Alert>
                <SpaceDiv />
                <Alert type="success" customIcon={<Icon name={'Lock'} />}>
                  <Text variant={'bold16'} element={'span'} color={'greenDark'}>
                    {intl.formatMessage(messageToDefine.successUrlValidation)}
                  </Text>{' '}
                  <br />
                  <Text variant={'reg16'} element={'span'} color={'greenDark'}>
                    {window.origin}
                  </Text>
                </Alert>
                <SpaceDiv />
                <Box>
                  <ListViewSimplified rowHeight={'small'}>
                    <ListViewItemSimplified
                      label={
                        <Text variant={'bold16'} element={'span'}>
                          {data?.registration?.type ===
                            RegistrationType.Birth &&
                            intl.formatMessage(messageToDefine.brn)}
                          {data?.registration?.type ===
                            RegistrationType.Death &&
                            intl.formatMessage(messageToDefine.drn)}
                        </Text>
                      }
                      value={
                        <Text variant="reg16" element="span">
                          {data.registration?.registrationNumber}
                        </Text>
                      }
                    />
                    <ListViewItemSimplified
                      label={
                        <Text variant="bold16" element="span">
                          {intl.formatMessage(messageToDefine.fullName)}
                        </Text>
                      }
                      value={
                        <Text variant="reg16" element="span">
                          {getFullName(data)}
                        </Text>
                      }
                    />
                    <ListViewItemSimplified
                      label={
                        <Text variant="bold16" element="span">
                          {data?.registration?.type ===
                            RegistrationType.Birth &&
                            intl.formatMessage(messageToDefine.dateOfBirth)}
                          {data?.registration?.type ===
                            RegistrationType.Death &&
                            intl.formatMessage(messageToDefine.dateOfDeath)}
                        </Text>
                      }
                      value={
                        <Text variant="reg16" element="span">
                          {getDateOfBirthOrOfDeceased(data)}
                        </Text>
                      }
                    />
                    <ListViewItemSimplified
                      label={
                        <Text variant="bold16" element="span">
                          {intl.formatMessage(messageToDefine.sex)}
                        </Text>
                      }
                      value={
                        <Text variant="reg16" element="span">
                          {intl.formatMessage(
                            messageToDefine[getGender(data) ?? 'unknown']
                          )}
                        </Text>
                      }
                    />
                    <ListViewItemSimplified
                      label={
                        <Text variant={'bold16'} element={'span'}>
                          {isBirthRegistration(data) &&
                            intl.formatMessage(messageToDefine.placeOfBirth)}
                          {isDeathRegistration(data) &&
                            intl.formatMessage(messageToDefine.placeOfDeath)}
                        </Text>
                      }
                      value={
                        <Text variant={'reg16'} element={'span'}>
                          {getLocation(data)}
                        </Text>
                      }
                    />
                    <ListViewItemSimplified
                      label={
                        <Text variant={'bold16'} element={'span'}>
                          {intl.formatMessage(
                            messageToDefine.registrationCenter
                          )}
                        </Text>
                      }
                      value={
                        <Text variant={'reg16'} element={'span'}>
                          {getRegistarData(data).center}
                        </Text>
                      }
                    />
                    <ListViewItemSimplified
                      label={
                        <Text variant={'bold16'} element={'span'}>
                          {intl.formatMessage(messageToDefine.registar)}
                        </Text>
                      }
                      value={
                        <Text variant={'reg16'} element={'span'}>
                          {getRegistarData(data).registar}
                        </Text>
                      }
                    />

                    <ListViewItemSimplified
                      label={
                        <Text variant={'bold16'} element={'span'}>
                          {intl.formatMessage(messageToDefine.createdAt)}
                        </Text>
                      }
                      value={
                        <Text variant={'reg16'} element={'span'}>
                          {formatDate(new Date(data.createdAt), 'dd MMMM yyyy')}
                        </Text>
                      }
                    />
                  </ListViewSimplified>
                </Box>
              </>
            )}
            {data && timeOut && <TimeOutState />}
          </>
        ) : (
          <ErrorState />
        )}
      </Container>
      {closeWindow && (
        <Toast type={'info'} onClose={closeWindowAction} duration={null}>
          {intl.formatMessage(messageToDefine.toastMessage)}
        </Toast>
      )}
    </Frame>
  )
}
