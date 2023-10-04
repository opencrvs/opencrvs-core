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
import {
  LinkButton,
  PrimaryButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import {
  InputField,
  ISelectOption as SelectComponentOptions,
  Text,
  TextArea
} from '@opencrvs/components/lib/'

import { Alert } from '@opencrvs/components/lib/Alert'
import { Accordion } from '@opencrvs/components/lib/Accordion'
import { Link } from '@opencrvs/components/lib/Link'
import {
  DocumentViewer,
  IDocumentViewerOptions
} from '@opencrvs/components/lib/DocumentViewer'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import {
  IDeclaration,
  SUBMISSION_STATUS,
  writeDeclaration
} from '@client/declarations'
import { ReviewAction } from '@client/components/form/ReviewActionComponent'
import {
  CHECKBOX,
  CHECKBOX_GROUP,
  DATE,
  DOCUMENT_UPLOADER_WITH_OPTION,
  FETCH_BUTTON,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  IAttachmentValue,
  ICheckboxFormField,
  ICheckboxGroupFormField,
  IDocumentUploaderWithOptionsFormField,
  IDynamicOptions,
  IFileValue,
  IForm,
  IFormData,
  IFormField,
  IFormFieldValue,
  IFormSection,
  IFormSectionData,
  IFormSectionGroup,
  INestedInputFields,
  IPreviewGroup,
  IRadioOption,
  ISelectOption,
  BULLET_LIST,
  LOCATION_SEARCH_INPUT,
  PARAGRAPH,
  RADIO_GROUP,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  REVIEW_OVERRIDE_POSITION,
  SELECT_WITH_DYNAMIC_OPTIONS,
  SELECT_WITH_OPTIONS,
  SubmissionAction,
  NID_VERIFICATION_BUTTON,
  WARNING,
  SUBSECTION_HEADER,
  DIVIDER,
  HIDDEN
} from '@client/forms'
import { Event } from '@client/utils/gateway'
import {
  getBirthSection,
  getRegisterForm
} from '@client/forms/register/declaration-selectors'
import {
  getConditionalActionsForField,
  getListOfLocations,
  getSectionFields,
  getVisibleSectionGroupsBasedOnConditions
} from '@client/forms/utils'
import {
  Errors,
  getValidationErrorsForForm,
  IFieldErrors
} from '@client/forms/validation'
import {
  buttonMessages,
  constantsMessages,
  formMessageDescriptors
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/review'
import { getLanguage } from '@client/i18n/selectors'
import { getDefaultLanguage } from '@client/i18n/utils'
import { goToPageGroup } from '@client/navigation'
import {
  ILocation,
  IOfflineData,
  OFFLINE_FACILITIES_KEY,
  OFFLINE_LOCATIONS_KEY
} from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { getScope } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import styled from 'styled-components'
import { Scope } from '@client/utils/authUtils'
import { ACCUMULATED_FILE_SIZE, REJECTED } from '@client/utils/constants'
import { formatLongDate } from '@client/utils/date-formatting'
import { getDraftInformantFullName } from '@client/utils/draftUtils'
import { camelCase, clone, flatten, flattenDeep, get, isArray } from 'lodash'
import {
  injectIntl,
  IntlShape,
  MessageDescriptor,
  WrappedComponentProps as IntlShapeProps
} from 'react-intl'
import { connect } from 'react-redux'
import { ReviewHeader } from './ReviewHeader'
import { IValidationResult } from '@client/utils/validate'
import { DocumentListPreview } from '@client/components/form/DocumentUploadfield/DocumentListPreview'
import { DocumentPreview } from '@client/components/form/DocumentUploadfield/DocumentPreview'
import { generateLocations } from '@client/utils/locationUtils'
import {
  addressFieldNames,
  bytesToSize,
  isCorrection,
  isFileSizeExceeded
} from '@client/views/CorrectionForm/utils'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { DuplicateWarning } from '@client/views/Duplicates/DuplicateWarning'
import { VerificationButton } from '@opencrvs/components/lib/VerificationButton'
import {
  SignatureGenerator,
  SignatureInputProps
} from '@client/views/RegisterForm/review/SignatureGenerator'
import { DuplicateForm } from '@client/views/RegisterForm/duplicate/DuplicateForm'
import { Button } from '@opencrvs/components/lib/Button'
import { UserDetails } from '@client/utils/userUtils'

const Deleted = styled.del`
  color: ${({ theme }) => theme.colors.negative};
`
export const RequiredField = styled.span`
  color: ${({ theme }) => theme.colors.negative};
  display: inline-block;
  text-transform: lowercase;

  &::first-letter {
    text-transform: uppercase;
  }
`

const ErrorField = styled.p`
  margin-top: 0;
  margin-bottom: 0;
`

const Row = styled.div<{
  position?: 'left' | 'center'
  background?: 'white' | 'background'
}>`
  display: flex;
  gap: 24px;
  width: 100%;
  justify-content: ${({ position }) => position || 'center'};
  background-color: ${({ theme, background }) =>
    !background || background === 'background'
      ? theme.colors.background
      : theme.colors.white};
  flex-direction: row;
  padding: 24px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0;
  }
`
const Wrapper = styled.div``

const RightColumn = styled.div`
  width: 40%;
  border-radius: 4px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const LeftColumn = styled.div`
  flex-grow: 1;
  max-width: 840px;
  overflow: hidden;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    border: 0;
    margin: 0;
  }
`

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 4px;
  margin-bottom: 40px;
  &:last-child {
    margin-bottom: 200px;
  }
`

export const ZeroDocument = styled.div`
  ${({ theme }) => theme.fonts.bold16};
  height: 700px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const ResponsiveDocumentViewer = styled.div<{ isRegisterScope: boolean }>`
  position: fixed;
  width: calc(40% - 24px);
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: ${({ isRegisterScope }) => (isRegisterScope ? 'block' : 'none')};
    margin-bottom: 11px;
  }
`

const FooterArea = styled.div`
  padding: 24px;
`

const FormData = styled.div`
  padding-top: 24px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 24px;
  }
`
const ReviewContainter = styled.div<{ paddingT?: boolean }>`
  padding: ${({ paddingT }) => (paddingT ? '32px 32px 0 32px' : '0px 32px')};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0px 24px;
  }
`
const StyledAlert = styled(Alert)`
  margin-top: 24px;
`
const DeclarationDataContainer = styled.div``

const Label = styled.span`
  ${({ theme }) => theme.fonts.bold16};
`
const StyledLabel = styled.span`
  ${({ theme }) => theme.fonts.h3}
`
const Value = styled.span`
  ${({ theme }) => theme.fonts.reg16}
`

const DocumentListPreviewContainer = styled.div`
  display: block;
