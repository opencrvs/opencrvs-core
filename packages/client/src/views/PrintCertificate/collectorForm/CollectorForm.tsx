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
import { Content } from '@opencrvs/components/lib/interface/Content'

import {
  ActionPageLight,
  ResponsiveModal
} from '@opencrvs/components/lib/interface'
import {
  createReviewDeclaration,
  modifyDeclaration,
  storeDeclaration,
  writeDeclaration,
  IPrintableDeclaration,
  ICertificate
} from '@client/declarations'
import { FormFieldGenerator } from '@client/components/form'
import {
  Action,
  IForm,
  IFormData,
  IFormField,
  IFormSection,
  IFormSectionData,
  IFormSectionGroup
} from '@client/forms'
import { Event } from '@client/utils/gateway'
import { getVisibleSectionGroupsBasedOnConditions } from '@client/forms/utils'
import {
  getValidationErrorsForForm,
  IFieldErrors
} from '@client/forms/validation'
import { buttonMessages, errorMessages } from '@client/i18n/messages'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import {
  goBack,
  goToHomeTab,
  goToPrintCertificate,
  goToPrintCertificatePayment,
  goToReviewCertificate,
  goToVerifyCollector
} from '@client/navigation'
import { CERTIFICATE_COLLECTOR } from '@client/navigation/routes'
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
  getRegisteredDate,
  isFreeOfCost,
  isCertificateForPrintInAdvance
} from '@client/views/PrintCertificate/utils'
import { StyledSpinner } from '@client/views/OfficeHome/OfficeHome'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/browser'
import { flatten, cloneDeep } from 'lodash'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { withTheme } from 'styled-components'
import { IValidationResult } from '@client/utils/validate'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import {
  certCollectorGroupForBirthAppWithParentDetails,
  certCollectorGroupForBirthAppWithoutFatherDetails,
  certCollectorGroupForBirthAppWithoutParentDetails,
  certCollectorGroupForBirthAppWithoutMotherDetails
} from '@client/forms/certificate/fieldDefinitions/collectorSection'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getRegisteringOfficeId } from '@client/utils/draftUtils'

const ErrorWrapper = styled.div`
  margin-top: -3px;
  margin-bottom: 16px;
`

interface IBaseProps {
  registerForm: IForm
  event: Event
  pageRoute: string
  declarationId: string
  declaration: IPrintableDeclaration | undefined
  formSection: IFormSection
  formGroup: IFormSectionGroup
  offlineCountryConfiguration: IOfflineData
  theme: ITheme
  goBack: typeof goBack
  goToHomeTab: typeof goToHomeTab
  storeDeclaration: typeof storeDeclaration
  writeDeclaration: typeof writeDeclaration
  modifyDeclaration: typeof modifyDeclaration
  goToPrintCertificate: typeof goToPrintCertificate
  goToVerifyCollector: typeof goToVerifyCollector
  goToReviewCertificate: typeof goToReviewCertificate
  goToPrintCertificatePayment: typeof goToPrintCertificatePayment
}

type IProps = IBaseProps & IntlShapeProps

function getNextSectionIds(
  formSection: IFormSection,
  formSectionGroup: IFormSectionGroup,
  declaration?: IPrintableDeclaration
) {
  const certificates = declaration && declaration.data.registration.certificates

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
  sectionId: keyof IPrintableDeclaration['data'],
  fields: IFormField[],
  draft: IPrintableDeclaration
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
  showModalForNoSignedAffidavit: boolean
  isFileUploading: boolean
}

