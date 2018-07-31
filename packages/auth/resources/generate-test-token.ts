import { createToken } from 'src/features/authenticate/service'

const args = process.argv.slice(2)

if (
  args.length < 3 ||
  args.indexOf('help') > -1 ||
  args.indexOf('--help') > -1
) {
  // tslint:disable-next-line no-console
  console.log(`
    Usage:
    yarn generate-test-token <user id> <role> <expiry delta from now in seconds>
  `)

  process.exit(0)
}

const [userId, role] = args

// tslint:disable-next-line no-console
createToken(userId, role).then(token => console.log(token))
