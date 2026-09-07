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

OpenCRVS requires supporting services (Postgres, MinIO, Elasticsearch, Redis):

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
            <td>elasticsearch.reindex.enabled</td>
            <td>true</td>
            <td>Enable elasticsearch reindex post-deploy hook</td>
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
                <li><code>disabled</code>: No authentication enabled, password-less access to databases</li>
                <li><code>auto</code>: (Recommended) Users are managed by OpenCRVS helm chart, this mode requires secret to be created with Elasticsearch admin user</li>
                <li><code>use_secret</code>: Kubernetes Secrets needs to be created manually, users are managed by the datastore administrator, but helm will pick up data from users_secret and urls_secret</li>
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
                <li><code>disabled</code>: No authentication enabled, password-less access to databases</li>
                <li><code>use_secret</code>: Kubernetes Secrets needs to be created manually, users are managed by the datastore administrator, but helm will pick up data from users_secret</li>
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
            <th>postgres.{}</th>
            <th></th>
            <th></th>
        </tr>
        <tr>
            <td>postgres.host</td>
            <td>postgres-0.postgres.opencrvs-deps-dev.svc.cluster.local</td>
            <td>Postgres hostname.</td>
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
            <td>Secret to store Postgres URLs with usernames and passwords. Secret is created by OpenCRVS installation automatically with <code>auth_mode: &ltauto|disabled></code>  and needs to be created manually by Operator (DevOps) with <code>auth_mode: managed</code> or <code>use_secret</code>. For more information how to create secret manually please check <a href="#authentication-configuration">Authentication configuration</a> section.</td>
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
                <li><code>disabled</code>: No authentication enabled, password-less access to databases</li>
                <li><code>use_secret</code>: Kubernetes Secrets needs to be created manually, users are managed by the datastore administrator, but helm will pick up data from users_secret</li>
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
            <td>otel.enabled</td>
            <td>false</td>
            <td>Enable OpenTelemetry tracing environment variables for instrumented services.</td>
        </tr>
        <tr>
            <td>otel.deployment_environment</td>
            <td>production</td>
            <td>Value used for <code>OTEL_DEPLOYMENT_ENVIRONMENT</code> and <code>deployment.environment.name</code> in <code>OTEL_RESOURCE_ATTRIBUTES</code>.</td>
        </tr>
        <tr>
            <td>otel.exporter_otlp_endpoint</td>
            <td></td>
            <td>OTLP/gRPC collector endpoint, for example <code>opentelemetry-collector.opencrvs-deps-production.svc.cluster.local:4317</code>. Required when <code>otel.enabled</code> is <code>true</code>. Node.js receives this as an insecure gRPC URL with <code>http://</code> added automatically; nginx receives the host and port without a scheme.</td>
        </tr>
        <tr>
            <td>otel.exporter_otlp_protocol</td>
            <td>grpc</td>
            <td>OTLP exporter protocol.</td>
        </tr>
        <tr>
            <td>OTEL_RESOURCE_ATTRIBUTES</td>
            <td></td>
            <td>Generated automatically when <code>otel.enabled</code> is <code>true</code>. It includes <code>service.version</code> from <code>platform.tag</code>, <code>deployment.environment.name</code> from <code>otel.deployment_environment</code>, and <code>service.namespace</code> from the Helm release namespace.</td>
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
        <td>v2.1.0</td>
        <td>Defines the default image tag for all OpenCRVS services.</td>
        </tr>
        <tr>
        <td>platform.repository</td>
        <td>ghcr.io/opencrvs</td>
        <td>Defines the repository used for OpenCRVS service images. Can be overridden at service level.</td>
        </tr>
        <tr>
        <td>platform.imagePullSecrets</td>
        <td>[]</td>
        <td>Defines the image pull secrets applied at Pod level for authenticating with private registries.</td>
        </tr>
        <tr>
        <td>platform.imagePullPolicy</td>
        <td>-</td>
        <td>Default <code>imagePullPolicy</code> applied to all OpenCRVS service containers. Leave unset to use Kubernetes' own tag-based default (<code>IfNotPresent</code> for versioned tags, <code>Always</code> for <code>:latest</code>). Environments deploying a floating tag (e.g. <code>develop</code>) should set this to <code>Always</code>, otherwise nodes keep serving whatever image was first cached under that tag. Can be overridden at service level.</td>
        </tr>
        <tr>
            <th>NetworkPolicy configuration</th>
            <th></th>
            <th>Optional Kubernetes NetworkPolicy resources for OpenCRVS workloads.</th>
        </tr>
        <tr>
            <td>network_policy.enabled</td>
            <td>true</td>
            <td>Render NetworkPolicy resources. Requires a CNI provider that enforces NetworkPolicy — set to false on clusters without one.</td>
        </tr>
        <tr>
            <td>network_policy.ingress_mode</td>
            <td>deny</td>
            <td>Baseline policy for ingress to OpenCRVS pods: <code>deny</code> (default, requires another NetworkPolicy to allow it), <code>private</code> (allow only RFC1918 private ranges), or <code>full</code> (unrestricted).</td>
        </tr>
        <tr>
            <td>network_policy.egress_mode</td>
            <td>private</td>
            <td>Baseline policy for egress from OpenCRVS pods. Same modes as <code>ingress_mode</code>, applied to egress instead (DNS on TCP/UDP 53 stays allowed except in <code>full</code> mode). Defaults to <code>private</code> rather than <code>deny</code> so pods can reach the dependencies chart and other in-VPC services without every deployment having to enumerate <code>allowed_namespaces</code> up front; services needing real internet (e.g. <code>countryconfig</code>) opt out individually via their own <code>network_policy.egress_mode: full</code> — see "Hardening" in this README.</td>
        </tr>
        <tr>
            <td>network_policy.allow_same_namespace</td>
            <td>true</td>
            <td>Allow OpenCRVS pods in the release namespace to communicate with each other.</td>
        </tr>
        <tr>
            <td>network_policy.allowed_namespaces</td>
            <td>[]</td>
            <td>List of namespaces OpenCRVS pods are allowed to reach. Only takes effect when <code>egress_mode</code> is not <code>full</code>. Grants egress on any port to every pod in each listed namespace (e.g. the dependencies chart's namespace) — see "Hardening" in this README.</td>
        </tr>
        <tr>
            <td>&lt;service&gt;.network_policy.rules</td>
            <td>[]</td>
            <td>Chart-provided service-specific NetworkPolicy rules. Rules use Kubernetes NetworkPolicy spec syntax, except <code>podSelector</code> is generated from <code>app_label</code>.</td>
        </tr>
        <tr>
            <td>&lt;service&gt;.network_policy.custom_rules</td>
            <td>[]</td>
            <td>Operator-provided service-specific NetworkPolicy rules appended to chart-provided rules.</td>
        </tr>
        <tr>
            <td>&lt;service&gt;.network_policy.ingress_mode / egress_mode</td>
            <td>deny</td>
            <td>Same <code>deny</code>/<code>private</code>/<code>full</code> modes as the global flags, applied per service instead of writing an ingress/egress rule under <code>rules</code>/<code>custom_rules</code>. For ingress, <code>private</code>/<code>full</code> accept from RFC1918 ranges/any source respectively, scoped to the service's own <code>port</code>; renders nothing if <code>port</code> is not set, rather than silently opening every port. For egress, <code>private</code>/<code>full</code> accept to RFC1918 ranges/any destination on any port, since a service's own port doesn't describe what it calls out to. Independent of the global <code>network_policy.ingress_mode</code>/<code>egress_mode</code>, which control whether the chart-wide baseline policies are rendered at all — <code>countryconfig</code> uses <code>egress_mode: full</code> to keep public-internet egress for its SMTP/SMS integrations regardless of the global mode.</td>
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
        <td>Name of the container image without repository and tag. For example, if the full image is <code>ghcr.io/opencrvs/ocrvs-auth:v2.1.0</code>, then <code>image.name</code> is <code>ocrvs-auth</code>.</td>
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
        <td>image.pullPolicy</td>
        <td>platform.imagePullPolicy</td>
        <td>Overrides the default <code>imagePullPolicy</code> defined in <code>platform.imagePullPolicy</code> for this service only.</td>
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
            <td>service_account.create</td>
            <td>true</td>
            <td>Create Kubernetes ServiceAccount resources for OpenCRVS workloads. Each workload gets its own ServiceAccount. Configuration is available per workload as well, add <code>&ltservice_name&gt.service_account.&ltkey&gt</code>. For more information see <a href="#service-accounts">Service accounts</a>.</td>
        </tr>
        <tr>
            <td>service_account.annotations</td>
            <td>{}</td>
            <td>Annotations applied to all workload ServiceAccounts. Per-workload annotations override global annotations with the same key.</td>
        </tr>
        <tr>
            <td>service_account.automount_service_account_token</td>
            <td>true</td>
            <td>Controls <code>automountServiceAccountToken</code> on generated ServiceAccounts and workload Pod specs. Can be overridden per workload.</td>
        </tr>
        <tr>
            <td>strategy.type</td>
            <td>Recreate</td>
            <td>Deployment rollout strategy. <code>Recreate</code> terminates all existing PODs before creating replacement ones, guaranteeing old PODs are gone before new ones start (at the cost of a brief outage). <code>RollingUpdate</code> swaps PODs gradually instead. Configuration is available per service as well, add <code>&ltservice_name&gt.strategy.&ltkey&gt</code></td>
        </tr>
        <tr>
            <td>strategy.maxSurge</td>
            <td>{}</td>
            <td>Only used when <code>strategy.type</code> is <code>RollingUpdate</code>. Maximum number/percentage of PODs that can be created above the desired replica count during the rollout.</td>
        </tr>
        <tr>
            <td>strategy.maxUnavailable</td>
            <td>{}</td>
            <td>Only used when <code>strategy.type</code> is <code>RollingUpdate</code>. Maximum number/percentage of PODs that can be unavailable during the rollout.</td>
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
            <td>deployment_jobs.service_account.name</td>
            <td>deployment-jobs</td>
            <td>Common ServiceAccount name used by Helm pre/post deployment jobs.</td>
        </tr>
        <tr>
            <td>deployment_jobs.service_account.annotations</td>
            <td>{}</td>
            <td>Annotations applied to the common ServiceAccount used by Helm pre/post deployment jobs.</td>
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

# Service accounts

OpenCRVS Helm chart creates a Kubernetes ServiceAccount for each regular workload and injects the matching `serviceAccountName` into the workload Pod spec.

By default, ServiceAccount names match workload names:

- `auth`
- `client`
- `countryconfig`
- `dashboards`, when `dashboards.enabled` is `true`
- `documents`
- `events`
- `gateway`
- `login`
- `data-cleanup`, when `data_cleanup.enabled` is `true`
- `on-db-restore-cronjob`, when `on_restore_cronjob.enabled` is `true`

Helm pre/post deployment jobs use one shared ServiceAccount named `deployment-jobs` by default. This includes validation, datastore setup, data migration, data seed, and Elasticsearch reindex jobs.

**Example: global annotations**

```yaml
service_account:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/opencrvs-default
```

**Example: workload-specific annotations**

```yaml
auth:
  service_account:
    annotations:
      eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/opencrvs-auth
```

**Example: deployment job annotations**

```yaml
deployment_jobs:
  service_account:
    annotations:
      eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/opencrvs-deployment-jobs
```

If ServiceAccounts are managed outside of this chart, set `service_account.create` to `false` and provide matching existing ServiceAccounts in the namespace. A custom name can be set per workload:

```yaml
service_account:
  create: false

auth:
  service_account:
    name: existing-auth-service-account
```

# Network Policies

NetworkPolicy resources require a CNI provider that enforces Kubernetes
NetworkPolicy — set `network_policy.enabled=false` on clusters without one.

When `network_policy.enabled=true`, the chart can render (resource names are
prefixed with the Helm release name, e.g. `<release>-default-deny`, so
multiple releases in the same namespace don't collide):

- `<release>-default-deny`, which denies ingress and/or egress for OpenCRVS workloads, per `ingress_mode`/`egress_mode`.
- `<release>-allow-private-ingress`/`<release>-allow-private-egress`, when `ingress_mode`/`egress_mode` is `private`, allowing traffic to/from RFC1918 private ranges only.
- `<release>-allow-same-namespace`, which allows OpenCRVS pods in the same namespace to communicate with each other.
- `<release>-allow-egress-namespaces`, when `network_policy.allowed_namespaces` is set and `egress_mode` is not `full`, which allows egress on any port to every pod in each listed namespace.
- `<release>-allow-dns`, which allows egress to any DNS server on TCP and UDP port 53, unless `egress_mode` is `full`.
- Service-specific policies from `<service>.network_policy.rules` and `<service>.network_policy.custom_rules`.
- An ingress and/or egress policy for a service, when `<service>.network_policy.ingress_mode`/`egress_mode` is set to `private` or `full`.

`network_policy.ingress_mode`/`egress_mode` each take one of three values:

- `deny` — nothing is allowed beyond same-namespace/`allowed_namespaces`/per-service rules. Default for `ingress_mode`.
- `private` — additionally allow traffic to/from RFC1918 private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), blocking the public internet either way. Default for `egress_mode`.
- `full` — no baseline policy at all; unrestricted.

Rules under `custom_rules` are appended to chart-provided `rules`, so operators can
add site-specific ingress or egress without replacing service defaults.

`<service>.network_policy.ingress_mode`/`egress_mode` are a shortcut for opting
one service into `private` or `full` access, without writing an ingress/egress
rule under `rules`/`custom_rules`. For ingress, `private`/`full` accept traffic
from RFC1918 ranges/any source respectively, scoped to the service's own `port`
value; it renders nothing if `port` is not set, rather than silently opening
every port. For egress, `private`/`full` accept traffic to RFC1918 ranges/any
destination on any port, since a service's own port doesn't describe what it
calls out to. Both are independent of the global `network_policy.ingress_mode`/
`egress_mode`, which control whether the chart-wide baseline policies are
rendered at all.

`client`, `gateway` and `login` are the OpenCRVS entry points reached directly by
end users and external clients, so their `allow-ingress` rule intentionally accepts
traffic from any namespace or client on their service port, rather than being
scoped to a specific source namespace. `countryconfig` and `dashboards` remain
scoped to ingress from the `traefik` namespace only.

## Hardening

`ingress_mode` defaults to `deny` and `egress_mode` defaults to `private` —
OpenCRVS pods can reach RFC1918 private destinations (the dependencies chart,
other in-VPC services) but not the public internet, without every deployment
having to enumerate `allowed_namespaces` up front. `countryconfig` is the one
service that genuinely needs public internet by default (SMTP and SMS gateway
integrations point at arbitrary external hosts configured via env vars/secrets,
not fixed IPs a private-range rule could cover), so it carries its own
`network_policy.egress_mode: full` regardless of the global `egress_mode`.

For a fully locked-down deployment, set `egress_mode: deny` and list every
namespace OpenCRVS pods actually need in `allowed_namespaces` — otherwise auth,
gateway, events, etc. lose access to Postgres, Elasticsearch, MinIO and Redis
the moment the private-range baseline goes away too.

The dependencies chart and this chart are typically deployed to separate namespaces
(see the default `*.host` values in `values.yaml`, e.g.
`redis-0.redis.opencrvs-deps-dev.svc.cluster.local`), so at minimum that namespace
must be listed. `allowed_namespaces` is the egress-side counterpart to
`network_policy.allowed_namespaces` in the dependencies chart, which must separately
list this chart's namespace to grant the matching ingress — both sides need setting
for traffic to actually flow.

```yaml
network_policy:
  egress_mode: deny
  allowed_namespaces:
    - opencrvs-deps-production
    - traefik
```

`allowed_namespaces` grants egress on **any port** to every pod in each listed
namespace — it's a namespace-level trust boundary, not a per-service/per-port
allowlist. If you need tighter control over what a specific service can reach,
add a scoped `custom_rules` entry for that service instead (see the `rules` example
above) and leave `allowed_namespaces` empty. The same applies to `countryconfig`:
if its blanket `egress_mode: full` is broader than you'd like, replace it with a
`custom_rules` entry scoped to your specific SMTP/SMS provider IPs instead.

### Service connections

Applies once `network_policy.enabled: true`. Every OpenCRVS pod always accepts traffic from its own namespace (`allow_same_namespace`). With the default `egress_mode: private`, egress is also allowed to DNS (53) and any RFC1918 private range; `countryconfig` additionally has unrestricted egress. The table below shows what each service allows **beyond** that baseline, per its current `values.yaml` configuration:

| Service                                                                                                                                                           | Port             | Extra ingress                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------- |
| client, gateway, login                                                                                                                                            | 3000, 7070, 3020 | any source (`rules: allow-ingress`) — public entry points |
| countryconfig                                                                                                                                                     | 3040             | `traefik` namespace only (`rules: from-traefik`)          |
| dashboards (disabled by default)                                                                                                                                  | 4444             | `traefik` namespace only (`rules: from-traefik`)          |
| auth, config, documents, events, migration, data-migration-analytics, data-cleanup, data-seed, elasticsearch-on-deploy, elasticsearch-reindex, postgres-on-deploy | —                | —                                                         |

Only `countryconfig` defines an extra egress rule (`network_policy.egress_mode: full` — unrestricted, for its SMTP/SMS integrations); every other service relies solely on the shared `egress_mode`/`allowed_namespaces` baseline above to reach the dependencies chart.

# Authentication configuration

## General information

OpenCRVS has more then 10 microservices that require authentication to multiple datastores (Elasticsearch, Redis and MinIO. As way to simplify configuration credentials were grouped into Kubernetes secrets per datastore. Secret specification is listed in this section. Also you have several ways to manage authentication (`auth_mode`):

- No authentication enabled (`disabled`), password-less access to datastores. MinIO will use default credentials (minioadmin/minioadmin). All other services will work without authentication.
- Auto (`auto`) mode allows OpenCRVS chart to create users for Elasticsearch at installation time, but you need to provide admin credentials for that service. Mode is not supported by MinIO and Redis.
- In case when users are created by datastore administrator (`use_secret`) and DevOps gets those credentials, kubernetes secrets needs to be created manually as well. Check how to create secret in the section below.
- DevOps may decide to manage secrets by own way and map to environment variables manually (`managed`). Check [Mapping secrets](#mapping-secrets) section for details. **NOTE**: This way is not recommended since we can't avoid human error and mapping secrets manually requires deep knowledge of OpenCRVS internals.

Table contains list of required secrets for each `auth_mode` grouped by datastore:

| Datastore     | auth_mode: auto        | default secret name      | auth_mode: use_secret | default secret name         |
| ------------- | ---------------------- | ------------------------ | --------------------- | --------------------------- |
| Postgres      | admin_user_secret_name | postgres-admin-user      | urls_secret           | postgres-urls               |
| Elasticsearch | admin_user_secret_name | elasticsearch-admin-user | urls_secret           | elasticsearch-opencrvs-urls |
| MinIO         | not supported          |                          | users_secret          | minio-opencrvs-users        |
| Redis         | not supported          |                          | users_secret          | redis-opencrvs-users        |

## Secrets specification

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
http://search:search@elasticsearch.opencrvs-deps-dev.svc.cluster.local:9200
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
   ```
4. Map variable in your helm chart `values.yaml` file:
   ```yaml
   search:
     secrets:
       elasticsearch-secret:
         - ES_HOST
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

# Adding Elasticsearch users

When deploying OpenCRVS with Elasticsearch authentication enabled (`auth_mode: auto`), you can specify custom databases and users to be created. This is done in the `values.yaml` file under the `elasticsearch` section.
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
- postgres-on-deploy: create database, schemas and users with correct permissions

Helm chart has following post-install/upgrade hooks:

- data-migration: apply data migrations to postgres
- data-migration-analytics: apply data migrations to postgres, this hook use Countryconfig assets docker image, see documentation on how to create own analytics dashboards.
- data-seed: initial data seed, runs only on post-install
- elasticsearch-reindex: reindex data after deployment
