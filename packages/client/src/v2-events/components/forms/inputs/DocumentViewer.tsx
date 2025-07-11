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

import styled from 'styled-components'
import React, { useState } from 'react'
import PanControls from '@opencrvs/components/lib/DocumentViewer/components/PanControls'
import PanViewer from '@opencrvs/components/lib/DocumentViewer/components/PanViewer'
import { Option } from '@client/v2-events/utils'
import { Select } from './Select'

/* Based on components/DocumentViewer.tsx */

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
  gap: 8px;
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
export interface DocumentViewerOptionValue {
  filename: string
  url: string
  id: string
}

export function DocumentViewer({
  id,
  options,
  children
}: {
  id?: string
  options: Option<DocumentViewerOptionValue>[]
  children?: React.ReactNode
}) {
  const [selectedOption, setSelectedOption] = useState<
    Option<DocumentViewerOptionValue> | undefined
  >(options[0])

  const onChange = (val: Option<DocumentViewerOptionValue>) =>
    setSelectedOption(val)

  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

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

  return (
    <ViewerWrapper id={id}>
      <ViewerContainer>
        <ViewerHeader>
          <Select
            color="inherit"
            id="select_document"
            options={options}
            value={selectedOption?.value}
            onChange={onChange}
          />
          <PanControls
            rotateLeft={rotateLeft}
            zoomIn={zoomIn}
            zoomOut={zoomOut}
          />
        </ViewerHeader>
        {!!selectedOption && (
          <ViewerImage>
            <PanViewer
              image={selectedOption.value.url}
              rotation={rotation}
              zoom={zoom}
            />
          </ViewerImage>
        )}
        {children}
      </ViewerContainer>
    </ViewerWrapper>
  )
}
