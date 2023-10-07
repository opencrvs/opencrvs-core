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
import React from 'react'

import styled from 'styled-components'
import {
  GQLLocation,
  GQLIdentifier,
  GQLPaymentMetric
} from '@opencrvs/gateway/src/graphql/schema'
import { Event } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'
import { ILocation } from '@client/offline/reducer'
import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import { getPercentage } from '@client/utils/data-formatting'
import { FormattedNumber, IntlShape } from 'react-intl'
import { ISearchLocation } from '@opencrvs/components/lib/LocationSearch'
import { ListViewSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import { constantsMessages } from '@client/i18n/messages'
import { messages as statusMessages } from '@client/i18n/messages/views/registrarHome'
import { colors } from '@opencrvs/components/lib/colors'
import { IStatusMapping } from './reports/operational/StatusWiseDeclarationCountView'
import {
  PERFORMANCE_METRICS,
  PERFORMANCE_STATS,
  CORRECTION_TOTALS
} from '@client/views/SysAdmin/Performance/metricsQuery'
import {
  GET_TOTAL_CERTIFICATIONS,
  GET_TOTAL_PAYMENTS
} from '@client/views/SysAdmin/Performance/queries'

export const Header = styled.h1`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.h2};
`

export function getMonthDateRange(year: number, month: number) {
  return {
    start: startOfMonth(new Date(year, month - 1)),
    end: endOfMonth(new Date(year, month - 1))
  }
}
export const ReportHeader = styled.div`
  margin: 32px 0 24px 0;
`

export const SubHeader = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.h4};
`

export const Description = styled.div`
  margin: 8px 0px;
  color: ${({ theme }) => theme.colors.supportingCopy};
  ${({ theme }) => theme.fonts.reg14};
`

export const ActionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  margin: 0 -24px 0 -24px;
  padding: 12px 24px 11px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`
export const PerformanceTitle = styled.div`
  ${({ theme }) => theme.fonts.bold16}
`
export const PerformanceListHeader = styled.h4`
  ${({ theme }) => theme.fonts.h3}
  color: ${({ theme }) => theme.colors.copy};
  margin: 0;
  margin-bottom: 8px;
`

export const PerformanceListSubHeader = styled.p`
  ${({ theme }) => theme.fonts.reg16}
  color:  ${({ theme }) => theme.colors.supportingCopy};
  margin: 0;
  margin-bottom: 0.5em;
`
export const PerformanceValue = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.reg16};
`

export const Breakdown = styled.div`
  margin-top: 0.5rem;
`
export const BreakdownRow = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.reg12}
`
export const BreakdownLabel = styled.span`
  ${({ theme }) => theme.fonts.bold12};
`
export const BreakdownValue = styled.span``

export const ReportContainer = styled(ListViewSimplified)`
  :not(:last-of-type) {
    margin-bottom: 2em;
  }
  grid-template-columns: auto 1fr minmax(5em, auto);

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    grid-template-columns: none;
  }
`

export function PercentageDisplay(props: {
  total: number
  ofNumber: number
  precision?: number
}) {
  return (
    <span>
      {getPercentage(props.ofNumber, props.total).toFixed(props.precision || 1)}
      %
    </span>
  )
}

export const ListContainer = styled.div`
  margin-top: 36px;
`

export const certificationRatesDummyData = [
  {
    label: 'Total',
    value: 4000
  },
  {
    label: 'Certification Rate',
    value: 25
  }
]

export function TotalDisplayWithPercentage(props: {
  total: number
  ofNumber: number
}) {
  return (
    <span>
      <FormattedNumber value={props.total}></FormattedNumber>
      &nbsp;(
      <PercentageDisplay {...props} />)
    </span>
  )
}

export function calculateTotal<T extends Array<{ total: number }>>(metrics: T) {
  return metrics
    .map((metric) => metric.total)
    .reduce((m, metric) => m + metric, 0)
}

export function calculateTotalPaymentAmount(metrics: GQLPaymentMetric[]) {
  return metrics
    .map((metric) => metric.total)
    .reduce((m, metric) => m + metric, 0)
}

