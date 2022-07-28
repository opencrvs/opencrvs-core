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
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { changeLanguage } from '@login/i18n/actions'
import { ISelectOption, Select } from '@opencrvs/components/lib/select'
import styled from 'styled-components'
import {
  retrieveLanguage,
  getAvailableLanguages,
  useSearchQuery
} from '@login/i18n/utils'
import { getLanguages, getLanguage } from '@login/i18n/selectors'
import { useHistory, useLocation } from 'react-router'

type IProps = {
  children: React.ReactNode
}

const SelectContainer = styled.div`
  display: flex;
  justify-content: end;
  padding: 24px 24px 8px;
  background: ${({ theme }) => theme.colors.backgroundPrimary};
`

function useLanguage(selectedLanguage: string, paramLanguage: string | null) {
  const applicationLangauges = window.config.LANGUAGES.split(',')
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()
  const languages = useSelector(getLanguages)

  const languageOptions: ISelectOption[] = Object.values(languages)
    .map(({ lang, displayName }) => ({ value: lang, label: displayName }))
    .filter(({ value }) => applicationLangauges.includes(value))

  React.useEffect(() => {
    async function loadLanguage() {
      const languageToUse = paramLanguage ?? (await retrieveLanguage())

      if (
        languageToUse !== selectedLanguage &&
        getAvailableLanguages().some((language) => language === languageToUse)
      )
        dispatch(changeLanguage({ language: languageToUse }))
    }

    loadLanguage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = ({ value }: ISelectOption) => {
    if (paramLanguage) {
      history.replace({
        pathname: location.pathname,
        search: `lang=${value}`
      })
    }
    dispatch(changeLanguage({ language: value }))
  }
  return [languageOptions, onChange] as const
}

export function LanguageSelect({ children }: IProps) {
  const paramLanguage = useSearchQuery('lang')
  const selectedLanguage = useSelector(getLanguage)
  const [languageOptions, onLanguageChange] = useLanguage(
    selectedLanguage,
    paramLanguage
  )

  return (
    <>
      {languageOptions.length > 1 && (
        <SelectContainer>
          <Select
            value={selectedLanguage}
            options={languageOptions}
            onChange={onLanguageChange}
          />
        </SelectContainer>
      )}
      {children}
    </>
  )
}
