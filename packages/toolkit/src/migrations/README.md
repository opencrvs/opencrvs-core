# Country config migrations (codemods)

Codemods run by `opencrvs upgrade` against a country config repo to upgrade it
to the next major OpenCRVS version. Each version has its own folder, e.g. `v2.0/`.

Run from inside a country config checkout:

```bash
opencrvs upgrade [--docker-swarm]
```

Related documentation: https://documentation.opencrvs.org/v2.0/technical/guides/version-upgrades#step-2-update-code-and-test-locally

## Translations are already handled

`add-translations.ts` copies `client.csv` and `login.csv` from the country
config template of the version being upgraded to, adding whatever rows a
country config is missing. **Do not write a codemod for a new translation key,
and do not add it to a list anywhere here.** Adding it to
`packages/countryconfig-template/src/translations/` is enough — which the
`check-missing-translation` workflow makes you do anyway — and every country
config picks it up on upgrade.

`countryconfig.csv` is left alone. It holds copy the country config declares
itself, which an upgrade has no business rewriting.

## Adding a step

1. **Create** `v2.0/<your-step-name>.ts` — export `async function main()` that
   mutates files under `process.cwd()`.

2. **Wire up** in `v2.0/index.ts`:

   ```ts
   import { main as yourStepName } from './your-step-name'
   // inside runUpgrade():
   await yourStepName()
   ```

3. **Make it idempotent** — safe to run twice (check before create/remove/rewrite).

4. **Test** — build toolkit, link it into a country config, run upgrade locally:

```bash
cd opencrvs-core/packages/toolkit
yarn build:all
yarn link "@opencrvs/toolkit"

cd opencrvs-countryconfig
yarn link "@opencrvs/toolkit"
yarn
./node_modules/@opencrvs/toolkit/dist/cli.js upgrade && rm -rf src/api/notification/testData.ts && git reset src/analytics && yarn test:compilation
```

We also have a CI check which runs the codemod script in [`.github/workflows/test-upgrade-script.yml`](../../../../.github/workflows/test-upgrade-script.yml)
