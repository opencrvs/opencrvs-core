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
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuc2VhcmNoIiwidHlwZT1yZWNvcmQuY3JlYXRlIiwidHlwZT1yZWNvcmQucmVhZCIsInR5cGU9cmVjb3JkLm5vdGlmeSIsInR5cGU9cmVjb3JkLmRlY2xhcmUiLCJ0eXBlPXJlY29yZC5lZGl0Il0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJGSUVMRF9BR0VOVCIsImV4cCI6NDEwMjQ0NDgwMCwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI4ZjhiNDMxYi1lZjQ3LTQwNjgtYjY3OC1lZjJkZDkzZTkyMDgifQ.djz70GEwmcoZwPY80dCOzYe_d9t6VK8Y0KKHZ8WstdbWAH5HZnu7JjyfJrZFr4-OQ9FQE6uNnQUlTrFZ0SjTsS-gk-b2n_JjYFTvLdv4o9nc1IEevUNpolwgJgmwyEcOHNfZSR7hNPcCaZ48ugAD4kf7dzLPkDAdLJvAdKW_UOZTguNLB5dVfuTMCkH4Gv4ijBQ3OCCg2D2QLmdXnqB2TsM59Su1inw48ALYvP4aewG1bDzvBnfqBfxsjnvBsgyaJIE0mXQOjC4mewUi4al-x-fTB02QeaXsgD6J_s8wurbVaB-ZRq1huwEGQFS6d9972iiOVz2O0hpxdkF5XvQ5wm8g5IliB3Qr0C3bhVzE5vUnCU8It0pJIvYzqF4qhrjEf3zRpRUOqqgoRAprNEM_exWBP3OCIrfJr9BVanbQVqxx0nmwUviYh_qAw08jYt9XWAXR2EXjZWulHl9udakDwpDssh5SULuSJ-JEw0gEVwgEX2HhRTIwA4gxolmCBqaSfWVoBjwj-OCURkr0cuJsiR2DKTMWRGD6qF-xWUWvbgDIyP4RBVb15mJwDTtkXfz-HoWehsvtLBSrr-pgrmjYZB2I6EIJMZy1BEmFZp4vs3qnySVdBkQ3Ic3_gQQZjgSDv2dTli7L_0eu4UHj1Sv-_8eN_6IbSFOdVVCNabZzpCE',
      localRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9cHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsInR5cGU9b3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zJmFjY2Vzc0xldmVsPWxvY2F0aW9uIiwidHlwZT13b3JrcXVldWUmaWRzPWFsbC1ldmVudHMsYXNzaWduZWQtdG8teW91LHJlY2VudCxyZXF1aXJlcy1jb21wbGV0aW9uLHJlcXVpcmVzLXVwZGF0ZXMsaW4tcmV2aWV3LWFsbCxpbi1leHRlcm5hbC12YWxpZGF0aW9uLHJlYWR5LXRvLXByaW50LHJlYWR5LXRvLWlzc3VlIiwidHlwZT11c2VyLnJlYWQtb25seS1teS1hdWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCIsInR5cGU9cmVjb3JkLmNyZWF0ZSIsInR5cGU9cmVjb3JkLnJlYWQmZXZlbnQ9YmlydGgsZGVhdGgsdGVubmlzLWNsdWItbWVtYmVyc2hpcCxjaGlsZC1vbmJvYXJkaW5nLGxpYnJhcnktbWVtYmVyc2hpcCIsInR5cGU9cmVjb3JkLmRlY2xhcmUiLCJ0eXBlPXJlY29yZC5yZWplY3QiLCJ0eXBlPXJlY29yZC5hcmNoaXZlIiwidHlwZT1yZWNvcmQucmVnaXN0ZXIiLCJ0eXBlPXJlY29yZC5lZGl0IiwidHlwZT1yZWNvcmQucHJpbnQtY2VydGlmaWVkLWNvcGllcyIsInR5cGU9cmVjb3JkLmNvcnJlY3QiLCJ0eXBlPXJlY29yZC51bmFzc2lnbi1vdGhlcnMiLCJ0eXBlPXJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInR5cGU9cmVjb3JkLmN1c3RvbS1hY3Rpb24mZXZlbnQ9dGVubmlzLWNsdWItbWVtYmVyc2hpcCZjdXN0b21BY3Rpb25UeXBlcz1BcHByb3ZlIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJMT0NBTF9SRUdJU1RSQVIiLCJleHAiOjQxMDI0NDQ4MDAsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiYWExM2EyNjgtYWU0OC00YTMwLTk0NTAtNTU0YWViYWFiMjAzIn0.g-FrNFQmHXTbxp7gKUcb9--3ukiQM7-8XfEBW55vd3KAIr11Rl4pczYNlSS2Pk790Ok0_rwWy66vprEie4M051h9OwUdnPd6IQprHoS-lJOBvw-dJUxjazIWPsRpZ_TyBm3kmmv5vb1C0i3qmQX0nFdv4KIo8x8qdsCCAqjLPjC87swQogeHIx-l7tHfCK602nnPVwN2J7FcmeQVR3SHzG1cc-lEpMX1zOtgQjdt6cIr9Xf1kxFU-bh_Rbe_677c0s9wi4VfC45I2GGgfjJwzb8VXo0F6UNVcSbmZEywvgGl0FubUSQodIenQMZX6lCrXAuaCTlB7pmdsXx-AFq1_MGfyXrcY50RC189SbRL76GORD4GLWkTVcXSjO_ToVKDaVu1JO9ou3C7HR_L2GIaTy-kpK8-N58BWGCv5374resvzfTIBjLjG1lx9DoLV5Ga86I_68gbnsGyu1fLgMQERgctGeYCJqgLNjHqWKqR8eaERBP9HA4zWo3uti75HhrQq2prqc0qMtmNDpihXSN_Mmgh9gpp1q-eLB5tRrdFFcnEJiFZFH_IRhaOrjevATUPxLQvEqppVSpTCgQKkAKUqvgfBda6A9YiVPDY3ONryHxLfpMDY78gQ0dNya9PcpHMyKAPvp0D0i3EIhBTIGOEGY3myevNd5-3cZND9trCOUw',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9b3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zJmFjY2Vzc0xldmVsPWxvY2F0aW9uIiwidHlwZT11c2VyLnJlYWQtb25seS1teS1hdWRpdCIsInR5cGU9d29ya3F1ZXVlJmlkcz1hbGwtZXZlbnRzLGFzc2lnbmVkLXRvLXlvdSxyZWNlbnQscmVxdWlyZXMtY29tcGxldGlvbixyZXF1aXJlcy11cGRhdGVzLGluLXJldmlldyxzZW50LWZvci1hcHByb3ZhbCxpbi1leHRlcm5hbC12YWxpZGF0aW9uLHJlYWR5LXRvLXByaW50LHJlYWR5LXRvLWlzc3VlIiwidHlwZT1yZWNvcmQuc2VhcmNoIiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyIsInR5cGU9cmVjb3JkLnJlYWQiLCJ0eXBlPXJlY29yZC5kZWNsYXJlIiwidHlwZT1yZWNvcmQucmVqZWN0IiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLmFyY2hpdmUiLCJ0eXBlPXJlY29yZC5wcmludC1jZXJ0aWZpZWQtY29waWVzIiwidHlwZT1yZWNvcmQucmVxdWVzdC1jb3JyZWN0aW9uIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJSRUdJU1RSQVRJT05fQUdFTlQiLCJleHAiOjQxMDI0NDQ4MDAsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiODYxZmEwNDQtYzhjZi00ZDlkLTljYmMtZjdhMmUxZDViOTRhIn0.CUqakowjCxfmGnL4UJqVyejUMfzXtrkCL4f4qDZF8T26ZrZ6XpsFjNeHhIOsBq-LKiycPnMbIgG8ekGXhGER7Y6j3AfkrpAyfh3LrKuWMxLZ-0CK7skWLz9yhfXQyq7c_1pN5VafCcVRBg2JnzJN7Yxbt36tlAtS6Tae8YaqK8DcL0ddhAPQhSU-nhu1Ih4AB3VvzEv4ejdNnRTxEJNieRoOURPmY6_MSnk8snxP611eLhV3fP5JUEt-1rFNo2ngAus17InTadao6u3SFj2lwTPQYx9hxDmPfV8L5AKM6gjSCadSIHZ6MUhD7EGskDuUHU2aU-5KNSeyUQ547oDJLaf7fSjYrtVzwEVk6O8-sfHpch8lmt-nVBN1HMaEwvPkZQDQgpopExX7fG_2EH3KXtBmmGq8Rahufg-H9duLc3M76B9jCFtOqNnVIeWYkuyUvuj7ddUghTAOFHS6Tt72qucKdHqxGKoGaH4lcE8VpbTcJ087jVK_hEtJbeUmRA5Eg7zaYnZfQxUXfJJLKa-CKLBw9ikktq_yDJfU0NU5GtPV4_iNAf4efrX6ksRbou1F71zMWnqej5__Yh86qSFpI91lUU4zmUAyBhWRi5BoKdbqIIdF4zx3DsrExivKWIwyAjZbJcrt15bnxIX1rMBGVJdx5OfQxjKsxP1zLQKpP9k',
      localSystemAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXVzZXIucmVhZCZhY2Nlc3NMZXZlbD1hZG1pbmlzdHJhdGl2ZUFyZWEiLCJ0eXBlPXVzZXIuZWRpdCZhY2Nlc3NMZXZlbD1hZG1pbmlzdHJhdGl2ZUFyZWEmcm9sZT1GSUVMRF9BR0VOVCxQT0xJQ0VfT0ZGSUNFUixTT0NJQUxfV09SS0VSLEhFQUxUSENBUkVfV09SS0VSLExPQ0FMX0xFQURFUixSRUdJU1RSQVRJT05fQUdFTlQsTE9DQUxfUkVHSVNUUkFSIiwidHlwZT1vcmdhbmlzYXRpb24ucmVhZC1sb2NhdGlvbnMmYWNjZXNzTGV2ZWw9YWRtaW5pc3RyYXRpdmVBcmVhIiwidHlwZT1wZXJmb3JtYW5jZS5yZWFkIiwidHlwZT1wZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJ0eXBlPXBlcmZvcm1hbmNlLnZpdGFsLXN0YXRpc3RpY3MtZXhwb3J0IiwidHlwZT11c2VyLmNyZWF0ZSZhY2Nlc3NMZXZlbD1hZG1pbmlzdHJhdGl2ZUFyZWEmcm9sZT1GSUVMRF9BR0VOVCxQT0xJQ0VfT0ZGSUNFUixTT0NJQUxfV09SS0VSLEhFQUxUSENBUkVfV09SS0VSLExPQ0FMX0xFQURFUixSRUdJU1RSQVRJT05fQUdFTlQsTE9DQUxfUkVHSVNUUkFSIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJMT0NBTF9TWVNURU1fQURNSU4iLCJleHAiOjQxMDI0NDQ4MDAsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiYmI4YzUzYWItODdhNi00NDkxLTllZmYtMmE0MjllZTAyYTNhIn0.IZ03RbmbBWystZZdZ5DjsdNvaWYTZ7p4Xe7N8zH_BzzESqVwfzY120QVUxznJDwZJgyW6_E3WFTdJks9t112D5XZlXFWKE96VcgegP_Bq72Rw7GU4FUXctIQqn4hzf1R_FTuyDQNOpEVFbjO545Z4Jzb-krGLa_CYlTUUsHoyHwCCj2vXRDC_xuS0asQwXJCWCMI5gyStcOHuehN1Nlv5NTxBpNxdrH2JGANbpxCJ2OMhMSTPR_EmzpUlzuUWFLV2eRKtzjZP3y7-ePmNcNETodU-Rb03wqVKPEVTfq08iMdBc7LXEhHVY2BOoyMO9tAZ_zW5TvUj3I8hSSBlIbHZ-WeeXxS84_4_4sPSpYl8JAv_Rb5XoB5zNLPAe9_fh9_0GgJ1pioETauNyylOLbaRFF9uQMP57J_Lx82QwGdLpZlynlbWPpWUcUN5MHV4cPW5p-wp9RKvEdR5o3RHzaweCr-QKHCtMxnmfYDU1uBxxuKrSrRdoBuxFZN9_0uvUCZfi9LyM4f2P7IOidDKWesfjmszH8bBONRMR5F4iwoVB-Sk-DJFDTF6gKy6gR0Du7cZRgEFTGlwM-5P0jh6l80mq11wa0iDypMhdQtfKI7PLI5Mn7818ljIaFe1XpBISDgj9Vjrkdg_ke8g_YiCCxXt9oS3JFTGxPKGdUvn3H7_Yw',
      nationalSystemAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPWNvbmZpZy51cGRhdGUtYWxsIiwidHlwZT1vcmdhbmlzYXRpb24ucmVhZC1sb2NhdGlvbnMiLCJ0eXBlPXVzZXIucmVhZCIsInR5cGU9cGVyZm9ybWFuY2UucmVhZCIsInR5cGU9cGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwidHlwZT1wZXJmb3JtYW5jZS52aXRhbC1zdGF0aXN0aWNzLWV4cG9ydCIsInR5cGU9cmVjb3JkLnJlaW5kZXgiLCJ0eXBlPXVzZXIuY3JlYXRlJnJvbGU9RklFTERfQUdFTlQsSE9TUElUQUxfQ0xFUkssQ09NTVVOSVRZX0xFQURFUixSRUdJU1RSQVRJT05fQUdFTlQsTE9DQUxfUkVHSVNUUkFSLE5BVElPTkFMX1JFR0lTVFJBUixMT0NBTF9TWVNURU1fQURNSU4sTkFUSU9OQUxfU1lTVEVNX0FETUlOLFBFUkZPUk1BTkNFX01BTkFHRVIiLCJ0eXBlPXVzZXIuZWRpdCZyb2xlPUZJRUxEX0FHRU5ULEhPU1BJVEFMX0NMRVJLLENPTU1VTklUWV9MRUFERVIsUkVHSVNUUkFUSU9OX0FHRU5ULExPQ0FMX1JFR0lTVFJBUixOQVRJT05BTF9SRUdJU1RSQVIsTE9DQUxfU1lTVEVNX0FETUlOLE5BVElPTkFMX1NZU1RFTV9BRE1JTixQRVJGT1JNQU5DRV9NQU5BR0VSIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJOQVRJT05BTF9TWVNURU1fQURNSU4iLCJleHAiOjQxMDI0NDQ4MDAsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiYjE4YjFjZDQtODVlMy00Y2FmLWI2MGYtNTM3Y2I3OTBmMjA4In0.gOIdKzO9BC6JfJoMbw8_-ekfGHPPckkvHpNzI293SRj5xJHkW-IrIzIAEXEHfYRsPp4SZu79qPm9FgiHmeNJjr46RAtKZB7OS8-vIp7oyYIkuw91SzgQRgmooG9MfFIIFeY4AxS9MmM-lz9XRoQr0Rmod-whpcBl-L5KyxKrTnKq7uR2cAbGN6_Lg_LRQA3id4sqBKu8Fi5Yg6FEw5ax9sCM0WjQl3HTIAMaswRw6JWuHxlGzs77IncNrwTEm1AUFmOl45-fpNsxTxXy9E5_xmM8z6McVAnnf5xkIk4EwBr0-ni1_7Nt5oALkmSMxoLnmDxHRf7fHroMmOAg6BNp_56gSdtWZinTdNlVz-VXuuqCq2ZBrqkKEOCkgR60_zmdb3cmRPb7odDknYVUvi9yZzH7B_iZQh41bd9wV1v8M0VM5WtI6Cg0ImrKKnK4N0uwA6hbPvTHTI6CmDAmYHLUg0DRoBTUF4efwydPl0Romf0bX5DaalH6YNwBaRyoF38_XonAWBYCDw_ouk3gXcSM5XHoovy34Py_3ofAdb8hAo82DivbgvDolZ1P9mGYtpBR1ruTGqJhw-mzkFZwr5qZP8QGmmdyJ7WQ2nRGsoKqqoE7ft_r7-BfApK7I5AJ5rxzqP9hVoSEcqqPC9HBvzG5d7LUAgoZL3MxSYVKznNcs3s',
      communityLeader:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyZwbGFjZU9mRXZlbnQ9bG9jYXRpb24iLCJ0eXBlPXJlY29yZC5yZWFkIiwidHlwZT1yZWNvcmQubm90aWZ5IiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCZwbGFjZU9mRXZlbnQ9YWRtaW5pc3RyYXRpdmVBcmVhIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJDT01NVU5JVFlfTEVBREVSIiwiZXhwIjo0MTAyNDQ0ODAwLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6ImM4NzdkZGEwLTAzNjItNGFmNi1hODhkLTVhYjhmMzU4MDMwZSJ9.CA2i2i9F1gXOHpSCvn8UhwYWpiCedUVxk-uQL4tWmKtRWDUHvlA--NR0bBL4wGVMfg3DqothplZHPlIqN-I0NThHyGEZzRF2HsmXRfKJuwXNWM5MZpPpCeezsmTm3ON7CMK6etlsyc5xInmlSByxDLxCPwEH0_pyp7l5T0gT0itU1Ykt4lgcDVGIsCk3F-VW0FFHL4QCkFAOKreFQOf3cMjC5ulkYdai8jDe8bjMas8aqO-Ry7JRtQH82bD4C6RU44mdSIawBXaMkL4xSp7lXPKUSiFidtiQweGCXZp3IN25tv85r2JiWXV4Ang690ODh9cJNOq86JV9zIOLVxJ55_ycqeRQ0clIAhsKUDKANdOy87c_60dHjBnnLRyr9sDeY1p3yecq6TZpe4EWuOg2gUwpHg2axjDBrG3X_zNchx8xvfYcEiRJfcv4LAVembBiJIE6hhZ1G1fwSKCnugY7EAMkoKhA44TMJPbbeag2LxuWtgltQ6UPPAqVozHPeUI05rB4rfL9vqHYDm7ADYPx9g0j0dRaZ7RQWWI4zemY-7wK2-AtV8boatwkUCZZ0lP_gPqwtc9-N6nr4weWZYo-VZNAijAEhyv4U6-8VvSPZagJxDJ6RONTXjwTUAmwG7KZjW-1eGZkMvULkhxKnnPEul0DvzUY2K_L5wSHD6XYxls',
      communityLeaderRegisteredInLocation:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyZwbGFjZU9mRXZlbnQ9bG9jYXRpb24iLCJ0eXBlPXJlY29yZC5yZWFkIiwidHlwZT1yZWNvcmQubm90aWZ5IiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCZyZWdpc3RlcmVkSW49bG9jYXRpb24mcGxhY2VPZkV2ZW50PWxvY2F0aW9uIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJDT01NVU5JVFlfTEVBREVSIiwiZXhwIjo0MTAyNDQ0ODAwLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6ImM4NzdkZGEwLTAzNjItNGFmNi1hODhkLTVhYjhmMzU4MDMwZSJ9.gtzbGLDBkJhiGa5ocQ8lTmvrAZzdpWiI9JEdJjs9ZIbOyeYLYr3LMddA8s9N8vNQMOqmYulF8BqofyENStoOoLXA5w87mQE50jcZ68wq-qnIsP5TPcvnpKQP0waKSfoa1dtbCliB4XAYlHCSqO36MenTq6ZCA-Ey19DBSN79Qs2LQgFzo60_qBZA3x4XtlMBv0Y9QsKvEzTyXqP1YZATG4RMye9WWWqPCyIcytFeFJAykGYN1HkmZvwpFv5reDfqHkROi9kT1php0UlUAX4eyb4Bqhl5Y8i7l6nbzLxf66SytN1WPGY30U9RIPPnKDC3D_bDOKjKJdW5qSy3n7Oec36QmNHkdSoYMOIBTy99EfMW7sf0No864U6jXRC6reQ4Oo-aBiHkdzIEvpV2r-DI0zBeOYQYHI3gzIYZsKxUWWxCSuNpFhSvSmcqsm26ntLx_-FKE4gpy23-5bCkhL9GsUNJG_Pxjfnur-psG_ajzgvIy-QnKSA1vZPRHC9fZrGIYe6Ps2MdmO4whsJVIkcnmo-2bWXFrCUn27_BKrzBv1J1V3ZECD2Hx_zXQa7uVszndpfcj2PKpkh-oZhMb1jPPRZHrP66oZNJrHOI084dM5vNxTG6G4UbFzbkTCw_5hTzeqfImYWLTf1ogXGupYxIhkNSkN5qO2AH9NmoaFZUAEc',
      communityLeaderRegisteredInAdministrativeArea:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyZwbGFjZU9mRXZlbnQ9bG9jYXRpb24iLCJ0eXBlPXJlY29yZC5yZWFkIiwidHlwZT1yZWNvcmQubm90aWZ5IiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCZyZWdpc3RlcmVkSW49YWRtaW5pc3RyYXRpdmVBcmVhJnBsYWNlT2ZFdmVudD1hZG1pbmlzdHJhdGl2ZUFyZWEiXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IkNPTU1VTklUWV9MRUFERVIiLCJleHAiOjQxMDI0NDQ4MDAsImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiYzg3N2RkYTAtMDM2Mi00YWY2LWE4OGQtNWFiOGYzNTgwMzBlIn0.hoT6a8fi7x7kfkwnPg52o5NKq4tEIVtAegpOc97RcvO_DAb279z7vNSDKEymWYB04lXsaqMqSDL42__6_UNGEC71CbF5v793Dyx6SN6VNw6_ovEpr3EerZ5TVlKijnL7wcGYvIE64hwtu4YrqOibpCcOnZdlJGP56wMxCC0ZRW_7dxxpMx_0lbl1zNNyfqRiB6U1ebUjtufUqeuygwAAgNjZ3qKygXsld3958CfbuuiCUgzo8B4LKyzC68v43GJc3YF_vJhFFnqZ8JhSz8_P8JUk35NR3Jzc0JmLju-x8xWQu_4CCVTOp9dV5oXl1qhQFUgz16jxeMPIvI8A21oDV2nx4YnCe9XZy53tbuHL-vrF3zSuZomDQdv1PXGMmiGNdspVlQ-J07w_q1YyyRlqWzTen16187QTxWOD6oOnZ2PIX4ateECC3w96H5opy7-CDb8oSO6qaLy_QmYoSTkD9_jalw-eLQ-1XVfAUSqh7iow4_pmq-lR7onjNc3L9PmOq2AVVjqlh_FR3KGYTCboXPIdqbAXTpu6s4ImhELEnH3Rns_wBx7Doma1VjFkdAz9VTJxbX3otnk0kU-PRWt1lBGUbhfGOVzAouiHHl72iQj6-MsGmL4amaCWchGuBGyyRId8MYFvxst7Lln-mIgeyBZvkCR5sv09dxMUUfEBigw',
      communityLeaderMultipleSearchScopes:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyZwbGFjZU9mRXZlbnQ9bG9jYXRpb24iLCJ0eXBlPXJlY29yZC5yZWFkIiwidHlwZT1yZWNvcmQubm90aWZ5IiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCZyZWdpc3RlcmVkSW49bG9jYXRpb24mcGxhY2VPZkV2ZW50PWxvY2F0aW9uIiwidHlwZT1yZWNvcmQuc2VhcmNoJnJlZ2lzdGVyZWRJbj1hZG1pbmlzdHJhdGl2ZUFyZWEmcGxhY2VPZkV2ZW50PWFkbWluaXN0cmF0aXZlQXJlYSJdLCJ1c2VyVHlwZSI6InVzZXIiLCJyb2xlIjoiQ09NTVVOSVRZX0xFQURFUiIsImV4cCI6NDEwMjQ0NDgwMCwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiJjODc3ZGRhMC0wMzYyLTRhZjYtYTg4ZC01YWI4ZjM1ODAzMGUifQ.AI0Ls7OpsOcUCgoJpg1e7iZxkcLNt18FfVbucw6jnORrU8_aSRoquKd_238ghcOCm0YPERvqWHJbishTHYLol5CRTanolh6BXaMdiNtMm-qyzYjgeX9-SUHjxcvpeqTIAa-nz6Pv-iisw-mRJLSxB7ge7gq4R51eoOhflYAG2mXvA1sFGn2Kv_PqsSNltVsayKI211o1oaQgcu62_Jpvt7WvWcAJ9oLlk28m2lLDFtIo9oIs4fn6JWqLHhXMJs8yo4H45PX4keE459ZU2mCRIETlAp80u3s3_-dQZ_VvRh1GGyu5XpLIzPrwS-eOsySAfDrcgJBWhZQi7pJs9RUqZqYcxKDUtTD_K7WYmO_Knw_DOwlCkabnZMCwJpwSdvvFUpFJqE1hP__Y85M_44ymFzYqTYJ785ko6fqVIGHmS6rcSdXVCvsq6QhtLsp9C6qj7ntW7mxYwaFuwuS69ntPeUjEcT7Vd9BmiCWAGXafkduFCVsz9ezhjG4hX-hAlP4HqMtYc1RPcDSeqPCUvLV7M2_cj4EKfCfTFx9s5MwJMn0hILk2GSinQN-QsyT73MijPLxYGpCbLLnEB5lR4p29MCrZ0SszPks83u-_5tRbP1xT_KFzg5Deol5M4VQCHOLIquCPIEsi5htBom0DswKu_fcmzzLUQIoKb15ieZdyQnk',
      communityLeaderSearchAllAndLocation:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXdvcmtxdWV1ZSZpZHM9YWxsLWV2ZW50cyxhc3NpZ25lZC10by15b3UscmVjZW50LHJlcXVpcmVzLXVwZGF0ZXMsc2VudC1mb3ItcmV2aWV3IiwidHlwZT1yZWNvcmQuY3JlYXRlJmV2ZW50PWJpcnRoLGRlYXRoLHRlbm5pcy1jbHViLW1lbWJlcnNoaXAsY2hpbGQtb25ib2FyZGluZyZwbGFjZU9mRXZlbnQ9bG9jYXRpb24iLCJ0eXBlPXJlY29yZC5yZWFkIiwidHlwZT1yZWNvcmQubm90aWZ5IiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCZwbGFjZU9mRXZlbnQ9bG9jYXRpb24iLCJ0eXBlPXJlY29yZC5zZWFyY2gmcmVnaXN0ZXJlZEluPWxvY2F0aW9uIl0sInVzZXJUeXBlIjoidXNlciIsInJvbGUiOiJDT01NVU5JVFlfTEVBREVSIiwiZXhwIjo0MTAyNDQ0ODAwLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6ImM4NzdkZGEwLTAzNjItNGFmNi1hODhkLTVhYjhmMzU4MDMwZSJ9.lVUwf-2NjI6XLBgujR6chRCTIikkK3GT5UJI3_Ze3L-dWna3lDsse3WMcwQ4xH7gUzkTAtGwfWU4itkuLSFRvPlFfBEvhwVXF8otdU2WpsrMMptRtCTbWl7rUbc5Kl4uzZXwcciDOYSJiJ_koFHVZHULJZqmOFQL-oPLZM3O8N0vyEYMCwTD_VMWusJQp851Hs4ZdDeI7WKTECdydy62SUwoEba5GDkKwTw3mm3eeG2JTcox_xaotLWMt1yef9YdvmK1xtlPcfiaX2o3i1Lm2Pnz4VIJypJdI0b_ofx1OzlmDrpnLjbO260_P31ZydmiRNWliR34pIFkQIqVhkdV7i8By-21tpBveOqu14sSfw2bMrohB0orGEdKhyldAudVDfET-skU9-ZGAGzjVVJ5ijL0c9orEy31YNdJ1kkD3-7N__JdXLutUIls0se1V8bMJnt-nPfbrR5r3es_mbgSvvCZ98pUYgs-SW1FGUsfAypmBwIFqZnfnzaNihKanaPO3LFyh7vCiTaN_1ntuZlao8aljlPfr1SyhPKAqnh1DYV3xbFpSlSmGrgMzZsEOF8mpdFRoSBiYutjb5_I-GH8D16CrUYFySxNkqGs97Ozq275Akytuloio7106rxfkqijFdKWSrCR2HkFb3VBWCpZRReLss3K_XDiIEHG_8GVUBY',
      provincialRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQiLCJ0eXBlPXBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInR5cGU9cHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsInR5cGU9b3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zJmFjY2Vzc0xldmVsPWxvY2F0aW9uIiwidHlwZT13b3JrcXVldWUmaWRzPWFsbC1ldmVudHMsYXNzaWduZWQtdG8teW91LHJlY2VudCxyZXF1aXJlcy1jb21wbGV0aW9uLHJlcXVpcmVzLXVwZGF0ZXMsaW4tcmV2aWV3LWFsbCxpbi1leHRlcm5hbC12YWxpZGF0aW9uLHJlYWR5LXRvLXByaW50LHJlYWR5LXRvLWlzc3VlIiwidHlwZT11c2VyLnJlYWQtb25seS1teS1hdWRpdCIsInR5cGU9cmVjb3JkLnNlYXJjaCIsInR5cGU9cmVjb3JkLmNyZWF0ZSZldmVudD1iaXJ0aCxkZWF0aCx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGNoaWxkLW9uYm9hcmRpbmcmcGxhY2VPZkV2ZW50PWFkbWluaXN0cmF0aXZlQXJlYSIsInR5cGU9cmVjb3JkLnJlYWQiLCJ0eXBlPXJlY29yZC5kZWNsYXJlIiwidHlwZT1yZWNvcmQucmVqZWN0IiwidHlwZT1yZWNvcmQuYXJjaGl2ZSIsInR5cGU9cmVjb3JkLnJlZ2lzdGVyIiwidHlwZT1yZWNvcmQuZWRpdCIsInR5cGU9cmVjb3JkLnByaW50LWNlcnRpZmllZC1jb3BpZXMiLCJ0eXBlPXJlY29yZC5jb3JyZWN0IiwidHlwZT1yZWNvcmQudW5hc3NpZ24tb3RoZXJzIiwidHlwZT1yZWNvcmQucmV2aWV3LWR1cGxpY2F0ZXMiXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IlBST1ZJTkNJQUxfUkVHSVNUUkFSIiwiZXhwIjo0MTAyNDQ0ODAwLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6ImYxMTU1OGYyLWZmNTctNDM4Mi05ODc1LWQ1OGY0MjA2YjQ3ZiJ9.CLq35587gc_tIbadEVD7hRGpObi8BcCE3ZpmP4TridtE0UelRcFCVOE4MGwimdNfP287Juh33iwAhCXBTbQtUoNAR0veD2V6mIyCivkVkNLAWE5mvRXL9mky43xpGLLBE_dmXrvHpix_j9-l4ZUKNR1yD0ylXd6AjRx_qDd3rKlO9XMytYGSWXwcWdoaOMxbngW2h5I_Qg5aCYJ1cmyBwgchJjVBaSSWkYOvRrJWAg0cPg214En8WMxk2XLhg1b76JlOeFxJW-gPDmeiJL9A1Iic8ZQXdf5Egr8FGvrlvG1x6BdOcPEClek2zYHRr6xxIT_bBNczQLGyRCHZaHGChTat_oZlp-x1agljFORgUFmhfhtW58jmHUXiVp629wI5u1bupz9laK1RGlBm0mSK_nAv9_Ewqod3cWuyuLTATwu-gqGY5Wex7SxannrBn8q1RwEUQmFRXMUoRI7AOpNQDuVyW9CJ2pxb_llBPhCqtlZVtChW11vp1T7RArxngf4yW0N3FaCdVBlbe1uQGuNVmAdqJ8P4IT_TnhodF-0B8kmDrnzuE44Iq6rNQ81ZjUw85TcmJ5HDxTCWVNuD02PxNsp_ACYPjzNp-CdKWffkHo-PT-M0dXO4ogyIzo_BHHQRWU8i4OCqBB9xQzbtGbJwRFeyfeiFSR77mM14OUzqa2s',
      testAdmin:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ0eXBlPXVzZXIucmVhZCIsInR5cGU9dXNlci5jcmVhdGUmcm9sZT1GSUVMRF9BR0VOVCIsInR5cGU9dXNlci5jcmVhdGUmYWNjZXNzTGV2ZWw9YWRtaW5pc3RyYXRpdmVBcmVhJnJvbGU9TE9DQUxfUkVHSVNUUkFSIiwidHlwZT11c2VyLmNyZWF0ZSZhY2Nlc3NMZXZlbD1sb2NhdGlvbiZyb2xlPUNPTU1VTklUWV9MRUFERVIiLCJ0eXBlPXVzZXIuZWRpdCZyb2xlPVJFR0lTVFJBVElPTl9BR0VOVCIsInR5cGU9dXNlci5lZGl0JmFjY2Vzc0xldmVsPWFkbWluaXN0cmF0aXZlQXJlYSZyb2xlPUxPQ0FMX1NZU1RFTV9BRE1JTiIsInR5cGU9dXNlci5lZGl0JmFjY2Vzc0xldmVsPWxvY2F0aW9uJnJvbGU9UFJPVklOQ0lBTF9SRUdJU1RSQVIiXSwidXNlclR5cGUiOiJ1c2VyIiwicm9sZSI6IkZJRUxEX0FHRU5UIiwiZXhwIjo0MTAyNDQ0ODAwLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjhmOGI0MzFiLWVmNDctNDA2OC1iNjc4LWVmMmRkOTNlOTIwOCJ9.aYNX6ZkHMCXmRw1_LN4oMRdHxCckpR3Z_zORk7u9HNfq_lc2EosXaXIjBuixICHGxQh7MWk_edYZHJ72ZtmRjx-g3XnGVaI0XfFcgcljz79Iq1p1cYnkrdeo7EtKAGz2b2jZUhoWg5-LC_tFlry5jgmdllE4Hsn2pcDxMZdI_ztBs-ys3nYXwfAz3t16UQwMXgL0gIwgaCwd9_mQ7vpOH5gRIkRMt_FNbRo0lqM5VAQyuJREFi9n0zfBBKr-RUShCbkSfsLVbXrxRMIP0yFX-Jy3d2838MOQOh3UoNJZc6uCxxj3AcIS3_1eWmvo2WUblRvo6XqUd2D38a_MmMCFASKkNgTgoAzuicTkJLwSYJ7aNAERCHoGaRMmxYJFNJKTjeyj566Ud-8qlkDOuU5w2APwjhmfbtUxMy3FvfgBAeAyCXx5rjzux3L-9rqWPTSSMC2Qniw2tcvSuMa83Wx76zozG6T9Gk5so16MakCtCM45YHpILjzTb8h02tlJ93tzrGWyc_TIKxCTLV6X3VXNEKKlY0sol50MiUg5WZ9hwQdFyE1AdV_eE0DBNrhLibIdfDCSqFKpI5U5XpFgTcs0cC97pa4z1o-wC3JK6fpjdIpyIHMVIV99pcSQEps96KE4nXeIN0IP8zYXLzZ1mrSiAlVrt4dZQRVi3LmXF4IHzec'
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
      /** record.search restricted to user's own office only (registeredIn + placeOfEvent). */
      communityLeaderRegisteredInLocation: [
        ...communityLeaderBaseScopesWithoutSearch,
        encodeScope({
          type: 'record.search',
          options: {
            registeredIn: JurisdictionFilter.enum.location,
            placeOfEvent: JurisdictionFilter.enum.location
          }
        })
      ],
      /** record.search restricted to user's administrative area (registeredIn + placeOfEvent). */
      communityLeaderRegisteredInAdministrativeArea: [
        ...communityLeaderBaseScopesWithoutSearch,
        encodeScope({
          type: 'record.search',
          options: {
            registeredIn: JurisdictionFilter.enum.administrativeArea,
            placeOfEvent: JurisdictionFilter.enum.administrativeArea
          }
        })
      ],
      /**
       * Two record.search scopes: both registeredIn and placeOfEvent paired.
       * Most relaxed (administrativeArea) wins for each attribute.
       */
      communityLeaderMultipleSearchScopes: [
        ...communityLeaderBaseScopesWithoutSearch,
        encodeScope({
          type: 'record.search',
          options: {
            registeredIn: JurisdictionFilter.enum.location,
            placeOfEvent: JurisdictionFilter.enum.location
          }
        }),
        encodeScope({
          type: 'record.search',
          options: {
            registeredIn: JurisdictionFilter.enum.administrativeArea,
            placeOfEvent: JurisdictionFilter.enum.administrativeArea
          }
        })
      ],
      /**
       * Two record.search scopes: one without registeredIn (defaults to 'all') + registeredIn=location.
       * Most relaxed ('all') wins — same result as having no restriction.
       */
      communityLeaderSearchAllAndLocation: [
        ...communityLeaderBaseScopesWithoutSearch,
        encodeScope({
          type: 'record.search',
          options: { placeOfEvent: JurisdictionFilter.enum.location }
        }),
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
