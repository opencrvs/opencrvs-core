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
import { PrimaryButton } from '../../buttons'
import styled from 'styled-components'

const Container = styled.nav`
  margin: 16px;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;

  ${PrimaryButton} {
    height: 36px;
    ${({ theme }) => theme.fonts.bold14};

    div {
      justify-content: space-between;
    }

    svg {
      height: 20px;
    }
  }
`

export const NavigationActionButtonGroup = ({
  children
}: {
  children: React.ReactNode[]
}) => {
  return <Container>{children}</Container>
}
