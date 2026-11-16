# Configurator

`opencrvs configurator` is a browser form that creates and updates the environments of an OpenCRVS infrastructure repository. For each environment it reads and writes two places: the **GitHub environment** (variables and secrets) and the **files** under `environments/<name>/` (the Ansible inventory and the Helm values).

It is the successor of `opencrvs environment init`, which stays in [`../environment`](../environment) until the configurator writes everything that command does (see [Not yet written](#not-yet-written)).

## Commands

Run them from the root of an infrastructure repository. It must contain `.github/workflows`, `environments` and `infrastructure`.

```bash
opencrvs configurator init [--port 4173] [--host 127.0.0.1]   # serve the page until Ctrl+C
opencrvs configurator upgrade                                   # move old inventories to environments/<name>/inventory.yml
opencrvs configurator update-workflows [--dry-run]              # refresh the environment lists of the GitHub workflows
```

- **`init`** refuses to start while inventories are still in `infrastructure/server-setup/inventory`. Run `upgrade` first.
- **`upgrade`** moves `infrastructure/server-setup/inventory/<name>.yml` to `environments/<name>/inventory.yml`, removes the empty folder, then runs `update-workflows`.
- **`update-workflows`** keeps the `environment` choice of the workflows in step with the repository. Environments that have an `inventory.yml` go into `provision.yml` and `reset-2fa.yml`. Environments that have `opencrvs-services/values.yaml` go into `deploy-dependencies.yml`, `deploy-opencrvs.yml`, `clear-all-data.yml`, `seed-data.yml`, `reindex.yml` and `github-to-k8s-sync-env.yml`. Existing entries keep their order and new ones are appended. Nothing is written if one of the workflows cannot be updated.

### In Docker

Publish the port on the host's loopback only. The server refuses requests whose `Host` is not local either way.

```bash
docker run --rm --init -it -p 127.0.0.1:4173:4173 \
  -v "$PWD":/work -w /work --user "$(id -u):$(id -g)" -e HOME=/tmp \
  node:22 npx --yes @opencrvs/toolkit@<version> configurator init --host 0.0.0.0
```

Use a version that contains the configurator. Until a release does, that is a release candidate under the `next` tag. Then open <http://localhost:4173>. Files are written as your own user.

## Using the page

1. **Connect.** Enter a GitHub token, or skip GitHub. The repository is filled in from `git remote origin`. The token needs access to the repository's environments, secrets and variables and to workflows. Creating an environment needs admin access. A classic token reports its scopes, so a missing `repo` or `workflow` scope is shown. A fine-grained token only has its repository access checked.
2. **Pick an environment.** The list comes from GitHub, or from the `environments/` folder when GitHub is skipped. Picking one loads what is stored for it into the form. Typing a new name starts an empty one.
3. **Answer the questions.** The menu groups the pages: *General* (Environment, Container registry, Email), *Dependencies* (Data stores, Monitoring, Backup/Restore) and *Infrastructure* (Kubernetes, SSH users, Traefik, Disk encryption). Pages come and go with the answers, for example Email appears only when it is switched on.
4. **Review changes.** Nothing is written before this step. It lists every GitHub variable and secret with its status, and a diff of every file. Secrets are masked.
5. **Apply.** The environment is created if needed, then variables, secrets and files are written one step at a time. A failed step shows a plain reason and the rest still run. **Retry failed** runs only those.
6. **Keep a copy.** GitHub never returns secret values, so the page then offers `.env.<name>` (every value written, **including the secrets**: keep it private) and `<name>-answers.json` (no secrets). Both are made in the browser and stored nowhere.

## What is stored where

| | GitHub | Files |
|---|---|---|
| Variables | Environment variables, and repository variables such as `REGISTRY_HOST` and `APPROVERS` | Rendered into the files below |
| Secrets | Written encrypted. GitHub only returns the **names**, so an existing secret shows as defined, locked and kept unless you replace it. | Never |
| Files | | `inventory.yml`, `dependencies/values.yaml`, `traefik/values.yaml` and `opencrvs-services/values.yaml` in `environments/<name>/` |

- `values.override.yaml` files belong to the user. They are never read or written.
- Files are regenerated from the answers. Values the form does not ask about return to the template defaults, and the review diff shows that.
- The `environments/` folder may also be **flat**: one `environments/<name>.yaml` per environment. Only the inventory can live in one file, so only it is read and written, and the review says the other files are not written. Sub-folders win when both shapes are present.
- `ENVIRONMENTS_DIR` points the server at another folder than `environments/`.

### Without GitHub

Secrets exist only on GitHub, so when it is skipped (or the server has forgotten the token) no secret is asked for or generated, and only the files are written.

| Page | Not asked without GitHub |
|---|---|
| Environment | the generated Metabase credentials; the "Configure Email" switch |
| Container registry, Email, Disk encryption | the whole page |
| Data stores | the user and password of Elasticsearch, S3 and Postgres |
| Monitoring | the Kibana credentials; the Sentry switch and DSN |
| Backup/Restore | the backup server user and the backup secrets |
| Traefik | the certificate and its key |

Questions that are GitHub variables only (`DOMAIN`, the approval settings, ...) are still asked, although nothing can store them without GitHub.

## How it works

Three files describe the whole form. None of them mentions a particular environment.

| File | What it is |
|---|---|
| [`forms/wizard.yml`](forms/wizard.yml) | The questions: pages, fields, validation and conditions, as SurveyJS JSON written in YAML. A question's name is the name of the variable or secret it stores. |
| [`forms/bindings.yml`](forms/bindings.yml) | For each question, where its value is stored: a GitHub variable or secret and/or a variable of a file template. Also how to convert it, and which source wins when they disagree. |
| [`templates/`](templates) | Handlebars templates of the files. They are copies of the templates of `opencrvs environment init`, see [`templates/README.md`](templates/README.md). |

```
READ    GitHub environment <name>   ──┐
        environments/<name>/ files  ──┴─ merge by precedence ─▶ form ─▶ answers
                                                                          │
WRITE   GitHub environment <name>   ◀─┐                                   │
        environments/<name>/ files  ◀─┴─ review, then apply ◀─────────────┘
```

### Reading an environment

- **GitHub** gives variable values and the names of secrets.
- **Files** are read back through the bindings. Handlebars cannot parse, so `scripts/check-bindings.ts` renders each template with marker values and finds where every variable lands in the YAML. The result is `ui/generated/file-paths.json`.
- **Precedence.** GitHub wins by default (`precedence` in `bindings.yml`, which a single binding can override). The banner lists values where the sources disagree.
- **One question, several targets.** `BACKUP_HOST`, for example, is a GitHub variable and a value in two files.
- **Switches nothing stores** are inferred from what exists (`ui/form/infer.ts`): "Configure Email", "Configure Infrastructure", backup or restore, and each "Use built-in component" checkbox, which is the `enabled` key of that dependency in the dependencies chart. Without that file a dependency counts as built in unless it has a host of its own.
- **Old names** (`MINIO_ROOT_PASSWORD`, `DOCKER_USERNAME`, ...) are `legacy:` entries in `bindings.yml`. A secret under an old name still counts as defined.

### Writing an environment

- **Only what is on screen is written.** An answer on a hidden page or panel is left out, so a value typed before a switch was turned off never reaches GitHub or a file (`ui/form/active.ts`).
- **Statuses in the plan** (`ui/plan/plan.ts`): *new*, *update*, *unchanged* (nothing written) and *kept* (an existing secret left empty: nothing written). A secret you enter is always an update, because its current value is unknown. Empty variables are skipped.
- **The two sides are independent.** If GitHub is skipped only the files are written. If the files cannot be written, GitHub still is.
- **Files are rendered on the server** from its own templates, with the same Handlebars and helper as the CLI. Template variables that no question feeds come from `defaults` and `derived` in `bindings.yml`, and `pnpm configurator:bindings:check` fails if one has no source. Hosts of built-in dependencies are filled with their address in the cluster (`ui/plan/dependencyHosts.ts`).

### Secrets

- Generated secrets are made in the browser when their page is first shown: 16 characters of `[A-Za-z0-9]`, and 12 lowercase letters and digits starting with a letter for the user names (`charset: username`). They are kept while you move between pages.
- Passwords of the Postgres, S3 and Elasticsearch components are asked, and generated, even for a built-in component, because the services sign in to it too. The Elasticsearch user name is asked only for an Elasticsearch of your own, since a built-in one is always `elastic`.
- **Backup secrets** have no question: an Ed25519 SSH key pair for the backup server (`BACKUP_HOST_PRIVATE_KEY`, `BACKUP_HOST_PUBLIC_KEY`) and `BACKUP_ENCRYPTION_PASSPHRASE`. `generateBackupSecrets` (`ui/plan/backupSecrets.ts`) makes the missing ones when the review is prepared, only for an environment that backs up. The key pair is kept for an environment that has a private key, unless the checkbox *Generate new private/public SSH key pair* is ticked. The passphrase is never replaced, because every earlier backup is encrypted with it.

### The server

The page never calls GitHub. It asks a small Node server (`server/start.ts`) that holds the token in memory and calls the REST API. The token is never stored, logged, put in a URL or sent back to the page, and the page asks the server to forget it every time it loads.

| Route | What it does |
|---|---|
| `GET /api/context` | The repository, from `git remote origin` |
| `GET /api/environments`, `GET /api/environments/:name` | The local environments and the files of one |
| `POST /api/environments/:name/render` | Renders the files from the answers, with where each would be written and what is there now. Writes nothing. |
| `PUT /api/environments/:name/files` | Renders again and writes the files |
| `POST /api/github/connect`, `POST /api/github/disconnect`, `GET /api/github/status` | The token session |
| `GET /api/github/environments`, `GET /api/github/repository`, `GET /api/github/environments/:name` | Environment names, variables with values, secret names |
| `POST /api/github/environment`, `POST /api/github/variable`, `POST /api/github/secret` | One write per request. Secrets are sealed with libsodium. |
| `POST /api/ssh-keypair` | A new Ed25519 key pair for the backup server. Nothing is kept. |

- The server listens on `127.0.0.1`. It refuses a `Host` that is not local (DNS rebinding) and any `Origin` other than itself. Writes must be JSON, so a browser sends a preflight first. Another website cannot use the connected token.
- The file routes accept answers only, never file content or paths. The server renders from its own templates and writes only to the known places.
- Names are validated, and a value must be 1 to 49,152 characters. Replies never contain a value or the token.
- Pages of GitHub results are followed only on the same host, so the token cannot be sent elsewhere.
- `GITHUB_API_URL` points the server at another GitHub API, which is how the tests and the dev servers use a fake.

## Code map

| Path | What it is |
|---|---|
| `index.ts` | The three commands and `startConfigurator` |
| `layout.ts`, `workflows.ts`, `paths.ts` | `upgrade` and `update-workflows`, written as plan-then-apply functions |
| `server/` | The Node server: the `/api` routes, the GitHub client, the file renderer, sealed secrets, SSH keys, and `fakeGitHub.ts` (an in-memory GitHub). Compiled with the toolkit and bundled into `dist/cli.js`. |
| `ui/` | The React page, built with Vite into `dist/configurator-assets/ui`. It is excluded from the toolkit's own TypeScript build because it needs DOM types. |
| `ui/app/`, `ui/form/` | The screens, and the survey: expression functions, the secret question, generated secrets, the menu, the users table |
| `ui/bindings/`, `ui/plan/` | Reading: bindings, parsers, template scanner, snapshot merge. Writing: plan, review, apply, `.env` file. |
| `ui/github/`, `ui/local/` | The ports the page uses for GitHub and for the local server, with HTTP adapters and in-memory mocks |
| `forms/`, `templates/` | The questions and bindings, and the file templates. Copied to `dist/configurator-assets`. |
| `tests/`, `*.test.ts` | Vitest tests: `form/` on a bare survey-core model (no DOM), `bindings/`, `plan/`, `server/`, and the commands beside the code they test |
| `scripts/` | `check-bindings.ts` and the fixtures used by the tests |
| `vite.config.ts`, `yamlForms.ts` | The page's build, and the plugin that turns `.yml` imports into JSON |

## Development

From `packages/toolkit`:

```bash
pnpm build                              # the whole toolkit, page included: dist/cli.js and dist/configurator-assets
node dist/cli.js configurator init      # run the build; start it from an infrastructure repository
pnpm test                               # all toolkit tests, the configurator's included
pnpm test:compilation                   # the toolkit, then src/configurator/tsconfig.json (browser code, tests, scripts)
pnpm configurator:bindings:check        # bindings against the templates; `configurator:bindings` rewrites ui/generated/file-paths.json
```

**Hot reload.** Start Vite from an infrastructure repository (or a copy of one), because it works on the folder it is started in:

```bash
cd /path/to/infrastructure-repository
/path/to/opencrvs-core/packages/toolkit/node_modules/.bin/vite \
  --config /path/to/opencrvs-core/packages/toolkit/src/configurator/vite.config.ts
```

Open <http://localhost:5173>, not `127.0.0.1`: Vite does not listen on IPv4 there. `VITE_MOCK_GITHUB=1` in front of the command makes the page use an in-memory GitHub, with a switch in the header for the scenarios (environments exist, fresh repository, registry secrets exist, names taken). The tests use the same mock.

**Before pushing:**

- `pnpm check:license` wants the licence header on every new `.ts`, `.tsx`, `.css`, `.html` and `.yml` file. The templates and `ui/assets` are exempt.
- `pnpm knip:compare` (from the repository root) fails when the branch has more unused exports than `develop`. The page's entry point, `ui/main.tsx`, is declared in `knip.json`, and `vitest.config.ts` has an empty `test` key, because knip reads test files as entry points only when that key exists.
- The templates are excluded from Prettier, which reads `{{env}}` as YAML and rewrites it.

### Changing the form

- **A question.** Add it to `forms/wizard.yml` and bind it in `forms/bindings.yml`: a `github` target (`kind: variable` or `secret`, `scope: environment` or `repository`), a `file` target naming a template variable, or an entry under `ignore` when it is only for the page. Then run `pnpm configurator:bindings`, so the scanner records where a file variable lands, and `pnpm configurator:bindings:check`.
- **A secret** is a question of `type: secret`. `autoGenerate`, `length` and `charset` control its generated value. Every secret question gets `and {githubAvailable} = true` added to its `visibleIf`, so it disappears without GitHub (`ui/form/survey.ts`).
- **A page** belongs to a group of the menu in `MENU_GROUPS` (`ui/form/menu.ts`). The pages of a group must follow each other in `wizard.yml`.
- **A file.** Add a template under `templates/` and a `files:` entry in `bindings.yml`. A variable that no question feeds needs a `defaults` or `derived` entry.
- **Required questions** are counted by the progress bar, and `tests/form/progress.test.ts` asserts the counts, so adding one means updating those numbers.
- **Templates.** When the templates of `opencrvs environment init` change, copy them again and carry over the differences listed in [`templates/README.md`](templates/README.md).
- **Typos in `wizard.yml`** fail the tests: `survey.jsonErrors` is asserted to be empty. YAML flow mappings split on commas, so quote any string that contains one.

## Not yet written

`opencrvs environment init` also writes these, and the configurator does not:

- Variables it derives from the domain: `GATEWAY_HOST`, `COUNTRY_CONFIG_HOST`, `CLIENT_APP_URL`, `LOGIN_URL` and `CONTENT_SECURITY_POLICY_WILDCARD`.
- Secrets it generates: `SUPER_USER_PASSWORD`, `KIBANA_SYSTEM_PASSWORD` and `GH_ENCRYPTION_PASSWORD`.
- `NOTIFICATION_TRANSPORT` and `RUSTFS_HOST_DATA_PATH`.

An environment written by the page is therefore not yet complete for provisioning.

Also open:

- **The OpenTelemetry chart** (`templates/charts-values/opentelemetry/values.yaml`) is a template but has no `files:` entry, so nothing renders or reads it.
- **Precedence** between GitHub and the files can be set in `bindings.yml`, but not in the page.
- **github.com.** The routes follow GitHub's documented REST API and are tested against `server/fakeGitHub.ts`, an in-memory stand-in. The real GitHub never returns or reveals a secret value. The fake can check the encryption only because it generates the key pair it hands out, so it keeps the private key and can open the sealed values it receives. The routes have not been run with a real token. Whether a token can trigger workflows cannot be known without triggering one, so it is not checked.
- **`libsodium-wrappers` 0.7.16** ships an ESM entry that imports a file the package does not contain. The tests alias it to the CommonJS build in `vitest.config.ts` and the CLI bundle uses the CommonJS build. Anything that loads `server/` as native ESM under plain Node fails because of it.
