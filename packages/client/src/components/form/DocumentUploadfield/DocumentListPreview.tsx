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
import { LinkButton, CircleButton } from '@opencrvs/components/lib/buttons'

const Wrapper = styled.div``

const PreviewContainer = styled.div`
  background: ${({ theme }) => theme.colors.grey100};
  padding: 8px 16px;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  border-radius: 4px;
  height: 48px;
  margin: 8px 0px;
  display: flex;
  gap: 8px;
  flex-flow: row;
`

const ProcessingSpinner = styled(Spinner)`
  margin-left: auto;
`

const DeleteContainer = styled.div`
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
              <PaperClip />
              <LinkButton
                isBoldLink
                id={`document_${(document.optionValues[1] as string).replace(
                  /\s/g,
                  ''
                )}_link`}
                key={key}
                onClick={() => this.props.onSelect(document)}
              >
                <span>
                  {this.getFormattedLabelForDocType(
                    document.optionValues[1] as string
                  ) || document.optionValues[1]}
                </span>
              </LinkButton>
              <DeleteContainer>
                <CircleButton
                  id="preview_delete"
                  onClick={() => onDelete && onDelete(document)}
                >
                  <Delete color="red" />
                </CircleButton>
              </DeleteContainer>
            </PreviewContainer>
          ))}
        {processingDocuments &&
          processingDocuments.map(({ label }) => (
            <PreviewContainer key={label}>
              <PaperClip stroke={theme.colors.grey400} />
              <LinkButton isBoldLink disabled={true} key={label}>
                <span>{this.getFormattedLabelForDocType(label) || label}</span>
              </LinkButton>
              <DeleteContainer>
                <ProcessingSpinner
                  size={24}
                  id={`document_${label}_processing`}
                />
              </DeleteContainer>
            </PreviewContainer>
          ))}
        {attachment && attachment.data && label && (
          <PreviewContainer>
            <PaperClip />
            <LinkButton
              isBoldLink
              onClick={() => this.props.onSelect(attachment)}
            >
              <span>{this.getFormattedLabelForDocType(label) || label}</span>
            </LinkButton>
            <DeleteContainer>
              <CircleButton
                id="preview_delete"
                onClick={() => onDelete && onDelete(attachment)}
              >
                <Delete color="red" />
              </CircleButton>
            </DeleteContainer>
          </PreviewContainer>
        )}
      </Wrapper>
    )
  }
}

export const DocumentListPreview = withTheme(DocumentListPreviewComponent)