class CollectorFormComponent extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      showError: false,
      showModalForNoSignedAffidavit: false,
      isFileUploading: false
    }
  }

  onUploadingStateChanged = (isUploading: boolean) => {
    this.setState({
      ...this.state,
      isFileUploading: isUploading
    })
  }

  modifyDeclaration = (
    sectionData: ICertificate['collector'],
    declaration: IPrintableDeclaration
  ) => {
    const certificates = declaration.data.registration.certificates
    const certificate = (certificates && certificates[0]) || {}
    const collector = { ...(certificate.collector || {}), ...sectionData }

    this.props.modifyDeclaration({
      ...declaration,
      data: {
        ...declaration.data,
        registration: {
          ...declaration.data.registration,
          certificates: [
            {
              collector: collector,
              hasShowedVerifiedDocument: false
            }
          ]
        }
      }
    })
  }

  continueButtonHandler = (
    declarationId: string,
    currentGroup: string,
    nextGroup: string | undefined,
    event: Event,
    sectionId: keyof IPrintableDeclaration['data'],
    fields: IFormField[],
    draft: IPrintableDeclaration | undefined
  ) => {
    if (!draft) return

    const errors = getErrorsOnFieldsBySection(sectionId, fields, draft)
    const errorValues = Object.values(errors).map(Object.values)
    const errLength = flatten(errorValues).filter(
      (errs) => errs.length > 0
    ).length

    const certificates = draft.data.registration.certificates
    const certificate = (certificates && certificates[0]) || {}
    const collector = certificate[
      sectionId as keyof typeof certificate
    ] as IFormSectionData

    if (errLength > 0) {
      this.setState({
        showError: true
      })

      return
    }

    if (currentGroup === 'affidavit') {
      if (
        collector.affidavitFile &&
        (collector.affidavitFile as IFormSectionData).data
      ) {
        this.props.writeDeclaration(draft)
        this.goToNextFormForSomeoneElse(declarationId, draft, event)

        return
      }
      if (
        !(
          collector.noAffidavitAgreement &&
          (collector.noAffidavitAgreement as string[]).length > 0
        )
      ) {
        this.setState({
          showError: true
        })

        return
      }

      this.props.writeDeclaration(draft)
      this.setState({ showModalForNoSignedAffidavit: true })

      return
    }

    this.setState({
      showError: false,
      showModalForNoSignedAffidavit: false
    })
    if (!nextGroup) {
      this.props.writeDeclaration(draft)

      if (isCertificateForPrintInAdvance(draft)) {
        this.props.goToReviewCertificate(declarationId, event)
      } else {
        this.props.goToVerifyCollector(
          declarationId,
          event,
          collector.type as string
        )
      }
    } else {
      this.props.goToPrintCertificate(declarationId, event, nextGroup)
    }
  }

  goToNextFormForSomeoneElse = (
    declarationId: string,
    declaration: IPrintableDeclaration,
    event: Event
  ) => {
    if (
      isFreeOfCost(
        event,
        getEventDate(declaration.data, event),
        getRegisteredDate(declaration.data),
        this.props.offlineCountryConfiguration
      )
    ) {
      this.props.goToReviewCertificate(declarationId, event)
    } else {
      this.props.goToPrintCertificatePayment(declarationId, event)
    }
  }

  toggleSubmitModalOpen = () => {
    this.setState((prevState) => ({
      showModalForNoSignedAffidavit: !prevState.showModalForNoSignedAffidavit
    }))
  }

  resetCertificatesInformation = () => {
    const declaration = Object.assign({}, this.props.declaration)
    declaration.data.registration.certificates = []
    this.props.modifyDeclaration(declaration)
  }

  render() {
    const {
      intl,
      event,
      declarationId,
      declaration,
      formSection,
      formGroup,
      goBack,
      registerForm
    } = this.props

    const { showError, showModalForNoSignedAffidavit } = this.state

    const nextSectionGroup = getNextSectionIds(
      formSection,
      formGroup,
      declaration
    )
    const declarationToBeCertified = declaration

    if (
      !declarationToBeCertified ||
      !declarationToBeCertified.data.registration.regStatus
    ) {
      return (
        <QueryProvider
          event={event}
          action={Action.LOAD_CERTIFICATE_DECLARATION}
          payload={{ id: declarationId }}
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

                const newDeclarationToBeCertified = createReviewDeclaration(
                  declarationId,
                  transformedData,
                  event
                )

                if (declarationToBeCertified) {
                  this.props.modifyDeclaration(newDeclarationToBeCertified)
                } else {
                  this.props.storeDeclaration(newDeclarationToBeCertified)
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
          id="collector_form"
          hideBackground
          title={intl.formatMessage(formSection.title)}
          goBack={goBack}
          goHome={() => this.props.goToHomeTab(WORKQUEUE_TABS.readyToPrint)}
        >
          <Content
            title={
              (formGroup.title && intl.formatMessage(formGroup.title)) || ''
            }
          >
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
                this.modifyDeclaration(values, declarationToBeCertified)
              }}
              setAllFieldsDirty={false}
              fields={formGroup.fields}
              draftData={declarationToBeCertified.data}
              onUploadingStateChanged={this.onUploadingStateChanged}
            />
            <PrimaryButton
              id="confirm_form"
              onClick={() => {
                this.continueButtonHandler(
                  declarationToBeCertified.id,
                  formGroup.id,
                  nextSectionGroup ? nextSectionGroup.groupId : undefined,
                  event,
                  formSection.id,
                  formGroup.fields,
                  declarationToBeCertified
                )
              }}
              disabled={this.state.isFileUploading}
            >
              {intl.formatMessage(buttonMessages.continueButton)}
            </PrimaryButton>
          </Content>
        </ActionPageLight>
        {showModalForNoSignedAffidavit && (
          <ResponsiveModal
            id="noAffidavitAgreementConfirmationModal"
            title={intl.formatMessage(
              certificateMessages.noAffidavitModalTitle
            )}
            contentHeight={96}
            actions={[
              <TertiaryButton
                id="cancel-btn"
                key="cancel"
                onClick={this.toggleSubmitModalOpen}
              >
                {intl.formatMessage(buttonMessages.cancel)}
              </TertiaryButton>,
              <PrimaryButton
                key="submit"
                id="submit_confirm"
                onClick={() =>
                  this.goToNextFormForSomeoneElse(
                    declarationId,
                    declarationToBeCertified,
                    event
                  )
                }
                disabled={this.state.isFileUploading}
              >
                {intl.formatMessage(buttonMessages.continueButton)}
              </PrimaryButton>
            ]}
            show={showModalForNoSignedAffidavit}
            handleClose={this.toggleSubmitModalOpen}
          >
            {intl.formatMessage(
              certificateMessages.noAffidavitModalDescription
            )}
          </ResponsiveModal>
        )}
      </>
    )
  }
}

