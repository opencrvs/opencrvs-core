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
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuc2VhcmNoIiwidHlwZT1yZWNvcmQuY3JlYXRlIiwidHlwZT1yZWNvcmQucmVhZCIsInR5cGU9cmVjb3JkLm5vdGlmeSIsInR5cGU9cmVjb3JkLmRlY2xhcmUiLCJ0eXBlPXJlY29yZC5lZGl0Il0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJGSUVMRF9BR0VOVCIsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjdlZjdmODNkNmE5Y2I5MmU5ZWRhYTk5In0.B3B1UkwTGclqKdH6ExbN366P-5DlxpPlNb5IJjabo7PP7HohuJ5rJK0DALH5QqYYhOlPs1o_K52IL7xY-Mtds7t7Bz4uJCMdJS0lr9LJgjSdkKLrEIRABpLEKVULIr-xEz8fZutIBRqjkxkf9d2Omrfkv8me1iV2ZsR160uo770hP4Wf5qnAc_0YUkyVPT9e_9d--owcsgb3jAYciJTgBGngFNnOw5n8IDQf0azzM8igk-OydWxqNz7MQ3IU5QlsDpT1td5c6TuPWaTtF3V2htP8L8tdGhkmf8lHdlNySkvfCqF6U3h7_Joy0Nq7olF0WvI-NMA5NqXMx0cdm-YTxgVieywfPbhKLHiGYPlnCRcTsepL43WxlSsGgzkx46bey5pgV1NHS0GdpEYO-DJmRjDBYKY_TMWWjhzgc1y0EI02lSCE5DPUn1k8auM7mSTF418Vi0Bq4QhlrKkIXozOM0Ov0J03Gem9Xom-jir7qPoNm6bhoz0W4ReRNUt_QPuT50AaTg_VKsxrfomYlv2-4uBt2Vu4nmos0wIVdlhdSsjwD-O14q6lKnJm62yS64ucDBYAizWgQrLbOI4uECXdqsfWP99q9ylMi3gmd-YjxWEUzqeitkYXRCLcDiC8bMsQG2zYjaZa6zR69JZgnJlMOJ2Jmr592rCwkhEdOqOE71M',
      localRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9cHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsInR5cGU9b3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zJmFjY2Vzc0xldmVsPWxvY2F0aW9uIiwidHlwZT13b3JrcXVldWUmaWRzPWFsbC1ldmVudHMsYXNzaWduZWQtdG8teW91LHJlY2VudCxyZXF1aXJlcy1jb21wbGV0aW9uLHJlcXVpcmVzLXVwZGF0ZXMsaW4tcmV2aWV3LWFsbCxpbi1leHRlcm5hbC12YWxpZGF0aW9uLHJlYWR5LXRvLXByaW50LHJlYWR5LXRvLWlzc3VlIiwidHlwZT11c2VyLnJlYWQtb25seS1teS1hdWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCIsInR5cGU9cmVjb3JkLmNyZWF0ZSIsInR5cGU9cmVjb3JkLnJlYWQmZXZlbnQ9YmlydGgsZGVhdGgsdGVubmlzLWNsdWItbWVtYmVyc2hpcCxjaGlsZC1vbmJvYXJkaW5nLGxpYnJhcnktbWVtYmVyc2hpcCIsInR5cGU9cmVjb3JkLmRlY2xhcmUiLCJ0eXBlPXJlY29yZC5yZWplY3QiLCJ0eXBlPXJlY29yZC5hcmNoaXZlIiwidHlwZT1yZWNvcmQucmVnaXN0ZXIiLCJ0eXBlPXJlY29yZC5lZGl0IiwidHlwZT1yZWNvcmQucHJpbnQtY2VydGlmaWVkLWNvcGllcyIsInR5cGU9cmVjb3JkLmNvcnJlY3QiLCJ0eXBlPXJlY29yZC51bmFzc2lnbi1vdGhlcnMiLCJ0eXBlPXJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInR5cGU9cmVjb3JkLmN1c3RvbS1hY3Rpb24mZXZlbnQ9dGVubmlzLWNsdWItbWVtYmVyc2hpcCZjdXN0b21BY3Rpb25UeXBlcz1BcHByb3ZlIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJMT0NBTF9SRUdJU1RSQVIiLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY4MjFjMTc1ZGNlNGQ3ODg2ZDRlODIxMCJ9.BRKkgwJfIRgnRIoRxSKYxuCRwDRcjYXpeKZldtYzJ56e8uYax2cmHtr58ZrURDjBIrWs1e7CB8e_-yLl1M--OQKtNK-vvp6LOqlUURnmbQ9viOGKU8yMMd8SAT03FF3BemM2nYrasUC2gimfR7btjTwvixL4Nx1XX1e690_EyO1KeVwx4rjH7tj0FL-m5bl-S3mOcy0CN69vSt2yZAYx9yTyk8-vzq6AqEn-ZRBZpWnSK6_ky6Ragz5I2uyk8gBA8vTgdA9_xJFvImX3UIrJAir4eaYNu9r1NiXNHkQ1cFSpqw4-NXoM5YShdGzYmlW727XsnUGgO4L6fGeXCBbVDXZUafqWl9cU3D_vGNMxvK9nnAtnxtMzWB-NZqaDO_lt2D7-cucecuMDO5030b3x5kr9LQFDlEmWip016mxV15IPlBQv7ixTJ8Uot8Iw0doKAiEyW93dEtlWZ1XUqsWTbMa6JjH8lit2wx2tK5rfvpDr1UXVcQUiTIdMC4NIMnGQPGhJv8VUunQH-YJxTIhzDUkj26tmkE2Ko46M5zLBWuG9gHqDS_E4p3glRmZFhuxdPvsk46uCopXhdo2n_SlcP9lEHxCT6en3RCR27EymNDoJPwlTPXAmgUC_obq6wNF7XmGCzt5udzrFcEFAtL2jXoW3l_tjiXYiD1Z1PauBki0',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9b3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zJmFjY2Vzc0xldmVsPWxvY2F0aW9uIiwidHlwZT11c2VyLnJlYWQtb25seS1teS1hdWRpdCIsInR5cGU9d29ya3F1ZXVlJmlkcz1hbGwtZXZlbnRzLGFzc2lnbmVkLXRvLXlvdSxyZWNlbnQscmVxdWlyZXMtY29tcGxldGlvbixyZXF1aXJlcy11cGRhdGVzLGluLXJldmlldyxzZW50LWZvci1hcHByb3ZhbCxpbi1leHRlcm5hbC12YWxpZGF0aW9uLHJlYWR5LXRvLXByaW50LHJlYWR5LXRvLWlzc3VlIiwidHlwZT1yZWNvcmQuc2VhcmNoIiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyIsInR5cGU9cmVjb3JkLnJlYWQiLCJ0eXBlPXJlY29yZC5kZWNsYXJlIiwidHlwZT1yZWNvcmQucmVqZWN0IiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLmFyY2hpdmUiLCJ0eXBlPXJlY29yZC5wcmludC1jZXJ0aWZpZWQtY29waWVzIiwidHlwZT1yZWNvcmQucmVxdWVzdC1jb3JyZWN0aW9uIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJSRUdJU1RSQVRJT05fQUdFTlQiLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY3ZWY3ZjgzZDZhOWNiOTJlOWVkYWFhMSJ9.CO6h6rQk3t9zEO5z8OflU9NHRCO2bG-G7B9Ct21lZRUeD7c8ElTzJCqvymxVGXOx49VQd1awEm47wXSeJJKzdU0osVkgJybwBv4ItReeqsCemFd9lw4TnBytWABOZuqCkHZ2cwm8vKkEd9yR2sJSTVOvbOPYZkOyToABKPiDlTfH_SxjEUMFXBhK-GfgYyb_i97tLJBQc_ijV8JuTqcv4Kqb8ey8JkZe4Yp6-fHy922bhRWaH6HoI74BE_WKKs-s9FeoeQwtfwbFbVHtwSfEOTVFCWoMeOeXLLNZCaW0B7Qf8HmucQSov9IRtzWVnTDkvjvTQar9IRhsgpNtkd9jZs2_ob1t5LJyuND9eu-GQ1NLEyyWeKy_kLrLSoBiFdTVt0sEhPKAcFvMVhsog3pDwWuBTccbVreXie6PeQ7pr1skY1cjaji0IylO-A27QTzKkKZYkD6dnzGmF8btUBZYYWfOVCRkHvR2cYM-U1tfPGP045kiA_YAES_erbys0ClDMZ4HsmPVRkIrTvGw1Jp0f0QLpNF9b5hujM1Cnjp5Zhcy26c_l5M7qgQrvYmJiDizjLZYRalyeVJoz2IHC7_fTzQ7i3AHMAz8800_DKKnC0VbB_Oo5CcT_ipAfx8IBj52nEdJiMB-j5FNfj43fqzfcBjyKjZiT-c1H0cbHMe2a1k',
      localSystemAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXVzZXIucmVhZCZhY2Nlc3NMZXZlbD1hZG1pbmlzdHJhdGl2ZUFyZWEiLCJ0eXBlPXVzZXIuZWRpdCZhY2Nlc3NMZXZlbD1hZG1pbmlzdHJhdGl2ZUFyZWEiLCJ0eXBlPW9yZ2FuaXNhdGlvbi5yZWFkLWxvY2F0aW9ucyZhY2Nlc3NMZXZlbD1hZG1pbmlzdHJhdGl2ZUFyZWEiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9cGVyZm9ybWFuY2Uudml0YWwtc3RhdGlzdGljcy1leHBvcnQiLCJ1c2VyLmNyZWF0ZVtyb2xlPUZJRUxEX0FHRU5UfFBPTElDRV9PRkZJQ0VSfFNPQ0lBTF9XT1JLRVJ8SEVBTFRIQ0FSRV9XT1JLRVJ8TE9DQUxfTEVBREVSfFJFR0lTVFJBVElPTl9BR0VOVHxMT0NBTF9SRUdJU1RSQVJdIiwidXNlci5lZGl0W3JvbGU9RklFTERfQUdFTlR8UE9MSUNFX09GRklDRVJ8U09DSUFMX1dPUktFUnxIRUFMVEhDQVJFX1dPUktFUnxMT0NBTF9MRUFERVJ8UkVHSVNUUkFUSU9OX0FHRU5UfExPQ0FMX1JFR0lTVFJBUl0iXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IkxPQ0FMX1NZU1RFTV9BRE1JTiIsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjhjYmQyNmZjNjQ3NjE1NjU0Njk1OTFkIn0.L_bLhr6doxuWYkteh5DgCUO6xnDBxYvH8jlVSXtDA168HYKbYTs13nuAX0V-dfrDqXLzqQSk8QGFwbKbEj1JwsB2iBAR0-3duYB7QKPq7jPDVkHY-W2Kep9Hzx8kATifGfy2fC1RPrLTeqYwYOS6yYsCBOqBsIl0rPqPKNyQC_SJ989stU5tzo2bxe45S41KuML4pUPJA8o74oAlLW_J9z0SQmOnhoGeBo9fWYEjuD_invsKZMORcK_J9fbdAb5_KEvby_cw2bxCOckgUa_euaAUqIeQHvRmJQvVV3deWayPDvk8if_z47ObE7Ul5ugXQQJr4dUsja4hsjm9xxYX9GNN2zqJQ0MqskEvYCgNo-FBuGonirJI1ekas6uWMaUU9isvkJNRmkpDunrGnBhxNxRtaVy-0FIMfXx1veTPL1KCzCNb2Q4jWaFJRfG08HKF0oM_w7gpgXKjH4uw4jWTwnsnx3P3DzfSV0cRlSzNE2dQxtI6TrTSHQ_6dwsVIw24y3wZR65AMoNhJQaYmxtNpTeQ6SSvS0eQnLB5CvpIqtXEb-s_K-H8YD3qKRgRSZJmndrue3mp4vg_glS10DBPv_ri_LP-nvlfJCWtsnc6H-3zBFC3OuG1lhvQXpf7b-iExL3vT90sK2GEkln63rTSF5m54CmrWc1233Ry1L5rqIw',
      nationalSystemAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPWNvbmZpZy51cGRhdGUtYWxsIiwidHlwZT1vcmdhbmlzYXRpb24ucmVhZC1sb2NhdGlvbnMiLCJ0eXBlPXVzZXIuY3JlYXRlIiwidHlwZT11c2VyLmVkaXQiLCJ0eXBlPXVzZXIucmVhZCIsInR5cGU9cGVyZm9ybWFuY2UucmVhZCIsInR5cGU9cGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwidHlwZT1wZXJmb3JtYW5jZS52aXRhbC1zdGF0aXN0aWNzLWV4cG9ydCIsInR5cGU9cmVjb3JkLnJlaW5kZXgiLCJ1c2VyLmNyZWF0ZVtyb2xlPUZJRUxEX0FHRU5UfEhPU1BJVEFMX0NMRVJLfENPTU1VTklUWV9MRUFERVJ8UkVHSVNUUkFUSU9OX0FHRU5UfExPQ0FMX1JFR0lTVFJBUnxOQVRJT05BTF9SRUdJU1RSQVJ8TE9DQUxfU1lTVEVNX0FETUlOfE5BVElPTkFMX1NZU1RFTV9BRE1JTnxQRVJGT1JNQU5DRV9NQU5BR0VSXSIsInVzZXIuZWRpdFtyb2xlPUZJRUxEX0FHRU5UfEhPU1BJVEFMX0NMRVJLfENPTU1VTklUWV9MRUFERVJ8UkVHSVNUUkFUSU9OX0FHRU5UfExPQ0FMX1JFR0lTVFJBUnxOQVRJT05BTF9SRUdJU1RSQVJ8TE9DQUxfU1lTVEVNX0FETUlOfE5BVElPTkFMX1NZU1RFTV9BRE1JTnxQRVJGT1JNQU5DRV9NQU5BR0VSXSJdLCJ1c2VyVHlwZSI6InVzZXIiLCJyb2xlIjoiTkFUSU9OQUxfU1lTVEVNX0FETUlOIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2OGRmOTUyOWY4ZjNhNzMwMDdhNDQyN2MifQ.VZ57j4Bft8mOWqEdB1jgySbHNCx_Gl9HoADOtRN_FXQla938EHtwY9-4pC5TwAqeH589HMtp5wJz5X5zY4_CenXLZGP3ti0Cv9pO7XswBPfPKipjvR6qvhn5yjBVU_YvHNtfbqb1jYmPv7_K1yEsV1C3KUR3kLNr8AzMFXm9pJTZAuilJdbnv8sM4JI-omyW00u5aPJ2klE6yPetB5poNcDC9yIQbVcnzsSbE6iApviGG5mzexdVVeKt9iQitM0rtSlo1NTWwQDgFyrgEOO9a3CCAx9pVDgv1kshkM7bk_RXkLcwel8VaANOOsaDKAF6MaPEzO4WkH2IsBUbIse8Q2L5Qf41km_rFc-96ws6S_Dm1CaPjtuAKjb58bZGQYDNby_L4jdOxdDeyC9S9tn43OXmF7bLIBiQLnuX7NqFqtIk5zmGC2NVUuoWL0WIvTH5RsFmylerKR7nEmZ-9UnbGaYp1-QykmD50K85eRK_KqA400ZooX5QITraHfShZ1sXFf8UIJPkHVZsR9bJpw3MwrG5cyVdtLk-GLX4kYDGyL4aqAANxzf89wifGCYDV3gyoy0sdqDYYC4Tu__17yIvW0sq9JrEi9sa4nQzdf_0vhFWSGzVZNhp52EZFhISsbJWzwB4W5yx2hthbO4vUyqBlimm73jzcpqOa8f6SDP2D_k',
      communityLeader:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuc2VhcmNoIiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyZwbGFjZU9mRXZlbnQ9bG9jYXRpb24iLCJ0eXBlPXJlY29yZC5yZWFkIiwidHlwZT1yZWNvcmQuZGVjbGFyZSIsInR5cGU9cmVjb3JkLmVkaXQiXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IkNPTU1VTklUWV9MRUFERVIiLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY5YWJjMTIzZGVmNDU2Nzg5MGFiY2RlZiJ9.gdmBdxoF1S9ec62pemDRkCBR7MWwhzyyQcnLSgeinSquWSraSvSdtiRPUGqQoMs3dZXxBkoyBSH-_fFmq3_i8Ax4u6m6QQfFRToFf_LBxZTOA_kH9Gg89ooJKzzlmRXn-woQIFBrQKfXXCbZvCS8YAjG1VJzhkYD_pd-EFy0dsEuWNVNTOLwfUMhfc3MBSgUS1lbCpJU6UnkBzn222d8t1J8O5yrIwn8_-evIpQdjYEOGVrcziStiSU1L0QD39fL-hQgdBoARQRZN13CLuP-d6nRhmxoKL6_rC1io27Gb1QKkLfodWokvB-M1aoOAjHg_yMRxV4dbhtF0x511uYsitAx1_HqA8uoNPhLDvbMbWSZ74t9hUHTJP7sfoumrNg5t5JnZHvLO3GCo1fLjbR62AW-9rbcGeB8oxglbWoFUPfd_I8HEnVq24n0w_z_kZkOC2qcf9CMIPY9EWkCq7XCGJOXedz3BJqw-nsyMZIJQni_ASfpizcLvDcocxN8AfwGLtDpRNdgU7xHlE7IsLf4nbV8bofgHg2o4VovXZNvHGNIWKG6XC3Pr4eNO_OtWT33BGux1LwlDubA4d1x42HGNDCqfAyxnZ2rKnzEdn-PYYDcYxE8gXOTD8vt7qSZe68cgjmp_NKAjqbEOsQs0CCOkLxfURHqxrARA8jFXaWw7Tw',
      provincialRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9cHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsInR5cGU9b3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zJmFjY2Vzc0xldmVsPWxvY2F0aW9uIiwidHlwZT13b3JrcXVldWUmaWRzPWFsbC1ldmVudHMsYXNzaWduZWQtdG8teW91LHJlY2VudCxyZXF1aXJlcy1jb21wbGV0aW9uLHJlcXVpcmVzLXVwZGF0ZXMsaW4tcmV2aWV3LWFsbCxpbi1leHRlcm5hbC12YWxpZGF0aW9uLHJlYWR5LXRvLXByaW50LHJlYWR5LXRvLWlzc3VlIiwidHlwZT11c2VyLnJlYWQtb25seS1teS1hdWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCIsInR5cGU9cmVjb3JkLmNyZWF0ZSZldmVudD1iaXJ0aCxkZWF0aCx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGNoaWxkLW9uYm9hcmRpbmcmcGxhY2VPZkV2ZW50PWFkbWluaXN0cmF0aXZlQXJlYSIsInR5cGU9cmVjb3JkLnJlYWQiLCJ0eXBlPXJlY29yZC5kZWNsYXJlIiwidHlwZT1yZWNvcmQucmVqZWN0IiwidHlwZT1yZWNvcmQuYXJjaGl2ZSIsInR5cGU9cmVjb3JkLnJlZ2lzdGVyIiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLnByaW50LWNlcnRpZmllZC1jb3BpZXMiLCJ0eXBlPXJlY29yZC5jb3JyZWN0IiwidHlwZT1yZWNvcmQudW5hc3NpZ24tb3RoZXJzIiwidHlwZT1yZWNvcmQucmV2aWV3LWR1cGxpY2F0ZXMiXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IlBST1ZJTkNJQUxfUkVHSVNUUkFSIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2OWRlZjQ1NmFiYzc4OTAxMjNhYmNkZWYifQ.hL30RQN9Lujxy8KzOjGxij-AkFHAdt7LRuU0WHjPjbp3wVmzzqOj0eqCSJOZoTolcP6LC9thvmqVCEAb9u58Zpp48laRUdzWO2qwbi6mi03IAkdw4MraoOrFpEDZ_lxdBSYxEKyJXX6_l0KzNX_UbI9ndH-Eo1YMxzdJQLjKlU7d79lNrWGlDz5WeKvurXScQiuvx6hF19ryuwQXWIOkB-cLVTFIdsAzoffUhGXA4cndFUN6_oYipusUkqTbjLMm7AoXfExMHhBGXU41JicaAQjXKsbLYyDtDvCig-KRKqtJg0aKOAgJUBa2VJ3AHUvvrOI1G8FH2_SZ64QY8bzolO-FijSq3NO-L3acBN2WjRR1tUhwTU_joSV8D4cfRUfqOOMgMkXGufGvK1fWvmUP94zcKMzLMUnRu3RQS79WEVpETRyn574aql7MYxBl9RRvbGzO7hOr0rS5xPtvIpm6_T3Ul_9Zt33K9tuUHbUdx_gktcK57Mv3tYcG5zBRtt_pAwXQFEY_JesVLTprE9l1otop1CbSPFS4DtCLF1C1T8cJdQmBT2kacjijG4Xumy8YvPyNVmOg2jJ_5lj36lexMw1nX4xLc3vNdsARB-yLFSGtQx49_AZiRF_Q14LNNR6dkYH6u2zGYnNpKaoyU910OeFBj8SvvWVK1Mr6H3tzt48'
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
        encodeScope({ type: 'user.create' }),
        encodeScope({ type: 'user.edit' }),
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
