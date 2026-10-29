---
status: proposed
---

# Hotfix and security updates are applied by an in-cluster Deployer

A country learns about a security fix by following releases, and applies it by running `helm upgrade` itself. We will add a small Deployer service that checks `updates.opencrvs.org` for hotfix and security releases and reports one on an endpoint that only the gateway can reach. When an authorised user presses Update in the client, the Deployer runs the Helm upgrade. The Deployer only moves the core images of the `opencrvs-services` release, only within the installed minor version, and only when a user asks.

## How it works

1. The Deployer polls a signed file at `updates.opencrvs.org` (the updates manifest) that names the latest hotfix and security releases. It verifies the file and keeps the result as its own state.
2. `GET /status` on the Deployer returns the verified update, or the state of the upgrade that is running. Only pods in the OpenCRVS namespace can reach it. The gateway fetches it, and the client shows a message and an Update button.
3. The button calls the gateway. The gateway checks that the user holds the update scope, for example the national system administrator. It then asks the auth service for a short-lived token for the Deployer and calls `POST /update`.
4. `POST /update` has no body. The caller cannot name a version, so the Deployer applies the version from its own verified manifest. The request carries `X-User-Id` and `X-User-Full-Name` for the audit record, and `If-Match`, the version the user was shown.
5. The Deployer runs `helm upgrade` for the `opencrvs-services` release and carries the previous values forward.

## Decisions

**Scope is one release and patch versions.** The Deployer manages `oci://ghcr.io/opencrvs/opencrvs-services` and nothing else. It does not touch the dependencies chart or MOSIP, and it does not run a minor or major upgrade. Those stay manual, because they can carry migrations. The countryconfig image belongs to the country, and the Deployer does not change it.

**The Deployer calls Helm. It does not patch Deployments.** The chart runs hooks on every `helm upgrade`: predeploy validation, the Postgres on-deploy job, the analytics migration, the S3 secrets migration, and an Elasticsearch reindex afterwards. A patch of a Deployment skips all of them and leaves the Helm release out of step with the cluster.

**The update is manual in v1.** Nothing is applied without a user pressing Update.

**The caller never names a version.** If `/update` accepted a version, the gateway or anything that held a valid token could choose what runs in the cluster. The Deployer decides, from a manifest it verified itself. `If-Match` is only a freshness check. The Deployer refuses the request when the version the user saw is no longer the version it would apply.

**The gateway proves the user to the Deployer with a token from the auth service.** The token has the audience `deployer`, the update scope, the user as subject, the version to apply, a short expiry and a unique id that the Deployer refuses to accept twice. A leaked user token cannot start an update, and a leaked update token works for one version for about a minute. The Deployer never calls the gateway to check anything, because the gateway restarts during an update.

**There is no migration guard.** A hotfix does not contain migrations, and the schema only gains things. A rollback to the previous release is then safe, because the old pods run against a database that has only grown. We do not carry a `requiresMigration` flag in the manifest and we do not require a backup before an update.

## Options that we rejected

**Flux, with the Helm and source controllers.** It has what the Deployer needs: semver selection, cosign verification, rollback on failure, and impersonation of a service account. We rejected it because the countries do not use GitOps, so each would install two controllers and their CRDs only for this. Flux also polls the registry, not our manifest, so a service that checks the manifest would still be needed.

**Argo CD with Image Updater.** It needs a GitOps setup. Image Updater changes the parameters of an Argo CD Application, and its documentation describes no way to trigger an update on demand.

**Keel.** It follows image tags in a registry and not a manifest. Its documentation describes no authentication for the approvals endpoint.

**Replicated KOTS.** It is the closest product to what we want, but it needs a license from a vendor portal and has its own admin console, not a button in OpenCRVS.

**Patching Deployments directly.** See the decision above. It would also be undone by the next `helm upgrade` that a country runs from its values file, which pins `platform.tag` to the old version.

## Consequences

