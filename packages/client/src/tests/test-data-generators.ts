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
  DocumentPath,
  encodeScope,
  eventPayloadGenerator,
  generateUuid,
  JurisdictionFilter,
  TestUserRole,
  TokenUserType,
  User,
  UserSummary,
  UUID
} from '@opencrvs/commons/client'
import { FetchUserQuery, Status } from '@client/utils/gateway'
import { Faker, en } from '@faker-js/faker'

// Initialize faker with seed, so that the test data stays consistent
const faker = new Faker({ seed: 1001, locale: en })
export { faker }
const userIds = {
  localRegistrar: 'aa13a268-ae48-4a30-9450-554aebaab203' as UUID,
  registrationAgent: '861fa044-c8cf-4d9d-9cbc-f7a2e1d5b94a' as UUID,
  fieldAgent: '8f8b431b-ef47-4068-b678-ef2dd93e9208' as UUID,
  localSystemAdmin: 'bb8c53ab-87a6-4491-9eff-2a429ee02a3a' as UUID,
  nationalSystemAdmin: 'b18b1cd4-85e3-4caf-b60f-537cb790f208' as UUID,
  communityLeader: 'c877dda0-0362-4af6-a88d-5ab8f358030e' as UUID,
  provincialRegistrar: 'f11558f2-ff57-4382-9875-d58f4206b47f' as UUID
}
/**
 * @returns a payload generator for creating events and actions with sensible defaults.
 */
