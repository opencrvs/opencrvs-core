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
import { useDispatch, useSelector } from 'react-redux'
import {
  applicationConfigLoadAction,
  storeClientRedirectRoute
} from './login/actions'
import { changeLanguage, loadLanguages } from './i18n/actions'
import {
  getDefaultLanguage,
  retrieveLanguage,
  useSearchQuery
} from './i18n/utils'
import { selectApplicationName } from './login/selectors'

type IProps = {
  children: React.ReactNode
}

function useDocumentTitle() {
  const applicationName = useSelector(selectApplicationName)
  React.useEffect(() => {
    if (applicationName) {
      document.title = applicationName
    }
  }, [applicationName])
}

function useLoadConfigurations() {
  const dispatch = useDispatch()
  React.useEffect(() => {
    dispatch(loadLanguages())
    dispatch(applicationConfigLoadAction())
  }, [dispatch])
}

function useStoreClientRedirectRoute() {
  const dispatch = useDispatch()
  const paramRedirectTo = useSearchQuery('redirectTo')
  React.useEffect(() => {
    if (!!paramRedirectTo) {
      dispatch(storeClientRedirectRoute(paramRedirectTo))
    }
  }, [dispatch])
}

function useSyncLanguage() {
  const dispatch = useDispatch()
  const paramLanguage = useSearchQuery('lang')
  React.useEffect(() => {
    async function syncLanguage() {
      const languageToUse =
        paramLanguage ?? (await retrieveLanguage()) ?? getDefaultLanguage()

      if (languageToUse) dispatch(changeLanguage({ language: languageToUse }))
    }
    syncLanguage()
  }, [dispatch, paramLanguage])
}

export function Page({ children }: IProps) {
  useLoadConfigurations()
  useSyncLanguage()
  useDocumentTitle()
  useStoreClientRedirectRoute()
  return <>{children}</>
}
