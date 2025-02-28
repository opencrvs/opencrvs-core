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
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import styled from 'styled-components'
import format from '@client/utils/date-formatting'
import {
  CircleButton,
  PrimaryButton,
  SecondaryButton
} from '@opencrvs/components/lib/buttons'
import { IActionObject } from '@opencrvs/components/lib/common-types'
import {
  Calendar,
  CalendarGrey,
  ChevronLeft,
  ChevronRight,
  Cross
} from '@opencrvs/components/lib/icons'
import addDays from 'date-fns/addDays'
import addYears from 'date-fns/addYears'
import endOfDay from 'date-fns/endOfDay'
import endOfYear from 'date-fns/endOfYear'
import isAfter from 'date-fns/isAfter'
import isBefore from 'date-fns/isBefore'
import isSameMonth from 'date-fns/isSameMonth'
import isSameYear from 'date-fns/isSameYear'
import startOfMonth from 'date-fns/startOfMonth'
import subDays from 'date-fns/subDays'
import subMonths from 'date-fns/subMonths'
import subYears from 'date-fns/subYears'
import * as React from 'react'
import { WrappedComponentProps, injectIntl } from 'react-intl'
import endOfMonth from 'date-fns/endOfMonth'

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
  className?: string
  closeModalFromHOC?: () => void
  usedInsideHOC?: boolean
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

export const PickerButton = styled(SecondaryButton)`
  height: 32px;
  padding: 0;
`
export const ContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  ${({ theme }) => theme.fonts.bold14};

  & > svg {
    margin-left: 8px;
  }
`

export const ModalContainer = styled.div`
  position: absolute;
  z-index: 2;
  width: 608px;
  overflow: hidden;
  right: 50%;
  transform: translateX(50%);
  ${({ theme }) => theme.shadows.heavy};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.copy};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    max-width: calc(100vw - 24px * 2);
  }
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
  ${({ theme }) => theme.fonts.bold18}
  text-transform: none;

  & > :first-child {
    margin-right: 8px;
  }
`
const ModalBody = styled.div`
  display: flex;
  flex: 1;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  background: ${({ theme }) => theme.colors.white};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`
const ModalBodyMobile = styled(ModalBody)`
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
      ? `background: ${theme.colors.primary};
  color: ${theme.colors.white};`
      : `background: none;
  color: ${theme.colors.copy};`}

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 12px 24px;

    &:active {
      background: ${({ theme }) => theme.colors.primaryDark};
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
      ? `background: ${theme.colors.primary};
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
      background: ${({ theme }) => theme.colors.primaryDark};
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
  const [modalVisible, setModalVisible] = useState<boolean>(
    props.usedInsideHOC ? true : false
  )
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
  const [activeRoute, setActiveRoute] = useState<PATHS>(
    props.usedInsideHOC ? START_MONTH : PRESET
  )

  const months = useMemo(() => {
    return getMonthsShort(intl.locale)
  }, [intl.locale])

  useEffect(() => {
    function generatePresetOptions(): IPresetButton[] {
      const today = new Date(Date.now())
      const currentYear = today.getFullYear()
      const date30DaysBack = subDays(today, 30)

      const date12MonthsBack = startOfMonth(subMonths(new Date(Date.now()), 11))

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
              endDate: endOfDay(endOfMonth(date))
            })
            setModalVisible(false)
            props.closeModalFromHOC && props.closeModalFromHOC()
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
      {!props.usedInsideHOC && (
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
      )}
      {modalVisible && (
        <>
          <ModalContainer className={props.className} id="picker-modal">
            <ModalHeader hide={routes[activeRoute].hideHeader}>
              <TitleContent>
                <CalendarGrey />
                <span>{intl.formatMessage(constantsMessages.timePeriod)}</span>
              </TitleContent>
              <CircleButton
                id="close-btn"
                type="button"
                onClick={() => {
                  setModalVisible(false)
                  props.closeModalFromHOC && props.closeModalFromHOC()
                }}
              >
                <Cross color="currentColor" />
              </CircleButton>
            </ModalHeader>
            <ModalBody>
              {!props.usedInsideHOC && (
                <PresetSelector
                  onSelectPreset={({ startDate, endDate }) => {
                    setStartDateNav(startDate)
                    setEndDateNav(endDate)
                    setStartDate(startDate)
                    setEndDate(endDate)
                  }}
                />
              )}
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
                    endDate: endOfDay(endOfMonth(endDate))
                  })
                  setModalVisible(false)
                  props.closeModalFromHOC && props.closeModalFromHOC()
                }}
                disabled={isAfter(startDate, endDate)}
              >
                {intl.formatMessage(buttonMessages.select)}
              </StyledPrimaryButton>
            </ModalFooter>
          </ModalContainer>
          <CancelableArea
            id="cancelable-area"
            onClick={() => {
              setModalVisible(false)
              props.closeModalFromHOC && props.closeModalFromHOC()
            }}
          />
        </>
      )}
    </div>
  )
}

export const DateRangePicker = injectIntl(DateRangePickerComponent)
