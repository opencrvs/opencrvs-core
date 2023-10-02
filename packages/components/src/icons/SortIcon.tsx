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
          width="13"
          height="8"
          viewBox="0 0 13 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.40698 6.82584C6.99907 7.19817 6.3398 7.1959 5.93446 6.82078L1.10095 2.34755C0.447086 1.74243 0.915189 0.713215 1.84282 0.716404L11.5405 0.749736C12.4681 0.752924 12.9291 1.78533 12.2711 2.38595L7.40698 6.82584Z"
            fill="#222222"
          />
        </svg>
      </Rotate>
    )
  } else {
    return (
      <svg
        width="12"
        height="8"
        viewBox="0 0 12 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.70581 6.82584C6.2979 7.19817 5.63863 7.1959 5.23329 6.82078L0.399778 2.34755C-0.254085 1.74243 0.214017 0.713215 1.14165 0.716404L10.8393 0.749736C11.7669 0.752924 12.228 1.78533 11.57 2.38595L6.70581 6.82584Z"
          fill="#CCCCCC"
        />
      </svg>
    )
  }
}
