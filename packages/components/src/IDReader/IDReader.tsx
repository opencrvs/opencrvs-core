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
import React, { useEffect, useState } from 'react'
import { Box } from '../Box'
import styled from 'styled-components'
import { Stack } from '../Stack'
import { SecondaryButton } from '../buttons'
import { Icon } from '../Icon'
import { Divider } from '../Divider'
import { Text } from '../Text'
import { Dialog } from '../Dialog'
import Scanner from './scanner/Scanner'
import InfoBox from './InfoBox'

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
const ScannerBox = styled(Box)`
  background: ${({ theme }) => theme.colors.background};
  width: calc(100% -24px);
  height: 386px;
`
const Info = styled(Stack)`
  margin-top: 24px;
`

const IDReader = (props: IDReaderProps) => {
  const [isScannerDialogOpen, setScannerDialogOpen] = useState(false)
  const isSmallDevice = window.innerWidth <= 1028
  const handleScanSuccess = (data: Parameters<IDReaderProps['onScan']>[0]) => {
    props.onScan(data)
    setScannerDialogOpen(false)
  }
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
        titleIcon={<Icon name="QrCode" size="large" color="primary" />}
        title="Scan ID QR code"
        variant="large"
        actions={[]}
      >
        <Text variant="reg18" element="p">
          Place the Notifier's ID card in front of the camera.
        </Text>
        <ScannerBox>
          <Scanner onScan={handleScanSuccess} onError={props.onError} />
        </ScannerBox>
        <Info
          gap={16}
          justifyContent="space-between"
          alignItems="stretch"
          direction={isSmallDevice ? 'column' : 'row'}
        >
          <InfoBox
            iconName={isSmallDevice ? 'DeviceTabletCamera' : 'Webcam'}
            label="Ensure your camera is clean and functional."
          />
          <InfoBox
            iconName="QrCode"
            label="Hold the device steadily 6-12 inches away from the QR code."
          />
          <InfoBox
            iconName="Sun"
            label="Ensure the QR code is well-lit and not damaged or blurry."
          />
        </Info>
      </Dialog>
    </StyledBox>
  )
}

export default IDReader
