import {
  ICON_ALIGNMENT,
  PrimaryButton,
  TertiaryButton,
  LinkButton
} from '@opencrvs/components/lib/buttons'
import { BackArrow } from '@opencrvs/components/lib/icons'
import { EventTopBar } from '@opencrvs/components/lib/interface'
import { BodyContent, Container } from '@opencrvs/components/lib/layout'
import {
  deleteApplication,
  IApplication,
  IPayload,
  modifyApplication,
  SUBMISSION_STATUS,
  writeApplication
} from '@register/applications'

import { FormFieldGenerator } from '@register/components/form'
import { RejectRegistrationForm } from '@register/components/review/RejectRegistrationForm'
import {
  Event,
  IForm,
  IFormField,
  IFormSection,
  IFormSectionData,
  IFormSectionGroup
} from '@register/forms'
import {
  goBack as goBackAction,
  goToHome,
  goToHomeTab,
  goToPageGroup as goToPageGroupAction
} from '@register/navigation'
import { toggleDraftSavedNotification } from '@register/notification/actions'

import { HOME } from '@register/navigation/routes'

import { getScope } from '@register/profile/profileSelectors'
import { IStoreState } from '@register/store'
import styled, { keyframes } from '@register/styledComponents'
import { Scope } from '@register/utils/authUtils'
import { ReviewSection } from '@register/views/RegisterForm/review/ReviewSection'
import { isNull, isUndefined, merge } from 'lodash'
import debounce from 'lodash/debounce'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import {
  getVisibleSectionGroupsBasedOnConditions,
  getVisibleGroupFields
} from '@register/forms/utils'
import { messages } from '@register/i18n/messages/views/register'
import { buttonMessages, formMessages } from '@register/i18n/messages'
import {
  PAGE_TRANSITIONS_ENTER_TIME,
  PAGE_TRANSITIONS_CLASSNAME,
  PAGE_TRANSITIONS_TIMING_FUNC_N_FILL_MODE,
  PAGE_TRANSITIONS_EXIT_TIME
} from '@register/utils/constants'

const FormSectionTitle = styled.h4`
  ${({ theme }) => theme.fonts.h4Style};
  color: ${({ theme }) => theme.colors.copy};
`
const FooterArea = styled.div`
  margin: 24px 0px 48px;
`

const Notice = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.11);
  padding: 25px;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.bigBodyStyle};
  margin: 30px -25px;
`

const StyledLinkButton = styled(LinkButton)`
  margin-left: 32px;
`
const Required = styled.span.attrs<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>({})`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.error};
  flex-grow: 0;
`

const Optional = styled.span.attrs<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>({})`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.placeholder};
  flex-grow: 0;
`

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
`
const VIEW_TYPE = {
  FORM: 'form',
  REVIEW: 'review',
  PREVIEW: 'preview',
  HIDDEN: 'hidden'
}

function getNextSectionIds(
  sections: IFormSection[],
  fromSection: IFormSection,
  fromSectionGroup: IFormSectionGroup,
  application: IApplication
) {
  const visibleGroups = getVisibleSectionGroupsBasedOnConditions(
    fromSection,
    application.data[fromSection.id] || {},
    application.data
  )
  const currentGroupIndex = visibleGroups.findIndex(
    (group: IFormSectionGroup) => group.id === fromSectionGroup.id
  )

  if (currentGroupIndex === visibleGroups.length - 1) {
    const visibleSections = sections.filter(
      section =>
        section.viewType !== VIEW_TYPE.HIDDEN &&
        getVisibleSectionGroupsBasedOnConditions(
          section,
          application.data[fromSection.id] || {},
          application.data
        ).length > 0
    )

    const currentIndex = visibleSections.findIndex(
      (section: IFormSection) => section.id === fromSection.id
    )
    if (currentIndex === visibleSections.length - 1) {
      return null
    }

    return {
      sectionId: visibleSections[currentIndex + 1].id,
      groupId: visibleSections[currentIndex + 1].groups[0].id
    }
  }
  return {
    sectionId: fromSection.id,
    groupId: visibleGroups[currentGroupIndex + 1].id
  }
}

