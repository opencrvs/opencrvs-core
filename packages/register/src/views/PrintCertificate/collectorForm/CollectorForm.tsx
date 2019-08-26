import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import {
  ActionPageLight,
  ResponsiveModal
} from '@opencrvs/components/lib/interface'
import {
  createReviewApplication,
  IApplication,
  modifyApplication,
  deleteApplication,
  storeApplication,
  writeApplication
} from '@register/applications'
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
import { getValidationErrorsForForm } from '@register/forms/validation'
import { buttonMessages, errorMessages } from '@register/i18n/messages'
import { messages as certificateMessages } from '@register/i18n/messages/views/certificate'
import {
  goToHome,
  goToPrintCertificate,
  goToVerifyCollector,
  goToReviewCertificate,
  goToPrintCertificatePayment
} from '@register/navigation'
import { CERTIFICATE_COLLECTOR } from '@register/navigation/routes'
import { IStoreState } from '@register/store'
import styled, { ITheme } from '@register/styledComponents'
import { gqlToDraftTransformer } from '@register/transformer'
import {
  QueryContext,
  QueryProvider
} from '@register/views/DataProvider/QueryProvider'
import { StyledSpinner } from '@register/views/RegistrationHome/RegistrationHome'
import * as Sentry from '@sentry/browser'
import { debounce, flatten } from 'lodash'
import * as React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { Dispatch } from 'redux'
import { withTheme } from 'styled-components'
import { FormFieldGenerator } from '@register/components/form'
import {
  isFreeOfCost,
  getEventDate,
  getEvent
} from '@register/views/PrintCertificate/utils'

const FormSectionTitle = styled.h4`
  ${({ theme }) => theme.fonts.h4Style};
  color: ${({ theme }) => theme.colors.copy};
`

interface IBaseProps {
  registerForm: IForm
  event: Event
  pageRoute: string
  applicationId: string
  application: IApplication | undefined
  formSection: IFormSection
  formGroup: IFormSectionGroup
  theme: ITheme
  goToHome: typeof goToHome
  storeApplication: typeof storeApplication
  writeApplication: typeof writeApplication
  modifyApplication: typeof modifyApplication
  deleteApplication: typeof deleteApplication
  goToPrintCertificate: typeof goToPrintCertificate
  goToVerifyCollector: typeof goToVerifyCollector
  goToReviewCertificate: typeof goToReviewCertificate
  goToPrintCertificatePayment: typeof goToPrintCertificatePayment
}

type IProps = IBaseProps & InjectedIntlProps

function getNextSectionIds(
  formSection: IFormSection,
  formSectionGroup: IFormSectionGroup,
  application: IApplication | undefined
) {
  const visibleGroups = getVisibleSectionGroupsBasedOnConditions(
    formSection,
    (application &&
      application.data.registration &&
      application.data.registration.certificates &&
      // @ts-ignore
      application.data.registration.certificates[0][formSection.id]) ||
      {}
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
  sectionId: string,
  fields: IFormField[],
  draft: IApplication
) => {
  const errors = getValidationErrorsForForm(
    fields,
    (draft.data.registration &&
      draft.data.registration.certificates &&
      // @ts-ignore
      draft.data.registration.certificates[0][sectionId]) ||
      {}
  )

  return {
    [sectionId]: fields.reduce((fields, field) => {
      // REFACTOR
      const validationErrors = errors[field.name]

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
    sectionData: IFormSectionData,
    application: IApplication
  ) => {
    const collector =
      (application.data.registration.certificates &&
        // @ts-ignore
        application.data.registration.certificates[0].collector) ||
      {}
    this.props.modifyApplication({
      ...application,
      data: {
        ...application.data,
        registration: {
          ...application.data.registration,
          // @ts-ignore
          certificates: [
            {
              collector: {
                // @ts-ignore
                ...collector,
                ...sectionData
              },
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

    sectionId: string,
    fields: IFormField[],
    draft: IApplication | undefined
  ) => {
    let errLength = 0
    if (draft) {
      const errors = getErrorsOnFieldsBySection(sectionId, fields, draft)
      errLength = flatten(
        // @ts-ignore
        Object.values(errors).map(Object.values)
        // @ts-ignore
      ).filter(errs => errs.length > 0).length

      const collector =
        draft.data.registration.certificates &&
        // @ts-ignore
        draft.data.registration.certificates[0][sectionId]
      if (errLength > 0) {
        this.setState({
          showError: true
        })
      } else if (currentGroup === 'affidavit') {
        if (collector.affidavitFile && collector.affidavitFile.data) {
          this.props.writeApplication(draft)

          this.goToNextFormForSomeoneElse(applicationId, draft, event)
        } else {
          if (
            collector.noAffidavitAgreement &&
            (collector.noAffidavitAgreement as string[]).length > 0
          ) {
            this.props.writeApplication(draft)
            this.setState({ showModalForNoSignedAffidavit: true })
          } else {
            this.setState({
              showError: true
            })
          }
        }
      } else {
        this.setState({
          showError: false,
          showModalForNoSignedAffidavit: false
        })
        if (!nextGroup) {
          this.props.writeApplication(draft)
          this.props.goToVerifyCollector(applicationId, event, collector.type)
        } else {
          this.props.goToPrintCertificate(applicationId, event, nextGroup)
        }
      }
    }
  }

  goToNextFormForSomeoneElse = (
    applicationId: string,
    application: IApplication,
    event: Event
  ) => {
    if (isFreeOfCost(event, getEventDate(application.data, event))) {
      this.props.goToReviewCertificate(applicationId, event)
    } else {
      this.props.goToPrintCertificatePayment(applicationId, event)
    }
  }

  goToIDCheck = () => {
    this.props.goToHome()
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
      goToHome,
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
    let applicationToBeCertified: IApplication = application as IApplication
    if (!applicationToBeCertified) {
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
                // @ts-ignore
                const retrievedData = data[dataKey]
                const transformedData: IFormData = gqlToDraftTransformer(
                  registerForm,
                  retrievedData
                )

                applicationToBeCertified = createReviewApplication(
                  applicationId,
                  transformedData,
                  event
                )

                this.props.storeApplication(applicationToBeCertified)
              }
            }}
          </QueryContext.Consumer>
        </QueryProvider>
      )
    }
    return (
      <>
        <ActionPageLight
          title={intl.formatMessage(formSection.title)}
          goBack={() => {
            deleteApplication(applicationToBeCertified)
            goToHome()
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
  )
  const formSection = getCollectCertificateForm(event, state)
  if (event === Event.BIRTH && groupId === 'certCollector') {
    if (formSection.groups && formSection.groups[0].id === 'certCollector')
      formSection.groups.shift()
    if (application && application.data && application.data.father) {
      if (application.data.father.fathersDetailsExist) {
        formSection.groups.unshift(
          certCollectorGroupForBirthAppWithFatherDetails
        )
      } else {
        formSection.groups.unshift(
          certCollectorGroupForBirthAppWithoutFatherDetails
        )
      }
    }
  }
  const formGroup =
    formSection.groups.find(group => group.id === groupId) ||
    formSection.groups[0]

  return {
    registerForm: state.registerForm.registerForm[event],
    event,
    pageRoute: CERTIFICATE_COLLECTOR,
    applicationId: registrationId,
    application,
    formSection,
    formGroup,
    goToHome: goToHome
  }
}

export const CollectorForm = connect(
  mapStateToProps,
  {
    goToHome: goToHome,
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
