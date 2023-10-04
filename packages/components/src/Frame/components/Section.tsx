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
import styled from 'styled-components'

export const Section = styled.div`
  display: grid;
  gap: 24px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    gap: 0;
  }
`

export const SectionFormBackAction = styled.div`
  display: grid;
  gap: 24px;
  justify-items: end;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    gap: 0;
    background: ${({ theme }) => theme.colors.white};
    align-items: centre;
    justify-items: start;
  }
`
