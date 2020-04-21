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
import { defineMessages, MessageDescriptor } from 'react-intl'

interface IPerformanceReportsMessages {
  monthlyTabTitle: MessageDescriptor
  monthlyReportsBodyHeader: MessageDescriptor
  sysAdminPerformanceHomeHeader: MessageDescriptor
  noResultForLocation: MessageDescriptor
  exportAll: MessageDescriptor
  operational: MessageDescriptor
  reports: MessageDescriptor
  applicationsStartedTitle: MessageDescriptor
  applicationsStartedDescription: MessageDescriptor
  applicationsStartedTotal: MessageDescriptor
  applicationsStartedFieldAgents: MessageDescriptor
  applicationsStartedHospitals: MessageDescriptor
  applicationsStartedOffices: MessageDescriptor
  registrationRatesReportHeader: MessageDescriptor
  registrationRatesReportSubHeader: MessageDescriptor
  registrationRatesReportDescription: MessageDescriptor
  birthRegistrationRatesReportHeader: MessageDescriptor
  deathRegistrationRatesReportHeader: MessageDescriptor
}

const messagesToDefine: IPerformanceReportsMessages = {
  monthlyTabTitle: {
    id: 'performance.topbar.tab.title.monthly',
    defaultMessage: 'Monthly',
    description: 'Title used for monthly tab in performance page header'
  },
  monthlyReportsBodyHeader: {
    id: 'performance.body.header.monthly.reports',
    defaultMessage: 'Monthly reports',
    description: 'Header used for the body of monthly reports page'
  },
  sysAdminPerformanceHomeHeader: {
    id: 'performance.header.sysadmin.home',
    defaultMessage: 'Search for an administrative area or office',
    description: 'Header for system admin performance home page'
  },
  noResultForLocation: {
    id: 'performance.reports.noResultForLocation',
    defaultMessage:
      'No data for {searchedLocation}. We are currently piloting for two upazilas:',
    description: 'Message to show if no data is found for a location'
  },
  exportAll: {
    id: 'performance.reports.exportAll',
    defaultMessage: 'Export all performance data',
    description: 'Link text where all performance data is downloaded from'
  },
  operational: {
    id: 'performance.reports.select.item.operational',
    defaultMessage: 'Operational',
    description: 'Label for select option Operational'
  },
  reports: {
    id: 'performance.reports.select.item.reports',
    defaultMessage: 'Reports',
    description: 'Label for select option Reports'
  },
  applicationsStartedTitle: {
    id: 'performance.reports.applicationsStarted.title',
    defaultMessage: 'Applications started',
    description: 'Title for applications started in performance reports'
  },
  applicationsStartedDescription: {
    id: 'performance.reports.applicationsStarted.description',
    defaultMessage:
      'Total and percentage breakdown of the applications started by source from ',
    description: 'Description for applications started in performance reports'
  },
  applicationsStartedTotal: {
    id: 'performance.reports.applicationsStarted.total',
    defaultMessage: 'Total started',
    description: 'Total applications started title'
  },
  applicationsStartedFieldAgents: {
    id: 'performance.reports.applicationsStarted.fieldAgents',
    defaultMessage: 'Field agents',
    description: 'Field agent applications started title'
  },
  applicationsStartedOffices: {
    id: 'performance.reports.applicationsStarted.offices',
    defaultMessage: 'Registration offices',
    description: 'Offices applications started title'
  },
  applicationsStartedHospitals: {
    id: 'performance.reports.applicationsStarted.hospitals',
    defaultMessage: 'Hospitals (DHIS2)',
    description: 'Hospitals applications started title'
  },
  registrationRatesReportHeader: {
    id: 'performance.report.registration.rates.header',
    defaultMessage: 'Registration rates',
    description: 'Header for registration rates report'
  },
  registrationRatesReportSubHeader: {
    id: 'performance.report.registration.rates.subheader',
    defaultMessage:
      'Rates are based on estimated totals calculated using the crude birth and death rate for {startTime} - {endTime}',
    description: 'Sub header for registration rates report'
  },
  registrationRatesReportDescription: {
    id: 'performance.report.registration.rates.description',
    defaultMessage:
      '{totalRegistrationNumber} registered withing 45 days out of estimated {estimatedRegistrationNumber}',
    description: 'Event registration rate report description'
  },
  birthRegistrationRatesReportHeader: {
    id: 'performance.report.registration.rates.birth.header',
    defaultMessage: 'Birth registration rate withing 45 days of event',
    description: 'Header for birth registration rates report'
  },
  deathRegistrationRatesReportHeader: {
    id: 'performance.report.registration.rates.death.header',
    defaultMessage: 'Death registration rate withing 45 days of event',
    description: 'Header for death registration rates report'
  }
}

export const messages: IPerformanceReportsMessages = defineMessages(
  messagesToDefine
)
