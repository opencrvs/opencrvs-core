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
import { NotificationComponent } from '@client/components/Notification'
import { Page } from '@client/components/Page'
import { ProtectedPage } from '@client/components/ProtectedPage'
import { ProtectedRoute } from '@client/components/ProtectedRoute'
import ScrollToTop from '@client/components/ScrollToTop'
import { SessionExpireConfirmation } from '@client/components/SessionExpireConfirmation'
import * as routes from '@client/navigation/routes'
import styled from 'styled-components'
import { OfficeHome } from '@client/views/OfficeHome/OfficeHome'
import { FieldAgentList } from '@client/views/Performance/FieldAgentList'
import { CollectorForm } from '@client/views/PrintCertificate/collectorForm/CollectorForm'
import { Payment } from '@client/views/PrintCertificate/Payment'
import { VerifyCollector } from '@client/views/PrintCertificate/VerifyCollector'
import { DeclarationForm } from '@client/views/RegisterForm/DeclarationForm'
import { ReviewForm } from '@client/views/RegisterForm/ReviewForm'
import { SearchResult } from '@client/views/SearchResult/SearchResult'
import { SelectVitalEvent } from '@client/views/SelectVitalEvent/SelectVitalEvent'
import { SettingsPage } from '@client/views/Settings/SettingsPage'
import { PerformanceHome } from '@client/views/SysAdmin/Performance/PerformanceHome'
import { CompletenessRates } from '@client/views/SysAdmin/Performance/CompletenessRates'
import { WorkflowStatus } from '@client/views/SysAdmin/Performance/WorkflowStatus'
import { TeamSearch } from '@client/views/SysAdmin/Team/TeamSearch'
import { CreateNewUser } from '@client/views/SysAdmin/Team/user/userCreation/CreateNewUser'

import * as React from 'react'
import { createBrowserRouter, Route, Routes } from 'react-router-dom'
import { CorrectionForm, CorrectionReviewForm } from './views/CorrectionForm'
import { VerifyCorrector } from './views/CorrectionForm/VerifyCorrector'
import { RecordAudit } from './views/RecordAudit/RecordAudit'
import { UserList } from './views/SysAdmin/Team/user/UserList'
import { SystemList } from './views/SysAdmin/Config/Systems/Systems'
import VSExport from './views/SysAdmin/Vsexports/VSExport'
import { AdvancedSearchConfig } from './views/SearchResult/AdvancedSearch'
import { ViewRecord } from '@client/views/ViewRecord/ViewRecord'
import { UserAudit } from './views/UserAudit/UserAudit'
import { AdvancedSearchResult } from '@client/views/AdvancedSearch/AdvancedSearchResult'
import { RegistrationList } from '@client/views/Performance/RegistrationsList'
import { PerformanceStatistics } from '@client/views/Performance/Statistics'
import { Leaderboards } from '@client/views/Performance/Leaderboards'
import { PerformanceDashboard } from '@client/views/Performance/Dashboard'
import { SystemRoleType } from '@client/utils/gateway'
import { AdministrativeLevels } from '@client/views/Organisation/AdministrativeLevels'
import { VerifyCertificatePage } from '@client/views/VerifyCertificate/VerifyCertificatePage'
import { IssueCertificate } from '@client/views/IssueCertificate/IssueCertificate'
import { IssuePayment } from '@client/views/IssueCertificate/IssueCollectorForm/IssuePayment'
import { Home } from '@client/views/OfficeHome/Home'
import { PrintRecord } from './views/PrintRecord/PrintRecord'
import { ReviewCorrection } from './views/ReviewCorrection/ReviewCorrection'
import { ReviewCertificate } from './views/PrintCertificate/ReviewCertificateAction'
import AllUserEmail from './views/SysAdmin/Communications/AllUserEmail/AllUserEmail'
import { ReloadModal } from './views/Modals/ReloadModal'
import { V2_ROOT_ROUTE } from './v2-events/routes/routes'
import { Workqueues } from './v2-events/features/workqueues'

const MainSection = styled.section`
  flex-grow: 8;
  background: ${({ theme }) => theme.colors.background};
`

/**
 * The main application component that contains the routing logic for the application.
 * In long run, router will be responsible for handling the routing logic for the entire application.
 * When a new page is added, it should be added to the router rather than the App component.
 */
export const router = createBrowserRouter([
  {
    path: '*',
    Component: App
  }
])

