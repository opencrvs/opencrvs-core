import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import Swipeable from 'react-swipeable'
import { Box, Modal } from '@opencrvs/components/lib/interface'
import { PrimaryButton, LinkButton } from '@opencrvs/components/lib/buttons'
import {
  ArrowBack,
  ArrowForward,
  DraftSimple,
  TickLarge
} from '@opencrvs/components/lib/icons'
import { BodyContent } from '@opencrvs/components/lib/layout'
import { isNull, isUndefined, merge } from 'lodash'
// @ts-ignore - Required for mocking
import debounce from 'lodash/debounce'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import styled from '@register/styledComponents'
import {
  goToPage as goToPageAction,
  goBack as goBackAction
} from '@register/navigation'
import {
  IForm,
  IFormSection,
  IFormField,
  IFormSectionData,
  Event,
  Action
} from '@register/forms'
import { FormFieldGenerator } from '@register/components/form'
import { IStoreState } from '@register/store'
import {
  deleteApplication,
  IApplication,
  IPayload,
  modifyApplication,
  SUBMISSION_STATUS
} from '@register/applications'
import {
  FooterAction,
  FooterPrimaryButton,
  ViewFooter
} from '@register/components/interface/footer'
import { ReviewSection } from '@register/views/RegisterForm/review/ReviewSection'
import { RejectRegistrationForm } from '@register/components/review/RejectRegistrationForm'
import { getOfflineState } from '@register/offline/selectors'
import { IOfflineDataState } from '@register/offline/reducer'
import { CONFIRMATION_SCREEN, HOME } from '@register/navigation/routes'
import { getScope } from '@register/profile/profileSelectors'
import { Scope } from '@register/utils/authUtils'
import { isMobileDevice } from '@register/utils/commonUtils'
import { toggleDraftSavedNotification } from '@register/notification/actions'
import { ViewHeader } from '@register/components/ViewHeader'

const FormSectionTitle = styled.h3`
  ${({ theme }) => theme.fonts.h3Style};
  color: ${({ theme }) => theme.colors.copy};
`
const FormActionSection = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  margin: 0px -25px;
`
const FormAction = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 83px;
  padding-left: 25px;
`
const FormActionDivider = styled.div`
  border-bottom: 1px inset ${({ theme }) => theme.colors.placeholder};
`

const FormPrimaryButton = styled(PrimaryButton)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
  height: 93px;
`

const BackButtonContainer = styled.div`
  cursor: pointer;
`

const BackButton = styled(PrimaryButton)`
  width: 69px;
  height: 42px;
  background: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  border-radius: 21px;
`

const BackButtonText = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  text-transform: uppercase;
  ${({ theme }) => theme.fonts.subtitleStyle};
  margin-left: 14px;
`

