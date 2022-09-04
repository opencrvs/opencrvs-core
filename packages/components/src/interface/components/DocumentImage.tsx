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
import styled from 'styled-components'
import { isEqual } from 'lodash'
import PanViewer from './PanViewer'
const ImageContainer = styled.div`
  top: 0px;
  text-align: center;
  height: 100%;
  position: absolute;
  overflow: hidden;
`
interface IProps {
  id?: string
  image: string
}

export class DocumentImage extends React.Component<IProps> {
  shouldComponentUpdate(nextProps: IProps) {
    return !isEqual(nextProps, this.props)
  }

  render() {
    const { image, id } = this.props
    return (
      <ImageContainer id={id}>
        {image && <PanViewer key={Math.random()} image={image} />}
      </ImageContainer>
    )
  }
}
