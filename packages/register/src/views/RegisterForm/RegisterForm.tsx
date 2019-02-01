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
import { IForm, IFormSection, IFormField, IFormSectionData } from '../../forms'
import { FormFieldGenerator, ViewHeaderWithTabs } from '../../components/form'
import { IStoreState } from 'src/store'
import { IDraft, modifyDraft, deleteDraft } from 'src/drafts'
import {
  FooterAction,
  FooterPrimaryButton,
  ViewFooter
} from 'src/components/interface/footer'
import { StickyFormTabs } from './StickyFormTabs'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import { draftToMutationTransformer } from '../../transformer'
import { ReviewSection } from '../../views/RegisterForm/review/ReviewSection'
import { merge } from 'lodash'
import { RejectRegistrationForm } from 'src/components/review/RejectRegistrationForm'
import { getOfflineState } from 'src/offline/selectors'
import { IOfflineDataState } from 'src/offline/reducer'
import {
  SAVED_REGISTRATION,
  REJECTED_REGISTRATION
} from 'src/navigation/routes'
import { HeaderContent } from '@opencrvs/components/lib/layout'
import { getScope } from 'src/profile/profileSelectors'
import { Scope } from 'src/utils/authUtils'
import { isMobileDevise } from 'src/utils/commonUtils'

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
  previewBirthRegistration: {
    id: 'register.form.previewBirthRegistration',
    defaultMessage: 'Birth Application Preview',
    description: 'The message that appears for new birth registrations'
  },
  reviewBirthRegistration: {
    id: 'register.form.reviewBirthRegistration',
    defaultMessage: 'Birth Application Review',
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

const PreviewButton = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
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
}

type DispatchProps = {
  goToTab: typeof goToTabAction
  goBack: typeof goBackAction
  modifyDraft: typeof modifyDraft
  deleteDraft: typeof deleteDraft
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

const postMutation = gql`
  mutation submitBirthRegistration($details: BirthRegistrationInput!) {
    createBirthRegistration(details: $details)
  }
`
const patchMutation = gql`
  mutation markBirthAsRegistered($id: ID!, $details: BirthRegistrationInput) {
    markBirthAsRegistered(id: $id, details: $details)
  }
`
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
    const { history, draft } = this.props
    const childData = this.props.draft.data.child
    const fullName: IFullName = getFullName(childData)
    history.push(REJECTED_REGISTRATION, {
      rejection: true,
      fullNameInBn: fullName.fullNameInBn,
      fullNameInEng: fullName.fullNameInEng
    })
    this.props.deleteDraft(draft)
  }

  successfulSubmission = (response: string) => {
    const { history, draft } = this.props
    const childData = this.props.draft.data.child
    const fullName = getFullName(childData)
    const payload = {
      fullNameInBn: fullName.fullNameInBn,
      fullNameInEng: fullName.fullNameInEng
    }
    if (this.userHasRegisterScope()) {
      // @ts-ignore
      payload.registrationNumber = response
      // @ts-ignore
      payload.declaration = false
    } else {
      // @ts-ignore
      payload.trackingId = response
      // @ts-ignore
      payload.declaration = true
    }
    history.push(SAVED_REGISTRATION, payload)
    this.props.deleteDraft(draft)
  }

  successfullyRegistered = (response: string) => {
    const { history, draft } = this.props
    const childData = this.props.draft.data.child
    const fullName = getFullName(childData)
    history.push(SAVED_REGISTRATION, {
      registrationNumber: response,
      declaration: false,
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

  processSubmitData = () => {
    const { draft, registerForm } = this.props
    const { showSubmitModal, showRegisterModal } = this.state
    if (!showRegisterModal && !showSubmitModal) {
      return
    }
    const data = draftToMutationTransformer(registerForm, draft.data)
    if (!draft.review) {
      return { details: data }
    } else {
      if (!this.state.isDataAltered) {
        return { id: draft.id }
      } else {
        return { id: draft.id, details: data }
      }
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
      handleSubmit
    } = this.props
    const isReviewForm = draft.review
    const nextSection = getNextSection(registerForm.sections, activeSection)
    const title = isReviewForm
      ? messages.reviewBirthRegistration
      : activeSection.viewType === VIEW_TYPE.PREVIEW
      ? messages.previewBirthRegistration
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
              disabled={isReviewSection || !isMobileDevise()}
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
                  saveDraftClickEvent={() => history.push('/')}
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
                        <DraftButtonContainer onClick={() => history.push('/')}>
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
              onClick={() => history.push(SAVED_REGISTRATION)}
            >
              {intl.formatMessage(messages.saveDraft)}
            </FooterPrimaryButton>
          </FooterAction>
        </ViewFooter>
        <Mutation
          mutation={postMutation}
          variables={this.processSubmitData()}
          onCompleted={data =>
            this.successfulSubmission(data.createBirthRegistration)
          }
        >
          {submitBirthRegistration => {
            return (
              <Modal
                title="Are you ready to submit?"
                actions={[
                  <PrimaryButton
                    key="submit"
                    id="submit_confirm"
                    onClick={() => submitBirthRegistration()}
                  >
                    {intl.formatMessage(messages.submitButton)}
                  </PrimaryButton>,
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
            )
          }}
        </Mutation>

        <Mutation
          mutation={patchMutation}
          variables={this.processSubmitData()}
          onCompleted={data =>
            this.successfullyRegistered(data.markBirthAsRegistered)
          }
        >
          {markBirthAsRegistered => {
            return (
              <Modal
                title="Are you ready to submit?"
                actions={[
                  <PrimaryButton
                    key="register"
                    id="register_confirm"
                    onClick={() => markBirthAsRegistered()}
                  >
                    {intl.formatMessage(messages.submitButton)}
                  </PrimaryButton>,
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
            )
          }}
        </Mutation>

        {this.state.rejectFormOpen && (
          <RejectRegistrationForm
            onBack={this.toggleRejectForm}
            confirmRejectionEvent={() => {
              this.rejectSubmission()
            }}
            draftId={draft.id}
          />
        )}
      </FormViewContainer>
    )
  }
}

function replaceInitialValues(fields: IFormField[], sectionValues: object) {
  return fields.map(field => ({
    ...field,
    initialValue: sectionValues[field.name] || field.initialValue
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
    handleSubmit: values => {
      console.log(values)
    }
  }
)(injectIntl<FullProps>(RegisterFormView))
