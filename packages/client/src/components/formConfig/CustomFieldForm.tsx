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
import { buttonMessages } from '@client/i18n/messages'
import { customFieldFormMessages } from '@client/i18n/messages/views/customFieldForm'
import { ILanguageState, initLanguages } from '@client/i18n/reducer'
import { getDefaultLanguage } from '@client/i18n/utils'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Toggle } from '@opencrvs/components/lib/buttons/Toggle'
import { Select, TextArea, TextInput } from '@opencrvs/components/lib/forms'
import { InputField } from '@opencrvs/components/lib/forms/InputField/InputField'
import { Box } from '@opencrvs/components/lib/interface'
import { camelCase } from 'lodash'
import * as React from 'react'
import { injectIntl, IntlShape } from 'react-intl'
import { connect } from 'react-redux'

const CustomFieldFormContainer = styled(Box)`
  box-shadow: none;
  border-left: 1px solid ${({ theme }) => theme.colors.grey300};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  max-width: 348px;
  min-height: 100vh;
  margin-left: auto;
  padding: 24px;
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
  ${({ theme }) => theme.fonts.reg18};
  color: ${({ theme }) => theme.colors.grey400};
`

const ListRow = styled.div`
  ${({ theme }) => theme.fonts.reg18};
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
}

interface ICustomFieldForms {
  selectedLanguage: string
  label: string
  handleBars: string
  hideField: boolean
  requiredField: boolean
}

const DEFAULTS = {
  LABEL: 'Custom Text Field'
}

class CustomFieldFormsComp extends React.Component<
  IFullProps,
  ICustomFieldForms
> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      label: DEFAULTS.LABEL,
      handleBars: camelCase(DEFAULTS.LABEL),
      selectedLanguage: getDefaultLanguage(),
      hideField: false,
      requiredField: false
    }
  }

  _getLanguages(): ILanguageState {
    // return initLanguages()
    return {
      en: { displayName: 'English', lang: 'en', messages: {} },
      fr: { displayName: 'French', lang: 'fr', messages: {} }
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
                onChange={() =>
                  this.setState({ requiredField: !this.state.requiredField })
                }
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

    return (
      <>
        {Object.keys(languages).map((language) => {
          return (
            <>
              <FieldContainer
                style={{
                  display:
                    language == this.state.selectedLanguage ? 'block' : 'none'
                }}
              >
                <InputField
                  id={`custom-form-label-${language}`}
                  label={intl.formatMessage(customFieldFormMessages.label)}
                  touched={false}
                >
                  <TextInput
                    onChange={(event: any) => {
                      const { value } = event.target
                      this.setState({
                        handleBars: camelCase(value || DEFAULTS.LABEL)
                      })
                      return event
                    }}
                  />
                </InputField>
              </FieldContainer>

              <FieldContainer
                style={{
                  display:
                    language == this.state.selectedLanguage ? 'block' : 'none'
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
                  <TextInput />
                </InputField>
              </FieldContainer>

              <FieldContainer
                style={{
                  display:
                    language == this.state.selectedLanguage ? 'block' : 'none'
                }}
              >
                <InputField
                  required={false}
                  id={`custom-form-description-${language}`}
                  label={intl.formatMessage(
                    customFieldFormMessages.descriptionLabel
                  )}
                  touched={false}
                >
                  <TextArea />
                </InputField>
              </FieldContainer>

              <FieldContainer
                style={{
                  display:
                    language == this.state.selectedLanguage ? 'block' : 'none'
                }}
              >
                <InputField
                  required={false}
                  id={`custom-form-tooltip-${language}`}
                  label={intl.formatMessage(
                    customFieldFormMessages.descriptionLabel
                  )}
                  touched={false}
                >
                  <TextInput />
                </InputField>
              </FieldContainer>

              <FieldContainer
                style={{
                  display:
                    language == this.state.selectedLanguage ? 'block' : 'none'
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
                  <TextArea />
                </InputField>
              </FieldContainer>

              <FieldContainer
                style={{
                  display:
                    language == this.state.selectedLanguage ? 'block' : 'none'
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
                  <TextInput />
                </InputField>
              </FieldContainer>
            </>
          )
        })}
        <ListContainer>
          <ListRow>
            <ListColumn>
              <CPrimaryButton onClick={() => {}} disabled={true}>
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
