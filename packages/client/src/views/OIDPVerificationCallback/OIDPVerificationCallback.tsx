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
import { writeDeclaration } from '@client/declarations'
import { getLanguage } from '@client/i18n/selectors'
import { goToPageGroup } from '@client/navigation'
import { selectCountryLogo, getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import React, { useEffect, useState } from 'react'
import { injectIntl, useIntl } from 'react-intl'
import { connect, useSelector } from 'react-redux'
import { Redirect } from 'react-router'
import { useQueryParams } from './utils'
import styled from 'styled-components'
import { Link, Stack, Text, Spinner, Button, Icon } from '@opencrvs/components'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import { LogoContainer } from '@client/views/UserSetup/UserSetupPage'
import { buttonMessages } from '@client/i18n/messages'
import { messages as nidCallbackMessages } from '@client/i18n/messages/views/nidVerificationCallback'
import { gql, useQuery } from '@apollo/client'

// OIDP Verification Callback
// --
// Checks the ?state= query parameter for a JSON string like: { pathname: "/path/somewhere" }
// Checks that the &nonce= parameter matches the one in localStorage, removes it if yes, throws if not
// Redirects to the pathname in state

export const Page = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  background: ${({ theme }) => theme.colors.gray500};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  text-align: center;
`
const Container = styled.div`
  width: 288px;
  margin: auto;
  margin-top: 10vh;
`

const UserActionsContainer = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 24px 40px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  border-radius: 10px;
`
const LoadingContainer = styled.div`
  width: 100%;
  padding-left: 8px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: flex;
    padding-left: 0px;
    margin: auto;
    align-items: center;
    justify-content: center;
  }
`

export const OIDP_VERIFICATION_NONCE_LOCALSTORAGE_KEY =
  'oidp-verification-nonce'

const useCheckNonce = () => {
  const params = useQueryParams()
  const [nonceOk, setNonceOk] = useState(false)

  useEffect(() => {
    if (!params.get('nonce')) {
      throw new Error('No nonce provided from OIDP callback.')
    }

    const nonceMatches =
      window.localStorage.getItem(OIDP_VERIFICATION_NONCE_LOCALSTORAGE_KEY) ===
      params.get('nonce')

    if (nonceMatches) {
      window.localStorage.removeItem(OIDP_VERIFICATION_NONCE_LOCALSTORAGE_KEY)
      setNonceOk(true)
    } else {
      throw new Error(
        'Nonce did not match the one sent to the integration before callback'
      )
    }
  }, [params])

  return nonceOk
}

const useRedirectPathname = () => {
  const params = useQueryParams()

  useEffect(() => {
    if (!params.get('state')) {
      throw new Error('No state provided from OIDP callback.')
    }
  }, [params])

  const { pathname } = JSON.parse(params.get('state') ?? '{}') as {
    pathname: string | undefined
  }

  return { pathname }
}
const GET_OIDP_USER_INFO = gql`
  query getOIDPUserInfo(
    $code: String!
    $clientId: String!
    $redirectUri: String!
    $grantType: String
  ) {
    getOIDPUserInfo(
      code: $code
      clientId: $clientId
      redirectUri: $redirectUri
      grantType: $grantType
    ) {
      sub
      name
      given_name
      family_name
      middle_name
      nickname
      preferred_username
      profile
      picture
      website
      email
      email_verified
      gender
      birthdate
      zoneinfo
      locale
      phone_number
      phone_number_verified
      address {
        formatted
        street_address
        locality
        region
        postal_code
        country
      }
      updated_at
    }
  }
`
export const OIDPVerificationCallback = (props: any) => {
  const params = useQueryParams()
  const { pathname } = useRedirectPathname()
  const isNonceOk = true
  const code = params.get('code')
  const offlineData = useSelector(getOfflineData)
  const clientId = offlineData.systems.find((s) => s.type === 'NATIONAL_ID')
    ?.settings?.openIdProviderClientId
  const intl = useIntl()
  const logo = useSelector(selectCountryLogo)

  const oidpUserInfoQueryVariables = {
    code,
    clientId,
    redirectUri: 'http://localhost:3000/mosip-callback'
  }
  const { loading, error, data, refetch } = useQuery(GET_OIDP_USER_INFO, {
    variables: oidpUserInfoQueryVariables,
    notifyOnNetworkStatusChange: true
  })

  if (!pathname || !isNonceOk) {
    // Do not redirect and let the hooks throw
    return null
  }

  const RedirectComp = () => (
    <Redirect
      to={{
        pathname,
        state: {
          code: code
        }
      }}
    />
  )

  if (data) {
    //POPULATE DATA & REDIRECT
    return <RedirectComp />
  }

  const handleCancel = () => {
    return <RedirectComp />
  }

  const handleRetry = () => refetch(oidpUserInfoQueryVariables)

  return (
    <Page>
      <Container>
        <Stack direction="column" alignItems="stretch" gap={24}>
          <LogoContainer>
            <CountryLogo size="small" src={logo} />
          </LogoContainer>
          <UserActionsContainer>
            <Stack direction="column" alignItems="center" gap={16}>
              {loading && (
                <>
                  <Spinner id="Spinner" size={20} />
                  <Text variant="bold16" element="h1" align="center">
                    {intl.formatMessage(nidCallbackMessages.authenticatingNid)}
                  </Text>
                </>
              )}
              {error && (
                <>
                  <Icon name="WarningCircle" size="medium" color="red" />
                  <Text variant="bold16" element="h1" align="center">
                    {intl.formatMessage(
                      nidCallbackMessages.failedToAuthenticateNid
                    )}
                  </Text>
                  <Button type="primary" size="small" onClick={handleRetry}>
                    {intl.formatMessage(buttonMessages.retry)}
                  </Button>
                </>
              )}
              <Link font="reg14" onClick={handleCancel}>
                {intl.formatMessage(buttonMessages.cancel)}
              </Link>
            </Stack>
          </UserActionsContainer>
        </Stack>
      </Container>
    </Page>
  )
}

export const OIDPVerificationCallbackPage = connect(
  (state: IStoreState) => ({
    language: getLanguage(state)
  }),
  { goToPageGroup, writeDeclaration }
)(injectIntl(OIDPVerificationCallback))
