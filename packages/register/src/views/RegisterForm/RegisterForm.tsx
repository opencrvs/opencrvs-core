import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import * as Swipeable from 'react-swipeable'
import { Box, Modal } from '@opencrvs/components/lib/interface'
import { PrimaryButton, ButtonIcon } from '@opencrvs/components/lib/buttons'
import {
  ArrowForward,
  ArrowBack,
  DraftSimple
} from '@opencrvs/components/lib/icons'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import styled from '../../styled-components'
import {
  goToTab as goToTabAction,
  goBack as goBackAction
} from '../../navigation'
import {
  IForm,
  IFormSection,
  IFormField,
  IFormSectionData,
  Event,
  Action
} from '../../forms'
import { FormFieldGenerator, ViewHeaderWithTabs } from '../../components/form'
import { IStoreState } from 'src/store'
import { IDraft, modifyDraft, deleteDraft } from 'src/drafts'
import {
  FooterAction,
  FooterPrimaryButton,
  ViewFooter
} from 'src/components/interface/footer'
import { StickyFormTabs } from './StickyFormTabs'
import { ReviewSection } from '../../views/RegisterForm/review/ReviewSection'
import { merge, isUndefined, isNull } from 'lodash'
import { RejectRegistrationForm } from 'src/components/review/RejectRegistrationForm'
import { getOfflineState } from 'src/offline/selectors'
import { IOfflineDataState } from 'src/offline/reducer'
import { CONFIRMATION_SCREEN } from 'src/navigation/routes'
import { HeaderContent } from '@opencrvs/components/lib/layout'

import {
  DECLARATION,
  SUBMISSION,
  REJECTION,
  REGISTRATION,
  REGISTERED,
  DUPLICATION
} from 'src/utils/constants'

import { getScope } from 'src/profile/profileSelectors'
import { Scope } from 'src/utils/authUtils'
import { isMobileDevice } from 'src/utils/commonUtils'
import {
  MutationProvider,
  MutationContext
} from '../DataProvider/MutationProvider'
import { toggleDraftSavedNotification } from 'src/notification/actions'
import { InvertSpinner } from '@opencrvs/components/lib/interface'
import { TickLarge } from '@opencrvs/components/lib/icons'

const FormSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`
const FormActionSection = styled.div`
  background-color: ${({ theme }) => theme.colors.inputBackground};
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
  border-bottom: 1px inset ${({ theme }) => theme.colors.blackAlpha20};
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
  /* stylelint-disable */
  ${ButtonIcon} {
    /* stylelint-enable */
    margin-left: 0em;
  }
`

const BackButtonText = styled.span`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  color: ${({ theme }) => theme.colors.primary};
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 2px;
  margin-left: 14px;
`

const DraftButtonContainer = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`
const DraftButtonText = styled.span`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 14px;
  text-decoration: underline;
  letter-spacing: 0px;
  margin-left: 14px;
`
const Notice = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.11);
  padding: 25px;
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 18px;
  line-height: 24px;
  margin: 30px -25px;
`
const PreviewButton = styled.a`
  text-decoration: underline;
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
  preview: {
    id: 'register.form.modal.preview',
    defaultMessage: 'Preview',
    description: 'Preview button on submit modal'
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
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 18px;
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.placeholder};
  flex-grow: 0;
`

const ButtonSpinner = styled(InvertSpinner)`
  width: 15px;
  height: 15px;
  top: 0px !important;
`

const ConfirmBtn = styled(PrimaryButton)`
  font-weight: bold;
  padding: 15px 20px 15px 20px;
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
  draft: IDraft
  registerForm: IForm
  tabRoute: string
  duplicate?: boolean
}

