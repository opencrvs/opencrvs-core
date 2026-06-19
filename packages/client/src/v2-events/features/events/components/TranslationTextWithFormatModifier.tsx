/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import React, { ComponentProps } from 'react'
import { MessageDescriptor, useIntl } from 'react-intl'
import styled from 'styled-components'
import { Text } from '@opencrvs/components'

const StyledKbd = styled.kbd`
  /* stylelint-disable-next-line opencrvs/no-font-styles */
  font-family: monospace;
  /* stylelint-disable-next-line opencrvs/no-font-styles */
  font-size: 0.9em;
  padding: 1px 5px;
  border: 1px solid ${({ theme }) => theme.colors.grey400};
  border-bottom-width: 2px;
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.grey100};
`

const StyledCode = styled.code`
  /* stylelint-disable-next-line opencrvs/no-font-styles */
  font-family: monospace;
  /* stylelint-disable-next-line opencrvs/no-font-styles */
  font-size: 0.9em;
  padding: 1px 5px;
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.grey100};
`

export interface TranslationTextWithFormatModifierProps
  extends Omit<ComponentProps<typeof Text>, 'children'> {
  message: MessageDescriptor
}

/**
 * Renders a translated message as a Text component with automatic support for
 * inline tags in the translation string:
 *   <strong>, <b>, <em>, <i>, <u>, <mark>, <small>, <sub>, <sup>,
 *   <del>, <ins>, <code>, <kbd>, <q>
 * For line breaks use <br></br> — react-intl ignores self-closing <br/>.
 * For indentation use <tab></tab> (custom tag, renders a 2em inline spacer).
 *
 * Example translation:
 *   '<strong>WARNING!</strong>: Record will be <strong>legally registered</strong>.'
 */
export function TranslationTextWithFormatModifier({
  message,
  ...textProps
}: TranslationTextWithFormatModifierProps) {
  const intl = useIntl()

  return (
    <Text {...textProps}>
      {
        intl.formatMessage(message, {
          strong: (chunks: React.ReactNode[]) => <strong>{chunks}</strong>, // bold + semantic importance
          b: (chunks: React.ReactNode[]) => <b>{chunks}</b>, // bold, no semantic meaning
          em: (chunks: React.ReactNode[]) => <em>{chunks}</em>, // italic + semantic emphasis
          i: (chunks: React.ReactNode[]) => <i>{chunks}</i>, // italic, no semantic meaning
          u: (chunks: React.ReactNode[]) => <u>{chunks}</u>, // underline
          mark: (chunks: React.ReactNode[]) => <mark>{chunks}</mark>, // highlight
          small: (chunks: React.ReactNode[]) => <small>{chunks}</small>, // fine print / smaller text
          sub: (chunks: React.ReactNode[]) => <sub>{chunks}</sub>, // subscript e.g. H<sub>2</sub>O
          sup: (chunks: React.ReactNode[]) => <sup>{chunks}</sup>, // superscript e.g. x<sup>2</sup>
          del: (chunks: React.ReactNode[]) => <del>{chunks}</del>, // strikethrough / deleted text
          ins: (chunks: React.ReactNode[]) => <ins>{chunks}</ins>, // underline / inserted text
          code: (chunks: React.ReactNode[]) => (
            <StyledCode>{chunks}</StyledCode>
          ), // inline monospace code
          kbd: (chunks: React.ReactNode[]) => <StyledKbd>{chunks}</StyledKbd>, // keyboard input e.g. <kbd>Ctrl+S</kbd>
          q: (chunks: React.ReactNode[]) => <q>{chunks}</q>, // inline quotation with browser quote marks
          br: () => <br />, // line break — use <br></br> not <br/> (react-intl ignores self-closing)
           
          tab: () => <span style={{ display: 'inline-block', width: '2em' }} /> // indent — use <tab></tab>
        }) as React.ReactNode
      }
    </Text>
  )
}
