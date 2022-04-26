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
import { IMessage, NUMBER, TEL, TEXT, TEXTAREA } from '@client/forms'
import { ModifyCustomField } from '@client/forms/configuration/configFields/actions'
import { IEventTypes } from '@client/forms/configuration/configFields/reducer'
import {
  CUSTOM_GROUP_NAME,
  getCertificateHandlebar,
  getEventSectionGroupFromFieldID,
  IConfigFormField
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
import { injectIntl, IntlShape, MessageDescriptor } from 'react-intl'
import { connect } from 'react-redux'

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

const FieldContainer = styled.div`
  margin-bottom: 30px;
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

type IFullProps = {
  intl: IntlShape
  selectedField: IConfigFormField
  configFields: IEventTypes
} & {
  ModifyCustomField: typeof ModifyCustomField
}

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
    const { selectedField } = this.props

    const fieldForms: { [key: string]: ICustomField } = {}

    Object.keys(languages).map((lang) => {
      fieldForms[lang] = {
        label: this._getIntlMessage(
          selectedField.customizedFieldAttributes?.label,
          lang
        ),
        placeholder: this._getIntlMessage(
          selectedField.customizedFieldAttributes?.placeholder,
          lang
        ),
        description: this._getIntlMessage(
          selectedField.customizedFieldAttributes?.description,
          lang
        ),
        tooltip: this._getIntlMessage(
          selectedField.customizedFieldAttributes?.tooltip,
          lang
        ),
        errorMessage: this._getIntlMessage(
          selectedField.customizedFieldAttributes?.errorMessage,
          lang
        )
      }
    })

    this.state = {
      isFieldDuplicate: false,
      handleBars:
        getCertificateHandlebar(selectedField) ||
        camelCase(fieldForms[defaultLanguage].label),
      selectedLanguage: defaultLanguage,
      hideField: selectedField.enabled,
      requiredField: selectedField.required || false,
      maxLength: selectedField.customizedFieldAttributes?.maxLength,
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

  _prepareModifiedFormField(): IConfigFormField {
    const { selectedField } = this.props
    const { fieldForms, handleBars } = this.state
    const dl = getDefaultLanguage()
    const languages = this._getLanguages()
    const newFieldID = this._generateNewFieldID()
    const modifiedField = { ...selectedField }

    if (modifiedField.customizedFieldAttributes === undefined) {
      modifiedField.customizedFieldAttributes = {
        label: []
      }
    }

    modifiedField.required = this.state.requiredField
    modifiedField.enabled = this.state.hideField
    modifiedField.fieldId = newFieldID

    modifiedField.customizedFieldAttributes.label = Object.keys(languages).map(
      (lang) => ({
        lang,
        descriptor: {
          ...modifiedField.definition.label,
          defaultMessage: this.state.fieldForms[lang].label
        }
      })
    )

    modifiedField.customizedFieldAttributes.placeholder = Object.keys(
      languages
    ).map((lang) => ({
      lang,
      descriptor: {
        id: `form.customField.placeholder.${handleBars}`,
        description: 'Custom field attribute',
        defaultMessage: fieldForms[lang].placeholder || ' '
      }
    }))

    modifiedField.customizedFieldAttributes.description = Object.keys(
      languages
    ).map((lang) => ({
      lang,
      descriptor: {
        id: `form.customField.description.${handleBars}`,
        description: 'Custom field attribute',
        defaultMessage: fieldForms[dl].description || ' '
      }
    }))

    modifiedField.customizedFieldAttributes.tooltip = Object.keys(
      languages
    ).map((lang) => ({
      lang,
      descriptor: {
        id: `form.customField.tooltip.${handleBars}`,
        description: 'Custom field attribute',
        defaultMessage: fieldForms[dl].tooltip || ' '
      }
    }))

    modifiedField.customizedFieldAttributes.errorMessage = Object.keys(
      languages
    ).map((lang) => ({
      lang,
      descriptor: {
        id: `form.customField.errorMessage.${getCertificateHandlebar(
          modifiedField
        )}`,
        description: 'Custom field attribute',
        defaultMessage: fieldForms[lang].errorMessage || ' '
      }
    }))

    modifiedField.customizedFieldAttributes.maxLength = this.state.maxLength

    modifiedField.definition.name = newFieldID
    modifiedField.definition.label =
      modifiedField.customizedFieldAttributes.label.find(
        (item) => item.lang === dl
      )?.descriptor as MessageDescriptor

    modifiedField.definition.placeholder =
      modifiedField.customizedFieldAttributes.placeholder.find(
        (item) => item.lang === dl
      )?.descriptor as MessageDescriptor

    modifiedField.definition.description =
      modifiedField.customizedFieldAttributes.description.find(
        (item) => item.lang === dl
      )?.descriptor as MessageDescriptor

    modifiedField.definition.tooltip =
      modifiedField.customizedFieldAttributes.tooltip.find(
        (item) => item.lang === dl
      )?.descriptor as MessageDescriptor

    if (fieldForms[dl].tooltip.trim() === '') {
      delete modifiedField.definition.tooltip
    }

    if (modifiedField.definition.mapping?.template?.length !== undefined) {
      modifiedField.definition.mapping.template[0] = handleBars
    }

    return modifiedField
  }

  _isFieldNameDuplicate(): boolean {
    const { configFields, selectedField } = this.props
    const { event, section } = getEventSectionGroupFromFieldID(
      selectedField.fieldId
    )
    const newGeneratedFieldID = this._generateNewFieldID()

    if (selectedField.fieldId === newGeneratedFieldID) {
      return false
    }

    return (
      newGeneratedFieldID in configFields[event as keyof IEventTypes][section]
    )
  }

  _getHeadingText(): string {
    const { selectedField, intl } = this.props

    switch (selectedField.definition.type) {
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
    const { intl, selectedField, ModifyCustomField } = this.props
    const languages = this._getLanguages()
    const defaultLanguage = getDefaultLanguage()

    return (
      <>
        {Object.keys(languages).map((language, index) => {
          return (
            <React.Fragment key={index}>
              <FieldContainer
                style={{
                  display:
                    language === this.state.selectedLanguage ? 'block' : 'none'
                }}
              >
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
                                value || getCertificateHandlebar(selectedField)
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

              <FieldContainer
                style={{
                  display:
                    language === this.state.selectedLanguage ? 'block' : 'none'
                }}
              >
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

              <FieldContainer
                style={{
                  display:
                    language === this.state.selectedLanguage ? 'block' : 'none'
                }}
              >
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

              <FieldContainer
                style={{
                  display:
                    language === this.state.selectedLanguage ? 'block' : 'none'
                }}
              >
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

              <FieldContainer
                style={{
                  display:
                    language === this.state.selectedLanguage ? 'block' : 'none'
                }}
              >
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

              <FieldContainer
                style={{
                  display:
                    language === this.state.selectedLanguage ? 'block' : 'none'
                }}
              >
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
                  ModifyCustomField(selectedField, modifiedField)
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

const mapStateToProps = (store: IStoreState) => {
  return {
    configFields: store.configFields as IEventTypes
  }
}

const mapDispatchToProps = {
  ModifyCustomField
}

export const CustomFieldForms = connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CustomFieldFormsComp))
