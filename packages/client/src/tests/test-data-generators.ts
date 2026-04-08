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
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9cHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsInR5cGU9b3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zJmFjY2Vzc0xldmVsPWxvY2F0aW9uIiwid29ya3F1ZXVlW2lkPWFsbC1ldmVudHN8YXNzaWduZWQtdG8teW91fHJlY2VudHxyZXF1aXJlcy1jb21wbGV0aW9ufHJlcXVpcmVzLXVwZGF0ZXN8aW4tcmV2aWV3LWFsbHxpbi1leHRlcm5hbC12YWxpZGF0aW9ufHJlYWR5LXRvLXByaW50fHJlYWR5LXRvLWlzc3VlXSIsInR5cGU9dXNlci5yZWFkLW9ubHktbXktYXVkaXQiLCJ0eXBlPXJlY29yZC5zZWFyY2giLCJ0eXBlPXJlY29yZC5jcmVhdGUiLCJ0eXBlPXJlY29yZC5yZWFkJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyxsaWJyYXJ5LW1lbWJlcnNoaXAiLCJ0eXBlPXJlY29yZC5kZWNsYXJlIiwidHlwZT1yZWNvcmQucmVqZWN0IiwidHlwZT1yZWNvcmQuYXJjaGl2ZSIsInR5cGU9cmVjb3JkLnJlZ2lzdGVyIiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLnByaW50LWNlcnRpZmllZC1jb3BpZXMiLCJ0eXBlPXJlY29yZC5jb3JyZWN0IiwidHlwZT1yZWNvcmQudW5hc3NpZ24tb3RoZXJzIiwidHlwZT1yZWNvcmQucmV2aWV3LWR1cGxpY2F0ZXMiLCJ0eXBlPXJlY29yZC5jdXN0b20tYWN0aW9uJmV2ZW50PXRlbm5pcy1jbHViLW1lbWJlcnNoaXAmY3VzdG9tQWN0aW9uVHlwZXM9QXBwcm92ZSJdLCJ1c2VyVHlwZSI6InVzZXIiLCJyb2xlIjoiTE9DQUxfUkVHSVNUUkFSIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2ODIxYzE3NWRjZTRkNzg4NmQ0ZTgyMTAifQ.gjjZIaRWa4I2XxxX3euiTarqd2tBsDPXC7j29y1MCcV-q--rgrhpryK3wVwOS5naGeMByOjms27kOC6Xmi6pylM7O4l0PFbfP11m8O2HwWNhIom5szbJfRhyflt2G3drD3ijmWTrGGwCy69b_NnH4wF9VIiYwdpVSfRAnaVZXoMLZLlzA5BatKlkCsHEIlwMe8kxpTwEmbBOPcQKZJZWYdi02UqwOcEwplywJ5ZvfA_xlBkGWp5nm3mE_dv0La_0wv-19bfmMrHdMnWL7j920VcMNJ5GRrXjM2iIJrGkzPgCC4z50-yFRuk5x7jUGe6YUvhNW9n1QHaKjVUD2ZDCALNTU0LFh4qYsrJQ9pYxUNNYc2y_AuQczxVp7IUJGoNCFD_YxgeEK2SQzHn4Bv25M7bb83UuMMWfTU3Ex0gjm6IkClBdaDSaGkAJJeHDRigypNKfd6k5RdjDpMuviNQ-lmbP-ulVI6oyiEjlUlNDVC9zie90lrEynm_rqiBnx_yYXY3lhbi5kIIe4kLlB6RxTHlddaUOUVoGEoESxiQcQFCzxjF_CkuJDYlHG3PwLdCDbM4QYyLRhXdOV3w5ZSzUW9Uk-HpbDBILidKXhND8wi9Hnv5M1kj2ZxU-uFtL6LtvSBU4DIOfQXY9a59cyv4qfeJp3V4B8onG0rZPtoa2OOk',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9b3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zJmFjY2Vzc0xldmVsPWxvY2F0aW9uIiwidHlwZT11c2VyLnJlYWQtb25seS1teS1hdWRpdCIsIndvcmtxdWV1ZVtpZD1hbGwtZXZlbnRzfGFzc2lnbmVkLXRvLXlvdXxyZWNlbnR8cmVxdWlyZXMtY29tcGxldGlvbnxyZXF1aXJlcy11cGRhdGVzfGluLXJldmlld3xzZW50LWZvci1hcHByb3ZhbHxpbi1leHRlcm5hbC12YWxpZGF0aW9ufHJlYWR5LXRvLXByaW50fHJlYWR5LXRvLWlzc3VlXSIsInR5cGU9cmVjb3JkLnNlYXJjaCIsInR5cGU9cmVjb3JkLmNyZWF0ZSZldmVudD1iaXJ0aCxkZWF0aCx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGNoaWxkLW9uYm9hcmRpbmciLCJ0eXBlPXJlY29yZC5yZWFkIiwidHlwZT1yZWNvcmQuZGVjbGFyZSIsInR5cGU9cmVjb3JkLnJlamVjdCIsInR5cGU9cmVjb3JkLmVkaXQiLCJ0eXBlPXJlY29yZC5hcmNoaXZlIiwidHlwZT1yZWNvcmQucHJpbnQtY2VydGlmaWVkLWNvcGllcyIsInR5cGU9cmVjb3JkLnJlcXVlc3QtY29ycmVjdGlvbiJdLCJ1c2VyVHlwZSI6InVzZXIiLCJyb2xlIjoiUkVHSVNUUkFUSU9OX0FHRU5UIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2N2VmN2Y4M2Q2YTljYjkyZTllZGFhYTEifQ.NR8nnF2-V8GpimUa6iIFZX-kpxCpiMduw50Tz5qCQfzrF1d50Vd6H9W6zoBvrU0M2AqnRpiBVolEJ4mRUli-rDMqUC3tXFxFxnZ365D_PMiuuLGrz9ptv6hVxuQ9yxSq0pED4XKdwx7i0OetNqliMBuSga483VSr8vgdOIHtjY84SKPSQ55HIwAfqcoRY5Px_TNjGTxAeQ82SZZJAd8b5SpRfxYOHfyXs_9MVE9maz8N4LhqtHJ7Lr2bRxwXSPl6Uab33Oe55OAnvY6XLRW_NzTgLG1yial22MuvZZRiFfvsurcFAi2uECPUt-BkxZvFEDCQWwqEWvTNWVqasL3KAeKIf8lODAIvqsMaKFk4FxIUhxOZfJyrcJkJtOKYBPDKKt-xQCTX_-nSxvTFxH26zHphVPupyryhL56EL1FkDk2eWoXfvP-8rxKSjyGaMQR6E7eUOKCIEEzllSujqw68DblIJO583xyS4Xr8uDz7-yT3G5Q6dSi5O-8FzArrvSmWNBzAeoEc_EqEQU5n6gMWSH8589X2k_Ihe4PvAhO3SsI6h5T6ZSSjrwSJh6L7FrRWftYjHm3-XAoiDfIoHyMRFBIY_-5GbDRtQCipb8CjHGZm107JcamGz_jevATso3qPH4yiXRUxWdFSM9y-kZSqdIoIXn1Q1PJs-ARBtrSvO-o',
      localSystemAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXVzZXIucmVhZCZhY2Nlc3NMZXZlbD1hZG1pbmlzdHJhdGl2ZUFyZWEiLCJ0eXBlPXVzZXIudXBkYXRlJmFjY2Vzc0xldmVsPWFkbWluaXN0cmF0aXZlQXJlYSIsInR5cGU9b3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zJmFjY2Vzc0xldmVsPWFkbWluaXN0cmF0aXZlQXJlYSIsInR5cGU9cGVyZm9ybWFuY2UucmVhZCIsInR5cGU9cGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwidHlwZT1wZXJmb3JtYW5jZS52aXRhbC1zdGF0aXN0aWNzLWV4cG9ydCIsInVzZXIuY3JlYXRlW3JvbGU9RklFTERfQUdFTlR8UE9MSUNFX09GRklDRVJ8U09DSUFMX1dPUktFUnxIRUFMVEhDQVJFX1dPUktFUnxMT0NBTF9MRUFERVJ8UkVHSVNUUkFUSU9OX0FHRU5UfExPQ0FMX1JFR0lTVFJBUl0iLCJ1c2VyLmVkaXRbcm9sZT1GSUVMRF9BR0VOVHxQT0xJQ0VfT0ZGSUNFUnxTT0NJQUxfV09SS0VSfEhFQUxUSENBUkVfV09SS0VSfExPQ0FMX0xFQURFUnxSRUdJU1RSQVRJT05fQUdFTlR8TE9DQUxfUkVHSVNUUkFSXSJdLCJ1c2VyVHlwZSI6InVzZXIiLCJyb2xlIjoiTE9DQUxfU1lTVEVNX0FETUlOIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2OGNiZDI2ZmM2NDc2MTU2NTQ2OTU5MWQifQ.JTYWTvqcLOAX6DbikauDpV_17tbzR8MpzfQeLm6dZBm7r8ONxXE2-AMqaO8GGW969eqDDXLmffJYVtPKcLbGT3u7ecW23maontVtbLmAXdy6GsKFXMhsMzsT3bE53-IgxzXyY0ynGgtvFZMu3vS3rK57SWEkEzVfe9_3WDoCDVI1QLZwd8n_pLUKwJHC8jqG1XiFFk0zMvY22a_a82dYkv_K-xwcn6JOom53K5OFSnR7aku79djWF9SP9oJiIcOh-KacJhPVrpcgESWEr1umxkA3gwOO-sPmuTwdTvjxqgdQvsMf6shL2mRFadWNuAWDzwpBEq9WeW8dUksCMw7l3iHFCR8INbg5LH94JXDMN3qfW-IRRZ79KUJQfPUeSxJ_H750HA5v6Vv8lkG1PaRgWy7Z7ne6Is_PMojjewIF6z0AHgCAkUOVVMj8NMwVoLNi_XiUPSiBBJKwaW2KQkeAANbKYbds4ODW3oppfIFKKD_N2sP3Tfe36pfgMc-A9gB7rdgL_9zwHePYpt1a4V54rwgW7e9KKRqQSUw4GDeslso-6a6sIffExinlKDxFDGIiHZA0UxM57MuD_oT_cVk-pkMb-eMMXkDXlL3DNF6oKLumC7-__eFKBcEYI1r4lO4eEN5ZH-JR8BfzgyHp2kZkpCWnNbcxs7mP_1ekOuYE-QM',
      nationalSystemAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPWNvbmZpZy51cGRhdGUtYWxsIiwidHlwZT1vcmdhbmlzYXRpb24ucmVhZC1sb2NhdGlvbnMiLCJ0eXBlPXVzZXIuY3JlYXRlIiwidHlwZT11c2VyLnVwZGF0ZSIsInR5cGU9dXNlci5yZWFkIiwidHlwZT1wZXJmb3JtYW5jZS5yZWFkIiwidHlwZT1wZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJ0eXBlPXBlcmZvcm1hbmNlLnZpdGFsLXN0YXRpc3RpY3MtZXhwb3J0IiwidHlwZT1yZWNvcmQucmVpbmRleCIsInVzZXIuY3JlYXRlW3JvbGU9RklFTERfQUdFTlR8SE9TUElUQUxfQ0xFUkt8Q09NTVVOSVRZX0xFQURFUnxSRUdJU1RSQVRJT05fQUdFTlR8TE9DQUxfUkVHSVNUUkFSfE5BVElPTkFMX1JFR0lTVFJBUnxMT0NBTF9TWVNURU1fQURNSU58TkFUSU9OQUxfU1lTVEVNX0FETUlOfFBFUkZPUk1BTkNFX01BTkFHRVJdIiwidXNlci5lZGl0W3JvbGU9RklFTERfQUdFTlR8SE9TUElUQUxfQ0xFUkt8Q09NTVVOSVRZX0xFQURFUnxSRUdJU1RSQVRJT05fQUdFTlR8TE9DQUxfUkVHSVNUUkFSfE5BVElPTkFMX1JFR0lTVFJBUnxMT0NBTF9TWVNURU1fQURNSU58TkFUSU9OQUxfU1lTVEVNX0FETUlOfFBFUkZPUk1BTkNFX01BTkFHRVJdIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJOQVRJT05BTF9TWVNURU1fQURNSU4iLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY4ZGY5NTI5ZjhmM2E3MzAwN2E0NDI3YyJ9.NVY-QhtulcI8mb9ahUAChQfV021c281n09wVzMh3m7vGuGORfNl-2FHSGsjYJBnWGGyBQGca4A2S2eeJIWALiY-mALnbaG7i3vITvGUhSDDgBa5YGZLIzpanghOAtvRQmByvTJLcdjeNkMkDuBT8c21O668FY4A_Nmor7Ilw9HLI-kuhei4MKJ8r8U_EJEUJgGIlPCoBQLJBP2oo08OPW43I26YGUCYHmwLf5Wo3v8bxhY16k73XoxvfdDPMYQ1yFS4hLtZpYuCxp8Cr2KZIMZp8t3A1HImOGcn7QzLHQRE64Dy090EUS8PQhCUTEofKKvPEM0loaI0E8Ab5FM4_X0z0iTE4m1xBjyDTlek_UgU8IwpgYIlKdY2kVzMjttGaCOmGbyUDOV8LFnGQ8nGWdzUURpecqD-Rn9jIa7caTmOKMXmKhZSB7tJ2wCDV2oFWwMZmTwlPhHkbedZGx__qHBLDRTBolwhhLPM0a2c-e5uTpcHx8sr0C2x7XkqP64R26SwoQZ5T1GxtEYuMx_RTKHk4Be19_DTdCeS4OUt-IX_d8VoK1OS6iVitzLL2EloFpLqY_3rKMijLDq3oQzaZzFfBMzLPqraeF_dBmIyz2YOpiDmvsCy_bj1WW7ICtgJycazqDayCa5QD1DBGxuKA5PEwLKrVbkXrAChFf2wjhOM',
      communityLeader:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSIsInR5cGU9cmVjb3JkLnNlYXJjaCIsInR5cGU9cmVjb3JkLmNyZWF0ZSZldmVudD1iaXJ0aCxkZWF0aCx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGNoaWxkLW9uYm9hcmRpbmcmcGxhY2VPZkV2ZW50PWxvY2F0aW9uIiwidHlwZT1yZWNvcmQucmVhZCIsInR5cGU9cmVjb3JkLmRlY2xhcmUiLCJ0eXBlPXJlY29yZC5lZGl0Il0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJDT01NVU5JVFlfTEVBREVSIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2OWFiYzEyM2RlZjQ1Njc4OTBhYmNkZWYifQ.kcq3LXKIeCIj2CNF9uVhthM_tGgRnprGoiAI8AWVMvZDQ-18Qx3hW_FTgQUw91bODtfpxNQPFsRDrkLOHUF-cGHbMtCWKypCwT5y5ujLqsHk4qARrS-CDx7qLYev77_G8ZpTUrnej0ED8gWo_xYR5WTsHlPctab8oWt6a_Lb5Jo9eOqdan2bNO8kvoXxUb6i4og01pfui_-pJeVh7Q7haRuyYgYXKCchOsAPuz9EbRIm28MEQvsacay_lNniDCXI8eXLRqh5uXHPGPdCOddFBBPNwn2YGaGdZU5i8Po-fdiI-qzCSi910I_zwWvHHRJ596AnrJIjVSRSbTylnB8k0OZ-lz8DkGM4xYXj1maVhKugAqjTwVGfJwnAhv_fHLTY9Gn2lQGmFgwW1DrM555KQecq9sjdREiXcAWlhhPM9MuNJFrIT9Zue0R9F5ELkTqvuVVzVllzCfI7MrnZeui8SDM6sv0Q6X-t_ySVaF_MTdniTinxEjGtCEN5HkI8zFYDp22886H1f99m4Eru-FkBEqGgSTpwgv1SonUcoyzzzIkswdY5pRk9AO5REKW_Z0kFAOXsyVSAGbEPbSLjsEylVIyQW_HWYvLDTASBviWNSbGl-704uWLujSPQos_pr18iZ5fKp6admNxA1ZYoYXUSCian2SMImtIRXThLg-VX6PU',
      provincialRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9cHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsInR5cGU9b3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zJmFjY2Vzc0xldmVsPWxvY2F0aW9uIiwid29ya3F1ZXVlW2lkPWFsbC1ldmVudHN8YXNzaWduZWQtdG8teW91fHJlY2VudHxyZXF1aXJlcy1jb21wbGV0aW9ufHJlcXVpcmVzLXVwZGF0ZXN8aW4tcmV2aWV3LWFsbHxpbi1leHRlcm5hbC12YWxpZGF0aW9ufHJlYWR5LXRvLXByaW50fHJlYWR5LXRvLWlzc3VlXSIsInR5cGU9dXNlci5yZWFkLW9ubHktbXktYXVkaXQiLCJ0eXBlPXJlY29yZC5zZWFyY2giLCJ0eXBlPXJlY29yZC5jcmVhdGUmZXZlbnQ9YmlydGgsZGVhdGgsdGVubmlzLWNsdWItbWVtYmVyc2hpcCxjaGlsZC1vbmJvYXJkaW5nJnBsYWNlT2ZFdmVudD1hZG1pbmlzdHJhdGl2ZUFyZWEiLCJ0eXBlPXJlY29yZC5yZWFkIiwidHlwZT1yZWNvcmQuZGVjbGFyZSIsInR5cGU9cmVjb3JkLnJlamVjdCIsInR5cGU9cmVjb3JkLmFyY2hpdmUiLCJ0eXBlPXJlY29yZC5yZWdpc3RlciIsInR5cGU9cmVjb3JkLmVkaXQiLCJ0eXBlPXJlY29yZC5wcmludC1jZXJ0aWZpZWQtY29waWVzIiwidHlwZT1yZWNvcmQuY29ycmVjdCIsInR5cGU9cmVjb3JkLnVuYXNzaWduLW90aGVycyIsInR5cGU9cmVjb3JkLnJldmlldy1kdXBsaWNhdGVzIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJQUk9WSU5DSUFMX1JFR0lTVFJBUiIsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjlkZWY0NTZhYmM3ODkwMTIzYWJjZGVmIn0.qIyoIrphKm_jdIUiLm6mExd5WD2v6u84CP3OJgPcCkgUnTENCznv5pfaBLfS1XnYtjig-NTk1ZTedgcEseK_FIl4-JLEH93FRedFx4Am0obaYaJ1FMlB2OBJsXWR3wv-VKFWEQ_JikSZgYT4G3eObExF0kbLrIBlDm_Oesn4i1vVcc3wy4d9exsqsR1L4TTsW0fZi_r5Tp3iNL0yMiEdIhlMgLcdkKr7BInI7WNoZqGNNh1CnyPgyzg2kAsy5JYcgyQ3qJW2yv4Unf0yPy8hvSeobqBwmPctD8RX8Ey4bxNvZyN8uaxCUs-LrcRo5Dzr9w0zBrGJBd8pfLYkGkpcd1We7jJvkk5NhLR-8pcRo159XrxcSrE7mkaXPTd6WigzvkhIey0wFu3aPlkSWhvCnnH5dZDFdmxisEPV6cETZEgADMX8M4jrAMG4Cd-2twlpukLOyl9IMtevMigVvIcgVslBdTJu5m_Zs0PxQh-12r5RAJfgR5X22LnMSxCtEqrntc8m7BMBgIe7WJFlFiGNM0P6kJnqJ01pEemn0oQd_0VAKi1ciLZlHW3_TSzqSA-G2j7G-i7VXcwQb_owGb0I_-LXoo-RlzUpyRX5zlCjlM8FvfM2mkLQZALkEOQ1MgJ51JUlaHR6BWcGTXK_u-mKxlPTEQzZKIDrf2lCusRWJGs'
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
        encodeScope({
          type: 'organisation.read-locations',
          options: { accessLevel: 'location' }
        }),
        'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review-all|in-external-validation|ready-to-print|ready-to-issue]',
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
        encodeScope({
          type: 'user.read',
          options: { accessLevel: 'administrativeArea' }
        }),
        encodeScope({
          type: 'user.update',
          options: { accessLevel: 'administrativeArea' }
        }),
        encodeScope({
          type: 'organisation.read-locations',
          options: { accessLevel: 'administrativeArea' }
        }),
        encodeScope({ type: 'performance.read' }),
        encodeScope({ type: 'performance.read-dashboards' }),
        encodeScope({ type: 'performance.vital-statistics-export' }),
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
        encodeScope({
          type: 'organisation.read-locations',
          options: { accessLevel: 'location' }
        }),
        'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review-all|in-external-validation|ready-to-print|ready-to-issue]',
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
