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
import { PageContainer } from '@login/common/PageContainer'
import { ErrorBoundary } from '@login/ErrorBoundary'
import { IntlContainer } from '@login/i18n/components/I18nContainer'
import * as routes from '@login/navigation/routes'
import { AppStore } from '@login/store'
import { StepOneContainer } from '@login/views/StepOne/StepOneContainer'
import { getTheme } from '@opencrvs/components/lib/theme'
import * as React from 'react'
import { Provider } from 'react-redux'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { createGlobalStyle, ThemeProvider } from 'styled-components'
import { ForgottenItem } from './views/ResetCredentialsForm/ForgottenItemForm'
import { AuthDetailsVerification } from './views/ResetCredentialsForm/AuthDetailsVerificationForm'
import { RecoveryCodeEntry } from './views/ResetCredentialsForm/RecoveryCodeEntryForm'
import { SecurityQuestion } from './views/ResetCredentialsForm/SecurityQuestionForm'
import { UpdatePassword } from './views/ResetCredentialsForm/UpdatePasswordForm'
import { Page } from './Page'
import { LoginBackgroundWrapper } from '@login/common/LoginBackgroundWrapper'
import { StepTwoContainer } from '@login/views/StepTwo/StepTwoContainer'
import { ReloadModal } from './views/ReloadModal'
import { ResetCredentialsSuccessPage } from './views/ResetCredentialsForm/ResetCredentialsSuccessPage'

interface IAppProps {
  store: AppStore
  router: ReturnType<typeof createBrowserRouter>
}

// Injecting global styles for the body tag - used only once
// @ts-ignore
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
  }
`
export const routesConfig = [
  {
    path: '/',
    element: (
      <>
        <ReloadModal />
        <Page>
          <Outlet />
        </Page>
      </>
    ),

    children: [
      {
        path: routes.STEP_ONE,
        element: (
          <LoginBackgroundWrapper>
            <StepOneContainer />
          </LoginBackgroundWrapper>
        )
      },
      {
        path: routes.STEP_TWO,
        element: (
          <LoginBackgroundWrapper>
            <StepTwoContainer />
          </LoginBackgroundWrapper>
        )
      },
      {
        path: routes.FORGOTTEN_ITEM,
        element: (
          <PageContainer>
            <ForgottenItem />
          </PageContainer>
        )
      },
      {
        path: routes.PHONE_NUMBER_VERIFICATION,
        element: (
          <PageContainer>
            <AuthDetailsVerification />
          </PageContainer>
        )
      },
      {
        path: routes.RECOVERY_CODE_ENTRY,
        element: (
          <PageContainer>
            <RecoveryCodeEntry />
          </PageContainer>
        )
      },
      {
        path: routes.SECURITY_QUESTION,
        element: (
          <PageContainer>
            <SecurityQuestion />
          </PageContainer>
        )
      },
      {
        path: routes.UPDATE_PASSWORD,
        element: (
          <PageContainer>
            <UpdatePassword />
          </PageContainer>
        )
      },
      {
        path: routes.SUCCESS,
        element: (
          <PageContainer>
            <ResetCredentialsSuccessPage />
          </PageContainer>
        )
      }
    ]
  }
]

export const App = ({ store, router }: IAppProps) => (
  <ErrorBoundary>
    <GlobalStyle />
    <Provider store={store}>
      <IntlContainer>
        <ThemeProvider theme={getTheme()}>
          <RouterProvider router={router} />
        </ThemeProvider>
      </IntlContainer>
    </Provider>
  </ErrorBoundary>
)
