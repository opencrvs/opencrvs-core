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
import { Link } from '../Link'
import { Stack } from '../Stack'
import { Text } from '../Text'
import styled from 'styled-components'

const Container = styled.div`
  font-size: 14px !important;
`

export interface IBreadCrumbData {
  paramId: string | null | undefined
  label: string | null
}

export interface IBreadCrumbProps {
  items: IBreadCrumbData[]
  onSelect: (x: IBreadCrumbData) => void
}

export const BreadCrumb = ({ items = [], onSelect }: IBreadCrumbProps) => {
  const isLast = (index: number): boolean => {
    return index === items.length - 1
  }

  return (
    <Container >
      <Stack gap={4} direction="row" wrap>
        {items.length > 0 &&
          items.map((x, idx) => {
            return (
              <>
                {idx > 0 && (
                  <Text variant="bold14" element="span">
                    /
                  </Text>
                )}
                <div key={idx}>
                  {!isLast(idx) ? (
                    <Link
                      color={'primary'}
                      font={'bold14'}
                      onClick={(e) => {
                        e.preventDefault()
                        if (onSelect) onSelect(x)
                      }}
                    >
                      {x?.label}
                    </Link>
                  ) : (
                    <Text variant={'bold14'} element={'span'}>
                      {x?.label}
                    </Text>
                  )}
                </div>
              </>
            )
          })}
      </Stack>
    </Container>
  )
}
