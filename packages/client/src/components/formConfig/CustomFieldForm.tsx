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
  Event
} from '@client/forms'
import { modifyConfigField } from '@client/forms/configuration/configFields/actions'
import {
  CUSTOM_GROUP_NAME,
  getCertificateHandlebar,
  getEventSectionGroupFromFieldID,
  ICustomConfigField,
  getFieldDefinition
} from '@client/forms/configuration/configFields/utils'
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
import { camelCase } from 'lodash'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProp } from 'react-intl'
import { connect } from 'react-redux'
import { getRegisterFormSection } from '@client/forms/register/declaration-selectors'
import { selectConfigFields } from '@client/forms/configuration/configFields/selectors'

const CustomFieldFormContainer = styled(Box)`
  box-shadow: none;
  max-width: 348px;
  min-height: 100vh;
  margin-left: auto;
  padding: 0px;
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

const H4 = styled.span`
  ${({ theme }) => theme.fonts.bold14};
  display: flex;
  align-items: center;
  gap: 4px;
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

type IFullProps = IProps &
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

interface ICustomFieldState {
  isFieldDuplicate: boolean
  selectedLanguage: string
  handleBars: string
  hideField: string
  requiredField: boolean
  maxLength: number | undefined
  fieldForms: {
    [key: string]: ICustomField
  }
}

const DEFAULTS = {
  DISABLED: 'disabled'
}

class CustomFieldFormsComp extends React.Component<
  IFullProps,
  ICustomFieldState
