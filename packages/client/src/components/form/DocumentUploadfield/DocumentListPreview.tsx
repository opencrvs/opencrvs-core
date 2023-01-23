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
import { IFileValue, IAttachmentValue } from '@client/forms'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import { withTheme, ITheme } from '@client/styledComponents'
import { ISelectOption } from '@opencrvs/components/lib/Select'
import { ENABLE_REVIEW_ATTACHMENTS_SCROLLING } from '@client/utils/constants'
import { Link } from '@opencrvs/components/lib/Link/Link'
import { Icon } from '@opencrvs/components/lib/Icon/Icon'
import { Button } from '@opencrvs/components/lib/Button/Button'

const Wrapper = styled.div`
  margin: 8px 0px;
  max-width: 100%;
`

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
  height: 40px;
  padding: 0px 8px;
`

const SpinnerContainer = styled(Spinner)`
  margin-right: 6px;
`

const DeleteContainer = styled(Button)`
  min-width: 32px;
`

const Label = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  svg {
    flex-shrink: 0;
  }
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
  inReviewSection?: boolean
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
            <Container key={`preview_${key}`}>
              <Label>
                <Icon color="currentColor" name="Paperclip" size="medium" />
                <Link
                  id={`document_${(document.optionValues[1] as string).replace(
                    /\s/g,
                    ''
                  )}_link`}
                  key={key}
                  onClick={(_) => this.props.onSelect(document)}
                >
                  <span>
                    {(!ENABLE_REVIEW_ATTACHMENTS_SCROLLING &&
                      this.props.inReviewSection &&
                      this.props.dropdownOptions &&
                      this.props.dropdownOptions[key]?.label) ||
                      this.getFormattedLabelForDocType(
                        document.optionValues[1] as string
                      ) ||
                      document.optionValues[1]}
                  </span>
                </Link>
              </Label>
              {onDelete && (
                <DeleteContainer
                  id="preview_delete"
                  type="icon"
                  size="small"
                  aria-label="Delete attachment"
                  onClick={() => onDelete(document)}
                >
                  <Icon color="red" name="Trash2" size="small" />
                </DeleteContainer>
              )}
            </Container>
          ))}
        {processingDocuments &&
          processingDocuments.map(({ label }) => (
            <Container key={label}>
              <Label>
                <Icon color="disabled" name="Paperclip" size="medium" />
                <Link disabled={true} key={label}>
                  <span>
                    {this.getFormattedLabelForDocType(label) || label}
                  </span>
                </Link>
              </Label>
              <SpinnerContainer size={20} id={`document_${label}_processing`} />
            </Container>
          ))}
        {attachment && attachment.data && label && (
          <Container>
            <Label>
              <Icon color="grey600" name="Paperclip" size="medium" />
              <Link onClick={(_) => this.props.onSelect(attachment)}>
                <span>{this.getFormattedLabelForDocType(label) || label}</span>
              </Link>
            </Label>
            <DeleteContainer
              id="preview_delete"
              type="icon"
              size="small"
              aria-label="Delete attachment"
              onClick={() => onDelete && onDelete(attachment)}
            >
              <Icon color="red" name="Trash2" size="small" />
            </DeleteContainer>
          </Container>
        )}
      </Wrapper>
    )
  }
}

export const DocumentListPreview = withTheme(DocumentListPreviewComponent)
