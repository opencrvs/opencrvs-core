import { LinkButton } from '@opencrvs/components/lib/buttons'
import {
  InputField,
  ISelectOption as SelectComponentOptions,
  TextArea
} from '@opencrvs/components/lib/forms'
import {
  DataSection,
  DocumentViewer,
  IDocumentViewerOptions
} from '@opencrvs/components/lib/interface'
import { FullBodyContent } from '@opencrvs/components/lib/layout'
import {
  IApplication,
  IPayload,
  SUBMISSION_STATUS,
  writeApplication
} from '@register/applications'
import { ReviewAction } from '@register/components/form/ReviewActionComponent'
import {
  BirthSection,
  DATE,
  Event,
  IDynamicOptions,
  IFileValue,
  IForm,
  IFormField,
  IFormFieldValue,
  IFormSection,
  IFormSectionData,
  IFormSectionGroup,
  IFormTag,
  IRadioOption,
  ISelectOption,
  LIST,
  PARAGRAPH,
  RADIO_GROUP,
  SEARCH_FIELD,
  Section,
  SELECT_WITH_DYNAMIC_OPTIONS,
  SELECT_WITH_OPTIONS,
  SUBSECTION,
  TEXTAREA,
  WARNING,
  FETCH_BUTTON,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  IFormData
} from '@register/forms'
import {
  getBirthSection,
  getRegisterForm
} from '@register/forms/register/application-selectors'
import {
  birthSectionMapping,
  birthSectionTitle
} from '@register/forms/register/fieldMappings/birth/mutation/documents-mappings'
import {
  deathSectionMapping,
  deathSectionTitle
} from '@register/forms/register/fieldMappings/death/mutation/documents-mappings'
import {
  getConditionalActionsForField,
  getSectionFields,
  getVisibleSectionGroupsBasedOnConditions
} from '@register/forms/utils'
import {
  getValidationErrorsForForm,
  Errors,
  IFieldErrors
} from '@register/forms/validation'
import { buttonMessages } from '@register/i18n/messages'
import { messages } from '@register/i18n/messages/views/review'
import { getLanguage } from '@register/i18n/selectors'
import { getDefaultLanguage } from '@register/i18n/utils'
import { goToPageGroup } from '@register/navigation'
import {
  ILocation,
  IOfflineData,
  OFFLINE_FACILITIES_KEY,
  OFFLINE_LOCATIONS_KEY
} from '@register/offline/reducer'
import { getOfflineData } from '@register/offline/selectors'
import { getScope } from '@register/profile/profileSelectors'
import { IStoreState } from '@register/store'
import styled from '@register/styledComponents'
import { Scope } from '@register/utils/authUtils'
import { isMobileDevice } from '@register/utils/commonUtils'
import { BIRTH, REJECTED } from '@register/utils/constants'
import { formatLongDate } from '@register/utils/date-formatting'
import { getDraftApplicantFullName } from '@register/utils/draftUtils'
import { EditConfirmation } from '@register/views/RegisterForm/review/EditConfirmation'
import { flatten, isArray } from 'lodash'
import * as React from 'react'
import { findDOMNode } from 'react-dom'
import {
  injectIntl,
  IntlShape,
  MessageDescriptor,
  WrappedComponentProps as IntlShapeProps
} from 'react-intl'
import { connect } from 'react-redux'
import { ReviewHeader } from './ReviewHeader'

const RequiredField = styled.span`
  color: ${({ theme }) => theme.colors.error};
  text-transform: lowercase;
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
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    padding: 24px;
  }
`
const FormDataHeader = styled.div`
  ${({ theme }) => theme.fonts.h2Style}
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.h3Style}
  }
`
const InputWrapper = styled.div`
  margin-top: 56px;
`
type onChangeReviewForm = (
  sectionData: IFormSectionData,
  activeSection: IFormSection,
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
  offlineResources: IOfflineData
  language: string
  onChangeReviewForm?: onChangeReviewForm
  writeApplication: typeof writeApplication
  registrationSection: IFormSection
  documentsSection: IFormSection
}
type State = {
  displayEditDialog: boolean
  editClickedSectionId: Section | null
  editClickedSectionGroupId: string
  editClickFieldName?: string
  activeSection: Section | null
}

interface IErrorsBySection {
  [sectionId: string]: Errors
}

type FullProps = IProps & IntlShapeProps

function renderSelectOrRadioLabel(
  value: IFormFieldValue,
  options: Array<ISelectOption | IRadioOption>,
  intl: IntlShape
) {
  const option = options.find(option => option.value === value)
  return option ? intl.formatMessage(option.label) : value
}

