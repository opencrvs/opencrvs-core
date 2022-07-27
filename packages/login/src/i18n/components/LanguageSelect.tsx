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
import { connect, useSelector } from 'react-redux'
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

type IDispatchProps = {
  changeLanguage: typeof changeLanguage
}

type IProps = IDispatchProps & { children: React.ReactNode }

const SelectContainer = styled.div`
  display: flex;
  justify-content: end;
  padding: 24px 24px 8px;
  background: ${({ theme }) => theme.colors.backgroundPrimary};
`

function LanguageSelectComponent({ changeLanguage, children }: IProps) {
  const applicationLangauges = window.config.LANGUAGES.split(',')
  const languages = useSelector(getLanguages)
  const languageOptions: ISelectOption[] = Object.values(languages)
    .map(({ lang, displayName }) => ({ value: lang, label: displayName }))
    .filter(({ value }) => applicationLangauges.includes(value))
  const storedLanguage = useSelector(getLanguage)
  const getLanguageFromParam = useSearchQuery('language')
  const history = useHistory()
  const location = useLocation()
  React.useEffect(() => {
    async function loadLanguage() {
      const selectLanguage = getLanguageFromParam ?? (await retrieveLanguage())

      if (
        selectLanguage !== storedLanguage &&
        getAvailableLanguages().some((language) => language === selectLanguage)
      )
        changeLanguage({ language: selectLanguage })
    }

    loadLanguage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = ({ value }: ISelectOption) => {
    if (getLanguageFromParam) {
      history.replace({
        pathname: location.pathname,
        search: `language=${value}`
      })
    }
    changeLanguage({ language: value })
  }

  return (
    <>
      {languageOptions.length > 1 && (
        <SelectContainer>
          <Select
            value={storedLanguage}
            options={languageOptions}
            onChange={onChange}
          />
        </SelectContainer>
      )}
      {children}
    </>
  )
}

export const LanguageSelect = connect(null, {
  changeLanguage
})(LanguageSelectComponent)
