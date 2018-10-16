import * as React from 'react'
import styled from 'styled-components'
import { Cross } from '../icons'
import Uploaded from '../icons/Uploaded'

interface IProps {
  file: {
    subject: string
    type: string
    data: string
  }
  onDelete: () => void
  onPreview: () => void
}

const Container = styled.div`
  display: flex;
`

const Link = styled.a`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 16px;
  text-decoration: underline;
`

const PreviewLink = styled(Link)`
  color: #4c68c1;
`

const DeleteLink = styled(Link)`
  color: ${({ theme }) => theme.colors.danger};
  margin-left: 8px;
`

const FileContainer = styled.div`
  height: 75px;
  min-width: 300px;
  border: 1px solid #5e93ed;
  border-radius: 1px;
  background-color: #f9f9f9;
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.11);

  flex: 1;
  display: flex;
  align-items: center;
  padding: 16px;
`

const DeleteContainer = styled.div`
  height: 75px;
  margin-left: 30px;
  margin-right: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const MetadataContainer = styled.div`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 18px;
  color: #35495d;

  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 0 16px;
`

export class FileItem extends React.Component<IProps> {
  render() {
    const { subject, type } = this.props.file
    const { onDelete, onPreview } = this.props

    return (
      <Container>
        <FileContainer>
          <Uploaded />
          <MetadataContainer>
            <span>{subject}</span>
            <span>{type}</span>
          </MetadataContainer>
          <PreviewLink onClick={onPreview}>Preview</PreviewLink>
        </FileContainer>
        <DeleteContainer onClick={onDelete}>
          <Cross color="#D53F3F" />
          <DeleteLink>Delete</DeleteLink>
        </DeleteContainer>
      </Container>
    )
  }
}
