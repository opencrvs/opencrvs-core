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
import {
  LinkButton,
  TertiaryButton,
  PrimaryButton,
  SecondaryButton
} from '@opencrvs/components/lib/buttons'
import SignatureCanvas from 'react-signature-canvas'

import {
  ImageUploader,
  InputField,
  ISelectOption as SelectComponentOptions,
  TextArea,
  FormTabs,
  AudioRecorder
} from '@opencrvs/components/lib/forms'
import {
  DocumentViewer,
  IDocumentViewerOptions,
  ResponsiveModal,
  Warning
} from '@opencrvs/components/lib/interface'
import { FullBodyContent } from '@opencrvs/components/lib/layout'
import {
  IDeclaration,
  SUBMISSION_STATUS,
  writeDeclaration
} from '@client/declarations'
import { ReviewAction } from '@client/components/form/ReviewActionComponent'
import {
  BirthSection,
  CHECKBOX_GROUP,
  DATE,
  FETCH_BUTTON,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  ICheckboxGroupFormField,
  IDynamicOptions,
  IFileValue,
  IForm,
  IFormData,
  IFormField,
  IFormFieldValue,
  IFormSection,
  IFormSectionData,
  IFormSectionGroup,
  IPreviewGroup,
  IRadioOption,
  ISelectOption,
  LIST,
  PARAGRAPH,
  RADIO_GROUP,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  Section,
  SELECT_WITH_DYNAMIC_OPTIONS,
  SELECT_WITH_OPTIONS,
  SUBSECTION,
  WARNING,
  REVIEW_OVERRIDE_POSITION,
  DOCUMENT_UPLOADER_WITH_OPTION,
  IDocumentUploaderWithOptionsFormField,
  LOCATION_SEARCH_INPUT,
  IAttachmentValue,
  SubmissionAction,
  IRegStatus
} from '@client/forms'
import { Event } from '@client/utils/gateway'
import {
  getBirthSection,
  getRegisterForm
} from '@client/forms/register/declaration-selectors'
import { birthSectionMapping } from '@client/forms/register/fieldMappings/birth/mutation/documents-mappings'
import { deathSectionMapping } from '@client/forms/register/fieldMappings/death/mutation/documents-mappings'
import {
  getConditionalActionsForField,
  getSectionFields,
  getVisibleSectionGroupsBasedOnConditions,
  getListOfLocations
} from '@client/forms/utils'
import {
  Errors,
  getValidationErrorsForForm,
  IFieldErrors
} from '@client/forms/validation'
import {
  buttonMessages,
  constantsMessages,
  errorMessages
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/review'
import { messages as duplicatesMessages } from '@client/i18n/messages/views/duplicates'
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
import styled from '@client/styledComponents'
import { Scope } from '@client/utils/authUtils'

import { ACCUMULATED_FILE_SIZE, REJECTED } from '@client/utils/constants'
import { formatLongDate } from '@client/utils/date-formatting'
import { getDraftInformantFullName } from '@client/utils/draftUtils'
import { flatten, isArray, flattenDeep, get, clone, flatMap } from 'lodash'
import * as React from 'react'

import {
  injectIntl,
  IntlShape,
  MessageDescriptor,
  useIntl,
  WrappedComponentProps as IntlShapeProps
} from 'react-intl'
import { connect } from 'react-redux'
import { ReviewHeader } from '@client/views/RegisterForm/review/ReviewHeader'
import { IValidationResult } from '@client/utils/validate'
import { DocumentListPreview } from '@client/components/form/DocumentUploadfield/DocumentListPreview'
import { DocumentPreview } from '@client/components/form/DocumentUploadfield/DocumentPreview'
import { generateLocations } from '@client/utils/locationUtils'
import {
  bytesToSize,
  isCorrection,
  isFileSizeExceeded
} from '@client/views/CorrectionForm/utils'
import {
  ListViewSimplified,
  ListViewItemSimplified
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import { DuplicateWarning } from '@client/views/Duplicates/DuplicateWarning'
import {
  ApplyButton,
  CancelButton
} from '@client/views/SysAdmin/Config/Application/Components'
import { getBase64String } from '@client/utils/imageUtils'
import { formatName } from '@client/utils/name'
import { Recorder } from '@opencrvs/components/lib/forms/AudioRecorder/types'

const Deleted = styled.del`
  color: ${({ theme }) => theme.colors.negative};
`
const RequiredField = styled.span`
  color: ${({ theme }) => theme.colors.negative};
  display: inline-block;
  text-transform: lowercase;
  &::first-letter {
    text-transform: uppercase;
  }
`
const Row = styled.div`
  display: flex;
  flex: 1;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column;
  }
`

const RightColumn = styled.div<{
  hasDeclaration2?: boolean
}>`
  ${({ hasDeclaration2, theme }) =>
    hasDeclaration2
      ? `
      width: 50%;
      @media (max-width: ${theme.grid.breakpoints.lg}px) {
        width: 100%;
        margin-top: 24px;
        margin-left: 0;
      }`
      : `
      width: 40%;
      @media (max-width: ${theme.grid.breakpoints.lg}px) {
        display: none;
      }
      `};
  margin-left: 24px;

  &:first-child {
    margin-left: 0px;
  }
`
const Content = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.grey300};
`
const LeftColumn = styled.div<{
  hasDeclaration2?: boolean
  duplicate?: boolean
}>`
  width: ${({ hasDeclaration2 }) => (hasDeclaration2 ? 50 : 60)}%;
  &:first-child {
    margin-left: 0px;
  }
  &:last-child {
    margin-right: 0px;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 100%;
    margin-bottom: 0px;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    border: 0;
  }
`

const ZeroDocument = styled.div`
  ${({ theme }) => theme.fonts.reg18};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`

const ResponsiveDocumentViewer = styled.div<{ isRegisterScope: boolean }>`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: ${({ isRegisterScope }) => (isRegisterScope ? 'block' : 'none')};
    margin-bottom: 11px;
  }
