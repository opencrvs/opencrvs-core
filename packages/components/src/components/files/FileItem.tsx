import * as React from 'react'
import styled, { withTheme } from 'styled-components'
import { Cross } from '../icons'
import Uploaded from '../icons/Uploaded'
import { ITheme } from '../theme'

interface IProps {
  file: {
    subject: string
    type: string
    data: string
  }
  onDelete: () => void
  onPreview: () => void
  theme: ITheme
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
  color: ${({ theme }) => theme.colors.primary};
`

const DeleteLink = styled(Link)`
  color: ${({ theme }) => theme.colors.danger};
  margin-left: 8px;
`

const FileContainer = styled.div`
  height: 75px;
  min-width: 300px;
  border: 1px solid ${({ theme }) => theme.colors.cardGradientEnd};
  border-radius: 1px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
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
  color: ${({ theme }) => theme.colors.secondary};

  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 0 16px;
`

class FileItemComponent extends React.Component<IProps> {
  render() {
    const { subject, type } = this.props.file
    const { onDelete, onPreview, theme } = this.props

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
          <Cross color={theme.colors.danger} />
          <DeleteLink>Delete</DeleteLink>
        </DeleteContainer>
      </Container>
    )
  }
}

export const FileItem = withTheme(FileItemComponent)
