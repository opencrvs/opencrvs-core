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
import styled, { css } from 'styled-components'

import {
  selectCountryBackground,
  selectCountryLogo,
  selectImageToObjectFit
} from '@login/login/selectors'
import { LanguageSelect } from '@login/i18n/components/LanguageSelect'
import { useSelector } from 'react-redux'

interface IPageProps {
  background?: string
  imageFitter?: string
}

const StyledPage = styled.div<IPageProps>`
  min-height: 100vh;
  width: 100%;

  ${({ imageFitter, background, theme }) =>
    background
      ? css`
          background-image: url(${background});
          background-repeat: ${imageFitter === 'FILL' ? 'no-repeat' : 'repeat'};
          background-size: ${imageFitter === 'FILL' ? `cover` : `auto`};
          background: ${background
            ? `#${background}`
            : theme.colors.backgroundPrimary};
        `
      : css`
          background: ${background
            ? `#${background}`
            : theme.colors.backgroundPrimary};
        `}
  * {
    box-sizing: border-box;
    -webkit-font-smoothing: subpixel-antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *:before,
  *:after {
    box-sizing: border-box;
  }
`

export interface IProps {
  children: React.ReactNode
}

export function usePersistentCountryBackground() {
  const [offlineBackground, setOfflineBackground] = React.useState(
    localStorage.getItem('country-background') ?? ''
  )
  const background = useSelector(selectCountryBackground)
  if (background && background !== offlineBackground) {
    setOfflineBackground(background)
    localStorage.setItem('country-background', background)
  }

  return offlineBackground
}
export function useImageToObjectFit() {
  const [offlineBackground, setOfflineBackground] = React.useState(
    localStorage.getItem('country-image-fit') ?? ''
  )
  const background = useSelector(selectImageToObjectFit)
  if (background && background !== offlineBackground) {
    setOfflineBackground(background)
    localStorage.setItem('country-image-fit', background)
  }

  return offlineBackground
}

export function usePersistentCountryLogo() {
  const [offlineLogo, setOfflineLogo] = React.useState(
    localStorage.getItem('country-logo') ?? ''
  )
  const logo = useSelector(selectCountryLogo)
  if (logo && logo !== offlineLogo) {
    setOfflineLogo(logo)
    localStorage.setItem('country-logo', logo)
  }
  return offlineLogo
}

export function LoginBackgroundWrapper({ children }: IProps) {
  const countryBackground = usePersistentCountryBackground()
  const fit = useImageToObjectFit()
  return (
    <div>
      <StyledPage background={countryBackground} imageFitter={fit}>
        <LanguageSelect />
        {children}
      </StyledPage>
    </div>
  )
}
