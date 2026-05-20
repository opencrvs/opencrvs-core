# OpenCRVS Helm Chart

This document describes OpenCRVS Helm chart configuration and provides explanation with examples for various deployment flows.

# 🚀 Quickstart

Quickstart scenario allows to run OpenCRVS locally on kubernetes cluster like docker-desktop or minikube.

> NOTE:
> Before running commands make sure `helm` and `kubectl` are installed and kubernetes context is set to local cluster.
> For Quickstart scenario you don't need to checkout any OpenCRVS repositories, just make sure kubernetes cluster is up and running and you are good to go.

**1. Install Traefik Ingress Controller**

```
helm upgrade --install traefik oci://ghcr.io/traefik/helm/traefik \
    --namespace traefik \
    --create-namespace \
    -f https://raw.githubusercontent.com/opencrvs/infrastructure/refs/heads/develop/examples/localhost/traefik/values.yaml
```

**2. Install the OpenCRVS Dependencies Chart (Database & Storage Components)**

OpenCRVS requires supporting services (MongoDB, Postgres, MinIO, InfluxDB, Elasticsearch, Redis):

```
helm upgrade --install opencrvs-deps oci://ghcr.io/opencrvs/opencrvs-dependencies-chart \
    --namespace "opencrvs-deps-dev" \
    --create-namespace \
    --atomic \
    -f https://raw.githubusercontent.com/opencrvs/infrastructure/refs/heads/develop/examples/localhost/dependencies/values.yaml
```

**3. Install OpenCRVS Chart**

> NOTE: Timeout (`--timeout`) is set to 1 hour to avoid helm install failure on slow internet connection.

```
helm upgrade --install opencrvs oci://ghcr.io/opencrvs/opencrvs-services \
    --timeout 1h \
    --namespace "opencrvs-dev" \
    --create-namespace \
    --atomic \
    --set data_seed.enabled=true \
    -f https://raw.githubusercontent.com/opencrvs/infrastructure/refs/heads/develop/examples/localhost/opencrvs-services/values.yaml
```