export function renderSelectDynamicLabel(
  value: IFormFieldValue,
  options: IDynamicOptions,
  draftData: IFormSectionData,
  intl: IntlShape,
  resources: IOfflineData,
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
        if (language !== getDefaultLanguage()) {
          return selectedLocation.alias
        } else {
          return selectedLocation.name
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
  draftData: IFormData,
  sectionId: string,
  field: IFormField,
  intl: IntlShape,
  offlineResources: IOfflineData,
  language: string
) => {
  const value: IFormFieldValue = draftData[sectionId]
    ? draftData[sectionId][field.name]
    : ''
  if (field.type === SELECT_WITH_OPTIONS && field.options) {
    return renderSelectOrRadioLabel(value, field.options, intl)
  }
  if (
    (field.type === SEARCH_FIELD ||
      field.type === SELECT_WITH_DYNAMIC_OPTIONS) &&
    field.dynamicOptions
  ) {
    const sectionData = draftData[sectionId]
    return renderSelectDynamicLabel(
      value,
      field.dynamicOptions,
      sectionData,
      intl,
      offlineResources,
      language
    )
  }

  if (field.type === DATE && value && typeof value === 'string') {
    return formatLongDate(value)
  }

  if (field.hideValueInPreview) {
    return ''
  }

  if (field.type === RADIO_GROUP) {
    return renderSelectOrRadioLabel(value, field.options, intl)
  }

  if (field.type === RADIO_GROUP_WITH_NESTED_FIELDS) {
    return renderSelectOrRadioLabel(
      (value && (value as IFormSectionData).value) || value,
      field.options,
      intl
    )
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
): IErrorsBySection => {
  return formSections.reduce((sections, section: IFormSection) => {
    const fields: IFormField[] = getSectionFields(
      section,
      draft.data[section.id],
      draft.data
    )

    const errors = getValidationErrorsForForm(
      fields,
      draft.data[section.id] || {},
      undefined,
      draft.data
    )

    return {
      ...sections,
      [section.id]: fields.reduce((fields, field) => {
        // REFACTOR
        const validationErrors: IFieldErrors = errors[
          field.name as keyof typeof errors
        ] as IFieldErrors

        const value = draft.data[section.id]
          ? draft.data[section.id][field.name]
          : null

        const informationMissing =
          validationErrors.errors.length > 0 ||
          value === null ||
          Object.values(validationErrors.nestedFields).some(
            nestedErrors => nestedErrors.length > 0
          )
            ? validationErrors
            : { errors: [], nestedFields: {} }

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
      editClickedSectionGroupId: '',
      editClickFieldName: '',
      editClickedSectionId: null,
      activeSection: null
    }
  }

  componentDidMount() {
    !isMobileDevice() && window.addEventListener('scroll', this.onScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll)
  }

  getVisibleSections = (formSections: IFormSection[]) => {
    const { draft } = this.props
    return formSections.filter(
      section =>
        getVisibleSectionGroupsBasedOnConditions(
          section,
          draft.data[section.id] || {},
          draft.data
        ).length > 0
    )
  }

  getViewableSection = (registerForm: IForm): IFormSection[] => {
    const sections = registerForm.sections.filter(
      ({ id, viewType }) =>
        id !== 'documents' && (viewType === 'form' || viewType === 'hidden')
    )

    return this.getVisibleSections(sections)
  }

  getDocumentSections = (registerForm: IForm): IFormSection[] => {
    const sections = registerForm.sections.filter(
      ({ hasDocumentSection }) => hasDocumentSection
    )

    return this.getVisibleSections(sections)
  }

  docSections = this.getDocumentSections(
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
    activeSection: Section
  ): IDocumentViewerOptions => {
    const { documentsSection } = this.props

    const draftItemName = documentsSection.id
    const documentOptions: SelectComponentOptions[] = []
    const selectOptions: SelectComponentOptions[] = []

    let uploadedDocuments: IFileValue[] = []

    for (let index in draft.data[draftItemName]) {
      if (isArray(draft.data[draftItemName][index])) {
        const newDocuments = (draft.data[draftItemName][
          index
        ] as unknown) as IFileValue[]
        uploadedDocuments = uploadedDocuments.concat(newDocuments)
      }
    }

    uploadedDocuments = uploadedDocuments.filter(document => {
      const sectionMapping = SECTION_MAPPING[draft.event]
      const sectionTitle = SECTION_TITLE[draft.event]

      const allowedDocumentType: string[] =
        sectionMapping[activeSection as keyof typeof sectionMapping] || []

      if (
        allowedDocumentType.indexOf(document.optionValues[0]!.toString()) > -1
      ) {
        const title = sectionTitle[activeSection as keyof typeof sectionMapping]
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
    sectionId: Section | null,
    sectionGroupId: string,
    fieldName?: string
  ) => {
    this.setState(() => ({
      editClickedSectionId: sectionId,
      editClickedSectionGroupId: sectionGroupId,
      editClickFieldName: fieldName
    }))
    this.toggleDisplayDialog()
  }

  editLinkClickHandlerForDraft = (
    sectionId: string,
    groupId: string,
    fieldName: string
  ) => {
    const { draft, pageRoute, writeApplication, goToPageGroup } = this.props
    const application = draft
    application.review = true
    writeApplication(application)
    goToPageGroup(
      pageRoute,
      application.id,
      sectionId,
      groupId,
      application.event.toLowerCase(),
      fieldName
    )
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

  isVisibleField(field: IFormField, section: IFormSection) {
    const { draft, offlineResources } = this.props
    const conditionalActions = getConditionalActionsForField(
      field,
      draft.data[section.id] || {},
      offlineResources,
      draft.data
    )
    return !conditionalActions.includes('hide')
  }

  isViewOnly(field: IFormField) {
    return [LIST, PARAGRAPH, WARNING, TEXTAREA, SUBSECTION, FETCH_BUTTON].find(
      type => type === field.type
    )
  }

  isDraft() {
    return this.props.draft.submissionStatus === SUBMISSION_STATUS.DRAFT
  }

  getFieldValueWithErrorMessage(
    section: IFormSection,
    field: IFormField,
    errorsOnField: any
  ) {
    return (
      <RequiredField id={`required_label_${section.id}_${field.name}`}>
        {field.previewGroup && this.props.intl.formatMessage(field.label) + ' '}
        {this.props.intl.formatMessage(
          errorsOnField.message,
          errorsOnField.props
        )}
      </RequiredField>
    )
  }

  getRenderableField(
    section: IFormSection,
    group: IFormSectionGroup,
    fieldLabel: MessageDescriptor,
    fieldName: string,
    value: IFormFieldValue | JSX.Element | undefined,
    ignoreAction: boolean = false
  ) {
    const { intl } = this.props

    return {
      label: intl.formatMessage(fieldLabel),
      value,
      action: !ignoreAction && {
        id: `btn_change_${section.id}_${fieldName}`,
        label: intl.formatMessage(buttonMessages.change),
        handler: () => {
          if (this.isDraft()) {
            this.editLinkClickHandlerForDraft(section.id, group.id, fieldName)
          } else {
            this.editLinkClickHandler(section.id, group.id, fieldName)
          }
        }
      }
    }
  }

  getValueOrError = (
    section: IFormSection,
    field: IFormField,
    sectionErrors: IErrorsBySection
  ) => {
    const { intl, draft, offlineResources, language } = this.props
    const errorsOnField = sectionErrors[section.id][field.name].errors
    return errorsOnField.length > 0
      ? this.getFieldValueWithErrorMessage(section, field, errorsOnField[0])
      : field.nestedFields
      ? (
          (draft.data[section.id] &&
            draft.data[section.id][field.name] &&
            (draft.data[section.id][field.name] as IFormSectionData).value &&
            field.nestedFields[
              (draft.data[section.id][field.name] as IFormSectionData)
                .value as string
            ]) ||
          []
        ).reduce((groupedValues, nestedField) => {
          const errorsOnNestedField =
            sectionErrors[section.id][field.name].nestedFields[
              nestedField.name
            ] || []
          // Value of the parentField resembles with IFormData as a nested form
          const nestedValue =
            (draft.data[section.id] &&
              draft.data[section.id][field.name] &&
              renderValue(
                draft.data[section.id][field.name] as IFormData,
                'nestedFields',
                nestedField,
                intl,
                offlineResources,
                language
              )) ||
            ''
          return (
            <>
              {groupedValues}
              {(errorsOnNestedField.length > 0 || nestedValue) && <br />}
              {errorsOnNestedField.length > 0
                ? this.getFieldValueWithErrorMessage(
                    section,
                    field,
                    errorsOnNestedField[0]
                  )
                : nestedValue}
            </>
          )
        }, <>{renderValue(draft.data, section.id, field, intl, offlineResources, language)}</>)
      : renderValue(
          draft.data,
          section.id,
          field,
          intl,
          offlineResources,
          language
        )
  }

  getPreviewGroupsField(
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    visitedTags: string[],
    errorsOnFields: IErrorsBySection
  ) {
    if (field.previewGroup && !visitedTags.includes(field.previewGroup)) {
      visitedTags.push(field.previewGroup)

      const baseTag = field.previewGroup
      const taggedFields = group.fields.filter(
        field =>
          this.isVisibleField(field, section) &&
          !this.isViewOnly(field) &&
          field.previewGroup === baseTag
      )

      const tagDef =
        (group.previewGroups &&
          (group.previewGroups.filter(
            previewGroup => previewGroup.id === baseTag
          ) as IFormTag[])) ||
        []
      const values = taggedFields
        .map(field => this.getValueOrError(section, field, errorsOnFields))
        .filter(value => value)

      let completeValue = values[0]
      values.shift()
      values.forEach(
        value =>
          (completeValue = (
            <>
              {completeValue}
              <br />
              {value}
            </>
          ))
      )

      return this.getRenderableField(
        section,
        group,
        (tagDef[0] && tagDef[0].label) || field.label,
        (tagDef[0] && tagDef[0].fieldToRedirect) || field.name,
        completeValue,
        field.readonly
      )
    }
  }

  getSinglePreviewField(
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    sectionErrors: IErrorsBySection
  ) {
    const value = this.getValueOrError(section, field, sectionErrors)

    return this.getRenderableField(
      section,
      group,
      field.label,
      field.name,
      value,
      field.readonly
    )
  }

  transformSectionData = (
    formSections: IFormSection[],
    errorsOnFields: IErrorsBySection
  ) => {
    const { intl, draft } = this.props

    return formSections.map(section => {
      let items: any[] = []
      let visitedTags: string[] = []
      getVisibleSectionGroupsBasedOnConditions(
        section,
        draft.data[section.id] || {},
        draft.data
      ).forEach(group => {
        items = items
          .concat(
            group.fields
              .filter(
                field =>
                  this.isVisibleField(field, section) && !this.isViewOnly(field)
              )
              .map(field => {
                return field.previewGroup
                  ? this.getPreviewGroupsField(
                      section,
                      group,
                      field,
                      visitedTags,
                      errorsOnFields
                    )
                  : this.getSinglePreviewField(
                      section,
                      group,
                      field,
                      errorsOnFields
                    )
              })
          )
          .filter(item => item)
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
      draft: application,
      registerForm,
      rejectApplicationClickEvent,
      submitClickEvent,
      registrationSection,
      documentsSection,
      offlineResources,
      draft: { event }
    } = this.props
    const formSections = this.getViewableSection(registerForm[event])

    const errorsOnFields = getErrorsOnFieldsBySection(formSections, application)

    const isComplete =
      flatten(
        // @ts-ignore
        Object.values(errorsOnFields).map(Object.values)
        // @ts-ignore
      ).filter(errors => errors.errors.length > 0).length === 0

    const textAreaProps = {
      id: 'additional_comments',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        ;(this.props.onChangeReviewForm as onChangeReviewForm)(
          { commentsOrNotes: e.target.value },
          registrationSection,
          application
        )
      },
      value:
        (application.data.registration &&
          application.data.registration.commentsOrNotes) ||
        '',
      ignoreMediaQuery: true
    }

    const sectionName = this.state.activeSection || this.docSections[0].id
    const applicantName = getDraftApplicantFullName(application, intl.locale)
    const draft = this.isDraft()

    return (
      <FullBodyContent>
        <Row>
          <StyledColumn>
            <ReviewHeader
              id="review_header"
              logoSource={offlineResources.assets.logo}
              title={intl.formatMessage(messages.govtName)}
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
                {intl.formatMessage(messages.formDataHeader, {
                  isDraft: draft
                })}
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
                draftApplication={draft}
                application={application}
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
                  application,
                  this.state.activeSection || this.docSections[0].id
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
                        this.state.activeSection!
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
            this.editLinkClickHandlerForDraft(
              this.state.editClickedSectionId!,
              this.state.editClickedSectionGroupId,
              this.state.editClickFieldName!
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
    registrationSection: getBirthSection(state, BirthSection.Registration),
    documentsSection: getBirthSection(state, BirthSection.Documents),
    scope: getScope(state),
    offlineResources: getOfflineData(state),
    language: getLanguage(state)
  }),
  { goToPageGroup, writeApplication }
)(injectIntl(ReviewSectionComp))
