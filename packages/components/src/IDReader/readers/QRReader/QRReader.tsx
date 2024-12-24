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
import { Button } from '../../../Button'
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
import { getTheme } from '../../../theme'

const ScannerBox = styled(Box)`
  background: ${({ theme }) => theme.colors.background};
  width: calc(100% - 24px);
  height: 386px;
`
const Info = styled(Stack)`
  margin-top: 24px;
`

export const QRReader = (props: ScannableQRReader) => {
  const { labels } = props
  const [isScannerDialogOpen, setScannerDialogOpen] = useState(false)
  const windowSize = useWindowSize()
  const theme = getTheme()
  const isSmallDevice = windowSize.width <= theme.grid.breakpoints.md
  const handleScanSuccess = (
    data: Parameters<ScannableQRReader['onScan']>[0]
  ) => {
    props.onScan(data)
    setScannerDialogOpen(false)
  }
  return (
    <>
      <Button
        size="large"
        type="secondary"
        onClick={() => setScannerDialogOpen(true)}
      >
        <Icon name="QrCode" size="medium" />
        {labels.button}
      </Button>
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
          <InfoBox iconName={isSmallDevice ? 'DeviceTabletCamera' : 'Webcam'}>
            {labels.tutorial.cameraCleanliness}
          </InfoBox>
          <InfoBox iconName="QrCode">{labels.tutorial.distance}</InfoBox>
          <InfoBox iconName="Sun">{labels.tutorial.lightBalance}</InfoBox>
        </Info>
      </Dialog>
    </>
  )
}
