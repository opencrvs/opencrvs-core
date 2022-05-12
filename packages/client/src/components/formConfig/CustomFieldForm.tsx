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
  IMessage,
  NUMBER,
  TEL,
  TEXT,
  TEXTAREA,
  BirthSection,
  DeathSection,
  Event,
  IFormField
} from '@client/forms'
import { modifyConfigField } from '@client/forms/configuration/formConfig/actions'
import {
  getCertificateHandlebar,
  ICustomConfigField
} from '@client/forms/configuration/formConfig/utils'
import { buttonMessages } from '@client/i18n/messages'
import { customFieldFormMessages } from '@client/i18n/messages/views/customFieldForm'
import { ILanguageState, initLanguages } from '@client/i18n/reducer'
import { getDefaultLanguage } from '@client/i18n/utils'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Toggle } from '@opencrvs/components/lib/buttons/Toggle'
import {
  InputField,
  Select,
  TextArea,
  TextInput
} from '@opencrvs/components/lib/forms'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { Tooltip } from '@opencrvs/components/lib/icons'
import { Box } from '@opencrvs/components/lib/interface'
import { camelCase, debounce } from 'lodash'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProp } from 'react-intl'
import { connect } from 'react-redux'
import { selectConfigFields } from '@client/forms/configuration/formConfig/selectors'
import { getConfigFieldIdentifiers } from '@client/forms/configuration/formConfig/motionUtils'
import { useFieldDefinition } from '@client/views/SysAdmin/Config/Forms/hooks'

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

const CTextArea = styled(TextArea)`
  ${({ theme }) => theme.fonts.reg14};
  height: 32px;
  background: ${({ theme }) => theme.colors.white};
  border: solid 1px ${({ theme }) => theme.colors.grey600};
`

const CustomFieldFormContainer = styled(Box)`
  box-shadow: none;
  max-width: 348px;
  min-height: 100vh;
  margin-left: auto;
  padding: 0px 3px;
  border: none;
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

const RightAlignment = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
`

const H3 = styled.h3`
  ${({ theme }) => theme.fonts.h3};
`

const ListContainer = styled.div`
  margin-bottom: 26px;
`

const GreyText = styled.span`
  ${({ theme }) => theme.fonts.reg14};
  color: ${({ theme }) => theme.colors.grey400};
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
  border: solid 2px ${({ theme }) => theme.colors.indigoDark};
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
    color: ${({ theme }) => theme.colors.indigoDark};
  }
`

const StyledTooltip = styled(Tooltip)`
  height: 16px;
  width: 16px;
`

const ListColumn = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const CErrorText = styled(ErrorText)`
  width: 200px;
`

type IFormFieldWrapper = { formField: IFormField }

