import * as React from 'react'
import * as Sticky from 'react-stickynode'
import styled from 'styled-components'
import { SupportingDocument } from './../icons'
import { Select, ISelectOption as SelectComponentOptions } from './../forms'
import { DocumentImage } from './components/DocumentImage'
import { isEqual } from 'lodash'

const Header = styled.div`
  border-bottom: solid 1px ${({ theme }: any) => theme.colors.background};
  margin-bottom: 15px;
  display: flex;
  align-items: center;
`

const Box = styled.div`
  padding: 14px 18px;
`
const Icon = styled.div`
  margin-right: 15px;
`
const TitleContainer = styled.div`
  width: 276px;
  color: ${({ theme }: any) => theme.colors.secondary};
  font-size: 18px;
  font-family: ${({ theme }: any) => theme.fonts.regularFont};
`
const Title = styled.div`
  font-weight: bold;
`
const SelectContainer = styled.div`
  width: 70%;
`
const WhiteBackground = styled.div`
  background-color: ${({ theme }: any) => theme.colors.white};

  @media (max-width: ${({ theme }: any) => theme.grid.breakpoints.lg}px) {
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
    const { title, tagline, options, icon } = this.props
    return (
      <Sticky enabled={true} top="#form_tabs_container">
        <WhiteBackground>
          <Box>
            <Header>
              <Icon>{icon || <SupportingDocument />}</Icon>
              <TitleContainer>
                <Title>{title}</Title>
                {tagline}
              </TitleContainer>
            </Header>

            <SelectContainer>
              <Select
                id="selectDocument"
                options={options.selectOptions}
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
          </Box>

          {this.state.selectedDocument && (
            <DocumentImage image={this.state.selectedDocument} />
          )}
        </WhiteBackground>
      </Sticky>
    )
  }
}
