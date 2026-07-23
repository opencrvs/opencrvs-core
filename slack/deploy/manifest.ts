import { Manifest } from 'deno-slack-sdk/mod.ts'
import DeployWorkflow from './workflows/deploy.ts'
import SampleObjectDatastore from './datastores/sample_datastore.ts'

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: 'deploy',
  description: 'Deploy OpenCRVS to a selected internal environment',
  icon: 'assets/default_new_app_icon.png',
  workflows: [DeployWorkflow],
  outgoingDomains: [],
  datastores: [SampleObjectDatastore],
  botScopes: [
    'commands',
    'chat:write',
    'chat:write.public',
    'datastore:read',
    'datastore:write'
  ]
})