[Configuration options](#configuration-options) table gives brief overview of options available within helm chart. Copy and modify `examples/localhost/opencrvs-services/values.yaml` to suit your needs.

**4. After installation visit http://opencrvs.localhost**

> ➡️ Next steps:
>
> - Follow up step by step single node installation guide with GitHub Actions workflow, see [here](../../examples/dev/README.md)
> - Read more about advanced configurations options available here and for [Dependencies helm chart](../dependencies/README.md)

---

# Configuration options

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Default</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th><b>elasticsearch</b></th>
            <th>{}</th>
            <th></th>
        </tr>
        <tr>
            <td>elasticsearch.host</td>
            <td>elasticsearch.opencrvs-deps-dev.svc.cluster.local</td>
            <td>
            Elasticsearch hostname.
            </td>
        </tr>
        <tr>
            <td>elasticsearch.port</td>
            <td>9200</td>
            <td>Elasticsearch port.</td>
        </tr>
        <tr>
            <td>elasticsearch.cronjob.enabled</td>
            <td>false</td>
            <td>Enable elasticsearch reindex cronjob. Required if database restore is configured.</td>
        </tr>
        <tr>
            <td>elasticsearch.auth_mode</td>
            <td>disabled</td>
            <td>  Following values are allowed
                <li><code>disabled</code>: No authentication enabled for MongoDB, password-less access to databases</li>
                <li><code>auto</code>: (Recommended) Users are managed by OpenCRVS helm chart, this mode requires secret to be created with MongoDB admin user</li>
                <li><code>use_secret</code>: Kubernetes Secrets needs to be created manually, users are managed by MongoDB administrator, but helm will pick up data from users_secret and urls_secret</li>
                <li><code>managed</code>: Kubernetes Secrets needs to be created manually and mapped manually for each service.</li>
                It is recommended to use <code>auth_mode: auto</code> or <code>use_secret</code> for server environment. For more information please check <a href="#authentication-configuration">Authentication configuration</a> section
            </td>
        </tr>
        <tr>
            <td>elasticsearch.admin_user_secret_name</td>
            <td>elasticsearch-admin-user</td>
            <td>Secret to store Elasticsearch admin user password, If <code>auth_mode: auto</code> is configured, OpenCRVS will connect to Elasticsearch server under <code>elastic</code> and create all required for OpenCRVS users.</td>
        </tr>
        <tr>
            <td>elasticsearch.admin_user_secret_name</td>
            <td>elasticsearch-admin-user</td>
            <td>Secret to store Elasticsearch admin user password, If <code>auth_mode: auto</code> is configured, OpenCRVS will connect to Elasticsearch server under <code>elastic</code> and create all required for OpenCRVS users.</td>
        </tr>
        <tr>
            <td>elasticsearch.urls_secret</td>
            <td>elasticsearch-opencrvs-urls</td>
            <td>Secret to store Elasticsearch URLs with usernames and passwords. Secret is created by OpenCRVS installation automatically with <code>auth_mode: auto</code> and needs to be created manually by Operator (DevOps) with <code>auth_mode: managed</code> or <code>use_secret</code>. For more information how to create secret manually please check <a href="#authentication-configuration">Authentication configuration</a> section.</td>
        </tr>
       <tr>
            <th>influxdb.{}</th>
            <th></th>
            <th></th>
        </tr>
        <tr>
            <td>influxdb.host</td>
            <td>influxdb-0.influxdb.opencrvs-deps-dev.svc.cluster.local</td>
            <td>InfluxDB hostname configuration.</td>
        </tr>
        <tr>
            <td>influxdb.port</td>
            <td>8086</td>
            <td>InfluxDB port configuration.</td>
        </tr>
        <tr>
            <td>influxdb.db</td>
            <td>ocrvs</td>
            <td>InfluxDB database name.</td>
        </tr>
       <tr>
            <th>minio.{}</th>
            <th></th>
            <th></th>
        </tr>
        <tr>
            <td>minio.host</td>
            <td>minio-0.minio.opencrvs-deps-dev.svc.cluster.local</td>
            <td>MinIO hostname configuration.</td>
        </tr>
        <tr>
            <td>minio.port</td>
            <td>3535</td>
            <td>MinIO port configuration.</td>
        </tr>
        <tr>
            <td>minio.external_url</td>
            <td><code>minio.`opencrvs hostname>`</code></td>
            <td>external `host/ip`[:port] available for client browser to issue signed document URL. </td>
        </tr>
        <tr>
            <td>minio.external_protocol</td>
            <td>https</td>
            <td>external protocol (http or https) available for client browser. Default: helm chart http_scheme helper value</td>
        </tr>
        <tr>
            <td>minio.auth_mode</td>
            <td>disabled</td>
            <td>  Following values are allowed
                <li><code>disabled</code>: No authentication enabled for MongoDB, password-less access to databases</li>
                <li><code>use_secret</code>: Kubernetes Secrets needs to be created manually, users are managed by MongoDB administrator, but helm will pick up data from users_secret</li>
                <li><code>managed</code>: Kubernetes Secrets needs to be created manually and mapped manually for each service.</li>
                It is recommended to use <code>use_secret</code> for server environment. For more information please check <a href="#authentication-configuration">Authentication configuration</a> section
            </td>
        </tr>
        <tr>
            <td>minio.users_secret</td>
            <td>minio-opencrvs-users</td>
            <td>Secret name to store MinIO credentials, more information about credentials secret is at <a href="#authentication-configuration">Authentication configuration</a></td>
        </tr>
       <tr>
            <th>mongodb.{}</th>
            <th></th>
            <th></th>
        </tr>
        <tr>
            <td>mongodb.host</td>
            <td>mongodb-0.mongodb.opencrvs-deps-dev.svc.cluster.local</td>
            <td>MongoDB hostname.</td>
        </tr>
        <tr>
            <td>mongodb.auth_mode</td>
            <td>disabled</td>
            <td>  Following values are allowed
                <li><code>disabled</code>: No authentication enabled for MongoDB, password-less access to databases</li>
                <li><code>auto</code>: (Recommended) Users are managed by OpenCRVS helm chart, this mode requires secret to be created with MongoDB admin user</li>
                <li><code>use_secret</code>: Kubernetes Secrets needs to be created manually, users are managed by MongoDB administrator, but helm will pick up data from users_secret and urls_secret</li>
                <li><code>managed</code>: Kubernetes Secrets needs to be created manually and mapped manually for each service.</li>
                It is recommended to use <code>auth_mode: auto</code> or <code>use_secret</code> for server environment. For more information please check <a href="#authentication-configuration">Authentication configuration</a> section
            </td>
        </tr>
        <tr>
            <td>mongodb.admin_user_secret_name</td>
            <td>mongodb-admin-user</td>
            <td>Secret to store MongoDB admin user and password, If <code>auth_mode: auto</code> is configured, OpenCRVS will connect to MongoDB server and create all required for OpenCRVS databases and users.</td>
        </tr>
        <tr>
            <td>mongodb.urls_secret</td>
            <td>mongodb-urls</td>
            <td>Secret to store MongoDB URLs with usernames and passwords. Secret is created by OpenCRVS installation automatically with <code>auth_mode: auto</code>  and needs to be created manually by Operator (DevOps) with <code>auth_mode: managed</code> or <code>use_secret</code>. For more information how to create secret manually please check <a href="#authentication-configuration">Authentication configuration</a> section.</td>
        </tr>
       <tr>
            <th>postgres.{}</th>
            <th></th>
            <th></th>
        </tr>
        <tr>
            <td>postgres.host</td>
            <td>postgres-0.postgres.opencrvs-deps-dev.svc.cluster.local</td>
            <td>MongoDB hostname.</td>
        </tr>
        <tr>
            <td>postgres.auth_mode</td>
            <td>disabled</td>
            <td>  Following values are allowed
                <li><code>disabled</code>: Default Postgres user and password is used for postgres admin account (postgres/password)</li>
                <li><code>auto</code>: (Recommended) Users are managed by OpenCRVS helm chart, this mode requires secret to be created with Postgres admin user credentials</li>
                <li><code>use_secret</code>: Kubernetes Secrets needs to be created manually, users are managed by Postgres administrator, but helm will pick up data from users_secret and urls_secret</li>
                <li><code>managed</code>: Kubernetes Secrets needs to be created manually and mapped manually for each service.</li>
                It is recommended to use <code>auth_mode: auto</code> or <code>use_secret</code> for server environment. For more information please check <a href="#authentication-configuration">Authentication configuration</a> section
            </td>
        </tr>
        <tr>
            <td>postgres.admin_user_secret_name</td>
            <td>postgres-admin-user</td>
            <td>Secret to store Postgres admin user and password, If <code>auth_mode: auto</code> is configured, OpenCRVS will connect to Postgres server and create all required for OpenCRVS databases and users.</td>
        </tr>
        <tr>
            <td>postgres.urls_secret</td>
            <td>postgres-urls</td>
            <td>Secret to store MongoDB URLs with usernames and passwords. Secret is created by OpenCRVS installation automatically with <code>auth_mode: &ltauto|disabled></code>  and needs to be created manually by Operator (DevOps) with <code>auth_mode: managed</code> or <code>use_secret</code>. For more information how to create secret manually please check <a href="#authentication-configuration">Authentication configuration</a> section.</td>
        </tr>
       <tr>
            <th>redis.{}</th>
            <th></th>
            <th></th>
        </tr>
        <tr>
            <td>redis.host</td>
            <td>redis-0.redis.opencrvs-deps-dev.svc.cluster.local</td>
            <td>Redis hostname configuration.</td>
        </tr>
        <tr>
            <td>redis.auth_mode</td>
            <td>disabled</td>
            <td>  Following values are allowed
                <li><code>disabled</code>: No authentication enabled for MongoDB, password-less access to databases</li>
                <li><code>use_secret</code>: Kubernetes Secrets needs to be created manually, users are managed by MongoDB administrator, but helm will pick up data from users_secret</li>
                <li><code>managed</code>: Kubernetes Secrets needs to be created manually and mapped manually for each service.</li>
                It is recommended to use <code>use_secret</code> for server environment. For more information please check <a href="#authentication-configuration">Authentication configuration</a> section
            </td>
        </tr>
        <tr>
            <td>redis.users_secret</td>
            <td>redis-opencrvs-users</td>
            <td>Secret name to store Redis credentials, more information about credentials secret is at <a href="#authentication-configuration">Authentication configuration</a></td>
        </tr>
       <tr>
            <th>Application configuration</th>
            <th></th>
            <th></th>
        </tr>
        <tr>
            <td>hostname</td>
            <td>opencrvs.org</td>
            <td>Hostname for OpenCRVS application, without wildcard or subdomain. Example: hostname: opencrvs.localhost</td>
        </tr>
        <tr>
            <td>subdomain_separator</td>
            <td><code>.</code></td>
            <td>Separator between <code>hostname</code> and subdomains. See values.yaml for more information.</td>
        </tr>
        <tr>
            <td>ingress.ssl_enabled</td>
            <td>true</td>
            <td>Enable or disable https endpoint, by default all http traffic is routed to https</td>
        </tr>
        <tr>
            <td>ingress.tls_resolver</td>
            <td>` `</td>
            <td>If traefik was deployed with custom resolver, please define resolver name here. Resolver will be attached to Traefik CRD IngressRoute, otherwise default Traefik SSL Certificate will be used.</td>
        </tr>
        <tr>
            <td>ingress.tls_secret_name</td>
            <td>` `</td>
            <td>Secret with custom SSL Certificate for IngressRoute, check traefik documentation for details. Otherwise default Traefik SSL Certificate will be used.</td>
        </tr>
        <tr>
            <td>service_type</td>
            <td>{}</td>
            <td>Kubernetes service type. See <a href="https://kubernetes.io/docs/concepts/services-networking/service/">kubernetes documentation</a> for more information on service types</td>
        </tr>
        <tr>
            <td>env</td>
            <td>{}</td>
            <td>Global environment variables, each variable defined here is available to all workloads (service) deployed by helm chart. See example at <a href="values.yaml">values.yaml</a></td>
        </tr>
        <tr>
            <td>timezone</td>
            <td></td>
            <td>Time zone for a backup and restore CronJobs, by default local time zone is used from server. See example at <a href="values.yaml">values.yaml</a></td>
        </tr>
        <tr>
            <td>probes</td>
            <td>See values.yaml</td>
            <td>Kubernetes http probes configuration, See defaults at <a href="values.yaml">values.yaml</a>. Each service may have own probes section. Make sure you are familiar with official documentation before changing this sections, see <a href="https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/">Configure Liveness, Readiness and Startup Probes</a>. <b>NOTE: Only httpGet probes are supported.</b></td>
        </tr>
        <tr>
        <td>platform.tag</td>
        <td>v1.9.11</td>
        <td>Defines the default image tag for all OpenCRVS services.</td>
        </tr>
        <tr>
        <td>platform.repository</td>
        <td>opencrvs</td>
        <td>Defines the repository used for OpenCRVS service images. Can be overridden at service level.</td>
        </tr>
        <tr>
        <td>platform.imagePullSecrets</td>
        <td>[]</td>
        <td>Defines the image pull secrets applied at Pod level for authenticating with private registries.</td>
        </tr>
        <tr>
            <th>Common Service properties</th>
            <th></th>
            <th>Properties listed below can be defined for any service</th>
        </tr>
        <tr>
            <td>env</td>
            <td>{}</td>
            <td>Service level environment variables, each variable defined here is available to particular workload (service) only. See example for `config` microservice at <a href="values.yaml">values.yaml</a></td>
        </tr>
        <tr>
            <td>secrets</td>
            <td>{}</td>
            <td>Mapping kubernetes secrets as environment variables. For more information see <a href="#mapping-secrets">Mapping secrets</a></td>
        </tr>
        <tr>
        <td>image.name</td>
        <td>-</td>
        <td>Name of the container image (for example <code>ocrvs-auth</code>). Combined with registry and repository to form the full image reference.</td>
        </tr>
        <tr>
        <td>image.tag</td>
        <td>platform.tag</td>
        <td>Overrides the default image tag defined in <code>platform.tag</code>.</td>
        </tr>
        <tr>
        <td>image.repository</td>
        <td>platform.repository</td>
        <td>Overrides the default repository defined in <code>platform.repository</code>.</td>
        </tr>
        <tr>
            <td>hpa.enabled</td>
            <td>true</td>
            <td>Enable Horizontal Pod Autoscaler (HPA) configuration. Configuration is available per service as well, add <code>&ltservice_name&gt.hpa.&ltkey&gt</code></td>
        </tr>
        <tr>
            <td>hpa.minReplicas</td>
            <td>1</td>
            <td>Minimal number of PODs per Kubernetes Deployment</td>
        </tr>
        <tr>
            <td>hpa.maxReplicas</td>
            <td>2</td>
            <td>Maximum number of PODs per ReplicaSet</td>
        </tr>
        <tr>
            <td>hpa.averageUtilization</td>
            <td>75</td>
            <td>Average CPU Utilization for autoscaler event (percentage)</td>
        </tr>
        <tr>
            <td>pdb.enabled</td>
            <td>true</td>
            <td>Enable Pod Disruption Budget (PDB) configuration. Configuration is available per service as well, add <code>&ltservice_name&gt.pdb.&ltkey&gt</code></td>
        </tr>
        <tr>
            <td>pdb.minAvailable</td>
            <td>50%</td>
            <td>Number of PODs not available while deployment within ReplicaSet</td>
        </tr>
        <tr>
            <td>resources</td>
            <td>{}</td>
            <td>Resources allocated to OpenCRVS microservices (Kubernetes PODs). Properties in this section could be defined per microservice as well.</td>
        </tr>
        <tr>
            <td>resources.memoryRequest</td>
            <td>{}</td>
            <td>Memory requests defined per POD</td>
        </tr>
        <tr>
            <td>resources.memoryLimit</td>
            <td>{}</td>
            <td>Memory limits defined per POD</td>
        </tr>
        <tr>
            <td>resources.cpuRequest</td>
            <td>{}</td>
            <td>CPU requests defined per POD</td>
        </tr>
        <tr>
            <td>resources.cpuLimit</td>
            <td>{}</td>
            <td>CPU limits defined per POD</td>
        </tr>
      <tr>
            <th>Non-common service properties</th>
            <th></th>
            <th>Properties listed below can be defined particularly to specific service</th>
        </tr>
        <tr>
            <td>login.nginx_conf_d_configmaps</td>
            <td>{}</td>
            <td>List of Configmap names to store custom configuration. Check <code>values.yaml</code> for more details.</td>
        </tr>
        <tr>
            <td>client.nginx_conf_d_configmaps</td>
            <td>{}</td>
            <td> login is an nginx docker image. see description for <code>login.nginx_conf_d_configmaps</code></td>
        </tr>
        <tr>
            <td>data_seed.enabled</td>
            <td>true</td>
            <td>Seed data as post-install step which is executed only once while `helm install`. **Note**: default username and password is used for data seeding. **If you need to seed data again, use one-time jobs instead.</td>
        </tr>
        <tr>
            <td>dashboards.use_default_credentials</td>
            <td>true</td>
            <td>Use default OpenCRVS password or generate random</td>
        </tr>
        <tr>
            <td>dashboards.admin_email</td>
            <td>user@opencrvs.org</td>
            <td>Use default OpenCRVS login/password or generate random values</td>
        </tr>
        <tr>
            <td>on_restore_cronjob.enabled</td>
            <td><pre>false</pre></td>
            <td>Special cronjob for OpenCRVS maintenance after database restore. Job runs reindex and postgres passwords update.</td>
        </tr>
        <tr>
            <td>on_restore_cronjob.schedule</td>
            <td><pre>0 3 * * *</pre></td>
            <td>Schedule time for cronjob. Make sure schedule doesn't overlap with database restore job.</td>
        </tr>
    </tbody>
</table>

# Authentication configuration

## General information

OpenCRVS has more then 10 microservices that require authentication to multiple datastores (MongoDB, Elasticsearch, Redis and MinIO. As way to simplify configuration credentials were grouped into Kubernetes secrets per datastore. Secret specification is listed in this section. Also you have several ways to manage authentication (`auth_mode`):

- No authentication enabled (`disabled`), password-less access to datastores. MinIO will use default credentials (minioadmin/minioadmin). All other services will work without authentication.
- Auto (`auto`) mode allows OpenCRVS chart to create users for MongoDB and Elasticsearch at installation time, but you need to provide admin credentials for those services. Mode is not supported by MinIO and Redis.
- In case when users are created by datastore administrator (`use_secret`) and DevOps gets those credentials, kubernetes secrets needs to be created manually as well. Check how to create secret in the section below.
- DevOps may decide to manage secrets by own way and map to environment variables manually (`managed`). Check [Mapping secrets](#mapping-secrets) section for details. **NOTE**: This way is not recommended since we can't avoid human error and mapping secrets manually requires deep knowledge of OpenCRVS internals.

Table contains list of required secrets for each `auth_mode` grouped by datastore:

| Datastore     | auth_mode: auto        | default secret name      | auth_mode: use_secret | default secret name         |
| ------------- | ---------------------- | ------------------------ | --------------------- | --------------------------- |
| MongoDB       | admin_user_secret_name | mongodb-admin-user       | urls_secret           | mongodb-urls                |
| Postgres      | admin_user_secret_name | postgres-admin-user      | urls_secret           | postgres-urls               |
| Elasticsearch | admin_user_secret_name | elasticsearch-admin-user | urls_secret           | elasticsearch-opencrvs-urls |
| MinIO         | not supported          |                          | users_secret          | minio-opencrvs-users        |
| Redis         | not supported          |                          | users_secret          | redis-opencrvs-users        |

## Secrets specification

### MongoDB secrets

#### mongodb.admin_user_secret_name

Default secret name: mongodb-admin-user

**auth_mode:** auto

**Keys:**

- MONGODB_ADMIN_USER
- MONGODB_ADMIN_PASSWORD

#### mongodb.urls_secret

**Default secret name:** mongodb-urls

**auth_mode:** use_secret

**Keys:**

- EVENTS_MONGO_URL
- OPENHIM_MONGO_URL
- PERFORMANCE_MONGO_URL
- USER_MGNT_MONGO_URL

**Description:** Each key in this secrets represents connection string to MongoDB database as URL, user and database must exist. OpenCRVS will pickup correct credentials by key values and assign to appropriate microservice containers.

Value format:

```
mongodb://<username>:<password>@<mongodb-hostname>:27017/<db-name>
```

Example value:

```
mongodb://user-mgnt:password@mongodb-0.mongodb.opencrvs-deps-dev.svc.cluster.local:27017/user-mgnt
```

### Postgres secrets

#### postgres.admin_user_secret_name

Default secret name: postgres-admin-user

**auth_mode:** auto

**Keys:**

- POSTGRES_USER
- POSTGRES_PASSWORD

#### postgres.urls_secret

**Default secret name:** postgres-urls

**auth_mode:** use_secret

**Keys:**

- events_app_db_url, user should have sufficient credentials for `SELECT`, `INSERT`, `UPDATE` operations within `events` database
- events_migrator_db_url, user should have sufficient credentials for `CRUD` operations within `events` database

**Description:** Each key in this secrets represents connection string to Postgres database as URL, user and database must exist. OpenCRVS will pickup correct credentials by key values and assign to appropriate microservice containers.

Value format:

```
postgres://<username>:<password>@<postgres-hostname>:5432/<db-name>
```

Example value:

```
postgres://user-mgnt:password@postgres-0.postgres.opencrvs-deps-dev.svc.cluster.local:5432/events
```

### Elasticsearch secrets

#### elasticsearch.admin_user_secret_name

**Default secret name:** elasticsearch-admin-user

**auth_mode:** auto

**Keys:**

- ELASTIC_PASSWORD

**Description:** Elasticsearch admin user password

#### elasticsearch.urls_secret

**Default secret name:** elasticsearch-opencrvs-urls

**auth_mode:** use_secret

**Keys:**

- APM_ELASTIC_HOST
- APM_ELASTIC_URL
- KIBANA_SYSTEM_ELASTIC_HOST
- KIBANA_SYSTEM_ELASTIC_URL
- KIBANA_USER_ELASTIC_HOST
- KIBANA_USER_ELASTIC_URL
- METRICBEAT_ELASTIC_HOST
- METRICBEAT_ELASTIC_URL
- SEARCH_ELASTIC_HOST
- SEARCH_ELASTIC_URL

**Description:** Elasticsearch credentials for OpenCRVS services and monitoring. Each key in this secrets represents connection string to Elasticsearch server.
Users must be created by Elasticsearch server administrator. OpenCRVS will pickup correct credentials by key values and assign to appropriate microservice containers.

`*_ELASTIC_HOST` Value format:

```
<username>:<password>@<elasticsearch-hostname>:<port>
```

`*_ELASTIC_URL` Value format:

```
<http-schema>://<username>:<password>@<elasticsearch-hostname>:<port>
```

`SEARCH_ELASTIC_HOST` value example:

```
search:search@elasticsearch.opencrvs-deps-dev.svc.cluster.local:9200
```

`SEARCH_ELASTIC_URL` value example:

```
http://search:search@elasticsearch.opencrvs-deps-dev.svc.cluster.local:9200pigeon@godlike-laptop:~$
```

### Minio Secret (minio.users_secret)

**Default secret name:** minio-opencrvs-users

**auth_mode:** use_secret

**Keys:**

- MINIO_ROOT_PASSWORD
- MINIO_ROOT_USER
- MINIO_ACCESS_KEY
- MINIO_SECRET_KEY

**Description:** MinIO credentials for OpenCRVS services. OpenCRVS requires credentials for administrator and for regular bucket user.
Users must be created by MinIO server administrator. OpenCRVS will pickup correct credentials by key values and assign to appropriate microservice containers.

### Redis Secret (redis.users_secret)

**Default secret name:** redis-opencrvs-users

**auth_mode:** use_secret

**Keys:**

- AUTH_REDIS_PASSWORD
- AUTH_REDIS_USERNAME
- DEFAULT_REDIS_PASSWORD
- GATEWAY_REDIS_PASSWORD
- GATEWAY_REDIS_USERNAME

**Description:** Redis credentials for OpenCRVS services.
Users must be created by Redis server administrator. OpenCRVS will pickup correct credentials by key values and assign to appropriate microservice containers.

## Manual secrets mapping

OpenCRVS helm chart has support for manually mapping secrets as environment variables. E/g System Administrator or DevOps could decide to store credentials for each service at it's own secret or third-party tools like [Hashicorp Vault](https://developer.hashicorp.com/vault) are used and default secrets will not be easiest solution for OpenCRVS implementation.

OpenCRVS doesn't provide full documentation how to map secrets for each particular service.

Please check [examples](../../examples) directory for more information.

# Mapping secrets

Secrets in conjunction with third-party secret managers are often used to store environment variables in a more secure way.

OpenCRVS Helm chart allows manually map managed secrets as environment variables. Mapping is not supported at global scope, `secrets` section needs to be added for every particular service.

**Mapping syntax**

```
secrets:
  <secret_name>:
     - <secret_key>:<environment_variable>
```

Summary:

- `secret_name`, name of Kubernetes secret object
- `secret_key`, key (variable name) inside Kubernetes secret data property
- `environment_variable`, environment variable name inside container. If `secret_key` value `environment_variable` are the same, last one can be omitted.

**Example:** As DevOps Engineer I would like to store elastic search credentials (`ES_HOST`) as kubernetes secret. Later I would like to access those credentials by search workload (container).

1. Create file `search.env` and put all environment variables line by line. Separate variable name from value by `=` sign:
   ```
   ES_HOST=user:randompass@elasticsearch:9200
   ```
2. Create kubernetes secret from `search.env` file:
   ```
   kubectl create secret generic elasticsearch-secret --from-env-file=search.env
   ```
3. Make sure the secret was created:
   ```
   kubectl get secret -oyaml elasticsearch-secret
   ```
   Example output:
   ```yaml
   apiVersion: v1
   data:
     ES_HOST: dXNlcjpyYW5kb21wYXNzQGVsYXN0aWNzZWFyY2g6OTIwMA==
   ...
   ```
4. Map variable in your helm chart `values.yaml` file:
   ```yaml
   search:
     secrets:
       elasticsearch-secret:
         - ES_HOST
   ...
   ```
5. Redeploy service with `helm upgrade`

# Data maintenance jobs

> NOTE: Databases backup and restore configuration is described at [Dependencies backup](../dependencies/README.md#backup-configuration) and [Dependencies restore](../dependencies/README.md#restore-configuration)

## Migration

> TODO: Add information about data migration job, or reference to documentation page

Data migration is executed as post-deployment hook by Helm, however sometimes it's needed to execute data migration manually.

Helm allows to render and run particular data migration template by running following command:

```
helm template -f <path to environment values file> \
    -s templates/data-migration-job.yaml \
    oci://ghcr.io/opencrvs/opencrvs-services | kubectl apply -f -
```

As a result of execution migration job will be created.

Use kubectl to check logs:

```
kubectl logs job/data-migration -f
```

## Seed environment data

Data seed is part of helm post-install hook by Helm, but needs to be manually enabled before first deployment by setting flag at environment values file:

```yaml
data_seed:
  enabled: true
```

Helm allows to render and run particular data seed template by running following command:

```
helm template -f <path to environment values file> \
    --set data_seed.enabled=true \
    -s templates/data-seed-job.yaml \
    oci://ghcr.io/opencrvs/opencrvs-services | kubectl apply -f -
```

As a result of execution data seed job will be created.

Use kubectl to check logs:

```
kubectl logs job/data-seed -f
```

## Cleanup environment

Environment cleanup is distractive operation and should not be started on production. Data cleanup job is a part of OpenCRVS helm chart, but is not included into helm install/upgrade pre/post deployment hooks.

Helm allows to render and run particular data cleanup template by running following command:

```
helm template -f <path to environment values file> \
    --set data_cleanup.enabled=true \
    -s templates/data-cleanup-job.yaml \
    oci://ghcr.io/opencrvs/opencrvs-services | kubectl apply -f -
```

As a result of execution data cleanup job will be created.

Use kubectl to check logs:

```
kubectl logs job/data-cleanup -f --all-containers=true
```

# Contributors guide

## Adding MongoDB users and databases

When deploying OpenCRVS with MongoDB authentication enabled (`auth_mode: auto`), you can specify custom databases and users to be created. This is done in the `values.yaml` file under the `mongodb.databases` section.
Following table shows list of available parameters:

| Parameter          | Type   | Default         | Description                                                                                                                                                                                                                                                                              |
| ------------------ | ------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| databases          | list   | See values.yaml | List of databases and users to create when authentication is enabled (`auth_mode: auto`). Each item supports the following fields:                                                                                                                                                       |
| databases[].prefix | string | -//-            | Prefix used to generate environment variable names for the database, user, password, and roles.                                                                                                                                                                                          |
| databases[].db     | string | -//-            | Name of the MongoDB database to create.                                                                                                                                                                                                                                                  |
| databases[].user   | string | -//-            | Name of the MongoDB user to create and assign to the database.                                                                                                                                                                                                                           |
| databases[].roles  | string | -//-            | (Optional) JSON string specifying roles to assign to the user. If not provided, the user is granted the `readWrite` role on the specified database by default. When specifying custom roles, ensure to include `readWrite` or `read` for the database defined at `databases[].db` field. |

**Example:**

```yaml
databases:
  - prefix: APP
    db: app-db
    user: app-user
  - prefix: REPORTS
    db: reports
    user: reports-user
    roles: "[{ role: 'readWrite', db: 'reports' }, { role: 'read', db: 'app-db' }]"
```

In this example:

- The first entry creates a database named `app-db` with a user `app-user` and grants the default `readWrite` role on `app-db`.
- The second entry creates a database named `reports` with a user `reports-user` and assigns custom roles: `readWrite` on `reports` and `read` on `app-db`. Note, roles field must explicitly define access level for both databases.
- The `prefix` field is used to generate environment variable names for each database and user, making it easier to reference credentials in your application configuration.

The generated credentials can be accessed from the `mongo-opencrvs-users` secret.
List of Variables Generated at helm installation time:

- `<PREFIX>_DB`: Database name
- `<PREFIX>_MONGODB_USER`: Username
- `<PREFIX>_MONGODB_PASSWORD`: Randomly generated password
- `<PREFIX>_MONGODB_ROLES`: Roles in JSON format

Additionally secret `mongodb-urls` with all MongoDB URLs is created. Secret keys are in format
`<PREFIX>_MONGO_URL` and can be used for OpenCRVS authentication.

Notes:

- The 'roles' field must be a valid JSON string.

# Adding Elasticsearch users

When deploying OpenCRVS with Elasticsearch authentication enabled (`auth_mode: auto`), you can specify custom databases and users to be created. This is done in the `values.yaml` file under the `mongodb.databases` section.
Following table shows list of available parameters:

| Parameter  | Type | Default            | Description                                                       |
| ---------- | ---- | ------------------ | ----------------------------------------------------------------- |
| auth_users | list | See examples below | List of users to create and grant authorization to Elasticsearch. |

#### auth_users Format

Each entry in `auth_users` can be either:

- A placeholder (e.g., `SEARCH`)
- A placeholder and username pair separated by a colon (e.g., `KIBANA_SYSTEM:kibana_system`)

Placeholders are converted to environment variables:

- `<PLACEHOLDER>_ELASTIC_USERNAME`
- `<PLACEHOLDER>_ELASTIC_PASSWORD`

If `<USERNAME>` is not provided, a random username is generated. Passwords are always generated randomly as well.
Credentials are stored in the secret named `elasticsearch-opencrvs-users`.

**Configuration example:**

```yaml
elasticsearch:
  enabled: true
  use_default_credentials: true
  auth_users:
    - SEARCH
    - KIBANA_USER
    - KIBANA_SYSTEM:kibana_system
    - METRICBEAT:beats_system
    - APM:apm_system
```

In this example:

- `SEARCH` and `KIBANA_USER` will have random usernames and passwords generated.
- `KIBANA_SYSTEM`, `METRICBEAT`, and `APM` will use the specified usernames (`kibana_system`, `beats_system`, `apm_system`) with random passwords.

The generated credentials can be accessed from the `elasticsearch-opencrvs-users` secret.

# Additional information

## Helm chart hooks

Helm chart has following pre-install/upgrade hooks:

- elasticsearch-on-deploy: create elasticsearch users and configure permissions, see `elasticsearch` configuration options for more details how to configure users and permissions
- influxdb-on-deploy: create database
- mongo-on-deploy: create databases and users with correct permissions, see `mongodb` configuration options for more details how to configure users and permissions
- postgres-on-deploy: create database, schemas and users with correct permissions

Helm chart has following post-install/upgrade hooks:

- data-migration: apply data migrations to postgres, mongodb, influxdb
- data-migration-analytics: apply data migrations to postgres, this hook use Countryconfig assets docker image, see documentation on how to create own analytics dashboards.
- data-seed: initial data seed, runs only on post-install
- elasticsearch-reindex: reindex data after deployment
