import * as React from 'react'
import styled from 'styled-components'
import { PaperClip } from '@opencrvs/components/lib/icons'
import { IFileValue, IAttachmentValue } from '@register/forms'
import { Spinner } from '@opencrvs/components/lib/interface'
import { withTheme, ITheme } from '@register/styledComponents'

const Wrapper = styled.div`
  ${({ theme }) => theme.fonts.bodyStyle};
`
const PreviewLink = styled.div<{ disabled?: boolean }>`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.primary};
  font-style: normal;
  text-decoration-line: underline;
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

const ProcessingSpinner = styled(Spinner)`
  margin-left: auto;
`

type IProps = {
  documents?: IFileValue[] | null
  processingDocuments?: Array<{ label: string }>
  attachment?: IAttachmentValue
  label?: string
  theme: ITheme
  onSelect: (document: IFileValue | IAttachmentValue) => void
}

class DocumentListPreviewComponent extends React.Component<IProps> {
  render() {
    const {
      documents,
      processingDocuments,
      label,
      attachment,
      theme
    } = this.props
    return (
      <Wrapper>
        {documents &&
          documents.map((document: IFileValue, key: number) => (
            <PreviewLink key={key} onClick={_ => this.props.onSelect(document)}>
              <PaperClip />
              <span>{document.optionValues[1]}</span>
            </PreviewLink>
          ))}
        {processingDocuments &&
          processingDocuments.map(({ label }) => (
            <PreviewLink disabled={true} key={label}>
              <PaperClip stroke={theme.colors.disabled} />
              <span>{label}</span>
              <ProcessingSpinner
                size={24}
                id={`document_${label}_processing`}
              />
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

export const DocumentListPreview = withTheme(DocumentListPreviewComponent)
