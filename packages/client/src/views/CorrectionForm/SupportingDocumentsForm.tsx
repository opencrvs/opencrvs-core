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
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { modifyApplication, IApplication } from '@client/applications'
import { FormFieldGenerator } from '@client/components/form'
import {
  IFormSection,
  IFormSectionData,
  CorrectionSection
} from '@client/forms'
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/correction'
import {
  goBack,
  goToHomeTab,
  goToCertificateCorrection
} from '@client/navigation'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { supportingDocumentsSection } from '@client/forms/correction/supportDocument'
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'

type IProps = {
  application: IApplication
}

type IDispatchProps = {
  goBack: typeof goBack
  goToHomeTab: typeof goToHomeTab
  goToCertificateCorrection: typeof goToCertificateCorrection
  modifyApplication: typeof modifyApplication
}

type IFullProps = IProps & IDispatchProps & IntlShapeProps

function SupportingDocumentsFormComoponent(props: IFullProps) {
  const { intl, application } = props

  const section = supportingDocumentsSection
  const group = {
    ...section.groups[0],
    fields: replaceInitialValues(
      section.groups[0].fields,
      application.data[section.id] || {},
      application.data
    )
  }
  const hasUploadDocOrSelectOption =
    application.data[section.id] &&
    (application.data[section.id].uploadDocForLegalProof ||
      application.data[section.id].supportDocumentRequiredForCorrection)

  if (
    application.data[section.id] &&
    application.data[section.id].uploadDocForLegalProof
  ) {
    group.fields[1].disabled = true
  }

  const contentProps = {
    title: intl.formatMessage(messages.supportingDocumentsTitle),
    subtitle: intl.formatMessage(messages.supportingDocumentsSubtitle),
    size: ContentSize.LARGE
  }

  const modifyApplication = (
    sectionData: IFormSectionData,
    section: IFormSection,
    application: IApplication
  ) => {
    props.modifyApplication({
      ...application,
      data: {
        ...application.data,
        [section.id]: {
          ...application.data[section.id],
          ...sectionData
        }
      }
    })
  }

  const cancelCorrection = () => {
    props.modifyApplication({
      ...application,
      data: {
        ...application.originalData
      }
    })
    props.goToHomeTab('review')
  }

  const continueButtonHandler = () => {
    props.goToCertificateCorrection(application.id, CorrectionSection.Reason)
  }

  return (
    <>
      <ActionPageLight
        id="corrector_form"
        title={intl.formatMessage(section.title)}
        hideBackground
        goBack={props.goBack}
        goHome={cancelCorrection}
      >
        <Content
          {...contentProps}
          bottomActionButtons={[
            <PrimaryButton
              id="confirm_form"
              key="confirm_form"
              disabled={!hasUploadDocOrSelectOption}
              onClick={continueButtonHandler}
            >
              {intl.formatMessage(buttonMessages.continueButton)}
            </PrimaryButton>
          ]}
        >
          <FormFieldGenerator
            id={group.id}
            onChange={(values) => {
              modifyApplication(values, section, application)
            }}
            setAllFieldsDirty={false}
            fields={group.fields}
            draftData={application.data}
          />
        </Content>
      </ActionPageLight>
    </>
  )
}

export const SupportingDocumentsForm = connect(undefined, {
  goBack,
  goToHomeTab,
  goToCertificateCorrection,
  modifyApplication
})(injectIntl(SupportingDocumentsFormComoponent))
