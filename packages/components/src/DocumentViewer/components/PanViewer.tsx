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
/*
  FROKED from https://github.com/gomezhyuuga/react-pan-zoom

  This is the source code from the above library
*/

import * as React from 'react'
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

const StyledReactPanZoom = styled(ReactPanZoom)`
  ${Container};
` as any

interface IProps {
  id?: string
  image: string
  zoom: number
  rotation: number
  controllerCenter?: boolean
}

export default class PanViewer extends React.Component<IProps> {
  state = {
    dx: 0,
    dy: 0,
    zoom: 1,
    rotation: 0
  }

  render() {
    const { zoom, rotation } = this.props
    return (
      <React.Fragment>
        <StyledReactPanZoom
          zoom={zoom}
          pandx={this.state.dx}
          pandy={this.state.dy}
          rotation={rotation}
          key={this.state.dx}
        >
          <img
            src={this.props.image}
            alt="Supporting Document"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        </StyledReactPanZoom>
      </React.Fragment>
    )
  }
}
