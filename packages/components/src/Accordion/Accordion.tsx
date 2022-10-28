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
import styled from 'styled-components'

const Container = styled.div`
  box-sizing: border-box;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
  padding-bottom: 16px;
  width: 100%;

  details > summary::before {
    border-style: solid;
    border-width: 3px 3px 0 0;
    content: '';
    display: inline-block;
    height: 8px;
    position: relative;
    top: 7px;
    vertical-align: top;
    width: 8px;
    left: 0;
    margin-right: 10px;
    transform: rotate(45deg);
  }

  details[open] > summary::before {
    top: 0;
    transform: rotate(135deg);
  }

  details[open] > summary::after {
    content: attr(data-open);
  }

  details:not([open]) > summary::after {
    content: attr(data-close);
  }

  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
    cursor: pointer;
  }

  &:focus-within {
    background: ${({ theme }) => theme.colors.yellow};
    border-bottom: 3px solid ${({ theme }) => theme.colors.grey600};
  }

  &:has(details[open]) {
    background: ${({ theme }) => theme.colors.white};
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
  }
`
const Summary = styled.summary`
  ${({ theme }) => theme.fonts.bold18};
  color: ${({ theme }) => theme.colors.primary};
  padding-bottom: 2px;
  list-style-type: none;
  margin-top: 5px;
  display: inline;

  &:hover {
    text-decoration: underline;
  }

  &:focus-within {
    color: ${({ theme }) => theme.colors.grey600};
    text-decoration: underline;
  }

  &::-webkit-details-marker {
    display: none;
  }
`
const NestedChildren = styled.div`
  margin: 15px 0px 0px 18px;
  padding-left: 33px;
  border-left: 4px solid ${({ theme }) => theme.colors.copy};
  padding-top: 0px !important;
`
const List = styled.ul<{ flexDirection?: string }>`
  list-style: none;
  margin: 0;
  padding: 0;
  & > div {
    margin-bottom: 16px;
  }
  ${({ flexDirection }) =>
    flexDirection &&
    `display: flex;
    & > div {
      margin-right: 16px;
    }`}
`
export interface IAccordionOption {
  value: string
}

export interface IAccordionProps {
  name: string
  label: string
  options: IAccordionOption[]
  value: string
  nestedFields: { [key: string]: JSX.Element[] }
  onChange: (value: string) => void
}

function toggleDetails(value: string) {
  if (value === 'no') return false
  return true
}

export const Accordion = ({
  name,
  label,
  options,
  value,
  nestedFields,
  onChange
}: IAccordionProps) => {
  return (
    <Container>
      <h2>{label}</h2>
      <details onToggle={() => onChange(value)}>
        <Summary id={name} data-open="Hide" data-close="Show"></Summary>
        <List>
          {options.map((option, index) => {
            return (
              <div key={`nestedField-${index}`}>
                {nestedFields &&
                  value === option.value &&
                  nestedFields[value] && (
                    <NestedChildren>{nestedFields[value]}</NestedChildren>
                  )}
              </div>
            )
          })}
        </List>
      </details>
    </Container>
  )
}
