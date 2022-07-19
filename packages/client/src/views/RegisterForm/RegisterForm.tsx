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
import * as React from 'react'
import { FormikTouched, FormikValues } from 'formik'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { isNull, isUndefined, merge, flatten } from 'lodash'
import debounce from 'lodash/debounce'
import {
  ICON_ALIGNMENT,
  PrimaryButton,
  TertiaryButton,
  SecondaryButton
} from '@opencrvs/components/lib/buttons'
import { BackArrow } from '@opencrvs/components/lib/icons'
import {
  EventTopBar,
  IEventTopBarProps,
  IEventTopBarMenuAction,
  ResponsiveModal,
  Spinner,
  Warning
} from '@opencrvs/components/lib/interface'
import { BodyContent, Container } from '@opencrvs/components/lib/layout'
import {
  deleteDeclaration,
  IDeclaration,
  IPayload,
  modifyDeclaration,
  SUBMISSION_STATUS,
  writeDeclaration,
  DOWNLOAD_STATUS
} from '@client/declarations'
import {
  FormFieldGenerator,
  getInitialValueForSelectDynamicValue,
  ITouchedNestedFields
} from '@client/components/form'
import { RejectRegistrationForm } from '@client/components/review/RejectRegistrationForm'
import {
  IForm,
  IFormField,
  IFormSection,
  IFormSectionData,
  IFormSectionGroup,
  IFormData,
  CorrectionSection,
  IFormFieldValue,
  SELECT_WITH_DYNAMIC_OPTIONS
} from '@client/forms'
import { Event } from '@client/utils/gateway'
import {
  goBack as goBackAction,
  goToCertificateCorrection,
  goToHome,
  goToHomeTab,
  goToPageGroup as goToPageGroupAction
} from '@client/navigation'
import { toggleDraftSavedNotification } from '@client/notification/actions'
import { HOME } from '@client/navigation/routes'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import styled, { keyframes } from '@client/styledComponents'
import {
  Scope,
  hasRegisterScope,
  hasRegistrationClerkScope
} from '@client/utils/authUtils'
import { ReviewSection } from '@client/views/RegisterForm/review/ReviewSection'
import {
  getVisibleSectionGroupsBasedOnConditions,
  getVisibleGroupFields,
  hasFormError,
  getSectionFields,
  getNextSectionIds,
  VIEW_TYPE
} from '@client/forms/utils'
import { messages } from '@client/i18n/messages/views/register'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'
import {
  buttonMessages,
  constantsMessages,
  formMessages
} from '@client/i18n/messages'
import {
  PAGE_TRANSITIONS_ENTER_TIME,
  PAGE_TRANSITIONS_CLASSNAME,
  PAGE_TRANSITIONS_TIMING_FUNC_N_FILL_MODE,
  PAGE_TRANSITIONS_EXIT_TIME,
  DECLARED,
  REJECTED,
  VALIDATED,
  ACCUMULATED_FILE_SIZE
} from '@client/utils/constants'
import { TimeMounted } from '@client/components/TimeMounted'
import { getValueFromDeclarationDataByKey } from '@client/pdfRenderer/transformer/utils'
import {
  bytesToSize,
  isCorrection,
  isFileSizeExceeded
} from '@client/views/CorrectionForm/utils'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { IUserDetails } from '@client/utils/userUtils'

const FormSectionTitle = styled.h4`
  ${({ theme }) => theme.fonts.h2};
  color: ${({ theme }) => theme.colors.copy};
  margin-top: 16px;
  margin-bottom: 24px;
`
const FooterArea = styled.div`
  height: 260px;
  padding: 16px 0;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    height: 160px;
  }
`

const Notice = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.11);
  padding: 25px;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.reg18};
  margin: 30px -25px;
`

const BackReviewButton = styled(SecondaryButton)`
  height: 48px;
  margin-left: 16px;
`
const Required = styled.span<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>`
  ${({ theme }) => theme.fonts.reg18};
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.negative};
  flex-grow: 0;
`

const Optional = styled.span<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>`
  ${({ theme }) => theme.fonts.reg18};
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.supportingCopy};
  flex-grow: 0;
`
const SpinnerWrapper = styled.div`
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
`

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.negative};
  ${({ theme }) => theme.fonts.reg16};
  text-align: center;
  margin-top: 100px;
`
export interface IFormProps {
  declaration: IDeclaration
  registerForm: IForm
  pageRoute: string
  duplicate?: boolean
}

