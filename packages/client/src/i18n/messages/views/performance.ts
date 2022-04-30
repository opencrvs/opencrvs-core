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
import { defineMessages } from 'react-intl'

const messagesToDefine = {
  performanceCompletenessRatesHeader: {
    id: 'performance.reports.header.completenessRates',
    defaultMessage: 'Completeness rates',
    description: 'Header for report completeness rates'
  },
  performanceCompletenessRatesSubHeader: {
    id: 'performance.reports.subHeader.completenessRates',
    defaultMessage:
      'The no. of registrations, expressed as a % of the total estimated no. of {event, select, BIRTH{birth} DEATH{death} other{birth}}s occurring',
    description: 'Sub header for report completeness rates'
  },
  performanceTotalRegitrationsHeader: {
    id: 'performance.reports.header.totalRegistrations',
    defaultMessage: 'Registrations',
    description: 'Header for report total registrations'
  },
  performanceTotalCertificatesHeader: {
    id: 'performance.reports.header.totalCertificates',
    defaultMessage: 'Certificates issued',
    description: 'Header for report total certificates'
  },
  performanceTotalCertificatesSubHeader: {
    id: 'performance.reports.subHeader.totalCertificates',
    defaultMessage:
      'Certification rate is the no. of certificates issues, expressed as a percentage of the total number of registrations',
    description: 'Sub header for report total certificates'
  },
  performanceTotalCorrectionsHeader: {
    id: 'performance.reports.header.totalCorrections',
    defaultMessage: 'Corrections',
    description: 'Header for report total corrections'
  },
  performanceTotalPaymentsHeader: {
    id: 'performance.reports.header.totalPayments',
    defaultMessage: 'Fees collected',
    description: 'Header for report total payments'
  },
  performanceApplicationSourcesHeader: {
    id: 'performance.reports.header.applicationSources',
    defaultMessage: 'Sources of applications',
    description: 'Header for sources of applications'
  },
  performanceTotalLabel: {
    id: 'performance.values.labels.total',
    defaultMessage: 'Total',
    description: 'Label text for displays showing totals'
  },
  performanceDelayedRegistrationsLabel: {
    id: 'performance.values.labels.delayed',
    defaultMessage: 'Delayed registrations',
    description: 'Label text for display showing delayed registrations'
  },
  performanceLateRegistrationsLabel: {
    id: 'performance.values.labels.late',
    defaultMessage: 'Late registrations',
    description: 'Label text for display showing late registrations'
  },
  performanceHealthFacilityBirth: {
    id: 'performance.values.labels.birth.healthFacility',
    defaultMessage: 'Health facility birth',
    description: 'Label text for display showing health facility births'
  },
  performanceHealthFacilityDeath: {
    id: 'performance.values.labels.death.healthFacility',
    defaultMessage: 'Health facility death',
    description: 'Label text for display showing health facility deaths'
  },
  performanceHomeBirth: {
    id: 'performance.values.labels.birth.home',
    defaultMessage: 'Home birth',
    description: 'Label text for display showing private home births'
  },
  performanceHomeDeath: {
    id: 'performance.values.labels.death.home',
    defaultMessage: 'Home death',
    description: 'Label text for display showing private home deaths'
  },
  performanceMaleLabel: {
    id: 'performance.values.labels.male',
    defaultMessage: 'Male',
    description: 'Label text for displays showing the number of males'
  },
  performanceFemaleLabel: {
    id: 'performance.values.labels.female',
    defaultMessage: 'Female',
    description: 'Label text for displays showing the number of females'
  },
  performanceWithinTargetDaysLabel: {
    id: 'performance.values.labels.withinTargetDays',
    defaultMessage:
      '{withPrefix, select, true {Registered within} other {Within}} {target} days',
    description: 'Label text for displays showing registered within target days'
  },
  performanceWithin1YearLabel: {
    id: 'performance.values.labels.within1Year',
    defaultMessage: 'Within 1 year',
    description: 'Label text for displays showing registered within 1 year'
  },
  performanceWithin5YearsLabel: {
    id: 'performance.values.labels.within5Years',
    defaultMessage: 'Within 5 years',
    description: 'Label text for displays showing registered within 5 years'
  },
  performanceCertificationFeeLabel: {
    id: 'performance.payments.label.certificationFee',
    defaultMessage: 'Certification fee',
    description: 'Label for certification fee'
  },
  performanceCorrectionFeeLabel: {
    id: 'performance.payments.label.correctionFee',
    defaultMessage: 'Correction fee',
    description: 'Label for correction fee'
  },
  performanceHospitalApplicationsLabel: {
    id: 'performance.appSrc.labels.hospitalApplications',
    defaultMessage: 'Health system (integration)',
    description: 'Label for hospital applications'
  },
  performanceFieldAgentsApplicationsLabel: {
    id: 'performance.appSrc.labels.fieldAgents',
    defaultMessage: 'Field agents',
    description: 'Label for field agents in application sources'
  },
  performanceRegistrarsApplicationsLabel: {
    id: 'performance.appSrc.labels.registrars',
    defaultMessage: 'Registrars',
    description: 'Label for registrars in application sources'
  },
  performanceRegistrationAgentsApplicationsLabel: {
    id: 'performance.appSrc.labels.registrarAgents',
    defaultMessage: 'Registrar agents',
    description: 'Label for registrar agents in application sources'
  },
  performanceCertificationRateLabel: {
    id: 'performance.labels.certificationRate',
    defaultMessage: 'Certification rate',
    descrption: 'Label for certification rate'
  },
  sysAdminPerformanceHomeHeader: {
    id: 'performance.header.sysadmin.home',
    defaultMessage: 'Search for an administrative area or office',
    description: 'Header for system admin performance home page'
  },
  sysAdminTeamHomeHeader: {
    id: 'team.header.sysadmin.home',
    defaultMessage: 'Search for an office',
    description: 'Header for system admin team home page'
  },
  noResultForLocation: {
    id: 'performance.reports.noResultForLocation',
    defaultMessage:
      'No data for {searchedLocation}. We are currently piloting for following areas:',
    description: 'Message to show if no data is found for a location'
  },
  noResultForLocationWithoutPilotAreas: {
    id: 'performance.reports.noResultInPilot',
    defaultMessage: 'No data for {searchedLocation}.',
    description: 'Message to show if no data is found for a location'
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
  otherCorrectionReason: {
    id: 'performance.reports.corrections.other.label',
    defaultMessage: 'Other',
    description: 'Label "Other" category in corrections'
  },
  declarationsStartedTitle: {
    id: 'performance.reports.declarationsStarted.title',
    defaultMessage: 'Declarations started',
    description: 'Title for declarations started in performance reports'
  },
  declarationsStartedDescription: {
    id: 'performance.reports.appStart.desc',
    defaultMessage:
      'Total and percentage breakdown of the declarations started by source from ',
    description: 'Description for declarations started in performance reports'
  },
  declarationsStartedTotal: {
    id: 'performance.reports.declarationsStarted.total',
    defaultMessage: 'Total started',
    description: 'Total declarations started title'
  },
  declarationsStartedFieldAgents: {
    id: 'performance.reports.appStart.fieldAgents',
    defaultMessage: 'Field agents',
    description: 'Field agent declarations started title'
  },
  declarationsStartedOffices: {
    id: 'performance.reports.declarationsStarted.offices',
    defaultMessage: 'Registration offices',
    description: 'Offices declarations started title'
  },
  declarationsStartedHospitals: {
    id: 'performance.reports.declarationsStarted.hospitals',
    defaultMessage: 'Hospitals (DHIS2)',
    description: 'Hospitals declarations started title'
  },
  overTime: {
    id: 'performance.regRates.select.item.overTime',
    defaultMessage: 'Over time',
    description: 'Label for select option Over time'
  },
  byLocation: {
    id: 'performance.regRates.select.item.byLocation',
    defaultMessage: 'By location',
    description: 'Label for select option By location'
  },
  locationTitle: {
    id: 'performance.regRates.column.location',
    defaultMessage: 'Locations',
    description: 'Title for location column on estimation table'
  },
  declarationCountByStatusDescription: {
    id: 'performance.ops.statCount.desc',
    defaultMessage:
      'Current status of all declarations being processed for your selected administrative area.',
    description: 'Description of the status wise declaration count view'
  },
  workflowStatusHeader: {
    id: 'performance.operational.workflowStatus.header',
    defaultMessage: 'Current declarations in workflow',
    description: 'Header title for work flow status page'
  },
  fieldAgentsTitle: {
    id: 'performance.fieldAgents.title',
    defaultMessage: 'Field agnets',
    description: 'Header title for field agent list page'
  },
  fieldAgentsNoResult: {
    id: 'performance.fieldAgents.noResult',
    defaultMessage: 'No users found',
    description: 'Text for no field agent found'
  },
  fieldAgentColumnHeader: {
    id: 'performance.fieldAgents.columnHeader.name',
    defaultMessage: 'Field agents ({totalAgents})',
    description: 'Column header for field agent'
  },
  typeColumnHeader: {
    id: 'performance.fieldAgents.columnHeader.type',
    defaultMessage: 'Type',
    description: 'Column header for type in field agent list'
  },
  officeColumnHeader: {
    id: 'performance.fieldAgents.columnHeader.office',
    defaultMessage: 'Office',
    description: 'Column header for office in field agent list'
  },
  startMonthColumnHeader: {
    id: 'performance.fieldAgents.columnHeader.startMonth',
    defaultMessage: 'Start month',
    description: 'Column header for start of month in field agent list'
  },
  totalSentColumnHeader: {
    id: 'performance.fieldAgents.columnHeader.totalSent',
    defaultMessage: 'Declarations{linebreak}sent',
    description: 'Column header for total declaration sent in field agent list'
  },
  totalInProgressColumnHeader: {
    id: 'performance.fieldAgents.col.totInProg',
    defaultMessage: 'Sent{linebreak}incomplete',
    description:
      'Column header for total inprogress declaration sent in field agent list'
  },
  avgCompletionTimeColumnHeader: {
    id: 'performance.fieldAgents.col.avgCompTime',
    defaultMessage: 'Avg. time to send{linebreak}complete declaration',
    description:
      'Column header for avg declaration completion time in field agent list'
  },
  totalRejectedColumnHeader: {
    id: 'performance.fieldAgents.col.totRej',
    defaultMessage: 'Rejected',
    description:
      'Column header for total rejected declarations in field agent list'
  },
  fieldAgentStatusOptionActive: {
    id: 'performance.fieldAgents.options.status.active',
    defaultMessage: 'Active',
    description: 'Label for active status option'
  },
  fieldAgentStatusOptionPending: {
    id: 'performance.fieldAgents.options.status.pending',
    defaultMessage: 'Pending',
    description: 'Label for pending status option'
  },
  fieldAgentStatusOptionDeactive: {
    id: 'performance.fieldAgents.options.status.deactive',
    defaultMessage: 'Deactive',
    description: 'Label for deactive status option'
  },
  eventOptionForBoth: {
    id: 'performance.fieldAgents.options.event.both',
    defaultMessage: 'Births and deaths',
    description: 'Label for both event option'
  },
  eventOptionForBirths: {
    id: 'performance.fieldAgents.options.event.births',
    defaultMessage: 'Births',
    description: 'Label for birth event option'
  },
  eventOptionForDeaths: {
    id: 'performance.fieldAgents.options.event.deaths',
    defaultMessage: 'Deaths',
    description: 'Label for death event option'
  },
  showMoreUsersLinkLabel: {
    id: 'performance.fieldAgents.showMore',
    defaultMessage: 'Show next {pageSize}',
    description: 'Label for show more link'
  },
  pilotAreaListHeader: {
    id: 'performance.pilotArea.header',
    defaultMessage: 'Pilot Areas',
    description: 'Label for pilot area list header'
  },
  stats: {
    id: 'performance.stats.header',
    defaultMessage: 'Stats',
    description: 'Title for perforamce stats'
  },
  registrarsToCitizen: {
    id: 'performance.registrarsToCitizen',
    defaultMessage: 'Registrars to citizens',
    description: 'Title for Registrars to citizens'
  },
  registrarsToCitizenValue: {
    id: 'performance.registrarsToCitizenValue',
    defaultMessage: '1 to {citizen}',
    description: 'Value for Registrars to citizens'
  },
  registrationByStatus: {
    id: 'performance.registrationByStatus.header',
    defaultMessage: 'Registration by status',
    description: 'Title for Registration by status'
  }
}

export const messages = defineMessages(messagesToDefine)
