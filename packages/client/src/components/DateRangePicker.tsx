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
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { IActionObject } from '@opencrvs/components/lib/interface'
import format from '@client/utils/date-formatting'
import subDays from 'date-fns/subDays'
import subMonths from 'date-fns/subMonths'
import endOfMonth from 'date-fns/endOfMonth'
import endOfYear from 'date-fns/endOfYear'
import subYears from 'date-fns/subYears'
import isSameMonth from 'date-fns/isSameMonth'
import isSameYear from 'date-fns/isSameYear'
import addDays from 'date-fns/addDays'
import addYears from 'date-fns/addYears'
import isAfter from 'date-fns/isAfter'
import isBefore from 'date-fns/isBefore'

const { useState, useEffect, useMemo } = React

const LIMIT_YEAR_PAST_RECORDS = 1900

function getMonthsShort(locale = 'en') {
  const months = []
  for (let i = 0; i < 12; i++) {
    months.push(
      new Date(1970, i).toLocaleString(locale, {
        month: 'short'
      })
    )
  }
  return months
}
interface IDateRange {
  startDate: Date
  endDate: Date
}
interface IPresetDateRange {
  key: string
  label: string
  startDate: Date
  endDate: Date
}

const PRESET = 'preset'
const START_MONTH = 'startMonth'
const END_MONTH = 'endMonth'

type PATHS = typeof PRESET | typeof START_MONTH | typeof END_MONTH

type ROUTES = {
  [key in PATHS]: {
    hideHeader?: boolean
    renderComponent: () => React.ReactNode
  }
}
interface IPresetNavButton extends IActionObject {
  key: string
}

type IPresetButton = IPresetDateRange | IPresetNavButton

function isPresetNavButton(button: IPresetButton): button is IPresetNavButton {
  return typeof (button as IActionObject).handler === 'function'
}

interface IDateRangePickerProps extends WrappedComponentProps, IDateRange {
  onDatesChange: ({ startDate, endDate }: IDateRange) => void
}

interface PresetSelectorProps {
  id?: string
  onSelectPreset: ({
    startDate,
    endDate
  }: {
    startDate: Date
    endDate: Date
  }) => void
}
interface MonthSelectorProps {
  id?: string
  date: Date
  label: string
  onNavigateDate: (date: Date) => void
  onSelectDate: (date: Date) => void
  minDate?: Date
  maxDate: Date
  hideSelectedMonthOnLabel?: boolean
  selectedDate: Date
}

export const PickerButton = styled.button`
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 2px;
  &:focus {
    outline: none;
    box-shadow: 0 0 0px 3px ${({ theme }) => theme.colors.yellow};
  }

  &:active {
    box-shadow: 0 0 0px 3px ${({ theme }) => theme.colors.yellow};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
  }
  white-space: nowrap;
  padding: 0;
  height: 32px;
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
  ${({ theme }) => theme.fonts.reg14};
  color: ${({ theme }) => theme.colors.tertiary};

  & > svg {
    margin-left: 8px;
  }
`

export const ModalContainer = styled.div`
  position: relative;
  z-index: 2;
  width: 608px;
  margin: -42px 0 0 -16px;
  overflow: hidden;

  ${({ theme }) => theme.shadows.heavy};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.copy};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    left: 24px;
    margin-left: 0;
  }

  /* @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    position: fixed;
    border-radius: 2px;
    width: auto;
    top: 128px;
    left: 50vw;
    transform: translateX(-50%);
    margin: 0;
  } */
`
export const ModalHeader = styled.div<{ hide?: boolean }>`
  display: flex;
  padding: 8px 16px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  background: ${({ theme }) => theme.colors.white};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ hide }) => (hide ? `display: none;` : '')}
  }
`
export const TitleContent = styled.div`
  display: flex;
  align-items: center;
  ${({ theme }) => theme.fonts.h2}
  text-transform: none;

  & > :first-child {
    margin-right: 8px;
  }
`
export const ModalBody = styled.div`
  display: flex;
  flex: 1;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  background: ${({ theme }) => theme.colors.white};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`
