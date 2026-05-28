# General information

Helm chart does deployment of OpenCRVS dependencies including monitoring stack. Helm Chart is capable for testing and pilot projects.

> NOTE: See [values.yaml](values.yaml) for exact versions

- Datastores:
  - MongoDB
  - Postgres
  - Elasticsearch
  - Redis
  - MinIO
  - InfluxDB
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

| Parameter               | Type   | Default        | Description                                                                                                                                                                                    |
| ----------------------- | ------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hostname                | string | farajaland.dev | All chart services will be available under specified domain. Exposed services are MinIO and Kibana, if Monitoring is enabled                                                                   |
| ingress.ssl_enabled     | bool   | false          | Enable or disable https endpoint, by default all http traffic is routed to https                                                                                                               |
| ingress.tls_resolver    | string | ` `            | If traefik was deployed with custom resolver, please define resolver name here. Resolver will be attached to Traefik CRD IngressRoute, otherwise default Traefik SSL Certificate will be used. |
| ingress.tls_secret_name | string | ` `            | Secret with custom SSL Certificate for IngressRoute, check traefik documentation for details. Otherwise default Traefik SSL Certificate will be used.                                          |
| timezone                | string | ` `            | Time zone for a backup and restore CronJobs, by default local time zone is used from server                                                                                                    |
| storage_type            | string | `pvc`          | Kubernetes storage type, available options are `pvc` or `host_path`. More information are at [Storage Configuration](#storage-configuration)                                                   |
| node_selector           | dict   | `{}`           | Label selector for datastore nodes, usually used to keep data persistent                                                                                                                       |
| monitoring.enabled      | bool   | `false`        | Enable or disable monitoring, see [Monitoring](#monitoring)                                                                                                                                    |
| priority_class.enabled  | bool   | `false`        | Enable or disable priority class for datastores. Enabling this option will avoid unnecessary pod eviction.                                                                                     |
| backup.enabled          | bool   | `true`         | Enable or disable data backup. Please check [Backup configuration](#backup-configuration) for more options. Usually this option is enabled on Production environment                           |
| restore.enabled         | bool   | `true`         | Enable or disable data restore. Please check [Restore configuration](#restore-configuration) for more options. Usually this option is enabled on Staging environment                           |

## MongoDB

MongoDB configuration section for Helm values.yaml

This section allows you to configure the deployment of MongoDB within your infrastructure.
| Parameter | Type | Default | Description |
|--------------------------|---------|----|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| enabled | bool | true | Enable or disable the MongoDB deployment. |
| version | string | 4.4 | Specify the MongoDB Docker image version to use. See: https://hub.docker.com/_/mongo |
| use_default_credentials | bool | true | If true, deploys MongoDB without authentication. If false, custom databases and users are created as specified below. |
| data_storage_size | string | 1Gi | Persistent volume claim size for MongoDB data volume |
| storage_type | string | `pvc` | Kubernetes storage type, available options are `pvc` or `host_path`. More information are at [Storage Configuration](#storage-configuration) |
| host_data_path | string | `/data/mongo` | Path to persistent data on VM (host) |
| node_selector | dict | `{}` | Label selector for datastore nodes, usually used to keep data persistent |
| backup_schedule | string | `n/a` | Backup cronjob schedule, if not defined then values from `backup.schedule` is used |
| backup_server_dir | string | `n/a` | Directory to store encrypted backup on backup server, if not defined `backup.backup_server_dir` is used |

## Postgres

Postgres configuration section for Helm values.yaml

This section allows you to configure the postgres deployment within your infrastructure.
| Parameter | Type | Default | Description |
|--------------------------|---------|----|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| enabled | bool | true | Enable or disable the Postgres deployment. |
| use_default_credentials | bool | true | If true, deploys Postgres with default user/password: postgres/postgres |
| storage_type | string | `n/a` | Kubernetes storage type, available options are `pvc` or `host_path`. More information are at [Storage Configuration](#storage-configuration) |
| pvc.storage_class | string | `n/a` | StorageClass name used for dynamic volume provisioning |
| pvc.storage_size | string | 10Gi | Persistent volume claim size for Postgres data volume |
| pvc.access_mode | string | ReadWriteOnce | Kubernetes PVC access mode |
| host_data_path | string | `/data/postgres` | Path to persistent data on VM (host) |
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
| restore.{} | dict | `{}` | Restore configuration section, for more information please check `values.yaml` and **Restore section** in this README |
| restore.enabled | string | `false` | Restore enabled or disabled, section has higher priority over global `restore` section |
| restore.server_secret | string | `backup-server-ssh-credentials` | Name of the Kubernetes secret with backup server credentials, usually backup server is used for restore, thats why credentials are shared |
| restore.encryption_secret | string | `restore-encryption-secret` | Name of the Kubernetes secret containing the backup encryption key |
| restore.schedule | string | `0 3 * * *` | Restore cronjob schedule, if not defined then value from `restore.schedule` is used |

## Elasticsearch

This section allows you to configure the deployment and authentication settings for Elasticsearch.

| Key                     | Type    | Example               | Description                                                                                                                                  |
| ----------------------- | ------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| enabled                 | boolean | true                  | Enable or disable the Elasticsearch deployment.                                                                                              |
| use_default_credentials | boolean | true                  | Deploy Elasticsearch without enabled authentication.                                                                                         |
| storage_type            | string  | `pvc`                 | Kubernetes storage type, available options are `pvc` or `host_path`. More information are at [Storage Configuration](#storage-configuration) |
| pvc.storage_class | string | `n/a` | StorageClass name used for dynamic volume provisioning |
| pvc.storage_size | string | 10Gi | Persistent volume claim size for Postgres data volume |
| pvc.access_mode | string | ReadWriteOnce | Kubernetes PVC access mode |
| host_data_path          | string  | `/data/elasticsearch` | Path to persistent data on VM (host)                                                                                                         |
| node_selector           | dict    | `{}`                  | Label selector for datastore nodes, usually used to keep data persistent                                                                     |

## MinIO

### Configuration options

| Key                     | Type   | Default value                   | Description                                                                                                                                  |
| ----------------------- | ------ | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| enabled                 | bool   | true                            | Enable or disable minio service                                                                                                              |
| use_default_credentials | bool   | true                            | Default credentials for MinIO are username `minioadmin` and password `minioadmin`.                                                           |
| storage_type            | string | `pvc`                           | Kubernetes storage type, available options are `pvc` or `host_path`. More information are at [Storage Configuration](#storage-configuration) |
| pvc.storage_class | string | `n/a` | StorageClass name used for dynamic volume provisioning |
| pvc.storage_size | string | 10Gi | Persistent volume claim size for Postgres data volume |
| pvc.access_mode | string | ReadWriteOnce | Kubernetes PVC access mode |
| host_data_path          | string | `/data/minio`                   | Path to persistent data on VM (host)                                                                                                         |
| node_selector           | dict   | `{}`                            | Label selector for datastore nodes, usually used to keep data persistent                                                                     |
| backup.{}               | dict   | `{}`                            | Backup configuration section, for more information please check `values.yaml` and **Backup section** in this README                          |
| backup.enabled          | string | `false`                         | Backup enabled or disabled, section has higher priority over global `backup` section                                                         |
| backup.type             | string | `dump`                          | `dump` is a full filesystem dump, `differential` is rsync from MinIO filesystem on remote backup server                                      |
| backup.server_secret    | string | `backup-server-ssh-credentials` | Name of the Kubernetes secret with backup server credentials                                                                                 |
| backup.schedule         | string | `0 1 * * *`                     | Time to run backup job, if not defined then value from `backup.schedule` is used                                                             |
| backup.server_dir       | string | `n/a`                           | Directory on backup server for encrypted archive backups or filesystem rsync. Uses global value if not set                                   |
| restore.{}              | dict   | `{}`                            | Restore configuration section, for more information please check `values.yaml` and **Restore section** in this README                        |
| restore.enabled         | string | `false`                         | Enables restore functionality; section overrides global `restore` settings.                                                                  |
| restore.type            | string | `dump`                          | Restore method: `dump` (from encrypted archive) or `differential` (same as for backup)                                                       |
| restore.server_secret   | string | `backup-server-ssh-credentials` | Name of the Kubernetes secret with backup server credentials, usually backup server is used for restore, thats why credentials are shared    |
| restore.schedule        | string | `0 3 * * *`                     | Restore cronjob schedule, if not defined then value from `restore.schedule` is used                                                          |

### MinIO Credentials

Setting `use_default_credentials` to `false` will generate strong password for MinIO.

MinIO defaults to minioadmin and minioadmin as the access key and secret key respectively.
MinIO strongly discourages use of the default credentials regardless of deployment environment.
Check official documentation for more details:
https://min.io/docs/minio/linux/administration/identity-access-management/minio-user-management.html

Values are stored as a Kubernetes secret `minio-opencrvs-users` in dependencies namespace. Copy secret object as is into OpenCRVS application namespace to make it accessible by services:

```
DEPENDENCIES_NAMESPACE=<dependencies namespace>
OPENCRVS_NAMESPACE=<OpenCRVS namespace>
kubectl get secret minio-opencrvs-users -n $DEPENDENCIES_NAMESPACE -o yaml \
  | sed "s#namespace: $DEPENDENCIES_NAMESPACE#namespace: $OPENCRVS_NAMESPACE#" \
  | kubectl apply -n $OPENCRVS_NAMESPACE -f -
```

Don't forget to replace placeholders with appropriate namespaces.

Example of Kubernetes secret:

```
$ kubectl get secret -oyaml -n opencrvs-dev minio-opencrvs-users | yq .data
MINIO_ACCESS_KEY: RE...wMw==
MINIO_ROOT_PASSWORD: dG...FU=
MINIO_ROOT_USER: RE...wMw==
MINIO_SECRET_KEY: dG...FU=
```

Reference secret values within `values.yaml`:

```yaml
documents:
  secrets:
    minio-secret:
      - MINIO_ACCESS_KEY
      - MINIO_SECRET_KEY
```

### Backup and Restore Section Reference

For detailed configuration, review the values.yaml file and refer to the Backup and Restore sections of this README.
Adjust schedules, server credentials, and directories as needed for your deployment.

## Redis

OpenCRVS is using Bitnami package for Redis https://hub.docker.com/r/bitnami/redis due to better security and performance optimization. Please check there full list of available options

| Key       | Default value | Description                                                                     |
| --------- | ------------- | ------------------------------------------------------------------------------- |
| enabled   | true          | Enable or disable redis service                                                 |
| env       | {}            | Flat dictionary (key/value) of environment variables passed to docker container |
| auth_mode | disabled      | Authentication mode, possible values `disabled`, `acl` or `password`            |

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

## InfluxDB

| Key               | Type    | Example | Description                                           |
| ----------------- | ------- | ------- | ----------------------------------------------------- |
| enabled           | boolean | true    | Enable or disable the Elasticsearch deployment.       |
| data_storage_size | string  | 5Gi     | Persistent volume claim size for InfluxDB data volume |

## Storage Configuration

This chart supports flexible data persistence for **Elasticsearch, MongoDB, Postgres, MinIO, and InfluxDB**.  
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
  storage_type: pvc  # Not required; pvc is default
  pvc:
    storage_size: 5Gi
    storage_class: "azurefile-premium" # Optional: specify a StorageClass or leave as "" for default
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

For backward compatibility `HTTP_POST2_ALERT_URL` environment variable needs to be added to elastalert configuration. All alerts will be send to country config service and forwarded to email address defined while SMTP server configuration.

See example:

```yaml
elastalert:
  env:
    HTTP_POST2_ALERT_URL: http://countryconfig.opencrvs-dev.svc.cluster.local:3040/email
```

> NOTE: This behavior will be changed in future releases, see [#10608](https://github.com/opencrvs/opencrvs-core/issues/10608)

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

By providing custom configuration file you will be able to adjust ILM policies, logs and metrics to monitor and other settings critical for your environment.

Configuration example for filebeat:

```yaml
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
- MongoDB
- PostgreSQL
- MinIO
- InfluxDB

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