`

const FooterArea = styled.div`
  padding-top: 20px;
`

const FormData = styled.div`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  padding: 32px;
  border-radius: 4px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    padding: 24px;
  }
`
const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${({ theme }) => theme.fonts.h3};
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
`
const Label = styled.span`
  ${({ theme }) => theme.fonts.bold16};
`
const Value = styled.span`
  ${({ theme }) => theme.fonts.reg16}
`
const SectionContainer = styled.div`
  margin-bottom: 40px;
`

const DocumentListPreviewContainer = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: block;
  }
`

const InputWrapper = styled.div`
  margin-top: 56px;
`

const CustomImageUpload = styled(ImageUploader)`
  border: 0 !important;
`
const SignatureContainer = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.grey600};
  border-radius: 4px;
  width: 100%;
`
const SignatureInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`
const SignaturePreview = styled.img`
  max-width: 100%;
  display: block;
`
const Description = styled.div`
  ${({ theme }) => theme.fonts.reg16}
  padding: 8px 24px;
  text-align: left;
  background-color: ${({ theme }) => theme.colors.white};
`
const DuplicateWarningGreen = styled(Warning)`
  /* stylelint-disable-next-line color-no-hex */
  background-color: #f4fff3;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.green};
  color: ${({ theme }) => theme.colors.green};
  svg {
    path,
    circle {
      stroke: ${({ theme }) => theme.colors.green};
    }
  }
  margin-bottom: 16px;
`

const DuplicateWarningRed = styled(Warning)`
  margin-bottom: 16px;
