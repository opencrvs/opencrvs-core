/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as React from 'react'
import styled from 'styled-components'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import { ISelectOption } from '@opencrvs/components/lib/Select'
import { Link } from '@opencrvs/components/lib/Link/Link'
import { Icon } from '@opencrvs/components/lib/Icon/Icon'
import { Button } from '@opencrvs/components/lib/Button/Button'
import { IFileValue, IAttachmentValue } from '@client/forms'

const Wrapper = styled.div`
  max-width: 100%;
  & > *:last-child {
    margin-bottom: 8px;
    border-bottom: 1.5px solid ${({ theme }) => theme.colors.grey100};
  }
`
const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  border-top: 1.5px solid ${({ theme }) => theme.colors.grey100};
  height: 48px;
  padding: 0px 10px;
`

const SpinnerContainer = styled(Spinner)`
  margin-right: 6px;
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

interface Props {
  id?: string
  documents?: IFileValue[] | null
  processingDocuments?: Array<{ label: string }>
  attachment?: IAttachmentValue
  label?: string
  onSelect: (document: IFileValue | IAttachmentValue) => void
  dropdownOptions?: ISelectOption[]
  onDelete?: (image: IFileValue | IAttachmentValue) => void
  inReviewSection?: boolean
}

export const DocumentListPreview = ({
  id,
  documents,
  processingDocuments,
  attachment,
  label,
  onSelect,
  dropdownOptions,
  onDelete,
  inReviewSection
}: Props) => {
  const getFormattedLabelForDocType = (docType: string) => {
    const matchingOptionForDocType =
      dropdownOptions &&
      dropdownOptions.find((option) => option.value === docType)
    return matchingOptionForDocType && matchingOptionForDocType.label
  }

  return (
    <Wrapper id={`preview-list-${id}`}>
      {documents &&
        documents.map((document: IFileValue, key: number) => (
          <Container key={`preview_${key}`}>
            <Label>
              <Icon color="grey600" name="Paperclip" size="large" />
              <Link
                key={key}
                id={`document_${(document.optionValues[1] as string).replace(
                  /\s/g,
                  ''
                )}_link`}
                onClick={(_) => onSelect(document)}
              >
                <span>
                  {(inReviewSection &&
                    dropdownOptions &&
                    dropdownOptions[key]?.label) ||
                    getFormattedLabelForDocType(
                      document.optionValues[1] as string
                    ) ||
                    (document.optionValues[1] as string)}
                </span>
              </Link>
            </Label>
            {onDelete && (
              <Button
                aria-label="Delete attachment"
                id="preview_delete"
                size="small"
                type="icon"
                onClick={() => onDelete(document)}
              >
                <Icon color="red" name="Trash" size="small" />
              </Button>
            )}
          </Container>
        ))}
      {processingDocuments &&
        processingDocuments.map(({ label }) => (
          <Container key={label}>
            <Label>
              <Icon color="grey400" name="Paperclip" size="large" />
              <Link key={label} disabled={true}>
                <span>{getFormattedLabelForDocType(label) || label}</span>
              </Link>
            </Label>
            <SpinnerContainer id={`document_${label}_processing`} size={20} />
          </Container>
        ))}
      {attachment && attachment.data && label && (
        <Container>
          <Label>
            <Icon color="grey600" name="Paperclip" size="medium" />
            <Link onClick={(_) => onSelect(attachment)}>
              <span>{getFormattedLabelForDocType(label) || label}</span>
            </Link>
          </Label>
          <Button
            aria-label="Delete attachment"
            id="preview_delete"
            size="small"
            type="icon"
            onClick={() => onDelete && onDelete(attachment)}
          >
            <Icon color="red" name="Trash" size="small" />
          </Button>
        </Container>
      )}
    </Wrapper>
  )
}
