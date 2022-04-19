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
import { IConfigFormField } from '@client/forms/configuration/configFields/utils'
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
import { Box } from '@opencrvs/components/lib/interface'
import { camelCase } from 'lodash'
import * as React from 'react'
import { injectIntl, IntlShape } from 'react-intl'
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
  ${({ theme }) => theme.fonts.bold16};
  display: block;
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

const ListColumn = styled.div``

type IFullProps = {
  intl: IntlShape
  selectedField: IConfigFormField
}

interface IFieldForm {
  label: string
  placeholder: string
  description: string
  tooltip: string
  errorMessage: string
  maxLength: string
}

interface ICustomFieldForms {
  selectedLanguage: string
  handleBars: string
  hideField: boolean
  requiredField: boolean
  fieldForms: {
    [key: string]: IFieldForm
  }
}

const DEFAULTS = {
  HANDLEBARS: 'Custom Text Field'
}

class CustomFieldFormsComp extends React.Component<
  IFullProps,
  ICustomFieldForms
> {
  constructor(props: IFullProps) {
    super(props)

    const defaultLanguage = getDefaultLanguage()
    const languages = this._getLanguages()

    const fieldForms: { [key: string]: IFieldForm } = {}
    Object.keys(languages).map((lang) => {
      fieldForms[lang] = {
        label: '',
        placeholder: '',
        description: '',
        tooltip: '',
        errorMessage: '',
        maxLength: ''
      }
    })

    this.state = {
      handleBars: camelCase(DEFAULTS.HANDLEBARS),
      selectedLanguage: defaultLanguage,
      hideField: false,
      requiredField: false,
      fieldForms
    }
  }

  _getLanguages(): ILanguageState {
    return initLanguages()
  }

  _setValue(field: string, value: string) {
    const language = this.state.selectedLanguage

    console.log(this.props.selectedField)

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

  _isFormValid() {
    for (const lang in this._getLanguages()) {
      if (Boolean(this.state.fieldForms[lang].label) === false) return false
    }
    return true
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
        <H3>
          {intl.formatMessage(customFieldFormMessages.customFieldFormHeading)}
        </H3>
        <ListRow>
          <ListColumn>
            {intl.formatMessage(customFieldFormMessages.hideFieldLabel)}
          </ListColumn>
          <ListColumn>
            <RightAlignment>
              <Toggle
                selected={this.state.hideField}
                onChange={() =>
                  this.setState({ hideField: !this.state.hideField })
                }
              />
            </RightAlignment>
          </ListColumn>
        </ListRow>
        <ListRow>
          <ListColumn>
            {intl.formatMessage(customFieldFormMessages.requiredFieldLabel)}
          </ListColumn>
          <ListColumn>
            <RightAlignment>
              <Toggle
                selected={this.state.requiredField}
                onChange={() => {
                  console.log('Required')
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
    const { intl } = this.props
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
                            ? camelCase(value || DEFAULTS.HANDLEBARS)
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
                      }
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
                      }
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
                    value={this.state.fieldForms[language].maxLength}
                    onChange={(event: any) =>
                      this._setValue('maxLength', event.target.value)
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
                onClick={() => {}}
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
      <>
        <H4>{intl.formatMessage(customFieldFormMessages.handleBardHeading)}</H4>
        <GreyText>{`{{ ${this.state.handleBars} }}`}</GreyText>
      </>
    )
  }

  render(): React.ReactNode {
    return (
      <CustomFieldFormContainer>
        {this.toggleButtons()}
        {this.getLanguageDropDown()}
        {this.inputFields()}
        {this.certificate()}
      </CustomFieldFormContainer>
    )
  }
}

const mapStateToProps = (state: IStoreState) => {
  return {}
}

const mapDispatchToProps = {}

export const CustomFieldForms = connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CustomFieldFormsComp))
