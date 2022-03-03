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
import {
  modifyDeclaration,
  IDeclaration,
  writeDeclaration
} from '@client/declarations'
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
  declaration: IDeclaration
}

type IDispatchProps = {
  goBack: typeof goBack
  goToHomeTab: typeof goToHomeTab
  goToCertificateCorrection: typeof goToCertificateCorrection
  writeDeclaration: typeof writeDeclaration
  modifyDeclaration: typeof modifyDeclaration
}

type IFullProps = IProps & IDispatchProps & IntlShapeProps

function SupportingDocumentsFormComoponent(props: IFullProps) {
  const { intl, declaration } = props

  const section = supportingDocumentsSection
  const group = React.useMemo(
    () => ({
      ...section.groups[0],
      fields: replaceInitialValues(
        section.groups[0].fields,
        declaration.data[section.id] || {},
        declaration.data
      )
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const hasUploadDocOrSelectOption =
    declaration.data[section.id] &&
    (declaration.data[section.id].uploadDocForLegalProof ||
      declaration.data[section.id].supportDocumentRequiredForCorrection !==
        undefined)

  group.fields[1].disabled =
    declaration.data[section.id] &&
    declaration.data[section.id].uploadDocForLegalProof
      ? true
      : false

  const contentProps = {
    title: intl.formatMessage(messages.supportingDocumentsTitle),
    subtitle: intl.formatMessage(messages.supportingDocumentsSubtitle),
    size: ContentSize.LARGE
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

  const continueButtonHandler = () => {
    props.writeDeclaration(declaration)
    props.goToCertificateCorrection(declaration.id, CorrectionSection.Reason)
  }

  return (
    <>
      <ActionPageLight
        id="corrector_form"
        title={intl.formatMessage(section.title)}
        hideBackground
        goBack={props.goBack}
        goHome={() => props.goToHomeTab('review')}
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
              modifyDeclaration(values, section, declaration)
            }}
            setAllFieldsDirty={false}
            fields={group.fields}
            draftData={declaration.data}
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
  modifyDeclaration,
  writeDeclaration
})(injectIntl(SupportingDocumentsFormComoponent))
