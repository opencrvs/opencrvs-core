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
  NUMBER,
  TEL,
  TEXT,
  TEXTAREA,
  BirthSection,
  DeathSection,
  IFormField,
  SELECT_WITH_OPTIONS,
  ISelectOption,
  IFormDataSet,
  NATIONAL_ID_VERIFICATION
} from '@client/forms'
import {
  getIdentifiersFromFieldId,
  ICustomSelectOption,
  IMessage
} from '@client/forms/questionConfig'
import { CreateFormDatasetMutation, Event } from '@client/utils/gateway'
import { modifyConfigField } from '@client/forms/configuration/formConfig/actions'
import {
  getCertificateHandlebar,
  ICustomConfigField,
  IDataSourceSelectOption,
  isPreviewGroupConfigField
} from '@client/forms/configuration/formConfig/utils'
import {
  buttonMessages,
  formMessageDescriptors,
  locationMessages
} from '@client/i18n/messages'
import { customFieldFormMessages } from '@client/i18n/messages/views/customFieldForm'
import {
  ILanguageState,
  initLanguages,
  IntlMessages
} from '@client/i18n/reducer'
import { getDefaultLanguage } from '@client/i18n/utils'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Button } from '@opencrvs/components/src/Button'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { TextArea } from '@opencrvs/components/lib/TextArea'
import { Link } from '@opencrvs/components/lib/Link'
import { Select } from '@opencrvs/components/lib/Select'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import {
  ListViewSimplified,
  ListViewItemSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { camelCase, debounce, isEmpty } from 'lodash'
import * as React from 'react'
import {
  injectIntl,
  MessageDescriptor,
  WrappedComponentProps as IntlShapeProp
} from 'react-intl'
import { connect } from 'react-redux'
import { selectConfigFields } from '@client/forms/configuration/formConfig/selectors'
import { useFieldDefinition } from '@client/views/SysAdmin/Config/Forms/hooks'
import {
  Title,
  Label,
  RequiredToggleAction,
  ToolTip,
  ConditionalToggleAction,
  RegisterFormFieldIds
} from './components'
import { messages } from '@client/i18n/messages/views/formConfig'
import { Text } from '@opencrvs/components/lib/Text'
import { EMPTY_STRING } from '@client/utils/constants'
import { Stack } from '@opencrvs/components/lib/Stack'
import { FileSelectLink } from '@opencrvs/components/lib/FileSelectLink'
import { getBase64String } from '@client/utils/imageUtils'
import { ResponsiveModal } from '@client/../../components/lib'
import { client } from '@client/utils/apolloClient'
import { CREATE_FORM_DATA_SET } from '@client/views/SysAdmin/Config/Forms/mutations'
import { Alert } from '@opencrvs/components/lib/Alert'
import { createCustomFieldHandlebarName } from '@client/forms/configuration/customUtils'
import { offlineFormConfigAddFormDataset } from '@client/offline/actions'
import { Icon } from '@opencrvs/components/lib/Icon'

const DEFAULT_MAX_LENGTH = 250

const CInputField = styled(InputField)`
  label {
    ${({ theme }) => theme.fonts.reg14};
  }
`

const CTextInput = styled(TextInput)`
  ${({ theme }) => theme.fonts.reg14};
  height: 32px;
  border: solid 1px ${({ theme }) => theme.colors.grey600};
`
const CSelect = styled(Select)`
  width: 100%;
  margin: 20px 0px;
  border-radius: 2px;
  .react-select__control {
    border: solid 1px ${({ theme }) => theme.colors.grey600};
    max-height: 32px;
    min-height: 32px;
  }
  .react-select__control:hover {
    border: solid 1px ${({ theme }) => theme.colors.grey600};
  }
  .react-select__placeholder {
    color: ${({ theme }) => theme.colors.grey400};
  }
  .react-select__value-container {
    display: block;
  }
  div {
    ${({ theme }) => theme.fonts.reg14};
    color: ${({ theme }) => theme.colors.primaryDark};
  }
`

const ConditionalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 30px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
`

const CTextArea = styled(TextArea)`
  ${({ theme }) => theme.fonts.reg14};
  height: 32px;
  background: ${({ theme }) => theme.colors.white};
  border: solid 1px ${({ theme }) => theme.colors.grey600};
`

const CPrimaryButton = styled(PrimaryButton)`
  border-radius: 4px;
  margin-bottom: 24px;
  :disabled {
    background: ${({ theme }) => theme.colors.grey300};
  }
`

const FieldContainer = styled.div<{ hide?: boolean }>`
  margin-bottom: 30px;
  ${({ hide }) => {
    return hide ? 'display: none' : 'display: block'
  }}
`

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 26px;
`

const ListRow = styled.div`
  ${({ theme }) => theme.fonts.reg14};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: solid 1px ${({ theme }) => theme.colors.grey200};
  padding: 8px 0;
`

const LanguageSelect = styled(Select)`
  width: 175px;
  border: solid 2px ${({ theme }) => theme.colors.primaryDark};
  border-radius: 2px;
  .react-select__control {
    max-height: 32px;
    min-height: 32px;
  }
  .react-select__value-container {
    display: block;
  }
  div {
    ${({ theme }) => theme.fonts.reg14};
    color: ${({ theme }) => theme.colors.primaryDark};
  }
`
const ConditionalFieldIdSelect = styled(Select)`
  width: 100%;
  border: solid 2px ${({ theme }) => theme.colors.primaryDark};
  border-radius: 2px;
  .react-select__control {
    max-height: 32px;
    min-height: 32px;
  }
  .react-select__value-container {
    display: block;
  }
  div {
    ${({ theme }) => theme.fonts.reg14};
    color: ${({ theme }) => theme.colors.primaryDark};
  }
`

const ListColumn = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const CErrorText = styled(ErrorText)`
  width: 200px;
`
const Body = styled.div`
  margin: 16px 0px;
`

const CustomSelectHeading = styled.span`
  display: flex;
  gap: 5px;
`

const CFileSelectLink = styled(FileSelectLink)`
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0px 12px;
  height: 40px;

  &:hover {
    text-decoration: underline;
    background: ${({ theme }) => theme.colors.grey100};
    border: 2px solid ${({ theme }) => theme.colors.primaryDark};
    color: ${({ theme }) => theme.colors.primaryDark};
  }
  &:active {
    background: ${({ theme }) => theme.colors.grey200};
    color: ${({ theme }) => theme.colors.primaryDarker};
  }
  &:focus-visible {
    border: 2px solid ${({ theme }) => theme.colors.grey600};
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.grey600};
    box-shadow: none;
  }
`

type IFormFieldWrapper = { formField: IFormField }

type IProps = {
  event: Event
  selectedField: ICustomConfigField
  section: BirthSection | DeathSection
  setSelectedField: React.Dispatch<React.SetStateAction<string | null>>
}

type IFullProps = IProps &
  IFormFieldWrapper &
  IntlShapeProp &
  ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps

interface ICustomField {
  label: string
  placeholder: string
  description: string
  tooltip: string
  errorMessage: string
}

interface IFieldForms {
  [key: string]: ICustomField
}
interface IConditionalFieldForms {
  fieldId: string
  regex: string
}

enum STATUS_TYPES {
  INPROGRESS = 'loading',
  COMPLETED = 'success',
  ERROR = 'error'
}

interface CSVUploadStatus {
  statusType: STATUS_TYPES
  message: string
}

interface ICustomFieldState {
  selectedLanguage: string
  conditionalField: IConditionalFieldForms
  handleBars: string
  maxLength: number
  fieldForms: IFieldForms
  showCSVUploadingModal: boolean
  CSVUploadStatuses: CSVUploadStatus[]
  CSVUploaderModalActions: JSX.Element[]
  dataSourceSelectOptions: IDataSourceSelectOption[]
  selectedDataSource: string | null | undefined
}

interface IOptionalContent {
  [key: string]: IMessage[]
}

class CustomFieldToolsComp extends React.Component<
  IFullProps,
  ICustomFieldState
> {
  constructor(props: IFullProps) {
    super(props)
    this.state = this.getInitialState()
  }

  prepareDataSourceOptions(
    formDataset: IFormDataSet[]
  ): IDataSourceSelectOption[] {
    const { selectedLanguage, intl } = this.props

    const dataSourceOptions =
      formDataset.map((dataset) => {
        const optionsFromCSV = dataset?.options
          ?.map((option) => {
            const label = option?.label
              ? option.label.find((i) => i?.lang === selectedLanguage)
              : null

            if (label) {
              return {
                value: option.value,
                label: label.descriptor
              } as ISelectOption
            }
          })
          .filter((i) => i) as ISelectOption[]

        const datasetResourceLabel: { [key: string]: MessageDescriptor } = {
          HEALTH_FACILITY: formMessageDescriptors.healthInstitution,
          STATE: locationMessages.STATE,
          DISTRICT: locationMessages.DISTRICT,
          LOCATION_LEVEL_3: locationMessages.LOCATION_LEVEL_3,
          LOCATION_LEVEL_4: locationMessages.LOCATION_LEVEL_4,
          LOCATION_LEVEL_5: locationMessages.LOCATION_LEVEL_5
        }
        let label = dataset.fileName
        if (dataset.resource && dataset.resource in datasetResourceLabel) {
          label = intl.formatMessage(datasetResourceLabel[dataset.resource])
        }
        return {
          value: dataset._id,
          label,
          options: optionsFromCSV
        }
      }) || []
    for (let i = dataSourceOptions.length - 1; i >= 0; --i) {
      if (dataSourceOptions[i].options.length === 0) {
        dataSourceOptions.splice(i, 1)
      }
    }
    return dataSourceOptions
  }

  componentDidUpdate({ selectedField: { fieldId } }: IFullProps) {
    if (fieldId !== this.props.selectedField.fieldId) {
      this.setState(this.getInitialState())
    }
  }

  getInitialState() {
    const defaultLanguage = getDefaultLanguage()
    const languages = this.getLanguages()
    const { selectedField, formField } = this.props
    const fieldForms: { [key: string]: ICustomField } = {}
    const conditionalfield = selectedField.conditionals?.[0]

    Object.keys(languages).forEach((lang) => {
      const label = this.getIntlMessage(selectedField.label, lang)
      fieldForms[lang] = {
        label,
        placeholder: this.getIntlMessage(selectedField.placeholder, lang),
        description: this.getIntlMessage(selectedField.description, lang),
        tooltip: this.getIntlMessage(selectedField.tooltip, lang),
        errorMessage: this.getIntlMessage(selectedField.errorMessage, lang)
      }
    })

    return {
      handleBars: camelCase(fieldForms[defaultLanguage].label),
      selectedLanguage: defaultLanguage,
      conditionalField: {
        fieldId: conditionalfield?.fieldId ?? EMPTY_STRING,
        regex: conditionalfield?.regexp ?? EMPTY_STRING
      },
      maxLength: selectedField.maxLength ?? DEFAULT_MAX_LENGTH,
      fieldForms,
      showCSVUploadingModal: false,
      CSVUploadStatuses: [],
      CSVUploaderModalActions: [],
      dataSourceSelectOptions: this.prepareDataSourceOptions(
        this.props.formDataset || []
      ),
      selectedDataSource: this.props.selectedField.datasetId
    }
  }

  getIntlMessage(messages: IMessage[] | undefined, lang: string) {
    if (!messages) return ''
    const message = messages.find((message) => message.lang === lang)
    return message && message.descriptor
      ? message.descriptor.defaultMessage
      : ''
  }

  getLanguages(): ILanguageState {
    return initLanguages()
  }

  setConditionalFieldId(fieldId: string) {
    this.setState({
      conditionalField: {
        ...this.state.conditionalField,
        fieldId: fieldId
      }
    })
  }

  setValue(field: string, value: string) {
    const language = this.state.selectedLanguage
    this.setState({
      fieldForms: {
        ...this.state.fieldForms,
        [language]: {
          ...this.state.fieldForms[language],
          [field]: value
        }
      }
    })
  }

  isFormValid(): boolean {
    for (const lang in this.getLanguages()) {
      if (Boolean(this.state.fieldForms[lang].label) === false) return false
    }
    return true
  }

  isConditionalFormValid(): boolean {
    if (this.props.selectedField.conditionals) {
      return (
        !!this.state.conditionalField.fieldId &&
        !!this.state.conditionalField.regex
      )
    }
    return true
  }

  generateNewFieldID() {
    const { event, sectionId, groupId } = getIdentifiersFromFieldId(
      this.props.selectedField.fieldId
    )

    return `${event}.${sectionId}.${groupId}.${this.state.handleBars}`
  }

  doesContentExist(
    languages: ILanguageState,
    fieldForms: IFieldForms,
    key: string
  ): boolean {
    let contentExists = false
    for (const lang in languages) {
      const customField = fieldForms[lang]
      if (customField[key as keyof typeof customField]) {
        contentExists = true
      }
    }
    return contentExists
  }

  populateOptionalContent(
    fieldName: string,
    languages: ILanguageState,
    fieldForms: IFieldForms,
    key: string,
    optionalContent: IOptionalContent
  ) {
    if (this.doesContentExist(languages, fieldForms, key)) {
      optionalContent[key] = []
      for (const lang in languages) {
        const customField = fieldForms[lang]
        optionalContent[key].push({
          lang,
          descriptor: {
            id: `form.customField.${key}.${fieldName}`,
            description: 'Custom field attribute',
            defaultMessage: customField[key as keyof typeof customField] || ' '
          }
        })
      }
    }
  }

  prepareModifiedFormField(): ICustomConfigField {
    const { selectedField } = this.props
    const { fieldForms, handleBars, conditionalField } = this.state
    const languages = this.getLanguages()
    const newFieldID = this.generateNewFieldID()

    // later we can check the field type and not populate any content that isnt required for the type
    const optionalContent: IOptionalContent = {}
    this.populateOptionalContent(
      handleBars,
      languages,
      fieldForms,
      'placeholder',
      optionalContent
    )
    this.populateOptionalContent(
      handleBars,
      languages,
      fieldForms,
      'description',
      optionalContent
    )
    this.populateOptionalContent(
      handleBars,
      languages,
      fieldForms,
      'tooltip',
      optionalContent
    )
    this.populateOptionalContent(
      handleBars,
      languages,
      fieldForms,
      'errorMessage',
      optionalContent
    )

    const label = Object.keys(languages).map((lang) => ({
      lang,
      descriptor: {
        id: `form.customField.label.${handleBars}`,
        description: 'Custom field attribute',
        defaultMessage: this.state.fieldForms[lang].label
      }
    }))

    const modifiedField = {
      ...selectedField,
      placeholder: optionalContent.placeholder,
      tooltip: optionalContent.tooltip,
      description: optionalContent.description,
      errorMessage: optionalContent.errorMessage,
      fieldName: handleBars,
      fieldId: newFieldID,
      /* We can't let maxlength be 0 as it doesn't make any sense */
      maxLength: this.state.maxLength || DEFAULT_MAX_LENGTH,
      label
    }

    if (selectedField.conditionals) {
      modifiedField.conditionals = [
        {
          fieldId: conditionalField.fieldId,
          regexp: conditionalField.regex
        }
      ]
    }
    return modifiedField
  }

  isFieldNameDuplicate(): boolean {
    const { fieldsMap, selectedField } = this.props
    const newGeneratedFieldID = this.generateNewFieldID()

    if (selectedField.fieldId === newGeneratedFieldID) {
      return false
    }

    return fieldsMap.some((field) => {
      if (isPreviewGroupConfigField(field)) {
        return field.configFields.some(
          ({ fieldId }) => fieldId === newGeneratedFieldID
        )
      }
      return field.fieldId === newGeneratedFieldID
    })
  }

  getHeadingText(): string {
    const { selectedField, intl } = this.props

    switch (selectedField.fieldType) {
      case TEXT:
        return intl.formatMessage(
          customFieldFormMessages.customTextFieldHeading
        )
      case TEXTAREA:
        return intl.formatMessage(customFieldFormMessages.customTextAreaHeading)
      case NUMBER:
        return intl.formatMessage(
          customFieldFormMessages.customNumberFieldHeading
        )
      case TEL:
        return intl.formatMessage(
          customFieldFormMessages.customPhoneFieldHeading
        )
      case SELECT_WITH_OPTIONS:
        return intl.formatMessage(
          customFieldFormMessages.customSelectFieldHeading
        )
      case NATIONAL_ID_VERIFICATION:
        return intl.formatMessage(
          customFieldFormMessages.customNationalIdVerificationFieldHeading
        )
      default:
        return intl.formatMessage(
          customFieldFormMessages.customTextFieldHeading
        )
    }
  }

  getLanguageDropDown() {
    const initializeLanguages = this.getLanguages()
    const languageOptions = []
    for (const index in initializeLanguages) {
      languageOptions.push({
        label: initializeLanguages[index].displayName,
        value: index
      })
    }

    return (
      languageOptions.length > 1 && (
        <FieldContainer>
          <LanguageSelect
            hideBorder={true}
            value={this.state.selectedLanguage}
            onChange={(selectedLanguage: string) => {
              this.setState({ selectedLanguage })
            }}
            options={languageOptions}
          />
        </FieldContainer>
      )
    )
  }

  toggleButtons(fieldIds: string[]) {
    const { intl, selectedField } = this.props
    const initConditionals = [
      {
        fieldId: fieldIds[0],
        regexp: EMPTY_STRING
      }
    ]
    return (
      <ListContainer>
        <Title>{this.getHeadingText()}</Title>
        <ListViewSimplified bottomBorder>
          <ListViewItemSimplified
            label={
              <Label>
                {intl.formatMessage(customFieldFormMessages.requiredFieldLabel)}
                <ToolTip
                  label={intl.formatMessage(
                    messages.requiredForRegistrationTooltip
                  )}
                  id={'required-field-label'}
                />
              </Label>
            }
            actions={<RequiredToggleAction {...selectedField} />}
          />
          <ListViewItemSimplified
            label={
              <Label>
                {intl.formatMessage(
                  customFieldFormMessages.conditionalFieldLabel
                )}
                <ToolTip
                  label={intl.formatMessage(
                    messages.conditionalForRegistrationTooltip
                  )}
                  id={'conditional-field-label'}
                />
              </Label>
            }
            actions={
              <ConditionalToggleAction
                {...selectedField}
                initConditionals={initConditionals}
              />
            }
          />
        </ListViewSimplified>
      </ListContainer>
    )
  }

  conditionalParameters(fieldIds: string[]) {
    const { intl } = this.props
    const fieldIdOptions = fieldIds.map((fieldId) => ({
      value: fieldId,
      label: fieldId
    }))

    return (
      <FieldContainer>
        <ConditionalWrapper>
          <Stack>
            <Icon name="GitBranch" color="grey600" />
            <Title>
              {intl.formatMessage(
                customFieldFormMessages.conditionalFieldHeaderLabel
              )}
            </Title>
          </Stack>
          <Text variant="reg14" element="span" color="grey500">
            {intl.formatMessage(customFieldFormMessages.conditionalFieldDesc)}
          </Text>
          <>
            <ConditionalFieldIdSelect
              id="selectConditionalField"
              isDisabled={false}
              onChange={(val: string) => {
                this.setConditionalFieldId(val)
                this.props.modifyConfigField(this.props.selectedField.fieldId, {
                  conditionals: [
                    {
                      fieldId: val,
                      regexp: this.state.conditionalField.regex
                    }
                  ]
                })
              }}
              value={
                this.state.conditionalField.fieldId ||
                this.setConditionalFieldId(fieldIds[0])
              }
              options={fieldIdOptions}
            />
          </>
          <CInputField
            id={`conditional-regex-input`}
            required={true}
            label={intl.formatMessage(
              customFieldFormMessages.conditionalRegexField
            )}
            touched={true}
          >
            <CTextInput
              value={this.state.conditionalField.regex}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                this.setState({
                  conditionalField: {
                    fieldId: this.state.conditionalField.fieldId,
                    regex: event.target.value.replaceAll('"', '')
                  }
                })
              }
            />
          </CInputField>
        </ConditionalWrapper>
      </FieldContainer>
    )
  }

  inputFields() {
    const { intl, formField } = this.props
    const languages = this.getLanguages()
    const defaultLanguage = getDefaultLanguage()
    return (
      <>
        {this.getLanguageDropDown()}
        {Object.keys(languages).map((language, index) => {
          return (
            <React.Fragment key={index}>
              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <CInputField
                  id={`custom-form-label-${language}`}
                  label={intl.formatMessage(customFieldFormMessages.label)}
                  touched={true}
                >
                  <CTextInput
                    value={this.state.fieldForms[language].label}
                    onChange={(event: any) => {
                      const { value } = event.target
                      this.setState({
                        handleBars:
                          defaultLanguage === this.state.selectedLanguage
                            ? camelCase(
                                value || getCertificateHandlebar(formField)
                              )
                            : this.state.handleBars,
                        fieldForms: {
                          ...this.state.fieldForms,
                          [this.state.selectedLanguage]: {
                            ...this.state.fieldForms[
                              this.state.selectedLanguage
                            ],
                            label: value
                          }
                        }
                      })
                    }}
                  />
                </CInputField>
                {this.isFieldNameDuplicate() && (
                  <Text variant="reg14" element="p" color="red">
                    {intl.formatMessage(customFieldFormMessages.duplicateField)}
                  </Text>
                )}
              </FieldContainer>

              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <CInputField
                  required={false}
                  id={`custom-form-placeholder-${language}`}
                  label={intl.formatMessage(
                    customFieldFormMessages.placeholderLabel
                  )}
                  touched={false}
                >
                  <CTextInput
                    value={this.state.fieldForms[language].placeholder}
                    onChange={(event: any) =>
                      this.setValue('placeholder', event.target.value)
                    }
                  />
                </CInputField>
              </FieldContainer>

              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <CInputField
                  id={`custom-form-description-${language}`}
                  label={intl.formatMessage(
                    customFieldFormMessages.descriptionLabel
                  )}
                  required={false}
                  touched={false}
                >
                  <CTextArea
                    ignoreMediaQuery={true}
                    {...{
                      onChange: (event: any) => {
                        this.setValue('description', event.target.value)
                      },
                      value: this.state.fieldForms[language].description
                    }}
                  />
                </CInputField>
              </FieldContainer>

              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <CInputField
                  required={false}
                  id={`custom-form-tooltip-${language}`}
                  label={intl.formatMessage(
                    customFieldFormMessages.tooltipLabel
                  )}
                  touched={false}
                >
                  <CTextInput
                    onChange={(event: any) =>
                      this.setValue('tooltip', event.target.value)
                    }
                    value={this.state.fieldForms[language].tooltip}
                  />
                </CInputField>
              </FieldContainer>

              {/*errorMessage is not implemented yet*/}
              {/*
              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <CInputField
                  required={false}
                  id={`custom-form-error-message-${language}`}
                  label={intl.formatMessage(
                    customFieldFormMessages.errorMessage
                  )}
                  touched={false}
                >
                  <CTextArea
                    ignoreMediaQuery={true}
                    {...{
                      onChange: (event: any) => {
                        this.setValue('errorMessage', event.target.value)
                      },
                      value: this.state.fieldForms[language].errorMessage
                    }}
                  />
                </CInputField>
              </FieldContainer>
            */}
            </React.Fragment>
          )
        })}
        <FieldContainer>
          <CInputField
            required={false}
            id="custom-form-max-length"
            label={intl.formatMessage(customFieldFormMessages.maxLengthLabel)}
            touched={false}
          >
            <CTextInput
              type="number"
              defaultValue={this.state.maxLength}
              onChange={(event: { target: { value: string | number } }) =>
                this.setState({
                  maxLength: +event.target.value
                })
              }
            />
          </CInputField>
        </FieldContainer>
      </>
    )
  }

  showErrorMessage(errCode: string) {
    const { intl } = this.props
    const messages: IntlMessages = {
      SUCCESSFUL: intl.formatMessage(customFieldFormMessages.statusValidated),
      NO_DATA_FOUND: intl.formatMessage(
        customFieldFormMessages.statusNoDataFound
      ),
      TRANSLATION_MISSING: intl.formatMessage(
        customFieldFormMessages.statusTranslationMissing
      ),
      FAILED: intl.formatMessage(customFieldFormMessages.statusFailed)
    }

    if (errCode in messages) return messages[errCode]
    return messages.FAILED
  }

  selectField() {
    const { intl, formField } = this.props
    const languages = this.getLanguages()
    const defaultLanguage = getDefaultLanguage()

    return (
      <>
        <Text variant="bold16" element="p">
          <CustomSelectHeading>
            <Icon color="currentColor" name="Type" size="large" />
            {intl.formatMessage(customFieldFormMessages.copyHeading)}
          </CustomSelectHeading>
        </Text>
        <Text color="grey500" variant="reg14" element="span">
          {intl.formatMessage(customFieldFormMessages.copyDescription)}
        </Text>
        <br></br>
        <br></br>

        {this.getLanguageDropDown()}

        {Object.keys(languages).map((language, index) => {
          return (
            <React.Fragment key={index}>
              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <CInputField
                  id={`custom-form-label-${language}`}
                  label={intl.formatMessage(customFieldFormMessages.label)}
                  touched={true}
                >
                  <CTextInput
                    value={this.state.fieldForms[language].label}
                    onChange={(event: any) => {
                      const { value } = event.target
                      this.setState({
                        handleBars:
                          defaultLanguage === this.state.selectedLanguage
                            ? camelCase(
                                value || getCertificateHandlebar(formField)
                              )
                            : this.state.handleBars,
                        fieldForms: {
                          ...this.state.fieldForms,
                          [this.state.selectedLanguage]: {
                            ...this.state.fieldForms[
                              this.state.selectedLanguage
                            ],
                            label: value
                          }
                        }
                      })
                    }}
                  />
                </CInputField>
              </FieldContainer>
            </React.Fragment>
          )
        })}

        <Text variant="bold16" element="p">
          <CustomSelectHeading>
            <Icon color="currentColor" name="Database" size="large" />
            {intl.formatMessage(customFieldFormMessages.dataSourceHeading)}
          </CustomSelectHeading>
        </Text>
        <Text color="grey500" variant="reg14" element="span">
          {intl.formatMessage(customFieldFormMessages.dataSourceDescription)}
          &nbsp;
        </Text>
        <Link
          onClick={() => {
            window.open('https://documentation.opencrvs.org/', '_blank')
          }}
          font="reg14"
        >
          documentation.opencrvs.org
        </Link>
        {this.CSVUploadModal()}

        <CSelect
          value={this.state.selectedDataSource}
          onChange={(selectedDataSource: string) => {
            this.dataSourceSelected(selectedDataSource)
          }}
          options={this.state.dataSourceSelectOptions.map((option) => ({
            label: option.label,
            value: option.value
          }))}
        />

        <FileSelectLink
          id="upload-data-source"
          accept=".csv"
          handleFileChange={this.onFileChangeHandler.bind(this)}
          title={intl.formatMessage(buttonMessages.upload)}
        />
        <br></br>
        <br></br>
      </>
    )
  }

  dataSourceSelected(selectedDataSource: string) {
    const { selectedField, modifyConfigField, formDataset } = this.props

    const dataSourceSelectOptions = this.prepareDataSourceOptions(
      formDataset || []
    )
    this.setState({ selectedDataSource, dataSourceSelectOptions })

    const options = dataSourceSelectOptions.find(
      (option) => option.value === selectedDataSource
    )

    const modifiedField = {
      options: options ? (options.options as ICustomSelectOption[]) : [],
      datasetId: selectedDataSource
    }
    modifyConfigField(selectedField.fieldId, modifiedField)
  }

  async onFileChangeHandler(file: File) {
    const { intl, offlineFormConfigAddFormDataset } = this.props
    try {
      const encodedFile = await getBase64String(file)
      const base64Data = (encodedFile as string).split(',')[1]
      const fileName = file.name

      this.setState({
        showCSVUploadingModal: true,
        CSVUploadStatuses: [
          {
            message: intl.formatMessage(
              customFieldFormMessages.statusValidating
            ),
            statusType: STATUS_TYPES.INPROGRESS
          }
        ]
      })
      const res = await client.mutate<CreateFormDatasetMutation>({
        mutation: CREATE_FORM_DATA_SET,
        variables: { formDataset: { fileName, base64Data } }
      })

      if (res?.data?.createFormDataset?.data?._id) {
        const { _id, fileName, options } = res.data.createFormDataset.data
        const newDataSource: IFormDataSet = {
          _id,
          fileName,
          options: options as ICustomSelectOption[]
        }
        offlineFormConfigAddFormDataset(newDataSource)
        this.dataSourceSelected(res.data.createFormDataset.data._id)
      }
      this.setState({
        CSVUploaderModalActions: [],
        CSVUploadStatuses: [
          {
            message: intl.formatMessage(
              customFieldFormMessages.statusValidated
            ),
            statusType: STATUS_TYPES.COMPLETED
          },
          {
            message: intl.formatMessage(
              customFieldFormMessages.statusAppliedToCustomSelect
            ),
            statusType: STATUS_TYPES.COMPLETED
          }
        ]
      })
    } catch (ex: any) {
      this.setState({
        CSVUploadStatuses: [
          {
            message: this.showErrorMessage(ex.message as string),
            statusType: STATUS_TYPES.ERROR
          }
        ],
        CSVUploaderModalActions: [
          <Button onClick={this.closeCSVUploadModal.bind(this)} type="tertiary">
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <CFileSelectLink
            id="upload-data-source"
            accept=".csv"
            handleFileChange={this.onFileChangeHandler.bind(this)}
            title={intl.formatMessage(buttonMessages.upload)}
          />
        ]
      })
    }
  }

  saveButton() {
    const { intl, selectedField, modifyConfigField, setSelectedField } =
      this.props
    const debouncedNullifySelectedField = debounce(() => {
      setSelectedField(null)
    }, 300)

    return (
      <ListContainer>
        <ListRow>
          <ListColumn>
            <CPrimaryButton
              id={'custom-tool-save-button'}
              onClick={() => {
                const modifiedField = this.prepareModifiedFormField()
                modifyConfigField(selectedField.fieldId, modifiedField)
                debouncedNullifySelectedField()
              }}
              disabled={
                !this.isFormValid() ||
                !this.isConditionalFormValid() ||
                this.isFieldNameDuplicate()
              }
            >
              {intl.formatMessage(buttonMessages.save)}
            </CPrimaryButton>
          </ListColumn>
        </ListRow>
      </ListContainer>
    )
  }

  closeCSVUploadModal() {
    this.setState({ showCSVUploadingModal: false })
  }

  CSVUploadModal() {
    const { intl } = this.props
    return (
      <ResponsiveModal
        title={intl.formatMessage(customFieldFormMessages.validatingCSVFile)}
        handleClose={this.closeCSVUploadModal.bind(this)}
        show={this.state.showCSVUploadingModal}
        actions={this.state.CSVUploaderModalActions}
      >
        <>
          {intl.formatMessage(
            customFieldFormMessages.validatingCSVFilesValidatingDescription
          )}
          <br />
          <br />

          {this.state.CSVUploadStatuses.map((status, key) => {
            return (
              <>
                <Alert
                  key={key}
                  onActionClick={() => {}}
                  type={status.statusType}
                >
                  {status.message}
                </Alert>
                <br />
              </>
            )
          })}
        </>
      </ResponsiveModal>
    )
  }

  showHandlebar() {
    const { selectedField, intl } = this.props
    const customHandlebarName = createCustomFieldHandlebarName(
      selectedField.fieldId
    )
    return (
      <Body>
        <Stack>
          <Text variant="bold14" element="span" color="grey600">
            {intl.formatMessage(customFieldFormMessages.handleBardHeading)}
          </Text>
          <ToolTip
            label={intl.formatMessage(messages.certHandelbarsTooltip)}
            id={'cert-handelbars'}
          />
        </Stack>
        <Text variant="reg14" element="span" color="grey500">
          {`{{ ${customHandlebarName} }}`}
        </Text>
      </Body>
    )
  }

  render(): React.ReactNode {
    const { intl, selectedField } = this.props
    return (
      <>
        <RegisterFormFieldIds>
          {(fieldIds: string[]) => (
            <>
              {this.toggleButtons(fieldIds)}
              {!isEmpty(selectedField.conditionals) &&
                this.conditionalParameters(fieldIds)}
            </>
          )}
        </RegisterFormFieldIds>

        {selectedField.fieldType !== SELECT_WITH_OPTIONS && this.inputFields()}
        {selectedField.fieldType === SELECT_WITH_OPTIONS && this.selectField()}
        {this.saveButton()}
        {this.showHandlebar()}
      </>
    )
  }
}

function withFieldDefinition<T extends { selectedField: ICustomConfigField }>(
  WrappedComponent: React.ComponentType<T & IFormFieldWrapper>
) {
  return function WithFieldDefinition(props: T) {
    const formField = useFieldDefinition(props.selectedField)
    return <WrappedComponent formField={formField} {...props} />
  }
}

const mapStateToProps = (store: IStoreState, props: IProps) => {
  const { event, section } = props
  return {
    fieldsMap: selectConfigFields(store, event, section),
    facilities: store.offline.offlineData.facilities,
    selectedLanguage: store.i18n.language,
    formDataset: store.formConfig.formDataset
  }
}

const mapDispatchToProps = {
  modifyConfigField,
  offlineFormConfigAddFormDataset
}

export const CustomFieldTools = connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(withFieldDefinition(CustomFieldToolsComp)))
