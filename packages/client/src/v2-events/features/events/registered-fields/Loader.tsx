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
import { useIntl } from 'react-intl'
import { Box, Loader as LoaderUI } from '@opencrvs/components'
import { LoaderField } from '@opencrvs/commons/client'

const Container = styled(Box)`
  border: none;
  background-color: ${({ theme }) => theme.colors.background};
`

function LoaderInput({
  id,
  configuration
}: {
  id: string
  configuration: LoaderField['configuration']
}) {
  const intl = useIntl()
  return (
    <Container>
      <LoaderUI
        flexDirection="column-reverse"
        id={id}
        loadingText={intl.formatMessage(configuration.text)}
        marginPercent={5}
      />
    </Container>
  )
}

export const Loader = {
  Input: LoaderInput,
  Output: null
}
