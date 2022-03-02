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
import styled from 'styled-components'

export const Header = styled.section`
  display: flex;
  flex-direction: column;

  color: ${({ theme }) => theme.colors.white};

  overflow: visible;
  ${({ theme }) => theme.gradients.primary};
  ${({ theme }) => theme.shadows.lightShadow};
  position: relative;
`