type DispatchProps = {
  goToTab: typeof goToTabAction
  goBack: typeof goBackAction
  modifyDraft: typeof modifyDraft
  deleteDraft: typeof deleteDraft
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
  } else {
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
      showRegisterModal: false
    }
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  modifyDraft = (sectionData: IFormSectionData) => {
    const { activeSection, draft } = this.props
    if (draft.review && !this.state.isDataAltered) {
      this.setState({ isDataAltered: true })
    }
    this.props.modifyDraft({
      ...draft,
      data: {
        ...draft.data,
        [activeSection.id]: { ...draft.data[activeSection.id], ...sectionData }
      }
    })
  }

  rejectSubmission = () => {
    const {
      history,
      draft,
      draft: { event }
    } = this.props
    let personData
    if (event === Event.DEATH) {
      personData = this.props.draft.data.deceased
    } else {
      personData = this.props.draft.data.child
    }
    const fullName = getFullName(personData)
    const duplicate = history.location.state && history.location.state.duplicate
    let eventName = DECLARATION
    if (duplicate) {
      eventName = DUPLICATION
    }
    history.push(CONFIRMATION_SCREEN, {
      eventName,
      actionName: REJECTION,
      fullNameInBn: fullName.fullNameInBn,
      fullNameInEng: fullName.fullNameInEng,
      eventType: event,
      duplicateContextId:
        history.location.state && history.location.state.duplicateContextId
    })

    this.props.deleteDraft(draft)
  }

  successfulSubmission = (response: string) => {
    const {
      history,
      draft,
      draft: { event }
    } = this.props
    let personData
    if (event === Event.DEATH) {
      personData = this.props.draft.data.deceased
    } else {
      personData = this.props.draft.data.child
    }
    const fullName = getFullName(personData)

    const duplicate = history.location.state && history.location.state.duplicate

    let eventName = DECLARATION
    let actionName = SUBMISSION
    let nextSection = true

    if (this.userHasRegisterScope()) {
      eventName = REGISTRATION
      actionName = REGISTERED
      nextSection = false
    }

    if (duplicate) {
      eventName = DUPLICATION
      actionName = REGISTERED
      nextSection = false
    }
    history.push(CONFIRMATION_SCREEN, {
      trackNumber: response,
      nextSection,
      trackingSection: true,
      eventName,
      eventType: event,
      actionName,
      fullNameInBn: fullName.fullNameInBn,
      fullNameInEng: fullName.fullNameInEng,
      duplicateContextId:
        history.location.state && history.location.state.duplicateContextId
    })
    this.props.deleteDraft(draft)
  }

  successfullyRegistered = (response: string) => {
    const {
      history,
      draft,
      draft: { event }
    } = this.props
    let personData
    if (event === Event.DEATH) {
      personData = this.props.draft.data.deceased
    } else {
      personData = this.props.draft.data.child
    }
    const fullName = getFullName(personData)
    history.push(CONFIRMATION_SCREEN, {
      trackNumber: response,
      trackingSection: true,
      eventName: REGISTRATION,
      eventType: event,
      actionName: REGISTERED,
      fullNameInBn: fullName.fullNameInBn,
      fullNameInEng: fullName.fullNameInEng
    })
    this.props.deleteDraft(draft)
  }

  submitForm = () => {
    this.setState({ showSubmitModal: true })
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

  onSwiped = (
    draftId: string,
    selectedSection: IFormSection | null,
    tabRoute: string,
    goToTab: (tabRoute: string, draftId: string, tabId: string) => void
  ): void => {
    if (selectedSection) {
      goToTab(tabRoute, draftId, selectedSection.id)
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
    const eventType = this.props.draft.event || 'BIRTH'
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
      draft,
      history,
      registerForm,
      offlineResources,
      handleSubmit,
      duplicate
    } = this.props

    const isReviewForm = draft.review
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
    return (
      <FormViewContainer>
        <ViewHeaderWithTabs
          id="informant_parent_view"
          title={intl.formatMessage(title, { event: draft.event })}
        >
          <StickyFormTabs
            sections={sectionForReview}
            activeTabId={activeSection.id}
            onTabClick={(tabId: string) =>
              goToTab(this.props.tabRoute, draft.id, tabId)
            }
          />
        </ViewHeaderWithTabs>
        <FormContainer>
          <HeaderContent>
            <Swipeable
              disabled={isReviewSection || !isMobileDevice()}
              id="swipeable_block"
              trackMouse
              onSwipedLeft={() =>
                this.onSwiped(
                  draft.id,
                  nextSection,
                  this.props.tabRoute,
                  goToTab
                )
              }
              onSwipedRight={() =>
                this.onSwiped(
                  draft.id,
                  getPreviousSection(registerForm.sections, activeSection),
                  this.props.tabRoute,
                  goToTab
                )
              }
            >
              {activeSection.viewType === VIEW_TYPE.PREVIEW && (
                <ReviewSection
                  tabRoute={this.props.tabRoute}
                  draft={draft}
                  submitClickEvent={this.submitForm}
                  saveDraftClickEvent={() => this.onSaveAsDraftClicked()}
                  deleteApplicationClickEvent={() => {
                    this.props.deleteDraft(draft)
                    history.push('/')
                  }}
                />
              )}
              {activeSection.viewType === VIEW_TYPE.REVIEW && (
                <ReviewSection
                  tabRoute={this.props.tabRoute}
                  draft={draft}
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
                        id={`form_section_optional_label_${activeSection.id}`}
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
                      onChange={this.modifyDraft}
                      setAllFieldsDirty={setAllFieldsDirty}
                      fields={activeSection.fields}
                      offlineResources={offlineResources}
                      draftData={draft.data}
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
                              draft.id,
                              nextSection.id
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
                          <DraftButtonText>
                            {intl.formatMessage(messages.valueSaveAsDraft)}
                          </DraftButtonText>
                        </DraftButtonContainer>
                      }
                    </FormAction>
                  </FormActionSection>
                </Box>
              )}
            </Swipeable>
          </HeaderContent>
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

        {this.state.showSubmitModal && (
          <MutationProvider
            event={this.getEvent()}
            action={Action.SUBMIT_FOR_REVIEW}
            form={registerForm}
            draft={draft}
            onCompleted={this.successfulSubmission}
          >
            <MutationContext.Consumer>
              {({ mutation, loading, data }) => (
                <Modal
                  title="Are you ready to submit?"
                  actions={[
                    <ConfirmBtn
                      key="submit"
                      id="submit_confirm"
                      disabled={loading || data}
                      // @ts-ignore
                      onClick={() => mutation()}
                    >
                      {!loading && (
                        <>
                          <TickLarge />
                          {intl.formatMessage(messages.submitButton)}
                        </>
                      )}
                      {loading && <ButtonSpinner id="submit_confirm_spinner" />}
                    </ConfirmBtn>,
                    <PreviewButton
                      id="preview-btn"
                      key="preview"
                      onClick={() => {
                        this.toggleSubmitModalOpen()
                        if (document.documentElement) {
                          document.documentElement.scrollTop = 0
                        }
                      }}
                    >
                      {intl.formatMessage(messages.preview)}
                    </PreviewButton>
                  ]}
                  show={this.state.showSubmitModal}
                  handleClose={this.toggleSubmitModalOpen}
                >
                  {intl.formatMessage(messages.submitDescription)}
                </Modal>
              )}
            </MutationContext.Consumer>
          </MutationProvider>
        )}
        {this.state.showRegisterModal && (
          <MutationProvider
            event={this.getEvent()}
            action={Action.REGISTER_APPLICATION}
            form={registerForm}
            draft={draft}
            onCompleted={this.successfullyRegistered}
          >
            <MutationContext.Consumer>
              {({ mutation, loading, data }) => (
                <Modal
                  title="Are you ready to submit?"
                  actions={[
                    <ConfirmBtn
                      key="register"
                      id="register_confirm"
                      disabled={loading || data}
                      // @ts-ignore
                      onClick={() => mutation()}
                    >
                      {!loading && (
                        <>
                          <TickLarge />
                          {intl.formatMessage(messages.submitButton)}
                        </>
                      )}
                      {loading && (
                        <ButtonSpinner id="register_confirm_spinner" />
                      )}
                    </ConfirmBtn>,
                    <PreviewButton
                      key="review"
                      id="register_review"
                      onClick={() => {
                        this.toggleRegisterModalOpen()
                        if (document.documentElement) {
                          document.documentElement.scrollTop = 0
                        }
                      }}
                    >
                      {intl.formatMessage(messages.preview)}
                    </PreviewButton>
                  ]}
                  show={this.state.showRegisterModal}
                  handleClose={this.toggleRegisterModalOpen}
                >
                  {intl.formatMessage(messages.submitDescription)}
                </Modal>
              )}
            </MutationContext.Consumer>
          </MutationProvider>
        )}

        {this.state.rejectFormOpen && (
          <RejectRegistrationForm
            onBack={this.toggleRejectForm}
            confirmRejectionEvent={() => {
              this.rejectSubmission()
            }}
            duplicate={duplicate}
            draftId={draft.id}
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
    RouteComponentProps<{ tabId: string; draftId: string }>
) {
  const { match, registerForm, draft } = props

  const activeSectionId = getActiveSectionId(registerForm, match.params)

  const activeSection = registerForm.sections.find(
    ({ id }) => id === activeSectionId
  )

  if (!activeSection) {
    throw new Error(`Configuration for tab "${match.params.tabId}" missing!`)
  }

  if (!draft) {
    throw new Error(`Draft "${match.params.draftId}" missing!`)
  }
  const visitedSections = registerForm.sections.filter(({ id }) =>
    Boolean(draft.data[id])
  )

  const rightMostVisited = visitedSections[visitedSections.length - 1]

  const setAllFieldsDirty =
    rightMostVisited &&
    registerForm.sections.indexOf(activeSection) <
      registerForm.sections.indexOf(rightMostVisited)

  const fields = replaceInitialValues(
    activeSection.fields,
    draft.data[activeSectionId] || {}
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
    draft
  }
}

export const RegisterForm = connect<Props, DispatchProps>(
  mapStateToProps,
  {
    modifyDraft,
    deleteDraft,
    goToTab: goToTabAction,
    goBack: goBackAction,
    toggleDraftSavedNotification,
    handleSubmit: values => {
      console.log(values)
    }
  }
)(injectIntl<FullProps>(RegisterFormView))