`

function SignCanvas({
  value,
  onChange
}: {
  value?: string
  onChange: (value: string) => void
}) {
  const [canvasWidth, setCanvasWidth] = React.useState(300)
  const canvasContainerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<SignatureCanvas>(null)

  React.useEffect(() => {
    function handleResize() {
      if (canvasContainerRef.current) {
        setCanvasWidth(canvasContainerRef.current.offsetWidth)
      }
    }

    window.addEventListener('resize', handleResize)

    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [canvasContainerRef])

  React.useEffect(() => {
    if (canvasRef.current && value) {
      canvasRef.current.fromDataURL(value)
    }
  }, [value])

  function emitValueToParent() {
    const data = canvasRef.current?.toDataURL()
    if (!data) {
      return
    }
    onChange(data)
  }

  function clear() {
    canvasRef.current?.clear()
    onChange('')
  }

  return (
    <SignatureInputContainer>
      <SignatureContainer ref={canvasContainerRef}>
        <SignatureCanvas
          ref={canvasRef}
          onEnd={() => {
            emitValueToParent()
          }}
          penColor="black"
          canvasProps={{
            width: canvasWidth,
            height: 200
          }}
        />
      </SignatureContainer>
      <TertiaryButton onClick={clear}>Clear</TertiaryButton>
    </SignatureInputContainer>
  )
}

type SignatureInputProps = {
  id?: string
  value?: string
  onChange: (value: string) => void
  readonly?: boolean
  onRecordingChange: (value: any) => void
  recording?: any
}

const SignatureDescription = styled.p`
  margin-top: 16px;
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.grey500};
`

function SignatureInput({
  id,
  value,
  onChange,
  readonly,
  recording,
  onRecordingChange
}: SignatureInputProps) {
  const [signatureDialogOpen, setSignatureDialogOpen] = React.useState(false)
  const [signatureValue, setSignatureValue] = React.useState('')
  const [tab, setTab] = React.useState<'sign-canvas' | 'audio'>('sign-canvas')

  const intl = useIntl()

  function apply() {
    setSignatureDialogOpen(false)
    onChange(signatureValue)
  }

  const onRecordEnd = (state: Recorder) => {
    onRecordingChange(state.audio)
    onChange('')
  }

  return (
    <InputWrapper>
      <InputField
        id="informant_signature"
        touched={false}
        required={true}
        label={intl.formatMessage(messages.informantsSignature)}
      >
        <div>
          <FormTabs
            sections={[
              { id: 'sign-canvas', title: 'Sign on canvas' },
              { id: 'audio', title: 'Record audio' }
            ]}
            activeTabId={tab}
            onTabClick={(tab) => setTab(() => tab)}
          />

          {tab === 'sign-canvas' && (
            <>
              <SignatureDescription>
                {intl.formatMessage(messages.signatureDescription)}
              </SignatureDescription>
              {!value && !readonly && (
                <>
                  <SecondaryButton onClick={() => setSignatureDialogOpen(true)}>
                    {intl.formatMessage(messages.signatureOpenSignatureInput)}
                  </SecondaryButton>
                  <CustomImageUpload
                    id="signature-file-upload"
                    title="Upload"
                    handleFileChange={async (file) => {
                      onChange((await getBase64String(file)).toString())
                    }}
                  />
                </>
              )}
              {value && (
                <SignaturePreview alt="Informant's signature" src={value} />
              )}
              {value && !readonly && (
                <TertiaryButton onClick={() => onChange('')}>
                  {intl.formatMessage(messages.signatureDelete)}
                </TertiaryButton>
              )}
              <ResponsiveModal
                id={`${id}Modal`}
                title={'Signature of informant'}
                autoHeight={true}
                titleHeightAuto={true}
                width={600}
                show={signatureDialogOpen}
                actions={[
                  <CancelButton
                    key="cancel"
                    id="modal_cancel"
                    onClick={() => setSignatureDialogOpen(false)}
                  >
                    {intl.formatMessage(buttonMessages.cancel)}
                  </CancelButton>,
                  <ApplyButton
                    key="apply"
                    id="apply_change"
                    disabled={false}
                    onClick={apply}
                  >
                    {intl.formatMessage(buttonMessages.apply)}
                  </ApplyButton>
                ]}
                handleClose={() => setSignatureDialogOpen(false)}
              >
                <SignatureDescription>
                  {intl.formatMessage(messages.signatureInputDescription)}
                </SignatureDescription>
                <SignCanvas value={value} onChange={setSignatureValue} />
              </ResponsiveModal>
            </>
          )}

          {tab === 'audio' && (
            <>
              <SignatureDescription>
                {intl.formatMessage(messages.signatureDescription)}
              </SignatureDescription>
              {!recording && !readonly && (
                <AudioRecorder onRecordEnd={onRecordEnd}>
                  {intl.formatMessage(messages.signatureOpenSignatureInput)}
                </AudioRecorder>
              )}
              {recording && (
                <audio controls autoPlay={false}>
                  <source src={recording} />
                </audio>
              )}
            </>
          )}
        </div>
      </InputField>
    </InputWrapper>
  )
}

type onChangeReviewForm = (
  sectionData: IFormSectionData,
  activeSection: IFormSection,
  declaration: IDeclaration
) => void
interface IProps {
  draft: IDeclaration
  draft2?: IDeclaration
  registerForm: { [key: string]: IForm }
  pageRoute: string
  rejectDeclarationClickEvent?: () => void
  goToPageGroup: typeof goToPageGroup
  submitClickEvent?: (
    declaration: IDeclaration,
    submissionStatus: string,
    action: SubmissionAction
  ) => void
  readonly?: boolean
  scope: Scope | null
  offlineCountryConfiguration: IOfflineData
  language: string
  onChangeReviewForm?: onChangeReviewForm
  onContinue?: () => void
  writeDeclaration: typeof writeDeclaration
  registrationSection: IFormSection
  documentsSection: IFormSection
  duplicate?: boolean
}
type State = {
  displayEditDialog: boolean
  editClickedSectionId: string
  editClickedSectionGroupId: string
  editClickFieldName: string
  activeSection: Section | null
  previewImage: IFileValue | null
}

interface IErrorsBySection {
  [sectionId: string]: Errors
}

type FullProps = IProps & IntlShapeProps

function getSelectOrRadioOption(
  options: Array<ISelectOption | IRadioOption>,
  value: IFormFieldValue,
  intl: IntlShape
) {
  const option = options.find((option) => option.value === value)
  return option ? intl.formatMessage(option.label) : value
}

function renderSelectOrRadioLabel(
  value: IFormFieldValue,
  options: Array<ISelectOption | IRadioOption>,
  intl: IntlShape,
  overrideOptions?: Array<ISelectOption | IRadioOption>
) {
  return overrideOptions
    ? getSelectOrRadioOption(overrideOptions, value, intl)
    : getSelectOrRadioOption(options, value, intl)
}

function hasB1Form(draft: IDeclaration) {
  if (!draft.data?.documents?.uploadDocForB1Form) {
    return false
  }

  return (
    draft.data?.documents?.uploadDocForB1Form as Array<{
      optionValues: string[]
    }>
  )?.some((item) => item.optionValues[1] === 'B1_FORM')
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
      if (options.resource === 'locations') {
        selectedLocation =
          offlineCountryConfig[OFFLINE_LOCATIONS_KEY][locationId]
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
  language: string
) => {
  const value: IFormFieldValue = getFormFieldValue(draftData, sectionId, field)

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
    return renderSelectOrRadioLabel(
      value,
      field.options,
      intl,
      field.reviewOverrideLabels
    )
  }

  if (field.type === RADIO_GROUP_WITH_NESTED_FIELDS) {
    return renderSelectOrRadioLabel(
      (value && (value as IFormSectionData).value) || '',
      field.options,
      intl
    )
  }

  if (value && field.type === CHECKBOX_GROUP) {
    return getCheckBoxGroupFieldValue(field, value as string[], intl)
  }

  if (value && field.type === LOCATION_SEARCH_INPUT) {
    const searchableListOfLocations = generateLocations(
      getListOfLocations(offlineCountryConfiguration, field.searchableResource),
      intl
    )
    const selectedLocation = searchableListOfLocations.find(
      (location) => location.id === value
    )
    return (selectedLocation && selectedLocation.displayLabel) || ''
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'boolean') {
    if (field.reviewOverrideLabels) {
      const replacementLabel = field.reviewOverrideLabels.find(
        (label) => label.value === value
      )
      if (replacementLabel) {
        return intl.formatMessage(replacementLabel.label)
      }
    }

    return value
      ? intl.formatMessage(buttonMessages.yes)
      : intl.formatMessage(buttonMessages.no)
  }
  return value
}

const getErrorsOnFieldsBySection = (
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

const SECTION_MAPPING = {
  [Event.Birth]: birthSectionMapping,
  [Event.Death]: deathSectionMapping,
  [Event.Marriage]: birthSectionMapping, // TODO: Amend
  [Event.Divorce]: birthSectionMapping, // TODO: Amend
  [Event.Adoption]: birthSectionMapping // TODO: Amend
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
      activeSection: null,
      previewImage: null
    }
  }

  componentWillUpdate() {
    this.hasChangesBeenMade = false
  }

  getVisibleSections = (formSections: IFormSection[]) => {
    const { draft } = this.props
    return formSections.filter(
      (section) =>
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
  prepSectionDocuments = (
    draft: IDeclaration,
    activeSection?: Section
  ): IDocumentViewerOptions & { uploadedDocuments: IFileValue[] } => {
    const { documentsSection } = this.props

    const draftItemName = documentsSection.id
    const documentOptions: SelectComponentOptions[] = []
    const selectOptions: Array<
      SelectComponentOptions & { originalValue?: string }
    > = []

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
      const sectionMapping = SECTION_MAPPING[draft.event]
      const allowedDocumentType: string[] =
        (activeSection
          ? sectionMapping[activeSection as keyof typeof sectionMapping]
          : flatMap(Object.values(sectionMapping))) || []

      if (
        allowedDocumentType.indexOf(document.optionValues[0]!.toString()) > -1
      ) {
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
          originalValue: document.optionValues[
            document.optionValues.length - 1
          ] as string,
          label: label as string
        })
        return true
      }
      return false
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
    const { draft, pageRoute, writeDeclaration, goToPageGroup } = this.props
    const declaration = draft
    if (
      declaration.data.registration &&
      declaration.data.registration.informantsSignature
    ) {
      if (!declaration.data.registration.regStatus) {
        declaration.data.registration.informantsSignature = ''
      } else {
        const regStatus = declaration.data.registration.regStatus as IRegStatus
        if (regStatus.type === 'IN_PROGRESS') {
          declaration.data.registration.informantsSignature = ''
        }
      }
    }
    if (
      declaration.data.registration &&
      declaration.data.registration.informantsSignatureRecording
    ) {
      if (!declaration.data.registration.regStatus) {
        declaration.data.registration.informantsSignatureRecording = ''
      } else {
        const regStatus = declaration.data.registration.regStatus as IRegStatus
        if (regStatus.type === 'IN_PROGRESS') {
          declaration.data.registration.informantsSignatureRecording = ''
        }
      }
    }
    declaration.review = true
    writeDeclaration(declaration)
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
    const conditionalActions = getConditionalActionsForField(
      {
        ...field,
        conditionals: (field.conditionals || []).concat(
          field.reviewConditionals || []
        )
      },
      draft.data[section.id] || {},
      offlineCountryConfiguration,
      draft.data
    )
    return (
      !conditionalActions.includes('hide') &&
      !conditionalActions.includes('disable')
    )
  }

  isViewOnly(field: IFormField) {
    return [LIST, PARAGRAPH, WARNING, SUBSECTION, FETCH_BUTTON].find(
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
    declaration: IDeclaration,
    section: IFormSection,
    group: IFormSectionGroup,
    fieldLabel: MessageDescriptor,
    fieldName: string,
    value: IFormFieldValue | JSX.Element | undefined,
    ignoreAction = false
  ) {
    const { intl } = this.props

    return {
      label: intl.formatMessage(fieldLabel),
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
    replaceEmpty?: boolean
  ) => {
    const { intl, offlineCountryConfiguration, language } = this.props

    let value = renderValue(
      data,
      section.id,
      field,
      intl,
      offlineCountryConfiguration,
      language
    )

    if (replaceEmpty && !value) {
      value = '-'
    }
    const errorsOnField =
      get(sectionErrors[section.id][field.name], 'errors') ||
      this.getErrorForNestedField(section, field, sectionErrors)

    return errorsOnField.length > 0
      ? this.getFieldValueWithErrorMessage(section, field, errorsOnField[0])
      : field.nestedFields && !Boolean(ignoreNestedFieldWrapping)
      ? (
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
        }, <>{value}</>)
      : value
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
    draft: IDeclaration,
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    visitedTags: string[],
    errorsOnFields: IErrorsBySection,
    data: IFormSectionData,
    originalData?: IFormSectionData
  ) {
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

      const hasErrors = taggedFields.reduce(
        (accum, field) =>
          accum || this.fieldHasErrors(section, field, errorsOnFields),
        false
      )

      let completeValue: typeof values[number]
      const previewTransformer =
        section.previewGroupTransformers?.[field.previewGroup]
      if (!hasErrors && previewTransformer) {
        completeValue = previewTransformer(values)
      } else {
        completeValue = values[0]

        values.shift()
        values.forEach(
          (value) =>
            (completeValue = (
              <>
                {completeValue}
                {tagDef[0].delimiter ? (
                  <span>{tagDef[0].delimiter}</span>
                ) : (
                  <br />
                )}
                {value}
              </>
            ))
        )
      }

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
              !index
            )
          )
          .filter((value) => value)

        let previousCompleteValue: JSX.Element

        if (previewTransformer) {
          previousCompleteValue = (
            <Deleted>{previewTransformer(previousValues)}</Deleted>
          )
        } else {
          previousCompleteValue = <Deleted>{previousValues[0]}</Deleted>
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
        }

        completeValue = (
          <>
            {previousCompleteValue}
            <br />
            {completeValue}
          </>
        )
      }

      return this.getRenderableField(
        draft,
        section,
        group,
        (tagDef[0] && tagDef[0].label) || field.label,
        (tagDef[0] && tagDef[0].fieldToRedirect) || field.name,
        completeValue,
        field.readonly || this.props.readonly
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
    draft: IDeclaration,
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    sectionErrors: IErrorsBySection,
    ignoreNestedFieldWrapping?: boolean
  ) {
    const { data, originalData } = draft
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
      draft,
      section,
      group,
      field.label,
      field.name,
      value,
      field.readonly || this.props.readonly
    )
  }

  getNestedPreviewField(
    draft: IDeclaration,
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    sectionErrors: IErrorsBySection
  ) {
    const visitedTags: string[] = []
    const nestedItems: any[] = []
    // parent field
    nestedItems.push(
      this.getSinglePreviewField(
        draft,
        section,
        group,
        field,
        sectionErrors,
        true
      )
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
            draft,
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
            draft,
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
            nestedField.readonly || this.props.readonly
          )
        )
      }
    })
    return nestedItems
  }

  getOverriddenFieldsListForPreview(
    draft: IDeclaration,
    formSections: IFormSection[]
  ): IFormField[] {
    const overriddenFields = formSections
      .map((section) => {
        return section.groups
          .map((group) => {
            return group.fields
              .map((field) => {
                const { offlineCountryConfiguration } = this.props
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
    draft: IDeclaration,
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
      draft,
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
      draft: { data, event }
    } = this.props
    return (
      event === Event.Birth &&
      ((section.id === BirthSection.Mother && !!data.mother?.detailsExist) ||
        (section.id === BirthSection.Father && !!data.father?.detailsExist)) &&
      !this.props.readonly
    )
  }

  transformSectionData = (
    formSections: IFormSection[],
    errorsOnFields: IErrorsBySection,
    draft: IDeclaration
  ) => {
    const { intl } = this.props
    const overriddenFields = this.getOverriddenFieldsListForPreview(
      draft,
      formSections
    )
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
            tempItem = field.previewGroup
              ? this.getPreviewGroupsField(
                  draft,
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
                  draft,
                  section,
                  group,
                  field,
                  errorsOnFields
                )
              : this.getSinglePreviewField(
                  draft,
                  section,
                  group,
                  field,
                  errorsOnFields
                )

            overriddenFields.forEach((overriddenField) => {
              items = this.getOverRiddenPreviewField(
                draft,
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
        title: intl.formatMessage(section.title),
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

  getTextAreaProps = (id: string, declaration: IDeclaration) => ({
    id,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      ;(this.props.onChangeReviewForm as onChangeReviewForm)(
        { commentsOrNotes: e.target.value },
        this.props.registrationSection,
        declaration
      )
    },
    value:
      (declaration.data.registration &&
        declaration.data.registration.commentsOrNotes) ||
      '',
    disabled: this.props.readonly,
    ignoreMediaQuery: true
  })

  render() {
    const {
      intl,
      draft: declaration,
      draft2: declaration2,
      registerForm,
      rejectDeclarationClickEvent,
      submitClickEvent,
      registrationSection,
      documentsSection,
      offlineCountryConfiguration,
      draft: { event },
      readonly,
      onContinue,
      duplicate
    } = this.props
    const formSections = this.getViewableSection(registerForm[event])
    const errorsOnFields = getErrorsOnFieldsBySection(
      formSections,
      offlineCountryConfiguration,
      declaration
    )

    const isSignatureMissing = isCorrection(declaration)
      ? false
      : !(
          hasB1Form(declaration) ||
          declaration.data.registration?.informantsSignature ||
          declaration.data.registration?.informantsSignatureRecording
        )

    const isComplete =
      flatten(Object.values(errorsOnFields).map(Object.values)).filter(
        (errors) => errors.errors.length > 0
      ).length === 0 && !isSignatureMissing

    const signatureInputProps = {
      id: 'informants_signature',
      onChange: (value: string) => {
        this.props.onChangeReviewForm &&
          this.props.onChangeReviewForm(
            { informantsSignature: value },
            registrationSection,
            declaration
          )
      },
      value: declaration.data.registration?.informantsSignature as string,
      onRecordingChange: (value: string) => {
        this.props.onChangeReviewForm &&
          this.props.onChangeReviewForm(
            {
              informantsSignatureRecording: value
            },
            registrationSection,
            declaration
          )
      },
      recording: declaration.data.registration
        ?.informantsSignatureRecording as string,
      readonly
    }

    const sectionName = this.state.activeSection || this.docSections[0].id
    const informantName = getDraftInformantFullName(declaration, intl.locale)
    const informantName2 = declaration2
      ? getDraftInformantFullName(declaration2, intl.locale)
      : ''
    const draft = this.isDraft()
    const transformedSectionData = this.transformSectionData(
      formSections,
      errorsOnFields,
      declaration
    )
    let transformedSectionDataForDeclaration2: {
      id: Section
      title: string
      items: any[]
      action:
        | {
            label: string
            handler: () => void
          }
        | undefined
    }[] = []
    if (declaration2) {
      const errorsOnFieldsInDeclaration2 = getErrorsOnFieldsBySection(
        formSections,
        offlineCountryConfiguration,
        declaration2
      )
      transformedSectionDataForDeclaration2 = this.transformSectionData(
        formSections,
        errorsOnFieldsInDeclaration2,
        declaration2
      )
    }
    const description = intl.formatMessage(messages.reviewDescription, {
      event
    })
    const totalFileSizeExceeded = isFileSizeExceeded(declaration)
    return (
      <FullBodyContent>
        <Row>
          <LeftColumn hasDeclaration2={Boolean(declaration2)}>
            {duplicate && (
              <DuplicateWarningGreen
                label={intl.formatMessage(messages.originalDeclaration, {
                  trackingId: declaration.data.registration?.trackingId
                })}
              />
            )}
            <Content>
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
                        name: formatName(informantName)
                      })
                    : intl.formatMessage(messages.headerSubjectWithoutName, {
                        eventType: event
                      })
                }
              />
              {description && !readonly && (
                <Description>{description}</Description>
              )}
              <FormData>
                {transformedSectionData.map((sec, index) => {
                  const { uploadedDocuments, selectOptions } =
                    this.prepSectionDocuments(declaration, sec.id)

                  return (
                    <SectionContainer key={index}>
                      {sec.title && (
                        <Title>
                          {sec.title}
                          {sec.action && (
                            <LinkButton onClick={sec.action.handler}>
                              {sec.action.label}
                            </LinkButton>
                          )}
                        </Title>
                      )}
                      <DocumentListPreviewContainer>
                        <DocumentListPreview
                          id={sec.id}
                          documents={uploadedDocuments}
                          onSelect={this.selectForPreview}
                          dropdownOptions={selectOptions}
                        />
                      </DocumentListPreviewContainer>
                      <ListViewSimplified id={'Section_' + sec.id}>
                        {sec.items.map((item, index) => {
                          return (
                            <ListViewItemSimplified
                              key={index}
                              label={<Label>{item.label}</Label>}
                              value={
                                <Value id={item.label.split(' ')[0]}>
                                  {item.value}
                                </Value>
                              }
                              actions={
                                <LinkButton
                                  id={item.action.id}
                                  disabled={item.action.disabled}
                                  onClick={item.action.handler}
                                >
                                  {item.action.label}
                                </LinkButton>
                              }
                            />
                          )
                        })}
                      </ListViewSimplified>
                    </SectionContainer>
                  )
                })}
                {!isCorrection(declaration) && (
                  <InputWrapper>
                    <InputField
                      id="additional_comments"
                      touched={false}
                      required={false}
                      label={intl.formatMessage(messages.additionalComments)}
                    >
                      <TextArea
                        {...this.getTextAreaProps(
                          'additional_comments',
                          declaration
                        )}
                      />
                    </InputField>
                  </InputWrapper>
                )}
                {!isCorrection(declaration) && !hasB1Form(declaration) && (
                  <SignatureInput {...signatureInputProps} />
                )}
                {totalFileSizeExceeded && (
                  <Warning
                    label={intl.formatMessage(
                      constantsMessages.totalFileSizeExceed,
                      { fileSize: bytesToSize(ACCUMULATED_FILE_SIZE) }
                    )}
                  />
                )}
                {!isCorrection(declaration) ? (
                  <>
                    {!readonly && (
                      <DuplicateWarning
                        declarationId={declaration.id}
                        event={declaration.event}
                        duplicateIds={declaration.duplicates}
                      />
                    )}
                    {submitClickEvent && !readonly && (
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
                    )}
                  </>
                ) : (
                  <FooterArea>
                    <PrimaryButton
                      id="continue_button"
                      onClick={onContinue}
                      disabled={!isComplete || !this.hasChangesBeenMade}
                    >
                      {intl.formatMessage(buttonMessages.continueButton)}
                    </PrimaryButton>
                  </FooterArea>
                )}
              </FormData>
            </Content>
          </LeftColumn>
          <RightColumn hasDeclaration2={Boolean(declaration2)}>
            {duplicate && (
              <DuplicateWarningRed
                label={intl.formatMessage(
                  duplicatesMessages.potentialDuplicateWarning
                )}
              />
            )}
            {declaration2 ? (
              <Content>
                <ReviewHeader
                  id="review_header"
                  logoSource={
                    offlineCountryConfiguration.config.COUNTRY_LOGO.file
                  }
                  title={intl.formatMessage(messages.govtName)}
                  subject={
                    informantName2
                      ? intl.formatMessage(messages.headerSubjectWithName, {
                          eventType: event,
                          name: formatName(informantName2)
                        })
                      : intl.formatMessage(messages.headerSubjectWithoutName, {
                          eventType: event
                        })
                  }
                />
                {description && !readonly && (
                  <Description>{description}</Description>
                )}
                <FormData>
                  {transformedSectionDataForDeclaration2.map((sec, index) => {
                    const { uploadedDocuments, selectOptions } =
                      this.prepSectionDocuments(declaration2, sec.id)

                    return (
                      <SectionContainer key={index}>
                        {sec.title && (
                          <Title>
                            {sec.title}
                            {sec.action && (
                              <LinkButton onClick={sec.action.handler}>
                                {sec.action.label}
                              </LinkButton>
                            )}
                          </Title>
                        )}
                        <DocumentListPreviewContainer>
                          <DocumentListPreview
                            id={sec.id}
                            documents={uploadedDocuments}
                            onSelect={this.selectForPreview}
                            dropdownOptions={selectOptions}
                          />
                        </DocumentListPreviewContainer>
                        <ListViewSimplified id={'Section_' + sec.id}>
                          {sec.items.map((item, index) => {
                            return (
                              <ListViewItemSimplified
                                key={index}
                                label={<Label>{item.label}</Label>}
                                value={
                                  <Value id={item.label.split(' ')[0]}>
                                    {item.value}
                                  </Value>
                                }
                                actions={
                                  <LinkButton
                                    id={item.action.id}
                                    disabled={item.action.disabled}
                                    onClick={item.action.handler}
                                  >
                                    {item.action.label}
                                  </LinkButton>
                                }
                              />
                            )
                          })}
                        </ListViewSimplified>
                      </SectionContainer>
                    )
                  })}
                  {!isCorrection(declaration2) && (
                    <InputWrapper>
                      <InputField
                        id="additional_comments"
                        touched={false}
                        required={false}
                        label={intl.formatMessage(messages.additionalComments)}
                      >
                        <TextArea
                          {...this.getTextAreaProps(
                            'additional_comments_2',
                            declaration2
                          )}
                        />
                      </InputField>
                    </InputWrapper>
                  )}
                  {!isCorrection(declaration2) && !hasB1Form(declaration2) && (
                    <SignatureInput
                      {...signatureInputProps}
                      value={
                        declaration2.data.registration
                          ?.informantsSignature as string
                      }
                      recording={
                        declaration2.data.registration
                          ?.informantsSignatureRecording as string
                      }
                    />
                  )}
                  {totalFileSizeExceeded && (
                    <Warning
                      label={intl.formatMessage(
                        constantsMessages.totalFileSizeExceed,
                        { fileSize: bytesToSize(ACCUMULATED_FILE_SIZE) }
                      )}
                    />
                  )}
                  {!isCorrection(declaration2) ? (
                    <>
                      {!readonly && (
                        <DuplicateWarning
                          duplicateIds={declaration2.duplicates}
                        />
                      )}
                      {submitClickEvent && !readonly && (
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
                      )}
                    </>
                  ) : (
                    <FooterArea>
                      <PrimaryButton
                        id="continue_button"
                        onClick={onContinue}
                        disabled={!isComplete || !this.hasChangesBeenMade}
                      >
                        {intl.formatMessage(buttonMessages.continueButton)}
                      </PrimaryButton>
                    </FooterArea>
                  )}
                </FormData>
              </Content>
            ) : (
              <ResponsiveDocumentViewer
                isRegisterScope={this.userHasRegisterScope()}
              >
                <DocumentViewer
                  id={'document_section_' + this.state.activeSection}
                  key={'Document_section_' + this.state.activeSection}
                  options={this.prepSectionDocuments(declaration)}
                >
                  <ZeroDocument id={`zero_document_${sectionName}`}>
                    {intl.formatMessage(messages.zeroDocumentsText, {
                      section: sectionName
                    })}
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
                  </ZeroDocument>
                </DocumentViewer>
              </ResponsiveDocumentViewer>
            )}
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
          />
        )}
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
    offlineCountryConfiguration: getOfflineData(state),
    language: getLanguage(state)
  }),
  { goToPageGroup, writeDeclaration }
)(injectIntl(ReviewSectionComp))
