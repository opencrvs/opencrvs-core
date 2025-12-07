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
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { changeLanguage } from '@login/i18n/actions'
import {
  ISelect2Option,
  Select2
} from '@opencrvs/components/lib/Select/Select2'
import styled from 'styled-components'
import { useSearchQuery } from '@login/i18n/utils'
import { getLanguages, getLanguage } from '@login/i18n/selectors'
import { useLocation, useNavigate } from 'react-router-dom'
import { defineMessages, useIntl } from 'react-intl'

// Language Icon Component - Universal language selector icon
const LanguageIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none"
    aria-hidden="true"
  >
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="2"
      fill="none"
    />
    <path 
      d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" 
      stroke="currentColor" 
      strokeWidth="2"
    />
  </svg>
)

const SelectContainer = styled.div`
  ${({ theme }) => theme.colors.primary};
  position: absolute;
  top: 0;
  right: 0;
  padding: 24px 24px 8px;
`

const LanguageSelectWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`

const IconWrapper = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 1;
  color: ${({ theme }) => theme.colors.grey600};
`

const messages = defineMessages({
  language: {
    id: 'login.language',
    defaultMessage: '{language}'
  }
})

function useLanguage(selectedLanguage: string, paramLanguage: string | null) {
  const applicationLanguages = window.config.LANGUAGES.split(',')
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const languages = useSelector(getLanguages)
  const intl = useIntl()

  const languageOptions: ISelect2Option[] = Object.values(languages)
    .map(({ lang }) => ({
      value: lang,
      label: intl.formatMessage(messages.language, { language: lang })
    }))
    .filter(({ value }) => applicationLanguages.includes(value))

  const onChange = ({ value }: ISelect2Option) => {
    if (paramLanguage) {
      navigate(
        {
          pathname: location.pathname,
          search: `lang=${value}`
        },
        {
          replace: true
        }
      )
    }
    dispatch(changeLanguage({ language: value }))
  }
  return [languageOptions, onChange] as const
}

export function LanguageSelect() {
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
          <LanguageSelectWrapper>
            <IconWrapper>
              <LanguageIcon />
            </IconWrapper>
            <Select2
              value={selectedLanguage}
              options={languageOptions}
              onChange={onLanguageChange}
            />
          </LanguageSelectWrapper>
        </SelectContainer>
      )}
    </>
  )
}