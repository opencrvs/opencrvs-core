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
import styled from 'styled-components'

interface ISortIcon {
  isSorted: boolean
  isDescending?: boolean
}

const Rotate = styled.div<{ isDescending?: boolean }>`
  ${({ isDescending }) => isDescending && `transform: rotate(180deg);`}
`

export const SortIcon = ({ isSorted, isDescending }: ISortIcon) => {
  if (isSorted) {
    return (
      <Rotate isDescending={isDescending}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.33325 3.33325H13.9999"
            stroke="#5B5B5B"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M7.33325 6H11.9999"
            stroke="#5B5B5B"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M7.33325 8.66675H9.99992"
            stroke="#5B5B5B"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M2 11.3333L4 13.3333L6 11.3333"
            stroke="#5B5B5B"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M4 12.0001V2.66675"
            stroke="#5B5B5B"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </Rotate>
    )
  } else {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.33325 3.33325H13.9999"
          stroke="#AAAAAA"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M7.33325 6H11.9999"
          stroke="#AAAAAA"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M7.33325 8.66675H9.99992"
          stroke="#AAAAAA"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M2 11.3333L4 13.3333L6 11.3333"
          stroke="#AAAAAA"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M4 12.0001V2.66675"
          stroke="#AAAAAA"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    )
  }
}
