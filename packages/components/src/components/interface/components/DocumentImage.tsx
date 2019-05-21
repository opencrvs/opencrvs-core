import * as React from 'react'
import styled from 'styled-components'
import { isEqual } from 'lodash'
import PanViewer from './PanViewer'
const ImageContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.placeholder};
  text-align: center;
  min-height: calc(100vh - 200px);
  position: relative;
  overflow: hidden;
`
interface IProps {
  image: string
}

export class DocumentImage extends React.Component<IProps> {
  shouldComponentUpdate(nextProps: IProps) {
    return !isEqual(nextProps, this.props)
  }

  render() {
    const { image } = this.props
    return (
      <ImageContainer>
        {image && <PanViewer key={Math.random()} image={image} />}
      </ImageContainer>
    )
  }
}