const DraftButtonContainer = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`
const Notice = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.11);
  padding: 25px;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.bigBodyStyle};
  margin: 30px -25px;
`
const CancelButton = styled.a`
  text-decoration: underline;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
`

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  newBirthRegistration: {
    id: 'register.form.newBirthRegistration',
    defaultMessage: 'New birth application',
    description: 'The message that appears for new birth registrations'
  },
  newVitalEventRegistration: {
    id: 'register.form.newVitalEventRegistration',
    defaultMessage:
      'New {event, select, birth {birth} death {death} marriage {marriage} divorce {divorce} adoption {adoption}} application',
    description: 'The message that appears for new vital event registration'
  },
  previewEventRegistration: {
    id: 'register.form.previewEventRegistration',
    defaultMessage:
      '{event, select, birth {Birth} death {Death} marriage {Marriage} divorce {Divorce} adoption {Adoption}} Application Preview',
    description: 'The message that appears for new birth registrations'
  },
  reviewEventRegistration: {
    id: 'register.form.reviewEventRegistration',
    defaultMessage:
      '{event, select, birth {Birth} death {Death} marriage {Marriage} divorce {Divorce} adoption {Adoption}} Application Review',
    description: 'The message that appears for new birth registrations'
  },
  saveDraft: {
    id: 'register.form.saveDraft',
    defaultMessage: 'Save draft',
    description: 'Save draft button'
  },
  next: {
    id: 'register.form.next',
    defaultMessage: 'Next',
    description: 'Next button'
  },
  cancel: {
    id: 'register.form.modal.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button on submit modal'
  },
  submitDescription: {
    id: 'register.form.modal.submitDescription',
    defaultMessage:
      'By clicking “Submit” you confirm that the informant has read and reviewed the information and understands that this information will be shared with Civil Registration authorities.',
    description: 'Submit description text on submit modal'
  },
  submitButton: {
    id: 'register.form.modal.submitButton',
    defaultMessage: 'Submit',
    description: 'Submit button on submit modal'
  },
  back: {
    id: 'menu.back',
    defaultMessage: 'Back',
    description: 'Back button in the menu'
  },
  valueSaveAsDraft: {
    id: 'register.form.saveDraft',
    defaultMessage: 'Save as draft',
    description: 'Save as draft Button Text'
  },
  optionalLabel: {
    id: 'formFields.optionalLabel',
    defaultMessage: 'Optional',
    description: 'Optional label'
  },
  submitConfirmation: {
    id: 'modal.title.submitConfirmation',
    defaultMessage: 'Are you ready to submit?',
    description: 'Title for submit confirmation modal'
  },
  queryError: {
    id: 'register.registerForm.queryError',
    defaultMessage:
      'The page cannot be loaded at this time due to low connectivity or a network error. Please click refresh to try again, or try again later.',
    description: 'The error message shown when a search query fails'
  }
})

const FormContainer = styled.div`
  padding: 35px 25px;
  padding-bottom: 0;
`

const FormViewContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`

const Optional = styled.span.attrs<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>({})`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.placeholder};
  flex-grow: 0;
`

const ConfirmBtn = styled(PrimaryButton)`
  min-width: 150px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  &:disabled {
    background: ${({ theme }) => theme.colors.primary};
    path {
      stroke: ${({ theme }) => theme.colors.disabled};
    }
  }
`

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
`
function getActiveSectionId(form: IForm, viewParams: { pageId?: string }) {
  return viewParams.pageId || form.sections[0].id
}

function getNextSection(sections: IFormSection[], fromSection: IFormSection) {
  const currentIndex = sections.findIndex(
    (section: IFormSection) => section.id === fromSection.id
  )

  if (currentIndex === sections.length - 1) {
    return null
  }

  return sections[currentIndex + 1]
}

function getPreviousSection(
  sections: IFormSection[],
  fromSection: IFormSection
) {
  const currentIndex = sections.findIndex(
    (section: IFormSection) => section.id === fromSection.id
  )

  if (currentIndex === 0) {
    return null
  }

  return sections[currentIndex - 1]
}

export interface IFormProps {
  application: IApplication
  registerForm: IForm
  pageRoute: string
  duplicate?: boolean
}

type DispatchProps = {
  goToPage: typeof goToPageAction
  goBack: typeof goBackAction
  modifyApplication: typeof modifyApplication
  deleteApplication: typeof deleteApplication
  toggleDraftSavedNotification: typeof toggleDraftSavedNotification
  handleSubmit: (values: unknown) => void
}

type Props = {
  activeSection: IFormSection
  setAllFieldsDirty: boolean
  offlineResources: IOfflineDataState
}

export type FullProps = IFormProps &
  Props &
  DispatchProps &
  InjectedIntlProps & { scope: Scope } & RouteComponentProps<{
    pageId: string
    applicationId: string
  }>

type State = {
  showSubmitModal: boolean
  showRegisterModal: boolean
  isDataAltered: boolean
  rejectFormOpen: boolean
  hasError: boolean
}
const VIEW_TYPE = {
  REVIEW: 'review',
  PREVIEW: 'preview'
}

