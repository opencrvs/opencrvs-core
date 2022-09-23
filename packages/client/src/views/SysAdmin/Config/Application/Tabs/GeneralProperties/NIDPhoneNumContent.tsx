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

import React from 'react'
import styled from '@client/styledComponents'
import { InputField } from '@opencrvs/components/lib/forms'
import { IntlShape } from 'react-intl'
import { messages } from '@client/i18n/messages/views/config'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import SuccessSmall from '@opencrvs/components/lib/icons/SuccessSmall'
import { Cross } from '@opencrvs/components/lib/icons/Cross'
import {
  isValidRegEx,
  isValidExample
} from '@client/views/SysAdmin/Config/Application/utils'
import {
  Content,
  Field,
  HalfWidthInput
} from '@client/views/SysAdmin/Config/Application/Components'

const ErrorMessage = styled.div`
  ${({ theme }) => theme.fonts.bold14}
  color: ${({ theme }) => theme.colors.red};
  height: 21px;
  margin-top: 6px;
  margin-bottom: 10px;
`

const ExampleSuccessMessage = styled.div`
  ${({ theme }) => theme.fonts.bold14};
  color: ${({ theme }) => theme.colors.green};
`

const ExampleErrorMessage = styled.div`
  ${({ theme }) => theme.fonts.bold14};
  color: ${({ theme }) => theme.colors.red};
`

const InputContainer = styled.div<{
  displayFlex?: boolean
}>`
  width: 100%;
  ${({ displayFlex }) =>
    displayFlex &&
    ` display: flex;
      flex-flow: row;
    `}
`

const ExampleValidityContainer = styled.div`
  margin-top: 40px;
  margin-left: 17px;
  display: flex;
  height: 21px;
`

const ValidityIconContainer = styled.div`
  margin-top: auto;
  margin-right: 8px;
`

const LinkButtonContainer = styled(LinkButton)`
  margin-top: 13px;
  ${({ theme }) => theme.fonts.bold14}
`

interface IProps {
  intl: IntlShape
  changeModalName: string
  pattern: string
  example: string
  setPattern: (event: React.ChangeEvent<HTMLInputElement>) => void
  setExample: (event: React.ChangeEvent<HTMLInputElement>) => void
  patternErrorMessage: string
}

function ContentComponent({
  intl,
  changeModalName,
  pattern,
  example,
  setPattern,
  setExample,
  patternErrorMessage
}: IProps) {
  const [showExampleValidation, setShowExampleValidation] =
    React.useState(false)
  return (
    <Content>
      <Field>
        <InputContainer>
          <InputField
            id={`${changeModalName}Input`}
            touched={false}
            required={true}
            label={intl.formatMessage(messages.pattern)}
            error={patternErrorMessage}
            ignoreMediaQuery={true}
          >
            <HalfWidthInput
              id={`${changeModalName}Input`}
              type="text"
              error={!isValidRegEx(pattern)}
              value={pattern}
              onChange={setPattern}
              ignoreMediaQuery={true}
            />
          </InputField>
          <ErrorMessage id={`${changeModalName}-regex-error`}>
            {!isValidRegEx(pattern) && patternErrorMessage}
          </ErrorMessage>
        </InputContainer>
        <InputContainer displayFlex={true}>
          <div>
            <InputField
              id={`${changeModalName}Example`}
              touched={false}
              required={false}
              label={intl.formatMessage(messages.example)}
              ignoreMediaQuery={true}
            >
              <HalfWidthInput
                id={`${changeModalName}ExampleInput`}
                type="text"
                error={false}
                value={example}
                onChange={setExample}
                ignoreMediaQuery={true}
              />
            </InputField>
            <LinkButtonContainer
              id={`test-${changeModalName}-example`}
              onClick={() => {
                setShowExampleValidation(true)
              }}
            >
              {intl.formatMessage(messages.testNumber)}
            </LinkButtonContainer>
          </div>
          {showExampleValidation && (
            <ExampleValidityContainer>
              {isValidExample(pattern, example) ? (
                <>
                  <ValidityIconContainer>
                    <SuccessSmall
                      id={`${changeModalName}-example-valid-icon`}
                    />
                  </ValidityIconContainer>
                  <ExampleSuccessMessage
                    id={`${changeModalName}-example-valid-message`}
                  >
                    {intl.formatMessage(messages.validExample)}
                  </ExampleSuccessMessage>
                </>
              ) : (
                <>
                  <ValidityIconContainer>
                    <Cross
                      color={'red'}
                      id={`${changeModalName}-example-invalid-icon`}
                    />
                  </ValidityIconContainer>
                  <ExampleErrorMessage
                    id={`${changeModalName}-example-invalid-message`}
                  >
                    {intl.formatMessage(messages.invalidExample)}
                  </ExampleErrorMessage>
                </>
              )}
            </ExampleValidityContainer>
          )}
        </InputContainer>
      </Field>
    </Content>
  )
}

export default ContentComponent
