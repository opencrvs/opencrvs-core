import * as React from 'react'
import styled from 'styled-components'
import { Document, Page } from 'react-pdf'
import { Pagination, Spinner } from '../../interface'

const Container = styled.div`
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${({ theme }) => theme.colors.white};
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