`

type onChangeReviewForm = (
  sectionData: IFormSectionData,
  activeSection: IFormSection,
  declaration: IDeclaration
) => void

interface IProps {
  draft: IDeclaration
  registerForm: { [key: string]: IForm }
  pageRoute: string
  rejectDeclarationClickEvent?: () => void
  goToPageGroup: typeof goToPageGroup
  submitClickEvent: (
    declaration: IDeclaration,
    submissionStatus: string,
    action: SubmissionAction
  ) => void
  scope: Scope | null
  offlineCountryConfiguration: IOfflineData
  language: string
  onChangeReviewForm?: onChangeReviewForm
  onContinue?: () => void
  writeDeclaration: typeof writeDeclaration
  registrationSection: IFormSection
  documentsSection: IFormSection
  userDetails?: UserDetails | null
  viewRecord?: boolean
  reviewSummaryHeader?: React.ReactNode
}

type State = {
  displayEditDialog: boolean
  editClickedSectionId: string
  editClickedSectionGroupId: string
  editClickFieldName: string
  previewImage: IFileValue | null
}

export interface IErrorsBySection {
  [sectionId: string]: Errors
}

type FullProps = IProps & IntlShapeProps

function renderSelectOrRadioLabel(
  value: IFormFieldValue,
  options: Array<ISelectOption | IRadioOption>,
  intl: IntlShape
) {
  const option = options.find((option) => option.value === value)
  return option?.label ? intl.formatMessage(option.label) : value
}

export function renderSelectDynamicLabel(
  value: IFormFieldValue,
  options: IDynamicOptions,
  draftData: IFormSectionData,
  intl: IntlShape,
  offlineCountryConfig: IOfflineData,
  language: string
) {
  if (!options.resource) {
    const dependency = options.dependency
      ? draftData[options.dependency]
      : false
    const selectedOption = dependency
      ? options.options &&
        options.options[dependency.toString()].find(
          (option) => option.value === value
        )
      : false
    return selectedOption ? intl.formatMessage(selectedOption.label) : value
  } else {
    if (options.resource) {
      let selectedLocation: ILocation
      const locationId = value as string
      // HOTFIX for handling international address
      if (options.resource === 'locations') {
        selectedLocation = offlineCountryConfig[OFFLINE_LOCATIONS_KEY][
          locationId
        ] || { name: locationId, alias: locationId }
      } else {
        selectedLocation =
          offlineCountryConfig[OFFLINE_FACILITIES_KEY][locationId]
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

const getCheckboxFieldValue = (
  field: ICheckboxFormField,
  value: string,
  intl: IntlShape
) => {
  const { checkedValue = true } = field
  return intl.formatMessage(
    value === String(checkedValue)
      ? formMessageDescriptors.confirm
      : formMessageDescriptors.deny
  )
}

const getCheckBoxGroupFieldValue = (
  field: ICheckboxGroupFormField,
  value: string[],
  intl: IntlShape
) => {
  const option = field.options.find((option) => {
    return value.length > 0 && option.value === value[0]
  })
  if (option) {
    return intl.formatMessage(option.label)
  }
  return ''
}

const getFormFieldValue = (
  draftData: IFormData,
  sectionId: string,
  field: IFormField
): IFormFieldValue => {
  const sectionDraftData = draftData[sectionId] || {}
  if (field.name in sectionDraftData) {
    return sectionDraftData[field.name]
  }

  let tempField: IFormField
  for (const key in sectionDraftData) {
    tempField = sectionDraftData[key] as IFormField
    if (tempField?.nestedFields?.[field.name]) {
      return tempField.nestedFields[field.name] as IFormFieldValue
    }
  }
  return ''
}

const renderValue = (
  draftData: IFormData,
  sectionId: string,
  field: IFormField,
  intl: IntlShape,
  offlineCountryConfiguration: IOfflineData,
  language: string,
  isOriginalData = false
) => {
  const value: IFormFieldValue = getFormFieldValue(draftData, sectionId, field)
  const isAddressField = addressFieldNames.some((fieldName) =>
    field.name.includes(fieldName)
  )

  // Showing State & District Name instead of their ID
  if (isAddressField && isOriginalData) {
    const sectionData = draftData[sectionId]

    if (
      sectionData[camelCase(`countryPrimary ${sectionId}`)] ===
      window.config.COUNTRY
    ) {
      const dynamicOption: IDynamicOptions = {
        resource: 'locations',
        initialValue: 'agentDefault'
      }
      dynamicOption.dependency = [
        'internationalStatePrimary',
        'statePrimary'
      ].some((f) => field.name.includes(f))
        ? camelCase(`countryPrimary ${sectionId}`)
        : camelCase(`statePrimary ${sectionId}`)

      return renderSelectDynamicLabel(
        value,
        dynamicOption,
        sectionData,
        intl,
        offlineCountryConfiguration,
        language
      )
    }

    if (
      sectionData[camelCase(`countrySecondary ${sectionId}`)] ===
      window.config.COUNTRY
    ) {
      const dynamicOption: IDynamicOptions = {
        resource: 'locations',
        initialValue: 'agentDefault'
      }
      dynamicOption.dependency = [
        'internationalStateSecondary',
        'stateSecondary'
      ].some((f) => field.name.includes(f))
        ? camelCase(`countrySecondary ${sectionId}`)
        : camelCase(`stateSecondary ${sectionId}`)

      return renderSelectDynamicLabel(
        value,
        dynamicOption,
        sectionData,
        intl,
        offlineCountryConfiguration,
        language
      )
    }

    return value
  }
  if (field.type === SELECT_WITH_OPTIONS && field.options) {
    return renderSelectOrRadioLabel(value, field.options, intl)
  }
  if (field.type === SELECT_WITH_DYNAMIC_OPTIONS && field.dynamicOptions) {
    const sectionData = draftData[sectionId]
    return renderSelectDynamicLabel(
      value,
      field.dynamicOptions,
      sectionData,
      intl,
      offlineCountryConfiguration,
      language
    )
  }

  if (
    (field.type === DATE ||
      (field.type === FIELD_WITH_DYNAMIC_DEFINITIONS &&
        field.dynamicDefinitions.type &&
        field.dynamicDefinitions.type.kind === 'static' &&
        field.dynamicDefinitions.type.staticType === DATE)) &&
    value &&
    typeof value === 'string'
  ) {
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
      (value && (value as IFormSectionData).value) || '',
      field.options,
      intl
    )
  }

  if (field.type === CHECKBOX) {
    return getCheckboxFieldValue(field, String(value), intl)
  }

  if (value && field.type === CHECKBOX_GROUP) {
    return getCheckBoxGroupFieldValue(field, value as string[], intl)
  }

  if (value && field.type === LOCATION_SEARCH_INPUT) {
    const searchableListOfLocations = generateLocations(
      field.searchableResource.reduce((locations, resource) => {
        return {
          ...locations,
          ...getListOfLocations(offlineCountryConfiguration, resource)
        }
      }, {}),
      intl
    )
    const selectedLocation = searchableListOfLocations.find(
      (location) => location.id === value
    )
    return (selectedLocation && selectedLocation.displayLabel) || ''
  }
  if (field.type === NID_VERIFICATION_BUTTON) {
    return (
      <VerificationButton
        onClick={() => {}}
        labelForVerified={intl.formatMessage(
          formMessageDescriptors.nidVerified
        )}
        labelForUnverified={intl.formatMessage(
          formMessageDescriptors.nidNotVerified
        )}
        labelForOffline={intl.formatMessage(formMessageDescriptors.nidOffline)}
        reviewLabelForUnverified={intl.formatMessage(
          formMessageDescriptors.nidNotVerifiedReviewSection
        )}
        status={value ? 'verified' : 'unverified'}
        useAsReviewLabel={true}
      />
    )
  }

  if (typeof value === 'boolean') {
    return value
      ? intl.formatMessage(buttonMessages.yes)
      : intl.formatMessage(buttonMessages.no)
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return field.postfix
      ? String(value).concat(` ${field.postfix.toLowerCase()}`)
      : field.unit
      ? String(value).concat(intl.formatMessage(field.unit))
      : value
  }

  return value
}

export const getErrorsOnFieldsBySection = (
  formSections: IFormSection[],
  offlineCountryConfig: IOfflineData,
  draft: IDeclaration
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
      offlineCountryConfig,
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
            (nestedErrors) => nestedErrors.length > 0
          )
            ? validationErrors
            : { errors: [], nestedFields: {} }

        return { ...fields, [field.name]: informationMissing }
      }, {})
    }
  }, {})
}

enum SignatureSectionType {
  INFORMANT_SIGNATURE = 'informantsSignature',
  BRIDE_SIGNATURE = 'brideSignature',
  GROOM_SIGNATURE = 'groomSignature',
  WITNESS_ONE_SIGNATURE = 'witnessOneSignature',
  WITNESS_TWO_SIGNATURE = 'witnessTwoSignature'
}

class ReviewSectionComp extends React.Component<FullProps, State> {
  hasChangesBeenMade = false

  constructor(props: FullProps) {
    super(props)

    this.state = {
      displayEditDialog: false,
      editClickedSectionGroupId: '',
      editClickFieldName: '',
      editClickedSectionId: '',
      previewImage: null
    }
  }

  UNSAFE_componentWillUpdate() {
    this.hasChangesBeenMade = false
  }

  getVisibleSections = (formSections: IFormSection[]) => {
    const { draft, userDetails } = this.props

    return formSections.filter(
      (section) =>
        getVisibleSectionGroupsBasedOnConditions(
          section,
          draft.data[section.id] || {},
          draft.data,
          userDetails
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

  getLabelForDoc = (docForWhom: string, docType: string) => {
    const { intl } = this.props
    const documentSection = this.props.registerForm[
      this.props.draft.event
    ].sections.find((section) => section.id === 'documents')
    const docSectionFields = documentSection && documentSection.groups[0].fields
    const docFieldsWithOptions =
      docSectionFields &&
      (docSectionFields.filter(
        (field) =>
          field.extraValue && field.type === DOCUMENT_UPLOADER_WITH_OPTION
      ) as IDocumentUploaderWithOptionsFormField[])
    const matchedField = docFieldsWithOptions?.find(
      (field) => field.extraValue === docForWhom
    )
    const matchedOption = matchedField?.options.find(
      (option) => option.value === docType
    )
    return (
      matchedField &&
      matchedOption &&
      intl.formatMessage(matchedField.label) +
        ' (' +
        intl.formatMessage(matchedOption.label) +
        ')'
    )
  }
  getAllAttachmentInPreviewList = (declaration: IDeclaration) => {
    const options = this.prepSectionDocOptions(declaration)

    return (
      <DocumentListPreviewContainer>
        <DocumentListPreview
          id="all_attachment_list"
          documents={options.uploadedDocuments}
          onSelect={this.selectForPreview}
          dropdownOptions={options.selectOptions}
          inReviewSection={true}
        />
      </DocumentListPreviewContainer>
    )
  }

  prepSectionDocOptions = (
    draft: IDeclaration
  ): IDocumentViewerOptions & {
    uploadedDocuments: IFileValue[]
  } => {
    let selectOptions: SelectComponentOptions[] = []
    let documentOptions: SelectComponentOptions[] = []
    let uploadedDocuments: IFileValue[] = []

    const prepDocumentOption = this.prepSectionDocuments(draft)
    selectOptions = [...selectOptions, ...prepDocumentOption.selectOptions]
    documentOptions = [
      ...documentOptions,
      ...prepDocumentOption.documentOptions
    ]
    uploadedDocuments = [
      ...uploadedDocuments,
      ...prepDocumentOption.uploadedDocuments
    ]
    return { selectOptions, documentOptions, uploadedDocuments }
  }

  prepSectionDocuments = (
    draft: IDeclaration
  ): IDocumentViewerOptions & { uploadedDocuments: IFileValue[] } => {
    const { documentsSection } = this.props

    const draftItemName = documentsSection.id
    const documentOptions: SelectComponentOptions[] = []
    const selectOptions: SelectComponentOptions[] = []

    let uploadedDocuments: IFileValue[] = []

    for (const index in draft.data[draftItemName]) {
      if (isArray(draft.data[draftItemName][index])) {
        const newDocuments = draft.data[draftItemName][
          index
        ] as unknown as IFileValue[]
        uploadedDocuments = uploadedDocuments.concat(newDocuments)
      }
    }

    uploadedDocuments = uploadedDocuments.filter((document) => {
      const label =
        this.getLabelForDoc(
          document.optionValues[0] as string,
          document.optionValues[1] as string
        ) || (document.optionValues[1] as string)

      /**
       * Skip insertion if the value already exist
       */
      if (selectOptions.findIndex((elem) => elem.value === label) > -1) {
        return true
      }

      documentOptions.push({
        value: document.data,
        label
      })
      selectOptions.push({
        value: label,
        label
      })
      return true
    })

    return {
      selectOptions,
      documentOptions,
      uploadedDocuments
    }
  }

  toggleDisplayDialog = () => {
    this.setState((prevState) => ({
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

  editLinkClickHandlerForDraft = (
    sectionId: string,
    groupId: string,
    fieldName?: string
  ) => {
    const { draft, pageRoute, goToPageGroup } = this.props
    const declaration = draft
    declaration.review = true
    goToPageGroup(
      pageRoute,
      declaration.id,
      sectionId,
      groupId,
      declaration.event.toLowerCase(),
      fieldName
    )
  }

  replaceHandler(sectionId: string, groupId: string) {
    const { draft, pageRoute, writeDeclaration, goToPageGroup } = this.props
    const declaration = draft
    declaration.data[sectionId] = {}
    writeDeclaration(declaration)
    goToPageGroup(
      pageRoute,
      declaration.id,
      sectionId,
      groupId,
      declaration.event.toLowerCase()
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
    const { draft, offlineCountryConfiguration } = this.props

    if (field.type === HIDDEN) {
      return false
    }

    const conditionalActions = getConditionalActionsForField(
      field,
      draft.data[section.id] || {},
      offlineCountryConfiguration,
      draft.data
    )
    return (
      !conditionalActions.includes('hide') &&
      !conditionalActions.includes('hideInPreview')
    )
  }

  isViewOnly(field: IFormField) {
    return [BULLET_LIST, PARAGRAPH, WARNING, DIVIDER, FETCH_BUTTON].find(
      (type) => type === field.type
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
        {field.ignoreFieldLabelOnErrorMessage ||
          (field.previewGroup &&
            this.props.intl.formatMessage(field.label) + ' ')}
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
    ignoreAction = false
  ) {
    const { draft: declaration, intl } = this.props

    return {
      label: intl.formatMessage(fieldLabel),
      type: group.fields.find((field) => field.name === fieldName)?.type,
      value,
      action: !ignoreAction && {
        id: `btn_change_${section.id}_${fieldName}`,
        label: intl.formatMessage(buttonMessages.change),
        handler: () => {
          if (this.isDraft() || isCorrection(declaration)) {
            this.editLinkClickHandlerForDraft(section.id, group.id, fieldName)
          } else {
            this.editLinkClickHandler(section.id, group.id, fieldName)
          }
        }
      }
    }
  }

  getErrorForNestedField(
    section: IFormSection,
    field: IFormField,
    sectionErrors: IErrorsBySection
  ): IValidationResult[] {
    for (const key in sectionErrors[section.id]) {
      return sectionErrors[section.id][key].nestedFields[field.name] || []
    }
    return []
  }

  getValueOrError = (
    section: IFormSection,
    data: IFormData,
    field: IFormField,
    sectionErrors: IErrorsBySection,
    ignoreNestedFieldWrapping?: boolean,
    replaceEmpty?: boolean,
    isOriginalData?: boolean
  ) => {
    const { intl, offlineCountryConfiguration, language } = this.props

    let value = renderValue(
      data,
      section.id,
      field,
      intl,
      offlineCountryConfiguration,
      language,
      isOriginalData
    )

    if (replaceEmpty && !value) {
      value = '-'
    }
    const errorsOnField =
      get(sectionErrors[section.id][field.name], 'errors') ||
      this.getErrorForNestedField(section, field, sectionErrors)

    return errorsOnField.length > 0 ? (
      <ErrorField>
        {this.getFieldValueWithErrorMessage(section, field, errorsOnField[0])}
      </ErrorField>
    ) : field.nestedFields && !Boolean(ignoreNestedFieldWrapping) ? (
      (
        (data[section.id] &&
          data[section.id][field.name] &&
          (data[section.id][field.name] as IFormSectionData).value &&
          field.nestedFields[
            (data[section.id][field.name] as IFormSectionData).value as string
          ]) ||
        []
      ).reduce((groupedValues, nestedField) => {
        const errorsOnNestedField =
          sectionErrors[section.id][field.name].nestedFields[
            nestedField.name
          ] || []
        // Value of the parentField resembles with IFormData as a nested form
        const nestedValue =
          (data[section.id] &&
            data[section.id][field.name] &&
            renderValue(
              data[section.id][field.name] as IFormData,
              'nestedFields',
              nestedField,
              intl,
              offlineCountryConfiguration,
              language,
              isOriginalData
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
      }, <>{value}</>)
    ) : (
      <>{value}</>
    )
  }

  getNestedFieldValueOrError = (
    section: IFormSection,
    nestSectionData: IFormData,
    nestedField: IFormField,
    parentFieldErrors: IFieldErrors
  ) => {
    const { intl, offlineCountryConfiguration, language } = this.props
    const errorsOnNestedField =
      parentFieldErrors.nestedFields[nestedField.name] || []

    return (
      <>
        {errorsOnNestedField.length > 0
          ? this.getFieldValueWithErrorMessage(
              section,
              nestedField,
              errorsOnNestedField[0]
            )
          : renderValue(
              nestSectionData,
              'nestedFields',
              nestedField,
              intl,
              offlineCountryConfiguration,
              language
            )}
      </>
    )
  }

  getPreviewGroupsField(
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    visitedTags: string[],
    errorsOnFields: IErrorsBySection,
    data: IFormSectionData,
    originalData?: IFormSectionData
  ) {
    const { draft } = this.props

    if (field.previewGroup && !visitedTags.includes(field.previewGroup)) {
      visitedTags.push(field.previewGroup)

      const baseTag = field.previewGroup
      const taggedFields: IFormField[] = []
      group.fields.forEach((field) => {
        if (this.isVisibleField(field, section) && !this.isViewOnly(field)) {
          if (field.previewGroup === baseTag) {
            taggedFields.push(field)
          }
          for (const index in field.nestedFields) {
            field.nestedFields[index].forEach((tempField) => {
              if (
                this.isVisibleField(tempField, section) &&
                !this.isViewOnly(tempField) &&
                tempField.previewGroup === baseTag
              ) {
                taggedFields.push(tempField)
              }
            })
          }
        }
      })

      const tagDef =
        (group.previewGroups &&
          (group.previewGroups.filter(
            (previewGroup) => previewGroup.id === baseTag
          ) as IPreviewGroup[])) ||
        []
      const values = taggedFields
        .map((field) =>
          this.getValueOrError(section, draft.data, field, errorsOnFields)
        )
        .filter((value) => value)
      let completeValue = values[0]
      values.shift()
      values.forEach(
        (value) =>
          (completeValue = (
            <>
              {completeValue}
              {tagDef[0] && tagDef[0].delimiter ? (
                <span>{tagDef[0].delimiter}</span>
              ) : (
                <br />
              )}
              {value}
            </>
          ))
      )

      const hasErrors = taggedFields.reduce(
        (accum, field) =>
          accum || this.fieldHasErrors(section, field, errorsOnFields),
        false
      )

      const hasAnyFieldChanged = taggedFields.reduce(
        (accum, field) =>
          accum || this.hasFieldChanged(field, data, originalData),
        false
      )

      const draftOriginalData = draft.originalData
      if (draftOriginalData && hasAnyFieldChanged && !hasErrors) {
        const previousValues = taggedFields
          .map((field, index) =>
            this.getValueOrError(
              section,
              draftOriginalData,
              field,
              errorsOnFields,
              undefined,
              !index,
              true
            )
          )
          .filter((value) => value)
        let previousCompleteValue = <Deleted>{previousValues[0]}</Deleted>
        previousValues.shift()
        previousValues.forEach(
          (previousValue) =>
            (previousCompleteValue = (
              <>
                {previousCompleteValue}
                {tagDef[0].delimiter ? (
                  <span>{tagDef[0].delimiter}</span>
                ) : (
                  <br />
                )}
                <Deleted>{previousValue}</Deleted>
              </>
            ))
        )

        completeValue = (
          <>
            {previousCompleteValue}
            <br />
            {completeValue}
          </>
        )
      }

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

  hasNestedDataChanged(
    nestedFieldData: IFormData,
    previousNestedFieldData: IFormData
  ) {
    if (nestedFieldData.value === previousNestedFieldData.value) {
      for (const key in nestedFieldData.nestedFields) {
        if (
          !previousNestedFieldData.nestedFields[key] &&
          nestedFieldData.nestedFields[key] === ''
        ) {
          continue
        }
        if (
          nestedFieldData.nestedFields[key] !==
          previousNestedFieldData.nestedFields[key]
        ) {
          this.hasChangesBeenMade = true
          return true
        }
      }
      return false
    }
    this.hasChangesBeenMade = true
    return true
  }

  fieldHasErrors(
    section: IFormSection,
    field: IFormField,
    sectionErrors: IErrorsBySection
  ) {
    if (
      (
        get(sectionErrors[section.id][field.name], 'errors') ||
        this.getErrorForNestedField(section, field, sectionErrors)
      ).length > 0
    ) {
      return true
    }
    return false
  }

  hasFieldChanged(
    field: IFormField,
    data: IFormSectionData,
    originalData?: IFormSectionData
  ) {
    if (!originalData) return false
    if (data[field.name] && (data[field.name] as IFormData).value) {
      return this.hasNestedDataChanged(
        data[field.name] as IFormData,
        originalData[field.name] as IFormData
      )
    }
    /*
     * data section might have some values as empty string
     * whereas original data section have them as undefined
     */
    if (!originalData[field.name] && data[field.name] === '') {
      return false
    }

    const hasChanged = data[field.name] !== originalData[field.name]
    this.hasChangesBeenMade = this.hasChangesBeenMade || hasChanged
    return hasChanged
  }

  getSinglePreviewField(
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    sectionErrors: IErrorsBySection,
    ignoreNestedFieldWrapping?: boolean
  ) {
    const {
      draft: { data, originalData }
    } = this.props

    let value = this.getValueOrError(
      section,
      data,
      field,
      sectionErrors,
      ignoreNestedFieldWrapping
    )

    if (
      originalData &&
      this.hasFieldChanged(field, data[section.id], originalData[section.id]) &&
      !this.fieldHasErrors(section, field, sectionErrors)
    ) {
      value = (
        <>
          <Deleted>
            {this.getValueOrError(
              section,
              originalData,
              field,
              sectionErrors,
              ignoreNestedFieldWrapping,
              true
            )}
          </Deleted>
          <br />
          {value}
        </>
      )
    }

    return this.getRenderableField(
      section,
      group,
      field.label,
      field.name,
      value,
      field.readonly
    )
  }

  getNestedPreviewField(
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    sectionErrors: IErrorsBySection
  ) {
    const { draft } = this.props
    const visitedTags: string[] = []
    const nestedItems: any[] = []
    // parent field
    nestedItems.push(
      this.getSinglePreviewField(section, group, field, sectionErrors, true)
    )
    ;(
      (field.nestedFields &&
        draft.data[section.id] &&
        draft.data[section.id][field.name] &&
        (draft.data[section.id][field.name] as IFormSectionData).value &&
        field.nestedFields[
          (draft.data[section.id][field.name] as IFormSectionData)
            .value as string
        ]) ||
      []
    ).forEach((nestedField) => {
      if (nestedField.previewGroup) {
        nestedItems.push(
          this.getPreviewGroupsField(
            section,
            group,
            nestedField,
            visitedTags,
            sectionErrors,
            (draft.data[section.id][field.name] as IFormData).nestedFields,
            (draft.originalData &&
              (draft.originalData[section.id][field.name] as IFormData)
                .nestedFields) ||
              undefined
          )
        )
      } else {
        nestedItems.push(
          this.getRenderableField(
            section,
            group,
            nestedField.label,
            nestedField.name,
            this.getNestedFieldValueOrError(
              section,
              draft.data[section.id][field.name] as IFormData,
              nestedField,
              sectionErrors[section.id][field.name]
            ),
            nestedField.readonly
          )
        )
      }
    })
    return nestedItems
  }

  getOverriddenFieldsListForPreview(
    formSections: IFormSection[]
  ): IFormField[] {
    const overriddenFields = formSections
      .map((section) => {
        return section.groups
          .map((group) => {
            return group.fields
              .map((field) => {
                const { draft, offlineCountryConfiguration } = this.props
                const tempField = clone(field)
                const residingSection =
                  get(field.reviewOverrides, 'residingSection') || ''
                tempField.conditionals =
                  get(field.reviewOverrides, 'conditionals') ||
                  field.conditionals ||
                  []

                const isVisible = !getConditionalActionsForField(
                  tempField,
                  draft.data[residingSection] || {},
                  offlineCountryConfiguration,
                  draft.data
                ).includes('hide')

                return isVisible ? field : ({} as IFormField)
              })
              .filter((field) => !Boolean(field.hideInPreview))
              .filter((field) => Boolean(field.reviewOverrides))
              .filter((field) => this.isVisibleField(field, section))
          })
          .filter((item) => item.length)
      })
      .filter((item) => item.length)
    return flattenDeep(overriddenFields)
  }

  getOverRiddenPreviewField(
    section: IFormSection,
    group: IFormSectionGroup,
    overriddenField: IFormField,
    sectionErrors: IErrorsBySection,
    field: IFormField,
    items: any[],
    item: any
  ) {
    overriddenField.label =
      get(overriddenField, 'reviewOverrides.labelAs') || overriddenField.label
    const residingSectionId = get(
      overriddenField,
      'reviewOverrides.residingSection'
    )
    const residingSection = this.props.registerForm.death.sections.find(
      (section) => section.id === residingSectionId
    ) as IFormSection

    const result = this.getSinglePreviewField(
      residingSection,
      group,
      overriddenField,
      sectionErrors
    )

    const { sectionID, groupID, fieldName } =
      overriddenField!.reviewOverrides!.reference
    if (
      sectionID === section.id &&
      groupID === group.id &&
      fieldName === field.name
    ) {
      if (
        overriddenField!.reviewOverrides!.position ===
        REVIEW_OVERRIDE_POSITION.BEFORE
      ) {
        items = items.concat(result)
        items = items.concat(item)
      } else {
        items = items.concat(item)
        items = items.concat(result)
      }
      return items
    }

    items = items.concat(item)
    return items
  }

  selectForPreview = (previewImage: IFileValue | IAttachmentValue) => {
    this.setState({ previewImage: previewImage as IFileValue })
  }

  closePreviewSection = (callBack?: () => void) => {
    if (typeof callBack === 'function') {
      this.setState({ previewImage: null }, callBack)
    } else {
      this.setState({ previewImage: null })
    }
  }

  removeAttachmentFromDraft = (file: IFileValue | IAttachmentValue) => {
    const { documentsSection, draft, onChangeReviewForm } = this.props
    if (onChangeReviewForm) {
      const documentsSectionAllFields = flatten(
        documentsSection.groups.map((group) => group.fields)
      ).filter(
        (field) =>
          field.extraValue && field.type === DOCUMENT_UPLOADER_WITH_OPTION
      )

      const fieldToUpdate = (
        documentsSectionAllFields.find(
          (field) => field.extraValue === (file as IFileValue).optionValues[0]
        ) as IDocumentUploaderWithOptionsFormField
      ).name

      const updatedValue = (
        draft.data[documentsSection.id][fieldToUpdate] as IFileValue[]
      ).filter(
        (eachFile) =>
          eachFile.optionValues[1] !== (file as IFileValue).optionValues[1]
      )

      onChangeReviewForm(
        { [fieldToUpdate]: updatedValue },
        documentsSection,
        draft
      )
    }
  }

  onDelete = (file: IFileValue | IAttachmentValue) => {
    this.closePreviewSection(() => this.removeAttachmentFromDraft(file))
  }

  shouldShowChangeAll = (section: IFormSection) => {
    const {
      draft: { data, event, duplicates },
      viewRecord
    } = this.props

    if (
      viewRecord ||
      (Boolean(duplicates) && !isCorrection(this.props.draft))
    ) {
      return false
    }
    return (
      event === Event.Birth &&
      ((section.id === 'mother' && !!data.mother?.detailsExist) ||
        (section.id === 'father' && !!data.father?.detailsExist))
    )
  }

  isLastNameFirst = () => {
    const { registerForm, draft: declaration } = this.props
    const fields = registerForm[declaration.event].sections.find((section) =>
      declaration.event === Event.Birth
        ? section.id === 'child'
        : section.id === 'deceased'
    )?.groups[0]?.fields
    if (!fields) return false
    return (
      fields.findIndex((field) => field.name === 'familyNameEng') <
      fields.findIndex((field) => field.name === 'firstNamesEng')
    )
  }

  transformSectionData = (
    formSections: IFormSection[],
    errorsOnFields: IErrorsBySection,
    offlineCountryConfiguration: IOfflineData,
    declaration: IDeclaration
  ) => {
    const { intl, draft } = this.props
    const overriddenFields =
      this.getOverriddenFieldsListForPreview(formSections)
    let tempItem: any
    return formSections.map((section) => {
      let items: any[] = []
      const visitedTags: string[] = []
      const visibleGroups = getVisibleSectionGroupsBasedOnConditions(
        section,
        draft.data[section.id] || {},
        draft.data
      )
      visibleGroups.forEach((group) => {
        group.fields
          .filter(
            (field) =>
              this.isVisibleField(field, section) && !this.isViewOnly(field)
          )
          .filter((field) => !Boolean(field.hideInPreview))
          .filter((field) => !Boolean(field.reviewOverrides))
          .forEach((field) => {
            const fieldDisabled = getConditionalActionsForField(
              field,
              draft.data[section.id] || {},
              offlineCountryConfiguration,
              draft.data
            )

            tempItem = field.previewGroup
              ? this.getPreviewGroupsField(
                  section,
                  group,
                  field,
                  visitedTags,
                  errorsOnFields,
                  draft.data[section.id],
                  (draft.originalData && draft.originalData[section.id]) ||
                    undefined
                )
              : field.nestedFields && field.ignoreNestedFieldWrappingInPreview
              ? this.getNestedPreviewField(
                  section,
                  group,
                  field,
                  errorsOnFields
                )
              : this.getSinglePreviewField(
                  section,
                  group,
                  field,
                  errorsOnFields
                )
            if (fieldDisabled.includes('disable') && tempItem?.action) {
              tempItem.action.disabled = true
            }
            overriddenFields.forEach((overriddenField) => {
              items = this.getOverRiddenPreviewField(
                section,
                group,
                overriddenField as IFormField,
                errorsOnFields,
                field,
                items,
                tempItem
              )
            })

            if (!overriddenFields.length) {
              items = items.concat(tempItem)
            }
          })
      })
      return {
        id: section.id,
        title: section.title ? intl.formatMessage(section.title) : '',
        items: items.filter((item) => item),
        action: this.shouldShowChangeAll(section)
          ? {
              label: intl.formatMessage(buttonMessages.replace),
              handler: () =>
                this.replaceHandler(section.id, visibleGroups[0].id)
            }
          : undefined
      }
    })
  }

  render() {
    const {
      intl,
      draft: declaration,
      registerForm,
      rejectDeclarationClickEvent,
      submitClickEvent,
      registrationSection,
      documentsSection,
      offlineCountryConfiguration,
      draft: { event },
      onContinue,
      viewRecord,
      reviewSummaryHeader
    } = this.props
    const isDuplicate = Boolean(declaration.duplicates?.length)
    const formSections =
      viewRecord || isDuplicate
        ? this.getViewableSection(registerForm[event]).map((section) => {
            return {
              ...section,
              groups: section.groups.map((group) => {
                return {
                  ...group,
                  fields: group.fields.map(fieldToReadOnlyFields)
                }
              })
            }
          })
        : this.getViewableSection(registerForm[event])
    const errorsOnFields = getErrorsOnFieldsBySection(
      formSections,
      offlineCountryConfiguration,
      declaration
    )

    const isSignatureMissing = () => {
      if (isCorrection(declaration)) {
        return false
      } else {
        if (event === Event.Birth || event === Event.Death) {
          return (
            offlineCountryConfiguration.config.INFORMANT_SIGNATURE_REQUIRED &&
            !declaration.data.registration?.informantsSignature
          )
        } else if (event === Event.Marriage) {
          return (
            !declaration.data.registration?.groomSignature ||
            !declaration.data.registration?.brideSignature ||
            !declaration.data.registration?.witnessOneSignature ||
            !declaration.data.registration?.witnessTwoSignature
          )
        }
      }
    }

    const isComplete =
      flatten(Object.values(errorsOnFields).map(Object.values)).filter(
        (errors) => errors.errors.length > 0
      ).length === 0 && !isSignatureMissing()

    const textAreaProps = {
      id: 'additional_comments',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        ;(this.props.onChangeReviewForm as onChangeReviewForm)(
          { commentsOrNotes: e.target.value },
          registrationSection,
          declaration
        )
      },
      value:
        (declaration.data.registration &&
          declaration.data.registration.commentsOrNotes) ||
        '',
      ignoreMediaQuery: true
    }

    const informantName = getDraftInformantFullName(
      declaration,
      intl.locale,
      this.isLastNameFirst()
    )
    const draft = this.isDraft()
    const transformedSectionData = this.transformSectionData(
      formSections,
      errorsOnFields,
      offlineCountryConfiguration,
      declaration
    )
    const totalFileSizeExceeded = isFileSizeExceeded(declaration)

    const generateSignatureProps = (
      sectionType: SignatureSectionType,
      id: string,
      value: string,
      inputLabel: string,
      isRequired: boolean
    ): SignatureInputProps => {
      return {
        id: id,
        onChange: (value: string) => {
          this.props.onChangeReviewForm &&
            this.props.onChangeReviewForm(
              {
                [sectionType]: value,
                [sectionType + 'URI']: ''
              },
              registrationSection,
              declaration
            )
        },
        value: value,
        label: inputLabel,
        isRequired: isRequired
      }
    }

    const getSignature = (eventType: Event) => {
      if ([Event.Birth, Event.Death].includes(eventType)) {
        if (!offlineCountryConfiguration.config.INFORMANT_SIGNATURE) {
          return <></>
        }
        const informantsSignatureInputPros = generateSignatureProps(
          SignatureSectionType.INFORMANT_SIGNATURE,
          'informants_signature',
          declaration.data.registration?.informantsSignature as string,
          intl.formatMessage(messages.informantsSignature),
          window.config.INFORMANT_SIGNATURE_REQUIRED
        )
        return (
          <>
            <Accordion
              name="signatures"
              label="Signatures"
              labelForHideAction={intl.formatMessage(messages.hideLabel)}
              labelForShowAction={intl.formatMessage(messages.showLabel)}
              expand={true}
            >
              <SignatureGenerator
                description={intl.formatMessage(messages.signatureDescription)}
                {...informantsSignatureInputPros}
              />
            </Accordion>
          </>
        )
      } else if ([Event.Marriage].includes(eventType)) {
        const brideSignatureInputPros = generateSignatureProps(
          SignatureSectionType.BRIDE_SIGNATURE,
          'bride_signature',
          declaration.data.registration?.brideSignature as string,
          intl.formatMessage(messages.brideSignature),
          true
        )

        const groomSignatureInputPros = generateSignatureProps(
          SignatureSectionType.GROOM_SIGNATURE,
          'groom_signature',
          declaration.data.registration?.groomSignature as string,
          intl.formatMessage(messages.groomSignature),
          true
        )

        const witnessOneSignatureInputPros = generateSignatureProps(
          SignatureSectionType.WITNESS_ONE_SIGNATURE,
          'witness_one_signature',
          declaration.data.registration?.witnessOneSignature as string,
          intl.formatMessage(messages.witnessOneSignature),
          true
        )

        const witnessTwoSignatureInputPros = generateSignatureProps(
          SignatureSectionType.WITNESS_TWO_SIGNATURE,
          'witness_two_signature',
          declaration.data.registration?.witnessTwoSignature as string,
          intl.formatMessage(messages.witnessTwoSignature),
          true
        )

        return (
          <>
            <Text id="terms" element="p" variant="reg16">
              {intl.formatMessage(messages.terms)}
            </Text>
            <SignatureGenerator {...groomSignatureInputPros} />
            <SignatureGenerator {...brideSignatureInputPros} />
            <SignatureGenerator {...witnessOneSignatureInputPros} />
            <SignatureGenerator {...witnessTwoSignatureInputPros} />
          </>
        )
      }
    }

    return (
      <Wrapper>
        <Row>
          <LeftColumn>
            {reviewSummaryHeader}
            <Card>
              {!isCorrection(declaration) && isDuplicate && (
                <DuplicateForm declaration={declaration} />
              )}
              <ReviewHeader
                id="review_header"
                logoSource={
                  offlineCountryConfiguration.config.COUNTRY_LOGO.file
                }
                title={intl.formatMessage(messages.govtName)}
                subject={
                  informantName
                    ? intl.formatMessage(messages.headerSubjectWithName, {
                        eventType: event,
                        name: informantName
                      })
                    : intl.formatMessage(messages.headerSubjectWithoutName, {
                        eventType: event
                      })
                }
              />
              <FormData>
                <ReviewContainter>
                  {transformedSectionData
                    .filter((sec) => sec.items.length > 0)
                    .map((sec, index) => {
                      return (
                        <DeclarationDataContainer key={index}>
                          <Accordion
                            name={sec.id}
                            label={sec.title}
                            action={
                              sec.action &&
                              declaration.registrationStatus !==
                                SUBMISSION_STATUS.CORRECTION_REQUESTED && (
                                <Link font="reg16" onClick={sec.action.handler}>
                                  {sec.action.label}
                                </Link>
                              )
                            }
                            labelForHideAction={intl.formatMessage(
                              messages.hideLabel
                            )}
                            labelForShowAction={intl.formatMessage(
                              messages.showLabel
                            )}
                            expand={true}
                          >
                            <ListViewSimplified id={'Section_' + sec.id}>
                              {sec.items.map((item, index) => {
                                return (
                                  <ListViewItemSimplified
                                    key={index}
                                    label={
                                      item.type === SUBSECTION_HEADER ? (
                                        <StyledLabel>{item.label}</StyledLabel>
                                      ) : (
                                        <Label>{item.label}</Label>
                                      )
                                    }
                                    value={
                                      <Value id={item.label.split(' ')[0]}>
                                        {item.value}
                                      </Value>
                                    }
                                    actions={
                                      !item?.action?.disabled &&
                                      declaration.registrationStatus !==
                                        SUBMISSION_STATUS.CORRECTION_REQUESTED && (
                                        <LinkButton
                                          id={item.action.id}
                                          disabled={item.action.disabled}
                                          onClick={item.action.handler}
                                        >
                                          {item.action.label}
                                        </LinkButton>
                                      )
                                    }
                                  />
                                )
                              })}
                            </ListViewSimplified>
                          </Accordion>
                        </DeclarationDataContainer>
                      )
                    })}
                  <Accordion
                    name="supporting-documents"
                    label={intl.formatMessage(messages.supportingDocuments)}
                    labelForHideAction={intl.formatMessage(messages.hideLabel)}
                    labelForShowAction={intl.formatMessage(messages.showLabel)}
                    action={
                      viewRecord ||
                      isDuplicate ||
                      declaration.registrationStatus ===
                        SUBMISSION_STATUS.CORRECTION_REQUESTED ? null : (
                        <Link
                          font="reg16"
                          element="button"
                          onClick={() =>
                            this.editLinkClickHandlerForDraft(
                              documentsSection.id,
                              documentsSection.groups[0].id!
                            )
                          }
                        >
                          {intl.formatMessage(messages.editDocuments)}
                        </Link>
                      )
                    }
                    expand={true}
                  >
                    {this.getAllAttachmentInPreviewList(declaration)}
                  </Accordion>

                  {(!isCorrection(declaration) || viewRecord) && (
                    <Accordion
                      name="additional_comments"
                      label={intl.formatMessage(messages.additionalComments)}
                      labelForHideAction={intl.formatMessage(
                        messages.hideLabel
                      )}
                      labelForShowAction={intl.formatMessage(
                        messages.showLabel
                      )}
                      expand={true}
                    >
                      <InputField
                        id="additional_comments"
                        touched={false}
                        required={false}
                      >
                        <TextArea
                          {...{
                            ...textAreaProps,
                            disabled: viewRecord || isDuplicate
                          }}
                        />
                      </InputField>
                    </Accordion>
                  )}

                  {!isCorrection(declaration) &&
                    !isDuplicate &&
                    !viewRecord &&
                    getSignature(declaration?.event as Event)}
                  {totalFileSizeExceeded && (
                    <StyledAlert type="warning">
                      {intl.formatMessage(
                        constantsMessages.totalFileSizeExceed,
                        {
                          fileSize: bytesToSize(ACCUMULATED_FILE_SIZE)
                        }
                      )}
                    </StyledAlert>
                  )}
                </ReviewContainter>
                {viewRecord ||
                isDuplicate ||
                declaration.registrationStatus ===
                  SUBMISSION_STATUS.CORRECTION_REQUESTED ? null : (
                  <>
                    {!isCorrection(declaration) ? (
                      <>
                        {isDuplicate && (
                          <DuplicateWarning
                            duplicateIds={declaration.duplicates?.map(
                              (duplicate) => duplicate.compositionId
                            )}
                          />
                        )}
                        <ReviewAction
                          completeDeclaration={isComplete}
                          totalFileSizeExceeded={totalFileSizeExceeded}
                          declarationToBeValidated={this.userHasValidateScope()}
                          declarationToBeRegistered={this.userHasRegisterScope()}
                          alreadyRejectedDeclaration={
                            this.props.draft.registrationStatus === REJECTED
                          }
                          draftDeclaration={draft}
                          declaration={declaration}
                          submitDeclarationAction={submitClickEvent}
                          rejectDeclarationAction={rejectDeclarationClickEvent}
                        />
                      </>
                    ) : (
                      <FooterArea>
                        <Button
                          type="primary"
                          size="large"
                          id="continue_button"
                          onClick={onContinue}
                          disabled={!isComplete || !this.hasChangesBeenMade}
                        >
                          {intl.formatMessage(buttonMessages.continueButton)}
                        </Button>
                      </FooterArea>
                    )}
                  </>
                )}
              </FormData>
            </Card>
          </LeftColumn>
          <RightColumn>
            <ResponsiveDocumentViewer
              isRegisterScope={this.userHasRegisterScope()}
            >
              <DocumentViewer
                id="document_section"
                options={this.prepSectionDocOptions(declaration)}
              >
                <ZeroDocument id={`zero_document`}>
                  {intl.formatMessage(messages.zeroDocumentsTextForAnySection)}
                  {viewRecord ||
                  isDuplicate ||
                  declaration.registrationStatus ===
                    SUBMISSION_STATUS.CORRECTION_REQUESTED ? null : (
                    <LinkButton
                      id="edit-document"
                      disabled={isCorrection(declaration)}
                      onClick={() =>
                        this.editLinkClickHandlerForDraft(
                          documentsSection.id,
                          documentsSection.groups[0].id!
                        )
                      }
                    >
                      {intl.formatMessage(messages.editDocuments)}
                    </LinkButton>
                  )}
                </ZeroDocument>
              </DocumentViewer>
            </ResponsiveDocumentViewer>
          </RightColumn>
        </Row>
        <ResponsiveModal
          title={intl.formatMessage(messages.editDeclarationConfirmationTitle)}
          contentHeight={96}
          responsive={false}
          actions={[
            <TertiaryButton
              id="cancel-btn"
              key="cancel"
              onClick={this.toggleDisplayDialog}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </TertiaryButton>,
            <PrimaryButton
              id="edit_confirm"
              key="submit"
              onClick={() => {
                this.editLinkClickHandlerForDraft(
                  this.state.editClickedSectionId!,
                  this.state.editClickedSectionGroupId,
                  this.state.editClickFieldName!
                )
              }}
            >
              {intl.formatMessage(buttonMessages.continueButton)}
            </PrimaryButton>
          ]}
          show={this.state.displayEditDialog}
          handleClose={this.toggleDisplayDialog}
        >
          {intl.formatMessage(messages.editDeclarationConfirmation)}
        </ResponsiveModal>
        {this.state.previewImage && (
          <DocumentPreview
            previewImage={this.state.previewImage}
            title={intl.formatMessage(buttonMessages.preview)}
            goBack={this.closePreviewSection}
            onDelete={this.onDelete}
            disableDelete={true}
          />
        )}
      </Wrapper>
    )
  }
}

function fieldToReadOnlyFields(field: IFormField): IFormField {
  const readyOnlyField = {
    ...field,
    readonly: true
  }
  if (field.nestedFields) {
    readyOnlyField.nestedFields = Object.entries(
      field.nestedFields
    ).reduce<INestedInputFields>((nestedInputFields, [key, nestedFields]) => {
      return {
        ...nestedInputFields,
        [key]: nestedFields.map((nestedField) => ({
          ...nestedField,
          readonly: true
        }))
      }
    }, {})
  }
  return readyOnlyField
}

export const ReviewSection = connect(
  (state: IStoreState) => ({
    registerForm: getRegisterForm(state),
    registrationSection: getBirthSection(state, 'registration'),
    documentsSection: getBirthSection(state, 'documents'),
    scope: getScope(state),
    offlineCountryConfiguration: getOfflineData(state),
    language: getLanguage(state)
  }),
  { goToPageGroup, writeDeclaration }
)(injectIntl(ReviewSectionComp))
