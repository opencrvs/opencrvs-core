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

export const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.negative};
  padding: 8px 24px;
  border-radius: 4px;
  text-align: center;
  width: 100%;
`
