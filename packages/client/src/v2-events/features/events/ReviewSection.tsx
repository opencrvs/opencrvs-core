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

import React from 'react'
import {
  tennisClubMemberDeclaration as declaration,
  tennisClubMembershipEvent as event
} from './fixtures'
import styled from 'styled-components'
import { Accordion, Link, ListReview } from '@opencrvs/components'
import { ReviewHeader } from '../../../views/RegisterForm/review/ReviewHeader'
import { useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'
// @ToDO: Fix import

export const RequiredField = styled.span`
  color: ${({ theme }) => theme.colors.negative};
  display: inline-block;
  text-transform: lowercase;

  &::first-letter {
    text-transform: uppercase;
  }
`
const Row = styled.div<{
  position?: 'left' | 'center'
  background?: 'white' | 'background'
}>`
  display: flex;
  gap: 24px;
  width: 100%;
  justify-content: ${({ position }) => position || 'center'};
  background-color: ${({ theme, background }) =>
    !background || background === 'background'
      ? theme.colors.background
      : theme.colors.white};
  flex-direction: row;
  padding: 24px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0;
  }
`
const Wrapper = styled.div``

const LeftColumn = styled.div`
  flex-grow: 1;
  max-width: 840px;
  overflow: hidden;
`

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 4px;
  margin-bottom: 40px;
  &:last-child {
    margin-bottom: 200px;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    border: 0;
    margin: 0;
  }
`

export const ZeroDocument = styled.div`
  ${({ theme }) => theme.fonts.bold16};
  height: 700px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const FormData = styled.div`
  padding-top: 24px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 24px;
  }
`

const ReviewContainter = styled.div`
  padding: 0px 32px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0;
  }
`
const DeclarationDataContainer = styled.div``

// @ToDO: Fix any
const getValueFromFieldId = (declaration: any, fieldId: any) =>
  fieldId.split('.').reduce((acc: any, part: any) => acc?.[part], declaration)

const ReviewSection = () => {
  const { action } = declaration
  const offlineCountryConfig = useSelector(getOfflineData)
  const forms = event.actions.filter(
    (formAction) => formAction.type === action
  )[0].forms

  return (
    <Wrapper>
      <Row>
        <LeftColumn>
          <Card>
            <ReviewHeader
              id="review_header"
              logoSource={offlineCountryConfig.config.COUNTRY_LOGO.file}
              title={event.label.defaultMessage}
              subject={
                'Member registration for ' +
                declaration.applicant.firstname +
                ' ' +
                declaration.applicant.surname
              }
            />
            <FormData>
              {forms.map((form) => {
                return (
                  <ReviewContainter key={form.label.defaultMessage}>
                    {form.pages.map((page) => {
                      return (
                        <DeclarationDataContainer
                          key={'Section_' + page.title.defaultMessage}
                        >
                          <Accordion
                            name={page.title.defaultMessage}
                            label={page.title.defaultMessage}
                            labelForHideAction="Hide"
                            labelForShowAction="Show"
                            action={<Link>Change</Link>}
                            expand={true}
                          >
                            <ListReview
                              id={'Section_' + page.title.defaultMessage}
                            >
                              {page.fields.map((field, id) => (
                                <ListReview.Row
                                  id={id.toString()}
                                  key={id}
                                  label={field.label.defaultMessage}
                                  value={getValueFromFieldId(
                                    declaration,
                                    field.id
                                  )}
                                  actions={<Link>Change</Link>}
                                />
                              ))}
                            </ListReview>
                          </Accordion>
                        </DeclarationDataContainer>
                      )
                    })}
                  </ReviewContainter>
                )
              })}
            </FormData>
          </Card>
        </LeftColumn>
      </Row>
    </Wrapper>
  )
}

export default ReviewSection
