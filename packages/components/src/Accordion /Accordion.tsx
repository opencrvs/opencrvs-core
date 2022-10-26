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

  details > summary::before {
    border-style: solid;
    border-width: 0.25em 0.25em 0 0;
    content: '';
    display: inline-block;
    height: 0.45em;
    position: relative;
    top: 0.15em;
    vertical-align: top;
    width: 0.45em;
    left: 0;
    transform: rotate(45deg);
  }

  details[open] > summary::before {
    top: 0;
    transform: rotate(135deg);
  }

  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
    cursor: pointer;
  }

  &:focus-within {
    background: ${({ theme }) => theme.colors.yellow};
    border-bottom: 3px solid ${({ theme }) => theme.colors.grey600};
  }
  /* 
  &:active {
    outline: 1px solid ${({ theme }) => theme.colors.grey600};
  }

  &:focus-within input {
    background: ${({ theme }) => theme.colors.white};
  } */

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.xl}px) {
    width: 100%;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 100%;
    margin: auto;
  }
`

const TextWrapper = styled.div``

const Details = styled.details``

const Summary = styled.summary`
  color: ${({ theme }) => theme.colors.primary};
  padding-bottom: 2px;
  text-decoration: underline;
  list-style-type: none;

  &::-webkit-details-marker {
    display: none;
  }
`

export const Accordion = () => (
  <Container>
    <h2>Select name</h2>
    <Details>
      <Summary>Show</Summary>
      <TextWrapper>Something small enough to escape casual notice.</TextWrapper>
    </Details>
  </Container>
)
