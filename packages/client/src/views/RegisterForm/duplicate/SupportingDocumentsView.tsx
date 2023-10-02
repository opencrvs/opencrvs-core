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
import { IDeclaration } from '@client/declarations'
import {
  DOCUMENT_UPLOADER_WITH_OPTION,
  IAttachmentValue,
  IDocumentUploaderWithOptionsFormField,
  IFileValue
} from '@client/forms'
import { ISelectOption as SelectComponentOptions } from '@opencrvs/components/lib/'
import {
  DocumentViewer,
  IDocumentViewerOptions
} from '@client/../../components/lib'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import {
  getBirthSection,
  getDeathSection,
  getRegisterForm
} from '@client/forms/register/declaration-selectors'
import { Event } from '@client/utils/gateway'
import { isArray } from 'lodash'
import { ZeroDocument } from '@client/views/RegisterForm/review/ReviewSection'
import { DocumentListPreview } from '@client/components/form/DocumentUploadfield/DocumentListPreview'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/review'
import { DocumentPreview } from '@client/components/form/DocumentUploadfield/DocumentPreview'
import { buttonMessages } from '@client/i18n/messages/buttons'
import styled from 'styled-components'

interface IProps {
  declaration: IDeclaration
}

const DocumentListPreviewWrapper = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: block;
  }
`

export const SupportingDocumentsView = (props: IProps) => {
  const { declaration } = props
  const intl = useIntl()
  const eventsRegisterForm = useSelector(getRegisterForm)
  const eventType = String(
    declaration.data.registration.type
  ).toLowerCase() as Event
  const documentsSection = useSelector((state: IStoreState) =>
    eventType.toLowerCase() === 'birth'
      ? getBirthSection(state, 'documents')
      : getDeathSection(state, 'documents')
  )
  const [previewImage, setPreviewImage] = React.useState<IFileValue | null>(
    null
  )

  const getLabelForDoc = (docForWhom: string, docType: string) => {
    const documentSection = eventsRegisterForm[eventType].sections.find(
      (section) => section.id === 'documents'
    )
    const docSectionFields = documentSection && documentSection.groups[0].fields
    const docFieldsWithOptions =
      docSectionFields &&
      (docSectionFields.filter(
        (field) =>
          field.extraValue && field.type === DOCUMENT_UPLOADER_WITH_OPTION
      ) as IDocumentUploaderWithOptionsFormField[])
    const matchedField = docFieldsWithOptions?.find(
      (field) => field.extraValue === docForWhom
    )
    const matchedOption = matchedField?.options.find(
      (option) => option.value === docType
    )
    return (
      matchedField &&
      matchedOption &&
      intl.formatMessage(matchedField.label) +
        ' (' +
        intl.formatMessage(matchedOption.label) +
        ')'
    )
  }

  const prepSectionDocuments = (
    draft: IDeclaration
  ): IDocumentViewerOptions & { uploadedDocuments: IFileValue[] } => {
    const draftItemName = documentsSection.id
    const documentOptions: SelectComponentOptions[] = []
    const selectOptions: SelectComponentOptions[] = []

    let uploadedDocuments: IFileValue[] = []

    for (const index in draft.data[draftItemName]) {
      if (isArray(draft.data[draftItemName][index])) {
        const newDocuments = draft.data[draftItemName][
          index
        ] as unknown as IFileValue[]
        uploadedDocuments = uploadedDocuments.concat(newDocuments)
      }
    }

    uploadedDocuments = uploadedDocuments.filter((document) => {
      const label =
        getLabelForDoc(
          document.optionValues[0] as string,
          document.optionValues[1] as string
        ) || (document.optionValues[1] as string)

      /**
       * Skip insertion if the value already exist
       */
      if (selectOptions.findIndex((elem) => elem.value === label) > -1) {
        return true
      }

      documentOptions.push({
        value: document.data,
        label
      })
      selectOptions.push({
        value: label,
        label
      })
      return true
    })

    return {
      selectOptions,
      documentOptions,
      uploadedDocuments
    }
  }

  const prepSectionDocOptions = (
    draft: IDeclaration
  ): IDocumentViewerOptions & {
    uploadedDocuments: IFileValue[]
  } => {
    let selectOptions: SelectComponentOptions[] = []
    let documentOptions: SelectComponentOptions[] = []
    let uploadedDocuments: IFileValue[] = []
    const prepDocumentOption = prepSectionDocuments(draft)
    selectOptions = [...selectOptions, ...prepDocumentOption.selectOptions]
    documentOptions = [
      ...documentOptions,
      ...prepDocumentOption.documentOptions
    ]
    uploadedDocuments = [
      ...uploadedDocuments,
      ...prepDocumentOption.uploadedDocuments
    ]
    return { selectOptions, documentOptions, uploadedDocuments }
  }

  const selectForPreview = (previewImage: IFileValue | IAttachmentValue) => {
    setPreviewImage(previewImage as IFileValue)
  }

  const getAllAttachmentInPreviewList = (declaration: IDeclaration) => {
    const options = prepSectionDocOptions(declaration)
    return (
      <>
        <DocumentListPreviewWrapper>
          <DocumentListPreview
            id="all_attachment_list"
            documents={options.uploadedDocuments}
            onSelect={selectForPreview}
            dropdownOptions={options.selectOptions}
            inReviewSection={true}
          />
        </DocumentListPreviewWrapper>

        <DocumentViewer
          id={'document_section'}
          key={'Document_section'}
          options={prepSectionDocOptions(declaration)}
        >
          <ZeroDocument id={`zero_document`}>
            {intl.formatMessage(messages.zeroDocumentsTextForAnySection)}
          </ZeroDocument>
        </DocumentViewer>

        {previewImage && (
          <DocumentPreview
            previewImage={previewImage}
            title={intl.formatMessage(buttonMessages.preview)}
            goBack={() => {
              setPreviewImage(null)
            }}
            onDelete={() => {}}
            disableDelete={true}
          />
        )}
      </>
    )
  }

  return <>{getAllAttachmentInPreviewList(props.declaration)}</>
}
