import * as React from 'react'
import { DocumentFields } from './DocumentUploaderWithOption'
import styled from 'styled-components'
import { PaperClip } from '@opencrvs/components/lib/icons'

const Wrapper = styled.div`
  ${({ theme }) => theme.fonts.bodyStyle};
  background: ${({ theme }) => theme.colors.background};
`
const PreviewLink = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  padding: 5px 10px;
  margin: 10px 0px;
  display: flex;
  cursor: pointer;

  span {
    margin-left: 8px;
  }

  &:hover span {
    text-decoration: underline;
  }
`

type IProps = {
  documents: DocumentFields[] | null
  onSelect: (document: DocumentFields) => void
}

export class DocumentListPreview extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props)
  }

  render() {
    const { documents } = this.props

    return (
      documents && (
        <Wrapper>
          {documents.map((document: DocumentFields, key: number) => (
            <PreviewLink key={key} onClick={_ => this.props.onSelect(document)}>
              <PaperClip />
              <span>{document.documentType}</span>
            </PreviewLink>
          ))}
        </Wrapper>
      )
    )
  }
}
