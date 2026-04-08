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
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSIsInR5cGU9cmVjb3JkLnNlYXJjaCIsInR5cGU9cmVjb3JkLmNyZWF0ZSIsInR5cGU9cmVjb3JkLnJlYWQiLCJ0eXBlPXJlY29yZC5ub3RpZnkiLCJ0eXBlPXJlY29yZC5kZWNsYXJlIiwidHlwZT1yZWNvcmQuZWRpdCJdLCJ1c2VyVHlwZSI6InVzZXIiLCJyb2xlIjoiRklFTERfQUdFTlQiLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY3ZWY3ZjgzZDZhOWNiOTJlOWVkYWE5OSJ9.BMRNFHy1UgKn9KS4_XcEeKhAZPK32F-075t4Pg_kgp9jjixOchNJwWenWslLoH4uyF5lAGyU6L4HmlrvmY3v4K44-SpfEUkVaw7d7As874XaxLTDcozBmr8bDV5SaZAbeo0um-UHBWCSeVpmhsc4yasrBoSqq2RpuKTasYylA_K8yFtlTFvwneeaONwsh7OYvP2pV286O85fY_D-mRcFyWiO2T7dlRRRdmwj3uG1mpS4aqAZhFESwzrj_GJBAJx5gziGOGuPvKyiBe6ZKULTq4PtT37NHXF4vq40SA8nYtBL3igRhrS9bgWsy5apnCWJpI7NcqvA56YloFEAN2Uh4tCTNYVPrrt52VXlIFaFHbkpg4xgJqa-0G3WcyO12AeWxBraCbbZVRw-reZscneoZ9IE-BGwJiGWOmjDCcBjo_jzOwG7XGzakUfJ8rM3m4NTJWG8otBv26Mn4forVHFyWh9ULaAoHog-PDpnHLOKsXdnr35cyLx6N2xxxctyMPNpLu5QaPjWjLvO0rA3Csy2B_sC2me7jL16wDyfK-QrFPE__8uSsl89onOl50PyBb7crzrPb6Jk-xJ_xKRmRG-YSIVS7ADXPr9GzgxJQwbtO9nG-fjHwzKD3vuW9816EKAEg6nfIa-oVlGPfAvUUTtrR7hFAKWXEc5H8VwZPHPfr3k',
      localRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwicHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsIm9yZ2FuaXNhdGlvbi5yZWFkLWxvY2F0aW9uczpteS1vZmZpY2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLWNvbXBsZXRpb258cmVxdWlyZXMtdXBkYXRlc3xpbi1yZXZpZXctYWxsfGluLWV4dGVybmFsLXZhbGlkYXRpb258cmVhZHktdG8tcHJpbnR8cmVhZHktdG8taXNzdWVdIiwidXNlci5yZWFkOm9ubHktbXktYXVkaXQiLCJ0eXBlPXJlY29yZC5zZWFyY2giLCJ0eXBlPXJlY29yZC5jcmVhdGUiLCJ0eXBlPXJlY29yZC5yZWFkJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyxsaWJyYXJ5LW1lbWJlcnNoaXAiLCJ0eXBlPXJlY29yZC5kZWNsYXJlIiwidHlwZT1yZWNvcmQucmVqZWN0IiwidHlwZT1yZWNvcmQuYXJjaGl2ZSIsInR5cGU9cmVjb3JkLnJlZ2lzdGVyIiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLnByaW50LWNlcnRpZmllZC1jb3BpZXMiLCJ0eXBlPXJlY29yZC5jb3JyZWN0IiwidHlwZT1yZWNvcmQudW5hc3NpZ24tb3RoZXJzIiwidHlwZT1yZWNvcmQucmV2aWV3LWR1cGxpY2F0ZXMiLCJ0eXBlPXJlY29yZC5jdXN0b20tYWN0aW9uJmV2ZW50PXRlbm5pcy1jbHViLW1lbWJlcnNoaXAmY3VzdG9tQWN0aW9uVHlwZXM9QXBwcm92ZSJdLCJ1c2VyVHlwZSI6InVzZXIiLCJyb2xlIjoiTE9DQUxfUkVHSVNUUkFSIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2ODIxYzE3NWRjZTRkNzg4NmQ0ZTgyMTAifQ.J3u-ELQE66OT_A-jQnAGFxTtb-5lSHJOice7okz6DvUZig9fhhw5aqJa68F4GF30GW3nyU35VwOIBjPozyVrMU_Fq_BhP__hdEB4UQV-BiTFJ1beF_ohCcv4Ukp-3Z2eE4FLSsw2CEX9wOEP2tV-IsNK0jqsHgNKQgGhF34UupEFri7hPhrwfM6JiDVb4UOgSZrJGYrj2JfEfAWaGqHd4tYw_K8XNF3siMylvvqzgOubfnuHRgIMATYJ3HbzDJMntTbGoP9-aV7_O32D9TZHOixF-dzQReHpF41OiPK1ue-svVsGC3zcdNnhE-gJ84rmVVal_xahEVxz62nolyAPJU8F46JlyVM72JtT93vnT3gJDZYBT2jpgpZFofyS-6WcvW6QLLPk8YL3py0nwcCq5HV2DCqv7ySnlOSY_2q7HwiJ-p0bNRMlA7Q6cMqoJhFA8YZonXmcoLeeTqx_n2fF0NzH1GRg71DUR5N_jvBFKt6LrHojDGiyfSehsBlrcJXqYCAYj1wGHN6XOM9P445T5VQCdNzcq1Uz7nyMrV_ZjJtTdXp6lEEtsQQbR8Q9g_x_vzlfHWZbEhd2gasrFMf-eL_3Yq9_ae7-YeAZRyGOEQgKEi9D_f2pjvajQ9h0jJZir9PngQUd8EMWRjJSImpYu1FgObj9LTxrtDcszD8zbi0',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInVzZXIucmVhZDpvbmx5LW15LWF1ZGl0Iiwid29ya3F1ZXVlW2lkPWFsbC1ldmVudHN8YXNzaWduZWQtdG8teW91fHJlY2VudHxyZXF1aXJlcy1jb21wbGV0aW9ufHJlcXVpcmVzLXVwZGF0ZXN8aW4tcmV2aWV3fHNlbnQtZm9yLWFwcHJvdmFsfGluLWV4dGVybmFsLXZhbGlkYXRpb258cmVhZHktdG8tcHJpbnR8cmVhZHktdG8taXNzdWVdIiwidHlwZT1yZWNvcmQuc2VhcmNoIiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyIsInR5cGU9cmVjb3JkLnJlYWQiLCJ0eXBlPXJlY29yZC5kZWNsYXJlIiwidHlwZT1yZWNvcmQucmVqZWN0IiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLmFyY2hpdmUiLCJ0eXBlPXJlY29yZC5wcmludC1jZXJ0aWZpZWQtY29waWVzIiwidHlwZT1yZWNvcmQucmVxdWVzdC1jb3JyZWN0aW9uIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJSRUdJU1RSQVRJT05fQUdFTlQiLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY3ZWY3ZjgzZDZhOWNiOTJlOWVkYWFhMSJ9.a8K-PeY69dpmSEpKLdHmvSHv_2nYiJeiHln-EfH6eA0NxQVUbe6uiGIAV3jq3B89-IGWumuBC4Ufmw9cz4-MGPfZMM7YjPp_PtguELdrX_0V7CNZhVMPLvbOFEImXvBc78AAEbUZpBw1yjt61JF6gcStRAiW_ibcUuNgpm7VNak7BCCODoRoiPDDUbyPs60oE-0Xd72ONJ0i3SMk-KdQo4Ih2dvURh886E36Uwcje9Ht2rDReaM5p_Zrco0HlRRkJkJ4nYPtWojwloSEeetkE4Y5FjcinlAk75SZw_bkcM1butZWLlB7s3I-VipvS4K1cicDXIkagEXegJVFfnWRuh0O4IEd6W7gSmrbe3uhT3bMMRiMD7UNBE35QHyco3xGV30fN8iWwaCAv8UD7vsK1dXfM3tiC3G0hJWvJlE4gHJbeEaARpan-JkCSxEHFBIKtQyhGXAt1GgsnYEaBxYzr9iVr20SxShzBdXd_vJI-DcsacLYRZkYxtf-PdRjJ6b3TmCqCNo9XpTyiNi0eoUvOA_Gti6-r_7_dh-ayA124b3r07ZuC10EZwhC_wML3DdztQ8qmQN9IvuAC3rEGcuTNI2wChRdrYLQH5rRuGOZmtATdV4HhWFob_F4cBVjfY9oRRqdS9bfNlj0aARDV4122FU93BWi_F4TIOTLGflRRhs',
      localSystemAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ1c2VyLnJlYWQ6bXktb2ZmaWNlIiwidXNlci5yZWFkOm15LWp1cmlzZGljdGlvbiIsInVzZXIudXBkYXRlOm15LWp1cmlzZGljdGlvbiIsIm9yZ2FuaXNhdGlvbi5yZWFkLWxvY2F0aW9uczpteS1qdXJpc2RpY3Rpb24iLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwicGVyZm9ybWFuY2Uudml0YWwtc3RhdGlzdGljcy1leHBvcnQiLCJvcmdhbmlzYXRpb24ucmVhZC1sb2NhdGlvbnM6bXktb2ZmaWNlIiwidXNlci5jcmVhdGVbcm9sZT1GSUVMRF9BR0VOVHxQT0xJQ0VfT0ZGSUNFUnxTT0NJQUxfV09SS0VSfEhFQUxUSENBUkVfV09SS0VSfExPQ0FMX0xFQURFUnxSRUdJU1RSQVRJT05fQUdFTlR8TE9DQUxfUkVHSVNUUkFSXSIsInVzZXIuZWRpdFtyb2xlPUZJRUxEX0FHRU5UfFBPTElDRV9PRkZJQ0VSfFNPQ0lBTF9XT1JLRVJ8SEVBTFRIQ0FSRV9XT1JLRVJ8TE9DQUxfTEVBREVSfFJFR0lTVFJBVElPTl9BR0VOVHxMT0NBTF9SRUdJU1RSQVJdIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJMT0NBTF9TWVNURU1fQURNSU4iLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY4Y2JkMjZmYzY0NzYxNTY1NDY5NTkxZCJ9.O-wogl0fSIAJJ1wd1o8fqo-NfucnEKr1dKbYgSdhnCljZk-0K0bYIQOpz6TqKOinAxFhRcy2hRpf2MS7Q-mBlW43pF_Rzcm7piz3Q14V8ZKgeY7XEdvtcbPvf004PnSd7gGqLLwmYM7WX4X9ok1_d5AS2p70z7oYb0XsrrJ1cE_hv5teNWZyjnUn3JIN2o4BBZYSCQ0IlNwC5uCL1givHiHGq3j6rmses-4QAhCPHXPLjWSoa272OEzQdIqEgZj4sZcNeAxMgFfU0BxUR5huviaXP-e7iPk_zbogCKFHG6wmr__FUTGL0QR4sOBXy52Rf1bExdu44CNXmagSofwsvkUYD5QPfxTtp6nJ3VXNUrhz_Ga66fV_m8EMcd_Hpqytfb1lo_5kkhuQRwgfiBRXcXXCEDkeYWPLnZtsrnSHmIl-LHHKpNEiIGP4phAo9uwM6cGEGAt9ewFTyHWvJ22PETyBocIXiGh0kCjZKI9tpV8QcGDKt7y4b_CQHI0Zd-A7ST3xZUsztavF_zH77DnU-vweEBp-EhEQ1zRwtEr3neWXeKbZBQz0gqbeq6zGl87S1ZflPTMOdbkYd7NlR0NiGy4CCysBlLxeo9Dgv_4uXXJcFgJOvGD5RDhKo-CA4Fcq64D_YXjhWmuC-5-pmxf5TpAb323upY4NqWlZ3cxh_6Y',
      nationalSystemAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJjb25maWcudXBkYXRlOmFsbCIsIm9yZ2FuaXNhdGlvbi5yZWFkLWxvY2F0aW9uczphbGwiLCJ1c2VyLmNyZWF0ZTphbGwiLCJ1c2VyLnVwZGF0ZTphbGwiLCJ1c2VyLnJlYWQ6YWxsIiwicGVyZm9ybWFuY2UucmVhZCIsInBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInBlcmZvcm1hbmNlLnZpdGFsLXN0YXRpc3RpY3MtZXhwb3J0IiwicmVjb3JkLnJlaW5kZXgiLCJ1c2VyLmNyZWF0ZVtyb2xlPUZJRUxEX0FHRU5UfEhPU1BJVEFMX0NMRVJLfENPTU1VTklUWV9MRUFERVJ8UkVHSVNUUkFUSU9OX0FHRU5UfExPQ0FMX1JFR0lTVFJBUnxOQVRJT05BTF9SRUdJU1RSQVJ8TE9DQUxfU1lTVEVNX0FETUlOfE5BVElPTkFMX1NZU1RFTV9BRE1JTnxQRVJGT1JNQU5DRV9NQU5BR0VSXSIsInVzZXIuZWRpdFtyb2xlPUZJRUxEX0FHRU5UfEhPU1BJVEFMX0NMRVJLfENPTU1VTklUWV9MRUFERVJ8UkVHSVNUUkFUSU9OX0FHRU5UfExPQ0FMX1JFR0lTVFJBUnxOQVRJT05BTF9SRUdJU1RSQVJ8TE9DQUxfU1lTVEVNX0FETUlOfE5BVElPTkFMX1NZU1RFTV9BRE1JTnxQRVJGT1JNQU5DRV9NQU5BR0VSXSJdLCJ1c2VyVHlwZSI6InVzZXIiLCJyb2xlIjoiTkFUSU9OQUxfU1lTVEVNX0FETUlOIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2OGRmOTUyOWY4ZjNhNzMwMDdhNDQyN2MifQ.WGLo5JF0PlPhZoYFhn8lg1dt-iaDSUQFGUDolQsQHwuY_AEZpFIKjaKL-GYJMLpuHPahk8wK7OTjQJZ54lH5EUvL8jqRfIMvQTRK6IHi_jvMHJQbXIvS434za-rY99_vsBnWIhTvqawIbKkOG89FBwdF6OVI5SxNV39ltjPChrN4-Ke-8QjZjJyUfxLanh4NMfsd3ohnpH5q3QtJMfDTl8iJ7-cJ3lwpI29gVtiXyULfbCWGXMPjwutCKNyNGA-hIMzvFHsFFw23EzdwnIqLBNzjMwFjeB3RwWBPexC6dctKuHY8ooRL-oWSxran0rOUwNr3Y0VKIl5C1EoMkBkkwHgy7awLPYstZGP6aC-B4pdQp9t5dx8omB6OozG0WD2oJJx7uH8pbghTsLdnQr1STF0gpL4qGWIE5RQ-eFCVQAQlXDPrVCDBEkK5ip8_OEag7uoPdJEybmTUVitMpTcYEdXQzJ2GFIkShXH4nkHeF60JHyviPFM2ClWD_DLLCr1v6fWLSFgMjfakK_YtOzLRSIAnwcGRk1RwR_H9-YSI-fVxM39suMZ78o5iXQiifuFjZWLF9FBwwVDuM0XAf7gD_zGx9uHSOw2I88CUtZpmPfvsesUW7TmHWX_VkSztH1XQt9BkUrPZvS6sarFZeswYQiT7EgZ5KqMcsXhlk9tVQo8',
      communityLeader:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSIsInR5cGU9cmVjb3JkLnNlYXJjaCIsInR5cGU9cmVjb3JkLmNyZWF0ZSZldmVudD1iaXJ0aCxkZWF0aCx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGNoaWxkLW9uYm9hcmRpbmcmcGxhY2VPZkV2ZW50PWxvY2F0aW9uIiwidHlwZT1yZWNvcmQucmVhZCIsInR5cGU9cmVjb3JkLmRlY2xhcmUiLCJ0eXBlPXJlY29yZC5lZGl0Il0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJDT01NVU5JVFlfTEVBREVSIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2OWFiYzEyM2RlZjQ1Njc4OTBhYmNkZWYifQ.MZYTYpg7hqo9XTvpf4A8CFD5JOqOSbskg924xjDpDqDsXTPV1oscKoDbzzsGXSz7krslAXq0EDVt826dvAH7X3_mpMEApC6Ksb0aRX3z7CyCFrp5viF5hmzoMlArZX8BTKwj9CSNuHoVFLRSMIm9muIsh98I8gO10xhG4Ny6PLmZbIlvNPZLJUXiP-QLlnBR67zvVsVtpgav8VlBLfZujQvvw8m4ZlDyV2SDmVd9rTd9KTIgDlDLWJyGdSPwOCnu8M220Q-lWmBbWeRevhNMY08RCODBsX3K1hToLRvjseVh9VeDnTMa18IIiOOcNDzRGUdLzCEtQrw-8yMp7UgKqZfoolZ0VNk9OZREpr3B7LTFGMntrGneY_rrZmMd38JTACvVHwVf4pF9n9L9g-Lyy0xjNdL5XBXkNnCWlWvLA4KWKOLpmX47EmLsFA5sVSWP6zTOuzeCzrxPB_v3Okb8bVGgFg7cVbatqvbyo5wqHUhLia3L_rwfNGJJ6a5a7ZPKaS4Hskaj55M2IfexZsGWtTnbCDHDxFEAPEUflPfkscXeXBPuUoAQlNI6Cggv7qVsMydoM04dyBmZIIxB1kep7lTdda3XTfS-1TGgodUTK_49WmyBTLDuuLfEWH5HbBKqnN4BRnAMzDxoIiIfkLrKDVz-jYtfTace_d73j_H44I8',
      provincialRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwicHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsIm9yZ2FuaXNhdGlvbi5yZWFkLWxvY2F0aW9uczpteS1vZmZpY2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLWNvbXBsZXRpb258cmVxdWlyZXMtdXBkYXRlc3xpbi1yZXZpZXctYWxsfGluLWV4dGVybmFsLXZhbGlkYXRpb258cmVhZHktdG8tcHJpbnR8cmVhZHktdG8taXNzdWVdIiwidXNlci5yZWFkOm9ubHktbXktYXVkaXQiLCJ0eXBlPXJlY29yZC5zZWFyY2giLCJ0eXBlPXJlY29yZC5jcmVhdGUmZXZlbnQ9YmlydGgsZGVhdGgsdGVubmlzLWNsdWItbWVtYmVyc2hpcCxjaGlsZC1vbmJvYXJkaW5nJnBsYWNlT2ZFdmVudD1hZG1pbmlzdHJhdGl2ZUFyZWEiLCJ0eXBlPXJlY29yZC5yZWFkIiwidHlwZT1yZWNvcmQuZGVjbGFyZSIsInR5cGU9cmVjb3JkLnJlamVjdCIsInR5cGU9cmVjb3JkLmFyY2hpdmUiLCJ0eXBlPXJlY29yZC5yZWdpc3RlciIsInR5cGU9cmVjb3JkLmVkaXQiLCJ0eXBlPXJlY29yZC5wcmludC1jZXJ0aWZpZWQtY29waWVzIiwidHlwZT1yZWNvcmQuY29ycmVjdCIsInR5cGU9cmVjb3JkLnVuYXNzaWduLW90aGVycyIsInR5cGU9cmVjb3JkLnJldmlldy1kdXBsaWNhdGVzIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJQUk9WSU5DSUFMX1JFR0lTVFJBUiIsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjlkZWY0NTZhYmM3ODkwMTIzYWJjZGVmIn0.iD1zypnIVWaazBQAE_zs1wJhjJfFV2KDBmaG0Kkf4rj_st7N7KM0BRBKzL-19oh2ZCNPNKnRvAXtWkWUpuaWhS8hGmEZrtvKCHdgQa4vgaHHOkhf-LxxvbN8lecw_CxBIxcEhvx-UEzMt7fO8uo83szt6gl7IjCP8BH5TxK5N_LNbsAm4QBUtxjC8FJd5cMGc3neV7vixyce3YEP7jcb75ZQwzfFkj24rUWJodun6iBujvJ_VSYYNagYBDCTd8KIM_1jMDAQrR8-ouRYYBm_9ZjyUuOR5LRbI--BSFSCGNP7jC_sT77ZAtBg8DUSFrOROrPT3cg1D_PpdZN0TCVMZ5AU_nyJWaRO6N8y6W-SNJd93hkWT7wSTV3lRWFsmxAHBY_h2E-U73xyupMFR9RRXxYUYA6QY1ENQmSY7Ok5A6oUc8lR71l2F-VQKPyW8Ct3LgVt13qvSsdazeG76j0B_azRbczkIf3nk_dhwJBi4Kc4uWjRs9Q_OB3__2alTT4_wgfpWZVNtcoUmYdU49DiMEWAZmunUxruJK9Py6YU0lpQ7VhlymIOs4oJmWnRN7adD0lC3BrlOg7Ykoajw4TRKLJZp3SYWN8cv3MtfwwQsMwW0qru9lJ9XtSqtKY9aow8U161d4sLqvNk0ONDllEIWFgUukU6NpZ0IawVwOPMlHc'
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
        status: Status.Active,
        type: TokenUserType.enum.user,
        mobile: '+260911111111',
        email: 'kalushabwalya17@gmail.com',
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
        status: 'active',
        primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID,
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
    localRegistrar: (): { v2: User; v1: FetchUserQuery['getUser'] } => ({
      v2: {
        id: user.id.localRegistrar,
        name: [{ use: 'en', given: ['Kennedy'], family: 'Mweene' }],
        role: TestUserRole.enum.LOCAL_REGISTRAR,
        fullHonorificName: '1st Order Honorable Kennedy Mweene',
        primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID,
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
    communityLeader: (): { v2: User; v1: FetchUserQuery['getUser'] } => ({
      v2: {
        id: userIds.communityLeader,
        name: [{ use: 'en', given: ['Gift'], family: 'Phiri' }],
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
    provincialRegistrar: (): { v2: User; v1: FetchUserQuery['getUser'] } => ({
      v2: {
        id: userIds.provincialRegistrar,
        name: [{ use: 'en', given: ['Mitchel'], family: 'Owen' }],
        role: TestUserRole.enum.PROVINCIAL_REGISTRAR,
        fullHonorificName: undefined,
        signature: undefined,
        avatar: undefined,
        type: TokenUserType.enum.user,
        primaryOfficeId: '6f6186ce-cd5f-4a5f-810a-2d99e7c4ba12' as UUID,
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
    localSystemAdmin: (): { v2: User; v1: FetchUserQuery['getUser'] } => ({
      v1: {
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
      } satisfies FetchUserQuery['getUser'],
      v2: {
        id: userIds.localSystemAdmin,
        name: [
          {
            use: 'en',
            given: ['Alex'],
            family: 'Ngonga'
          }
        ],
        role: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
        status: Status.Active,
        mobile: '+260978787878',
        email: 'kalushab.walya17@gmail.com',
        primaryOfficeId: 'f403ca64-6a1d-4882-94c1-d8674df59a85' as UUID,
        type: TokenUserType.enum.user
      }
    }),
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
       * except for workque scope that has an extra workqueue: all-events
       */
      localRegistrar: [
        encodeScope({ type: 'performance.read' }),
        encodeScope({ type: 'performance.read-dashboards' }),
        encodeScope({ type: 'profile.electronic-signature' }),
        SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
        'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review-all|in-external-validation|ready-to-print|ready-to-issue]',
        SCOPES.USER_READ_ONLY_MY_AUDIT,
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
        SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
        SCOPES.USER_READ_ONLY_MY_AUDIT,
        'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review|sent-for-approval|in-external-validation|ready-to-print|ready-to-issue]',
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
        'workqueue[id=all-events|assigned-to-you|recent|requires-updates|sent-for-review]',
        encodeScope({ type: 'record.search' }),
        encodeScope({ type: 'record.create' }),
        encodeScope({ type: 'record.read' }),
        encodeScope({ type: 'record.notify' }),
        encodeScope({ type: 'record.declare' }),
        encodeScope({ type: 'record.edit' })
      ],
      localSystemAdmin: [
        SCOPES.USER_READ_MY_OFFICE,
        SCOPES.USER_READ_MY_JURISDICTION,
        SCOPES.USER_UPDATE_MY_JURISDICTION,
        SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION,
        encodeScope({ type: 'performance.read' }),
        encodeScope({ type: 'performance.read-dashboards' }),
        encodeScope({ type: 'performance.vital-statistics-export' }),
        SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
        'user.create[role=FIELD_AGENT|POLICE_OFFICER|SOCIAL_WORKER|HEALTHCARE_WORKER|LOCAL_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR]',
        'user.edit[role=FIELD_AGENT|POLICE_OFFICER|SOCIAL_WORKER|HEALTHCARE_WORKER|LOCAL_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR]'
      ],
      /**
       * COMMUNITY_LEADER: jurisdiction locked to their specific office location.
       * record.create has placeOfEvent: 'location' so the field is fully locked.
       */
      communityLeader: [
        'workqueue[id=all-events|assigned-to-you|recent|requires-updates|sent-for-review]',
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
            placeOfEvent: JurisdictionFilter.enum.location
          }
        }),
        encodeScope({ type: 'record.read' }),
        encodeScope({ type: 'record.declare' }),
        encodeScope({ type: 'record.edit' })
      ],
      /**
       * PROVINCIAL_REGISTRAR: jurisdiction locked to their administrative area (province).
       * record.create has placeOfEvent: 'administrativeArea' so province is locked but districts are selectable.
       */
      provincialRegistrar: [
        encodeScope({ type: 'performance.read' }),
        encodeScope({ type: 'performance.read-dashboards' }),
        encodeScope({ type: 'profile.electronic-signature' }),
        SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
        'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review-all|in-external-validation|ready-to-print|ready-to-issue]',
        SCOPES.USER_READ_ONLY_MY_AUDIT,
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
        encodeScope({ type: 'user.create' }),
        encodeScope({ type: 'user.update' }),
        encodeScope({ type: 'user.read' }),
        encodeScope({ type: 'performance.read' }),
        encodeScope({ type: 'performance.read-dashboards' }),
        encodeScope({ type: 'performance.vital-statistics-export' }),
        encodeScope({ type: 'record.reindex' }),
        'user.create[role=FIELD_AGENT|HOSPITAL_CLERK|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|NATIONAL_REGISTRAR|LOCAL_SYSTEM_ADMIN|NATIONAL_SYSTEM_ADMIN|PERFORMANCE_MANAGER]',
        'user.edit[role=FIELD_AGENT|HOSPITAL_CLERK|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|NATIONAL_REGISTRAR|LOCAL_SYSTEM_ADMIN|NATIONAL_SYSTEM_ADMIN|PERFORMANCE_MANAGER]'
      ]
    }
  }

  return { event: eventPayloadGenerator(prng), user }
}
