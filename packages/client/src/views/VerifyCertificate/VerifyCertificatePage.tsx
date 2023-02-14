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
import { Toast } from '@opencrvs/components/lib/Toast/Toast'
import { useParams } from 'react-router'
import { gql, useQuery } from '@apollo/client'
import formatDate from '@client/utils/date-formatting'
import { History, RegStatus } from '@client/utils/gateway'

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
          name
          description
          type
          address {
            use
            type
            line
            lineName
            city
            district
            districtName
            state
            stateName
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
      }
    }
  }
`

export function VerifyCertificatePage() {
  const intl = useIntl()
  const { declarationId } = useParams<{ declarationId: string }>()

  const logo = useSelector(selectCountryLogo)
  const appName = useSelector(selectApplicationName)

  const [closeWindow, setCloseWindow] = React.useState(false)
  const [timeOut, setTimeOut] = React.useState(false)

  const { loading, error, data } = useQuery(
    FETCH_RECORD_DETAILS_FOR_VERIFICATION,
    {
      variables: { id: declarationId },
      fetchPolicy: 'network-only'
    }
  )

  const [currentData, setCurrentData] = React.useState(undefined)

  React.useEffect(() => {
    if (data) {
      setTimeout(() => {
        setCloseWindow(true)
      }, 60000) // 60000 is correct value

      setTimeout(() => {
        setCloseWindow(false)
        setTimeOut(true)
      }, 600000) // 600000 is correct value
      setCurrentData(data.fetchRecordDetailsForVerification)
    }
  }, [data])

  const closeWindowAction = () => {
    const blank = window.open('about:blank', '_self')
    // @ts-ignore
    blank.close()
  }

  const LoadingState = () => {
    return (
      <CheckingContainer>
        <Stack alignItems="center" direction="column">
          <SpaceDiv />
          <SpinnerContainer>
            <StyledSpinner id="appSpinner" />
          </SpinnerContainer>
          <Text variant={'reg16'} element={'h4'}>
            Verifying certificate
          </Text>
        </Stack>
      </CheckingContainer>
    )
  }

  const ErrorState = () => {
    return (
      <>
        <Alert onActionClick={() => {}} type="error">
          <Text variant={'bold16'} element={'span'} color={'redDark'}>
            Invalid QR code
          </Text>{' '}
          <br />
          <Text variant={'reg16'} element={'span'} color={'redDark'}>
            The certificate is a potential forgery please...
          </Text>
        </Alert>
      </>
    )
  }

  const TimeOutState = () => {
    return (
      <>
        <CheckingContainer>
          <Stack alignItems="center" direction="column">
            <SpaceDiv />
            <Text variant={'reg16'} element={'h4'}>
              You been timed out
            </Text>
            <SpaceDiv />
          </Stack>
        </CheckingContainer>
      </>
    )
  }

  const getRegisterNumber = (data: {
    registration: { registrationNumber: any }
  }) => {
    return data?.registration.registrationNumber
  }

  const getDateOfCertificate = (data: {
    createdAt: string | number | Date
  }) => {
    return formatDate(new Date(data.createdAt), 'dd MMMM yyyy')
  }

  const getFullName = (data: {
    registration: { type: string }
    child: {
      name: {
        firstNames: string
        familyName: string
      }[]
    }
    deceased: {
      name: {
        firstNames: string
        familyName: string
      }[]
    }
  }) => {
    if (data.registration.type === 'BIRTH')
      return data.child.name[0].firstNames + ' ' + data.child.name[0].familyName
    if (data.registration.type === 'DEATH') {
      return (
        data.deceased.name[0].firstNames +
        ' ' +
        data.deceased.name[0].familyName
      )
    }
  }

  const getDateOfBirthOrOfDeceased = (data: {
    deceased: any
    registration: { type: string }
    child: { birthDate: string | number | Date }
  }) => {
    if (data.registration.type === 'BIRTH')
      return formatDate(new Date(data.child.birthDate), 'dd MMMM yyyy')

    if (data.registration.type === 'DEATH') {
      return formatDate(
        new Date(data.deceased.deceased.deathDate),
        'dd MMMM yyyy'
      )
    }
  }

  const getGender = (data: {
    registration: { type: string }
    child: { gender: any }
    deceased: { gender: any }
  }) => {
    if (data.registration.type === 'BIRTH') return data.child.gender
    if (data.registration.type === 'DEATH') return data.deceased.gender
  }

  const getLoacation = (data: { eventLocation: any }) => {
    const location = data.eventLocation
    // if(location.type === )
    return location.name
  }

  const getRegistarData = (data: { history: [History] }) => {
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
        history?.user?.catchmentArea?.map((_) => _?.name).join(', ')
    }
  }

  const getChildOrDeceasedData = (data: any) => {
    return {
      fullName: getFullName(data),
      date: getDateOfBirthOrOfDeceased(data),
      gender: getGender(data),
      location: getLoacation(data)
    }
  }

  console.log(currentData)

  return (
    <Frame
      header={<AppBar mobileTitle={appName} desktopTitle={appName} />}
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <Container size={ContentSize.NORMAL} checking={currentData || timeOut}>
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
                    Valid QR code
                  </Text>{' '}
                  <br />
                  <Text variant={'reg16'} element={'span'} color={'greenDark'}>
                    Compare the partial details of the record below against
                    those against those recorded on the certificate
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
                <Box>
                  <ListViewSimplified rowHeight={'small'}>
                    <ListViewItemSimplified
                      label={
                        <Text variant={'bold16'} element={'span'}>
                          BRN
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
                          Full name
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
                          Date of birth
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
                          Sex
                        </Text>
                      }
                      value={
                        <Text variant={'reg16'} element={'span'}>
                          {getChildOrDeceasedData(currentData).gender}
                        </Text>
                      }
                    />
                    <ListViewItemSimplified
                      label={
                        <Text variant={'bold16'} element={'span'}>
                          Place of birth
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
                          Registration center
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
                          Name of Registar
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
                          Date of certification
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
          After verifying the certificate, please close the browser window
        </Toast>
      )}
    </Frame>
  )
}