export function getJurisidictionType(location: GQLLocation): string | null {
  let jurisdictionType = null

  const jurisdictionTypeIdentifier =
    location.identifier &&
    location.identifier.find(
      ({ system }: GQLIdentifier) =>
        system && system === 'http://opencrvs.org/specs/id/jurisdiction-type'
    )

  if (jurisdictionTypeIdentifier) {
    jurisdictionType = jurisdictionTypeIdentifier.value as string
  }

  return jurisdictionType
}

export function isUnderJurisdictionOfUser(
  locations: { [key: string]: ILocation },
  locationId: string,
  jurisdictionLocation: string | undefined | null
) {
  if (!jurisdictionLocation) return false

  while (locationId !== jurisdictionLocation && locationId !== '0') {
    locationId = locations[locationId].partOf.split('/')[1]
  }

  return locationId !== '0'
}

export function getPrimaryLocationIdOfOffice(
  locations: { [key: string]: ILocation },
  office: ILocation
) {
  const location = locations[office.partOf.split('/')[1]]

  if (!location) {
    throw new Error(`Office location of ${office.id} not found`)
  }

  return location.id
}

export function getJurisdictionLocationIdFromUserDetails(
  userDetails: UserDetails
) {
  const location =
    userDetails.catchmentArea &&
    userDetails.catchmentArea.find((location) => {
      const jurisdictionTypeIdentifier =
        location?.identifier &&
        location?.identifier.find(
          (identifier) =>
            identifier?.system ===
            'http://opencrvs.org/specs/id/jurisdiction-type'
        )
      return (
        // Needs to be an administrative location with jurisdiction
        jurisdictionTypeIdentifier && jurisdictionTypeIdentifier.value
      )
    })

  return location && location.id
}

export enum CompletenessRateTime {
  WithinTarget = 'withinTarget',
  Within1Year = 'within1Year',
  Within5Years = 'within5Years'
}

export const NATIONAL_ADMINISTRATIVE_LEVEL = 'NATIONAL_ADMINISTRATIVE_LEVEL'

export function getAdditionalLocations(intl: IntlShape) {
  return [
    {
      id: NATIONAL_ADMINISTRATIVE_LEVEL,
      searchableText: intl.formatMessage(constantsMessages.countryName),
      displayLabel: intl.formatMessage(constantsMessages.countryName)
    }
  ]
}

export function isCountry(location: ISearchLocation) {
  return location.id === NATIONAL_ADMINISTRATIVE_LEVEL
}

export const StatusMapping: IStatusMapping = {
  IN_PROGRESS: {
    labelDescriptor: statusMessages.inProgress,
    color: colors.purple
  },
  DECLARED: {
    labelDescriptor: statusMessages.readyForReview,
    color: colors.orange
  },
  REJECTED: {
    labelDescriptor: statusMessages.sentForUpdates,
    color: colors.red
  },
  VALIDATED: {
    labelDescriptor: statusMessages.sentForApprovals,
    color: colors.grey300
  },
  WAITING_VALIDATION: {
    labelDescriptor: statusMessages.sentForExternalValidation,
    color: colors.grey500
  },
  REGISTERED: {
    labelDescriptor: statusMessages.readyToPrint,
    color: colors.green
  },
  CERTIFIED: {
    labelDescriptor: statusMessages.certified,
    color: colors.blue
  },
  REQUESTED_CORRECTION: {
    labelDescriptor: statusMessages.requestedCorrection,
    color: colors.blue
  },
  CORRECTED: {
    labelDescriptor: statusMessages.requestedCorrection,
    color: colors.blue
  },
  APPROVED_CORRECTION: {
    labelDescriptor: statusMessages.requestedCorrection,
    color: colors.blue
  },
  REJECTED_CORRECTION: {
    labelDescriptor: statusMessages.requestedCorrection,
    color: colors.blue
  },
  ARCHIVED: {
    labelDescriptor: statusMessages.archived,
    color: colors.blue
  },
  MARKED_AS_DUPLICATE: {
    labelDescriptor: statusMessages.archived,
    color: colors.blue
  }
}