export function testDataGenerator(rngSeed?: number) {
  const prng = createPrng(rngSeed ?? 1001)

  /**
   * Shared base scopes for communityLeader variants — excludes record.search so
   * each variant can inject its own registeredIn restriction.
   */
  const communityLeaderBaseScopesWithoutSearch = [
    encodeScope({
      type: 'workqueue',
      options: {
        ids: [
          'all-events',
          'assigned-to-you',
          'recent',
          'requires-updates',
          'sent-for-review'
        ]
      }
    }),
    encodeScope({
      type: 'record.create',
      options: {
        event: ['birth', 'death', 'tennis-club-membership', 'child-onboarding'],
        placeOfEvent: JurisdictionFilter.enum.location
      }
    }),
    encodeScope({ type: 'record.read' }),
    encodeScope({ type: 'record.notify' }),
    encodeScope({ type: 'record.edit' })
  ]

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
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuc2VhcmNoIiwidHlwZT1yZWNvcmQuY3JlYXRlIiwidHlwZT1yZWNvcmQucmVhZCIsInR5cGU9cmVjb3JkLm5vdGlmeSIsInR5cGU9cmVjb3JkLmRlY2xhcmUiLCJ0eXBlPXJlY29yZC5lZGl0Il0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJGSUVMRF9BR0VOVCIsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiOGY4YjQzMWItZWY0Ny00MDY4LWI2NzgtZWYyZGQ5M2U5MjA4In0.XS7EAFINQTq0wTiRTjed9QUmzKiQhI7Ntv-OjeMtsEi2uij7WhURIToMjfl75_GWz9MWtAFGofqtlpenK51fv3wa-VrXgbD4Ku_C-yceLc81JZhWuM-X_gadwfiGr7A4hfLmFpp7kk0VjCeO9zAAnfnnXDBM_Fujow2Nhq2FY_NV94c-uFJsZTo3bRu5jtRTwh7U6Svpg187k5fKltmCrq3WL5vtktSwKAzagidGeBtbPIJ28U-zlWA9OX_N1Ct4bVAgq69ILQvoh_fvbzOtFp6qOF_zbT_EcJ5vGx85k1M1B7bsr5j6Edusu1XnLx-ZSeUdRPXzVssQNYiw4ZdkduR5Z7Q-29ajt0Rka_LOH3VjiFFbUkUH0_bOwBrilPCrftsrKSF4wBtWp3e0h3mDRACr1pZASYAuJXNi4qFGIGTVNaTfw2fYNCCSEkfLDs2BhM1M71IKH3Q8qtYVG36yzB51l6v3IRrEiLEdsMyiU-NOYIzWb8bLGdzW4M4nw5f-qBLHurI9uzbN7D88UzayU0dSCxylkRC_srHlrjfoGwY9z2U7hpJnbBi5pjwwSQ6nTDrpl_Xey5_kJhmELV-1F8gEwL_ZkFL_IX9sAJ2gHyYYYJshfyrk3W4C_yYktwGg7I1PlMghNhQ-pG9j-idUptxFSG12L6NWb9hnm6fCAgc',
      localRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9cHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsInR5cGU9b3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zJmFjY2Vzc0xldmVsPWxvY2F0aW9uIiwidHlwZT13b3JrcXVldWUmaWRzPWFsbC1ldmVudHMsYXNzaWduZWQtdG8teW91LHJlY2VudCxyZXF1aXJlcy1jb21wbGV0aW9uLHJlcXVpcmVzLXVwZGF0ZXMsaW4tcmV2aWV3LWFsbCxpbi1leHRlcm5hbC12YWxpZGF0aW9uLHJlYWR5LXRvLXByaW50LHJlYWR5LXRvLWlzc3VlIiwidHlwZT11c2VyLnJlYWQtb25seS1teS1hdWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCIsInR5cGU9cmVjb3JkLmNyZWF0ZSIsInR5cGU9cmVjb3JkLnJlYWQmZXZlbnQ9YmlydGgsZGVhdGgsdGVubmlzLWNsdWItbWVtYmVyc2hpcCxjaGlsZC1vbmJvYXJkaW5nLGxpYnJhcnktbWVtYmVyc2hpcCIsInR5cGU9cmVjb3JkLmRlY2xhcmUiLCJ0eXBlPXJlY29yZC5yZWplY3QiLCJ0eXBlPXJlY29yZC5hcmNoaXZlIiwidHlwZT1yZWNvcmQucmVnaXN0ZXIiLCJ0eXBlPXJlY29yZC5lZGl0IiwidHlwZT1yZWNvcmQucHJpbnQtY2VydGlmaWVkLWNvcGllcyIsInR5cGU9cmVjb3JkLmNvcnJlY3QiLCJ0eXBlPXJlY29yZC51bmFzc2lnbi1vdGhlcnMiLCJ0eXBlPXJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInR5cGU9cmVjb3JkLmN1c3RvbS1hY3Rpb24mZXZlbnQ9dGVubmlzLWNsdWItbWVtYmVyc2hpcCZjdXN0b21BY3Rpb25UeXBlcz1BcHByb3ZlIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJMT0NBTF9SRUdJU1RSQVIiLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6ImFhMTNhMjY4LWFlNDgtNGEzMC05NDUwLTU1NGFlYmFhYjIwMyJ9.rIbBBTrS2FqHjHa1VMYV3JHFEz6Ln4uuWJuBClXgktmA36S3HkctOlwQq3NQ0YD64LUSoRroiI8f1OEuXB-ll-lCwWIOU0YFcx-P8y1fTnY1LufKrEdWbqykePButYs4efDqolA9XPcOS-L5gNxAErrw7Sw1oJfMvSUWwQCqxvARcY6PdJgUXEFA7dRlmV7vhrUInrCndndseaGxrPv_FyO4STjnUhNOAVOPc2E-mNseViIabbRsuciqcISHh_CqfwV0Xw8y2qZ8f40dWF-7-oDHKma1e9VBKlE4W8ObsmoWDiVnF_9R9lC1D0prjdb2WpOCBYus8hjTFXL8u5eMbuMY-G-GvZDL5WYVm4PZiWn1r_d-2QSif0uFkrOuPAyK7hCZ0oUU8ic8uvOiagL8e74Egx23hrUnUNfQum3Gofnc208ovb7aIrwmflSh6LU-5u0nVhB94eNpzvmYQmYg8uRgVwDhO0ZpAQZmDtvhu7BGBFOBjrg_qlQVb1n7UywcNQipYBa1Cc4FbiDxrHeSpKQA9sfJYD0dmv8AIgbhi9HfKKyUihOSa2qVufN54Y9-wnzip7y9r46eP4B5qvYrj56crG8TRy-DbAfQARiLiwlRZlBD9vsfGWHxhFjTCQFmAYPd5sJjXUm5Wd5gq2aLXs6XVaBwcjOKsWxqh2MLXH8',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9b3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zJmFjY2Vzc0xldmVsPWxvY2F0aW9uIiwidHlwZT11c2VyLnJlYWQtb25seS1teS1hdWRpdCIsInR5cGU9d29ya3F1ZXVlJmlkcz1hbGwtZXZlbnRzLGFzc2lnbmVkLXRvLXlvdSxyZWNlbnQscmVxdWlyZXMtY29tcGxldGlvbixyZXF1aXJlcy11cGRhdGVzLGluLXJldmlldyxzZW50LWZvci1hcHByb3ZhbCxpbi1leHRlcm5hbC12YWxpZGF0aW9uLHJlYWR5LXRvLXByaW50LHJlYWR5LXRvLWlzc3VlIiwidHlwZT1yZWNvcmQuc2VhcmNoIiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyIsInR5cGU9cmVjb3JkLnJlYWQiLCJ0eXBlPXJlY29yZC5kZWNsYXJlIiwidHlwZT1yZWNvcmQucmVqZWN0IiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLmFyY2hpdmUiLCJ0eXBlPXJlY29yZC5wcmludC1jZXJ0aWZpZWQtY29waWVzIiwidHlwZT1yZWNvcmQucmVxdWVzdC1jb3JyZWN0aW9uIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJSRUdJU1RSQVRJT05fQUdFTlQiLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6Ijg2MWZhMDQ0LWM4Y2YtNGQ5ZC05Y2JjLWY3YTJlMWQ1Yjk0YSJ9.OP0BaH8HAXVxECH4b0D2boNrGZPOFpMo1pWAcA2O3On7lTYk8vPuOT6UvfshsgXKTSk4hSCmuh_JsGqGWQbLn0_c45V2kBVDXpZlP8tXUfwGZMXQWNT_hGjb1lq5j1bfTSTn7cYrSSbVVvx-X1linDN5aow8IWuswu_VWbEj9s7jiydlJ22vA1-WzRLDjxG2XDVj3hrvsoGXVpbAqcJQYVFsIPWgZuO8DcLtlwLgYGZ4tZ6U_3bI930rbQGEMSsqG_nI8ZC-Y_I2Z1ugzx32AnQC_dVtLucmld9L5W5f8x9XWrAI0GX3DPWB9ZadgCVn3TfJ4LNwHZxY9inSTG9zpg3sMk2xRkGlErU1OA3AifRi0h2Ti7-oXKPMCk817I_AtrMjurgNpeaID71nh5ANHFsj8-UbZKEsMDegPuLPJh8y-qNVRpeEbfKlf5P47iBtjZwCb-AJUOzraVqmyM3KlxMV5AOE8jT3rnogAzE4BHpbBWXlkxvf-fvr7cXnm0O0yVzusDt6DmU-jh_Nq63ywWTxIWSB6ttLO43D9ylR39zrjOhIiMWGTP9_UfN0IJXwEqGGwEeLfSwDAUEB9w4QirlQZwQGL-AR_FrDbkOacfVR56wbnlDmo-Zgevvc2RoobNEyuXQYdLjKvdET7ebKYuacRpIDkURHFdAAp3KjqWU',
      localSystemAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXVzZXIucmVhZCZhY2Nlc3NMZXZlbD1hZG1pbmlzdHJhdGl2ZUFyZWEiLCJ0eXBlPXVzZXIuZWRpdCZhY2Nlc3NMZXZlbD1hZG1pbmlzdHJhdGl2ZUFyZWEmcm9sZT1GSUVMRF9BR0VOVCxQT0xJQ0VfT0ZGSUNFUixTT0NJQUxfV09SS0VSLEhFQUxUSENBUkVfV09SS0VSLExPQ0FMX0xFQURFUixSRUdJU1RSQVRJT05fQUdFTlQsTE9DQUxfUkVHSVNUUkFSIiwidHlwZT1vcmdhbmlzYXRpb24ucmVhZC1sb2NhdGlvbnMmYWNjZXNzTGV2ZWw9YWRtaW5pc3RyYXRpdmVBcmVhIiwidHlwZT1wZXJmb3JtYW5jZS5yZWFkIiwidHlwZT1wZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJ0eXBlPXBlcmZvcm1hbmNlLnZpdGFsLXN0YXRpc3RpY3MtZXhwb3J0IiwidHlwZT11c2VyLmNyZWF0ZSZhY2Nlc3NMZXZlbD1hZG1pbmlzdHJhdGl2ZUFyZWEmcm9sZT1GSUVMRF9BR0VOVCxQT0xJQ0VfT0ZGSUNFUixTT0NJQUxfV09SS0VSLEhFQUxUSENBUkVfV09SS0VSLExPQ0FMX0xFQURFUixSRUdJU1RSQVRJT05fQUdFTlQsTE9DQUxfUkVHSVNUUkFSIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJMT0NBTF9TWVNURU1fQURNSU4iLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6ImJiOGM1M2FiLTg3YTYtNDQ5MS05ZWZmLTJhNDI5ZWUwMmEzYSJ9.VmhnRtad4V5eSni1dj-ThOnFsWldW-gltWz3A9Md2lhFfozUSuI12P2-LwSHex5hTQzBJ2IUI0tQqc0yXIecVyeZjQm05E8yjTrcgaAIdT8UKkpTkYilr0OySjsh6V1R4feLQrE3DrRnsmm3_bPIA0GdMY-um_PdYcNjkOqesHHdpP4QulUTwHWord3TDw_VaIXg3zeKIE742Rma0C63rPF3hqRPUUDjVIj0cvkLIqj1SFSRLAknwqbosMGl94JBsldeYf0GAWHgONVDTvlyjiAHL-OExOaC-EiwrphgVtMr09BcfB-vsXtVGKVtZ3Y64yWhdZMPF4kyj61-0SmSDQITrv7hhZgGNgwPVYYloSKzSFdK6lgU86hb3gdNKV0HjalDS5bPL4aaoZOwup9HCqScQ6PrIGDTyVYEZxg27dgAKxyxj6831O7aF6xahH-_AYnaZnOrVC07w8bqnzcOMFd_3pQbWOgJxt-Za8-s3m6IjcmS0OX13qkVviJpMiHZH7pNufDy_zaA0v1Ctx9iWkRR4VAkDfmu0HJX855edQiB_lzQCJs9eeq3RSYg49FpXt-9GdQGa0fP6xzbwtycQtY46KhkKPTtlrCTvFEdqDGHgcCFS4wgrWUaXEd9HuIbv0198DyQsi9d_qtv5GvMrQCuNeOrKSFpxSN6IKQ0Fgg',
      nationalSystemAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPWNvbmZpZy51cGRhdGUtYWxsIiwidHlwZT1vcmdhbmlzYXRpb24ucmVhZC1sb2NhdGlvbnMiLCJ0eXBlPXVzZXIucmVhZCIsInR5cGU9cGVyZm9ybWFuY2UucmVhZCIsInR5cGU9cGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwidHlwZT1wZXJmb3JtYW5jZS52aXRhbC1zdGF0aXN0aWNzLWV4cG9ydCIsInR5cGU9cmVjb3JkLnJlaW5kZXgiLCJ0eXBlPXVzZXIuY3JlYXRlJnJvbGU9RklFTERfQUdFTlQsSE9TUElUQUxfQ0xFUkssQ09NTVVOSVRZX0xFQURFUixSRUdJU1RSQVRJT05fQUdFTlQsTE9DQUxfUkVHSVNUUkFSLE5BVElPTkFMX1JFR0lTVFJBUixMT0NBTF9TWVNURU1fQURNSU4sTkFUSU9OQUxfU1lTVEVNX0FETUlOLFBFUkZPUk1BTkNFX01BTkFHRVIiLCJ0eXBlPXVzZXIuZWRpdCZyb2xlPUZJRUxEX0FHRU5ULEhPU1BJVEFMX0NMRVJLLENPTU1VTklUWV9MRUFERVIsUkVHSVNUUkFUSU9OX0FHRU5ULExPQ0FMX1JFR0lTVFJBUixOQVRJT05BTF9SRUdJU1RSQVIsTE9DQUxfU1lTVEVNX0FETUlOLE5BVElPTkFMX1NZU1RFTV9BRE1JTixQRVJGT1JNQU5DRV9NQU5BR0VSIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJOQVRJT05BTF9TWVNURU1fQURNSU4iLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6ImIxOGIxY2Q0LTg1ZTMtNGNhZi1iNjBmLTUzN2NiNzkwZjIwOCJ9.Dy6qsZW46D4DO6URt7hVNgMj4w2Gpwg6cba0a226tDw-c69JRT8ggzwYvhBU6UNU5W7zn6SWUIUrToGaejRHAdbeIgdSaxT4bN_D4AWc4yxfaU2Zps_vTd0z1HW6Jyy9uNwQQo14-j4C5-5qNK47Zdz9S1E_sg10cAUWFV8jg_8wTV1OiRacYMMteieOiq_biLde6xYSP_c8655CVsOE5y4WoRG4M3d8JzAh7fZYnbxsYvhQ9CNSj8lR6AmH_kEEzYttLHvgViwrf0Vj645-XIsAZTV-hymBW-NfzFlZSXl5Cceo4UGDY2uzLF18bUjpfnN7B8BvbanVWcz6GqyTFSEqjs4bRrN2ntpJD0CEspXtCTkTOH_qR8938fcHcDR_tXZR6bVO2ni8JJt0gbooX21SgltZANp65TifnI3vHUM7ZTWD_uK-dVon5xb5sA8ZhMB8qAmzmtWSsw_XoSopJxT2xX-l-O_NeooObdgaaQJlu9enJPzVbslFBCUU9hOj5RH_eAubMg4SzjD-LGA4hAXc_xtNnUa1EiI-fCSR6wtBswvRuhlqXyEZojTePT5WXsfALrfkZUFkreonDJyXHh7CO0a3aqkDkWoINNY-XTDmwppU_dXC02tMrnvrvpZkLQtZ-u3ag6Un0wQJPdTVNdAFGDm2zUntLbXDttqXlIE',
      communityLeader:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyZwbGFjZU9mRXZlbnQ9bG9jYXRpb24iLCJ0eXBlPXJlY29yZC5yZWFkIiwidHlwZT1yZWNvcmQubm90aWZ5IiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCZwbGFjZU9mRXZlbnQ9YWRtaW5pc3RyYXRpdmVBcmVhIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJDT01NVU5JVFlfTEVBREVSIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiJjODc3ZGRhMC0wMzYyLTRhZjYtYTg4ZC01YWI4ZjM1ODAzMGUifQ.DyX0exD6AVqt5ZC6xYKkPvcvrJQFudNoYkjv0Q7pAjrVw3mLsYMT7e435PTmNS8E3k5WjnimwFwJXRvik00VBtFJzsqiTyoUADKmonQzuhfDinkLFIFHWRukfqRtezQX5OR8Vi4r5p4Vb72kIGnVDl3g0fwn43tzTqZQbHVgYoSmqYcE68pkFNyQghjDgDz40-1WQ0WCixKordDIpWh5Gf_flXIY0VpXQ5BXttU-PfWqY9pMYXmKlj17rsDvunGBrERJuiKiyvlb0y9b9KYtQk_iSWz9daqXahaf4g1roemYrSJawnaCyjN4_smTIG6NaMFWB03VQAKyBKFQ9ljdhgk1v1h53Eh2EIWM3iHF3ZCHSeujQOct-DFZju3xLhe1fuwFlozq7mFJBVKtdbI-4gNB4SyDOmP6nRgqRTF-GuDOo5vhv1K3QVvo6N7IX6rGfSoIrz1ooY4r9Hn9_Qqavogiq8lXioCNYr5PUnY2bTir0EvNHWyBo59V1ywxQcM8kX9XNXBaVZofe5MeaXaukB6Bqh7b-uHnmyTUxDh2etOxS7uc27BdKUVBzOLIjFQQzAbacaUn_H9WvNO3qLVB9R_Txy813OiS_whDck6HzxqHINf88BTP-fo6V5KgXhA04Xa0e-IXUF2vBylOMr7rJ_XDTdgwc66wuhoXdzdQ-HI',
      communityLeaderRegisteredInLocation:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyZwbGFjZU9mRXZlbnQ9bG9jYXRpb24iLCJ0eXBlPXJlY29yZC5yZWFkIiwidHlwZT1yZWNvcmQubm90aWZ5IiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCZyZWdpc3RlcmVkSW49bG9jYXRpb24iXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IkNPTU1VTklUWV9MRUFERVIiLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6ImM4NzdkZGEwLTAzNjItNGFmNi1hODhkLTVhYjhmMzU4MDMwZSJ9.CVF1v7qamvFqcbInKSHxbH8kgKyFhlCimVsvwyZaq5D5U4OUrAPdTM7vaKaESXY6zk3SmMac5d5lKHCm7064vE1Ela2xy9Oc-AHd5S3kWSjOrfzLcAGq5QrLZaqioPBrNXxHXkmoYJduMGUt7LF9zMmCDL4XKtQr888rg6SmoRpYjV9JWrrOBNl4MKEZ0ag9dVl-IAppOaMqMiRo3xQ83ichmHT4UtR8DbhYFwwjDQrb6ZxKIaenl7TcI0klhWGWZxjTSH8yjwETSrD1qSvCeaX1cW_7Pafgh4fYUhQAAXh4MyqAHF9A-enibGpqSfQqWrXXsRjgIoRRb8Ox1M-zcgzk0Qk9z3RLzWI5I9CRUWSeG2vy3_Fybf6NkJ7tnFfWuHdHrAVygP4Q93vaTsHsLecV6sDo-IRARwiEnLKTQ2wYaOGg2dclKYprYfZiYaThDHCLJmbB4rWBS8I6GWkFO2ha4PcYektBd0ITcho7MoIX7Jwb0qkZAvsOf35plfbaLpHETgR9Jdz6u2gre7TAUlBL1SvJ3Rl9IQTSDXY4G9rdvxbTZZmeGU1M2SHQCevECKy1gEGuye_LN-aY6APeJNtKKNOqmuBtCtq9cIetJ4pJJE7e0AsNbP35NSL6wxQY5y8fSzx5FcaqI92HnVZbyvJxy50GqJ7dUyq0ANu_P_A',
      communityLeaderRegisteredInAdministrativeArea:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyZwbGFjZU9mRXZlbnQ9bG9jYXRpb24iLCJ0eXBlPXJlY29yZC5yZWFkIiwidHlwZT1yZWNvcmQubm90aWZ5IiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCZyZWdpc3RlcmVkSW49YWRtaW5pc3RyYXRpdmVBcmVhIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJDT01NVU5JVFlfTEVBREVSIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiJjODc3ZGRhMC0wMzYyLTRhZjYtYTg4ZC01YWI4ZjM1ODAzMGUifQ.cjSrL4OWHpjxH3snaHg8ixN05KDNWZffGnotNj9qREsuWveOqWLddFlFWCYRU1KvsGj56mgfBZKpeym_TbhaRZydq1uMOFmsMD2cm720Pc4DEsjLJdff5R5dvQF1Go6nT6kGk9OeW365p5CgnjtzTHjA3O0_gBKev0QPqCivBgb1W8938DXnG6UyYB4aKNzqWnf4I5Qlb1bGACmUZpspmN2L31_3mTBhSW0AbIIkBOiy-6u1GwzG5mGDHfTZBtm-RJwaJu8ePcOHU4jF72M0mqOXt91DK1E3BCAIZ3c4fBJN_31ERjZdQVVLr0Q5kQfx0XyvlYqZ5xM1Xf27odxKW9aJTW2bjZMT04GMG45XdhGluLgTqED3wKVtDuef8UXaTsWKWfz6H3V4OnyjCeEZZCcmRviGUw0QEvO-JjAcs6SZr5YbRxDwHi8cSHJEW8tsob10jze8Z1RGvPxBH2WcnKvZM2Qh12k0p1R2K5K4kU2QsjJDKwosg8wNyoqmSnyg2MCb3RHwF6a5m5-E5gdWlva07ZqOx-IBpGfo6nHCKabu06kUCkm9xyNGCTdFABLoOsHZmBdWUDGlTKqJkrUKOCzqG5WEvQT5ohUwGb-5MPdAlZjSb-87qwPk6Yo_TjqxTLWKnrRemuna-n5GZ4gr_Rui7WxVuotMSjLFRfIndm8',
      communityLeaderMultipleSearchScopes:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyZwbGFjZU9mRXZlbnQ9bG9jYXRpb24iLCJ0eXBlPXJlY29yZC5yZWFkIiwidHlwZT1yZWNvcmQubm90aWZ5IiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCZyZWdpc3RlcmVkSW49bG9jYXRpb24iLCJ0eXBlPXJlY29yZC5zZWFyY2gmcmVnaXN0ZXJlZEluPWFkbWluaXN0cmF0aXZlQXJlYSJdLCJ1c2VyVHlwZSI6InVzZXIiLCJyb2xlIjoiQ09NTVVOSVRZX0xFQURFUiIsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiYzg3N2RkYTAtMDM2Mi00YWY2LWE4OGQtNWFiOGYzNTgwMzBlIn0.EjQWmGLrZ2qNlTHHFfmfK_CLlh7U6UQ_tm5i_CBAwNr6KIasyGprLEk1UcOluK2zdvgh8SXPZA5VlLgVJyc9LQ_tm7hDjJTofMEAKswxujsHSME_xu49wuh6SbizNdAluQYDeb-LOL_DLPlx0H__XU1mqtfqO4EwsgK6BsQl7KFacKvk7BY05TSOtxmglb9WbpezR_sgGHUlQOjoDg0gOtkxRM7AXLU5G2S02oIe0btYlZABPpeRjP4CACLLBr-0FPXRD53RfnHFM-SuFIzdHCgQTQGBaqaDFQcvbqdb5mxRWIpjLfWzYLGkPKQn2uS1ueGuC4U_19uku-b0dMWLi9b1JwTJPs-uXJMHsmGTrJBCr69JaJLUavg-G8vrK6keVpUd1uSMWmemrHUrYZl-8DVsFHEoqN2zoJ7KJC4oJfMa9xPkjqfsI6BLrVouXVREDuyP0NDxmdGZxEgnTQ_og5mE0gFq8FGlJsH1evKSwB3J-M-40gVfS5ruo8f_-jB86ZVjFkf-hdZULz2GQ6KEthw3ZQE3opQGINiHWM7opAgcddljrsUhX7du_aZuJfxeSYFuW-T5RTa_x6mYxtpaDSSTMux7VB_9LGoelBGQQVa91efDKwXDws2nY-PIWALLnrYq_zB83mlGUEiifjLxe-flohN0Dd5450_7Y3Bo5Dw',
      communityLeaderSearchAllAndLocation:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyZwbGFjZU9mRXZlbnQ9bG9jYXRpb24iLCJ0eXBlPXJlY29yZC5yZWFkIiwidHlwZT1yZWNvcmQubm90aWZ5IiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCIsInR5cGU9cmVjb3JkLnNlYXJjaCZyZWdpc3RlcmVkSW49bG9jYXRpb24iXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IkNPTU1VTklUWV9MRUFERVIiLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6ImM4NzdkZGEwLTAzNjItNGFmNi1hODhkLTVhYjhmMzU4MDMwZSJ9.oPgG3yhTuazfxbGzzIu9SgPFFxxnP5mJJ5h_wpfiND-qyP5sn4TeHjLujoeIRRt4PDYd8tJU7cDXMusvfzK7TLas3Z1aghEJesdtbFKEP_HQjNenRJXBWY5XVFO_efITyxu8Kj5dSMxkBoKsm7GPG3inc82mZYkzucXCivHitp6USf1BQaxmcOOQIwmEZmNm-NY1b-1POYFMch8jLUBF8EJD36HECAiiciL_4ek1YvRGfxLu84uAmLT6RGjLI4pCo8_ID16tOz7uzaktHUE0ODTs2kquuRNXBqgo1tqwHz4qK_D8Ft_mfLLOOECOATVJBEvc1svIrH_3ZoIpxvJXaxZWgdJ2k_ADuAJVs-PdxcNnd5ZB8JQ6hDh8qq1-ad_sL1QMzZZROc2ezo-xZcQ6_3a7MXDHbHe60S02FpTVTTdmaRWIzJhEQJnXYSVMQmRIKMvLwUve3z4-nOzpJ0jXJT9Xo2dhOgbrvd9o42zibXJZK2pe45I2J7nNkRW4iR_6GD53nxnr33D01a-M78d5K7hL-R7oWpy8XDbpNCY4qUk8Xjxm-YhLXdtpM7uEuVWEq6KypYZBK-57gUzcyKGzI5Wll8HCKd98y7K_vRComrxK8-hoEWBKDgO0M65k2bRmGHuMGMGEdhgaePMK78kVnei_u9wEWjuNotbarjpAeeM',
      provincialRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9cHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsInR5cGU9b3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zJmFjY2Vzc0xldmVsPWxvY2F0aW9uIiwidHlwZT13b3JrcXVldWUmaWRzPWFsbC1ldmVudHMsYXNzaWduZWQtdG8teW91LHJlY2VudCxyZXF1aXJlcy1jb21wbGV0aW9uLHJlcXVpcmVzLXVwZGF0ZXMsaW4tcmV2aWV3LWFsbCxpbi1leHRlcm5hbC12YWxpZGF0aW9uLHJlYWR5LXRvLXByaW50LHJlYWR5LXRvLWlzc3VlIiwidHlwZT11c2VyLnJlYWQtb25seS1teS1hdWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCIsInR5cGU9cmVjb3JkLmNyZWF0ZSZldmVudD1iaXJ0aCxkZWF0aCx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGNoaWxkLW9uYm9hcmRpbmcmcGxhY2VPZkV2ZW50PWFkbWluaXN0cmF0aXZlQXJlYSIsInR5cGU9cmVjb3JkLnJlYWQiLCJ0eXBlPXJlY29yZC5kZWNsYXJlIiwidHlwZT1yZWNvcmQucmVqZWN0IiwidHlwZT1yZWNvcmQuYXJjaGl2ZSIsInR5cGU9cmVjb3JkLnJlZ2lzdGVyIiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLnByaW50LWNlcnRpZmllZC1jb3BpZXMiLCJ0eXBlPXJlY29yZC5jb3JyZWN0IiwidHlwZT1yZWNvcmQudW5hc3NpZ24tb3RoZXJzIiwidHlwZT1yZWNvcmQucmV2aWV3LWR1cGxpY2F0ZXMiXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IlBST1ZJTkNJQUxfUkVHSVNUUkFSIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiJmMTE1NThmMi1mZjU3LTQzODItOTg3NS1kNThmNDIwNmI0N2YifQ.Se-W6wawck7vyteBzbBDEBKWP8guupwz-oBgxWwalIVa4ZI0iO3y8-qJy37S-MTwrCUMV9MOI4w60-Cnwdej-U7SekD7jVO-54-f5K7ZQFiS9retN9FfNekIPYBIaU0y_Udvl-GxtEs3E7biyqwGe4TRk67cCYEUieopFH9GGOxabTH4cvvjHlIrF_Z56ZI3fsiF-WWgZZHyEmUqZ5kMPnz6Z8MfVd-mAhBEVyvEbMBZjzr-cvICAQE0qiJ2YiFw-SenwQOdqsKYOZyi2PZuahaJdNZ3czG-CrJ9qSMB1eP2ikuBkTUczVQpwha8qI40b0IEdwNQ63yddbwdpO6sUAIYDDhqP8ltgmdHFeWxATYGRg1w6KTPo5BwqzzhiNIvwwTgsIXYlxprkJr0-MTFJRZNYY_kT6I8rArBqufyUFNQW8WJ0Tqe9qA98CC0WFA5lP5Ka4BUw5dGHDV_N317O2-TpxEfQPI3ZBEyJIwEzWJ63_8207Es3xDCnAJUawf8jFJ1eIZBhXLKadeAY7U0x8rlLcNPlafmqYtoTsrzg5Mf1jDnjLnirx0nheKAoLemcmf9EchPHvOQ2-wtNWmiV8Z78ScRjEUeztx537jU_PtYcjErsCK-LLEnQsOT0a2gwY9DsZqCYZ7SbHBNMsorpUYMTJbZy-0zu5_kP2NhR3Q',
      testAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXVzZXIucmVhZCIsInR5cGU9dXNlci5jcmVhdGUmcm9sZT1GSUVMRF9BR0VOVCIsInR5cGU9dXNlci5jcmVhdGUmYWNjZXNzTGV2ZWw9YWRtaW5pc3RyYXRpdmVBcmVhJnJvbGU9TE9DQUxfUkVHSVNUUkFSIiwidHlwZT11c2VyLmNyZWF0ZSZhY2Nlc3NMZXZlbD1sb2NhdGlvbiZyb2xlPUNPTU1VTklUWV9MRUFERVIiLCJ0eXBlPXVzZXIuZWRpdCZyb2xlPVJFR0lTVFJBVElPTl9BR0VOVCIsInR5cGU9dXNlci5lZGl0JmFjY2Vzc0xldmVsPWFkbWluaXN0cmF0aXZlQXJlYSZyb2xlPUxPQ0FMX1NZU1RFTV9BRE1JTiIsInR5cGU9dXNlci5lZGl0JmFjY2Vzc0xldmVsPWxvY2F0aW9uJnJvbGU9UFJPVklOQ0lBTF9SRUdJU1RSQVIiXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IkZJRUxEX0FHRU5UIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI4ZjhiNDMxYi1lZjQ3LTQwNjgtYjY3OC1lZjJkZDkzZTkyMDgifQ.elOcSaujgfwO59HQankBhw5a_4UmG33aOul7epSRfQGefy-JDMmmR0Pk2Fumf-j0599t7YzinvL1c90BA5Yg__LbaUda0hBN0WjyWUqv6kqKKIKWzSzx1QUe1OPrelXcYc7GIOh1TGw-5qTB0BWjSodIEzsVAFUb4djkEz4nG3Tj40U2t-0AkmrvxQ0RPN0K2J69xFu5u0VFwuYmLKlEppuebVgNE4zye1mrGX86d6rHuMa2p3GyuTrCJJAEknwo3LgI4mxXo4o2ZG7JkcW3pYGfdcQaGFwuD-pQm_XMTPArXfxWjWz3sgKNEzYh-ja7iIMdN-ACHpfZt1NiRnYckeukBiXUxbVilKFmDZ_O2AfEHO2MhssreHlI4V1Z8Kjyj3CTm25Brk79qVDYXl-dQsaXk4IM2PYsO0YN0pCl5NTGAloiVjvwPL2qeejr7apQyicpfCm5xD203Qb08jR_vKh6Rw5CvxkJOfjjxjADLjA7zEdLvdTalTSkVKRQhpBLKESH2vCi53vqGBHvcbDpyEKlUlePuomneVriSsk9YSRHLKHQaIOKFATl8BvVniu7I-r9cMq4j5mT_4osvjEgciYdkNWY9kDZsFd82qHNgXgmVxdptVjNzStpnX2clVHXK-InYHJouRYDH-X5yUFBVv6A3-bRlpCAUJyf2mUt3rM'
    },
    id: userIds,
    fieldAgent: (): {
      summary: UserSummary
      v2: User
      v1: FetchUserQuery['getUser']
    } => ({
      summary: {
        id: user.id.fieldAgent,
        name: { firstname: 'Kalusha', surname: 'Bwalya' },
        role: TestUserRole.enum.FIELD_AGENT,
        fullHonorificName: undefined,
        primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID,
        administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
        avatar: undefined,
        type: TokenUserType.enum.user
      } satisfies UserSummary,
      v2: {
        id: userIds.fieldAgent,
        name: { firstname: 'Kalusha', surname: 'Bwalya' },
        role: 'HOSPITAL_CLERK',
        fullHonorificName: undefined,
        signature: undefined,
        avatar: undefined,
        status: Status.Active,
        type: TokenUserType.enum.user,
        mobile: '+260911111111',
        email: 'kalushabwalya17@gmail.com',
        administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
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
    registrationAgent: (): {
      summary: UserSummary
      v2: User
      v1: FetchUserQuery['getUser']
    } => ({
      summary: {
        id: user.id.registrationAgent,
        name: { firstname: 'Felix', surname: 'Katongo' },
        role: TestUserRole.enum.REGISTRATION_AGENT,
        fullHonorificName: 'Dr. Felix Katongo',
        primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID,
        administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
        avatar: 'path/to/avatar' as DocumentPath,
        type: TokenUserType.enum.user
      } satisfies UserSummary,
      v2: {
        id: user.id.registrationAgent,
        name: { firstname: 'Felix', surname: 'Katongo' },
        role: TestUserRole.enum.REGISTRATION_AGENT,
        avatar: 'path/to/avatar' as DocumentPath,
        signature: 'path/to/signature' as DocumentPath,
        fullHonorificName: 'Dr. Felix Katongo',
        status: 'active',
        primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID,
        administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
        mobile: '+260922222222',
        email: 'kalushabwalya17+@gmail.com',
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
    localRegistrar: (): {
      summary: UserSummary
      v2: User
      v1: FetchUserQuery['getUser']
    } => ({
      summary: {
        id: user.id.localRegistrar,
        name: { firstname: 'Kennedy', surname: 'Mweene' },
        role: TestUserRole.enum.LOCAL_REGISTRAR,
        fullHonorificName: '1st Order Honorable Kennedy Mweene',
        primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID,
        administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
        avatar: undefined,
        type: TokenUserType.enum.user
      },
      v2: {
        id: user.id.localRegistrar,
        name: { firstname: 'Kennedy', surname: 'Mweene' },
        role: TestUserRole.enum.LOCAL_REGISTRAR,
        fullHonorificName: '1st Order Honorable Kennedy Mweene',
        primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID,
        administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
        avatar: undefined,
        mobile: '+260933333333',
        email: 'kalushabwalya1.7@gmail.com',
        signature: undefined,
        status: Status.Active,
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
    /**
     * Gift Phiri — COMMUNITY_LEADER at Klow Village Office (village level).
     */
    communityLeader: (): {
      summary: UserSummary
      v2: User
      v1: FetchUserQuery['getUser']
    } => ({
      summary: {
        id: userIds.communityLeader,
        name: { firstname: 'Gift', surname: 'Phiri' },
        role: TestUserRole.enum.COMMUNITY_LEADER,
        fullHonorificName: undefined,
        avatar: undefined,
        type: TokenUserType.enum.user,
        primaryOfficeId: '1f4a5b6c-7d8e-4312-8abc-345678901234' as UUID,
        administrativeAreaId: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID
      } satisfies UserSummary,
      v2: {
        id: userIds.communityLeader,
        name: { firstname: 'Gift', surname: 'Phiri' },
        role: TestUserRole.enum.COMMUNITY_LEADER,
        fullHonorificName: undefined,
        signature: undefined,
        avatar: undefined,
        type: TokenUserType.enum.user,
        primaryOfficeId: '1f4a5b6c-7d8e-4312-8abc-345678901234' as UUID,
        mobile: '+260717456139',
        email: 'g.phiri@gmail.com',
        status: Status.Active
      } satisfies User,
      v1: {
        id: userIds.communityLeader,
        userMgntUserID: generateUuid(),
        creationDate: '1736421510057',
        username: 'g.phiri',
        practitionerId: generateUuid(),
        mobile: '+260717456139',
        email: 'g.phiri@gmail.com',
        fullHonorificName: null,
        role: {
          id: TestUserRole.enum.COMMUNITY_LEADER,
          label: {
            id: 'userRole.communityLeader',
            defaultMessage: 'Community Leader',
            description: 'Name for user role Community Leader',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Gift',
            familyName: 'Phiri',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '1f4a5b6c-7d8e-4312-8abc-345678901234',
          name: 'Klow Village Office',
          alias: ['Klow Village Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: null,
        avatar: null,
        searches: [],
        __typename: 'User'
      } satisfies FetchUserQuery['getUser']
    }),
    /**
     * Mitchel Owen — PROVINCIAL_REGISTRAR at Central Province Office (province level).
     */
    provincialRegistrar: (): {
      summary: UserSummary
      v2: User
      v1: FetchUserQuery['getUser']
    } => ({
      summary: {
        id: userIds.provincialRegistrar,
        name: { firstname: 'Mitchel', surname: 'Owen' },
        role: TestUserRole.enum.PROVINCIAL_REGISTRAR,
        fullHonorificName: undefined,
        avatar: undefined,
        type: TokenUserType.enum.user,
        primaryOfficeId: '6f6186ce-cd5f-4a5f-810a-2d99e7c4ba12' as UUID
      },
      v2: {
        id: userIds.provincialRegistrar,
        name: { firstname: 'Mitchel', surname: 'Owen' },
        role: TestUserRole.enum.PROVINCIAL_REGISTRAR,
        fullHonorificName: undefined,
        signature: undefined,
        avatar: undefined,
        type: TokenUserType.enum.user,
        primaryOfficeId: '6f6186ce-cd5f-4a5f-810a-2d99e7c4ba12' as UUID,
        administrativeAreaId: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
        email: 'kalushabwaly.a17@gmail.com',
        mobile: '+260921111111',
        status: Status.Active
      } satisfies User,
      v1: {
        id: userIds.provincialRegistrar,
        userMgntUserID: generateUuid(),
        creationDate: '1736421510058',
        username: 'm.owen',
        practitionerId: generateUuid(),
        mobile: '+260988085085',
        email: 'm.owen@gmail.com',
        fullHonorificName: null,
        role: {
          id: TestUserRole.enum.PROVINCIAL_REGISTRAR,
          label: {
            id: 'userRole.provincialRegistrar',
            defaultMessage: 'Provincial Registrar',
            description: 'Name for user role Provincial Registrar',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Mitchel',
            familyName: 'Owen',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '6f6186ce-cd5f-4a5f-810a-2d99e7c4ba12',
          name: 'Central Province Office',
          alias: ['Central Province Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: null,
        avatar: null,
        searches: [],
        __typename: 'User'
      } satisfies FetchUserQuery['getUser']
    }),
    localSystemAdmin: (): {
      summary: UserSummary
      v2: User
      v1: FetchUserQuery['getUser']
    } => ({
      summary: {
        id: userIds.localSystemAdmin,
        name: { firstname: 'Alex', surname: 'Ngonga' },
        role: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
        fullHonorificName: undefined,
        avatar: undefined,
        type: TokenUserType.enum.user,
        primaryOfficeId: 'f403ca64-6a1d-4882-94c1-d8674df59a85' as UUID,
        administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID
      } satisfies UserSummary,
      v1: {
        id: userIds.localSystemAdmin,
        userMgntUserID: '69179374-0447-4545-4545-454545454548',
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
      } satisfies FetchUserQuery['getUser'],
      v2: {
        id: userIds.localSystemAdmin,
        name: { firstname: 'Alex', surname: 'Ngonga' },
        role: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
        status: Status.Active,
        mobile: '+260978787878',
        email: 'kalushab.walya17@gmail.com',
        primaryOfficeId: 'f403ca64-6a1d-4882-94c1-d8674df59a85' as UUID,
        type: TokenUserType.enum.user
      }
    }),
    nationalSystemAdmin: (): {
      summary: UserSummary
      v2: User
      v1: FetchUserQuery['getUser']
    } => ({
      summary: {
        id: user.id.nationalSystemAdmin,
        name: { firstname: 'Jonathan', surname: 'Campbell' },
        role: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
        fullHonorificName: undefined,
        avatar: undefined,
        type: TokenUserType.enum.user,
        primaryOfficeId: '8788d17c-b639-4aa0-89f0-ebc64263d81c' as UUID,
        administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID
      } satisfies UserSummary,
      v2: {
        id: user.id.nationalSystemAdmin,
        name: { firstname: 'Jonathan', surname: 'Campbell' },
        role: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
        status: Status.Active,
        mobile: '+260921111111',
        email: 'kalushabwaly.a17@gmail.com',
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
       * except for,
       *  - workque scope that has an extra workqueue: all-events
       *  - test admin scope that has extra user create and edit scopes
       */
      localRegistrar: [
        encodeScope({ type: 'performance.read' }),
        encodeScope({ type: 'performance.read-dashboards' }),
        encodeScope({ type: 'profile.electronic-signature' }),
        encodeScope({
          type: 'organisation.read-locations',
          options: { accessLevel: 'location' }
        }),
        encodeScope({
          type: 'workqueue',
          options: {
            ids: [
              'all-events',
              'assigned-to-you',
              'recent',
              'requires-completion',
              'requires-updates',
              'in-review-all',
              'in-external-validation',
              'ready-to-print',
              'ready-to-issue'
            ]
          }
        }),
        encodeScope({ type: 'user.read-only-my-audit' }),
        encodeScope({ type: 'record.search' }),
        encodeScope({ type: 'record.create' }),
        encodeScope({
          type: 'record.read',
          options: {
            event: [
              'birth',
              'death',
              'tennis-club-membership',
              'child-onboarding',
              'library-membership'
            ]
          }
        }),
        encodeScope({ type: 'record.declare' }),
        encodeScope({ type: 'record.reject' }),
        encodeScope({ type: 'record.archive' }),
        encodeScope({ type: 'record.register' }),
        encodeScope({ type: 'record.edit' }),
        encodeScope({ type: 'record.print-certified-copies' }),
        encodeScope({ type: 'record.correct' }),
        encodeScope({ type: 'record.unassign-others' }),
        encodeScope({ type: 'record.review-duplicates' }),
        encodeScope({
          type: 'record.custom-action',
          options: {
            event: ['tennis-club-membership'],
            customActionTypes: ['Approve']
          }
        })
      ],
      registrationAgent: [
        encodeScope({ type: 'performance.read' }),
        encodeScope({ type: 'performance.read-dashboards' }),
        encodeScope({
          type: 'organisation.read-locations',
          options: { accessLevel: 'location' }
        }),
        encodeScope({ type: 'user.read-only-my-audit' }),
        encodeScope({
          type: 'workqueue',
          options: {
            ids: [
              'all-events',
              'assigned-to-you',
              'recent',
              'requires-completion',
              'requires-updates',
              'in-review',
              'sent-for-approval',
              'in-external-validation',
              'ready-to-print',
              'ready-to-issue'
            ]
          }
        }),
        encodeScope({
          type: 'record.search'
        }),
        encodeScope({
          type: 'record.create',
          options: {
            event: [
              'birth',
              'death',
              'tennis-club-membership',
              'child-onboarding'
            ]
          }
        }),
        encodeScope({ type: 'record.read' }),
        encodeScope({ type: 'record.declare' }),
        encodeScope({ type: 'record.reject' }),
        encodeScope({ type: 'record.edit' }),
        encodeScope({ type: 'record.archive' }),
        encodeScope({ type: 'record.print-certified-copies' }),
        encodeScope({ type: 'record.request-correction' })
      ],
      fieldAgent: [
        encodeScope({
          type: 'workqueue',
          options: {
            ids: [
              'all-events',
              'assigned-to-you',
              'recent',
              'requires-updates',
              'sent-for-review'
            ]
          }
        }),
        encodeScope({ type: 'record.search' }),
        encodeScope({ type: 'record.create' }),
        encodeScope({ type: 'record.read' }),
        encodeScope({ type: 'record.notify' }),
        encodeScope({ type: 'record.declare' }),
        encodeScope({ type: 'record.edit' })
      ],
      localSystemAdmin: [
        encodeScope({
          type: 'user.read',
          options: { accessLevel: 'administrativeArea' }
        }),
        encodeScope({
          type: 'user.edit',
          options: {
            accessLevel: 'administrativeArea',
            role: [
              'FIELD_AGENT',
              'POLICE_OFFICER',
              'SOCIAL_WORKER',
              'HEALTHCARE_WORKER',
              'LOCAL_LEADER',
              'REGISTRATION_AGENT',
              'LOCAL_REGISTRAR'
            ]
          }
        }),
        encodeScope({
          type: 'organisation.read-locations',
          options: { accessLevel: 'administrativeArea' }
        }),
        encodeScope({ type: 'performance.read' }),
        encodeScope({ type: 'performance.read-dashboards' }),
        encodeScope({ type: 'performance.vital-statistics-export' }),
        encodeScope({
          type: 'user.create',
          options: {
            accessLevel: 'administrativeArea',
            role: [
              'FIELD_AGENT',
              'POLICE_OFFICER',
              'SOCIAL_WORKER',
              'HEALTHCARE_WORKER',
              'LOCAL_LEADER',
              'REGISTRATION_AGENT',
              'LOCAL_REGISTRAR'
            ]
          }
        })
      ],
      /**
       * COMMUNITY_LEADER: jurisdiction locked to their specific office location.
       * record.create has placeOfEvent: 'location' so the field is fully locked.
       * Community leaders do NOT have record.declare — only record.notify.
       * They submit via the Declare form but the action is stored as NOTIFY.
       */
      communityLeader: [
        ...communityLeaderBaseScopesWithoutSearch,
        encodeScope({
          type: 'record.search',
          options: { placeOfEvent: 'administrativeArea' }
        })
      ],
      /** record.search restricted to user's own office only. */
      communityLeaderRegisteredInLocation: [
        ...communityLeaderBaseScopesWithoutSearch,
        encodeScope({
          type: 'record.search',
          options: { registeredIn: JurisdictionFilter.enum.location }
        })
      ],
      /** record.search restricted to user's administrative area. */
      communityLeaderRegisteredInAdministrativeArea: [
        ...communityLeaderBaseScopesWithoutSearch,
        encodeScope({
          type: 'record.search',
          options: { registeredIn: JurisdictionFilter.enum.administrativeArea }
        })
      ],
      /**
       * Two record.search scopes: registeredIn=location + registeredIn=administrativeArea.
       * Most relaxed (administrativeArea) wins via priority order.
       */
      communityLeaderMultipleSearchScopes: [
        ...communityLeaderBaseScopesWithoutSearch,
        encodeScope({
          type: 'record.search',
          options: { registeredIn: JurisdictionFilter.enum.location }
        }),
        encodeScope({
          type: 'record.search',
          options: { registeredIn: JurisdictionFilter.enum.administrativeArea }
        })
      ],
      /**
       * Two record.search scopes: one without registeredIn (defaults to 'all') + registeredIn=location.
       * Most relaxed ('all') wins — same result as having no restriction.
       */
      communityLeaderSearchAllAndLocation: [
        ...communityLeaderBaseScopesWithoutSearch,
        encodeScope({ type: 'record.search' }),
        encodeScope({
          type: 'record.search',
          options: { registeredIn: JurisdictionFilter.enum.location }
        })
      ],
      /**
       * PROVINCIAL_REGISTRAR: jurisdiction locked to their administrative area (province).
       * record.create has placeOfEvent: 'administrativeArea' so province is locked but districts are selectable.
       */
      provincialRegistrar: [
        encodeScope({ type: 'performance.read' }),
        encodeScope({ type: 'performance.read-dashboards' }),
        encodeScope({ type: 'profile.electronic-signature' }),
        encodeScope({
          type: 'organisation.read-locations',
          options: { accessLevel: 'location' }
        }),
        encodeScope({
          type: 'workqueue',
          options: {
            ids: [
              'all-events',
              'assigned-to-you',
              'recent',
              'requires-completion',
              'requires-updates',
              'in-review-all',
              'in-external-validation',
              'ready-to-print',
              'ready-to-issue'
            ]
          }
        }),
        encodeScope({ type: 'user.read-only-my-audit' }),
        encodeScope({ type: 'record.search' }),
        encodeScope({
          type: 'record.create',
          options: {
            event: [
              'birth',
              'death',
              'tennis-club-membership',
              'child-onboarding'
            ],
            placeOfEvent: JurisdictionFilter.enum.administrativeArea
          }
        }),
        encodeScope({ type: 'record.read' }),
        encodeScope({ type: 'record.declare' }),
        encodeScope({ type: 'record.reject' }),
        encodeScope({ type: 'record.archive' }),
        encodeScope({ type: 'record.register' }),
        encodeScope({ type: 'record.edit' }),
        encodeScope({ type: 'record.print-certified-copies' }),
        encodeScope({ type: 'record.correct' }),
        encodeScope({ type: 'record.unassign-others' }),
        encodeScope({ type: 'record.review-duplicates' })
      ],
      nationalSystemAdmin: [
        encodeScope({ type: 'config.update-all' }),
        encodeScope({ type: 'organisation.read-locations' }),
        encodeScope({ type: 'user.read' }),
        encodeScope({ type: 'performance.read' }),
        encodeScope({ type: 'performance.read-dashboards' }),
        encodeScope({ type: 'performance.vital-statistics-export' }),
        encodeScope({ type: 'record.reindex' }),
        encodeScope({
          type: 'user.create',
          options: {
            role: [
              'FIELD_AGENT',
              'HOSPITAL_CLERK',
              'COMMUNITY_LEADER',
              'REGISTRATION_AGENT',
              'LOCAL_REGISTRAR',
              'NATIONAL_REGISTRAR',
              'LOCAL_SYSTEM_ADMIN',
              'NATIONAL_SYSTEM_ADMIN',
              'PERFORMANCE_MANAGER'
            ]
          }
        }),
        encodeScope({
          type: 'user.edit',
          options: {
            role: [
              'FIELD_AGENT',
              'HOSPITAL_CLERK',
              'COMMUNITY_LEADER',
              'REGISTRATION_AGENT',
              'LOCAL_REGISTRAR',
              'NATIONAL_REGISTRAR',
              'LOCAL_SYSTEM_ADMIN',
              'NATIONAL_SYSTEM_ADMIN',
              'PERFORMANCE_MANAGER'
            ]
          }
        })
      ],
      testAdmin: [
        encodeScope({ type: 'user.read' }),
        encodeScope({
          type: 'user.create',
          options: { role: ['FIELD_AGENT'] }
        }),
        encodeScope({
          type: 'user.create',
          options: {
            accessLevel: 'administrativeArea',
            role: ['LOCAL_REGISTRAR']
          }
        }),
        encodeScope({
          type: 'user.create',
          options: { accessLevel: 'location', role: ['COMMUNITY_LEADER'] }
        }),
        encodeScope({
          type: 'user.edit',
          options: { role: ['REGISTRATION_AGENT'] }
        }),
        encodeScope({
          type: 'user.edit',
          options: {
            accessLevel: 'administrativeArea',
            role: ['LOCAL_SYSTEM_ADMIN']
          }
        }),
        encodeScope({
          type: 'user.edit',
          options: { accessLevel: 'location', role: ['PROVINCIAL_REGISTRAR'] }
        })
      ]
    }
  }

  return { event: eventPayloadGenerator(prng), user }
}
