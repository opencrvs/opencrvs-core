import * as React from 'react'
import * as Sticky from 'react-stickynode'
import styled from 'styled-components'
import { Select, ISelectOption as SelectComponentOptions } from './../forms'
import { DocumentImage } from './components/DocumentImage'

const SelectContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.lightGreyBackground};
  width: 200px;
  margin-top: 10px;
  margin-left: 10px;
`
const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.white};
  box-sizing: border-box;
  height: 550px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
export interface IDocumentViewerOptions {
  selectOptions: SelectComponentOptions[]
  documentOptions: SelectComponentOptions[]
}

interface IProps {
  title: string
  tagline?: string
  icon?: React.ReactNode
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
    const { options } = this.props
    return (
      <Sticky enabled={true} top="#form_tabs_container">
        <Container>
          <SelectContainer>
            <Select
              id="selectDocument"
              options={options.selectOptions}
              isSmallSized={true}
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
          </SelectContainer>
          {this.state.selectedDocument && (
            <DocumentImage image={this.state.selectedDocument} />
          )}
        </Container>
      </Sticky>
    )
  }
}
