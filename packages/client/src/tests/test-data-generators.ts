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
import {
  createPrng,
  eventPayloadGenerator,
  generateUuid,
  SCOPES,
  TestUserRole,
  TokenUserType,
  User,
  UUID
} from '@opencrvs/commons/client'
import { FetchUserQuery, Status } from '@client/utils/gateway'
import { Faker, en } from '@faker-js/faker'

// Initialize faker with seed, so that the test data stays consistent
const faker = new Faker({ seed: 1001, locale: en })
export { faker }

const userIds = {
  localRegistrar: '6821c175dce4d7886d4e8210',
  registrationAgent: '67ef7f83d6a9cb92e9edaaa1',
  fieldAgent: '67ef7f83d6a9cb92e9edaa99',
  localSystemAdmin: '68cbd26fc64761565469591d',
  nationalSystemAdmin: '68df9529f8f3a73007a4427c'
}
/**
 * @returns a payload generator for creating events and actions with sensible defaults.
 */
export function testDataGenerator(rngSeed?: number) {
  const prng = createPrng(rngSeed ?? 1001)

  const user = {
    token: {
      /**
       * IMPORTANT: If you update the scopes or id values below,
       * you MUST regenerate the JWT tokens so they match the new values.
       *
       * To regenerate tokens:
       *   1. Update the snapshot in:
       *        packages/client/src/tests/token-generator.test.ts
       *   2. Copy the new tokens from the updated snapshot into this file.
       *
       * Note: Token generation cannot be done here because it requires
       * `jsonwebtoken`, which depends on Node's `crypto` module and is
       * not supported in the browser.
       */

      fieldAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSIsInNlYXJjaFtldmVudD1iaXJ0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD1kZWF0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD1jaGlsZC1vbmJvYXJkaW5nLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PXRlbm5pcy1jbHViLW1lbWJlcnNoaXAsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9Rk9PVEJBTExfQ0xVQl9NRU1CRVJTSElQLGFjY2Vzcz1hbGxdIiwicmVjb3JkLmNyZWF0ZVtldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwfGNoaWxkLW9uYm9hcmRpbmddIiwicmVjb3JkLmRlY2xhcmVbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcHxjaGlsZC1vbmJvYXJkaW5nXSIsInJlY29yZC5ub3RpZnlbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcHxjaGlsZC1vbmJvYXJkaW5nXSIsInJlY29yZC5kZWNsYXJlZC5lZGl0W2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXB8Y2hpbGQtb25ib2FyZGluZ10iXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IkZJRUxEX0FHRU5UIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2N2VmN2Y4M2Q2YTljYjkyZTllZGFhOTkifQ.jTBvd6b-YDxPIOUql_qV3ebHx-ebSifnFzeIpvdf0z94DgfpuL76mUgbOR3TRkjSR1Rme-9KnCa9GnImt4fL25NethoPgZTmGvBAncpl-ngAKkDcFUYmjz1RcWDWDiih12M8G_HrtRj1jkuKW6FIuQ1lAcx3lonOubVFpPBE9ZV_Co9ILiidECUaAp3ukwItUb4UbG1cT-noRETc5dlnHIZYRckWWkLf1tdiwmETO56rRi0oUgyR5pJB5jOpZ7yqRJ2UIbZY9AVnEbER_RrUMRCsvrns_sb2mQ952M7dM719thV9YQusORBF9FxdkILjR7_0VgbC6FTbMiie7JkQS3QzZHuZ39cwtXoVGAFzYm5aCt-ZqY4Z9LsAhGsV0ak33pMKC_XkyEs5u5-2TqKrnQfVRLqmh8d-rW5F-s_v0wcUGDkoxA4DhKkVkgmUGkBEgmSb_wda_DkQGz1T1dha8ycUgl3qdwMQ_g5fDBYqvmiRGhhyDQp70BCq_tVqI2OF8O6ub1aEbsvr-JG1hS6q4utorahyxtOPfOdI9x1aMFom-5AREKPykiju1Tk62wmdQW8th-QaITzlF0O3zO1j9KmoQz2VY-QWcJvw95Vu7PJf2VqrfeVZNMU0bSl9qYgkq5mMBQANVofKoTOu287EXlADcHg63lNWkPb1Swo_vbU',
      localRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tZWRpdCIsInJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInJlY29yZC5kZWNsYXJhdGlvbi1yZWluc3RhdGUiLCJyZWNvcmQuY29uZmlybS1yZWdpc3RyYXRpb24iLCJyZWNvcmQucmVqZWN0LXJlZ2lzdHJhdGlvbiIsInBlcmZvcm1hbmNlLnJlYWQiLCJwZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJwcm9maWxlLmVsZWN0cm9uaWMtc2lnbmF0dXJlIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsIndvcmtxdWV1ZVtpZD1hbGwtZXZlbnRzfGFzc2lnbmVkLXRvLXlvdXxyZWNlbnR8cmVxdWlyZXMtY29tcGxldGlvbnxyZXF1aXJlcy11cGRhdGVzfGluLXJldmlldy1hbGx8aW4tZXh0ZXJuYWwtdmFsaWRhdGlvbnxyZWFkeS10by1wcmludHxyZWFkeS10by1pc3N1ZV0iLCJzZWFyY2hbZXZlbnQ9YmlydGgsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9ZGVhdGgsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9Y2hpbGQtb25ib2FyZGluZyxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD10ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PUZPT1RCQUxMX0NMVUJfTUVNQkVSU0hJUCxhY2Nlc3M9YWxsXSIsInVzZXIucmVhZDpvbmx5LW15LWF1ZGl0IiwicmVjb3JkLmNyZWF0ZVtldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwfGNoaWxkLW9uYm9hcmRpbmddIiwicmVjb3JkLnJlYWRbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcHxjaGlsZC1vbmJvYXJkaW5nXSIsInJlY29yZC5kZWNsYXJlW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXB8Y2hpbGQtb25ib2FyZGluZ10iLCJyZWNvcmQuZGVjbGFyZWQucmVqZWN0W2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXB8Y2hpbGQtb25ib2FyZGluZ10iLCJyZWNvcmQuZGVjbGFyZWQuYXJjaGl2ZVtldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwfGNoaWxkLW9uYm9hcmRpbmddIiwicmVjb3JkLnJlZ2lzdGVyW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXB8Y2hpbGQtb25ib2FyZGluZ10iLCJyZWNvcmQuZGVjbGFyZWQuZWRpdFtldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwfGNoaWxkLW9uYm9hcmRpbmddIiwicmVjb3JkLnJlZ2lzdGVyZWQucHJpbnQtY2VydGlmaWVkLWNvcGllc1tldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwfGNoaWxkLW9uYm9hcmRpbmddIiwicmVjb3JkLnJlZ2lzdGVyZWQuY29ycmVjdFtldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwfGNoaWxkLW9uYm9hcmRpbmddIiwicmVjb3JkLnVuYXNzaWduLW90aGVyc1tldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwfGNoaWxkLW9uYm9hcmRpbmddIiwicmVjb3JkLmRlY2xhcmVkLnJldmlldy1kdXBsaWNhdGVzW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXB8Y2hpbGQtb25ib2FyZGluZ10iLCJyZWNvcmQuY3VzdG9tLWFjdGlvbltldmVudD10ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGN1c3RvbUFjdGlvblR5cGU9QXBwcm92ZV0iXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IkxPQ0FMX1JFR0lTVFJBUiIsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjgyMWMxNzVkY2U0ZDc4ODZkNGU4MjEwIn0.cBFP_JxzFm7n5hM2bEuNVZmaVW_ej6whaDSoV7PP1H3NYozaoLVkJ-BtYqb04z75xcvhpgr5YwxMbp1Gmvu2LeK4G3dm8YV96vC_OSaJQHtF3YbKqgoiEPmKLBe4RpuRo2OReXerT0C_60uLj2EqceHHdsC43NQfyYcpDB4wNn9cFGMpZxUgQkLNwKvEAWxgWHBhY9GT6ZQBzFEA8H3Ji_bJvR7EcBmw-ZL6s1bo8YHiaN-L_2bSYxsFi59u5_kLyjMBwo5ohSN4XJaw4FC4PalWh2IOl-ZV4dmAqa6F_POzBboxOse44s--XagPZxsIvnaWfhe0hZ9_ClR0cNgqbAzIC7o9VYS_yvBl82POztvPBWJra-RXuRG2kZqOM6NdBNbwNxrbYkDQy9WhYeMnBLB3LVZmyAhb8BgH4rfGe4l7p9KMjoK86dYMYW6td7mSulfIawykRUeCH2Ve8BDDCg9ZAU6qbher0liKC31M3e0fuYkMx-STKf3ofqf-IM6Y_SiJNtnduGFPIB6IuuNP0E_Td1lfZ_WhLHcA_zjxvEHo1RVD0DK5sILGGQJaikYiLO2WybM9cd9NxPjNtXxTW1XR2Mli0d6Bz7s7OQg_DjKoqEZX1LX7m-0qOWtWQpC3yswc0mWn1TEExsF3PbAwH6u3Pe_h31GQm_GCy1i7c4w',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tZWRpdCIsInJlY29yZC5kZWNsYXJhdGlvbi1yZWluc3RhdGUiLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInVzZXIucmVhZDpvbmx5LW15LWF1ZGl0Iiwic2VhcmNoLmJpcnRoIiwic2VhcmNoLmRlYXRoIiwic2VhcmNoLm1hcnJpYWdlIiwid29ya3F1ZXVlW2lkPWFsbC1ldmVudHN8YXNzaWduZWQtdG8teW91fHJlY2VudHxyZXF1aXJlcy1jb21wbGV0aW9ufHJlcXVpcmVzLXVwZGF0ZXN8aW4tcmV2aWV3fHNlbnQtZm9yLWFwcHJvdmFsfGluLWV4dGVybmFsLXZhbGlkYXRpb258cmVhZHktdG8tcHJpbnR8cmVhZHktdG8taXNzdWVdIiwic2VhcmNoW2V2ZW50PWJpcnRoLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PWRlYXRoLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PWNoaWxkLW9uYm9hcmRpbmcsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9dGVubmlzLWNsdWItbWVtYmVyc2hpcCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD1GT09UQkFMTF9DTFVCX01FTUJFUlNISVAsYWNjZXNzPWFsbF0iLCJyZWNvcmQuY3JlYXRlW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXB8Y2hpbGQtb25ib2FyZGluZ10iLCJyZWNvcmQucmVhZFtldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwfGNoaWxkLW9uYm9hcmRpbmddIiwicmVjb3JkLmRlY2xhcmVbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcHxjaGlsZC1vbmJvYXJkaW5nXSIsInJlY29yZC5kZWNsYXJlZC5yZWplY3RbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcHxjaGlsZC1vbmJvYXJkaW5nXSIsInJlY29yZC5kZWNsYXJlZC5lZGl0W2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXB8Y2hpbGQtb25ib2FyZGluZ10iLCJyZWNvcmQuZGVjbGFyZWQuYXJjaGl2ZVtldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwfGNoaWxkLW9uYm9hcmRpbmddIiwicmVjb3JkLnJlZ2lzdGVyZWQucHJpbnQtY2VydGlmaWVkLWNvcGllc1tldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwfGNoaWxkLW9uYm9hcmRpbmddIiwicmVjb3JkLnJlZ2lzdGVyZWQucmVxdWVzdC1jb3JyZWN0aW9uW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXB8Y2hpbGQtb25ib2FyZGluZ10iXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IlJFR0lTVFJBVElPTl9BR0VOVCIsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjdlZjdmODNkNmE5Y2I5MmU5ZWRhYWExIn0.cAGo1KLst-GLLO3TiOCHzrC_AUdB3qC5O0DJpfc7LM12VxHdHBhOuwu1wE0Wyn3py2S6mRYh2tmkCZczZa40jRxgF7_3dNyoQOC6xyB3e6HdHkN8pipkxiaoHioTksKfsBnruieeX5LP0hGU9yXVehXAGu0nJFxWmj9Bi9SHz8ommqKcMSS5xjFU8tsfAtytwr7blKfS_ou_-ew-_zr9FVhz8Yj-AHIYmJlhf1tfuEd_NCXrieqN9mzxhqfzdB7HwHuiJAeFnisHjDAwiBWp9dpmVRMW5gPG1EJBwvyVkKb6rk375FeL_mITHLdiaqYGDW1jCxr7w9vr7fm0TyUo-D07oiCoALZ52d-9lkyRJ7pjEZBDoTrhjgppMsWhiXGW4xpPmDnwrPp01SFRdGlV0eyMa9n2sajpL3PtOsriZCPbAPwAbavmfTB7E_FIF6JlSTy4TRr2DAXXiKMf5OHwiguJOoV4d7KXcJNG0THMjB5JfIxQ-j2qftFuLYSwR6a9OKql9a3eqeFghFJPDrZ0uzSm7yEXFd1UsL49RDvhz7qAh7eTNx23bLRayytX27JhkTYZiUYuGItVdVxARhIe23GoNtzD-nwdMVafrxJPZ5hoJKQPOkNMQrWf6TDI1mi7niQSi3q9GJd83cYitwrXYaOnk57HqDU-e1VXOjZNnNE',
      localSystemAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ1c2VyLnJlYWQ6bXktb2ZmaWNlIiwidXNlci5yZWFkOm15LWp1cmlzZGljdGlvbiIsInVzZXIudXBkYXRlOm15LWp1cmlzZGljdGlvbiIsIm9yZ2FuaXNhdGlvbi5yZWFkLWxvY2F0aW9uczpteS1qdXJpc2RpY3Rpb24iLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwicGVyZm9ybWFuY2Uudml0YWwtc3RhdGlzdGljcy1leHBvcnQiLCJvcmdhbmlzYXRpb24ucmVhZC1sb2NhdGlvbnM6bXktb2ZmaWNlIiwidXNlci5jcmVhdGVbcm9sZT1GSUVMRF9BR0VOVHxQT0xJQ0VfT0ZGSUNFUnxTT0NJQUxfV09SS0VSfEhFQUxUSENBUkVfV09SS0VSfExPQ0FMX0xFQURFUnxSRUdJU1RSQVRJT05fQUdFTlR8TE9DQUxfUkVHSVNUUkFSXSIsInVzZXIuZWRpdFtyb2xlPUZJRUxEX0FHRU5UfFBPTElDRV9PRkZJQ0VSfFNPQ0lBTF9XT1JLRVJ8SEVBTFRIQ0FSRV9XT1JLRVJ8TE9DQUxfTEVBREVSfFJFR0lTVFJBVElPTl9BR0VOVHxMT0NBTF9SRUdJU1RSQVJdIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJMT0NBTF9TWVNURU1fQURNSU4iLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY4Y2JkMjZmYzY0NzYxNTY1NDY5NTkxZCJ9.O-wogl0fSIAJJ1wd1o8fqo-NfucnEKr1dKbYgSdhnCljZk-0K0bYIQOpz6TqKOinAxFhRcy2hRpf2MS7Q-mBlW43pF_Rzcm7piz3Q14V8ZKgeY7XEdvtcbPvf004PnSd7gGqLLwmYM7WX4X9ok1_d5AS2p70z7oYb0XsrrJ1cE_hv5teNWZyjnUn3JIN2o4BBZYSCQ0IlNwC5uCL1givHiHGq3j6rmses-4QAhCPHXPLjWSoa272OEzQdIqEgZj4sZcNeAxMgFfU0BxUR5huviaXP-e7iPk_zbogCKFHG6wmr__FUTGL0QR4sOBXy52Rf1bExdu44CNXmagSofwsvkUYD5QPfxTtp6nJ3VXNUrhz_Ga66fV_m8EMcd_Hpqytfb1lo_5kkhuQRwgfiBRXcXXCEDkeYWPLnZtsrnSHmIl-LHHKpNEiIGP4phAo9uwM6cGEGAt9ewFTyHWvJ22PETyBocIXiGh0kCjZKI9tpV8QcGDKt7y4b_CQHI0Zd-A7ST3xZUsztavF_zH77DnU-vweEBp-EhEQ1zRwtEr3neWXeKbZBQz0gqbeq6zGl87S1ZflPTMOdbkYd7NlR0NiGy4CCysBlLxeo9Dgv_4uXXJcFgJOvGD5RDhKo-CA4Fcq64D_YXjhWmuC-5-pmxf5TpAb323upY4NqWlZ3cxh_6Y',
      nationalSystemAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJjb25maWcudXBkYXRlOmFsbCIsIm9yZ2FuaXNhdGlvbi5yZWFkLWxvY2F0aW9uczphbGwiLCJ1c2VyLmNyZWF0ZTphbGwiLCJ1c2VyLnVwZGF0ZTphbGwiLCJ1c2VyLnJlYWQ6YWxsIiwicGVyZm9ybWFuY2UucmVhZCIsInBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInBlcmZvcm1hbmNlLnZpdGFsLXN0YXRpc3RpY3MtZXhwb3J0IiwicmVjb3JkLnJlaW5kZXgiLCJ1c2VyLmNyZWF0ZVtyb2xlPUZJRUxEX0FHRU5UfEhPU1BJVEFMX0NMRVJLfENPTU1VTklUWV9MRUFERVJ8UkVHSVNUUkFUSU9OX0FHRU5UfExPQ0FMX1JFR0lTVFJBUnxOQVRJT05BTF9SRUdJU1RSQVJ8TE9DQUxfU1lTVEVNX0FETUlOfE5BVElPTkFMX1NZU1RFTV9BRE1JTnxQRVJGT1JNQU5DRV9NQU5BR0VSXSIsInVzZXIuZWRpdFtyb2xlPUZJRUxEX0FHRU5UfEhPU1BJVEFMX0NMRVJLfENPTU1VTklUWV9MRUFERVJ8UkVHSVNUUkFUSU9OX0FHRU5UfExPQ0FMX1JFR0lTVFJBUnxOQVRJT05BTF9SRUdJU1RSQVJ8TE9DQUxfU1lTVEVNX0FETUlOfE5BVElPTkFMX1NZU1RFTV9BRE1JTnxQRVJGT1JNQU5DRV9NQU5BR0VSXSJdLCJ1c2VyVHlwZSI6InVzZXIiLCJyb2xlIjoiTkFUSU9OQUxfU1lTVEVNX0FETUlOIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2OGRmOTUyOWY4ZjNhNzMwMDdhNDQyN2MifQ.WGLo5JF0PlPhZoYFhn8lg1dt-iaDSUQFGUDolQsQHwuY_AEZpFIKjaKL-GYJMLpuHPahk8wK7OTjQJZ54lH5EUvL8jqRfIMvQTRK6IHi_jvMHJQbXIvS434za-rY99_vsBnWIhTvqawIbKkOG89FBwdF6OVI5SxNV39ltjPChrN4-Ke-8QjZjJyUfxLanh4NMfsd3ohnpH5q3QtJMfDTl8iJ7-cJ3lwpI29gVtiXyULfbCWGXMPjwutCKNyNGA-hIMzvFHsFFw23EzdwnIqLBNzjMwFjeB3RwWBPexC6dctKuHY8ooRL-oWSxran0rOUwNr3Y0VKIl5C1EoMkBkkwHgy7awLPYstZGP6aC-B4pdQp9t5dx8omB6OozG0WD2oJJx7uH8pbghTsLdnQr1STF0gpL4qGWIE5RQ-eFCVQAQlXDPrVCDBEkK5ip8_OEag7uoPdJEybmTUVitMpTcYEdXQzJ2GFIkShXH4nkHeF60JHyviPFM2ClWD_DLLCr1v6fWLSFgMjfakK_YtOzLRSIAnwcGRk1RwR_H9-YSI-fVxM39suMZ78o5iXQiifuFjZWLF9FBwwVDuM0XAf7gD_zGx9uHSOw2I88CUtZpmPfvsesUW7TmHWX_VkSztH1XQt9BkUrPZvS6sarFZeswYQiT7EgZ5KqMcsXhlk9tVQo8'
    },
    id: userIds,
    fieldAgent: (): { v2: User; v1: FetchUserQuery['getUser'] } => ({
      v2: {
        id: '67bda93bfc07dee78ae558cf',
        name: [
          {
            use: 'en',
            given: ['Kalusha'],
            family: 'Bwalya'
          }
        ],
        role: 'HOSPITAL_CLERK',
        fullHonorificName: undefined,
        signature: undefined,
        avatar: undefined,
        type: TokenUserType.enum.user,
        primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
      } satisfies User,
      v1: {
        id: userIds.fieldAgent,
        userMgntUserID: generateUuid(),
        fullHonorificName: null,
        creationDate: '1736421510056',
        username: 'k.bwalya',
        practitionerId: generateUuid(),
        mobile: '+260911111111',
        email: 'kalushabwalya17@gmail.com',
        role: {
          id: TestUserRole.enum.SOCIAL_WORKER,
          label: {
            id: 'userRole.hospitalClerk',
            defaultMessage: 'Hospital Clerk',
            description: 'Name for user role Hospital Clerk',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Kalusha',
            familyName: 'Bwalya',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '028d2c85-ca31-426d-b5d1-2cef545a4902',
          name: 'Ibombo District Office',
          alias: ['Ibombo District Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: null,
        avatar: null,
        searches: [],
        __typename: 'User'
      } satisfies FetchUserQuery['getUser']
    }),
    registrationAgent: (): { v2: User; v1: FetchUserQuery['getUser'] } => ({
      v2: {
        id: user.id.registrationAgent,
        name: [{ use: 'en', given: ['Felix'], family: 'Katongo' }],
        role: TestUserRole.enum.REGISTRATION_AGENT,
        avatar: undefined,
        signature: undefined,
        fullHonorificName: undefined,
        primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID,
        type: TokenUserType.enum.user
      } satisfies User,
      v1: {
        id: user.id.registrationAgent,
        userMgntUserID: generateUuid(),
        creationDate: '1736421510209',
        username: 'f.katongo',
        practitionerId: generateUuid(),
        mobile: '+260922222222',
        email: 'kalushabwalya17+@gmail.com',
        fullHonorificName: null,
        role: {
          id: TestUserRole.enum.REGISTRATION_AGENT,
          label: {
            id: 'userRole.registrationAgent',
            defaultMessage: 'Registration Agent',
            description: 'Name for user role Registration Agent',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Felix',
            familyName: 'Katongo',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '028d2c85-ca31-426d-b5d1-2cef545a4902',
          name: 'Ibombo District Office',
          alias: ['Ibombo District Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: null,
        avatar: null,
        searches: [],
        __typename: 'User'
      } satisfies FetchUserQuery['getUser']
    }),
    localRegistrar: (): { v2: User; v1: FetchUserQuery['getUser'] } => ({
      v2: {
        id: user.id.localRegistrar,
        name: [{ use: 'en', given: ['Kennedy'], family: 'Mweene' }],
        role: TestUserRole.enum.LOCAL_REGISTRAR,
        fullHonorificName: '1st Order Honorable Kennedy Mweene',
        primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID,
        avatar: undefined,
        signature: undefined,
        type: TokenUserType.enum.user
      } satisfies User,
      v1: {
        id: userIds.localRegistrar,
        userMgntUserID: generateUuid(),
        creationDate: '1737725915295',
        username: 'k.mweene',
        practitionerId: generateUuid(),
        mobile: '+260933333333',
        email: 'kalushabwalya1.7@gmail.com',
        role: {
          id: TestUserRole.enum.LOCAL_REGISTRAR,
          label: {
            id: 'userRole.localRegistrar',
            defaultMessage: 'Local Registrar',
            description: 'Name for user role Local Registrar',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        fullHonorificName: '1st Order Honorable Kennedy Mweene',
        name: [
          {
            use: 'en',
            firstNames: 'Kennedy',
            familyName: 'Mweene',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '028d2c85-ca31-426d-b5d1-2cef545a4902',
          name: 'Ibombo District Office',
          alias: ['Ibombo District Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: {
          name: [
            {
              use: 'en',
              firstNames: 'Kennedy',
              familyName: 'Mweene',
              __typename: 'HumanName'
            }
          ],
          role: 'LOCAL_REGISTRAR',
          signature: null,
          __typename: 'LocalRegistrar'
        },
        avatar: null,
        searches: [],
        __typename: 'User'
      } satisfies FetchUserQuery['getUser']
    }),
    localSystemAdmin: () =>
      ({
        id: userIds.localSystemAdmin,
        userMgntUserID: '68cbd26fc64761565469591d',
        creationDate: '1758188143348',
        username: 'a.ngonga',
        practitionerId: '723819da-3ddd-49b0-b46c-43c8e34e1c25',
        mobile: '+260978787878',
        email: 'kalushab.walya17@gmail.com',
        fullHonorificName: null,
        role: {
          id: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
          label: {
            id: 'userRole.localSystemAdmin',
            defaultMessage: 'Local System Admin',
            description: 'Name for user role Local System Admin',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Alex',
            familyName: 'Ngonga',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: 'f403ca64-6a1d-4882-94c1-d8674df59a85',
          name: 'Ilanga District Office',
          alias: ['Ilanga District Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: null,
        avatar: null,
        searches: [],
        __typename: 'User'
      }) satisfies FetchUserQuery['getUser'],
    nationalSystemAdmin: (): { v2: User; v1: FetchUserQuery['getUser'] } => ({
      v2: {
        id: user.id.nationalSystemAdmin,
        name: [
          {
            use: 'en',
            given: ['Jonathan'],
            family: 'Campbell'
          }
        ],
        role: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
        primaryOfficeId: '8788d17c-b639-4aa0-89f0-ebc64263d81c' as UUID,
        type: TokenUserType.enum.user
      },
      v1: {
        id: user.id.nationalSystemAdmin,
        userMgntUserID: generateUuid(),
        creationDate: '1759483177946',
        username: 'j.campbell',
        practitionerId: generateUuid(),
        mobile: '+260921111111',
        email: 'kalushabwaly.a17@gmail.com',
        fullHonorificName: null,
        role: {
          id: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
          label: {
            id: 'userRole.nationalAdministrator',
            defaultMessage: 'National Administrator',
            description: 'Name for user role National Administrator',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Jonathan',
            familyName: 'Campbell',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '8788d17c-b639-4aa0-89f0-ebc64263d81c',
          name: 'HQ Office',
          alias: ['HQ Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: null,
        avatar: null,
        searches: [],
        __typename: 'User'
      }
    }),
    scopes: {
      /**
       * scopes are same as countryconfig/src/data-seeding/roles/roles.ts
       * except for workque scope that has an extra workqueue: all-events
       */
      localRegistrar: [
        SCOPES.RECORD_DECLARATION_EDIT,
        SCOPES.RECORD_REVIEW_DUPLICATES,
        SCOPES.RECORD_DECLARATION_REINSTATE,
        SCOPES.RECORD_CONFIRM_REGISTRATION,
        SCOPES.RECORD_REJECT_REGISTRATION,
        SCOPES.PERFORMANCE_READ,
        SCOPES.PERFORMANCE_READ_DASHBOARDS,
        SCOPES.PROFILE_ELECTRONIC_SIGNATURE,
        SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
        SCOPES.SEARCH_BIRTH,
        SCOPES.SEARCH_DEATH,
        SCOPES.SEARCH_MARRIAGE,
        'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review-all|in-external-validation|ready-to-print|ready-to-issue]',
        'search[event=birth,access=all]',
        'search[event=death,access=all]',
        'search[event=child-onboarding,access=all]',
        'search[event=tennis-club-membership,access=all]',
        'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
        SCOPES.USER_READ_ONLY_MY_AUDIT,
        'record.create[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.read[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.declare[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.declared.reject[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.declared.archive[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.register[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.declared.edit[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.registered.print-certified-copies[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.registered.correct[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.unassign-others[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.declared.review-duplicates[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.custom-action[event=tennis-club-membership,customActionType=Approve]'
      ],
      registrationAgent: [
        SCOPES.RECORD_DECLARATION_EDIT,
        SCOPES.RECORD_DECLARATION_REINSTATE,
        SCOPES.PERFORMANCE_READ,
        SCOPES.PERFORMANCE_READ_DASHBOARDS,
        SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
        SCOPES.USER_READ_ONLY_MY_AUDIT,
        SCOPES.SEARCH_BIRTH,
        SCOPES.SEARCH_DEATH,
        SCOPES.SEARCH_MARRIAGE,
        'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review|sent-for-approval|in-external-validation|ready-to-print|ready-to-issue]',
        'search[event=birth,access=all]',
        'search[event=death,access=all]',
        'search[event=child-onboarding,access=all]',
        'search[event=tennis-club-membership,access=all]',
        'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
        'record.create[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.read[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.declare[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.declared.reject[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.declared.edit[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.declared.archive[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.registered.print-certified-copies[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.registered.request-correction[event=birth|death|tennis-club-membership|child-onboarding]'
      ],
      fieldAgent: [
        SCOPES.RECORD_SUBMIT_FOR_REVIEW,
        SCOPES.SEARCH_BIRTH,
        SCOPES.SEARCH_DEATH,
        SCOPES.SEARCH_MARRIAGE,
        'workqueue[id=all-events|assigned-to-you|recent|requires-updates|sent-for-review]',
        'search[event=birth,access=all]',
        'search[event=death,access=all]',
        'search[event=child-onboarding,access=all]',
        'search[event=tennis-club-membership,access=all]',
        'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
        'record.create[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.declare[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.notify[event=birth|death|tennis-club-membership|child-onboarding]',
        'record.declared.edit[event=birth|death|tennis-club-membership|child-onboarding]'
      ],
      localSystemAdmin: [
        SCOPES.USER_READ_MY_OFFICE,
        SCOPES.USER_READ_MY_JURISDICTION,
        SCOPES.USER_UPDATE_MY_JURISDICTION,
        SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION,
        SCOPES.PERFORMANCE_READ,
        SCOPES.PERFORMANCE_READ_DASHBOARDS,
        SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS,
        SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
        'user.create[role=FIELD_AGENT|POLICE_OFFICER|SOCIAL_WORKER|HEALTHCARE_WORKER|LOCAL_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR]',
        'user.edit[role=FIELD_AGENT|POLICE_OFFICER|SOCIAL_WORKER|HEALTHCARE_WORKER|LOCAL_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR]'
      ],
      nationalSystemAdmin: [
        SCOPES.CONFIG_UPDATE_ALL,
        SCOPES.ORGANISATION_READ_LOCATIONS,
        SCOPES.USER_CREATE,
        SCOPES.USER_UPDATE,
        SCOPES.USER_READ,
        SCOPES.PERFORMANCE_READ,
        SCOPES.PERFORMANCE_READ_DASHBOARDS,
        SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS,
        SCOPES.RECORD_REINDEX,
        'user.create[role=FIELD_AGENT|HOSPITAL_CLERK|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|NATIONAL_REGISTRAR|LOCAL_SYSTEM_ADMIN|NATIONAL_SYSTEM_ADMIN|PERFORMANCE_MANAGER]',
        'user.edit[role=FIELD_AGENT|HOSPITAL_CLERK|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|NATIONAL_REGISTRAR|LOCAL_SYSTEM_ADMIN|NATIONAL_SYSTEM_ADMIN|PERFORMANCE_MANAGER]'
      ]
    }
  }

  return { event: eventPayloadGenerator(prng), user }
}
