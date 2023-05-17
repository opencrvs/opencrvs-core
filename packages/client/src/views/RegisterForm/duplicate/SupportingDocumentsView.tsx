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
import { IDeclaration } from '@client/declarations'
import {
  BirthSection,
  DeathSection,
  DOCUMENT_UPLOADER_WITH_OPTION,
  IAttachmentValue,
  IDocumentUploaderWithOptionsFormField,
  IFileValue,
  IFormSection,
  Section
} from '@client/forms'
import { ISelectOption as SelectComponentOptions } from '@opencrvs/components/lib/'
import { getVisibleSections } from '@client/views/RegisterForm/duplicate/DuplicateFormTabs'
import {
  DocumentViewer,
  IDocumentViewerOptions
} from '@client/../../components/lib'
import { ENABLE_REVIEW_ATTACHMENTS_SCROLLING } from '@client/utils/constants'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import {
  getBirthSection,
  getDeathSection,
  getRegisterForm
} from '@client/forms/register/declaration-selectors'
import { Event } from '@client/utils/gateway'
import { isArray } from 'lodash'
import {
  SECTION_MAPPING,
  ZeroDocument
} from '@client/views/RegisterForm/review/ReviewSection'
import { isBase64FileString } from '@client/utils/commonUtils'
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
      ? getBirthSection(state, BirthSection.Documents)
      : getDeathSection(state, DeathSection.DeathDocuments)
  )
  const [previewImage, setPreviewImage] = React.useState<IFileValue | null>(
    null
  )

  const getDocumentSections = (): IFormSection[] => {
    const sections = eventsRegisterForm[eventType].sections.filter(
      ({ hasDocumentSection }) => hasDocumentSection
    )
    return getVisibleSections(sections, declaration)
  }

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
    activeSection: Section
  ): IDocumentViewerOptions & { uploadedDocuments: IFileValue[] } => {
    const draftItemName = documentsSection.id
    const documentOptions: SelectComponentOptions[] = []
    const selectOptions: SelectComponentOptions[] = []

    let uploadedDocuments: IFileValue[] = []

    for (const index in declaration.data[draftItemName]) {
      if (isArray(declaration.data[draftItemName][index])) {
        const newDocuments = declaration.data[draftItemName][
          index
        ] as unknown as IFileValue[]
        uploadedDocuments = uploadedDocuments.concat(newDocuments)
      }
    }

    uploadedDocuments = uploadedDocuments.filter((document) => {
      const sectionMapping = SECTION_MAPPING[eventType]

      const allowedDocumentType: string[] =
        sectionMapping[activeSection as keyof typeof sectionMapping] || []

      if (
        allowedDocumentType.indexOf(document.optionValues[0]!.toString()) > -1
      ) {
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
      }
      return false
    })

    return {
      selectOptions,
      documentOptions,
      uploadedDocuments
    }
  }

  const prepSectionDocsBasedOnScrollFlag = (
    activeSection: Section
  ): IDocumentViewerOptions & {
    uploadedDocuments: IFileValue[]
  } => {
    if (!ENABLE_REVIEW_ATTACHMENTS_SCROLLING) {
      let selectOptions: SelectComponentOptions[] = []
      let documentOptions: SelectComponentOptions[] = []
      let uploadedDocuments: IFileValue[] = []
      const docSections = getDocumentSections()
      for (const section of docSections) {
        const prepDocumentOption = prepSectionDocuments(section.id)
        selectOptions = [...selectOptions, ...prepDocumentOption.selectOptions]
        documentOptions = [
          ...documentOptions,
          ...prepDocumentOption.documentOptions
        ]
        uploadedDocuments = [
          ...uploadedDocuments,
          ...prepDocumentOption.uploadedDocuments
        ]
      }
      return { selectOptions, documentOptions, uploadedDocuments }
    } else {
      return prepSectionDocuments(activeSection)
    }
  }

  const selectForPreview = (previewImage: IFileValue | IAttachmentValue) => {
    setPreviewImage(previewImage as IFileValue)
  }

  const getAllAttachmentInPreviewList = () => {
    const docSections = getDocumentSections()
    const options = prepSectionDocsBasedOnScrollFlag(docSections[0].id)
    const sectionName = docSections[0].id
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
          options={prepSectionDocsBasedOnScrollFlag(sectionName)}
        >
          <ZeroDocument id={`zero_document_${sectionName}`}>
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

  return <>{getAllAttachmentInPreviewList()}</>
}
