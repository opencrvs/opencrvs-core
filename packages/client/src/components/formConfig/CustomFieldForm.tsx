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
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Toggle } from '@opencrvs/components/lib/buttons/Toggle'
import { TextArea, TextInput } from '@opencrvs/components/lib/forms'
import { InputField } from '@opencrvs/components/lib/forms/InputField/InputField'
import { Box } from '@opencrvs/components/lib/interface'
import * as React from 'react'
import {
  injectIntl,
  IntlShape,
  WrappedComponentProps as IntlShapeProps
} from 'react-intl'
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

const ListContainer = styled.div`
  margin-bottom: 26px;
`

const ListRow = styled.div`
  ${({ theme }) => theme.fonts.reg18};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: solid 1px ${({ theme }) => theme.colors.grey200};
  padding: 8px 0;
`

const ListColumn = styled.div``

type IFullProps = {
  intl: IntlShape
} & IntlShapeProps

interface ICustomFieldForms {}

class CustomFieldFormsComp extends React.Component<
  IFullProps,
  ICustomFieldForms
> {
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
              <Toggle selected={false} onChange={() => alert('Changed')} />
            </RightAlignment>
          </ListColumn>
        </ListRow>
        <ListRow>
          <ListColumn>
            {intl.formatMessage(customFieldFormMessages.requiredFieldLabel)}
          </ListColumn>
          <ListColumn>
            <RightAlignment>
              <Toggle selected={false} onChange={() => alert('Changed')} />
            </RightAlignment>
          </ListColumn>
        </ListRow>
      </ListContainer>
    )
  }

  inputFields() {
    const { intl } = this.props
    return (
      <>
        <FieldContainer>
          <InputField
            id="custom-form-label"
            label={intl.formatMessage(customFieldFormMessages.label)}
            touched={false}
          >
            <TextInput />
          </InputField>
        </FieldContainer>

        <FieldContainer>
          <InputField
            required={false}
            id="custom-form-placeholder"
            label={intl.formatMessage(customFieldFormMessages.placeholderLabel)}
            touched={false}
          >
            <TextInput />
          </InputField>
        </FieldContainer>

        <FieldContainer>
          <InputField
            required={false}
            id="custom-form-description"
            label={intl.formatMessage(customFieldFormMessages.descriptionLabel)}
            touched={false}
          >
            <TextArea />
          </InputField>
        </FieldContainer>

        <FieldContainer>
          <InputField
            required={false}
            id="custom-form-tooltip"
            label={intl.formatMessage(customFieldFormMessages.descriptionLabel)}
            touched={false}
          >
            <TextInput />
          </InputField>
        </FieldContainer>

        <FieldContainer>
          <InputField
            required={false}
            id="custom-form-error-message"
            label={intl.formatMessage(customFieldFormMessages.errorMessage)}
            touched={false}
          >
            <TextArea />
          </InputField>
        </FieldContainer>

        <FieldContainer>
          <InputField
            required={false}
            id="custom-form-max-length"
            label={intl.formatMessage(customFieldFormMessages.maxLengthLabel)}
            touched={false}
          >
            <TextInput />
          </InputField>
        </FieldContainer>

        <CPrimaryButton onClick={() => {}} disabled={true}>
          {intl.formatMessage(buttonMessages.save)}
        </CPrimaryButton>
      </>
    )
  }

  render(): React.ReactNode {
    return (
      <CustomFieldFormContainer>
        {this.toggleButtons()}
        {this.inputFields()}
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