**The Deployer is the most privileged workload in the namespace.** Helm writes Secrets, Deployments, Jobs, NetworkPolicies and Traefik resources, and stores the release in Secrets. A compromised Deployer can read the namespace's secrets and run any image. Four controls carry this risk: a manifest that is verified before anything acts on it, the token above, no ingress route, and egress to the manifest host and the registry only. The chart's default egress is private-only, so the Deployer needs an explicit egress opt-out, as countryconfig has.

**A manual `helm upgrade` undoes a hotfix.** A country that deploys from its own values file keeps the old `platform.tag` there. After an update, the country must change its values file, or the next manual deploy goes back to the old version.

**A tag set on one service wins over `platform.tag`.** The image helper takes `<service>.image.tag` before `platform.tag`. A country that pins a core service will not get the hotfix for that service.

**A hotfix is not an image swap.** The hooks above run on every upgrade, so the Helm timeout must be generous.

**The rollback assumption is not checked by anything.** If a hotfix does carry a destructive or renaming migration, `--rollback-on-failure` starts the old pods against a changed schema, and nothing in the Deployer notices. The release process must hold the rule that a hotfix tag has no destructive migration.

**Helm is the only safety net.** There is no GitOps controller that reconciles the release afterwards, so rollback on failure and a lock that allows only one upgrade at a time have to be right.

## Not yet decided

- **Who owns the signing keys.** The manifest is only worth trusting if it is signed, and a forged one would run code in every country's registry. We have not decided who holds the private key, who may sign a release, how a key is rotated, or how a leaked key is revoked. The options are one offline key, a TUF-style root with delegated keys, and keyless signing from CI. Until this is decided, the trust model is incomplete.
- **How the Deployer survives its own upgrade.** The Deployer should not be replaced in the middle of the `helm upgrade` that it runs. One way is a Kubernetes Job, with its own service account, that runs the upgrade, so the Deployer can be one of the things that the upgrade replaces. The other way is a Deployer image that stays the same for each minor line, for example `v2.1` for every `v2.1.x`, with a separate way to patch the Deployer itself. A manual upgrade of the Deployer must remain possible in both cases.
- **The language of the Deployer.** Go can use the Helm SDK (`helm.sh/helm/v4`). TypeScript matches the rest of the repository but has to run the `helm` command line.
- **The schema of the manifest.** The fields, the hosting, how often the Deployer polls and the format of the signature are not decided.
- **How the auth service issues the token.** We have not checked whether it can issue a token with another audience. If it cannot, it needs an internal endpoint that only the gateway can call, and a key for these tokens that is not the key for user tokens.
- **Where the Deployer is installed.** It can be part of the `opencrvs-services` chart or its own release. This follows from the choice about self-upgrade.
- **Updates without a request to the internet.** Countries behind a proxy, with a mirror registry, or with no outside access are not described yet.

## Details that we propose and have not confirmed

- The Deployer applies its last verified manifest and does not fetch again when the user clicks.
- `POST /update` answers 202 when an upgrade starts, 409 when none is pending, one is running, or `If-Match` is stale, and 401 or 403 when the token is refused.
- The scope is called `system.update`.
- The audit identity is the subject of the token. `X-User-Id` and `X-User-Full-Name` are for display, and the Deployer limits and cleans the full name before it writes it to a log or an event.
- The manifest carries `appliesTo` and `severity`, and the Deployer refuses an update outside the installed minor even when the manifest allows it.
- Only the chart version and `platform.tag` change. The Deployer carries the running `countryconfig.image.tag` forward explicitly, because a new chart can have another default for it, and `/status` reports "not updatable" for a service that has its own tag.
- `/status` shows a blocked update with the reason, and shows when the live `platform.tag` is not the version that the Deployer applied last.
- A fixed name for the upgrade makes `POST /update` safe to repeat, and a failed upgrade is not retried until a person decides.
- Helm runs with `--reset-then-reuse-values`, `--rollback-on-failure` and `--wait`.
- A `mode` setting with `off` and `manual`, so that a later mode does not change the API.

## Later

Automatic application of security fixes is not part of this decision. It would need `severity` in the manifest, a maintenance window, a backup that has succeeded, and a signing and rollback process that has run in production.
