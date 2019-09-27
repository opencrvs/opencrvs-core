import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import {
  ActionPageLight,
  ResponsiveModal
} from '@opencrvs/components/lib/interface'
import {
  createReviewApplication,
  deleteApplication,
  modifyApplication,
  storeApplication,
  writeApplication,
  IPrintableApplication,
  ICertificate
} from '@register/applications'
import { FormFieldGenerator } from '@register/components/form'
import {
  Action,
  Event,
  IForm,
  IFormData,
  IFormField,
  IFormSection,
  IFormSectionData,
  IFormSectionGroup
} from '@register/forms'
import {
  certCollectorGroupForBirthAppWithFatherDetails,
  certCollectorGroupForBirthAppWithoutFatherDetails
} from '@register/forms/certificate/fieldDefinitions/collectorSection'
import { getVisibleSectionGroupsBasedOnConditions } from '@register/forms/utils'
import {
  getValidationErrorsForForm,
  IFieldErrors
} from '@register/forms/validation'
import { buttonMessages, errorMessages } from '@register/i18n/messages'
import { messages as certificateMessages } from '@register/i18n/messages/views/certificate'
import {
  goBack,
  goToPrintCertificate,
  goToPrintCertificatePayment,
  goToReviewCertificate,
  goToVerifyCollector
} from '@register/navigation'
import { CERTIFICATE_COLLECTOR } from '@register/navigation/routes'
import { IStoreState } from '@register/store'
import styled, { ITheme } from '@register/styledComponents'
import { gqlToDraftTransformer } from '@register/transformer'
import {
  QueryContext,
  QueryProvider
} from '@register/views/DataProvider/QueryProvider'
import {
  getEvent,
  getEventDate,
  isFreeOfCost
} from '@register/views/PrintCertificate/utils'
import { StyledSpinner } from '@register/views/RegistrationHome/RegistrationHome'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/browser'
import { debounce, flatten, cloneDeep } from 'lodash'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { withTheme } from 'styled-components'
import { IValidationResult } from '@register/utils/validate'
import { getRegisterForm } from '@register/forms/register/application-selectors'

const FormSectionTitle = styled.h4`
  ${({ theme }) => theme.fonts.h4Style};
  color: ${({ theme }) => theme.colors.copy};
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
  deleteApplication: typeof deleteApplication
  goToPrintCertificate: typeof goToPrintCertificate
  goToVerifyCollector: typeof goToVerifyCollector
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
      const validationErrors: IValidationResult[] = (errors[
        field.name as keyof typeof errors
      ] as IFieldErrors).errors

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
}

class CollectorFormComponent extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      showError: false,
      showModalForNoSignedAffidavit: false
    }
  }
  modifyApplication = (
    sectionData: ICertificate['collector'],
    application: IPrintableApplication
  ) => {
    const certificates = application.data.registration.certificates
    const certificate = (certificates && certificates[0]) || {}
    const collector = { ...(certificate.collector || {}), ...sectionData }

    this.props.modifyApplication({
      ...application,
      data: {
        ...application.data,
        registration: {
          ...application.data.registration,
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
    applicationId: string,
    currentGroup: string,
    nextGroup: string | undefined,
    event: Event,

    sectionId: keyof IPrintableApplication['data'],
    fields: IFormField[],
    draft: IPrintableApplication | undefined
  ) => {
    if (!draft) return

    const errors = getErrorsOnFieldsBySection(sectionId, fields, draft)
    const errorValues = Object.values(errors).map(Object.values)
    const errLength = flatten(errorValues).filter(errs => errs.length > 0)
      .length

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
        this.props.writeApplication(draft)
        this.goToNextFormForSomeoneElse(applicationId, draft, event)

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

      this.props.writeApplication(draft)
      this.setState({ showModalForNoSignedAffidavit: true })

      return
    }

    this.setState({
      showError: false,
      showModalForNoSignedAffidavit: false
    })
    if (!nextGroup) {
      this.props.writeApplication(draft)
      this.props.goToVerifyCollector(
        applicationId,
        event,
        collector.type as string
      )
    } else {
      this.props.goToPrintCertificate(applicationId, event, nextGroup)
    }
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

  toggleSubmitModalOpen = () => {
    this.setState(prevState => ({
      showModalForNoSignedAffidavit: !prevState.showModalForNoSignedAffidavit
    }))
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
      deleteApplication,
      registerForm
    } = this.props

    const { showError, showModalForNoSignedAffidavit } = this.state

    const debouncedModifyApplication = debounce(this.modifyApplication, 500)

    const nextSectionGroup = getNextSectionIds(
      formSection,
      formGroup,
      application
    )
    const applicationToBeCertified = application

    if (
      !applicationToBeCertified ||
      !applicationToBeCertified.data.registration.regStatus
    ) {
      return (
        <QueryProvider
          event={event}
          action={Action.LOAD_CERTIFICATE_APPLICATION}
          payload={{ id: applicationId }}
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
          id="collector_form"
          title={intl.formatMessage(formSection.title)}
          goBack={() => {
            deleteApplication(applicationToBeCertified)
            goBack()
          }}
        >
          <FormSectionTitle>
            {formGroup.fields.length === 1 &&
              (formGroup.fields[0].hideHeader = true)}
            <>
              {(formGroup.title && intl.formatMessage(formGroup.title)) || ''}
            </>
          </FormSectionTitle>
          {showError && (
            <ErrorText id="form_error">
              {(formGroup.error && intl.formatMessage(formGroup.error)) || ''}
            </ErrorText>
          )}
          <FormFieldGenerator
            id={formGroup.id}
            onChange={values => {
              debouncedModifyApplication(values, applicationToBeCertified)
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
                onClick={() => {
                  deleteApplication(applicationToBeCertified)
                  this.toggleSubmitModalOpen()
                }}
              >
                {intl.formatMessage(buttonMessages.cancel)}
              </TertiaryButton>,
              <PrimaryButton
                key="submit"
                id="submit_confirm"
                onClick={() =>
                  this.goToNextFormForSomeoneElse(
                    applicationId,
                    applicationToBeCertified,
                    event
                  )
                }
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
    case Event.BIRTH:
    default:
      return state.printCertificateForm.collectBirthCertificateForm
    case Event.DEATH:
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

  const application = state.applicationsState.applications.find(
    application => application.id === registrationId
  ) as IPrintableApplication | undefined

  const formSection = getCollectCertificateForm(event, state)
  const clonedFormSection = cloneDeep(formSection)
  if (event === Event.BIRTH && groupId === 'certCollector') {
    if (application && application.data && application.data.father) {
      if (application.data.father.fathersDetailsExist) {
        clonedFormSection.groups.unshift(
          certCollectorGroupForBirthAppWithFatherDetails
        )
      } else {
        clonedFormSection.groups.unshift(
          certCollectorGroupForBirthAppWithoutFatherDetails
        )
      }
    }
  }
  const formGroup =
    clonedFormSection.groups.find(group => group.id === groupId) ||
    clonedFormSection.groups[0]

  return {
    registerForm: getRegisterForm(state)[event],
    event,
    pageRoute: CERTIFICATE_COLLECTOR,
    applicationId: registrationId,
    application,
    formSection: clonedFormSection,
    formGroup
  }
}

export const CollectorForm = connect(
  mapStateToProps,
  {
    goBack,
    storeApplication,
    writeApplication,
    modifyApplication,
    deleteApplication,
    goToPrintCertificate,
    goToVerifyCollector,
    goToReviewCertificate,
    goToPrintCertificatePayment
  }
)(injectIntl(withTheme(CollectorFormComponent)))
