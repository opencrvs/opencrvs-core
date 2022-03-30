/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import styled from 'styled-components'
import { PaperClip, Delete } from '@opencrvs/components/lib/icons'
import { IFileValue, IAttachmentValue, IFormFieldValue } from '@client/forms'
import { Spinner } from '@opencrvs/components/lib/interface'
import { withTheme, ITheme } from '@client/styledComponents'
import { ISelectOption } from '@opencrvs/components/lib/forms'
import { Button } from '@opencrvs/components/lib/buttons/Button'
import { TertiaryButton } from '@opencrvs/components/lib/buttons'
const Wrapper = styled.div`
  ${({ theme }) => theme.fonts.reg16};
`
const PreviewLink = styled.div<{ disabled?: boolean }>`
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.primary};
  align-items: center;
  display: flex;
  cursor: pointer;
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

const PreviewContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  ${({ theme }) => theme.fonts.bold16};
  font-style: normal;
  text-decoration-line: underline;
  padding: 5px 10px;
  margin: 10px 0px;
  display: flex;
  flex-flow: row;
`

const IconContainer = styled.div`
  margin-left: auto;
`

type IProps = {
  id?: string
  documents?: IFileValue[] | null
  processingDocuments?: Array<{ label: string }>
  attachment?: IAttachmentValue
  label?: string
  theme: ITheme
  onSelect: (document: IFileValue | IAttachmentValue) => void
  dropdownOptions?: ISelectOption[]
  onDelete?: (image: IFileValue | IAttachmentValue) => void
}

class DocumentListPreviewComponent extends React.Component<IProps> {
  getFormattedLabelForDocType = (docType: string) => {
    const matchingOptionForDocType =
      this.props.dropdownOptions &&
      this.props.dropdownOptions.find((option) => option.value === docType)
    return matchingOptionForDocType && matchingOptionForDocType.label
  }
  render() {
    const {
      id,
      documents,
      processingDocuments,
      label,
      attachment,
      theme,
      onDelete
    } = this.props
    return (
      <Wrapper id={`preview-list-${id}`}>
        {documents &&
          documents.map((document: IFileValue, key: number) => (
            <PreviewContainer key={`preview_${key}`}>
              <PreviewLink
                id={`document_${(document.optionValues[1] as string).replace(
                  /\s/g,
                  ''
                )}_link`}
                key={key}
                onClick={(_) => this.props.onSelect(document)}
              >
                <PaperClip />
                <span>
                  {this.getFormattedLabelForDocType(
                    document.optionValues[1] as string
                  ) || document.optionValues[1]}
                </span>
              </PreviewLink>
              <IconContainer>
                <TertiaryButton
                  id="preview_delete"
                  icon={() => <Delete color="red" />}
                  onClick={() => onDelete && onDelete(document)}
                />
              </IconContainer>
            </PreviewContainer>
          ))}
        {processingDocuments &&
          processingDocuments.map(({ label }) => (
            <PreviewContainer key={label}>
              <PreviewLink disabled={true} key={label}>
                <PaperClip stroke={theme.colors.disabled} />
                <span>{this.getFormattedLabelForDocType(label) || label}</span>
              </PreviewLink>
              <IconContainer>
                <ProcessingSpinner
                  size={24}
                  id={`document_${label}_processing`}
                />
              </IconContainer>
            </PreviewContainer>
          ))}
        {attachment && attachment.data && label && (
          <PreviewContainer>
            <PreviewLink onClick={(_) => this.props.onSelect(attachment)}>
              <PaperClip />
              <span>{this.getFormattedLabelForDocType(label) || label}</span>
            </PreviewLink>
            <IconContainer>
              <TertiaryButton
                id="preview_delete"
                icon={() => <Delete color="red" />}
                onClick={() => onDelete && onDelete(attachment)}
              />
            </IconContainer>
          </PreviewContainer>
        )}
      </Wrapper>
    )
  }
}

export const DocumentListPreview = withTheme(DocumentListPreviewComponent)
