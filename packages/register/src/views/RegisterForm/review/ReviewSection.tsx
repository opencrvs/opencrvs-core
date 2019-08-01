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
import { InjectedIntlProps, injectIntl, InjectedIntl } from 'react-intl'
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
  TEXTAREA,
  Event
} from '@register/forms'
import { formatLongDate } from '@register/utils/date-formatting'
import { messages, dynamicMessages } from '@register/i18n/messages/views/review'
import { buttonMessages } from '@register/i18n/messages'
import { REJECTED, BIRTH } from '@register/utils/constants'
import { ReviewHeader } from './ReviewHeader'
import { SEAL_BD_GOVT } from '@register/views/PrintCertificate/generatePDF'
import { registrationSection } from '@register/forms/register/fieldDefinitions/birth/registration-section'
import { getDraftApplicantFullName } from '@register/utils/draftUtils'
import { ReviewAction } from '@register/components/form/ReviewActionComponent'
import { findDOMNode } from 'react-dom'
import { isMobileDevice } from '@register/utils/commonUtils'
import { FullBodyContent } from '@opencrvs/components/lib/layout'
import {
  sectionMapping as birthSectionMapping,
  sectionTitle as birthSectionTitle
} from '@register/forms/register/fieldDefinitions/birth/mappings/mutation/documents-mappings'
import {
  sectionMapping as deathSectionMapping,
  sectionTitle as deathSectionTitle
} from '@register/forms/register/fieldDefinitions/death/mappings/mutation/documents-mappings'

const RequiredField = styled.span`
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
const FormDataHeader = styled.div`
  ${({ theme }) => theme.fonts.h2Style}
`
const InputWrapper = styled.div`
  margin-top: 48px;
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
      ? intl.formatMessage(buttonMessages.yes)
      : intl.formatMessage(buttonMessages.no)
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

const SECTION_MAPPING = {
  [Event.BIRTH]: birthSectionMapping,
  [Event.DEATH]: deathSectionMapping
}
const SECTION_TITLE = {
  [Event.BIRTH]: birthSectionTitle,
  [Event.DEATH]: deathSectionTitle
}

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

    let uploadedDocuments: IFileValue[] = []

    for (let index in draft.data[draftItemName]) {
      if (isArray(draft.data[draftItemName][index]))
        uploadedDocuments = uploadedDocuments.concat(draft.data[draftItemName][
          index
        ] as IFileValue[])
    }

    uploadedDocuments = uploadedDocuments.filter(document => {
      const sectionMapping = SECTION_MAPPING[draft.event]
      const sectionTitle = SECTION_TITLE[draft.event]
      // @ts-ignore
      const allowedDocumentType = sectionMapping[activeSection] || []

      if (
        allowedDocumentType.indexOf(document.optionValues[0].toString()) > -1
      ) {
        const title = sectionTitle[activeSection]
        const label = title + ' ' + document.optionValues[1]

        documentOptions.push({
          value: document.data,
          label
        })
        selectOptions.push({
          value: label,
          label
        })
        return true
      }
      return false
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

  userHasValidateScope() {
    if (this.props.scope) {
      return this.props.scope && this.props.scope.includes('validate')
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
                    <RequiredField
                      id={`required_label_${section.id}_${field.name}`}
                    >
                      {intl.formatMessage(
                        errorsOnField[0].message,
                        errorsOnField[0].props
                      )}
                    </RequiredField>
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
                  label: intl.formatMessage(buttonMessages.change),
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
    const isDraft =
      this.props.draft.submissionStatus === SUBMISSION_STATUS.DRAFT

    return (
      <FullBodyContent>
        <Row>
          <StyledColumn>
            <ReviewHeader
              id="review_header"
              logoSource={SEAL_BD_GOVT}
              title={intl.formatMessage(
                dynamicMessages[`${window.config.COUNTRY}GovtName`]
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
              <FormDataHeader>
                {intl.formatMessage(messages.formDataHeader, { isDraft })}
              </FormDataHeader>
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
              <ReviewAction
                completeApplication={isComplete}
                applicationToBeValidated={this.userHasValidateScope()}
                applicationToBeRegistered={this.userHasRegisterScope()}
                alreadyRejectedApplication={
                  this.props.draft.registrationStatus === REJECTED
                }
                draftApplication={isDraft}
                application={draft}
                submitApplicationAction={submitClickEvent}
                rejectApplicationAction={rejectApplicationClickEvent}
              />
            </FormData>
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
