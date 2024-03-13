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
import { modifyDeclaration, writeDeclaration } from '@client/declarations'
import { selectCountryLogo, getOfflineData } from '@client/offline/selectors'
import React from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import {
  addNidUserInfoToDeclaration,
  useCheckNonce,
  useExtractCallBackState,
  useQueryParams
} from '@client/views/OIDPVerificationCallback/utils'
import styled from 'styled-components'
import { Link, Stack, Text, Spinner, Button, Icon } from '@opencrvs/components'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import { LogoContainer } from '@client/views/UserSetup/UserSetupPage'
import { buttonMessages } from '@client/i18n/messages'
import { messages as nidCallbackMessages } from '@client/i18n/messages/views/nidVerificationCallback'
import { useQuery } from '@apollo/client'
import { useDeclaration } from '@client/declarations/selectors'
import { GET_OIDP_USER_INFO } from '@client/views/OIDPVerificationCallback/queries'
import { useHistory } from 'react-router'
import { OIDP_VERIFICATION_CALLBACK } from '@client/navigation/routes'

// OIDP Verification Callback
// --
// Checks the ?state= query parameter for a JSON string like: { pathname: "/path/somewhere" }
// Checks that the &nonce= parameter matches the one in localStorage, removes it if yes, throws if not
// Redirects to the pathname in state

const Page = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  background: ${({ theme }) => theme.colors.grey100};
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

export const OIDPVerificationCallback = () => {
  const params = useQueryParams()
  const { pathname, declarationId, section } = useExtractCallBackState()
  const isNonceOk = useCheckNonce()
  const code = params.get('code')
  const offlineData = useSelector(getOfflineData)
  const clientId = offlineData.systems.find((s) => s.type === 'NATIONAL_ID')
    ?.settings?.openIdProviderClientId
  const intl = useIntl()
  const logo = useSelector(selectCountryLogo)
  const declaration = useDeclaration(declarationId)
  const dispatch = useDispatch()
  const history = useHistory()
  const oidpUserInfoQueryVariables = {
    code,
    clientId,
    redirectUri: `${window.location.origin}${OIDP_VERIFICATION_CALLBACK}`
  }
  const { loading, error, refetch } = useQuery(GET_OIDP_USER_INFO, {
    variables: oidpUserInfoQueryVariables,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      addNidUserInfoToDeclaration(declaration, section, data.getOIDPUserInfo)
      dispatch(modifyDeclaration(declaration))
      dispatch(writeDeclaration(declaration))
      goToVerificationOrigin()
    }
  })

  if (!pathname || !isNonceOk) {
    // Do not redirect and let the hooks throw
    return null
  }

  const goToVerificationOrigin = () => {
    pathname && history.push(pathname)
  }

  const handleRetry = () => refetch(oidpUserInfoQueryVariables)

  return (
    <Page>
      <Container id="callback-container">
        <Stack direction="column" alignItems="stretch" gap={24}>
          <LogoContainer>
            <CountryLogo size="small" src={logo} />
          </LogoContainer>
          <UserActionsContainer>
            <Stack direction="column" alignItems="center" gap={16}>
              {loading && (
                <>
                  <Spinner id="Spinner" size={20} />
                  <Text
                    variant="bold16"
                    element="h1"
                    align="center"
                    id="authenticating-label"
                  >
                    {intl.formatMessage(nidCallbackMessages.authenticatingNid)}
                  </Text>
                </>
              )}
              {error && (
                <>
                  <Icon name="WarningCircle" size="medium" color="red" />
                  <Text
                    variant="bold16"
                    element="h1"
                    align="center"
                    id="authentication-failed-label"
                  >
                    {intl.formatMessage(
                      nidCallbackMessages.failedToAuthenticateNid
                    )}
                  </Text>
                  <Button type="primary" size="small" onClick={handleRetry}>
                    {intl.formatMessage(buttonMessages.retry)}
                  </Button>
                </>
              )}
              <Link font="reg14" onClick={goToVerificationOrigin}>
                {intl.formatMessage(buttonMessages.cancel)}
              </Link>
            </Stack>
          </UserActionsContainer>
        </Stack>
      </Container>
    </Page>
  )
}
