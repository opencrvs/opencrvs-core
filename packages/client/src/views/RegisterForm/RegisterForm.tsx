/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as React from 'react'
import { FormikTouched, FormikValues } from 'formik'
import {
  WrappedComponentProps as IntlShapeProps,
  injectIntl,
  useIntl
} from 'react-intl'
import { connect, useDispatch } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import _, { isNull, isUndefined, merge, flatten, isEqual } from 'lodash'
import debounce from 'lodash/debounce'
import {
  PrimaryButton,
  TertiaryButton,
  DangerButton
} from '@opencrvs/components/lib/buttons'
import { DeclarationIcon, Duplicate } from '@opencrvs/components/lib/icons'
import { Alert } from '@opencrvs/components/lib/Alert'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import { Frame } from '@opencrvs/components/lib/Frame'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
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
  SELECT_WITH_DYNAMIC_OPTIONS,
  SubmissionAction
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
import styled from 'styled-components'
import { Scope } from '@client/utils/authUtils'
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
import { duplicateMessages } from '@client/i18n/messages/views/duplicates'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import {
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
import { STATUSTOCOLOR } from '@client/views/RecordAudit/RecordAudit'
import { DuplicateFormTabs } from '@client/views/RegisterForm/duplicate/DuplicateFormTabs'
import { UserDetails } from '@client/utils/userUtils'
import { client } from '@client/utils/apolloClient'
import { Stack, ToggleMenu } from '@client/../../components/lib'
import { useModal } from '@client/hooks/useModal'
import { Text } from '@opencrvs/components/lib/Text'

const Notice = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.11);
  padding: 25px;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.reg18};
  margin: 30px -25px;
`

const BackButtonContainer = styled.div`
  position: fixed;
  padding: 16px 0px;
  height: 64px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    position: relative;
    margin: 0 16px;
  }
`

const PageFooter = styled.div`
  height: 200px;
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
interface IFormProps {
  declaration: IDeclaration
  registerForm: IForm
  pageRoute: string
  duplicate?: boolean
  reviewSummaryHeader?: React.ReactNode
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
  fieldsToShowValidationErrors?: IFormField[]
  isWritingDraft: boolean
  userDetails: UserDetails | null
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
  confirmDeleteDeclarationModal: boolean
  isFileUploading: boolean
  startTime: number
  selectedDuplicateComId: string
  isDuplicateDeclarationLoading: boolean
  formFieldKey: string
}

function getDeclarationIconColor(declaration: IDeclaration): string {
  return declaration.submissionStatus === SUBMISSION_STATUS.DRAFT
    ? 'purple'
    : declaration.registrationStatus
    ? STATUSTOCOLOR[declaration.registrationStatus]
    : 'orange'
}

