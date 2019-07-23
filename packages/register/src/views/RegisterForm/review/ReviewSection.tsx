import * as React from 'react'
import {
  DocumentViewer,
  IDocumentViewerOptions,
  DataSection
} from '@opencrvs/components/lib/interface'
import styled from '@register/styledComponents'
import {
  IApplication,
  writeApplication,
  SUBMISSION_STATUS,
  IPayload
} from '@register/applications'
import { connect } from 'react-redux'
import { IStoreState } from '@register/store'
import { getRegisterForm } from '@register/forms/register/application-selectors'
import { EditConfirmation } from '@register/views/RegisterForm/review/EditConfirmation'
import {
  getConditionalActionsForField,
  getVisibleSectionGroupsBasedOnConditions,
  getSectionFields
} from '@register/forms/utils'
import { Link } from '@opencrvs/components/lib/typography'
import { flatten, isArray } from 'lodash'
import { getValidationErrorsForForm } from '@register/forms/validation'
import { goToPageGroup } from '@register/navigation'

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
import { LinkButton } from '@opencrvs/components/lib/buttons'
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
import { ReviewAction } from '@register/components/form/ReviewActionComponent'
import { findDOMNode } from 'react-dom'
import { isMobileDevice } from '@register/utils/commonUtils'
import { FullBodyContent } from '@opencrvs/components/lib/layout'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  valueYes: {
    id: 'buttons.yes',
    defaultMessage: 'Yes',
    description: 'Label for "Yes" answer'
  },
  valueNo: {
    id: 'buttons.no',
    defaultMessage: 'No',
    description: 'Label for "No" answer'
  },
  editLink: {
    id: 'buttons.edit',
    defaultMessage: 'Edit',
    description: 'Edit link text'
  },
  valueNext: {
    id: 'buttons.next',
    defaultMessage: 'Next',
    description: 'Next button text'
  },

  requiredField: {
    id: 'register.form.required',
    defaultMessage: 'This field is required',
    description: 'Message when a field doesnt have a value'
  },

  valueSaveAsDraft: {
    id: 'buttons.saveDraft',
    defaultMessage: 'Save as draft',
    description: 'Save as draft Button Text'
  },
  deleteApplicationBtnTxt: {
    id: 'buttons.deleteApplication',
    defaultMessage: 'Delete Application',
    description: 'Delete application Button Text'
  },
  actionChange: {
    id: 'buttons.change',
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

const ZeroDocument = styled.div`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`

const ResponsiveDocumentViewer = styled.div.attrs<{ isRegisterScope: boolean }>(
  {}
)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: ${({ isRegisterScope }) => (isRegisterScope ? 'block' : 'none')};
    margin-bottom: 11px;
  }
`

const FormData = styled.div`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  padding: 32px;
`
const InputWrapper = styled.div`
  margin-top: 16px;
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
  rejectApplicationClickEvent?: () => void
  goToPageGroup: typeof goToPageGroup
  submitClickEvent: (
    application: IApplication,
    submissionStatus: string,
    action: string,
    payload?: IPayload
  ) => void
  scope: Scope | null
  offlineResources: IOfflineDataState
  language: string
  onChangeReviewForm?: onChangeReviewForm
  writeApplication: typeof writeApplication
}
type State = {
  displayEditDialog: boolean
  editClickedSectionId: string
  editClickedSectionGroupId: string
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
    const fields: IFormField[] = getSectionFields(
      section,
      draft.data[section.id]
    )

    const errors = getValidationErrorsForForm(
      fields,
      draft.data[section.id] || {}
    )

    return {
      ...sections,
      [section.id]: fields.reduce((fields, field) => {
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
      editClickedSectionGroupId: '',
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

  editLinkClickHandler = (
    sectionId: string,
    sectionGroupId: string,
    fieldName: string
  ) => {
    this.setState(() => ({
      editClickedSectionId: sectionId,
      editClickedSectionGroupId: sectionGroupId,
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
        offlineResources,
        draft.data
      )
      return !conditionalActions.includes('hide')
    }

    const isViewOnly = (field: IFormField) => {
      return [LIST, PARAGRAPH, WARNING, TEXTAREA].find(
        type => type === field.type
      )
    }
    return formSections.map(section => {
      let items: any[] = []
      getVisibleSectionGroupsBasedOnConditions(
        section,
        draft.data[section.id] || {}
      ).forEach(group => {
        items = items.concat(
          group.fields
            .filter(
              field => isVisibleField(field, section) && !isViewOnly(field)
            )
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
                        this.props.goToPageGroup(
                          pageRoute,
                          draft.id,
                          section.id,
                          group.id,
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
                    this.editLinkClickHandler(section.id, group.id, field.name)
                  }
                }
              }
            })
        )
      })
      return {
        id: section.id,
        title: intl.formatMessage(section.title),
        items
      }
    })
  }

  render() {
    const {
      intl,
      draft,
      registerForm,
      rejectApplicationClickEvent,
      submitClickEvent,
      pageRoute,
      draft: { event }
    } = this.props

    const formSections = getViewableSection(registerForm[event])

    const errorsOnFields = getErrorsOnFieldsBySection(formSections, draft)

    const isComplete =
      flatten(
        // @ts-ignore
        Object.values(errorsOnFields).map(Object.values)
        // @ts-ignore
      ).filter(errors => errors.length > 0).length === 0

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
            <ReviewAction
              isComplete={isComplete}
              isRegister={this.userHasRegisterScope()}
              isRejected={this.props.draft.registrationStatus === REJECTED}
              isDraft={
                this.props.draft.submissionStatus === SUBMISSION_STATUS.DRAFT
              }
              application={draft}
              submitAction={submitClickEvent}
              rejectAction={rejectApplicationClickEvent}
            />
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
                      this.editLinkClickHandler(
                        documentsSection.id,
                        documentsSection.groups[0].id,
                        this.state.activeSection
                      )
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
            this.props.goToPageGroup(
              pageRoute,
              draft.id,
              this.state.editClickedSectionId,
              this.state.editClickedSectionGroupId,
              draft.event.toLowerCase(),
              this.state.editClickFieldName
            )
          }}
        />
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
  { goToPageGroup, writeApplication }
)(injectIntl(ReviewSectionComp))
