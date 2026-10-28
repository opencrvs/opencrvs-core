# General information

Helm chart does deployment of OpenCRVS dependencies including monitoring stack. Helm Chart is capable for testing and pilot projects.

> NOTE: See [values.yaml](values.yaml) for exact versions

- Datastores:
  - Postgres
  - Elasticsearch
  - Redis
  - MinIO
  - RustFS (optional, disabled by default)
- Observability (Monitoring and Logging):
  - Kibana
  - Logstash
  - Filebeat
  - Metricbeat
  - Elastic APM server
  - Elastalert2

Datastore services are deployed as StatefulSets with data persistence enabled. By default security is turned off and default password or no-password access is used datastore access. Please check appropriate section for each service for more details.

Monitoring is disabled by default to keep lower resource usage, check [Monitoring](#monitoring) section for more details how to enable monitoring.

Any particular service within this helm chart can be disabled by setting `<service_name>.enabled` flag to `false`. E/g Memorystore on Google Cloud Platform is replacement for Redis, instead running Redis container cloud native solution could be used.

# Services

## Global configuration options

| Parameter                           | Type   | Default                            | Description                                                                                                                                                                                                                                                                          |
| ----------------------------------- | ------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| hostname                            | string | farajaland.dev                     | All chart services will be available under specified domain. Exposed services are MinIO and Kibana, if Monitoring is enabled                                                                                                                                                         |
| ingress.ssl_enabled                 | bool   | false                              | Enable or disable https endpoint, by default all http traffic is routed to https                                                                                                                                                                                                     |
| ingress.tls_resolver                | string | ` `                                | If traefik was deployed with custom resolver, please define resolver name here. Resolver will be attached to Traefik CRD IngressRoute, otherwise default Traefik SSL Certificate will be used.                                                                                       |
| ingress.tls_secret_name             | string | ` `                                | Secret with custom SSL Certificate for IngressRoute, check traefik documentation for details. Otherwise default Traefik SSL Certificate will be used.                                                                                                                                |
| ingress.admin_console_allowlist     | list   | `[]`                               | Source IP ranges (CIDR) allowed to reach the MinIO console and Kibana, enforced via a Traefik `ipAllowList` middleware. Leave empty to leave these admin consoles publicly reachable. Does not restrict the MinIO S3 API route - use `application_allowlist` below to restrict that. |
| ingress.application_allowlist       | list   | `[]`                               | Source IP ranges (CIDR) allowed to reach the MinIO S3 API route, enforced via a Traefik `ipAllowList` middleware. `admin_console_allowlist` is always merged in. Leave empty to leave the MinIO API publicly reachable.                                                              |
| network_policy.enabled              | bool   | `true`                             | Render Kubernetes NetworkPolicy resources for dependency workloads. Requires a CNI provider that enforces NetworkPolicy.                                                                                                                                                             |
| network_policy.ingress_mode         | string | `deny`                             | Baseline policy for ingress to dependency pods: `deny` (default, requires another NetworkPolicy to allow it), `private` (allow only RFC1918 private ranges), or `full` (unrestricted).                                                                                               |
| network_policy.egress_mode          | string | `deny`                             | Baseline policy for egress from dependency pods. Same modes as `ingress_mode`, applied to egress. DNS (53) is always allowed except in `full` mode.                                                                                                                                  |
| network_policy.allow_same_namespace | bool   | `true`                             | Allow dependency pods in the same namespace to communicate with each other.                                                                                                                                                                                                          |
| network_policy.allowed_namespaces   | list   | `[]`                               | Namespaces allowed to reach dependency pods (e.g. the opencrvs-services namespace). When set, dependency pods accept ingress on any port from every pod in each listed namespace, so the OpenCRVS application keeps working once ingress is denied by default.                       |
| timezone                            | string | ` `                                | Time zone for a backup and restore CronJobs, by default local time zone is used from server                                                                                                                                                                                          |
| storage_type                        | string | `pvc`                              | Kubernetes storage type, available options are `pvc` or `host_path`. More information are at [Storage Configuration](#storage-configuration)                                                                                                                                         |
| platform.imagePullSecrets           | list   | `[]`                               | Pod-level image pull secrets applied to all workloads in this chart. Use this when images are stored in private registries.                                                                                                                                                          |
| node_selector                       | dict   | `{}`                               | Label selector for datastore nodes, usually used to keep data persistent                                                                                                                                                                                                             |
| monitoring.enabled                  | bool   | `false`                            | Enable or disable monitoring, see [Monitoring](#monitoring)                                                                                                                                                                                                                          |
| priority_class.enabled              | bool   | `false`                            | Enable or disable priority class for datastores. Enabling this option will avoid unnecessary pod eviction.                                                                                                                                                                           |
| backup.enabled                      | bool   | `true`                             | Enable or disable data backup. Please check [Backup configuration](#backup-configuration) for more options. Usually this option is enabled on Production environment                                                                                                                 |
| restore.enabled                     | bool   | `true`                             | Enable or disable data restore. Please check [Restore configuration](#restore-configuration) for more options. Usually this option is enabled on Staging environment                                                                                                                 |
| service_type                        | string | `ClusterIP`                        | Kubernetes Service type for datastore Services (Postgres, Elasticsearch, Kibana, Redis, MinIO), e.g. `ClusterIP` or `NodePort`. Applies to all of them; there is no per-service override.                                                                                            |
| utilities.image.repository          | string | `ghcr.io/opencrvs/ocrvs-utilities` | Shared utilities image repository used by helper jobs and init containers.                                                                                                                                                                                                           |
| utilities.image.tag                 | string | `v2.1.0`                           | Shared utilities image tag used by helper jobs and init containers.                                                                                                                                                                                                                  |

## Network Policies

The chart can render Kubernetes `NetworkPolicy` resources for dependency workloads. This requires a CNI provider that enforces NetworkPolicy — set `network_policy.enabled: false` on clusters without one.

When enabled, the chart can render:

- a default deny ingress and/or egress policy for dependency pods, per `ingress_mode`/`egress_mode`
- an allow-private-ingress and/or allow-private-egress policy (RFC1918 ranges only), when `ingress_mode`/`egress_mode` is `private`
- a same-namespace allow policy, enabled by default
- an allow-ingress-namespaces policy, when `network_policy.allowed_namespaces` is set and `ingress_mode` is not `full`
- a DNS egress allow policy for TCP/UDP port 53, unless `egress_mode` is `full`
- service-specific rules defined under `<service>.network_policy.rules`
- operator-provided service rules defined under `<service>.network_policy.custom_rules`
- an ingress and/or egress rule for a service, when `<service>.network_policy.ingress_mode`/`egress_mode` is set to `private` or `full`

`network_policy.ingress_mode`/`egress_mode` each take one of three values, both at the global level and per-service under `<service>.network_policy`:

- `deny` (default) — nothing is allowed beyond same-namespace/`allowed_namespaces`/per-service rules.
- `private` — additionally allow traffic to/from RFC1918 private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), blocking the public internet either way.
- `full` — no baseline policy at all; unrestricted.

The same-namespace allow policy is intended as a practical first hardening step: dependency pods can still communicate inside the chart namespace, while unexpected cross-namespace and external traffic is blocked unless explicitly allowed.

`<service>.network_policy.ingress_mode`/`egress_mode` are a shortcut for opting one service into `private` or `full` access without writing out an ingress/egress rule under `rules`/`custom_rules` — independent of the global `network_policy.ingress_mode`/`egress_mode`, which control whether the chart-wide baseline policies are rendered at all. For ingress, `private`/`full` accept traffic from RFC1918 ranges/any source respectively, scoped to the service's own `port` value; it renders nothing if `port` is not set, rather than silently opening every port. For egress, `private`/`full` accept traffic to RFC1918 ranges/any destination on any port, since a service's own port doesn't describe what it calls out to.

The dependencies chart and the opencrvs-services chart are typically deployed to separate namespaces (see the default `*.host` values in `charts/opencrvs-services/values.yaml`, e.g. `redis-0.redis.opencrvs-deps-dev.svc.cluster.local`). While `network_policy.ingress_mode` is `deny` (the default), application pods (auth, gateway, events, etc.) can no longer reach Postgres, Elasticsearch, MinIO or Redis unless the opencrvs-services release namespace is listed in `network_policy.allowed_namespaces`. This rule allows all ports from every pod in each listed namespace, rather than requiring a separate rule per service/port pair.

Example:

```yaml
network_policy:
  allowed_namespaces:
    - opencrvs-production
```

Service-specific rules follow Kubernetes `NetworkPolicy.spec` syntax, except `podSelector` is generated by the chart from the service `app_label`.

Example — open ingress for a service's own port, custom egress via `rules`:

```yaml
minio:
  network_policy:
    rules:
      - name: allow-console-ingress
        policyTypes:
          - Ingress
        ingress:
          - ports:
              - protocol: TCP
                port: 3536 # console; API (3535) is not opened here
      - name: allow-package-repo-egress
        policyTypes:
          - Egress
        egress:
          - to:
              - ipBlock:
                  cidr: 0.0.0.0/0
            ports:
              - protocol: TCP
                port: 80
              - protocol: TCP
                port: 443 # apk mirrors are sometimes HTTP-only, so both are opened
```

Each rule must define `name`; the chart uses it to generate deterministic `NetworkPolicy` resource names. `ingress_mode: full` is a shortcut for the same shape, but only supports a single port (the service's `port` value) — write a `rules` entry instead when a service listens on more than one port, as MinIO does.

For backup and restore jobs, external backup server access must be allowed explicitly. Standard Kubernetes `NetworkPolicy` supports IP blocks, pod selectors, namespace selectors, and ports; it does not support DNS/FQDN destinations.

To handle this, the chart computes an `ipBlock` egress rule (`<host>/32`, TCP port 22) for Postgres and the S3 store (MinIO or RustFS, see [Backup and restore](#backup-and-restore-of-the-s3-store)) directly from the resolved backup/restore host (`backup.host`, `restore.host`, `postgres.backup.host`, `postgres.restore.host`, `minio.backup.host`, `minio.restore.host`, `rustfs.backup.host`, `rustfs.restore.host`), rendered only when the corresponding `backup.enabled`/`restore.enabled` flag is true. **This requires the host value to be a literal IP address** — if you configure a DNS hostname instead, the generated `ipBlock.cidr` will be invalid and the policy will not match traffic to that host.

### Service connections

Applies once `network_policy.enabled: true`. Every dependency pod always accepts traffic from its own namespace (`allow_same_namespace`) and from any namespace listed in `allowed_namespaces`, and may always egress to DNS (53). The table below shows what each service allows **beyond** that baseline, per its current `values.yaml` configuration:

| Service                                                | Port(s)                    | Extra ingress                                             | Extra egress                                                                                               |
| ------------------------------------------------------ | -------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Postgres                                               | 5432                       | any source (`ingress_mode: full`)                         | 80, 443 (package installs); backup/restore host:22 when backup/restore enabled                             |
| Elasticsearch                                          | 9200                       | any source (`ingress_mode: full`)                         | —                                                                                                          |
| Redis                                                  | 6379                       | any source (`ingress_mode: full`)                         | —                                                                                                          |
| MinIO                                                  | 3535 (API), 3536 (console) | 3536 only, any source (`rules`) — API stays baseline-only | 80, 443 (package installs); backup/restore host:22 when backup/restore enabled                             |
| RustFS (when enabled)                                  | 3535 (API), 3536 (console) | 3536 only, any source (`rules`) — API stays baseline-only | backup/restore host:22 when backup/restore enabled                                                         |
| Kibana                                                 | 5601                       | any source (`ingress_mode: full`)                         | —                                                                                                          |
| Filebeat, Metricbeat, Logstash, APM Server, Elastalert | —                          | —                                                         | —                                                                                                          |
| postgres-restore-runner (differential restore)         | —                          | —                                                         | 80, 443 (package installs); restore host:22 when restore enabled                                           |
| backup-runner (differential backup/restore jobs)       | —                          | —                                                         | any port, RFC1918 private ranges only (Kubernetes API server, for `kubectl exec`/`scale`/`delete`/`apply`) |

`ingress_mode: full` opens a service to any source, not just Traefik — narrow it with an explicit `rules` entry (e.g. a `namespaceSelector` for `traefik`), or use `ingress_mode: private` to restrict to RFC1918 ranges, if `full` is too broad for your deployment.

Postgres, MinIO and the differential `postgres-restore-runner` pod also get an unconditional `allow-package-repo-egress` rule (`0.0.0.0/0:80,443`) so that runtime package installation (see [Air-Gap Installation](#air-gap-installation)) keeps working when egress is denied by default — port 80 is included since some apt/apk mirrors are HTTP-only. This rule is intentionally broad: it also permits port 80/443 egress to other pods/namespaces in the cluster, not just the internet. Elasticsearch does not get this rule since it has no backup path and installs no packages at runtime in this chart.

Differential-type backup/restore automation (`postgres-on-deploy`, `postgres-backup-diff`, `postgres-backup-full`, `postgres-restore`, `minio-backup`, `minio-restore`, `rustfs-backup`, `rustfs-restore`) drives the actual backup/restore by issuing `kubectl exec`/`scale`/`delete`/`apply` against the Kubernetes API server — it never talks to the Postgres/MinIO pods over the network directly, since `kubectl exec` is proxied through the API server. These pods are labeled `app: backup-runner` (not `app: postgres`/`app: minio`/`app: rustfs`) and get their own unconditional `backup-runner-allow-egress` rule for that access, rather than relying on incidental coverage from the package-repo rule.

`backup-runner-allow-egress` intentionally allows all ports, not just 443. The `kubernetes` Service in the `default` namespace exposes port 443, but many CNIs enforce egress `NetworkPolicy` against the _post-DNAT_ destination — i.e. the API server's real `targetPort` (commonly 6443 on kubeadm-style clusters), not the Service's port — so a rule scoped to `port: 443` can silently fail to match. Run `kubectl get endpoints kubernetes -n default` to see the actual port on your cluster if you'd rather scope this down.

The destination is scoped to RFC1918 private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) rather than `0.0.0.0/0`, since the only legitimate destination is the API server (a ClusterIP, pod IP, or node IP — always private in a normally-networked cluster) and these pods have no reason to reach the public internet. **If your cluster's nodes have a public IP as their primary interface** (common on bare VPS-style setups without a private VPC network) and the CNI enforces policy against the post-DNAT node IP rather than the ClusterIP, this scoping could exclude the API server — check with `kubectl get nodes -o wide` (INTERNAL-IP vs EXTERNAL-IP) and `kubectl get endpoints kubernetes -n default -o wide` before relying on it, and fall back to `0.0.0.0/0` if needed. These pods are already privileged (their `backup-runner` ServiceAccount can `exec`/`scale`/`delete` arbitrary pods via RBAC), so the extra egress breadth of `0.0.0.0/0` wouldn't add meaningful risk beyond what their RBAC already grants — the private-range scoping here is defense in depth, not a hard requirement.

## Postgres

Postgres configuration section for Helm values.yaml

This section allows you to configure the postgres deployment within your infrastructure.
| Parameter | Type | Default | Description |
|--------------------------|---------|----|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| enabled | bool | true | Enable or disable the Postgres deployment. |
| image.repository | string | `chumaky/postgres_mongo_fdw` | Postgres Docker image repository. |
| image.tag | string | `17.6_fdw5.5.2` | Postgres Docker image tag. |
| use_default_credentials | bool | true | If true, deploys Postgres with default user/password: postgres/postgres |
| storage_type | string | `global storage_type` | Optional Postgres-specific override for the Kubernetes storage type. Available options are `pvc` or `host_path`. If not set, the global `storage_type` value is used. |
| pvc.storage_class | string | `n/a` | StorageClass name used for dynamic volume provisioning |
| pvc.storage_size | string | 10Gi | Persistent volume claim size for Postgres data volume |
| pvc.access_mode | string | ReadWriteOnce | Kubernetes PVC access mode |
| host_data_path | string | `/data/postgres` | Path to persistent data on the host when `storage_type` is `host_path`. |
| node_selector | dict | `{}` | Label selector for datastore nodes, usually used to keep data persistent |
| backup.{} | dict | `{}` | Backup configuration section, for more information please check `values.yaml` and **Backup section** in this README |
| backup.enabled | string | `false` | Backup enabled or disabled, section has higher priority over global `backup` section |
| backup.type | string | `dump` | `dump` is a full logical database dump, `differential` is a physical backup using pgBackRest |
| backup.stanza | string | `main` | Stanza name for pgBackRest, use when backup type is `differential` |
| backup.server_secret | string | `backup-server-ssh-credentials` | Name of the Kubernetes secret with backup server credentials |
| backup.encryption_secret | string | `backup-encryption-secret` | Name of the Kubernetes secret containing the backup encryption key |
| backup.schedule | dict | `{}` | Backup cronjob schedule |
| backup.schedule.dump | string | `0 1 * * *` | Used only when type=dump, if not defined then value from `backup.schedule` is used |
| backup.schedule.full | string | `0 1 * * 0` | Full backup schedule. Used when type=differential, note that value from `backup.schedule` is ignored |
| `backup.schedule.differential` | string | `0 1 * * 1-6` | Differential backup schedule. Used when type=differential, note that value from `backup.schedule` is ignored |
| backup.server_dir | string | `n/a` | Directory to store encrypted backup on backup server, if not defined `backup.backup_server_dir` is used |
| backup.cronjob | boolean | `true` | Run backup as cronjob, setting to `false` allows to run one time job, e/g manual backup |
| restore.{} | dict | `{}` | Restore configuration section, for more information please check `values.yaml` and **Restore section** in this README |
| restore.enabled | string | `false` | Restore enabled or disabled, section has higher priority over global `restore` section |
| restore.server_secret | string | `backup-server-ssh-credentials` | Name of the Kubernetes secret with backup server credentials, usually backup server is used for restore, thats why credentials are shared |
| restore.encryption_secret | string | `restore-encryption-secret` | Name of the Kubernetes secret containing the backup encryption key |
| restore.schedule | string | `0 3 * * *` | Restore cronjob schedule, if not defined then value from `restore.schedule` is used |
| restore.cronjob | boolean | `true` | Run restore as cronjob, setting to `false` allows to run one time job, e/g manual restore, or disaster recovery scenario |
| node_port | int | `n/a` | Fixed NodePort to expose port `5432` on. Only used when the global `service_type` is `NodePort`, otherwise a random port is assigned |
| shm_size | string | `256Mi` | Size of `/dev/shm`, mounted as a memory-backed `emptyDir`. Postgres uses it for parallel query workers; the container runtime's default (typically 64Mi) is easily exhausted, causing "could not resize shared memory segment" errors unrelated to disk space. |

## Elasticsearch

This section allows you to configure the deployment and authentication settings for Elasticsearch.

| Key                     | Type    | Example                                         | Description                                                                                                                                                                |
| ----------------------- | ------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| image.repository        | string  | `docker.elastic.co/elasticsearch/elasticsearch` | Elasticsearch Docker image repository.                                                                                                                                     |
| image.tag               | string  | `8.19.15`                                       | Elasticsearch Docker image tag.                                                                                                                                            |
| enabled                 | boolean | true                                            | Enable or disable the Elasticsearch deployment.                                                                                                                            |
| use_default_credentials | boolean | true                                            | Deploy Elasticsearch without enabled authentication.                                                                                                                       |
| storage_type            | string  | `global storage_type`                           | Optional Elasticsearch-specific override for the Kubernetes storage type. Available options are `pvc` or `host_path`. If not set, the global `storage_type` value is used. |
| pvc.storage_class       | string  | `n/a`                                           | StorageClass name used for dynamic volume provisioning                                                                                                                     |
| pvc.storage_size        | string  | 10Gi                                            | Persistent volume claim size for Postgres data volume                                                                                                                      |
| pvc.access_mode         | string  | ReadWriteOnce                                   | Kubernetes PVC access mode                                                                                                                                                 |
| host_data_path          | string  | `/data/elasticsearch`                           | Path to persistent data on the host when `storage_type` is `host_path`.                                                                                                    |
| node_selector           | dict    | `{}`                                            | Label selector for datastore nodes, usually used to keep data persistent                                                                                                   |
| node_port               | int     | `n/a`                                           | Fixed NodePort to expose port `9200` on. Only used when the global `service_type` is `NodePort`, otherwise a random port is assigned                                       |
| node_port_transport     | int     | `n/a`                                           | Fixed NodePort to expose port `9300` on. Only used when the global `service_type` is `NodePort`, otherwise a random port is assigned                                       |

## MinIO

### Configuration options

| Key                     | Type   | Default value                   | Description                                                                                                                                                        |
| ----------------------- | ------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| enabled                 | bool   | true                            | Enable or disable minio service                                                                                                                                    |
| image.repository        | string | `ghcr.io/opencrvs/minio`        | MinIO Docker image repository.                                                                                                                                     |
| image.tag               | string | `release.2025-06-13t11-33-47z`  | MinIO Docker image tag.                                                                                                                                            |
| use_default_credentials | bool   | true                            | Use `minioadmin` / `minioadmin`, unless `admin_username` and `admin_password` are set. If `false` and they are not set, random ones are generated.                 |
| admin_username          | string | `n/a`                           | MinIO administrator username. Used even if `use_default_credentials` is `true`. Set together with `admin_password`.                                                |
| admin_password          | string | `n/a`                           | MinIO administrator password. Used even if `use_default_credentials` is `true`. Set together with `admin_username`.                                                |
| storage_type            | string | `global storage_type`           | Optional MinIO-specific override for the Kubernetes storage type. Available options are `pvc` or `host_path`. If not set, the global `storage_type` value is used. |
| pvc.storage_class       | string | `n/a`                           | StorageClass name used for dynamic volume provisioning                                                                                                             |
| pvc.storage_size        | string | 10Gi                            | Persistent volume claim size for Postgres data volume                                                                                                              |
| pvc.access_mode         | string | ReadWriteOnce                   | Kubernetes PVC access mode                                                                                                                                         |
| host_data_path          | string | `/data/minio`                   | Path to persistent data on the host when `storage_type` is `host_path`.                                                                                            |
| node_selector           | dict   | `{}`                            | Label selector for datastore nodes, usually used to keep data persistent                                                                                           |
| backup.{}               | dict   | `{}`                            | Backup configuration section, for more information please check `values.yaml` and **Backup section** in this README                                                |
| backup.enabled          | string | `false`                         | Backup enabled or disabled, section has higher priority over global `backup` section                                                                               |
| backup.type             | string | `dump`                          | `dump` is a full filesystem dump, `differential` is rsync from MinIO filesystem on remote backup server                                                            |
| backup.server_secret    | string | `backup-server-ssh-credentials` | Name of the Kubernetes secret with backup server credentials                                                                                                       |
| backup.schedule         | string | `0 1 * * *`                     | Time to run backup job, if not defined then value from `backup.schedule` is used                                                                                   |
| backup.server_dir       | string | `n/a`                           | Directory on backup server for encrypted archive backups or filesystem rsync. Uses global value if not set                                                         |
| restore.{}              | dict   | `{}`                            | Restore configuration section, for more information please check `values.yaml` and **Restore section** in this README                                              |
| restore.enabled         | string | `false`                         | Enables restore functionality; section overrides global `restore` settings.                                                                                        |
| restore.type            | string | `dump`                          | Restore method: `dump` (from encrypted archive) or `differential` (same as for backup)                                                                             |
| restore.server_secret   | string | `backup-server-ssh-credentials` | Name of the Kubernetes secret with backup server credentials, usually backup server is used for restore, thats why credentials are shared                          |
| restore.schedule        | string | `0 3 * * *`                     | Restore cronjob schedule, if not defined then value from `restore.schedule` is used                                                                                |
| node_port               | int    | `n/a`                           | Fixed NodePort to expose port `3535` on. Only used when the global `service_type` is `NodePort`, otherwise a random port is assigned                               |
| node_port_console       | int    | `n/a`                           | Fixed NodePort to expose port `3536` (console) on. Only used when the global `service_type` is `NodePort`, otherwise a random port is assigned                     |

### MinIO Credentials

The chart writes the credentials to the secret `s3-opencrvs-users` when the secret does not exist. It reads the values of the store that is deployed: `rustfs.*` when RustFS is enabled and MinIO is not (see [RustFS Credentials](#rustfs-credentials)), `minio.*` otherwise, also when both are enabled. The first rule that fits applies:

1. The secret exists: the chart leaves it as it is, and the values below are not read.
2. The secret `minio-opencrvs-users` of an earlier version exists: the chart creates `s3-opencrvs-users` from it, with the new key names and the same values, and leaves the old secret in place.
3. `admin_username` and `admin_password` are set: the chart uses them, whatever `use_default_credentials` is.
4. `use_default_credentials` is `true`: the chart uses `minioadmin` and `minioadmin`.
5. Otherwise the chart generates a random username and a random password.

Setting only one of `admin_username` and `admin_password` fails the installation with `minio.admin_username and minio.admin_password must be set together`. MinIO and the backup and restore jobs always read the credentials from the secret, so read the generated ones from it.

MinIO defaults to minioadmin and minioadmin as the access key and secret key respectively.
MinIO strongly discourages use of the default credentials regardless of deployment environment.
Check official documentation for more details:
https://min.io/docs/minio/linux/administration/identity-access-management/minio-user-management.html

Values are stored as a Kubernetes secret `s3-opencrvs-users` in dependencies namespace. Copy secret object as is into OpenCRVS application namespace to make it accessible by services:

```
DEPENDENCIES_NAMESPACE=<dependencies namespace>
OPENCRVS_NAMESPACE=<OpenCRVS namespace>
kubectl get secret s3-opencrvs-users -n $DEPENDENCIES_NAMESPACE -o yaml \
  | sed "s#namespace: $DEPENDENCIES_NAMESPACE#namespace: $OPENCRVS_NAMESPACE#" \
  | kubectl apply -n $OPENCRVS_NAMESPACE -f -
```

Don't forget to replace placeholders with appropriate namespaces.

Example of Kubernetes secret:

```
$ kubectl get secret -oyaml -n opencrvs-dev s3-opencrvs-users | yq .data
S3_ACCESS_KEY: RE...wMw==
S3_ADMIN_SECRET_KEY: dG...FU=
S3_ADMIN_ACCESS_KEY: RE...wMw==
S3_SECRET_KEY: dG...FU=
```

Reference secret values within `values.yaml`:

```yaml
documents:
  secrets:
    minio-secret:
      - S3_ACCESS_KEY
      - S3_SECRET_KEY
```

### Backup and Restore Section Reference

For detailed configuration, review the values.yaml file and refer to the Backup and Restore sections of this README.
Adjust schedules, server credentials, and directories as needed for your deployment.

## RustFS

RustFS is an open-source S3 object store that the chart can deploy as an alternative to MinIO. It is disabled by default. The documents service only speaks S3, and [packages/documents/README.md](../../packages/documents/README.md) lists the version of RustFS that it was tried on, and what to check when you change the store.

Enabling RustFS does not replace MinIO. RustFS runs beside it, as a StatefulSet with a Service and a volume of its own, and serves the S3 API on port 3535 and the console on port 3536, as MinIO does. Set `minio.enabled: false` when nothing uses MinIO any more.

RustFS is backed up and restored by the same jobs as MinIO, see [Backup and restore of the S3 store](#backup-and-restore-of-the-s3-store).

### Migrate from MinIO in place

To replace MinIO with RustFS on the data of MinIO, set `minio.enabled: false` and `rustfs.enabled: true`, and point RustFS at the volume of MinIO: `rustfs.host_data_path: /data/minio` (the value of `minio.host_data_path`) with `storage_type: host_path`, or `rustfs.pvc.name: minio` and `rustfs.pvc.use_existing_claim: true` with `storage_type: pvc`. All other settings are those of `rustfs`. RustFS takes over the buckets and the objects in the volume, and `.minio.sys` stays beside its own `.rustfs.sys`. Keep these values in later releases, otherwise RustFS stops using that volume. The chart refuses to render when MinIO and RustFS are both enabled on the same path or PVC.

- **Back up the data first.** After RustFS has written to the volume, going back to MinIO is not clean: MinIO does not see the user metadata (such as `created-by`) of the objects that RustFS wrote. A copy of the volume taken before the migration is the way back.
- **Keep the PVC of MinIO (`storage_type: pvc`).** When MinIO is disabled, `helm upgrade` removes the `minio` PVC that it created, and the volume behind it goes too if its reclaim policy is `Delete`. The chart marks the PVC with `helm.sh/resource-policy: keep`, but only an upgrade made while MinIO is still enabled applies that. Before disabling MinIO with an earlier version of the chart, run `kubectl annotate pvc minio helm.sh/resource-policy=keep` and `kubectl patch pv <volume of the PVC> -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'`.
- **MinIO must be stopped before RustFS starts.** `helm upgrade` creates the RustFS StatefulSet before it deletes the one of MinIO. Scale MinIO down first (`kubectl scale statefulset minio --replicas=0`), or deploy in two steps, so that the two never run on the same data.
- **Keep the credentials.** RustFS reads the IAM data of MinIO with the root credentials, so `s3-opencrvs-users` must not change.
- With `storage_type: pvc` the PVC `minio` is rendered by the RustFS template, with `helm.sh/resource-policy: keep`, so that Helm never deletes the data.
- Point the services chart at RustFS afterwards, see [Use RustFS from the OpenCRVS services](#use-rustfs-from-the-opencrvs-services).

### Configuration options

| Key                     | Type   | Default value                   | Description                                                                                                                                                                                                                                            |
| ----------------------- | ------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| enabled                 | bool   | false                           | Enable or disable the rustfs service                                                                                                                                                                                                                   |
| image.repository        | string | `rustfs/rustfs`                 | RustFS Docker image repository.                                                                                                                                                                                                                        |
| image.tag               | string | `1.0.1`                         | RustFS Docker image tag.                                                                                                                                                                                                                               |
| use_default_credentials | bool   | true                            | Use `rustfsadmin` / `rustfsadmin`, unless `admin_username` and `admin_password` are set. If `false` and they are not set, random ones are generated. Read only when RustFS is enabled and MinIO is not, see [RustFS Credentials](#rustfs-credentials). |
| admin_username          | string | `n/a`                           | RustFS administrator username. Used even if `use_default_credentials` is `true`. Set together with `admin_password`.                                                                                                                                   |
| admin_password          | string | `n/a`                           | RustFS administrator password. Used even if `use_default_credentials` is `true`. Set together with `admin_username`.                                                                                                                                   |
| port                    | int    | `3535`                          | Port of the S3 API. The console always listens on `3536`.                                                                                                                                                                                              |
| console.enabled         | bool   | true                            | Serve the admin console on port `3536` and on `rustfs-console.<hostname>`. Users log in with `S3_ADMIN_ACCESS_KEY` and `S3_ADMIN_SECRET_KEY`.                                                                                                          |
| storage_type            | string | `global storage_type`           | Optional RustFS-specific override for the Kubernetes storage type. Available options are `pvc` or `host_path`.                                                                                                                                         |
| pvc.storage_class       | string | `n/a`                           | StorageClass name used for dynamic volume provisioning                                                                                                                                                                                                 |
| pvc.storage_size        | string | 10Gi                            | Persistent volume claim size for the RustFS data volume                                                                                                                                                                                                |
| pvc.access_mode         | string | ReadWriteOnce                   | Kubernetes PVC access mode                                                                                                                                                                                                                             |
| pvc.name                | string | `rustfs`                        | Name of the PVC of the RustFS data volume.                                                                                                                                                                                                             |
| pvc.use_existing_claim  | bool   | `false`                         | `false`: the chart creates the PVC `pvc.name`. `true`: the PVC `pvc.name` already exists, for example `minio`, and the chart does not create it. See [Migrate from MinIO in place](#migrate-from-minio-in-place).                                      |
| host_data_path          | string | `/data/rustfs`                  | Path to persistent data on the host when `storage_type` is `host_path`.                                                                                                                                                                                |
| node_selector           | dict   | `{}`                            | Label selector for datastore nodes, usually used to keep data persistent                                                                                                                                                                               |
| backup.enabled          | bool   | `false`                         | Enable backup of RustFS. The global `backup.enabled` also enables it. The same settings as `minio.backup.*`, see [Backup and restore of the S3 store](#backup-and-restore-of-the-s3-store).                                                            |
| backup.type             | string | `dump`                          | `dump` is a dump of the buckets through the S3 API, `differential` is rsync of the data directory to the backup server.                                                                                                                                |
| backup.server_secret    | string | `backup-server-ssh-credentials` | Name of the Kubernetes secret with backup server credentials.                                                                                                                                                                                          |
| backup.host             | string | `n/a`                           | Backup server hostname or IP. Uses the global `backup.host` if not set.                                                                                                                                                                                |
| backup.schedule         | string | `0 1 * * *`                     | Time to run backup job, if not defined then value from `backup.schedule` is used.                                                                                                                                                                      |
| backup.server_dir       | string | `n/a`                           | Directory on the backup server. Uses the global value if not set.                                                                                                                                                                                      |
| restore.enabled         | bool   | `false`                         | Enable restore of RustFS. The global `restore.enabled` also enables it.                                                                                                                                                                                |
| restore.type            | string | `dump`                          | `dump` (from the encrypted archive) or `differential`, the same as for backup.                                                                                                                                                                         |
| restore.server_secret   | string | `backup-server-ssh-credentials` | Name of the Kubernetes secret with backup server credentials.                                                                                                                                                                                          |
| restore.host            | string | `n/a`                           | Backup server hostname or IP. Uses the global `restore.host` if not set.                                                                                                                                                                               |
| restore.schedule        | string | `0 3 * * *`                     | Restore cronjob schedule, if not defined then value from `restore.schedule` is used.                                                                                                                                                                   |
| env                     | dict   | `{}`                            | Extra environment variables for the RustFS container, see the [RustFS configuration](https://docs.rustfs.com) for the `RUSTFS_*` variables.                                                                                                            |
| node_port               | int    | `n/a`                           | Fixed NodePort to expose port `3535` on. Only used when the global `service_type` is `NodePort`, otherwise a random port is assigned                                                                                                                   |
| node_port_console       | int    | `n/a`                           | Fixed NodePort to expose port `3536` (console) on. Only used when the global `service_type` is `NodePort`, otherwise a random port is assigned                                                                                                         |

### RustFS hostnames

The S3 API is served on `rustfs.<hostname>` and the console on `rustfs-console.<hostname>`, so that RustFS can run beside MinIO. `ingress.application_allowlist` and `ingress.admin_console_allowlist` apply to them as they do to the MinIO routes.

The subdomain of a hostname must not be the name of another environment that shares the domain. Document URLs are signed for the S3 hostname, and a feature environment that is named `rustfs` would serve its own client on `rustfs.<hostname>`.

### RustFS Credentials

RustFS reads its credentials from the `s3-opencrvs-users` secret, as MinIO does, and the chart creates it by the rules of [MinIO Credentials](#minio-credentials), whether or not MinIO is enabled. The values that the rules read depend on the stores that are enabled:

- RustFS is enabled and MinIO is not: `rustfs.use_default_credentials`, `rustfs.admin_username` and `rustfs.admin_password`. With the default values the access key and the secret key are `rustfsadmin`, which is highly discouraged for production environments. Setting only one of the two fails the installation with `rustfs.admin_username and rustfs.admin_password must be set together`.
- MinIO is enabled, with or without RustFS: the `minio` values, so that both stores accept the same keys.

An existing secret is never changed. An environment that moves from MinIO to RustFS keeps its credentials.

RustFS has a single root identity, built from `S3_ADMIN_ACCESS_KEY` and `S3_ADMIN_SECRET_KEY` of the secret. The documents service signs with `S3_ACCESS_KEY` and `S3_SECRET_KEY`, so they must hold the same values. The generated secret does.

### Use RustFS from the OpenCRVS services

Point the services chart at the Service and at the public hostname of RustFS. The credentials and the port stay as they are:

```yaml
s3:
  host: rustfs-0.rustfs.<dependencies namespace>.svc.cluster.local
  public_endpoint: https://rustfs.<hostname>
```

### Volume permissions

RustFS runs as the user `rustfs`, `10001:10001`, not as root. With `storage_type: pvc` the kubelet hands the volume to that group (`fsGroup`). With `storage_type: host_path` the kubelet does not, so an init container, `fix-permissions`, changes the owner of the directory to `10001:10001`. It first checks the owner of the top directory with one `stat`, and does nothing when that is already `10001`. It hands the top directory over last, so a run that stopped half way is done again at the next start. The data of MinIO belongs to root, so a migration walks through it once. The directory must be on a file system that allows it.

## Redis

OpenCRVS is using Bitnami package for Redis https://hub.docker.com/r/bitnami/redis due to better security and performance optimization. Please check there full list of available options

| Key       | Default value | Description                                                                                                                          |
| --------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| enabled   | true          | Enable or disable redis service                                                                                                      |
| env       | {}            | Flat dictionary (key/value) of environment variables passed to docker container                                                      |
| auth_mode | disabled      | Authentication mode, possible values `disabled`, `acl` or `password`                                                                 |
| node_port | `n/a`         | Fixed NodePort to expose port `6379` on. Only used when the global `service_type` is `NodePort`, otherwise a random port is assigned |

### Redis authentication

Redis service provides following ways for authentication (`credentials.enabled`):

- `disabled`: Option is preferred for local development. Authentication is disabled. Behind the scenes environment variable `ALLOW_EMPTY_PASSWORD` is set to `yes` inside Redis container, check official documentation for more details.
- `password`: Authentication is performed under one shared account `default`, Environment variable `REDIS_PASSWORD=<random password>` is set inside container and stored as secret `redis-opencrvs-users`.
- `acl`: Option is preferred for production setup. Each OpenCRVS service has it's own username and password. See next section for more details.

### Redis authorization (ACL)

Behind the scenes helm chart generates random username and password for each OpenCRVS service:

- auth
- gateway

Values are stored as a Kubernetes secret `redis-opencrvs-users` in dependencies namespace. Copy secret object as is into OpenCRVS application namespace to make it available:

```
DEPENDENCIES_NAMESPACE=<dependencies namespace>
OPENCRVS_NAMESPACE=<OpenCRVS namespace>
kubectl get secret redis-opencrvs-users -n $DEPENDENCIES_NAMESPACE -o yaml \
  | sed "s#namespace: $DEPENDENCIES_NAMESPACE#namespace: $OPENCRVS_NAMESPACE#" \
  | kubectl apply -n $OPENCRVS_NAMESPACE -f -
```

Don't forget to replace placeholders with appropriate namespaces.

Example of Kubernetes secret:

```
$ kubectl get secret -oyaml -n opencrvs-dev redis-opencrvs-users | yq .data
AUTH_REDIS_PASSWORD: cENqNVZ...52T2xqY01ubG4=
AUTH_REDIS_USERNAME: T09MWV...0azgweg==
DEFAULT_REDIS_PASSWORD: TmpkbE...BM3UzeHE=
GATEWAY_REDIS_PASSWORD: UU94M...ZmlGdHc=
GATEWAY_REDIS_USERNAME: UTJOW...BwcGFSeA==
```

Reference secret values within `values.yaml`:

```yaml
# auth example:
auth:
  secrets:
    redis-opencrvs-users:
      - AUTH_REDIS_PASSWORD:REDIS_PASSWORD
      - AUTH_REDIS_USERNAME:REDIS_USERNAME
```

If you need any specific configuration for ACL (read-only, command limit, etc) please update [templates/redis-secrets.yaml](templates/redis-secrets.yaml).

More details about ACL support can be found at https://redis.io/docs/latest/operate/oss_and_stack/management/security/acl/

## Air-Gap Installation

Some backup and restore jobs install required utilities at runtime with `apk` or `apt-get` when they are missing from the base image. In air-gap environments this installation step will fail because package repositories are not reachable.

To support installation without internet connectivity, build custom images from the default datastore images and preinstall the required packages.

### Postgres image

Start from the default Postgres image and add:

- `openssh-client`
- `rsync`
- `pgbackrest`

### MinIO image

Start from the default MinIO image and add:

- `bash`
- `curl`
- `openssl`
- `openssh`
- `jq`
- `rsync`
- `minio-client`
- `coreutils`

After publishing the custom images, point the chart to them through:

- `postgres.image.repository`
- `postgres.image.tag`
- `minio.image.repository`
- `minio.image.tag`

## Backup and restore of the S3 store

MinIO and RustFS are backed up and restored by the same jobs, with the same scripts (`files/s3`). The jobs work on one store at a time, and RustFS is preferred: RustFS when `rustfs.enabled` is `true`, also when `minio.enabled` is `true` too, MinIO otherwise. While both run, MinIO is not backed up or restored, and its `minio.backup` and `minio.restore` are not read. The names follow the store: `minio-backup` and `minio-restore`, or `rustfs-backup` and `rustfs-restore`. The settings are those of the store, `minio.backup`, `minio.restore` or `rustfs.backup`, `rustfs.restore`, and the global `backup` and `restore`.

- **`dump`** reads the buckets through the S3 API with `mcli`, packs them into one archive, encrypts it and copies it to the backup server. The restore empties the buckets and writes the archive back. It works with any S3 store.
- **`differential`** runs rsync in the `rsync` sidecar of the store pod and copies the data directory to the backup server, `<server_dir>/minio`. It leaves out the IAM configuration of the store (`.minio.sys/config/iam/` and `.rustfs.sys/config/iam/`). The restore copies the files back into the running store. For RustFS it hands them to `10001:10001`, the user that RustFS runs as, because the backup server does not keep the owner of a file and RustFS does not start on files that it does not own. The sidecar runs as root and copies the SSH key before it uses it, because the kubelet makes a secret readable for the group of the pod (`fsGroup`) and ssh refuses such a key.

The backup server does not know which store a backup comes from: the archive is `<server_dir>/<date>/minio_backup_<date>.tar.gz.enc` and the data directory is `<server_dir>/minio`, whatever the store. A `dump` of one store therefore restores into the other, and the backups of an earlier version are found. A `differential` backup of MinIO restores into RustFS the way an in-place migration adopts the data of MinIO. The way back, from RustFS to MinIO, loses the user metadata of the objects that RustFS wrote, see [Migrate from MinIO in place](#migrate-from-minio-in-place).

## Storage Configuration

This chart supports flexible data persistence for **Elasticsearch, Postgres, MinIO and RustFS**.  
You control persistence using the `storage_type` option, which can be set **globally** (`storage_type`) or per datastore (e.g. `elasticsearch.storage_type`).

- **`storage_type`**, available options:
  - **`pvc`** – Use the default Kubernetes StorageClass to create a PersistentVolumeClaim.
  - **`host_path`** – Use a directory on the Kubernetes node for persistence. The directory must be created with the appropriate permissions. This option is the default for legacy VMs running Docker Swarm that have been migrated to Kubernetes.
- **`pvc`**:
  - `storage_class`: StorageClass name used for dynamic volume provisioning
  - `storage_size`: Persistent volume claim size for Postgres data volume
  - `access_mode`: Kubernetes PVC access mode
- **`host_data_path`** – Optionally specify data path per datastore/service. For example, Elasticsearch use the `host_data_path` property to specify where data should be stored. If the directory does not exist, it will be created during deployment.
- **`node_selector`** – Use a node selector to control where the pod is scheduled. This option can be defined globally or per service.

---

### Configuration Examples

#### Use PVC (cloud deployments, managed clusters, etc):

```yaml
elasticsearch:
  storage_type: pvc # Not required; pvc is default
  pvc:
    storage_size: 5Gi
    storage_class: 'azurefile-premium' # Optional: specify a StorageClass or leave as "" for default
```

#### Use hostPath for MinIO data (legacy volumes, on-prem, etc):

```yaml
minio:
  storage_type: host_path # Store data on filesystem (default)
  node_selector:
    role: data2 # Store data on worker node instead of master, default is 'data1'
  host_data_path: /data/minio # default value
```

---

### FAQ

**Q:** What happens if I set both the global and Elasticsearch-level `storage_type`?  
**A:** The value for `elasticsearch.storage_type` takes precedence for Elasticsearch.

**Q:** What if I use `host_path` on a multi-node cluster?  
**A:** Only the node(s) with the specified host directories will be able to run the datastore pod. Use `node_selector` to control exactly which node the service is scheduled on.

## Monitoring

Helm chart has built-in Observability components configured to work with OpenCRVS and collect key metrics.

Following tools are included in monitoring suite:

- Kibana
- Elastalert2
- Filebeat
- Metricbeat
- Logstash
- APM server

> NOTE: Before enabling monitoring tools make sure Elasticsearch default credentials are disabled:

```yaml
elasticsearch:
  use_default_credentials: false
```

### Elastalert

**Notifications**

ElastAlert supports two notification delivery methods configured through [values.yaml](./values.yaml):

- `email`: Sends alerts directly to an SMTP server.
- `post2`: Sends alerts via HTTP POST to an countryconfig service. This mode is provided for backward compatibility with Docker Swarm deployments where alerts are routed through CountryConfig.

Configuration example:

```yaml
elastalert:
  env:
    NOTIFICATION_TYPE: post2
```

When using `post2`, configure the target endpoint, see example:

```yaml
elastalert:
  env:
    HTTP_POST2_ALERT_URL: http://countryconfig.opencrvs-qa.svc.cluster.local:3040/email
```

**Configuration options `email`**

When `NOTIFICATION_TYPE` is set to `email`, ElastAlert requires an SMTP credentials secret. Configure the secret in `values.yaml` and provide the following keys:

| Secret Key             | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `ALERT_EMAIL`          | Recipient email address for alerts.                 |
| `SENDER_EMAIL_ADDRESS` | Email address used as the sender.                   |
| `SMTP_HOST`            | SMTP server hostname.                               |
| `SMTP_PORT`            | SMTP server port (for example `587`).               |
| `SMTP_USERNAME`        | SMTP authentication username.                       |
| `SMTP_PASSWORD`        | SMTP authentication password.                       |
| `SMTP_SECURE`          | Enables secure SMTP connection (`true` or `false`). |

Refer to the `values.yaml` file for the complete configuration example.

**Custom rules**

Elastalert rules can be extended by modifying or defining new rules. Rules can be stored as Kubernetes configmap within the same namespace as elastalert deployment.

1. Create new folder and place rules there, e/g:
   ```
   ~$ ls -1 custom-rules/
   alert.yaml
   log-alert-foo.yaml
   log-error-bar.yaml
   custom-service-error-foo.yaml
   custom-service-error-bar.yaml
   ssh-alert.yaml
   ```
2. Run following command to create configmap from rules:
   ```
   kubectl create configmap elastalert-custom-rules \
       --from-file=custom-rules/
   ```
   `custom-rules/` is a path to the folder with rules
3. Add `elastalert.custom_rules_configmap` to values.yaml to point elastalert to new configmap:
   ```yaml
   elastalert:
     custom_rules_configmap: elastalert-custom-rules
   ```
4. Re-deploy dependencies helm chart

### Kibana

| Key       | Type | Default | Description                                                                                                                          |
| --------- | ---- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| node_port | int  | `n/a`   | Fixed NodePort to expose port `5601` on. Only used when the global `service_type` is `NodePort`, otherwise a random port is assigned |

Kibana has support for custom configuration shipped by default as config.ndjson file in helm chart: [charts/dependencies/files/kibana/config.ndjson](https://github.com/opencrvs/infrastructure/blob/develop/charts/dependencies/files/kibana/config.ndjson)

If you need to customize that file please do following steps:

1. Create configmap from `config.ndjson`
   ```bash
   kubectl create cm kibana-custom-config --from-file config.ndjson
   ```
2. Add `kibana.custom_config_configmap` to values.yaml to point kibana to new configmap:
   ```yaml
   kibana:
     custom_config_configmap: kibana-custom-config
   ```
3. Re-deploy dependencies helm chart

### Filebeat and metricbeat configuration

Following keys can be defined for filebeat and metricbeat

- `custom_config_configmap`: Configmap name for custom configuration file
- `custom_ilm_configmap`: Configmap name for custom index lifecycle management policies (ILM)
- `monitoring.logs.retention_days`: Number of days to retain logs indexed by filebeat
- `monitoring.metrics.retention_days`: Number of days to retain metrics indexed by metricbeat

By providing custom configuration file you will be able to adjust ILM policies, logs and metrics to monitor and other settings critical for your environment.

Configuration example for filebeat:

```yaml
monitoring:
  logs:
    retention_days: 30
  metrics:
    retention_days: 30
filebeat:
  custom_config_configmap: filebeat-custom-config
  custom_ilm_configmap: filebeat-ilm-custom-policy
metricbeat:
  custom_config_configmap: filebeat-custom-config
  custom_ilm_configmap: filebeat-ilm-custom-policy
```

**Please do following steps to create custom configuration for filebeat and metricbeat**:

1. Create configmap from custom configuration file
   ```bash
   kubectl create configmap filebeat-custom-config --from-file <beat name>.yml
   ```
   Configuration file names `filebeat.yml` and `metricbeat.yml` are hardcoded within helm chart. Please keep original file names while creating custom configmaps, for example:
   ```
   kubectl create configmap filebeat-custom-config --from-file filebeat.yml
   kubectl create configmap metricbeat-custom-config --from-file metricbeat.yml
   ```
2. Add `<beat name>.custom_config_configmap` to values.yaml to point beat to new configuration file:
   ```yaml
   <beat name>:
     custom_config_configmap: <beat name>-config
   ```
3. Re-deploy dependencies helm chart

**Use same steps to configure ILM policies, example on how to create configmap with ILM policies:**

```
kubectl create cm <beat name>-ilm-custom-policy --from-file <beat name>-rollover-policy.json
```

Configuration file names `filebeat-rollover-policy.json` and `metricbeat-rollover-policy.json` are hardcoded within helm chart. Please keep original file names while creating custom configmaps, for example:

```
kubectl create configmap filebeat-ilm-custom-policy --from-file filebeat-rollover-policy.json
kubectl create configmap metricbeat-ilm-custom-policy --from-file metricbeat-rollover-policy.json
```

**Dashboard configuration**

By default filebeat and metricbeat are loading Kibana dashboards, use custom configuration files to limit number of dashboards. Check official documentation:

- [Filebeat Configure Kibana dashboard loading](https://www.elastic.co/docs/reference/beats/filebeat/configuration-dashboards)
- [Metricbeat Configure Kibana dashboard loading](https://www.elastic.co/docs/reference/beats/metricbeat/configuration-dashboards)

**NOTE:** Loading custom Dashboards as part of helm chart is not supported, please create issue at https://github.com/orgs/opencrvs/projects/4/views/17 if this feature is really needed for you.

## Backup Configuration

The dependencies chart includes a built-in backup feature that supports automated backups for internal components. Backups are stored on an external server via an SSH connection.

Supported datastores:

- Elasticsearch
- PostgreSQL
- MinIO

Each datastore has its own backup job, configured as a Kubernetes `CronJob`.
Backup settings are defined in the `backup` section of the chart values.
You can configure a separate backup schedule and remote directory for each datastore.

---

### 1. Preparing Secrets

Before enabling backups, you must create the Kubernetes secrets that store connection details and encryption keys.

#### a. Backup Server Credentials (`backup-server-ssh-credentials`)

> NOTE: If you are using GitHub workflow from OpenCRVS, secret will be created automatically in `opencrvs-deps-<your infra environment>` namespace. E/g If provision workflow ran for `dev` environment you will find namespace `opencrvs-deps-dev` on your newly created cluster. This namespace will contain secret `backup-server-ssh-credentials`

This secret contains the SSH credentials used to connect to the backup server. It must be created before enabling backups.

Required fields:

- **`ssh_key`** – SSH private key used for authentication. The corresponding public key must be installed on the backup server.
- **`user`** – SSH username. This user must have read/write access to the backup directory.

  > ⚠️ Do not grant `sudo` or administrative access.

- **`host`** – Backup server IP address or hostname.

Create the secret:

```bash
kubectl create secret generic backup-server-ssh-credentials \
  --from-literal=user=<your-ssh-username> \
  --from-literal=host=<your.ssh.host> \
  --from-file=ssh_key=<backup_id_rsa key file>
```

---

#### b. Backup Encryption Key (`backup-encryption-secret`)

This secret stores the encryption key used to protect backup files.

Create the secret:

```bash
kubectl create secret generic backup-encryption-secret \
  --from-literal=backup_encryption_key=<your-encryption-key>
```

---

### 2. Backup Configuration Reference

The following parameters are available in the `backup` section of the chart values:

| Parameter                  | Type   | Default                         | Description                                                         |
| -------------------------- | ------ | ------------------------------- | ------------------------------------------------------------------- |
| `enabled`                  | bool   | `false`                         | Enable or disable backups.                                          |
| `schedule`                 | string | `0 1 * * *`                     | Cron schedule for backup jobs.                                      |
| `backup_server_secret`     | string | `backup-server-ssh-credentials` | Name of the Kubernetes secret with backup server credentials.       |
| `backup_server_dir`        | string | `n/a`                           | Remote directory on the backup server where backups will be stored. |
| `backup_encryption_secret` | string | `backup-encryption-secret`      | Name of the Kubernetes secret containing the backup encryption key. |

## Restore Configuration

The dependencies chart provides a built-in restore feature for internal components.
The restore process downloads backup files from the external backup server over SSH and restores them into the target datastore.

---

### 1. Preparing Secrets

The restore feature uses the same type of secrets as the backup feature.
Please follow the instructions in the [Backup Configuration](#backup-configuration) section to create:

- **`backup-server-ssh-credentials`** – connection details for the backup server.
- **`restore-encryption-secret`** – secret containing the encryption key used to decrypt backup files.

> 🔑 Note: The `restore-encryption-secret` may differ from the `backup-encryption-secret`.
> If you need to restore backups from a production environment into a staging environment, copy the encryption key from production into the staging `restore-encryption-secret`.

Command to create the restore encryption secret:

```bash
kubectl create secret generic restore-encryption-secret \
  --from-literal=backup_encryption_key=<your-encryption-key>
```

---

### 2. Restore Configuration Reference

The following parameters are available in the `restore` section of the chart values:

| Parameter                  | Type   | Default                         | Description                                                          |
| -------------------------- | ------ | ------------------------------- | -------------------------------------------------------------------- |
| `enabled`                  | bool   | `false`                         | Enable or disable restore.                                           |
| `backup_server_secret`     | string | `backup-server-ssh-credentials` | Name of the Kubernetes secret with backup server credentials.        |
| `backup_server_dir`        | string | `n/a`                           | Remote directory on the backup server containing backups.            |
| `backup_encryption_secret` | string | `restore-encryption-secret`     | Name of the Kubernetes secret containing the restore encryption key. |

---

### 3. Typical Usage

- **Production environments** – usually run **backups only**.
- **Staging environments** – may have both **backup and restore enabled**, allowing you to restore production backups for testing or validation.
