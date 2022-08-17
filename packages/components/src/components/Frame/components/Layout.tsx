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
import { Content } from '../../interface/Content'

export const Layout = styled.section<{ sideColumn?: boolean }>`
  display: grid;
  width: 100%;
  gap: 24px;
  grid-template-columns: 1fr auto;
  max-width: min(1140px, 100% - 24px - 24px);
  margin: 24px auto;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.xl}px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    max-width: 100%;
    gap: 0;
    margin: 0;
  }

  ${Content} {
    margin: 0;
    width: 100%;
    max-width: 100%;
  }
`
