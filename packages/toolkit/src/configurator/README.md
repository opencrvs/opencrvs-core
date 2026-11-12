# Configurator

`opencrvs configurator init` creates and updates the environments of an OpenCRVS infrastructure repository in the browser. It is the successor of `opencrvs environment init`, which stays in `../environment` until the configurator does everything it does.

## In the toolkit

Run it from the root of an infrastructure repository (it needs `.github/workflows`, `environments` and `infrastructure`):

```bash
opencrvs configurator init [--port 4173] [--host 127.0.0.1]   # serves the page until Ctrl+C
opencrvs configurator upgrade                                   # old inventory layout -> environments/<name>/inventory.yml
opencrvs configurator update-workflows [--dry-run]              # environment lists of the GitHub workflows
```

In a container, publish the port on the host's loopback only. The server refuses requests whose `Host` is not local either way:

```bash
docker run --rm --init -it -p 127.0.0.1:4173:4173 \
  -v "$PWD":/work -w /work --user "$(id -u):$(id -g)" -e HOME=/tmp \
  node:22 npx --yes @opencrvs/toolkit@latest configurator init --host 0.0.0.0
```

| Folder | What it is |
|---|---|
| `index.ts` | The three commands, `startConfigurator` |
| `layout.ts`, `workflows.ts`, `paths.ts` | `upgrade` and `update-workflows`, as plan-then-apply functions |
| `server/` | The Node server: `/api`, the GitHub client, the file renderer, the static page. Compiled with the toolkit and bundled into `dist/cli.js`. |
| `ui/` | The React page (Vite). Built by `build.sh` into `dist/configurator-assets/ui`. |
| `forms/`, `templates/` | The questions, and the bindings between them and GitHub and the files. Copied to `dist/configurator-assets`. |
| `tests/`, `scripts/` | The tests of `server/` and `ui/`, and the dev scripts (`check-bindings`, the fake GitHub, fixtures) |

Working on it, from `packages/toolkit`:

```bash
pnpm build                              # the whole toolkit, page included
node dist/cli.js configurator init      # from an infrastructure repository
pnpm test                               # includes the configurator
pnpm test:compilation                   # the toolkit, then src/configurator/tsconfig.json (browser code, tests, scripts)
pnpm configurator:bindings:check        # forms/bindings.yml against the templates; `:bindings` rewrites ui/generated/file-paths.json
```

`ui/` is excluded from the toolkit's own TypeScript build (it needs the DOM types) and is checked by `tsconfig.json` in this folder.

The rest of this file are the working notes of the spike this was built from, when it was a project of its own. Read `src/` there as `ui/`, and the `npm run` scripts as the commands above.

---

# Environment Init UI (the spike's notes)

## Goal

Give a DevOps engineer, system integrator or developer a way to map **any YAML configuration** to a UI installer. Practical examples:

- Helm chart deployment
- Ansible inventory file

It started as a spike for a browser version of OpenCRVS's `yarn environment:init`, built on SurveyJS Form Library (`survey-core` / `survey-react-ui` 3.2.3, MIT), and that is still the only configuration it ships with.

## How it works: environments, wizard, bindings, templates

The installer is built around the **environment**: a named deployment target such as `qa`, `staging` or `production`. One form produces any number of similar configuration sets, one per environment. Three files describe the whole thing, and none of them mentions a particular environment:

| File | What it is |
|---|---|
| `forms/wizard.yml` | The questions: pages, fields, validation, conditions (SurveyJS JSON written as YAML). Question names are the variable names that are stored. |
| `forms/bindings.yml` | For every question, where its value is stored: a GitHub variable or secret, and/or a variable of a file template. Also how to convert it, and which source wins when they disagree. |
| `templates/` | Handlebars templates of the files an environment consists of (an Ansible inventory and a Helm values file today), copied unchanged from the CLI. |

An environment is one set of answers to the same form:

```
READ    GitHub environment <name>   ──┐
        environments/<name>/ files  ──┴─ merge by precedence ─▶ form ─▶ answers
                                                                          │
WRITE   GitHub environment <name>   ◀─┐                                   │
        environments/<name>/ files  ◀─┴─ review, then apply ◀─────────────┘

bindings.yml connects every question to a GitHub name and a template variable, in both directions.
```

Picking `qa` loads what is stored for it (GitHub and files) into the form. Picking `prod`, or typing a new name, gives the same form with other answers. To map your own configuration: put its template under `templates/`, list it with its output path under `files:` in `bindings.yml`, give the questions `file` targets that name the template's variables, then run `npm run bindings` (it works out where each variable lands in the rendered file) and `npm run check`. Details are in "Existing environments: reading GitHub and files" below.

## Supported backends

| Backend | Reading | Writing |
|---|---|---|
| GitHub: environments, secrets and variables | Yes, through the local dev server. Variables come with values; for secrets GitHub only ever returns the **names**, so they show as "defined". | Yes: creates the environment, sets variables, sets secrets (encrypted on the dev server with libsodium). One item at a time, after a review. |
| Local files under `environments/` | Yes, through the same dev server | Yes: renders the templates from the answers and writes them: all four files in the tree layout, the one file in the flat layout (see below). |

