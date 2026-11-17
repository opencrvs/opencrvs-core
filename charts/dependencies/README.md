# General information

Helm chart does deployment of OpenCRVS dependencies including monitoring stack. Helm Chart is capable for testing and pilot projects.

> NOTE: See [values.yaml](values.yaml) for exact versions

- Datastores:
  - Postgres
  - Elasticsearch
  - Redis
  - RustFS
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

| Parameter                           | Type   | Default                            | Description                                                                                                                                                                                                                                                                            |
| ----------------------------------- | ------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hostname                            | string | farajaland.dev                     | All chart services will be available under specified domain. Exposed services are RustFS and Kibana, if Monitoring is enabled                                                                                                                                                          |
| ingress.ssl_enabled                 | bool   | false                              | Enable or disable https endpoint, by default all http traffic is routed to https                                                                                                                                                                                                       |
| ingress.tls_resolver                | string | ` `                                | If traefik was deployed with custom resolver, please define resolver name here. Resolver will be attached to Traefik CRD IngressRoute, otherwise default Traefik SSL Certificate will be used.                                                                                         |
| ingress.tls_secret_name             | string | ` `                                | Secret with custom SSL Certificate for IngressRoute, check traefik documentation for details. Otherwise default Traefik SSL Certificate will be used.                                                                                                                                  |
| ingress.admin_console_allowlist     | list   | `[]`                               | Source IP ranges (CIDR) allowed to reach the RustFS console and Kibana, enforced via a Traefik `ipAllowList` middleware. Leave empty to leave these admin consoles publicly reachable. Does not restrict the RustFS S3 API route - use `application_allowlist` below to restrict that. |
| ingress.application_allowlist       | list   | `[]`                               | Source IP ranges (CIDR) allowed to reach the RustFS S3 API route, enforced via a Traefik `ipAllowList` middleware. `admin_console_allowlist` is always merged in. Leave empty to leave the RustFS API publicly reachable.                                                              |
| network_policy.enabled              | bool   | `true`                             | Render Kubernetes NetworkPolicy resources for dependency workloads. Requires a CNI provider that enforces NetworkPolicy.                                                                                                                                                               |
| network_policy.ingress_mode         | string | `deny`                             | Baseline policy for ingress to dependency pods: `deny` (default, requires another NetworkPolicy to allow it), `private` (allow only RFC1918 private ranges), or `full` (unrestricted).                                                                                                 |
| network_policy.egress_mode          | string | `deny`                             | Baseline policy for egress from dependency pods. Same modes as `ingress_mode`, applied to egress. DNS (53) is always allowed except in `full` mode.                                                                                                                                    |
| network_policy.allow_same_namespace | bool   | `true`                             | Allow dependency pods in the same namespace to communicate with each other.                                                                                                                                                                                                            |
| network_policy.allowed_namespaces   | list   | `[]`                               | Namespaces allowed to reach dependency pods (e.g. the opencrvs-services namespace). When set, dependency pods accept ingress on any port from every pod in each listed namespace, so the OpenCRVS application keeps working once ingress is denied by default.                         |
| timezone                            | string | ` `                                | Time zone for a backup and restore CronJobs, by default local time zone is used from server                                                                                                                                                                                            |
| storage_type                        | string | `pvc`                              | Kubernetes storage type, available options are `pvc` or `host_path`. More information are at [Storage Configuration](#storage-configuration)                                                                                                                                           |
| platform.imagePullSecrets           | list   | `[]`                               | Pod-level image pull secrets applied to all workloads in this chart. Use this when images are stored in private registries.                                                                                                                                                            |
| node_selector                       | dict   | `{}`                               | Label selector for datastore nodes, usually used to keep data persistent                                                                                                                                                                                                               |
| monitoring.enabled                  | bool   | `false`                            | Enable or disable monitoring, see [Monitoring](#monitoring)                                                                                                                                                                                                                            |
| priority_class.enabled              | bool   | `false`                            | Enable or disable priority class for datastores. Enabling this option will avoid unnecessary pod eviction.                                                                                                                                                                             |
| backup.enabled                      | bool   | `true`                             | Enable or disable data backup. Please check [Backup configuration](#backup-configuration) for more options. Usually this option is enabled on Production environment                                                                                                                   |
| restore.enabled                     | bool   | `true`                             | Enable or disable data restore. Please check [Restore configuration](#restore-configuration) for more options. Usually this option is enabled on Staging environment                                                                                                                   |
| service_type                        | string | `ClusterIP`                        | Kubernetes Service type for datastore Services (Postgres, Elasticsearch, Kibana, Redis, RustFS), e.g. `ClusterIP` or `NodePort`. Applies to all of them; there is no per-service override.                                                                                             |
| utilities.image.repository          | string | `ghcr.io/opencrvs/ocrvs-utilities` | Shared utilities image repository used by helper jobs and init containers.                                                                                                                                                                                                             |
| utilities.image.tag                 | string | `v2.1.0`                           | Shared utilities image tag used by helper jobs and init containers.                                                                                                                                                                                                                    |

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

The dependencies chart and the opencrvs-services chart are typically deployed to separate namespaces (see the default `*.host` values in `charts/opencrvs-services/values.yaml`, e.g. `redis-0.redis.opencrvs-deps-dev.svc.cluster.local`). While `network_policy.ingress_mode` is `deny` (the default), application pods (auth, gateway, events, etc.) can no longer reach Postgres, Elasticsearch, RustFS or Redis unless the opencrvs-services release namespace is listed in `network_policy.allowed_namespaces`. This rule allows all ports from every pod in each listed namespace, rather than requiring a separate rule per service/port pair.

Example:

```yaml
network_policy:
  allowed_namespaces:
    - opencrvs-production
```

Service-specific rules follow Kubernetes `NetworkPolicy.spec` syntax, except `podSelector` is generated by the chart from the service `app_label`.

Example — open ingress for a service's own port, custom egress via `rules`:

```yaml
rustfs:
  network_policy:
    rules:
      - name: allow-extra-ingress
        policyTypes:
          - Ingress
        ingress:
          - ports:
              - protocol: TCP
                port: 9100 # an extra port; the API port is not opened here
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

Each rule must define `name`; the chart uses it to generate deterministic `NetworkPolicy` resource names. `ingress_mode: full` is a shortcut for the same shape, but only supports a single port (the service's `port` value) — write a `rules` entry instead when a service listens on more than one port, as RustFS does.

For backup and restore jobs, external backup server access must be allowed explicitly. Standard Kubernetes `NetworkPolicy` supports IP blocks, pod selectors, namespace selectors, and ports; it does not support DNS/FQDN destinations.

To handle this, the chart computes an `ipBlock` egress rule (`<host>/32`, TCP port 22) for Postgres and RustFS directly from the resolved backup/restore host (`backup.host`, `restore.host`, `postgres.backup.host`, `postgres.restore.host`, `rustfs.backup.host`, `rustfs.restore.host`), rendered only when the corresponding `backup.enabled`/`restore.enabled` flag is true. **This requires the host value to be a literal IP address** — if you configure a DNS hostname instead, the generated `ipBlock.cidr` will be invalid and the policy will not match traffic to that host.

### Service connections

Applies once `network_policy.enabled: true`. Every dependency pod always accepts traffic from its own namespace (`allow_same_namespace`) and from any namespace listed in `allowed_namespaces`, and may always egress to DNS (53). The table below shows what each service allows **beyond** that baseline, per its current `values.yaml` configuration:

| Service                                          | Port(s)                    | Extra ingress                                         | Extra egress                                                                                               |
| ------------------------------------------------ | -------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Postgres                                         | 5432                       | any source (`ingress_mode: full`)                     | 80, 443 (package installs); backup/restore host:22 when backup/restore enabled                             |
| Elasticsearch                                    | 9200                       | any source (`ingress_mode: full`)                     | —                                                                                                          |
| Redis                                            | 6379                       | any source (`ingress_mode: full`)                     | —                                                                                                          |
| RustFS                                           | 3535 (API), 3536 (console) | private ranges: 3535 (`ingress_mode`), 3536 (`rules`) | -                                                                                                          |
| Kibana                                           | 5601                       | any source (`ingress_mode: full`)                     | —                                                                                                          |
| Filebeat                                         | —                          | —                                                     | 443, 6443 to RFC1918 ranges (Kubernetes API server, for pod metadata)                                      |
| Metricbeat                                       | —                          | —                                                     | 443, 6443, 10250 to RFC1918 ranges (Kubernetes API server and node kubelet)                                |
| Logstash, APM Server                             | —                          | —                                                     | —                                                                                                          |
| Elastalert                                       | —                          | —                                                     | any destination and port (`egress_mode: full`): notification target, countryconfig `/email` or SMTP        |
| postgres-restore-runner (differential restore)   | —                          | —                                                     | 80, 443 (package installs); restore host:22 when restore enabled                                           |
| backup-runner (differential backup/restore jobs) | —                          | —                                                     | any port, RFC1918 private ranges only (Kubernetes API server, for `kubectl exec`/`scale`/`delete`/`apply`) |

`ingress_mode: full` opens a service to any source, not just Traefik — narrow it with an explicit `rules` entry (e.g. a `namespaceSelector` for `traefik`), or use `ingress_mode: private` to restrict to RFC1918 ranges, if `full` is too broad for your deployment.

Postgres, RustFS and the differential `postgres-restore-runner` pod also get an unconditional `allow-package-repo-egress` rule (`0.0.0.0/0:80,443`) so that runtime package installation (see [Air-Gap Installation](#air-gap-installation)) keeps working when egress is denied by default — port 80 is included since some apt/apk mirrors are HTTP-only. This rule is intentionally broad: it also permits port 80/443 egress to other pods/namespaces in the cluster, not just the internet. Elasticsearch does not get this rule since it has no backup path and installs no packages at runtime in this chart.

Differential-type backup/restore automation (`postgres-on-deploy`, `postgres-backup-diff`, `postgres-backup-full`, `postgres-restore`, `rustfs-backup`, `rustfs-restore`) drives the actual backup/restore by issuing `kubectl exec`/`scale`/`delete`/`apply` against the Kubernetes API server — it never talks to the Postgres/RustFS pods over the network directly, since `kubectl exec` is proxied through the API server. These pods are labeled `app: backup-runner` (not `app: postgres`/`app: rustfs`) and get their own unconditional `backup-runner-allow-egress` rule for that access, rather than relying on incidental coverage from the package-repo rule.

`backup-runner-allow-egress` intentionally allows all ports, not just 443. The `kubernetes` Service in the `default` namespace exposes port 443, but many CNIs enforce egress `NetworkPolicy` against the _post-DNAT_ destination — i.e. the API server's real `targetPort` (commonly 6443 on kubeadm-style clusters), not the Service's port — so a rule scoped to `port: 443` can silently fail to match. Run `kubectl get endpoints kubernetes -n default` to see the actual port on your cluster if you'd rather scope this down.

The destination is scoped to RFC1918 private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) rather than `0.0.0.0/0`, since the only legitimate destination is the API server (a ClusterIP, pod IP, or node IP — always private in a normally-networked cluster) and these pods have no reason to reach the public internet. **If your cluster's nodes have a public IP as their primary interface** (common on bare VPS-style setups without a private VPC network) and the CNI enforces policy against the post-DNAT node IP rather than the ClusterIP, this scoping could exclude the API server — check with `kubectl get nodes -o wide` (INTERNAL-IP vs EXTERNAL-IP) and `kubectl get endpoints kubernetes -n default -o wide` before relying on it, and fall back to `0.0.0.0/0` if needed. These pods are already privileged (their `backup-runner` ServiceAccount can `exec`/`scale`/`delete` arbitrary pods via RBAC), so the extra egress breadth of `0.0.0.0/0` wouldn't add meaningful risk beyond what their RBAC already grants — the private-range scoping here is defense in depth, not a hard requirement.

## Credentials of datastores

Postgres, Elasticsearch, MinIO and Redis follow the same rules. Each one has the values `use_default_credentials` and `admin_user_secret_name` (for Redis: `users_secret`). The chart never changes an existing secret. If the secret exists, the chart does not read `use_default_credentials` and the `admin_*` values.

| Datastore     | `admin_*` values set                                                       | `admin_*` values not set, `use_default_credentials: true` | `admin_*` values not set, `use_default_credentials: false` |
| ------------- | -------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| MinIO         | `minio.admin_username` and `minio.admin_password`. Set both or none.       | `minioadmin` / `minioadmin`                               | Random values                                              |
| Postgres      | `postgres.admin_username` and `postgres.admin_password`. Set both or none. | `postgres` / `postgres`                                   | Random values                                              |
| Elasticsearch | `elasticsearch.admin_password`, the password of `elastic`                  | `elasticadmin`                                            | Random password                                            |
| Redis         | Not supported                                                              | Username equals password for each user                    | Random values for each name in `redis.auth_users`          |

The chart reads the `admin_*` values when it creates a missing secret, whatever `use_default_credentials` is. Redis has no `admin_*` values. It always has an ACL.

The `opencrvs-services` chart reads the same secrets. Copy them to the namespace of that chart, or give it the same `admin_*` values. See the README of the `opencrvs-services` chart.

> FIXME: The `elasticsearch-opencrvs-users` and `elasticsearch-opencrvs-urls` secrets of the monitoring users use the same names as the secrets of the `opencrvs-services` chart. Deploy the two charts to separate namespaces.

## Postgres

Postgres configuration section for Helm values.yaml

This section allows you to configure the postgres deployment within your infrastructure.
| Parameter | Type | Default | Description |
|--------------------------|---------|----|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| enabled | bool | true | Enable or disable the Postgres deployment. |
| image.repository | string | `chumaky/postgres_mongo_fdw` | Postgres Docker image repository. |
| image.tag | string | `17.6_fdw5.5.2` | Postgres Docker image tag. |
| use*default_credentials | bool | true | Used when `admin*_`are not set.`true`: `postgres`/`postgres`. `false`: random values. See [Credentials of datastores](#credentials-of-datastores). |
| admin_user_secret_name | string | `postgres-admin-user`| Secret with the keys`POSTGRES_USER`and`POSTGRES_PASSWORD`. |
| admin_username | string | `n/a`| Used only when the secret does not exist, whatever`use_default_credentials`is. Set together with`admin_password`. |
| admin_password | string | `n/a`| Used only when the secret does not exist, whatever`use_default_credentials`is. Set together with`admin_username`. |
| storage_type | string | `global storage_type`| Optional Postgres-specific override for the Kubernetes storage type. Available options are`pvc`or`host_path`. If not set, the global `storage_type`value is used. |
| pvc.storage_class | string |`n/a`| StorageClass name used for dynamic volume provisioning |
| pvc.storage_size | string | 10Gi | Persistent volume claim size for Postgres data volume |
| pvc.access_mode | string | ReadWriteOnce | Kubernetes PVC access mode |
| host_data_path | string |`/data/postgres`| Path to persistent data on the host when`storage_type`is`host_path`. |
| node_selector | dict | `{}`| Label selector for datastore nodes, usually used to keep data persistent |
| backup.{} | dict |`{}`| Backup configuration section, for more information please check`values.yaml`and **Backup section** in this README |
| backup.enabled | string |`false`| Backup enabled or disabled, section has higher priority over global`backup`section |
| backup.type | string |`dump`|`dump`is a full logical database dump,`differential`is a physical backup using pgBackRest |
| backup.stanza | string |`main`| Stanza name for pgBackRest, use when backup type is`differential`|
| backup.server_secret | string |`backup-server-ssh-credentials`| Name of the Kubernetes secret with backup server credentials |
| backup.encryption_secret | string |`backup-encryption-secret`| Name of the Kubernetes secret containing the backup encryption key |
| backup.schedule | dict |`{}`| Backup cronjob schedule |
| backup.schedule.dump | string |`0 1 _ \* _`| Used only when type=dump, if not defined then value from`backup.schedule`is used |
| backup.schedule.full | string |`0 1 _ _ 0`| Full backup schedule. Used when type=differential, note that value from`backup.schedule`is ignored |
|`backup.schedule.differential`| string |`0 1 _ _ 1-6`| Differential backup schedule. Used when type=differential, note that value from`backup.schedule`is ignored |
| backup.server_dir | string |`n/a`| Directory to store encrypted backup on backup server, if not defined`backup.backup_server_dir`is used |
| backup.cronjob | boolean |`true`| Run backup as cronjob, setting to`false`allows to run one time job, e/g manual backup |
| restore.{} | dict |`{}`| Restore configuration section, for more information please check`values.yaml`and **Restore section** in this README |
| restore.enabled | string |`false`| Restore enabled or disabled, section has higher priority over global`restore`section |
| restore.server_secret | string |`backup-server-ssh-credentials`| Name of the Kubernetes secret with backup server credentials, usually backup server is used for restore, thats why credentials are shared |
| restore.encryption_secret | string |`restore-encryption-secret`| Name of the Kubernetes secret containing the backup encryption key |
| restore.schedule | string |`0 3 _ \* \*`| Restore cronjob schedule, if not defined then value from`restore.schedule`is used |
| restore.cronjob | boolean |`true`| Run restore as cronjob, setting to`false`allows to run one time job, e/g manual restore, or disaster recovery scenario |
| node_port | int |`n/a`| Fixed NodePort to expose port`5432`on. Only used when the global`service_type`is`NodePort`, otherwise a random port is assigned |
| shm_size | string | `256Mi`| Size of`/dev/shm`, mounted as a memory-backed `emptyDir`. Postgres uses it for parallel query workers; the container runtime's default (typically 64Mi) is easily exhausted, causing "could not resize shared memory segment" errors unrelated to disk space. |

## Elasticsearch

This section allows you to configure the deployment and authentication settings for Elasticsearch.

| Key                     | Type    | Example                                         | Description                                                                                                                                                                                |
| ----------------------- | ------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| image.repository        | string  | `docker.elastic.co/elasticsearch/elasticsearch` | Elasticsearch Docker image repository.                                                                                                                                                     |
| image.tag               | string  | `8.19.15`                                       | Elasticsearch Docker image tag.                                                                                                                                                            |
| enabled                 | boolean | true                                            | Enable or disable the Elasticsearch deployment.                                                                                                                                            |
| use_default_credentials | boolean | true                                            | Security is always enabled. Used when `admin_password` is not set. `true`: password `elasticadmin`. `false`: random password. See [Credentials of datastores](#credentials-of-datastores). |
| admin_user_secret_name  | string  | `elasticsearch-admin-user`                      | Secret with the key `ELASTIC_PASSWORD`.                                                                                                                                                    |
| admin_password          | string  | `n/a`                                           | Password of `elastic`. Used only when the secret does not exist, whatever `use_default_credentials` is. If not set: `elasticadmin` or a random password.                                   |
| storage_type            | string  | `global storage_type`                           | Optional Elasticsearch-specific override for the Kubernetes storage type. Available options are `pvc` or `host_path`. If not set, the global `storage_type` value is used.                 |
| pvc.storage_class       | string  | `n/a`                                           | StorageClass name used for dynamic volume provisioning                                                                                                                                     |
| pvc.storage_size        | string  | 10Gi                                            | Persistent volume claim size for Postgres data volume                                                                                                                                      |
| pvc.access_mode         | string  | ReadWriteOnce                                   | Kubernetes PVC access mode                                                                                                                                                                 |
| host_data_path          | string  | `/data/elasticsearch`                           | Path to persistent data on the host when `storage_type` is `host_path`.                                                                                                                    |
| node_selector           | dict    | `{}`                                            | Label selector for datastore nodes, usually used to keep data persistent                                                                                                                   |
| node_port               | int     | `n/a`                                           | Fixed NodePort to expose port `9200` on. Only used when the global `service_type` is `NodePort`, otherwise a random port is assigned                                                       |
| node_port_transport     | int     | `n/a`                                           | Fixed NodePort to expose port `9300` on. Only used when the global `service_type` is `NodePort`, otherwise a random port is assigned                                                       |

## RustFS

RustFS is the open-source S3 object store that the chart deploys. It replaces MinIO, which the chart does not deploy any more. It runs as a StatefulSet with a Service and a volume, and serves the S3 API on port 3535 and the console on port 3536.

RustFS is backed up and restored by the jobs described in [Backup and restore of the S3 store](#backup-and-restore-of-the-s3-store).

### Migrate from MinIO

An environment that ran MinIO keeps its objects when RustFS takes over the volume of MinIO in place. RustFS adopts the buckets and the objects in the volume, and `.minio.sys` stays beside its own `.rustfs.sys`. Point RustFS at the volume of MinIO with the settings of your storage type:

```yaml
# storage_type: host_path
rustfs:
  host_data_path: /data/minio # the value of minio.host_data_path

# storage_type: pvc
rustfs:
  pvc:
    name: minio # the PVC that MinIO used
    # Copy storage_class, storage_size and access_mode of minio.pvc, unchanged
```

Keep these values in later releases, otherwise RustFS stops using that volume. Do not rename the directory `/data/minio`: set `host_data_path` to it instead. The running MinIO would lose a renamed directory before the deployment replaces it.

- **Back up the data first.** After RustFS has written to the volume, going back to MinIO is not clean: MinIO does not see the user metadata (such as `created-by`) of the objects that RustFS wrote. A copy of the volume taken before the migration is the way back.
- **MinIO must be stopped before RustFS starts.** `helm upgrade` creates the RustFS StatefulSet before it deletes the one of MinIO. Scale MinIO down first (`kubectl scale statefulset minio --replicas=0`), so that the two never run on the same data.
- **The PVC is kept.** With `pvc.name: minio` the chart renders the PVC `minio` itself, so Helm updates the PVC of the previous release instead of deleting it. Its `storage_class` and `storage_size` must be those of `minio.pvc`: Helm cannot change the storage class of a PVC. The chart adds the annotation `helm.sh/resource-policy: keep` to this PVC, so that Helm does not delete it later.
- **Add the `keep` annotation to the PVC of MinIO before the upgrade (`storage_type: pvc`).** The PVC `minio` that the previous chart made has no `keep` annotation. If `rustfs.pvc.name` is not `minio`, or you make a mistake in the values, the new release does not contain that PVC and `helm upgrade` deletes it. The data is lost when the storage class deletes the volume together with the PVC. Add the annotation first, and check it:

  ```bash
  kubectl annotate pvc minio helm.sh/resource-policy=keep --overwrite
  kubectl get pvc minio -o jsonpath='{.metadata.annotations}'
  ```

- **Keep the credentials.** RustFS reads the IAM data of MinIO with the root credentials, so `s3-opencrvs-users` must not change.
- **Hostnames change.** The S3 API is now on `rustfs.<hostname>` and the console on `rustfs-console.<hostname>`. Point `s3.host` and `s3.public_endpoint` of the services chart at them, see [Use RustFS from the OpenCRVS services](#use-rustfs-from-the-opencrvs-services).
- The `minio` values of `values.yaml` are not read any more, so move the settings that you had there to `rustfs`.

### Configuration options

| Key                     | Type   | Default value                   | Description                                                                                                                                                        |
| ----------------------- | ------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| enabled                 | bool   | true                            | Enable or disable RustFS service                                                                                                                                    |
| image.repository        | string | `rustfs/rustfs`                 | RustFS Docker image repository.                                                                                                                                     |
| image.tag               | string | `1.0.1`                         | RustFS Docker image tag.                                                                                                                                            |
| use_default_credentials | bool   | true                            | Used when `admin_*` are not set. `true`: `rustfsadmin` / `rustfsadmin`. `false`: random values. See [Credentials of datastores](#credentials-of-datastores).         |
| admin_user_secret_name  | string | `s3-opencrvs-users`             | Secret with the keys `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_ADMIN_ACCESS_KEY` and `S3_ADMIN_SECRET_KEY`.                                                            |
| admin_username          | string | `n/a`                           | Used only when the secret does not exist, whatever `use_default_credentials` is. Set together with `admin_password`.                                               |
| admin_password          | string | `n/a`                           | Used only when the secret does not exist, whatever `use_default_credentials` is. Set together with `admin_username`.                                               |
| storage_type            | string | `global storage_type`           | Optional RustFS-specific override for the Kubernetes storage type. Available options are `pvc` or `host_path`. If not set, the global `storage_type` value is used. |
| pvc.storage_class       | string | `n/a`                           | StorageClass name used for dynamic volume provisioning                                                                                                             |
| pvc.storage_size        | string | 10Gi                            | Persistent volume claim size for Postgres data volume                                                                                                              |
| pvc.access_mode         | string | ReadWriteOnce                   | Kubernetes PVC access mode                                                                                                                                         |
| host_data_path          | string | `/data/rustfs`                  | Path to persistent data on the host when `storage_type` is `host_path`.                                                                                            |
| node_selector           | dict   | `{}`                            | Label selector for datastore nodes, usually used to keep data persistent                                                                                           |
| backup.{}               | dict   | `{}`                            | Backup configuration section, for more information please check `values.yaml` and **Backup section** in this README                                                |
| backup.enabled          | string | `false`                         | Backup enabled or disabled, section has higher priority over global `backup` section                                                                               |
| backup.type             | string | `dump`                          | `dump` is a full filesystem dump, `differential` is rsync from RustFS filesystem on remote backup server                                                            |
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

### RustFS hostnames

The S3 API is served on `rustfs.<hostname>` and the console on `rustfs-console.<hostname>`. `ingress.application_allowlist` and `ingress.admin_console_allowlist` apply to them.

The subdomain of a hostname must not be the name of another environment that shares the domain. Document URLs are signed for the S3 hostname, and a feature environment that is named `rustfs` would serve its own client on `rustfs.<hostname>`.

### RustFS Credentials

See [Credentials of datastores](#credentials-of-datastores) for the rules. Setting only one of `admin_username` and `admin_password` fails the installation with `rustfs.admin_username and rustfs.admin_password must be set together`. RustFS and the backup and restore jobs always read the credentials from the secret `admin_user_secret_name`, so read the generated ones from it.

RustFS has a single root identity, built from `S3_ADMIN_ACCESS_KEY` and `S3_ADMIN_SECRET_KEY` of the secret. The documents service signs with `S3_ACCESS_KEY` and `S3_SECRET_KEY`, so they must hold the same values. The generated secret does.

### Use RustFS from the OpenCRVS services

Point the services chart at the Service and at the public hostname of RustFS. The credentials and the port stay as they are:

```yaml
s3:
  host: rustfs-0.rustfs.<dependencies namespace>.svc.cluster.local
  public_endpoint: https://rustfs.<hostname>
```

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
    s3-secret:
      - S3_ACCESS_KEY
      - S3_SECRET_KEY
```

### Volume permissions

RustFS runs as the user `rustfs`, `10001:10001`, not as root. With `storage_type: pvc` the kubelet hands the volume to that group (`fsGroup`). With `storage_type: host_path` the kubelet does not, so an init container, `fix-permissions`, changes the owner of the directory to `10001:10001`. It first checks the owner of the top directory with one `stat`, and does nothing when that is already `10001`. It hands the top directory over last, so a run that stopped half way is done again at the next start. The data of MinIO belongs to root, so a [migration from MinIO](#migrate-from-minio) walks through it once. The directory must be on a file system that allows it.

### Backup and Restore Section Reference

For detailed configuration, review the values.yaml file and refer to the Backup and Restore sections of this README.
Adjust schedules, server credentials, and directories as needed for your deployment.

## Redis

OpenCRVS is using Bitnami package for Redis https://hub.docker.com/r/bitnami/redis due to better security and performance optimization. Please check there full list of available options

| Key                     | Default value          | Description                                                                                                                                                            |
| ----------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| enabled                 | true                   | Enable or disable redis service                                                                                                                                        |
| env                     | {}                     | Flat dictionary (key/value) of environment variables passed to docker container                                                                                        |
| use_default_credentials | true                   | Authentication is always enabled. `true`: username equals password for each user. `false`: random values. See [Credentials of datastores](#credentials-of-datastores). |
| users_secret            | `redis-opencrvs-users` | Secret with the credentials of the OpenCRVS services.                                                                                                                  |
| node_port               | `n/a`                  | Fixed NodePort to expose port `6379` on. Only used when the global `service_type` is `NodePort`, otherwise a random port is assigned                                   |

### Redis authentication

Authentication is always enabled. The chart always generates an ACL with a `default` user and one user for each name in `redis.auth_users`:

- `use_default_credentials: true`: the username and the password of each user are the same, in lower case, for example `gateway` / `gateway`. The password of the `default` user is `redispassword`. Use it for local development only.
- `use_default_credentials: false`: the chart generates a random username and a random password for each user. Use it for production.

The `auth_mode` value is removed, with its modes `disabled`, `password` and `acl`.

### Redis authorization (ACL)

Behind the scenes the helm chart generates the username and the password for each OpenCRVS service (random if `use_default_credentials` is `false`):

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

### Utilities image

The backup and restore jobs of RustFS run in the utilities image. Start from it and add:

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
- `utilities.image.repository`
- `utilities.image.tag`

## Backup and restore of the S3 store

RustFS is backed up and restored by the jobs `rustfs-backup` and `rustfs-restore`, with the scripts in `files/s3`. The settings are `rustfs.backup`, `rustfs.restore` and the global `backup` and `restore`.

- **`dump`** reads the buckets through the S3 API with `mcli`, packs them into one archive, encrypts it and copies it to the backup server. The restore empties the buckets and writes the archive back. It works with any S3 store.
- **`differential`** runs rsync in the `rsync` sidecar of the RustFS pod and copies the data directory to the backup server, `<server_dir>/<data_dir>`. It leaves out the IAM configuration of the store (`.minio.sys/config/iam/` and `.rustfs.sys/config/iam/`). The restore copies the files back into the running store and hands them to `10001:10001`, the user that RustFS runs as, because the backup server does not keep the owner of a file and RustFS does not start on files that it does not own.

> [!NOTE]
> This note is for environments that you upgrade from MinIO.
>
> **`dump` backups.** The archive is `<server_dir>/<date>/rustfs_backup_<date>.tar.gz.enc`. A MinIO version of the chart named it `minio_backup_<date>.tar.gz.enc`. To restore an old archive, rename the file on the backup server to `rustfs_backup_<date>.tar.gz.enc`.
>
> **`differential` backups.** The directory `<data_dir>` on the backup server depends on the data that RustFS uses:
>
> - It is `minio` when `rustfs.host_data_path` ends with `/minio`. With `storage_type: pvc`, it is `minio` when `rustfs.pvc.name` is `minio`. RustFS then uses the directory of the MinIO backups and adds to it.
> - In all other cases it is `rustfs`.

## Storage Configuration

This chart supports flexible data persistence for **Elasticsearch, Postgres, and RustFS**.  
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

#### Use hostPath for RustFS data (legacy volumes, on-prem, etc):

```yaml
rustfs:
  storage_type: host_path # Store data on filesystem (default)
  node_selector:
    role: data2 # Store data on worker node instead of master, default is 'data1'
  host_data_path: /data/rustfs # default value
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

> NOTE: Elasticsearch security is always enabled. For production, set `elasticsearch.use_default_credentials: false`, so that the password of `elastic` is not `elasticadmin`.

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
- RustFS

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
