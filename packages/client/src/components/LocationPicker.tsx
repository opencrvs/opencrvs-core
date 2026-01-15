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
import * as React from 'react'
import {
  MapPin,
  Location as LocationIcon,
  Cross
} from '@opencrvs/components/lib/icons'
import { generateSearchOptions } from '@client/utils/locationUtils'
import {
  ISearchLocation,
  LocationSearch
} from '@opencrvs/components/lib/LocationSearch'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
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
import styled from 'styled-components'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { AdministrativeArea, Location } from '@opencrvs/commons/client'
import { useAdministrativeAreas } from '../v2-events/hooks/useAdministrativeAreas'
import { useIntl } from 'react-intl'

const { useState, useEffect } = React

interface LocationPickerProps {
  additionalLocations?: ISearchLocation[]
  selectedLocationId?: string
  disabled?: boolean
  onChangeLocation: (locationId: string) => void
  locationFilter?: (location: Location | AdministrativeArea) => boolean
}

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

export function LocationPicker({
  locationFilter,
  selectedLocationId,
  disabled,
  onChangeLocation,
  additionalLocations = []
}: LocationPickerProps) {
  const intl = useIntl()
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  const { getLocations } = useLocations()
  const { getAdministrativeAreas } = useAdministrativeAreas()

  const locations = getLocations.useSuspenseQuery()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()

  const offlineSearchableLocations = generateSearchOptions(
    locations,
    administrativeAreas,
    locationFilter
  )

  const searchableLocations = [
    ...additionalLocations,
    ...offlineSearchableLocations
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
          <MapPin color={disabled ? colors.grey200 : undefined} />
        </ContentWrapper>
      </PickerButton>
      {modalVisible && (
        <>
          <ModalContainer id="picker-modal">
            <ModalHeader>
              <TitleContent>
                <LocationIcon />
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
                buttonLabel={intl.formatMessage(buttonMessages.search)}
                selectedLocation={selectedSearchedLocation}
                locationList={searchableLocations}
                searchHandler={({ id }) => {
                  onChangeLocation(id)
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
