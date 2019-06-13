import { LinkButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
import {
  ArrowBack,
  ArrowForward,
  DraftSimple,
  TickLarge
} from '@opencrvs/components/lib/icons'
import { Box, Modal } from '@opencrvs/components/lib/interface'
import { BodyContent } from '@opencrvs/components/lib/layout'
import * as Sentry from '@sentry/browser'
import { isNull, isUndefined, merge } from 'lodash'
// @ts-ignore - Required for mocking
import * as debounce from 'lodash/debounce'
import * as React from 'react'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import * as Swipeable from 'react-swipeable'
import {
  deleteApplication,
  IApplication,
  modifyApplication,
  SUBMISSION_STATUS
} from 'src/applications'
import {
  FooterAction,
  FooterPrimaryButton,
  ViewFooter
} from 'src/components/interface/footer'
import { RejectRegistrationForm } from 'src/components/review/RejectRegistrationForm'
import { CONFIRMATION_SCREEN, HOME } from 'src/navigation/routes'
import { toggleDraftSavedNotification } from 'src/notification/actions'
import { IOfflineDataState } from 'src/offline/reducer'
import { getOfflineState } from 'src/offline/selectors'
import { getScope } from 'src/profile/profileSelectors'
import { IStoreState } from 'src/store'
import { Scope } from 'src/utils/authUtils'
import { isMobileDevice } from 'src/utils/commonUtils'
import {
  DECLARATION,
  DUPLICATION,
  OFFLINE,
  REGISTERED,
  REGISTRATION,
  REJECTION
} from 'src/utils/constants'
import { FormFieldGenerator, ViewHeaderWithTabs } from '../../components/form'
import {
  Action,
  Event,
  IForm,
  IFormField,
  IFormSection,
  IFormSectionData
} from '../../forms'
import {
  goBack as goBackAction,
  goToTab as goToTabAction
} from '../../navigation'
import styled from '../../styled-components'
import { ReviewSection } from '../../views/RegisterForm/review/ReviewSection'
import { StickyFormTabs } from './StickyFormTabs'

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

export const messages = defineMessages({
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
function getActiveSectionId(form: IForm, viewParams: { tabId?: string }) {
  return viewParams.tabId || form.sections[0].id
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
  tabRoute: string
  duplicate?: boolean
}

type DispatchProps = {
  goToTab: typeof goToTabAction
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

type FullProps = IFormProps &
  Props &
  DispatchProps &
  InjectedIntlProps & { scope: Scope } & RouteComponentProps<{}>

type State = {
  showSubmitModal: boolean
  showRegisterModal: boolean
  isDataAltered: boolean
  rejectFormOpen: boolean
  selectedTabId: string
  hasError: boolean
}
const VIEW_TYPE = {
  REVIEW: 'review',
  PREVIEW: 'preview'
}

interface IFullName {
  fullNameInBn: string
  fullNameInEng: string
}

const getFullName = (childData: IFormSectionData): IFullName => {
  let fullNameInBn = ''
  let fullNameInEng = ''

  if (childData.firstNames) {
    fullNameInBn = `${String(childData.firstNames)} ${String(
      childData.familyName
    )}`
  } else {
    fullNameInBn = String(childData.familyName)
  }

  if (childData.firstNamesEng) {
    fullNameInEng = `${String(childData.firstNamesEng)} ${String(
      childData.familyNameEng
    )}`
  } else if (childData.familyNameEng) {
    fullNameInEng = String(childData.familyNameEng)
  }

  return {
    fullNameInBn,
    fullNameInEng
  }
}

class RegisterFormView extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)
    this.state = {
      showSubmitModal: false,
      selectedTabId: '',
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

  rejectSubmission = () => {
    const {
      history,
      application,
      application: { event }
    } = this.props

    const personData =
      event === Event.DEATH
        ? this.props.application.data.deceased
        : this.props.application.data.child
    const fullName = getFullName(personData)

    history.push(CONFIRMATION_SCREEN, {
      trackNumber: application.data.registration.trackingId,
      eventName: REJECTION,
      fullNameInBn: fullName.fullNameInBn,
      fullNameInEng: fullName.fullNameInEng,
      eventType: event,
      trackingSection: true,
      duplicateContextId:
        history.location.state && history.location.state.duplicateContextId
    })

    this.props.deleteApplication(application)
  }

  successfulSubmission = (response: string) => {
    const {
      history,
      application,
      application: { event }
    } = this.props
    const personData =
      event === Event.DEATH
        ? this.props.application.data.deceased
        : this.props.application.data.child
    const fullName = getFullName(personData)
    const eventName = this.userHasRegisterScope() ? REGISTRATION : DECLARATION

    history.push(CONFIRMATION_SCREEN, {
      trackNumber: response,
      trackingSection: true,
      eventName,
      eventType: event,
      fullNameInBn: fullName.fullNameInBn,
      fullNameInEng: fullName.fullNameInEng
    })
    this.props.deleteApplication(application)
  }

  offlineSubmission = () => {
    const {
      history,
      application,
      application: { event }
    } = this.props
    const personData =
      event === Event.DEATH
        ? this.props.application.data.deceased
        : this.props.application.data.child
    const fullName = getFullName(personData)

    history.push(CONFIRMATION_SCREEN, {
      trackingSection: true,
      eventName: OFFLINE,
      eventType: event,
      fullNameInBn: fullName.fullNameInBn,
      fullNameInEng: fullName.fullNameInEng
    })
    this.props.deleteApplication(application)
  }

  successfullyRegistered = (response: string) => {
    const {
      history,
      application: application,
      application: { event }
    } = this.props
    const personData =
      event === Event.DEATH
        ? this.props.application.data.deceased
        : this.props.application.data.child
    const fullName = getFullName(personData)
    const duplicate = history.location.state && history.location.state.duplicate
    const eventName = duplicate ? DUPLICATION : REGISTRATION

    history.push(CONFIRMATION_SCREEN, {
      trackNumber: response,
      trackingSection: true,
      eventName,
      eventType: event,
      actionName: REGISTERED,
      fullNameInBn: fullName.fullNameInBn,
      fullNameInEng: fullName.fullNameInEng,
      duplicateContextId:
        history.location.state && history.location.state.duplicateContextId
    })
    this.props.deleteApplication(application)
  }

  registrationOnError = (error: Error) => {
    Sentry.captureException(error)
    this.setState({
      showRegisterModal: false,
      hasError: true
    })
  }

  submitForm = () => {
    this.setState({ showSubmitModal: true })
  }

  confirmSubmission = (
    application: IApplication,
    submissionStatus: string,
    action: string
  ) => {
    application.submissionStatus = submissionStatus
    application.action = action
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
          this.props.tabRoute,
          this.props.application.event.toLowerCase()
        )
      } else {
        this.onSwiped(
          this.props.application.id,
          getPreviousSection(
            this.props.registerForm.sections,
            this.props.activeSection
          ),
          this.props.tabRoute,
          this.props.application.event.toLowerCase()
        )
      }
    }
  }

  onSwiped = (
    applicationId: string,
    selectedSection: IFormSection | null,
    tabRoute: string,
    event: string
  ): void => {
    if (selectedSection) {
      this.props.goToTab(tabRoute, applicationId, selectedSection.id, event)
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
      goToTab,
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
    const sectionForReview = isReviewForm
      ? this.generateSectionListForReview(
          isReviewSection,
          registerForm.sections
        )
      : registerForm.sections
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
            <ViewHeaderWithTabs
              id="informant_parent_view"
              title={intl.formatMessage(title, { event: application.event })}
            >
              <StickyFormTabs
                sections={sectionForReview}
                activeTabId={activeSection.id}
                onTabClick={(tabId: string) =>
                  goToTab(
                    this.props.tabRoute,
                    application.id,
                    tabId,
                    application.event.toLowerCase()
                  )
                }
              />
            </ViewHeaderWithTabs>
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
                      tabRoute={this.props.tabRoute}
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
                      tabRoute={this.props.tabRoute}
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
                            id={`form_section_optional_label_${
                              activeSection.id
                            }`}
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
                                goToTab(
                                  this.props.tabRoute,
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
            confirmRejectionEvent={this.rejectSubmission}
            duplicate={duplicate}
            draftId={application.id}
            event={this.getEvent()}
          />
        )}
      </FormViewContainer>
    )
  }
}

function replaceInitialValues(fields: IFormField[], sectionValues: object) {
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
    RouteComponentProps<{ tabId: string; applicationId: string }>
) {
  const { match, registerForm, application } = props

  const activeSectionId = getActiveSectionId(registerForm, match.params)

  const activeSection = registerForm.sections.find(
    ({ id }) => id === activeSectionId
  )

  if (!activeSection) {
    throw new Error(`Configuration for tab "${match.params.tabId}" missing!`)
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

export const RegisterForm = connect<Props, DispatchProps>(
  mapStateToProps,
  {
    modifyApplication,
    deleteApplication,
    goToTab: goToTabAction,
    goBack: goBackAction,
    toggleDraftSavedNotification,
    handleSubmit: values => {
      console.log(values)
    }
  }
)(injectIntl<FullProps>(RegisterFormView))
