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
import { getCorrectorSection } from '@client/forms/correction/corrector'
import { connect } from 'react-redux'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { goBack, goToVerifyCorrector, goToHomeTab } from '@client/navigation'
import {
  Event,
  IFormSection,
  IFormSectionData,
  IRadioGroupWithNestedFieldsFormField
} from '@client/forms'
import { get, isEqual } from 'lodash'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { FormFieldGenerator } from '@client/components/form'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/correction'
import { Content } from '@opencrvs/components/lib/interface/Content'
import { groupHasError } from './utils'

type IProps = {
  declaration: IDeclaration
}

type IDispatchProps = {
  goBack: typeof goBack
  goToVerifyCorrector: typeof goToVerifyCorrector
  modifyDeclaration: typeof modifyDeclaration
  writeDeclaration: typeof writeDeclaration
  goToHomeTab: typeof goToHomeTab
}

type IFullProps = IProps & IDispatchProps & IntlShapeProps

function getGroupWithVisibleFields(
  section: IFormSection,
  declaration: IDeclaration
) {
  const event = declaration.event
  const group = section.groups[0]
  const field = group.fields[0] as IRadioGroupWithNestedFieldsFormField
  if (event === Event.BIRTH) {
    const declarationData = declaration.data

    const isMotherDeceased = isEqual(
      get(declarationData, 'primaryCaregiver.motherIsDeceased'),
      ['deceased']
    )
    const isFatherDeceased = isEqual(
      get(declarationData, 'primaryCaregiver.fatherIsDeceased'),
      ['deceased']
    )

    const motherDataExists =
      declarationData && declarationData.mother && !isMotherDeceased

    const fatherDataExists =
      declarationData &&
      declarationData.father &&
      declarationData.father.fathersDetailsExist &&
      !isFatherDeceased

    if (!fatherDataExists) {
      field.options = field.options.filter(
        (option) => option.value !== 'FATHER'
      )
    }

    if (!motherDataExists) {
      field.options = field.options.filter(
        (option) => option.value !== 'MOTHER'
      )
    }
  }

  return {
    ...group,
    fields: replaceInitialValues(
      group.fields,
      declaration.data[section.id] || {},
      declaration.data
    )
  }
}

function CorrectorFormComponent(props: IFullProps) {
  const { declaration, intl } = props

  const section = getCorrectorSection(declaration.event)

  const group = React.useMemo(
    () => getGroupWithVisibleFields(section, declaration),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

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
    props.goToVerifyCorrector(
      declaration.id,
      (declaration.data.corrector.relationship as IFormSectionData)
        .value as string
    )
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
        goHome={() => props.goToHomeTab('review')}
      >
        <Content
          title={group.title && intl.formatMessage(group.title)}
          subtitle={
            declaration.event === Event.BIRTH
              ? intl.formatMessage(messages.birthCorrectionNote)
              : undefined
          }
          bottomActionButtons={[continueButton]}
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

export const CorrectorForm = connect(undefined, {
  goBack,
  modifyDeclaration,
  writeDeclaration,
  goToVerifyCorrector,
  goToHomeTab
})(injectIntl(CorrectorFormComponent))