class RegisterFormView extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)
    this.state = {
      showSubmitModal: false,
      isDataAltered: false,
      rejectFormOpen: false,
      showRegisterModal: false,
      hasError: false
    }
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  modifyApplication = (
    sectionData: IFormSectionData,
    activeSection: IFormSection,
    application: IApplication
  ) => {
    if (application.review && !this.state.isDataAltered) {
      this.setState({ isDataAltered: true })
    }
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

  submitForm = () => {
    this.setState({ showSubmitModal: true })
  }

  confirmSubmission = (
    application: IApplication,
    submissionStatus: string,
    action: string,
    payload?: IPayload
  ) => {
    application.submissionStatus = submissionStatus
    application.action = action
    application.payload = payload
    this.props.modifyApplication(application)
    this.props.history.push(HOME)
  }

  registerApplication = () => {
    this.setState({ showRegisterModal: true })
  }

  toggleSubmitModalOpen = () => {
    this.setState((prevState: State) => ({
      showSubmitModal: !prevState.showSubmitModal
    }))
  }

  toggleRegisterModalOpen = () => {
    this.setState((prevState: State) => ({
      showRegisterModal: !prevState.showRegisterModal
    }))
  }

  makeSwipe(deltaX: number, deltaY: number) {
    if (Math.abs(deltaX) > Math.abs(deltaY * 4)) {
      if (deltaX > 0) {
        this.onSwiped(
          this.props.application.id,
          getNextSection(
            this.props.registerForm.sections,
            this.props.activeSection
          ),
          this.props.pageRoute,
          this.props.application.event.toLowerCase()
        )
      } else {
        this.onSwiped(
          this.props.application.id,
          getPreviousSection(
            this.props.registerForm.sections,
            this.props.activeSection
          ),
          this.props.pageRoute,
          this.props.application.event.toLowerCase()
        )
      }
    }
  }

  onSwiped = (
    applicationId: string,
    selectedSection: IFormSection | null,
    pageRoute: string,
    event: string
  ): void => {
    if (selectedSection) {
      this.props.goToPage(pageRoute, applicationId, selectedSection.id, event)
    }
  }

  generateSectionListForReview = (
    disabled: boolean,
    sections: IFormSection[]
  ) => {
    const result: IFormSection[] = []
    sections.map((section: IFormSection) => {
      result.push(
        merge(
          {
            disabled: section.viewType !== VIEW_TYPE.REVIEW && disabled
          },
          section
        )
      )
    })
    return result
  }

  toggleRejectForm = () => {
    this.setState(state => ({
      rejectFormOpen: !state.rejectFormOpen
    }))
  }

  getEvent() {
    const eventType = this.props.application.event || 'BIRTH'
    switch (eventType.toLocaleLowerCase()) {
      case 'birth':
        return Event.BIRTH
      case 'death':
        return Event.DEATH
      default:
        return Event.BIRTH
    }
  }

  onSaveAsDraftClicked = () => {
    this.props.history.push('/')
    this.props.toggleDraftSavedNotification()
  }

  render() {
    const {
      goToPage,
      goBack,
      intl,
      activeSection,
      setAllFieldsDirty,
      application,
      history,
      registerForm,
      offlineResources,
      handleSubmit,
      duplicate
    } = this.props

    const isReviewForm = application.review
    const nextSection = getNextSection(registerForm.sections, activeSection)
    const title = isReviewForm
      ? messages.reviewEventRegistration
      : activeSection.viewType === VIEW_TYPE.PREVIEW
      ? messages.previewEventRegistration
      : messages.newVitalEventRegistration
    const isReviewSection = activeSection.viewType === VIEW_TYPE.REVIEW
    const isErrorOccured = this.state.hasError
    const debouncedModifyApplication = debounce(this.modifyApplication, 500)

    return (
      <FormViewContainer>
        {isErrorOccured && (
          <ErrorText id="error_message_section">
            {intl.formatMessage(messages.queryError)}
          </ErrorText>
        )}

        {!isErrorOccured && (
          <>
            <ViewHeader
              id="informant_parent_view"
              title={intl.formatMessage(title, { event: application.event })}
            ></ViewHeader>
            <FormContainer>
              <BodyContent>
                <Swipeable
                  disabled={isReviewSection || !isMobileDevice()}
                  id="swipeable_block"
                  trackMouse
                  delta={50}
                  onSwiped={(e: any, deltaX: number, deltaY: number) =>
                    this.makeSwipe(deltaX, deltaY)
                  }
                >
                  {activeSection.viewType === VIEW_TYPE.PREVIEW && (
                    <ReviewSection
                      pageRoute={this.props.pageRoute}
                      draft={application}
                      submitClickEvent={this.submitForm}
                      saveDraftClickEvent={() => this.onSaveAsDraftClicked()}
                      deleteApplicationClickEvent={() => {
                        this.props.deleteApplication(application)
                        history.push('/')
                      }}
                    />
                  )}
                  {activeSection.viewType === VIEW_TYPE.REVIEW && (
                    <ReviewSection
                      pageRoute={this.props.pageRoute}
                      draft={application}
                      rejectApplicationClickEvent={() => {
                        this.toggleRejectForm()
                      }}
                      registerClickEvent={this.registerApplication}
                    />
                  )}
                  {activeSection.viewType === 'form' && (
                    <Box>
                      <FormSectionTitle
                        id={`form_section_title_${activeSection.id}`}
                      >
                        {intl.formatMessage(activeSection.title)}
                        {activeSection.optional && (
                          <Optional
                            id={`form_section_opt_label_${activeSection.id}`}
                            disabled={activeSection.disabled}
                          >
                            &nbsp;&nbsp;•&nbsp;
                            {intl.formatMessage(messages.optionalLabel)}
                          </Optional>
                        )}
                      </FormSectionTitle>
                      {activeSection.notice && (
                        <Notice id={`form_section_notice_${activeSection.id}`}>
                          {intl.formatMessage(activeSection.notice)}
                        </Notice>
                      )}
                      <form
                        id={`form_section_id_${activeSection.id}`}
                        onSubmit={handleSubmit}
                      >
                        <FormFieldGenerator
                          id={activeSection.id}
                          onChange={values => {
                            debouncedModifyApplication(
                              values,
                              activeSection,
                              application
                            )
                          }}
                          setAllFieldsDirty={setAllFieldsDirty}
                          fields={activeSection.fields}
                          offlineResources={offlineResources}
                          draftData={application.data}
                        />
                      </form>
                      <FormActionSection>
                        <FormAction>
                          {
                            <BackButtonContainer onClick={goBack}>
                              <BackButton icon={() => <ArrowBack />} />
                              <BackButtonText>
                                {intl.formatMessage(messages.back)}
                              </BackButtonText>
                            </BackButtonContainer>
                          }
                          {nextSection && (
                            <FormPrimaryButton
                              onClick={() =>
                                goToPage(
                                  this.props.pageRoute,
                                  application.id,
                                  nextSection.id,
                                  application.event.toLowerCase()
                                )
                              }
                              id="next_section"
                              icon={() => <ArrowForward />}
                            >
                              {intl.formatMessage(messages.next)}
                            </FormPrimaryButton>
                          )}
                        </FormAction>
                        <FormActionDivider />
                        <FormAction>
                          {
                            <DraftButtonContainer
                              id="save_as_draft"
                              onClick={() => this.onSaveAsDraftClicked()}
                            >
                              <DraftSimple />
                              <LinkButton>
                                {intl.formatMessage(messages.valueSaveAsDraft)}
                              </LinkButton>
                            </DraftButtonContainer>
                          }
                        </FormAction>
                      </FormActionSection>
                    </Box>
                  )}
                </Swipeable>
              </BodyContent>
            </FormContainer>
            <ViewFooter>
              <FooterAction>
                <FooterPrimaryButton
                  id="save_draft"
                  onClick={() => history.push(CONFIRMATION_SCREEN)}
                >
                  {intl.formatMessage(messages.saveDraft)}
                </FooterPrimaryButton>
              </FooterAction>
            </ViewFooter>
          </>
        )}

        {this.state.showSubmitModal && (
          <Modal
            title={intl.formatMessage(messages.submitConfirmation)}
            actions={[
              <ConfirmBtn
                key="submit"
                id="submit_confirm"
                onClick={() =>
                  this.confirmSubmission(
                    application,
                    SUBMISSION_STATUS.READY_TO_SUBMIT,
                    Action.SUBMIT_FOR_REVIEW
                  )
                }
              >
                <>
                  <TickLarge />
                  {intl.formatMessage(messages.submitButton)}
                </>
              </ConfirmBtn>,
              <CancelButton
                id="cancel-btn"
                key="cancel"
                onClick={() => {
                  this.toggleSubmitModalOpen()
                  if (document.documentElement) {
                    document.documentElement.scrollTop = 0
                  }
                }}
              >
                {intl.formatMessage(messages.cancel)}
              </CancelButton>
            ]}
            show={this.state.showSubmitModal}
            handleClose={this.toggleSubmitModalOpen}
          >
            {intl.formatMessage(messages.submitDescription)}
          </Modal>
        )}
        {this.state.showRegisterModal && (
          <Modal
            title={intl.formatMessage(messages.submitConfirmation)}
            actions={[
              <ConfirmBtn
                key="register"
                id="register_confirm"
                // @ts-ignore
                onClick={() =>
                  this.confirmSubmission(
                    application,
                    SUBMISSION_STATUS.READY_TO_REGISTER,
                    Action.REGISTER_APPLICATION
                  )
                }
              >
                <>
                  <TickLarge />
                  {intl.formatMessage(messages.submitButton)}
                </>
              </ConfirmBtn>,
              <CancelButton
                key="register_cancel"
                id="register_cancel"
                onClick={() => {
                  this.toggleRegisterModalOpen()
                  if (document.documentElement) {
                    document.documentElement.scrollTop = 0
                  }
                }}
              >
                {intl.formatMessage(messages.cancel)}
              </CancelButton>
            ]}
            show={this.state.showRegisterModal}
            handleClose={this.toggleRegisterModalOpen}
          >
            {intl.formatMessage(messages.submitDescription)}
          </Modal>
        )}

        {this.state.rejectFormOpen && (
          <RejectRegistrationForm
            onBack={this.toggleRejectForm}
            confirmRejectionEvent={this.confirmSubmission}
            duplicate={duplicate}
            draftId={application.id}
            event={this.getEvent()}
            application={application}
          />
        )}
      </FormViewContainer>
    )
  }
}

