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
import {
  IWorkqueueRow,
  IconWrapper,
  ContentWrapper,
  Error
} from './WorkqueueRowDesktop'
import { IActionObject, IAction } from '../types'

const StyledBox = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.reg16};
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  box-sizing: border-box;
  border-radius: 4px;
  min-height: 80px;
  max-width: 520px;
  background-color: ${({ theme }) => theme.colors.white};
  margin: auto;
  margin-bottom: 8px;
`

const RowWrapper = styled.div`
  width: 100%;
  padding: 16px 8px 16px 16px;
  display: flex;
  align-items: flex-start;
`

export const WorkqueueRowMobile = (props: IWorkqueueRow) => {
  return (
    <>
      {props.displayItems.map((item, index) => {
        return (
          <StyledBox key={index} id="styledBox">
            <RowWrapper id={'row_' + index}>
              {props.columns.map((preference, indx) => {
                if (preference.isActionColumn) {
                  return props.renderActionBlock(
                    item.id as string,
                    item[preference.key] as IAction[],
                    preference.width,
                    index,
                    indx
                  )
                } else if (preference.isIconColumn) {
                  return (
                    <IconWrapper
                      key={indx}
                      width={preference.width}
                      color={preference.color}
                    >
                      {(item.icon as JSX.Element) || (
                        <Error>{preference.errorValue}</Error>
                      )}
                    </IconWrapper>
                  )
                } else {
                  return (
                    <ContentWrapper
                      key={indx}
                      width={preference.width}
                      color={preference.color}
                    >
                      {(item[preference.key] as string) || (
                        <Error>{preference.errorValue}</Error>
                      )}
                    </ContentWrapper>
                  )
                }
              })}
            </RowWrapper>
          </StyledBox>
        )
      })}
    </>
  )
}
