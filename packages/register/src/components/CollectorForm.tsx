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
  goToVerifyCollector
} from '@register/navigation'
import { PRINT_CERTIFICATE } from '@register/navigation/routes'
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
import { FormFieldGenerator } from './form'

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
}

type IProps = IBaseProps & InjectedIntlProps

const VIEW_TYPE = {
  FORM: 'form',
  REVIEW: 'review',
  PREVIEW: 'preview',
  HIDDEN: 'hidden'
}

function getNextSectionIds(
  formSection: IFormSection,
  formSectionGroup: IFormSectionGroup,
  application: IApplication | undefined
) {
  const visibleGroups = getVisibleSectionGroupsBasedOnConditions(
    formSection,
    (application && application.data[formSection.id]) || {}
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
  const errors = getValidationErrorsForForm(fields, draft.data[sectionId] || {})

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
    activeSection: IFormSection,
    application: IApplication
  ) => {
    this.props.modifyApplication({
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

  continueButtonHandler = (
    applicationId: string,
    currentGroup: string,
    nextGroup: string | undefined,
    event: string,

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

      if (errLength > 0) {
        this.setState({
          showError: true
        })
      } else if (currentGroup === 'affidavit') {
        if (
          draft &&
          draft.data[sectionId] &&
          draft.data[sectionId].signedFile
        ) {
          this.props.writeApplication(draft)
          // Dispatch action to redirect to payment form
        } else {
          if (
            draft &&
            draft.data[sectionId] &&
            draft.data[sectionId].noAffidavitAgreement &&
            (draft.data[sectionId].noAffidavitAgreement as string[]).length > 0
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
          this.props.goToVerifyCollector(
            applicationId,
            event,
            draft.data &&
              draft.data.collector &&
              (draft.data.collector.type as string)
          )
        } else {
          this.props.goToPrintCertificate(applicationId, event, nextGroup)
        }
      }
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
            <ErrorText>
              {(formGroup.error && intl.formatMessage(formGroup.error)) || ''}
            </ErrorText>
          )}
          <FormFieldGenerator
            id={formGroup.id}
            onChange={values => {
              debouncedModifyApplication(
                values,
                formSection,
                applicationToBeCertified
              )
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
                applicationToBeCertified.event.toLowerCase(),

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
                onClick={this.goToIDCheck}
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

const getEvent = (eventType: string | undefined) => {
  switch (eventType && eventType.toLowerCase()) {
    case 'birth':
    default:
      return Event.BIRTH
    case 'death':
      return Event.DEATH
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
  console.log(JSON.stringify(application))
  const formSection = getCollectCertificateForm(event, state)
  if (event === Event.BIRTH && groupId === 'birthCertCollectorGroup') {
    if (
      formSection.groups &&
      formSection.groups[0].id === 'birthCertCollectorGroup'
    )
      formSection.groups.shift()
    if (application && application.data && application.data.father) {
      if (application.data.father.fatherDetailsExist) {
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
    pageRoute: PRINT_CERTIFICATE,
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
    goToVerifyCollector
  }
)(injectIntl(withTheme(CollectorFormComponent)))
