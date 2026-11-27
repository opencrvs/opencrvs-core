# OpenCRVS toolkit

`@opencrvs/toolkit` is the library and the command-line tool that a country config uses to define events, forms, roles and integrations for [OpenCRVS](https://www.opencrvs.org).

## Set up OpenCRVS

To install or set up OpenCRVS, you do not need to install this package directly. Run this command to create a new country config:

```sh
npm create @opencrvs/countryconfig@latest <project-name>
```

The command copies the country config template that matches the OpenCRVS version into the `<project-name>-countryconfig` directory. It also clones the [OpenCRVS infrastructure repository](https://github.com/opencrvs/infrastructure) into the `<project-name>-infrastructure` directory. The command asks for the name of your organisation, your country code and if you agree to send telemetry. When it is complete, it prints the next steps.

For more information, read the [OpenCRVS documentation](https://documentation.opencrvs.org) and the [local development guide](https://documentation.opencrvs.org/technical/guides/installation/local-development).

## Installation

A new country config already has this package as a dependency. To add it to a different project, run:

```sh
npm install @opencrvs/toolkit
```

Use the toolkit version that matches your OpenCRVS core version. For example, use toolkit 2.2.x with OpenCRVS core 2.2.

## Modules

Import each part of the toolkit from its own entry point:

| Import path                              | Purpose                                                                                                                                   |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `@opencrvs/toolkit/events`               | Event configuration: `defineConfig`, field types, action types, flags and the `field()` and `user` helpers for conditionals.              |
| `@opencrvs/toolkit/events/deduplication` | Rules that find duplicate records: `field`, `and`, `or` and `not`.                                                                        |
| `@opencrvs/toolkit/conditionals`         | Conditionals that show, enable or validate form fields, for example `defineFormConditional`, `not`, `or` and `never`.                     |
| `@opencrvs/toolkit/scopes`               | Scopes that give permissions to users, for example `defineScopes` and `encodeScope`.                                                      |
| `@opencrvs/toolkit/roles`                | User roles: `defineRoles` and the `Role` and `Roles` schemas.                                                                             |
| `@opencrvs/toolkit/authentication`       | Token helpers, for example `isServiceToken`, `SERVICE_USER_ID` and `getUserId`.                                                           |
| `@opencrvs/toolkit/request-signing`      | `coreRequestAuth`, a Hapi auth strategy that verifies signed requests from OpenCRVS core, and `createTestCoreKey` for tests.              |
| `@opencrvs/toolkit/api`                  | `createClient(baseUrl, token)`, a typed tRPC client for the OpenCRVS events API.                                                          |
| `@opencrvs/toolkit/application-config`   | Configuration of the application, the client and the login page: `defineApplicationConfig`, `defineClientConfig` and `defineLoginConfig`. |
| `@opencrvs/toolkit/notification`         | User notifications: `TriggerEvent`, `Recipient`, `parseUserEventTrigger` and `triggerUserEventNotification`.                              |
| `@opencrvs/toolkit/telemetry`            | `sendTelemetry(report)`, which sends a telemetry report to the OpenCRVS status service.                                                   |

## Examples

### Define an event

```ts
import { defineConfig, field } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  label: {
    id: 'event.birth.label',
    defaultMessage: 'Birth',
    description: 'This is what this event is referred as in the system'
  },
  dateOfEvent: field('child.dob'),
  title: {
    id: 'event.birth.title',
    defaultMessage: '{child.name.firstname} {child.name.surname}',
    description: 'This is the title of the summary'
  },
  summary: {
    fields: [
      // The fields that the record overview shows
    ]
  },
  actions: [
    // The actions that users can do on a birth record. The DECLARE action
    // contains the declaration form.
  ]
})
```

### Show a field only to some users

```ts
import { and, ConditionalType, not, user } from '@opencrvs/toolkit/events'

const conditionals = [
  {
    type: ConditionalType.SHOW,
    conditional: and(
      not(user.hasRole('EMBASSY_OFFICIAL')),
      not(user.hasRole('COMMUNITY_LEADER'))
    )
  }
]
```

### Call the OpenCRVS API

```ts
import { createClient } from '@opencrvs/toolkit/api'

const client = createClient(
  'https://gateway.example.org/events',
  `Bearer ${token}`
)

const location = await client.locations.get.query({ id: locationId })
```

## CLI

The package installs the `opencrvs` command. Run `opencrvs <command> --help` to see the options of a command.

### `opencrvs upgrade`

Upgrades the country config in the current directory to the OpenCRVS version of the toolkit. Upgrade one minor version at a time. For example, toolkit 2.2 upgrades a country config that is on 2.1.

Do not change the `@opencrvs/toolkit` dependency before you run the command. The command reads the dependency to find the current version, and then updates it.

```sh
npx @opencrvs/toolkit@2.2 upgrade
```

For more information, read the [version upgrade guide](https://documentation.opencrvs.org/v2.0/technical/guides/version-upgrades#step-2-update-code-and-test-locally) and the [description of the upgrade migrations](https://github.com/opencrvs/opencrvs-core/blob/develop/packages/toolkit/src/migrations/README.md).

### `opencrvs verify-endpoints [country-config-url]`

Checks a running country config. Run it after `opencrvs upgrade`. The command checks that:

- The required public endpoints exist.
- The notification trigger endpoints do not accept requests without a token.
- `/content/client` and `/content/login` serve all the translations that this version needs.

The default URL is `http://localhost:3040`. If a check fails, the command exits with a non-zero status.

### `opencrvs environment <subcommand>`

Manages deployment environments. Run it from the root directory of your infrastructure repository. The command needs a GitHub token.

| Subcommand         | Purpose                                           |
| ------------------ | ------------------------------------------------- |
| `init`             | Creates a new environment.                        |
| `upgrade`          | Upgrades the configuration of an environment.     |
| `update-workflows` | Updates the environment options of the workflows. |
| `users`            | Manages the users of an environment.              |
| `swarm-to-k8s`     | Moves a Docker Swarm configuration to Kubernetes. |

For example, to create a new environment, run:

```sh
npx @opencrvs/toolkit environment init
```

## Links

- [OpenCRVS documentation](https://documentation.opencrvs.org)
- [OpenCRVS core repository](https://github.com/opencrvs/opencrvs-core)
- [Issue tracker](https://github.com/opencrvs/opencrvs-core/issues)
- [Development guide for this package](https://github.com/opencrvs/opencrvs-core/blob/develop/packages/toolkit/DEVELOPMENT.md)

## License

[MPL-2.0](https://github.com/opencrvs/opencrvs-core/blob/develop/LICENSE)