> {
  constructor(props: IFullProps) {
    super(props)
    this._initialize()
  }

  _initialize() {
    const defaultLanguage = getDefaultLanguage()
    const languages = this._getLanguages()
    const { selectedField, formField } = this.props

    const fieldForms: { [key: string]: ICustomField } = {}

    Object.keys(languages).map((lang) => {
      fieldForms[lang] = {
        label: this._getIntlMessage(selectedField.label, lang),
        placeholder: this._getIntlMessage(selectedField.placeholder, lang),
        description: this._getIntlMessage(selectedField.description, lang),
        tooltip: this._getIntlMessage(selectedField.tooltip, lang),
        errorMessage: this._getIntlMessage(selectedField.errorMessage, lang)
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

  _getIntlMessage(messages: IMessage[] | undefined, lang: string) {
    if (!messages) return ''
    const message = messages.find((message) => message.lang === lang)
    return message ? this.props.intl.formatMessage(message.descriptor) : ''
  }

  _getLanguages(): ILanguageState {
    return initLanguages()
  }

  _setValue(field: string, value: string) {
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

  _isFormValid(): boolean {
    for (const lang in this._getLanguages()) {
      if (Boolean(this.state.fieldForms[lang].label) === false) return false
    }
    return true
  }

  _generateNewFieldID() {
    const { event, section } = getEventSectionGroupFromFieldID(
      this.props.selectedField.fieldId
    )

    return `${event}.${section}.${CUSTOM_GROUP_NAME}.${this.state.handleBars}`
  }

  _prepareModifiedFormField(): ICustomConfigField {
    const { selectedField, formField } = this.props
    const { fieldForms, handleBars } = this.state
    const dl = getDefaultLanguage()
    const languages = this._getLanguages()
    const newFieldID = this._generateNewFieldID()
    const modifiedField = { ...selectedField }

    modifiedField.required = this.state.requiredField
    modifiedField.enabled = this.state.hideField
    modifiedField.fieldId = newFieldID

    modifiedField.label = Object.keys(languages).map((lang) => ({
      lang,
      descriptor: {
        id: `form.customField.label.${handleBars}`,
        description: 'Custom field attribute',
        defaultMessage: this.state.fieldForms[lang].label
      }
    }))

    modifiedField.placeholder = Object.keys(languages).map((lang) => ({
      lang,
      descriptor: {
        id: `form.customField.placeholder.${handleBars}`,
        description: 'Custom field attribute',
        defaultMessage: fieldForms[lang].placeholder || ' '
      }
    }))

    modifiedField.description = Object.keys(languages).map((lang) => ({
      lang,
      descriptor: {
        id: `form.customField.description.${handleBars}`,
        description: 'Custom field attribute',
        defaultMessage: fieldForms[dl].description || ' '
      }
    }))

    modifiedField.tooltip = Object.keys(languages).map((lang) => ({
      lang,
      descriptor: {
        id: `form.customField.tooltip.${handleBars}`,
        description: 'Custom field attribute',
        defaultMessage: fieldForms[dl].tooltip || ' '
      }
    }))

    modifiedField.errorMessage = Object.keys(languages).map((lang) => ({
      lang,
      descriptor: {
        id: `form.customField.errorMessage.${getCertificateHandlebar(
          formField
        )}`,
        description: 'Custom field attribute',
        defaultMessage: fieldForms[lang].errorMessage || ' '
      }
    }))

    modifiedField.maxLength = this.state.maxLength

    return modifiedField
  }

  _isFieldNameDuplicate(): boolean {
    const { fieldsMap, selectedField } = this.props
    const newGeneratedFieldID = this._generateNewFieldID()

    if (selectedField.fieldId === newGeneratedFieldID) {
      return false
    }

    return newGeneratedFieldID in fieldsMap
  }

  _getHeadingText(): string {
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
    const initializeLanguages = this._getLanguages()
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
        <H3>{this._getHeadingText()}</H3>
        <ListRow>
          <ListColumn>
            {intl.formatMessage(customFieldFormMessages.hideFieldLabel)}
          </ListColumn>
          <ListColumn>
            <RightAlignment>
              <Toggle
                selected={this.state.hideField === DEFAULTS.DISABLED}
                onChange={() =>
                  this.setState({
                    hideField:
                      this.state.hideField === DEFAULTS.DISABLED
                        ? ''
                        : DEFAULTS.DISABLED
                  })
                }
              />
            </RightAlignment>
          </ListColumn>
        </ListRow>
        <ListRow>
          <ListColumn>
            {intl.formatMessage(customFieldFormMessages.requiredFieldLabel)}
            <StyledTooltip />
          </ListColumn>
          <ListColumn>
            <RightAlignment>
              <Toggle
                selected={this.state.requiredField}
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
    const { intl, selectedField, modifyConfigField, formField } = this.props
    const languages = this._getLanguages()
    const defaultLanguage = getDefaultLanguage()

    return (
      <>
        {Object.keys(languages).map((language, index) => {
          return (
            <React.Fragment key={index}>
              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <InputField
                  id={`custom-form-label-${language}`}
                  label={intl.formatMessage(customFieldFormMessages.label)}
                  touched={true}
                >
                  <TextInput
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
                </InputField>
              </FieldContainer>

              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <InputField
                  required={false}
                  id={`custom-form-placeholder-${language}`}
                  label={intl.formatMessage(
                    customFieldFormMessages.placeholderLabel
                  )}
                  touched={false}
                >
                  <TextInput
                    value={this.state.fieldForms[language].placeholder}
                    onChange={(event: any) =>
                      this._setValue('placeholder', event.target.value)
                    }
                  />
                </InputField>
              </FieldContainer>

              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <InputField
                  id={`custom-form-description-${language}`}
                  label={intl.formatMessage(
                    customFieldFormMessages.descriptionLabel
                  )}
                  required={false}
                  touched={false}
                >
                  <TextArea
                    ignoreMediaQuery={true}
                    {...{
                      onChange: (event: any) => {
                        this._setValue('description', event.target.value)
                      },
                      value: this.state.fieldForms[language].description
                    }}
                  />
                </InputField>
              </FieldContainer>

              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <InputField
                  required={false}
                  id={`custom-form-tooltip-${language}`}
                  label={intl.formatMessage(
                    customFieldFormMessages.tooltipLabel
                  )}
                  touched={false}
                >
                  <TextInput
                    onChange={(event: any) =>
                      this._setValue('tooltip', event.target.value)
                    }
                    value={this.state.fieldForms[language].tooltip}
                  />
                </InputField>
              </FieldContainer>

              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <InputField
                  required={false}
                  id={`custom-form-error-message-${language}`}
                  label={intl.formatMessage(
                    customFieldFormMessages.errorMessage
                  )}
                  touched={false}
                >
                  <TextArea
                    ignoreMediaQuery={true}
                    {...{
                      onChange: (event: any) => {
                        this._setValue('errorMessage', event.target.value)
                      },
                      value: this.state.fieldForms[language].errorMessage
                    }}
                  />
                </InputField>
              </FieldContainer>

              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <InputField
                  required={false}
                  id={`custom-form-max-length-${language}`}
                  label={intl.formatMessage(
                    customFieldFormMessages.maxLengthLabel
                  )}
                  touched={false}
                >
                  <TextInput
                    value={this.state.maxLength}
                    onChange={(event: any) =>
                      this.setState({
                        maxLength: event.target.value
                      })
                    }
                  />
                </InputField>
              </FieldContainer>
            </React.Fragment>
          )
        })}
        <ListContainer>
          <ListRow>
            <ListColumn>
              <CPrimaryButton
                onClick={() => {
                  if (this._isFieldNameDuplicate()) {
                    this.setState({
                      isFieldDuplicate: true
                    })
                    return
                  }
                  const modifiedField = this._prepareModifiedFormField()
                  modifyConfigField(selectedField.fieldId, modifiedField)
                }}
                disabled={!this._isFormValid()}
              >
                {intl.formatMessage(buttonMessages.save)}
              </CPrimaryButton>
            </ListColumn>
          </ListRow>
        </ListContainer>
      </>
    )
  }

  certificate() {
    const { intl } = this.props
    return (
      <FieldContainer>
        <H4>
          {intl.formatMessage(customFieldFormMessages.handleBardHeading)}
          <StyledTooltip />
        </H4>
        <GreyText>{`{{ ${this.state.handleBars} }}`}</GreyText>
      </FieldContainer>
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
        {this.certificate()}
      </CustomFieldFormContainer>
    )
  }
}

type IProps = {
  event: Event
  selectedField: ICustomConfigField
  section: BirthSection | DeathSection
}

const mapStateToProps = (store: IStoreState, props: IProps) => {
  const { event, selectedField, section } = props
  const formSection = getRegisterFormSection(store, section, event)
  return {
    fieldsMap: selectConfigFields(store, event, section),
    formField: getFieldDefinition(formSection, selectedField)
  }
}

const mapDispatchToProps = {
  modifyConfigField
}

export const CustomFieldForms = connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CustomFieldFormsComp))
