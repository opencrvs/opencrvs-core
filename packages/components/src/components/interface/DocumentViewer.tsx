import * as React from 'react'
import styled from 'styled-components'
import { Select, ISelectOption as SelectComponentOptions } from './../forms'
import { DocumentImage } from './components/DocumentImage'

const Container = styled.div`
  width: calc(50vw - 50px);
  position: fixed;
  top: 94px;
  background-color: ${({ theme }) => theme.colors.background};
  outline: 2px solid ${({ theme }) => theme.colors.chartAreaGradientStart};
  box-sizing: border-box;
  height: 720px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }

  > div {
    width: 100%;
    padding-top: 16px;
    padding-left: 16px;
  }

  > div#select_document {
    z-index: 2;
    background: ${({ theme }) => theme.colors.lightGreyBackground};
    top: 16px;
    left: 16px;
    width: 250px;
    padding-top: 0px;
    padding-left: 0px;
  }

  > div#document_image {
    padding-top: 0px;
    padding-left: 0px;
  }
`
export interface IDocumentViewerOptions {
  selectOptions: SelectComponentOptions[]
  documentOptions: SelectComponentOptions[]
}

interface IProps {
  id?: string
  options: IDocumentViewerOptions
}

interface IState {
  selectedOption: string
  selectedDocument: string
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
          : ''
    }
  }

  render() {
    const { options, children, id } = this.props

    return (
      <Container id={id}>
        {options.documentOptions.length > 0 && (
          <>
            <Select
              id="select_document"
              options={options.selectOptions}
              color="inherit"
              value={this.state.selectedOption as string}
              onChange={(val: string) => {
                const imgArray = options.documentOptions.filter(doc => {
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
            {this.state.selectedDocument && (
              <DocumentImage
                id="document_image"
                image={this.state.selectedDocument}
              />
            )}
          </>
        )}
        {options.documentOptions.length === 0 && children}
      </Container>
    )
  }
}
