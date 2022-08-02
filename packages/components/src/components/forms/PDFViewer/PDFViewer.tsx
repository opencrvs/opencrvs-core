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
import { Document, Page } from 'react-pdf'
import { Pagination, Spinner } from '../../interface'

const Container = styled.div`
  ${({ theme }) => theme.shadows.heavy};
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${({ theme }) => theme.colors.white};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    overflow-x: scroll;
    align-items: start;
  }
`

interface IPDFViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  pdfSource: string | null
}

interface IPDFViewerState {
  currentPage: number
  numPages: number
}

class PDFViewer extends React.Component<IPDFViewerProps, IPDFViewerState> {
  constructor(props: IPDFViewerProps) {
    super(props)
    this.state = { currentPage: 1, numPages: 0 }
  }

  onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    this.setState({ numPages })
  }

  onPageChange = (pageNumber: number) => {
    this.setState({
      currentPage: pageNumber
    })
  }

  render() {
    const { pdfSource, ...otherProps } = this.props
    const { currentPage, numPages } = this.state

    return (
      <Container {...otherProps}>
        <Document
          loading={<Spinner id="pdf-loader-spinner" />}
          file={pdfSource}
          onLoadSuccess={this.onDocumentLoadSuccess}
        >
          <Page pageNumber={currentPage} />
        </Document>
        {this.state.numPages > 1 && (
          <Pagination
            initialPage={currentPage}
            totalPages={numPages}
            onPageChange={this.onPageChange}
          />
        )}
      </Container>
    )
  }
}

export { PDFViewer }
