import * as React from 'react'
import styled from 'styled-components'
import { PaperClip } from '@opencrvs/components/lib/icons'
import { IFileValue } from '@register/forms'

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
  documents: IFileValue[] | null
  onSelect: (document: IFileValue) => void
}

export class DocumentListPreview extends React.Component<IProps> {
  render() {
    const { documents } = this.props
    return (
      documents && (
        <Wrapper>
          {documents.map((document: IFileValue, key: number) => (
            <PreviewLink key={key} onClick={_ => this.props.onSelect(document)}>
              <PaperClip />
              <span>{document.optionValues[1]}</span>
            </PreviewLink>
          ))}
        </Wrapper>
      )
    )
  }
}