Everything GitHub-related can be tried without a token (`npm run fake-github`, below), including writes: the fake decrypts the secrets it receives, so the encryption is tested for real. It has **not** been run against github.com with a real token.

## Supported directory structures for environments

The `environments/` folder holds the environments, in one of two shapes:

- **Flat:** one configuration file per environment, `environments/<name>.yaml` (or `.yml`).
- **Tree:** one folder per environment, `environments/<name>/`. Each folder may have its own sub-folders and YAML files.

How the installer treats them today:

| | Environment list | What is read for an environment | Writing |
|---|---|---|---|
| Tree | The sub-folder names. Sub-folders win when both shapes are present. | Only the files named under `files:` in `bindings.yml`: `inventory.yml`, `dependencies/values.yaml`, `traefik/values.yaml` and `opencrvs-services/values.yaml`. Other folders and files are never read, and `values.override.yaml` is deliberately excluded. | Yes: only those four files, rendered from the templates; `values.override.yaml` and other files are never touched |
| Flat | The `*.yaml` / `*.yml` file names | The file is read as the inventory; no other file exists to read | Yes: the inventory is written into `<name>.yaml` (or `.yml`, whichever the environment has). The other rendered files have no place in a flat layout, so they are not written, and the review says so. |

In the flat layout an environment is one file, so only one rendered file can live in it. `flat: inventory.yml` in `bindings.yml` names it; it is the file that is read back as the inventory and the file that is written, and `npm run check` fails if it is not one of the rendered files. Values that only the other files hold (the backup and restore mode, for example, live in the dependencies chart) cannot be read back from a flat environment. `ENVIRONMENTS_DIR` points the dev server at another folder than `environments/`.

So the "may have its own sub-folders and yaml files" part of the tree layout works for the four listed paths only: adding another file means adding a template and a `files:` entry. `templates/charts-values/opentelemetry/values.yaml` is vendored on purpose but has no `files:` entry yet, so nothing renders or reads it (`npm run check` lists it as "not read"); the three `values.override.yaml` templates belong to the user and are never rendered.

## Quick start

```bash
npm install
npm run dev      # development server
npm run check    # typecheck (strict), tests, production build
npm run preview  # serve the production build on http://localhost:4173 (also serves /api)
npm run bindings # regenerate src/generated/file-paths.json from templates/ + forms/bindings.yml
npm run fixtures # write sample environments (dev, qa, uat, prod: four files each) into environments/, skipping existing files
npm run fixtures -- --force  # overwrite them, for example after a template changed
```

By default the page talks to real GitHub through the local dev server (see "Real GitHub" below). `VITE_MOCK_GITHUB=1 npm run dev` (or a build made with it) uses an in-memory mock instead, and shows a **mock GitHub scenario** switch in the header (environments exist, fresh repository, registry secrets exist, environment names taken); the tests use the same mock. To try the real code path without a token, run `npm run fake-github` and `npm run preview:fake` (after `npm run build`) and connect with `ghp_demo`. The demo server also has two helpers that are not part of GitHub's API: `GET /__fake/state` (what it holds, secrets already decrypted) and `POST /__fake/permissions` (for example `{"admin": false, "push": false}`, to see writes fail and retry).

## Status and TODO

**Works**

- A seven-page form with a left menu (grouped pages), a progress bar, conditional pages, calculated values, generated secrets, an editable users table, and per-environment answers.
- Connect step: a GitHub token (held by the dev server in memory) or "skip GitHub". The repository is pre-filled from `git remote origin`.
- **Without GitHub, no secrets:** when GitHub is skipped, or the dev server has forgotten the token (`GET /api/github/status` is asked when the form opens), no secret is asked for or generated (see "Without GitHub: no secrets").
- Existing environments from GitHub and from the folder; precedence, one-to-many bindings, conflicts reported.
- **The write step:** the last page opens a review (what is new, updated, unchanged or kept, secrets masked, file diffs). "Apply" then creates the environment, sets variables and secrets, and writes the files, item by item, with progress and a retry for what failed. Afterwards it offers a `.env.<name>` (with the secrets) and an answers JSON (without).
- Real GitHub reads and writes through the dev server, with a fake GitHub for tests and demos.
- Bindings, the template scanner, the renderer and a build check that keeps them honest.

**Not done**

- The OpenTelemetry chart (vendored, not wired to a `files:` entry); deeper folder trees.
- Questions that are GitHub variables only (`DOMAIN`, the approval settings, `KUBE_MASTER_NODE`, `KUBE_API_ALLOWED_CIDRS`, ...) are still asked without GitHub although nothing can store them then; only secrets are skipped.
- Variables the CLI derives from the domain, and the other secrets it generates (see "Review and apply").
- A UI for the precedence setting (the setting itself works, in `bindings.yml`).
- A run against github.com with a real token; Playwright; verifying that a token can really trigger workflows.

---

The sections below are the working notes of the build: how existing environments are read, the GitHub routes, bindings, the repository layout, how this differs from the original plan, the UI experiments, and the checks that were run.

## Existing environments: reading GitHub and files

