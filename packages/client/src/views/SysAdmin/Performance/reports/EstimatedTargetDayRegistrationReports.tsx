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
import { GQLRegistrationTargetDayEstimatedMetrics } from '@opencrvs/gateway/src/graphql/schema'
import { Event } from '@client/forms'
import { getLocationFromPartOfLocationId } from '@client/views/SysAdmin/Performance/reports/utils'
import { IFooterFColumn } from '@opencrvs/components/lib/interface/GridTable/types'
import { get } from 'lodash'

interface IStateProps {
  offlineCountryConfiguration: IOfflineData
}

type FullProps = {
  data: GQLRegistrationTargetDayEstimatedMetrics
  eventType: Event
  loading: boolean
} & IStateProps &
  WrappedComponentProps

class EstimatedTargetDayRegistrationReportComponent extends React.Component<FullProps> {
  getContent = () => {
    return (
      (this.props.data.details &&
        this.props.data.details.map((registrationInTargetDay) => {
          const location = getLocationFromPartOfLocationId(
            registrationInTargetDay.locationId,
            this.props.offlineCountryConfiguration
          ).name
          return !registrationInTargetDay.estimatedRegistration ||
            registrationInTargetDay.estimatedRegistration <= 0
            ? {
                location,
                estimation: 'No data',
                estimationYear: String(registrationInTargetDay.estimationYear),
                estimationLevel:
                  registrationInTargetDay.estimationLocationLevel.toLowerCase(),
                registrationInTargetDay: 'No data',
                percentage: 'No data'
              }
            : {
                location,
                estimation: String(
                  registrationInTargetDay.estimatedRegistration
                ),
                estimationYear: String(registrationInTargetDay.estimationYear),
                estimationLevel:
                  registrationInTargetDay.estimationLocationLevel.toLowerCase(),
                registrationInTargetDay: String(
                  registrationInTargetDay.registrationInTargetDay
                ),
                percentage: `${registrationInTargetDay.estimationPercentage}%`
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
        label: get(this.props.data, 'total.registrationInTargetDay') || '0',
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
        id="estimatedTargetDayRegistrations"
        tableTitle={intl.formatMessage(
          constantsMessages.estimatedTargetDaysRegistrationTitle,
          {
            registrationTargetDays:
              this.props.eventType === Event.BIRTH
                ? this.props.offlineCountryConfiguration.config.BIRTH
                    .REGISTRATION_TARGET
                : this.props.offlineCountryConfiguration.config.DEATH
                    .REGISTRATION_TARGET
          }
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
              constantsMessages.totalRegisteredInTargetDays,
              {
                registrationTargetDays:
                  this.props.eventType === Event.BIRTH
                    ? this.props.offlineCountryConfiguration.config.BIRTH
                        .REGISTRATION_TARGET
                    : this.props.offlineCountryConfiguration.config.DEATH
                        .REGISTRATION_TARGET
              }
            ),
            width: 22,
            key: 'registrationInTargetDay',
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

export const EstimatedTargetDayRegistrationReports = connect(
  (store: IStoreState) => {
    return {
      offlineCountryConfiguration: getOfflineData(store)
    }
  },
  {}
)(injectIntl(EstimatedTargetDayRegistrationReportComponent))
