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
import { IActionObject } from '@opencrvs/components/lib/interface'

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
  onSelectPreset: ({
    startDate,
    endDate
  }: {
    startDate: moment.Moment
    endDate: moment.Moment
  }) => void
}
interface MonthSelectorProps {
  date: moment.Moment
  label: string
  onNavigateDate: (date: moment.Moment) => void
  onSelectDate: (date: moment.Moment) => void
  minDate?: moment.Moment
  maxDate: moment.Moment
  hideSelectedMonthOnLabel?: boolean
  selectedDate: moment.Moment
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
  position: absolute;
  z-index: 2;
  width: 608px;
  margin: -42px 0 0 -16px;
  overflow: hidden;

  ${({ theme }) => theme.shadows.thickShadow};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.copy};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    left: 24px;
    margin-left: 0;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    position: fixed;
    border-radius: 2px;
    width: auto;
    top: 128px;
    left: 50vw;
    transform: translateX(-50%);
    margin: 0;
  }
`
export const ModalHeader = styled.div<{ hide?: boolean }>`
  display: flex;
  padding: 8px 16px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dividerDark};
  background: ${({ theme }) => theme.colors.white};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ hide }) => (hide ? `display: none;` : '')}
  }
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
  border-right: 1px solid ${({ theme }) => theme.colors.dividerDark};

  & > :last-child {
    display: none;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex: 1;
    border: none;
    padding-top: 8px;
    min-width: 360px;

    & > :last-child {
      display: inline-block;
    }
  }
`

const LabelContainer = styled.div`
  padding: 8px;
  ${({ theme }) => theme.fonts.smallButtonStyleNoCapitalize}

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.bodyBoldStyle}
    text-align: center;
  }
  `
const YearLabelContainer = styled.div`
  padding: 8px;
  ${({ theme }) => theme.fonts.smallButtonStyleNoCapitalize}

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.h4Style}
  }
`

const MonthSelectorHeader = styled.div`
  background: ${({ theme }) => theme.colors.white};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 16px;
    border-radius: 2px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.dividerDark};
  }
`
const MonthContainer = styled.div`
  flex: 1;
  flex-direction: column;
  margin: 0 0 16px 8px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    min-width: 336px;
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

@media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 12px 24px;

    &:active {
      background: ${({ theme }) => theme.colors.secondary};
      color: ${({ theme }) => theme.colors.white};
    }
  }
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

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.bigBodyStyle}
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

  const [startDateNav, setStartDateNav] = useState<moment.Moment>(
    startDateFromProps
  )
  const [endDateNav, setEndDateNav] = useState<moment.Moment>(endDateFromProps)

  const todaysDateMoment = moment()
  const [presetOptions, updatePresetOptions] = useState<IPresetButton[]>([])
  const [activeRoute, setActiveRoute] = useState<PATHS>(PRESET)

  useEffect(() => {
    function generatePresetOptions(): IPresetButton[] {
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
        },
        {
          key: 'customDateRangeNav',
          label: 'Custom time period',
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
        setStartDate(moment(props.startDate))
        setEndDate(moment(props.endDate))
        setStartDateNav(moment(props.startDate))
        setEndDateNav(moment(props.endDate))
        body.style.removeProperty('overflow')
        setActiveRoute(PRESET)
      } else {
        body.style.overflow = 'hidden'
      }
    }

    getDerivedStateFromProps()
  }, [modalVisible, props.endDate, props.startDate])

  function MonthSelector({
    date,
    label,
    onSelectDate,
    minDate,
    maxDate,
    hideSelectedMonthOnLabel,
    selectedDate,
    onNavigateDate
  }: MonthSelectorProps) {
    const limitDate = moment([LIMIT_YEAR_PAST_RECORDS])
    const months = moment.monthsShort()
    const year = date.year().toString()

    return (
      <MonthContainer>
        <MonthSelectorHeader>
          <LabelContainer>
            {selectedDate && !hideSelectedMonthOnLabel
              ? `${label}: ${selectedDate.format('MMMM YYYY')}`
              : label}
          </LabelContainer>
          <NavigatorContainer>
            <CircleButton
              onClick={() => onNavigateDate(date.clone().subtract(1, 'years'))}
              disabled={date.isSame(limitDate, 'year')}
            >
              <ChevronLeft />
            </CircleButton>
            <YearLabelContainer>{date.format('YYYY')}</YearLabelContainer>
            <CircleButton
              onClick={() => {
                const nextDate = date.clone().add(1, 'years')
                const finalDateNavigateTo = nextDate.isAfter(todaysDateMoment)
                  ? todaysDateMoment
                  : nextDate
                onNavigateDate(finalDateNavigateTo)
              }}
              disabled={date.isSame(todaysDateMoment, 'year')}
            >
              <ChevronRight />
            </CircleButton>
          </NavigatorContainer>
        </MonthSelectorHeader>
        <MonthButtonsContainer>
          {months.map((month, index) => {
            const monthDate = moment(`${month}-${year}`, 'MMM-YYYY')
            return (
              <MonthButton
                key={index}
                disabled={
                  (moment.isMoment(minDate) && monthDate.isBefore(minDate)) ||
                  monthDate.isAfter(maxDate)
                }
                selected={
                  monthDate.isSame(selectedDate, 'month') &&
                  monthDate.isSame(selectedDate, 'year')
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
      <PresetContainer>
        {presetOptions.map(item => {
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
                item.startDate.isSame(startDate, 'month') &&
                item.endDate.isSame(endDate, 'month')
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
    item =>
      !isPresetNavButton(item) &&
      item.startDate.isSame(startDateFromProps, 'month') &&
      item.endDate.isSame(endDateFromProps, 'month')
  )

  const routes: ROUTES = {
    [PRESET]: {
      renderComponent: () => (
        <PresetSelector
          onSelectPreset={({ startDate, endDate }) => {
            setStartDate(startDate)
            setEndDate(endDate)

            props.onDatesChange({
              startDate: startDate.toDate(),
              endDate: endDate.toDate()
            })

            setModalVisible(false)
          }}
        />
      )
    },
    [START_MONTH]: {
      renderComponent: () => (
        <MonthSelector
          date={startDateNav}
          onNavigateDate={setStartDateNav}
          label={intl.formatMessage(constantsMessages.from)}
          onSelectDate={date => {
            setStartDate(date)
            setActiveRoute(END_MONTH)
          }}
          maxDate={todaysDateMoment}
          selectedDate={startDate}
          hideSelectedMonthOnLabel
        />
      ),
      hideHeader: true
    },
    [END_MONTH]: {
      renderComponent: () => (
        <MonthSelector
          date={endDateNav}
          onNavigateDate={setEndDateNav}
          label={intl.formatMessage(constantsMessages.toCapitalized)}
          selectedDate={endDate}
          onSelectDate={date => {
            props.onDatesChange({
              startDate: startDate.toDate(),
              endDate: date.toDate()
            })
            setModalVisible(false)
          }}
          minDate={startDate.clone().add(1, 'day')}
          maxDate={todaysDateMoment}
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
                maxDate={endDate.clone().subtract(1, 'days')}
              />
              <MonthSelector
                date={endDateNav}
                onNavigateDate={setEndDateNav}
                label={intl.formatMessage(constantsMessages.toCapitalized)}
                selectedDate={endDate}
                onSelectDate={setEndDate}
                maxDate={todaysDateMoment}
              />
            </ModalBody>
            <ModalBodyMobile>
              {routes[activeRoute].renderComponent()}
            </ModalBodyMobile>
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
