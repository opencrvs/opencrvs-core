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
import { connect } from 'react-redux'
import { IStoreState } from '@login/store'
import { changeLanguage } from '@login/i18n/actions'
import { ISelectOption, Select } from '@opencrvs/components/lib/select'
import styled from 'styled-components'
import { retrieveLanguage } from '@login/i18n/utils'
import { getLanguages, getLanguage } from '@login/i18n/selectors'

type IStateProps = {
  selectedLanguage: string
  languageOptions: ISelectOption[]
}

type IDispatchProps = {
  changeLanguage: typeof changeLanguage
}

type IProps = IStateProps & IDispatchProps & { children: React.ReactNode }

const SelectContainer = styled.div`
  position: fixed;
  top: 24px;
  right: 36px;
  z-index: 1;
`

function LanguageSelectComponent({
  selectedLanguage,
  languageOptions,
  changeLanguage,
  children
}: IProps) {
  React.useEffect(() => {
    async function loadLanguage() {
      const language = await retrieveLanguage()
      if (language != selectedLanguage) changeLanguage({ language })
    }

    loadLanguage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = ({ value }: ISelectOption) => {
    changeLanguage({ language: value })
  }

  return (
    <>
      <SelectContainer>
        <Select
          value={selectedLanguage}
          options={languageOptions}
          onChange={onChange}
        />
      </SelectContainer>
      {children}
    </>
  )
}

function mapStateToProps(store: IStoreState) {
  const languageOptions: ISelectOption[] = Object.values(
    getLanguages(store)
  ).map(({ lang, displayName }) => ({ value: lang, label: displayName }))

  return {
    selectedLanguage: getLanguage(store),
    languageOptions
  }
}

export const LanguageSelect = connect<
  IStateProps,
  IDispatchProps,
  {},
  IStoreState
>(mapStateToProps, {
  changeLanguage
})(LanguageSelectComponent)
