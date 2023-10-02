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
import React from 'react'
import styled from 'styled-components'
import { Select, ISelectOption as SelectComponentOptions } from '../Select'
import PanViewer from './components/PanViewer'
import PanControls from './components/PanControls'
import { isEqual } from 'lodash'

const ViewerWrapper = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  border-radius: 4px;
  box-sizing: border-box;
  height: calc(100vh - 104px);
  width: 100%;
  overflow: hidden;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const ViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
`
const ViewerHeader = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 99;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`

const ViewerImage = styled.div`
  display: flex;
  height: 700px;
  align-items: center;
`

export interface IDocumentViewerOptions {
  selectOptions: SelectComponentOptions[]
  documentOptions: SelectComponentOptions[]
}

interface IProps {
  id?: string
  options: IDocumentViewerOptions
  children?: React.ReactNode
}

interface IState {
  selectedOption: string
  selectedDocument: string
  zoom: number
  rotation: number
}

export class DocumentViewer extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      selectedOption:
        typeof this.props.options.selectOptions[0] !== 'undefined'
          ? this.props.options.selectOptions[0].value
          : '',
      selectedDocument:
        typeof this.props.options.documentOptions[0] !== 'undefined'
          ? this.props.options.documentOptions[0].value
          : '',
      zoom: 1,
      rotation: 0
    }
  }

  componentDidUpdate(prevProps: IProps) {
    if (!isEqual(prevProps.options, this.props.options)) {
      this.setState({
        selectedOption:
          typeof this.props.options.selectOptions[0] !== 'undefined'
            ? this.props.options.selectOptions[0].value
            : '',
        selectedDocument:
          typeof this.props.options.documentOptions[0] !== 'undefined'
            ? this.props.options.documentOptions[0].value
            : ''
      })
    }
  }

  zoomIn = () => {
    this.setState((prevState) => ({ ...prevState, zoom: prevState.zoom + 0.2 }))
  }

  zoomOut = () => {
    this.setState((prevState) => {
      if (prevState.zoom >= 1) {
        return { ...prevState, zoom: prevState.zoom - 0.2 }
      } else {
        return prevState
      }
    })
  }

  rotateLeft = () => {
    this.setState((prevState) => ({
      rotation: (prevState.rotation - 90) % 360
    }))
  }

  render() {
    const { options, children, id } = this.props
    const isSupportingDocumentsEmpty =
      this.state.selectedDocument && this.state.selectedDocument.length > 0

    return (
      <ViewerWrapper id={id}>
        <>
          <ViewerContainer>
            <ViewerHeader>
              <Select
                id="select_document"
                options={options.selectOptions}
                color="inherit"
                value={this.state.selectedOption as string}
                onChange={(val: string) => {
                  const imgArray = options.documentOptions.filter((doc) => {
                    return doc.label === val
                  })
                  if (imgArray[0]) {
                    this.setState({
                      selectedOption: val,
                      selectedDocument: imgArray[0].value
                    })
                  }
                }}
              />
              <PanControls
                zoomIn={this.zoomIn}
                zoomOut={this.zoomOut}
                rotateLeft={this.rotateLeft}
              />
            </ViewerHeader>
            {isSupportingDocumentsEmpty && (
              <ViewerImage>
                <PanViewer
                  id="document_image"
                  image={this.state.selectedDocument}
                  zoom={this.state.zoom}
                  rotation={this.state.rotation}
                />
              </ViewerImage>
            )}
            {children}
          </ViewerContainer>
        </>
      </ViewerWrapper>
    )
  }
}
