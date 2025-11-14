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
import { Button } from '../../Button'
import { Icon } from '../../Icon'
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

  const isPdf = image.endsWith('.pdf')

  const handleOpenPdf = async () => {
    try {
      const res = await fetch(image, { cache: 'default' })
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
    } catch (err) {
      console.error('Failed to open PDF', err)
    }
  }

  return (
    <React.Fragment>
      <StyledReactPanZoom
        zoom={zoom}
        pandx={dx}
        pandy={dy}
        rotation={rotation}
        key={dx}
      >
        {!isPdf ? (
          <img
            src={image}
            alt="Supporting Document"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        ) : (
          <Button
            id="preview_close"
            aria-label="Preview PDF1970
             in new tab"
            size="medium"
            type="positive"
            onClick={handleOpenPdf}
          >
            Open PDF in a new tab
            <Icon name="ArrowSquareOut" size="medium" />
          </Button>
        )}
      </StyledReactPanZoom>
    </React.Fragment>
  )
}

export default PanViewer