**Connect step.** The first screen asks for a GitHub token or lets you skip GitHub. The repository is pre-filled from `git remote origin` of this project and can be edited. The page sends the token once, when you connect, and clears it from the form; it is never stored by the page, put in a URL or logged. The dev server keeps it in memory (see "Real GitHub"). The token is meant to be reused later for provisioning and the self-hosted runner, so the screen says it must be able to manage the repository's environments, secrets and variables and to trigger workflows.

**Environment list.** With GitHub: the repository's environments. Without: the `environments/` folder, using subfolder names if there are any, otherwise the names of `*.yaml` / `*.yml` files.

**Picking an existing environment** reads every available source, merges them, and fills the form (`src/bindings/snapshot.ts`, `src/form/apply.ts`):

- **GitHub** gives variable values and the *names* of secrets. GitHub never returns secret values, so a secret that exists is shown as a locked field with an **Edit** button: it is no longer required, is kept as it is, and a generated secret is not regenerated. Press Edit and type a value to replace it.
- **Files** (the four listed under `files:` in `forms/bindings.yml`, such as `environments/<name>/inventory.yml` and `dependencies/values.yaml`) are read back by the bindings. Handlebars cannot parse, so `scripts/check-bindings.ts` renders each template with marker values and finds where every variable lands in the YAML (`src/bindings/templateScan.ts`); wildcards cover loops, and a value inside a longer string is read by its fixed prefix.
- **Precedence:** GitHub wins by default. `precedence` in `forms/bindings.yml` sets the global order and any binding can override it; `buildSnapshot` also takes one at run time (no UI for it yet). Where sources disagree the winner is used and the banner lists the conflict.
- **One-to-many:** a question lists several targets (`BACKUP_HOST` has a GitHub variable and two files).
- **Switching** to another environment resets the form first; a new name only clears the form if an existing environment was loaded before it.
- The page switches (Email, Infrastructure) and the Backup/Restore choice, a suggested environment type are inferred from what was found (`src/form/infer.ts`), since nothing stores them.

**`forms/bindings.yml` and the check.** Every question must be bound or listed under `ignore`; secrets need a GitHub secret target; file targets must name a variable the template really has; `src/generated/file-paths.json` must be current (`npm run bindings`). `npm run check` runs it, and it reports template variables that are readable but unbound (`monitoring_enabled`, `backup_enabled`, …), ones that cannot be read back (`s3_migrate_from_minio_to_rustfs`, …) and templates that are not listed under `files:` (`opentelemetry`, the `values.override.yaml` files). The inventory, the dependencies, traefik and opencrvs-services files are in scope.

**Dev server (`server/`).** A Vite plugin serves `GET /api/context`, `/api/environments` and `/api/environments/:name` (the local files) and the `/api/github/*` routes below, in both `vite` and `vite preview`, bound to localhost. It reads only the files listed under `files:` in `forms/bindings.yml` for a known environment (never `values.override.yaml`) and refuses anything else, including path traversal. The app therefore no longer works as purely static files.

**Not built yet:** a UI for the precedence setting, and the `opentelemetry` chart. The sample environments `dev`, `qa`, `uat` and `prod` in `environments/` are generated from the real templates (`npm run fixtures -- --force` refreshes them; the other folders there, such as `development` and `production`, are not fixtures and are left alone); the demo GitHub's environments (`qa`, `staging`, `production`) overlap with them only on `qa`, where `KUBE_API_HOST` differs on purpose to show a conflict.

## Review and apply (the write step)

Nothing is written until "Apply". The form's last button is "Review changes": it checks the form, reads GitHub **again** (so the statuses describe it as it is now), works out a plan, and renders the files without writing them.

**What is in the plan** (`src/plan/plan.ts`): every GitHub variable and secret that `bindings.yml` binds to a question that is on screen.

| Status | Meaning |
|---|---|
| new | does not exist yet |
| update | exists with another value. An entered secret is always an update: its current value is unknown. |
| unchanged | same value: nothing is written |
| kept | a secret that exists and was left empty: nothing is written |

The plan also says whether the environment will be created, and lists repository-level items (the registry) before the environment's.

- **Only what is on screen** (`src/form/active.ts`): an answer on a hidden page or in a hidden panel is left out, so a value typed before a switch was turned off is never written.
- **Prefilled from the repository:** picking a new name fills repository-level values (such as `REGISTRY_HOST`) from GitHub, so a form default does not silently replace what the repository holds.
- **Empty variables are skipped**, and so is a secret that is empty and does not exist.
- **Review screen:** secrets are masked and never shown again, files show a diff (or "new", or "no changes"), and the button says how many changes it will make.

**Apply** (`src/plan/apply.ts`) runs one step at a time: create the environment, repository items, the environment's items, then the files. A failed step is shown with a plain reason and the rest still run; "Retry failed" re-runs only those. The two sides do not depend on each other: if GitHub is skipped only the files are written, and if the files cannot be written (no dev server) GitHub still is.

**Files** (`server/files.ts`). Where a file goes depends on the layout: `environments/<name>/inventory.yml` and `.../dependencies/values.yaml` in the tree layout (also for a new environment in an empty folder), the single `environments/<name>.yaml` in the flat layout, where the review lists the other file as "not written". The templates are rendered with the same Handlebars and helper as the CLI. For the sample environments `qa`, `uat` and `prod`, rendering from the form answers reproduces the CLI's own output byte for byte (a test), and reading the rendered files back returns the same answers. Template variables that no question feeds come from `defaults` and `derived` in `bindings.yml` (monitoring on, rustfs on, `single_node`, `env`, the backup and restore switches). `npm run check` fails if a variable of a template has no source, so one can never render blank. An environment that is updated has its two files regenerated, so values the form does not ask about return to those defaults; the review diff shows that.

