## This package is not regularly maintained or supported. It is included for reference.

You can run a PWA on an Android device and connect to OpenCRVS running on your local network. This is the best way to work and debug service workers and do actual device testing.

1. Register to https://ngrok.com/. The free plan is enough for this.
2. Go to https://dashboard.ngrok.com/auth and get yourself an auth token
3. Create a `.env` file here `packages/mobile-proxy`

```
AUTH_TOKEN=THE_AUTH_TOKEN_YOU_GOT_HERE
```

4. Start the opencrvs-core development environment as you normally would, but add `--ignore @opencrvs/client` to the start command in the root package.json file. E.G. `yarn start --ignore @opencrvs/client`

5. Run `yarn start` in this mobile-proxy package
6. You should now have an ngrok url that can be used remotely on any device. It's still required to be in the same network as the host machine, as some services (login) aren't used through ngrok.
