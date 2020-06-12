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
import { CircleButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import moment from 'moment'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'

const { useState, useEffect } = React

const LIMIT_YEAR_PAST_RECORDS = 1900

interface IDateRange {
  startDate: Date
  endDate: Date
}
interface IPresetDateRange {
  key: string
  label: string
  startDate: moment.Moment
  endDate: moment.Moment
}

interface IDateRangePickerProps extends WrappedComponentProps, IDateRange {
  onDatesChange: ({ startDate, endDate }: IDateRange) => void
}

interface MonthSelectorProps {
  date: moment.Moment
  label: string
  onSelectDate: (date: moment.Moment) => void
  minDate?: moment.Moment
  maxDate: moment.Moment
}

export const PickerButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 2px;
  &:focus {
    outline: none;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.smallButtonFocus};
  }
  white-space: nowrap;
  padding: 0;
  height: 38px;
  background: transparent;
  & > div {
    padding: 0 8px;
    height: 100%;
  }
`

export const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  ${({ theme }) => theme.fonts.smallButtonStyleNoCapitalize};
  color: ${({ theme }) => theme.colors.tertiary};

  & > svg {
    margin-left: 8px;
  }
`

export const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.white};
  position: fixed;
  z-index: 2;
  width: 608px;
  top: auto;
  left: auto;
  margin: -42px 0 0 -16px;

  ${({ theme }) => theme.shadows.thickShadow};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.copy};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    left: 24px;
    margin-left: 0;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: calc(100vw - 48px);
    left: 24px;
    right: 24px;
    margin: 0;
  }
`
export const ModalHeader = styled.div`
  display: flex;
  padding: 8px 16px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dividerDark};
`
export const TitleContent = styled.div`
  display: flex;
  align-items: center;
  ${({ theme }) => theme.fonts.buttonStyle}
  text-transform: none;

  & > :first-child {
    margin-right: 8px;
  }
