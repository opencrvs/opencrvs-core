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
  modifyApplication,
  IApplication,
  writeApplication
} from '@client/applications'
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

type IProps = {
  application: IApplication
}

type IDispatchProps = {
  goBack: typeof goBack
  goToHomeTab: typeof goToHomeTab
  goToCertificateCorrection: typeof goToCertificateCorrection
  writeApplication: typeof writeApplication
  modifyApplication: typeof modifyApplication
}

type IFullProps = IProps & IDispatchProps & IntlShapeProps

function getGroupWithInitialValues(
  section: IFormSection,
  application: IApplication
) {
  const group = section.groups[0]

  return {
    ...group,
    fields: replaceInitialValues(
      group.fields,
      application.data[section.id] || {},
      application.data
    )
  }
}

function CorrectionReasonFormComponent(props: IFullProps) {
  const { application, intl } = props

  const section = correctReasonSection

  const group = React.useMemo(
    () => getGroupWithInitialValues(section, application),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const modifyApplication = (
    sectionData: IFormSectionData,
    activeSection: IFormSection,
    application: IApplication
  ) => {
    props.modifyApplication({
      ...application,
      data: {
        ...application.data,
        [activeSection.id]: {
          ...application.data[activeSection.id],
          ...sectionData
        }
      }
    })
  }

  const continueButtonHandler = () => {
    props.writeApplication(application)
    props.goToCertificateCorrection(application.id, CorrectionSection.Summary)
  }

  const continueButton = (
    <PrimaryButton
      id="confirm_form"
      key="confirm_form"
      onClick={continueButtonHandler}
      disabled={groupHasError(group, application.data[section.id])}
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
        goHome={() => props.goToHomeTab('review')}
      >
        <Content
          title={group.title && intl.formatMessage(group.title)}
          bottomActionButtons={[continueButton]}
          size={ContentSize.LARGE}
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

export const CorrectionReasonForm = connect(undefined, {
  goBack,
  goToHomeTab,
  modifyApplication,
  goToCertificateCorrection,
  writeApplication
})(injectIntl(CorrectionReasonFormComponent))
