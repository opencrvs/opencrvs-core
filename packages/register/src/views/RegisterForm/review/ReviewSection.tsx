import * as React from 'react'
import {
  DocumentViewer,
  IDocumentViewerOptions,
  DataSection
} from '@opencrvs/components/lib/interface'
import styled from '@register/styledComponents'
import { IApplication, writeApplication } from '@register/applications'
import { connect } from 'react-redux'
import { IStoreState } from '@register/store'
import { getRegisterForm } from '@register/forms/register/application-selectors'
import { EditConfirmation } from '@register/views/RegisterForm/review/EditConfirmation'
import { getConditionalActionsForField } from '@register/forms/utils'
import {
  TickLarge,
  CrossLarge,
  Delete,
  DraftSimple
} from '@opencrvs/components/lib/icons'
import { Link } from '@opencrvs/components/lib/typography'
import { flatten, isArray } from 'lodash'
import { getValidationErrorsForForm } from '@register/forms/validation'
import { goToPage, goToDocumentSection } from '@register/navigation'

import {
  ISelectOption as SelectComponentOptions,
  TextArea,
  InputField
} from '@opencrvs/components/lib/forms'
import { documentsSection } from '@register/forms/register/fieldDefinitions/birth/documents-section'
import { getScope } from '@register/profile/profileSelectors'
import { Scope } from '@register/utils/authUtils'
import { getOfflineState } from '@register/offline/selectors'
import {
  IOfflineDataState,
  OFFLINE_LOCATIONS_KEY,
  OFFLINE_FACILITIES_KEY,
  ILocation
} from '@register/offline/reducer'
import { getLanguage } from '@register/i18n/selectors'
import {
  defineMessages,
  InjectedIntlProps,
  injectIntl,
  InjectedIntl
} from 'react-intl'
import {
  PrimaryButton,
  IconAction,
  ICON_ALIGNMENT,
  LinkButton
} from '@opencrvs/components/lib/buttons'
import {
  IForm,
  IFormSection,
  IFormField,
  IFileValue,
  IFormFieldValue,
  LIST,
  PARAGRAPH,
  SELECT_WITH_OPTIONS,
  SELECT_WITH_DYNAMIC_OPTIONS,
  ISelectOption,
  IDynamicOptions,
  IFormSectionData,
  WARNING,
  DATE,
  TEXTAREA
} from '@register/forms'
import { formatLongDate } from '@register/utils/date-formatting'

import { REJECTED, BIRTH } from '@register/utils/constants'
import { ReviewHeader } from './ReviewHeader'
import { SEAL_BD_GOVT } from '@register/views/PrintCertificate/generatePDF'
import { registrationSection } from '@register/forms/register/fieldDefinitions/birth/registration-section'
import { getDraftApplicantFullName } from '@register/utils/draftUtils'
import { findDOMNode } from 'react-dom'
import { FullBodyContent } from '@opencrvs/components/lib/layout'
import { isMobileDevice } from '@register/utils/commonUtils'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  valueYes: {
    id: 'register.form.valueYes',
    defaultMessage: 'Yes',
    description: 'Label for "Yes" answer'
  },
  valueNo: {
    id: 'register.form.valueNo',
    defaultMessage: 'No',
    description: 'Label for "No" answer'
  },
  editLink: {
    id: 'review.edit.modal.editButton',
    defaultMessage: 'Edit',
    description: 'Edit link text'
  },
  valueNext: {
    id: 'register.form.next',
    defaultMessage: 'Next',
    description: 'Next button text'
  },
  valueRegister: {
    id: 'review.button.register',
    defaultMessage: 'REGISTER',
    description: 'Register button text'
  },
  valueReject: {
    id: 'review.button.reject',
    defaultMessage: 'Reject Application',
    description: 'Reject application button text'
  },
  requiredField: {
    id: 'register.form.required',
    defaultMessage: 'This field is required',
    description: 'Message when a field doesnt have a value'
  },
  valueSendForReview: {
    id: 'register.form.submit',
    defaultMessage: 'SEND FOR REVIEW',
    description: 'Submit Button Text'
  },
  valueSaveAsDraft: {
    id: 'register.form.saveDraft',
    defaultMessage: 'Save as draft',
    description: 'Save as draft Button Text'
  },
  deleteApplicationBtnTxt: {
    id: 'review.form.deleteApplication',
    defaultMessage: 'Delete Application',
    description: 'Delete application Button Text'
  },
  actionChange: {
    id: 'action.change',
    defaultMessage: 'Change',
    description: 'Change action'
  },
  bgdGovtName: {
    id: 'review.header.title.govtName.bgd',
    defaultMessage: 'Government of the peoples republic of Bangladesh',
    description: 'Header title that shows bgd govt name'
  },
  headerSubjectWithoutName: {
    id: 'review.header.subject.subjectWithoutName',
    defaultMessage:
      '{eventType, select, birth {Birth} death {Death}} Application',
    description: 'Header subject that shows which application type to review'
  },
  headerSubjectWithName: {
    id: 'review.header.subject.subjectWitName',
    defaultMessage:
      '{eventType, select, birth {Birth} death {Death}} Application for {name}',
    description:
      'Header subject that shows which application type to review with applicant name'
  },
  additionalComments: {
    id: 'review.inputs.additionalComments',
    defaultMessage: 'Any additional comments?',
    description: 'Label for input Additional comments'
  },
  zeroDocumentsText: {
    id: 'review.documents.zeroDocumentsText',
    defaultMessage:
      'No supporting documents for {section, select, child {child} mother {mother} father {father} deceased {deceased} informant {informant}}',
    description: 'Zero documents text'
  },
  editDocuments: {
    id: 'review.documents.editDocuments',
    defaultMessage: 'Add attachement',
    description: 'Edit documents text'
  }
})

const ButtonContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 25px;
  margin-bottom: 2px;
`
const RejectApplication = styled(IconAction)`
  background-color: transparent;
  box-shadow: none;
  min-height: auto;
  padding: 0px;
  width: auto;
  div:first-of-type {
    background: ${({ theme }) => theme.colors.warning};
    padding: 15px 15px 10px;
    border-radius: 2px;
  }
  h3 {
    ${({ theme }) => theme.fonts.bodyBoldStyle};
    margin-left: 70px;
    color: ${({ theme }) => theme.colors.secondary};
    text-decoration: underline;
  }
  &:disabled {
    div:first-of-type {
      background: ${({ theme }) => theme.colors.disabled};
    }
    g {
      fill: ${({ theme }) => theme.colors.disabled};
    }
    h3 {
      color: ${({ theme }) => theme.colors.disabled};
    }
  }
`

const RequiredFieldLink = styled(Link)`
  color: ${({ theme }) => theme.colors.error};
`
const Row = styled.div`
  display: flex;
  flex: 1;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column;
  }
`
const Column = styled.div`
  width: 50%;
  margin: 0px 15px;

  &:first-child {
    margin-left: 0px;
  }
  &:last-child {
    margin-right: 0px;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin: 0px;
    width: 100%;
  }
`
const StyledColumn = styled(Column)`
  ${({ theme }) => theme.shadows.mistyShadow};
`
const ResponsiveDocumentViewer = styled.div.attrs<{ isRegisterScope: boolean }>(
  {}
)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: ${({ isRegisterScope }) => (isRegisterScope ? 'block' : 'none')};
    margin-bottom: 11px;
  }
`
const DButtonContainer = styled(ButtonContainer)`
  background: transparent;
`
const DeleteApplication = styled.a`
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.error};
  text-decoration: underline;
  cursor: pointer;
  svg {
    margin-right: 15px;
  }
`
const SaveDraftText = styled.span`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: underline;
  margin-left: 14px;
`

const DraftButtonContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 83px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-left: 25px;
  cursor: pointer;
`

const FormData = styled.div`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  padding: 32px;
`
const InputWrapper = styled.div`
  margin-top: 16px;