function FormAppBar({
  section,
  declaration,
  duplicate,
  modifyDeclarationMethod,
  deleteDeclarationMethod
}: {
  duplicate: boolean | undefined
  section: IFormSection
  declaration: IDeclaration
  modifyDeclarationMethod: (declration: IDeclaration) => void
  deleteDeclarationMethod: (declration: IDeclaration) => void
}) {
  const intl = useIntl()
  const dispatch = useDispatch()
  const [modal, openModal] = useModal()

  const isFormDataAltered = () => {
    if (!declaration.localData) {
      // if there is no localData property
      // that means it's a draft and has unsaved changes
      return true
    }

    return !isEqual(declaration.localData, declaration.data)
  }

  const getRedirectionTabOnSaveOrExit = () => {
    const status =
      declaration.submissionStatus || declaration.registrationStatus
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
  const handleSaveAndExit = async () => {
    const saveAndExitConfirm = await openModal<boolean | null>((close) => (
      <ResponsiveModal
        id="save_declaration_confirmation"
        autoHeight
        responsive={false}
        title={intl.formatMessage(messages.saveDeclarationConfirmModalTitle)}
        actions={[
          <Button
            type="tertiary"
            id="cancel_save_exit"
            key="cancel_save_exit"
            onClick={() => {
              close(null)
            }}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            type="positive"
            key="confirm_save_exit"
            id="confirm_save_exit"
            onClick={() => {
              close(true)
            }}
          >
            {intl.formatMessage(buttonMessages.confirm)}
          </Button>
        ]}
        show={true}
        handleClose={() => close(null)}
      >
        <Stack>
          <Text variant="reg16" element="p" color="grey500">
            {intl.formatMessage(
              messages.saveDeclarationConfirmModalDescription
            )}
          </Text>
        </Stack>
      </ResponsiveModal>
    ))

    if (saveAndExitConfirm) {
      //saving current changes to localData
      //so that we can revert changes back to data.localData when users exits without saving
      declaration.localData = declaration.data
      //save declaration and exit
      dispatch(writeDeclaration(declaration))
      dispatch(goToHomeTab(getRedirectionTabOnSaveOrExit()))
    }
  }

  const handleExit = async () => {
    const isDataAltered = isFormDataAltered()
    if (!isDataAltered) {
      dispatch(goToHomeTab(getRedirectionTabOnSaveOrExit()))
      return
    }
    const [exitModalTitle, exitModalDescription] =
      isCorrection(declaration) ||
      declaration.registrationStatus === SUBMISSION_STATUS.CORRECTION_REQUESTED
        ? [
            intl.formatMessage(
              messages.exitWithoutSavingModalForCorrectionRecordTitle
            ),
            intl.formatMessage(
              messages.exitWithoutSavingModalForCorrectionRecordDescription
            )
          ]
        : [
            intl.formatMessage(
              messages.exitWithoutSavingDeclarationConfirmModalTitle
            ),
            intl.formatMessage(
              messages.exitWithoutSavingDeclarationConfirmModalDescription
            )
          ]
    const exitConfirm = await openModal<boolean | null>((close) => (
      <ResponsiveModal
        autoHeight
        responsive={false}
        title={exitModalTitle}
        actions={[
          <Button
            type="tertiary"
            id="cancel_save_without_exit"
            key="cancel_save_without_exit"
            onClick={() => {
              close(null)
            }}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            type="primary"
            key="confirm_save_without_exit"
            id="confirm_save_without_exit"
            onClick={() => {
              close(true)
            }}
          >
            {intl.formatMessage(buttonMessages.confirm)}
          </Button>
        ]}
        show={true}
        handleClose={() => close(null)}
      >
        <Stack>
          <Text variant="reg16" element="p" color="grey500">
            {exitModalDescription}
          </Text>
        </Stack>
      </ResponsiveModal>
    ))

    if (exitConfirm) {
      if (!declaration.localData) {
        deleteDeclarationMethod(declaration)
      } else {
        modifyDeclarationMethod({
          ...declaration,
          data: declaration.localData
        })
      }
      dispatch(goToHomeTab(getRedirectionTabOnSaveOrExit()))
    }
  }

  const handleDelete = async () => {
    const deleteConfirm = await openModal<boolean | null>((close) => (
      <ResponsiveModal
        autoHeight
        responsive={false}
        title={intl.formatMessage(messages.deleteDeclarationConfirmModalTitle)}
        actions={[
          <Button
            type="tertiary"
            id="cancel_delete"
            key="cancel_delete"
            onClick={() => {
              close(null)
            }}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            type="negative"
            key="confirm_delete"
            id="confirm_delete"
            onClick={() => {
              close(true)
            }}
          >
            {intl.formatMessage(buttonMessages.confirm)}
          </Button>
        ]}
        show={true}
        handleClose={() => close(null)}
      >
        <Stack>
          <Text variant="reg16" element="p" color="grey500">
            {intl.formatMessage(
              messages.deleteDeclarationConfirmModalDescription
            )}
          </Text>
        </Stack>
      </ResponsiveModal>
    ))

    deleteConfirm && deleteDeclarationMethod(declaration)
    return
  }
  switch (section.viewType) {
    case 'review':
      return (
        <>
          <AppBar
            desktopLeft={
              duplicate ? (
                <Duplicate />
              ) : (
                <DeclarationIcon color={getDeclarationIconColor(declaration)} />
              )
            }
            desktopTitle={
              duplicate
                ? intl.formatMessage(duplicateMessages.duplicateReviewHeader, {
                    event: declaration.event
                  })
                : intl.formatMessage(messages.newVitalEventRegistration, {
                    event: declaration.event
                  })
            }
            desktopRight={
              <>
                {!duplicate &&
                  !isCorrection(declaration) &&
                  declaration.registrationStatus !==
                    SUBMISSION_STATUS.CORRECTION_REQUESTED && (
                    <Button
                      id="save-exit-btn"
                      type="primary"
                      size="small"
                      onClick={handleSaveAndExit}
                    >
                      <Icon name="DownloadSimple" />
                      {intl.formatMessage(buttonMessages.saveExitButton)}
                    </Button>
                  )}
                <Button
                  id="exit-btn"
                  type="secondary"
                  size="small"
                  onClick={handleExit}
                >
                  <Icon name="X" />
                  {intl.formatMessage(buttonMessages.exitButton)}
                </Button>
              </>
            }
            mobileLeft={
              duplicate ? (
                <Duplicate />
              ) : (
                <DeclarationIcon color={getDeclarationIconColor(declaration)} />
              )
            }
            mobileTitle={
              duplicate
                ? intl.formatMessage(duplicateMessages.duplicateReviewHeader, {
                    event: declaration.event
                  })
                : intl.formatMessage(messages.newVitalEventRegistration, {
                    event: declaration.event
                  })
            }
            mobileRight={
              <>
                {!duplicate && !isCorrection(declaration) && (
                  <Button type="icon" size="small" onClick={handleSaveAndExit}>
                    <Icon name="DownloadSimple" />
                  </Button>
                )}
                <Button type="icon" size="small" onClick={handleExit}>
                  <Icon name="X" />
                </Button>
              </>
            }
          />
          {modal}
        </>
      )
    case 'preview':
    case 'form':
      return (
        <>
          <AppBar
            desktopLeft={
              <DeclarationIcon color={getDeclarationIconColor(declaration)} />
            }
            desktopTitle={intl.formatMessage(
              messages.newVitalEventRegistration,
              {
                event: declaration.event
              }
            )}
            desktopRight={
              <>
                {!isCorrection(declaration) && (
                  <Button
                    id="save-exit-btn"
                    type="primary"
                    size="small"
                    onClick={handleSaveAndExit}
                  >
                    <Icon name="DownloadSimple" />
                    {intl.formatMessage(buttonMessages.saveExitButton)}
                  </Button>
                )}
                <Button type="secondary" size="small" onClick={handleExit}>
                  <Icon name="X" />
                  {intl.formatMessage(buttonMessages.exitButton)}
                </Button>
                {declaration.submissionStatus === SUBMISSION_STATUS.DRAFT && (
                  <ToggleMenu
                    id="eventToggleMenu"
                    toggleButton={
                      <Icon
                        name="DotsThreeVertical"
                        color="primary"
                        size="large"
                      />
                    }
                    menuItems={[
                      {
                        label: intl.formatMessage(
                          buttonMessages.deleteDeclaration
                        ),
                        handler: () => {
                          handleDelete()
                        }
                      }
                    ]}
                  />
                )}
              </>
            }
            mobileLeft={
              <DeclarationIcon color={getDeclarationIconColor(declaration)} />
            }
            mobileTitle={intl.formatMessage(
              messages.newVitalEventRegistration,
              {
                event: declaration.event
              }
            )}
            mobileRight={
              <>
                {!isCorrection(declaration) && (
                  <Button type="icon" size="small" onClick={handleSaveAndExit}>
                    <Icon name="DownloadSimple" />
                  </Button>
                )}
                <Button type="icon" size="small" onClick={handleExit}>
                  <Icon name="X" />
                </Button>
                {declaration.submissionStatus === SUBMISSION_STATUS.DRAFT && (
                  <ToggleMenu
                    id="eventToggleMenu"
                    toggleButton={
                      <Icon
                        name="DotsThreeVertical"
                        color="primary"
                        size="large"
                      />
                    }
                    menuItems={[
                      {
                        label: intl.formatMessage(
                          buttonMessages.deleteDeclaration
                        ),
                        handler: () => {
                          handleDelete()
                        }
                      }
                    ]}
                  />
                )}
              </>
            }
          />
          {modal}
        </>
      )
  }
  return null
}

class RegisterFormView extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)
    this.state = {
      isDataAltered: false,
      rejectFormOpen: false,
      hasError: false,
      showConfirmationModal: false,
      confirmDeleteDeclarationModal: false,
      isFileUploading: false,
      startTime: 0,
      selectedDuplicateComId: props.declaration.id,
      isDuplicateDeclarationLoading: false,
      formFieldKey: `${props.activeSection.id}-${props.activeSectionGroup.id}`
    }
  }
  setAllFormFieldsTouched!: (touched: FormikTouched<FormikValues>) => void

  setSelectedCompId = (id: string) => {
    this.setState({ selectedDuplicateComId: id })
  }

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
    const { declaration } = this.props
    const informantTypeChanged =
      prevProps.declaration?.data?.informant?.informantType !==
      declaration?.data?.informant?.informantType

    // see https://github.com/opencrvs/opencrvs-core/issues/5820
    if (informantTypeChanged) {
      let informant
      let modifiedDeclaration = declaration

      if (declaration?.data?.informant?.informantType === 'MOTHER') {
        informant = 'mother'
      } else if (declaration?.data?.informant?.informantType === 'FATHER') {
        informant = 'father'
      }

      modifiedDeclaration = {
        ...modifiedDeclaration,
        data: {
          ...modifiedDeclaration.data,
          informant: {
            informantType: modifiedDeclaration.data.informant.informantType
          }
        }
      }

      if (informant) {
        modifiedDeclaration = {
          ...modifiedDeclaration,
          data: {
            ...modifiedDeclaration.data,
            [informant]: {
              ...modifiedDeclaration.data[informant],
              detailsExist: true
            }
          }
        }
      }
      this.props.modifyDeclaration(modifiedDeclaration)
      // this is to forcefully remount the component
      // to reset the initial values of formik
      this.setState({
        formFieldKey: `${this.props.activeSection.id}-${declaration.data.informant.informantType}`
      })
    }

    if (newHash && oldHash !== newHash && !newHash.match('form-input')) {
      this.props.history.replace({
        pathname: this.props.history.location.pathname,
        hash: newHash + '-form-input'
      })
    }
    if (prevProps.activeSection.id !== this.props.activeSection.id) {
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
    const timeLoggedMS = (this.props.declaration.timeLoggedMS ?? 0) + timeMs
    const declarationId = this.props.declaration.id
    this.props.modifyDeclaration({ timeLoggedMS, id: declarationId })
  }

  confirmSubmission = (
    declaration: IDeclaration,
    submissionStatus: string,
    action: SubmissionAction,
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

  toggleConfirmDeleteModalOpen = () => {
    this.setState((prevState) => ({
      confirmDeleteDeclarationModal: !prevState.confirmDeleteDeclarationModal
    }))
  }

  getEvent() {
    const eventType = this.props.declaration.event || 'BIRTH'
    switch (eventType.toLocaleLowerCase()) {
      case 'birth':
        return Event.Birth
      case 'death':
        return Event.Death
      case 'marriage':
        return Event.Marriage
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
    this.props.deleteDeclaration(declaration.id, client)
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

    this.props.goToPageGroup(pageRoute, declarationId, pageId, groupId, event)
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

  setAllFieldsDirty = () =>
    this.props.declaration.visitedGroupIds?.some(
      (visitedGroup) =>
        visitedGroup.sectionId === this.props.activeSection.id &&
        visitedGroup.groupId === this.props.activeSectionGroup.id
    ) ?? false

  render() {
    const {
      intl,
      fieldsToShowValidationErrors,
      declaration,
      registerForm,
      duplicate,
      activeSection,
      activeSectionGroup,
      reviewSummaryHeader,
      userDetails
    } = this.props

    const nextSectionGroup = getNextSectionIds(
      registerForm.sections,
      activeSection,
      activeSectionGroup,
      declaration,
      userDetails
    )

    const isErrorOccured = this.state.hasError
    const debouncedModifyDeclaration = debounce(this.modifyDeclaration, 300)
    const isDocumentUploadPage = this.props.match.params.pageId === 'documents'
    const introSection =
      findFirstVisibleSection(registerForm.sections).id === activeSection.id
    return (
      <>
        <TimeMounted
          onUnmount={(duration: number) => {
            this.logTime(duration)
          }}
        ></TimeMounted>
        <Frame
          header={
            <FormAppBar
              declaration={declaration}
              section={activeSection}
              duplicate={duplicate}
              modifyDeclarationMethod={this.props.modifyDeclaration}
              deleteDeclarationMethod={this.onDeleteDeclaration}
            />
          }
          key={activeSection.id}
          skipToContentText={intl.formatMessage(
            constantsMessages.skipToMainContent
          )}
        >
          {isErrorOccured && (
            <ErrorText id="error_message_section">
              {intl.formatMessage(messages.registerFormQueryError)}
            </ErrorText>
          )}
          {!isErrorOccured && (
            <>
              {activeSection.viewType === VIEW_TYPE.PREVIEW && (
                <ReviewSection
                  pageRoute={this.props.pageRoute}
                  draft={declaration}
                  submitClickEvent={this.confirmSubmission}
                  onChangeReviewForm={this.modifyDeclaration}
                  userDetails={userDetails}
                />
              )}
              {activeSection.viewType === VIEW_TYPE.REVIEW && (
                <>
                  {duplicate && (
                    <DuplicateFormTabs
                      declaration={declaration}
                      selectedDuplicateComId={this.state.selectedDuplicateComId}
                      onTabClick={this.setSelectedCompId}
                    />
                  )}
                  {(!duplicate ||
                    this.state.selectedDuplicateComId === declaration.id) && (
                    <ReviewSection
                      pageRoute={this.props.pageRoute}
                      draft={declaration}
                      rejectDeclarationClickEvent={this.toggleRejectForm}
                      submitClickEvent={this.confirmSubmission}
                      onChangeReviewForm={this.modifyDeclaration}
                      reviewSummaryHeader={reviewSummaryHeader}
                      userDetails={userDetails}
                      onContinue={() => {
                        this.props.goToCertificateCorrection(
                          this.props.declaration.id,
                          CorrectionSection.SupportingDocuments
                        )
                      }}
                    />
                  )}
                </>
              )}

              {activeSection.viewType === VIEW_TYPE.FORM && (
                <>
                  <Frame.LayoutForm>
                    <Frame.SectionFormBackAction>
                      {!introSection && (
                        <BackButtonContainer>
                          <Button
                            type="tertiary"
                            size="small"
                            onClick={this.props.goBack}
                          >
                            <Icon name="ArrowLeft" size="medium" />
                            {intl.formatMessage(buttonMessages.back)}
                          </Button>
                        </BackButtonContainer>
                      )}
                    </Frame.SectionFormBackAction>
                    <Frame.Section>
                      <Content
                        size={ContentSize.NORMAL}
                        key={activeSectionGroup.id}
                        id="register_form"
                        title={
                          (activeSectionGroup.title &&
                            intl.formatMessage(activeSectionGroup.title)) ??
                          (activeSection.title &&
                            intl.formatMessage(activeSection.title))
                        }
                        showTitleOnMobile={true}
                        bottomActionButtons={
                          [
                            nextSectionGroup && (
                              <Button
                                id="next_section"
                                key="next_section"
                                type="primary"
                                size="large"
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
                              </Button>
                            ),
                            declaration.review && (
                              <Button
                                id="back-to-review-button"
                                key="back-to-review-button"
                                type="secondary"
                                size="large"
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
                              </Button>
                            )
                          ].filter(Boolean) as React.ReactElement[]
                        }
                      >
                        {this.props.isWritingDraft ? (
                          <SpinnerWrapper>
                            <Spinner id="draft_write_loading" />
                          </SpinnerWrapper>
                        ) : (
                          <>
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
                                  <Alert type="warning">
                                    {intl.formatMessage(
                                      constantsMessages.totalFileSizeExceed,
                                      {
                                        fileSize: bytesToSize(
                                          ACCUMULATED_FILE_SIZE
                                        )
                                      }
                                    )}
                                  </Alert>
                                )}

                              <FormFieldGenerator
                                id={`${activeSection.id}-${activeSectionGroup.id}`}
                                key={this.state.formFieldKey}
                                onChange={(values) => {
                                  debouncedModifyDeclaration(
                                    values,
                                    activeSection,
                                    declaration
                                  )
                                }}
                                setAllFieldsDirty={this.setAllFieldsDirty()}
                                fieldsToShowValidationErrors={
                                  fieldsToShowValidationErrors
                                }
                                fields={getVisibleGroupFields(
                                  activeSectionGroup
                                )}
                                draftData={declaration.data}
                                onSetTouched={(setTouchedFunc) => {
                                  this.setAllFormFieldsTouched = setTouchedFunc
                                }}
                                onUploadingStateChanged={
                                  this.onUploadingStateChanged
                                }
                              />
                            </form>
                          </>
                        )}
                      </Content>
                      <PageFooter />
                    </Frame.Section>
                  </Frame.LayoutForm>
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
          <ResponsiveModal
            id="delete_declaration_confirmation"
            title={intl.formatMessage(
              messages.deleteDeclarationConfirmModalTitle
            )}
            show={this.state.confirmDeleteDeclarationModal}
            handleClose={this.toggleConfirmDeleteModalOpen}
            responsive={false}
            contentHeight={80}
            actions={[
              <TertiaryButton
                id="cancel_delete"
                key="cancel_delete"
                onClick={this.toggleConfirmDeleteModalOpen}
              >
                {intl.formatMessage(buttonMessages.cancel)}
              </TertiaryButton>,
              <DangerButton
                id="confirm_delete"
                key="confirm_delete"
                onClick={() => this.onDeleteDeclaration(declaration)}
              >
                {intl.formatMessage(buttonMessages.delete)}
              </DangerButton>
            ]}
          >
            {intl.formatMessage(
              messages.deleteDeclarationConfirmModalDescription
            )}
          </ResponsiveModal>
        </Frame>
      </>
    )
  }
}

function firstVisibleGroup(
  section: IFormSection,
  declaration: IDeclaration,
  userDetails?: UserDetails | null
): IFormSectionGroup | undefined {
  return getVisibleSectionGroupsBasedOnConditions(
    section,
    declaration.data[section.id] || {},
    declaration.data,
    userDetails
  )[0]
}

function getValidSectionGroup(
  sections: IFormSection[],
  declaration: IDeclaration,
  sectionId: string,
  groupId?: string,
  userDetails?: UserDetails | null
): {
  activeSection: IFormSection
  activeSectionGroup: IFormSectionGroup
} {
  const currentSection = sectionId
    ? sections.find((sec) => sec.id === sectionId)
    : findFirstVisibleSection(sections)
  if (!currentSection) {
    throw new Error(`Section with id "${sectionId}" not found `)
  }

  const currentGroup = groupId
    ? currentSection.groups.find((group) => group.id === groupId)
    : firstVisibleGroup(currentSection, declaration, userDetails)

  const sectionIndex = sections.findIndex((sec) => sec.id === currentSection.id)
  if (!currentGroup) {
    return getValidSectionGroup(
      sections,
      declaration,
      sections[sectionIndex + 1].id,
      undefined,
      userDetails
    )
  }
  return {
    activeSection: currentSection,
    activeSectionGroup: currentGroup
  }
}

function getInitialValue(
  field: IFormField,
  data: IFormData,
  userDetails?: UserDetails | null
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
  userDetails?: UserDetails | null
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

function findFirstVisibleSection(sections: IFormSection[]) {
  return sections.filter(({ viewType }) => viewType !== 'hidden')[0]
}

function mapStateToProps(state: IStoreState, props: IFormProps & RouteProps) {
  const { match, registerForm, declaration } = props
  const sectionId =
    match.params.pageId || findFirstVisibleSection(registerForm.sections).id
  const userDetails = getUserDetails(state)
  const groupId = match.params.groupId
  const { activeSection, activeSectionGroup } = getValidSectionGroup(
    registerForm.sections,
    declaration,
    sectionId,
    groupId,
    userDetails
  )

  if (!activeSectionGroup) {
    throw new Error(
      `Configuration for group "${match.params.groupId}" missing!`
    )
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
    userDetails
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
    fieldsToShowValidationErrors: updatedFields,
    isWritingDraft: declaration.writingDraft ?? false,
    scope: getScope(state),
    userDetails
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
