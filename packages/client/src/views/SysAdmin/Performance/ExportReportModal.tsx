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
import { EMPTY_STRING } from '@client/utils/constants'
import * as React from 'react'
import {
  CheckboxGroup,
  ICheckboxOption,
  ResponsiveModal
} from '@client/../../components/lib'
import { useIntl } from 'react-intl'
import { buttonMessages } from '@client/i18n/messages'
import { TertiaryButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Text } from '@opencrvs/components/lib/Text'
import { Calendar, User, MapPin } from 'react-feather'
import styled from '@client/styledComponents'
import { IExportReportFilters } from './ExportReportButton'

interface IProps {
  show: boolean
  onSuccess: () => void
  onClose: () => void
  state: IExportReportFilters
}

const LocationIcon = styled(MapPin)`
  margin-right: 8px;
`

const UserIcon = styled(User)`
  margin-right: 8px;
`

const CalendarIcon = styled(Calendar)`
  margin-right: 8px;
`

const FilterRow = styled.div`
  margin: 4px 0;
`

export function ExportReportModal({ show, onClose, onSuccess, state }: IProps) {
  const intl = useIntl()
  const [phoneNumber, setPhoneNumber] = React.useState(EMPTY_STRING)

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
    { value: '', label: 'Completion rates' },
    { value: '', label: 'Registrations' },
    { value: '', label: 'Certificates issued' },
    { value: '', label: 'Sources of applications' },
    { value: '', label: 'Corrections' },
    { value: '', label: 'Fees collected' }
  ]

  const onSuccessChangeNumber = (phoneNumber: string) => {
    setPhoneNumber(phoneNumber)
  }
  const restoreState = () => {
    setPhoneNumber(EMPTY_STRING)
  }
  React.useEffect(() => {
    if (!show) {
      restoreState()
    }
  }, [show])

  return (
    <ResponsiveModal
      id="ExportReportModal"
      show={show}
      title="Export report"
      actions={[
        <TertiaryButton key="cancel" id="modal_cancel" onClick={onClose}>
          {intl.formatMessage(buttonMessages.cancel)}
        </TertiaryButton>,
        <PrimaryButton
          id="continue-button"
          key="continue"
          onClick={() => {
            console.log('Click')
            //continueButtonHandler(phoneNumber)
          }}
          //disabled={!Boolean(phoneNumber.length) || isInvalidPhoneNumber}
        >
          {intl.formatMessage(buttonMessages.exportButton)}
        </PrimaryButton>
      ]}
      handleClose={onClose}
      contentHeight={390}
      contentScrollableY={true}
    >
      <Text element="p" color="supportingCopy" variant="reg16">
        A PDF report will be generated with the following sections
      </Text>
      <FilterRow>
        {/* How to set the colour correctly? */}
        <LocationIcon size={14} color="black" />
        <Text element="span" color="copy" variant="bold16">
          {state.selectedLocation.displayLabel}
        </Text>
      </FilterRow>
      <FilterRow>
        {/* How to set the colour correctly? */}
        <UserIcon size={14} color="black" />
        <Text element="span" color="copy" variant="bold16">
          {state.event}
        </Text>
      </FilterRow>
      <FilterRow>
        {/* How to set the colour correctly? */}
        <CalendarIcon size={14} color="black" />
        <Text element="span" color="copy" variant="bold16">
          {state.timeStart.toString()} - {state.timeEnd.toString()}
        </Text>
      </FilterRow>
      <CheckboxGroup
        {...inputProps}
        options={sectionOptions}
        name={'SectionOptions'}
        value={['value??']}
        onChange={(val: string[]) => console.log('onchange: ', val)}
      />
    </ResponsiveModal>
  )
}
