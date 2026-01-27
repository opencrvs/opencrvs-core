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
import styled, { keyframes } from 'styled-components'
import { usePreviewPdf } from '@client/v2-events/hooks/usePreviewPdf'

const ViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  flex: 1;
  overflow-y: auto; /* vertical scrolling */
  overflow-x: hidden; /* hide horizontal scroll */
  display: flex;
  flex-direction: column; /* stack pages vertically */
  align-items: center; /* center pages horizontally */
  background: ${({ theme }) => theme.colors.white};

  & canvas {
    margin-bottom: 16px; /* spacing between pages */
    max-width: 90%; /* prevent overflow */
    height: auto; /* maintain aspect ratio */
    display: block;
  }
`

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.white};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
`

const ErrorBox = styled.div`
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  z-index: 20;
  ${({ theme }) => theme.fonts.bold12};
`

const SpinnerAnimation = keyframes`
  to { transform: rotate(360deg); }
`

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 4px solid ${({ theme }) => theme.colors.redLight};
  border-top-color: ${({ theme }) => theme.colors.supportingCopy};
  border-radius: 50%;
  animation: ${SpinnerAnimation} 1s linear infinite;
  margin-bottom: 8px;
`

export function SimplePdfPreview({
  pdfUrl,
  title
}: {
  pdfUrl: string
  title?: string
}) {
  const { containerRef, loading, error } = usePreviewPdf(pdfUrl)

  return (
    <ViewerContainer ref={containerRef} aria-label={title}>
      {loading && (
        <LoadingOverlay>
          <Spinner />
          {'Loading...'}
        </LoadingOverlay>
      )}
      {error && <ErrorBox>{error}</ErrorBox>}
    </ViewerContainer>
  )
}
