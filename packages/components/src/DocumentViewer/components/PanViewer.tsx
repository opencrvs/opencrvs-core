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
import * as React from 'react'
import { useState } from 'react'
import ReactPanZoom from './PanDraggable'
import styled from 'styled-components'

const StyledReactPanZoom = styled(ReactPanZoom)<{
  zoom: number
  pandx: number
  pandy: number
  rotation: number
}>`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  & img {
    width: 100%;
  }
`

interface IProps {
  id?: string
  image: string
  zoom: number
  rotation: number
  controllerCenter?: boolean
}

const PanViewer: React.FC<IProps> = ({ image, zoom, rotation }) => {
  const [dx] = useState(0)
  const [dy] = useState(0)

  return (
    <React.Fragment>
      <StyledReactPanZoom
        zoom={zoom}
        pandx={dx}
        pandy={dy}
        rotation={rotation}
        key={dx}
      >
        <img
          src={image}
          alt="Supporting Document"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      </StyledReactPanZoom>
    </React.Fragment>
  )
}

export default PanViewer
