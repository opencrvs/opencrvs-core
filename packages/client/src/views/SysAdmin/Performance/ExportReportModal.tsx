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
import {
  CheckboxGroup,
  ICheckboxOption,
  ResponsiveModal
} from '@client/../../components/lib'
import { useIntl } from 'react-intl'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { TertiaryButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Text } from '@opencrvs/components/lib/Text'
import { Calendar, User, MapPin } from 'react-feather'
import styled from '@client/styledComponents'
import { IExportReportFilters } from './ExportReportButton'
import { endOfYear, subDays, subMonths } from 'date-fns'
import format from '@client/utils/date-formatting'
import { constantsMessages as messages } from '@client/i18n/messages/constants'
import { messages as performanceMessages } from '@client/i18n/messages/views/performance'
import ReactToPdf from 'react-to-pdf'
import { useRef } from 'react'
import { PdfReport } from './PdfReport'

interface IProps {
  show: boolean
  onSuccess: () => void
  onClose: () => void
  filterState: IExportReportFilters
}

const LocationIcon = styled(MapPin)`
  margin-right: 8px;
  color: ${({ theme }) => theme.colors.grey600};
`

const UserIcon = styled(User)`
  margin-right: 8px;
  color: ${({ theme }) => theme.colors.grey600};
`

const CalendarIcon = styled(Calendar)`
  margin-right: 8px;
  color: ${({ theme }) => theme.colors.grey600};
`

const FilterRow = styled.div`
  margin: 4px 0;
`

function getRangeDescription(startDate: Date, endDate: Date): string {
  // TODO: Is this the right way to use intl?
  const intl = useIntl()
  const today = new Date(Date.now())
  const currentYear = today.getFullYear()
  const date30DaysBack = subDays(today, 30)
  const date12MonthsBack = subMonths(today, 12)
  const lastYear = new Date(currentYear - 1, 0)
  const last2Year = new Date(currentYear - 2, 0)
  const last3Year = new Date(currentYear - 3, 0)

  // TODO: Is there a better way to compare dates (without times) than using toDateString?
  if (endDate >= today || endDate.toDateString() == today.toDateString()) {
    if (startDate.toDateString() == date30DaysBack.toDateString()) {
      return intl.formatMessage(constantsMessages.last30Days)
    }
    if (startDate.toDateString() == date12MonthsBack.toDateString()) {
      return intl.formatMessage(constantsMessages.last12Months)
    }
  }
  if (
    startDate.toDateString() == lastYear.toDateString() &&
    endDate.toDateString() == endOfYear(lastYear).toDateString()
  ) {
    return format(lastYear, 'yyyy')
  }
  if (
    startDate.toDateString() == last2Year.toDateString() &&
    endDate.toDateString() == endOfYear(last2Year).toDateString()
  ) {
    return format(last2Year, 'yyyy')
  }
  if (
    startDate.toDateString() == last3Year.toDateString() &&
    endDate.toDateString() == endOfYear(last3Year).toDateString()
  ) {
    return format(last3Year, 'yyyy')
  }
  return `${format(startDate, 'MMMM yyyy')} - ${format(endDate, 'MMMM yyyy')}`
}

export function ExportReportModal({
  show,
  onClose,
  onSuccess,
  filterState
}: IProps) {
  const intl = useIntl()

  const inputProps = {
    id: 'id',
    onChange: () => {},
    onBlur: () => {},
    value: {}
    // disabled: fieldDefinition.disabled,
    // error: Boolean(error),
    // touched: Boolean(touched),
    // placeholder: fieldDefinition.placeholder
  }

  //var selectedValues : FormFieldValue[]

  const sectionOptions: ICheckboxOption[] = [
    {
      value: '2',
      label: intl.formatMessage(
        performanceMessages.performanceTotalRegistrationsHeader
      )
    },
    {
      value: '3',
      label: intl.formatMessage(
        performanceMessages.performanceTotalCertificatesHeader
      )
    },
    {
      value: '4',
      label: intl.formatMessage(
        performanceMessages.performanceApplicationSourcesHeader
      )
    },
    {
      value: '5',
      label: intl.formatMessage(
        performanceMessages.performanceTotalCorrectionsHeader
      )
    },
    {
      value: '6',
      label: intl.formatMessage(
        performanceMessages.performanceTotalPaymentsHeader
      )
    }
  ]

  if (!filterState.officeSelected) {
    sectionOptions.splice(0, 0, {
      value: '1',
      label: intl.formatMessage(
        performanceMessages.performanceCompletenessRatesHeader
      )
    })
  }

  const [selectedSections, setSelectedSections] = React.useState<string[]>(
    sectionOptions.map((o) => o.value)
  )

  const ref = useRef<HTMLDivElement>(null)

  const restoreState = () => {
    //setSelectedSections([])
  }
  React.useEffect(() => {
    if (!show) {
      restoreState()
    }
  }, [show])

  const options = {
    orientation: 'landscape'
    //unit: 'in',
    //format: [4, 2]
  }

  return (
    <ResponsiveModal
      id="ExportReportModal"
      show={show}
      title="Export report"
      actions={[
        <TertiaryButton key="cancel" id="modal_cancel" onClick={onClose}>
          {intl.formatMessage(buttonMessages.cancel)}
        </TertiaryButton>,
        <>
          <ReactToPdf targetRef={ref} filename="report.pdf" options={options}>
            {({ toPdf }: any) => (
              <PrimaryButton
                id="continue-button"
                key="continue"
                onClick={toPdf}
              >
                {intl.formatMessage(buttonMessages.exportButton)}
              </PrimaryButton>
            )}
          </ReactToPdf>

          <div ref={ref}>
            <PdfReport intl={intl} filters={filterState} />
          </div>
        </>
      ]}
      handleClose={onClose}
      contentHeight={390}
      contentScrollableY={true}
    >
      {/* TODO: Localise this string */}
      <Text element="p" color="supportingCopy" variant="reg16">
        A PDF report will be generated with the following sections
      </Text>
      <FilterRow>
        <LocationIcon size={14} color="black" />
        <Text element="span" color="copy" variant="bold16">
          {filterState.selectedLocation.displayLabel}
        </Text>
      </FilterRow>
      <FilterRow>
        <UserIcon size={14} />
        <Text element="span" color="copy" variant="bold16">
          {filterState.event.toString() ==
          messages.birth.defaultMessage?.toString().toLowerCase()
            ? messages.births.defaultMessage
            : messages.deaths.defaultMessage}
        </Text>
      </FilterRow>
      <FilterRow>
        {/* How to set the colour correctly? */}
        <CalendarIcon size={14} color="black" />
        <Text element="span" color="copy" variant="bold16">
          {getRangeDescription(filterState.timeStart, filterState.timeEnd)}
        </Text>
      </FilterRow>
      <CheckboxGroup
        {...inputProps}
        options={sectionOptions}
        name={'SectionOptions'}
        value={selectedSections}
        onChange={(val: string[]) => {
          setSelectedSections(val)
        }}
      />
    </ResponsiveModal>
  )
}