export const mockPerformanceMetricsRequest = {
  request: {
    query: PERFORMANCE_METRICS,
    variables: {
      locationId: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
      event: 'BIRTH',
      timeEnd: new Date(1487076708000).toISOString(),
      timeStart: new Date(1455454308000).toISOString()
    }
  },
  result: {
    data: {
      getTotalMetrics: {
        estimated: {
          totalEstimation: 0,
          maleEstimation: 0,
          femaleEstimation: 0,
          locationId: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
          locationLevel: '',
          __typename: 'Estimation'
        },
        results: [
          {
            total: 1,
            gender: 'female',
            eventLocationType: 'HEALTH_FACILITY',
            practitionerRole: 'FIELD_AGENT',
            timeLabel: 'within5Years',
            __typename: 'EventMetrics'
          },
          {
            total: 1,
            gender: 'female',
            eventLocationType: 'HEALTH_FACILITY',
            practitionerRole: 'FIELD_AGENT',
            timeLabel: 'withinLate',
            __typename: 'EventMetrics'
          },
          {
            total: 1,
            gender: 'male',
            eventLocationType: 'HEALTH_FACILITY',
            practitionerRole: 'FIELD_AGENT',
            timeLabel: 'within5Years',
            __typename: 'EventMetrics'
          },
          {
            total: 1,
            gender: 'male',
            eventLocationType: 'HEALTH_FACILITY',
            practitionerRole: 'LOCAL_REGISTRAR',
            timeLabel: 'within5Years',
            __typename: 'EventMetrics'
          }
        ],
        __typename: 'TotalMetricsResult'
      }
    }
  }
}

export const mockRegistrationCountRequest = {
  request: {
    query: PERFORMANCE_STATS,
    variables: {
      locationId: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
      status: [
        'IN_PROGRESS',
        'DECLARED',
        'REJECTED',
        'VALIDATED',
        'WAITING_VALIDATION',
        'REGISTERED'
      ],
      populationYear: new Date(1487076708000).getFullYear(),
      event: Event.Birth,
      officeSelected: false
    }
  },
  result: {
    data: {
      fetchRegistrationCountByStatus: {
        results: [
          {
            status: 'IN_PROGRESS',
            count: 0,
            __typename: 'StatusWiseRegistrationCount'
          },
          {
            status: 'DECLARED',
            count: 11,
            __typename: 'StatusWiseRegistrationCount'
          },
          {
            status: 'REJECTED',
            count: 2,
            __typename: 'StatusWiseRegistrationCount'
          },
          {
            status: 'VALIDATED',
            count: 4,
            __typename: 'StatusWiseRegistrationCount'
          },
          {
            status: 'WAITING_VALIDATION',
            count: 0,
            __typename: 'StatusWiseRegistrationCount'
          },
          {
            status: 'REGISTERED',
            count: 5,
            __typename: 'StatusWiseRegistrationCount'
          }
        ],
        total: 22,
        __typename: 'RegistrationCountResult'
      },
      getLocationStatistics: {
        population: 686234,
        offices: 4,
        registrars: 1,
        __typename: 'LocationStatisticsResponse'
      }
    }
  }
}

export const mockTotalPaymentsRequest = {
  request: {
    query: GET_TOTAL_PAYMENTS,
    variables: {
      locationId: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
      event: 'BIRTH',
      timeEnd: new Date(1487076708000).toISOString(),
      timeStart: new Date(1455454308000).toISOString()
    }
  },
  result: {
    data: {
      getTotalPayments: [
        {
          total: 50.5,
          paymentType: 'certification',
          __typename: 'PaymentMetric'
        }
      ]
    }
  }
}
export const mockTotalCertificationsRequest = {
  request: {
    query: GET_TOTAL_CERTIFICATIONS,
    variables: {
      locationId: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
      event: 'BIRTH',
      timeEnd: new Date(1487076708000).toISOString(),
      timeStart: new Date(1455454308000).toISOString()
    }
  },
  result: {
    data: {
      getTotalCertifications: [
        {
          total: 1,
          eventType: 'BIRTH',
          __typename: 'CertificationMetric'
        }
      ]
    }
  }
}
export const mockTotalCorrectionsRequest = {
  request: {
    query: CORRECTION_TOTALS,
    variables: {
      locationId: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
      event: 'BIRTH',
      timeEnd: new Date(1487076708000).toISOString(),
      timeStart: new Date(1455454308000).toISOString()
    }
  },
  result: {
    data: {
      getTotalCorrections: [
        {
          total: 1,
          reason: 'CLERICAL_ERROR',
          __typename: 'CorrectionMetric'
        }
      ]
    }
  }
}
