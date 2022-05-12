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
import { MessageDescriptor, useIntl } from 'react-intl'
import styled from 'styled-components'

const PlaceholderContainer = styled.div`
  ${({ theme }) => theme.fonts.reg18};
  color: ${({ theme }) => theme.colors.grey400};
`

interface IConfigPlaceholderProps {
  label: MessageDescriptor
}

export default function ConfigPlaceholder({ label }: IConfigPlaceholderProps) {
  const intl = useIntl()
  return (
    <PlaceholderContainer>
      <div style={{ marginBottom: '8px' }}>{intl.formatMessage(label)}</div>
      <div>
        <svg
          width="199"
          height="116"
          viewBox="0 0 199 116"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="198.5" height="16" rx="4" fill="#EEEEEE" />
          <rect y="20" width="198.5" height="16" rx="4" fill="#EEEEEE" />
          <rect y="40" width="198.5" height="16" rx="4" fill="#EEEEEE" />
          <rect y="60" width="77.5" height="16" rx="4" fill="#EEEEEE" />
          <rect y="80" width="198.5" height="16" rx="4" fill="#EEEEEE" />
          <rect y="100" width="198.5" height="16" rx="4" fill="#EEEEEE" />
        </svg>
      </div>
    </PlaceholderContainer>
  )
}
