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
/*
  FROKED from https://github.com/gomezhyuuga/react-pan-zoom

  This is the source code from the above library
*/

import * as React from 'react'
import { Button } from '../../Button'
import { Icon } from '../../Icon'
import styled from 'styled-components'

const ControlsContainer = styled.div<{ centerController?: boolean }>`
  height: 56px;
  position: relative;
  gap: 2px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-direction: row;
  z-index: 10;
`

interface ControlProps {
  zoomIn: () => void
  zoomOut: () => void
  rotateLeft: () => void
}

const PanControls = ({ zoomIn, zoomOut, rotateLeft }: ControlProps) => {
  return (
    <ControlsContainer>
      <Button type="icon" size="medium" onClick={zoomIn}>
        <Icon name="MagnifyingGlassPlus" />
      </Button>
      <Button type="icon" size="medium" onClick={zoomOut}>
        <Icon name="MagnifyingGlassMinus" />
      </Button>
      <Button type="icon" size="medium" onClick={rotateLeft}>
        <Icon name="ArrowCounterClockwise" />
      </Button>
    </ControlsContainer>
  )
}

export default PanControls
