# OpenCRVS Notification service

A microservice to send notifications (e.g. sms, email) to users.

## Dev guide

First set up environment variables. Create a .env file with the following settings. Ask if you don't have the details for this.

```
CLICKATELL_USER=<user>
CLICKATELL_PASSWORD=<password>
CLICKATELL_API_ID=<api_id>
```

Start the service with `yarn start`

Watch the tests with `yarn test:watch`

When in dev mode swagger API docs are available at `http://localhost:2020/documentation`
