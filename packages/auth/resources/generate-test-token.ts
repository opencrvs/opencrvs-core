import * as commandLineArgs from 'command-line-args'
import * as commandLineUsage from 'command-line-usage'
import { join } from 'path'

const optionList = [
  { name: 'userId', type: String, defaultValue: '1' },
  { name: 'role', type: String, defaultValue: 'admin' },
  {
    name: 'expiresIn',
    type: Number,
    defaultValue: 9999999,
    description: 'Delta value from {bold now} in seconds'
  },
  {
    name: 'issuer',
    type: String,
    defaultValue: 'opencrvs:auth-service'
  },
  {
    name: 'audience',
    type: String,
    multiple: true,
    defaultValue: [
      'opencrvs:auth-user',
      'opencrvs:user-mgnt-user',
      'opencrvs:hearth-user',
      'opencrvs:gateway-user'
    ]
  },
  { name: 'help', type: Boolean, description: 'Show this menu' }
]

const options = commandLineArgs(optionList)

if (options.help) {
  const usage = commandLineUsage([
    {
      header: 'OpenCRVS JWT Token Generator',
      content: 'Generate JWT tokens for tests'
    },
    { header: 'Options', optionList }
  ])
  // tslint:disable-next-line no-console
  console.log(usage)
  process.exit(0)
}

process.env.CONFIG_TOKEN_EXPIRY = options.expiresIn
process.env.CERT_PRIVATE_KEY_PATH = join(__dirname, '../test/cert.key')
process.env.CERT_PUBLIC_KEY_PATH = join(__dirname, '../test/cert.key.pub')

// tslint:disable-next-line no-var-requires
const { createToken } = require('@auth/features/authenticate/service')

createToken(
  options.userId,
  options.role,
  options.audience,
  options.issuer
).then((token: string) =>
  // tslint:disable-next-line no-console
  console.log(token)
)
