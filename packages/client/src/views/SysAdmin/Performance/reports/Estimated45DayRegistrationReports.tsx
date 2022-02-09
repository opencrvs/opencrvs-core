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
import {
  ListTable,
  ColumnContentAlignment
} from '@opencrvs/components/lib/interface'
import { constantsMessages } from '@client/i18n/messages'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { IOfflineData } from '@client/offline/reducer'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import { GQLRegistration45DayEstimatedMetrics } from '@opencrvs/gateway/src/graphql/schema'
import { Event } from '@client/forms'
import { getLocationFromPartOfLocationId } from '@client/views/SysAdmin/Performance/reports/utils'
import { IFooterFColumn } from '@opencrvs/components/lib/interface/GridTable/types'
import { get } from 'lodash'

interface IStateProps {
  offlineCountryConfiguration: IOfflineData
}

type FullProps = {
  data: GQLRegistration45DayEstimatedMetrics
  eventType: Event
  loading: boolean
} & IStateProps &
  WrappedComponentProps

class Estimated45DayRegistrationReportComponent extends React.Component<FullProps> {
  getContent = () => {
    return (
      (this.props.data.details &&
        this.props.data.details.map((registrationIn45Day) => {
          const location = getLocationFromPartOfLocationId(
            registrationIn45Day.locationId,
            this.props.offlineCountryConfiguration
          ).name
          return !registrationIn45Day.estimatedRegistration ||
            registrationIn45Day.estimatedRegistration <= 0
            ? {
                location,
                estimation: 'No data',
                estimationYear: String(registrationIn45Day.estimationYear),
                estimationLevel:
                  registrationIn45Day.estimationLocationLevel.toLowerCase(),
                registrationIn45Day: 'No data',
                percentage: 'No data'
              }
            : {
                location,
                estimation: String(registrationIn45Day.estimatedRegistration),
                estimationYear: String(registrationIn45Day.estimationYear),
                estimationLevel:
                  registrationIn45Day.estimationLocationLevel.toLowerCase(),
                registrationIn45Day: String(
                  registrationIn45Day.registrationIn45Day
                ),
                percentage: `${registrationIn45Day.estimationPercentage}%`
              }
        })) ||
      []
    )
  }

  getFooterColumns(): IFooterFColumn[] {
    const estimationPercentage =
      get(this.props.data, 'total.estimationPercentage') || '0'
    return [
      {
        width: 34
      },
      {
        label: get(this.props.data, 'total.estimatedRegistration') || '0',
        width: 28
      },
      {
        label: get(this.props.data, 'total.registrationIn45Day') || '0',
        width: 22
      },
      {
        label: `${estimationPercentage}%`,
        width: 16
      }
    ]
  }

  render() {
    const { intl, loading } = this.props

    return (
      <ListTable
        id="estimated45DayRegistrations"
        tableTitle={intl.formatMessage(
          constantsMessages.estimated45DayRegistrationTitle
        )}
        fixedWidth={1074}
        isLoading={loading}
        content={this.getContent()}
        hideBoxShadow={true}
        columns={[
          {
            label: intl.formatMessage(constantsMessages.location),
            width: 34,
            key: 'location',
            isSortable: false
          },
          {
            label: intl.formatMessage(
              constantsMessages.estimatedNumberOfRegistartion
            ),
            width: 28,
            key: 'estimation',
            isSortable: false
          },
          {
            label: intl.formatMessage(
              constantsMessages.totalRegisteredIn45Days
            ),
            width: 22,
            key: 'registrationIn45Day',
            isSortable: false
          },
          {
            label: intl.formatMessage(constantsMessages.percentageOfEstimation),
            width: 16,
            key: 'percentage',
            alignment: ColumnContentAlignment.RIGHT,
            isSortable: false
          }
        ]}
        footerColumns={this.getFooterColumns()}
        noResultText={intl.formatMessage(constantsMessages.noResults)}
      />
    )
  }
}

export const Estimated45DayRegistrationReports = connect(
  (store: IStoreState) => {
    return {
      offlineCountryConfiguration: getOfflineData(store)
    }
  },
  {}
)(injectIntl(Estimated45DayRegistrationReportComponent))
