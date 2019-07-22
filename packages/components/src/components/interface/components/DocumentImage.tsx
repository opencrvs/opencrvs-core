import * as React from 'react'
import styled from 'styled-components'
import { isEqual } from 'lodash'
import PanViewer from './PanViewer'
const ImageContainer = styled.div`
  top: 0px;
  text-align: center;
  height: 100%;
  position: absolute;
  overflow: hidden;
`
interface IProps {
  id?: string
  image: string
}

export class DocumentImage extends React.Component<IProps> {
  shouldComponentUpdate(nextProps: IProps) {
    return !isEqual(nextProps, this.props)
  }

  render() {
    const { image, id } = this.props
    return (
      <ImageContainer id={id}>
        {image && <PanViewer key={Math.random()} image={image} />}
      </ImageContainer>
    )
  }
}
