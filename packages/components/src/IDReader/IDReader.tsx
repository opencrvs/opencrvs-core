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
import React, { useState } from 'react'
import { Box } from '../Box'
import styled from 'styled-components'
import { Stack } from '../Stack'
import { SecondaryButton } from '../buttons'
import { Icon } from '../Icon'
import { Divider } from '../Divider'
import { Text } from '../Text'
import { Dialog } from '../Dialog'

interface IDReaderProps {
  onScan: (code: Record<string, unknown>) => void
  onError: (error: 'mount' | 'parse') => void
}

const StyledBox = styled(Box)`
  background: ${({ theme }) => theme.colors.background};
`
const StyledButton = styled(SecondaryButton)`
  width: 100%;
`
const IDReader = (props: IDReaderProps) => {
  const [isScannerDialogOpen, setScannerDialogOpen] = useState(false)
  return (
    <StyledBox>
      <Stack direction="column" alignItems="center" gap={0}>
        <StyledButton size="large" onClick={() => setScannerDialogOpen(true)}>
          <Icon name="QrCode" size="medium" />
          Scan ID QR code
        </StyledButton>
        <Divider>
          <Text variant="reg18" element="p" align="center" color="grey500">
            Or
          </Text>
        </Divider>
        <Text variant="reg16" element="span" align="center">
          Complete fields below
        </Text>
      </Stack>
      <Dialog
        isOpen={isScannerDialogOpen}
        onClose={() => setScannerDialogOpen(false)}
        title="Scan ID QR code"
        actions={[]}
      ></Dialog>
    </StyledBox>
  )
}

export default IDReader
