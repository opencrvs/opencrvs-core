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
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Select, ISelectOption as SelectComponentOptions } from '../Select'
import PanViewer from './components/PanViewer'
import PanControls from './components/PanControls'

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

export const DocumentViewer = ({ id, options, children }: IProps) => {
  const [selectedOption, setSelectedOption] = useState(
    options.selectOptions[0]?.value || ''
  )
  const [selectedDocument, setSelectedDocument] = useState(
    options.documentOptions[0]?.value || ''
  )
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    setSelectedOption(options.selectOptions[0]?.value || '')
    setSelectedDocument(options.documentOptions[0]?.value || '')
  }, [options])

  const zoomIn = () => {
    setZoom((prev) => prev + 0.2)
  }

  const zoomOut = () => {
    setZoom((prev) => {
      if (prev >= 1) {
        return prev - 0.2
      }
      return prev
    })
  }

  const rotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360)
  }

  const isSupportingDocumentsEmpty =
    selectedDocument && selectedDocument.length > 0

  return (
    <ViewerWrapper id={id}>
      <>
        <ViewerContainer>
          <ViewerHeader>
            <Select
              id="select_document"
              options={options.selectOptions}
              color="inherit"
              value={selectedOption}
              onChange={(val: string) => {
                const imgArray = options.documentOptions.filter((doc) => {
                  return doc.label === val
                })
                if (imgArray[0]) {
                  setSelectedDocument(imgArray[0].value)
                  setSelectedOption(val)
                }
              }}
            />
            <PanControls
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              rotateLeft={rotateLeft}
            />
          </ViewerHeader>
          {isSupportingDocumentsEmpty && (
            <ViewerImage>
              <PanViewer
                id="document_image"
                image={selectedDocument}
                zoom={zoom}
                rotation={rotation}
              />
            </ViewerImage>
          )}
          {children}
        </ViewerContainer>
      </>
    </ViewerWrapper>
  )
}