function replaceInitialValues(fields: IFormField[], sectionValues: any) {
  return fields.map(field => ({
    ...field,
    initialValue:
      isUndefined(sectionValues[field.name]) ||
      isNull(sectionValues[field.name])
        ? field.initialValue
        : sectionValues[field.name]
  }))
}

function mapStateToProps(
  state: IStoreState,
  props: IFormProps &
    Props &
    RouteComponentProps<{ pageId: string; applicationId: string }>
) {
  const { match, registerForm, application } = props

  const activeSectionId = getActiveSectionId(registerForm, match.params)

  const activeSection = registerForm.sections.find(
    ({ id }) => id === activeSectionId
  )

  if (!activeSection) {
    throw new Error(`Configuration for tab "${match.params.pageId}" missing!`)
  }

  if (!application) {
    throw new Error(`Draft "${match.params.applicationId}" missing!`)
  }
  const visitedSections = registerForm.sections.filter(({ id }) =>
    Boolean(application.data[id])
  )

  const rightMostVisited = visitedSections[visitedSections.length - 1]

  const setAllFieldsDirty =
    rightMostVisited &&
    registerForm.sections.indexOf(activeSection) <
      registerForm.sections.indexOf(rightMostVisited)

  const fields = replaceInitialValues(
    activeSection.fields,
    application.data[activeSectionId] || {}
  )

  const offlineResources = getOfflineState(state)

  return {
    registerForm,
    scope: getScope(state),
    setAllFieldsDirty,
    offlineResources,
    activeSection: {
      ...activeSection,
      fields
    },
    application
  }
}

export const RegisterForm = connect<
  Props,
  DispatchProps,
  FullProps,
  IStoreState
>(
  mapStateToProps,
  {
    modifyApplication,
    deleteApplication,
    goToPage: goToPageAction,
    goBack: goBackAction,
    toggleDraftSavedNotification,
    handleSubmit: (values: any) => {
      console.log(values)
    }
  }
)(injectIntl<FullProps>(RegisterFormView))