export type RouteProps = RouteComponentProps<{
  pageId: string
  groupId: string
  declarationId: string
}>

type DispatchProps = {
  goToPageGroup: typeof goToPageGroupAction
  goBack: typeof goBackAction
  goToCertificateCorrection: typeof goToCertificateCorrection
  goToHome: typeof goToHome
  goToHomeTab: typeof goToHomeTab
  writeDeclaration: typeof writeDeclaration
  modifyDeclaration: typeof modifyDeclaration
  deleteDeclaration: typeof deleteDeclaration
  toggleDraftSavedNotification: typeof toggleDraftSavedNotification
}

type Props = {
  activeSection: IFormSection
  activeSectionGroup: IFormSectionGroup
  setAllFieldsDirty: boolean
  fieldsToShowValidationErrors?: IFormField[]
  isWritingDraft: boolean
  scope: Scope | null
}

export type FullProps = IFormProps &
  Props &
  DispatchProps &
  IntlShapeProps &
  RouteProps

type State = {
  isDataAltered: boolean
  rejectFormOpen: boolean
  hasError: boolean
  showConfirmationModal: boolean
  isFileUploading: boolean
  startTime: number
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
      hasError: false,
      showConfirmationModal: false,
      isFileUploading: false,
      startTime: 0
    }
  }
  setAllFormFieldsTouched!: (touched: FormikTouched<FormikValues>) => void

  showAllValidationErrors = () => {
    const touched = getSectionFields(
      this.props.activeSection,
      this.props.declaration.data[this.props.activeSection.id],
      this.props.declaration.data
    ).reduce((memo, field) => {
      let fieldTouched: boolean | ITouchedNestedFields = true
      if (field.nestedFields) {
        fieldTouched = {
          value: true,
          nestedFields: flatten(Object.values(field.nestedFields)).reduce(
            (nestedMemo, nestedField) => ({
              ...nestedMemo,
              [nestedField.name]: true
            }),
            {}
          )
        }
      }
      return { ...memo, [field.name]: fieldTouched }
    }, {})
    this.setAllFormFieldsTouched(touched)
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  userHasValidateScope() {
    return this.props.scope && this.props.scope.includes('validate')
  }

  componentDidMount() {
    this.setState({ startTime: Date.now() })
  }

  componentDidUpdate(prevProps: FullProps) {
    const oldHash = prevProps.location && prevProps.location.hash
    const newHash = this.props.location && this.props.location.hash

    if (newHash && oldHash !== newHash && !newHash.match('form-input')) {
      this.props.history.replace({
        pathname: this.props.history.location.pathname,
        hash: newHash + '-form-input'
      })
    }
    const oldIsWritingDraft = prevProps.isWritingDraft
    const newIsWritingDraft = this.props.isWritingDraft
    if (oldIsWritingDraft && !newIsWritingDraft) {
      const sectionValues =
        this.props.declaration.data[this.props.activeSection.id] || {}
      this.props.activeSectionGroup.fields.forEach((field) => {
        const initialValue =
          isUndefined(sectionValues[field.name]) ||
          isNull(sectionValues[field.name])
            ? getInitialValue(field, this.props.declaration.data || {})
            : sectionValues[field.name]
        sectionValues[field.name] = initialValue as IFormFieldValue
      })
      this.props.modifyDeclaration({
        ...this.props.declaration,
        data: {
          ...this.props.declaration.data,
          [this.props.activeSection.id]: {
            ...this.props.declaration.data[this.props.activeSection.id],
            ...sectionValues
          }
        }
      })
    }
  }

  onUploadingStateChanged = (isUploading: boolean) => {
    this.setState({
      ...this.state,
      isFileUploading: isUploading
    })
  }

  modifyDeclaration = (
    sectionData: IFormSectionData,
    activeSection: IFormSection,
    declaration: IDeclaration
  ) => {
    if (declaration.review && !this.state.isDataAltered) {
      this.setState({ isDataAltered: true })
    }
    this.props.modifyDeclaration({
      ...declaration,
      data: {
        ...declaration.data,
        [activeSection.id]: {
          ...declaration.data[activeSection.id],
          ...sectionData
        }
      }
    })
  }

  logTime(timeMs: number) {
    const declaration = this.props.declaration
    if (!declaration.timeLoggedMS) {
      declaration.timeLoggedMS = 0
    }
    declaration.timeLoggedMS += timeMs
    this.props.modifyDeclaration(declaration)
  }

  confirmSubmission = (
    declaration: IDeclaration,
    submissionStatus: string,
    action: string,
    payload?: IPayload,
    downloadStatus?: DOWNLOAD_STATUS
  ) => {
    const updatedDeclaration = {
      ...declaration,
      submissionStatus,
      action,
      payload,
      downloadStatus,
      timeLoggedMS:
        (declaration.timeLoggedMS || 0) + Date.now() - this.state.startTime
    }
    this.props.writeDeclaration(updatedDeclaration)
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
    this.setState((state) => ({
      rejectFormOpen: !state.rejectFormOpen
    }))
  }

  toggleConfirmationModal = () => {
    this.setState((prevState) => ({
      showConfirmationModal: !prevState.showConfirmationModal
    }))
  }

  getEvent() {
    const eventType = this.props.declaration.event || 'BIRTH'
    switch (eventType.toLocaleLowerCase()) {
      case 'birth':
        return Event.Birth
      case 'death':
        return Event.Death
      default:
        return Event.Birth
    }
  }

  onSaveAsDraftClicked = async () => {
    const { declaration } = this.props
    const isRegistrarOrRegistrationAgent =
      this.userHasRegisterScope() || this.userHasValidateScope()
    const isConfirmationModalApplicable =
      declaration.registrationStatus === DECLARED ||
      declaration.registrationStatus === VALIDATED ||
      declaration.registrationStatus === REJECTED
    if (isRegistrarOrRegistrationAgent && isConfirmationModalApplicable) {
      this.toggleConfirmationModal()
    } else {
      this.writeDeclarationAndGoToHome()
    }
  }

  writeDeclarationAndGoToHome = () => {
    this.props.writeDeclaration(this.props.declaration)
    this.props.goToHomeTab(this.getRedirectionTabOnSaveOrExit())
  }

  onDeleteDeclaration = (declaration: IDeclaration) => {
    this.props.deleteDeclaration(declaration.id)
  }

  onCloseDeclaration = () => {
    this.props.goToHomeTab(this.getRedirectionTabOnSaveOrExit())
  }

  continueButtonHandler = async (
    pageRoute: string,
    declarationId: string,
    pageId: string,
    groupId: string,
    event: string
  ) => {
    const { preventContinueIfError } = this.props.activeSectionGroup
    let groupHasError = false
    if (preventContinueIfError) {
      if (!this.props.declaration.data[this.props.activeSection.id]) {
        groupHasError = true
      } else {
        const activeSectionFields = this.props.activeSectionGroup.fields
        const activeSectionValues =
          this.props.declaration.data[this.props.activeSection.id]
        groupHasError = hasFormError(activeSectionFields, activeSectionValues)
      }
      if (groupHasError) {
        this.showAllValidationErrors()
        return
      }
    }

    this.updateVisitedGroups()

    this.props.writeDeclaration(this.props.declaration, () => {
      this.props.goToPageGroup(pageRoute, declarationId, pageId, groupId, event)
    })
  }

  updateVisitedGroups = () => {
    const visitedGroups = this.props.declaration.visitedGroupIds || []
    if (
      visitedGroups.findIndex(
        (visitedGroup) =>
          visitedGroup.sectionId === this.props.activeSection.id &&
          visitedGroup.groupId === this.props.activeSectionGroup.id
      ) === -1
    ) {
      visitedGroups.push({
        sectionId: this.props.activeSection.id,
        groupId: this.props.activeSectionGroup.id
      })
    }
    this.props.declaration.visitedGroupIds = visitedGroups
  }

  getRedirectionTabOnSaveOrExit = () => {
    const status =
      this.props.declaration.submissionStatus ||
      this.props.declaration.registrationStatus ||
      ''
    switch (status) {
      case 'DECLARED':
        return WORKQUEUE_TABS.readyForReview
      case 'DRAFT':
        return WORKQUEUE_TABS.inProgress
      case 'IN_PROGRESS':
        return WORKQUEUE_TABS.inProgressFieldAgent
      case 'REJECTED':
        return WORKQUEUE_TABS.requiresUpdate
      case 'VALIDATED':
        return WORKQUEUE_TABS.readyForReview
      default:
        return WORKQUEUE_TABS.inProgress
    }
  }

  getEventTopBarPropsForCorrection = () => {
    const { declaration, intl } = this.props

    const backButton = (
      <TertiaryButton
        align={ICON_ALIGNMENT.LEFT}
        icon={() => <BackArrow />}
        onClick={() => {
          this.props.goToCertificateCorrection(
            declaration.id,
            CorrectionSection.Corrector
          )
        }}
      />
    )

    return {
      title: intl.formatMessage(correctionMessages.title),
      pageIcon: backButton,
      goHome: () => this.props.goToHomeTab(WORKQUEUE_TABS.readyForReview)
    }
  }

  getEventTopBarPropsForForm = (menuOption: IEventTopBarMenuAction) => {
    const { intl, declaration, activeSectionGroup, goToHomeTab } = this.props

    if (isCorrection(declaration)) {
      return this.getEventTopBarPropsForCorrection()
    }

    let eventTopBarProps: IEventTopBarProps = {
      title: intl.formatMessage(messages.newVitalEventRegistration, {
        event: declaration.event
      }),
      iconColor:
        declaration.submissionStatus === SUBMISSION_STATUS.DRAFT
          ? 'purple'
          : 'orange'
    }

    if (!!activeSectionGroup.showExitButtonOnly) {
      eventTopBarProps = {
        ...eventTopBarProps,
        exitAction: {
          handler: () => {
            declaration.submissionStatus === SUBMISSION_STATUS.DRAFT &&
            !declaration.review
              ? this.onDeleteDeclaration(declaration)
              : goToHomeTab(this.getRedirectionTabOnSaveOrExit())
          },
          label: declaration.review
            ? intl.formatMessage(buttonMessages.saveExitButton)
            : intl.formatMessage(buttonMessages.exitButton)
        }
      }
    } else {
      eventTopBarProps = {
        ...eventTopBarProps,
        saveAction: {
          handler: this.onSaveAsDraftClicked,
          label: intl.formatMessage(buttonMessages.saveExitButton)
        },
        menuItems: [menuOption]
      }
    }
    return eventTopBarProps
  }

  render() {
    const {
      intl,
      setAllFieldsDirty,
      fieldsToShowValidationErrors,
      declaration,
      registerForm,
      duplicate,
      activeSection,
      activeSectionGroup
    } = this.props

    const nextSectionGroup = getNextSectionIds(
      registerForm.sections,
      activeSection,
      activeSectionGroup,
      declaration
    )
    const isErrorOccured = this.state.hasError
    const debouncedModifyDeclaration = debounce(this.modifyDeclaration, 300)
    const menuItemDeleteOrClose =
      declaration.submissionStatus === SUBMISSION_STATUS.DRAFT
        ? {
            label: intl.formatMessage(buttonMessages.deleteDeclaration),
            handler: () => this.onDeleteDeclaration(declaration)
          }
        : {
            label: intl.formatMessage(buttonMessages.closeDeclaration),
            handler: () => this.onCloseDeclaration()
          }
    const isDocumentUploadPage = this.props.match.params.pageId === 'documents'
    return (
      <>
        <TimeMounted
          onUnmount={(duration: number) => {
            this.logTime(duration)
          }}
        ></TimeMounted>
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
                        event: declaration.event
                      }
                    )}
                    iconColor={
                      declaration.submissionStatus === SUBMISSION_STATUS.DRAFT
                        ? 'purple'
                        : 'orange'
                    }
                    saveAction={{
                      handler: this.onSaveAsDraftClicked,
                      label: intl.formatMessage(buttonMessages.saveExitButton)
                    }}
                    menuItems={[menuItemDeleteOrClose]}
                  />
                  <ReviewSection
                    pageRoute={this.props.pageRoute}
                    draft={declaration}
                    submitClickEvent={this.confirmSubmission}
                    onChangeReviewForm={this.modifyDeclaration}
                  />
                </>
              )}
              {activeSection.viewType === VIEW_TYPE.REVIEW && (
                <>
                  {isCorrection(declaration) ? (
                    <EventTopBar {...this.getEventTopBarPropsForCorrection()} />
                  ) : (
                    <EventTopBar
                      title={intl.formatMessage(
                        messages.newVitalEventRegistration,
                        {
                          event: declaration.event
                        }
                      )}
                      iconColor={
                        declaration.submissionStatus === SUBMISSION_STATUS.DRAFT
                          ? 'purple'
                          : 'orange'
                      }
                      saveAction={{
                        handler: () =>
                          this.props.goToHomeTab(
                            this.getRedirectionTabOnSaveOrExit()
                          ),
                        label: intl.formatMessage(buttonMessages.exitButton)
                      }}
                    />
                  )}
                  <ReviewSection
                    pageRoute={this.props.pageRoute}
                    draft={declaration}
                    rejectDeclarationClickEvent={this.toggleRejectForm}
                    submitClickEvent={this.confirmSubmission}
                    onChangeReviewForm={this.modifyDeclaration}
                    onContinue={() => {
                      this.props.goToCertificateCorrection(
                        this.props.declaration.id,
                        CorrectionSection.SupportingDocuments
                      )
                    }}
                  />
                </>
              )}

              {activeSection.viewType === VIEW_TYPE.FORM && (
                <>
                  <EventTopBar
                    {...this.getEventTopBarPropsForForm(menuItemDeleteOrClose)}
                  />
                  <BodyContent id="register_form">
                    {this.props.isWritingDraft ? (
                      <SpinnerWrapper>
                        <Spinner id="draft_write_loading" />
                      </SpinnerWrapper>
                    ) : (
                      <>
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
                                {
                                  (activeSectionGroup.fields[0].hideHeader =
                                    true)
                                }
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
                                  {intl.formatMessage(
                                    formMessages.optionalLabel
                                  )}
                                </Optional>
                              )}
                            </>
                          )}
                        </FormSectionTitle>
                        {activeSection.notice && (
                          <Notice
                            id={`form_section_notice_${activeSectionGroup.id}`}
                          >
                            {intl.formatMessage(activeSection.notice)}
                          </Notice>
                        )}
                        <form
                          id={`form_section_id_${activeSectionGroup.id}`}
                          onSubmit={(event: React.FormEvent) =>
                            event.preventDefault()
                          }
                        >
                          {isFileSizeExceeded(declaration) &&
                            isDocumentUploadPage && (
                              <Warning
                                label={intl.formatMessage(
                                  constantsMessages.totalFileSizeExceed,
                                  {
                                    fileSize: bytesToSize(ACCUMULATED_FILE_SIZE)
                                  }
                                )}
                              />
                            )}
                          <FormFieldGenerator
                            id={activeSectionGroup.id}
                            onChange={(values) => {
                              debouncedModifyDeclaration(
                                values,
                                activeSection,
                                declaration
                              )
                            }}
                            setAllFieldsDirty={setAllFieldsDirty}
                            fieldsToShowValidationErrors={
                              fieldsToShowValidationErrors
                            }
                            fields={getVisibleGroupFields(activeSectionGroup)}
                            draftData={declaration.data}
                            onSetTouched={(setTouchedFunc) => {
                              this.setAllFormFieldsTouched = setTouchedFunc
                            }}
                            onUploadingStateChanged={
                              this.onUploadingStateChanged
                            }
                          />
                        </form>
                        {nextSectionGroup && (
                          <FooterArea>
                            <PrimaryButton
                              id="next_section"
                              onClick={() => {
                                this.continueButtonHandler(
                                  this.props.pageRoute,
                                  declaration.id,
                                  nextSectionGroup.sectionId,
                                  nextSectionGroup.groupId,
                                  declaration.event.toLowerCase()
                                )
                              }}
                              disabled={this.state.isFileUploading}
                            >
                              {intl.formatMessage(
                                buttonMessages.continueButton
                              )}
                            </PrimaryButton>
                            {declaration.review && (
                              <BackReviewButton
                                id="back-to-review-button"
                                className="item"
                                onClick={() => {
                                  this.continueButtonHandler(
                                    this.props.pageRoute,
                                    declaration.id,
                                    declaration.submissionStatus &&
                                      declaration.submissionStatus ===
                                        SUBMISSION_STATUS.DRAFT
                                      ? 'preview'
                                      : 'review',
                                    declaration.submissionStatus &&
                                      declaration.submissionStatus ===
                                        SUBMISSION_STATUS.DRAFT
                                      ? 'preview-view-group'
                                      : 'review-view-group',
                                    declaration.event.toLowerCase()
                                  )
                                }}
                              >
                                {intl.formatMessage(
                                  messages.backToReviewButton
                                )}
                              </BackReviewButton>
                            )}
                          </FooterArea>
                        )}
                      </>
                    )}
                  </BodyContent>
                </>
              )}
            </>
          )}
          {this.state.rejectFormOpen && (
            <RejectRegistrationForm
              onClose={this.toggleRejectForm}
              confirmRejectionEvent={this.confirmSubmission}
              duplicate={duplicate}
              draftId={declaration.id}
              event={this.getEvent()}
              declaration={declaration}
            />
          )}
          <ResponsiveModal
            id="save_declaration_confirmation"
            title={intl.formatMessage(
              messages.saveDeclarationConfirmModalTitle
            )}
            show={this.state.showConfirmationModal}
            handleClose={this.toggleConfirmationModal}
            responsive={false}
            contentHeight={80}
            actions={[
              <TertiaryButton
                id="cancel_save"
                key="cancel_save"
                onClick={this.toggleConfirmationModal}
              >
                {intl.formatMessage(buttonMessages.cancel)}
              </TertiaryButton>,
              <PrimaryButton
                id="confirm_save"
                key="confirm_save"
                onClick={this.writeDeclarationAndGoToHome}
              >
                {intl.formatMessage(buttonMessages.save)}
              </PrimaryButton>
            ]}
          >
            {intl.formatMessage(
              messages.saveDeclarationConfirmModalDescription
            )}
          </ResponsiveModal>
        </StyledContainer>
      </>
    )
  }
}

