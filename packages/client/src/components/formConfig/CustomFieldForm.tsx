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
import * as React from 'react'
import { Box, ListView, Container } from '@opencrvs/components/lib/interface'
import { Toggle } from '@opencrvs/components/lib/buttons/Toggle'
import styled from '@client/styledComponents'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { IStoreState } from '@client/store'
import { InputField } from '@opencrvs/components/lib/forms/InputField/InputField'
import { TextInput, TextArea } from '@opencrvs/components/lib/forms'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

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

type IFullProps = {} & IntlShapeProps

interface ICustomFieldForms {}

class CustomFieldFormsComp extends React.Component<
  IFullProps,
  ICustomFieldForms
> {
  toggleButtons() {
    return (
      <ListView
        title="Custom text input"
        items={[
          {
            label: 'Hide Field',
            value: <Toggle selected={false} onChange={() => alert('Changed')} />
          },
          {
            label: 'Required for registration',
            value: <Toggle selected={false} onChange={() => alert('Changed')} />
          }
        ]}
      />
    )
  }

  inputFields() {
    return (
      <>
        <FieldContainer>
          <InputField id="custom-form-label" label="Label" touched={false}>
            <TextInput />
          </InputField>
          <FieldContainer></FieldContainer>
          <InputField
            id="custom-form-placeholder"
            label="Placeholder"
            touched={false}
          >
            <TextInput />
          </InputField>
        </FieldContainer>
        <FieldContainer>
          <InputField
            id="custom-form-description"
            label="Description"
            touched={false}
          >
            <TextArea />
          </InputField>
        </FieldContainer>
        <FieldContainer>
          <InputField id="custom-form-tooltip" label="Tooltip" touched={false}>
            <TextInput />
          </InputField>
          <FieldContainer></FieldContainer>
          <InputField
            id="custom-form-error-message"
            label="Error message"
            touched={false}
          >
            <TextArea />
          </InputField>
        </FieldContainer>
        <FieldContainer>
          <InputField
            id="custom-form-max-length"
            label="Max length"
            touched={false}
          >
            <TextInput />
          </InputField>
        </FieldContainer>

        <CPrimaryButton id="myButton" onClick={() => {}} disabled={true}>
          Save
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
