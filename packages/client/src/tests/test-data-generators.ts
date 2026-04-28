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
  localRegistrar: '69179374-0447-4545-4545-454545454545' as UUID,
  registrationAgent: '69179374-0447-4545-4545-454545454546' as UUID,
  fieldAgent: '69179374-0447-4545-4545-454545454547' as UUID,
  localSystemAdmin: '69179374-0447-4545-4545-454545454548' as UUID,
  nationalSystemAdmin: '69179374-0447-4545-4545-454545454549' as UUID,
  communityLeader: '69179374-0447-4545-4545-454545454550' as UUID,
  provincialRegistrar: '69179374-0447-4545-4545-454545454551' as UUID
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
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuc2VhcmNoIiwidHlwZT1yZWNvcmQuY3JlYXRlIiwidHlwZT1yZWNvcmQucmVhZCIsInR5cGU9cmVjb3JkLm5vdGlmeSIsInR5cGU9cmVjb3JkLmRlY2xhcmUiLCJ0eXBlPXJlY29yZC5lZGl0Il0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJGSUVMRF9BR0VOVCIsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjkxNzkzNzQtMDQ0Ny00NTQ1LTQ1NDUtNDU0NTQ1NDU0NTQ3In0.NfFQFtoNczMnCBP4sgKJaGTsbB5MQGjhOVHWCEHkET425LaRRHHEPmIp3CmJskCiQDLg-DdXkGGS8tvqSjLbHSOJAga6fXRf9rd5I_WYYIdR4LiErXrzTvkce4o2f2KrM7xpYkAIsV7r12fL4lnZRdV2EHykY7WvmcrHpQvtNFc_nO0xE8xDwypv4VGZQ__4zJUeVBLoc3HR_6aUPSRhWWwAXONezlAUjIeV0ncycWMmGeSwQT076rG1_OYN49J5P1nsw3YS36ukLj56472AXs8pFf4K_O2evuaF--Ao3pCYb-mF_m84nIc54rYom2nz48BZG4bNgeaIdAu2v5hooS3cmBvkjURMNinNvlyQq24Z-MuRGwoh4aQleSgzVs8QJyyOOT_lpI0kv0Xvqd1BNe0I2-hhB5kOuWTvpQY_EpK7BZxpnS3Je8t_3ZSv63CCynPa5OLweapZcE7P6Wcgfg4EPyZy7cUW7k6-JlhvUB8dpWsDIKdAyOZDba-WiQ1qr3Zz5p-IZBBH_bMvVwHK0tOoNidnKeo6H5SXsrVt6D6467jyXJ3QTNHWD8Pa2r0Qc5hdpJC300Fn4tVfguBQ00vsJvi25lt0YPgx9eK9zNLGjlpN-lm--TaRI_6yIaxW_eziFMeSwkEPqd9yse2rxluH7DhP-aMjIgYsMapMTtE',
      localRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9cHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsInR5cGU9b3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zJmFjY2Vzc0xldmVsPWxvY2F0aW9uIiwidHlwZT13b3JrcXVldWUmaWRzPWFsbC1ldmVudHMsYXNzaWduZWQtdG8teW91LHJlY2VudCxyZXF1aXJlcy1jb21wbGV0aW9uLHJlcXVpcmVzLXVwZGF0ZXMsaW4tcmV2aWV3LWFsbCxpbi1leHRlcm5hbC12YWxpZGF0aW9uLHJlYWR5LXRvLXByaW50LHJlYWR5LXRvLWlzc3VlIiwidHlwZT11c2VyLnJlYWQtb25seS1teS1hdWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCIsInR5cGU9cmVjb3JkLmNyZWF0ZSIsInR5cGU9cmVjb3JkLnJlYWQmZXZlbnQ9YmlydGgsZGVhdGgsdGVubmlzLWNsdWItbWVtYmVyc2hpcCxjaGlsZC1vbmJvYXJkaW5nLGxpYnJhcnktbWVtYmVyc2hpcCIsInR5cGU9cmVjb3JkLmRlY2xhcmUiLCJ0eXBlPXJlY29yZC5yZWplY3QiLCJ0eXBlPXJlY29yZC5hcmNoaXZlIiwidHlwZT1yZWNvcmQucmVnaXN0ZXIiLCJ0eXBlPXJlY29yZC5lZGl0IiwidHlwZT1yZWNvcmQucHJpbnQtY2VydGlmaWVkLWNvcGllcyIsInR5cGU9cmVjb3JkLmNvcnJlY3QiLCJ0eXBlPXJlY29yZC51bmFzc2lnbi1vdGhlcnMiLCJ0eXBlPXJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInR5cGU9cmVjb3JkLmN1c3RvbS1hY3Rpb24mZXZlbnQ9dGVubmlzLWNsdWItbWVtYmVyc2hpcCZjdXN0b21BY3Rpb25UeXBlcz1BcHByb3ZlIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJMT0NBTF9SRUdJU1RSQVIiLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY5MTc5Mzc0LTA0NDctNDU0NS00NTQ1LTQ1NDU0NTQ1NDU0NSJ9.E7jaybeQpHVWi10bRp7Z8TAOPg26qQvITCbkFMmsje0-gdLI3w0EU8HI4HIVpfTs-V3OOBnL-1DerEOD5ukfU3hXGSyNLCCjXjiqiyw-jQgW5ho_PEhklTwtgfl3RRPUkdM8ysB5SStSc7HEqmFrNi3q6CKS2zxkjJ4Q_xxXHo8q2D-o4f35XXkz-O50zf3vQ9ycQ82UcoWcKdvj7K9mCdQOcE70FgeqgUWberK-deNyzm7vfmv4h8yP3OxxQZSVwDcfHwDodM-kMsfuvBbZReAX5_F4WECft0jtDhySxU4blkUAxjVUOpy76DDs7G337WYdTQsoehnUSE0fAgEZKHq9hyWRkJGbg5IfFxQeGNMJCRjJZvFAtBbymYnYju1vlxjieu08ELY52IXX15GWgCTybilm3KUIn58wK1CBL7NE5ppQ-GzalXK_xNeYu4aWNBm3tStl6L4m5oqP3hWvAbK5W-qsCHLEBrIRsnogMaW4gRNgp4XA7G43_GmN7Yq3oVMiSjoW4OS-rHZVP4DCPqsiF0BQ_JyjG8NoS7Ek2u__vRQwwIBudq-v63GqY7i2xhqMYdoU-V-PYFLHAhsM7OtIlv7XCFqDr6MobY9cgxxNqzp3q89dBSha0kl9oufDHIAYwKvkFurwnI0vrJU13XlQ4qYANQoS-WOExGWEAUs',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9b3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zJmFjY2Vzc0xldmVsPWxvY2F0aW9uIiwidHlwZT11c2VyLnJlYWQtb25seS1teS1hdWRpdCIsInR5cGU9d29ya3F1ZXVlJmlkcz1hbGwtZXZlbnRzLGFzc2lnbmVkLXRvLXlvdSxyZWNlbnQscmVxdWlyZXMtY29tcGxldGlvbixyZXF1aXJlcy11cGRhdGVzLGluLXJldmlldyxzZW50LWZvci1hcHByb3ZhbCxpbi1leHRlcm5hbC12YWxpZGF0aW9uLHJlYWR5LXRvLXByaW50LHJlYWR5LXRvLWlzc3VlIiwidHlwZT1yZWNvcmQuc2VhcmNoIiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyIsInR5cGU9cmVjb3JkLnJlYWQiLCJ0eXBlPXJlY29yZC5kZWNsYXJlIiwidHlwZT1yZWNvcmQucmVqZWN0IiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLmFyY2hpdmUiLCJ0eXBlPXJlY29yZC5wcmludC1jZXJ0aWZpZWQtY29waWVzIiwidHlwZT1yZWNvcmQucmVxdWVzdC1jb3JyZWN0aW9uIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJSRUdJU1RSQVRJT05fQUdFTlQiLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY5MTc5Mzc0LTA0NDctNDU0NS00NTQ1LTQ1NDU0NTQ1NDU0NiJ9.ZkyzmQU-lT1FQAvmHo8Dq4e6TBa51m63iziB19VpT_PcnHFL9NywnK9RpbEXO5Qem9yKisu3ELQZ9K6clZJ64Q2vmGkScIxzwkiH25Fu5DfXoiQiOs3kiDj_UD_-J5UgcMy1kmyFLaNPdQ4ctnC5HUEf7c754hYRbMeKevPga3OBnK7DM_9Fcw9rzNl-8QAJHRTX84nxcbHBxlmK17lBaufnCfzAg-6FtwvQE0lu_qWHwQD9vV8R9Fo-zIbHNgyiZjz3p025oySidcJPNyDDm38b3ju4JhYcG4ukRkZRTm7VfBslkkTGszUxQlwYE4paA6RtA09yADz-eh2qhj86d0xNNEPntgMmNfGzXzIZkkG2R6lOtglNQpHK1l-mubaFQsszZAwNHd1Uk4jdw5aOGSMfeOSIhT03fUqaNXVJtQtFKJ7eIFjPE4WKnfuhVDlnwK-NHx_8DdHhNCzLj0KSU13zhMhyKoSgwypkSCfOGlOJGGwjPAL2LR5a1aT6QKCFFY9p6W2VrjZ5FAfagc1FlYaRru_Bht3ej0zxq_zeK4PiEIVvIla7rJ8KIIKI7JSiF2Dz6CtrTm335p0XZwBFygkv87ksk_yFlRaJwTaMyP8De53sKTIFUI0vwyEgj0JKXSg0B_jJNOU26kQJjzwOGg_gZdBxR6XFYLipuH3CWNE',
      localSystemAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXVzZXIucmVhZCZhY2Nlc3NMZXZlbD1hZG1pbmlzdHJhdGl2ZUFyZWEiLCJ0eXBlPXVzZXIuZWRpdCZhY2Nlc3NMZXZlbD1hZG1pbmlzdHJhdGl2ZUFyZWEiLCJ0eXBlPW9yZ2FuaXNhdGlvbi5yZWFkLWxvY2F0aW9ucyZhY2Nlc3NMZXZlbD1hZG1pbmlzdHJhdGl2ZUFyZWEiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9cGVyZm9ybWFuY2Uudml0YWwtc3RhdGlzdGljcy1leHBvcnQiLCJ1c2VyLmNyZWF0ZVtyb2xlPUZJRUxEX0FHRU5UfFBPTElDRV9PRkZJQ0VSfFNPQ0lBTF9XT1JLRVJ8SEVBTFRIQ0FSRV9XT1JLRVJ8TE9DQUxfTEVBREVSfFJFR0lTVFJBVElPTl9BR0VOVHxMT0NBTF9SRUdJU1RSQVJdIiwidXNlci5lZGl0W3JvbGU9RklFTERfQUdFTlR8UE9MSUNFX09GRklDRVJ8U09DSUFMX1dPUktFUnxIRUFMVEhDQVJFX1dPUktFUnxMT0NBTF9MRUFERVJ8UkVHSVNUUkFUSU9OX0FHRU5UfExPQ0FMX1JFR0lTVFJBUl0iXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IkxPQ0FMX1NZU1RFTV9BRE1JTiIsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjkxNzkzNzQtMDQ0Ny00NTQ1LTQ1NDUtNDU0NTQ1NDU0NTQ4In0.L55vVV8ssaeeqQXw77ymhei3lBadU9xwftHlJOaK1Dc7sx1OSLr8Yn3GEX4FWdwY-AqzdpXhB0Y1NScXqyF-JmfFLe8Bo7b9wKUoabf7qcz-y1i4PSMhHWmW-Lm_ZW5It0_gnx3X315lN8i5c9pmqZKAXWiGHa3MBBfBG4iMPLSOU3hVsaEcZOgpDG3c1lb3WfRb97XKAlSkqaeuXmk9x60kRhopRLoK3lAmMxae2gbYE384pAfWW163XW3BmqD5e0GFuCQxlTVthg_nBFLVHm2S6fD5GnMogR5kcG87uAYSjTjHGDZIQRSYxTVQszsaEwXUrRTR4Qtx3pdozew7JaqwiiOAiV1cBvSL55_s4tgi55gMDStyVW_EhlqWnehBzzsq_TgbKk4xUq-CuhB-gO-Bi7At6B_hOLK_JlxzMA5fVDVrqyjhsOYxBL_kLlna69zkeMvfNU3POyKw0SjzVN--RlbjRMgfsxPkmYjSLYDBjt_2r-bZD8CYC_5xCdh2AQWrYirhrFcoMiI8YZm4_093j067BAMOQDhe9d0JwOVH5qFeOacreMw3ZMUq2T51KcKufzRk6E830p_s1Pr5jZ7CvfNeE1tFpmefA62tfREaerfevQ_MCl_3EQYf6tGh1Dhv9ByRgLX0qNL4OXUMbcBC_vTOF1OKWNP6rKNWsEY',
      nationalSystemAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPWNvbmZpZy51cGRhdGUtYWxsIiwidHlwZT1vcmdhbmlzYXRpb24ucmVhZC1sb2NhdGlvbnMiLCJ0eXBlPXVzZXIuY3JlYXRlIiwidHlwZT11c2VyLmVkaXQiLCJ0eXBlPXVzZXIucmVhZCIsInR5cGU9cGVyZm9ybWFuY2UucmVhZCIsInR5cGU9cGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwidHlwZT1wZXJmb3JtYW5jZS52aXRhbC1zdGF0aXN0aWNzLWV4cG9ydCIsInR5cGU9cmVjb3JkLnJlaW5kZXgiLCJ1c2VyLmNyZWF0ZVtyb2xlPUZJRUxEX0FHRU5UfEhPU1BJVEFMX0NMRVJLfENPTU1VTklUWV9MRUFERVJ8UkVHSVNUUkFUSU9OX0FHRU5UfExPQ0FMX1JFR0lTVFJBUnxOQVRJT05BTF9SRUdJU1RSQVJ8TE9DQUxfU1lTVEVNX0FETUlOfE5BVElPTkFMX1NZU1RFTV9BRE1JTnxQRVJGT1JNQU5DRV9NQU5BR0VSXSIsInVzZXIuZWRpdFtyb2xlPUZJRUxEX0FHRU5UfEhPU1BJVEFMX0NMRVJLfENPTU1VTklUWV9MRUFERVJ8UkVHSVNUUkFUSU9OX0FHRU5UfExPQ0FMX1JFR0lTVFJBUnxOQVRJT05BTF9SRUdJU1RSQVJ8TE9DQUxfU1lTVEVNX0FETUlOfE5BVElPTkFMX1NZU1RFTV9BRE1JTnxQRVJGT1JNQU5DRV9NQU5BR0VSXSJdLCJ1c2VyVHlwZSI6InVzZXIiLCJyb2xlIjoiTkFUSU9OQUxfU1lTVEVNX0FETUlOIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2OTE3OTM3NC0wNDQ3LTQ1NDUtNDU0NS00NTQ1NDU0NTQ1NDkifQ.StHB8amKf5H3yvn9APgt4Q1-pXzeNLnr-onZPA7M9L9yL8abtnQZXyp8_hQC6l2D9i0g6ZwBksSGGfJE_LeKvDILsuuztFF_p8Xe0-o0SjMOk19FavHvlW9SCitg4OvQnnkY-BIzzzfZAlVqPin29ASgjIz9xCJKxElOaRT6nrfBsMD8d-FmfloVo5clD_1fFbW_RX_F1ttQWbA1v3fgnv6IG58RFNkRbB7rM8pSDep113jvqvxxAQFxp6PFFGopYjDv41xWA59l7t_H0Re8pc4ohtrPEt9l_sl_x3JRS599XCmN0FeL8kDIOeh32NUgIuEwOb28bo04vYr5dEoctSNay8T3whq8HuFSJPQ_5D312t_YQQ_upiRHTISorhYqdIc5s4eUFLnF4JoVLny-UGwyTA1SJY3g0jrcQKZAuYr9_Cm7HrF7z9Udn17tPHXkn6boQZ2lLatP8xcayWtUjYw4N2aOOpjiLiIEomrOKjfpH0uuHUGiQcwZQzw3t8doO87-YMj4ZOqPSgyedgANVQX_YWQixu8dHt1NIhtNm3CWD-Jibu9LtBVDnXz-g8IdXSEriCzzcKPev7RJjKKt8141Jz5zGQGFq6szy2VWVbDB4GRV_4ef2c1BwYQ_UDY23-osXs-FLo6bG9bpxx5BETRMNtE8Xjxw_nbbn03Vfag',
      communityLeader:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuc2VhcmNoIiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyZwbGFjZU9mRXZlbnQ9bG9jYXRpb24iLCJ0eXBlPXJlY29yZC5yZWFkIiwidHlwZT1yZWNvcmQubm90aWZ5IiwidHlwZT1yZWNvcmQuZWRpdCJdLCJ1c2VyVHlwZSI6InVzZXIiLCJyb2xlIjoiQ09NTVVOSVRZX0xFQURFUiIsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjkxNzkzNzQtMDQ0Ny00NTQ1LTQ1NDUtNDU0NTQ1NDU0NTUwIn0.OtEJIltcGhl4cWNKOncXbPbcnAfuRQBxYaZGTtOOK8NhMDcd4XYRUKWpM9NE5zQ69TBZqWlasp684mHMqkWSM464eyiFBqRceq9RsGwUw1u63Lr2S34DeIHw3xyzCB-H_OBbmWsVIcC_Tcbcsx0vKzpKSLFTG3w5WX8xHS9NUdeFRSsseqY2tpjfuAq0J4oJ22xRzcFmbgJ2_6v4prD3lJh8esnabtsJDB_Vb5mOf4LuTU2KMI-_1Ttr9Dy_28NpYcbADlTGp4psODML73tDOWYB_SoTxc3PHKS71CYj3du2dIK51paFH9VE9r-kTonw4iRG92gVa4RdKuyI1Stw2Uf6NuUcMbMjhQD9VD_Mih0jSmDOhMuoYEkBblJDETazG-r2brZ5ooth-mjrf4BjhCbRqLmzSH9HH2LuCxJgOTBBgKPS-kpDY5OX8y5SLwcSJGl-y89xyssT7wbhVkJoR1MFUZup-lRiMnYcKGATfrde6lzhmuqwS_sSt4dqjfzuner9ytCIOR4pS8zIC1RKXMhu_o1QHhBLRZJspDMiIkEUx67U5UzBbV9XT3aRALyIOaZUGrlIFjhzxu4bolOxprzfBiRf4w2MR-hmzgsG7nDI8BWCF6DNeEKZ1StP_LjazJ5G-9rnwnIKk57YgcgAHTpsTOTJJouMBtXjGxQ-e-8',
      provincialRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9cHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsInR5cGU9b3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zJmFjY2Vzc0xldmVsPWxvY2F0aW9uIiwidHlwZT13b3JrcXVldWUmaWRzPWFsbC1ldmVudHMsYXNzaWduZWQtdG8teW91LHJlY2VudCxyZXF1aXJlcy1jb21wbGV0aW9uLHJlcXVpcmVzLXVwZGF0ZXMsaW4tcmV2aWV3LWFsbCxpbi1leHRlcm5hbC12YWxpZGF0aW9uLHJlYWR5LXRvLXByaW50LHJlYWR5LXRvLWlzc3VlIiwidHlwZT11c2VyLnJlYWQtb25seS1teS1hdWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCIsInR5cGU9cmVjb3JkLmNyZWF0ZSZldmVudD1iaXJ0aCxkZWF0aCx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGNoaWxkLW9uYm9hcmRpbmcmcGxhY2VPZkV2ZW50PWFkbWluaXN0cmF0aXZlQXJlYSIsInR5cGU9cmVjb3JkLnJlYWQiLCJ0eXBlPXJlY29yZC5kZWNsYXJlIiwidHlwZT1yZWNvcmQucmVqZWN0IiwidHlwZT1yZWNvcmQuYXJjaGl2ZSIsInR5cGU9cmVjb3JkLnJlZ2lzdGVyIiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLnByaW50LWNlcnRpZmllZC1jb3BpZXMiLCJ0eXBlPXJlY29yZC5jb3JyZWN0IiwidHlwZT1yZWNvcmQudW5hc3NpZ24tb3RoZXJzIiwidHlwZT1yZWNvcmQucmV2aWV3LWR1cGxpY2F0ZXMiXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IlBST1ZJTkNJQUxfUkVHSVNUUkFSIiwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2OTE3OTM3NC0wNDQ3LTQ1NDUtNDU0NS00NTQ1NDU0NTQ1NTEifQ.YUNYAtPmXmkGhKEmuItGbqKOlKbfylHtTPJNa9DvsilokdYNdDpZWTgeoW5xPQteQJi7TyMR4TbomIfqNSxnEO3aFpK1zPuhowvEEXrZ09KYiOgnWvgRnKVffAuV8th868CccJeYhaEwjzrvGwhLj0ZInbf_Yc9LovLPD8hjmRh29r9-wZRI8OK-Vfa6wssUQ44m7Bq_VWvKnPAmVU_WXWqWFWEUswl690mnVM1Xh0ZNB1cb1kcF2ngwnQPLuBt5U0YFL4nNXzJITKJDLbfQrbF0rTKOIC8YacV19buRIo69MMdaT_bDsT6HSuWcFYSJXX08KhU8PEt-aCDLtn-DbGrU5l32OWjYlad3m8rUv0g8OZxg4AEwMVkivlA2v2_pVMzr6jEKpAKYITXCcYHG97U7GXERx53qeGxLCYWb8p4dDXheTQwP-ukPoo55sbAV3XJtYrBbLB27l7eAugpQFo5EkVLNVb2rolGz3W3PYHVs0eZ8zpTrBWKT3TcQJ84PjiumOhi-GEdDAu9RR5xk_x5nqRoifo0CUqmt3IsqNj1-XRUrsm_U_mhyr1ge8jHiytj3m_1xAktYhEAIZlEyGjMQ6SEci3UzOSzh8huw7h1FFGh2ZNqkWq-vzlH0NNHq45Zye0LV3Z8Pa9hhhxihVgNoqXlSGov8b9IFzOE61SM'
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
       * Community leaders do NOT have record.declare — only record.notify.
       * They submit via the Declare form but the action is stored as NOTIFY.
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
        encodeScope({ type: 'record.notify' }),
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
