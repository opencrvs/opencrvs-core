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
import styled from 'styled-components'
import { Link } from '../../Link'

export const SkipToContentContainer = styled(Link)`
  left: 0;
  top: 0;
  position: absolute;
  transform: translateY(calc(-100% - 16px));
  z-index: 1;
  padding: 16px;
  filter: drop-shadow(0px 2px 4px rgba(34, 34, 34, 0.24));
  margin: 8px;
  background: ${({ theme }) => theme.colors.yellow};
  color: ${({ theme }) => theme.colors.copy};

  &:not(:focus-visible) {
    transition: transform 400ms;
  }

  &:focus-visible {
    transform: translateY(0);
  }
`

export const MAIN_CONTENT_ANCHOR_ID = 'maincontent'

type SkipToContentProps = {
  children: string
}

/**
 * A button which skips past the main content.
 * https://web.archive.org/web/20220927150528/https://webaim.org/techniques/skipnav/
 */
export const SkipToContent = ({ children }: SkipToContentProps) => (
  <SkipToContentContainer element="a" href={`#${MAIN_CONTENT_ANCHOR_ID}`}>
    {children}
  </SkipToContentContainer>
)