function getInitialValue(
  field: IFormField,
  data: IFormData,
  userDetails?: IUserDetails | null
) {
  let fieldInitialValue = field.initialValue
  if (field.initialValueKey) {
    fieldInitialValue =
      getValueFromDeclarationDataByKey(data, field.initialValueKey) || ''
  }

  if (
    field.type === SELECT_WITH_DYNAMIC_OPTIONS &&
    !field.initialValue &&
    field.dynamicOptions.initialValue === 'agentDefault' &&
    userDetails !== undefined
  ) {
    fieldInitialValue = getInitialValueForSelectDynamicValue(field, userDetails)
  }
  return fieldInitialValue
}

export function replaceInitialValues(
  fields: IFormField[],
  sectionValues: any,
  data?: IFormData,
  userDetails?: IUserDetails | null
) {
  return fields.map((field) => ({
    ...field,
    initialValue:
      isUndefined(sectionValues[field.name]) ||
      isNull(sectionValues[field.name])
        ? getInitialValue(field, data || {}, userDetails)
        : sectionValues[field.name]
  }))
}

function firstVisibleSection(form: IForm) {
  return form.sections.filter(({ viewType }) => viewType !== 'hidden')[0]
}

function mapStateToProps(state: IStoreState, props: IFormProps & RouteProps) {
  const { match, registerForm, declaration } = props
  const sectionId = match.params.pageId || firstVisibleSection(registerForm).id

  const activeSection = registerForm.sections.find(
    (section) => section.id === sectionId
  )
  if (!activeSection) {
    throw new Error(`Configuration for tab "${match.params.pageId}" missing!`)
  }
  const groupId =
    match.params.groupId ||
    getVisibleSectionGroupsBasedOnConditions(
      activeSection,
      declaration.data[activeSection.id] || {},
      declaration.data
    )[0].id
  const activeSectionGroup = activeSection.groups.find(
    (group) => group.id === groupId
  )
  if (!activeSectionGroup) {
    throw new Error(
      `Configuration for group "${match.params.groupId}" missing!`
    )
  }

  if (!declaration) {
    throw new Error(`Draft "${match.params.declarationId}" missing!`)
  }

  const setAllFieldsDirty =
    (declaration.visitedGroupIds &&
      declaration.visitedGroupIds.findIndex(
        (visitedGroup) =>
          visitedGroup.sectionId === activeSection.id &&
          visitedGroup.groupId === activeSectionGroup.id
      ) > -1) ||
    false

  const fields = replaceInitialValues(
    activeSectionGroup.fields,
    declaration.data[activeSection.id] || {},
    declaration.data,
    getUserDetails(state)
  )

  let updatedFields: IFormField[] = []

  if (!setAllFieldsDirty) {
    updatedFields = activeSectionGroup.fields.filter(
      (field, index) => fields[index].initialValue !== field.initialValue
    )
  }

  return {
    activeSection,
    activeSectionGroup: {
      ...activeSectionGroup,
      fields
    },
    setAllFieldsDirty,
    fieldsToShowValidationErrors: updatedFields,
    isWritingDraft: state.declarationsState.isWritingDraft,
    scope: getScope(state)
  }
}

export const RegisterForm = connect<
  Props,
  DispatchProps,
  IFormProps & RouteProps,
  IStoreState
>(mapStateToProps, {
  writeDeclaration,
  modifyDeclaration,
  deleteDeclaration,
  goToPageGroup: goToPageGroupAction,
  goBack: goBackAction,
  goToCertificateCorrection,
  goToHome,
  goToHomeTab,
  toggleDraftSavedNotification
})(injectIntl<'intl', FullProps>(RegisterFormView))
