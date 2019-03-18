import * as React from 'react'
import styled from 'styled-components'
import { isEqual } from 'lodash'

const ImageContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.imageContainerBackground};
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
  image: string
}

export class DocumentImage extends React.Component<IProps> {
  shouldComponentUpdate(nextProps: IProps) {
    return !isEqual(nextProps, this.props)
  }

  render() {
    const { image } = this.props
    return <ImageContainer>{image && <Image src={image} />}</ImageContainer>
  }
}
