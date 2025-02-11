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
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import {
  modifyDeclaration,
  IDeclaration,
  writeDeclaration
} from '@client/declarations'
import { FormFieldGenerator } from '@client/components/form'
import {
  IFormSection,
  IFormSectionData,
  CorrectionSection,
  IFormFieldValue
} from '@client/forms'
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/correction'
import {
  generateCertificateCorrectionUrl,
  generateGoToHomeTabUrl
} from '@client/navigation'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect, useSelector } from 'react-redux'
import { supportingDocumentsSection } from '@client/forms/correction/supportDocument'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { getOfflineData } from '@client/offline/selectors'
import { getUserDetails } from '@client/profile/profileSelectors'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { useNavigate } from 'react-router-dom'

type IProps = {
  declaration: IDeclaration
}

type IDispatchProps = {
  writeDeclaration: typeof writeDeclaration
  modifyDeclaration: typeof modifyDeclaration
}

type IFullProps = IProps & IDispatchProps & IntlShapeProps

function SupportingDocumentsFormComoponent(props: IFullProps) {
  const { intl, declaration } = props
  const [isFileUploading, setIsFileUploading] = React.useState<boolean>(false)
  const navigate = useNavigate()
  const config = useSelector(getOfflineData)
  const user = useSelector(getUserDetails)
  const section = supportingDocumentsSection

  const group = {
    ...section.groups[0],
    fields: replaceInitialValues(
      section.groups[0].fields,
      declaration.data[section.id] || {},
      declaration.data,
      config,
      user
    )
  }

  const hasUploadedDoc =
    declaration.data[section.id] &&
    (declaration.data[section.id].uploadDocForLegalProof as IFormFieldValue[])
      .length > 0

  const hasSelectedOption =
    declaration.data[section.id]?.supportDocumentRequiredForCorrection !==
      undefined &&
    declaration.data[section.id]?.supportDocumentRequiredForCorrection !== ''

  const fields = [
    group.fields[0],
    {
      ...group.fields[1],
      disabled: hasUploadedDoc
    }
  ]

  const contentProps = {
    title: intl.formatMessage(messages.supportingDocumentsTitle),
    subtitle: intl.formatMessage(messages.supportingDocumentsSubtitle),
    size: ContentSize.SMALL
  }

  const modifyDeclaration = (
    sectionData: IFormSectionData,
    section: IFormSection,
    declaration: IDeclaration
  ) => {
    props.modifyDeclaration({
      ...declaration,
      data: {
        ...declaration.data,
        [section.id]: {
          ...declaration.data[section.id],
          ...sectionData
        }
      }
    })
  }

  const onUploadingStateChanged = (isUploading: boolean) => {
    setIsFileUploading(isUploading)
  }

  const continueButtonHandler = () => {
    props.writeDeclaration(declaration)
    navigate(
      generateCertificateCorrectionUrl({
        declarationId: declaration.id,
        pageId: CorrectionSection.Reason
      })
    )
  }

  return (
    <>
      <ActionPageLight
        id="corrector_form"
        title={section.title && intl.formatMessage(section.title)}
        hideBackground
        goBack={() => navigate(-1)}
        goHome={() =>
          navigate(
            generateGoToHomeTabUrl({
              tabId: WORKQUEUE_TABS.readyForReview
            })
          )
        }
      >
        <Content
          {...contentProps}
          showTitleOnMobile={true}
          bottomActionButtons={[
            <PrimaryButton
              id="confirm_form"
              key="confirm_form"
              disabled={
                !(hasUploadedDoc || hasSelectedOption) || isFileUploading
              }
              onClick={continueButtonHandler}
            >
              {intl.formatMessage(buttonMessages.continueButton)}
            </PrimaryButton>
          ]}
        >
          <FormFieldGenerator
            id={group.id}
            key={group.id}
            onChange={(values) => {
              modifyDeclaration(values, section, declaration)
            }}
            setAllFieldsDirty={false}
            fields={fields}
            draftData={declaration.data}
            onUploadingStateChanged={onUploadingStateChanged}
          />
        </Content>
      </ActionPageLight>
    </>
  )
}

export const SupportingDocumentsForm = connect(undefined, {
  modifyDeclaration,
  writeDeclaration
})(injectIntl(SupportingDocumentsFormComoponent))
