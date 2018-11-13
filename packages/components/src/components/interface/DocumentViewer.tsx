import * as React from 'react'
import styled from 'styled-components'
import { SupportingDocument } from './../icons'
import { Select, ISelectOption as SelectComponentOptions } from './../forms'

const Header = styled.div`
  padding: 14px 18px;
  border-bottom: solid 1px ${({ theme }) => theme.colors.background};
  margin-bottom: 15px;
  display: flex;
`
const Icon = styled.div`
  margin-right: 15px;
`
const TitleContainer = styled.div`
  height: 49px;
  width: 276px;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 18px;
  line-height: 24px;
`
const Title = styled.div`
  font-weight: bold;
`
const Clear = styled.div`
  clear: both;
`
const ImageContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.imageContainerBackground};
  margin-top: 16px;
  text-align: center;
  min-height: calc(100vh - 200px);
  position: relative;
`
const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`
interface IProps {
  title: string
  tagline?: string
  icon?: React.ReactNode
  options: SelectComponentOptions[]
}

interface IState {
  selectedOption: string
}

export class DocumentViewer extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      selectedOption: ''
    }
  }

  render() {
    const { title, tagline, options, icon } = this.props
    return (
      <>
        <Header>
          <Icon>{icon || (() => <SupportingDocument />)}</Icon>
          <TitleContainer>
            <Title>{title}</Title>
            {tagline}
          </TitleContainer>
          <Clear />
        </Header>

        <Select
          id="SelectFile"
          options={options}
          value={this.state.selectedOption as string}
          onChange={(val: string) => {
            this.setState({ selectedOption: val })
          }}
        />

        <ImageContainer>
          {this.state.selectedOption && (
            <Image src={this.state.selectedOption} />
          )}
        </ImageContainer>
      </>
    )
  }
}
