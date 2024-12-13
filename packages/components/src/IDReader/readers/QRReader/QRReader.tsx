import React, { useState } from 'react'
import { SecondaryButton } from '../../../buttons'
import { Icon } from '../../../Icon'
import styled from 'styled-components'
import { Dialog } from '../../../Dialog'
import InfoBox from './InfoBox'
import Scanner from './Scanner'
import { Box } from '../../../Box'
import { Stack } from '../../../Stack'
import { Text } from '../../../Text'
import { ScannableQRReader } from '../../../IDReader/types'
import { useWindowSize } from '../../../hooks'

const ScannerBox = styled(Box)`
  background: ${({ theme }) => theme.colors.background};
  width: calc(100% - 24px);
  height: 386px;
`
const Info = styled(Stack)`
  margin-top: 24px;
`

const StyledButton = styled(SecondaryButton)`
  width: 100%;
`

export const QRReader = (props: ScannableQRReader) => {
  const { labels } = props
  const [isScannerDialogOpen, setScannerDialogOpen] = useState(false)
  const windowSize = useWindowSize()
  const isSmallDevice = windowSize.width <= 1028
  const handleScanSuccess = (
    data: Parameters<ScannableQRReader['onScan']>[0]
  ) => {
    props.onScan(data)
    setScannerDialogOpen(false)
  }
  return (
    <>
      <StyledButton size="large" onClick={() => setScannerDialogOpen(true)}>
        <Icon name="QrCode" size="medium" />
        {labels.button}
      </StyledButton>
      <Dialog
        isOpen={isScannerDialogOpen}
        onClose={() => setScannerDialogOpen(false)}
        titleIcon={<Icon name="QrCode" size="large" color="primary" />}
        title={labels.button}
        variant="large"
        actions={[]}
      >
        <Text variant="reg18" element="p">
          {labels.scannerDialogSupportingCopy}
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
            label={labels.tutorial.cameraCleanliness}
          />
          <InfoBox iconName="QrCode" label={labels.tutorial.distance} />
          <InfoBox iconName="Sun" label={labels.tutorial.lightBalance} />
        </Info>
      </Dialog>
    </>
  )
}