`
export const ModalBody = styled.div`
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
  ${({ theme }) => theme.fonts.smallButtonStyleNoCapitalize}
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
const PresetRangeButton = styled.button<{ selected?: boolean }>`
  ${({ theme }) => theme.fonts.bodyStyle}
  padding: 8px 16px;
  border: 0;
  width: 100%;
  text-align: left;
  cursor: pointer;
  &:focus {
    outline: none;
  }
  ${({ theme, selected }) =>
    selected
      ? `background: ${theme.colors.secondary};
  color: ${theme.colors.white};`
      : `background: none;
  color: ${theme.colors.copy};`}
`
const MonthButton = styled.button<{ selected?: boolean }>`
  ${({ theme }) => theme.fonts.smallButtonStyle}
  height: 40px;
  width: 64px;
  border: 0;
  ${({ theme, selected }) =>
    selected
      ? `background: ${theme.colors.secondary};
  color: ${theme.colors.white};`
      : `background: none;
  color: ${theme.colors.copy};`}

  cursor: pointer;
  &:focus {
    outline: none;
  }
  &:disabled {
    color: ${({ theme }) => theme.colors.dateDisabled};
    cursor: default;
  }
`
const ModalFooter = styled.div`
  display: flex;
  flex-direction: row-reverse;
  padding: 8px 16px;
  align-items: center;
`
export const CancelableArea = styled.div`
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  overflow: hidden;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    background: ${({ theme }) => theme.colors.previewBackground};
    opacity: 0.5;
  }
`
const StyledPrimaryButton = styled(PrimaryButton)`
  padding: 8px 16px;
  height: auto;
`
function DateRangePickerComponent(props: IDateRangePickerProps) {
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const { intl } = props

  moment.locale(intl.locale)
  const startDateFromProps = moment(props.startDate)
  const endDateFromProps = moment(props.endDate)
  const [startDate, setStartDate] = useState<moment.Moment>(startDateFromProps)
  const [endDate, setEndDate] = useState<moment.Moment>(endDateFromProps)

  const todaysDateMoment = moment()
  const [presetOptions, updatePresetOptions] = useState<IPresetDateRange[]>([])

  useEffect(() => {
    function generatePresetOptions(): IPresetDateRange[] {
      const today = moment()
      const currentYear = today.year()
      const date30DaysBack = today.clone().subtract(30, 'days')

      const date12MonthsBack = today.clone().subtract(12, 'months')

      const lastYearMoment = moment([currentYear - 1])
      const last2YearMoment = moment([currentYear - 2])
      const last3YearMoment = moment([currentYear - 3])

      return [
        {
          key: 'last30Days',
          label: intl.formatMessage(constantsMessages.last30Days),
          startDate: date30DaysBack,
          endDate: today
        },
        {
          key: 'last12Months',
          label: intl.formatMessage(constantsMessages.last12Months),
          startDate: date12MonthsBack,
          endDate: today
        },
        {
          key: 'lastYear',
          label: lastYearMoment.format('YYYY'),
          startDate: lastYearMoment,
          endDate: lastYearMoment.clone().endOf('year')
        },
        {
          key: 'previousOfLastYear',
          label: last2YearMoment.format('YYYY'),
          startDate: last2YearMoment,
          endDate: last2YearMoment.clone().endOf('year')
        },
        {
          key: 'previousOfLast2Years',
          label: last3YearMoment.format('YYYY'),
          startDate: last3YearMoment,
          endDate: last3YearMoment.clone().endOf('year')
        }
      ]
    }

    updatePresetOptions(generatePresetOptions())
  }, [intl])

  useEffect(() => {
    function getDerivedStateFromProps() {
      if (!modalVisible) {
        setStartDate(moment(props.startDate))
        setEndDate(moment(props.endDate))
      }
    }

    getDerivedStateFromProps()
  }, [modalVisible, props.endDate, props.startDate])

  function MonthSelector({
    date,
    label,
    onSelectDate,
    maxDate
  }: MonthSelectorProps) {
    const limitDate = moment([LIMIT_YEAR_PAST_RECORDS])
    const months = moment.monthsShort()
    const year = date.year().toString()

    return (
      <MonthContainer>
        <LabelContainer>
          {date ? `${label}: ${date.format('MMMM YYYY')}` : label}
        </LabelContainer>
        <NavigatorContainer>
          <CircleButton
            onClick={() => onSelectDate(date.clone().subtract(1, 'years'))}
            disabled={date.isSame(limitDate, 'year')}
          >
            <ChevronLeft />
          </CircleButton>
          <LabelContainer>{date.format('YYYY')}</LabelContainer>
          <CircleButton
            onClick={() => {
              const nextDate = date.clone().add(1, 'years')
              const finalDateNavigateTo = nextDate.isAfter(todaysDateMoment)
                ? todaysDateMoment
                : nextDate
              onSelectDate(finalDateNavigateTo)
            }}
            disabled={date.isSame(todaysDateMoment, 'year')}
          >
            <ChevronRight />
          </CircleButton>
        </NavigatorContainer>
        <MonthButtonsContainer>
          {months.map((month, index) => {
            const monthDate = moment(`${month}-${year}`, 'MMM-YYYY')
            return (
              <MonthButton
                key={index}
                disabled={monthDate.isAfter(maxDate)}
                selected={monthDate.isSame(date, 'month')}
                onClick={() => onSelectDate(monthDate)}
              >
                {month}
              </MonthButton>
            )
          })}
        </MonthButtonsContainer>
      </MonthContainer>
    )
  }

  function PresetSelector() {
    return (
      <PresetContainer>
        {presetOptions.map(item => {
          return (
            <PresetRangeButton
              id={item.key}
              key={item.key}
              selected={
                item.startDate.isSame(startDate, 'month') &&
                item.endDate.isSame(endDate, 'month')
              }
              onClick={() => {
                setStartDate(item.startDate)
                setEndDate(item.endDate)
              }}
            >
              {item.label}
            </PresetRangeButton>
          )
        })}
      </PresetContainer>
    )
  }

  const selectedPresetFromProps = presetOptions.find(
    item =>
      item.startDate.isSame(startDateFromProps, 'month') &&
      item.endDate.isSame(endDateFromProps, 'month')
  )

  return (
    <div>
      <PickerButton
        id="date-range-picker-action"
        onClick={() => setModalVisible(true)}
      >
        <ContentWrapper>
          <span>
            {selectedPresetFromProps
              ? selectedPresetFromProps.label
              : `${startDateFromProps.format(
                  'MMMM YYYY'
                )} - ${endDateFromProps.format('MMMM YYYY')}`}
          </span>
          <Calendar />
        </ContentWrapper>
      </PickerButton>
      {modalVisible && (
        <>
          <ModalContainer id="picker-modal">
            <ModalHeader>
              <TitleContent>
                <CalendarGrey />
                <span>{intl.formatMessage(constantsMessages.timePeriod)}</span>
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
              <PresetSelector />
              <MonthSelector
                date={startDate}
                label={intl.formatMessage(constantsMessages.from)}
                onSelectDate={setStartDate}
                maxDate={endDate.clone().subtract(1, 'days')}
              />
              <MonthSelector
                date={endDate}
                label={intl.formatMessage(constantsMessages.toCapitalized)}
                onSelectDate={setEndDate}
                maxDate={todaysDateMoment}
              />
            </ModalBody>
            <ModalFooter>
              <StyledPrimaryButton
                id="date-range-confirm-action"
                onClick={() => {
                  props.onDatesChange({
                    startDate: startDate.toDate(),
                    endDate: endDate.toDate()
                  })
                  setModalVisible(false)
                }}
                disabled={startDate.isAfter(endDate)}
              >
                {intl.formatMessage(buttonMessages.select)}
              </StyledPrimaryButton>
            </ModalFooter>
          </ModalContainer>
          <CancelableArea
            id="cancelable-area"
            onClick={() => setModalVisible(false)}
          />
        </>
      )}
    </div>
  )
}

export const DateRangePicker = injectIntl(DateRangePickerComponent)