export interface IFormProps {
  application: IApplication
  registerForm: IForm
  pageRoute: string
  duplicate?: boolean
}

type DispatchProps = {
  goToPageGroup: typeof goToPageGroupAction
  goBack: typeof goBackAction
  goToHome: typeof goToHome
  goToHomeTab: typeof goToHomeTab
  writeApplication: typeof writeApplication
  modifyApplication: typeof modifyApplication
  deleteApplication: typeof deleteApplication
  toggleDraftSavedNotification: typeof toggleDraftSavedNotification
  handleSubmit: (values: unknown) => void
}

type Props = {
  activeSection: IFormSection
  activeSectionGroup: IFormSectionGroup
  setAllFieldsDirty: boolean
}

export type FullProps = IFormProps &
  Props &
  DispatchProps &
  IntlShapeProps & { scope: Scope } & RouteComponentProps<{
    pageId: string
    groupId?: string
    applicationId: string
  }>

type State = {
  isDataAltered: boolean
  rejectFormOpen: boolean
  hasError: boolean
}

const fadeFromTop = keyframes`
  to {
    -webkit-transform: translateY(100vh);
    transform: translateY(100vh);
  }
`
const StyledContainer = styled(Container)`
  &.${PAGE_TRANSITIONS_CLASSNAME}-exit {
    top: 0;
    z-index: 999;
    animation: ${fadeFromTop} ${PAGE_TRANSITIONS_EXIT_TIME}ms
      ${PAGE_TRANSITIONS_TIMING_FUNC_N_FILL_MODE};
  }

  &.${PAGE_TRANSITIONS_CLASSNAME}-exit-active {
    z-index: 999;
  }
`
class RegisterFormView extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)
    this.state = {
      isDataAltered: false,
      rejectFormOpen: false,
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

  generateSectionListForReview = (
    disabled: boolean,
    sections: IFormSection[]
  ) => {
    const result: IFormSection[] = sections.map((section: IFormSection) => {
      return merge(
        {
          disabled: section.viewType !== VIEW_TYPE.REVIEW && disabled
        },
        section
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
    this.props.writeApplication(this.props.application)
    this.props.goToHomeTab('progress')
  }

  onDeleteApplication = (application: IApplication) => {
    this.props.goToHomeTab('progress')

    setTimeout(
      () => this.props.deleteApplication(application),
      PAGE_TRANSITIONS_ENTER_TIME + 200
    )
  }

  continueButtonHandler = (
    pageRoute: string,
    applicationId: string,
    pageId: string,
    groupId: string,
    event: string
  ) => {
    this.updateVisitedGroups()
    this.props.writeApplication(this.props.application)
    this.props.goToPageGroup(pageRoute, applicationId, pageId, groupId, event)
  }

  updateVisitedGroups = () => {
    const visitedGroups = this.props.application.visitedGroupIds || []
    if (
      visitedGroups.findIndex(
        visitedGroup =>
          visitedGroup.sectionId === this.props.activeSection.id &&
          visitedGroup.groupId === this.props.activeSectionGroup.id
      ) === -1
    ) {
      visitedGroups.push({
        sectionId: this.props.activeSection.id,
        groupId: this.props.activeSectionGroup.id
      })
    }
    this.props.application.visitedGroupIds = visitedGroups
  }

  render() {
    const {
      intl,
      setAllFieldsDirty,
      application,
      registerForm,
      handleSubmit,
      duplicate,
      activeSection,
      activeSectionGroup
    } = this.props

    const nextSectionGroup = getNextSectionIds(
      registerForm.sections,
      activeSection,
      activeSectionGroup,
      application
    )

    const isErrorOccured = this.state.hasError
    const debouncedModifyApplication = debounce(this.modifyApplication, 500)

    return (
      <StyledContainer
        className={PAGE_TRANSITIONS_CLASSNAME}
        id="informant_parent_view"
      >
        {isErrorOccured && (
          <ErrorText id="error_message_section">
            {intl.formatMessage(messages.registerFormQueryError)}
          </ErrorText>
        )}
        {!isErrorOccured && (
          <>
            {activeSection.viewType === VIEW_TYPE.PREVIEW && (
              <>
                <EventTopBar
                  title={intl.formatMessage(
                    messages.newVitalEventRegistration,
                    {
                      event: application.event
                    }
                  )}
                  iconColor={
                    application.submissionStatus === SUBMISSION_STATUS.DRAFT
                      ? 'violet'
                      : 'orange'
                  }
                  saveAction={{
                    handler: this.onSaveAsDraftClicked,
                    label: intl.formatMessage(buttonMessages.saveExitButton)
                  }}
                  menuItems={[
                    {
                      label: 'Delete Application',
                      handler: () => this.onDeleteApplication(application)
                    }
                  ]}
                />
                <ReviewSection
                  pageRoute={this.props.pageRoute}
                  draft={application}
                  submitClickEvent={this.confirmSubmission}
                  onChangeReviewForm={this.modifyApplication}
                />
              </>
            )}
            {activeSection.viewType === VIEW_TYPE.REVIEW && (
              <>
                <EventTopBar
                  title={intl.formatMessage(
                    messages.newVitalEventRegistration,
                    {
                      event: application.event
                    }
                  )}
                  iconColor={
                    application.submissionStatus === SUBMISSION_STATUS.DRAFT
                      ? 'violet'
                      : 'orange'
                  }
                  saveAction={{
                    handler: () => this.props.goToHomeTab('review'),
                    label: intl.formatMessage(buttonMessages.exitButton)
                  }}
                />
                <ReviewSection
                  pageRoute={this.props.pageRoute}
                  draft={application}
                  rejectApplicationClickEvent={this.toggleRejectForm}
                  submitClickEvent={this.confirmSubmission}
                  onChangeReviewForm={this.modifyApplication}
                />
              </>
            )}

            {activeSection.viewType === VIEW_TYPE.FORM && (
              <>
                <EventTopBar
                  title={intl.formatMessage(
                    messages.newVitalEventRegistration,
                    {
                      event: application.event
                    }
                  )}
                  iconColor={
                    application.submissionStatus === SUBMISSION_STATUS.DRAFT
                      ? 'violet'
                      : 'orange'
                  }
                  saveAction={{
                    handler: this.onSaveAsDraftClicked,
                    label: intl.formatMessage(buttonMessages.saveExitButton)
                  }}
                  menuItems={[
                    {
                      label: 'Delete Application',
                      handler: () => this.onDeleteApplication(application)
                    }
                  ]}
                />
                <BodyContent id="register_form">
                  <TertiaryButton
                    align={ICON_ALIGNMENT.LEFT}
                    icon={() => <BackArrow />}
                    onClick={this.props.goBack}
                  >
                    {intl.formatMessage(buttonMessages.back)}
                  </TertiaryButton>
                  <FormSectionTitle
                    id={`form_section_title_${activeSectionGroup.id}`}
                  >
                    {(!activeSectionGroup.ignoreSingleFieldView &&
                      activeSectionGroup.fields.length === 1 && (
                        <>
                          {(activeSectionGroup.fields[0].hideHeader = true)}
                          {intl.formatMessage(
                            activeSectionGroup.fields[0].label
                          )}
                          {activeSectionGroup.fields[0].required && (
                            <Required
                              disabled={
                                activeSectionGroup.disabled ||
                                activeSection.disabled ||
                                false
                              }
                            >
                              &nbsp;*
                            </Required>
                          )}
                        </>
                      )) || (
                      <>
                        {intl.formatMessage(
                          activeSectionGroup.title || activeSection.title
                        )}
                        {activeSection.optional && (
                          <Optional
                            id={`form_section_opt_label_${activeSectionGroup.id}`}
                            disabled={
                              activeSectionGroup.disabled ||
                              activeSection.disabled
                            }
                          >
                            &nbsp;&nbsp;•&nbsp;
                            {intl.formatMessage(formMessages.optionalLabel)}
                          </Optional>
                        )}
                      </>
                    )}
                  </FormSectionTitle>
                  {activeSection.notice && (
                    <Notice id={`form_section_notice_${activeSectionGroup.id}`}>
                      {intl.formatMessage(activeSection.notice)}
                    </Notice>
                  )}
                  <form
                    id={`form_section_id_${activeSectionGroup.id}`}
                    onSubmit={handleSubmit}
                  >
                    <FormFieldGenerator
                      id={activeSectionGroup.id}
                      onChange={values => {
                        debouncedModifyApplication(
                          values,
                          activeSection,
                          application
                        )
                      }}
                      setAllFieldsDirty={setAllFieldsDirty}
                      fields={getVisibleGroupFields(activeSectionGroup)}
                      draftData={application.data}
                    />
                  </form>
                  {nextSectionGroup && (
                    <FooterArea>
                      <PrimaryButton
                        id="next_section"
                        onClick={() => {
                          this.continueButtonHandler(
                            this.props.pageRoute,
                            application.id,
                            nextSectionGroup.sectionId,
                            nextSectionGroup.groupId,
                            application.event.toLowerCase()
                          )
                        }}
                      >
                        {intl.formatMessage(buttonMessages.continueButton)}
                      </PrimaryButton>
                      {application.review && (
                        <StyledLinkButton
                          id="back-to-review-button"
                          className="item"
                          onClick={() => {
                            this.continueButtonHandler(
                              this.props.pageRoute,
                              application.id,
                              application.submissionStatus &&
                                application.submissionStatus ===
                                  SUBMISSION_STATUS.DRAFT
                                ? 'preview'
                                : 'review',
                              application.submissionStatus &&
                                application.submissionStatus ===
                                  SUBMISSION_STATUS.DRAFT
                                ? 'preview-view-group'
                                : 'review-view-group',
                              application.event.toLowerCase()
                            )
                          }}
                        >
                          {intl.formatMessage(messages.backToReviewButton)}
                        </StyledLinkButton>
                      )}
                    </FooterArea>
                  )}
                </BodyContent>
              </>
            )}
          </>
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
      </StyledContainer>
    )
  }
}

export function replaceInitialValues(fields: IFormField[], sectionValues: any) {
  return fields.map(field => ({
    ...field,
    initialValue:
      isUndefined(sectionValues[field.name]) ||
      isNull(sectionValues[field.name])
        ? field.initialValue
        : sectionValues[field.name]
  }))
}

function firstVisibleSection(form: IForm) {
  return form.sections.filter(({ viewType }) => viewType !== 'hidden')[0]
}

function mapStateToProps(
  state: IStoreState,
  props: IFormProps &
    Props &
    RouteComponentProps<{
      pageId: string
      groupId?: string
      applicationId: string
    }>
) {
  const { match, registerForm, application } = props

  const sectionId = match.params.pageId || firstVisibleSection(registerForm).id

  const activeSection = registerForm.sections.find(
    section => section.id === sectionId
  )
  if (!activeSection) {
    throw new Error(`Configuration for tab "${match.params.pageId}" missing!`)
  }

  const groupId =
    match.params.groupId ||
    getVisibleSectionGroupsBasedOnConditions(
      activeSection,
      application.data[activeSection.id] || {},
      application.data
    )[0].id

  const activeSectionGroup = activeSection.groups.find(
    group => group.id === groupId
  )
  if (!activeSectionGroup) {
    throw new Error(
      `Configuration for group "${match.params.groupId}" missing!`
    )
  }

  if (!application) {
    throw new Error(`Draft "${match.params.applicationId}" missing!`)
  }

  const setAllFieldsDirty =
    (application.visitedGroupIds &&
      application.visitedGroupIds.findIndex(
        visitedGroup =>
          visitedGroup.sectionId === activeSection.id &&
          visitedGroup.groupId === activeSectionGroup.id
      ) > -1) ||
    false

  const fields = replaceInitialValues(
    activeSectionGroup.fields,
    application.data[activeSection.id] || {}
  )

  return {
    registerForm,
    scope: getScope(state),
    setAllFieldsDirty,
    activeSection,
    activeSectionGroup: {
      ...activeSectionGroup,
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
    writeApplication,
    modifyApplication,
    deleteApplication,
    goToPageGroup: goToPageGroupAction,
    goBack: goBackAction,
    goToHome,
    goToHomeTab,
    toggleDraftSavedNotification,
    handleSubmit: (values: any) => {
      console.log(values)
    }
  }
)(injectIntl<'intl', FullProps>(RegisterFormView))
