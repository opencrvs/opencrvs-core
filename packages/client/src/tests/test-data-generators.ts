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
  encodeScope,
  eventPayloadGenerator,
  generateUuid,
  JurisdictionFilter,
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
  nationalSystemAdmin: '68df9529f8f3a73007a4427c',
  communityLeader: '69abc123def4567890abcdef',
  provincialRegistrar: '69def456abc7890123abcdef'
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
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSIsInR5cGU9cmVjb3JkLnNlYXJjaCZldmVudD1iaXJ0aCxkZWF0aCx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGNoaWxkLW9uYm9hcmRpbmcsRk9PVEJBTExfQ0xVQl9NRU1CRVJTSElQIiwidHlwZT1yZWNvcmQuY3JlYXRlIiwidHlwZT1yZWNvcmQucmVhZCIsInR5cGU9cmVjb3JkLm5vdGlmeSIsInR5cGU9cmVjb3JkLmRlY2xhcmUiLCJ0eXBlPXJlY29yZC5lZGl0Il0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJGSUVMRF9BR0VOVCIsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjdlZjdmODNkNmE5Y2I5MmU5ZWRhYTk5In0.WLO98_QC4UrxJTTIBH8BXWuttuWvlCTeLnQFLnBdyP-TguC-PS3baGS3qMscVT2TvK35zQh48h8lKh6_C1hic5aDL3B_1Sre0Z4PGG7-YLAnlt9av-mIdFgpIR6AQyctBFSb_CkiNTyalveyICLZKxF8ySJwSOr2wkmgv6x92yJJt_iQHUXl9xwiRTOAenmtR3qAjWrPeeffGJOY9d_ndZT8vrsOg8FEHm8FOR9TGWbu8gN9tWubdVjMWk24DzQiinoybGfcFZNZ9pSkrSCCEgIKJiMAKpxdw6vl8lY77LOZBbaogqAjvdFkmqTMetHUweExef5txhwmHonq2YcJppiJwmXo27Qji66ill5zYE-yFS7n_C_oCZxHohKc2t9pq8uRR7SH-ZpxwXFz7exrXIf1N-GpuwX4SX1KU4DAojgcomVCV3U7HQhAu57jMVz3f_d2RqiqnqXhF4avqaDAumSUYvrj7CC9Zk3wnGc-2iBwIdjU7uXvhwRiCNP_sO-prgnKr75GpDf1WQA-dy1vtZjilQViIpib4DaXYVeZnXbodekJhwnjTSOsD87o6NCZBsT0JOJSO8fIZaAm8OD9RODfp4puUI24HgVb66CTjAHx7QtoWm2n3U7_tKb1xFu6npTTRG-5Otn0tYKoBK0eMec6tABUR9x2TlGVJoi3Bm0',
      localRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tZWRpdCIsInJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInJlY29yZC5kZWNsYXJhdGlvbi1yZWluc3RhdGUiLCJyZWNvcmQuY29uZmlybS1yZWdpc3RyYXRpb24iLCJyZWNvcmQucmVqZWN0LXJlZ2lzdHJhdGlvbiIsInBlcmZvcm1hbmNlLnJlYWQiLCJwZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJwcm9maWxlLmVsZWN0cm9uaWMtc2lnbmF0dXJlIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsIndvcmtxdWV1ZVtpZD1hbGwtZXZlbnRzfGFzc2lnbmVkLXRvLXlvdXxyZWNlbnR8cmVxdWlyZXMtY29tcGxldGlvbnxyZXF1aXJlcy11cGRhdGVzfGluLXJldmlldy1hbGx8aW4tZXh0ZXJuYWwtdmFsaWRhdGlvbnxyZWFkeS10by1wcmludHxyZWFkeS10by1pc3N1ZV0iLCJ0eXBlPXJlY29yZC5zZWFyY2gmZXZlbnQ9YmlydGgsZGVhdGgsdGVubmlzLWNsdWItbWVtYmVyc2hpcCxjaGlsZC1vbmJvYXJkaW5nLEZPT1RCQUxMX0NMVUJfTUVNQkVSU0hJUCIsInVzZXIucmVhZDpvbmx5LW15LWF1ZGl0IiwidHlwZT1yZWNvcmQuY3JlYXRlIiwidHlwZT1yZWNvcmQucmVhZCZldmVudD1iaXJ0aCxkZWF0aCx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGNoaWxkLW9uYm9hcmRpbmcsbGlicmFyeS1tZW1iZXJzaGlwIiwidHlwZT1yZWNvcmQuZGVjbGFyZSIsInR5cGU9cmVjb3JkLnJlamVjdCIsInR5cGU9cmVjb3JkLmFyY2hpdmUiLCJ0eXBlPXJlY29yZC5yZWdpc3RlciIsInR5cGU9cmVjb3JkLmVkaXQiLCJ0eXBlPXJlY29yZC5wcmludC1jZXJ0aWZpZWQtY29waWVzIiwidHlwZT1yZWNvcmQuY29ycmVjdCIsInR5cGU9cmVjb3JkLnVuYXNzaWduLW90aGVycyIsInR5cGU9cmVjb3JkLnJldmlldy1kdXBsaWNhdGVzIiwidHlwZT1yZWNvcmQuY3VzdG9tLWFjdGlvbiZldmVudD10ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwJmN1c3RvbUFjdGlvblR5cGVzPUFwcHJvdmUiXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IkxPQ0FMX1JFR0lTVFJBUiIsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjgyMWMxNzVkY2U0ZDc4ODZkNGU4MjEwIn0.l0BdRYuCWyTQeOJu8tMwmk3er4nzTXTS-eVf7LOcHb-W6zPlGLPBlMXguTj1YJFOkBClq8FFHSpcf2h0Sf9SnnckPNggHpDC5JXYRPj-PmEsV7S-F44fupva2Xws6xmTwGJ-1RskMmFfzn9p8V5znrSAGGIQ1OUUcnBOGharlQOXQOWJYy1xcFL9bhRqQOKZNrGud-zgmSogR0FpZ_4KGOluR6o8K5qjKZe5AwYz_ofYCV2d7-DcnpB1A9NPUEMDsTxbxnZ3ucWBZ4GvgxBo06deQkKnew1iQL7ip27Z0DWSdOZMK90KpSHNMyJab0bpS_z1IwRqXHHJVYYtE_Z3Fs1WaSX_My7Fgq4P3Eo6wZt_nPf6GgVqyh0ehdtMBmcoG5bVMQ1986qcG9cpQwbce_Rd4p_gkSH4HQ-hRCAiVGCdYxW7miVowSqjyVqe3AhGttZCU_iV8FBGe1CZQO6rMy6oV1qUmd-Q6ShmvKG6wSrrNwHS_hFjleK0ePP-5DIhnCLvfYI78SxQmMEJVf5cic_r5Nr3foAKITxAH1NTZOj9Gt9DPOzc_n0qtToQJm49MueztXDyBHmfiZv_-8NqxBjXzZHUNLs8sQtq1Zoe84abaHdLxNwcZyxr-1HQXWHjm2Yt1nIlyKMmutmYZZGbjmz87dyqYKpn6dYsiWaWDEw',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tZWRpdCIsInJlY29yZC5kZWNsYXJhdGlvbi1yZWluc3RhdGUiLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInVzZXIucmVhZDpvbmx5LW15LWF1ZGl0Iiwic2VhcmNoLmJpcnRoIiwic2VhcmNoLmRlYXRoIiwic2VhcmNoLm1hcnJpYWdlIiwid29ya3F1ZXVlW2lkPWFsbC1ldmVudHN8YXNzaWduZWQtdG8teW91fHJlY2VudHxyZXF1aXJlcy1jb21wbGV0aW9ufHJlcXVpcmVzLXVwZGF0ZXN8aW4tcmV2aWV3fHNlbnQtZm9yLWFwcHJvdmFsfGluLWV4dGVybmFsLXZhbGlkYXRpb258cmVhZHktdG8tcHJpbnR8cmVhZHktdG8taXNzdWVdIiwidHlwZT1yZWNvcmQuc2VhcmNoJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyxGT09UQkFMTF9DTFVCX01FTUJFUlNISVAiLCJ0eXBlPXJlY29yZC5jcmVhdGUmZXZlbnQ9YmlydGgsZGVhdGgsdGVubmlzLWNsdWItbWVtYmVyc2hpcCxjaGlsZC1vbmJvYXJkaW5nIiwidHlwZT1yZWNvcmQucmVhZCIsInR5cGU9cmVjb3JkLmRlY2xhcmUiLCJ0eXBlPXJlY29yZC5yZWplY3QiLCJ0eXBlPXJlY29yZC5lZGl0IiwidHlwZT1yZWNvcmQuYXJjaGl2ZSIsInR5cGU9cmVjb3JkLnByaW50LWNlcnRpZmllZC1jb3BpZXMiLCJ0eXBlPXJlY29yZC5yZXF1ZXN0LWNvcnJlY3Rpb24iXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IlJFR0lTVFJBVElPTl9BR0VOVCIsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjdlZjdmODNkNmE5Y2I5MmU5ZWRhYWExIn0.WrusI__QOd-jaX1miFclXCi7Er5n-jEnYTZEwzFyBkMVwRq7tGE_RXUYn9M8cNPDNtRqxIfa7SffQUawVk6XaKsijw8itek728YKlccpJeVoRFjvRhoCL5ogkpc5Ii_rMtTvvkHySItJK80YjsZx0EOPUgkMNqYGgzRUwDXxfKTykzb5SxKGU5-enBnL0BpOMOXn4PFwbRdPOebKj-eexc2QN3WQ_RThleZmMbvvnU9RJJ3U2TdIvcm3qQJjkzQwIN6X9EdTcATfvUqwq3bpfLK0rL4lf9Dq2cxA5er-jWJbEUvbKH-H59HHgaaTXe41ynysKaQe-9unht8UQmA0_JQc5uCZ92hazazC92TakraJuWKOeaU62WfZC9Yda5XdqwpeaXMXR4RahvPr5E6TTho2Jo9h7glGUI2RLl4BgBGiypW4Z3Tk76XQheICdgQlQU2VSc2n-dNOOAXZxIovuwmHAO8S2rjku5BdZ8aBuJgyAP1b5g_eqK4V187-Rz0caETEU8kQsP5GLQ18J0LTd728OixhdQK-HIRUTIQxLy_UCIvewG-0XIdj4uW5RT1Kss3ibRGpp2G829ofC9WXqIAjgMxHhrcu9KuV5s8bpf9DgHWbb0Zy9e5EPvczRlj9SkMBe2IM29WXIRkiFPDq0QMB8TqvafC1mhEULLM8LaE',
      localSystemAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ1c2VyLnJlYWQ6bXktb2ZmaWNlIiwidXNlci5yZWFkOm15LWp1cmlzZGljdGlvbiIsInVzZXIudXBkYXRlOm15LWp1cmlzZGljdGlvbiIsIm9yZ2FuaXNhdGlvbi5yZWFkLWxvY2F0aW9uczpteS1qdXJpc2RpY3Rpb24iLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwicGVyZm9ybWFuY2Uudml0YWwtc3RhdGlzdGljcy1leHBvcnQiLCJvcmdhbmlzYXRpb24ucmVhZC1sb2NhdGlvbnM6bXktb2ZmaWNlIiwidXNlci5jcmVhdGVbcm9sZT1GSUVMRF9BR0VOVHxQT0xJQ0VfT0ZGSUNFUnxTT0NJQUxfV09SS0VSfEhFQUxUSENBUkVfV09SS0VSfExPQ0FMX0xFQURFUnxSRUdJU1RSQVRJT05fQUdFTlR8TE9DQUxfUkVHSVNUUkFSXSIsInVzZXIuZWRpdFtyb2xlPUZJRUxEX0FHRU5UfFBPTElDRV9PRkZJQ0VSfFNPQ0lBTF9XT1JLRVJ8SEVBTFRIQ0FSRV9XT1JLRVJ8TE9DQUxfTEVBREVSfFJFR0lTVFJBVElPTl9BR0VOVHxMT0NBTF9SRUdJU1RSQVJdIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJMT0NBTF9TWVNURU1fQURNSU4iLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY4Y2JkMjZmYzY0NzYxNTY1NDY5NTkxZCJ9.O-wogl0fSIAJJ1wd1o8fqo-NfucnEKr1dKbYgSdhnCljZk-0K0bYIQOpz6TqKOinAxFhRcy2hRpf2MS7Q-mBlW43pF_Rzcm7piz3Q14V8ZKgeY7XEdvtcbPvf004PnSd7gGqLLwmYM7WX4X9ok1_d5AS2p70z7oYb0XsrrJ1cE_hv5teNWZyjnUn3JIN2o4BBZYSCQ0IlNwC5uCL1givHiHGq3j6rmses-4QAhCPHXPLjWSoa272OEzQdIqEgZj4sZcNeAxMgFfU0BxUR5huviaXP-e7iPk_zbogCKFHG6wmr__FUTGL0QR4sOBXy52Rf1bExdu44CNXmagSofwsvkUYD5QPfxTtp6nJ3VXNUrhz_Ga66fV_m8EMcd_Hpqytfb1lo_5kkhuQRwgfiBRXcXXCEDkeYWPLnZtsrnSHmIl-LHHKpNEiIGP4phAo9uwM6cGEGAt9ewFTyHWvJ22PETyBocIXiGh0kCjZKI9tpV8QcGDKt7y4b_CQHI0Zd-A7ST3xZUsztavF_zH77DnU-vweEBp-EhEQ1zRwtEr3neWXeKbZBQz0gqbeq6zGl87S1ZflPTMOdbkYd7NlR0NiGy4CCysBlLxeo9Dgv_4uXXJcFgJOvGD5RDhKo-CA4Fcq64D_YXjhWmuC-5-pmxf5TpAb323upY4NqWlZ3cxh_6Y',
      nationalSystemAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJjb25maWcudXBkYXRlOmFsbCIsIm9yZ2FuaXNhdGlvbi5yZWFkLWxvY2F0aW9uczphbGwiLCJ1c2VyLmNyZWF0ZTphbGwiLCJ1c2VyLnVwZGF0ZTphbGwiLCJ1c2VyLnJlYWQ6YWxsIiwicGVyZm9ybWFuY2UucmVhZCIsInBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInBlcmZvcm1hbmNlLnZpdGFsLXN0YXRpc3RpY3MtZXhwb3J0IiwicmVjb3JkLnJlaW5kZXgiLCJ1c2VyLmNyZWF0ZVtyb2xlPUZJRUxEX0FHRU5UfEhPU1BJVEFMX0NMRVJLfENPTU1VTklUWV9MRUFERVJ8UkVHSVNUUkFUSU9OX0FHRU5UfExPQ0FMX1JFR0lTVFJBUnxOQVRJT05BTF9SRUdJU1RSQVJ8TE9DQUxfU1lTVEVNX0FETUlOfE5BVElPTkFMX1NZU1RFTV9BRE1JTnxQRVJGT1JNQU5DRV9NQU5BR0VSXSIsInVzZXIuZWRpdFtyb2xlPUZJRUxEX0FHRU5UfEhPU1BJVEFMX0NMRVJLfENPTU1VTklUWV9MRUFERVJ8UkVHSVNUUkFUSU9OX0FHRU5UfExPQ0FMX1JFR0lTVFJBUnxOQVRJT05BTF9SRUdJU1RSQVJ8TE9DQUxfU1lTVEVNX0FETUlOfE5BVElPTkFMX1NZU1RFTV9BRE1JTnxQRVJGT1JNQU5DRV9NQU5BR0VSXSJdLCJ1c2VyVHlwZSI6InVzZXIiLCJyb2xlIjoiTkFUSU9OQUxfU1lTVEVNX0FETUlOIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2OGRmOTUyOWY4ZjNhNzMwMDdhNDQyN2MifQ.WGLo5JF0PlPhZoYFhn8lg1dt-iaDSUQFGUDolQsQHwuY_AEZpFIKjaKL-GYJMLpuHPahk8wK7OTjQJZ54lH5EUvL8jqRfIMvQTRK6IHi_jvMHJQbXIvS434za-rY99_vsBnWIhTvqawIbKkOG89FBwdF6OVI5SxNV39ltjPChrN4-Ke-8QjZjJyUfxLanh4NMfsd3ohnpH5q3QtJMfDTl8iJ7-cJ3lwpI29gVtiXyULfbCWGXMPjwutCKNyNGA-hIMzvFHsFFw23EzdwnIqLBNzjMwFjeB3RwWBPexC6dctKuHY8ooRL-oWSxran0rOUwNr3Y0VKIl5C1EoMkBkkwHgy7awLPYstZGP6aC-B4pdQp9t5dx8omB6OozG0WD2oJJx7uH8pbghTsLdnQr1STF0gpL4qGWIE5RQ-eFCVQAQlXDPrVCDBEkK5ip8_OEag7uoPdJEybmTUVitMpTcYEdXQzJ2GFIkShXH4nkHeF60JHyviPFM2ClWD_DLLCr1v6fWLSFgMjfakK_YtOzLRSIAnwcGRk1RwR_H9-YSI-fVxM39suMZ78o5iXQiifuFjZWLF9FBwwVDuM0XAf7gD_zGx9uHSOw2I88CUtZpmPfvsesUW7TmHWX_VkSztH1XQt9BkUrPZvS6sarFZeswYQiT7EgZ5KqMcsXhlk9tVQo8',
      communityLeader:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSIsInR5cGU9cmVjb3JkLnNlYXJjaCZldmVudD1iaXJ0aCxkZWF0aCx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGNoaWxkLW9uYm9hcmRpbmcsRk9PVEJBTExfQ0xVQl9NRU1CRVJTSElQIiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyZwbGFjZU9mRXZlbnQ9bG9jYXRpb24iLCJ0eXBlPXJlY29yZC5yZWFkIiwidHlwZT1yZWNvcmQuZGVjbGFyZSIsInR5cGU9cmVjb3JkLmVkaXQiXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IkNPTU1VTklUWV9MRUFERVIiLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY5YWJjMTIzZGVmNDU2Nzg5MGFiY2RlZiJ9.NBE8egZeyN8mpckIKN8uNO-xLmMqbA6f8rdypLU2v93z-mpTgXFFi37h-sb2KDfLkkQkVS30paCjhCQjke1zWtPgsH4NZfit8kjNMzfY18YMqgiiuBQP2LNJAxwbKBtZJCwxAKy-oDVM46Excfp0Pgz5Tc_z-ygcZxu52uD9hExbNA9ebaLwALbhhWKKt2wwd3Beu47-k5gMbjCHCyjm-rrhgevf7X6yuDWLXAVH3zjN2V3AlDLWMhARbgI8L4hToidpLoTm9_rqDffbuF8HKgIhvD0s0TPycqSW7lqv3T2SFmVnh6G5paYvNppIz1BNjB0xRgaw5X8BsSgsEbTmJPQNG7zokBAyVMMjfwP0ftMoztT-Wr4mm9N7MLbRG1v5FFlbE36Dp-gpbjWdZkbc2tiLSGpBgFvu4rzYO1oCJS2IYacdtY6QJynIGAPumz4oanpnIGrM9coWTwsJi5xrouHtsxKVjiFIW0sSWzSMp_h7PEXmvYguLS9wpqnr-e4snPSAv9k7Y2xfrARpRIOZbXbLVuu-IUM9fvZt4Kla59SMMg4336SdVun5nZDK1B0Pm6sibYjjeUt5epE0RkOQBnbiZqdF_L_G3xlg0jWExI4dezwsGpH8_QsgdNPiyjFWAP8pS-uda4hsKCcnnGKLQynMs5fvD9xHiZ2XWXkESKg',
      provincialRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tZWRpdCIsInJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInJlY29yZC5kZWNsYXJhdGlvbi1yZWluc3RhdGUiLCJyZWNvcmQuY29uZmlybS1yZWdpc3RyYXRpb24iLCJyZWNvcmQucmVqZWN0LXJlZ2lzdHJhdGlvbiIsInBlcmZvcm1hbmNlLnJlYWQiLCJwZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJwcm9maWxlLmVsZWN0cm9uaWMtc2lnbmF0dXJlIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsIndvcmtxdWV1ZVtpZD1hbGwtZXZlbnRzfGFzc2lnbmVkLXRvLXlvdXxyZWNlbnR8cmVxdWlyZXMtY29tcGxldGlvbnxyZXF1aXJlcy11cGRhdGVzfGluLXJldmlldy1hbGx8aW4tZXh0ZXJuYWwtdmFsaWRhdGlvbnxyZWFkeS10by1wcmludHxyZWFkeS10by1pc3N1ZV0iLCJ0eXBlPXJlY29yZC5zZWFyY2gmZXZlbnQ9YmlydGgsZGVhdGgsdGVubmlzLWNsdWItbWVtYmVyc2hpcCxjaGlsZC1vbmJvYXJkaW5nLEZPT1RCQUxMX0NMVUJfTUVNQkVSU0hJUCIsInVzZXIucmVhZDpvbmx5LW15LWF1ZGl0IiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyZwbGFjZU9mRXZlbnQ9YWRtaW5pc3RyYXRpdmVBcmVhIiwidHlwZT1yZWNvcmQucmVhZCIsInR5cGU9cmVjb3JkLmRlY2xhcmUiLCJ0eXBlPXJlY29yZC5yZWplY3QiLCJ0eXBlPXJlY29yZC5hcmNoaXZlIiwidHlwZT1yZWNvcmQucmVnaXN0ZXIiLCJ0eXBlPXJlY29yZC5lZGl0IiwidHlwZT1yZWNvcmQucHJpbnQtY2VydGlmaWVkLWNvcGllcyIsInR5cGU9cmVjb3JkLmNvcnJlY3QiLCJ0eXBlPXJlY29yZC51bmFzc2lnbi1vdGhlcnMiLCJ0eXBlPXJlY29yZC5yZXZpZXctZHVwbGljYXRlcyJdLCJ1c2VyVHlwZSI6InVzZXIiLCJyb2xlIjoiUFJPVklOQ0lBTF9SRUdJU1RSQVIiLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY5ZGVmNDU2YWJjNzg5MDEyM2FiY2RlZiJ9.L8MXZMqT6JCbFawK4m22lRD1BF2pJ8EyWhjmm3Rm64tTfZaXxApjMULkSWpa3sBZETAYIesTpkhxiCprzuQv8nD7gsfjrDZD3KyUeLrMz6VnPJi_oTfgwSvbtltVe2iezZxREbOaj0Vuo52fgjqmPpdCEygVexwwE4c0eaOrEQ5bjSRh5FPhCnlPy1Yr3R7QDEZ8cWqX3Q4c1YRx8BSxJ6aINLKmdlw2xqpxSvTCO5Lp5IMOcEtWJW683QDZg46MX99YHZFNgaYMKfSCqp-5gbrbWnodA7orvHtn6mBA0k--pI-a_VR7xJCtTVDDlv4_LPdVI3xQYIb9PWrFjnMQF4eQucE0grVOaP__un4_DVD0wyHbNfcPMEUOnAYHsG6x9MnvkwVyAMZ7_aCnpE_TXjZ0afhFaysIKDunzrFEuW8Iufg0wPOzGxJnlTrjhvBxxNr96VVphJBXEetbQCYNerFiVDPbS9c7P2sd-BLfR0eZ94nzeX-F6Ed0rLhJ0uea0lXslWQpAQbGQGqbtmQrj4wRrz-BJpSc1mdVD_aVHBBYoB3iJeyqmrObpWQ2diRjAw-NMoIXnMWX26P2AYnZt_hq4YQWtQmxRhpo019_Qv6lVUhmucc1bLeIJJS5tpi-7xc7ZOwrrJfNWDsk7Fgejhcu4RkczUuGRBlInmfD1jM'
    },
    id: userIds,
    fieldAgent: (): { v2: User; v1: FetchUserQuery['getUser'] } => ({
      v2: {
        id: userIds.fieldAgent,
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
    /**
     * Gift Phiri — COMMUNITY_LEADER at Klow Village Office (village level).
     */
    communityLeader: (): { v2: User; v1: FetchUserQuery['getUser'] } => ({
      v2: {
        id: userIds.communityLeader,
        name: [{ use: 'en', given: ['Gift'], family: 'Phiri' }],
        role: TestUserRole.enum.COMMUNITY_LEADER,
        fullHonorificName: undefined,
        signature: undefined,
        avatar: undefined,
        type: TokenUserType.enum.user,
        primaryOfficeId: '1f4a5b6c-7d8e-4312-8abc-345678901234' as UUID
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
    provincialRegistrar: (): { v2: User; v1: FetchUserQuery['getUser'] } => ({
      v2: {
        id: userIds.provincialRegistrar,
        name: [{ use: 'en', given: ['Mitchel'], family: 'Owen' }],
        role: TestUserRole.enum.PROVINCIAL_REGISTRAR,
        fullHonorificName: undefined,
        signature: undefined,
        avatar: undefined,
        type: TokenUserType.enum.user,
        primaryOfficeId: '6f6186ce-cd5f-4a5f-810a-2d99e7c4ba12' as UUID
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
        SCOPES.PERFORMANCE_READ,
        SCOPES.PERFORMANCE_READ_DASHBOARDS,
        SCOPES.PROFILE_ELECTRONIC_SIGNATURE,
        SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
        'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review-all|in-external-validation|ready-to-print|ready-to-issue]',
        'type=record.search&event=birth,death,tennis-club-membership,child-onboarding,FOOTBALL_CLUB_MEMBERSHIP',
        SCOPES.USER_READ_ONLY_MY_AUDIT,
        encodeScope({
          type: 'record.create'
        }),
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
        encodeScope({
          type: 'record.declare'
        }),
        encodeScope({
          type: 'record.reject'
        }),
        encodeScope({
          type: 'record.archive'
        }),
        encodeScope({
          type: 'record.register'
        }),
        encodeScope({
          type: 'record.edit'
        }),
        encodeScope({
          type: 'record.print-certified-copies'
        }),
        encodeScope({
          type: 'record.correct'
        }),
        encodeScope({
          type: 'record.unassign-others'
        }),
        encodeScope({
          type: 'record.review-duplicates'
        }),
        'type=record.custom-action&event=tennis-club-membership&customActionTypes=Approve'
      ],
      registrationAgent: [
        SCOPES.PERFORMANCE_READ,
        SCOPES.PERFORMANCE_READ_DASHBOARDS,
        SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
        SCOPES.USER_READ_ONLY_MY_AUDIT,
        'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review|sent-for-approval|in-external-validation|ready-to-print|ready-to-issue]',
        'type=record.search&event=birth,death,tennis-club-membership,child-onboarding,FOOTBALL_CLUB_MEMBERSHIP',
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
        encodeScope({
          type: 'record.read'
        }),
        encodeScope({
          type: 'record.declare'
        }),
        encodeScope({
          type: 'record.reject'
        }),
        encodeScope({
          type: 'record.edit'
        }),
        encodeScope({
          type: 'record.archive'
        }),
        encodeScope({
          type: 'record.print-certified-copies'
        }),
        encodeScope({
          type: 'record.request-correction'
        })
      ],
      fieldAgent: [
        'workqueue[id=all-events|assigned-to-you|recent|requires-updates|sent-for-review]',
        'type=record.search&event=birth,death,tennis-club-membership,child-onboarding,FOOTBALL_CLUB_MEMBERSHIP',
        encodeScope({
          type: 'record.create'
        }),
        encodeScope({
          type: 'record.read'
        }),
        encodeScope({
          type: 'record.notify'
        }),
        encodeScope({
          type: 'record.declare'
        }),
        encodeScope({
          type: 'record.edit'
        })
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
      /**
       * COMMUNITY_LEADER: jurisdiction locked to their specific office location.
       * record.create has placeOfEvent: 'location' so the field is fully locked.
       */
      communityLeader: [
        SCOPES.SEARCH_BIRTH,
        SCOPES.SEARCH_DEATH,
        SCOPES.SEARCH_MARRIAGE,
        'workqueue[id=all-events|assigned-to-you|recent|requires-updates|sent-for-review]',
        'type=record.search&event=birth,death,tennis-club-membership,child-onboarding,FOOTBALL_CLUB_MEMBERSHIP',
        encodeScope({
          type: 'record.create',
          options: {
            event: [
              'birth',
              'death',
              'tennis-club-membership',
              'child-onboarding'
            ],
            placeOfEvent: JurisdictionFilter.enum.location
          }
        }),
        encodeScope({
          type: 'record.read'
        }),
        encodeScope({
          type: 'record.declare'
        }),
        encodeScope({
          type: 'record.edit'
        })
      ],
      /**
       * PROVINCIAL_REGISTRAR: jurisdiction locked to their administrative area (province).
       * record.create has placeOfEvent: 'administrativeArea' so province is locked but districts are selectable.
       */
      provincialRegistrar: [
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
        'type=record.search&event=birth,death,tennis-club-membership,child-onboarding,FOOTBALL_CLUB_MEMBERSHIP',
        SCOPES.USER_READ_ONLY_MY_AUDIT,
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
        encodeScope({
          type: 'record.read'
        }),
        encodeScope({
          type: 'record.declare'
        }),

        encodeScope({
          type: 'record.reject'
        }),
        encodeScope({
          type: 'record.archive'
        }),
        encodeScope({
          type: 'record.register'
        }),
        encodeScope({
          type: 'record.edit'
        }),
        encodeScope({
          type: 'record.print-certified-copies'
        }),
        encodeScope({
          type: 'record.correct'
        }),
        encodeScope({
          type: 'record.unassign-others'
        }),
        encodeScope({
          type: 'record.review-duplicates'
        })
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
