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
import * as React from 'react'
import ReactPanZoom from './PanDraggable'
import styled, { css } from 'styled-components'
import { ZoomIn, ZoomOut, RotateLeft } from '../../icons'
const Container = css`
  width: 100%;
  min-height: calc(100vh - 200px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  & img {
    width: 100%;
  }
`
const ControlsContainer = styled.div<{ centerController?: boolean }>`
  position: absolute;
  z-index: 2;
  ${({ centerController }) =>
    centerController
      ? `right: 24px;
  top: 40%;`
      : `right: 16px;
  top: 16px;`}
  user-select: none;
  border-radius: 2px;

  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
  & div {
    text-align: center;
    cursor: pointer;
    height: 40px;
    width: 40px;

    border-bottom: 1px solid ${({ theme }) => theme.colors.disabled};
    & svg {
      height: 100%;
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
    }
    &:last-child {
      border: none;
    }
    &:active {
      box-shadow: 0px 0px 5px 1px ${({ theme }) => theme.colors.disabled};
    }
  }
`

// cast to any because of styled-components bug
// https://stackoverflow.com/questions/53724583/why-this-wrapped-styled-component-errors-has-no-properties-in-common-with/53902817#53902817
const StyledReactPanZoom = styled(ReactPanZoom)`
  ${Container};
` as any

interface IProps {
  image: string
  controllerCenter?: boolean
}

export default class PanViewer extends React.Component<IProps> {
  state = {
    dx: 0,
    dy: 0,
    zoom: 1,
    rotation: 0
  }

  renderPanZoomControls = (centerController?: boolean) => {
    return (
      <ControlsContainer centerController={centerController}>
        <div onClick={this.zoomIn}>
          <ZoomIn />
        </div>
        <div onClick={this.zoomOut}>
          <ZoomOut />
        </div>
        <div onClick={this.rotateLeft}>
          <RotateLeft />
        </div>
      </ControlsContainer>
    )
  }
  render() {
    return (
      <React.Fragment>
        {this.renderPanZoomControls(this.props.controllerCenter)}
        <StyledReactPanZoom
          zoom={this.state.zoom}
          pandx={this.state.dx}
          pandy={this.state.dy}
          onPan={this.onPan}
          rotation={this.state.rotation}
          key={this.state.dx}
        >
          <img
            style={{
              transform: `rotate(${this.state.rotation * 90}deg)`
            }}
            src={this.props.image}
            alt="Supporting Document"
          />
        </StyledReactPanZoom>
      </React.Fragment>
    )
  }

  zoomIn = () => {
    this.setState({
      zoom: this.state.zoom + 0.2
    })
  }

  zoomOut = () => {
    if (this.state.zoom >= 1) {
      this.setState({
        zoom: this.state.zoom - 0.2
      })
    }
  }
  rotateLeft = () => {
    if (this.state.rotation === -3) {
      this.setState({
        rotation: 0
      })
    } else {
      this.setState({
        rotation: this.state.rotation - 1
      })
    }
  }

  onPan = (dx: number, dy: number) => {
    this.setState({
      dx,
      dy
    })
  }
}
