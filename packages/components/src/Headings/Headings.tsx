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

// Form Heading 2
export const Heading2 = styled.h2`
  ${({ theme }) => theme.fonts.h2};
  color: ${({ theme }) => theme.colors.grey600};
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
`

// Form Heading 3
export const Heading3 = styled.h2`
  padding: 8px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.grey200};
  ${({ theme }) => theme.fonts.h2};
  color: ${({ theme }) => theme.colors.grey600};
  padding-top: 20px;
`
