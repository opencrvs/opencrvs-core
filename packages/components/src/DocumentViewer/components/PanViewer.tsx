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
import { Button } from '../../Button'
import { Icon } from '../../Icon'
import styled, { css } from 'styled-components'

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
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  height: 64px;
  width: 100%;
  position: absolute;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-direction: row;
  z-index: 10;
`

/* eslint-disable @typescript-eslint/no-explicit-any */
// cast to any because of styled-components bug
// https://stackoverflow.com/questions/53724583/why-this-wrapped-styled-component-errors-has-no-properties-in-common-with/53902817#53902817
const StyledReactPanZoom = styled(ReactPanZoom)`
  ${Container};
` as any
/* eslint-enable @typescript-eslint/no-explicit-any */

interface IProps {
  image?: string
  controllerCenter?: boolean
}

export default class PanViewer extends React.Component<IProps> {
  state = {
    dx: 0,
    dy: 0,
    zoom: 1,
    rotation: 0
  }

  renderPanZoomControls = () => {
    return (
      <ControlsContainer>
        <Button type="icon" size="medium" onClick={this.zoomIn}>
          <Icon name="MagnifyingGlassPlus" />
        </Button>
        <Button type="icon" size="medium" onClick={this.zoomOut}>
          <Icon name="MagnifyingGlassMinus" />
        </Button>
        <Button type="icon" size="medium" onClick={this.rotateLeft}>
          <Icon name="ArrowCounterClockwise" />
        </Button>
      </ControlsContainer>
    )
  }
  render() {
    return (
      <React.Fragment>
        {this.renderPanZoomControls()}
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
