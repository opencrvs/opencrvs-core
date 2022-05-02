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
import { MapPin, Location, Cross } from '@opencrvs/components/lib/icons'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import { generateLocations } from '@client/utils/locationUtils'
import {
  ISearchLocation,
  LocationSearch
} from '@opencrvs/components/lib/interface'
import { connect } from 'react-redux'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { constantsMessages } from '@client/i18n/messages'
import { CircleButton } from '@opencrvs/components/lib/buttons'
import { colors } from '@opencrvs/components/lib/colors'
import {
  PickerButton,
  ContentWrapper,
  ModalContainer as CommonModalContainer,
  ModalHeader,
  TitleContent,
  CancelableArea
} from '@client/components/DateRangePicker'
import styled from '@client/styledComponents'
import { ILocation } from '@client/offline/reducer'

const { useState, useEffect } = React

interface IConnectProps {
  offlineLocations: { [key: string]: ILocation }
  offlineOffices: { [key: string]: ILocation }
  jurisidictionTypeFilter: string[] | undefined
}

interface IBaseProps {
  additionalLocations?: ISearchLocation[]
  selectedLocationId?: string
  disabled?: boolean
  onChangeLocation: (locationId: string) => void
  requiredJurisdictionTypes?: string
}

type LocationPickerProps = IBaseProps & IConnectProps & WrappedComponentProps

const ModalContainer = styled(CommonModalContainer)`
  width: 400px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 360px;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.sm}px) {
    width: calc(100vw - 16px);
  }
`

const ModalBody = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 8px 0;
`
const StyledLocationSearch = styled(LocationSearch)`
  flex-direction: column;
  width: 100%;

  & > svg {
    display: none;
  }

  & > input {
    padding-left: 8px;
    margin: 0 16px 8px 16px;
    width: calc(100% - 32px);

    @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
      margin: 0 8px 8px 8px;
      width: calc(100% - 16px);
    }
  }

  & > ul {
    position: relative;
    z-index: 2;
    top: 0;
    box-shadow: none;
    margin-bottom: 0;
  }

  & > ul > li {
    border: none;
  }
`

function LocationPickerComponent(props: LocationPickerProps) {
  const {
    offlineLocations,
    offlineOffices,
    jurisidictionTypeFilter,
    selectedLocationId,
    disabled,
    additionalLocations = [],
    intl
  } = props
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  const offlineSearchableLocations = generateLocations(
    offlineLocations,
    intl,
    jurisidictionTypeFilter
  )

  const offlineSearchableOffices = generateLocations(offlineOffices, intl)

  const searchableLocations = [
    ...additionalLocations,
    ...offlineSearchableLocations,
    ...offlineSearchableOffices
  ]

  const selectedSearchedLocation = searchableLocations.find(
    ({ id }) => id === selectedLocationId
  ) as ISearchLocation

  useEffect(() => {
    function toggleBodyScroll() {
      const body = document.querySelector('body') as HTMLBodyElement
      if (modalVisible) {
        body.style.overflow = 'hidden'
        const searchInput = document.getElementById('locationSearchInput')
        if (searchInput) {
          searchInput.focus()
        }
      } else {
        body.style.removeProperty('overflow')
      }
    }
    toggleBodyScroll()
  }, [modalVisible])
  return (
    <div>
      <PickerButton
        id="location-range-picker-action"
        onClick={() => setModalVisible(true)}
        disabled={disabled}
      >
        <ContentWrapper>
          <span>
            {(selectedSearchedLocation &&
              selectedSearchedLocation.displayLabel) ||
              ''}
          </span>
          <MapPin color={props.disabled ? colors.grey200 : undefined} />
        </ContentWrapper>
      </PickerButton>
      {modalVisible && (
        <>
          <ModalContainer id="picker-modal">
            <ModalHeader>
              <TitleContent>
                <Location />
                <span>{intl.formatMessage(constantsMessages.location)}</span>
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
              <StyledLocationSearch
                selectedLocation={selectedSearchedLocation}
                locationList={searchableLocations}
                searchHandler={({ id }) => {
                  props.onChangeLocation(id)
                  setModalVisible(false)
                }}
              />
            </ModalBody>
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

function mapStateToProps(state: IStoreState, props: IBaseProps): IConnectProps {
  const offlineLocations = getOfflineData(state).locations
  const offlineOffices = getOfflineData(state).offices
  const jurisidictionTypeFilter =
    (props.requiredJurisdictionTypes &&
      props.requiredJurisdictionTypes.split(',')) ||
    undefined
  return {
    offlineLocations,
    offlineOffices,
    jurisidictionTypeFilter
  }
}

export const LocationPicker = connect(mapStateToProps)(
  injectIntl(LocationPickerComponent)
)
