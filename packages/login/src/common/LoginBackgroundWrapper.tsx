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
import styled, { css, useTheme } from 'styled-components'

import {
  selectCountryBackground,
  selectCountryLogo
} from '@login/login/selectors'
import { LanguageSelect } from '@login/i18n/components/LanguageSelect'
import { useSelector } from 'react-redux'
import { isEqual } from 'lodash-es'
import { ITheme } from '@opencrvs/components'

const StyledPage = styled.div<{
  background: NonNullable<ReturnType<typeof selectCountryBackground>>
}>`
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ background: { backgroundImage, imageFit, backgroundColor } }) =>
    backgroundImage
      ? css`
          background-image: url(${backgroundImage});
          background-repeat: ${imageFit === 'FILL' ? 'no-repeat' : 'repeat'};
          background-size: ${imageFit === 'FILL' ? `cover` : `auto`};
        `
      : css`
          background: #${backgroundColor};
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
  const theme = useTheme()
  const countryBackground: NonNullable<
    ReturnType<typeof selectCountryBackground>
  > = JSON.parse(
    localStorage.getItem('country-background') ??
      `{"backgroundColor" : "${(theme as ITheme).colors.backgroundPrimary}"}`
  )
  const [offlineBackground, setOfflineBackground] =
    React.useState(countryBackground)

  const background = useSelector(selectCountryBackground)

  if (background && !isEqual(background, offlineBackground)) {
    setOfflineBackground(background)
    localStorage.setItem('country-background', JSON.stringify(background))
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
  return (
    <div>
      <StyledPage background={countryBackground}>
        <LanguageSelect />
        {children}
      </StyledPage>
    </div>
  )
}
