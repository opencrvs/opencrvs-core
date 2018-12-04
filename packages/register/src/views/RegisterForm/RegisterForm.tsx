import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import * as Swipeable from 'react-swipeable'
import { Box, Modal } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ArrowForward } from '@opencrvs/components/lib/icons'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import styled from '../../styled-components'
import { goToTab as goToTabAction } from '../../navigation'
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
import processDraftData from './ProcessDraftData'
import { ReviewSection } from '../../views/RegisterForm/review/ReviewSection'
import { merge } from 'lodash'

const FormSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`
const FormAction = styled.div`
  display: flex;
  justify-content: center;
`

const FormPrimaryButton = styled(PrimaryButton)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`

export const messages = defineMessages({
  newBirthRegistration: {
    id: 'register.form.newBirthRegistration',
    defaultMessage: 'New birth declaration',
    description: 'The message that appears for new birth registrations'
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
  modifyDraft: typeof modifyDraft
  deleteDraft: typeof deleteDraft
  handleSubmit: (values: unknown) => void
}

type Props = {
  activeSection: IFormSection
  setAllFieldsDirty: boolean
}

type FullProps = IFormProps &
  Props &
  DispatchProps &
  InjectedIntlProps &
  RouteComponentProps<{}>

type State = {
  showSubmitModal: boolean
  selectedTabId: string
}

const postMutation = gql`
  mutation submitBirthRegistration($details: BirthRegistrationInput!) {
    createBirthRegistration(details: $details)
  }
`
const VIEW_TYPE = {
  REVIEW: 'review',
  PREVIEW: 'preview'
}

class RegisterFormView extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)
    this.state = {
      showSubmitModal: false,
      selectedTabId: ''
    }
  }

  modifyDraft = (sectionData: IFormSectionData) => {
    const { activeSection, draft } = this.props
    this.props.modifyDraft({
      ...draft,
      data: {
        ...draft.data,
        [activeSection.id]: sectionData
      }
    })
  }

  successfulSubmission = (response: string) => {
    const { history, draft } = this.props
    const childData = this.props.draft.data.child
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

    history.push('/saved', {
      trackingId: response,
      declaration: true,
      fullNameInBn,
      fullNameInEng
    })
    this.props.deleteDraft(draft)
  }

  submitForm = () => {
    this.setState({ showSubmitModal: true })
  }

  toggleSubmitModalOpen = () => {
    this.setState((prevState: State) => ({
      showSubmitModal: !prevState.showSubmitModal
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

  processSubmitData = () => processDraftData(this.props.draft.data)

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

  render() {
    const {
      goToTab,
      intl,
      activeSection,
      setAllFieldsDirty,
      draft,
      history,
      registerForm,
      handleSubmit
    } = this.props
    const isReviewForm = draft.review
    const nextSection = getNextSection(registerForm.sections, activeSection)
    const title = isReviewForm
      ? messages.reviewBirthRegistration
      : activeSection.viewType === VIEW_TYPE.PREVIEW
      ? messages.previewBirthRegistration
      : messages.newBirthRegistration
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
          breadcrumb="Informant: Parent"
          id="informant_parent_view"
          title={intl.formatMessage(title)}
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
          <Swipeable
            disabled={isReviewSection}
            id="swipeable_block"
            trackMouse
            onSwipedLeft={() =>
              this.onSwiped(draft.id, nextSection, this.props.tabRoute, goToTab)
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
                SubmitClickEvent={this.submitForm}
                SaveDraftClickEvent={() => history.push('/')}
                DeleteApplicationClickEvent={() => {
                  this.props.deleteDraft(draft)
                  history.push('/')
                }}
              />
            )}
            {activeSection.viewType === VIEW_TYPE.REVIEW && (
              <ReviewSection
                tabRoute={this.props.tabRoute}
                draft={draft}
                RejectApplicationClickEvent={() => {
                  alert('Reject Application')
                }}
                RegisterClickEvent={() => {
                  alert('Register')
                }}
              />
            )}
            {activeSection.viewType === 'form' && (
              <Box>
                <FormSectionTitle id={`form_section_title_${activeSection.id}`}>
                  {intl.formatMessage(activeSection.title)}
                </FormSectionTitle>
                <form
                  id={`form_section_id_${activeSection.id}`}
                  onSubmit={handleSubmit}
                >
                  <FormFieldGenerator
                    id={activeSection.id}
                    onChange={this.modifyDraft}
                    setAllFieldsDirty={setAllFieldsDirty}
                    fields={activeSection.fields}
                  />
                </form>
                <FormAction>
                  {nextSection && (
                    <FormPrimaryButton
                      onClick={() =>
                        goToTab(this.props.tabRoute, draft.id, nextSection.id)
                      }
                      id="next_section"
                      icon={() => <ArrowForward />}
                    >
                      {intl.formatMessage(messages.next)}
                    </FormPrimaryButton>
                  )}
                </FormAction>
              </Box>
            )}
          </Swipeable>
        </FormContainer>
        <ViewFooter>
          <FooterAction>
            <FooterPrimaryButton
              id="save_draft"
              onClick={() => history.push('/saved')}
            >
              {intl.formatMessage(messages.saveDraft)}
            </FooterPrimaryButton>
          </FooterAction>
        </ViewFooter>
        <Mutation
          mutation={postMutation}
          variables={{ details: this.processSubmitData() }}
        >
          {(submitBirthRegistration, { data }) => {
            if (data && data.createBirthRegistration) {
              this.successfulSubmission(data.createBirthRegistration)
            }

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

  return {
    registerForm,
    setAllFieldsDirty,
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
    handleSubmit: values => {
      console.log(values)
    }
  }
)(injectIntl<FullProps>(RegisterFormView))