export const ModalBodyMobile = styled(ModalBody)`
  border: none;
  display: none;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    background: none;
    display: flex;
  }
`
const PresetContainer = styled.div`
  flex: 0.9;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.white};
  border-right: 1px solid ${({ theme }) => theme.colors.grey200};

  & > :last-child {
    display: none;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex: 1;
    border: none;
    padding: 8px 0;
    width: 360px;

    & > :last-child {
      display: inline-block;
    }
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.sm}px) {
    flex: 1;
    border: none;
    padding: 8px 0;
    width: calc(100vw - 16px);

    & > :last-child {
      display: inline-block;
    }
  }
`

const LabelContainer = styled.div`
  padding: 8px;
  ${({ theme }) => theme.fonts.reg14}

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 8px 0 0;
    ${({ theme }) => theme.fonts.bold16}
    text-align: center;
  }
`
const YearLabelContainer = styled.div`
  padding: 8px;
  ${({ theme }) => theme.fonts.reg14}

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.h2}
  }
`

const MonthSelectorHeader = styled.div`
  background: ${({ theme }) => theme.colors.white};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0 16px;
    border-radius: 2px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
  }
`
const MonthContainer = styled.div`
  flex: 1;
  flex-direction: column;
  margin: 0 0 16px 8px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 336px;
    margin: 0;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.sm}px) {
    width: calc(100vw - 16px);
    margin: 0;
  }
`
const NavigatorContainer = styled.div`
  padding: 8px;
  justify-content: center;
  align-items: center;
  display: flex;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    justify-content: space-between;
    padding: 8px 0;
  }
`

const MonthButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  background: ${({ theme }) => theme.colors.white};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    border-radius: 2px;
  }
`
const PresetRangeButton = styled.button<{ selected?: boolean }>`
  ${({ theme }) => theme.fonts.reg16}
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

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 12px 24px;

    &:active {
      background: ${({ theme }) => theme.colors.secondary};
      color: ${({ theme }) => theme.colors.white};
    }
  }
`
const MonthButton = styled.button<{ selected?: boolean }>`
  ${({ theme }) => theme.fonts.reg14}
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
    color: ${({ theme }) => theme.colors.disabled};
    cursor: default;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.reg18}
    height: 72px;
    width: 33.33%;
    padding: 12px 8px 11px 8px;
    background-clip: content-box;
    -moz-background-clip: content-box;

    &:active {
      background: ${({ theme }) => theme.colors.secondary};
      background-clip: content-box;
      -moz-background-clip: content-box;
      color: ${({ theme }) => theme.colors.white};
    }
  }