**Downloads.** GitHub never returns secret values, so after applying the page offers `.env.<name>` (every value written, **including the secrets**; keep it private) and `<name>-answers.json` (no secrets). Both are made in the browser when clicked and are not stored anywhere.

**Not written:** the variables the CLI derives from the domain (`GATEWAY_HOST`, `CLIENT_APP_URL`, ...) and the secrets it generates that have no question here (`POSTGRES_USER`, `SUPER_USER_PASSWORD`, ...). The backup secrets are written (next paragraph). An environment written by this page is therefore not yet complete for provisioning.

**Backup secrets.** For the backup of an environment the CLI keeps three environment secrets: an Ed25519 SSH key pair for the backup server (`BACKUP_HOST_PRIVATE_KEY`, `BACKUP_HOST_PUBLIC_KEY`, whose public key the provisioning workflow installs for the backup user) and `BACKUP_ENCRYPTION_PASSPHRASE`, which encrypts the backups. None has a question: `generateBackupSecrets` (`src/plan/backupSecrets.ts`) makes what is missing when the review is prepared, only for an environment that backs up, and the plan writes them like any other secret. Without GitHub nothing is made. The Backup panel's checkbox **Generate new private/public SSH key pair** decides about the key pair only, and shows the rule: it is **ticked and locked** while the environment has no `BACKUP_HOST_PRIVATE_KEY` on GitHub (a new environment, or one without it; the form variable `backupKeysExist`, set in `src/form/apply.ts` before the answers are cleared), and **unticked and free to tick** when it has one. The plan applies the same rule whatever the box says (as the CLI does: it checks only the private key):

| | New environment, or one without the secret | Existing environment that has it |
|---|---|---|
| SSH key pair | made, whether or not the box is ticked (the CLI makes one in the same case) | kept, and not in the plan; replaced when the box is ticked |
| Encryption passphrase | made | kept, **never replaced**: every backup already made is encrypted with it, so a new one would leave them unreadable |