type IProps = {
  event: Event
  selectedField: ICustomConfigField
  section: BirthSection | DeathSection
  groupId: string
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

interface ICustomFieldState {
  isFieldDuplicate: boolean
  selectedLanguage: string
  handleBars: string
  hideField: string
  requiredField: boolean
  maxLength: number | undefined
  fieldForms: IFieldForms
}

interface IOptionalContent {
  [key: string]: IMessage[]
}

class CustomFieldFormsComp extends React.Component<
  IFullProps,
  ICustomFieldState
> {
  constructor(props: IFullProps) {
    super(props)
    this.initialize()
  }

  initialize() {
    const defaultLanguage = getDefaultLanguage()
    const languages = this.getLanguages()
    const { selectedField, formField } = this.props

    const fieldForms: { [key: string]: ICustomField } = {}

    Object.keys(languages).map((lang) => {
      const label = this.getIntlMessage(selectedField.label, lang)
      fieldForms[lang] = {
        label,
        placeholder: this.getIntlMessage(selectedField.placeholder, lang),
        description: this.getIntlMessage(selectedField.description, lang),
        tooltip: this.getIntlMessage(selectedField.tooltip, lang),
        errorMessage: this.getIntlMessage(selectedField.errorMessage, lang)
      }
    })
    this.state = {
      isFieldDuplicate: false,
      handleBars:
        getCertificateHandlebar(formField) ||
        camelCase(fieldForms[defaultLanguage].label),
      selectedLanguage: defaultLanguage,
      hideField: selectedField.enabled,
      requiredField: selectedField.required || false,
      maxLength: selectedField.maxLength,
      fieldForms
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

  generateNewFieldID() {
    const { event, sectionId } = getConfigFieldIdentifiers(
      this.props.selectedField.fieldId
    )

    return `${event}.${sectionId}.${this.props.groupId}.${this.state.handleBars}`
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

  prepareModifiedFormField(defaultLanguage: string): ICustomConfigField {
    const { selectedField, formField } = this.props
    const { fieldForms, handleBars } = this.state
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
      required: this.state.requiredField,
      enabled: this.state.hideField,
      fieldId: newFieldID,
      label
    }
    modifiedField.maxLength = this.state.maxLength
    return modifiedField
  }

  isFieldNameDuplicate(): boolean {
    const { fieldsMap, selectedField } = this.props
    const newGeneratedFieldID = this.generateNewFieldID()

    if (selectedField.fieldId === newGeneratedFieldID) {
      return false
    }

    return newGeneratedFieldID in fieldsMap
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

  toggleButtons() {
    const { intl } = this.props
    return (
      <ListContainer>
        <H3>{this.getHeadingText()}</H3>
        <ListRow>
          <ListColumn>
            {intl.formatMessage(customFieldFormMessages.requiredFieldLabel)}
            <StyledTooltip />
          </ListColumn>
          <ListColumn>
            <RightAlignment>
              <Toggle
                defaultChecked={this.state.requiredField}
                onChange={() => {
                  this.setState({ requiredField: !this.state.requiredField })
                }}
              />
            </RightAlignment>
          </ListColumn>
        </ListRow>
      </ListContainer>
    )
  }

  inputFields() {
    const {
      intl,
      selectedField,
      modifyConfigField,
      formField,
      setSelectedField
    } = this.props
    const languages = this.getLanguages()
    const defaultLanguage = getDefaultLanguage()
    const debouncedNullifySelectedField = debounce(() => {
      setSelectedField(null)
    }, 300)
    return (
      <>
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

              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <CInputField
                  required={true}
                  id={`custom-form-max-length-${language}`}
                  label={intl.formatMessage(
                    customFieldFormMessages.maxLengthLabel
                  )}
                  touched={false}
                >
                  <CTextInput
                    type="number"
                    maxLength={this.state.maxLength || 250}
                    value={this.state.maxLength || 250}
                    onChange={(event: any) =>
                      this.setState({
                        maxLength: event.target.value
                      })
                    }
                  />
                </CInputField>
              </FieldContainer>
            </React.Fragment>
          )
        })}
        <ListContainer>
          <ListRow>
            <ListColumn>
              <CPrimaryButton
                onClick={() => {
                  if (this.isFieldNameDuplicate()) {
                    this.setState({
                      isFieldDuplicate: true
                    })
                    return
                  }
                  const modifiedField =
                    this.prepareModifiedFormField(defaultLanguage)
                  modifyConfigField(selectedField.fieldId, modifiedField)
                  debouncedNullifySelectedField()
                }}
                disabled={!this.isFormValid()}
              >
                {intl.formatMessage(buttonMessages.save)}
              </CPrimaryButton>
            </ListColumn>
          </ListRow>
        </ListContainer>
      </>
    )
  }

  render(): React.ReactNode {
    const { intl } = this.props
    return (
      <CustomFieldFormContainer>
        {this.toggleButtons()}
        {this.getLanguageDropDown()}
        {this.inputFields()}
        {this.state.isFieldDuplicate && (
          <CErrorText ignoreMediaQuery={true}>
            {intl.formatMessage(customFieldFormMessages.duplicateField)}
          </CErrorText>
        )}
      </CustomFieldFormContainer>
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
    fieldsMap: selectConfigFields(store, event, section)
  }
}

const mapDispatchToProps = {
  modifyConfigField
}

export const CustomFieldForms = connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(withFieldDefinition(CustomFieldFormsComp)))
