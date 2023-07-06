import * as React from 'react'
import { useState } from 'react'
import ReactPanZoom from './PanDraggable'
import styled, { css } from 'styled-components'

const Container = css`
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

const StyledReactPanZoom = styled(ReactPanZoom)<{
  zoom: number
  pandx: number
  pandy: number
  rotation: number
}>`
  ${Container};
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
