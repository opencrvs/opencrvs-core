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
import styled from '@client/styledComponents'
import {
  Calendar,
  CalendarGrey,
  Cross,
  ChevronLeft,
  ChevronRight
} from '@opencrvs/components/lib/icons'
import {
  CircleButton,
  PrimaryButton,
  Button
} from '@opencrvs/components/lib/buttons'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import moment from 'moment'

const { useState } = React

interface IDateRangePickerProps extends WrappedComponentProps {
  startDate: Date
  endDate: Date
  onDatesChange: ({
    startDate,
    endDate
  }: {
    startDate: Date
    endDate: Date
  }) => void
}

const PickerButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 2px;
  &:focus {
    outline: none;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.smallButtonFocus};
  }
  padding: 0;
  height: 36px;
  background: transparent;
  & > div {
    padding: 0 8px;
    height: 100%;
  }
`

const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  ${({ theme }) => theme.fonts.smallButtonBoldStyle};
  color: ${({ theme }) => theme.colors.tertiary};

  & > svg {
    margin-left: 8px;
  }
`

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.white};
  position: absolute;
  z-index: 2;
  width: 608px;
  transform: translate(-16px, -42px);
  ${({ theme }) => theme.shadows.thickShadow};
  border-radius: 4px;
`
const ModalHeader = styled.div`
  display: flex;
  padding: 8px 16px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dividerDark};
`
const TitleContent = styled.div`
  display: flex;
  align-items: center;
  ${({ theme }) => theme.fonts.buttonStyle}
  color:  ${({ theme }) => theme.colors.copy};
  text-transform: none;

  & > :first-child {
    margin-right: 8px;
  }
`
const ModalBody = styled.div`
  display: flex;
  flex: 1;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dividerDark};
`

const PresetContainer = styled.div`
  flex: 0.9;
  flex-direction: column;
  border-right: 1px solid ${({ theme }) => theme.colors.dividerDark};
`
const LabelContainer = styled.div`
  padding: 8px;
  ${({ theme }) => theme.fonts.smallButtonBoldStyle}
  color: ${({ theme }) => theme.colors.copy};
`
const MonthContainer = styled.div`
  flex: 1;
  flex-direction: column;
  margin: 0 0 16px 8px;
`
const NavigatorContainer = styled.div`
  padding: 8px;
  justify-content: center;
  align-items: center;
  display: flex;
`

const MonthButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const MonthButton = styled(Button)`
  ${({ theme }) => theme.fonts.smallButtonStyle}
  height: 40px;
  width: 64px;
  color: ${({ theme }) => theme.colors.copy};
`
const ModalFooter = styled.div`
  display: flex;
  flex-direction: row-reverse;
  padding: 8px 16px;
  align-items: center;
`
const CancelableArea = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
`

const StyledPrimaryButton = styled(PrimaryButton)`
  padding: 8px 16px;
  height: auto;
`

function DateRangePickerComponent(props: IDateRangePickerProps) {
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const { intl } = props
  moment.locale(intl.locale)
  const [startDate, setStartDate] = useState<Date>(props.startDate)
  const [endDate, setEndDate] = useState<Date>(props.endDate)

  function MonthSelector({ date, label }: { date: Date; label: string }) {
    const dateMoment = moment(date)
    const months = moment.monthsShort()

    return (
      <MonthContainer>
        <LabelContainer>
          {date ? `${label}: ${dateMoment.format('MMMM YYYY')}` : label}
        </LabelContainer>
        <NavigatorContainer>
          <CircleButton>
            <ChevronLeft />
          </CircleButton>
          <LabelContainer>{dateMoment.format('YYYY')}</LabelContainer>
          <CircleButton>
            <ChevronRight />
          </CircleButton>
        </NavigatorContainer>
        <MonthButtonsContainer>
          {months.map((month, index) => (
            <MonthButton key={index}>{month}</MonthButton>
          ))}
        </MonthButtonsContainer>
      </MonthContainer>
    )
  }

  return (
    <div>
      <PickerButton onClick={() => setModalVisible(true)}>
        <ContentWrapper>
          <span>Last 12 months</span>
          <Calendar />
        </ContentWrapper>
      </PickerButton>
      {modalVisible && (
        <>
          <ModalContainer>
            <ModalHeader>
              <TitleContent>
                <CalendarGrey />
                <span>Time period</span>
              </TitleContent>
              <CircleButton
                id="close-btn"
                type="button"
                onClick={() => setModalVisible(false)}
              >
                <Cross color="currentColor" />
              </CircleButton>
            </ModalHeader>
            <ModalBody>
              <PresetContainer />
              <MonthSelector date={startDate} label="From" />
              <MonthSelector date={endDate} label="To" />
            </ModalBody>
            <ModalFooter>
              <StyledPrimaryButton>Select</StyledPrimaryButton>
            </ModalFooter>
          </ModalContainer>
          <CancelableArea onClick={() => setModalVisible(false)} />
        </>
      )}
    </div>
  )
}

export const DateRangePicker = injectIntl(DateRangePickerComponent)