export function App() {
  return (
    <ScrollToTop>
      <SessionExpireConfirmation />
      <NotificationComponent>
        <Page>
          <MainSection>
            <ProtectedPage
              unprotectedRouteElements={['documents', 'affidavit']}
            >
              <ReloadModal />

              <Routes>
                <Route path={routes.HOME} Component={Home} />
                <Route
                  path={routes.SELECT_VITAL_EVENT}
                  Component={SelectVitalEvent}
                />
                <Route
                  path={routes.SELECT_DEATH_INFORMANT}
                  Component={DeclarationForm}
                />
                <Route
                  path={routes.SELECT_MARRIAGE_INFORMANT}
                  Component={DeclarationForm}
                />
                <Route
                  path={routes.DRAFT_BIRTH_PARENT_FORM}
                  Component={DeclarationForm}
                />
                <Route
                  path={routes.VIEW_VERIFY_CERTIFICATE}
                  Component={VerifyCertificatePage}
                />
                <Route
                  path={routes.DRAFT_BIRTH_PARENT_FORM_PAGE}
                  Component={DeclarationForm}
                />
                <Route
                  path={routes.DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP}
                  Component={DeclarationForm}
                />
                <Route
                  path={routes.DRAFT_DEATH_FORM}
                  Component={DeclarationForm}
                />
                <Route
                  path={routes.DRAFT_DEATH_FORM_PAGE}
                  Component={DeclarationForm}
                />
                <Route
                  path={routes.DRAFT_MARRIAGE_FORM}
                  Component={DeclarationForm}
                />
                <Route
                  path={routes.DRAFT_DEATH_FORM_PAGE_GROUP}
                  Component={DeclarationForm}
                />
                <Route
                  path={routes.DRAFT_MARRIAGE_FORM_PAGE}
                  Component={DeclarationForm}
                />
                <Route
                  path={routes.DRAFT_MARRIAGE_FORM_PAGE_GROUP}
                  Component={DeclarationForm}
                />
                <Route
                  path={routes.REVIEW_EVENT_PARENT_FORM_PAGE}
                  Component={ReviewForm}
                />
                <Route
                  path={routes.REVIEW_EVENT_PARENT_FORM_PAGE_GROUP}
                  Component={ReviewForm}
                />
                <Route
                  path={routes.REVIEW_CORRECTION}
                  Component={ReviewCorrection}
                />
                <Route path={routes.REGISTRAR_HOME} Component={OfficeHome} />
                <Route
                  path={routes.REGISTRAR_HOME_TAB}
                  Component={OfficeHome}
                />
                <Route
                  path={routes.REGISTRAR_HOME_TAB_PAGE}
                  Component={OfficeHome}
                />

                <Route
                  path={routes.ALL_USER_EMAIL}
                  element={
                    <ProtectedRoute
                      roles={[SystemRoleType.NationalSystemAdmin]}
                    >
                      <AllUserEmail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.ADVANCED_SEARCH}
                  element={
                    <ProtectedRoute
                      roles={[
                        SystemRoleType.LocalRegistrar,
                        SystemRoleType.RegistrationAgent,
                        SystemRoleType.NationalRegistrar
                      ]}
                    >
                      <AdvancedSearchConfig />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={routes.ADVANCED_SEARCH_RESULT}
                  element={
                    <ProtectedRoute
                      roles={[
                        SystemRoleType.LocalRegistrar,
                        SystemRoleType.RegistrationAgent,
                        SystemRoleType.NationalRegistrar
                      ]}
                    >
                      <AdvancedSearchResult />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.DECLARATION_RECORD_AUDIT}
                  Component={RecordAudit}
                />
                <Route path={routes.SEARCH} Component={SearchResult} />
                <Route path={routes.SEARCH_RESULT} Component={SearchResult} />
                <Route
                  path={routes.CERTIFICATE_COLLECTOR}
                  Component={CollectorForm}
                />
                <Route
                  path={routes.VERIFY_COLLECTOR}
                  Component={VerifyCollector}
                />
                <Route
                  path={routes.VERIFY_CORRECTOR}
                  Component={VerifyCorrector}
                />
                <Route
                  path={routes.REVIEW_CERTIFICATE}
                  Component={ReviewCertificate}
                />
                <Route
                  path={routes.PRINT_CERTIFICATE_PAYMENT}
                  Component={Payment}
                />
                <Route
                  path={routes.CERTIFICATE_CORRECTION}
                  Component={CorrectionForm}
                />
                <Route
                  path={routes.CERTIFICATE_CORRECTION_REVIEW}
                  Component={CorrectionReviewForm}
                />
                <Route path={routes.SETTINGS} Component={SettingsPage} />

                <Route
                  path={routes.TEAM_SEARCH}
                  element={
                    <ProtectedRoute
                      roles={[
                        SystemRoleType.RegistrationAgent,
                        SystemRoleType.LocalRegistrar,
                        SystemRoleType.LocalSystemAdmin,
                        SystemRoleType.NationalSystemAdmin,
                        SystemRoleType.PerformanceManagement
                      ]}
                    >
                      <TeamSearch />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={routes.TEAM_USER_LIST}
                  element={
                    <ProtectedRoute
                      roles={[
                        SystemRoleType.RegistrationAgent,
                        SystemRoleType.LocalRegistrar,
                        SystemRoleType.LocalSystemAdmin,
                        SystemRoleType.NationalRegistrar,
                        SystemRoleType.NationalSystemAdmin,
                        SystemRoleType.PerformanceManagement
                      ]}
                    >
                      <UserList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.SYSTEM_LIST}
                  element={
                    <ProtectedRoute
                      roles={[SystemRoleType.NationalSystemAdmin]}
                    >
                      <SystemList />
                    </ProtectedRoute>
                  }
                />

                <Route path={routes.CREATE_USER} Component={CreateNewUser} />
                <Route
                  path={routes.CREATE_USER_ON_LOCATION}
                  Component={CreateNewUser}
                />
                <Route
                  path={routes.CREATE_USER_SECTION}
                  Component={CreateNewUser}
                />
                <Route
                  path={routes.REVIEW_USER_FORM}
                  Component={CreateNewUser}
                />
                <Route
                  path={routes.REVIEW_USER_DETAILS}
                  Component={CreateNewUser}
                />
                <Route
                  path={routes.PERFORMANCE_HOME}
                  element={
                    <ProtectedRoute
                      roles={[
                        SystemRoleType.RegistrationAgent,
                        SystemRoleType.LocalRegistrar,
                        SystemRoleType.LocalSystemAdmin,
                        SystemRoleType.NationalSystemAdmin,
                        SystemRoleType.PerformanceManagement,
                        SystemRoleType.NationalRegistrar
                      ]}
                    >
                      <PerformanceHome />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.PERFORMANCE_STATISTICS}
                  element={
                    <ProtectedRoute
                      roles={[
                        SystemRoleType.LocalSystemAdmin,
                        SystemRoleType.NationalSystemAdmin,
                        SystemRoleType.PerformanceManagement,
                        SystemRoleType.NationalRegistrar
                      ]}
                    >
                      <PerformanceStatistics />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={routes.PERFORMANCE_LEADER_BOARDS}
                  element={
                    <ProtectedRoute
                      roles={[
                        SystemRoleType.LocalSystemAdmin,
                        SystemRoleType.NationalSystemAdmin,
                        SystemRoleType.PerformanceManagement,
                        SystemRoleType.NationalRegistrar
                      ]}
                    >
                      <Leaderboards />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.PERFORMANCE_DASHBOARD}
                  element={
                    <ProtectedRoute
                      roles={[
                        SystemRoleType.LocalSystemAdmin,
                        SystemRoleType.NationalSystemAdmin,
                        SystemRoleType.PerformanceManagement,
                        SystemRoleType.NationalRegistrar
                      ]}
                    >
                      <PerformanceDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={routes.VS_EXPORTS}
                  element={
                    <ProtectedRoute
                      roles={[
                        SystemRoleType.NationalSystemAdmin,
                        SystemRoleType.NationalRegistrar
                      ]}
                    >
                      <VSExport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.EVENT_COMPLETENESS_RATES}
                  Component={CompletenessRates}
                />
                <Route
                  path={routes.WORKFLOW_STATUS}
                  Component={WorkflowStatus}
                />
                <Route
                  path={routes.PERFORMANCE_FIELD_AGENT_LIST}
                  Component={FieldAgentList}
                />
                <Route path={routes.USER_PROFILE} Component={UserAudit} />
                <Route path={routes.VIEW_RECORD} Component={ViewRecord} />
                <Route
                  path={routes.PERFORMANCE_REGISTRATIONS_LIST}
                  Component={RegistrationList}
                />

                <Route
                  path={routes.ORGANISATIONS_INDEX}
                  element={
                    <ProtectedRoute
                      roles={[
                        SystemRoleType.RegistrationAgent,
                        SystemRoleType.LocalRegistrar,
                        SystemRoleType.LocalSystemAdmin,
                        SystemRoleType.NationalSystemAdmin,
                        SystemRoleType.PerformanceManagement,
                        SystemRoleType.NationalRegistrar
                      ]}
                    >
                      <AdministrativeLevels />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={routes.ISSUE_COLLECTOR}
                  Component={IssueCertificate}
                />
                <Route
                  path={routes.ISSUE_VERIFY_COLLECTOR}
                  Component={VerifyCollector}
                />
                <Route
                  path={routes.ISSUE_CERTIFICATE_PAYMENT}
                  Component={IssuePayment}
                />
                <Route path={routes.PRINT_RECORD} Component={PrintRecord} />
                <Route path={V2_ROOT_ROUTE} Component={Workqueues} />
              </Routes>
            </ProtectedPage>
          </MainSection>
        </Page>
      </NotificationComponent>
    </ScrollToTop>
  )
}