const getCollectCertificateForm = (event: Event, state: IStoreState) => {
  switch (event) {
    case Event.Birth:
    default:
      return state.printCertificateForm.collectBirthCertificateForm
    case Event.Death:
      return state.printCertificateForm.collectDeathCertificateForm
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

  const declaration = state.declarationsState.declarations.find(
    (declaration) => declaration.id === registrationId
  ) as IPrintableDeclaration | undefined

  const formSection = getCollectCertificateForm(event, state)
  const userDetails = getUserDetails(state)
  const userOfficeId = userDetails?.primaryOffice?.id
  const registeringOfficeId = getRegisteringOfficeId(declaration)
  const clonedFormSection = cloneDeep(formSection)
  if (event === Event.Birth && groupId === 'certCollector') {
    const declarationData = declaration && declaration.data
    let motherDataExist: boolean | undefined
    let fatherDataExist: boolean | undefined

    //TODO: This needs to be dynamic.
    // We shouldn't hardcode 'fathersDetailsExist' field check here
    // As it's part of the form definition so we can't ensure
    // that all countries will have this field in their definition
    if (
      declarationData &&
      declarationData.father &&
      declarationData.father.detailsExist !== undefined
    ) {
      fatherDataExist = declarationData.father.detailsExist
    }

    if (
      declarationData &&
      declarationData.mother &&
      declarationData.mother.detailsExist !== undefined
    ) {
      motherDataExist = declarationData.mother.detailsExist
    }

    if (motherDataExist && fatherDataExist) {
      clonedFormSection.groups.unshift(
        certCollectorGroupForBirthAppWithParentDetails
      )
    } else if (fatherDataExist && !motherDataExist) {
      clonedFormSection.groups.unshift(
        certCollectorGroupForBirthAppWithoutMotherDetails
      )
    } else if (motherDataExist && !fatherDataExist) {
      clonedFormSection.groups.unshift(
        certCollectorGroupForBirthAppWithoutFatherDetails
      )
    } else if (!motherDataExist && !fatherDataExist) {
      clonedFormSection.groups.unshift(
        certCollectorGroupForBirthAppWithoutParentDetails
      )
    }
  }
  const formGroup =
    clonedFormSection.groups.find((group) => group.id === groupId) ||
    clonedFormSection.groups[0]

  /**
   * As the field defintions are hard-coded in core, finding
   * by field name, option values are supposed to be fine
   */
  const collectorField = formGroup.fields.find(({ name }) => name === 'type')
  if (collectorField && collectorField.type === 'RADIO_GROUP') {
    const isDifferentOffice =
      userOfficeId &&
      registeringOfficeId &&
      userOfficeId !== registeringOfficeId
    collectorField.options = collectorField.options.map((opt) => ({
      ...opt,
      disabled: opt.value === 'PRINT_IN_ADVANCE' && isDifferentOffice
    }))
  }
  const fields = replaceInitialValues(
    formGroup.fields,
    (declaration &&
      declaration.data.registration.certificates &&
      declaration.data.registration.certificates[
        declaration.data.registration.certificates.length - 1
      ].collector) ||
      {},
    declaration && declaration.data
  )

  return {
    registerForm: getRegisterForm(state)[event],
    event,
    pageRoute: CERTIFICATE_COLLECTOR,
    declarationId: registrationId,
    declaration,
    formSection: clonedFormSection,
    formGroup: {
      ...formGroup,
      fields
    },
    offlineCountryConfiguration: getOfflineData(state)
  }
}

export const CollectorForm = connect(mapStateToProps, {
  goBack,
  goToHomeTab,
  storeDeclaration,
  writeDeclaration,
  modifyDeclaration,
  goToPrintCertificate,
  goToVerifyCollector,
  goToReviewCertificate,
  goToPrintCertificatePayment
})(injectIntl(withTheme(CollectorFormComponent)))