`
const ZeroDocument = styled.div`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`
type onChangeReviewForm = (
  sectionData: IFormSectionData,
  activeSection: any,
  application: IApplication
) => void
interface IProps {
  draft: IApplication
  registerForm: { [key: string]: IForm }
  pageRoute: string
  registerClickEvent?: () => void
  rejectApplicationClickEvent?: () => void
  submitClickEvent?: () => void
  saveDraftClickEvent?: () => void
  deleteApplicationClickEvent?: () => void
  goToPage: typeof goToPage
  scope: Scope | null
  offlineResources: IOfflineDataState
  language: string
  onChangeReviewForm?: onChangeReviewForm
  goToDocumentSection: typeof goToDocumentSection
  writeApplication: typeof writeApplication
}
type State = {
  displayEditDialog: boolean
  editClickedSectionId: string
  editClickFieldName: string
  activeSection: string
}
type FullProps = IProps & InjectedIntlProps

const getViewableSection = (registerForm: IForm): IFormSection[] => {
  return registerForm.sections.filter(
    ({ id, viewType }) =>
      id !== 'documents' && (viewType === 'form' || viewType === 'hidden')
  )
}

const getDocumentSections = (registerForm: IForm): IFormSection[] => {
  return registerForm.sections.filter(
    ({ hasDocumentSection }) => hasDocumentSection
  )
}

function renderSelectLabel(
  value: IFormFieldValue,
  options: ISelectOption[],
  intl: InjectedIntl
) {
  const selectedOption = options.find(option => option.value === value)
  return selectedOption ? intl.formatMessage(selectedOption.label) : value
}

export function renderSelectDynamicLabel(
  value: IFormFieldValue,
  options: IDynamicOptions,
  draftData: IFormSectionData,
  intl: InjectedIntl,
  resources: IOfflineDataState,
  language: string
) {
  if (!options.resource) {
    const dependency = options.dependency
      ? draftData[options.dependency]
      : false
    const selectedOption = dependency
      ? options.options &&
        options.options[dependency.toString()].find(
          option => option.value === value
        )
      : false
    return selectedOption ? intl.formatMessage(selectedOption.label) : value
  } else {
    if (options.resource) {
      let selectedLocation: ILocation
      const locationId = value as string
      if (options.resource === 'locations') {
        selectedLocation = resources[OFFLINE_LOCATIONS_KEY][locationId]
      } else {
        selectedLocation = resources[OFFLINE_FACILITIES_KEY][locationId]
      }

      if (selectedLocation) {
        if (language === 'en') {
          return selectedLocation.name
        } else {
          return selectedLocation.nameBn
        }
      } else {
        return false
      }
    } else {
      return false
    }
  }
}

const renderValue = (
  draft: IApplication,
  section: IFormSection,
  field: IFormField,
  intl: InjectedIntl,
  offlineResources: IOfflineDataState,
  language: string
) => {
  const value: IFormFieldValue = draft.data[section.id]
    ? draft.data[section.id][field.name]
    : ''
  if (field.type === SELECT_WITH_OPTIONS && field.options) {
    return renderSelectLabel(value, field.options, intl)
  }
  if (field.type === SELECT_WITH_DYNAMIC_OPTIONS && field.dynamicOptions) {
    const draftData = draft.data[section.id]
    return renderSelectDynamicLabel(
      value,
      field.dynamicOptions,
      draftData,
      intl,
      offlineResources,
      language
    )
  }

  if (field.type === DATE && value && typeof value === 'string') {
    return formatLongDate(value)
  }

  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'boolean') {
    return value
      ? intl.formatMessage(messages.valueYes)
      : intl.formatMessage(messages.valueNo)
  }
  return value
}

const getErrorsOnFieldsBySection = (
  formSections: IFormSection[],
  draft: IApplication
) => {
  return formSections.reduce((sections, section: IFormSection) => {
    const errors = getValidationErrorsForForm(
      section.fields,
      draft.data[section.id] || {}
    )

    return {
      ...sections,
      [section.id]: section.fields.reduce((fields, field) => {
        // REFACTOR
        const validationErrors = errors[field.name]

        const value = draft.data[section.id]
          ? draft.data[section.id][field.name]
          : null

        const informationMissing =
          validationErrors.length > 0 || value === null ? validationErrors : []

        return { ...fields, [field.name]: informationMissing }
      }, {})
    }
  }, {})
}

type ImageMeta = {
  title: string
  description: string
}
type FullIFileValue = IFileValue & ImageMeta

class ReviewSectionComp extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)
    this.state = {
      displayEditDialog: false,
      editClickedSectionId: '',
      editClickFieldName: '',
      activeSection: ''
    }
  }

  componentDidMount() {
    !isMobileDevice() && window.addEventListener('scroll', this.onScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll)
  }

  docSections = getDocumentSections(
    this.props.registerForm[this.props.draft.event]
  )

  onScroll = () => {
    const scrollY = window.scrollY + window.innerHeight / 2
    let minDistance = 100000
    let sectionYTop = 0
    let sectionYBottom = 0
    let distance = 0
    let sectionElement: HTMLElement
    let activeSection = this.state.activeSection

    const node = findDOMNode(this) as HTMLElement

    this.docSections.forEach((section: IFormSection) => {
      sectionElement = node.querySelector(
        '#Section_' + section.id
      ) as HTMLElement
      sectionYTop = sectionElement.offsetTop
      sectionYBottom = sectionElement.offsetTop + sectionElement.offsetHeight

      distance = Math.abs(sectionYTop - scrollY)
      if (distance < minDistance) {
        minDistance = distance
        activeSection = section.id
      }

      distance = Math.abs(sectionYBottom - scrollY)
      if (distance < minDistance) {
        minDistance = distance
        activeSection = section.id
      }
    })
    this.setState({
      activeSection
    })
  }

  prepSectionDocuments = (
    draft: IApplication,
    activeSection: string
  ): IDocumentViewerOptions => {
    const draftItemName = documentsSection.id
    const documentOptions: SelectComponentOptions[] = []
    const selectOptions: SelectComponentOptions[] = []
    let uploadedDocuments =
      draft.data[draftItemName] &&
      isArray(draft.data[draftItemName].imageUploader)
        ? (draft.data[draftItemName].imageUploader as FullIFileValue[])
        : []

    uploadedDocuments = uploadedDocuments.filter(document => {
      return document.title.toUpperCase() === activeSection.toUpperCase()
    })

    uploadedDocuments.forEach(document => {
      const label = document.title + ' ' + document.description
      documentOptions.push({
        value: document.data,
        label
      })
      selectOptions.push({
        value: label,
        label
      })
    })

    return {
      selectOptions,
      documentOptions
    }
  }

  toggleDisplayDialog = () => {
    this.setState(prevState => ({
      displayEditDialog: !prevState.displayEditDialog
    }))
  }

  editLinkClickHandler = (sectionId: string, fieldName: string) => {
    this.setState(() => ({
      editClickedSectionId: sectionId,
      editClickFieldName: fieldName
    }))
    this.toggleDisplayDialog()
  }

  userHasRegisterScope() {
    if (this.props.scope) {
      return this.props.scope && this.props.scope.includes('register')
    } else {
      return false
    }
  }

  transformSectionData = (
    formSections: IFormSection[],
    errorsOnFields: any
  ) => {
    const { intl, draft, offlineResources, language, pageRoute } = this.props
    const isVisibleField = (field: IFormField, section: IFormSection) => {
      const conditionalActions = getConditionalActionsForField(
        field,
        draft.data[section.id] || {},
        offlineResources
      )
      return !conditionalActions.includes('hide')
    }

    const isViewOnly = (field: IFormField) => {
      return [LIST, PARAGRAPH, WARNING, TEXTAREA].find(
        type => type === field.type
      )
    }
    return formSections.map(section => ({
      id: section.id,
      title: intl.formatMessage(section.title),
      items: section.fields
        .filter(field => isVisibleField(field, section) && !isViewOnly(field))
        .map(field => {
          const errorsOnField =
            // @ts-ignore
            errorsOnFields[section.id][field.name]

          return {
            label: intl.formatMessage(field.label),
            value:
              errorsOnField.length > 0 ? (
                <RequiredFieldLink
                  id={`required_link_${section.id}_${field.name}`}
                  onClick={() => {
                    this.props.goToPage(
                      pageRoute,
                      draft.id,
                      section.id,
                      draft.event.toLowerCase(),
                      field.name
                    )
                  }}
                >
                  {intl.formatMessage(
                    errorsOnField[0].message,
                    errorsOnField[0].props
                  )}
                </RequiredFieldLink>
              ) : (
                renderValue(
                  draft,
                  section,
                  field,
                  intl,
                  offlineResources,
                  language
                )
              ),
            action: {
              id: `btn_change_${section.id}_${field.name}`,
              label: intl.formatMessage(messages.actionChange),
              handler: () => {
                this.editLinkClickHandler(section.id, field.name)
              }
            }
          }
        })
    }))
  }

  render() {
    const {
      intl,
      draft,
      registerForm,
      registerClickEvent,
      rejectApplicationClickEvent,
      submitClickEvent,
      saveDraftClickEvent,
      deleteApplicationClickEvent,
      pageRoute,
      draft: { event }
    } = this.props

    const formSections = getViewableSection(registerForm[event])
    const errorsOnFields = getErrorsOnFieldsBySection(formSections, draft)
    const numberOfErrors = flatten(
      // @ts-ignore
      Object.values(errorsOnFields).map(Object.values)
      // @ts-ignore
    ).filter(errors => errors.length > 0).length

    const isRejected =
      this.props.draft.registrationStatus &&
      this.props.draft.registrationStatus === REJECTED

    const textAreaProps = {
      id: 'additional_comments',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        ;(this.props.onChangeReviewForm as onChangeReviewForm)(
          { commentsOrNotes: e.target.value },
          registrationSection,
          draft
        )
      },
      value:
        (draft.data.registration && draft.data.registration.commentsOrNotes) ||
        '',
      ignoreMediaQuery: true
    }

    const sectionName = this.state.activeSection || this.docSections[0].id
    const applicantName = getDraftApplicantFullName(draft, intl.locale)

    return (
      <FullBodyContent>
        <Row>
          <StyledColumn>
            <ReviewHeader
              id="review_header"
              logoSource={SEAL_BD_GOVT}
              title={intl.formatMessage(
                messages[`${window.config.COUNTRY}GovtName`]
              )}
              subject={
                applicantName
                  ? intl.formatMessage(messages.headerSubjectWithName, {
                      eventType: event,
                      name: applicantName
                    })
                  : intl.formatMessage(messages.headerSubjectWithoutName, {
                      eventType: event
                    })
              }
            />
            <FormData>
              {this.transformSectionData(formSections, errorsOnFields).map(
                (sec, index) => (
                  <DataSection key={index} {...sec} id={'Section_' + sec.id} />
                )
              )}
              {event === BIRTH && (
                <InputWrapper>
                  <InputField
                    id="additional_comments"
                    touched={false}
                    required={false}
                    label={intl.formatMessage(messages.additionalComments)}
                  >
                    <TextArea {...textAreaProps} />
                  </InputField>
                </InputWrapper>
              )}
            </FormData>
            {!!registerClickEvent && (
              <ButtonContainer>
                <PrimaryButton
                  id="registerApplicationBtn"
                  icon={() => <TickLarge />}
                  align={ICON_ALIGNMENT.LEFT}
                  onClick={registerClickEvent}
                >
                  {intl.formatMessage(messages.valueRegister)}
                </PrimaryButton>
              </ButtonContainer>
            )}

            {!!rejectApplicationClickEvent && !isRejected && (
              <ButtonContainer>
                <RejectApplication
                  id="rejectApplicationBtn"
                  title={intl.formatMessage(messages.valueReject)}
                  icon={() => <CrossLarge />}
                  onClick={rejectApplicationClickEvent}
                />
              </ButtonContainer>
            )}

            {!!submitClickEvent && (
              <ButtonContainer>
                <PrimaryButton
                  id="submit_form"
                  icon={() => <TickLarge />}
                  align={ICON_ALIGNMENT.LEFT}
                  onClick={submitClickEvent}
                  disabled={numberOfErrors > 0}
                >
                  {intl.formatMessage(
                    this.userHasRegisterScope()
                      ? messages.valueRegister
                      : messages.valueSendForReview
                  )}
                </PrimaryButton>
              </ButtonContainer>
            )}

            {!!saveDraftClickEvent && (
              <DraftButtonContainer
                onClick={saveDraftClickEvent}
                id="save-draft"
              >
                <DraftSimple />
                <SaveDraftText>
                  {intl.formatMessage(messages.valueSaveAsDraft)}
                </SaveDraftText>
              </DraftButtonContainer>
            )}
          </StyledColumn>
          <Column>
            <ResponsiveDocumentViewer
              isRegisterScope={this.userHasRegisterScope()}
            >
              <DocumentViewer
                id={'document_section_' + this.state.activeSection}
                key={'Document_section_' + this.state.activeSection}
                options={this.prepSectionDocuments(
                  draft,
                  this.state.activeSection || formSections[0].id
                )}
              >
                <ZeroDocument>
                  {intl.formatMessage(messages.zeroDocumentsText, {
                    section: sectionName
                  })}
                  <LinkButton
                    id="edit-document"
                    onClick={() =>
                      this.props.goToDocumentSection(draft.id, draft.event)
                    }
                  >
                    {intl.formatMessage(messages.editDocuments)}
                  </LinkButton>
                </ZeroDocument>
              </DocumentViewer>
            </ResponsiveDocumentViewer>
          </Column>
        </Row>
        <EditConfirmation
          show={this.state.displayEditDialog}
          handleClose={this.toggleDisplayDialog}
          handleEdit={() => {
            const application = this.props.draft
            application.review = true
            this.props.writeApplication(application)
            this.props.goToPage(
              pageRoute,
              draft.id,
              this.state.editClickedSectionId,
              draft.event.toLowerCase(),
              this.state.editClickFieldName
            )
          }}
        />
        {deleteApplicationClickEvent && (
          <DButtonContainer>
            <DeleteApplication
              onClick={deleteApplicationClickEvent}
              id="delete-application"
            >
              <Delete />
              {intl.formatMessage(messages.deleteApplicationBtnTxt)}
            </DeleteApplication>
          </DButtonContainer>
        )}
      </FullBodyContent>
    )
  }
}

export const ReviewSection = connect(
  (state: IStoreState) => ({
    registerForm: getRegisterForm(state),
    scope: getScope(state),
    offlineResources: getOfflineState(state),
    language: getLanguage(state)
  }),

  { goToPage, writeApplication, goToDocumentSection }
)(injectIntl(ReviewSectionComp))
