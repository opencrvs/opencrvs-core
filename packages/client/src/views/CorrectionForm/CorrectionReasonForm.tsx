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
import {
  modifyDeclaration,
  IDeclaration,
  writeDeclaration
} from '@client/declarations'
import { connect } from 'react-redux'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import {
  goBack,
  goToCertificateCorrection,
  goToHomeTab
} from '@client/navigation'
import {
  CorrectionSection,
  IFormSection,
  IFormSectionData,
  IForm
} from '@client/forms'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { FormFieldGenerator } from '@client/components/form'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { correctReasonSection } from '@client/forms/correction/reason'
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import { groupHasError } from './utils'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'

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

function getGroupWithInitialValues(
  section: IFormSection,
  declaration: IDeclaration
) {
  const group = section.groups[0]

  return {
    ...group,
    fields: replaceInitialValues(
      group.fields,
      declaration.data[section.id] || {},
      declaration.data
    )
  }
}

function CorrectionReasonFormComponent(props: IFullProps) {
  const { declaration, intl } = props

  const section = correctReasonSection

  const group = React.useMemo(
    () => getGroupWithInitialValues(section, declaration),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const modifyDeclaration = (
    sectionData: IFormSectionData,
    activeSection: IFormSection,
    declaration: IDeclaration
  ) => {
    props.modifyDeclaration({
      ...declaration,
      data: {
        ...declaration.data,
        [activeSection.id]: {
          ...declaration.data[activeSection.id],
          ...sectionData
        }
      }
    })
  }

  const continueButtonHandler = () => {
    props.writeDeclaration(declaration)
    props.goToCertificateCorrection(declaration.id, CorrectionSection.Summary)
  }

  const continueButton = (
    <PrimaryButton
      id="confirm_form"
      key="confirm_form"
      onClick={continueButtonHandler}
      disabled={groupHasError(group, declaration.data[section.id])}
    >
      {intl.formatMessage(buttonMessages.continueButton)}
    </PrimaryButton>
  )

  return (
    <>
      <ActionPageLight
        id="corrector_form"
        title={intl.formatMessage(section.title)}
        hideBackground
        goBack={props.goBack}
        goHome={() => props.goToHomeTab(WORKQUEUE_TABS.readyForReview)}
      >
        <Content
          title={group.title && intl.formatMessage(group.title)}
          bottomActionButtons={[continueButton]}
          size={ContentSize.LARGE}
          showTitleOnMObile={true}
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

export const CorrectionReasonForm = connect(undefined, {
  goBack,
  goToHomeTab,
  modifyDeclaration,
  goToCertificateCorrection,
  writeDeclaration
})(injectIntl(CorrectionReasonFormComponent))
