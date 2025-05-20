import { graphql } from 'graphql'
import { getApolloConfig } from './config'
import { generateQueryForType } from './query-generator'
// import { addMockFunctionsToSchema } from "graphql-tools";
import { addResolversToSchema } from '@graphql-tools/schema'
import { promises as fs } from 'fs'
import path from 'path'
import { Context } from './context'

const schema = getApolloConfig(false).schema!
const root = { fetchBirthRegistration: () => [] }
const query = `{ fetchBirthRegistration(id: "234") { ${generateQueryForType(schema, 'BirthRegistration')} } }`

async function main() {
  const bundlePath = path.join(__dirname, 'bundle.json')
  const bundleJson = await fs.readFile(bundlePath, 'utf-8')
  const bundle = JSON.parse(bundleJson)
  console.time('foo')
  const context = new Context({
    headers: {
      authorization:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyZS1iaXJ0aCIsInJlY29yZC5kZWNsYXJlLWRlYXRoIiwicmVjb3JkLmRlY2xhcmUtbWFycmlhZ2UiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci11cGRhdGVzIiwicmVjb3JkLnVuYXNzaWduLW90aGVycyIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLmRlY2xhcmF0aW9uLWFyY2hpdmUiLCJyZWNvcmQuZGVjbGFyYXRpb24tcmVpbnN0YXRlIiwicmVjb3JkLnJldmlldy1kdXBsaWNhdGVzIiwicmVjb3JkLnJlZ2lzdGVyIiwicmVjb3JkLnJlZ2lzdHJhdGlvbi1wcmludCZpc3N1ZS1jZXJ0aWZpZWQtY29waWVzIiwicHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsInJlY29yZC5yZWdpc3RyYXRpb24tY29ycmVjdCIsInJlY29yZC5jb25maXJtLXJlZ2lzdHJhdGlvbiIsInJlY29yZC5yZWplY3QtcmVnaXN0cmF0aW9uIiwicGVyZm9ybWFuY2UucmVhZCIsInBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsInBlcmZvcm1hbmNlLnZpdGFsLXN0YXRpc3RpY3MtZXhwb3J0Iiwic2VhcmNoLmJpcnRoIiwic2VhcmNoLmRlYXRoIiwic2VhcmNoLm1hcnJpYWdlIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LWp1cmlzZGljdGlvbiIsInVzZXIucmVhZDpteS1vZmZpY2UiXSwiaWF0IjoxNzQ3Mzg5ODIyLCJleHAiOjE3NDc5OTQ2MjIsImF1ZCI6WyJvcGVuY3J2czphdXRoLXVzZXIiLCJvcGVuY3J2czp1c2VyLW1nbnQtdXNlciIsIm9wZW5jcnZzOmhlYXJ0aC11c2VyIiwib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwib3BlbmNydnM6bm90aWZpY2F0aW9uLXVzZXIiLCJvcGVuY3J2czp3b3JrZmxvdy11c2VyIiwib3BlbmNydnM6c2VhcmNoLXVzZXIiLCJvcGVuY3J2czptZXRyaWNzLXVzZXIiLCJvcGVuY3J2czpjb3VudHJ5Y29uZmlnLXVzZXIiLCJvcGVuY3J2czp3ZWJob29rcy11c2VyIiwib3BlbmNydnM6Y29uZmlnLXVzZXIiLCJvcGVuY3J2czpkb2N1bWVudHMtdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2NTA5OTIwYzQyZjE5ZDE5NTA2NDhlYTgifQ.gyhtHt2T47OJHSpq0mkf3uGbgIVJDGgW-9vwTAVF5gYP4dlPvE_prVsQyTCxgtEVjNo4OpVweLHWUKO6J4yB2jumicjODyW9ac5igtbOmRYaiikUaDdykWhqHINMnI0ywxpISd8d9-6u20xNcjPWpJtPnSWAvHCy8OZAAt4J1mAJ20Zwbm0LebG98082ZnZpePB50lk29Qrp8hQvIt1oUV54q47gqFkpLwOAUwchF9KvAMiqE9UOtiYP8X9_lOK8i86QC-vchEMOKcgnS38ksTzjASZLqU7AWvdaVyn-U_A7yD8RpeTXh55eiE-QCN-ziI47H0hC8J3ViytWH2lNRg'
    }
  } as any)
  const result = await graphql({
    schema: addResolversToSchema({
      schema,
      resolvers: {
        Query: {
          fetchBirthRegistration: (_, __, context) => {
            context.dataSources.recordsAPI.setRecord(bundle)
            return bundle
          }
        }
      }
    }),
    source: query,
    rootValue: root,
    contextValue: {
      ...context,
      dataSources: {
        ...context.dataSources,
        minioAPI: {
          getStaticData: (fileUri: string) => fileUri,
          getPresignedUrlFromUri: (fileUri: string) => fileUri
        },
        metricsAPI: {
          getTimeLogged: () => []
        },
        countryConfigAPI: {
          getRoles: () =>
            Promise.resolve([
              {
                id: 'FIELD_AGENT',
                label: {
                  defaultMessage: 'Field Agent',
                  description: 'Name for user role Field Agent',
                  id: 'userRole.fieldAgent'
                },
                scopes: [
                  'record.declare-birth',
                  'record.declare-death',
                  'record.declare-marriage',
                  'record.declaration-submit-incomplete',
                  'record.declaration-submit-for-review',
                  'search.birth',
                  'search.death',
                  'search.marriage',
                  'user.read:only-my-audit',
                  'demo'
                ]
              },
              {
                id: 'POLICE_OFFICER',
                label: {
                  defaultMessage: 'Police Officer',
                  description: 'Name for user role Police Officer',
                  id: 'userRole.policeOfficer'
                },
                scopes: [
                  'record.declare-birth',
                  'record.declare-death',
                  'record.declare-marriage',
                  'record.declaration-submit-incomplete',
                  'record.declaration-submit-for-review',
                  'search.birth',
                  'search.death',
                  'search.marriage',
                  'demo'
                ]
              },
              {
                id: 'SOCIAL_WORKER',
                label: {
                  defaultMessage: 'Social Worker',
                  description: 'Name for user role Social Worker',
                  id: 'userRole.socialWorker'
                },
                scopes: [
                  'record.declare-birth',
                  'record.declare-death',
                  'record.declare-marriage',
                  'record.declaration-submit-incomplete',
                  'record.declaration-submit-for-review',
                  'search.birth',
                  'search.death',
                  'search.marriage',
                  'demo'
                ]
              },
              {
                id: 'HEALTHCARE_WORKER',
                label: {
                  defaultMessage: 'Healthcare Worker',
                  description: 'Name for user role Healthcare Worker',
                  id: 'userRole.healthcareWorker'
                },
                scopes: [
                  'record.declare-birth',
                  'record.declare-death',
                  'record.declare-marriage',
                  'record.declaration-submit-incomplete',
                  'record.declaration-submit-for-review',
                  'search.birth',
                  'search.death',
                  'search.marriage',
                  'demo'
                ]
              },
              {
                id: 'LOCAL_LEADER',
                label: {
                  defaultMessage: 'Local Leader',
                  description: 'Name for user role Local Leader',
                  id: 'userRole.localLeader'
                },
                scopes: [
                  'record.declare-birth',
                  'record.declare-death',
                  'record.declare-marriage',
                  'record.declaration-submit-incomplete',
                  'record.declaration-submit-for-review',
                  'search.birth',
                  'search.death',
                  'search.marriage',
                  'demo'
                ]
              },
              {
                id: 'REGISTRATION_AGENT',
                label: {
                  defaultMessage: 'Registration Officer',
                  description: 'Name for user role Registration Officer',
                  id: 'userRole.registrationOfficer'
                },
                scopes: [
                  'record.read',
                  'record.declare-birth',
                  'record.declare-death',
                  'record.declare-marriage',
                  'record.declaration-submit-for-approval',
                  'record.declaration-submit-for-updates',
                  'record.declaration-edit',
                  'record.declaration-archive',
                  'record.declaration-reinstate',
                  'record.registration-print&issue-certified-copies',
                  'record.registration-request-correction',
                  'performance.read',
                  'performance.read-dashboards',
                  'search.birth',
                  'search.death',
                  'search.marriage',
                  'organisation.read-locations:my-jurisdiction',
                  'user.read:only-my-audit',
                  'demo'
                ]
              },
              {
                id: 'LOCAL_REGISTRAR',
                label: {
                  defaultMessage: 'Local Registrar',
                  description: 'Name for user role Local Registrar',
                  id: 'userRole.localRegistrar'
                },
                scopes: [
                  'record.read',
                  'record.declare-birth',
                  'record.declare-death',
                  'record.declare-marriage',
                  'record.declaration-submit-for-updates',
                  'record.unassign-others',
                  'record.declaration-edit',
                  'record.declaration-archive',
                  'record.declaration-reinstate',
                  'record.review-duplicates',
                  'record.register',
                  'record.registration-print&issue-certified-copies',
                  'profile.electronic-signature',
                  'record.registration-correct',
                  'record.confirm-registration',
                  'record.reject-registration',
                  'performance.read',
                  'performance.read-dashboards',
                  'performance.vital-statistics-export',
                  'search.birth',
                  'search.death',
                  'search.marriage',
                  'organisation.read-locations:my-jurisdiction',
                  'user.read:my-office',
                  'demo'
                ]
              },
              {
                id: 'LOCAL_SYSTEM_ADMIN',
                label: {
                  defaultMessage: 'Administrator',
                  description: 'Name for user role Administrator',
                  id: 'userRole.administrator'
                },
                scopes: [
                  'organisation.read-locations:my-jurisdiction',
                  'user.create:my-jurisdiction',
                  'user.update:my-jurisdiction',
                  'user.read:my-jurisdiction',
                  'demo'
                ]
              },
              {
                id: 'NATIONAL_SYSTEM_ADMIN',
                label: {
                  defaultMessage: 'National Administrator',
                  description: 'Name for user role National Administrator',
                  id: 'userRole.nationalAdministrator'
                },
                scopes: [
                  'config.update:all',
                  'organisation.read-locations:all',
                  'user.create:all',
                  'user.update:all',
                  'user.read:all',
                  'demo'
                ]
              },
              {
                id: 'PERFORMANCE_MANAGER',
                label: {
                  defaultMessage: 'Operations Manager',
                  description: 'Name for user role Operations Manager',
                  id: 'userRole.operationsManager'
                },
                scopes: [
                  'performance.read',
                  'performance.read-dashboards',
                  'performance.vital-statistics-export',
                  'organisation.read-locations:all',
                  'demo'
                ]
              },
              {
                id: 'NATIONAL_REGISTRAR',
                label: {
                  defaultMessage: 'Registrar General',
                  description: 'Name for user role Registrar General',
                  id: 'userRole.registrarGeneral'
                },
                scopes: [
                  'record.read',
                  'record.declare-birth',
                  'record.declare-death',
                  'record.declare-marriage',
                  'record.declaration-submit-for-updates',
                  'record.unassign-others',
                  'record.declaration-edit',
                  'record.declaration-archive',
                  'record.declaration-reinstate',
                  'record.review-duplicates',
                  'record.register',
                  'record.registration-print&issue-certified-copies',
                  'profile.electronic-signature',
                  'record.registration-correct',
                  'record.confirm-registration',
                  'record.reject-registration',
                  'performance.read',
                  'performance.read-dashboards',
                  'performance.vital-statistics-export',
                  'search.birth',
                  'search.death',
                  'search.marriage',
                  'organisation.read-locations:my-jurisdiction',
                  'user.read:my-office',
                  'demo'
                ]
              },
              {
                id: 'HOSPITAL_CLERK',
                label: {
                  defaultMessage: 'Hospital Clerk',
                  description: 'Name for user role Hospital Clerk',
                  id: 'userRole.hospitalClerk'
                },
                scopes: [
                  'record.declare-birth',
                  'record.declare-death',
                  'record.declaration-submit-incomplete',
                  'record.declaration-submit-for-review',
                  'search.birth',
                  'search.death',
                  'user.read:only-my-audit',
                  'demo'
                ]
              },
              {
                id: 'COMMUNITY_LEADER',
                label: {
                  defaultMessage: 'Community Leader',
                  description: 'Name for user role Community Leader',
                  id: 'userRole.communityLeader'
                },
                scopes: [
                  'record.declare-birth',
                  'record.declare-death',
                  'record.declare-marriage',
                  'record.declaration-submit-incomplete',
                  'record.declaration-submit-for-review',
                  'record.registration-print&issue-certified-copies',
                  'search.birth',
                  'search.death',
                  'search.marriage',
                  'user.read:only-my-audit',
                  'demo'
                ]
              }
            ])
        },
        usersAPI: {
          async getUserByPractitionerId(id: string) {
            if (id === 'b4467b2f-454a-43c3-8302-809e4bda2972') {
              return {
                _id: '6751864d5db8a2d6f32f0ee3',
                name: [{ use: 'en', given: ['Felix'], family: 'Katongo' }],
                username: 'f.katongo',
                email: '',
                emailForNotification: 'kalushabwalya17+@gmail.com',
                mobile: '+260922222222',
                role: 'REGISTRATION_AGENT',
                practitionerId: 'b4467b2f-454a-43c3-8302-809e4bda2972',
                primaryOfficeId: '5f22d65c-afbd-44d0-9209-f296c736c6bd',
                status: 'active',
                creationDate: new Date(1733396045453).toISOString(),
                auditHistory: [],
                device: 'xyz'
              }
            }
            if (id === 'a14a2a51-7713-40d1-b845-3a0336a6c216') {
              return {
                _id: '6751864f5db8a2d6f32f0eec',
                name: [{ use: 'en', given: ['Kennedy'], family: 'Mweene' }],
                username: 'k.mweene',
                email: '',
                emailForNotification: 'kalushabwalya1.7@gmail.com',
                mobile: '+260933333333',
                role: 'LOCAL_REGISTRAR',
                practitionerId: 'a14a2a51-7713-40d1-b845-3a0336a6c216',
                primaryOfficeId: '5f22d65c-afbd-44d0-9209-f296c736c6bd',
                status: 'active',
                creationDate: new Date(1733396047831).toISOString(),
                auditHistory: [],
                device: 'xyz'
              }
            }
            throw new Error('Tried to search for unknown user')
          }
        }
      }
    }
  })
  console.timeEnd('foo')
  console.log(JSON.stringify(result, null, 2))
}
main().catch((error) => {
  console.error(error)
  process.exit(1)
})