The key pair comes from one call to the dev server (`POST /api/ssh-keypair`, `server/sshKeys.ts`, `ssh2`'s `generateKeyPairSync('ed25519')`, as in the CLI); the passphrase is 16 random characters made in the browser like the other generated passwords (as in the CLI). They are masked in the review, written with the rest and included in the `.env` download, which is the only copy you will have. Each review makes new ones; only what is applied is stored. `ssh-keygen -y` accepts the stored private key and returns the stored public key (a test and a run against the fake GitHub both check it).

**Checked.** Unit and integration tests (plan, apply with failure and retry, routes, validation, cross-site requests), and in a browser against the fake GitHub: connect, fill, review, apply into a read-only repository (14 steps failed with reasons, the file step went through), restore access, "Retry failed" (all 15 done), then compare: all 9 secrets decrypted by the fake equal the form's values (by hash), variables are right, other environments untouched, the two files on disk are right, and both downloads have the expected content.


## Without GitHub: no secrets

Secrets are stored on GitHub only; the rendered files hold none. So when GitHub is not available, a secret has nowhere to go and the form does not ask for it or generate it. GitHub counts as not available when:

- "Skip GitHub" was chosen on the Connect step, or
- the dev server no longer holds the token (it keeps it in memory, so a restart of `vite` forgets it) or cannot be reached. The form calls `GET /api/github/status` as it opens; a header banner says what happened, the connection dot goes grey, and the environment list, the review and the apply step work as for a skipped GitHub (environment files only).

What is skipped:

| Page | Skipped without GitHub | Still asked (it goes into the files) |
|---|---|---|
| Environment | the generated Metabase admin password; the "Configure Email" switch | environment name and type, domain, 2FA, ... |
| Container registry | the whole page: the registry host is a repository variable, the rest are secrets | |
| Email | the whole page (every setting is a secret) | |
| Data stores | user and password of Elasticsearch, S3 and Postgres | the hosts, and the "Use built-in component" switches |
| Monitoring | Kibana user and password; the Sentry switch and DSN | the monitoring and OpenTelemetry switches |
| Backup/Restore | the backup server user, and the backup secrets (the SSH key pair's checkbox is hidden and nothing is generated) | backup host, restore host and the modes |
| Traefik | the certificate and its key | the certificate mode (the file is rendered for it; add the certificate on GitHub later) |
| Disk encryption | the whole page: the key is a secret and the size a GitHub variable | |

How it works:

- The form variable `{githubAvailable}` (`createSurvey(false)` sets it; `setGitHubAvailable` changes it later and drops any secret already typed or generated).
- `src/form/survey.ts` adds `and {githubAvailable} = true` to the condition of **every** secret question, so a secret question added later is covered without touching anything else. Pages and switches that are about GitHub only but are not secrets (registry, Configure Email, Sentry, Disk encryption) say so in `forms/wizard.yml`.
- `generateMissingSecrets` does nothing while GitHub is not available, so no value is generated on a page change either.
- The review plan is empty for GitHub (`plan.github` is false) and the answers sent to the file routes never held secrets, so nothing secret can reach a file.
- Tests: `tests/form/no-github.test.ts`.

## Real GitHub

The page never calls GitHub. It asks the local dev server, which holds the token in memory and calls the REST API with Node's `fetch` (`server/github.ts`; the added dependencies are `libsodium-wrappers`, for secrets, and `ssh2`, for the backup server's SSH key pair; neither reaches the browser bundle).

| Route | What it does |
|---|---|
| `POST /api/github/connect` `{token, owner, repo}` | Checks the token (`GET /user`, `GET /repos/{owner}/{repo}`), keeps it in memory if it works, answers `{ok, login, missingPermissions}`; the token is never in an answer |
| `POST /api/github/disconnect` | Forgets the token. The page calls it on every load and on "Change connection", so a reload never leaves a token behind |
| `GET /api/github/status` | `{connected, owner, repo}`. The form asks it when it opens (`isGitHubAvailable` in `src/github/availability.ts`): if the dev server has forgotten the token, or cannot be reached, the page carries on as if GitHub had been skipped (see "Without GitHub: no secrets") |
| `GET /api/github/environments` | environment names |
| `GET /api/github/repository` | repository variables (with values) and secret **names** |
| `GET /api/github/environments/:name` | the same for one environment (an environment that does not exist is empty) |
| `POST /api/github/environment` `{name}` | Creates the environment (`PUT .../environments/{name}`); an existing one is left as it is |
| `POST /api/github/variable` `{scope, environment?, name, value, exists?}` | Creates a variable, or updates it (`POST` or `PATCH`); if `exists` was wrong the other call is tried |
| `POST /api/github/secret` `{scope, environment?, name, value}` | Fetches the public key of the repository or environment, encrypts the value with a libsodium sealed box, and `PUT`s it |
| `POST /api/ssh-keypair` | Makes a new Ed25519 key pair for the backup server and answers `{publicKey, privateKey}` (OpenSSH formats). Nothing is kept or written; only a `POST`, so it is not cached and a page from another site cannot trigger it |
| `POST /api/environments/:name/render` `{values}` | Renders the files and returns them with the layout, where each would be written (`target`, or null when the layout has no place for it) and what is there now; writes nothing |
| `PUT /api/environments/:name/files` `{values}` | Renders again on the server and writes the files where the layout puts them (`environments/<name>/...`, or `environments/<name>.yaml`); answers with the places written |

- **Paging:** reads follow `Link: rel="next"` (100 per page) but never to another host, so the token cannot be sent elsewhere.
- **Errors:** 401 "rejected the token", 403 rate limit or forbidden, 404 repository not found, unreachable GitHub: plain messages that never contain the token or GitHub's reply.
- **What the token check can tell:** a classic token reports its scopes, so a missing `repo` or `workflow` is flagged. A fine-grained token reports none, so only repository access is checked. Whether a token may actually **trigger workflows** cannot be known without triggering one, so that is not verified. Creating environments needs admin access to the repository, which is checked.
- **Other sites:** the server refuses a non-local `Host` (DNS rebinding) and any `Origin` other than itself, and POSTs must be JSON, which makes a browser send a preflight. Another website therefore cannot use the connected token. This holds for every write route too.
- **Writes:** one change per request, so the page can show progress and retry one item. Names are checked (`^[A-Za-z_][A-Za-z0-9_]*$` for variables and secrets), values must be 1 to 48 KB, and answers never repeat the value or the token. The file routes accept answers only, never file content or paths: the server renders from its own templates and writes only to the known places. 403 on a write says the token cannot change this; a missing environment is reported as missing.
- **Not tested against github.com.** The routes follow GitHub's documented REST API (environments, variables and secrets, including `.../secrets/public-key`), and `server/fakeGitHub.ts` answers the same shapes and status codes (variable `POST` is 409 when it exists), but I have not run this with a real token. One assumption to confirm: GitHub variables cannot be empty, so an empty value is skipped, never written. `GITHUB_API_URL` points the dev server at a different host.

## Repository layout

```
forms/wizard.yml            form definition (SurveyJS JSON written as YAML, compiled by a Vite plugin)
src/form/                   survey factory, expression functions, secret question, secret helpers
src/github/                 GitHubPort (with the status check) and ConnectionPort, the browser adapters for the dev server (http.ts), and mocks
src/local/                  client for the dev server's /api (repository from git, environments/ folder)
src/bindings/               bindings, parsers and formatters, template scanner, file/GitHub readers, snapshot merge
src/plan/                   the plan, apply steps, review, .env, diff, template values
tests/plan, tests/server    plan and apply, the dev server (routes, GitHub client, files)
src/app/                    Connect step, form step, "what was found" banner, Review and Apply screens
server/                     the dev server: /api, the GitHub client, a fake GitHub for tests and demos
templates/                  CLI templates, copied unchanged (see templates/README.md)
forms/bindings.yml          which stored value feeds which question
scripts/                    check-bindings (runs in `npm run check`), fixture generator
tests/form/                 Vitest on a bare survey-core model (no DOM)
```

Question names are the GitHub secret / variable names, so later renderers can map them directly. `secret: true` (or the `secret` question type) marks values that stay in memory and out of exports.

## Differences from the plan and the real script

Field names come from the v2 toolkit (`opencrvs-core/packages/toolkit/src/environment/`, branch `rustfs`, checked 2026-10-31), not from the docs or the deprecated script in `opencrvs-countryconfig`.

| Plan | Here |
|---|---|
| `DOCKER_USERNAME`, `DOCKER_TOKEN`, `DOCKERHUB_ACCOUNT`, `DOCKERHUB_REPO` | `REGISTRY_USERNAME`, `REGISTRY_TOKEN`, `REGISTRY_ORGANISATION`, `REGISTRY_REPOSITORY`, `REGISTRY_HOST`. The old names are `legacy:` entries in `forms/bindings.yml`, the only place they are written down: they are read when loading an environment, so a secret under its old name still counts as defined. |
| `MINIO_ROOT_PASSWORD` | `S3_ADMIN_SECRET_KEY` (old name is a `legacy:` entry in `forms/bindings.yml`) |
| Five environment types, including `backup` | Two, as in the CLI: non-production (development, QA, testing) and production (staging and production, which hold PII data). The script has no backup type. Existing environments get a suggestion from their name: `dev`, `development` and `qa` are non-production; `staging`, `prod` and `production` are production; other names are left for you to choose. |
| Backup page for staging/production, requires an existing backup environment | The Backup/Restore page is always there with a None / Backup / Restore choice, as in the CLI where an environment does one or the other. Backup asks for `BACKUP_HOST`, user and mode, and whether to generate a new SSH key pair (a new environment always gets one, as in the CLI); Restore asks for `RESTORE_ENVIRONMENT_NAME` (existing GitHub environments, or any name typed), `RESTORE_ENVIRONMENT_MODE` and `RESTORE_HOST`. The "requires an existing backup environment" rule is not built. |
| `ACTIVATE_USERS` defaults to false | Defaults to true, forced to false and read-only for the production type, as the script derives it. |
| Email page shown unless the type is `backup` | Email page appears only when "Configure Email (SMTP) settings" on the Environment page is on (default off) and GitHub is available. Hidden pages leave the menu and the progress count, and their values are dropped when the form completes. |
| Environment name is free text | A dropdown of existing environments (from GitHub, or from the `environments/` folder when GitHub is skipped). Picking one loads it for **update**; typing a new name creates a new environment. There is no "already exists" message. |
| Kubernetes, SSH users, Traefik and disk always asked | Behind "Configure Infrastructure" on the Environment page (default on), which hides those pages together; the menu's Infrastructure header goes with them. Backup/Restore is under Dependencies and is always there. The Email page has its own, independent toggle. |
| `BACKUP_HOST` and worker rows must be IPs | Kept as IPv4-only, as in the plan. The script accepts hostnames for both (`BACKUP_HOST` is unvalidated there). |
| Generator settings in `outputs.yml` | `length`, `charset` and `autoGenerate` sit on the `secret` question in `wizard.yml`. A generated secret is 16 characters of `[A-Za-z0-9]` unless it says otherwise; the four user names (Elasticsearch, S3 access key, Postgres, Kibana) use `charset: username` and `length: 12`: lowercase letters and digits, always starting with a letter. No `outputs.yml` yet. |

Not built: Playwright, `outputs.yml` (its job is done by `bindings.yml`), and the plan's other form fields (approvals, 2FA, SSH users, SSL, disk, monitoring, Sentry). The review, apply and download screens now exist (see "Review and apply").

## UI customisation: left menu

`showTOC: true` and `tocLocation: left` in `wizard.yml` give a left menu with no custom UI code. Findings (checked in the browser and in `tests/form/menu.test.ts`):

- **Lists visible pages only.** Registry and Backup appear and disappear with the form's conditions.
- **Validates as you move.** Clicking ahead from an incomplete page is blocked and shows the errors. From a valid page the jump stops at the first later page that still needs input, so pages cannot be skipped.
- **Responsive.** On a narrow pane it collapses into a hamburger button. SurveyJS draws that as a small, faint round button at the top right, on top of the progress label, so `src/styles.css` restyles it (`.sv_progress-toc--mobile`) as a round blue button in the header at the top left, in front of the logo. The header is sticky, so the button stays in view while the page scrolls. It opens the same page list as before.
- **Live items.** `survey.tocModel.listModel.actions` has one item per page, and changing `item.title` re-renders at once. `src/form/menu.ts` uses this to put a ✓ before a page once the user has left it with all required answers filled. Validators are not run for this, so the async name lookup is not triggered.

Other options that exist in survey-core 3.x but are not used here: `navigationTitle` per page for a different menu label than the page title, `tocItemComponent` to render items with your own component, the top/bottom progress bar (`showProgressBar`), and the ready-made themes in `survey-core/themes` with CSS variables. A fully custom React sidebar built on `survey.visiblePages` and `survey.tryNavigateToPage()` is possible, but the built-in menu already covers navigation, validation and mobile.

## UI customisation: progress bar

`showProgressBar: true`, `progressBarLocation: aboveHeader` and `progressBarType: requiredQuestions` in `wizard.yml` add a bar with the text "Answered 4/19 questions" (tests: `progress.test.ts`).

- **Counts what is left to do.** Only required questions on visible pages count, so the total changes with the form: 19 to start, 22 when "Configure backup" adds its page.
- **Starts above zero.** `REGISTRY_HOST` is required and has a default, so the bar reads 1/19 on a fresh form. Secrets count once their page has been shown, because they are generated then.
- **Updates live** as answers are typed or cleared; `survey.progressValue` is a percentage and `survey.progressText` the label.
- **Placement.** With the left menu on, the bar sits at the top of the form column, not above the menu. `progressBarLocation` also accepts `belowHeader`, `bottom` and `topBottom`; SurveyJS lower-cases the stored value.
- **Alternatives.** `progressBarType: pages` (the default) shows numbered steps, and with `progressBarShowPageTitles` their titles. Next to the left menu it duplicates it and the titles are truncated, so it is not used. `questions` counts all questions, including optional ones.

## UI customisation: grouped menu

The pages sit under three headers in the left menu (`MENU_GROUPS` in `src/form/menu.ts`):

- **General:** Environment, Container registry, Email.
- **Dependencies:** Data stores, Monitoring, Backup/Restore.
- **Infrastructure:** Kubernetes, SSH Users, Traefik, Disk encryption.

The pages of a group follow each other in `forms/wizard.yml`, because a header is placed before the first page of its group. SurveyJS has no nested pages; the menu is a flat list of items, so a group is faked:

- A header item is inserted before the first page of the group; clicking it opens the group's first visible page.
- The group's pages get a CSS class (`env-menu__child`) that indents them; `src/styles.css` also bolds the header. The pages stay ordinary pages, so validation, Next, the progress bar and the ✓ marks need no changes.
- Items have a `level` that the list reads for a CSS variable, but the React renderer does not apply it, so the class is used instead.
- Not done: collapsing a group, or a header that shows a ✓ when all its pages are done. Both are possible by changing the header's title or `css` from `trackMenuStatus`.

## SSH users page

The CLI's "manage users" (`opencrvs-core/packages/toolkit/src/environment/manage-users.ts`) is a menu loop over a list of `{ name, ssh_keys[], state, role }` that ends up in the inventory as `all.vars.users`. On the page it becomes one editable table (`USERS` in `wizard.yml`, after the Kubernetes page, as in the CLI); `src/form/users.ts` converts the rows to that same shape.

| CLI action | On the page |
|---|---|
| Add new user | "Add user" button; the SSH keys panel opens automatically |
| Edit user | edit username, role and state in the row; keys in the row's expandable panel |
| Remove user | trash button with a "Remove this user?" confirmation |
| View all users | the table |
| Save and exit | Next |
| Add current system user | **not possible**: a web page cannot read `~/.ssh`. A "load a .pub file" button would be the closest equivalent. |

Behaviour (tests: `users.test.ts`, plus browser checks):

- Zero users is allowed, with a warning that nobody can log in over SSH. A user with no keys gives a non-blocking warning, as the CLI does.
- Username uses the CLI's rule (`^[a-z_][a-z0-9_-]*[$]?$`) and must be unique; the duplicate message shows on both rows. Both block Next.
- Keys are parsed like the CLI (one per line, `#` lines and blanks ignored).

Deliberate differences from the CLI:

- Every key line must look like an OpenSSH public key (`ssh-ed25519`, `ssh-rsa`, `ecdsa-…`, …). The CLI accepts anything, so a pasted private key would be written to the inventory; here it is rejected.
- New users default to `operator` (least privilege); the CLI lists `admin` first.
- Existing users are loaded from the environment's inventory (`all.vars.users`, read by the `users` parser in `src/bindings/parsers.ts`) and written back to it (`rowsToUsers`).

Layout lessons (the form column is only ~550 px wide with the left menu and answers panel):

- A dynamic table with an expand column and a remove column loses about 90 px per icon column. `src/styles.css` narrows `.sd-table__cell--actions`.
- Column `width`/`minWidth` are hints; SurveyJS adds padding, so test the real widths. `allowClear: false` on required dropdown cells frees the room the × button takes.
- A hairline (about 5 px) horizontal scroll can still appear on the users table.

## Risk check results

| Check | Result | Evidence |
|---|---|---|
| Async environment-name check | **Superseded** (the check was removed, see "Existing environments"). It passed while it existed: | In the browser, Next with a taken name stays on the page and shows "An environment with this name already exists on GitHub. Delete it on GitHub first." Changing to a free name and clicking Next goes on, with no reload. Tests: `github.test.ts`. A mutation that made the check always pass failed four tests. |
| Visibility from external state | **Pass** | Switching the mock scenario to "registry secrets exist" hid the Registry page (it was the current page, so the form fell back to the first page); Next from Environment then went straight to Email. Tests cover both directions. |
| Stable generated secrets | **Pass** | In the browser the five secret components unmounted, other answers changed (type, domain, backup), and after returning the model and DOM values were identical. Tests: `secrets.test.ts`. |
| Table to calculated value | **Pass, then superseded.** The calculated `KUBE_WORKER_NODES` question and its `joinColumn` function were removed: the `csv-to-ip-rows` parser and formatter in `src/bindings/parsers.ts` now turn the table into the GitHub variable and back (`tests/bindings/`). It passed while it existed. | Real UI: zero rows gives an empty value; three rows gave `10.0.0.1,10.0.0.2,10.0.0.3`; editing row 2 gave `10.0.0.1,10.0.0.99,10.0.0.3`; removing row 1 gave `10.0.0.99,10.0.0.3`. The answers panel updated each time. |

SurveyJS stays as the form library for this design. No fallback from the plan was needed.

## Branding

Colours, fonts and the logo follow https://www.opencrvs.org/. Everything is bundled, so the installer still works offline.

- Colours are CSS variables (`--brand-*`) at the top of `src/styles.css`. The SurveyJS form is themed by overriding its `--sjs2-*` tokens (brand colour, font family, page background) in the same file.
- Poppins (SIL Open Font License) is in `src/assets/fonts/`, loaded by `@font-face`. The logo is `src/assets/opencrvs-logo.svg`; the favicons are in `public/`.

## Disk encryption, monitoring and the services file

- **Disk encryption** (Infrastructure → Disk encryption) follows the CLI: it is off by default and can only be chosen for a new environment. `DISK_SPACE` (default 200g) is a GitHub variable and `ENCRYPTION_KEY` a generated secret that cannot be edited. An environment that already has a key shows both locked.
- **Monitoring** (after Dependencies) holds `MONITORING_ENABLED` (on by default; a GitHub variable and `monitoring.enabled` of the dependencies chart), an **OpenTelemetry** panel, the Kibana user and password, and an optional Sentry DSN. The OpenTelemetry panel is a set of questions that no longer depends on `MONITORING_ENABLED`: `OTEL_ENABLED` (a GitHub variable and `otel.enabled` of the services chart), then, while it is on, the **Use built-in component** checkbox (`USE_BUILTIN_OTEL_COLLECTOR`, not stored: it is inferred from the endpoint) and, once that is unchecked, `OTEL_COLLECTOR_ENDPOINT` (a GitHub variable, `otel.exporter_otlp_endpoint` of the services chart and the tracing endpoint of the Traefik chart). The endpoint is a URL whose `http://` or `https://` is optional. A built-in collector has no endpoint question on screen, so its address inside the cluster is written (`src/plan/dependencyHosts.ts`).
- **"Use built-in component"** on the Dependencies page is the `enabled` key of that dependency in the dependencies chart (`elasticsearch`, `rustfs`, `postgres`, `redis`), so reading an environment back restores the checkboxes from the file. An environment without that file still gets them from its hosts. The checkbox only decides whether the **host** is asked. The Postgres user and password and the S3 access and secret keys are asked (and generated) either way, because the services sign in to a built-in component with them too, and every environment keeps them on GitHub; a hidden question is left out of the answers, so hiding them left the environment without these secrets. The Elasticsearch user and password are asked only for an Elasticsearch of your own.
- **The services chart** (`opencrvs-services/values.yaml`) is now the fourth file the installer writes. It takes the environment type, 2FA, OpenTelemetry and the four dependency hosts from the form. A dependency that is built in has no host question on screen, so its address inside the cluster is written; reading the file back treats that address as "built in". These addresses are written once, in `src/plan/dependencyHosts.ts`: the form pre-fills each host question from it (the `defaultAddress()` function in `forms/wizard.yml`), and rendering gives it to every template variable that such a question feeds when the question has no answer, so a new built-in default needs only its entry there and its binding in `forms/bindings.yml`. `templates/README.md` lists how this file differs from the CLI's.

## Offline and size

- Production bundle: JS 2,410 kB (586 kB gzip), CSS 552 kB (54 kB gzip), plus four Poppins font files (about 8 kB each). Most of it is survey-core; it is not split.
- Loading the page makes only requests to `localhost`: the HTML, JS and CSS, plus the dev server's `/api` calls. (That means the app needs `vite` or `vite preview` running.) The CSS has no `url()` or `@import`, and the JS references no external scripts or fonts.
- **Not tested:** running with the network switched off. The browser pane cannot toggle it; the request log above is the evidence instead.
- After generating secrets and typing a token: no `localStorage`, `sessionStorage`, IndexedDB, cookies, URL or console output contained them.

## SurveyJS v3 notes

- Async expression functions need `FunctionFactory.register({ isAsync: true, useCache: false })` and return through `this.returnResult`. With caching on, a taken name would stay "taken" after the scenario changes.
- Async expression validators work with `nextPage()`: it waits, then either navigates or shows the error.
- `enableIf` makes a question read-only; there is no `readOnlyIf` and no `notanyof` operator.
- Custom property `secret` is registered on `question`; `survey.jsonErrors` is checked in a test so a typo in the YAML fails the build.
- YAML flow mappings split on commas (`{ text: a, b }`); quote such strings.
- The Copy button could not be verified here: the browser pane denies clipboard access even for a direct `writeText`. The button shows "Copy failed" in that case.

## Origin of this repository

It began as a spike to find out whether SurveyJS Form Library can drive a browser version of `yarn environment:init`, with four risk checks (async validation, visibility from external state, stable generated secrets, a table feeding a calculated value). Results are under "Risk check results". SurveyJS stayed as the form library.
