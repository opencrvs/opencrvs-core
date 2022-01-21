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
import { modifyApplication, IApplication } from '@client/applications'
import { getCorrectorSection } from '@client/forms/correction/corrector'
import { connect } from 'react-redux'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { goBack } from '@client/navigation'
import {
  Event,
  IFormSection,
  IFormSectionData,
  IRadioGroupWithNestedFieldsFormField
} from '@client/forms'
import { get, isEqual } from 'lodash'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import styled from '@client/styledComponents'
import { FormFieldGenerator } from '@client/components/form'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { getValidationErrorsForForm } from '@client/forms/validation'

const FormSectionTitle = styled.h4`
  ${({ theme }) => theme.fonts.h4Style};
  color: ${({ theme }) => theme.colors.copy};
  margin-top: 0px;
  margin-bottom: 16px;
`

const ErrorWrapper = styled.div`
  margin-top: -3px;
  margin-bottom: 16px;
`

type IProps = {
  application: IApplication
}

type IDispatchProps = {
  goBack: typeof goBack
  modifyApplication: typeof modifyApplication
}

type IFullProps = IProps & IDispatchProps & IntlShapeProps

function getGroup(section: IFormSection, application: IApplication) {
  const event = application.event
  if (event === Event.BIRTH) {
    const applicationData = application.data

    const isMotherDeceased = isEqual(
      get(applicationData, 'primaryCaregiver.motherIsDeceased'),
      ['deceased']
    )
    const isFatherDeceased = isEqual(
      get(applicationData, 'primaryCaregiver.fatherIsDeceased'),
      ['deceased']
    )

    const motherDataExists =
      applicationData && applicationData.mother && !isMotherDeceased

    const fatherDataExists =
      applicationData && applicationData.father && !isFatherDeceased

    const childDataExists = applicationData && applicationData.child

    if (!fatherDataExists) {
      ;(
        section.groups[0].fields[0] as IRadioGroupWithNestedFieldsFormField
      ).options.splice(1, 1)
    }

    if (!motherDataExists) {
      ;(
        section.groups[0].fields[0] as IRadioGroupWithNestedFieldsFormField
      ).options.splice(0, 1)
    }

    if (!childDataExists) {
      ;(
        section.groups[0].fields[0] as IRadioGroupWithNestedFieldsFormField
      ).options.splice(2, 1)
    }
  } else if (event === Event.DEATH) {
    const applicationData = application && application.data
    const isInformantDataNull = isEqual(
      get(applicationData, 'informant.relationship'),
      null
    )
    if (isInformantDataNull) {
      ;(
        section.groups[0].fields[0] as IRadioGroupWithNestedFieldsFormField
      ).options.splice(0, 1)
    }
  }
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

function CorrectorFormComponent(props: IFullProps) {
  const [showError, setShowError] = React.useState(false)

  const { application, intl, goBack } = props

  const section = getCorrectorSection(application.event)

  const group = getGroup(section, application)

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
    const errors = getValidationErrorsForForm(
      group.fields,
      application.data[section.id] || {}
    )

    group.fields.forEach((field) => {
      const fieldErrors = errors[field.name].errors
      const nestedFieldErrors = errors[field.name].nestedFields

      let hasError = false

      if (fieldErrors.length > 0) {
        hasError = true
      }

      if (field.nestedFields) {
        Object.values(field.nestedFields).forEach((nestedFields) => {
          nestedFields.forEach((nestedField) => {
            if (
              nestedFieldErrors[nestedField.name] &&
              nestedFieldErrors[nestedField.name].length > 0
            ) {
              hasError = true
            }
          })
        })
      }

      if (hasError) {
        setShowError(true)
        return
      }
    })
  }

  return (
    <>
      <ActionPageLight
        id="corrector_form"
        title={intl.formatMessage(section.title)}
        goBack={goBack}
      >
        <FormSectionTitle>
          {group.fields.length === 1 && (group.fields[0].hideHeader = true)}
          <> {(group.title && intl.formatMessage(group.title)) || ''} </>
        </FormSectionTitle>
        {showError && (
          <ErrorWrapper>
            <ErrorText id="form_error" ignoreMediaQuery={true}>
              {(group.error && intl.formatMessage(group.error)) || ''}
            </ErrorText>
          </ErrorWrapper>
        )}
        <FormFieldGenerator
          id={group.id}
          onChange={(values) => {
            modifyApplication(values, section, application)
          }}
          setAllFieldsDirty={false}
          fields={group.fields}
          draftData={application.data}
        />
        <PrimaryButton id="confirm_form" onClick={continueButtonHandler}>
          {intl.formatMessage(buttonMessages.continueButton)}
        </PrimaryButton>
      </ActionPageLight>
    </>
  )
}

export const CorrectorForm = connect(undefined, {
  goBack,
  modifyApplication
})(injectIntl(CorrectorFormComponent))
