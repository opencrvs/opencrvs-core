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
import { ListTable } from '@opencrvs/components/lib/interface'
import { constantsMessages } from '@client/i18n/messages'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { IOfflineData } from '@client/offline/reducer'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'

interface IStateProps {
  offlineResources: IOfflineData
}

interface IGenderBasisMetrics {
  location: string
  femaleOver18: number
  maleOver18: number
  maleUnder18: number
  femaleUnder18: number
  total: number
}

type FullProps = {
  genderBasisMetrics: IGenderBasisMetrics[]
} & IStateProps &
  WrappedComponentProps

class GenderBasisComponent extends React.Component<FullProps> {
  getLocationByLocationId(locationId: string) {
    return (
      Object.values(this.props.offlineResources.locations).find(
        location => location.id === locationId
      ) || {
        name: ''
      }
    )
  }

  getContent() {
    return this.props.genderBasisMetrics.map(content => {
      return {
        location: this.getLocationByLocationId(content.location).name,
        femaleOver18:
          content.femaleOver18 +
          ' (' +
          (content.femaleOver18 / content.total) * 100 +
          '%)',
        maleOver18:
          content.femaleOver18 +
          ' (' +
          (content.maleOver18 / content.total) * 100 +
          '%)',
        maleUnder18:
          content.femaleOver18 +
          ' (' +
          (content.maleUnder18 / content.total) * 100 +
          '%)',
        femaleUnder18:
          content.femaleOver18 +
          ' (' +
          (content.maleOver18 / content.total) * 100 +
          '%)',
        total: String(content.total)
      }
    })
  }

  render() {
    const { intl } = this.props

    return (
      <ListTable
        tableTitle={intl.formatMessage(
          constantsMessages.birthRegistrationTitle
        )}
        isLoading={false}
        content={this.getContent()}
        columns={[
          {
            label: intl.formatMessage(constantsMessages.location),
            width: 25,
            key: 'location',
            isSortable: false
          },
          {
            label: intl.formatMessage(constantsMessages.maleUnder18),
            width: 15,
            key: 'maleUnder18',
            isSortable: false
          },
          {
            label: intl.formatMessage(constantsMessages.femaleUnder18),
            width: 15,
            key: 'femaleUnder18',
            isSortable: false
          },
          {
            label: intl.formatMessage(constantsMessages.maleOver18),
            width: 15,
            key: 'maleOver18',
            isSortable: false
          },
          {
            label: intl.formatMessage(constantsMessages.femaleOver18),
            width: 15,
            key: 'femaleOver18',
            isSortable: false
          },
          {
            label: intl.formatMessage(constantsMessages.total),
            width: 15,
            key: 'total',
            isSortable: false
          }
        ]}
        noResultText={intl.formatMessage(constantsMessages.noResults)}
      />
    )
  }
}

export const GenderBasisReports = connect(
  (store: IStoreState) => {
    return {
      offlineResources: getOfflineData(store)
    }
  },
  {}
)(injectIntl(GenderBasisComponent))
