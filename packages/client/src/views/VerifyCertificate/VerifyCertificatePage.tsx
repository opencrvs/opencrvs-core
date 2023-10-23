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
import { gql, useQuery } from '@apollo/client'
import formatDate from '@client/utils/date-formatting'
import {
  BirthRegistration,
  DeathRegistration,
  History,
  RegistrationType,
  RegStatus
} from '@client/utils/gateway'
import { useTimeout } from '@client/hooks/useTimeout'
import { goToHome } from '@client/navigation'
import { EMPTY_STRING } from '@client/utils/constants'

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
// fetchRecordDetailsForVerification
const FETCH_RECORD_DETAILS_FOR_VERIFICATION = gql`
  query fetchRecordDetailsForVerification($id: String!) {
    fetchRecordDetailsForVerification(id: $id) {
      ... on BirthRegistration {
        id
        child {
          name {
            firstNames
            familyName
          }
          birthDate
          gender
        }
        eventLocation {
          id
          name
          description
          type
          address {
            district
            state
            city
            country
          }
        }
        registration {
          trackingId
          registrationNumber
          type
        }
        createdAt
        history {
          action
          regStatus
          user {
            name {
              firstNames
              familyName
            }
            catchmentArea {
              name
            }
          }
        }
      }
      ... on DeathRegistration {
        id
        deceased {
          name {
            firstNames
            familyName
          }
          birthDate
          gender
          deceased {
            deathDate
          }
        }
        eventLocation {
          id
          name
          description
          type
          address {
            district
            state
            city
            country
          }
        }
        registration {
          trackingId
          registrationNumber
          type
        }
        createdAt
        history {
          action
          regStatus
          user {
            name {
              firstNames
              familyName
            }
            catchmentArea {
              name
            }
          }
        }
      }
    }
  }
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

export function VerifyCertificatePage() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const { declarationId } = useParams<{ declarationId: string }>()

  const logo = useSelector(selectCountryLogo)
  const appName = useSelector(selectApplicationName)
  const offlineData = useSelector(getOfflineData)

  const [closeWindow, setCloseWindow] = React.useState(false)
  const [timeOut, setTimeOut] = React.useState(false)

  const { loading, error, data } = useQuery(
    FETCH_RECORD_DETAILS_FOR_VERIFICATION,
    {
      variables: { id: declarationId },
      fetchPolicy: 'network-only'
    }
  )

  const [currentData, setCurrentData] = React.useState<
    BirthRegistration | DeathRegistration
  >()

  useTimeout(
    () => {
      setCloseWindow(true)
    },
    60000,
    data
  )

  useTimeout(
    () => {
      setCloseWindow(false)
      setTimeOut(true)
    },
    600000,
    data
  )

  React.useEffect(() => {
    if (data) {
      setCurrentData(data.fetchRecordDetailsForVerification)
    }
  }, [data])

  const closeWindowAction = () => {
    const blank = window.open('about:blank', '_self')
    // @ts-ignore
    blank.close()
  }

  const getRegisterNumber = (data: BirthRegistration | DeathRegistration) => {
    return data.registration?.registrationNumber
  }

  const getDateOfCertificate = (
    data: BirthRegistration | DeathRegistration
  ) => {
    return formatDate(new Date(data.createdAt), 'dd MMMM yyyy')
  }

  const getFullName = (data: any) => {
    if (data.registration?.type === RegistrationType.Birth) {
      return (
        data?.child?.name[0]?.firstNames + ' ' + data.child.name[0].familyName
      )
    }
    if (data.registration?.type === RegistrationType.Death) {
      return (
        data?.deceased?.name[0]?.firstNames +
        ' ' +
        data?.deceased?.name[0]?.familyName
      )
    }
  }

  const getDateOfBirthOrOfDeceased = (data: any) => {
    if (data.registration?.type === RegistrationType.Birth)
      return formatDate(new Date(data?.child.birthDate), 'dd MMMM yyyy')

    if (data.registration?.type === RegistrationType.Death) {
      return formatDate(
        new Date(data.deceased.deceased.deathDate),
        'dd MMMM yyyy'
      )
    }
  }

  const getGender = (data: any) => {
    if (data.registration?.type === RegistrationType.Birth)
      return data.child.gender
    if (data.registration?.type === RegistrationType.Death)
      return data.deceased.gender
  }

  const getLocation = (data: any) => {
    const location = data.eventLocation
    if (location?.type === 'HEALTH_FACILITY') return location?.name

    const countryName =
      location?.address?.country &&
      intl.formatMessage(countryMessages[location?.address?.country])
    const city = location?.address?.city
      ? location?.address?.city + ', '
      : EMPTY_STRING

    if (location?.address?.country === window.config.COUNTRY) {
      return (
        city +
        offlineData.locations[location?.address?.district].name +
        ', ' +
        offlineData.locations[location?.address?.state].name +
        ', ' +
        countryName
      )
    } else {
      return (
        city +
        location?.address?.district +
        ', ' +
        location?.address?.state +
        ', ' +
        countryName
      )
    }
  }

  const getRegistarData = (data: any) => {
    const history = data.history.find(
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
          ?.map((_: { name: string }) => _?.name)
          .join(', ')
    }
  }

  const getChildOrDeceasedData = (
    data: BirthRegistration | DeathRegistration
  ) => {
    return {
      fullName: getFullName(data),
      date: getDateOfBirthOrOfDeceased(data),
      gender: getGender(data),
      location: getLocation(data)
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
      <Container size={ContentSize.NORMAL} checking={!!currentData || timeOut}>
        <LogoDiv>
          <CountryLogo src={logo} />
        </LogoDiv>
        {declarationId ? (
          <>
            {loading && <LoadingState />}
            {error && <ErrorState />}
            {currentData && !timeOut && (
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
                          {currentData?.registration?.type ===
                            RegistrationType.Birth &&
                            intl.formatMessage(messageToDefine.brn)}
                          {currentData?.registration?.type ===
                            RegistrationType.Death &&
                            intl.formatMessage(messageToDefine.drn)}
                        </Text>
                      }
                      value={
                        <Text variant={'reg16'} element={'span'}>
                          {getRegisterNumber(currentData)}
                        </Text>
                      }
                    />
                    <ListViewItemSimplified
                      label={
                        <Text variant={'bold16'} element={'span'}>
                          {intl.formatMessage(messageToDefine.fullName)}
                        </Text>
                      }
                      value={
                        <Text variant={'reg16'} element={'span'}>
                          {getChildOrDeceasedData(currentData).fullName}
                        </Text>
                      }
                    />
                    <ListViewItemSimplified
                      label={
                        <Text variant={'bold16'} element={'span'}>
                          {currentData?.registration?.type ===
                            RegistrationType.Birth &&
                            intl.formatMessage(messageToDefine.dateOfBirth)}
                          {currentData?.registration?.type ===
                            RegistrationType.Death &&
                            intl.formatMessage(messageToDefine.dateOfDeath)}
                        </Text>
                      }
                      value={
                        <Text variant={'reg16'} element={'span'}>
                          {getChildOrDeceasedData(currentData).date}
                        </Text>
                      }
                    />
                    <ListViewItemSimplified
                      label={
                        <Text variant={'bold16'} element={'span'}>
                          {intl.formatMessage(messageToDefine.sex)}
                        </Text>
                      }
                      value={
                        <Text variant={'reg16'} element={'span'}>
                          {intl.formatMessage(
                            messageToDefine[
                              getChildOrDeceasedData(currentData).gender
                            ]
                          )}
                        </Text>
                      }
                    />
                    <ListViewItemSimplified
                      label={
                        <Text variant={'bold16'} element={'span'}>
                          {currentData?.registration?.type ===
                            RegistrationType.Birth &&
                            intl.formatMessage(messageToDefine.placeOfBirth)}
                          {currentData?.registration?.type ===
                            RegistrationType.Death &&
                            intl.formatMessage(messageToDefine.placeOfDeath)}
                        </Text>
                      }
                      value={
                        <Text variant={'reg16'} element={'span'}>
                          {getChildOrDeceasedData(currentData).location}
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
                          {getRegistarData(currentData).center}
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
                          {getRegistarData(currentData).registar}
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
                          {getDateOfCertificate(currentData)}
                        </Text>
                      }
                    />
                  </ListViewSimplified>
                </Box>
              </>
            )}
            {currentData && timeOut && <TimeOutState />}
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