`
const ModalFooter = styled.div`
  display: flex;
  flex-direction: row-reverse;
  padding: 8px 16px;
  align-items: center;
  background: ${({ theme }) => theme.colors.white};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
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
    background: ${({ theme }) => theme.colors.grey600};
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

  window.__localeId__ = intl.locale
  const startDateFromProps = props.startDate
  const endDateFromProps = props.endDate

  const [startDate, setStartDate] = useState<Date>(startDateFromProps)
  const [endDate, setEndDate] = useState<Date>(endDateFromProps)

  const [startDateNav, setStartDateNav] = useState<Date>(startDateFromProps)
  const [endDateNav, setEndDateNav] = useState<Date>(endDateFromProps)

  const todaysDate = new Date(Date.now())
  const [presetOptions, updatePresetOptions] = useState<IPresetButton[]>([])
  const [activeRoute, setActiveRoute] = useState<PATHS>(PRESET)

  const months = useMemo(() => {
    return getMonthsShort(intl.locale)
  }, [intl.locale])

  useEffect(() => {
    function generatePresetOptions(): IPresetButton[] {
      const today = new Date(Date.now())
      const currentYear = today.getFullYear()
      const date30DaysBack = subDays(today, 30)

      const date12MonthsBack = subMonths(today, 12)

      const lastYear = new Date(currentYear - 1, 0)
      const last2Year = new Date(currentYear - 2, 0)
      const last3Year = new Date(currentYear - 3, 0)

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
          label: format(lastYear, 'yyyy'),
          startDate: lastYear,
          endDate: endOfYear(lastYear)
        },
        {
          key: 'previousOfLastYear',
          label: format(last2Year, 'yyyy'),
          startDate: last2Year,
          endDate: endOfYear(last2Year)
        },
        {
          key: 'previousOfLast2Years',
          label: format(last3Year, 'yyyy'),
          startDate: last3Year,
          endDate: endOfYear(last3Year)
        },
        {
          key: 'customDateRangeNav',
          label: intl.formatMessage(constantsMessages.customTimePeriod),
          handler: () => setActiveRoute(START_MONTH)
        }
      ]
    }

    updatePresetOptions(generatePresetOptions())
  }, [intl])

  useEffect(() => {
    function getDerivedStateFromProps() {
      const body = document.querySelector('body') as HTMLBodyElement
      if (!modalVisible) {
        setStartDate(props.startDate)
        setEndDate(props.endDate)
        setStartDateNav(props.startDate)
        setEndDateNav(props.endDate)
        body.style.removeProperty('overflow')
        setActiveRoute(PRESET)
      } else {
        body.style.overflow = 'auto'
      }
    }

    getDerivedStateFromProps()
  }, [modalVisible, props.endDate, props.startDate])

  function MonthSelector({
    id,
    date,
    label,
    onSelectDate,
    minDate,
    maxDate,
    hideSelectedMonthOnLabel,
    selectedDate,
    onNavigateDate
  }: MonthSelectorProps) {
    const limitDate = new Date(LIMIT_YEAR_PAST_RECORDS)
    const year = date.getFullYear().toString()

    return (
      <MonthContainer id={id}>
        <MonthSelectorHeader>
          <LabelContainer>
            {selectedDate && !hideSelectedMonthOnLabel
              ? `${label}: ${format(selectedDate, 'MMMM yyyy')}`
              : label}
          </LabelContainer>
          <NavigatorContainer>
            <CircleButton
              id={`${id}-prev`}
              onClick={() => onNavigateDate(subYears(date, 1))}
              disabled={isSameYear(date, limitDate)}
            >
              <ChevronLeft />
            </CircleButton>
            <YearLabelContainer id={`${id}-year-label`}>
              {format(date, 'yyyy')}
            </YearLabelContainer>
            <CircleButton
              id={`${id}-next`}
              onClick={() => {
                const nextDate = addYears(date, 1)
                const finalDateNavigateTo = isAfter(nextDate, todaysDate)
                  ? todaysDate
                  : nextDate
                onNavigateDate(finalDateNavigateTo)
              }}
              disabled={isSameYear(date, todaysDate)}
            >
              <ChevronRight />
            </CircleButton>
          </NavigatorContainer>
        </MonthSelectorHeader>
        <MonthButtonsContainer>
          {months.map((month, index) => {
            const monthDate = new Date(Number(year), index)
            return (
              <MonthButton
                id={`${id}-${month.toLowerCase()}`}
                key={index}
                disabled={
                  (minDate && isBefore(monthDate, minDate)) ||
                  isAfter(monthDate, maxDate)
                }
                selected={
                  isSameMonth(selectedDate, monthDate) &&
                  isSameYear(selectedDate, monthDate)
                }
                onClick={() => {
                  onSelectDate(monthDate)
                }}
              >
                {month}
              </MonthButton>
            )
          })}
        </MonthButtonsContainer>
      </MonthContainer>
    )
  }

  function PresetSelector(props: PresetSelectorProps) {
    return (
      <PresetContainer id={props.id}>
        {presetOptions.map((item) => {
          return isPresetNavButton(item) ? (
            <PresetRangeButton
              id={item.key}
              key={item.key}
              onClick={item.handler}
            >
              {item.label}
            </PresetRangeButton>
          ) : (
            <PresetRangeButton
              id={item.key}
              key={item.key}
              selected={
                isSameMonth(startDate, item.startDate) &&
                isSameMonth(endDate, item.endDate)
              }
              onClick={() =>
                props.onSelectPreset({
                  startDate: item.startDate,
                  endDate: item.endDate
                })
              }
            >
              {item.label}
            </PresetRangeButton>
          )
        })}
      </PresetContainer>
    )
  }

  const selectedPresetFromProps = presetOptions.find(
    (item) =>
      !isPresetNavButton(item) &&
      isSameMonth(startDateFromProps, item.startDate) &&
      isSameMonth(endDateFromProps, item.endDate)
  )

  const routes: ROUTES = {
    [PRESET]: {
      renderComponent: () => (
        <PresetSelector
          id="preset-small"
          onSelectPreset={({ startDate, endDate }) => {
            setStartDate(startDate)
            setEndDate(endDate)

            props.onDatesChange({
              startDate: startDate,
              endDate: endDate
            })

            setModalVisible(false)
          }}
        />
      )
    },
    [START_MONTH]: {
      renderComponent: () => (
        <MonthSelector
          id="start-date-small"
          date={startDateNav}
          onNavigateDate={setStartDateNav}
          label={intl.formatMessage(constantsMessages.from)}
          onSelectDate={(date) => {
            setStartDate(date)
            setActiveRoute(END_MONTH)
          }}
          maxDate={todaysDate}
          selectedDate={startDate}
          hideSelectedMonthOnLabel
        />
      ),
      hideHeader: true
    },
    [END_MONTH]: {
      renderComponent: () => (
        <MonthSelector
          id="end-date-small"
          date={endDateNav}
          onNavigateDate={setEndDateNav}
          label={intl.formatMessage(constantsMessages.toCapitalized)}
          selectedDate={endDate}
          onSelectDate={(date) => {
            props.onDatesChange({
              startDate: startDate,
              endDate: date
            })
            setModalVisible(false)
          }}
          minDate={addDays(startDate, 1)}
          maxDate={todaysDate}
          hideSelectedMonthOnLabel
        />
      ),
      hideHeader: true
    }
  }

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
              : `${format(startDateFromProps, 'MMMM yyyy')} - ${format(
                  endDateFromProps,
                  'MMMM yyyy'
                )}`}
          </span>
          <Calendar />
        </ContentWrapper>
      </PickerButton>
      {modalVisible && (
        <>
          <ModalContainer id="picker-modal">
            <ModalHeader hide={routes[activeRoute].hideHeader}>
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
              <PresetSelector
                onSelectPreset={({ startDate, endDate }) => {
                  setStartDateNav(startDate)
                  setEndDateNav(endDate)
                  setStartDate(startDate)
                  setEndDate(endDate)
                }}
              />
              <MonthSelector
                date={startDateNav}
                onNavigateDate={setStartDateNav}
                label={intl.formatMessage(constantsMessages.from)}
                selectedDate={startDate}
                onSelectDate={setStartDate}
                maxDate={subDays(endDate, 1)}
              />
              <MonthSelector
                date={endDateNav}
                onNavigateDate={setEndDateNav}
                label={intl.formatMessage(constantsMessages.toCapitalized)}
                selectedDate={endDate}
                onSelectDate={setEndDate}
                maxDate={todaysDate}
              />
            </ModalBody>
            <ModalBodyMobile id="picker-modal-mobile">
              {routes[activeRoute].renderComponent()}
            </ModalBodyMobile>
            <ModalFooter>
              <StyledPrimaryButton
                id="date-range-confirm-action"
                onClick={() => {
                  props.onDatesChange({
                    startDate: startDate,
                    endDate: endOfMonth(endDate)
                  })
                  setModalVisible(false)
                }}
                disabled={isAfter(startDate, endDate)}
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
