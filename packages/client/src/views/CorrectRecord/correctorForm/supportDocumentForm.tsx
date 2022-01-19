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
import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import {
  createReviewApplication,
  modifyApplication,
  storeApplication,
  writeApplication,
  IPrintableApplication,
  ICertificate
} from '@client/applications'
import { FormFieldGenerator } from '@client/components/form'
import {
  Action,
  Event,
  IForm,
  IFormData,
  IFormField,
  IFormSection,
  IFormSectionData,
  IFormSectionGroup,
  IRadioGroupWithNestedFieldsFormField
} from '@client/forms'
import { getVisibleSectionGroupsBasedOnConditions } from '@client/forms/utils'
import {
  getValidationErrorsForForm,
  IFieldErrors
} from '@client/forms/validation'
import {
  buttonMessages,
  errorMessages,
  formMessages
} from '@client/i18n/messages'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import {
  goBack,
  goToPrintCertificate,
  goToPrintCertificatePayment,
  goToReviewCertificate,
  goToVerifyCorrector
} from '@client/navigation'
import { CERTIFICATE_CORRECTION } from '@client/navigation/routes'
import { IStoreState } from '@client/store'
import styled, { ITheme } from '@client/styledComponents'
import { gqlToDraftTransformer } from '@client/transformer'
import {
  QueryContext,
  QueryProvider
} from '@client/views/DataProvider/QueryProvider'
import {
  getEvent,
  getEventDate,
  isCertificateForPrintInAdvance,
  isFreeOfCost
} from '@client/views/PrintCertificate/utils'
import { StyledSpinner } from '@client/views/RegistrationHome/RegistrationHome'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/browser'
import { cloneDeep, flatten, get, isEqual } from 'lodash'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { withTheme } from 'styled-components'
import { IValidationResult } from '@client/utils/validate'
import { getRegisterForm } from '@client/forms/register/application-selectors'
import { Content } from '@opencrvs/components/lib/interface/Content'

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

interface IBaseProps {
  registerForm: IForm
  event: Event
  pageRoute: string
  applicationId: string
  application: IPrintableApplication | undefined
  formSection: IFormSection
  formGroup: IFormSectionGroup
  theme: ITheme
  goBack: typeof goBack
  storeApplication: typeof storeApplication
  writeApplication: typeof writeApplication
  modifyApplication: typeof modifyApplication
  goToPrintCertificate: typeof goToPrintCertificate
  goToVerifyCorrector: typeof goToVerifyCorrector
  goToReviewCertificate: typeof goToReviewCertificate
  goToPrintCertificatePayment: typeof goToPrintCertificatePayment
}

type IProps = IBaseProps & IntlShapeProps

function getNextSectionIds(
  formSection: IFormSection,
  formSectionGroup: IFormSectionGroup,
  application?: IPrintableApplication
) {
  const certificates = application && application.data.registration.certificates

  const certificate = (certificates && certificates[0]) || {}
  const visibleGroups = getVisibleSectionGroupsBasedOnConditions(
    formSection,
    (certificate[
      formSection.id as keyof typeof certificate
    ] as IFormSectionData) || {}
  )
  const currentGroupIndex = visibleGroups.findIndex(
    (group: IFormSectionGroup) => group.id === formSectionGroup.id
  )

  if (currentGroupIndex === visibleGroups.length - 1) {
    return null
  }
  return {
    sectionId: formSection.id,
    groupId: visibleGroups[currentGroupIndex + 1].id
  }
}

const getErrorsOnFieldsBySection = (
  sectionId: keyof IPrintableApplication['data'],
  fields: IFormField[],
  draft: IPrintableApplication
) => {
  const certificates = draft.data.registration.certificates
  const certificate = (certificates && certificates[0]) || {}
  const errors = getValidationErrorsForForm(
    fields,
    (certificate[sectionId as keyof typeof certificate] as IFormSectionData) ||
      {}
  )

  return {
    [sectionId]: fields.reduce((fields, field) => {
      const validationErrors: IValidationResult[] = (
        errors[field.name as keyof typeof errors] as IFieldErrors
      ).errors

      const value = draft.data[sectionId]
        ? draft.data[sectionId][field.name]
        : null

      const informationMissing =
        validationErrors.length > 0 || value === null ? validationErrors : []

      return { ...fields, [field.name]: informationMissing }
    }, {})
  }
}

interface IState {
  showError: boolean
}

class CorrectorSupportDocumentFormComponent extends React.Component<
  IProps,
  IState
> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      showError: false
    }
  }

  modifyApplication = (
    sectionData: ICertificate['corrector'],
    application: IPrintableApplication
  ) => {
    const certificates = application.data.registration.certificates
    const certificate = (certificates && certificates[0]) || {}
    const corrector = { ...(certificate.corrector || {}), ...sectionData }

    this.props.modifyApplication({
      ...application,
      data: {
        ...application.data,
        registration: {
          ...application.data.registration,
          certificates: [
            {
              corrector: corrector,
              hasShowedVerifiedDocument: false
            }
          ]
        }
      }
    })
  }
  continueButtonHandler = (
    applicationId: string,
    currentGroup: string,
    nextGroup: string | undefined,
    event: Event,
    sectionId: keyof IPrintableApplication['data'],
    fields: IFormField[],
    draft: IPrintableApplication | undefined
  ) => {
    if (!draft) return

    const certificates = draft.data.registration.certificates
    const certificate = (certificates && certificates[0]) || {}
    const corrector = certificate[
      sectionId as keyof typeof certificate
    ] as IFormSectionData
    console.log(
      '------------------------------------------------------------',
      corrector,
      corrector.type
    )
    this.setState({
      showError: false
    })
  }

  goToNextFormForSomeoneElse = (
    applicationId: string,
    application: IPrintableApplication,
    event: Event
  ) => {
    if (isFreeOfCost(event, getEventDate(application.data, event))) {
      this.props.goToReviewCertificate(applicationId, event)
    } else {
      this.props.goToPrintCertificatePayment(applicationId, event)
    }
  }

  resetCertificatesInformation = () => {
    const application = Object.assign({}, this.props.application)
    application.data.registration.certificates = []
    this.props.modifyApplication(application)
  }

  render() {
    const {
      intl,
      event,
      applicationId,
      application,
      formSection,
      formGroup,
      goBack,
      registerForm
    } = this.props
    console.log('formGroup', formGroup)

    const { showError } = this.state

    const contentProps = {
      title: formMessages.documentsTitle.defaultMessage as string,
      supportingCopy: formMessages.CorrectorSupportDocumentCopy
        .defaultMessage as string
    }

    const nextSectionGroup = getNextSectionIds(
      formSection,
      formGroup,
      application
    )
    const applicationToBeCertified = application
    console.log('applicationToBeCertified', applicationToBeCertified)

    if (
      !applicationToBeCertified ||
      !applicationToBeCertified.data.registration.regStatus
    ) {
      return (
        <QueryProvider
          event={event}
          action={Action.LOAD_CERTIFICATE_APPLICATION}
          payload={{ id: applicationId }}
          fetchPolicy="no-cache"
        >
          <QueryContext.Consumer>
            {({ loading, error, data, dataKey }) => {
              if (loading) {
                return <StyledSpinner id="print-certificate-spinner" />
              }
              if (error) {
                Sentry.captureException(error)

                return (
                  <ErrorText id="print-certificate-queue-error-text">
                    {intl.formatMessage(errorMessages.printQueryError)}
                  </ErrorText>
                )
              }
              if (data) {
                const retrievedData = data[dataKey as keyof typeof data]
                const transformedData: IFormData = gqlToDraftTransformer(
                  registerForm,
                  retrievedData
                )

                const newApplicationToBeCertified = createReviewApplication(
                  applicationId,
                  transformedData,
                  event
                )

                if (applicationToBeCertified) {
                  this.props.modifyApplication(newApplicationToBeCertified)
                } else {
                  this.props.storeApplication(newApplicationToBeCertified)
                }
              }
            }}
          </QueryContext.Consumer>
        </QueryProvider>
      )
    }
    return (
      <>
        <ActionPageLight
          id="corrector_form"
          title={intl.formatMessage(formSection.title)}
          goBack={goBack}
        >
          <Content {...contentProps}>
            {showError && (
              <ErrorWrapper>
                <ErrorText id="form_error" ignoreMediaQuery={true}>
                  {(formGroup.error && intl.formatMessage(formGroup.error)) ||
                    ''}
                </ErrorText>
              </ErrorWrapper>
            )}
            <FormFieldGenerator
              id={formGroup.id}
              onChange={(values) => {
                if (values && values.affidavitFile) {
                  this.setState({
                    showError: false
                  })
                }
                this.modifyApplication(values, applicationToBeCertified)
              }}
              setAllFieldsDirty={false}
              fields={formGroup.fields}
              draftData={applicationToBeCertified.data}
            />
            <PrimaryButton
              id="confirm_form"
              onClick={() => {
                this.continueButtonHandler(
                  applicationToBeCertified.id,
                  formGroup.id,
                  nextSectionGroup ? nextSectionGroup.groupId : undefined,
                  event,
                  formSection.id,
                  formGroup.fields,
                  applicationToBeCertified
                )
              }}
            >
              {intl.formatMessage(buttonMessages.continueButton)}
            </PrimaryButton>
          </Content>
        </ActionPageLight>
      </>
    )
  }
}

const mapStateToProps = (
  state: IStoreState,
  props: RouteComponentProps<{
    registrationId: string
    eventType: string
    groupId: string
  }>
) => {
  const { registrationId, eventType, groupId } = props.match.params
  const event = getEvent(eventType)

  const application = state.applicationsState.applications.find(
    (application) => application.id === registrationId
  ) as IPrintableApplication | undefined

  const formSection = state.correctRecordForm.supportDocumentSection
  const clonedFormSection = cloneDeep(formSection)
  const formGroup =
    clonedFormSection.groups.find(
      (group: { id: string }) => group.id === groupId
    ) || clonedFormSection.groups[0]

  return {
    registerForm: getRegisterForm(state)[event],
    event,
    pageRoute: CERTIFICATE_CORRECTION,
    applicationId: registrationId,
    application,
    formSection: clonedFormSection,
    formGroup: {
      ...formGroup
    }
  }
}

export const CorrectorSupportDocumentForm = connect(mapStateToProps, {
  goBack,
  storeApplication,
  writeApplication,
  modifyApplication,
  goToPrintCertificate,
  goToVerifyCorrector,
  goToReviewCertificate,
  goToPrintCertificatePayment
})(injectIntl(withTheme(CorrectorSupportDocumentFormComponent)))
