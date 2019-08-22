import * as React from 'react'
import styled from 'styled-components'
import { PaperClip } from '@opencrvs/components/lib/icons'
import { IFileValue, IAttachmentValue } from '@register/forms'

const Wrapper = styled.div`
  ${({ theme }) => theme.fonts.bodyStyle};
`
const PreviewLink = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  padding: 5px 10px;
  margin: 10px 0px;
  display: flex;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.background};
  span {
    margin-left: 8px;
  }

  &:hover span {
    text-decoration: underline;
  }
`

type IProps = {
  documents?: IFileValue[] | null
  attachment?: IAttachmentValue
  label?: string
  onSelect: (document: IFileValue | IAttachmentValue) => void
}

export class DocumentListPreview extends React.Component<IProps> {
  render() {
    const { documents, label, attachment } = this.props
    return (
      <Wrapper>
        {documents &&
          documents.map((document: IFileValue, key: number) => (
            <PreviewLink key={key} onClick={_ => this.props.onSelect(document)}>
              <PaperClip />
              <span>{document.optionValues[1]}</span>
            </PreviewLink>
          ))}
        {attachment && attachment.data && label && (
          <PreviewLink onClick={_ => this.props.onSelect(attachment)}>
            <PaperClip />
            <span>{label}</span>
          </PreviewLink>
        )}
      </Wrapper>
    )
  }
}
