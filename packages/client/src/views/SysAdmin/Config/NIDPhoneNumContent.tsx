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
import { Content, Field, HalfWidthInput, isValidRegEx } from './DynamicModal'
import { InputField } from '@opencrvs/components/lib/forms'
import { IntlShape } from 'react-intl'
import { messages } from '@client/i18n/messages/views/config'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import SuccessSmall from '@opencrvs/components/lib/icons/SuccessSmall'
import { Cross } from '@opencrvs/components/lib/icons/Cross'

const ErrorMessageBottom = styled.div<{ marginTop?: number }>`
  position: relative;
  ${({ theme }) => theme.fonts.subtitleStyle};
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ marginTop }) => (marginTop ? `${marginTop}px` : `0px`)};
`

const SuccessMessage = styled.div`
  ${({ theme }) => theme.fonts.subtitleStyle};
  color: ${({ theme }) => theme.colors.success};
  margin-left: 9px;
`

const InputContainer = styled.div<{ displayFlex?: boolean }>`
  width: 100%;
  ${({ displayFlex }) =>
    displayFlex &&
    ` display: flex;
      flex-flow: row;
    `}

  padding-bottom: 32px;
  :last-child {
    padding-bottom: 0px;
  }
`

const ExampleValidityContainer = styled.div`
  margin-top: 40px;
  margin-left: 17px;
  display: flex;
  height: 21px;
`

const LinkButtonContainer = styled.div`
  margin-top: 13px;
`

interface IProps {
  intl: IntlShape
  changeModalName: string
  pattern: string
  example: string
  setPattern: (event: React.ChangeEvent<HTMLInputElement>) => void
  setExample: (event: React.ChangeEvent<HTMLInputElement>) => void
  isValidExample: (pattern: string, example: string) => boolean
  patternErrorMessage: string
}

function ContentComponent({
  intl,
  changeModalName,
  pattern,
  example,
  setPattern,
  setExample,
  isValidExample,
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
          <ErrorMessageBottom id="nid-regex-error" marginTop={6}>
            {!isValidRegEx(pattern) && patternErrorMessage}
          </ErrorMessageBottom>
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
            <LinkButtonContainer>
              <LinkButton
                id={`test-${changeModalName}-example`}
                onClick={() => {
                  setShowExampleValidation(true)
                }}
                textDecoration={'none'}
              >
                {intl.formatMessage(messages.testNumber)}
              </LinkButton>
            </LinkButtonContainer>
          </div>
          {showExampleValidation && (
            <ExampleValidityContainer>
              {isValidExample(pattern, example) ? (
                <>
                  <SuccessSmall id={`${changeModalName}-example-valid-icon`} />
                  <SuccessMessage
                    id={`${changeModalName}-example-valid-message`}
                  >
                    {intl.formatMessage(messages.validExample)}
                  </SuccessMessage>
                </>
              ) : (
                <>
                  <Cross
                    color={'red'}
                    id={`${changeModalName}-example-invalid-icon`}
                  />
                  <ErrorMessageBottom
                    id={`${changeModalName}-example-invalid-message`}
                  >
                    {intl.formatMessage(messages.invalidExample)}
                  </ErrorMessageBottom>
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
